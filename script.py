import time
import cv2
import pytesseract
import numpy as np
from appium import webdriver
from appium.webdriver.common.appiumby import AppiumBy
from PIL import Image

# 얼굴 검출을 위한 OpenCV 모델 로드
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# 유튜브 앱 설정
capabilities = {
    "platformName": "Android",
    "deviceName": "Android Device",
    "appPackage": "com.google.android.youtube",
    "appActivity": "com.google.android.apps.youtube.app.watchwhile.WatchWhileActivity",
    "noReset": True
}

# Appium 서버 연결
driver = webdriver.Remote("http://localhost:4723/wd/hub", capabilities)

# 앱 실행 후 대기
time.sleep(5)

def capture_thumbnail(element):
    """ Appium 요소를 스크린샷 찍고 OpenCV로 변환 """
    element.screenshot("thumbnail.png")  # 유튜브 썸네일 저장
    img = cv2.imread("thumbnail.png")
    return img

def detect_faces(img):
    """ OpenCV를 이용한 얼굴 감지 (여성 여부는 추가 분석 필요) """
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)  # 얼굴 검출
    return len(faces) > 0  # 얼굴이 하나라도 감지되면 True

# 유튜브 홈 화면에서 영상 리스트 찾기
while True:
    videos = driver.find_elements(by=AppiumBy.ID, value="video_thumbnail_id")  # 썸네일 찾기

    for video in videos:
        img = capture_thumbnail(video)  # 썸네일 스크린샷
        if detect_faces(img):  # 얼굴이 감지되면 클릭
            video.click()
            time.sleep(60)  # 60초 시청
            driver.back()  # 뒤로 가기
            break  # 영상 하나만 선택 후 종료

    # 스크롤하여 새 영상 로딩
    driver.swipe(500, 1500, 500, 500, 500)
    time.sleep(3)

# 종료
driver.quit()

