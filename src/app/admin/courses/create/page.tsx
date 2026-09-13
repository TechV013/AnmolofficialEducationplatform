import type { Metadata } from "next";
export const metadata: Metadata = { title: "Create Course — Admin", robots: { index: false, follow: false } };
import { authorizeRole } from "@/lib/auth/guard";
import { createCourse } from "@/app/admin/courses/actions";

export default async function AdminCreateCoursePage() {
  await authorizeRole("ADMIN");
  return (
    <div className="p-12 max-w-2xl mx-auto bg-background min-h-screen text-text">
      <h1 className="text-3xl font-bold mb-6">Create New Course</h1>
      <form action={createCourse} className="space-y-4 bg-surface p-6 rounded-2xl border border-border shadow-sm">
        <div><label htmlFor="title" className="block font-bold mb-1">Title</label><input id="title" name="title" required className="w-full p-2 border rounded-lg bg-background" /></div>
        <div><label htmlFor="slug" className="block font-bold mb-1">Slug (URL ID)</label><input id="slug" name="slug" required className="w-full p-2 border rounded-lg bg-background" /></div>
        <div><label htmlFor="description" className="block font-bold mb-1">Description</label><textarea id="description" name="description" rows={3} required className="w-full p-2 border rounded-lg bg-background" /></div>
        <div><label htmlFor="category" className="block font-bold mb-1">Category</label><input id="category" name="category" required className="w-full p-2 border rounded-lg bg-background" /></div>
        <div><label htmlFor="level" className="block font-bold mb-1">Level</label><select id="level" name="level" className="w-full p-2 border rounded-lg bg-background"><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></div>
        <div><label htmlFor="thumbnail" className="block font-bold mb-1">Thumbnail URL</label><input id="thumbnail" name="thumbnail" required className="w-full p-2 border rounded-lg bg-background" /></div>
        <div><label htmlFor="price" className="block font-bold mb-1">Price (INR)</label><input id="price" name="price" type="number" min={0} step={0.01} defaultValue={0} required className="w-full p-2 border rounded-lg bg-background" /></div>
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-full font-bold">Create Course (DRAFT)</button>
      </form>
    </div>
  );
}