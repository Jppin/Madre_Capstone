# controllers/mealplan_controller.py

from flask import Blueprint, request, jsonify, current_app
from utils.prompt_builder import build_mealplan_prompt
import pprint
bp = Blueprint("mealplan", __name__, url_prefix="/flask")


@bp.route("/generate-mealplan", methods=["POST"])
def generate_mealplan():
    """
    Node.js에서 보낸 JSON 예시:
    {
      user: {
        email: "...",
        pregnancy: "...",
        subPregnancy: "...",
        pregnancyWeek: 20,
        nausea: 2,
        conditions: ["고혈압"],
        height: 164,
        weight: 62,
        weightBefore: null
      },
      recommendList: ["엽산", "철분"],
      warningList: ["카페인"],
      avoidedFoods: ["생선회", "기름진 음식"],
      age: 34,
      stage: "임신중기",
      bmi: 23.1,
      kcal: 2340,
      macroRatio: { 탄수화물: "60%", 단백질: "15%", 지방: "25%" },
      micronutrients: {
        식이섬유: "20g",
        비타민A: "650 µg",
        비타민C: "+10 mg (기준 100 mg)",
        엽산: "+220 µg (기준 400 µg)",
        ...
      },
      weightGainGoal: 1.7,
      medicationSummary: "철분제 30mg, 엽산제 400µg"
    }
    Flask는 위 데이터를 받아 Prompt를 만들어 LLM 호출 후,
    { email, kcal, macroRatio, micronutrients, avoidedFoods, llmResult } 형태로 응답합니다.
    """
    try:
        data = request.get_json()

        # 1) 필수 키 체크
        for key in [
            "user",
            "recommendList",
            "warningList",
            "avoidedFoods",
            "age",
            "stage",
            "bmi",
            "kcal",
            "macroRatio",
            "micronutrients",
        ]:
            if key not in data:
                return jsonify({"message": f"'{key}'가 요청에 필요합니다."}), 400

        user = data["user"]
        recommend_list = data["recommendList"]
        warning_list = data["warningList"]
        avoided_foods = data["avoidedFoods"]
        age = data["age"]
        stage = data["stage"]
        bmi = data["bmi"]
        kcal = data["kcal"]
        macro_ratio = data["macroRatio"]
        micronutrients = data["micronutrients"]
        weight_gain_goal = data.get("weightGainGoal", None)
        medication_summary = data.get("medicationSummary", "")

        # 2) utils/prompt_builder.py에 정의된 build_mealplan_prompt() 호출
        #    이 함수가 LLM에 넘길 Prompt 문자열을 반환
        prompt = build_mealplan_prompt(
            user=user,
            recommend_list=recommend_list,
            warning_list=warning_list,
            avoided_foods=avoided_foods,
            age=age,
            stage=stage,
            bmi=bmi,
            kcal=kcal,
            macro_ratio=macro_ratio,
            micronutrients=micronutrients,
            weight_gain_goal=weight_gain_goal,
            medication_summary=medication_summary
        )
        
        print("📤 Prompt 전달 전 로그 ========")
        print(prompt)

        # 3) Flask의 current_app.config에서 qa_chain 꺼내기
        qa_chain = current_app.config["QA_CHAIN"]

        # 4) QA 체인에 prompt(질문) 넘겨서 LLM 결과 얻기
        rag_response = qa_chain({"query": prompt})
        print("📥 LLM 응답 로그 ========")
        pprint.pprint(rag_response)

        llm_result = rag_response["result"]

        # 5) Node.js가 DB에 저장할 때 필요한 JSON 포맷으로 응답
        result_payload = {
            "email": user.get("email"),
            "kcal": kcal,
            "macroRatio": macro_ratio,
            "micronutrients": micronutrients,
            "avoidedFoods": avoided_foods,
            "llmResult": llm_result
        }
        return jsonify(result_payload), 200

    except Exception as e:
        return jsonify({"message": "Flask 내부 오류 발생", "error": str(e)}), 500

# 🔍 벡터 검색 테스트 라우트
@bp.route("/test-search", methods=["GET"])
def test_vector_search():
    try:
        query = request.args.get("query", "").strip()
        if not query:
            return jsonify({"message": "query 파라미터가 필요합니다."}), 400
        
        qa_chain = current_app.config["QA_CHAIN"]
        retriever = qa_chain.retriever

        results = retriever.invoke(query)
        
        # 상위 3개 문서 내용만 간단히 출력
        formatted_results = [
            {
                "chunk": i + 1,
                "content": doc.page_content[:500],  # 너무 길면 500자까지만
                "metadata": doc.metadata
            }
            for i, doc in enumerate(results[:3])
        ]

        return jsonify({"query": query, "results": formatted_results}), 200

    except Exception as e:
        return jsonify({"message": "검색 중 오류 발생", "error": str(e)}), 500
    
@bp.route("/ask", methods=["GET"])
def ask_question():
    query = request.args.get("query")
    if not query:
        return jsonify({"error": "query 파라미터가 필요합니다."}), 400

    try:
        qa_chain = current_app.config["QA_CHAIN"]  # ✅ 여기서도 current_app 사용
        result = qa_chain.invoke({"query": query})
        answer = result["result"]
        sources = [doc.metadata.get("source", "") for doc in result["source_documents"]]

        return jsonify({
            "query": query,
            "answer": answer,
            "sources": sources
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500