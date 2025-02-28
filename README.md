# YouTube 룩북 영상 자동 시청 봇

## 소개

안녕하세요 한상훈 유튜브 시청자 여러분. 이 프로젝트는 YouTube에서 룩북 관련 영상을 자동으로 검색하고, 여성이 등장하는 영상을 자동으로 시청하는 봇입니다. face-api.js를 사용하여 썸네일에서 여성을 감지하고, Puppeteer를 통해 브라우저 자동화를 구현했습니다.

## 주요 기능

- YouTube 자동 로그인
- "룩북" 키워드 검색
- 썸네일 이미지 분석 (여성 감지)
- 자동 영상 시청 (최대 4분)
- 시청 기록 관리
- 광고 자동 스킵

## 설치 방법

1. 저장소 클론

```
git clone https://github.com/joshephan/crazy-lookbook-man.git
```

2. 의존성 설치

```
pnpm install
```

3. face-api.js 모델 다운로드

```
pnpm run download-models
```

4. 실행 방법

```
pnpm run start
```

## 기술 스택

- TypeScript
- Puppeteer
- face-api.js
- TensorFlow.js
- Node.js Canvas

## 주의사항

- YouTube 정책에 따라 자동화된 접근이 제한될 수 있습니다
- 구글 계정의 보안 설정에 따라 로그인이 차단될 수 있습니다
- 실행 시 반드시 본인의 계정으로만 테스트하시기 바랍니다

## 라이선스

MIT License

## 기여 방법

1. Fork the Project
2. Create your Feature Branch
3. Commit your Changes
4. Push to the Branch
5. Open a Pull Request
