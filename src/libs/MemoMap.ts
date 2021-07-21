export class MemoMap<
  E,
  K,
  V,
> {
  readonly init: (e: E) => V;
  readonly getKey: (e: E) => K;
  readonly merge: (e: E, v: V) => V;
  constructor(
    private methods: {
      init: (e: E) => V;
      getKey: (e: E) => K;
      merge: (e: E, v: V) => V;
    },
    readonly memo: Map<K, V> = new Map(),
  ) {
    this.init = methods.init;
    this.getKey = methods.getKey;
    this.merge = methods.merge;
  }
  add(e: E): MemoMap<E, K, V> {
    const k = this.getKey(e);
    if (!this.memo.has(k)) {
      this.memo.set(k, this.init(e));
    }
    this.memo.set(k, this.merge(e, this.memo.get(k)!));
    return new MemoMap(
      this.methods,
      this.memo,
    );
  }
  values(): V[] {
    return [...this.memo.values()];
  }

  map<T>(callbackfn: (value: V, key: K, map: Map<K, V>) => T): T[] {
    const result: T[] = [];
    this.memo.forEach((value: V, key: K, map: Map<K, V>) => {
      result.push(callbackfn(value, key, map));
    });
    return result;
  }
}
