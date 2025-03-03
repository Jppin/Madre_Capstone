const axios = require("axios");
const cron = require("node-cron");
require("dotenv").config();
const Drug = require("./models/Drug.js"); // ✅ 모델 불러오기

// ✅ Open API 데이터 가져와 MongoDB 저장 (필요한 필드만 저장)
async function fetchDataAndUpdateDB() {
    try {
        console.log("🔄 Open API 데이터 동기화 시작...");

        let pageNo = 1;
        const numOfRows = 100; // 최대 100개씩 가져오기 (1000 → 100으로 수정)
        let totalCount = 0;

        // ✅ 첫 번째 요청에서 totalCount 가져오기
        const firstResponse = await axios.get(
            `${process.env.OPEN_API_URL}?serviceKey=${process.env.OPEN_API_KEY}&pageNo=1&numOfRows=1&type=json`
        );

        totalCount = firstResponse.data.body?.totalCount || 0;
        console.log(`📌 전체 데이터 개수: ${totalCount}개`);

        if (totalCount === 0) {
            console.warn("⚠ API에서 가져올 데이터가 없음!");
            return;
        }

        const totalPages = Math.ceil(totalCount / numOfRows);
        console.log(`📌 총 ${totalPages} 페이지 데이터 가져오기 시작...`);

        let allItems = [];

        // ✅ 전체 페이지 반복 요청
        for (let page = 1; page <= totalPages; page++) {
            console.log(`📌 ${page}/${totalPages} 페이지 가져오는 중...`);

            const response = await axios.get(
                `${process.env.OPEN_API_URL}?serviceKey=${process.env.OPEN_API_KEY}&pageNo=${page}&numOfRows=${numOfRows}&type=json`
            );

            //console.log(`📌 ${page} 페이지 응답 확인:`, JSON.stringify(response.data, null, 2)); // ✅ 응답 확인

            const data = response.data.body?.items;

            if (!data || data.length === 0) {
                console.warn(`⚠ ${page} 페이지에서 데이터가 없음!`);
                continue;
            }

            allItems = allItems.concat(data);
        }

        console.log(`✅ 총 ${allItems.length}개 약품 데이터 가져옴!`);

        // ✅ MongoDB 업데이트 (필요한 필드만 저장)
        const updatePromises = allItems.map(async (item) => {
            await Drug.findOneAndUpdate(
                { ITEM_SEQ: item.ITEM_SEQ },
                {
                    ITEM_SEQ: item.ITEM_SEQ,
                    ITEM_NAME: item.ITEM_NAME,
                    ENTP_NAME: item.ENTP_NAME,
                    ETC_OTC_CODE: item.ETC_OTC_CODE,
                    CLASS_NO: item.CLASS_NO,
                    CHART: item.CHART|| "정보 없음",
                    MATERIAL_NAME: item.MATERIAL_NAME?.split(",")[0] || "", // 첫 번째 성분만 저장
                    TYPE_NAME: item["TYPE_NAME  "]?.trim() || "",
                    STORAGE_METHOD: item.STORAGE_METHOD,
                    VALID_TERM: item.VALID_TERM,
                    UPDATE_DATE: new Date(),
                },
                { upsert: true, new: true }
            );
        });

        await Promise.all(updatePromises);
        console.log("✅ 모든 데이터 동기화 완료!");

    } catch (error) {
        console.error("🚨 API 호출 중 오류 발생:", error.message);
    }
}


// ✅ 매주 월요일 03:00에 동기화 실행
cron.schedule("0 3 * * 1", () => {
  fetchDataAndUpdateDB();
  console.log("📅 다음 동기화 예약됨 (매주 월요일 03:00)");
});


module.exports = fetchDataAndUpdateDB;

// 스케쥴러 무시하고 실행하려면.. : node -e 'require("./app").fetchDataAndUpdateDB()'
// 주의: 문서 이만 개 다 업데이트 해야 함 !!!