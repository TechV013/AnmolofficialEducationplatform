import Link from "next/link";
import { LogOut } from "lucide-react";

interface WorkspaceHeaderProps {
  title?: string;
  user?: { name?: string; role?: string } | null;
  onSignOut?: () => void;
}

export default function WorkspaceHeader({ title = "Anmolofficial", user, onSignOut }: WorkspaceHeaderProps) {
  return (
    <header className="flex h-16 items-center justify-between px-6 border-b bg-white shadow-sm">
      <div className="flex items-center space-x-4">
        <Link href="/" className="text-xl font-bold text-primary">
          Anmolofficial
        </Link>
        {title && <span className="text-muted-foreground">| {title}</span>}
      </div>
      <div className="flex items-center space-x-4">
        {user ? (
          <>
            <span className="text-sm font-medium">{user.name || user.role || "User"}</span>
            <button
              onClick={onSignOut}
              className="text-muted-foreground hover:text-danger flex items-center text-sm"
              aria-label="Sign out"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </button>
          </>
        ) : (
          <Link href="/login" className="text-sm font-medium text-primary hover:underline">
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}