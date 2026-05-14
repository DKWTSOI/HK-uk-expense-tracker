import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: {
          bg:      '#faf6ef',
          DEFAULT: '#fffaf2',
          2:       '#f3ece0',
        },
        cream: {
          2: '#efe7d8',
          3: '#e3d9c5',
        },
        ink: {
          DEFAULT: '#2a2218',
          70:      '#4a3f30',
          60:      '#5e5443',
          50:      '#7c715f',
          40:      '#a39782',
          30:      '#c2b6a0',
        },
        accent: {
          DEFAULT: '#3f6b54',
          deep:    '#2a4a3a',
        },
        sage: {
          DEFAULT: '#5e8a6a',
          bg:      '#e8efe5',
        },
        rose: {
          DEFAULT: '#b25467',
          bg:      '#f3e1e3',
        },
      },
      borderRadius: {
        squircle: '22px',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: '0 1px 0 rgba(60,40,20,0.04), 0 6px 18px -10px rgba(60,40,20,0.10)',
      },
    },
  },
  plugins: [],
};
export default config;
