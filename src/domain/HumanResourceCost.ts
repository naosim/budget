import { Add } from "../libs/Add.ts";
import { Lazy } from "../libs/Lazy.ts";
import { MemoMap } from "../libs/MemoMap.ts";
import { Quarter } from "./Quarter.ts";
import { QuarterBudgets } from "./QuarterBudgets.ts";

// 公称型用
declare const ContractTypeNominality: unique symbol;
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
    return new HumanResourceBudget(
      this.total + other.total,
      this.invest + other.invest,
    );
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

const emptyQuarterBudgets = new QuarterBudgets<HumanResourceBudget>(
  HumanResourceBudget.empty,
  HumanResourceBudget.empty,
  HumanResourceBudget.empty,
  HumanResourceBudget.empty,
);

/**
 * 組織別 年間人件費
 */
export class AnnualOrgHumanResourceCost {
  constructor(
    readonly type: ContractType,
    readonly org: string,
    readonly humanResourceCosts: HumanResourceCost[],
  ) {}

  private _quarterBudgets = Lazy.of<QuarterBudgets<HumanResourceBudget>>(() => {
    return this.humanResourceCosts.reduce((memo, v) => memo.addQuarter(v.term, v.budget), emptyQuarterBudgets)
  })
  get quarterBudgets(): QuarterBudgets<HumanResourceBudget> {
    return this._quarterBudgets.get()
  }
  add(humanResourceCost: HumanResourceCost) {
    if (this.type !== humanResourceCost.type) {
      throw new Error("type missmatch: " + humanResourceCost.type);
    }
    if (this.org !== humanResourceCost.org) {
      throw new Error("org missmatch: " + humanResourceCost.org);
    }
    return new AnnualOrgHumanResourceCost(this.type, this.org, [
      ...this.humanResourceCosts,
      humanResourceCost,
    ]);
  }
}

/**
 * 組織別 年間人件費リスト
 */
export class AnnualOrgHumanResourceCosts {
  constructor(
    readonly memo: MemoMap<
      HumanResourceCost,
      string,
      AnnualOrgHumanResourceCost
    >,
  ) {}
  get quarterBudgets(): QuarterBudgets<HumanResourceBudget> {
    return this.values().reduce(
      (memo, v) => memo.add(v.quarterBudgets),
      emptyQuarterBudgets,
    );
  }

  static empty(): AnnualOrgHumanResourceCosts {
    return new AnnualOrgHumanResourceCosts(
      new MemoMap<HumanResourceCost, string, AnnualOrgHumanResourceCost>({
        init: (e) => new AnnualOrgHumanResourceCost(e.type, e.org, []),
        getKey: (e) => e.org,
        merge: (e, v) => v.add(e),
      }),
    );
  }

  add(v: HumanResourceCost): AnnualOrgHumanResourceCosts {
    return new AnnualOrgHumanResourceCosts(this.memo.add(v));
  }

  values(): AnnualOrgHumanResourceCost[] {
    return this.memo.values();
  }
}

/**
 * 契約区分別 年間人件費
 */
export class AnnualContractTypeHumanResourceCost {
  constructor(
    readonly type: ContractType,
    readonly annualOrgHumanResourceCost: AnnualOrgHumanResourceCost[],
  ) {}

  private _quarterBudgets = Lazy.of<QuarterBudgets<HumanResourceBudget>>(() => {
    return this.annualOrgHumanResourceCost.reduce((memo, v) => memo.add(v.quarterBudgets), emptyQuarterBudgets)
  })
  get quarterBudgets(): QuarterBudgets<HumanResourceBudget> {
    return this._quarterBudgets.get()
  }

  add(
    annualOrgHumanResourceCost: AnnualOrgHumanResourceCost,
  ): AnnualContractTypeHumanResourceCost {
    if (this.type !== annualOrgHumanResourceCost.type) {
      throw new Error("type missmatch: " + annualOrgHumanResourceCost.type);
    }
    return new AnnualContractTypeHumanResourceCost(this.type, [
      ...this.annualOrgHumanResourceCost,
      annualOrgHumanResourceCost,
    ]);
  }
}

/**
 * 年間人件費リスト
 */
export class AnnualContractTypeHumanResourceCosts {
  constructor(
    readonly memo: MemoMap<
      AnnualOrgHumanResourceCost,
      ContractType,
      AnnualContractTypeHumanResourceCost
    >,
  ) {}
  get quarterBudgets(): QuarterBudgets<HumanResourceBudget> {
    return this.values().reduce(
      (memo, v) => memo.add(v.quarterBudgets),
      emptyQuarterBudgets,
    );
  }

  add(value: AnnualOrgHumanResourceCost): AnnualContractTypeHumanResourceCosts {
    return new AnnualContractTypeHumanResourceCosts(this.memo.add(value));
  }

  static empty(): AnnualContractTypeHumanResourceCosts {
    return new AnnualContractTypeHumanResourceCosts(
      new MemoMap<
        AnnualOrgHumanResourceCost,
        ContractType,
        AnnualContractTypeHumanResourceCost
      >({
        init: (e) => new AnnualContractTypeHumanResourceCost(e.type, []),
        getKey: (e) => e.type,
        merge: (e, v) => v.add(e),
      }),
    );
  }
  values(): AnnualContractTypeHumanResourceCost[] {
    return this.memo.values();
  }
  map<T>(
    callbackfn: (
      value: AnnualContractTypeHumanResourceCost,
      key: ContractType,
    ) => T,
  ): T[] {
    return this.memo.map((v, k) => {
      return callbackfn(v, k);
    });
  }
}
