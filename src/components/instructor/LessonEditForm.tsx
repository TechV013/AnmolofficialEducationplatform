"use client";
import { useState } from "react";
interface Props { courseId: string }
export default function LessonEditForm({ courseId }: Props) {
  const [loading, setLoading] = useState(false);
  return <form onSubmit={() => { setLoading(true); }}><button disabled={loading}>{loading ? "Saving..." : "Save"}</button></form>;
}