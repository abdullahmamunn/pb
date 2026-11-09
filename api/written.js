function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const WRITTEN_TOPICS = [
  {
    id: "dsa",
    label: "Programming & Data Structures",
    blurb: "Code tracing, arrays/matrix, stack-queue-list, BST ও traversal — লিখিত/শর্ট আন্সার।",
    category: "dsa",
    questions: [
      {
        marks: 5,
        topicLabel: "Code output tracing",
        question:
          "Consider the C fragment:\nint a = 85;\nif(a>=90) printf(\"A\");\nif(a>=80) printf(\"B\");\nif(a>=70) printf(\"C\");\nif(a>=60) printf(\"D\");\nelse printf(\"F\");\nWhat is printed? Explain briefly.",
        answer:
          "Output: BCD.\nBecause separate if statements (not else-if) all fire when true: 85 fails >=90, then prints B, C, and D. The else belongs only to the last if, so F is not printed.",
      },
      {
        marks: 5,
        topicLabel: "Linked lists",
        question:
          "Draw / describe a singly linked list with nodes 10 → 20 → 30. Write steps to insert 25 between 20 and 30.",
        answer:
          "Create node x with data 25. Let p point to node 20. Set x->next = p->next (30), then p->next = x. Final list: 10 → 20 → 25 → 30. Need O(n) search to find 20 unless a pointer is already known.",
      },
      {
        marks: 5,
        topicLabel: "BST / traversal",
        question:
          "A binary tree has post-order: a b f c h d e g i. Sketch the tree idea and give one valid array/heap-style level order if root is a (explain assumptions).",
        answer:
          "Post-order visits left, right, then root, so the last symbol i is root if the sequence is for one tree rooted at i — check the exam figure carefully. Typically reconstruct using inorder+postorder; with postorder alone the tree is not unique. State your assumption, draw children consistently, then write level-order left-to-right.",
      },
      {
        marks: 5,
        topicLabel: "Stack & queue",
        question: "Using a stack, reverse the string \"PETRO\". Show stack states after each push/pop.",
        answer:
          "Push P,E,T,R,O. Stack top=O. Pop → O,R,T,E,P giving \"ORTEP\". Each push/pop is O(1); whole reverse is O(n) time and O(n) space.",
      },
    ],
  },
  {
    id: "dbms",
    label: "Database Management Systems",
    blurb: "SQL, joins, normalization, ER, ACID — লিখে উত্তর দিন।",
    category: "dbms",
    questions: [
      {
        marks: 5,
        topicLabel: "SQL aggregates",
        question:
          "Write an SQL query to show department-wise average salary for departments having average salary greater than 50000. Tables: Emp(id, dept, salary).",
        answer:
          "SELECT dept, AVG(salary) AS avg_sal\nFROM Emp\nGROUP BY dept\nHAVING AVG(salary) > 50000;\nGROUP BY makes groups; HAVING filters groups after aggregation (WHERE cannot use AVG).",
      },
      {
        marks: 5,
        topicLabel: "Joins",
        question: "Differentiate INNER JOIN and LEFT JOIN with a one-line example idea (Student ⋈ Course).",
        answer:
          "INNER JOIN returns only matching student-course pairs. LEFT JOIN returns all students; if a student has no course, course columns are NULL. RIGHT JOIN keeps all courses; FULL OUTER keeps unmatched rows from both sides.",
      },
      {
        marks: 5,
        topicLabel: "Normalization",
        question: "When is a relation in 3NF but not in BCNF? Give a short example pattern.",
        answer:
          "3NF: for every FD X→A, either X is a superkey or A is prime. BCNF requires X always a superkey. Classic: R(Student, Subject, Teacher) with Subject+Student → Teacher and Teacher → Subject. Teacher→Subject violates BCNF while 3NF can still hold if Subject is prime.",
      },
      {
        marks: 5,
        topicLabel: "ACID",
        question: "Explain ACID in four short bullets with banking transfer example.",
        answer:
          "Atomicity: debit+credit both succeed or both fail.\nConsistency: invariants (non-negative balance rules) preserved.\nIsolation: concurrent transfers do not see partial updates.\nDurability: after commit, result survives crash (logs/disk).",
      },
    ],
  },
  {
    id: "networks",
    label: "Computer Networking",
    blurb: "Subnetting, OSI/TCP-IP, TCP/UDP, app protocols, routing — লিখিত।",
    category: "networks",
    questions: [
      {
        marks: 5,
        topicLabel: "Subnetting",
        question:
          "Network 192.168.10.0/24 is split into 4 equal subnets. Write the first subnet address, mask, usable host range, and broadcast.",
        answer:
          "Need 2 bits for 4 subnets → masks /26 (255.255.255.192).\nFirst subnet: 192.168.10.0/26\nUsable hosts: 192.168.10.1 – 192.168.10.62\nBroadcast: 192.168.10.63",
      },
      {
        marks: 5,
        topicLabel: "OSI / TCP-IP",
        question: "Map HTTP, TCP, IP, and Ethernet to OSI layers and to the TCP/IP model.",
        answer:
          "HTTP → Application (OSI 7) / Application in TCP/IP.\nTCP → Transport (OSI 4) / Transport.\nIP → Network (OSI 3) / Internet.\nEthernet → Data Link (+Physical) / Network Access.",
      },
      {
        marks: 5,
        topicLabel: "TCP handshake",
        question: "Describe the TCP three-way handshake briefly.",
        answer:
          "Client → SYN.\nServer → SYN-ACK.\nClient → ACK.\nConnection then enters established state; sequence numbers are synchronized for reliable byte-stream transfer.",
      },
      {
        marks: 5,
        topicLabel: "Routing",
        question: "Compare RIP, OSPF, and BGP in one table-like short answer.",
        answer:
          "RIP: distance-vector, hop-count metric, interior, slow convergence.\nOSPF: link-state, cost metric, interior, fast, hierarchical areas.\nBGP: path-vector, policy-based, exterior (between ASes), internet backbone routing.",
      },
    ],
  },
  {
    id: "swe",
    label: "Software Engineering & OOP",
    blurb: "OOP pillars, UML, Agile/Waterfall — শর্ট লিখিত।",
    category: "swe",
    questions: [
      {
        marks: 5,
        topicLabel: "OOP pillars",
        question: "Define Inheritance, Polymorphism, Encapsulation, and Abstraction with one example each.",
        answer:
          "Inheritance: class Car extends Vehicle.\nPolymorphism: same method draw() behaves differently in Circle/Rectangle.\nEncapsulation: private balance with deposit()/withdraw().\nAbstraction: interface Payment hides bKash/card details.",
      },
      {
        marks: 5,
        topicLabel: "UML",
        question: "What does a Use Case diagram show vs a Sequence diagram?",
        answer:
          "Use Case: actors and system goals/functions (what the system offers).\nSequence: time-ordered messages between objects/lifelines for one scenario (how objects interact).",
      },
      {
        marks: 5,
        topicLabel: "SDLC",
        question: "Contrast Waterfall and Agile in four points suitable for a 5-mark answer.",
        answer:
          "Waterfall: sequential phases, late feedback, good for fixed requirements.\nAgile: iterative sprints, continuous feedback, welcomes change.\nDocs heavy vs working software focus.\nRisk discovered late in Waterfall; Agile surfaces risk every sprint.",
      },
    ],
  },
  {
    id: "digital",
    label: "Digital Logic & Discrete Mathematics",
    blurb: "K-map, logic gates, pigeonhole — লিখিত।",
    category: "digital",
    questions: [
      {
        marks: 5,
        topicLabel: "K-map",
        question:
          "Minimize F(A,B,C) = Σ(1,2,5,7) using a 3-variable K-map. Show groupings and final expression.",
        answer:
          "Plot 1s at minterms 1,2,5,7. Group (1,5) and (5,7) and/or (1,?) carefully on standard map.\nA valid simplified form is F = A'B'C + A'BC' + AC (verify with truth table). Write your pairs/quads and sum-of-products clearly for full marks.",
      },
      {
        marks: 5,
        topicLabel: "Logic gates",
        question: "Implement OR using only NAND gates. Draw the idea in words.",
        answer:
          "OR via NAND: A OR B = NAND(NAND(A,A), NAND(B,B)) i.e. NAND of inverted inputs (De Morgan). First make NOT with NAND(A,A), same for B, then NAND those outputs.",
      },
      {
        marks: 5,
        topicLabel: "Pigeonhole principle",
        question:
          "Prove that among any 8 people, at least 2 were born on the same day of the week.",
        answer:
          "7 days = 7 pigeonholes, 8 people = 8 pigeons. By pigeonhole principle, at least one day contains ≥2 people. Hence at least two share a weekday of birth.",
      },
    ],
  },
];

function withTopic(topic, item) {
  return {
    ...item,
    topicId: topic.id,
    topicLabel: item.topicLabel || topic.label,
    category: topic.category,
  };
}

export function writtenCatalog() {
  const topics = WRITTEN_TOPICS.map((topic) => ({
    id: topic.id,
    label: topic.label,
    blurb: topic.blurb,
    category: topic.category,
    count: topic.questions.length,
  }));
  return {
    topics,
    total: topics.reduce((sum, topic) => sum + topic.count, 0),
    mock: {
      blurb: "ডিপার্টমেন্টাল লিখিত মক: প্রতি বিষয় থেকে প্রশ্ন মিলিয়ে শর্ট আন্সার অনুশীলন।",
      count: Math.min(8, topics.reduce((sum, topic) => sum + topic.count, 0)),
    },
  };
}

export function writtenSession(topicId, limit = 8) {
  if (topicId === "mock" || topicId === "all") {
    const questions = shuffle(
      WRITTEN_TOPICS.flatMap((topic) => shuffle(topic.questions).slice(0, 2).map((item) => withTopic(topic, item))),
    ).slice(0, Math.min(10, Math.max(4, limit)));
    return {
      id: "mock",
      label: "ডিপার্টমেন্টাল লিখিত মক",
      blurb: "CSE/IT লিখিত ৪০ নম্বর স্টাইলের মিশ্র শর্ট আন্সার।",
      questions,
    };
  }
  const topic = WRITTEN_TOPICS.find((item) => item.id === topicId);
  if (!topic) return null;
  return {
    id: topic.id,
    label: topic.label,
    blurb: topic.blurb,
    questions: shuffle(topic.questions).map((item) => withTopic(topic, item)),
  };
}

export function writtenForCategories(categoryIds, limit = 8) {
  const wanted = new Set(categoryIds || []);
  const pool = WRITTEN_TOPICS.filter((topic) => !wanted.size || wanted.has(topic.category) || wanted.has(topic.id));
  const source = pool.length ? pool : WRITTEN_TOPICS;
  return shuffle(
    source.flatMap((topic) => topic.questions.map((item) => withTopic(topic, item))),
  ).slice(0, Math.min(10, Math.max(4, limit)));
}
