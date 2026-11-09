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
      ],
    },
    {
      id: "bn-literature",
      label: "সাহিত্য",
      children: [
        { id: "rabindranath", label: "রবীন্দ্রনাথ ঠাকুর" },
        { id: "nazrul", label: "কাজী নজরুল ইসলাম" },
        { id: "other-writers", label: "অন্যান্য প্রধান লেখক" },
      ],
    },
  ],
  english: [
    { id: "error-detection", label: "Error detection / Sentence correction" },
    { id: "preposition", label: "Appropriate prepositions" },
    { id: "idiom-en", label: "Idioms and phrases" },
    { id: "subject-verb", label: "Subject-verb agreement" },
    { id: "pronouns", label: "Subjective / objective pronouns" },
    { id: "parts-speech", label: "Parts of speech & analogies" },
  ],
  math: [
    {
      id: "arithmetic",
      label: "Arithmetic (GMAT/IBA)",
      children: [
        { id: "ratio", label: "Ratio & proportion" },
        { id: "percent", label: "Percentage, profit & loss" },
        { id: "mixture", label: "Mixtures & alligations" },
        { id: "speed", label: "Time, speed & distance" },
        { id: "work", label: "Work & time" },
      ],
    },
    {
      id: "algebra-number",
      label: "Algebra & number theory",
      children: [
        { id: "linear-eq", label: "Linear equations" },
        { id: "number-theory", label: "Number theory basics" },
      ],
    },
  ],
  gk: [
    {
      id: "petrobangla-energy",
      label: "পেট্রোবাংলা ও জ্বালানি খাত",
      children: [
        { id: "pb-companies", label: "পেট্রোবাংলা ও অধীন কোম্পানি" },
        { id: "gas-fields", label: "গ্যাসক্ষেত্র ও ভূগোল" },
        { id: "energy-stats", label: "জাতীয় জ্বালানি পরিসংখ্যান ও এলএনজি" },
        { id: "power-plants", label: "বিদ্যুৎকেন্দ্র ও আঞ্চলিক গ্রিড" },
      ],
    },
    {
      id: "bd-history",
      label: "বাংলাদেশ ইতিহাস ও মেগা প্রকল্প",
      children: [
        { id: "language-movement", label: "ভাষা আন্দোলন" },
        { id: "liberation", label: "মুক্তিযুদ্ধ ১৯৭১" },
        { id: "mega-projects", label: "জাতীয় মেগা প্রকল্প" },
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
      ],
    },
  ],
  dbms: [
    { id: "sql-agg", label: "SQL aggregates, GROUP BY, HAVING" },
    { id: "joins-subquery", label: "Joins & sub-queries" },
    { id: "normalization", label: "Normalization (1NF–BCNF)" },
    { id: "er-diagram", label: "ER diagram modeling" },
    { id: "acid", label: "ACID & concurrency basics" },
  ],
  networks: [
    { id: "subnet", label: "IP subnetting / VLSM" },
    { id: "osi", label: "OSI ও TCP/IP mapping" },
    { id: "transport", label: "TCP handshake, UDP, windowing" },
    { id: "app-protocols", label: "HTTP, HTTPS, DNS, DHCP, FTP" },
    { id: "routing", label: "RIP, OSPF, BGP" },
  ],
  swe: [
    { id: "oop", label: "OOP pillars" },
    { id: "uml", label: "UML use case & sequence" },
    { id: "sdlc", label: "SDLC: Agile & Waterfall" },
  ],
  digital: [
    { id: "kmap", label: "K-map minimization (3/4 variable)" },
    { id: "logic-gates", label: "Logic gates & combinational circuits" },
    { id: "pigeonhole", label: "Pigeonhole principle & combinatorics" },
  ],
  // Kept for older bank questions / saved rows
  os: [
    { id: "scheduling", label: "Process Scheduling" },
    { id: "deadlock", label: "Deadlock" },
    { id: "memory", label: "Memory ও Paging" },
  ],
  energy: [
    { id: "companies", label: "পেট্রোবাংলার কোম্পানি" },
    { id: "fields", label: "গ্যাসক্ষেত্র" },
    { id: "pipeline", label: "সঞ্চালন ও বিতরণ" },
    { id: "scada", label: "SCADA ও আইটি" },
  ],
};

export const NON_DEPT_CATEGORIES = ["bangla", "english", "math", "gk"];
export const DEPT_CATEGORIES = ["dsa", "dbms", "networks", "swe", "digital"];

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
