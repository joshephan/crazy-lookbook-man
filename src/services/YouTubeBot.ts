import puppeteer, { Browser, Page } from "puppeteer";
import * as faceapi from "face-api.js";

// canvas 설정
const canvas = require("canvas");
faceapi.env.monkeyPatch({
  Canvas: canvas.Canvas as any,
  Image: canvas.Image as any,
});

export class YouTubeBot {
  private browser: Browser | null = null;
  private page: Page | null = null;
  private watchedVideos: Map<string, { title: string; timestamp: number }> = new Map();

  async init() {
    this.browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
      args: [
        "--start-maximized",
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
      ],
      ignoreDefaultArgs: ["--enable-automation"],
    });

    this.page = await this.browser.newPage();

    // 자동화 감지 우회
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, "webdriver", { get: () => undefined });
      // @ts-ignore
      window.navigator.chrome = { runtime: {} };
    });

    await this.page.setViewport({ width: 1920, height: 1080 });
  }

  async login() {
    if (!this.page) throw new Error("Browser not initialized");

    await this.page.goto("https://youtube.com");

    // 로그인 버튼 클릭
    await this.page.waitForSelector("#buttons ytd-button-renderer a");
    await this.sleep(1000);
    await this.page.click("#buttons ytd-button-renderer a");

    // 로그인이 완료될 때까지 대기 (아바타 이미지가 나타날 때까지)
    await this.page.waitForSelector("#avatar-btn", {
      timeout: 300000, // 5분 대기
    });

    // 추가 대기 시간
    await this.sleep(2000);
  }

  async searchAndAnalyze(keyword: string) {
    if (!this.page) throw new Error("Browser not initialized");

    // YouTube 메인으로 이동
    await this.page.goto("https://youtube.com");
    await this.sleep(2000);

    // 검색어 입력
    await this.page.waitForSelector('input[name="search_query"]');
    await this.page.click('input[name="search_query"]');
    await this.sleep(500);

    // 기존 검색어 삭제
    await this.page.keyboard.down("Control");
    await this.page.keyboard.press("A");
    await this.page.keyboard.up("Control");
    await this.page.keyboard.press("Backspace");

    // 새 검색어 입력
    await this.page.type('input[name="search_query"]', keyword, { delay: 100 });
    await this.sleep(500);

    // Enter 키로 검색 실행
    await this.page.keyboard.press("Enter");

    // 검색 결과 로딩 대기 (시간 증가)
    await this.page.waitForSelector("ytd-video-renderer", { timeout: 10000 });
    await this.sleep(5000); // 충분한 로딩 시간 제공
    
    // "동영상" 필터 클릭 (title 속성 사용)
    await this.page.evaluate(() => {
      const formattedStrings = document.querySelectorAll('yt-formatted-string');
      const videoFilter = Array.from(formattedStrings).find(el => el.getAttribute('title') === '동영상');
      if (videoFilter) {
        (videoFilter as any).click();
      } else {
        console.log('동영상 필터를 찾을 수 없습니다.');
      }
    });
    await this.sleep(2000);

    let foundValidVideo = false;
    let scrollAttempts = 0;
    const maxScrollAttempts = 5;

    while (!foundValidVideo && scrollAttempts < maxScrollAttempts) {
      const videos = await this.page.evaluate(() => {
        const items = document.querySelectorAll("ytd-video-renderer");
        return Array.from(items).map((item) => {
          const titleElement = item.querySelector("#video-title");
          const thumbnailElement = item.querySelector("#thumbnail img");
          const thumbnailUrl =
            thumbnailElement?.getAttribute("src")?.replace(/\?.*$/, "") || "";
          const id = item
            .querySelector("#thumbnail")
            ?.getAttribute("href")
            ?.split("v=")[1];

          return {
            id: id || "",
            title: titleElement?.textContent?.trim() || "",
            thumbnailUrl,
            hasFemale: false,
            watched: false,
          };
        });
      });

      console.log(`검색된 영상 수: ${videos.length}`);

      // 시청 기록 확인 로직 개선
      for (const video of videos) {
        const watchedInfo = this.watchedVideos.get(video.id);
        if (watchedInfo) {
          const hoursSinceWatched = (Date.now() - watchedInfo.timestamp) / (1000 * 60 * 60);
          console.log(`'${video.title}' 시청 후 ${hoursSinceWatched.toFixed(1)}시간 경과`);
          video.watched = true;
          continue;
        }

        if (video.title.toLowerCase().includes("룩북")) {
          console.log(`분석 중: ${video.title}`);
          video.hasFemale = await this.analyzeThumbnail(video.thumbnailUrl);
          
          if (video.hasFemale) {
            foundValidVideo = true;
            await this.playVideo(video);
            return [video];
          }
        }
      }

      if (!foundValidVideo) {
        console.log("적합한 영상을 찾지 못했습니다. 스크롤 다운...");
        await this.page.evaluate(() => {
          window.scrollBy(0, window.innerHeight * 2);
        });
        await this.sleep(2000);
        scrollAttempts++;
      }
    }

    console.log("더 이상 시청할 영상을 찾지 못했습니다.");
    return [];
  }

  private async analyzeThumbnail(thumbnailUrl: string): Promise<boolean> {
    try {
      if (!thumbnailUrl) {
        console.error("썸네일 URL이 없습니다.");
        return false;
      }

      const img = await canvas.loadImage(thumbnailUrl);
      const detections = await faceapi.detectAllFaces(img).withAgeAndGender();

      console.log(`감지된 얼굴 수: ${detections.length}`);
      detections.forEach((d, i) => {
        console.log(`얼굴 ${i + 1}: ${d.gender}, 확률: ${d.genderProbability}`);
      });

      return detections.some(
        (d) => d.gender === "female" && d.genderProbability > 0.6
      );
    } catch (error) {
      console.error("썸네일 분석 에러:", error);
      return false;
    }
  }

  private async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  // 영상 재생 로직을 별도 메서드로 분리
  private async playVideo(video: { title: string; id: string }) {
    console.log(`재생 시작: ${video.title} (ID: ${video.id})`);

    await this.page?.evaluate((title) => {
      const videoElements = Array.from(
        document.querySelectorAll("ytd-video-renderer")
      );
      const targetVideo = videoElements.find(
        (el) => el.querySelector("#video-title")?.textContent?.trim() === title
      );
      const thumbnailLink = targetVideo?.querySelector("#thumbnail");
      if (thumbnailLink) {
        (thumbnailLink as any).click();
      }
    }, video.title);

    await this.sleep(5000);

    // 광고 스킵 처리
    try {
      await this.page?.waitForSelector(".ytp-ad-skip-button", {
        timeout: 6000,
      });
      await this.page?.click(".ytp-ad-skip-button");
    } catch (e) {
      // 광고가 없거나 스킵할 수 없는 경우 무시
    }

    // 영상 길이 확인 및 시청
    const watchDuration = await this.page?.evaluate(() => {
      const video = document.querySelector('video');
      if (video) {
        // 영상 길이(초)와 240초(4분) 중 작은 값을 선택
        return Math.min(video.duration * 1000, 240000);
      }
      return 30000; // 영상 길이를 못 가져온 경우 30초 시청
    }) || 30000;

    console.log(`영상 시청 시간: ${Math.round(watchDuration / 1000)}초`);
    await this.sleep(watchDuration);

    // 시청 기록에 타임스탬프와 함께 저장
    this.watchedVideos.set(video.id, {
      title: video.title,
      timestamp: Date.now()
    });
    console.log(`재생 완료: ${video.title} (ID: ${video.id})`);
  }
}
