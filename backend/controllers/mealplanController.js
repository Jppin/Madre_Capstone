import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { saveMealPlanResult } from "../db_scripts/saveMealPlan.js";
import {
  calculateBMI,
  getEnergyRequirement,
  getMacronutrientRatio,
  getMicronutrientNeedsByStage,
  getUserStage,
  getTrimester
} from "../services/nutrientUtils.js";
import Medicine from "../models/Medicine.js";
import { summarizeMedications } from "../services/medicationUtils.js";
import User from "../models/UserInfo.js";





export const generateMealPlan = async (req, res) => {
  try {
    const { recommendList, warningList, avoidedFoods = [], email } = req.body;
    if (!recommendList || !email) {
      return res.status(400).json({ message: "필수 입력값이 누락되었습니다." });
    }

    const user = req.user;
    const age = new Date().getFullYear() - user.birthYear;
    const stage = getUserStage(user); // 생리 단계 판단 (ex: "임신중기")
    const bmi = calculateBMI(user.weightBefore || user.weight, user.height);
    const energy = getEnergyRequirement(age, stage);
    const macronutrients = getMacronutrientRatio(energy.kcal);
    const micronutrients = getMicronutrientNeedsByStage(stage);
    const medicineList = await Medicine.find({ user_id: user._id });
    const medicationSummary = summarizeMedications(medicineList);

    const kcal = energy.kcal;

    const macroRatio = {
      탄수화물: `${Math.round(macronutrients.ratio.carb * 100)}%`,
      단백질: `${Math.round(macronutrients.ratio.protein * 100)}%`,
      지방: `${Math.round(macronutrients.ratio.fat * 100)}%`,
    };






    const micronutrientText = Object.entries(micronutrients)
      .map(([name, value]) => `${name}: ${value}`)
      .join(", ");

      const prompt = `
      당신은 임산부 식단 전문가입니다. 아래 사용자 정보를 기반으로 하루 식단을 구성해 주세요.
      
      [사용자 정보]
      - 임신 상태: ${user.pregnancy} ${user.subPregnancy ? `(${user.subPregnancy})` : ""}
      - 임신 주차: ${user.pregnancyWeek || "정보 없음"}주
      - 체중: ${user.weight || "?"}kg / 키: ${user.height || "?"}cm / BMI: ${bmi || "?"}
      - 입덧 정도: ${user.nausea || 0}/5
      - 만성질환 및 특이사항: ${user.conditions?.length ? user.conditions.join(", ") : "없음"}
      - 주의 성분: ${warningList?.length ? warningList.join(", ") : "없음"}
      - 섭취를 피해야 하는 음식: ${avoidedFoods.length ? avoidedFoods.join(", ") : "없음"}
      
      [복용 중인 약 정보]
      ${medicationSummary || "없음"}

      [영양 목표]
      - 하루 총 섭취 열량: ${kcal} kcal
      - 탄단지 비율: ${Object.entries(macroRatio).map(([k,v]) => `${k} ${v}`).join(", ")}
      - 미량영양소 필요량: ${Object.entries(micronutrients).map(([k,v]) => `${k}: ${v}`).join(", ")}

      [출력 형식 예시]
      
      [식단 테마]
      - 테마: (예: 철분 강화 식단)
      - 테마 설명: (이 식단 테마가 왜 중요한지 간단히 설명)

      (한국인이니만큼 하루 세 끼 중 두 끼 이상은 한식 밥 메뉴를 추천해주세요. 구체적 밥/구체적 국/반찬 최소 3개의 한정식 식단. 디저트 겸 구체적 과일 한 조각이나 초콜릿 몇 조각, 구체적인 후식과자 등도 좋습니다.)
      [아침]
      - 추천 메뉴:
      - 주의할 점:
      - 설명: (섭취 시간과 맥락, 건강 효과 포함 2-3문장)
      - 이런 상태라면 더 좋아요: (ex. 입덧이 있는 경우, 아침 공복 혈당이 낮은 경우 등. 해당되는 경우에만 작성)
      - 똑똑한 팁: (복용 중인 약이나 식이 상호작용을 고려한 팁. 해당되는 경우에만 작성)

      [점심]
      - 추천 메뉴:
      - 주의할 점:
      - 설명: (섭취 시간과 맥락, 건강 효과 포함 2-3문장)
      - 이런 상태라면 더 좋아요: (ex. 입덧이 있는 경우, 아침 공복 혈당이 낮은 경우 등. 해당되는 경우에만 작성)
      - 똑똑한 팁: (복용 중인 약이나 식이 상호작용을 고려한 팁. 해당되는 경우에만 작성)

      [저녁]
      - 추천 메뉴:
      - 주의할 점:
      - 설명: (섭취 시간과 맥락, 건강 효과 포함 2-3문장)
      - 이런 상태라면 더 좋아요: (ex. 입덧이 있는 경우, 아침 공복 혈당이 낮은 경우 등. 해당되는 경우에만 작성)
      - 똑똑한 팁: (복용 중인 약이나 식이 상호작용을 고려한 팁. 해당되는 경우에만 작성)

      [간식]
      - 추천 메뉴:(사용자의 건강상태에 맞춰 조금은 안건강한 간식도 가능. 예를 들어 생강 꿀차와 초코칩 쿠키 하나)
      - 주의할 점:
      - 설명: (섭취 시간과 맥락, 건강 효과 포함 2-3문장)
      - 이런 상태라면 더 좋아요: (ex. 입덧이 있는 경우, 아침 공복 혈당이 낮은 경우 등. 해당되는 경우에만 작성)
      - 똑똑한 팁: (복용 중인 약이나 식이 상호작용을 고려한 팁. 해당되는 경우에만 작성)

      [하루 식단 종합 가이드]
      - 섭취 충족도 분석: (예: 엽산 90%, 철분 70%, 비타민D 60% 등)
      - 추가 섭취 가이드:
        • 권장 영양제: (예: 철분제 30~50mg, 엽산 400~600μg)
        • 설명: (보충이 필요한 이유 설명)
      - 복용 주의사항:
        • 항목별 bullet list로 작성 (예: 철분제는 식후 1시간 후 복용 등)


        
      `.trim();
      

    const model = new ChatOpenAI({
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);
    const resultText = response.content;

    await saveMealPlanResult({
      email,
      kcal,
      macroRatio,
      micronutrients,
      avoidedFoods,
      llmResult: resultText,
    });

    res.json({ result: resultText });
  } catch (error) {
    console.error("❌ 식단 생성 오류:", error);
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};

// controllers/mealplanController.js
export const getEnergyAndMacroInfo = async (req, res) => {
  try {
    const user = req.user;
    if (!user || !user.birthYear || !user.height || !(user.weight || user.weightBefore)) {
      return res.status(400).json({ message: "유저 정보가 충분하지 않습니다." });
    }

    const age = new Date().getFullYear() - user.birthYear;
    const stage = user.pregnancy === "임신 중" ? getTrimester(user.pregnancyWeek) : user.pregnancy;
    const bmi = calculateBMI(user.weightBefore || user.weight, user.height);
    const energy = getEnergyRequirement(age, stage);
    const macro = getMacronutrientRatio(energy.kcal);

    res.json({
      status: "ok",
      info: {
        stage,
        bmi,
        totalEnergy: energy,
        macroRatio: {
          percent: {
            탄수화물: `${(macro.ratio.carb * 100).toFixed(0)}%`,
            단백질: `${(macro.ratio.protein * 100).toFixed(0)}%`,
            지방: `${(macro.ratio.fat * 100).toFixed(0)}%`,
          },
          grams: macro.mass
        }
      }
    });
  } catch (error) {
    console.error("❌ 에너지 및 비율 계산 오류:", error);
    res.status(500).json({ status: "error", message: "서버 오류입니다." });
  }
};









export const submitAvoidedFoods = async (req, res) => {
  try {
    const { avoidedFoods } = req.body;
    const email = req.user.email;

    if (!avoidedFoods || !Array.isArray(avoidedFoods)) {
      return res.status(400).json({ message: "회피 음식 정보가 올바르지 않습니다." });
    }

    // 예: 유저 모델에 저장 (User 모델에 avoidedFoods 필드가 있다고 가정)
    await User.updateOne({ email }, { $set: {avoidedFoods} });

    res.status(200).json({ message: "회피 음식 정보 저장 완료" });
  } catch (error) {
    console.error("[submitAvoidedFoods]", error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
};

