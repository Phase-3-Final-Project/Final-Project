"use client";

import React, { Suspense, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";

function ModelViewer({ url }: { url: string }) {
  useGLTF.preload(url);
  const { scene } = useGLTF(url);
  return (
    <Canvas camera={{ position: [0, 1, 3], fov: 45 }} className="w-full h-[360px] bg-gray-900 rounded-lg">
      <ambientLight intensity={1} />
      <directionalLight position={[2, 2, 5]} intensity={1.2} />
      <Suspense fallback={null}>
        <primitive object={scene} scale={1} />
        <Environment preset="studio" />
      </Suspense>
      <OrbitControls />
    </Canvas>
  );
}

export default function Add() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [alternateNames, setAlternateNames] = useState<string[]>([""]);
  const [description, setDescription] = useState("");
  const [province, setProvince] = useState("");
  const [island, setIsland] = useState("");
  const [cityOrRegion, setCityOrRegion] = useState("");
  const [category, setCategory] = useState("");
  const [course, setCourse] = useState("");
  const [mainIngredients, setMainIngredients] = useState<string[]>([""]);
  const [servingTemperature, setServingTemperature] = useState("");
  const [servingAccompaniments, setServingAccompaniments] = useState<string[]>([""]);
  const [servingPortionSize, setServingPortionSize] = useState("");
  const [tasteSpiciness, setTasteSpiciness] = useState("");
  const [flavorNotes, setFlavorNotes] = useState<string[]>([""]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [meshLoading, setMeshLoading] = useState(false);
  const [meshLogs, setMeshLogs] = useState<string[]>([]);

  const proxiedModelUrl = useMemo(() => {
    if (!modelUrl) return null;
    try {
      const already = new URL(modelUrl, window.location.origin);
      const isProxy = already.pathname.includes("/api/proxy-model");
      if (isProxy) {
        const original = already.searchParams.get("url");
        return `/api/proxy-model?url=${encodeURIComponent(original || modelUrl)}`;
      }
    } catch {}
    return `/api/proxy-model?url=${encodeURIComponent(modelUrl)}`;
  }, [modelUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      setPhotoFile(f);
      setPhotoPreview(URL.createObjectURL(f));
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Prepare photo: if file selected -> base64, else use URL
      let photoValue: string | null = null;
      if (photoFile) {
        photoValue = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(photoFile);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
        });
      } else if (photoUrl.trim()) {
        photoValue = photoUrl.trim();
      }
      if (!photoValue) throw new Error("Minimal 1 foto harus diupload atau isi URL");

      const origin = { province, island, city_or_region: cityOrRegion };
      if (!province || !island || !cityOrRegion) throw new Error("Province, Island, dan City/Region harus diisi");

      const res = await fetch("/api/foods", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          alternate_names: alternateNames.filter((s) => s.trim()),
          description,
          photo: photoValue,
          category,
          course,
          origin,
          serving: {
            temperature: servingTemperature,
            accompaniments: servingAccompaniments.filter((s) => s.trim()),
            portion_size: servingPortionSize,
          },
          main_ingredients: mainIngredients.filter((s) => s.trim()),
          taste_profile: {
            spiciness: tasteSpiciness,
            flavor_notes: flavorNotes.filter((s) => s.trim()),
          },
          ...(modelUrl ? { ["model3D"]: modelUrl } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menambah food");
  setSuccess("Berhasil menambah food!");
      setName("");
      setAlternateNames([""]);
      setDescription("");
      setProvince("");
      setIsland("");
      setCityOrRegion("");
      setCategory("");
      setCourse("");
      setMainIngredients([""]);
      setServingTemperature("");
      setServingAccompaniments([""]);
      setServingPortionSize("");
      setTasteSpiciness("");
      setFlavorNotes([""]);
      setPhotoFile(null);
      setPhotoPreview("");
      setPhotoUrl("");
      setModelUrl(null);
      setMeshLogs([]);
      // Redirect to dashboard after short delay to show success
      setTimeout(() => {
        router.push("/admin");
      }, 500);
    } catch (err: any) {
      setError(err.message || "Gagal menambah food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] flex justify-center items-start bg-[#F9F5EB] mb-5">
      <section className="w-full max-w-3xl bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div>
          <h2 className="text-2xl font-bold text-[#5C4033] mb-1">Add New Food</h2>
          <p className="text-sm text-[#8B6F47] mb-4">Lengkapi detail makanan, gambar, dan (opsional) model 3D.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-1">Name</label>
              <input
                type="text"
                placeholder="Food name..."
                className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            {/* Alternate Names (Array) */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-1">Alternate Names</label>
              <div className="space-y-2">
                {alternateNames.map((val, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                      placeholder="e.g. Mie Aceh Goreng"
                      value={val}
                      onChange={(e) => {
                        const copy = [...alternateNames];
                        copy[idx] = e.target.value;
                        setAlternateNames(copy);
                      }}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
                      onClick={() => setAlternateNames((arr) => arr.filter((_, i) => i !== idx))}
                      disabled={alternateNames.length === 1}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] text-sm"
                      onClick={() => setAlternateNames((arr) => [...arr, ""])}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-1">Description</label>
              <textarea
                placeholder="Write description..."
                className="w-full min-h-28 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Origin Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-1">Province</label>
                <input
                  type="text"
                  placeholder="e.g. Bali"
                  className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-1">Island</label>
                <input
                  type="text"
                  placeholder="e.g. Java"
                  className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                  value={island}
                  onChange={(e) => setIsland(e.target.value)}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-[#5C4033] mb-1">City / Region</label>
                <input
                  type="text"
                  placeholder="e.g. Banda Aceh"
                  className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                  value={cityOrRegion}
                  onChange={(e) => setCityOrRegion(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Photo (single) Upload or URL */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-2">Photo (upload or URL)</label>
              <button
                type="button"
                className="inline-flex items-center gap-2 mb-3 px-4 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] transition-colors"
                onClick={handleUploadClick}
              >
                📤 Upload Photo
              </button>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  className="flex-1 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                  placeholder="Paste photo URL..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                />
                {photoFile && (
                  <button
                    type="button"
                    className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoPreview("");
                    }}
                  >
                    ✕ Remove Upload
                  </button>
                )}
              </div>
            </div>

            {/* Preview */}
            {(photoPreview || photoUrl) && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Photo preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                )}
                {photoUrl && (
                  <img
                    src={photoUrl}
                    alt="Photo URL preview"
                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                  />
                )}
              </div>
            )}

            {/* Generate 3D */}
            <div>
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  className="px-4 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] transition-colors"
                  disabled={meshLoading || (!photoFile && !photoUrl)}
                  onClick={async () => {
                    // Use first image (local or url) for 3D generation
                    let image: string | null = null;
                    if (photoFile) {
                      image = await new Promise<string>((resolve, reject) => {
                        const reader = new FileReader();
                        reader.readAsDataURL(photoFile);
                        reader.onload = () => resolve(reader.result as string);
                        reader.onerror = (err) => reject(err);
                      });
                    } else if (photoUrl.trim()) {
                      image = photoUrl.trim();
                    }
                    if (!image) return;
                    setMeshLoading(true);
                    setMeshLogs([]);
                    setModelUrl(null);
                    try {
                      const start = await fetch("/api/image-to-3d", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ image_data: image }),
                      });
                      const data = await start.json();
                      if (!start.ok) throw new Error(data.error || "Gagal memulai generate 3D");
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
                                d?.output?.glb ||
                                d?.output?.model_url ||
                                // sometimes under assets array
                                (Array.isArray(d?.result?.assets) && d.result.assets.find((a: any) => a?.download_url)?.download_url) ||
                                (Array.isArray(d?.assets) && d.assets.find((a: any) => a?.download_url)?.download_url) ||
                                null;

                              const isDone =
                                (typeof d.progress === "number" && d.progress >= 100) ||
                                ["SUCCEEDED", "SUCCESS", "COMPLETED", "DONE"].includes(
                                  String(d.status || "").toUpperCase()
                                );

                              if (candidate && !model_url) {
                                model_url = candidate;
                                setModelUrl(candidate);
                                setMeshLogs((p) => [...p, `🎨 Model URL ready`]);
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
                            (Array.isArray(obj?.result?.assets) && obj.result.assets.find((a: any) => a?.download_url)?.download_url) ||
                            (Array.isArray(obj?.assets) && obj.assets.find((a: any) => a?.download_url)?.download_url) ||
                            null;
                          if (direct) return direct;
                          // recursive scan for .glb/.gltf/url fields
                          const seen = new Set<any>();
                          const stack: any[] = [obj];
                          const isUrl = (s: any) => typeof s === 'string' && /^(https?:)?\/\//i.test(s);
                          while (stack.length) {
                            const cur = stack.pop();
                            if (!cur || typeof cur !== 'object' || seen.has(cur)) continue;
                            seen.add(cur);
                            for (const [k, v] of Object.entries(cur)) {
                              if (typeof v === 'string') {
                                const lowerK = k.toLowerCase();
                                if (
                                  lowerK.includes('model_url') ||
                                  lowerK.includes('glb') ||
                                  (['download_url', 'url', 'href'].includes(lowerK) && (v.endsWith('.glb') || v.endsWith('.gltf')))
                                ) {
                                  if (isUrl(v)) return v;
                                }
                              } else if (v && typeof v === 'object') {
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
                        try {
                          for (let attempt = 1; attempt <= 15; attempt++) {
                            const detailRes = await fetch(`/api/image-to-3d/result?id=${id}`, { cache: 'no-store' });
                            const detail = await detailRes.json();
                            const status = String(detail?.status || detail?.result?.status || '').toUpperCase();
                            const progress = detail?.progress ?? detail?.result?.progress;
                            if (status) {
                              setMeshLogs((p) => [...p, `🕐 Poll ${attempt}: ${status}${typeof progress === 'number' ? ` ${progress}%` : ''}`]);
                            } else {
                              setMeshLogs((p) => [...p, `🕐 Poll ${attempt}`]);
                            }
                            const candidate =
                              detail?.model_url ||
                              detail?.result?.model_url ||
                              detail?.result?.model?.url ||
                              detail?.model_urls?.glb ||
                              detail?.result?.model_urls?.glb ||
                              detail?.output?.glb ||
                              detail?.output?.model_url ||
                              (Array.isArray(detail?.result?.assets) && detail.result.assets.find((a: any) => a?.download_url)?.download_url) ||
                              (Array.isArray(detail?.assets) && detail.assets.find((a: any) => a?.download_url)?.download_url) ||
                              findModelUrlDeep(detail) ||
                              null;
                            if (candidate) {
                              setModelUrl(candidate);
                              setMeshLogs((p) => [...p, '🎨 Model URL ready (polled)']);
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
                            setMeshLogs((p) => [...p, "⚠️ Selesai tanpa model_url (polled)"]);
                          }
                        } catch (e: any) {
                          setMeshLogs((p) => [...p, `⚠️ Tidak bisa mengambil result: ${e.message}`]);
                        }
                      }
                    } catch (e: any) {
                      setMeshLogs((p) => [...p, `❌ ${e.message}`]);
                    } finally {
                      setMeshLoading(false);
                    }
                  }}
                >
                  {meshLoading ? "Generating..." : "Generate 3D (optional)"}
                </button>
                {modelUrl && <span className="text-xs text-emerald-600">Model URL captured ✓</span>}
              </div>
              {meshLogs.length > 0 && (
                <div className="mt-3 bg-[#FAFAFA] border border-gray-200 rounded-lg p-3 text-xs max-h-40 overflow-y-auto text-[#5C4033]">
                  {meshLogs.map((l, i) => (
                    <div key={i}>{l}</div>
                  ))}
                </div>
              )}
            </div>

            {/* Category & Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-1">Category</label>
                <input
                  type="text"
                  placeholder="e.g. Hidangan Utama"
                  className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#5C4033] mb-1">Course</label>
                <input
                  type="text"
                  placeholder="e.g. Makan Siang / Malam"
                  className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                />
              </div>
            </div>

            {/* Main Ingredients (Array) */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-1">Main Ingredients</label>
              <div className="space-y-2">
                {mainIngredients.map((val, idx) => (
                  <div key={idx} className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                      placeholder="e.g. Mie tebal"
                      value={val}
                      onChange={(e) => {
                        const copy = [...mainIngredients];
                        copy[idx] = e.target.value;
                        setMainIngredients(copy);
                      }}
                    />
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
                      onClick={() => setMainIngredients((arr) => arr.filter((_, i) => i !== idx))}
                      disabled={mainIngredients.length === 1}
                    >
                      −
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] text-sm"
                      onClick={() => setMainIngredients((arr) => [...arr, ""])}
                    >
                      +
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Serving */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-2">Serving</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8B6F47] mb-1">Temperature</label>
                  <input
                    type="text"
                    placeholder="e.g. Panas"
                    className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                    value={servingTemperature}
                    onChange={(e) => setServingTemperature(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8B6F47] mb-1">Portion Size</label>
                  <input
                    type="text"
                    placeholder="e.g. 1 mangkuk (350–400 g)"
                    className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                    value={servingPortionSize}
                    onChange={(e) => setServingPortionSize(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-[#8B6F47] mb-1">Accompaniments</label>
                <div className="space-y-2">
                  {servingAccompaniments.map((val, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                        placeholder="e.g. Acar bawang mentimun"
                        value={val}
                        onChange={(e) => {
                          const copy = [...servingAccompaniments];
                          copy[idx] = e.target.value;
                          setServingAccompaniments(copy);
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
                        onClick={() => setServingAccompaniments((arr) => arr.filter((_, i) => i !== idx))}
                        disabled={servingAccompaniments.length === 1}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] text-sm"
                        onClick={() => setServingAccompaniments((arr) => [...arr, ""])}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Taste Profile */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-2">Taste Profile</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8B6F47] mb-1">Spiciness</label>
                  <input
                    type="text"
                    placeholder="e.g. Sedang–Pedas"
                    className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                    value={tasteSpiciness}
                    onChange={(e) => setTasteSpiciness(e.target.value)}
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-xs text-[#8B6F47] mb-1">Flavor Notes</label>
                <div className="space-y-2">
                  {flavorNotes.map((val, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input
                        type="text"
                        className="flex-1 rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                        placeholder="e.g. Gurih, Rempah kari"
                        value={val}
                        onChange={(e) => {
                          const copy = [...flavorNotes];
                          copy[idx] = e.target.value;
                          setFlavorNotes(copy);
                        }}
                      />
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 text-sm"
                        onClick={() => setFlavorNotes((arr) => arr.filter((_, i) => i !== idx))}
                        disabled={flavorNotes.length === 1}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] text-sm"
                        onClick={() => setFlavorNotes((arr) => [...arr, ""])}
                      >
                        +
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Success/Error */}
            {success && (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">{success}</div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">{error}</div>
            )}

            {/* 3D Preview when model URL is ready */}
            {proxiedModelUrl && (
              <div className="bg-[#FAFAFA] border border-gray-200 p-4 rounded-lg w-full mt-4">
                <h3 className="text-lg font-semibold mb-2 text-center text-[#5C4033]">🪩 Preview Model 3D</h3>
                <p className="text-xs text-gray-500 mb-2 break-all">URL: {modelUrl}</p>
                <Suspense
                  fallback={<div className="text-center text-gray-400 p-8">Memuat model 3D...</div>}
                >
                  <ModelViewer url={proxiedModelUrl} />
                </Suspense>
                <div className="mt-3 text-center">
                  <a
                    href={`/api/proxy-model?url=${encodeURIComponent(
                      modelUrl!.includes("/api/proxy-model?url=")
                        ? decodeURIComponent(modelUrl!.split("url=")[1])
                        : modelUrl!
                    )}`}
                    download="model.glb"
                    className="inline-block px-4 py-2 rounded-lg bg-[#5C4033] text-white hover:bg-[#4a362b] text-sm"
                  >
                    Download Model
                  </a>
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full px-4 py-3 rounded-xl bg-[#5C4033] text-white font-semibold hover:bg-[#4a362b] transition-colors"
                disabled={loading}
              >
                {loading ? "Loading..." : "🚀 Submit"}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
