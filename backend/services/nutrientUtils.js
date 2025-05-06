  export const getTrimester = (week) => {
    if (!week) return "정보 없음";
    if (week <= 12) return "초기";
    if (week <= 27) return "중기";
    return "후기";
  };
  
  export const calculateBMI = (weight, height) => {
    if (!weight || !height) return null;
    const heightM = height / 100;
    return +(weight / (heightM * heightM)).toFixed(1);
  };

  // 생리 상태 판단 함수
  export const getUserStage = (user) => {
    const pregnancy = user.pregnancy;
    const sub = user.subPregnancy;
    if (pregnancy === "수유 중") return "수유기";
    if (pregnancy === "임신 중") {
      if (sub?.includes("초기")) return "임신초기";
      if (sub?.includes("중기")) return "임신중기";
      if (sub?.includes("후기")) return "임신후기";
      return "임신중기"; // fallback
    }
    if (pregnancy === "6개월 내에 계획 있음") return "예정";
    return "임신 아님";
  };

  export const getEnergyRequirement = (age, stage) => {
    // 2020 한국인 영양소 섭취 기준 (19~49세 여성)
    const base = age <= 29 ? 2000 : 1900;
  
    // 상태별 추가 열량
    const additions = {
      예정: 0,
      임신초기: 0,
      임신중기: 340,
      임신후기: 450,
      수유기: 500,
    };
  
    const label = {
      "예정": "예정",
      "초기": "임신초기",
      "중기": "임신중기",
      "후기": "임신후기",
      "수유기": "수유기",
    }[stage] || "예정"; // 기본값: 예정
  
    const addition = additions[label] || 0;
  
    return {
      kcal: base + addition,
      base,
      addition,
    };
  };  
  
  export const getMacronutrientRatio = (kcal) => {
    // 탄수화물 55~65%, 단백질 g 환산, 지방 나머지
    const ratio = { carb: 0.6, protein: 0.15, fat: 0.25 };
    return {
      kcal,
      ratio,
      mass: {
        carb: +(kcal * ratio.carb / 4).toFixed(1),    // 4kcal/g
        protein: +(kcal * ratio.protein / 4).toFixed(1),
        fat: +(kcal * ratio.fat / 9).toFixed(1),       // 9kcal/g
      }
    };
  };
  
  export const getMicronutrientNeedsByStage = (stage = "임신 아님") => {
    // 기준 섭취량 (19~49세 여성, 2020 한국인 영양소 섭취 기준)
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
  
    // 생리 상태별 추가 섭취량
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
  
    const label = {
      "임신 아님": "임신 아님",
      "예정": "예정",
      "수유기": "수유기",
      "초기": "임신초기",
      "중기": "임신중기",
      "후기": "임신후기",
    }[stage] || "임신 아님";
  
    const extra = additional[label] || {};
    const result = {};
  
    for (const key of Object.keys({ ...base, ...extra })) {
      const baseVal = base[key] || "기준 없음";
      const addVal = extra[key];
      result[key] = addVal ? `${addVal} (기준 ${baseVal})` : baseVal;
    }
  
    return result;
  };
  
  