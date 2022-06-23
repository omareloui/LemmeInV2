export function convertUnit8ArrayToHex(unit8array: Uint8Array) {
  return [...unit8array].map(x => x.toString(16).padStart(2, "0")).join("");
}
