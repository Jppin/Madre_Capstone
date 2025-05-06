require("dotenv").config();
const mongoose = require("mongoose");
const fs = require("fs");
const csv = require("csv-parser");
const Nutrition = require("../models/Nutrient.cjs");
const path = require("path");
const csvPath = path.join(__dirname, "../data/nutrient_data.csv");


const MONGO_URI = process.env.MONGO_URI;
const DB_NAME = process.env.DB_NAME;
mongoose.connect(`${MONGO_URI}/${DB_NAME}`);

const dataMap = {};
let lastName = null;

// CSV의 첫 행이 제대로 인식되지 않을 경우, 직접 컬럼명 지정
const headers = ["name", "recommendation", "category", "keyword", "reason", "info", "usage", "precaution"];

fs.createReadStream(csvPath)
    .pipe(csv({ headers: headers, skipLines: 1 })) // 첫 행을 강제로 컬럼명으로 지정 & 첫 행 스킵
    .on("data", (row) => {
        console.log("DEBUG: CSV ROW →", row); // 데이터가 올바르게 들어오는지 확인

        let name = row["name"]?.trim();

        // 🔹 `name` 필드가 비어 있으면 마지막 `name` 값을 사용
        if (!name) {
            if (!lastName) {
                console.warn("⚠️ CSV 파일에서 name 값이 없습니다. 데이터를 확인하세요!");
                return;
            }
            name = lastName;
        } else {
            lastName = name; // 🔹 새로운 `name` 값이 나오면 업데이트
        }

        // 빈 문자열(`""`)을 `null`로 변환
        const cleanString = (value) => (value && value.trim() !== "" ? value.trim() : null);

        if (!dataMap[name]) {
            dataMap[name] = {
                name: name,
                info: cleanString(row["info"]),
                usage: cleanString(row["usage"]),
                precaution: cleanString(row["precaution"]),
                recommendations: []
            };
        }

        if (row["recommendation"]) {
            dataMap[name].recommendations.push({
                type: cleanString(row["recommendation"]),
                category: cleanString(row["category"]),
                keyword: cleanString(row["keyword"]),
                reason: cleanString(row["reason"])
            });
        }
    })
    .on("end", async () => {
        try {
            const dataList = Object.values(dataMap);
            await Nutrition.insertMany(dataList);
            console.log("✅ MongoDB 데이터 삽입 완료!");
            mongoose.connection.close();
        } catch (error) {
            console.error("❌ 데이터 삽입 중 오류 발생:", error);
        }
    });
