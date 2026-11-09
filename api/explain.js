export function packExplanation(item) {
  const summary = String(item?.explanation || "").trim();
  const opts = Array.isArray(item?.optionExplanations)
    ? item.optionExplanations.map((value) => String(value || "").trim())
    : null;
  if (opts && opts.length === 4 && opts.every(Boolean)) {
    return JSON.stringify({ summary, options: opts });
  }
  return summary;
}

export function unpackExplanation(raw) {
  const text = String(raw || "");
  try {
    const parsed = JSON.parse(text);
    if (parsed && typeof parsed === "object" && Array.isArray(parsed.options) && parsed.options.length === 4) {
      return {
        explanation: String(parsed.summary || "").trim() || "ব্যাখ্যা পাওয়া যায়নি।",
        optionExplanations: parsed.options.map((value) => String(value || "").trim()),
      };
    }
  } catch {
    // plain text explanation from older rows
  }
  return {
    explanation: text || "ব্যাখ্যা পাওয়া যায়নি।",
    optionExplanations: null,
  };
}
