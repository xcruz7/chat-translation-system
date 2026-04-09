module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 20px 60px rgba(15, 23, 42, 0.18)"
      },
      colors: {
        ink: "#0f172a",
        sand: "#f5efe6",
        clay: "#e7d4c1",
        ember: "#ff8a5b",
        ocean: "#3c8dbc",
        pine: "#0f766e"
      }
    }
  },
  plugins: []
};
