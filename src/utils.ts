
export function toUpperFirst(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function limitString(s: string, limit: number) {
  return s.length > limit ? s.slice(0, limit) + '...' : s
}
