/** Small-document editing model. Large documents remain read-only in Patch +1. */
export class Document {
  constructor({ name, file, text = '', editable = true }) {
    this.name = name;
    this.file = file;
    this.text = text;
    this.editable = editable;
    this.dirty = false;
  }
  replace(text) {
    if (!this.editable) throw new Error('Large-file editing not yet implemented');
    if (text !== this.text) { this.text = text; this.dirty = true; }
  }
  exportBlob() { return new Blob([this.text], { type: 'text/plain' }); }
}
