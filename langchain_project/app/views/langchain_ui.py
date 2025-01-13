import streamlit as st
from database.crud import get_all_user_names, get_user_info, save_to_custom_logs
from langchain_service.openai_integration import LangChainService
from datetime import datetime

def show():
    st.title("Personalized LangChain Demo")

    # 사용자 선택
    st.subheader("Select a User")

    # 모든 사용자 목록 가져오기 (name과 _id 포함)
    users = get_all_user_names()  # 사용자 목록 조회 함수 호출

    # 사용자 이름 목록 생성
    user_names = [f"{user['name']} ({user['_id']})" for user in users]  # 이름과 ObjectId 표시
    selected_user_index = st.selectbox("Choose a user:", range(len(users)), format_func=lambda idx: user_names[idx])

    # 선택된 사용자의 ObjectId 가져오기
    selected_user_id = users[selected_user_index]["_id"]

    # 사용자 프로필 데이터 가져오기
    user_profile = get_user_info(str(selected_user_id))  # ObjectId를 문자열로 변환하여 전달

    if user_profile:
        # 사용자 데이터 표시
        st.write(f"**Name**: {user_profile['name']}")
        st.write(f"**Age**: {user_profile['age']}")
        st.write(f"**Gender**: {user_profile['gender']}")
        st.write(f"**Health Interests**: {', '.join(user_profile['health_interests'])}")

        # 프롬프트 입력
        st.subheader("Generate a Response")
        user_prompt = st.text_area("Enter your prompt:", "Please recommend some nutritional ingredients to take to improve these health concerns.")

        if st.button("Generate"):
            if user_prompt:
                # LangChain 서비스 초기화
                service = LangChainService()

                # 사용자 프로필 데이터를 기반으로 프롬프트 생성
                health_interests = ", ".join(user_profile['health_interests'])
                full_prompt = (
                    f"The user has the following health interests: {health_interests}.\n"
                    f"Based on these interests, recommend specific nutritional supplements or ingredients to address these health concerns.\n\n"
                    f"Provide a structured response in Korean that includes:\n"
                    f"1. Supplement names or key ingredients.\n"
                    f"2. Benefits of each supplement.\n"
                    f"3. Precautions or interactions to be aware of.\n\n"
                    f"User Prompt: {user_prompt}"
                )

                # LangChain을 통해 응답 생성
                response = service.generate_response(full_prompt)
                st.success("Response generated successfully!")
                st.write(response)

                # 새로운 custom_logs 컬렉션에 데이터 저장
                save_to_custom_logs({
                    "user_id": user_profile["_id"],
                    "prompt": user_prompt,
                    "response": response,
                    "health_interests": health_interests,
                    "created_at": datetime.now()
                })

                st.info("The prompt and response have been saved to the new collection.")
            else:
                st.error("Prompt cannot be empty.")
    else:
        st.error("User profile not found.")
