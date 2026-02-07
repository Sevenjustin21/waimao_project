"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

interface Attribute {
  id: string;
  key: string;
  type: 'text' | 'number' | 'select';
}

interface ProductFormProps {
  initialData?: any;
  categories: Category[];
  attributes: Attribute[];
  initialGallery?: string[];
}

interface FormState {
  name: string;
  slug: string;
  sku: string;
  description: string;
  category_id: string;
  price_text: string;
  moq: string;
  lead_time_days: string;
  material_summary: string;
  status: string;
}

const ASSET_BASE = (process.env.NEXT_PUBLIC_ASSET_BASE_URL || '/api/assets').replace(/\/$/, '');

type GalleryItem = {
  fileId: string;
  url: string;
};

export default function ProductForm({ initialData, categories, attributes, initialGallery }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<FormState>({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    sku: initialData?.sku || "",
    description: initialData?.description || "",
    category_id: initialData?.category_id?.id || initialData?.category_id || "",
    price_text: initialData?.price_text || "",
    moq: initialData?.moq || "",
    lead_time_days: initialData?.lead_time_days || "",
    material_summary: initialData?.material_summary || "",
    status: initialData?.status || "published",
  });
  const primaryImageId =
    typeof initialData?.image_id === 'object'
      ? initialData?.image_id?.id
      : (initialData?.image_id || "");
  const deriveInitialGalleryIds = () => {
    if (initialGallery && initialGallery.length > 0) return initialGallery;
    return primaryImageId ? [primaryImageId] : [];
  };
  const [gallery, setGallery] = useState<GalleryItem[]>(
    deriveInitialGalleryIds().map((fileId) => ({
      fileId,
      url: `${ASSET_BASE}/${fileId}`,
    }))
  );
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [uploadError, setUploadError] = useState("");

  useEffect(() => {
    setGallery(
      deriveInitialGalleryIds().map((fileId) => ({
        fileId,
        url: `${ASSET_BASE}/${fileId}`,
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(initialGallery || []), primaryImageId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploadError("");
    setUploadingGallery(true);

    try {
      for (const file of Array.from(files)) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", file);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: uploadFormData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Image upload failed");
        }

        const data = await res.json();
        const fileId = data.data.id as string;
        setGallery((prev) => [
          ...prev,
          {
            fileId,
            url: `${ASSET_BASE}/${fileId}`,
          },
        ]);
      }
    } catch (err: any) {
      setUploadError(err.message);
    } finally {
      setUploadingGallery(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = (fileId: string) => {
    setGallery((prev) => prev.filter((img) => img.fileId !== fileId));
  };

  const handleSetCover = (fileId: string) => {
    setGallery((prev) => {
      const index = prev.findIndex((img) => img.fileId === fileId);
      if (index <= 0) return prev;
      const next = [...prev];
      const [selected] = next.splice(index, 1);
      next.unshift(selected);
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const galleryIds = gallery.map((img) => img.fileId);

      type SubmitPayload = FormState & {
        gallery?: string[];
        image_id?: string | null;
      };

      const payload: SubmitPayload = {
        ...formData,
      };

      payload.gallery = galleryIds;
      payload.image_id = galleryIds[0] || null;

      // Remove any undefined/null values
      if (!payload.category_id) delete (payload as any).category_id;

      const url = initialData 
        ? `/api/admin/products/${initialData.id}`
        : "/api/admin/products";
      
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to save product");
      }

      router.push("/admin/products");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl bg-white p-6 rounded shadow">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
              <input type="text" name="sku" id="sku" required value={formData.sku} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="price_text" className="block text-sm font-medium text-gray-700">Price Text</label>
              <input type="text" name="price_text" id="price_text" placeholder="e.g. $10-20 / Set" value={formData.price_text} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="moq" className="block text-sm font-medium text-gray-700">MOQ</label>
              <input type="number" name="moq" id="moq" value={formData.moq} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
              <label htmlFor="lead_time_days" className="block text-sm font-medium text-gray-700">Lead Time (Days)</label>
              <input type="number" name="lead_time_days" id="lead_time_days" value={formData.lead_time_days} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
            </div>
            <div>
               <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
               <select name="status" id="status" value={formData.status} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2">
                 <option value="published">Published</option>
                 <option value="draft">Draft</option>
                 <option value="archived">Archived</option>
               </select>
            </div>
          </div>
          
          <div>
            <label htmlFor="material_summary" className="block text-sm font-medium text-gray-700">Material Summary</label>
            <input type="text" name="material_summary" id="material_summary" value={formData.material_summary} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2" />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Product Gallery</label>
              <span className="text-xs text-gray-500">First image will be shown on the storefront</span>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {gallery.map((item, idx) => (
                <div key={item.fileId} className="relative h-32 rounded-xl border border-gray-200 overflow-hidden bg-gray-50">
                  <Image
                    src={item.url}
                    alt={`Product image ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="200px"
                    unoptimized
                  />
                  <div className="absolute inset-x-0 bottom-0 flex justify-between items-center bg-gradient-to-t from-black/70 to-black/10 px-3 py-2 text-xs text-white">
                    <span>{idx === 0 ? 'Cover' : `Image ${idx + 1}`}</span>
                    <div className="flex gap-2">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => handleSetCover(item.fileId)}
                          className="underline"
                        >
                          Set Cover
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(item.fileId)}
                        className="text-red-200 underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <label className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-white text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-500 transition-colors cursor-pointer">
                <span>{uploadingGallery ? 'Uploading...' : 'Upload Images'}</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
              </label>
            </div>
            {uploadError && <p className="text-xs text-red-600 mt-2">{uploadError}</p>}
            {!gallery.length && (
              <p className="text-xs text-gray-500 mt-2">You can upload multiple images. Use “Set Cover” to choose the primary photo.</p>
            )}
          </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Product"}
        </button>
      </div>
    </form>
  );
}
