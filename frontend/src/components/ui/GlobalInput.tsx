import React from "react";
import clsx from "clsx";

type InputProps = {
  label?: string;
  type?: string;
  name?: string;
  value?: string;
  placeholder?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
};

const Input: React.FC<InputProps> = ({
  label,
  type = "text",
  name,
  value,
  placeholder,
  onChange,
  error,
  disabled = false,
  className = "",
}) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "w-full px-4 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 transition",
          error ? "border-red-500" : "border-gray-300",
          disabled && "bg-gray-100 cursor-not-allowed",
          className
        )}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default Input;
