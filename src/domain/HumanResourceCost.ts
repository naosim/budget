export type Quarter = "1Q" | "2Q" | "3Q" | "4Q";
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
export class Budget {
  investRate: number;
  investPer: number;
  constructor(readonly total: number, readonly invest: number) {
    this.investRate = total > 0 ? invest / total : 0;
    this.investPer = Math.floor(this.investRate * 100);
  }
  add(other: Budget): Budget {
    return new Budget(this.total + other.total, this.invest + other.invest);
  }
  static readonly empty = new Budget(0, 0);
}

export class QuarterBudgets {
  readonly totalBudget: Budget;
  constructor(
    readonly q1: Budget,
    readonly q2: Budget,
    readonly q3: Budget,
    readonly q4: Budget,
  ) {
    this.totalBudget = q1.add(q2).add(q3).add(q4);
  }
  addQuarter(quarter: Quarter, budget: Budget): QuarterBudgets {
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
  add(other: QuarterBudgets): QuarterBudgets {
    return new QuarterBudgets(
      this.q1.add(other.q1),
      this.q2.add(other.q2),
      this.q3.add(other.q3),
      this.q4.add(other.q4),
    );
  }
  static readonly empty = new QuarterBudgets(
    Budget.empty,
    Budget.empty,
    Budget.empty,
    Budget.empty,
  );
}

/**
 * 人件費
 */
export type HumanResourceCost = {
  term: Quarter;
  type: ContractType;
  budget: Budget;
  /**組織 */
  org: string;
};

/**
 * 年間人件費
 */
export type AnnualHumanResourceCost = {
  type: ContractType;
  quarterBudgets: QuarterBudgets;
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
            quarterBudgets: QuarterBudgets.empty,
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
  readonly quarterBudgets: QuarterBudgets;
  constructor(readonly values: AnnualHumanResourceCost[]) {
    this.quarterBudgets = values.reduce(
      (memo, v) => memo.add(v.quarterBudgets),
      QuarterBudgets.empty,
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
