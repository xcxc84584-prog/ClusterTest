/** Document lifecycle; large files are not fully materialized in memory. */
export class FileSession {
  constructor(loader, { editableLimitBytes = 8 * 1024 * 1024 } = {}) {
    this.loader = loader;
    this.editableLimitBytes = editableLimitBytes;
  }
  async open(file) {
    if (!(file instanceof Blob)) throw new TypeError('Expected Blob');
    const editable = file.size <= this.editableLimitBytes;
    const bytes = await this.loader.load({ file, length: editable ? file.size : 256 * 1024 });
    const text = new TextDecoder().decode(bytes.bytes);
    return { name: file.name ?? 'untitled', file, text, editable,
      totalBytes: file.size, loadedBytes: bytes.bytes.byteLength };
  }
}
