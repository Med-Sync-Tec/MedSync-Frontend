/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
      extend: {
          colors: {
              primary: "#3b82f6", 
              "primary-hover": "#2563eb",
              "background-light": "#ffffff",
              "background-dark": "#0f172a", 
              "text-light": "#1f2937",
              "text-dark": "#f9fafb",
          },
          fontFamily: {
              sans: ["Inter", "sans-serif"],
          },
          borderRadius: {
              DEFAULT: "0.5rem",
              'xl': '1rem',
              '2xl': '1.5rem',
              '3xl': '2rem',
          },
      },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries'),
  ],
}
