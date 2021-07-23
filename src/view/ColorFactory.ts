import { ContractType } from "../domain/HumanResourceCost.ts";

export interface ColorFactory {
  getColor(contractType: ContractType, org: string): string;
}
