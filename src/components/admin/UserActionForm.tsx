"use client";
import { useState } from "react";
import { updateUserRole, deleteUser } from "@/app/(admin)/admin/users/actions";
import { useRouter } from "next/navigation";
import type { UserRole } from "@/types/lms";

export function UserActionForm({ userId, currentRole }: { userId: string, currentRole: string }) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleUpdate = async (formData: FormData) => {
        setError(null);
        try {
            await updateUserRole(userId, formData.get("role") as UserRole);
            router.refresh();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <form action={handleUpdate} className="flex gap-2">
                <select name="role" defaultValue={currentRole} className="border rounded px-2 py-1">
                    <option value="STUDENT">STUDENT</option>
                    <option value="INSTRUCTOR">INSTRUCTOR</option>
                    <option value="ADMIN">ADMIN</option>
                </select>
                <button className="bg-primary text-white px-3 py-1 rounded text-sm">Update</button>
            </form>
        </div>
    );
}

export function DeleteUserForm({ userId }: { userId: string }) {
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleDelete = async () => {
        setError(null);
        if (!confirm("Are you sure?")) return;
        try {
            await deleteUser(userId);
            router.refresh();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : String(e));
        }
    };

    return (
        <div className="flex flex-col gap-1">
            {error && <p className="text-red-500 text-xs">{error}</p>}
            <button onClick={handleDelete} className="bg-red-500 text-white px-3 py-1 rounded text-sm">Delete</button>
        </div>
    );
}