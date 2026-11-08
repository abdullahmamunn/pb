export const TOPIC_TREE = {
  bangla: [
    {
      id: "sahitto",
      label: "সাহিত্য",
      children: [
        { id: "nazrul", label: "কাজী নজরুল ইসলাম" },
        { id: "rabindranath", label: "রবীন্দ্রনাথ ঠাকুর" },
        { id: "jasimuddin", label: "জসীমউদ্‌দীন" },
        { id: "modern-lit", label: "আধুনিক সাহিত্য" },
        { id: "medieval-lit", label: "প্রাচীন ও মধ্যযুগ" },
      ],
    },
    {
      id: "byakoron",
      label: "ব্যাকরণ",
      children: [
        { id: "synonym", label: "সমার্থক শব্দ" },
        { id: "antonym", label: "বিপরীতার্থক শব্দ" },
        { id: "sandhi", label: "সন্ধি" },
        { id: "samas", label: "সমাস" },
        { id: "idiom-bn", label: "বাগ্ধারা" },
        { id: "oneword", label: "এক কথায় প্রকাশ" },
      ],
    },
  ],
  english: [
    {
      id: "vocabulary",
      label: "Vocabulary",
      children: [
        { id: "en-synonym", label: "Synonyms" },
        { id: "en-antonym", label: "Antonyms" },
      ],
    },
    {
      id: "grammar",
      label: "Grammar",
      children: [
        { id: "tense", label: "Tense" },
        { id: "article", label: "Article" },
        { id: "preposition", label: "Preposition" },
        { id: "voice", label: "Voice" },
        { id: "narration", label: "Narration" },
        { id: "conditional", label: "Conditional" },
      ],
    },
    { id: "en-idiom", label: "Idioms and phrases" },
  ],
  math: [
    {
      id: "arithmetic",
      label: "পাটিগণিত",
      children: [
        { id: "lcm", label: "ল.সা.গু. ও গ.সা.গু." },
        { id: "percent", label: "শতকরা, লাভ ও ক্ষতি" },
        { id: "ratio", label: "অনুপাত" },
        { id: "average", label: "গড়" },
        { id: "unitary", label: "ঐকিক নিয়ম" },
        { id: "work", label: "সময় ও কাজ" },
      ],
    },
    {
      id: "mental",
      label: "মেন্টাল অ্যাবিলিটি",
      children: [
        { id: "series", label: "সংখ্যা ধারা" },
        { id: "reasoning", label: "যুক্তি ও ধাঁধা" },
      ],
    },
  ],
  gk: [
    {
      id: "bd-affairs",
      label: "বাংলাদেশ বিষয়াবলি",
      children: [
        { id: "liberation", label: "মুক্তিযুদ্ধ" },
        { id: "language-movement", label: "ভাষা আন্দোলন" },
        { id: "constitution", label: "সংবিধান ও জাতীয় বিষয়" },
      ],
    },
    {
      id: "current-affairs",
      label: "সাম্প্রতিক ঘটনাবলি",
      children: [
        { id: "ca-bangladesh", label: "বাংলাদেশ" },
        { id: "ca-international", label: "আন্তর্জাতিক" },
        { id: "ca-economy", label: "অর্থনীতি ও বাজেট" },
        { id: "ca-energy", label: "জ্বালানি ও পেট্রোলিয়াম" },
      ],
    },
    { id: "international", label: "আন্তর্জাতিক বিষয়াবলি" },
    { id: "general-science", label: "সাধারণ বিজ্ঞান" },
  ],
  networks: [
    { id: "osi", label: "OSI ও TCP/IP" },
    { id: "routing", label: "Routing" },
    { id: "subnet", label: "Subnetting" },
    { id: "security", label: "Cryptography ও Firewall" },
  ],
  dbms: [
    { id: "normalization", label: "Normalization" },
    { id: "sql", label: "SQL ও Join" },
    { id: "acid", label: "ACID ও Transaction" },
    { id: "indexing", label: "Indexing" },
  ],
  dsa: [
    { id: "linear", label: "Stack, Queue ও Linked List" },
    { id: "tree", label: "Tree" },
    { id: "graph", label: "Graph" },
    { id: "sorting", label: "Sorting ও Complexity" },
  ],
  os: [
    { id: "scheduling", label: "Process Scheduling" },
    { id: "deadlock", label: "Deadlock" },
    { id: "memory", label: "Memory ও Paging" },
  ],
  swe: [
    { id: "oop", label: "OOP" },
    { id: "sdlc", label: "SDLC ও Agile" },
    { id: "testing", label: "Testing" },
  ],
  energy: [
    { id: "companies", label: "পেট্রোবাংলার কোম্পানি" },
    { id: "fields", label: "গ্যাসক্ষেত্র" },
    { id: "pipeline", label: "সঞ্চালন ও বিতরণ" },
    { id: "scada", label: "SCADA ও আইটি" },
  ],
};

export function findTopic(category, topicId) {
  function walk(nodes, parent) {
    for (const node of nodes || []) {
      if (node.id === topicId) {
        return {
          ...node,
          parentId: parent?.id || "",
          parentLabel: parent?.label || "",
        };
      }
      const found = walk(node.children, node);
      if (found) return found;
    }
    return null;
  }
  return walk(TOPIC_TREE[category], null);
}

export function topicScope(category, topicId) {
  const node = findTopic(category, topicId);
  if (!node) return null;
  const ids = [];
  function collect(current) {
    ids.push(current.id);
    for (const child of current.children || []) collect(child);
  }
  collect(node);
  const path = [node.parentLabel, node.label].filter(Boolean).join(" → ");
  return { node, ids, path };
}

export function treeWithCounts(counts) {
  function decorate(category, nodes) {
    return (nodes || []).map((node) => {
      const children = decorate(category, node.children);
      const own = counts[`${category}:${node.id}`] || 0;
      const saved = own + children.reduce((sum, child) => sum + child.saved, 0);
      return { id: node.id, label: node.label, saved, children };
    });
  }
  return Object.fromEntries(
    Object.entries(TOPIC_TREE).map(([category, nodes]) => [category, decorate(category, nodes)]),
  );
}
