import { Add } from "../libs/Add.ts";
import { Quarter } from "./Quarter.ts";
import { QuarterBudgets } from "./QuarterBudgets.ts";

// 公称型用
declare const ContractTypeNominality: unique symbol
/**
 * 契約区分
 * 例：社員、派遣、請負
 */
export type ContractType = string & { [ContractTypeNominality]: never };



/**
 * 予算
 * 全体、投資、投資比率を持つ
 */
export class HumanResourceBudget implements Add<HumanResourceBudget> {
  investRate: number;
  investPer: number;
  constructor(readonly total: number, readonly invest: number) {
    this.investRate = total > 0 ? invest / total : 0;
    this.investPer = Math.floor(this.investRate * 100);
  }
  add(other: HumanResourceBudget): HumanResourceBudget {
    return new HumanResourceBudget(this.total + other.total, this.invest + other.invest);
  }
  static readonly empty = new HumanResourceBudget(0, 0);
}

/**
 * 人件費
 */
export type HumanResourceCost = {
  term: Quarter;
  type: ContractType;
  budget: HumanResourceBudget;
  /**組織 */
  org: string;
};

/**
 * 年間人件費
 */
export type AnnualHumanResourceCost = {
  type: ContractType;
  quarterBudgets: QuarterBudgets<HumanResourceBudget>;
  org: string;
};

/**
 * 人件費リスト
 */
export class HumanResourceCosts {
  constructor(readonly values: HumanResourceCost[]) {}

  /**
   * 組織単位で年間人件費リストへ変換する
   * @returns
   */
  convertToAnnualHumanResourceCostByOrg(): AnnualHumanResourceCosts {
    const map = this.values.reduce(
      (memo: { [key: string]: AnnualHumanResourceCost }, v) => {
        if (!memo[v.org]) {
          memo[v.org] = {
            type: v.type,
            quarterBudgets: new QuarterBudgets(HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty),
            org: v.org,
          };
        }
        memo[v.org].quarterBudgets = memo[v.org].quarterBudgets.addQuarter(
          v.term,
          v.budget,
        );
        return memo;
      },
      {},
    );
    return new AnnualHumanResourceCosts(Object.values(map));
  }
}

/**
 * 年間人件費リスト
 */
export class AnnualHumanResourceCosts {
  readonly quarterBudgets: QuarterBudgets<HumanResourceBudget>;
  constructor(readonly values: AnnualHumanResourceCost[]) {
    this.quarterBudgets = values.reduce(
      (memo, v) => memo.add(v.quarterBudgets),
      new QuarterBudgets(HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty),
    );
  }

  push(value: AnnualHumanResourceCost): AnnualHumanResourceCosts {
    return new AnnualHumanResourceCosts([...this.values, value]);
  }

  groupByContractType(): { [key: string]: AnnualHumanResourceCosts } {
    return this.values.reduce(
      (memo: { [key: string]: AnnualHumanResourceCosts }, v) => {
        if (!memo[v.type]) {
          memo[v.type] = new AnnualHumanResourceCosts([]);
        }
        memo[v.type] = memo[v.type].push(v);
        return memo;
      },
      {},
    );
  }
}
