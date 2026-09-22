"use client";

import { useState } from "react";
import { Upload, Loader2, Save } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { updateUserProfile, ProfileUpdateData } from "@/app/actions/profile";
import { useRouter } from "next/navigation";

export default function ProfileForm({ user }: { user: any }) {
  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const [formData, setFormData] = useState<ProfileUpdateData>({
    name: user.name || "",
    bio: user.bio || "",
    title: user.title || "",
    phone: user.phone || "",
    website: user.website || "",
    image: user.image || "",
  });

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      setFormData((prev) => ({ ...prev, image: data.url }));
      toast("Profile photo updated!", "success");
    } catch (err) {
      toast("Image upload failed", "error");
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateUserProfile(formData);
      toast("Profile updated successfully", "success");
      router.refresh();
    } catch (err) {
      toast("Failed to update profile", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl border border-border shadow-sm">
      <div className="flex flex-col items-center sm:flex-row gap-6">
        <div className="relative h-24 w-24">
          <img
            src={formData.image || "/images/default-avatar.png"}
            alt="Profile"
            className="h-24 w-24 rounded-full object-cover border border-border"
          />
          <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer hover:bg-primary-hover transition-colors">
            {imageUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
          </label>
        </div>
        <div className="flex-1 w-full space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">Full Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">Professional Title</label>
              <input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Senior 3D Designer"
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-muted mb-1.5">Bio</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={3}
              className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">Phone</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-muted mb-1.5">Website</label>
              <input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border flex justify-end">
        <button
          disabled={loading}
          type="submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-primary-hover disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>
    </form>
  );
}
