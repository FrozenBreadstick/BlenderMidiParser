export const useFileType = (type: string): string => {
  if (!type) return "midi"; // Default fallback for MIDI files

  // Splits 'audio/midi' and returns 'midi'
  return type.split("/").pop() || type;
};
