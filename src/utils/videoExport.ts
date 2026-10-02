import {
  Input,
  Output,
  Mp4OutputFormat,
  WebMInputFormat,
  MatroskaInputFormat,
  BufferTarget,
  Conversion,
  BlobSource,
} from 'mediabunny';

const MP4_MIME_CANDIDATES = [
  'video/mp4;codecs=avc1.42E01E,mp4a.40.2',
  'video/mp4;codecs=avc1',
  'video/mp4;codecs=h264,aac',
  'video/mp4;codecs=h264',
  'video/mp4',
];

const WEBM_MIME_CANDIDATES = [
  'video/webm;codecs=vp9,opus',
  'video/webm;codecs=vp9',
  'video/webm;codecs=vp8,opus',
  'video/webm;codecs=vp8',
  'video/webm',
];

/**
 * Returns supported native MP4 MIME type for MediaRecorder, or null if unsupported.
 * Supported in Chrome 105+, Safari 14.1+, Edge, modern Android & iOS.
 */
export function getSupportedNativeMp4MimeType(): string | null {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return null;
  }
  for (const mime of MP4_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return null;
}

/**
 * Returns supported WebM MIME type for MediaRecorder.
 */
export function getSupportedWebmMimeType(): string {
  if (typeof window === 'undefined' || typeof MediaRecorder === 'undefined') {
    return 'video/webm';
  }
  for (const mime of WEBM_MIME_CANDIDATES) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return 'video/webm';
}

/**
 * Check if the browser can record MP4 directly via MediaRecorder.
 */
export function isNativeMp4Supported(): boolean {
  return getSupportedNativeMp4MimeType() !== null;
}

/**
 * Converts a WebM Blob to a high-quality MP4 Blob in-browser using Mediabunny.
 * Used when MediaRecorder doesn't support native MP4 recording (e.g. Firefox).
 */
export async function convertWebmToMp4(
  webmBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const input = new Input({
    formats: [new WebMInputFormat(), new MatroskaInputFormat()],
    source: new BlobSource(webmBlob),
  });

  const target = new BufferTarget();
  const output = new Output({
    format: new Mp4OutputFormat({ fastStart: 'in-memory' }),
    target,
  });

  const conversion = await Conversion.init({
    input,
    output,
  });

  if (!conversion.isValid) {
    throw new Error('MP4 Conversion configuration is not valid for this media stream');
  }

  if (onProgress) {
    conversion.onProgress = (progress: number) => {
      onProgress(progress);
    };
  }

  await conversion.execute();

  if (!target.buffer) {
    throw new Error('Target buffer is empty after MP4 conversion');
  }

  return new Blob([target.buffer], { type: 'video/mp4' });
}
