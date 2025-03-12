const fs = require('fs');
const csv = require('csv-parser');
const { MongoClient } = require('mongodb');

// MongoDB 연결 정보
const MONGO_URI = "mongodb://localhost:27017/";
const DB_NAME = "test"; // 사용할 DB명
const COLLECTION_NAME = "supplements"; // 영양제 컬렉션명
const CSV_FILE = "supplements.csv"; // CSV 파일명

async function uploadCSVtoMongoDB() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        // CSV 데이터 읽기
        const supplementsData = {};
        fs.createReadStream(CSV_FILE)
            .pipe(csv())
            .on('data', (row) => {
                const name = row["name"];
                
                if (!supplementsData[name]) {
                    supplementsData[name] = {
                        name: name,
                        effects: [],
                        summary: row["summary"] || null,
                        usage_guide: row["usage_guide"] || null,
                        precautions: row["precautions"] || null
                    };
                }

                // 효과 추가
                const effect = {
                    effect_type: row["effect_type"],
                    category: row["category"],
                    reason: row["reason"]
                };

                // keyword 값이 있을 경우 추가
                if (row["keyword"]) {
                    effect["keyword"] = row["keyword"];
                }

                // medication_id 값이 있을 경우 추가 (약물 상호작용)
                if (row["medication_id"]) {
                    effect["medication_id"] = row["medication_id"];
                }

                // threshold 값이 있을 경우 추가 (음주 기준)
                if (row["threshold"]) {
                    effect["threshold"] = row["threshold"];
                }

                supplementsData[name]["effects"].push(effect);
            })
            .on('end', async () => {
                // MongoDB에 데이터 삽입
                const dataArray = Object.values(supplementsData);
                await collection.insertMany(dataArray);

                console.log("CSV 데이터가 MongoDB에 성공적으로 추가되었습니다.");
                client.close();
            });
    } catch (error) {
        console.error("MongoDB 연결 오류:", error);
        client.close();
    }
}

// 실행
uploadCSVtoMongoDB();
