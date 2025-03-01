import * as faceapi from "face-api.js";
import path from "path";
import { YouTubeBot } from "./services/YouTubeBot";
import "dotenv/config";

// face-api.js가 canvas를 사용할 수 있도록 설정
const canvas = require("canvas");
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as any,
  Image: canvas.Image as any,
});

async function init() {
  // 모델 경로 설정
  const MODEL_PATH = path.join(__dirname, "../models");

  // 모델 로드
  await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromDisk(MODEL_PATH),
    faceapi.nets.ageGenderNet.loadFromDisk(MODEL_PATH),
  ]);

  console.log("Models loaded successfully");
}

async function main() {
  const bot = new YouTubeBot();

  try {
    await init();
    await bot.init();
    await bot.login();

    const keywords = [
      // "룩북",
      // "직캠",
      "댄스팀 직캠",
      "치어리더",
      "장원영",
      "안유진",
      "아이즈원",
      "에스파 윈터",
      "에스파 닝닝",
      "에스파 카리나",
      "블랙핑크",
      "레드벨벳",
      "교차편집",
      "동대문 밀리오레 직캠",
      "여자 아이돌 직캠 모음"
    ];

    while (true) {
      const randomKeyword =
        keywords[Math.floor(Math.random() * keywords.length)];
      console.log(`\n새로운 검색 시작... ${randomKeyword}`);
      await bot.searchAndAnalyze(randomKeyword);

      // 다음 검색 전에 잠시 대기
      console.log("다음 검색을 위해 3초 대기...");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await bot.close();
  }
}

main();
