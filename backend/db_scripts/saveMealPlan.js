import MealPlan from "../models/MealPlan.js";

// 🔹 특정 섹션 추출
const parseSection = (content, section) => {
  if (!content || typeof content !== "string") return "";
  const match = content.match(new RegExp(`\\[${section}\\]([\\s\\S]*?)(?=\\n\\[|$)`));
  return match ? match[1].trim() : "";
};

// 🔹 라벨별 내용 추출
const extractField = (sectionText, label) => {
  const regex = new RegExp(`- ${label}:\\s*(.*)`, "i");
  const match = sectionText.match(regex);
  return match ? match[1].trim() : "";
};

const extractTiming = (text) => {
  const timeMatch = text.match(/(오전|오후)?\s?\d{1,2}시\s?(\d{1,2}분)?/);
  return timeMatch ? timeMatch[0].trim() : null;
};

// 🔹 충족도 분석 파싱 (ex: 엽산 95%, 철분 80%)
const parseNutrientFulfillment = (text) => {
  const map = {};
  const pairs = text.split(/,\s*/);
  for (const pair of pairs) {
    const [key, val] = pair.split(/[:：]?\s+/);
    if (key && val) map[key.trim()] = val.trim();
  }
  return map;
};

// 🔹 영양제 권장 추출
const extractSupplementRecommendation = (text) => {
  const lines = text.split(/\n|•|▪/).map(l => l.trim()).filter(Boolean);
  const supplementLine = lines.find(l => l.startsWith("권장 영양제"));
  const explanationLine = lines.find(l => l.startsWith("설명"));
  const supplements = supplementLine?.split(/[:：]/)[1]?.split(",").map(s => s.trim()) || [];
  const explanation = explanationLine?.split(/[:：]/)[1]?.trim() || "";
  return { supplements, explanation };
};

// 🔹 복용 주의사항 추출
const parsePrecautions = (text) => {
  return text.split(/\n|•|▪/).map(l => l.trim()).filter(Boolean);
};

// 🔹 식단 저장 함수
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

  // ✅ macroRatio가 구조화 안 된 경우 대비
  const finalMacroRatio = macroRatio?.percent
    ? macroRatio
    : {
        percent: macroRatio,
        grams: {
          carb: +(kcal * 0.6 / 4).toFixed(1),
          protein: +(kcal * 0.15 / 4).toFixed(1),
          fat: +(kcal * 0.25 / 9).toFixed(1),
        }
      };

  // 🔹 섹션 파싱
  const themeText = parseSection(fullText, "식단 테마");
  const breakfastText = parseSection(fullText, "아침");
  const lunchText = parseSection(fullText, "점심");
  const dinnerText = parseSection(fullText, "저녁");
  const snackText = parseSection(fullText, "간식");
  const guideText = parseSection(fullText, "하루 식단 종합 가이드");

  // 🔹 식단 모델 생성
  const mealPlan = new MealPlan({
    email,
    kcal,
    macroRatio: finalMacroRatio,
    micronutrients,
    avoidedFoods,
    llmResult: fullText,
    breakfast: {
      menu: extractField(breakfastText, "추천 메뉴"),
      warning: extractField(breakfastText, "주의할 음식"),
      explanation: extractField(breakfastText, "설명"),
      smartTip: extractField(breakfastText, "똑똑한 팁"),
    },
    lunch: {
      menu: extractField(lunchText, "추천 메뉴"),
      warning: extractField(lunchText, "주의할 음식"),
      explanation: extractField(lunchText, "설명"),
      smartTip: extractField(lunchText, "똑똑한 팁"),
    },
    dinner: {
      menu: extractField(dinnerText, "추천 메뉴"),
      warning: extractField(dinnerText, "주의할 음식"),
      explanation: extractField(dinnerText, "설명"),
      smartTip: extractField(dinnerText, "똑똑한 팁"),
    },
    snack: {
      menu: extractField(snackText, "추천 메뉴"),
      warning: extractField(snackText, "주의할 음식"),
      explanation: extractField(snackText, "설명"),
      smartTip: extractField(snackText, "똑똑한 팁"),
    },
    dailyGuide: {
      theme: extractField(themeText, "테마"),
      themeComment: extractField(themeText, "테마 설명"),
      nutrientFulfillment: parseNutrientFulfillment(
        extractField(guideText, "섭취 충족도 분석") || ""
      ),
      supplementRecommendation: extractSupplementRecommendation(guideText),
      precautions: parsePrecautions(
        extractField(guideText, "복용 주의사항") || ""
      ),
    },
  });

  await mealPlan.save();
}
