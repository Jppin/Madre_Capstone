import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from "react-native";
import Feather from "react-native-vector-icons/Feather";
import { useNavigation } from "@react-navigation/native";

function Settings3() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Feather name="chevron-left" size={30} color="gray" />
      </TouchableOpacity>

      {/* 상단 제목 */}
      <Text style={styles.title}>개인 정보 처리 방침</Text>

      {/* 약관 내용 */}
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.text}>
        1. 개인정보의 수집 및 이용 목적{"\n"}
뉴트리박스는 개인 맞춤 영양성분 추천 및 관리 서비스를 제공하기 위해 필요한 최소한의 개인정보를 수집합니다. 수집하는 정보는 다음과 같습니다.{"\n"}
성명, 연령, 성별{"\n"}
건강 정보(키, 몸무게, 만성 질환, 섭취 의약품){"\n"}
2. 개인정보의 처리 및 보유 기간{"\n"}
이용자의 개인정보는 서비스 이용 계약 체결 시부터 서비스 이용 계약 해지까지 보유 및 이용됩니다. 단, 관련 법령에 의거한 정보 보유 사유가 발생한 경우 해당 기간 동안 보유합니다.{"\n"}
3. 개인정보의 제3자 제공{"\n"}
Jppin은 이용자의 동의 없이 개인정보를 제3자에게 제공하지 않습니다. 다만, 법적 요구가 있는 경우를 제외하고는 예외입니다.{"\n"}
4. 개인정보의 안전성 확보 조치{"\n"}
Jppin은 개인정보의 안전한 보호를 위해 다음과 같은 보안 조치를 취하고 있습니다.{"\n"}
개인정보 암호화{"\n"}
접근 제한 및 접근 권한 관리{"\n"}
보안 프로그램 설치 및 주기적인 갱신 및 점검{"\n"}
5. 이용자의 권리와 그 행사 방법{"\n"}
이용자는 언제든지 등록되어 있는 자신의 개인정보를 조회하거나 수정할 수 있으며, 개인정보의 삭제를 요청할 수 있습니다.
이용자가 개인정보의 오류에 대한 정정을 요청할 경우, Jppin은 정정을 완료할 때까지 해당 개인정보를 이용하지 않습니다.{"\n"}
6. 개인정보 보호책임자 : 강명진{"\n"}
연락처: [010-7430-3551], [dding921@naver.com]{"\n"}
7. 변경 사항에 대한 공지{"\n"}
본 개인정보처리방침의 변경이 있을 경우 웹사이트 및 앱을 통해 공지하며, 변경사항은 그 적용일자 7일 전부터 공지됩니다.{"\n"}
        </Text>
      </ScrollView>
    </View>
  );
}

export default Settings3;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 5,
    zIndex: 10,
    padding: 10,
},
  title: {
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 50, // 뒤로가기 버튼과 겹치지 않도록 여유를 둡니다
    marginBottom: 10
  },
  scrollContainer: {
    flex: 1,
    marginHorizontal: 20
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
    color: "#333"
  }
});
