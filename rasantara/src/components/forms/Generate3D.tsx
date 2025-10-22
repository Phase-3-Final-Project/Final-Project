"use client";

import { useState } from "react";
import { fileToDataUrlResized, dataUrlToBlob } from "@/helpers/imageUtils";
import { isValid3DModelUrl } from "@/helpers/validate3DModel";

interface Generate3DProps {
  photoFile: File | null;
  photoUrl: string;
  onModelUrlChange: (url: string | null) => void;
}

export default function Generate3D({
  photoFile,
  photoUrl,
  onModelUrlChange,
}: Generate3DProps) {
  const [meshLoading, setMeshLoading] = useState(false);
  const [meshLogs, setMeshLogs] = useState<string[]>([]);

  const handleGenerate3D = async () => {
    // Use first image (local or url) for 3D generation
    let image: string | null = null;
    if (photoFile) {
      // Use a slightly smaller dimension for Meshy to avoid large payloads
      image = await fileToDataUrlResized(photoFile, 800, 0.85);
    } else if (photoUrl.trim()) {
      image = photoUrl.trim();
    }
    if (!image) return;
    
    setMeshLoading(true);
    setMeshLogs([]);
    onModelUrlChange(null);
    
    try {
      const findModelUrlDeep = (obj: any): string | null => {
        if (!obj) return null;
        const seen = new Set<any>();
        const stack: any[] = [obj];
        const isUrl = (s: any) =>
          typeof s === "string" && /^(https?:)?\/\//i.test(s);
        while (stack.length) {
          const cur = stack.pop();
          if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
          seen.add(cur);
          for (const [k, v] of Object.entries(cur)) {
            if (typeof v === "string") {
              const lowerK = k.toLowerCase();
              if (
                lowerK.includes("model_url") ||
                lowerK.includes("glb") ||
                lowerK.includes("gltf") ||
                (["download_url", "url", "href"].includes(lowerK) &&
                  /glb|gltf/i.test(v))
              ) {
                if (isUrl(v)) return v;
              }
            } else if (v && typeof v === "object") {
              stack.push(v);
            }
          }
          if (Array.isArray(cur)) for (const it of cur) stack.push(it);
        }
        return null;
      };
      
      if (image.startsWith("data:")) {
        setMeshLogs((p) => [
          ...p,
          `🖼️ Local image (base64) size: ~${Math.round(image.length / 1024)} KB`,
        ]);
      } else {
        setMeshLogs((p) => [...p, `🔗 Image URL detected`]);
      }
      
      let start: Response;
      if (photoFile && image.startsWith("data:")) {
        const fd = new FormData();
        const blob = dataUrlToBlob(image);
        const fileForUpload = new File([blob], "upload.jpg", {
          type: blob.type || "image/jpeg",
        });
        fd.append("file", fileForUpload);
        start = await fetch("/api/image-to-3d", { method: "POST", body: fd });
      } else {
        start = await fetch("/api/image-to-3d", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_data: image }),
        });
      }
      
      const data = await start.json();
      if (!start.ok) {
        setMeshLogs((p) => [
          ...p,
          `❌ Start error (${start.status}): ${
            typeof data === "object" ? JSON.stringify(data) : String(data)
          }`,
        ]);
        throw new Error(data.error || "Gagal memulai generate 3D");
      }
      
      const id = data.task_id || data.taskId || data.id || data.result;
      if (!id) throw new Error("Task ID tidak ditemukan");
      setMeshLogs((p) => [...p, `🚀 Task ID: ${id}`]);

      const resp = await fetch(`/api/image-to-3d/status?id=${id}`, {
        headers: { Accept: "text/event-stream" },
      });
      if (!resp.body) throw new Error("Stream tidak tersedia");
      const reader = resp.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let model_url: string | null = null;
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((l) => l.trim() !== "");
        for (const line of lines) {
          if (line.startsWith("data:")) {
            const dataStr = line.replace("data:", "").trim();
            try {
              const d = JSON.parse(dataStr);
              if (d.status) setMeshLogs((p) => [...p, `📡 ${d.status}`]);
              if (d.progress) setMeshLogs((p) => [...p, `📊 ${d.progress}%`]);
              if (d.task_error) setMeshLogs((p) => [...p, `❌ ${d.task_error}`]);

              const candidate =
                d.model_url ||
                d?.result?.model_url ||
                d?.result?.model?.url ||
                d?.model_urls?.glb ||
                d?.result?.model_urls?.glb ||
                d?.model_urls?.gltf ||
                d?.result?.model_urls?.gltf ||
                d?.output?.glb ||
                d?.output?.model_url ||
                (typeof d?.url === "string" && /glb|gltf/i.test(d.url)
                  ? d.url
                  : null) ||
                (typeof d?.download_url === "string" &&
                /glb|gltf/i.test(d.download_url)
                  ? d.download_url
                  : null) ||
                // sometimes under assets array
                (Array.isArray(d?.result?.assets) &&
                  d.result.assets.find(
                    (a: any) =>
                      typeof a?.download_url === "string" &&
                      /glb|gltf/i.test(a.download_url)
                  )?.download_url) ||
                (Array.isArray(d?.assets) &&
                  d.assets.find(
                    (a: any) =>
                      typeof a?.download_url === "string" &&
                      /glb|gltf/i.test(a.download_url)
                  )?.download_url) ||
                findModelUrlDeep(d) ||
                null;

              const isDone =
                (typeof d.progress === "number" && d.progress >= 100) ||
                ["SUCCEEDED", "SUCCESS", "COMPLETED", "DONE"].includes(
                  String(d.status || "").toUpperCase()
                );

              if (candidate && !model_url) {
                model_url = candidate;
                onModelUrlChange(candidate);
                
                // Validate the captured URL
                if (isValid3DModelUrl(candidate)) {
                  setMeshLogs((p) => [...p, `🎨 Model URL ready`]);
                } else {
                  setMeshLogs((p) => [...p, `⚠️ URL captured but invalid format (must be .glb or .gltf)`]);
                }
              }
              if (isDone && !model_url) {
                // finished but no url seen; keep reading remaining events
              }
            } catch {
              // ignore parse errors
            }
          }
        }
      }
      
      if (!model_url) {
        // Fallback: poll final result multiple times to try extract URL
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
        const findModelUrlDeep = (obj: any): string | null => {
          if (!obj) return null;
          // direct known fields
          const direct =
            obj?.model_url ||
            obj?.result?.model_url ||
            obj?.result?.model?.url ||
            obj?.model_urls?.glb ||
            obj?.result?.model_urls?.glb ||
            obj?.output?.glb ||
            obj?.output?.model_url ||
            (Array.isArray(obj?.result?.assets) &&
              obj.result.assets.find((a: any) => a?.download_url)
                ?.download_url) ||
            (Array.isArray(obj?.assets) &&
              obj.assets.find((a: any) => a?.download_url)?.download_url) ||
            null;
          if (direct) return direct;
          // recursive scan for .glb/.gltf/url fields
          const seen = new Set<any>();
          const stack: any[] = [obj];
          const isUrl = (s: any) =>
            typeof s === "string" && /^(https?:)?\/\//i.test(s);
          while (stack.length) {
            const cur = stack.pop();
            if (!cur || typeof cur !== "object" || seen.has(cur)) continue;
            seen.add(cur);
            for (const [k, v] of Object.entries(cur)) {
              if (typeof v === "string") {
                const lowerK = k.toLowerCase();
                if (
                  lowerK.includes("model_url") ||
                  lowerK.includes("glb") ||
                  (["download_url", "url", "href"].includes(lowerK) &&
                    (v.endsWith(".glb") || v.endsWith(".gltf")))
                ) {
                  if (isUrl(v)) return v;
                }
              } else if (v && typeof v === "object") {
                stack.push(v);
              }
            }
            if (Array.isArray(cur)) {
              for (const item of cur) stack.push(item);
            }
          }
          return null;
        };
        let found = false;
        let lastDetail: any = null;
        try {
          for (let attempt = 1; attempt <= 30; attempt++) {
            const detailRes = await fetch(
              `/api/image-to-3d/result?id=${id}`,
              { cache: "no-store" }
            );
            const detail = await detailRes.json();
            lastDetail = detail;
            const status = String(
              detail?.status || detail?.result?.status || ""
            ).toUpperCase();
            const progress = detail?.progress ?? detail?.result?.progress;
            if (status) {
              setMeshLogs((p) => [
                ...p,
                `🕐 Poll ${attempt}: ${status}${
                  typeof progress === "number" ? ` ${progress}%` : ""
                }`,
              ]);
            } else {
              setMeshLogs((p) => [...p, `🕐 Poll ${attempt}`]);
            }
            const candidate =
              detail?.model_url ||
              detail?.result?.model_url ||
              detail?.result?.model?.url ||
              detail?.model_urls?.glb ||
              detail?.result?.model_urls?.glb ||
              detail?.model_urls?.gltf ||
              detail?.result?.model_urls?.gltf ||
              detail?.output?.glb ||
              detail?.output?.model_url ||
              (typeof detail?.url === "string" && /glb|gltf/i.test(detail.url)
                ? detail.url
                : null) ||
              (typeof detail?.download_url === "string" &&
              /glb|gltf/i.test(detail.download_url)
                ? detail.download_url
                : null) ||
              (Array.isArray(detail?.result?.assets) &&
                detail.result.assets.find(
                  (a: any) =>
                    typeof a?.download_url === "string" &&
                    /glb|gltf/i.test(a.download_url)
                )?.download_url) ||
              (Array.isArray(detail?.assets) &&
                detail.assets.find(
                  (a: any) =>
                    typeof a?.download_url === "string" &&
                    /glb|gltf/i.test(a.download_url)
                )?.download_url) ||
              findModelUrlDeep(detail) ||
              null;
            if (candidate) {
              onModelUrlChange(candidate);
              
              // Validate the polled URL
              if (isValid3DModelUrl(candidate)) {
                setMeshLogs((p) => [...p, "🎨 Model URL ready (polled)"]);
              } else {
                setMeshLogs((p) => [...p, "⚠️ URL found but invalid format (must be .glb or .gltf)"]);
              }
              
              found = true;
              break;
            }
            if (["FAILED", "ERROR", "CANCELED"].includes(status)) {
              setMeshLogs((p) => [...p, `❌ Job ${status.toLowerCase()}`]);
              break;
            }
            await sleep(2000);
          }
          if (!found) {
            try {
              const snapshot =
                typeof lastDetail === "object"
                  ? JSON.stringify(lastDetail).slice(0, 1200)
                  : String(lastDetail);
              setMeshLogs((p) => [
                ...p,
                "⚠️ Selesai tanpa model_url (polled)",
                `🧪 Last detail: ${snapshot}${snapshot.length >= 1200 ? "…" : ""}`,
              ]);
            } catch {
              setMeshLogs((p) => [
                ...p,
                "⚠️ Selesai tanpa model_url (polled)",
              ]);
            }
          }
        } catch (e: any) {
          setMeshLogs((p) => [
            ...p,
            `⚠️ Tidak bisa mengambil result: ${e.message}`,
          ]);
        }
      }
    } catch (e: any) {
      setMeshLogs((p) => [...p, `❌ ${e.message}`]);
    } finally {
      setMeshLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          className="px-4 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] transition-colors"
          disabled={meshLoading || (!photoFile && !photoUrl)}
          onClick={handleGenerate3D}
        >
          {meshLoading ? "Generating..." : "Generate 3D (optional)"}
        </button>
      </div>
      {meshLogs.length > 0 && (
        <div className="mt-3 bg-[#FAFAFA] border border-gray-200 rounded-lg p-3 text-xs max-h-40 overflow-y-auto text-[#5C4033]">
          {meshLogs.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      )}
    </div>
  );
}
