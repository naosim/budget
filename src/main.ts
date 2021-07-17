import {
  AnnualHumanResourceCost,
  AnnualHumanResourceCosts,
  ContractType,
  QuarterBudgets,
} from "./domain/HumanResourceCost.ts";
import {
  HumanResourceCostRaw,
  HumanResourceCostRepository,
} from "./HumanResourceCostRepository.ts";

declare const Chart: any;
declare const document: any;

function toHtml(ary2d: any[][]) {
  const head = ary2d[0];
  const body = ary2d.slice(1).map((r) => r.map((v) => v.toLocaleString()));
  const rowsHtml = body.map((row) =>
    "<tr>" + row.map((cell) => "<td>" + cell + "</td>").join("") + "</tr>"
  ).join("");
  return `<table><thead><tr>${
    head.map((v) => "<th>" + v + "</th>").join("")
  }</tr></thead><tbody>${rowsHtml}</tbody></table>`;
}

function toTotalTable(annualHumanResourceCosts: AnnualHumanResourceCosts) {
  const toRow = (name: string, qb: QuarterBudgets) =>
    [
      name,
      qb.q1.total,
      qb.q2.total,
      qb.q3.total,
      qb.q4.total,
      qb.totalBudget.total,
    ].map((v) => typeof v == "number" ? Math.floor(v).toLocaleString() : v);

  return toHtml([
    ["組織名", "1Q", "2Q", "3Q", "4Q", "合計"],
    ...annualHumanResourceCosts.values.map((v: AnnualHumanResourceCost) =>
      toRow(v.org, v.quarterBudgets)
    ),
    toRow("合計", annualHumanResourceCosts.quarterBudgets),
  ]);
}

function toInvestTable(annualHumanResourceCosts: AnnualHumanResourceCosts) {
  const toRow = (name: string, qb: QuarterBudgets) => [
    name,
    ...[qb.q1, qb.q2, qb.q3, qb.q4, qb.totalBudget].map((v) =>
      `${v.invest.toLocaleString()}<br>${v.investPer}%`
    ),
  ];

  return toHtml([
    ["組織名", "1Q", "2Q", "3Q", "4Q", "合計"],
    ...annualHumanResourceCosts.values.map((v: AnnualHumanResourceCost) =>
      toRow(v.org, v.quarterBudgets)
    ),
    toRow("合計", annualHumanResourceCosts.quarterBudgets),
  ]);
}

interface ColorFactory {
  getColor(contractType: ContractType, org: string): string
}

class DefaultColorFactory implements ColorFactory {
  readonly map: { [key: string]: { [key: string]: string } } = {};

  // 足りない時はここから適当にとる
  // https://materialui.co/colors
  // 300,400,500あたりがよい
  readonly colorMap = [
    ["#03A9F4", '#29B6F6', '#4FC3F7'],
    ["#00BCD4", '#26C6DA', '#4DD0E1'],
    ["#4CAF50", "#66BB6A", "#81C784"],
    ["#FFEE58", "#FFF59D", '#FFFDE7']
  ]
  contractTypeIndex: {[key:string]: number} = {}
  getColor(contractType: ContractType, org: string) {
    

    if(this.contractTypeIndex[contractType] === undefined) {
      this.contractTypeIndex[contractType] = Object.keys(this.contractTypeIndex).length;
    }
    if(!this.map[contractType]) {
      this.map[contractType] = {}
    }
    if (!this.map[contractType][org]) {
      console.log(contractType, org)
      this.map[contractType][org] =
        this.colorMap[this.contractTypeIndex[contractType]][Object.keys(this.map[contractType]).length];
    }
    return this.map[contractType][org];
  }
}

/**
 * chart.js用のconfig作成
 * @param datasets
 * @returns
 */
const getConfig = (datasets: any) => {
  const labels = [
    "1Q",
    "2Q",
    "3Q",
    "4Q",
  ];
  return {
    type: "bar",
    data: { labels: labels, datasets: datasets },
    options: {
      responsive: true,
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
        },
      },
    },
  };
};

export function main(humanResourceCostRaws: HumanResourceCostRaw[]) {
  const repository = new HumanResourceCostRepository(humanResourceCostRaws);
  const list = repository.all.convertToAnnualHumanResourceCostByOrg()
    .groupByContractType();
  console.log(list);

  var html = "";
  html += "<h1>人件費</h1>";
  html += '<canvas id="totalGraph"></canvas>';
  html += "<h1>投資</h1>";
  html += '<canvas id="investGraph"></canvas>';
  html += "<h2>人件費</h2>";
  html += Object.keys(list).map((key) => {
    return [`<h3>${key}</h3>`, toTotalTable(list[key])].join("\n");
  }).join("\n");
  html += "<h2>投資</h2>";
  html += Object.keys(list).map((key) => {
    return [`<h3>${key}</h3>`, toInvestTable(list[key])].join("\n");
  }).join("\n");

  const colorFactory: ColorFactory = new DefaultColorFactory();
  var totalDatasets = repository.all.convertToAnnualHumanResourceCostByOrg()
    .values.map((v) => {
      const quarterBudgets = v.quarterBudgets;
      return {
        label: v.org,
        data: [
          quarterBudgets.q1.total,
          quarterBudgets.q2.total,
          quarterBudgets.q3.total,
          quarterBudgets.q4.total,
        ],
        backgroundColor: colorFactory.getColor(v.type, v.org),
      };
    });

  var investDatasets = repository.all.convertToAnnualHumanResourceCostByOrg()
    .values.map((v) => {
      const quarterBudgets = v.quarterBudgets;
      return {
        label: v.org,
        data: [
          quarterBudgets.q1.invest,
          quarterBudgets.q2.invest,
          quarterBudgets.q3.invest,
          quarterBudgets.q4.invest,
        ],
        backgroundColor: colorFactory.getColor(v.type, v.org),
      };
    });

  document.getElementById("app").innerHTML = html;

  new Chart(
    document.getElementById("totalGraph"),
    getConfig(totalDatasets),
  );
  new Chart(
    document.getElementById("investGraph"),
    getConfig(investDatasets),
  );
}
console.log(main);
