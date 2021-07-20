import {
  HumanResourceBudget,
  ContractType,
  HumanResourceCost,
  HumanResourceCosts,
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
  readonly all: HumanResourceCosts;
  constructor(private readonly raws: HumanResourceCostRaw[]) {
    this.all = HumanResourceCostRepository.init(raws);
  }
  private static init(raws: HumanResourceCostRaw[]): HumanResourceCosts {
    // TODO: rawsはjsから呼ばれることを想定するため、型をチェックする

    return new HumanResourceCosts(raws.map((v) => {
      const total = typeof v.total == "string" ? eval(v.total) : v.total;
      const invest = typeof v.invest == "string" ? eval(v.invest) : v.invest;
      return {
        term: v.term,
        type: v.type,
        budget: new HumanResourceBudget(total, invest),
        org: v.org,
      };
    }));
  }
}
