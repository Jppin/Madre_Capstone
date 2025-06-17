import MealPlan from "../models/MealPlan.js";

// 🔹 공통 섹션 추출
const parseSection = (content, section) => {
  if (!content || typeof content !== "string") return "";
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `\\[${escaped}\\][ \\t]*([\\s\\S]*?)(?=\\n?\\[[^\\]]+\\]|\\n##|\\n---|$)`,
    "i"
  );
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
};

// 🔹 끼니별 필드 추출
const extractAllFields = (text) => {
  const fields = {
    "추천 메뉴": "",
    "주의할 점": "",
    "설명": "",
    "이런 상태라면 더 좋아요": "",
    "똑똑한 팁": "",
  };

  const pattern = /[-•]?\s*(추천 메뉴|주의할 점|설명|이런 상태라면 더 좋아요|똑똑한 팁)\s*[:：]\s*([\s\S]*?)(?=\n\s*[-•]?\s*(추천 메뉴|주의할 점|설명|이런 상태라면 더 좋아요|똑똑한 팁)\s*[:：]|\n\s*---|\n\s*##|\s*$)/g;
  text = text.trim();

  let match;
  while ((match = pattern.exec(text))) {
    const label = match[1]?.trim();
    const value = match[2]?.trim().replace(/\s+/g, " ");
    if (label && fields[label] !== undefined) {
      fields[label] = value;
    }
  }

  return {
    menu: fields["추천 메뉴"],
    warning: fields["주의할 점"],
    explanation: fields["설명"],
    smartTip: fields["똑똑한 팁"],
    benefit: fields["이런 상태라면 더 좋아요"],
  };
};

// 🔹 테마
const extractTheme = (text) => {
  const themeMatch = text.match(/-?\s*테마\s*[:：]\s*(.*)/);
  const commentMatch = text.match(/-?\s*테마 설명\s*[:：]\s*([\s\S]*?)(?=\n-|\n\[|$)/);
  return {
    theme: themeMatch?.[1]?.trim() || "",
    themeComment: commentMatch?.[1]?.trim().replace(/\s+/g, " ") || "",
  };
};

// 🔹 충족도 분석
const parseNutrientFulfillment = (text) => {
  const map = {};
  const lines = text.split(/\n|•|-|▪/).map(l => l.trim()).filter(Boolean);
  for (const line of lines) {
    const match = line.match(/([가-힣A-Za-z ()]+)\s*[:–-]?\s*(\d+%)/);
    if (match) {
      const [, key, val] = match;
      map[key.trim()] = val.trim();
    }
  }
  return map;
};

// 🔹 추가 섭취 가이드 + 설명
const extractSupplementRecommendation = (text) => {
  const supplements = [];
  let explanation = "";

  if (!text) return { supplements, explanation };

  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);

  let isExplanation = false;
  for (const line of lines) {
    if (line.startsWith("- 설명")) {
      isExplanation = true;
      explanation = line.replace(/^- 설명[:：]?\s*/, "").trim();
    } else if (isExplanation) {
      explanation += " " + line;
    } else {
      if (/\d+.*(mg|μg|IU|ml|g)/i.test(line)) {
        supplements.push(line);
      }
    }
  }

  return {
    supplements,
    explanation: explanation.trim()
  };
};

// 🔹 복용 주의사항
const parsePrecautions = (text) => {
  if (!text) return [];
  return text
    .split('\n')
    .map(l => l.trim())
    .filter(l =>
      l.length > 3 &&
      (/^[-•]/.test(l) || /^[가-힣A-Za-z]/.test(l))
    )
    .map(l => l.replace(/^[-•]\s*/, ''));
};

// 🔹 메인 저장 함수
export async function saveMealPlanResult({
  email,
  kcal,
  macroRatio,
  micronutrients = {},
  avoidedFoods = [],
  llmResult,
}) {
  const fullText = typeof llmResult === "string" ? llmResult : llmResult?.result;
  if (!fullText) throw new Error("llmResult is missing or invalid");

  const finalMacroRatio = macroRatio?.percent ? macroRatio : {
    percent: macroRatio,
    grams: {
      carb: +(kcal * 0.6 / 4).toFixed(1),
      protein: +(kcal * 0.15 / 4).toFixed(1),
      fat: +(kcal * 0.25 / 9).toFixed(1),
    }
  };

  const themeText = parseSection(fullText, "식단 테마");
  const breakfastText = parseSection(fullText, "아침");
  const lunchText = parseSection(fullText, "점심");
  const dinnerText = parseSection(fullText, "저녁");
  const snackText = parseSection(fullText, "간식");
  
  // 1. [하루 식단 종합 가이드] 섹션이 있는지 먼저 확인
  let guideSection = parseSection(fullText, "하루 식단 종합 가이드");
  let fulfillmentSection, supplementSection, precautionsSection;

  if (guideSection && guideSection.length > 0) {
    // 기존 방식: [하루 식단 종합 가이드] 안에서 파싱
    fulfillmentSection = parseSection(guideSection, "섭취 충족도 분석");
    supplementSection = parseSection(guideSection, "추가 섭취 가이드");
    precautionsSection = parseSection(guideSection, "복용 주의사항");
    if (!precautionsSection) {
      // guideSection이 비어있거나 파싱 실패 시 전체 텍스트에서 직접 추출
      precautionsSection = parseSection(fullText, "복용 주의사항");
    }
  } else {
    // 새 방식: 전체 텍스트에서 바로 파싱
    fulfillmentSection = parseSection(fullText, "섭취 충족도 분석");
    supplementSection = parseSection(fullText, "추가 섭취 가이드");
    precautionsSection = parseSection(fullText, "복용 주의사항");
  }

  const getSectionOrFallback = (text, section) => {
    let result = parseSection(text, section);
    if (!result) {
      // 전체 텍스트에서 직접 추출
      result = parseSection(fullText, section);
    }
    return result;
  };

  const mealPlan = new MealPlan({
    email,
    kcal,
    macroRatio: finalMacroRatio,
    micronutrients,
    avoidedFoods,
    llmResult: fullText,
    breakfast: extractAllFields(breakfastText),
    lunch: extractAllFields(lunchText),
    dinner: extractAllFields(dinnerText),
    snack: extractAllFields(snackText),
    dailyGuide: {
      ...extractTheme(themeText),
      nutrientFulfillment: parseNutrientFulfillment(getSectionOrFallback(guideSection, "섭취 충족도 분석")),
      supplementRecommendation: extractSupplementRecommendation(getSectionOrFallback(guideSection, "추가 섭취 가이드")),
      precautions: parsePrecautions(getSectionOrFallback(guideSection, "복용 주의사항")),
    },
  });

  await mealPlan.save();
  return mealPlan;
}
