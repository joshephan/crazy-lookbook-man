import fs from 'fs';
import path from 'path';
import https from 'https';

const MODELS_DIR = path.join(__dirname, '../models');
const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';

const FILES_TO_DOWNLOAD = [
  'ssd_mobilenetv1_model-weights_manifest.json',
  "ssd_mobilenetv1_model-shard1",
  "age_gender_model-weights_manifest.json",
  "age_gender_model-shard1",
  "ssd_mobilenetv1_model-shard2"
  
];

// models 디렉토리가 없다면 생성
if (!fs.existsSync(MODELS_DIR)) {
  fs.mkdirSync(MODELS_DIR, { recursive: true });
}

FILES_TO_DOWNLOAD.forEach(filename => {
  const url = `${BASE_URL}/${filename}`;
  const filePath = path.join(MODELS_DIR, filename);

  https.get(url, (response) => {
    const fileStream = fs.createWriteStream(filePath);
    response.pipe(fileStream);

    fileStream.on('finish', () => {
      console.log(`Downloaded: ${filename}`);
      fileStream.close();
    });
  }).on('error', (err) => {
    console.error(`Error downloading ${filename}:`, err.message);
  });
}); 