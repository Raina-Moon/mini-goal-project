import React from "react";
import clsx from "clsx";

type ButtonProps = {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  className?: string;
};

const baseStyles = "rounded-[100px] font-medium text-sm";

const variantStyles = {
  primary: "bg-primary-500 text-white hover:bg-primary-700",
  secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
  outline: "border border-gray-300 text-gray-800 hover:bg-gray-300 hover:text-gray-800",
};

const sizeStyles = {
  sm: "px-3 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-5 py-3 text-lg",
};

const GlobalButton: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={clsx(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {loading ? "Loading..." : children}
    </button>
  );
};

export default GlobalButton;
