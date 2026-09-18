export function baseSource(sourceName) {
  return sourceName.split(" - ")[0];
}

const DIGEST_COLORS = ["#dc2626", "#16a34a", "#7c3aed", "#d97706", "#2563eb"];

export function digestColor(index) {
  return DIGEST_COLORS[index % DIGEST_COLORS.length];
}
