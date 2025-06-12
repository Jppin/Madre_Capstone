// services/nutrientUtils.js

/**
 * 임신 주차(week)에 따라 분기(초기/중기/후기)를 반환합니다.
 * week가 없거나 0에 가까운 값이면 "정보 없음"을 반환합니다.
 */
export const getTrimester = (week) => {
  if (!week) return "정보 없음";
  if (week <= 12) return "초기";
  if (week <= 27) return "중기";
  return "후기";
};

/**
 * BMI 계산: weight(kg) / (height(m)^2)
 * height는 cm 단위로 들어오므로 내부에서 m 단위로 변환합니다.
 * weight나 height가 없으면 null을 반환합니다.
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightM = height / 100;
  return +(weight / (heightM * heightM)).toFixed(1);
};

/**
 * 사용자 객체(user)를 받아서 생리/임신 단계(stage)를 반환합니다.
 * - user.pregnancy : "수유 중", "임신 중", "6개월 내에 계획 있음", else
 * - user.subPregnancy: "임신초기(~14주)", "임신중기(15~28주)", "임신후기(29주~)" 등을 포함한다고 가정
 */
export const getUserStage = (user) => {
  const pregnancy = user.pregnancy;
  const sub = user.subPregnancy;

  if (pregnancy === "수유 중") return "수유기";
  if (pregnancy === "임신 중") {
    if (sub && sub.includes("초기")) return "임신초기";
    if (sub && sub.includes("중기")) return "임신중기";
    if (sub && sub.includes("후기")) return "임신후기";
    return "임신중기"; // fallback
  }
  if (pregnancy === "6개월 내에 계획 있음") return "예정";
  return "임신 아님";
};

/**
 * 나이(age)와 생리/임신 단계(stage)에 따라 기초 권장 칼로리(base)를 계산하고,
 * 추가 칼로리(addition)를 더하여 { kcal, base, addition } 형태로 반환합니다.
 *
 * - base: age <= 29 → 2000 kcal, age > 29 → 1900 kcal (19~49세 여성 기준)
 * - additions:
 *    예정: 0
 *    임신초기: 0
 *    임신중기: 340
 *    임신후기: 450
 *    수유기: 500
 */
export const getEnergyRequirement = (age, stage) => {
  const base = age <= 29 ? 2000 : 1900;

  const additions = {
    예정: 0,
    임신초기: 0,
    임신중기: 340,
    임신후기: 450,
    수유기: 500,
  };

  // stage 문자열을 additions 키와 매핑
  const labelMap = {
    초기: "임신초기",
    중기: "임신중기",
    후기: "임신후기",
    수유기: "수유기",
    예정: "예정",
    "임신초기": "임신초기",
    "임신중기": "임신중기",
    "임신후기": "임신후기",
  };

  const label = labelMap[stage] || "예정";
  const addition = additions[label] || 0;

  return {
    kcal: base + addition,
    base,
    addition,
  };
};

/**
 * 총 칼로리(kcal)를 받아서, 
 * 탄수화물(carb) 60%, 단백질(protein) 15%, 지방(fat) 25% 비율로 계산하고,
 * 각 매크로별 그램 수(grams)도 함께 반환합니다.
 *
 * - 1g 탄수화물 = 4 kcal
 * - 1g 단백질   = 4 kcal
 * - 1g 지방     = 9 kcal
 */
export const getMacronutrientRatio = (kcal) => {
  const ratio = { carb: 0.6, protein: 0.15, fat: 0.25 };

  const carbKcal = kcal * ratio.carb;
  const proteinKcal = kcal * ratio.protein;
  const fatKcal = kcal * ratio.fat;

  return {
    kcal,
    ratio,
    mass: {
      carb: +(carbKcal / 4).toFixed(1),
      protein: +(proteinKcal / 4).toFixed(1),
      fat: +(fatKcal / 9).toFixed(1),
    },
  };
};

/**
 * stage에 따라 필요한 미량 영양소 권장량(기준 + 추가)을 반환합니다.
 *
 * 기본(19~49세 여성 기준) 섭취량을 base에,
 * 생리/임신 단계별 추가 섭취량을 additional에 정의한 뒤,
 * 최종적으로 base + (추가가 있으면 문자열 형태로 합침) 결과를 리턴합니다.
 */
export const getMicronutrientNeedsByStage = (stage = "임신 아님") => {
  // 기본 섭취량 (19~49세 여성, 2020 한국인 영양소 섭취 기준)
  const base = {
    식이섬유: "20g",
    비타민A: "650 µg",
    비타민C: "100 mg",
    엽산: "400 µg",
    티아민: "1.1 mg",
    리보플라빈: "1.2 mg",
    나이아신: "14 mg",
    칼슘: "700 mg",
    철: "14 mg",
  };

  // 단계별 추가 섭취량
  const additional = {
    예정: {}, // 예정은 추가 없음
    임신초기: {
      비타민C: "+10 mg",
      엽산: "+220 µg (특히 중요)",
      티아민: "+0.4 mg",
      리보플라빈: "+0.4 mg",
      나이아신: "+3 mg",
    },
    임신중기: {
      비타민C: "+10 mg",
      엽산: "+220 µg",
      티아민: "+0.4 mg",
      리보플라빈: "+0.4 mg",
      나이아신: "+3 mg",
      철: "+10 mg (빈혈 위험)",
    },
    임신후기: {
      비타민C: "+10 mg",
      엽산: "+200 µg",
      티아민: "+0.4 mg",
      리보플라빈: "+0.5 mg",
      나이아신: "+3 mg",
      철: "+10 mg",
    },
    수유기: {
      비타민A: "+450 µg",
      비타민C: "+50 mg",
      엽산: "+150 µg",
      티아민: "+0.4 mg",
      리보플라빈: "+0.3 mg",
      나이아신: "+4 mg",
      칼슘: "+0 mg", // 유지
    },
  };

  // stage 문자열을 추가량 키로 매핑
  const labelMap = {
    "임신 아님": "예정",
    예정: "예정",
    수유기: "수유기",
    초기: "임신초기",
    중기: "임신중기",
    후기: "임신후기",
    임신초기: "임신초기",
    임신중기: "임신중기",
    임신후기: "임신후기",
  };
  const label = labelMap[stage] || "예정";
  const extra = additional[label] || {};

  const result = {};
  // base와 extra 키를 모두 합쳐 순회
  Object.keys({ ...base, ...extra }).forEach((nutrient) => {
    const baseVal = base[nutrient] || "기준 없음";
    if (extra[nutrient]) {
      result[nutrient] = `${extra[nutrient]} (기준 ${baseVal})`;
    } else {
      result[nutrient] = baseVal;
    }
  });

  return result;
};

/**
 * BMI와 임신 주차(week)에 따라 현재까지 권장되는 체중 증가량(kg)을 반환합니다.
 *
 * - BMI 인덱스:
 *    BMI < 18.5 → index=0
 *    18.5 ≤ BMI < 25 → index=1
 *    25 ≤ BMI < 30 → index=2
 *    30 ≤ BMI    → index=3
 *
 * - 쌍둥이(isTwins)일 경우, rangeByBMI가 다르게 설정됩니다.
 *   (단, 쌍둥이 + BMI < 18.5 → 근거 없음 → null)
 *
 * - 초기(1~13주): 고정 증가량 baseGain = 1.5 kg
 * - 중기~후기(14~40주): 주당 증가량 = ((minGain + maxGain)/2) / (40 - 13)
 *   → 총 증가량 = baseGain + 주당 증가량 × (week - 13)
 * - week 또는 bmi가 없으면 null 반환
 */
export const getCurrentWeightGainGoal = (
  bmi,
  week = 0,
  isTwins = false
) => {
  if (!bmi || !week) return null;

  // 쌍둥이/단태아 구간
  const rangeByBMI = isTwins
    ? [
        null,      // BMI < 18.5 : 근거 없음
        [17, 25],  // 18.5 ≤ BMI < 25
        [14, 23],  // 25 ≤ BMI < 30
        [11, 19],  // 30 ≤ BMI
      ]
    : [
        [12.5, 18],   // BMI < 18.5
        [11.5, 16],   // 18.5 ≤ BMI < 25
        [7, 11.5],    // 25 ≤ BMI < 30
        [5, 9],       // 30 ≤ BMI
      ];

  const getIndex = () => {
    if (bmi < 18.5) return 0;
    if (bmi < 25) return 1;
    if (bmi < 30) return 2;
    return 3;
  };

  const idx = getIndex();
  if (isTwins && idx === 0) return null; // 쌍둥이 + BMI < 18.5 → 근거 없음

  const gains = rangeByBMI[idx];
  if (!gains) return null;
  const [minGain, maxGain] = gains;

  const baseGain = 1.5; // 1~13주 고정 증가량
  const weeksForGain = 40 - 13; // 27주 분량
  const weeklyGain = ((minGain + maxGain) / 2) / weeksForGain;

  if (week <= 13) {
    return +baseGain.toFixed(1);
  }

  const extraWeeks = week - 13;
  const totalGain = baseGain + weeklyGain * extraWeeks;
  return +totalGain.toFixed(1);
};
