// ChunkLoading property: bounded incremental file decoding.
export const CHUNK_BYTES = 64 * 1024;
export const PREVIEW_BYTES = 1024 * 1024;

export async function readFileChunks(file, onProgress, signal) {
  if (!(file instanceof Blob)) throw new TypeError('INVALID_FILE');
  const decoder = new TextDecoder('utf-8', { fatal: false });
  const limit = Math.min(file.size, PREVIEW_BYTES);
  const pieces = [];
  let offset = 0;
  while (offset < limit) {
    if (signal?.aborted) throw new DOMException(
      'Loading cancelled', 'AbortError'
    );
    const end = Math.min(offset + CHUNK_BYTES, limit);
    const bytes = await file.slice(offset, end).arrayBuffer();
    pieces.push(decoder.decode(bytes, { stream: end < limit }));
    offset = end;
    onProgress?.({ loaded: offset, total: file.size });
    // Yield to UI between slices.
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  pieces.push(decoder.decode());
  return {
    text: pieces.join(''),
    bytesRead: offset,
    totalBytes: file.size,
    complete: offset === file.size
  };
}

export async function readFilePreviewSingle(file, signal) {
  if (!(file instanceof Blob)) throw new TypeError('INVALID_FILE');
  if (signal?.aborted) throw new DOMException(
    'Loading cancelled', 'AbortError'
  );
  const limit = Math.min(file.size, PREVIEW_BYTES);
  const text = await file.slice(0, limit).text();
  if (signal?.aborted) throw new DOMException(
    'Loading cancelled', 'AbortError'
  );
  return {
    text, bytesRead: limit, totalBytes: file.size,
    complete: limit === file.size
  };
}

// Windowed reading: align to newline bytes so edits can replace exact ranges.
// A window is at most 1 MiB plus boundary scan (64 KiB).
export async function readWindow(file, requestedOffset, signal) {
  if (!(file instanceof Blob)) throw new TypeError('INVALID_FILE');
  const total = file.size;
  const startHint = Math.max(0, Math.min(total, requestedOffset));
  const scanStart = Math.max(0, startHint - CHUNK_BYTES);
  const scanEnd = Math.min(total, startHint + PREVIEW_BYTES +
    CHUNK_BYTES);
  if (signal?.aborted) throw new DOMException(
    'Cancelled', 'AbortError'
  );
  const bytes = new Uint8Array(
    await file.slice(scanStart, scanEnd).arrayBuffer()
  );
  if (signal?.aborted) throw new DOMException(
    'Cancelled', 'AbortError'
  );
  let start = startHint === 0 ? 0 : startHint - scanStart;
  if (startHint !== 0) {
    // Search forward for a newline. Byte offsets stay UTF-8 safe.
    while (start < bytes.length && bytes[start - 1] !== 10) start++;
  }
  let end = Math.min(bytes.length, start + PREVIEW_BYTES);
  if (scanStart + end < total) {
    while (end > start && bytes[end - 1] !== 10) end--;
    if (end === start) throw new Error('LINE_EXCEEDS_WINDOW');
  }
  const byteStart = scanStart + start;
  const byteEnd = scanStart + end;
  return {
    text: new TextDecoder('utf-8').decode(bytes.subarray(start, end)),
    byteStart, byteEnd, totalBytes: total,
    complete: byteStart === 0 && byteEnd === total
  };
}
