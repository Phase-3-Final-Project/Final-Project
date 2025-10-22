"use client";

import React, { Suspense, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FormInput from "@/components/forms/FormInput";
import ArrayInputField from "@/components/forms/ArrayInputField";
import PhotoUpload from "@/components/forms/PhotoUpload";
import Generate3D from "@/components/forms/Generate3D";
import ModelViewer from "@/components/ModelViewer";
import { fileToDataUrlResized } from "@/helpers/imageUtils";
import { isValid3DModelUrl } from "@/helpers/validate3DModel";

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
  const [servingAccompaniments, setServingAccompaniments] = useState<string[]>([
    "",
  ]);
  const [servingPortionSize, setServingPortionSize] = useState("");
  const [tasteSpiciness, setTasteSpiciness] = useState("");
  const [flavorNotes, setFlavorNotes] = useState<string[]>([""]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string>("");
  const [upgradedImageUrl, setUpgradedImageUrl] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [modelUrl, setModelUrl] = useState<string | null>(null);

  const proxiedModelUrl = useMemo(() => {
    if (!modelUrl) return null;
    try {
      const already = new URL(modelUrl, window.location.origin);
      const isProxy = already.pathname.includes("/api/proxy-model");
      if (isProxy) {
        const original = already.searchParams.get("url");
        return `/api/proxy-model?url=${encodeURIComponent(
          original || modelUrl
        )}`;
      }
    } catch {}
    return `/api/proxy-model?url=${encodeURIComponent(modelUrl)}`;
  }, [modelUrl]);

  const handlePhotoChange = (file: File | null, preview: string) => {
    setPhotoFile(file);
    setPhotoPreview(preview);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      // Prepare photo: prioritize upgraded image, then file, then URL
      let photoValue: string | null = null;

      // Use upgraded image if available
      if (upgradedImageUrl.trim()) {
        photoValue = upgradedImageUrl.trim();
      } else if (photoFile) {
        photoValue = await fileToDataUrlResized(photoFile, 1024, 0.85);
      } else if (photoUrl.trim()) {
        photoValue = photoUrl.trim();
      }

      if (!photoValue)
        throw new Error("Minimal 1 foto harus diupload atau isi URL");

      const origin = { province, island, city_or_region: cityOrRegion };
      if (!province || !island || !cityOrRegion)
        throw new Error("Province, Island, dan City/Region harus diisi");

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
      setUpgradedImageUrl("");
      setModelUrl(null);
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
          <h2 className="text-2xl font-bold text-[#5C4033] mb-1">
            Add New Food
          </h2>
          <p className="text-sm text-[#8B6F47] mb-4">
            Lengkapi detail makanan, gambar, dan (opsional) model 3D.
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Name */}
            <FormInput
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Food name..."
              required
            />

            {/* Alternate Names (Array) */}
            <ArrayInputField
              label="Alternate Names"
              values={alternateNames}
              onChange={setAlternateNames}
              placeholder="e.g. Mie Aceh Goreng"
            />

            {/* Description */}
            <FormInput
              label="Description"
              value={description}
              onChange={setDescription}
              placeholder="Write description..."
              required
              type="textarea"
            />

            {/* Origin Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                label="Province"
                value={province}
                onChange={setProvince}
                placeholder="e.g. Bali"
                required
              />
              <FormInput
                label="Island"
                value={island}
                onChange={setIsland}
                placeholder="e.g. Java"
                required
              />
              <div className="sm:col-span-2">
                <FormInput
                  label="City / Region"
                  value={cityOrRegion}
                  onChange={setCityOrRegion}
                  placeholder="e.g. Banda Aceh"
                  required
                />
              </div>
            </div>

            {/* Photo Upload */}
            <PhotoUpload
              photoFile={photoFile}
              photoPreview={photoPreview}
              photoUrl={photoUrl}
              onFileChange={handlePhotoChange}
              onUrlChange={setPhotoUrl}
              upgradedImageUrl={upgradedImageUrl}
              onUpgradedImageChange={setUpgradedImageUrl}
            />

            {/* Generate 3D */}
            <Generate3D
              photoFile={photoFile}
              photoUrl={upgradedImageUrl || photoUrl}
              onModelUrlChange={setModelUrl}
            />

            {/* Category & Course */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-3 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 hover:border-gray-400 transition-colors"
              >
                <option className="text-gray-700" value="">All Categories</option>
                <option value="Hidangan Utama">Main Dish</option>
                <option value="Kue Tradisional">Traditional Cake</option>
                <option value="Sup">Soup</option>
                <option value="Lauk">Side Dish</option>
                <option value="Camilan">Snack</option>
                <option value="Seafood">Seafood</option>
                <option value="Gulai">Curry</option>
                <option value="Roti">Bread</option>
                <option value="Pendamping">Accompaniment</option>
                <option value="Bumbu">Spice</option>
                <option value="Sambal">Chili Sauce</option>
              </select>
            <select
              value={course}
              onChange={(e) => setCourse(e.target.value)}
              className="px-3 py-3 rounded-lg bg-gray-100 text-gray-700 text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 hover:border-gray-400 transition-colors"
            >
              <option className="text-gray-700" value="">All Courses</option>
              <option value="Sarapan">Breakfast</option>
              <option value="Makan Siang">Lunch</option>
              <option value="Makan Malam">Dinner</option>
              <option value="Camilan">Snack</option>
              <option value="Hidangan Penutup">Dessert</option>
              <option value="Jajanan">Street Food</option>
              <option value="Jamuan">Banquet</option>
              <option value="Acara Adat">Traditional Event</option>
              <option value="Pesta">Party</option>
              <option value="Perayaan">Celebration</option>
              <option value="Kenduri">Feast</option>
              <option value="Bekal">Packed Meal</option>
              <option value="Pendamping">Accompaniment</option>
              <option value="Oleh-oleh">Souvenir</option>
              <option value="Hari Raya">Holiday</option>
              <option value="Acara Khusus">Special Event</option>
            </select>
            </div>

            {/* Main Ingredients (Array) */}
            <ArrayInputField
              label="Main Ingredients"
              values={mainIngredients}
              onChange={setMainIngredients}
              placeholder="e.g. Mie tebal"
            />

            {/* Serving */}
            <div>
              <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                Serving
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8B6F47] mb-1">
                    Temperature
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Panas"
                    className="w-full rounded-lg border border-gray-200 bg-[#FAFAFA] px-3 py-2 text-[#5C4033] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#8B6F47]/30 focus:border-[#5C4033]"
                    value={servingTemperature}
                    onChange={(e) => setServingTemperature(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#8B6F47] mb-1">
                    Portion Size
                  </label>
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
                <label className="block text-xs text-[#8B6F47] mb-1">
                  Accompaniments
                </label>
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
                        onClick={() =>
                          setServingAccompaniments((arr) =>
                            arr.filter((_, i) => i !== idx)
                          )
                        }
                        disabled={servingAccompaniments.length === 1}
                      >
                        −
                      </button>
                      <button
                        type="button"
                        className="px-3 py-2 rounded-lg border border-[#5C4033] text-[#5C4033] hover:bg-[#F9F5EB] text-sm"
                        onClick={() =>
                          setServingAccompaniments((arr) => [...arr, ""])
                        }
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
              <label className="block text-sm font-semibold text-[#5C4033] mb-2">
                Taste Profile
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-[#8B6F47] mb-1">
                    Spiciness
                  </label>
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
                <label className="block text-xs text-[#8B6F47] mb-1">
                  Flavor Notes
                </label>
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
                        onClick={() =>
                          setFlavorNotes((arr) =>
                            arr.filter((_, i) => i !== idx)
                          )
                        }
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
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-700 px-3 py-2 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
                {error}
              </div>
            )}

            {/* 3D Preview when model URL is ready */}
            {isValid3DModelUrl(modelUrl) && proxiedModelUrl && (
              <div className="bg-[#FAFAFA] border border-gray-200 p-4 rounded-lg w-full mt-4">
                <h3 className="text-lg font-semibold mb-2 text-center text-[#5C4033]">
                  🪩 Preview Model 3D
                </h3>
                <p className="text-xs text-gray-500 mb-2 break-all">
                  URL: {modelUrl}
                </p>
                <Suspense
                  fallback={
                    <div className="text-center text-gray-400 p-8">
                      Memuat model 3D...
                    </div>
                  }
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
