const persistent = process.env.VERCEL !== "1";

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

const store = persistent ? await import("./sqlite-store.js") : emptyStore;

export const questionsPersist = persistent;
export const saveQuestions = store.saveQuestions;
export const countByCategory = store.countByCategory;
export const countByTopic = store.countByTopic;
export const practiceQuestions = store.practiceQuestions;
