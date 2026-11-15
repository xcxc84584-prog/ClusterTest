// PatchTree: AVL interval index for sparse modified file windows.
// O(log n) lookup/insertion, O(n) ordered traversal, O(n) memory.
class Node {
  constructor(key, value) {
    this.key = key;
    this.value = value;
    this.left = null;
    this.right = null;
    this.height = 1;
  }
}
const height = (node) => node?.height || 0;
function update(node) {
  node.height = 1 + Math.max(height(node.left), height(node.right));
  return node;
}
function rotateRight(node) {
  const pivot = node.left;
  node.left = pivot.right;
  pivot.right = node;
  update(node);
  return update(pivot);
}
function rotateLeft(node) {
  const pivot = node.right;
  node.right = pivot.left;
  pivot.left = node;
  update(node);
  return update(pivot);
}
function balance(node) {
  update(node);
  const difference = height(node.left) - height(node.right);
  if (difference > 1) {
    if (height(node.left.left) < height(node.left.right)) {
      node.left = rotateLeft(node.left);
    }
    return rotateRight(node);
  }
  if (difference < -1) {
    if (height(node.right.right) < height(node.right.left)) {
      node.right = rotateRight(node.right);
    }
    return rotateLeft(node);
  }
  return node;
}
export class PatchTree {
  #root = null;
  #size = 0;
  get size() { return this.#size; }
  clear() { this.#root = null; this.#size = 0; }
  get(key) {
    let node = this.#root;
    while (node) {
      if (key === node.key) return node.value;
      node = key < node.key ? node.left : node.right;
    }
    return undefined;
  }
  set(key, value) {
    if (!Number.isSafeInteger(key) || key < 0) {
      throw new RangeError('INVALID_PATCH_OFFSET');
    }
    const insert = (node) => {
      if (!node) {
        this.#size++;
        return new Node(key, value);
      }
      if (key === node.key) {
        node.value = value;
        return node;
      }
      if (key < node.key) node.left = insert(node.left);
      else node.right = insert(node.right);
      return balance(node);
    };
    this.#root = insert(this.#root);
    return this;
  }
  *entries() {
    function* visit(node) {
      if (!node) return;
      yield* visit(node.left);
      yield [node.key, node.value];
      yield* visit(node.right);
    }
    yield* visit(this.#root);
  }
  *values() {
    for (const [, value] of this.entries()) yield value;
  }
}
