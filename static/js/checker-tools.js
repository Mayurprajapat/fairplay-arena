(() => {
  const $ = (selector) => document.querySelector(selector);
  const MAX_FILE_BYTES = 10 * 1024 * 1024;
  const MAX_PDF_PAGES = 3;
  const TESSERACT_VERSION = '5.1.1';
  const PDFJS_VERSION = '3.11.174';
  let cameraStream = null;
  let barcodeTimer = null;
  let barcodeDetector = null;
  let scanInProgress = false;
  let ocrWorkerPromise = null;

  const scannerVideo = $('#scannerVideo');
  const reportFile = $('#reportFile');
  if (!scannerVideo || !reportFile) return;

  function setStatus(element, message) {
    if (element) element.textContent = message;
  }

  function loadScript(src, test) {
    if (test()) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => test() ? resolve() : reject(new Error('The library did not initialize.'));
      script.onerror = () => reject(new Error('Could not load a required browser library.'));
      document.head.appendChild(script);
    });
  }

  async function getOcrWorker() {
    await loadScript(
      `https://cdn.jsdelivr.net/npm/tesseract.js@${TESSERACT_VERSION}/dist/tesseract.min.js`,
      () => Boolean(window.Tesseract)
    );
    if (!ocrWorkerPromise) {
      ocrWorkerPromise = window.Tesseract.createWorker('eng', 1, {
        workerPath: `https://cdn.jsdelivr.net/npm/tesseract.js@${TESSERACT_VERSION}/dist/worker.min.js`,
        corePath: `https://cdn.jsdelivr.net/npm/tesseract.js-core@${TESSERACT_VERSION}`,
        langPath: 'https://tessdata.projectnaptha.com/4.0.0',
        logger: () => {}
      }).catch((error) => {
        ocrWorkerPromise = null;
        throw error;
      });
    }
    return ocrWorkerPromise;
  }

  function resizeCanvas(source, maxPixels = 2500000) {
    const scale = Math.min(1, Math.sqrt(maxPixels / (source.width * source.height)));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(source.width * scale));
    canvas.height = Math.max(1, Math.round(source.height * scale));
    canvas.getContext('2d', { willReadFrequently: true }).drawImage(source, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  async function recognizeCanvas(canvas, statusElement, message) {
    setStatus(statusElement, message);
    const worker = await getOcrWorker();
    const result = await worker.recognize(canvas);
    return {
      text: result.data.text || '',
      confidence: Number(result.data.confidence) || 0
    };
  }

  async function startCamera() {
    const status = $('#scannerStatus');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus(status, 'Camera access requires HTTPS or localhost and a supported browser. You can still choose an image report below.');
      return;
    }
    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: { facingMode: { ideal: 'environment' } }
      });
      scannerVideo.srcObject = cameraStream;
      scannerVideo.classList.remove('hidden');
      await scannerVideo.play();
      $('#startCamera').disabled = true;
      $('#stopCamera').disabled = false;
      $('#readLabel').disabled = false;
      $('#scanBarcode').disabled = false;
      setStatus(status, 'Camera is on. Keep the product label or barcode steady in view.');
      await prepareBarcodeDetector();
    } catch (error) {
      stopCamera();
      setStatus(status, error.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access in your browser settings, or choose an image instead.'
        : 'Could not start the camera. Check that the page is using HTTPS and no other app is using the camera.');
    }
  }

  async function prepareBarcodeDetector() {
    const Detector = window.BarcodeDetector;
    if (!Detector || typeof Detector.getSupportedFormats !== 'function') {
      setStatus($('#scannerStatus'), 'Barcode scanning is not supported by this browser. You can still use Read label text.');
      return;
    }
    const formats = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'itf'];
    try {
      const supported = await Detector.getSupportedFormats();
      const available = formats.filter((format) => supported.includes(format));
      if (!available.length) {
        setStatus($('#scannerStatus'), 'This browser has no supported product barcode formats. You can still use Read label text.');
        return;
      }
      barcodeDetector = new Detector({ formats: available });
    } catch (error) {
      console.error('Could not inspect supported barcode formats.', error);
      setStatus($('#scannerStatus'), 'Barcode scanning is unavailable. You can still use Read label text.');
    }
  }

  function stopCamera() {
    if (barcodeTimer !== null) {
      window.clearTimeout(barcodeTimer);
      barcodeTimer = null;
    }
    scanInProgress = false;
    if (cameraStream) cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
    scannerVideo.srcObject = null;
    scannerVideo.classList.add('hidden');
    $('#startCamera').disabled = false;
    $('#stopCamera').disabled = true;
    $('#readLabel').disabled = true;
    $('#scanBarcode').disabled = true;
    barcodeDetector = null;
  }

  async function readCameraLabel() {
    const status = $('#scannerStatus');
    if (!cameraStream || scannerVideo.readyState < 2) {
      setStatus(status, 'Wait for the camera preview, then try again.');
      return;
    }
    try {
      const canvas = resizeCanvas(scannerVideo);
      const result = await recognizeCanvas(canvas, status, 'Reading the label in this browser…');
      const text = result.text.trim();
      if (!text || result.confidence < 25) {
        setStatus(status, 'The label was not clear enough to read. Try more light and hold the camera steady.');
        return;
      }
      $('#substanceInput').value = text.slice(0, 500);
      setStatus(status, 'Text added to the substance checker. Review it and press “Check substance” yourself.');
    } catch (error) {
      console.error('Label OCR failed.', error);
      setStatus(status, 'Could not read the label. Check your connection for the OCR library, then try again.');
    }
  }

  async function scanBarcode() {
    const status = $('#scannerStatus');
    if (!barcodeDetector) {
      setStatus(status, 'Barcode scanning is not supported here. Use Read label text or enter the product manually.');
      return;
    }
    scanInProgress = true;
    setStatus(status, 'Scanning for a barcode…');
    const scan = async () => {
      if (!scanInProgress || !cameraStream) return;
      try {
        const codes = await barcodeDetector.detect(scannerVideo);
        if (codes.length && codes[0].rawValue) {
          scanInProgress = false;
          $('#substanceInput').value = codes[0].rawValue;
          setStatus(status, 'Barcode added to the substance checker. Review it and press “Check substance” yourself.');
          return;
        }
      } catch (error) {
        console.error('Barcode detection failed.', error);
        scanInProgress = false;
        setStatus(status, 'Could not scan this barcode. Try better lighting or use Read label text.');
        return;
      }
      barcodeTimer = window.setTimeout(scan, 250);
    };
    scan();
  }

  function numberFromText(value) {
    return Number(value.replace(',', '.'));
  }

  function parseReportRows(text) {
    const rows = [];
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.replace(/\s+/g, ' ').trim();
      if (!line || line.length > 220) continue;
      const range = line.match(/(?:\(|\[)?\s*(-?\d+(?:[.,]\d+)?)\s*(?:-|–|—|\bto\b)\s*(-?\d+(?:[.,]\d+)?)\s*(?:\)|\])?\s*$/i);
      if (!range) continue;
      const beforeRange = line.slice(0, range.index).trim();
      const resultMatch = beforeRange.match(/-?\d+(?:[.,]\d+)?/);
      if (!resultMatch) continue;
      const name = beforeRange.slice(0, resultMatch.index).replace(/^[\s:*•#-]+|[\s:*•#-]+$/g, '').trim();
      if (!/[a-z]{2}/i.test(name) || name.length > 55) continue;
      const value = numberFromText(resultMatch[0]);
      const low = numberFromText(range[1]);
      const high = numberFromText(range[2]);
      if (![value, low, high].every(Number.isFinite) || low > high) continue;
      rows.push({
        name,
        value: resultMatch[0],
        range: `${range[1]}–${range[2]}`,
        outside: value < low || value > high
      });
    }
    return rows;
  }

  function renderReport(rows, confidence, source) {
    const results = $('#reportResults');
    results.replaceChildren();
    const title = document.createElement('h4');
    title.textContent = 'Values with a readable printed range';
    results.appendChild(title);
    if (!rows.length) {
      const message = document.createElement('p');
      message.textContent = 'No values and reference ranges could be reliably matched. This does not mean the report is normal; check the original with a qualified healthcare professional.';
      results.appendChild(message);
      results.classList.remove('hidden');
      return;
    }
    const outsideCount = rows.filter((row) => row.outside).length;
    const summary = document.createElement('p');
    summary.className = 'report-note';
    summary.textContent = outsideCount
      ? `${outsideCount} readable value${outsideCount === 1 ? ' appears' : 's appear'} outside the range printed on the report. This comparison is not a diagnosis.`
      : 'No detected value is outside its printed range. This is not a conclusion that the report is normal.';
    results.appendChild(summary);
    const sourceNote = document.createElement('p');
    sourceNote.textContent = `${source} · OCR confidence ${Math.round(confidence)}%`;
    results.appendChild(sourceNote);
    rows.forEach((row) => {
      const item = document.createElement('div');
      item.className = 'report-value';
      const name = document.createElement('span');
      name.textContent = row.name;
      const value = document.createElement('span');
      value.textContent = `${row.value} (printed range ${row.range})`;
      if (row.outside) value.className = 'outside-range';
      item.append(name, value);
      results.appendChild(item);
    });
    results.classList.remove('hidden');
  }

  function linesFromPdfItems(items) {
    const grouped = new Map();
    for (const item of items) {
      if (!item.str || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3;
      grouped.set(y, `${grouped.get(y) || ''} ${item.str}`.trim());
    }
    return [...grouped.entries()]
      .sort((a, b) => b[0] - a[0])
      .map((entry) => entry[1])
      .join('\n');
  }

  async function extractPdfText(bytes, status) {
    await loadScript(
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.min.js`,
      () => Boolean(window.pdfjsLib)
    );
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${PDFJS_VERSION}/pdf.worker.min.js`;
    const pdf = await window.pdfjsLib.getDocument({ data: bytes }).promise;
    try {
      const pageCount = Math.min(pdf.numPages, MAX_PDF_PAGES);
      let text = '';
      for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
        setStatus(status, `Reading page ${pageNumber} of ${pageCount} in this browser…`);
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        text += `\n${linesFromPdfItems(content.items)}`;
      }
      if (text.replace(/\s/g, '').length > 12) return { text, source: `PDF text · up to ${pageCount} page(s)`, confidence: 100 };
      return { text: '', pdf, pageCount, source: `Scanned PDF · up to ${pageCount} page(s)` };
    } catch (error) {
      await pdf.destroy();
      throw error;
    }
  }

  async function ocrPdf(pdf, pageCount, status) {
    let text = '';
    let confidenceTotal = 0;
    for (let pageNumber = 1; pageNumber <= pageCount; pageNumber += 1) {
      setStatus(status, `Reading scanned PDF page ${pageNumber} of ${pageCount} in this browser…`);
      const page = await pdf.getPage(pageNumber);
      const base = page.getViewport({ scale: 1 });
      const scale = Math.min(2, 1600 / base.width, Math.sqrt(2500000 / (base.width * base.height)));
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.floor(viewport.width));
      canvas.height = Math.max(1, Math.floor(viewport.height));
      await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;
      const result = await recognizeCanvas(canvas, status, `Scanning page ${pageNumber} locally…`);
      text += `\n${result.text}`;
      confidenceTotal += result.confidence;
      canvas.width = 0;
      canvas.height = 0;
    }
    return { text, confidence: confidenceTotal / Math.max(1, pageCount) };
  }

  async function analyzeReport(file) {
    const status = $('#reportStatus');
    const output = $('#reportResults');
    output.replaceChildren();
    output.classList.add('hidden');
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setStatus(status, 'This file is larger than 10 MB. Choose a smaller image or PDF.');
      reportFile.value = '';
      return;
    }
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    const isImage = ['image/png', 'image/jpeg', 'image/webp'].includes(file.type);
    if (!isPdf && !isImage) {
      setStatus(status, 'Choose a PDF, PNG, JPEG, or WebP report image.');
      reportFile.value = '';
      return;
    }
    $('#clearReport').classList.remove('hidden');
    try {
      let text = '';
      let confidence = 100;
      let source = 'Image OCR';
      if (isPdf) {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const pdfResult = await extractPdfText(bytes, status);
        source = pdfResult.source;
        if (pdfResult.text) {
          text = pdfResult.text;
        } else {
          try {
            const result = await ocrPdf(pdfResult.pdf, pdfResult.pageCount, status);
            text = result.text;
            confidence = result.confidence;
          } finally {
            await pdfResult.pdf.destroy();
          }
        }
      } else {
        const bitmap = await createImageBitmap(file);
        const canvas = resizeCanvas(bitmap);
        bitmap.close();
        const result = await recognizeCanvas(canvas, status, 'Reading this image locally…');
        text = result.text;
        confidence = result.confidence;
        canvas.width = 0;
        canvas.height = 0;
      }
      if (confidence < 35) {
        renderReport([], confidence, source);
        setStatus(status, 'The text was too unclear for a dependable comparison. Please check the original report.');
        return;
      }
      renderReport(parseReportRows(text), confidence, source);
      setStatus(status, 'Analysis complete. The selected file and extracted text were not uploaded or saved.');
    } catch (error) {
      console.error('Local report analysis failed.', error);
      setStatus(status, 'Could not read this file. It may be damaged, password-protected, or unsupported. No report was uploaded.');
    } finally {
      reportFile.value = '';
    }
  }

  $('#startCamera').addEventListener('click', startCamera);
  $('#stopCamera').addEventListener('click', () => {
    stopCamera();
    setStatus($('#scannerStatus'), 'Camera stopped.');
  });
  $('#readLabel').addEventListener('click', readCameraLabel);
  $('#scanBarcode').addEventListener('click', scanBarcode);
  reportFile.addEventListener('change', () => analyzeReport(reportFile.files[0]));
  $('#clearReport').addEventListener('click', () => {
    reportFile.value = '';
    $('#reportResults').replaceChildren();
    $('#reportResults').classList.add('hidden');
    $('#clearReport').classList.add('hidden');
    setStatus($('#reportStatus'), 'Report cleared from this page.');
  });
  document.querySelectorAll('.modal .x, .modal').forEach((element) => {
    element.addEventListener('click', (event) => {
      if (element.classList.contains('x') || event.target === element) stopCamera();
    });
  });
  window.addEventListener('pagehide', stopCamera);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopCamera();
  });
  if ('IntersectionObserver' in window) {
    const toolsSection = $('#athlete-tools');
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting) stopCamera();
    });
    observer.observe(toolsSection);
  }
  window.addEventListener('beforeunload', () => {
    if (ocrWorkerPromise) ocrWorkerPromise.then((worker) => worker.terminate()).catch(() => {});
  });
})();
