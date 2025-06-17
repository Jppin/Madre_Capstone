import { saveMealPlanResult } from "../db_scripts/saveMealPlan.js";
import Medicine from "../models/Medicine.js";
import { summarizeMedications } from "../services/medicationUtils.js";
import MealPlan from "../models/MealPlan.js";
import axios from "axios";
import { AppError } from "../middleware/errorHandler.js";
import {
  calculateBMI,
  getEnergyRequirement,
  getMacronutrientRatio,
  getMicronutrientNeedsByStage,
  getUserStage,
  getTrimester,
  getCurrentWeightGainGoal
} from "../services/nutrientUtils.js";


// 1) Flask 호출용 엔드포인트 (예: /api/mealplan/generate-and-save)
export const generateAndSaveMealPlan = async (req, res, next) => {
  try {

    const { recommendList, warningList, avoidedFoods = [], user } = req.body;
    const email = user?.email;
    if (!recommendList || !email) {
      throw new AppError("필수 입력값이 누락되었습니다.", 400);
    }
    
    // --- A. Node.js에서 사용자 기반 영양 계산(기존 코드 일부 재사용) ------------

    // (1) 나이 계산
    const age = new Date().getFullYear() - user.birthYear;

    // (2) 생리 단계 판단
    const stage = getUserStage(user);

    // (3) BMI 계산
    const weightBefore = user.weightBefore
    const weight = user.weight;
    const height = user.height;
    const bmi = calculateBMI(weightBefore||weight, height);

    // (4) 에너지 요구량 계산
    const energy = getEnergyRequirement(age, stage);
    const kcal = energy.kcal;

    // (5) 매크로 비율 계산
    const macronutrients = getMacronutrientRatio(kcal);
    const macroRatio = {
      탄수화물: `${Math.round(macronutrients.ratio.carb * 100)}%`,
      단백질: `${Math.round(macronutrients.ratio.protein * 100)}%`,
      지방: `${Math.round(macronutrients.ratio.fat * 100)}%`
    };

    // (6) 미량 영양소 필요량 계산
    const micronutrients = getMicronutrientNeedsByStage(stage);

    // (7) 체중 증가 목표 계산 (쌍둥이 여부가 없으면 두 번째 인자 생략 가능)
    const weightGainGoal = getCurrentWeightGainGoal(bmi, user.pregnancyWeek || 0);

    // (8) 복용 중인 약 요약 (medicineUtils 대신 바로 Medication 요약)
    const medicineList = await Medicine.find({ user_id: user._id });
    const medicationSummary = summarizeMedications(medicineList);

    // --- B. Flask 서버로 POST 보낼 JSON 페이로드 조립 --------------------

    // 우리는 이미 모든 영양 계산값을 가지고 있으므로, Flask에는 "값"만 전달한다.
    const flaskPayload = {
      user: {
        email: user.email,
        // 필요하다면 이름, nickname 등 추가 필드도 전송
      },
      // 계산된 값들
      age,
      stage,
      bmi,
      kcal,
      macroRatio,
      micronutrients,
      weightGainGoal,
      medicationSummary,

      // Node.js에서 미리 준비한 배열
      recommendList,
      warningList,
      avoidedFoods
    };

    // 3) 환경변수로부터 Flask URL 조합
    const baseUrl = process.env.BASE_URL;      // e.g. "http://10.0.2.15"
    const flaskPort = process.env.FLASK_PORT;  // e.g. "5002"
    const flaskUrl = `${baseUrl}:${flaskPort}/flask/generate-mealplan`;

    // console.log("✅ flaskPayload:", JSON.stringify(flaskPayload, null, 2));


    // 4) Flask로 POST 요청하여 LLM 호출 결과(JSON)를 받기
    const flaskResp = await axios.post(flaskUrl, flaskPayload, {
      headers: { "Content-Type": "application/json" },
      timeout: 120000, // 120초 타임아웃
    });

    // Flask가 반환한 JSON 예시:
    // {
    //   email: "...",
    //   kcal: 2340,
    //   macroRatio: { 탄수화물: "60%", 단백질: "15%", 지방: "25%" },
    //   micronutrients: { … },
    //   avoidedFoods: ["…","…"],
    //   llmResult: "Flask에서 생성한 식단 텍스트"
    // }
    const { kcal: flaskKcal,
            macroRatio: flaskMacroRatio,
            micronutrients: flaskMicronutrients,
            avoidedFoods: flaskAvoidedFoods,
            llmResult } = flaskResp.data;

    // 5) Node.js 측에서 받은 결과 그대로 saveMealPlanResult에 전달해 저장
    const mealPlan = await saveMealPlanResult({
      email,
      kcal: flaskKcal,
      macroRatio: flaskMacroRatio,
      micronutrients: flaskMicronutrients,
      avoidedFoods: flaskAvoidedFoods,
      llmResult: llmResult,
    });

    // 6) 저장된 MealPlan 객체를 최종 응답
    console.log("✅ 저장 및 파싱된 mealPlan 객체:", mealPlan.toObject());
    return res.status(200).json(mealPlan);
  } catch (error) {
    console.error("❌ 식단 생성 오류:", error);
    next(error);
  }
};


/**
 *  기존 getLatestMealPlan 는 그대로 유지
 */
export const getLatestMealPlan = async (req, res, next  ) => {
  try {
    const email = req.user.email; // 인증 미들웨어 적용 가정
    const recent = await MealPlan.findOne({ email }).sort({ createdAt: -1 });

    if (!recent) {
      throw new AppError("최근 식단이 없습니다.", 404);
    }

    return res.status(200).json({
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
    console.error("[getLatestMealPlan] 오류:", err);
    next(err);
  }
};
