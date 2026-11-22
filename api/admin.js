import { createHmac, timingSafeEqual } from "node:crypto";
import { allTopicIds, TOPIC_TREE, topicScope, treeWithCounts } from "./topics.js";
import {
  adminDeleteQuestion,
  adminListQuestions,
  adminSaveQuestion,
  countByTopic,
  countWrittenByTopic,
  listCustomTopics,
} from "./store.js";

const CATEGORIES = Object.keys(TOPIC_TREE);

function sendJson(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(body));
}

function adminToken() {
  const password = process.env.ADMIN_PASSWORD || "";
  if (!password) return "";
  return createHmac("sha256", password).update("pb-admin-v1").digest("hex");
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ""));
  const b = Buffer.from(String(right || ""));
  if (!a.length || a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function authorized(req) {
  const header = String(req.headers?.authorization || "");
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return safeEqual(token, adminToken());
}

async function readBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string" && req.body.trim()) return JSON.parse(req.body);
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const text = Buffer.concat(chunks).toString("utf8").trim();
  return text ? JSON.parse(text) : {};
}

function readParam(req, name) {
  if (req.query && typeof req.query[name] === "string") return req.query[name];
  try {
    const url = new URL(req.url || "/", "http://localhost");
    return url.searchParams.get(name) || "";
  } catch {
    return "";
  }
}

function cleanText(value, max = 8000) {
  return String(value || "").trim().slice(0, max);
}

function normalizeDifficulty(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "easy" || text === "সহজ") return "Easy";
  if (text === "hard" || text === "কঠিন") return "Hard";
  return "Medium";
}

function normalizeKind(value) {
  return String(value || "").toLowerCase() === "written" ? "written" : "mcq";
}

function topicIdsFor(category, topicId) {
  if (!topicId || topicId === "all") return allTopicIds(category);
  if (topicId === "custom") return [];
  const scope = topicScope(category, topicId);
  if (scope?.ids?.length) return scope.ids;
  return [topicId];
}

function normalizeMcq(raw, fallback = {}) {
  const question = cleanText(raw.question, 4000);
  const options = Array.isArray(raw.options) ? raw.options.map((item) => cleanText(item, 500)) : [];
  const answer = Number(raw.answer);
  const category = CATEGORIES.includes(raw.category) ? raw.category : fallback.category;
  const topic = cleanText(raw.topic || fallback.topic, 48);
  if (!question || options.length !== 4 || options.some((item) => !item)) {
    throw new Error("MCQ তে প্রশ্ন এবং ৪টি অপশন লাগবে।");
  }
  if (!Number.isInteger(answer) || answer < 0 || answer > 3) {
    throw new Error("সঠিক উত্তর ০ থেকে ৩ এর মধ্যে হতে হবে।");
  }
  if (!CATEGORIES.includes(category) || !topic) throw new Error("বিষয় ও টপিক বেছে নিন।");
  const optionExplanations = Array.isArray(raw.optionExplanations)
    ? raw.optionExplanations.map((item) => cleanText(item, 500))
    : null;
  return {
    id: Number(raw.id) || 0,
    question,
    options,
    answer,
    explanation: cleanText(raw.explanation, 4000),
    optionExplanations: optionExplanations && optionExplanations.length === 4 ? optionExplanations : null,
    category,
    topic,
    parentTopic: cleanText(raw.parentTopic || fallback.parentTopic, 48),
    topicLabel: cleanText(raw.topicLabel || fallback.topicLabel, 180),
    difficulty: normalizeDifficulty(raw.difficulty),
    source: cleanText(raw.source || fallback.source || "admin", 120),
  };
}

function normalizeWritten(raw, fallback = {}) {
  const question = cleanText(raw.question, 8000);
  const answer = cleanText(raw.answer, 8000);
  const category = CATEGORIES.includes(raw.category) ? raw.category : fallback.category;
  const topic = cleanText(raw.topic || fallback.topic, 48);
  if (question.length < 8 || answer.length < 8) throw new Error("লিখিত প্রশ্ন ও উত্তর দুটোই লাগবে।");
  if (!CATEGORIES.includes(category) || !topic) throw new Error("বিষয় ও টপিক বেছে নিন।");
  const marks = Number(raw.marks);
  return {
    id: Number(raw.id) || 0,
    question,
    answer,
    marks: Number.isInteger(marks) && marks >= 1 && marks <= 20 ? marks : 5,
    style: cleanText(raw.style || "theory", 40) || "theory",
    category,
    topic,
    parentTopic: cleanText(raw.parentTopic || fallback.parentTopic, 48),
    topicLabel: cleanText(raw.topicLabel || fallback.topicLabel, 180),
    difficulty: normalizeDifficulty(raw.difficulty),
    source: cleanText(raw.source || fallback.source || "admin", 120),
  };
}

export default async function handler(req, res) {
  const action = String(readParam(req, "action") || "").trim();

  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.end();
    return;
  }

  if (!process.env.ADMIN_PASSWORD) {
    sendJson(res, 503, { error: "ADMIN_PASSWORD সেট করা নেই।" });
    return;
  }

  if (action === "login") {
    if (req.method !== "POST") {
      sendJson(res, 405, { error: "POST দরকার।" });
      return;
    }
    let body = {};
    try {
      body = await readBody(req);
    } catch {
      sendJson(res, 400, { error: "JSON পড়া যায়নি।" });
      return;
    }
    const given = createHmac("sha256", String(body.password || "")).update("pb-admin-v1").digest("hex");
    if (!safeEqual(given, adminToken())) {
      sendJson(res, 401, { error: "পাসওয়ার্ড ভুল।" });
      return;
    }
    sendJson(res, 200, { token: adminToken() });
    return;
  }

  if (!authorized(req)) {
    sendJson(res, 401, { error: "অ্যাডমিন লগইন দরকার।" });
    return;
  }

  try {
    if (action === "outline" && req.method === "GET") {
      const [mcqCounts, writtenCounts, customTopics] = await Promise.all([
        countByTopic(),
        countWrittenByTopic(),
        listCustomTopics(),
      ]);
      sendJson(res, 200, {
        categories: CATEGORIES,
        mcq: treeWithCounts(mcqCounts, customTopics),
        written: treeWithCounts(writtenCounts, []),
      });
      return;
    }

    if (action === "list" && req.method === "GET") {
      const kind = normalizeKind(readParam(req, "kind"));
      const category = String(readParam(req, "category") || "");
      const topic = String(readParam(req, "topic") || "");
      if (!CATEGORIES.includes(category)) {
        sendJson(res, 400, { error: "বিষয় বেছে নিন।" });
        return;
      }
      let ids = topicIdsFor(category, topic);
      if (topic === "custom") {
        const custom = await listCustomTopics();
        ids = custom.filter((item) => item.category === category).map((item) => item.topic);
      }
      const questions = await adminListQuestions(kind, category, ids);
      sendJson(res, 200, { questions });
      return;
    }

    if (action === "save" && req.method === "POST") {
      const body = await readBody(req);
      const kind = normalizeKind(body.kind);
      const item = kind === "written" ? normalizeWritten(body) : normalizeMcq(body);
      const saved = await adminSaveQuestion(kind, item);
      if (!saved.updated) {
        sendJson(res, 409, { error: "এই প্রশ্ন আগে থেকেই আছে, অথবা সেভ হয়নি।" });
        return;
      }
      sendJson(res, 200, saved);
      return;
    }

    if (action === "delete" && req.method === "POST") {
      const body = await readBody(req);
      const id = Number(body.id);
      if (!Number.isInteger(id) || id <= 0) {
        sendJson(res, 400, { error: "প্রশ্ন আইডি নেই।" });
        return;
      }
      const removed = await adminDeleteQuestion(normalizeKind(body.kind), id);
      sendJson(res, 200, { removed });
      return;
    }

    if (action === "import" && req.method === "POST") {
      const body = await readBody(req);
      const kind = normalizeKind(body.kind);
      const list = Array.isArray(body.questions) ? body.questions : [];
      if (!list.length) {
        sendJson(res, 400, { error: "ইমপোর্টের জন্য questions অ্যারে দিন।" });
        return;
      }
      const fallback = {
        category: body.category,
        topic: body.topic,
        parentTopic: body.parentTopic || "",
        topicLabel: body.topicLabel || "",
        source: body.source || "import",
      };
      let saved = 0;
      let skipped = 0;
      const errors = [];
      for (const raw of list.slice(0, 200)) {
        try {
          const item = kind === "written" ? normalizeWritten(raw, fallback) : normalizeMcq(raw, fallback);
          const result = await adminSaveQuestion(kind, item);
          if (result.updated) saved += 1;
          else skipped += 1;
        } catch (error) {
          skipped += 1;
          if (errors.length < 5) errors.push(error.message);
        }
      }
      sendJson(res, 200, { saved, skipped, errors });
      return;
    }

    sendJson(res, 400, { error: "অজানা অ্যাডমিন অ্যাকশন।" });
  } catch (error) {
    console.error("Admin failed:", error);
    sendJson(res, 400, { error: error.message || "অ্যাডমিন রিকোয়েস্ট ব্যর্থ।" });
  }
}
