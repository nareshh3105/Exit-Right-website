import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#eefcf6",
          100: "#d4f6e6",
          500: "#1f9f6f",
          700: "#0f6144",
          900: "#083a2a",
        },
      },
      boxShadow: {
        soft: "0 8px 30px rgba(5, 35, 25, 0.12)",
      },
    },
  },
  plugins: [],
};

export default config;
