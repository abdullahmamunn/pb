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
  saveWrittenQuestions() {
    return 0;
  },
  countWrittenByTopic() {
    return {};
  },
  practiceWrittenQuestions() {
    return [];
  },
  practiceWrittenByCategories() {
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
export const saveWrittenQuestions = store.saveWrittenQuestions;
export const countWrittenByTopic = store.countWrittenByTopic;
export const practiceWrittenQuestions = store.practiceWrittenQuestions;
export const practiceWrittenByCategories = store.practiceWrittenByCategories;
