export const useFileTitle = (fileName: string): string => {
  if (!fileName) return "Unknown Title";

  return fileName
    .replace(".mid", "")
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};
