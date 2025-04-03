import React from "react";
import clsx from "clsx";

type InputProps = {
  id?: string;
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

const GlobalInput: React.FC<InputProps> = ({
  label,
  id,
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
        <label htmlFor={name} className="text-sm text-gray-900 text-left pl-1">
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        disabled={disabled}
        className={clsx(
          "w-full px-2 py-2 border rounded-md text-sm focus:border-primary-600 focus:outline-none",
          error ? "border-red-500" : "border-primary-400",
          disabled && "border-gray-300 cursor-not-allowed",
          className
        )}
      />
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
};

export default GlobalInput;
