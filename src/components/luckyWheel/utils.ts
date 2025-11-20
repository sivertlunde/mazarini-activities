export const capitalizeAndCut = (str: string) =>
  str.charAt(0).toUpperCase() +
  str.slice(1, Math.min(str.length, 15)) +
  (str.length > 15 ? '...' : '');

export const capitalize = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);
