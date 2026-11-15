/** Reads only the requested Blob byte range. */
export class FileLoader {
  constructor({ chunkBytes = 256 * 1024 } = {}) { this.chunkBytes = chunkBytes; }
  async load({ file, offset = 0, length = this.chunkBytes }) {
    if (!(file instanceof Blob)) throw new TypeError('Expected Blob');
    if (!Number.isSafeInteger(offset) || offset < 0 ||
        !Number.isSafeInteger(length) || length < 0) {
      throw new RangeError('Invalid byte range');
    }
    const bytes = await file.slice(offset, offset + length).arrayBuffer();
    return { offset, bytes, totalBytes: file.size };
  }
}
