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

function Settings2() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Feather name="chevron-left" size={28} color="#333" />
      </TouchableOpacity>

      {/* 상단 제목 */}
      <Text style={styles.title}>서비스 이용 약관</Text>

      {/* 약관 내용 */}
      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.text}>
        1. 총칙{"\n"}
        본 약관은  뉴트리박스가 제공하는 영양성분 추천 서비스 및 관련 제반 서비스의 이용과 관련하여 회사와 이용자의 권리, 의무, 책임사항을 규정함을 목적으로 합니다.{"\n"}
        2. 정의{"\n"}
        "서비스"란 뉴트리박스가이 제공하는 영양성분 추천 및 건강 관리 관련 정보를 제공하는 앱을 통해 이용할 수 있는 모든 서비스를 의미합니다.{"\n"}
        "이용자"란 본 약관에 따라 Jppin이이 제공하는 서비스를 받는 회원 및 비회원을 말합니다.{"\n"}
        3. 약관의 명시와 개정{"\n"}
        회사는 본 약관의 내용을 이용자가 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.
        회사는 법률이나 서비스의 변경 사항을 반영하기 위해 약관을 개정할 수 있으며, 개정된 약관은 지정된 날부터 효력이 발생합니다.{"\n"}
        4. 서비스 이용계약의 성립{"\n"}
        이용계약은 이용자의 이용신청에 대한 회사의 이용승낙과 이용자의 약관 동의로 성립합니다.{"\n"}
        5. 서비스 제공 및 변경{"\n"}
        회사는 건강 분석 및 영양성분 추천 등을 제공합니다.
        회사는 필요한 경우 서비스 내용을 변경할 수 있으며, 서비스 변경 사항은 서비스 화면에 공지사항으로 게시합니다.{"\n"}
        6. 서비스 이용의 제한 및 정지{"\n"}
        회사는 이용자가 약관의 의무를 위반하거나 서비스의 정상적인 운영을 방해하는 경우, 서비스 이용을 일시적으로 제한하거나 정지할 수 있습니다.{"\n"}
        7. 권리의 귀속 및 저작물의 이용{"\n"}
        제공되는 서비스, 그에 수반하는 저작물, 관련 상표 및 로고 등의 저작권 및 기타 지적 재산권은 Jppin에 귀속됩니다.
        이용자는 회사가 명시적으로 승인한 경우를 제외하고는 서비스나 그 내용을 상업적으로 사용할 수 없습니다.{"\n"}
        8. 면책 조항{"\n"}
        회사는 천재지변, 전쟁, 테러 행위 등 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.
        회사는 이용자의 귀책 사유로 인한 서비스 이용 장애에 대하여 책임을 지지 않습니다.{"\n"}
        9. 분쟁의 해결{"\n"}
        서비스 이용 중 발생한 분쟁에 대해 이용자는 Jppin의 고객 서비스 부서로 민원을 제기할 수 있습니다.
        회사와 이용자 간 발생한 분쟁은 대한민국 법을 적용하여 해결합니다.{"\n"}
        </Text>
      </ScrollView>
    </View>
  );
}

export default Settings2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 10
  },
  backButton: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
    padding: 10
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
