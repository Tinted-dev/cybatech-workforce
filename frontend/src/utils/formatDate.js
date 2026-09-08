export function toLocalDate(utcString) {
  return new Date(utcString + "Z")
}
