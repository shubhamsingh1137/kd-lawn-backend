function normalizeText(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^\w\s₹]/gi, " ")
    .replace(/\s+/g, " ");
}

module.exports = {
  normalizeText
};