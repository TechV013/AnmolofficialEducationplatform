import { cn } from "@/lib/utils";

export function initialsOf(name?: string | null) {
  const parts = (name || "").split(/\s+/).filter(Boolean).slice(0, 2);
  const initials = parts.map((p) => p[0]?.toUpperCase()).join("");
  return initials || "?";
}

interface UserAvatarProps {
  image?: string | null;
  name?: string | null;
  className?: string;
  fallbackClassName?: string;
}

export default function UserAvatar({ image, name, className, fallbackClassName }: UserAvatarProps) {
  if (image) {
    return (
      <img
        src={image}
        alt={name || "User"}
        className={cn("shrink-0 rounded-full object-cover", className)}
      />
    );
  }
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-bold text-primary",
        className,
        fallbackClassName
      )}
    >
      {initialsOf(name)}
    </span>
  );
}
