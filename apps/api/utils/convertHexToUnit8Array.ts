export function convertHexToUnit8Array(hex: string): Uint8Array {
  // Making sure it's a valid hex first (hex strings must be divisible by 2)
  if (hex.length === 0 || hex.length % 2 !== 0 || !hex.match(/^[\da-fA-F]+$/))
    throw new Error(`The string "${hex}" is not valid hex.`);

  return new Uint8Array(
    hex.match(/.{1,2}/g)!.map((byte: string) => parseInt(byte, 16)),
  );
}
