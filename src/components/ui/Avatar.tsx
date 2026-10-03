import UserAvatar from "./UserAvatar";

export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: string;
}

export default function Avatar({ src, alt, size }: AvatarProps) {
  return (
    <UserAvatar
      image={src}
      name={alt}
      className={size === "sm" ? "w-8 h-8 text-xs" : "w-10 h-10 text-sm"}
    />
  );
}
