/**
 * PrivacyShield - Local Face & Visual PII Detection Engine (Component 2)
 * Loads BlazeFace via TensorFlow.js runtime.
 * Provides real face bounding box extraction from DOM images and screenshots,
 * with transparent diagnostic logging ("BlazeFace ML" vs "Heuristic fallback active").
 */
(function() {
  'use strict';

  class LocalFaceDetector {
    constructor() {
      this.model = null;
      this.isModelLoaded = false;
      this.isLoading = false;
      this.activeBackend = 'Not Initialized';
      this.detectorStatus = 'unloaded'; // 'blazeface_ready' | 'heuristic_fallback' | 'loading'
      this.lastInferenceTimeMs = 0;
      this.detectionCount = 0;
    }

    /**
     * Initializes the BlazeFace model using local bundled TFJS runtime with multi-tier fallback (WebGL -> WASM -> CPU -> Heuristic).
     */
    async init() {
      if (this.isModelLoaded || this.isLoading) return;
      this.isLoading = true;
      this.detectorStatus = 'loading';

      try {
        // Check if global TFJS and BlazeFace are loaded
        if (typeof tf !== 'undefined' && typeof blazeface !== 'undefined') {
          // Multi-tier backend negotiation: WebGL -> WASM -> CPU
          let chosenBackend = 'cpu';
          try {
            if (tf.findBackend && tf.findBackend('webgl')) {
              await tf.setBackend('webgl');
              chosenBackend = 'webgl';
            } else if (tf.findBackend && tf.findBackend('wasm')) {
              await tf.setBackend('wasm');
              chosenBackend = 'wasm';
            } else {
              await tf.setBackend('cpu');
              chosenBackend = 'cpu';
            }
          } catch (backendErr) {
            console.warn('[PrivacyShield Face ML] Preferred backend unavailable, trying CPU fallback:', backendErr);
            try {
              await tf.setBackend('cpu');
              chosenBackend = 'cpu';
            } catch (cpuErr) {
              console.warn('[PrivacyShield Face ML] CPU backend unavailable:', cpuErr);
            }
          }

          await tf.ready();
          const currentBackend = (tf.getBackend ? tf.getBackend() : chosenBackend) || 'cpu';
          this.activeBackend = `TensorFlow.js (${currentBackend.toUpperCase()})`;

          console.log(`[PrivacyShield Face ML] Active Backend: ${this.activeBackend}. Loading BlazeFace CNN weights...`);
          this.model = await blazeface.load();
          this.isModelLoaded = true;
          this.detectorStatus = 'blazeface_ready';
          console.log('[PrivacyShield Face ML] BlazeFace CNN model loaded successfully on ' + this.activeBackend);
        } else {
          console.warn('[PrivacyShield Face ML] BlazeFace bundle not found in global scope. Enabling Heuristic Fallback.');
          this.activeBackend = 'Skin-Tone / Contour Heuristic';
          this.detectorStatus = 'heuristic_fallback';
        }
      } catch (err) {
        console.error('[PrivacyShield Face ML] Error loading BlazeFace model:', err);
        this.activeBackend = 'Skin-Tone / Contour Heuristic (BlazeFace Failed)';
        this.detectorStatus = 'heuristic_fallback';
      } finally {
        this.isLoading = false;
      }
    }

    /**
     * Heuristic fallback detector for face/headshot detection using skin-tone color space and facial aspect ratios.
     */
    detectHeuristicFaces(canvas, ctx) {
      const width = canvas.width;
      const height = canvas.height;
      if (width < 32 || height < 32) return [];

      const imgData = ctx.getImageData(0, 0, width, height);
      const data = imgData.data;

      let skinPixels = 0;
      let totalPixels = width * height;
      let minX = width, minY = height, maxX = 0, maxY = 0;

      // Sample pixels for skin tone distribution (RGB rules for human skin under standard lighting)
      const step = Math.max(1, Math.floor(Math.min(width, height) / 80));
      for (let y = 0; y < height; y += step) {
        for (let x = 0; x < width; x += step) {
          const idx = (y * width + x) * 4;
          const r = data[idx];
          const g = data[idx + 1];
          const b = data[idx + 2];

          // Standard normalized RGB skin cluster
          const isSkin = (r > 95 && g > 40 && b > 20 &&
            (Math.max(r, g, b) - Math.min(r, g, b) > 15) &&
            Math.abs(r - g) > 15 && r > g && r > b);

          if (isSkin) {
            skinPixels++;
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }

      const sampledTotal = (width / step) * (height / step);
      const skinRatio = skinPixels / sampledTotal;

      // If dense skin cluster found matching face proportions
      if (skinRatio > 0.12 && maxX > minX && maxY > minY) {
        const fw = maxX - minX;
        const fh = maxY - minY;
        const aspect = fh / fw;

        if (aspect >= 0.7 && aspect <= 1.8) {
          return [{
            x: minX,
            y: minY,
            width: fw,
            height: fh,
            confidence: Math.min(0.78, 0.5 + skinRatio * 0.4),
            isHeuristic: true
          }];
        }
      }

      return [];
    }

    /**
     * Converts cross-origin images, SVGs, or data URLs into safe ImageBitmaps to bypass CORS/tainted canvas restrictions.
     */
    async getSafeElementForInference(element) {
      if (!element) return element;
      if (element instanceof HTMLCanvasElement || (typeof ImageBitmap !== 'undefined' && element instanceof ImageBitmap)) {
        return element;
      }
      if (element instanceof HTMLImageElement) {
        if (!element.complete || element.naturalWidth === 0) {
          try {
            await element.decode();
          } catch (e) {}
        }
        try {
          return await createImageBitmap(element);
        } catch (corsErr) {
          try {
            const resp = await fetch(element.src);
            const blob = await resp.blob();
            return await createImageBitmap(blob);
          } catch (fetchErr) {
            return element;
          }
        }
      }
      return element;
    }

    /**
     * Detects faces in an image or canvas element.
     * @param {HTMLImageElement|HTMLCanvasElement|ImageBitmap} element
     * @returns {Promise<Array>} Normalized bounding boxes [{x, y, width, height, confidence}]
     */
    async detectFacesInElement(element) {
      const startTime = performance.now();
      const faceBoxes = [];

      try {
        const safeElement = await this.getSafeElementForInference(element);

        if (this.detectorStatus === 'blazeface_ready' && this.model) {
          // Real BlazeFace inference
          const predictions = await this.model.estimateFaces(safeElement, false);
          for (const pred of predictions) {
            const start = pred.topLeft;
            const end = pred.bottomRight;
            const x = Math.max(0, Math.round(start[0]));
            const y = Math.max(0, Math.round(start[1]));
            const w = Math.round(end[0] - start[0]);
            const h = Math.round(end[1] - start[1]);
            const prob = (pred.probability && pred.probability[0]) ? pred.probability[0] : 0.90;

            if (prob >= 0.30 && w > 10 && h > 10) {
              faceBoxes.push({
                x,
                y,
                width: w,
                height: h,
                confidence: Math.round(prob * 100) / 100,
                isHeuristic: false
              });
            }
          }
        }

        // Fallback heuristic detection if BlazeFace model is not ready or returned 0 faces on valid photo
        if (faceBoxes.length === 0) {
          const canvas = document.createElement('canvas');
          const w = element.naturalWidth || element.width || Math.round(element.getBoundingClientRect().width) || 120;
          const h = element.naturalHeight || element.height || Math.round(element.getBoundingClientRect().height) || 120;
          canvas.width = Math.max(32, w);
          canvas.height = Math.max(32, h);
          const ctx = canvas.getContext('2d');
          ctx.drawImage(safeElement || element, 0, 0, canvas.width, canvas.height);

          const heuristicResults = this.detectHeuristicFaces(canvas, ctx);
          faceBoxes.push(...heuristicResults);
        }
      } catch (err) {
        console.warn('[PrivacyShield] Face detection error on element:', err);
      }

      const durationMs = performance.now() - startTime;
      this.lastInferenceTimeMs = Math.round(durationMs * 100) / 100;
      this.detectionCount += faceBoxes.length;

      return faceBoxes;
    }

    /**
     * Calculates rendered content bounding box and scaling offsets for images using CSS object-fit: cover, contain, or fill.
     * Integrated from phantom_face repo for high accuracy across responsive images & avatars.
     */
    getObjectFitLayout(img, rect) {
      const nw = img.naturalWidth || rect.width;
      const nh = img.naturalHeight || rect.height;
      if (nw === 0 || nh === 0) {
        return { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
      }

      let objectFit = 'fill';
      try {
        const computed = window.getComputedStyle(img);
        objectFit = computed.objectFit || 'fill';
      } catch (e) {
        objectFit = 'fill';
      }

      if (objectFit === 'cover') {
        const scale = Math.max(rect.width / nw, rect.height / nh);
        const renderW = nw * scale;
        const renderH = nh * scale;
        const offsetX = (rect.width - renderW) / 2;
        const offsetY = (rect.height - renderH) / 2;
        return { scaleX: scale, scaleY: scale, offsetX, offsetY };
      } else if (objectFit === 'contain') {
        const scale = Math.min(rect.width / nw, rect.height / nh);
        const renderW = nw * scale;
        const renderH = nh * scale;
        const offsetX = (rect.width - renderW) / 2;
        const offsetY = (rect.height - renderH) / 2;
        return { scaleX: scale, scaleY: scale, offsetX, offsetY };
      }

      return {
        scaleX: rect.width / nw,
        scaleY: rect.height / nh,
        offsetX: 0,
        offsetY: 0
      };
    }

    /**
     * Scans all visible <img> elements on the page and returns absolute screen coordinates for detected faces.
     * Lazy-evaluates: only initializes heavy BlazeFace weights if candidate visual elements actually exist.
     * @returns {Promise<Array>} Face bounding boxes relative to viewport
     */
    async scanPageImages() {
      const images = document.querySelectorAll('img, video, [role="img"], .avatar, [class*="avatar"], [class*="photo"], [class*="profile"]');
      const candidateImages = [];

      for (const img of images) {
        if (img.closest('#privacyshield-root')) continue;
        const rect = img.getBoundingClientRect();
        if (rect.width < 20 || rect.height < 20) continue;
        if (img.offsetParent === null && rect.width === 0) continue;
        candidateImages.push({ img, rect });
      }

      // If no valid images exist on page, skip heavy tensor initialization entirely
      if (candidateImages.length === 0) {
        return [];
      }

      // Initialize ML backend on demand
      await this.init();
      const allFaceBoxes = [];

      for (const { img, rect } of candidateImages) {
        try {
          const faces = await this.detectFacesInElement(img);
          const { scaleX, scaleY, offsetX, offsetY } = this.getObjectFitLayout(img, rect);

          for (const f of faces) {
            allFaceBoxes.push({
              x: Math.round(rect.left + offsetX + f.x * scaleX),
              y: Math.round(rect.top + offsetY + f.y * scaleY),
              width: Math.round(f.width * scaleX),
              height: Math.round(f.height * scaleY),
              confidence: f.confidence,
              isHeuristic: f.isHeuristic || false,
              element: img,
              imgRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }
            });
          }
        } catch (e) {
          console.warn('[PrivacyShield] Image face scan skip:', e);
        }
      }

      return allFaceBoxes;
    }

    /**
     * Returns the current status of the face detection pipeline for the UI/debug panel.
     */
    getStatus() {
      return {
        status: this.detectorStatus,
        activeBackend: this.activeBackend,
        isModelLoaded: this.isModelLoaded,
        totalDetections: this.detectionCount,
        lastDurationMs: this.lastInferenceTimeMs
      };
    }
  }

  const faceDetectorInstance = new LocalFaceDetector();

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      LocalFaceDetector,
      faceDetector: faceDetectorInstance
    };
  } else if (typeof window !== 'undefined') {
    window.LocalFaceDetector = LocalFaceDetector;
    window.faceDetector = faceDetectorInstance;
  }
})();
