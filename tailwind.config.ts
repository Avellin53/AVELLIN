import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        linen: { DEFAULT: '#FAF7F2', surface: '#FCF9F4', card: '#FFFFFF', border: '#EDE7DC', pillBorder: '#E5DDD3', sand: '#FCF9F4' },
        terracotta: { DEFAULT: '#C8502E', dark: '#A73818', tint: '#FBF0EC' },
        ochre: { DEFAULT: '#D49B24', light: '#FFFDF9', border: 'rgba(212, 155, 36, 0.4)' },
        palm: { DEFAULT: '#446550', tint: '#EEF3F0' },
        charcoal: { DEFAULT: '#1A1A1A', secondary: '#66615C', tertiary: '#948D85' },
        warmgrey: { DEFAULT: '#6E6A63' }
      },
      fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'] },
      boxShadow: { soft: '0 4px 20px -2px rgba(45, 30, 20, 0.05)' },
      borderRadius: { card: '22px' }
    }
  },
  plugins: [],
};
export default config;
