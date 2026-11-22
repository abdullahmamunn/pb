import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DatabaseSync } from "node:sqlite";
import { packExplanation, unpackExplanation } from "./explain.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "data");
fs.mkdirSync(dir, { recursive: true });

const db = new DatabaseSync(path.join(dir, "questions.db"));
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    options TEXT NOT NULL,
    answer INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    parent_topic TEXT NOT NULL DEFAULT '',
    topic_label TEXT NOT NULL DEFAULT '',
    difficulty TEXT NOT NULL DEFAULT 'Medium',
    source TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS questions_dedupe ON questions(category, topic, question);
  CREATE TABLE IF NOT EXISTS written_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 5,
    style TEXT NOT NULL DEFAULT 'theory',
    category TEXT NOT NULL,
    topic TEXT NOT NULL,
    parent_topic TEXT NOT NULL DEFAULT '',
    topic_label TEXT NOT NULL DEFAULT '',
    difficulty TEXT NOT NULL DEFAULT 'Medium',
    source TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL
  );
  CREATE UNIQUE INDEX IF NOT EXISTS written_questions_dedupe ON written_questions(category, topic, question);
`);

const insertQuestion = db.prepare(`
  INSERT OR IGNORE INTO questions
    (question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const insertWritten = db.prepare(`
  INSERT OR IGNORE INTO written_questions
    (question, answer, marks, style, category, topic, parent_topic, topic_label, difficulty, source, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

export function saveQuestions(questions, meta) {
  const created = new Date().toISOString();
  let saved = 0;
  for (const item of questions) {
    const result = insertQuestion.run(
      item.question,
      JSON.stringify(item.options),
      item.answer,
      packExplanation(item),
      meta.category,
      meta.topic,
      meta.parentTopic || "",
      meta.topicLabel || "",
      item.difficulty || "Medium",
      meta.source || "",
      created,
    );
    saved += result.changes || 0;
  }
  return saved;
}

export function countByCategory() {
  const rows = db.prepare("SELECT category, COUNT(*) AS total FROM questions GROUP BY category").all();
  const categories = {};
  let total = 0;
  for (const row of rows) {
    categories[row.category] = row.total;
    total += row.total;
  }
  return { categories, total };
}

export function countByTopic() {
  const rows = db.prepare("SELECT category, topic, COUNT(*) AS total FROM questions GROUP BY category, topic").all();
  const counts = {};
  for (const row of rows) counts[`${row.category}:${row.topic}`] = row.total;
  return counts;
}

export function listCustomTopics() {
  const rows = db
    .prepare(
      `SELECT category, topic,
              COALESCE(NULLIF(MAX(topic_label), ''), topic) AS label,
              COUNT(*) AS total
       FROM questions
       WHERE topic LIKE 'custom-%'
       GROUP BY category, topic
       ORDER BY category ASC, label ASC`,
    )
    .all();
  return rows.map((row) => ({
    category: row.category,
    topic: row.topic,
    label: String(row.label || row.topic).replace(/^কাস্টম টপিক\s*→\s*/u, "").trim() || row.topic,
    count: row.total,
  }));
}

export function getCustomTopicLabel(category, topicId) {
  const row = db
    .prepare(
      `SELECT topic_label FROM questions
       WHERE category = ? AND topic = ?
       ORDER BY id DESC LIMIT 1`,
    )
    .get(category, topicId);
  if (!row?.topic_label) return "";
  return String(row.topic_label).replace(/^কাস্টম টপিক\s*→\s*/u, "").trim();
}

function mapQuestionRow(row) {
  const explained = unpackExplanation(row.explanation);
  return {
    question: row.question,
    options: JSON.parse(row.options),
    answer: row.answer,
    explanation: explained.explanation,
    optionExplanations: explained.optionExplanations,
    category: row.category,
    topic: row.topic,
    topicLabel: row.topic_label,
    difficulty: row.difficulty,
    source: row.source ? `সংরক্ষিত · ${row.source}` : "সংরক্ষিত প্রশ্ন",
  };
}

export function practiceQuestions(category, topicIds, limit) {
  if (!topicIds.length) return [];
  const marks = topicIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT question, options, answer, explanation, category, topic, topic_label, difficulty, source
       FROM questions
       WHERE category = ? AND topic IN (${marks})
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(category, ...topicIds, limit);
  return rows.map(mapQuestionRow);
}

export function browseQuestions(category, topicIds, limit = 500) {
  if (!topicIds.length) return [];
  const marks = topicIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT question, options, answer, explanation, category, topic, topic_label, difficulty, source
       FROM questions
       WHERE category = ? AND topic IN (${marks})
       ORDER BY topic_label ASC, id ASC
       LIMIT ?`,
    )
    .all(category, ...topicIds, limit);
  return rows.map(mapQuestionRow);
}

export function saveWrittenQuestions(questions, meta) {
  const created = new Date().toISOString();
  let saved = 0;
  for (const item of questions) {
    const result = insertWritten.run(
      item.question,
      item.answer,
      Number(item.marks) || 5,
      item.style || "theory",
      meta.category,
      meta.topic,
      meta.parentTopic || "",
      meta.topicLabel || "",
      item.difficulty || "Medium",
      meta.source || "",
      created,
    );
    saved += result.changes || 0;
  }
  return saved;
}

export function countWrittenByTopic() {
  const rows = db
    .prepare("SELECT category, topic, COUNT(*) AS total FROM written_questions GROUP BY category, topic")
    .all();
  const counts = {};
  for (const row of rows) counts[`${row.category}:${row.topic}`] = row.total;
  return counts;
}

export function practiceWrittenQuestions(category, topicIds, limit) {
  if (!topicIds.length) return [];
  const marks = topicIds.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT question, answer, marks, style, category, topic, topic_label, difficulty, source
       FROM written_questions
       WHERE category = ? AND topic IN (${marks})
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(category, ...topicIds, limit);
  return rows.map((row) => ({
    question: row.question,
    answer: row.answer,
    marks: row.marks,
    style: row.style,
    category: row.category,
    topic: row.topic,
    topicLabel: row.topic_label,
    difficulty: row.difficulty,
    source: row.source ? `Saved · ${row.source}` : "Saved written",
  }));
}

function toAdminMcq(row) {
  const explained = unpackExplanation(row.explanation);
  return {
    id: Number(row.id),
    kind: "mcq",
    question: row.question,
    options: JSON.parse(row.options),
    answer: Number(row.answer),
    explanation: explained.explanation,
    optionExplanations: explained.optionExplanations,
    category: row.category,
    topic: row.topic,
    parentTopic: row.parent_topic || "",
    topicLabel: row.topic_label || "",
    difficulty: row.difficulty,
    source: row.source || "",
    createdAt: row.created_at,
  };
}

function toAdminWritten(row) {
  return {
    id: Number(row.id),
    kind: "written",
    question: row.question,
    answer: row.answer,
    marks: Number(row.marks) || 5,
    style: row.style || "theory",
    category: row.category,
    topic: row.topic,
    parentTopic: row.parent_topic || "",
    topicLabel: row.topic_label || "",
    difficulty: row.difficulty,
    source: row.source || "",
    createdAt: row.created_at,
  };
}

export function adminListQuestions(kind, category, topicIds) {
  if (!topicIds.length) return [];
  const marks = topicIds.map(() => "?").join(", ");
  if (kind === "written") {
    return db
      .prepare(
        `SELECT id, question, answer, marks, style, category, topic, parent_topic, topic_label, difficulty, source, created_at
         FROM written_questions
         WHERE category = ? AND topic IN (${marks})
         ORDER BY id DESC
         LIMIT 500`,
      )
      .all(category, ...topicIds)
      .map(toAdminWritten);
  }
  return db
    .prepare(
      `SELECT id, question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at
       FROM questions
       WHERE category = ? AND topic IN (${marks})
       ORDER BY id DESC
       LIMIT 500`,
    )
    .all(category, ...topicIds)
    .map(toAdminMcq);
}

export function adminSaveQuestion(kind, item) {
  const id = Number(item.id);
  if (kind === "written") {
    if (Number.isInteger(id) && id > 0) {
      const result = db
        .prepare(
          `UPDATE written_questions
           SET question = ?, answer = ?, marks = ?, style = ?, category = ?, topic = ?, parent_topic = ?, topic_label = ?, difficulty = ?, source = ?
           WHERE id = ?`,
        )
        .run(
          item.question,
          item.answer,
          Number(item.marks) || 5,
          item.style || "theory",
          item.category,
          item.topic,
          item.parentTopic || "",
          item.topicLabel || "",
          item.difficulty || "Medium",
          item.source || "",
          id,
        );
      return { id, updated: result.changes || 0 };
    }
    const result = insertWritten.run(
      item.question,
      item.answer,
      Number(item.marks) || 5,
      item.style || "theory",
      item.category,
      item.topic,
      item.parentTopic || "",
      item.topicLabel || "",
      item.difficulty || "Medium",
      item.source || "",
      new Date().toISOString(),
    );
    return { id: result.changes ? Number(result.lastInsertRowid) : 0, updated: result.changes || 0 };
  }
  const explanation = packExplanation(item);
  const options = JSON.stringify(item.options);
  if (Number.isInteger(id) && id > 0) {
    const result = db
      .prepare(
        `UPDATE questions
         SET question = ?, options = ?, answer = ?, explanation = ?, category = ?, topic = ?, parent_topic = ?, topic_label = ?, difficulty = ?, source = ?
         WHERE id = ?`,
      )
      .run(
        item.question,
        options,
        item.answer,
        explanation,
        item.category,
        item.topic,
        item.parentTopic || "",
        item.topicLabel || "",
        item.difficulty || "Medium",
        item.source || "",
        id,
      );
    return { id, updated: result.changes || 0 };
  }
  const result = insertQuestion.run(
    item.question,
    options,
    item.answer,
    explanation,
    item.category,
    item.topic,
    item.parentTopic || "",
    item.topicLabel || "",
    item.difficulty || "Medium",
    item.source || "",
    new Date().toISOString(),
  );
  return { id: result.changes ? Number(result.lastInsertRowid) : 0, updated: result.changes || 0 };
}

export function adminDeleteQuestion(kind, id) {
  const table = kind === "written" ? "written_questions" : "questions";
  const result = db.prepare(`DELETE FROM ${table} WHERE id = ?`).run(id);
  return result.changes || 0;
}

const MCQ_ADMIN_COLUMNS = `id, question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at`;
const WRITTEN_ADMIN_COLUMNS = `id, question, answer, marks, style, category, topic, parent_topic, topic_label, difficulty, source, created_at`;

function likeTerm(query) {
  return `%${String(query || "").replace(/[%_\\]/g, "").trim()}%`;
}

export function adminSearchQuestions(kind, query) {
  const term = likeTerm(query);
  if (term === "%%") return [];
  if (kind === "written") {
    return db
      .prepare(
        `SELECT ${WRITTEN_ADMIN_COLUMNS}
         FROM written_questions
         WHERE question LIKE ?
         ORDER BY id DESC
         LIMIT 40`,
      )
      .all(term)
      .map(toAdminWritten);
  }
  return db
    .prepare(
      `SELECT ${MCQ_ADMIN_COLUMNS}
       FROM questions
       WHERE question LIKE ?
       ORDER BY id DESC
       LIMIT 40`,
    )
    .all(term)
    .map(toAdminMcq);
}

export function adminListMcqForReview() {
  return db
    .prepare(
      `SELECT ${MCQ_ADMIN_COLUMNS}
       FROM questions
       ORDER BY id DESC
       LIMIT 4000`,
    )
    .all()
    .map(toAdminMcq);
}

export function practiceWrittenByCategories(categories, limit) {
  if (!categories.length) return [];
  const marks = categories.map(() => "?").join(", ");
  const rows = db
    .prepare(
      `SELECT question, answer, marks, style, category, topic, topic_label, difficulty, source
       FROM written_questions
       WHERE category IN (${marks})
       ORDER BY RANDOM()
       LIMIT ?`,
    )
    .all(...categories, limit);
  return rows.map((row) => ({
    question: row.question,
    answer: row.answer,
    marks: row.marks,
    style: row.style,
    category: row.category,
    topic: row.topic,
    topicLabel: row.topic_label,
    difficulty: row.difficulty,
    source: row.source ? `Saved · ${row.source}` : "Saved written",
  }));
}
