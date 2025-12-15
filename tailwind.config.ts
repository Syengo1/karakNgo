import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // The Karak Brand Colors
        karak: {
          orange: "#E07A5F", // Terracotta
          black: "#3D405B",  // Soft Charcoal (Text)
          cream: "#F4F1DE",  // Oatmeal (Background)
          sage: "#81B29A",   // Matcha/Vegan accent
          gold: "#F2CC8F",   // Highlights/Stars
        },
        // Semantic aliases
        paper: "#F4F1DE",
        ink: "#3D405B",
      },
      fontFamily: {
        // We will configure these in the next step
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
      },
      backgroundImage: {
        'glass': "linear-gradient(135deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.1))",
      },
    },
  },
  plugins: [],
};
export default config;