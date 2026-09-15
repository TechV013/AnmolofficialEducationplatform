"use client";

import { cn } from "@/lib/utils";
import { ChangeEvent, ReactNode } from "react";

export interface InputProps {
  children?: ReactNode;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
  type?: string;
  value?: string;
}

export default function Input({
  className,
  defaultValue,
  disabled,
  error,
  label,
  onChange,
  placeholder,
  readOnly,
  required,
  type = "text",
  value,
}: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-text mb-1">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        required={required}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none",
          error && "border-red-500 bg-red-50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      />
    </div>
  );
}
