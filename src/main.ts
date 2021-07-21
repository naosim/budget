import {
  AnnualContractTypeHumanResourceCost,
  AnnualContractTypeHumanResourceCosts,
  AnnualOrgHumanResourceCost,
  ContractType,
  HumanResourceBudget,
} from "./domain/HumanResourceCost.ts";
import {
  AnnualClientCost,
  AnnualClientCosts,
  AnnualProjectCost,
  AnnualProjectCosts,
  Project,
  ProjectBudget,
} from "./domain/ProjectCost.ts";
import { QuarterBudgets } from "./domain/QuarterBudgets.ts";
import {
  HumanResourceCostRaw,
  HumanResourceCostRepository,
} from "./datasource/HumanResourceCostRepository.ts";
import {
  ProjectCostRaw,
  ProjectCostRepository,
} from "./datasource/ProjectCostRepository.ts";

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

function toTotalTable(
  annualContractTypeHumanResourceCost: AnnualContractTypeHumanResourceCost,
) {
  const toRow = (name: string, qb: QuarterBudgets<HumanResourceBudget>) =>
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
    ...annualContractTypeHumanResourceCost.annualOrgHumanResourceCost.map((
      v: AnnualOrgHumanResourceCost,
    ) => toRow(v.org, v.quarterBudgets)),
    toRow("合計", annualContractTypeHumanResourceCost.quarterBudgets),
  ]);
}

function toInvestTable(
  annualContractTypeHumanResourceCost: AnnualContractTypeHumanResourceCost,
) {
  const toRow = (name: string, qb: QuarterBudgets<HumanResourceBudget>) => [
    name,
    ...[qb.q1, qb.q2, qb.q3, qb.q4, qb.totalBudget].map((v) =>
      `${v.invest.toLocaleString()}<br>${v.investPer}%`
    ),
  ];

  return toHtml([
    ["組織名", "1Q", "2Q", "3Q", "4Q", "合計"],
    ...annualContractTypeHumanResourceCost.annualOrgHumanResourceCost.map((
      v: AnnualOrgHumanResourceCost,
    ) => toRow(v.org, v.quarterBudgets)),
    toRow("合計", annualContractTypeHumanResourceCost.quarterBudgets),
  ]);
}

function toAnnualClientCostTable(
  annualClientCost: AnnualClientCost,
  projectCostRepository: ProjectCostRepository,
) {
  const toRow = (texts: string[], qb: QuarterBudgets<ProjectBudget>) => [
    ...texts,
    ...[qb.q1, qb.q2, qb.q3, qb.q4, qb.totalBudget].map((v) =>
      v.invest.toLocaleString()
    ),
  ];

  return toHtml([
    ["案件番号", "案件名", "1Q", "2Q", "3Q", "4Q", "合計"],
    ...annualClientCost.annualProjectCost.map((v: AnnualProjectCost) =>
      toRow(
        [v.pjId, projectCostRepository.findProject(v.pjId).name],
        v.quarterBudgets,
      )
    ),
    toRow(["合計", ""], annualClientCost.quarterBudgets),
  ]);
}

function toAnnualClientCostTotalTable(
  annualClientCosts: AnnualClientCosts,
) {
  const toRow = (texts: string[], qb: QuarterBudgets<ProjectBudget>) => [
    ...texts,
    ...[qb.q1, qb.q2, qb.q3, qb.q4, qb.totalBudget].map((v) =>
      v.invest.toLocaleString()
    ),
  ];

  return toHtml([
    ["依頼元", "1Q", "2Q", "3Q", "4Q", "合計"],
    ...annualClientCosts.values().map((v: AnnualClientCost) =>
      toRow([v.client], v.quarterBudgets)
    ),
    toRow(["合計"], annualClientCosts.quarterBudgets),
  ]);
}

interface ColorFactory {
  getColor(contractType: ContractType, org: string): string;
}

class DefaultColorFactory implements ColorFactory {
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

const join2d = (ary2d: any[][]) => ary2d.map(v => v.join('\n')).join('\n')


export function main(
  humanResourceCostRaws: HumanResourceCostRaw[],
  projectCostRaws: ProjectCostRaw[],
  projects: Project[],
) {
  const repository = new HumanResourceCostRepository(humanResourceCostRaws);
  const projectCostRepository = new ProjectCostRepository(
    projectCostRaws,
    projects,
  );
  const annualOrgHumanResourceCosts = repository.all;
  const annualContractTypeHumanResourceCosts = annualOrgHumanResourceCosts
    .reduce(
      (memo, v) => memo.add(v),
      AnnualContractTypeHumanResourceCosts.empty(),
    );

  const annualProjectCosts = projectCostRepository.all.reduce(
    (memo, v) => memo.add(v),
    AnnualProjectCosts.empty(),
  );
  const annualClientCosts = annualProjectCosts.values().reduce(
    (memo, v) => memo.add(v),
    AnnualClientCosts.empty(),
  );
  console.log(annualClientCosts);

  var html = "";
  html += "<h1>サマリ</h1>";
  html += '<canvas id="summaryGraph"></canvas>';
  html += "<h1>人件費</h1>";
  html += '<canvas id="totalGraph"></canvas>';
  html += "<h1>投資</h1>";
  html += '<canvas id="investGraph"></canvas>';
  html += "<h2>人件費</h2>";
  html += join2d(annualContractTypeHumanResourceCosts.map((v, key) => [`<h3>${key}</h3>`, toTotalTable(v)]));
  html += "<h2>投資</h2>";
  html += join2d(annualContractTypeHumanResourceCosts.map((v, key) => [`<h3>${key}</h3>`, toInvestTable(v)]));
  html += "<h1>案件</h1>";
  html += join2d(annualClientCosts.map((v) => [`<h3>${v.client}</h3>`, toAnnualClientCostTable(v, projectCostRepository)]));
  html += "<h2>依頼元合計</h2>";
  html += toAnnualClientCostTotalTable(annualClientCosts);

  const colorFactory: ColorFactory = new DefaultColorFactory();
  var totalDatasets = repository.all.map((v) => {
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

  var investDatasets = repository.all.map((v) => {
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

  const labels = [
    "1Q",
    "2Q",
    "3Q",
    "4Q",
  ];

  new Chart(
    document.getElementById("summaryGraph"),
    {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "費用",
            data: [
              1,
              1,
              1,
              1,
            ],
            backgroundColor: "red",
            stack: "人",
          },
          {
            label: "投資",
            data: [
              2,
              3,
              2,
              2,
            ],
            backgroundColor: "blue",
            stack: "人",
          },
          {
            label: "基盤",
            data: [
              0.5,
              0.5,
              0.5,
              0.5,
            ],
            backgroundColor: "yellow",
            stack: "案件",
          },
        ],
      },
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
    },
  );
}
console.log(main);
