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
    
    while (true) {
      console.log("\n새로운 검색 시작...");
      await bot.searchAndAnalyze("룩북");
      
      // 다음 검색 전에 잠시 대기
      console.log("다음 검색을 위해 10초 대기...");
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
    
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await bot.close();
  }
}

main();
