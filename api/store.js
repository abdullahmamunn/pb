const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL;

const emptyStore = {
  saveQuestions() {
    return 0;
  },
  countByCategory() {
    return { categories: {}, total: 0 };
  },
  countByTopic() {
    return {};
  },
  practiceQuestions() {
    return [];
  },
};

const store = databaseUrl
  ? await import("./neon-store.js")
  : process.env.VERCEL === "1"
    ? emptyStore
    : await import("./sqlite-store.js");

export const questionsPersist = Boolean(databaseUrl) || process.env.VERCEL !== "1";
export const saveQuestions = store.saveQuestions;
export const countByCategory = store.countByCategory;
export const countByTopic = store.countByTopic;
export const practiceQuestions = store.practiceQuestions;
