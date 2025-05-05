// /controllers/mealplanController.js
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { saveMealPlanResult } from "../scripts/saveMealPlan.js";

export const generateMealPlan = async (req, res) => {
  try {
    const { recommendList, warningList, macroRatio, kcal, email } = req.body;
    if (!recommendList || !macroRatio || !kcal || !email) {
      return res.status(400).json({ message: "필수 입력값이 누락되었습니다." });
    }

    const prompt = `
다음 조건에 맞는 하루 식단을 생성해주세요:

- 권장 성분: ${recommendList.join(", ")}
- 주의 성분: ${warningList?.join(", ") || "없음"}
- 열량 목표: ${kcal} kcal
- 탄단지 비율: ${macroRatio}

다음 형식을 지켜 출력해주세요:

[아침]
- 추천 메뉴:
- 주의할 음식:
- 메뉴 선택 이유:
- 이렇다면 더 좋아요:

[점심]
- 추천 메뉴:
- 주의할 음식:
- 메뉴 선택 이유:
- 이렇다면 더 좋아요:

[저녁]
- 추천 메뉴:
- 주의할 음식:
- 메뉴 선택 이유:
- 이렇다면 더 좋아요:

[간식]
- 추천 메뉴:
- 주의할 음식:
- 메뉴 선택 이유:
- 이렇다면 더 좋아요:

[하루 식단 상세 가이드]
- 섭취 충족도 분석: (엽산 95%, 비타민D 70%, 철분 80% 등)
- 추가 섭취 가이드:
- 복용 주의사항:
- 식단 조절 팁:
    `.trim();

    const model = new ChatOpenAI({
      temperature: 0.7,
      modelName: "gpt-3.5-turbo",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    const response = await model.invoke([new HumanMessage(prompt)]);
    const resultText = response.content;

    await saveMealPlanResult({ email, kcal, macroRatio, llmResult: resultText });

    res.json({ result: resultText });
  } catch (error) {
    res.status(500).json({ message: "서버 오류 발생", error: error.message });
  }
};
