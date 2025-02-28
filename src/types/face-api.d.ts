import * as faceapi from 'face-api.js';
import { Canvas, Image } from 'canvas';

declare module 'face-api.js' {
  interface IFaceApiEnv {
    Canvas: any;
    Image: any;
  }

  interface Environment {
    Canvas: any;
    Image: any;
  }
} 