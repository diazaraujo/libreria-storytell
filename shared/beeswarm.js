/**
 * Deterministic beeswarm packer (same family as Atlas production helper).
 * items: array of data
 * radius: circle radius in px
 * xFun: maps datum -> position along the non-swarm axis (e.g. yScale(value))
 * returns: [{ datum, x, y }] where x is along value axis, y is lateral offset
 */
window.Beeswarm = class Beeswarm {
  constructor(items, radius, xFun) {
    this.items = items;
    this.diameter = radius * 2;
    this.diameterSq = this.diameter * this.diameter;
    this.xFun = xFun;
  }

  calculateYPositions() {
    const placed = this.items
      .map((d, originalIndex) => ({
        datum: d,
        originalIndex,
        x: this.xFun(d),
        y: null,
        placed: false,
        minPositiveY: 0,
        maxNegativeY: 0,
        score: 0,
        bestPosition: 0,
        heapPos: -1,
        tieBreaker: originalIndex,
      }))
      .sort((a, b) => a.x - b.x);
    placed.forEach((e, i) => {
      e.index = i;
    });
    const heap = new MinHeap();
    heap.push(...placed);
    while (!heap.isEmpty()) {
      const e = heap.pop();
      e.placed = true;
      e.y = e.bestPosition;
      this._updateYBounds(e, placed, heap);
    }
    return placed
      .sort((a, b) => a.originalIndex - b.originalIndex)
      .map((e) => ({ datum: e.datum, x: e.x, y: e.y }));
  }

  _updateYBounds(t, arr, heap) {
    for (const dir of [-1, 1]) {
      for (let a = t.index + dir; a >= 0 && a < arr.length; a += dir) {
        const h = Math.abs(t.x - arr[a].x);
        if (h >= this.diameter) break;
        const r = arr[a];
        if (r.placed) continue;
        const n = Math.sqrt(this.diameterSq - h * h);
        r.minPositiveY = Math.max(r.minPositiveY, t.y + n);
        const prev = r.score;
        r.score = r.minPositiveY;
        r.bestPosition = r.minPositiveY;
        r.maxNegativeY = Math.min(r.maxNegativeY, t.y - n);
        if (-r.maxNegativeY < r.score) {
          r.score = -r.maxNegativeY;
          r.bestPosition = r.maxNegativeY;
        }
        if (r.score > prev) heap.deprioritise(r);
      }
    }
  }
};

class MinHeap {
  constructor() {
    this._heap = [];
  }
  size() {
    return this._heap.length;
  }
  isEmpty() {
    return this.size() === 0;
  }
  peek() {
    return this._heap[0];
  }
  parent(i) {
    return ((i + 1) >>> 1) - 1;
  }
  left(i) {
    return (i << 1) + 1;
  }
  right(i) {
    return (i + 1) << 1;
  }
  push(...items) {
    items.forEach((i) => {
      i.heapPos = this.size();
      this._heap.push(i);
      this._siftUp();
    });
  }
  pop() {
    const top = this.peek();
    const last = this.size() - 1;
    if (last > 0) this._swap(0, last);
    this._heap.pop();
    this._siftDown();
    return top;
  }
  deprioritise(item) {
    this._siftDown(item.heapPos);
  }
  _greater(i, j) {
    const a = this._heap[i],
      b = this._heap[j];
    if (a.score < b.score) return true;
    if (a.score > b.score) return false;
    return a.tieBreaker < b.tieBreaker;
  }
  _swap(i, j) {
    const t = this._heap[i];
    this._heap[i] = this._heap[j];
    this._heap[j] = t;
    this._heap[i].heapPos = i;
    this._heap[j].heapPos = j;
  }
  _siftUp() {
    let i = this.size() - 1;
    while (i > 0 && this._greater(i, this.parent(i))) {
      this._swap(i, this.parent(i));
      i = this.parent(i);
    }
  }
  _siftDown(start = 0) {
    let i = start;
    const n = this.size();
    while (true) {
      const l = this.left(i),
        r = this.right(i);
      let best = i;
      if (l < n && this._greater(l, best)) best = l;
      if (r < n && this._greater(r, best)) best = r;
      if (best === i) break;
      this._swap(i, best);
      i = best;
    }
  }
}
