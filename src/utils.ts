import { ethers } from "ethers";

export function toUpperFirst(s: string) {
  if (!s || s.length === 0) return s
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function limitString(s: string, limit: number) {
  return s.length > limit ? s.slice(0, limit) + '...' : s
}

export const backgroundDistinctFrom = (parentBackground1: number, salt: number, parentBackground2: number | null = null) => {
  const MIN_VALUE = 210;
  const DISTANCE = 10;

  // Compute the hash
  const hash = ethers.utils.keccak256(ethers.utils.defaultAbiCoder.encode(['uint256', 'string'], [parentBackground1, salt]));

  // Calculate a deterministic yet distinct value from the hash
  let colorValue = parseInt(hash.slice(2, 10), 16) % (256 - MIN_VALUE) + MIN_VALUE;

  // Ensure the color is distinct from the parent colors
  while (Math.abs(colorValue - parentBackground1) < DISTANCE || 
        (parentBackground2 !== null && Math.abs(colorValue - parentBackground2) < DISTANCE)) {
    colorValue = colorValue + DISTANCE;
    if (colorValue > 255) {
      colorValue = colorValue - 255 + MIN_VALUE;
    }
  }

  return colorValue;
}

export function decodeInputAddress(input?: string): { address: string, selected?: string } {
  if (!input) return { address: '' }
  if (!input.includes('#')) return { address: input }
  const [address, selected] = input.split('#');
  return { address, selected };
}

export function encodeInputAddress(address: string, selected?: string) {
  return selected ? `${address}#${selected}` : address;
}
