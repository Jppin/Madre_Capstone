//   backend/controllers/mealplanController.js
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { saveMealPlanResult } from "../db_scripts/saveMealPlan.js";
import {
  calculateBMI,
  getEnergyRequirement,
  getMacronutrientRatio,
  getMicronutrientNeedsByStage,
  getUserStage,
  getTrimester,
  getCurrentWeightGainGoal
} from "../services/nutrientUtils.js";
import Medicine from "../models/Medicine.js";
import { summarizeMedications } from "../services/medicationUtils.js";
import MealPlan from "../models/MealPlan.js";
import { get } from "mongoose";


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
    const weightGainGoal = getCurrentWeightGainGoal(bmi);
    const kcal = energy.kcal;

    const macroRatio = {
      탄수화물: `${Math.round(macronutrients.ratio.carb * 100)}%`,
      단백질: `${Math.round(macronutrients.ratio.protein * 100)}%`,
      지방: `${Math.round(macronutrients.ratio.fat * 100)}%`,
    };

    const micronutrientText = Object.entries(micronutrients)
      .map(([name, value]) => `${name}: ${value}`)
      .join(", ");

    const mergedList = [...new Set([
      ...recommendList,
      ...Object.keys(micronutrients),
    ])];
    const topNutrients = mergedList.slice(0, 5); // 상위 5개만 사용


    const user_info_block = `
    ## 사용자 정보
    - 임신 단계: ${stage} (${user.pregnancy}${user.subPregnancy ? ` / ${user.subPregnancy}` : ""})
    - 현재 임신 주차: ${user.pregnancyWeek || "?"}주 (출산까지 약 ${user.pregnancyWeek ? 40 - user.pregnancyWeek : "?"}주 남음)
    - 연령: ${age}세
    - 신체 정보: 키 ${user.height || "?"}cm / 체중 ${user.weight || "?"}kg${weightGain} / BMI: ${bmi || "?"}
    - 입덧 정도: ${user.nausea || 0}/5 (0: 없음 ~ 5: 매우 심함)
    - 만성질환 및 특이사항: ${user.conditions?.length ? user.conditions.join(", ") : "없음"}
    - 사용자 정보 기반 추천 성분: ${recommendList.length ? recommendList.join(", ") : "없음"}
    - 주의해야 할 성분: ${warningList?.length ? warningList.join(", ") : "없음"}
    - 피해야 할 음식: ${avoidedFoods.length ? avoidedFoods.join(", ") : "없음"}
    - 복용 중인 약 요약: ${medicationSummary || "없음"}
    - 이번 주 체중 증가 목표: ${weightGainGoal || "없음"}
    `.trim();

    const prompt = `
    당신은 임산부 식단 전문가입니다. 아래 사용자 정보를 참고하여 하루 식단을 구성해 주세요.

    ${user_info_block}

    ## 영양 목표
    - 총 섭취 열량: ${kcal} kcal
    - 탄수화물/단백질/지방 비율: ${Object.entries(macroRatio).map(([k,v]) => `${k} ${v}`).join(", ")}
    - 주요 미량 영양소 필요량: ${Object.entries(micronutrients).map(([k,v]) => `${k}: ${v}`).join(", ")}

    ---

   ## 식단 구성 지침

    - 하루 식단은 **아침 / 점심 / 저녁 / 간식** 총 4끼로 구성해주세요.
    - 하루 총 열량 ${kcal} kcal을 기준으로, 각 끼니에 적절히 분배해주세요.  
      일반적인 분배 비율은 **아침 25%, 점심 35%, 저녁 30%, 간식 10%**입니다.
    - 각 끼니는 해당 열량 범위 내에서 **탄수화물 ${macroRatio["탄수화물"]}, 단백질 ${macroRatio["단백질"]}, 지방 ${macroRatio["지방"]}** 비율을 반영해주세요.
    - 모든 음식은 **구체적인 명칭과 1인분 기준의 정확한 양**을 포함해주세요.  
      예: 현미밥 1/2공기, 고등어구이 1토막, 사과 1/3개
    - 하루 지방 섭취량 중 오메가-6와 오메가-3 지방산의 비율은 약 4:1~10:1 수준으로 구성해주세요.
    - 오메가-3는 등푸른 생선(고등어, 연어 등)이나 들기름, 아마씨유 등을 활용해 구성할 수 있습니다.
      - **아침/점심/저녁 중 최소 2끼는 한식 스타일(밥, 국, 반찬 구성)**으로 구성해주세요.
    - 한 끼 식사는 과하지 않은 양으로 구성하며, **작은 과일 또는 소량 디저트(예: 초콜릿 1~2조각)**는 허용됩니다.
    - 간식은 **입덧, 식욕 저하, 기분 전환 등 건강 상태**를 고려해 부드러운 식품이나 기호식품으로 구성하되, **고열량 간식은 피해주세요.**
    - 각 끼니의 설명은 **섭취 시점, 건강 효과, 추천 이유**를 포함하여 **2~3문장 이내**로 작성해주세요.
    ---

    ## 출력 형식

    [식단 테마]
    - 테마:
    - 테마 설명:

    [아침]
    - 추천 메뉴:
    - 주의할 점:
    - 설명:
    - 이런 상태라면 더 좋아요:
    - 똑똑한 팁:

    [점심]
    - 추천 메뉴:
    - 주의할 점:
    - 설명:
    - 이런 상태라면 더 좋아요:
    - 똑똑한 팁:

    [저녁]
    - 추천 메뉴:
    - 주의할 점:
    - 설명:
    - 이런 상태라면 더 좋아요:
    - 똑똑한 팁:

    [간식]
    - 추천 메뉴:
    - 주의할 점:
    - 설명:
    - 이런 상태라면 더 좋아요:
    - 똑똑한 팁:

    ---

    ## 끼니별 항목 작성 기준

    - **추천 메뉴**: 음식 이름 + 1인분 기준의 양 (예: 현미밥 1/2공기, 된장국 1그릇)
    - **주의할 점**: 사용자 상태나 주의 성분을 반영한 경고
    - **설명**: 영양소 효과와 맥락을 2~3문장으로 기술
    - **이런 상태라면 더 좋아요**: 해당 식단이 특히 적합한 상황 (입덧, 기운 없음 등)
    - **똑똑한 팁**: 복용 중인 약물이나 주의 성분 기반 식이 팁

    ---

    ## 하루 식단 종합 가이드

    - 섭취 충족도 분석:
      아래 형식을 반드시 따르세요. 줄바꿈된 리스트로 작성하세요.  
      각 항목은 다음 형식으로 시작해야 합니다: '• 영양소이름 숫자%'
      예시:  
      • 엽산 90%  
      • 철분 70%  
      • 비타민 D 60%

    - 추가 섭취 가이드:
      - 권장 영양제: (줄바꿈된 리스트, '•'로 시작하지 마세요. 한 줄에 하나씩)  
        철분제 30~50mg  
        엽산 400~600μg
      - 설명: (필수)  
        식단 결과 부족한 성분에 대해 **3~4문장 이내**로 보충 필요성을 설명하세요.

    - 복용 주의사항:
      각 항목은 반드시 '-'로 시작해야 합니다. 예시:
      - 철분제는 식사 1시간 후, 비타민 C와 함께 복용 시 흡수율이 높아져요.  
      - 엽산 보충제는 의사 지시에 따라 복용해야 합니다.

    `.trim();

      

    const model = new ChatOpenAI({
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);
    const resultText = response.content;

    // ✅ MealPlan 저장
    const mealPlan = await saveMealPlanResult({
      email,
      kcal,
      macroRatio,
      micronutrients,
      avoidedFoods,
      llmResult: resultText,
    });

    console.log("✅ 저장 및 파싱된 mealPlan 객체 ↓↓↓↓↓↓↓↓↓↓");
    console.dir(mealPlan.toObject(), { depth: null });

    // ✅ 구조화된 전체 응답 반환
    res.status(200).json(mealPlan);

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


export const getLatestMealPlan = async (req, res) => {
  try {
    console.log("✅ 요청한 유저:", req.user);
    const email = req.user.email;
    const recent = await MealPlan.findOne({ email }).sort({ createdAt: -1 });

    if (!recent) {
      return res.status(404).json({ message: "최근 식단이 없습니다." });
    }

    res.status(200).json({
      kcal: recent.kcal,
      macroRatio: recent.macroRatio,
      micronutrients: recent.micronutrients,
      avoidedFoods: recent.avoidedFoods,
      llmResult: recent.llmResult,
      breakfast: recent.breakfast,
      lunch: recent.lunch,
      dinner: recent.dinner,
      snack: recent.snack,
      dailyGuide: recent.dailyGuide,
    });

  } catch (err) {
    console.error("[getLatestMealPlan]", err); // ❗ 이거 콘솔에 찍고,
  res.status(500).json({ message: "최근 식단 조회 실패", error: err.message }); // ❗ 이거 프론트에도 보내줘
  }
};



