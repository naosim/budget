export class MemoMap<
  E, 
  K, 
  V> {
  constructor(
    private init: (e:E) => V,
    private getKey: (e:E) => K,
    private merge: (e:E, v:V) => V,
    readonly memo:Map<K, V> = new Map()) {}
  add(e: E): MemoMap<E, K, V> {
    const k = this.getKey(e)
    if(!this.memo.has(k)) {
      this.memo.set(k, this.init(e))
    }
    this.memo.set(k, this.merge(e, this.memo.get(k)!))
    return new MemoMap(
      this.init,
      this.getKey,
      this.merge,
      this.memo
    )
  }
  values(): V[] {
    return [...this.memo.values()]
  }
}