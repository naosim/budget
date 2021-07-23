import { ContractType } from "../domain/HumanResourceCost.ts";
import { ColorFactory } from "./ColorFactory.ts";

export class DefaultColorFactory implements ColorFactory {
  readonly map: { [key: string]: { [key: string]: string } } = {};

  // 足りない時はここから適当にとる
  // https://materialui.co/colors
  // 300,400,500あたりがよい
  readonly colorMap = [
    ["#03A9F4", "#29B6F6", "#4FC3F7"],
    ["#00BCD4", "#26C6DA", "#4DD0E1"],
    ["#4CAF50", "#66BB6A", "#81C784"],
    ["#FFEE58", "#FFF59D", "#FFFDE7"],
  ];
  contractTypeIndex: { [key: string]: number } = {};
  getColor(contractType: ContractType, org: string) {
    if (this.contractTypeIndex[contractType] === undefined) {
      this.contractTypeIndex[contractType] =
        Object.keys(this.contractTypeIndex).length;
    }
    if (!this.map[contractType]) {
      this.map[contractType] = {};
    }
    if (!this.map[contractType][org]) {
      console.log(contractType, org);
      this.map[contractType][org] = this
        .colorMap[this.contractTypeIndex[contractType]][
          Object.keys(this.map[contractType]).length
        ];
    }
    return this.map[contractType][org];
  }
}
