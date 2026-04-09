const LanguageSelect = ({
  id,
  value,
  onChange,
  languages,
  allowAuto = false
}) => (
  <select
    id={id}
    value={value}
    onChange={(event) => onChange(event.target.value)}
    className="w-full rounded-2xl border border-white/40 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-800 outline-none transition focus:border-amber-300 dark:border-slate-700 dark:bg-slate-950/70 dark:text-slate-100"
  >
    {languages
      .filter((language) => allowAuto || language.code !== "auto")
      .map((language) => (
        <option key={language.code} value={language.code}>
          {language.name} {language.nativeName !== language.name ? `· ${language.nativeName}` : ""}
        </option>
      ))}
  </select>
);

export default LanguageSelect;
