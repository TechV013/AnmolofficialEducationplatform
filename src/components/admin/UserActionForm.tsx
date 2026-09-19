"use client";
import { useState, useTransition } from "react";
import { updateUserRole, toggleBlockUser, deleteUser } from "@/app/(admin)/admin/users/actions";
import { useRouter } from "next/navigation";
import { Ban, ShieldCheck, Trash2, UserRound, GraduationCap, Loader2 } from "lucide-react";

type RoleOption = "STUDENT" | "INSTRUCTOR";

export function RoleSwitch({
  userId,
  currentRole,
  disabled = false
}: {
  userId: string;
  currentRole: RoleOption;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const switchTo = (role: RoleOption) => {
    if (role === currentRole || disabled) return;
    setError(null);
    startTransition(async () => {
      try {
        await updateUserRole(userId, role);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    });
  };

  const segment = (role: RoleOption, label: string, Icon: typeof UserRound) => {
    const isActive = currentRole === role;
    return (
      <button
        type="button"
        onClick={() => switchTo(role)}
        disabled={disabled || pending}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          isActive
            ? "bg-white text-primary shadow-sm"
            : "text-slate-500 hover:text-slate-800 disabled:opacity-50"
        }`}
      >
        {pending && isActive ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
        {label}
      </button>
    );
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
        {segment("STUDENT", "Student", UserRound)}
        {segment("INSTRUCTOR", "Instructor", GraduationCap)}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function BlockUserButton({ userId, isActive }: { userId: string; isActive: boolean }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const doToggle = () => {
    setError(null);
    startTransition(async () => {
      try {
        await toggleBlockUser(userId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setConfirming(false);
      }
    });
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={doToggle}
            disabled={pending}
            className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-semibold text-white transition-colors ${
              isActive ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"
            } disabled:opacity-60`}
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
            Yes, {isActive ? "block" : "unblock"}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </span>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
          isActive
            ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
            : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
        }`}
      >
        {isActive ? <Ban className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
        {isActive ? "Block" : "Unblock"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function DeleteUserButton({ userId }: { userId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const doDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        await deleteUser(userId);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
        setConfirming(false);
      }
    });
  };

  if (confirming) {
    return (
      <div className="flex flex-col items-start gap-1">
        <span className="inline-flex items-center gap-1.5">
          <button
            type="button"
            onClick={doDelete}
            disabled={pending}
            className="inline-flex items-center gap-1 rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            Yes, delete
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={pending}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
        </span>
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Delete
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}