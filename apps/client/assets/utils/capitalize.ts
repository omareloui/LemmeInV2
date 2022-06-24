export default function capitalize(str: string) {
  return str.replace(/\b[a-z]/g, v => v.toUpperCase());
}
