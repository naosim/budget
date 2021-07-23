export class Lazy<T> {
  private value?: T;
  private evaluated: boolean = false;
  private constructor(private func: ()=>T) {}
  get(): T {
    if(!this.evaluated) {
      this.value = this.func()
      this.evaluated = true;
      console.log('lazy init')
    } else {
      console.log('lazy fast!!')
    }
    return this.value!;
  }
  isEvaluated(): boolean {
    return this.evaluated
  }
  static of<T>(func: ()=>T): Lazy<T> {
    return new Lazy<T>(func);
  }
}