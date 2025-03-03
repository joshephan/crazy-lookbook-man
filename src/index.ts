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
      "아이브 장원영",
      "아이브 안유진",
      "엔믹스 설윤",
      "뉴진스 민지",
      "뉴진스 하니",
      "아이브 이서",
      "엔믹스 해원",
      "뉴진스 해린",
      "아이브 레이",
      "아이브 리즈",
      "프로미스나인 백지헌",
      "아이브 가을",
      "프로미스나인 이채영",
      "르세라핌 김채원",
      "아이들 미연",
      "아이들 우기",
      "에스파 지젤",
      "엔믹스 규진",
      "프로미스나인 박지원",
      "ITZY 예지",
      "프로미스나인 송하영",
      "트와이스 사나",
      "레드벨벳 아이린",
      "프로미스나인 이나경",
      "뉴진스 다니엘",
      "블랙핑크 지수",
      "블랙핑크 제니",
      "블랙핑크 로제",
      "우주소녀 보나",
      "엔믹스 지우",
      "ITZY 유나",
      "뉴진스 혜인",
      "STAYC 세은",
      "소녀시대 윤아",
      "엘리스 유경",
      "걸스데이 혜리",
      "르세라핌 홍은채",
      "아이들 소연",
      "케플러 김채현",
      "오마이걸 아린",
      "프로미스나인 노지선",
      "트와이스 나연",
      "엔믹스 배이",
      "르세라핌 카즈하",
      "케플러 휴닝바히에",
      "아이들 민니",
      "STAYC 수민",
      "프로미스나인 이서연",
      "우주소녀 루다",
      "르세라핌 허윤진",
      "트와이스 채영",
      "소녀시대 태연",
      "우아! 나나",
      "앨리스 도아",
      "네이처 오로라",
      "트와이스 쯔위",
      "오마이걸 유아",
      "아이들 슈화",
      "AOA 설현",
      "드림노트 은조",
      "오마이걸 미미",
      "에스파 윈터",
      "에스파 닝닝",
      "에스파 카리나",
      "이달의 소녀 최리",
      "시그니처 클로이",
      "걸스데이 유라",
      "STAYC 시은",
      "레드벨벳 슬기",
      "세러데이 아연",
      "티아라 지연",
      "로켓펀치 수윤",
      "혼다 히토미",
      "STAYC 재이",
      "이달의 소녀 현진",
      "드림노트 보니",
      "에이핑크 정은지",
      "VIVIZ 엄지",
      "트와이스 정연",
      "오마이걸 유빈",
      "위클리 조아",
      "레드벨벳 조이",
      "VIVIZ 은하",
      "프로미스나인 이새롬",
      "엔믹스 릴리",
      "우아! 민서",
      "레드벨벳 웬디",
      "오마이걸 승희",
      "EXID 하니",
      "세러데이 유키",
      "트와이스 미나",
      "ITZY 류진",
      "네이처 채빈",
      "소녀시대 수영",
      "케플러 최유진",
      "라붐 진예",
      "트와이스 모모",
      "ITZY 채령",
      "VIVIZ 신비",
      "교차편집",
      "동대문 밀리오레 직캠",
      "여자 아이돌 직캠 모음",
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
