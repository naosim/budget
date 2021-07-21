import {
  AnnualOrgHumanResourceCost,
  AnnualOrgHumanResourceCosts,
  ContractType,
  HumanResourceBudget,
  HumanResourceCost,
} from "../domain/HumanResourceCost.ts";
import { Quarter } from "../domain/Quarter.ts";

export type HumanResourceCostRaw = {
  term: Quarter;
  type: ContractType;
  total: number | string;
  invest: number | string;
  org: string;
};

export class HumanResourceCostRepository {
  readonly all: AnnualOrgHumanResourceCost[];
  constructor(raws: HumanResourceCostRaw[]) {
    this.all = HumanResourceCostRepository.init(raws);
  }
  private static init(
    raws: HumanResourceCostRaw[],
  ): AnnualOrgHumanResourceCost[] {
    // TODO: rawsはjsから呼ばれることを想定するため、型をチェックする
    return raws.map((v) => {
      const total = typeof v.total == "string" ? eval(v.total) : v.total;
      const invest = typeof v.invest == "string" ? eval(v.invest) : v.invest;
      return {
        term: v.term,
        type: v.type,
        budget: new HumanResourceBudget(total, invest),
        org: v.org,
      };
    }).reduce((memo, v) => memo.add(v), AnnualOrgHumanResourceCosts.empty())
      .values();
  }
}
