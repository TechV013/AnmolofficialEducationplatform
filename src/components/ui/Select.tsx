"use client";
import { cn } from "@/lib/utils";
import { ChangeEvent } from "react";

export interface SelectProps {
  children?: React.ReactNode;
  className?: string;
  defaultValue?: string;
  disabled?: boolean;
  error?: boolean;
  label?: string;
  onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
  value?: string;
}

export default function Select({ children, className, defaultValue, disabled, error, label, onChange, required, value }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-text mb-1">{label}</label>}
      <select
        defaultValue={defaultValue}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={cn(
          "w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent outline-none",
          error && "border-red-500 bg-red-50",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {children}
      </select>
    </div>
  );
}
