const silentLogger = () => {
  /* 静默 */
};

/**
 * 与中文界面相同的识别管线：优先 eng+chi_sim（中英标牌、中文楼名），失败或空结果再 eng。
 * 界面语言只影响弹窗文案（LanguageContext），不影响 OCR。
 */
export async function runBuildingOcrOnFile(file: File): Promise<string> {
  const { default: Tesseract } = await import("tesseract.js");
  const chain = ["eng+chi_sim", "eng"] as const;

  for (const langTag of chain) {
    try {
      const result = await Tesseract.recognize(file, langTag, { logger: silentLogger });
      const text = typeof result.data.text === "string" ? result.data.text : "";
      if (text.trim().length > 0) return text;
    } catch {
      /* 尝试下一种 */
    }
  }
  return "";
}
