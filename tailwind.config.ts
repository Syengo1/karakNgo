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
        // The New "Sand & Sprout" Theme
        crack: {
          // Mapping the Green to 'orange' ensures main buttons use it
          orange: "#9ede80", 
          // Your Text Color
          black: "#4b3621",  
          // Your Background Color
          cream: "#d7ebcc",  
          // Mapping Green to 'sage' for badges/accents
          sage: "#a3e37d",   
          // Complementary Gold (kept standard or adjusted slightly)
          gold: "#F2CC8F",   
        },
        // Semantic aliases
        paper: "#eae7e0",
        ink: "#b58d69",
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-dm-sans)", "sans-serif"],
        marker: ["var(--font-marker)", "cursive"],
      },
      backgroundImage: {
        // Adjusted glass effect to match the new sand tone
        'glass': "linear-gradient(135deg, rgba(234, 231, 224, 0.6), rgba(255, 255, 255, 0.2))",
      },
    },
  },
  plugins: [],
};
export default config;