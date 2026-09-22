export default function getNumber(value: unknown, defaultValue: number) {
  if (typeof value !== "string") {
    return defaultValue;
  }

  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? defaultValue : n;
}

