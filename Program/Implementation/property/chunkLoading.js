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
