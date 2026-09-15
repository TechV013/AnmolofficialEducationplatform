import { cn } from "@/lib/utils";
import Image from "next/image";

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: string;
}

export default function Avatar({ src, alt, size }: AvatarProps) {
  return (
    <Image
      src={src || "/images/default-avatar.png"}
      alt={alt || "Avatar"}
      className={cn("rounded-full object-cover", size === "sm" ? "w-8 h-8" : "w-10 h-10")}
      width={40}
      height={40}
      priority
    />
  );
}
