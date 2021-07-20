import { Add } from "../libs/Add.ts";
import { Quarter } from "./Quarter.ts";

export class QuarterBudgets<T extends Add<T>> {
  readonly totalBudget: T;
  constructor(
    readonly q1: T,
    readonly q2: T,
    readonly q3: T,
    readonly q4: T,
  ) {
    this.totalBudget = q1.add(q2).add(q3).add(q4);
  }
  addQuarter(quarter: Quarter, budget: T): QuarterBudgets<T> {
    if (quarter == "1Q") {
      return new QuarterBudgets(this.q1.add(budget), this.q2, this.q3, this.q4);
    }
    if (quarter == "2Q") {
      return new QuarterBudgets(this.q1, this.q2.add(budget), this.q3, this.q4);
    }
    if (quarter == "3Q") {
      return new QuarterBudgets(this.q1, this.q2, this.q3.add(budget), this.q4);
    }
    if (quarter == "4Q") {
      return new QuarterBudgets(this.q1, this.q2, this.q3, this.q4.add(budget));
    }
    throw new Error("unknown error: " + quarter);
  }
  add(other: QuarterBudgets<T>): QuarterBudgets<T> {
    return new QuarterBudgets(
      this.q1.add(other.q1),
      this.q2.add(other.q2),
      this.q3.add(other.q3),
      this.q4.add(other.q4),
    );
  }
}