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
