export const downloadTextFile = (content, languageCode) => {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");

  anchor.href = url;
  anchor.download = `translation-${languageCode}-${timestamp}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
};
