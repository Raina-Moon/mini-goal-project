import type { Config } from 'tailwindcss';

const config: Config = {
    content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          100: "#D6F5E8",
          200: "#A3EBCB",
          300: "#70E0AE",
          400: "#3DD591",
          500: "#1EBD7B",
          600: "#1A9C67",
          700: "#167C53",
          800: "#125D3F",
          900: "#0E3D2A",
        },
        gray: {
          100: "#F9FAFB",
          200: "#F3F4F6",
          300: "#E5E7EB",
          400: "#D1D5DB",
          500: "#9CA3AF",
          600: "#6B7280",
          700: "#4B5563",
          800: "#374151",
          900: "#111827",
        },
      },
    },
  },
  plugins: [],
} 

export default config;