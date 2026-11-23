export const TOPIC_TREE = {
  bangla: [
    {
      id: "bn-grammar",
      label: "ব্যাকরণ",
      children: [
        { id: "sandhi", label: "সন্ধি" },
        { id: "samas", label: "সমাস" },
        { id: "karok", label: "কারক-বিভক্তি" },
        { id: "natwa-satwa", label: "ণত্ব ও ষত্ব বিধান" },
        { id: "spelling", label: "শুদ্ধ বানান" },
        { id: "synonym", label: "সমার্থক শব্দ" },
        { id: "antonym", label: "বিপরীতার্থক শব্দ" },
        { id: "idiom-bn", label: "বাগ্ধারা" },
        { id: "oneword", label: "এক কথায় প্রকাশ" },
        { id: "dhvani-borno", label: "ধ্বনি ও বর্ণ" },
        { id: "shobdo-pod", label: "শব্দ ও পদ" },
        { id: "prokriti", label: "প্রকৃতি ও প্রত্যয়" },
        { id: "uposorgo", label: "উপসর্গ" },
        { id: "bakko", label: "বাক্য রূপান্তর ও শুদ্ধি" },
        { id: "joti", label: "যতিচিহ্ন" },
        { id: "lingo-bochon", label: "লিঙ্গ, বচন ও পুরুষ" },
      ],
    },
    {
      id: "bn-literature",
      label: "সাহিত্য",
      children: [
        { id: "rabindranath", label: "রবীন্দ্রনাথ ঠাকুর" },
        { id: "nazrul", label: "কাজী নজরুল ইসলাম" },
        { id: "jasimuddin", label: "জসীমউদ্‌দীন" },
        { id: "modern-lit", label: "আধুনিক সাহিত্য" },
        { id: "medieval-lit", label: "প্রাচীন ও মধ্যযুগ" },
        { id: "other-writers", label: "অন্যান্য প্রধান লেখক" },
        { id: "poetry", label: "কবিতা" },
        { id: "novel", label: "উপন্যাস ও গল্প" },
        { id: "drama", label: "নাটক" },
        { id: "essay-lit", label: "প্রবন্ধ" },
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
        { id: "en-oneword", label: "One-word substitution" },
        { id: "en-spelling", label: "Spelling" },
        { id: "phrasal", label: "Phrasal verbs" },
      ],
    },
    {
      id: "en-reading",
      label: "Reading & writing",
      children: [
        { id: "comprehension", label: "Reading comprehension" },
        { id: "translation", label: "Translation" },
        { id: "fill-blank", label: "Fill in the blanks" },
      ],
    },
    {
      id: "grammar",
      label: "Grammar",
      children: [
        { id: "error-detection", label: "Error detection / Sentence correction" },
        { id: "preposition", label: "Appropriate prepositions" },
        { id: "subject-verb", label: "Subject-verb agreement" },
        { id: "pronouns", label: "Subjective / objective pronouns" },
        { id: "parts-speech", label: "Parts of speech & analogies" },
        { id: "tense", label: "Tense" },
        { id: "article", label: "Article" },
        { id: "voice", label: "Voice" },
        { id: "narration", label: "Narration" },
        { id: "conditional", label: "Conditional" },
        { id: "clause", label: "Clauses" },
        { id: "transformation", label: "Sentence transformation" },
      ],
    },
    { id: "idiom-en", label: "Idioms and phrases" },
  ],
  math: [
    {
      id: "arithmetic",
      label: "পাটিগণিত",
      children: [
        { id: "ratio", label: "অনুপাত ও সমানুপাত" },
        { id: "percent", label: "শতকরা, লাভ ও ক্ষতি" },
        { id: "interest", label: "সরল ও চক্রবৃদ্ধি সুদ" },
        { id: "mixture", label: "মিশ্রণ ও অ্যালিগেশন" },
        { id: "speed", label: "সময়, দূরত্ব ও গতি" },
        { id: "work", label: "সময় ও কাজ" },
        { id: "ages", label: "বয়স" },
        { id: "boat", label: "নৌকা ও স্রোত" },
        { id: "pipes", label: "পাইপ ও চৌবাচ্চা" },
        { id: "lcm", label: "ল.সা.গু. ও গ.সা.গু." },
        { id: "average", label: "গড়" },
        { id: "unitary", label: "ঐকিক নিয়ম" },
        { id: "mensuration", label: "ক্ষেত্রফল ও পরিমিতি" },
      ],
    },
    {
      id: "algebra-number",
      label: "বীজগণিত ও সংখ্যা",
      children: [
        { id: "linear-eq", label: "সরল সমীকরণ" },
        { id: "quadratic", label: "দ্বিঘাত সমীকরণ" },
        { id: "fractions", label: "ভগ্নাংশ ও দশমিক" },
        { id: "number-theory", label: "সংখ্যা তত্ত্ব" },
      ],
    },
    {
      id: "geometry-data",
      label: "জ্যামিতি ও উপাত্ত",
      children: [
        { id: "geometry", label: "জ্যামিতি" },
        { id: "sets", label: "সেট" },
        { id: "probability", label: "সম্ভাবনা" },
        { id: "stats", label: "পরিসংখ্যান" },
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
      id: "bd-history",
      label: "বাংলাদেশ",
      children: [
        { id: "language-movement", label: "ভাষা আন্দোলন" },
        { id: "liberation", label: "মুক্তিযুদ্ধ ১৯৭১" },
        { id: "constitution", label: "সংবিধান ও রাষ্ট্র" },
        { id: "mega-projects", label: "জাতীয় মেগা প্রকল্প" },
        { id: "bd-geography", label: "বাংলাদেশের ভূগোল" },
        { id: "bd-economy", label: "বাংলাদেশের অর্থনীতি" },
        { id: "bd-culture", label: "সংস্কৃতি ও খেলাধুলা" },
      ],
    },
    {
      id: "international",
      label: "আন্তর্জাতিক বিষয়াবলি",
      children: [
        { id: "world-orgs", label: "আন্তর্জাতিক সংস্থা" },
        { id: "world-geo", label: "বিশ্ব ভূগোল" },
        { id: "world-history", label: "বিশ্ব ইতিহাস" },
      ],
    },
    {
      id: "general-science",
      label: "সাধারণ বিজ্ঞান",
      children: [
        { id: "physics", label: "পদার্থবিজ্ঞান" },
        { id: "chemistry", label: "রসায়ন" },
        { id: "biology", label: "জীববিজ্ঞান" },
        { id: "computer-gk", label: "সাধারণ কম্পিউটার" },
      ],
    },
    {
      id: "current-affairs",
      label: "সাম্প্রতিক ঘটনাবলি",
      children: [
        { id: "ca-bangladesh", label: "বাংলাদেশ" },
        { id: "ca-international", label: "আন্তর্জাতিক" },
        { id: "ca-economy", label: "অর্থনীতি ও বাজেট" },
        { id: "ca-energy", label: "বিজ্ঞান ও প্রযুক্তি" },
      ],
    },
    { id: "awards", label: "পুরস্কার ও সম্মাননা" },
    { id: "books-media", label: "বই, চলচ্চিত্র ও গণমাধ্যম" },
    { id: "environment", label: "পরিবেশ ও দুর্যোগ" },
    {
      id: "petrobangla-energy",
      label: "পেট্রোবাংলা",
      children: [
        { id: "pb-companies", label: "পেট্রোবাংলা ও অধীন কোম্পানি" },
        { id: "gas-fields", label: "গ্যাসক্ষেত্র" },
        { id: "energy-stats", label: "জাতীয় জ্বালানি পরিসংখ্যান ও এলএনজি" },
        { id: "power-plants", label: "বিদ্যুৎকেন্দ্র ও গ্রিড" },
        { id: "pipeline", label: "সঞ্চালন ও বিতরণ" },
        { id: "scada", label: "SCADA ও আইটি" },
      ],
    },
  ],
  dsa: [
    {
      id: "programming",
      label: "Programming",
      children: [
        { id: "code-trace", label: "Code output tracing" },
        { id: "arrays-matrix", label: "Array & matrix manipulation" },
        { id: "basic-algo", label: "Basic algorithm implementation" },
      ],
    },
    {
      id: "linear-ds",
      label: "Linear data structures",
      children: [
        { id: "stack-queue", label: "Stacks & queues" },
        { id: "linked-list", label: "Linked lists (singly/doubly)" },
      ],
    },
    {
      id: "non-linear-ds",
      label: "Non-linear data structures",
      children: [
        { id: "bst", label: "Binary search trees (BST)" },
        { id: "tree-traversal", label: "Tree traversals" },
        { id: "graph", label: "Graph" },
      ],
    },
    { id: "sorting", label: "Sorting ও Complexity" },
  ],
  dbms: [
    { id: "sql-agg", label: "SQL aggregates, GROUP BY, HAVING" },
    { id: "joins-subquery", label: "Joins & sub-queries" },
    { id: "normalization", label: "Normalization (1NF–BCNF)" },
    { id: "er-diagram", label: "ER diagram modeling" },
    { id: "acid", label: "ACID & concurrency basics" },
    { id: "indexing", label: "Indexing" },
  ],
  networks: [
    { id: "subnet", label: "IP subnetting / VLSM" },
    { id: "osi", label: "OSI ও TCP/IP mapping" },
    { id: "transport", label: "TCP handshake, UDP, windowing" },
    { id: "app-protocols", label: "HTTP, HTTPS, DNS, DHCP, FTP" },
    { id: "routing", label: "RIP, OSPF, BGP" },
    { id: "security", label: "Cryptography ও Firewall" },
  ],
  swe: [
    { id: "oop", label: "OOP pillars" },
    { id: "uml", label: "UML use case & sequence" },
    { id: "sdlc", label: "SDLC: Agile & Waterfall" },
    { id: "testing", label: "Testing" },
  ],
  digital: [
    { id: "kmap", label: "K-map minimization (3/4 variable)" },
    { id: "logic-gates", label: "Logic gates & combinational circuits" },
    { id: "pigeonhole", label: "Pigeonhole principle & combinatorics" },
  ],
  os: [
    { id: "scheduling", label: "Process Scheduling" },
    { id: "deadlock", label: "Deadlock" },
    { id: "memory", label: "Memory ও Paging" },
  ],
};

export const NON_DEPT_CATEGORIES = ["bangla", "english", "math", "gk"];
export const DEPT_CATEGORIES = ["dsa", "dbms", "networks", "swe", "digital", "os"];

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

export function customTopicScope(category, topicId, label) {
  const cleanLabel = String(label || "").trim().slice(0, 120);
  if (!String(topicId || "").startsWith("custom-") || topicId === "custom" || !cleanLabel) return null;
  return {
    node: {
      id: topicId,
      label: cleanLabel,
      parentId: "custom",
      parentLabel: "কাস্টম টপিক",
      children: [],
    },
    ids: [topicId],
    path: `কাস্টম টপিক → ${cleanLabel}`,
    custom: true,
  };
}

export function treeWithCounts(counts, customTopics = []) {
  function decorate(category, nodes) {
    return (nodes || []).map((node) => {
      const children = decorate(category, node.children);
      const own = counts[`${category}:${node.id}`] || 0;
      const saved = own + children.reduce((sum, child) => sum + child.saved, 0);
      return { id: node.id, label: node.label, saved, children };
    });
  }
  const tree = Object.fromEntries(
    Object.entries(TOPIC_TREE).map(([category, nodes]) => [category, decorate(category, nodes)]),
  );
  for (const item of customTopics || []) {
    const category = item.category;
    if (!tree[category]) continue;
    let root = tree[category].find((node) => node.id === "custom");
    if (!root) {
      root = { id: "custom", label: "কাস্টম টপিক", saved: 0, children: [] };
      tree[category].push(root);
    }
    const saved = Number(item.count || item.saved || 0);
    root.children.push({
      id: item.topic,
      label: item.label || item.topic,
      saved,
      children: [],
    });
    root.saved += saved;
  }
  return tree;
}

export function allTopicIds(category) {
  const ids = [];
  function walk(nodes) {
    for (const node of nodes || []) {
      ids.push(node.id);
      walk(node.children);
    }
  }
  walk(TOPIC_TREE[category]);
  return ids;
}
