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
      },
    },
  },
  plugins: [],
} 

export default config;