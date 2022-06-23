interface RegexOptions {
  i?: boolean;
  g?: boolean;
  exactMatch?: boolean;
}

export function createRegex(
  text: string,
  { i = false, g = false, exactMatch = false }: RegexOptions = {},
): RegExp {
  let regexOptions = "";
  if (i) regexOptions += "i";
  if (g) regexOptions += "g";
  const normalizedText = text.replace(/([/\\^$+*.|\-()<>[\]])/g, "\\$1");
  const regexText = exactMatch ? `^${normalizedText}$` : normalizedText;
  return new RegExp(regexText, regexOptions);
}
