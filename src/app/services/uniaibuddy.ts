import type { Lang } from "../context/LanguageContext";
import knowledgeMarkdownRaw from "../../../knowledge.md?raw";

export type UniAIBuddyChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type KnowledgeEntry = {
  id: number;
  question: string;
  answer: string;
  combined: string;
  normalizedQuestion: string;
};

export const UNI_AI_FALLBACK_ZH = "抱歉，这个问题目前不在 UniAIBuddy 的已收录知识中。";
export const UNI_AI_FALLBACK_EN = "Sorry, this question is not in UniAIBuddy's recorded knowledge base yet.";

const STOPWORDS = new Set([
  "的", "了", "是", "吗", "我", "你", "他", "她", "它", "和", "与", "及", "在", "有", "怎么", "如何",
  "what", "how", "is", "are", "the", "a", "an", "to", "in", "on", "for", "of", "do", "does", "can",
]);

const SYSTEM_QUESTION_HINTS = [
  "系统", "导航", "地图", "路线", "盲盒", "自定义", "推荐路线", "教室", "搜索", "定位", "实时定位",
  "校园", "收藏", "个人中心", "profile", "pictures", "route", "mystery", "custom", "locate",
  "location", "map", "navigation", "classroom", "favorite", "favourite", "feature", "function",
];

function isIdentityQuestion(question: string): boolean {
  const q = question.toLowerCase();
  return (
    q.includes("你是谁") ||
    q.includes("你叫") ||
    q.includes("who are you") ||
    q.includes("your name") ||
    q.includes("uniaibuddy")
  );
}

function identityReply(lang: Lang): string {
  return lang === "zh"
    ? "我是 UniAIBuddy，你的 UniBuddy 校园导航助手。我会基于已收录知识为你解答路线、地图、教室搜索和定位相关问题。"
    : "I am UniAIBuddy, your UniBuddy campus navigation assistant. I answer route, map, classroom search, and live-location questions based on the recorded knowledge base.";
}

function isSimpleGreeting(question: string): boolean {
  const q = question.trim().toLowerCase();
  if (!q) return false;
  return [
    "你好",
    "嗨",
    "哈喽",
    "早上好",
    "中午好",
    "下午好",
    "晚上好",
    "hello",
    "hi",
    "hey",
    "good morning",
    "good afternoon",
    "good evening",
  ].some((token) => q === token || q.startsWith(`${token} `));
}

function simpleGreetingReply(lang: Lang): string {
  return lang === "zh"
    ? "你好呀！我是 UniAIBuddy。你可以问我校园导航系统相关的问题，比如“我从哪里进入地图功能？”或“导览路线在地图上怎么显示？”。"
    : "Hi! I am UniAIBuddy. You can ask me questions about the campus navigation system, such as Where do I enter the map function?";
}

function looksLikeSystemQuestion(question: string): boolean {
  const q = question.toLowerCase();
  if (!q.trim()) return false;
  return SYSTEM_QUESTION_HINTS.some((hint) => q.includes(hint.toLowerCase()));
}

function nonSystemReply(lang: Lang): string {
  return lang === "zh"
    ? "这个问题更像是日常聊天。我主要负责 UniBuddy 导航系统相关问题；如果你想了解功能用法，可以直接问我地图、路线、教室搜索或定位。"
    : "This looks like general chat. I mainly handle UniBuddy navigation-system questions. Ask me about map, routes, classroom search, or live location.";
}

function tokenize(input: string): string[] {
  const chunks = input.toLowerCase().match(/[\u4e00-\u9fff]{1,}|[a-z0-9]+/g) ?? [];
  return chunks.filter((w) => {
    if (STOPWORDS.has(w)) return false;
    const isCjk = /[\u4e00-\u9fff]/.test(w);
    if (isCjk) return w.length >= 2;
    return w.length >= 2;
  });
}

function normalizeForMatch(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^\u4e00-\u9fffa-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseKnowledgeEntries(markdown: string): KnowledgeEntry[] {
  const lines = markdown.split(/\r?\n/);
  const entries: KnowledgeEntry[] = [];
  let currentId = 0;
  let currentQuestion = "";
  let answerBuffer: string[] = [];

  const pushCurrent = () => {
    if (!currentQuestion) return;
    const answer = answerBuffer.join(" ").replace(/\s+/g, " ").trim();
    if (!answer) return;
    entries.push({
      id: currentId,
      question: currentQuestion.trim(),
      answer,
      combined: `${currentQuestion} ${answer}`.toLowerCase(),
      normalizedQuestion: normalizeForMatch(currentQuestion),
    });
  };

  for (const line of lines) {
    const matched = line.match(/^###\s*(\d+)\)\s*(.+)$/);
    if (matched) {
      pushCurrent();
      currentId = Number(matched[1]);
      currentQuestion = matched[2]?.trim() ?? "";
      answerBuffer = [];
      continue;
    }
    if (currentQuestion) {
      // Allow parsing multiple FAQ sections (e.g., zh + en) in one markdown file.
      if (line.startsWith("## ")) continue;
      if (line.trim()) answerBuffer.push(line.trim());
    }
  }
  pushCurrent();
  return entries;
}

const KNOWLEDGE_ENTRIES = parseKnowledgeEntries(knowledgeMarkdownRaw);

function hasCjk(input: string): boolean {
  return /[\u4e00-\u9fff]/.test(input);
}

export function getUniAIBuddyPresetQuestions(lang: Lang, limit = 4): string[] {
  const seen = new Set<string>();
  const result: string[] = [];

  for (const entry of KNOWLEDGE_ENTRIES) {
    const isZhQuestion = hasCjk(entry.question);
    if (lang === "zh" && !isZhQuestion) continue;
    if (lang === "en" && isZhQuestion) continue;
    if (seen.has(entry.question)) continue;

    seen.add(entry.question);
    result.push(entry.question);
    if (result.length >= limit) break;
  }

  return result;
}

function scoreEntry(query: string, entry: KnowledgeEntry): number {
  const normalizedQuery = normalizeForMatch(query);
  if (normalizedQuery && entry.normalizedQuestion) {
    if (
      normalizedQuery === entry.normalizedQuestion ||
      entry.normalizedQuestion.includes(normalizedQuery) ||
      normalizedQuery.includes(entry.normalizedQuestion)
    ) {
      return 999;
    }
  }

  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;
  let score = 0;
  for (const token of queryTokens) {
    if (entry.question.toLowerCase().includes(token)) score += 4;
    else if (entry.combined.includes(token)) score += 2;
  }
  return score;
}

function searchKnowledge(query: string, limit = 3): KnowledgeEntry[] {
  return KNOWLEDGE_ENTRIES
    .map((entry) => ({ entry, score: scoreEntry(query, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}

async function askDeepSeek(
  question: string,
  contextEntries: KnowledgeEntry[],
  lang: Lang,
  history: UniAIBuddyChatMessage[] = [],
): Promise<string> {
  const apiKey = (import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined)?.trim();
  if (!apiKey) {
    return contextEntries[0]?.answer ?? (lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN);
  }

  const contextText = contextEntries
    .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
    .join("\n\n");

  const systemPrompt =
    lang === "zh"
      ? "你是 UniAIBuddy。只能依据给定知识作答，不得编造。回答简洁、友好、可执行。若知识不足，必须回复：抱歉，这个问题目前不在 UniAIBuddy 的已收录知识中。"
      : "You are UniAIBuddy. Answer only based on the provided knowledge, without fabrication. Keep answers concise and actionable. If knowledge is insufficient, you MUST reply: Sorry, this question is not in UniAIBuddy's recorded knowledge base yet.";

  const compactHistory = history.slice(-6).map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        ...compactHistory,
        {
          role: "user",
          content: `用户问题：${question}\n\n可用知识如下：\n${contextText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return contextEntries[0]?.answer ?? (lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN);
  }
  return content;
}

export async function askUniAIBuddy(
  question: string,
  lang: Lang,
  history: UniAIBuddyChatMessage[] = [],
): Promise<string> {
  const q = question.trim();
  if (!q) return lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN;
  if (isSimpleGreeting(q)) return simpleGreetingReply(lang);
  if (isIdentityQuestion(q)) return identityReply(lang);

  const lastUserTurns = history
    .filter((msg) => msg.role === "user")
    .slice(-2)
    .map((msg) => msg.content)
    .join(" ");

  const retrievalQuery = [lastUserTurns, q].filter(Boolean).join(" ");
  if (!looksLikeSystemQuestion(retrievalQuery)) return nonSystemReply(lang);
  const hits = searchKnowledge(retrievalQuery, 3);

  if (hits.length === 0) {
    return lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN;
  }

  try {
    return await askDeepSeek(q, hits, lang, history);
  } catch {
    return hits[0]?.answer ?? (lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN);
  }
}
