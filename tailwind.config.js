/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        card: "0 6px 20px rgba(0,0,0,.25)",
      },
      colors: {
        ink: "#e8edf6",
        muted: "#97a3b6",
        bg: "#0b0e14",
        bg2: "#101522",
        panel: "#151b2b",
        stroke: "#232b3d",
        accent: "#7cc1ff",
        accent2: "#00d49f",
      },
      borderRadius: {
        xl2: "14px",
      },
    },
  },
  plugins: [],
}
