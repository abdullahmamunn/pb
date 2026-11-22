const BENGALI_DIGITS = "০১২৩৪৫৬৭৮৯";

function foldDigits(text) {
  return String(text || "").replace(/[০-৯]/g, (ch) => {
    const index = BENGALI_DIGITS.indexOf(ch);
    return index >= 0 ? String(index) : ch;
  });
}

function normalizeOption(text) {
  return foldDigits(text)
    .replace(/\s+/g, " ")
    .replace(/[।.,;:]+$/g, "")
    .trim()
    .toLowerCase();
}

function conclusionNumber(explanation) {
  const folded = foldDigits(explanation);
  const matches = [...folded.matchAll(/=\s*(\d+(?:\.\d+)?)/g)];
  if (!matches.length) return "";
  return matches[matches.length - 1][1].replace(/\.0+$/, "");
}

function numberTokens(text) {
  return [...foldDigits(text).matchAll(/\d+(?:\.\d+)?/g)].map((match) => match[0].replace(/\.0+$/, ""));
}

export function auditMcq(item) {
  const issues = [];
  const options = Array.isArray(item?.options) ? item.options.map((option) => String(option || "")) : [];
  const answer = Number(item?.answer);
  const folded = options.map(normalizeOption);
  const seen = new Map();
  folded.forEach((value, index) => {
    if (!value) return;
    if (seen.has(value)) {
      issues.push({
        code: "duplicate",
        message: `একই অপশন দুইবার আছে (${seen.get(value) + 1} ও ${index + 1})`,
      });
    } else {
      seen.set(value, index);
    }
  });

  const conclusion = conclusionNumber(item?.explanation);
  if (conclusion && Number.isInteger(answer) && answer >= 0 && answer < options.length) {
    const hits = options
      .map((option, index) => (numberTokens(option).includes(conclusion) ? index : -1))
      .filter((index) => index >= 0);
    if (hits.length && !hits.includes(answer)) {
      issues.push({
        code: "mismatch",
        message: `ব্যাখ্যা শেষ হয়েছে ${conclusion} দিয়ে, সঠিক অপশনে এই সংখ্যা নেই`,
      });
    }
  }
  return issues;
}
