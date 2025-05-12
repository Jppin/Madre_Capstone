import MealPlan from "../models/MealPlan.js";

// 🔹 섹션 추출
const parseSection = (content, section) => {
  if (!content || typeof content !== "string") return "";
  const escaped = section.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(
    `\\[${escaped}\\][ \\t]*([\\s\\S]*?)(?=\\n?\\[[^\\]]+\\]|\\n##|\\n---|\\Z)`,
    "i"
  );
  const match = content.match(pattern);
  return match ? match[1].trim() : "";
};

const extractAllFields = (text) => {
  const fields = {
    "추천 메뉴": "",
    "주의할 점": "",
    "설명": "",
    "이런 상태라면 더 좋아요": "",
    "똑똑한 팁": "",
  };

  const pattern = /[-•]?\s*(추천 메뉴|주의할 점|설명|이런 상태라면 더 좋아요|똑똑한 팁)\s*[:：]\s*([\s\S]*?)(?=\n\s*[-•]?\s*(추천 메뉴|주의할 점|설명|이런 상태라면 더 좋아요|똑똑한 팁)\s*[:：]|\n\s*---|\n\s*##|\s*$)/g;


  // 꼭 trim을 먼저 해줘야 \Z 정규식이 정상 작동함
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





// 🔹 테마 추출
const extractTheme = (text) => {
  const themeMatch = text.match(/-?\s*테마\s*[:：]\s*(.*)/);
  const commentMatch = text.match(/-?\s*테마 설명\s*[:：]\s*([\s\S]*?)(?=\n-|\n\[|$)/);

  const theme = themeMatch?.[1]?.trim() || "";
  const themeComment = commentMatch?.[1]?.trim().replace(/\s+/g, " ") || "";

  return { theme, themeComment };
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

// 🔹 권장 영양제 + 설명
const extractSupplementRecommendation = (text) => {
  const supplements = [];
  const supplementsBlock = text.match(/권장 영양제[:：]?\s*([\s\S]*?)(?=\n\s*- 설명[:：]?|\n\s*- 복용 주의사항|$)/i);
  const explanationBlock = text.match(/설명[:：]?\s*([\s\S]*?)(?=\n\s*- 복용 주의사항|$)/i);

  const lines = supplementsBlock?.[1]?.split(/\n|•|▪|-/).map(l => l.trim()).filter(Boolean) || [];
  for (const line of lines) {
    if (/\d+~?\d*.*(mg|μg|IU|ml|g)/i.test(line)) {
      supplements.push(line);
    }
  }

  return {
    supplements,
    explanation: explanationBlock?.[1]?.trim().replace(/\s+/g, " ") || "",
  };
};


// 🔹 복용 주의사항
const parsePrecautions = (text) => {
  return text
    .split(/\n|•|▪|-/)
    .map(l => l.trim())
    .filter(l =>
      l.length > 5 &&
      !/^복용 주의사항[:：]?$/.test(l) &&
      !/섭취 충족도/.test(l)
    );
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
  const guideText = fullText.split(/## 하루 식단 종합 가이드/i)[1] || "";

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
      nutrientFulfillment: parseNutrientFulfillment(
        guideText.match(/섭취 충족도 분석[:：]?([\s\S]*?)(?=\n-{2,}|##|^- 추가 섭취 가이드:|$)/)?.[1] || ""
      ),
      supplementRecommendation: extractSupplementRecommendation(guideText),
      precautions: parsePrecautions(
        guideText.match(/복용 주의사항[:：]?([\s\S]*?)(?=\n-{2,}|##|$)/)?.[1] || ""
      ),
    },
  });

  await mealPlan.save();
  return mealPlan;
}
