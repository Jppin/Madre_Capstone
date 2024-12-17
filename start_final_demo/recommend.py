from services.user_service import get_user_info_byname
from services.graph_service import graph

def main():
    # 사용자 정보 준비
    user_name = "이영훈"
    user_info = get_user_info_byname(user_name)

    if not user_info:
        print(f"User '{user_name}' not found in the database.")
        return

    # State 초기화
    initial_state = {
        "question": "Are there any supplements that interact negatively with my medications or health condition?",
        "user_info": user_info
    }

    print("Invoking the graph...")
    result = graph.invoke(initial_state)

    print("\n=== Warnings ===")
    print(result.get('warnings', 'No warnings'))

    print("\n=== Recommendations ===")
    recommendations = result.get("recommendations", [])
    if not recommendations:
        print("추천할 만한 영양제가 없습니다.")
    else:
        for rec in recommendations:
            print(f"- {rec['name']}: {rec['amount']} ({rec['time']}) - {rec['reason']}")

if __name__ == "__main__":
    main()
