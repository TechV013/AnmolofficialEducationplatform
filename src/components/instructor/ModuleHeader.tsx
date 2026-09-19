"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateModule, deleteModule } from "@/app/(instructor)/instructor/courses/[courseId]/actions";
import { Pencil, Trash2, Check, X } from "lucide-react";

export default function ModuleHeader({ moduleId, title, courseId, index }: {
  moduleId: string;
  title: string;
  courseId: string;
  index: number;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!value.trim()) return;
    setBusy(true);
    try {
      await updateModule(moduleId, value.trim(), courseId);
      setEditing(false);
      router.refresh();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3">
      {editing ? (
        <div className="flex flex-1 items-center gap-2">
          <input value={value} onChange={(e) => setValue(e.target.value)} autoFocus className="flex-1 rounded-lg border px-3 py-1.5 text-sm font-semibold" />
          <button onClick={save} disabled={busy} className="rounded-full bg-primary p-1.5 text-white"><Check className="h-4 w-4" /></button>
          <button onClick={() => { setEditing(false); setValue(title); }} className="rounded-full border border-slate-200 p-1.5 text-slate-500"><X className="h-4 w-4" /></button>
        </div>
      ) : (
        <>
          <h2 className="flex items-center gap-2 text-xl font-bold text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{index + 1}</span>
            {title}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setEditing(true)} className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition-colors hover:text-primary"><Pencil className="h-4 w-4" /></button>
            <form action={async () => { await deleteModule(moduleId, courseId); router.refresh(); }}>
              <button className="rounded-full border border-slate-200 p-1.5 text-slate-500 transition-colors hover:border-red-200 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}