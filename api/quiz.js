import { GoogleGenAI, Type } from "@google/genai";
import { topicScope, treeWithCounts } from "./topics.js";
import { countByCategory, countByTopic, practiceQuestions, saveQuestions } from "./store.js";

export const config = {
  maxDuration: 60,
};

const CATEGORY_SESSION = 10;
const MIXED_SESSION = 20;
const AI_MIXED_COUNT = 15;
const AI_CATEGORY_COUNT = 10;

const pastPapers = [
  {
    question: "OSI মডেলে রাউটার সাধারণত কোন স্তরে কাজ করে?",
    options: ["ফিজিক্যাল লেয়ার", "ডেটা লিংক লেয়ার", "নেটওয়ার্ক লেয়ার", "অ্যাপ্লিকেশন লেয়ার"],
    answer: 2,
    explanation:
      "রাউটার IP ঠিকানা দেখে প্যাকেট ফরওয়ার্ড করে, তাই এটি নেটওয়ার্ক লেয়ারে (Layer 3) কাজ করে। হাব ফিজিক্যাল লেয়ারে এবং সাধারণ সুইচ ডেটা লিংক লেয়ারে কাজ করে।",
    category: "Networks",
    difficulty: "Easy",
  },
  {
    question: "কোন প্রোটোকল কানেকশনলেস এবং ডেলিভারির নিশ্চয়তা দেয় না?",
    options: ["TCP", "UDP", "FTP", "SMTP"],
    answer: 1,
    explanation:
      "UDP কানেকশন খোলে না এবং প্যাকেট হারালে পুনরায় পাঠানোর নিশ্চয়তা দেয় না। TCP কানেকশন-ওরিয়েন্টেড ও নির্ভরযোগ্য। FTP ও SMTP অ্যাপ্লিকেশন-লেয়ার প্রোটোকল, যা সাধারণত TCP-এর ওপর চলে।",
    category: "Networks",
    difficulty: "Easy",
  },
  {
    question: "HTTPS-এর ডিফল্ট পোর্ট নম্বর কত?",
    options: ["80", "443", "21", "25"],
    answer: 1,
    explanation:
      "HTTPS হলো TLS দিয়ে সুরক্ষিত HTTP, এর ডিফল্ট পোর্ট 443। HTTP-এর পোর্ট 80, FTP-এর 21 এবং SMTP-এর 25।",
    category: "Networks",
    difficulty: "Easy",
  },
  {
    question: "একটি IPv6 ঠিকানার দৈর্ঘ্য কত বিট?",
    options: ["32", "64", "96", "128"],
    answer: 3,
    explanation:
      "IPv4 ঠিকানা 32 বিট। IPv6 ঠিকানা 128 বিট, তাই ঠিকানার ঘাটতি মেটাতে এবং সহজ অটো-কনফিগারেশনের জন্য এটি ডিজাইন করা হয়েছে।",
    category: "Networks",
    difficulty: "Easy",
  },
  {
    question: "DNS-এর প্রধান কাজ কী?",
    options: [
      "ডোমেইন নামকে IP ঠিকানায় রূপান্তর করা",
      "MAC ঠিকানা বরাদ্দ করা",
      "ইমেইল এনক্রিপ্ট করা",
      "ফাইল ট্রান্সফার করা",
    ],
    answer: 0,
    explanation:
      "Domain Name System মানুষের পড়া ডোমেইন নামকে (যেমন example.com) সংশ্লিষ্ট IP ঠিকানায় অনুবাদ করে। MAC ম্যাপিং করে ARP, আর ফাইল ট্রান্সফারের জন্য FTP ব্যবহৃত হয়।",
    category: "Networks",
    difficulty: "Easy",
  },
  {
    question: "ARP কোন দুটি জিনিসের মধ্যে ম্যাপিং করে?",
    options: [
      "ডোমেইন নাম ও পোর্ট",
      "পোর্ট নম্বর ও প্রসেস",
      "IP ঠিকানা ও MAC ঠিকানা",
      "URL ও HTML ফাইল",
    ],
    answer: 2,
    explanation:
      "Address Resolution Protocol একটি পরিচিত IP ঠিকানার জন্য লোকাল নেটওয়ার্কের MAC ঠিকানা বের করে। এর উল্টো কাজের পুরোনো প্রোটোকল ছিল RARP।",
    category: "Networks",
    difficulty: "Medium",
  },
  {
    question: "TCP থ্রি-ওয়ে হ্যান্ডশেকের প্রথম সেগমেন্ট কোনটি?",
    options: ["ACK", "SYN", "FIN", "RST"],
    answer: 1,
    explanation:
      "ক্লায়েন্ট আগে SYN পাঠায়, সার্ভার SYN-ACK দেয়, তারপর ক্লায়েন্ট ACK পাঠায়। এই তিন ধাপে কানেকশন প্রতিষ্ঠিত হয়। FIN কানেকশন বন্ধ করতে এবং RST সংযোগ রিসেট করতে ব্যবহৃত হয়।",
    category: "Networks",
    difficulty: "Medium",
  },
  {
    question: "ক্লাসিক ইথারনেট সুইচ সাধারণত OSI-এর কোন স্তরে কাজ করে?",
    options: ["ডেটা লিংক লেয়ার", "নেটওয়ার্ক লেয়ার", "ট্রান্সপোর্ট লেয়ার", "সেশন লেয়ার"],
    answer: 0,
    explanation:
      "সাধারণ সুইচ MAC ঠিকানা শিখে ফ্রেম ফরওয়ার্ড করে, তাই এটি ডেটা লিংক লেয়ারের (Layer 2) ডিভাইস। IP দেখে পথ বেছে নেওয়া রাউটারের কাজ।",
    category: "Networks",
    difficulty: "Easy",
  },
  {
    question: "ping কমান্ড কোন প্রোটোকল ব্যবহার করে?",
    options: ["TCP", "UDP", "HTTP", "ICMP"],
    answer: 3,
    explanation:
      "ping ICMP Echo Request পাঠায় এবং Echo Reply আসলে হোস্ট পৌঁছানো যাচ্ছে বলে ধরা হয়। এটি ট্রান্সপোর্ট-লেয়ারের TCP বা UDP নয়।",
    category: "Networks",
    difficulty: "Medium",
  },
  {
    question: "ক্লাস C নেটওয়ার্কের ডিফল্ট সাবনেট মাস্ক কোনটি?",
    options: ["255.0.0.0", "255.255.0.0", "255.255.255.0", "255.255.255.255"],
    answer: 2,
    explanation:
      "ক্লাস C-এর ডিফল্ট প্রিফিক্স /24, অর্থাৎ মাস্ক 255.255.255.0। ক্লাস A-এর মাস্ক 255.0.0.0 এবং ক্লাস B-এর 255.255.0.0।",
    category: "Networks",
    difficulty: "Medium",
  },
  {
    question: "একটি IPv4 /26 সাবনেটে ব্যবহারযোগ্য হোস্ট সংখ্যা কত?",
    options: ["30", "62", "64", "126"],
    answer: 1,
    explanation:
      "/26 মানে হোস্ট বিট 6টি। মোট ঠিকানা 2^6 = 64। নেটওয়ার্ক ও ব্রডকাস্ট ঠিকানা বাদ দিলে ব্যবহারযোগ্য হোস্ট 64 − 2 = 62।",
    category: "Networks",
    difficulty: "Hard",
  },
  {
    question: "নেতিবাচক ওজনের এজ সামলাতে পারে, কিন্তু নেতিবাচক চক্র থাকলে সঠিক শর্টেস্ট পাথ দিতে পারে না—এটি কোন অ্যালগরিদম?",
    options: ["Dijkstra", "Bellman-Ford", "Prim's", "Kruskal"],
    answer: 1,
    explanation:
      "Bellman-Ford নেতিবাচক এজ সহ্য করে এবং নেতিবাচক চক্র শনাক্ত করতে পারে, কিন্তু চক্র থাকলে শর্টেস্ট পাথ অসংজ্ঞায়িত। Dijkstra নেতিবাচক এজে ভুল ফল দিতে পারে। Prim's ও Kruskal মিনিমাম স্প্যানিং ট্রি বের করে, শর্টেস্ট পাথ নয়।",
    category: "Networks",
    difficulty: "Hard",
  },
  {
    question: "ইমেইল পাঠানোর জন্য কোন অ্যাপ্লিকেশন-লেয়ার প্রোটোকল ব্যবহৃত হয়?",
    options: ["POP3", "IMAP", "SMTP", "SNMP"],
    answer: 2,
    explanation:
      "SMTP (Simple Mail Transfer Protocol) মেইল সার্ভারে বার্তা জমা ও সার্ভার থেকে সার্ভারে পাঠায়। POP3 ও IMAP মেইল ডাউনলোড বা পড়তে ব্যবহৃত হয়। SNMP নেটওয়ার্ক ম্যানেজমেন্টের প্রোটোকল।",
    category: "Networks",
    difficulty: "Easy",
  },
  {
    question: "রিলেশনাল টেবিলে একটি সারিকে অনন্যভাবে শনাক্ত করে কোনটি?",
    options: ["ফরেন কী", "প্রাইমারি কী", "ভিউ", "ট্রিগার"],
    answer: 1,
    explanation:
      "প্রাইমারি কী-এর মান প্রতিটি সারিতে অনন্য এবং NULL হতে পারে না। ফরেন কী অন্য টেবিলের কীকে রেফার করে; এটি নিজে থেকে সারি শনাক্ত করার নিশ্চয়তা দেয় না।",
    category: "DBMS",
    difficulty: "Easy",
  },
  {
    question: "ACID-এর 'A' বোঝায়—",
    options: ["Availability", "Atomicity", "Authentication", "Aggregation"],
    answer: 1,
    explanation:
      "Atomicity মানে ট্রানজাকশনের সব কাজ একসাথে সফল হবে, নইলে পুরোটাই রোলব্যাক হবে। আংশিক আপডেট টিকবে না। Availability ও Authentication ACID-এর অংশ নয়।",
    category: "DBMS",
    difficulty: "Easy",
  },
  {
    question: "থার্ড নরমাল ফর্ম (3NF) মূলত কোন নির্ভরতা দূর করে?",
    options: [
      "পারশিয়াল ডিপেন্ডেন্সি",
      "ট্রানজিটিভ ডিপেন্ডেন্সি",
      "মাল্টিভ্যালুড ডিপেন্ডেন্সি",
      "জয়েন ডিপেন্ডেন্সি",
    ],
    answer: 1,
    explanation:
      "2NF পারশিয়াল ডিপেন্ডেন্সি দূর করে। 3NF-এ নন-প্রাইম অ্যাট্রিবিউট ক্যান্ডিডেট কী-এর ওপর ট্রানজিটিভলি নির্ভর করতে পারে না। মাল্টিভ্যালুড ডিপেন্ডেন্সি 4NF-এর বিষয়।",
    category: "DBMS",
    difficulty: "Medium",
  },
  {
    question: "কোনটি DDL কমান্ড?",
    options: ["CREATE", "SELECT", "INSERT", "UPDATE"],
    answer: 0,
    explanation:
      "DDL স্কিমা বদলায়: CREATE, ALTER, DROP, TRUNCATE। INSERT ও UPDATE ডেটা বদলায় (DML)। SELECT ডেটা পড়ে।",
    category: "DBMS",
    difficulty: "Easy",
  },
  {
    question: "INNER JOIN-এর ফলাফলে কী থাকে?",
    options: [
      "দুই টেবিলের সব সারি",
      "শুধু বাম টেবিলের সব সারি",
      "শুধু ডান টেবিলের সব সারি",
      "শুধু যে সারিগুলো শর্তে মেলে",
    ],
    answer: 3,
    explanation:
      "INNER JOIN দুই টেবিল থেকে কেবল মিলে যাওয়া সারি রাখে। না মেলানো সারি রাখতে LEFT, RIGHT বা FULL OUTER JOIN লাগে।",
    category: "DBMS",
    difficulty: "Medium",
  },
  {
    question: "ক্যান্ডিডেট কী কোনটি?",
    options: [
      "মিনিমাল সুপার কী",
      "যেকোনো একটি কলাম",
      "সবসময় একাধিক কলামের সেট",
      "শুধু ফরেন কী",
    ],
    answer: 0,
    explanation:
      "সুপার কী সারিকে অনন্য করে। তার থেকে অপ্রয়োজনীয় অ্যাট্রিবিউট বাদ দিলে যা থাকে, সেই মিনিমাল সুপার কী-ই ক্যান্ডিডেট কী। প্রাইমারি কী ক্যান্ডিডেট কী-গুলোর মধ্য থেকে বাছা একটি।",
    category: "DBMS",
    difficulty: "Medium",
  },
  {
    question: "ফরেন কী-এর ভূমিকা কী?",
    options: [
      "অন্য টেবিলের কী রেফার করে রেফারেন্সিয়াল ইন্টিগ্রিটি রাখে",
      "সবসময় টেবিলের প্রথম কলাম হয়",
      "ইনডেক্স মুছে দেয়",
      "একটি ভার্চুয়াল টেবিল তৈরি করে",
    ],
    answer: 0,
    explanation:
      "ফরেন কী অন্য টেবিলের প্রাইমারি বা ক্যান্ডিডেট কী-এর মান ধরে রাখে, যাতে এমন রেফারেন্স না থাকে যার লক্ষ্য সারি নেই। ভার্চুয়াল টেবিল হলো ভিউ।",
    category: "DBMS",
    difficulty: "Medium",
  },
  {
    question: "ডেটাবেস ইনডেক্সে বহুল ব্যবহৃত ট্রি কোনটি?",
    options: ["সাধারণ বাইনারি সার্চ ট্রি", "AVL ট্রি", "B+ ট্রি", "মিন-হিপ"],
    answer: 2,
    explanation:
      "B+ ট্রির ফ্যানআউট বেশি, তাই ডিস্ক অ্যাক্সেস কম লাগে। সব ডেটা পাতায় থাকে এবং পাতাগুলো লিংকড থাকায় রেঞ্জ কোয়েরি সস্তা। সাধারণ BST ডিস্ক-ভিত্তিক ইনডেক্সের জন্য খুব গভীর হয়ে যায়।",
    category: "DBMS",
    difficulty: "Hard",
  },
  {
    question: "কমিটের পর সিস্টেম ক্র্যাশ হলেও লেখা ডেটা টিকে থাকে। এটি ACID-এর কোন ধর্ম?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    answer: 3,
    explanation:
      "Durability গ্যারান্টি দেয় যে সফল কমিটের ফল স্থায়ী স্টোরেজে থেকে যায়, পরে পাওয়ার গেলেও। Atomicity সব-অথবা-কিছুই নীতি, Isolation সমবর্তী ট্রানজাকশন আলাদা রাখে।",
    category: "DBMS",
    difficulty: "Hard",
  },
  {
    question: "স্ট্যাক কোন নীতিতে কাজ করে?",
    options: ["LIFO", "FIFO", "Round Robin", "LRU"],
    answer: 0,
    explanation:
      "স্ট্যাকে শেষে ঢোকানো উপাদান আগে বের হয় (Last In, First Out)। কিউ FIFO। Round Robin শিডিউলিং নীতি এবং LRU পেজ রিপ্লেসমেন্ট নীতি।",
    category: "DSA",
    difficulty: "Easy",
  },
  {
    question: "সর্টেড অ্যারেতে বাইনারি সার্চের সময় জটিলতা কত?",
    options: ["O(n)", "O(n log n)", "O(log n)", "O(1)"],
    answer: 2,
    explanation:
      "প্রতি তুলনায় সার্চ-স্পেস প্রায় অর্ধেক হয়, তাই তুলনা সংখ্যা log2(n)-এর কাছাকাছি। অ্যারে আগে থেকে সর্টেড না থাকলে বাইনারি সার্চ ব্যবহার করা যায় না।",
    category: "DSA",
    difficulty: "Easy",
  },
  {
    question: "বাইনারি সার্চ ট্রির ইনঅর্ডার ট্রাভার্সাল কী দেয়?",
    options: ["লেভেল অর্ডার", "প্রিঅর্ডার ক্রম", "পোস্টঅর্ডার ক্রম", "আরোহী সর্টেড ক্রম"],
    answer: 3,
    explanation:
      "BST-তে বাম সাবট্রি ছোট এবং ডান সাবট্রি বড়। বাম-মূল-ডান (inorder) ঘুরলে মানগুলো ছোট থেকে বড়ে সাজানো পাওয়া যায়। লেভেল অর্ডার BFS দিয়ে পাওয়া যায়।",
    category: "DSA",
    difficulty: "Medium",
  },
  {
    question: "BFS সাধারণত কোন ডেটা স্ট্রাকচার ব্যবহার করে?",
    options: ["কিউ", "স্ট্যাক", "হিপ", "অ্যাডজাসেন্সি ম্যাট্রিক্স"],
    answer: 0,
    explanation:
      "BFS আগে আসা নোড আগে এক্সপ্লোর করে, তাই কিউ লাগে। DFS স্ট্যাক বা রিকার্শন ব্যবহার করে। অ্যাডজাসেন্সি ম্যাট্রিক্স গ্রাফ রাখার উপায়, সার্চের সারি নয়।",
    category: "DSA",
    difficulty: "Medium",
  },
  {
    question: "অ্যারে আগে থেকে সর্টেড এবং প্রথম উপাদান পিভট হলে কুইকসর্টের ওয়র্স্ট-কেস সময় জটিলতা কত?",
    options: ["O(n)", "O(n²)", "O(log n)", "O(n log n)"],
    answer: 1,
    explanation:
      "এই পিভট প্রতিবার একদিকে খালি এবং অন্যদিকে n−1 উপাদানের পার্টিশন বানায়। মোট কাজ n + (n−1) + … + 1 = O(n²)। ভারসাম্য পার্টিশনে গড় জটিলতা O(n log n)।",
    category: "DSA",
    difficulty: "Medium",
  },
  {
    question: "ভালো হ্যাশ ফাংশন ও সীমিত লোড ফ্যাক্টরে হ্যাশ টেবিলের গড় সার্চ জটিলতা কত?",
    options: ["O(n)", "O(1)", "O(log n)", "O(n²)"],
    answer: 1,
    explanation:
      "সংঘর্ষ কম থাকলে একবার হ্যাশ করেই ঘর পাওয়া যায়, তাই গড় সার্চ O(1)। সব কী একই ঘরে জমলে চেইনের ওয়র্স্ট কেস O(n) হতে পারে।",
    category: "DSA",
    difficulty: "Hard",
  },
  {
    question: "নেতিবাচক ওজনের এজ থাকলে Dijkstra-এর শর্টেস্ট পাথ কেন অবিশ্বস্ত?",
    options: [
      "এটি শুধু আনডিরেক্টেড গ্রাফে চলে",
      "এটি সবসময় BFS",
      "একবার ফাইনালাইজ করা নোডের দূরত্ব নেতিবাচক এজে আরও কমতে পারে",
      "এটি নেতিবাচক চক্র থাকলেও সঠিক উত্তর দেয়",
    ],
    answer: 2,
    explanation:
      "Dijkstra ধরে নেয় যে ফাইনালাইজ করা নোডের দূরত্ব আর কমবে না। নেতিবাচক এজ পরে সেই ধারণা ভাঙতে পারে। নেতিবাচক এজের জন্য Bellman-Ford ব্যবহার করা হয়।",
    category: "DSA",
    difficulty: "Hard",
  },
  {
    question: "মার্জ সর্টের ওয়র্স্ট-কেস সময় জটিলতা কত?",
    options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"],
    answer: 1,
    explanation:
      "মার্জ সর্ট প্রতি স্তরে n কাজ করে এবং স্তর সংখ্যা log n, তাই সেরা, গড় ও ওয়র্স্ট কেস সবই O(n log n)। অতিরিক্ত অ্যারের জন্য স্পেস O(n)। এটি একটি স্থিতিশীল (stable) সর্ট।",
    category: "DSA",
    difficulty: "Medium",
  },
  {
    question: "ইনডেক্স দিয়ে অ্যারের একটি উপাদান পড়তে সময় জটিলতা কত?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
    answer: 2,
    explanation:
      "অ্যারের উপাদানগুলো টানা মেমরিতে থাকে। বেস অ্যাড্রেস + ইনডেক্স × উপাদানের সাইজ হিসাব করে সরাসরি ঘরে যাওয়া যায়, তাই অ্যাক্সেস O(1)।",
    category: "DSA",
    difficulty: "Easy",
  },
  {
    question: "রাউন্ড রবিন শিডিউলিংয়ে প্রতিটি প্রসেসকে কী দেওয়া হয়?",
    options: ["ফিক্সড পেজ ফ্রেম", "টাইম কোয়ান্টাম", "স্থায়ী প্রায়োরিটি ইনহেরিট্যান্স", "একটি বাইনারি সেমাফোর"],
    answer: 1,
    explanation:
      "রাউন্ড রবিন প্রিএম্পটিভ। প্রতিটি রেডি প্রসেস একটি নির্দিষ্ট সময় (time quantum) CPU পায়, তারপর সারির শেষে চলে যায়। কোয়ান্টাম খুব ছোট হলে কনটেক্সট সুইচ বাড়ে।",
    category: "OS",
    difficulty: "Easy",
  },
  {
    question: "ডেডলক হওয়ার জন্য Coffman-এর প্রয়োজনীয় শর্ত কয়টি?",
    options: ["২টি", "৩টি", "৪টি", "৫টি"],
    answer: 2,
    explanation:
      "চারটি শর্ত একসাথে লাগে: মিউচুয়াল এক্সক্লুশন, হোল্ড অ্যান্ড ওয়েট, নো প্রিএম্পশন এবং সার্কুলার ওয়েট। একটি শর্তও না থাকলে ডেডলক হয় না।",
    category: "OS",
    difficulty: "Medium",
  },
  {
    question: "ভার্চুয়াল মেমরির প্রধান সুবিধা কোনটি?",
    options: [
      "ফিজিক্যাল RAM-এর চেয়ে বড় প্রসেস চালানো যায়",
      "CPU-এর ক্লক স্পিড বেড়ে যায়",
      "ক্যাশ মিস শূন্য হয়ে যায়",
      "ফাইল সিস্টেমের আর দরকার থাকে না",
    ],
    answer: 0,
    explanation:
      "ভার্চুয়াল মেমরি লজিক্যাল অ্যাড্রেস স্পেসকে ফিজিক্যাল মেমরি থেকে আলাদা করে। দরকারি পেজ RAM-এ থাকে, বাকি ডিস্কে। তাই প্রসেস ফিজিক্যাল মেমরির চেয়ে বড় হতে পারে।",
    category: "OS",
    difficulty: "Medium",
  },
  {
    question: "থ্র্যাশিং কখন ঘটে?",
    options: [
      "CPU দীর্ঘক্ষণ আইডল থাকলে",
      "পেজ ফল্ট এত বাড়ে যে সময় কাটে মূলত পেজ আদান-প্রদানে",
      "কম্পাইলার অপটিমাইজেশন বন্ধ থাকলে",
      "ডিস্ক পুরো খালি থাকলে",
    ],
    answer: 1,
    explanation:
      "অতিরিক্ত মাল্টিপ্রোগ্রামিংয়ে প্রতিটি প্রসেসের ওয়ার্কিং সেট মেমরিতে ধরে না। বারবার পেজ ফল্ট হয় এবং CPU-এর চেয়ে পেজিংয়ে বেশি সময় যায়। একে থ্র্যাশিং বলে।",
    category: "OS",
    difficulty: "Hard",
  },
  {
    question: "বেলাডির অ্যানোমালি কোন পেজ-রিপ্লেসমেন্ট অ্যালগরিদমে দেখা যায়?",
    options: ["LRU", "FIFO", "Optimal", "LFU"],
    answer: 1,
    explanation:
      "বেলাডির অ্যানোমালিতে ফ্রেম বাড়ালেও পেজ ফল্ট কমে না, বরং বাড়ে। এটি FIFO-তে দেখা যায়। LRU ও Optimal স্ট্যাক অ্যালগরিদম, এগুলোতে এই অ্যানোমালি হয় না।",
    category: "OS",
    difficulty: "Hard",
  },
  {
    question: "ব্যাংকার্স অ্যালগরিদম কোন কাজে লাগে?",
    options: [
      "শুধু ডেডলক ডিটেকশন",
      "পেজ রিপ্লেসমেন্ট",
      "ডেডলক অ্যাভয়েডেন্স",
      "CPU শিডিউলিং",
    ],
    answer: 2,
    explanation:
      "ব্যাংকার্স অ্যালগরিদম নতুন অনুরোধ মঞ্জুর করার আগে সিস্টেম সেফ স্টেটে থাকবে কি না পরীক্ষা করে। এটি ডেডলক এড়ানোর (avoidance) পদ্ধতি। ডিটেকশন আলাদা, যেমন ওয়েট-ফর গ্রাফ।",
    category: "OS",
    difficulty: "Medium",
  },
  {
    question: "কনটেক্সট সুইচের সময় অপারেটিং সিস্টেম কী সংরক্ষণ করে?",
    options: [
      "প্রসেসের রেজিস্টার ও প্রসেস স্টেট",
      "শুধু সোর্স কোড",
      "ব্যবহারকারীর পাসওয়ার্ড",
      "DNS রেকর্ড",
    ],
    answer: 0,
    explanation:
      "CPU এক প্রসেস ছেড়ে অন্যটিতে যাওয়ার আগে প্রোগ্রাম কাউন্টার, রেজিস্টার ও অন্যান্য স্টেট PCB-তে সেভ করে, যাতে পরে সেখান থেকে চালানো যায়।",
    category: "OS",
    difficulty: "Easy",
  },
  {
    question: "ওয়াটারফল মডেলের একটি বড় সীমাবদ্ধতা কী?",
    options: [
      "পরের ধাপে যাওয়ার পর প্রয়োজন বদলানো কঠিন ও দামি",
      "এতে কোনো ডকুমেন্ট থাকে না",
      "এতে টেস্টিং ধাপই নেই",
      "এটি শুধু এক সপ্তাহের প্রজেক্টের জন্য",
    ],
    answer: 0,
    explanation:
      "ওয়াটারফলে ধাপগুলো ক্রমানুসারে এগোয় এবং আগের ধাপে ফেরা কষ্টসাধ্য। চাহিদা দেরিতে বদলালে পুনঃকাজ অনেক বাড়ে। টেস্টিং একটি আলাদা ধাপ হিসেবে থাকে, তবে দেরিতে।",
    category: "Software Engineering",
    difficulty: "Easy",
  },
  {
    question: "ব্ল্যাক-বক্স টেস্টিংয়ে কোনটি দেখা হয় না?",
    options: ["ইনপুট", "প্রত্যাশিত আউটপুট", "প্রোগ্রামের ভেতরের কোড", "প্রয়োজনীয় স্পেসিফিকেশন"],
    answer: 2,
    explanation:
      "ব্ল্যাক-বক্স টেস্ট বাইরের আচরণ মেলায়: ইনপুট দিয়ে আউটপুট স্পেসিফিকেশন অনুযায়ী কি না। ভেতরের কোড না দেখেই এটি করা হয়। কোডের পথ দেখে টেস্ট হলো হোয়াইট-বক্স।",
    category: "Software Engineering",
    difficulty: "Easy",
  },
  {
    question: "ভালো মডিউলার ডিজাইনে কী কাম্য?",
    options: [
      "কম কোহেশন, বেশি কাপলিং",
      "বেশি কোহেশন, কম কাপলিং",
      "কম কোহেশন, কম কাপলিং",
      "বেশি কোহেশন, বেশি কাপলিং",
    ],
    answer: 1,
    explanation:
      "একটি মডিউলের ভেতরের অংশ একই দায়িত্বে বাঁধা থাকলে কোহেশন বেশি। মডিউলগুলো একে অপরের ওপর কম নির্ভর করলে কাপলিং কম। এই জোড়া সফটওয়্যার বদলানো সহজ করে।",
    category: "Software Engineering",
    difficulty: "Medium",
  },
  {
    question: "সফটওয়্যার ইঞ্জিনিয়ারিংয়ে SRS-এর পূর্ণরূপ কী?",
    options: [
      "Software Requirements Specification",
      "System Runtime Service",
      "Secure Routing Standard",
      "Source Review Sheet",
    ],
    answer: 0,
    explanation:
      "SRS-এ কার্যকরী ও অকার্যকরী প্রয়োজন, ইন্টারফেস এবং সীমাবদ্ধতা লেখা থাকে। এটি ডিজাইন ও টেস্টের ভিত্তি। ক্লায়েন্ট ও ডেভেলপার একই প্রত্যাশায় আসতে এটি ব্যবহার করে।",
    category: "Software Engineering",
    difficulty: "Easy",
  },
  {
    question: "বিটা টেস্টিং সাধারণত কোথায় হয়?",
    options: [
      "শুধু কম্পাইলারের ভেতরে",
      "ডেভেলপারের ল্যাবে, ডেভেলপমেন্ট টিম দিয়ে",
      "ইউনিট টেস্ট ফ্রেমওয়ার্কের ভেতরে",
      "প্রকৃত ব্যবহারকারীর পরিবেশে",
    ],
    answer: 3,
    explanation:
      "আলফা টেস্ট ডেভেলপারের নিয়ন্ত্রিত পরিবেশে হয়। বিটা টেস্ট নির্বাচিত ব্যবহারকারীরা তাদের নিজের পরিবেশে করেন, যাতে বাস্তব ত্রুটি ধরা পড়ে।",
    category: "Software Engineering",
    difficulty: "Medium",
  },
  {
    question: "টপ-ডাউন ইন্টিগ্রেশন টেস্টিংয়ে নিচের অনুপস্থিত মডিউলের বদলে কী বসানো হয়?",
    options: ["ড্রাইভার", "স্টাব", "লোড জেনারেটর", "প্রোফাইলার"],
    answer: 1,
    explanation:
      "টপ-ডাউনে উপরের মডিউল আগে জোড়া লাগে, নিচের মডিউল না থাকলে স্টাব তার জায়গা নেয়। বটম-আপে নিচের মডিউল আগে জোড়া লাগে এবং উপরের কলারের বদলে ড্রাইভার লাগে।",
    category: "Software Engineering",
    difficulty: "Hard",
  },
  {
    question: "স্পাইরাল মডেল বিশেষভাবে কীসের ওপর জোর দেয়?",
    options: ["কোডের লাইন সংখ্যা", "শুধু ডেটাবেস নরমালাইজেশন", "ঝুঁকি বিশ্লেষণ", "একবারে পুরো ডেলিভারি"],
    answer: 2,
    explanation:
      "Boehm-এর স্পাইরাল মডেলের প্রতিটি চক্রে পরিকল্পনা, ঝুঁকি বিশ্লেষণ, প্রকৌশল ও মূল্যায়ন থাকে। উচ্চ ঝুঁকির প্রজেক্টে প্রোটোটাইপ করে ঝুঁকি কমানো এর মূল কথা।",
    category: "Software Engineering",
    difficulty: "Hard",
  },
  {
    question: "nটি ফ্লিপ-ফ্লপ দিয়ে একটি FSM-এ সর্বোচ্চ কতটি ভিন্ন স্টেট প্রকাশ করা যায়?",
    options: ["n", "2n", "n^2", "2^n"],
    answer: 3,
    explanation:
      "প্রতিটি ফ্লিপ-ফ্লপ ০ অথবা ১ ধরে। nটি ফ্লিপ-ফ্লপের সম্ভাব্য বিন্যাস 2^n। তাই 30টি স্টেট লাগলে অন্তত 5টি ফ্লিপ-ফ্লপ দরকার, কারণ 2^4 = 16 এবং 2^5 = 32।",
    category: "Digital Logic",
    difficulty: "Hard",
  },
  {
    question:
      "C ভাষায় নিচের কোডে a = 75 হলে আউটপুট কী হবে?\n\nif (a >= 90) printf(\"A\");\nif (a >= 80) printf(\"B\");\nif (a >= 70) printf(\"C\");\nif (a >= 60) printf(\"D\");\nelse printf(\"F\");",
    options: ["CD", "BCD", "F", "C"],
    answer: 0,
    explanation:
      "প্রতিটি if আলাদা। else কেবল শেষ শর্ত if (a >= 60)-এর সঙ্গে বাঁধা। a = 75 হলে প্রথম দুটি শর্ত মিথ্যা। a >= 70 সত্য, তাই C ছাপা হয়। a >= 60-ও সত্য, তাই else চলে না এবং D ছাপা হয়। আউটপুট CD।",
    category: "Programming",
    difficulty: "Medium",
  },
  {
    question: "Java-তে private অ্যাক্সেস স্পেসিফায়ারের আওতা কোনটি?",
    options: [
      "শুধু ঘোষণাকারী ক্লাসের ভেতরে",
      "একই প্যাকেজের সব ক্লাস",
      "সব সাবক্লাস",
      "পুরো প্রজেক্ট",
    ],
    answer: 0,
    explanation:
      "private সদস্য কেবল সেই ক্লাসের নিজের কোড থেকে দেখা যায়। একই প্যাকেজের অন্য ক্লাস পায় ডিফল্ট (package-private) অ্যাক্সেস। protected প্যাকেজ এবং সাবক্লাসকে দেয়। public সব জায়গায় দৃশ্যমান।",
    category: "Programming",
    difficulty: "Medium",
  },
  {
    question: "নেটওয়ার্কে অবাঞ্ছিত ট্রাফিক আটকাতে কোনটি ব্যবহার হয়?",
    options: ["ফায়ারওয়াল", "রিপিটার", "হাব", "মডেম"],
    answer: 0,
    explanation:
      "ফায়ারওয়াল নিয়ম দেখে কোন প্যাকেট ঢুকবে বা বের হবে ঠিক করে। রিপিটার সিগন্যাল বাড়ায়, হাব ফ্রেম সব পোর্টে ছড়ায়, মডেম সিগন্যাল রূপান্তর করে।",
    category: "networks",
    difficulty: "Easy",
  },
  {
    question: "কোন এনক্রিপশনে এনক্রিপ্ট ও ডিক্রিপ্ট করতে একই গোপন কী লাগে?",
    options: ["AES", "RSA", "ECC", "ডিজিটাল সিগনেচার অ্যালগরিদম"],
    answer: 0,
    explanation:
      "AES একটি সিমেট্রিক অ্যালগরিদম: একই কী দিয়ে তালা লাগে এবং খোলে। RSA ও ECC অ্যাসিমেট্রিক, যেখানে পাবলিক ও প্রাইভেট কী আলাদা।",
    category: "networks",
    difficulty: "Hard",
  },
  {
    question: "BIOS সাধারণত কোন ধরনের উপাদান?",
    options: ["অ্যাপ্লিকেশন সফটওয়্যার", "ফার্মওয়্যার", "শুধু একটি প্রোগ্রামিং ভাষা", "নেটওয়ার্ক প্রোটোকল"],
    answer: 1,
    explanation:
      "BIOS মাদারবোর্ডের রমে থাকা ফার্মওয়্যার। কম্পিউটার চালু হলে এটি হার্ডওয়্যার পরীক্ষা করে অপারেটিং সিস্টেমকে বুট করতে দেয়।",
    category: "os",
    difficulty: "Easy",
    source: "আইসিটি অধিদপ্তর · সহকারী প্রোগ্রামার",
  },
  {
    question: "লিংকড লিস্টের একটি নোডে ডেটা ছাড়া দ্বিতীয় যে জিনিসটি থাকে, সেটি কী?",
    options: ["ক্যারেক্টার পয়েন্টার", "ফাইল হ্যান্ডেল", "পরের নোডের পয়েন্টার", "হ্যাশ কোড"],
    answer: 2,
    explanation:
      "সিঙ্গলি লিংকড লিস্টের নোডে ডেটা এবং পরের নোডের ঠিকানা (pointer) থাকে। এই পয়েন্টার না থাকলে তালিকার পরের উপাদানে যাওয়া যায় না।",
    category: "dsa",
    difficulty: "Medium",
    source: "আইসিটি অধিদপ্তর · সহকারী প্রোগ্রামার",
  },
  {
    question: "সাধারণ কম্পিউটারে কোন মেমরি সবচেয়ে দ্রুত?",
    options: ["হার্ড ডিস্ক", "কীবোর্ড বাফার", "ক্যাশ", "অপটিক্যাল ডিস্ক"],
    answer: 2,
    explanation:
      "ক্যাশ CPU-এর খুব কাছে থাকে এবং SRAM দিয়ে বানানো, তাই অ্যাক্সেস RAM-এর চেয়েও দ্রুত। হার্ড ডিস্ক যান্ত্রিক বা ফ্ল্যাশ হলেও ক্যাশের চেয়ে অনেক ধীর।",
    category: "os",
    difficulty: "Easy",
    source: "আইসিটি অধিদপ্তর · সহকারী প্রোগ্রামার",
  },
  {
    question: "OOP-তে একই মেথড কল ভিন্ন অবজেক্টে ভিন্ন আচরণ করলে তাকে কী বলে?",
    options: ["পলিমরফিজম", "এনক্যাপসুলেশন", "কাপলিং", "নরমালাইজেশন"],
    answer: 0,
    explanation:
      "পলিমরফিজম মানে অনেক রূপ। সুপারক্লাসের রেফারেন্স দিয়ে সাবক্লাসের ওভাররাইড করা মেথড ডাকলে রানটাইমে সঠিক ভার্সন চলে। এনক্যাপসুলেশন ডেটা লুকানোর নীতি।",
    category: "swe",
    difficulty: "Easy",
  },
  {
    question: "সাবক্লাস সুপারক্লাসের বৈশিষ্ট্য পেলে সেটি OOP-এর কোন নীতি?",
    options: ["কম্পোজিশন", "ইনহেরিট্যান্স", "ওভারলোডিং শুধু", "অ্যাগ্রিগেশন"],
    answer: 1,
    explanation:
      "ইনহেরিট্যান্সে সাবক্লাস সুপারক্লাসের ফিল্ড ও মেথড পায় এবং নিজেরটা যোগ করতে পারে। কম্পোজিশনে একটি অবজেক্ট অন্য অবজেক্টকে সদস্য হিসেবে রাখে, উত্তরাধিকার নয়।",
    category: "swe",
    difficulty: "Easy",
  },
  {
    question: "পেট্রোবাংলার পূর্ণ নাম কী?",
    options: [
      "বাংলাদেশ তেল, গ্যাস ও খনিজ সম্পদ কর্পোরেশন",
      "বাংলাদেশ পেট্রোলিয়াম কর্পোরেশন",
      "জ্বালানি উন্নয়ন বোর্ড",
      "তেল ও খনিজ অনুসন্ধান সংস্থা",
    ],
    answer: 0,
    explanation:
      "পেট্রোবাংলা হলো বাংলাদেশ তেল, গ্যাস ও খনিজ সম্পদ কর্পোরেশন। এটি বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ মন্ত্রণালয়ের অধীন একটি সংস্থা।",
    category: "energy",
    difficulty: "Easy",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "পেট্রোবাংলা কোন মন্ত্রণালয়ের অধীনে?",
    options: [
      "বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ মন্ত্রণালয়",
      "শিল্প মন্ত্রণালয়",
      "বিজ্ঞান ও প্রযুক্তি মন্ত্রণালয়",
      "পরিবেশ, বন ও জলবায়ু পরিবর্তন মন্ত্রণালয়",
    ],
    answer: 0,
    explanation:
      "পেট্রোবাংলা ও এর কোম্পানিগুলো বিদ্যুৎ, জ্বালানি ও খনিজ সম্পদ মন্ত্রণালয়ের আওতায় তেল ও গ্যাস খাত দেখে।",
    category: "energy",
    difficulty: "Easy",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "BAPEX-এর প্রধান কাজ কোনটি?",
    options: [
      "ঢাকায় বাসাবাড়িতে গ্যাস বিল বিতরণ",
      "তেল ও গ্যাস অনুসন্ধান ও উত্তোলন",
      "সারা দেশে উচ্চচাপের সঞ্চালন পাইপলাইন চালানো",
      "শুধু সিএনজি স্টেশন লাইসেন্স দেওয়া",
    ],
    answer: 1,
    explanation:
      "BAPEX (Bangladesh Petroleum Exploration and Production Company) পেট্রোবাংলার অনুসন্ধান ও উত্তোলন কোম্পানি। সঞ্চালন GTCL-এর কাজ, নগর বিতরণ তিতাসের মতো কোম্পানির কাজ।",
    category: "energy",
    difficulty: "Medium",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "GTCL প্রধানত কী করে?",
    options: [
      "উচ্চচাপের পাইপলাইনে গ্যাস সঞ্চালন",
      "গভীর সমুদ্রে মাছ ধরা",
      "বিদ্যুৎ কেন্দ্রের কয়লা আমদানি",
      "খুচরা সিএনজি বিক্রি",
    ],
    answer: 0,
    explanation:
      "Gas Transmission Company Limited জাতীয় গ্রিডে উচ্চচাপের পাইপলাইনে গ্যাস সঞ্চালন করে। স্থানীয় গ্রাহকের কাছে বিতরণ আলাদা ডিস্ট্রিবিউশন কোম্পানির দায়িত্ব।",
    category: "energy",
    difficulty: "Medium",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "তিতাস গ্যাস ফিল্ড কোন জেলায়?",
    options: ["সিলেট", "ব্রাহ্মণবাড়িয়া", "খুলনা", "যশোর"],
    answer: 1,
    explanation:
      "তিতাস গ্যাস ফিল্ড ব্রাহ্মণবাড়িয়ায়। এটি দেশের বড় গ্যাসক্ষেত্রগুলোর একটি এবং তিতাস নদীর নামে পরিচিত।",
    category: "energy",
    difficulty: "Easy",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "জলালাবাদ গ্যাস কোম্পানি কোন অঞ্চলে গ্যাস বিতরণ করে?",
    options: ["সিলেট", "খুলনা", "রাজশাহী", "বরিশাল"],
    answer: 0,
    explanation:
      "Jalalabad Gas Transmission and Distribution System Limited সিলেট অঞ্চলে গ্যাস সরবরাহ করে। খুলনা অঞ্চল সুন্দরবন গ্যাস কোম্পানির আওতায়।",
    category: "energy",
    difficulty: "Medium",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "RPGCL কোন জ্বালানি নিয়ে কাজ করে?",
    options: ["কয়লা", "সিএনজি", "পারমাণবিক জ্বালানি", "জলবিদ্যুৎ"],
    answer: 1,
    explanation:
      "Rupantarita Prakritik Gas Company Limited রূপান্তরিত প্রাকৃতিক গ্যাস, অর্থাৎ সিএনজি, নিয়ে কাজ করে। এটি পেট্রোবাংলার একটি কোম্পানি।",
    category: "energy",
    difficulty: "Medium",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "গ্যাস পাইপলাইনে SCADA কী কাজে লাগে?",
    options: [
      "দূর থেকে চাপ, প্রবাহ ও ভালভ নজরদারি ও নিয়ন্ত্রণ",
      "গ্রাহকের গ্যাস বিল ছাপানো",
      "নতুন কূপ খননের লাইসেন্স দেওয়া",
      "পেট্রোল পাম্পের হিসাব রাখা",
    ],
    answer: 0,
    explanation:
      "SCADA (Supervisory Control and Data Acquisition) দূরের স্টেশন থেকে পাইপলাইনের চাপ, প্রবাহ ও ভালভ দেখে এবং নিয়ন্ত্রণ করে। জ্বালানি নেটওয়ার্কের আইটি তদারকির এটি একটি মূল ব্যবস্থা।",
    category: "energy",
    difficulty: "Hard",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "কর্ণফুলী গ্যাস ডিস্ট্রিবিউশন কোম্পানি কোন অঞ্চলে গ্যাস বিতরণ করে?",
    options: ["চট্টগ্রাম", "রংপুর", "ময়মনসিংহ", "রাজশাহী"],
    answer: 0,
    explanation:
      "Karnaphuli Gas Distribution Company Limited চট্টগ্রাম অঞ্চলে গ্যাস বিতরণ করে। রাজশাহী-রংপুর অঞ্চল পশ্চিমাঞ্চল গ্যাস কোম্পানির আওতায়।",
    category: "energy",
    difficulty: "Medium",
    orgs: ["petrobangla"],
    source: "পেট্রোবাংলা",
  },
  {
    question: "“বিদ্রোহী কবি” বলতে কাকে বোঝায়?",
    options: ["কাজী নজরুল ইসলাম", "রবীন্দ্রনাথ ঠাকুর", "জসীমউদ্‌দীন", "সুফিয়া কামাল"],
    answer: 0,
    explanation: "কাজী নজরুল ইসলামকে বিদ্রোহী কবি বলা হয়। তাঁর “বিদ্রোহী” কবিতা এই পরিচয়ের সঙ্গে যুক্ত।",
    category: "bangla",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "রবীন্দ্রনাথ ঠাকুর কোন গ্রন্থের জন্য সাহিত্যে নোবেল পুরস্কার পান?",
    options: ["গীতাঞ্জলি", "সোনার তরী", "গোরা", "চোখের বালি"],
    answer: 0,
    explanation: "রবীন্দ্রনাথ ঠাকুর ১৯১৩ সালে গীতাঞ্জলির জন্য সাহিত্যে নোবেল পুরস্কার পান। এটি বাংলা সাহিত্যের একটি মৌলিক তথ্য।",
    category: "bangla",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "“জল”-এর সমার্থক শব্দ কোনটি?",
    options: ["বারি", "অগ্নি", "বায়ু", "মৃত্তিকা"],
    answer: 0,
    explanation: "বারি মানে জল। অগ্নি আগুন, বায়ু বাতাস এবং মৃত্তিকা মাটি বোঝায়।",
    category: "bangla",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "“দিন”-এর বিপরীতার্থক শব্দ কোনটি?",
    options: ["রাত", "প্রভাত", "সকাল", "দুপুর"],
    answer: 0,
    explanation: "দিনের বিপরীত রাত। প্রভাত, সকাল ও দুপুর দিনেরই বিভিন্ন সময়।",
    category: "bangla",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "“হাত-পা” কোন সমাসের উদাহরণ?",
    options: ["দ্বন্দ্ব", "তৎপুরুষ", "কর্মধারয়", "অব্যয়ীভাব"],
    answer: 0,
    explanation: "হাত ও পা দুটি সমান পদ একসঙ্গে মিলে দ্বন্দ্ব সমাস হয়েছে। এখানে একটি পদ অন্যটির বিশেষণ নয়।",
    category: "bangla",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "“অতি + উত্তম” সন্ধি করলে কী হয়?",
    options: ["অত্যুত্তম", "অতিউত্তম", "অতুত্তম", "অত্যত্তম"],
    answer: 0,
    explanation: "ই-কারের সঙ্গে উ-কার মিললে য-ফলা হয়। তাই অতি + উত্তম = অত্যুত্তম।",
    category: "bangla",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "“যে নিজে নিজে শেখে”—এক কথায় কী?",
    options: ["স্বশিক্ষিত", "বহুশ্রুত", "কৃতবিদ্য", "পণ্ডিত"],
    answer: 0,
    explanation: "নিজে নিজে শিক্ষালাভ করলে তাকে স্বশিক্ষিত বলে। বহুশ্রুত মানে বহু শাস্ত্র শুনেছেন এমন ব্যক্তি।",
    category: "bangla",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "বাংলা একাডেমি কোন সালে প্রতিষ্ঠিত হয়?",
    options: ["১৯৫৫", "১৯৪৭", "১৯৫২", "১৯৭২"],
    answer: 0,
    explanation: "বাংলা একাডেমি ১৯৫৫ সালের ৩ ডিসেম্বর ঢাকায় প্রতিষ্ঠিত হয়। ভাষা আন্দোলনের প্রেক্ষাপটে বাংলা ভাষা ও সাহিত্যের প্রতিষ্ঠান হিসেবে এটি গড়ে ওঠে।",
    category: "bangla",
    difficulty: "Hard",
    source: "সরকারি নিয়োগ · বাংলা",
  },
  {
    question: "Choose the synonym of “brief”.",
    options: ["short", "long", "late", "loud"],
    answer: 0,
    explanation: "Brief means short in time or words. Long is closer to its opposite.",
    category: "english",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "Choose the antonym of “ancient”.",
    options: ["modern", "old", "historic", "early"],
    answer: 0,
    explanation: "Ancient means very old. Its opposite among the options is modern.",
    category: "english",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "He has been working here ___ 2020.",
    options: ["since", "for", "at", "by"],
    answer: 0,
    explanation: "Since is used with a starting point, such as 2020. For is used with a length of time, such as five years.",
    category: "english",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "Choose the correct sentence.",
    options: ["The letter was written yesterday.", "The letter wrote yesterday.", "The letter is write yesterday.", "The letter writing yesterday."],
    answer: 0,
    explanation: "The letter receives the action, so the passive form “was written” is correct. The simple past of write is not used with the letter as the subject here.",
    category: "english",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "She said, “I am tired.” The indirect speech is:",
    options: ["She said that she was tired.", "She said that I am tired.", "She said that she is tired.", "She told that I was tired."],
    answer: 0,
    explanation: "In reported speech the present “am” shifts to “was”, and “I” changes to “she”. The reporting verb “said” takes “that”, not “told” without an object.",
    category: "english",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "If it rains, we ___ at home.",
    options: ["will stay", "stayed", "staying", "have stay"],
    answer: 0,
    explanation: "This is a first conditional: if + present simple, then will + base verb. The result of a possible future rain is “will stay”.",
    category: "english",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "___ honest person keeps a promise.",
    options: ["An", "A", "The", "No article"],
    answer: 0,
    explanation: "Honest begins with a vowel sound, so the indefinite article is “an”, not “a”.",
    category: "english",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "“A blessing in disguise” means:",
    options: ["something good that first seemed bad", "a hidden danger", "a public reward", "a broken promise"],
    answer: 0,
    explanation: "The idiom describes a benefit that is not obvious at first. It does not mean danger or a reward given in public.",
    category: "english",
    difficulty: "Hard",
    source: "সরকারি নিয়োগ · ইংরেজি",
  },
  {
    question: "১২ ও ১৮-এর ল.সা.গু. কত?",
    options: ["৩৬", "৬", "২৪", "৪৮"],
    answer: 0,
    explanation: "১২ = ২×২×৩ এবং ১৮ = ২×৩×৩। সাধারণ গুণনীয়কের সর্বোচ্চ ঘাত নিয়ে ল.সা.গু. হয় ২×২×৩×৩ = ৩৬। গ.সা.গু. ৬।",
    category: "math",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "২০০ টাকার জিনিস ২৫% লাভে বিক্রি করলে বিক্রয়মূল্য কত?",
    options: ["২৫০ টাকা", "২২৫ টাকা", "১৫০ টাকা", "২৭৫ টাকা"],
    answer: 0,
    explanation: "২৫% লাভ মানে ২০০ টাকার এক-চতুর্থাংশ, অর্থাৎ ৫০ টাকা। বিক্রয়মূল্য ২০০ + ৫০ = ২৫০ টাকা।",
    category: "math",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "১০, ২০ ও ৩০-এর গড় কত?",
    options: ["২০", "১৫", "২৫", "৩০"],
    answer: 0,
    explanation: "গড় = (১০ + ২০ + ৩০) ÷ ৩ = ৬০ ÷ ৩ = ২০।",
    category: "math",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "একটি সংখ্যার ২০% হলে ৩০। সংখ্যাটি কত?",
    options: ["১৫০", "৬০", "১২০", "৯০"],
    answer: 0,
    explanation: "২০% মানে এক-পঞ্চমাংশ। এক-পঞ্চমাংশ ৩০ হলে পূর্ণ সংখ্যা ৩০ × ৫ = ১৫০।",
    category: "math",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "৪ জন একটি কাজ ৬ দিনে শেষ করে। একই হারে ৩ জন করলে কত দিন লাগবে?",
    options: ["৮ দিন", "৬ দিন", "১০ দিন", "৫ দিন"],
    answer: 0,
    explanation: "মোট কাজ ৪ × ৬ = ২৪ জন-দিন। ৩ জন করলে সময় ২৪ ÷ ৩ = ৮ দিন। লোক কমলে দিন বাড়ে।",
    category: "math",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "৪০ টাকা ৩ : ৫ অনুপাতে ভাগ করলে বড় অংশ কত?",
    options: ["২৫ টাকা", "১৫ টাকা", "২০ টাকা", "৩০ টাকা"],
    answer: 0,
    explanation: "মোট অংশ ৩ + ৫ = ৮। প্রতি অংশ ৪০ ÷ ৮ = ৫ টাকা। বড় অংশ ৫ × ৫ = ২৫ টাকা।",
    category: "math",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "২, ৬, ১৮, ৫৪, ... ধারাটির পরের সংখ্যা কত?",
    options: ["১৬২", "১০৮", "৭২", "৮১"],
    answer: 0,
    explanation: "প্রতিটি পদ আগের পদের ৩ গুণ। ৫৪ × ৩ = ১৬২। এটি একটি গুণোত্তর ধারা।",
    category: "math",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "৫টি চেয়ারের দাম ২,০০০ টাকা হলে একই দরে ৮টির দাম কত?",
    options: ["৩,২০০ টাকা", "২,৮০০ টাকা", "২,৪০০ টাকা", "৪,০০০ টাকা"],
    answer: 0,
    explanation: "একটির দাম ২,০০০ ÷ ৫ = ৪০০ টাকা। ৮টির দাম ৪০০ × ৮ = ৩,২০০ টাকা।",
    category: "math",
    difficulty: "Hard",
    source: "সরকারি নিয়োগ · গণিত",
  },
  {
    question: "বাংলাদেশ কোন সালে স্বাধীন হয়?",
    options: ["১৯৭১", "১৯৪৭", "১৯৫২", "১৯৭৫"],
    answer: 0,
    explanation: "বাংলাদেশ ১৯৭১ সালের ২৬ মার্চ স্বাধীনতা ঘোষণা করে এবং ১৬ ডিসেম্বর বিজয় অর্জন করে। ১৯৪৭ ভারত-পাকিস্তান বিভক্তির সাল।",
    category: "gk",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
  {
    question: "আন্তর্জাতিক মাতৃভাষা দিবস কোন তারিখে পালিত হয়?",
    options: ["২১ ফেব্রুয়ারি", "২৬ মার্চ", "১৬ ডিসেম্বর", "৭ মার্চ"],
    answer: 0,
    explanation: "১৯৫২ সালের ২১ ফেব্রুয়ারি ভাষা আন্দোলনের শহীদ দিবস। ইউনেস্কোর স্বীকৃতির পর এই দিনটি আন্তর্জাতিক মাতৃভাষা দিবস।",
    category: "gk",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
  {
    question: "বাংলাদেশের মুদ্রার নাম কী?",
    options: ["টাকা", "রুপি", "ডলার", "রিয়াল"],
    answer: 0,
    explanation: "বাংলাদেশের মুদ্রা টাকা। রুপি ভারত ও পাকিস্তানের মুদ্রা, ডলার যুক্তরাষ্ট্রের।",
    category: "gk",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
  {
    question: "পানির রাসায়নিক সংকেত কোনটি?",
    options: ["H₂O", "CO₂", "NaCl", "O₂"],
    answer: 0,
    explanation: "এক অণু পানিতে দুটি হাইড্রোজেন ও একটি অক্সিজেন থাকে, তাই সংকেত H₂O। CO₂ কার্বন ডাই-অক্সাইড।",
    category: "gk",
    difficulty: "Easy",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
  {
    question: "ছয় দফা দাবি ১৯৬৬ সালে পেশ করেন কে?",
    options: ["শেখ মুজিবুর রহমান", "মওলানা আবদুল হামিদ খান ভাসানী", "এ. কে. ফজলুল হক", "হোসেন শহীদ সোহরাওয়ার্দী"],
    answer: 0,
    explanation: "১৯৬৬ সালে শেখ মুজিবুর রহমান বাঙালির স্বায়ত্তশাসনের ছয় দফা পেশ করেন। এটি বাংলাদেশের স্বাধিকার আন্দোলনের একটি মূল দলিল।",
    category: "gk",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
  {
    question: "বাংলাদেশের সংবিধান গৃহীত হয় কোন সালে?",
    options: ["১৯৭২", "১৯৭১", "১৯৭৩", "১৯৭৫"],
    answer: 0,
    explanation: "গণপরিষদ ১৯৭২ সালের ৪ নভেম্বর সংবিধান গ্রহণ করে। এটি ১৬ ডিসেম্বর ১৯৭২ থেকে কার্যকর হয়।",
    category: "gk",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
  {
    question: "জাতিসংঘের সদর দপ্তর কোথায়?",
    options: ["নিউইয়র্ক", "জেনেভা", "প্যারিস", "লন্ডন"],
    answer: 0,
    explanation: "জাতিসংঘের প্রধান সদর দপ্তর যুক্তরাষ্ট্রের নিউইয়র্কে। জেনেভায় এর ইউরোপীয় কার্যালয় আছে।",
    category: "gk",
    difficulty: "Medium",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
  {
    question: "মুক্তিযুদ্ধের চূড়ান্ত বিজয় কোন তারিখে অর্জিত হয়?",
    options: ["১৬ ডিসেম্বর ১৯৭১", "২৬ মার্চ ১৯৭১", "৭ মার্চ ১৯৭১", "১৪ ডিসেম্বর ১৯৭১"],
    answer: 0,
    explanation: "১৬ ডিসেম্বর ১৯৭১ পাকিস্তানি বাহিনী আত্মসমর্পণ করলে বিজয় দিবস পালিত হয়। ২৬ মার্চ স্বাধীনতা দিবস এবং ১৪ ডিসেম্বর শহীদ বুদ্ধিজীবী দিবস।",
    category: "gk",
    difficulty: "Hard",
    source: "সরকারি নিয়োগ · সাধারণ জ্ঞান",
  },
];

const CATEGORY_MAP = {
  Networks: "networks",
  DBMS: "dbms",
  DSA: "dsa",
  OS: "os",
  "Software Engineering": "swe",
  Programming: "swe",
  "Digital Logic": "swe",
};

const CATEGORY_IDS = ["bangla", "english", "math", "gk", "networks", "dbms", "dsa", "os", "swe", "energy"];
const ORG_IDS = ["petrobangla", "doict", "bcs", "bank"];

for (const question of pastPapers) {
  question.category = CATEGORY_MAP[question.category] || question.category;
  if (!question.orgs) question.orgs = ORG_IDS.slice();
  if (!question.source) question.source = "সরকারি CSE/IT নিয়োগ";
}

const CATEGORY_BRIEF = {
  networks: "Computer networks and security only: OSI, TCP/IP, routing, cryptography, firewalls, subnetting.",
  dbms: "DBMS and SQL only: normalization, indexing, ACID, queries, joins, transactions.",
  dsa: "Data structures and algorithms only: trees, graphs, sorting, complexity, dynamic programming, stack and queue.",
  os: "Operating systems only: scheduling, deadlock, memory management, paging, virtual memory.",
  swe: "Software engineering and OOP only: polymorphism, inheritance, design patterns, SDLC, agile, testing.",
  energy: "Petrobangla and the Bangladesh oil and gas sector only: companies, gas fields, transmission, distribution, and IT systems such as SCADA used in that sector.",
  bangla: "Bangla language and literature for a Bangladesh recruitment MCQ: synonyms, antonyms, idioms, one-word substitution, sandhi, samas, and major writers. Write the question and options in Bengali.",
  english: "English grammar and vocabulary for a Bangladesh recruitment MCQ: synonyms, antonyms, articles, prepositions, tense, voice, narration, conditionals, and idioms. Write the question and options in English.",
  math: "Arithmetic and mental ability for a Bangladesh recruitment MCQ: number system, LCM and HCF, unitary method, work and time, profit and loss, percentage, ratio, average, series, and simple reasoning. Write the question and options in Bengali.",
  gk: "General knowledge for a Bangladesh recruitment MCQ: Bangladesh affairs, Liberation War, Language Movement, international affairs, and everyday general science. Write the question and options in Bengali.",
  mixed: "A full Petrobangla engineering paper mix: Bangla, English, mathematics and mental ability, general knowledge, networks, DBMS, DSA, operating systems, software engineering, and Petrobangla energy. Use at least six different category ids.",
};

const ORG_BRIEF = {
  all: "Bangladesh government recruitment exams, including Petrobangla, the Department of ICT, BCS, and state banks.",
  petrobangla: "Petrobangla and its companies, especially Assistant Manager (CSE/IT) and technical posts.",
  doict: "Department of ICT and ministry assistant programmer or computer-operator exams.",
  bcs: "BCS and other civil-service technical or ICT exams.",
  bank: "state-owned bank IT officer, data-entry, and computer-operator exams.",
};

function buildPrompt(category, org, count, topicPath) {
  const easy = Math.max(0, Math.round(count * 0.2));
  const medium = Math.max(0, Math.round(count * 0.3));
  const hard = Math.max(1, count - easy - medium);
  const language = category === "english"
    ? "Write each question and its four options in English. Write explanations in Bengali."
    : "Write each question, its options, and its explanation in natural Bangladeshi exam Bengali.";
  const topicLine = topicPath ? `Topic: ${topicPath}. Every question must be specifically about this topic.` : "";
  return `You set multiple-choice questions for Bangladesh government recruitment, including Petrobangla Assistant Manager (CSE/IT).

Exam focus: ${ORG_BRIEF[org] || ORG_BRIEF.all}
Subject: ${CATEGORY_BRIEF[category] || CATEGORY_BRIEF.mixed}
${topicLine}

Create exactly ${count} original MCQs.
${language}
Difficulty counts: ${easy} Easy, ${medium} Medium, ${hard} Hard. Use fewer easy or medium items when the total is small, but keep the total at ${count}.

Rules:
- Exactly 4 options. Do not prefix options with ক, খ, গ, or ঘ.
- "answer" is the zero-based index (0, 1, 2, or 3). Only one option is correct.
- Explanations are in Bengali, 2 to 4 sentences.
- category must be exactly one of: bangla, english, math, gk, networks, dbms, dsa, os, swe, energy.
- If the subject is not mixed, every question must use that one category id.
- difficulty must be exactly Easy, Medium, or Hard.
- Return only the JSON array.`;
}

function shuffle(items) {
  const copy = items.slice();
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toPublicQuestion(question) {
  return {
    question: question.question,
    options: question.options.slice(),
    answer: question.answer,
    explanation: question.explanation,
    category: question.category,
    difficulty: question.difficulty,
    source: question.source || "সরকারি CSE/IT নিয়োগ",
  };
}

function readParam(req, name) {
  if (req.query && typeof req.query[name] === "string" && req.query[name]) {
    return req.query[name];
  }
  try {
    const host = req.headers?.host || "localhost";
    const url = new URL(req.url || "/", `http://${host}`);
    return url.searchParams.get(name);
  } catch {
    return null;
  }
}

function readMode(req) {
  return readParam(req, "mode");
}

function readCount(req, fallback) {
  const raw = Number(readParam(req, "count"));
  if (!Number.isInteger(raw)) return fallback;
  return Math.min(15, Math.max(1, raw));
}

function readTopic(req) {
  const text = String(readParam(req, "topic") || "").trim().toLowerCase();
  return /^[a-z0-9-]{1,40}$/.test(text) ? text : "";
}

function normalizeCategoryId(value) {
  const text = String(value || "").trim().toLowerCase();
  if (CATEGORY_IDS.includes(text) || text === "mixed") return text;
  if (text.includes("network") || text.includes("security")) return "networks";
  if (text.includes("db") || text.includes("sql")) return "dbms";
  if (text.includes("algorithm") || text.includes("data structure") || text === "dsa") return "dsa";
  if (text.includes("operating") || text === "os") return "os";
  if (text.includes("energy") || text.includes("petro") || text.includes("gas")) return "energy";
  if (text.includes("software") || text.includes("oop") || text === "swe") return "swe";
  if (text.includes("bangla") || text.includes("বাংলা")) return "bangla";
  if (text.includes("english") || text.includes("ইংরেজি")) return "english";
  if (text.includes("math") || text.includes("mental") || text.includes("গণিত")) return "math";
  if (text.includes("general knowledge") || text === "gk" || text.includes("সাধারণ")) return "gk";
  return "";
}

function normalizeOrgId(value) {
  const text = String(value || "all").trim().toLowerCase();
  if (text === "all" || ORG_IDS.includes(text)) return text;
  return "all";
}

function matchingQuestions(category, org) {
  return pastPapers.filter((question) => {
    const categoryOk = category === "mixed" || question.category === category;
    const orgOk = org === "all" || (question.orgs || []).includes(org);
    return categoryOk && orgOk;
  });
}

function sampleQuestions(category, org, count) {
  const scoped = matchingQuestions(category, org);
  const pool = scoped.length ? scoped : matchingQuestions(category, "all");
  const usable = pool.length ? pool : pastPapers;
  return shuffle(usable)
    .slice(0, Math.min(count, usable.length))
    .map(toPublicQuestion);
}

function sessionSize(category, mode) {
  if (mode === "dynamic_ai") return category === "mixed" ? AI_MIXED_COUNT : AI_CATEGORY_COUNT;
  return category === "mixed" ? MIXED_SESSION : CATEGORY_SESSION;
}

function catalog() {
  const saved = countByCategory();
  const categories = {};
  const bank = {};
  for (const id of CATEGORY_IDS) {
    bank[id] = pastPapers.filter((question) => question.category === id).length;
    categories[id] = bank[id] + (saved.categories[id] || 0);
  }
  return {
    categories,
    bank,
    saved: saved.categories,
    total: pastPapers.length + saved.total,
    bankTotal: pastPapers.length,
    savedTotal: saved.total,
  };
}

function sendJson(res, status, body, headers = {}) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  Object.entries(headers).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  res.end(JSON.stringify(body));
}

function normalizeDifficulty(value) {
  const text = String(value || "").trim().toLowerCase();
  if (text === "easy" || text === "সহজ") return "Easy";
  if (text === "hard" || text === "কঠিন") return "Hard";
  if (text === "medium" || text === "মাঝারি") return "Medium";
  return "Medium";
}

function normalizeQuestions(value) {
  const list = Array.isArray(value) ? value : value?.questions;
  if (!Array.isArray(list)) return [];

  const cleaned = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const question = String(item.question || "").trim();
    const options = Array.isArray(item.options) ? item.options.map((option) => String(option).trim()) : [];
    const answer = Number(item.answer);
    if (!question || options.length !== 4 || options.some((option) => !option)) continue;
    if (!Number.isInteger(answer) || answer < 0 || answer > 3) continue;
    cleaned.push({
      question,
      options,
      answer,
      explanation: String(item.explanation || "").trim() || "ব্যাখ্যা পাওয়া যায়নি।",
      category: normalizeCategoryId(item.category) || "swe",
      difficulty: normalizeDifficulty(item.difficulty),
    });
  }
  return cleaned;
}

function extractJson(text) {
  if (!text || typeof text !== "string") return null;
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced ? fenced[1] : text).trim();
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start === -1 || end <= start) return null;
  return JSON.parse(body.slice(start, end + 1));
}

function responseSchema() {
  return {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        question: { type: Type.STRING },
        options: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
        answer: { type: Type.INTEGER },
        explanation: { type: Type.STRING },
        category: { type: Type.STRING },
        difficulty: { type: Type.STRING },
      },
      required: ["question", "options", "answer", "explanation", "category", "difficulty"],
    },
  };
}

function questionsFromText(text, minimum, name) {
  const questions = normalizeQuestions(extractJson(text));
  if (questions.length < minimum) {
    throw new Error(`${name} returned ${questions.length} usable questions`);
  }
  return questions;
}

async function askGemini(prompt, minimum, withSchema) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const config = {
      temperature: 0.7,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
      thinkingConfig: { thinkingBudget: 0 },
      abortSignal: controller.signal,
    };
    if (withSchema) config.responseSchema = responseSchema();
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      contents: prompt,
      config,
    });
    return questionsFromText(response.text, minimum, "Gemini");
  } finally {
    clearTimeout(timer);
  }
}

async function completeChat({ name, url, apiKey, model, prompt, minimum, headers = {}, extra = {} }) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        ...extra,
        messages: [
          { role: "system", content: "Return only a JSON array of exam questions. No markdown." },
          { role: "user", content: prompt },
        ],
      }),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`${name} ${response.status}: ${detail.slice(0, 180)}`);
    }
    const payload = await response.json();
    const text = payload.choices?.[0]?.message?.content || "";
    return questionsFromText(text, minimum, name);
  } finally {
    clearTimeout(timer);
  }
}

function fallbackProviders(minimum) {
  const providers = [];
  const requestyKey = process.env.REQUESTY_API_KEY;
  if (requestyKey) {
    providers.push({
      name: "requesty",
      url: "https://router.requesty.ai/v1/chat/completions",
      apiKey: requestyKey,
      model: process.env.REQUESTY_MODEL || "google/gemma-4-31b-it",
      minimum,
      headers: {
        "HTTP-Referer": process.env.REQUESTY_SITE_URL || "http://localhost:4173",
        "X-Title": "Petrobangla CSE Exam",
      },
    });
  }
  const sambanovaKey = process.env.SAMBANOVA_API_KEY;
  if (sambanovaKey) {
    providers.push({
      name: "sambanova",
      url: "https://api.sambanova.ai/v1/chat/completions",
      apiKey: sambanovaKey,
      model: process.env.SAMBANOVA_MODEL || "Meta-Llama-3.3-70B-Instruct",
      minimum,
    });
  }
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  if (openrouterKey) {
    providers.push({
      name: "openrouter",
      url: "https://openrouter.ai/api/v1/chat/completions",
      apiKey: openrouterKey,
      model: process.env.OPENROUTER_MODEL || "openrouter/free",
      minimum,
      headers: {
        "HTTP-Referer": process.env.OPENROUTER_SITE_URL || "http://localhost:4173",
        "X-Title": "Petrobangla CSE Exam",
      },
    });
  }
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    providers.push({
      name: "openai",
      url: "https://api.openai.com/v1/chat/completions",
      apiKey: openaiKey,
      model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      minimum,
      extra: { reasoning_effort: "none" },
    });
  }
  const grokKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (grokKey) {
    providers.push({
      name: "grok",
      url: "https://api.x.ai/v1/chat/completions",
      apiKey: grokKey,
      model: process.env.GROK_MODEL || "grok-4.7",
      minimum,
    });
  }
  const freebuffKey = process.env.FREEBUFF_API_KEY;
  if (freebuffKey) {
    const base = (process.env.FREEBUFF_BASE_URL || "https://freebuff.com/api/v1").replace(/\/$/, "");
    providers.push({
      name: "freebuff",
      url: `${base}/chat/completions`,
      apiKey: freebuffKey,
      model: process.env.FREEBUFF_MODEL || "deepseek/deepseek-v4-flash",
      minimum,
    });
  }
  return providers;
}

async function generateDynamicQuestions(category, org, count, topicPath) {
  const prompt = buildPrompt(category, org, count, topicPath);
  const minimum = count < 5 ? count : Math.max(5, count - 2);
  const errors = [];

  if (process.env.GEMINI_API_KEY) {
    try {
      return { questions: await askGemini(prompt, minimum, true), source: "gemini" };
    } catch (schemaError) {
      console.error("Structured Gemini request failed, retrying without schema:", schemaError);
      try {
        return { questions: await askGemini(prompt, minimum, false), source: "gemini" };
      } catch (error) {
        errors.push(error);
        console.error("Gemini failed:", error);
      }
    }
  } else {
    errors.push(new Error("GEMINI_API_KEY is not set"));
  }

  for (const provider of fallbackProviders(minimum)) {
    try {
      const questions = await completeChat({ ...provider, prompt });
      return { questions, source: provider.name };
    } catch (error) {
      errors.push(error);
      console.error(`${provider.name} failed:`, error);
    }
  }

  throw new Error(errors.map((error) => error.message).join("; ") || "No AI provider is configured");
}

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.statusCode = 204;
    res.setHeader("Allow", "GET, OPTIONS");
    res.end();
    return;
  }

  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Only GET is supported." });
    return;
  }

  const mode = readMode(req);
  const category = normalizeCategoryId(readParam(req, "category")) || "mixed";
  const org = normalizeOrgId(readParam(req, "org"));
  const topicId = readTopic(req);
  const scope = topicId && category !== "mixed" ? topicScope(category, topicId) : null;

  if (mode === "catalog") {
    sendJson(res, 200, catalog(), { "X-Quiz-Source": "past_papers" });
    return;
  }

  if (mode === "topics") {
    sendJson(res, 200, { topics: treeWithCounts(countByTopic()) });
    return;
  }

  if (topicId && !scope) {
    sendJson(res, 400, { error: "এই বিষয়ে এই টপিক নেই।" });
    return;
  }

  if (mode === "practice") {
    if (!scope) {
      sendJson(res, 400, { error: "অনুশীলনের জন্য একটি টপিক বেছে নিন।" });
      return;
    }
    const count = readCount(req, 10);
    const questions = practiceQuestions(category, scope.ids, count);
    if (!questions.length) {
      sendJson(res, 404, { error: "এই টপিকে এখনো কোনো সংরক্ষিত প্রশ্ন নেই। আগে এআই দিয়ে তৈরি করুন।" });
      return;
    }
    sendJson(res, 200, questions, { "X-Quiz-Source": "saved" });
    return;
  }

  if (mode === "past_papers") {
    const count = sessionSize(category, mode);
    const exact = matchingQuestions(category, org);
    if (!exact.length) {
      sendJson(res, 404, {
        error: "এই বিষয়ে এই প্রতিষ্ঠানের বিগত প্রশ্ন নেই। সব সরকারি পরীক্ষা বেছে নিন, অথবা এআই টেস্ট দিন।",
      });
      return;
    }
    sendJson(res, 200, sampleQuestions(category, org, count), { "X-Quiz-Source": "past_papers" });
    return;
  }

  if (mode === "dynamic_ai") {
    const count = readCount(req, sessionSize(category, mode));
    try {
      const generated = await generateDynamicQuestions(category, org, count, scope?.path || "");
      const questions = generated.questions.map((item) => ({ ...item, category: scope ? category : item.category }));
      const focused = category === "mixed" ? questions : questions.filter((item) => item.category === category);
      const usable = focused.length >= Math.min(5, count) ? focused : questions;
      const finalQuestions = usable.slice(0, count).map((item) => ({
        ...item,
        topic: scope?.node.id || "",
        topicLabel: scope?.path || "",
      }));
      let stored = 0;
      if (scope) {
        stored = saveQuestions(finalQuestions, {
          category,
          topic: scope.node.id,
          parentTopic: scope.node.parentId,
          topicLabel: scope.path,
          source: generated.source,
        });
      }
      sendJson(res, 200, finalQuestions, {
        "X-Quiz-Source": generated.source,
        "X-Quiz-Stored": String(stored),
      });
    } catch (error) {
      console.error("All AI providers failed:", error);
      if (scope) {
        sendJson(res, 502, { error: "এই টপিকের এআই প্রশ্ন তৈরি হয়নি। একটু পরে আবার চেষ্টা করুন।" });
        return;
      }
      sendJson(res, 200, sampleQuestions(category, org, count), { "X-Quiz-Source": "fallback" });
    }
    return;
  }

  sendJson(res, 400, {
    error: "Use mode=past_papers, mode=dynamic_ai, mode=practice, mode=topics, or mode=catalog.",
  });
}
