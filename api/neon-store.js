import { neon } from "@neondatabase/serverless";
import { packExplanation, unpackExplanation } from "./explain.js";

const sql = neon(process.env.DATABASE_URL || process.env.POSTGRES_URL);

let ready;

function ensureSchema() {
  ready ??= (async () => {
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS questions_dedupe
      ON questions (category, topic, md5(question))
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS written_questions (
        id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS written_questions_dedupe
      ON written_questions (category, topic, md5(question))
    `;
  })();
  return ready;
}

function toPublic(row) {
  const explained = unpackExplanation(row.explanation);
  return {
    question: row.question,
    options: JSON.parse(row.options),
    answer: Number(row.answer),
    explanation: explained.explanation,
    optionExplanations: explained.optionExplanations,
    category: row.category,
    topic: row.topic,
    topicLabel: row.topic_label,
    difficulty: row.difficulty,
    source: row.source ? `সংরক্ষিত · ${row.source}` : "সংরক্ষিত প্রশ্ন",
  };
}

export async function saveQuestions(questions, meta) {
  await ensureSchema();
  const created = new Date().toISOString();
  let saved = 0;
  for (const item of questions) {
    const rows = await sql`
      INSERT INTO questions
        (question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at)
      VALUES (
        ${item.question},
        ${JSON.stringify(item.options)},
        ${item.answer},
        ${packExplanation(item)},
        ${meta.category},
        ${meta.topic},
        ${meta.parentTopic || ""},
        ${meta.topicLabel || ""},
        ${item.difficulty || "Medium"},
        ${meta.source || ""},
        ${created}
      )
      ON CONFLICT (category, topic, md5(question)) DO NOTHING
      RETURNING id
    `;
    saved += rows.length;
  }
  return saved;
}

export async function countByCategory() {
  await ensureSchema();
  const rows = await sql`SELECT category, COUNT(*)::int AS total FROM questions GROUP BY category`;
  const categories = {};
  let total = 0;
  for (const row of rows) {
    categories[row.category] = Number(row.total);
    total += Number(row.total);
  }
  return { categories, total };
}

export async function countByTopic() {
  await ensureSchema();
  const rows = await sql`SELECT category, topic, COUNT(*)::int AS total FROM questions GROUP BY category, topic`;
  const counts = {};
  for (const row of rows) counts[`${row.category}:${row.topic}`] = Number(row.total);
  return counts;
}

export async function listCustomTopics() {
  await ensureSchema();
  const rows = await sql`
    SELECT category, topic,
           COALESCE(NULLIF(MAX(topic_label), ''), topic) AS label,
           COUNT(*)::int AS total
    FROM questions
    WHERE topic LIKE 'custom-%'
    GROUP BY category, topic
    ORDER BY category ASC, label ASC
  `;
  return rows.map((row) => ({
    category: row.category,
    topic: row.topic,
    label: String(row.label || row.topic).replace(/^কাস্টম টপিক\s*→\s*/u, "").trim() || row.topic,
    count: Number(row.total),
  }));
}

export async function getCustomTopicLabel(category, topicId) {
  await ensureSchema();
  const rows = await sql`
    SELECT topic_label
    FROM questions
    WHERE category = ${category} AND topic = ${topicId}
    ORDER BY id DESC
    LIMIT 1
  `;
  const label = rows[0]?.topic_label;
  if (!label) return "";
  return String(label).replace(/^কাস্টম টপিক\s*→\s*/u, "").trim();
}

export async function practiceQuestions(category, topicIds, limit) {
  await ensureSchema();
  if (!topicIds.length) return [];
  const rows = await sql`
    SELECT question, options, answer, explanation, category, topic, topic_label, difficulty, source
    FROM questions
    WHERE category = ${category} AND topic = ANY(${topicIds})
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
  return rows.map(toPublic);
}

export async function browseQuestions(category, topicIds, limit = 500) {
  await ensureSchema();
  if (!topicIds.length) return [];
  const rows = await sql`
    SELECT question, options, answer, explanation, category, topic, topic_label, difficulty, source
    FROM questions
    WHERE category = ${category} AND topic = ANY(${topicIds})
    ORDER BY topic_label ASC, id ASC
    LIMIT ${limit}
  `;
  return rows.map(toPublic);
}

function toWrittenPublic(row) {
  return {
    question: row.question,
    answer: row.answer,
    marks: Number(row.marks) || 5,
    style: row.style || "theory",
    category: row.category,
    topic: row.topic,
    topicLabel: row.topic_label,
    difficulty: row.difficulty,
    source: row.source ? `Saved · ${row.source}` : "Saved written",
  };
}

export async function saveWrittenQuestions(questions, meta) {
  await ensureSchema();
  const created = new Date().toISOString();
  let saved = 0;
  for (const item of questions) {
    const rows = await sql`
      INSERT INTO written_questions
        (question, answer, marks, style, category, topic, parent_topic, topic_label, difficulty, source, created_at)
      VALUES (
        ${item.question},
        ${item.answer},
        ${Number(item.marks) || 5},
        ${item.style || "theory"},
        ${meta.category},
        ${meta.topic},
        ${meta.parentTopic || ""},
        ${meta.topicLabel || ""},
        ${item.difficulty || "Medium"},
        ${meta.source || ""},
        ${created}
      )
      ON CONFLICT (category, topic, md5(question)) DO NOTHING
      RETURNING id
    `;
    saved += rows.length;
  }
  return saved;
}

export async function countWrittenByTopic() {
  await ensureSchema();
  const rows = await sql`
    SELECT category, topic, COUNT(*)::int AS total
    FROM written_questions
    GROUP BY category, topic
  `;
  const counts = {};
  for (const row of rows) counts[`${row.category}:${row.topic}`] = Number(row.total);
  return counts;
}

export async function practiceWrittenQuestions(category, topicIds, limit) {
  await ensureSchema();
  if (!topicIds.length) return [];
  const rows = await sql`
    SELECT question, answer, marks, style, category, topic, topic_label, difficulty, source
    FROM written_questions
    WHERE category = ${category} AND topic = ANY(${topicIds})
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
  return rows.map(toWrittenPublic);
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

export async function adminListQuestions(kind, category, topicIds) {
  await ensureSchema();
  if (!topicIds.length) return [];
  if (kind === "written") {
    const rows = await sql`
      SELECT id, question, answer, marks, style, category, topic, parent_topic, topic_label, difficulty, source, created_at
      FROM written_questions
      WHERE category = ${category} AND topic = ANY(${topicIds})
      ORDER BY id DESC
      LIMIT 500
    `;
    return rows.map(toAdminWritten);
  }
  const rows = await sql`
    SELECT id, question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at
    FROM questions
    WHERE category = ${category} AND topic = ANY(${topicIds})
    ORDER BY id DESC
    LIMIT 500
  `;
  return rows.map(toAdminMcq);
}

export async function adminSaveQuestion(kind, item) {
  await ensureSchema();
  const id = Number(item.id);
  if (kind === "written") {
    if (Number.isInteger(id) && id > 0) {
      const rows = await sql`
        UPDATE written_questions
        SET question = ${item.question},
            answer = ${item.answer},
            marks = ${Number(item.marks) || 5},
            style = ${item.style || "theory"},
            category = ${item.category},
            topic = ${item.topic},
            parent_topic = ${item.parentTopic || ""},
            topic_label = ${item.topicLabel || ""},
            difficulty = ${item.difficulty || "Medium"},
            source = ${item.source || ""}
        WHERE id = ${id}
        RETURNING id
      `;
      return { id, updated: rows.length };
    }
    const rows = await sql`
      INSERT INTO written_questions
        (question, answer, marks, style, category, topic, parent_topic, topic_label, difficulty, source, created_at)
      VALUES (
        ${item.question},
        ${item.answer},
        ${Number(item.marks) || 5},
        ${item.style || "theory"},
        ${item.category},
        ${item.topic},
        ${item.parentTopic || ""},
        ${item.topicLabel || ""},
        ${item.difficulty || "Medium"},
        ${item.source || ""},
        ${new Date().toISOString()}
      )
      ON CONFLICT (category, topic, md5(question)) DO NOTHING
      RETURNING id
    `;
    return { id: Number(rows[0]?.id || 0), updated: rows.length };
  }
  const explanation = packExplanation(item);
  const options = JSON.stringify(item.options);
  if (Number.isInteger(id) && id > 0) {
    const rows = await sql`
      UPDATE questions
      SET question = ${item.question},
          options = ${options},
          answer = ${item.answer},
          explanation = ${explanation},
          category = ${item.category},
          topic = ${item.topic},
          parent_topic = ${item.parentTopic || ""},
          topic_label = ${item.topicLabel || ""},
          difficulty = ${item.difficulty || "Medium"},
          source = ${item.source || ""}
      WHERE id = ${id}
      RETURNING id
    `;
    return { id, updated: rows.length };
  }
  const rows = await sql`
    INSERT INTO questions
      (question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at)
    VALUES (
      ${item.question},
      ${options},
      ${item.answer},
      ${explanation},
      ${item.category},
      ${item.topic},
      ${item.parentTopic || ""},
      ${item.topicLabel || ""},
      ${item.difficulty || "Medium"},
      ${item.source || ""},
      ${new Date().toISOString()}
    )
    ON CONFLICT (category, topic, md5(question)) DO NOTHING
    RETURNING id
  `;
  return { id: Number(rows[0]?.id || 0), updated: rows.length };
}

export async function adminDeleteQuestion(kind, id) {
  await ensureSchema();
  const rows =
    kind === "written"
      ? await sql`DELETE FROM written_questions WHERE id = ${id} RETURNING id`
      : await sql`DELETE FROM questions WHERE id = ${id} RETURNING id`;
  return rows.length;
}

function likeTerm(query) {
  return `%${String(query || "").replace(/[%_\\]/g, "").trim()}%`;
}

export async function adminSearchQuestions(kind, query) {
  await ensureSchema();
  const term = likeTerm(query);
  if (term === "%%") return [];
  if (kind === "written") {
    const rows = await sql`
      SELECT id, question, answer, marks, style, category, topic, parent_topic, topic_label, difficulty, source, created_at
      FROM written_questions
      WHERE question ILIKE ${term}
      ORDER BY id DESC
      LIMIT 40
    `;
    return rows.map(toAdminWritten);
  }
  const rows = await sql`
    SELECT id, question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at
    FROM questions
    WHERE question ILIKE ${term}
    ORDER BY id DESC
    LIMIT 40
  `;
  return rows.map(toAdminMcq);
}

export async function adminListMcqForReview() {
  await ensureSchema();
  const rows = await sql`
    SELECT id, question, options, answer, explanation, category, topic, parent_topic, topic_label, difficulty, source, created_at
    FROM questions
    ORDER BY id DESC
    LIMIT 4000
  `;
  return rows.map(toAdminMcq);
}

export async function practiceWrittenByCategories(categories, limit) {
  await ensureSchema();
  if (!categories.length) return [];
  const rows = await sql`
    SELECT question, answer, marks, style, category, topic, topic_label, difficulty, source
    FROM written_questions
    WHERE category = ANY(${categories})
    ORDER BY RANDOM()
    LIMIT ${limit}
  `;
  return rows.map(toWrittenPublic);
}
