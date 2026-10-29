import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        studio: {
          white: "#FFFFFF",
          porcelain: "#FAFAFA",
          canvas: "#F8F9FA",
          hover: "#F4F4F5",
          border: "#E4E4E7",
          borderSoft: "#F1F1F3",
          borderHover: "#D4D4D8",
          borderActive: "#A1A1AA",
          muted: "#71717A",
          subtle: "#52525B",
          obsidian: "#09090B",
          obsidianHover: "#27272A",
        },
      },
      boxShadow: {
        "studio-tight": "0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "studio-btn": "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        "studio-hover": "0 4px 12px 0 rgba(0, 0, 0, 0.08)",
        "studio-chip": "0 2px 6px -1px rgba(0, 0, 0, 0.04)",
        "studio-menu": "0 10px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
      },
      transitionTimingFunction: {
        "studio-squash": "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
} satisfies Config;
