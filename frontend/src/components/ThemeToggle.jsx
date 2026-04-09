import { MoonStar, SunMedium } from "lucide-react";

const ThemeToggle = ({ theme, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="icon-button"
    aria-label="Toggle dark mode"
  >
    {theme === "dark" ? <SunMedium size={18} /> : <MoonStar size={18} />}
  </button>
);

export default ThemeToggle;
