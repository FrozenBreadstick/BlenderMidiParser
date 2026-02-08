export const useFileDate = (timestamp: number): string => {
  const date = new Date(timestamp);

  // Returns format like: 08/05/26 (depending on locale)
  return date.toLocaleDateString(undefined, {
    year: "2-digit",
    month: "2-digit",
    day: "2-digit",
  });
};
