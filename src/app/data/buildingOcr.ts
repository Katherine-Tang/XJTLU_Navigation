/**
 * 校园楼宇 OCR（高置信度模式）：
 * 仅匹配完整楼名短语（中英），避免人物照片中的零散字母被误识别为楼宇代码。
 */

/** 仅当整段 OCR 里出现这些完整短语时才认定该楼（越长越优先） */
export const BUILDING_PHRASES: { code: string; phrases: string[] }[] = [
  {
    code: "IA",
    phrases: [
      "INTERNATIONAL ACADEMIC EXCHANGE AND COLLABORATION CENTRE",
      "INTERNATIONAL ACADEMIC EXCHANGE AND COLLABORATION CENTER",
      "国际学术交流中心",
      "INTERNATIONAL ACADEMIC EXCHANGE",
    ],
  },
  {
    code: "IR",
    phrases: [
      "INTERNATIONAL RESEARCH CENTRE",
      "INTERNATIONAL RESEARCH CENTER",
      "国际科研中心",
      "INTERNATIONAL RESEARCH",
    ],
  },
  {
    code: "ES",
    phrases: [
      "EMERGING AND INTERDISCIPLINARY SCIENCE BUILDING",
      "EMERGING AND INTERDISCIPLINARY SCIENCE",
      "新兴科学楼",
      "新兴与交叉科学楼",
    ],
  },
  {
    code: "HS",
    phrases: [
      "HUMANITIES AND SOCIAL SCIENCES BUILDING",
      "HUMANITIES AND SOCIAL SCIENCES",
      "人文和社科楼",
      "人文社科楼",
    ],
  },
  {
    code: "EE",
    phrases: [
      "ELECTRICAL AND ELECTRONIC ENGINEERING",
      "电子与电气工程楼",
    ],
  },
  {
    code: "BS",
    phrases: [
      "INTERNATIONAL BUSINESS SCHOOL SUZHOU",
      "西浦国际商学院",
    ],
  },
  {
    code: "AS",
    phrases: [
      "FILM AND CREATIVE TECHNOLOGY BUILDING",
      "影视与创意科技楼",
    ],
  },
  {
    code: "LS",
    phrases: ["LIFE SCIENCES BUILDING", "生命科学楼"],
  },
  {
    code: "FB",
    phrases: ["FOUNDATION BUILDING", "基础楼"],
  },
  {
    code: "CB",
    phrases: ["CENTRAL BUILDING", "中心楼"],
  },
  {
    code: "PB",
    phrases: ["PUBLIC BUILDING", "公共楼"],
  },
  {
    code: "EB",
    phrases: ["ENGINEERING BUILDING", "工科楼"],
  },
  {
    code: "DB",
    phrases: ["DESIGN BUILDING", "设计楼"],
  },
  {
    code: "MA",
    phrases: ["MATHEMATICS BUILDING A", "数学楼 A", "数学楼A"],
  },
  {
    code: "MB",
    phrases: ["MATHEMATICS BUILDING B", "数学楼 B", "数学楼B"],
  },
  {
    code: "SA",
    phrases: ["SCIENCE BUILDING A", "理科楼A", "理科楼 A"],
  },
  {
    code: "SB",
    phrases: ["SCIENCE BUILDING B", "理科楼B", "理科楼 B"],
  },
  {
    code: "SC",
    phrases: ["SCIENCE BUILDING C", "理科楼C", "理科楼 C"],
  },
  {
    code: "SD",
    phrases: ["SCIENCE BUILDING D", "理科楼D", "理科楼 D"],
  },
  {
    code: "GYM",
    phrases: ["GYMNASIUM", "体育馆"],
  },
];

function normalizeForPhrases(ocr: string): string {
  return ocr
    .toUpperCase()
    .replace(/[^A-Z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectByPhrases(normalized: string): string | null {
  const flat: { code: string; phrase: string; len: number }[] = [];
  for (const { code, phrases } of BUILDING_PHRASES) {
    for (const p of phrases) {
      const phrase = p.toUpperCase().replace(/\s+/g, " ").trim();
      flat.push({ code, phrase, len: phrase.length });
    }
  }
  flat.sort((a, b) => b.len - a.len);
  for (const { code, phrase } of flat) {
    if (phrase.length > 0 && normalized.includes(phrase)) return code;
  }
  return null;
}

export function detectBuildingCode(ocrText: string): string | null {
  if (!ocrText || !ocrText.trim()) return null;
  const normalized = normalizeForPhrases(ocrText);
  return detectByPhrases(normalized);
}
