class MemoMap {
    init;
    getKey;
    merge;
    memo;
    constructor(init1, getKey1, merge1, memo1 = new Map()){
        this.init = init1;
        this.getKey = getKey1;
        this.merge = merge1;
        this.memo = memo1;
    }
    add(e) {
        const k = this.getKey(e);
        if (!this.memo.has(k)) {
            this.memo.set(k, this.init(e));
        }
        this.memo.set(k, this.merge(e, this.memo.get(k)));
        return new MemoMap(this.init, this.getKey, this.merge, this.memo);
    }
    values() {
        return [
            ...this.memo.values()
        ];
    }
}
class QuarterBudgets {
    q1;
    q2;
    q3;
    q4;
    totalBudget;
    constructor(q1, q2, q3, q4){
        this.q1 = q1;
        this.q2 = q2;
        this.q3 = q3;
        this.q4 = q4;
        this.totalBudget = q1.add(q2).add(q3).add(q4);
    }
    addQuarter(quarter, budget) {
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
    add(other) {
        return new QuarterBudgets(this.q1.add(other.q1), this.q2.add(other.q2), this.q3.add(other.q3), this.q4.add(other.q4));
    }
}
class ProjectBudget {
    invest;
    constructor(invest1){
        this.invest = invest1;
    }
    add(other) {
        return new ProjectBudget(this.invest + other.invest);
    }
    static empty = new ProjectBudget(0);
}
class AnnualProjectCost {
    pjId;
    client;
    quarterBudgets;
    projectCosts;
    constructor(pjId, client1, quarterBudgets1, projectCosts){
        this.pjId = pjId;
        this.client = client1;
        this.quarterBudgets = quarterBudgets1;
        this.projectCosts = projectCosts;
    }
    add(projectBudget) {
        if (this.pjId !== projectBudget.pjId) {
            throw new Error(`pjId不一致: ${this.pjId} != ${projectBudget.pjId}`);
        }
        return new AnnualProjectCost(this.pjId, this.client, this.quarterBudgets.addQuarter(projectBudget.term, projectBudget.budget), [
            ...this.projectCosts,
            projectBudget
        ]);
    }
}
const emptyQuarterBudgets = new QuarterBudgets(ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty);
class AnnualProjectCosts {
    memo;
    quarterBudgets;
    constructor(memo2, quarterBudgets2){
        this.memo = memo2;
        this.quarterBudgets = quarterBudgets2;
    }
    static init = (e)=>new AnnualProjectCost(e.pjId, e.client, emptyQuarterBudgets, [])
    ;
    static getKey = (e)=>e.pjId
    ;
    static merge = (e, v)=>v.add(e)
    ;
    add(projectCost) {
        return new AnnualProjectCosts(this.memo.add(projectCost), this.quarterBudgets.addQuarter(projectCost.term, projectCost.budget));
    }
    values() {
        return this.memo.values();
    }
    static empty() {
        return new AnnualProjectCosts(new MemoMap(AnnualProjectCosts.init, AnnualProjectCosts.getKey, AnnualProjectCosts.merge), emptyQuarterBudgets);
    }
}
class AnnualClientCost {
    client;
    quarterBudgets;
    annualProjectCost;
    constructor(client2, quarterBudgets3, annualProjectCost1){
        this.client = client2;
        this.quarterBudgets = quarterBudgets3;
        this.annualProjectCost = annualProjectCost1;
    }
    add(annualProjectCost) {
        if (this.client !== annualProjectCost.client) {
            throw new Error(`client不一致: ${this.client} != ${annualProjectCost.client}`);
        }
        return new AnnualClientCost(this.client, this.quarterBudgets.add(annualProjectCost.quarterBudgets), [
            ...this.annualProjectCost,
            annualProjectCost
        ]);
    }
}
class AnnualClientCosts {
    memo;
    quarterBudgets;
    constructor(memo3, quarterBudgets4){
        this.memo = memo3;
        this.quarterBudgets = quarterBudgets4;
    }
    static init = (e)=>new AnnualClientCost(e.client, new QuarterBudgets(ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty), [])
    ;
    static getKey = (e)=>e.client
    ;
    static merge = (e, v)=>v.add(e)
    ;
    add(v) {
        return new AnnualClientCosts(this.memo.add(v), this.quarterBudgets.add(v.quarterBudgets));
    }
    values() {
        return this.memo.values();
    }
    static empty() {
        return new AnnualClientCosts(new MemoMap(AnnualClientCosts.init, AnnualClientCosts.getKey, AnnualClientCosts.merge), emptyQuarterBudgets);
    }
}
class HumanResourceBudget {
    total;
    invest;
    investRate;
    investPer;
    constructor(total, invest2){
        this.total = total;
        this.invest = invest2;
        this.investRate = total > 0 ? invest2 / total : 0;
        this.investPer = Math.floor(this.investRate * 100);
    }
    add(other) {
        return new HumanResourceBudget(this.total + other.total, this.invest + other.invest);
    }
    static empty = new HumanResourceBudget(0, 0);
}
class HumanResourceCosts {
    values;
    constructor(values1){
        this.values = values1;
    }
    convertToAnnualHumanResourceCostByOrg() {
        const map = this.values.reduce((memo4, v)=>{
            if (!memo4[v.org]) {
                memo4[v.org] = {
                    type: v.type,
                    quarterBudgets: new QuarterBudgets(HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty),
                    org: v.org
                };
            }
            memo4[v.org].quarterBudgets = memo4[v.org].quarterBudgets.addQuarter(v.term, v.budget);
            return memo4;
        }, {
        });
        return new AnnualHumanResourceCosts(Object.values(map));
    }
}
class AnnualHumanResourceCosts {
    values;
    quarterBudgets;
    constructor(values2){
        this.values = values2;
        this.quarterBudgets = values2.reduce((memo4, v)=>memo4.add(v.quarterBudgets)
        , new QuarterBudgets(HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty));
    }
    push(value) {
        return new AnnualHumanResourceCosts([
            ...this.values,
            value
        ]);
    }
    groupByContractType() {
        return this.values.reduce((memo4, v)=>{
            if (!memo4[v.type]) {
                memo4[v.type] = new AnnualHumanResourceCosts([]);
            }
            memo4[v.type] = memo4[v.type].push(v);
            return memo4;
        }, {
        });
    }
}
class HumanResourceCostRepository {
    raws;
    all;
    constructor(raws1){
        this.raws = raws1;
        this.all = HumanResourceCostRepository.init(raws1);
    }
    static init(raws) {
        return new HumanResourceCosts(raws.map((v)=>{
            const total1 = typeof v.total == "string" ? eval(v.total) : v.total;
            const invest3 = typeof v.invest == "string" ? eval(v.invest) : v.invest;
            return {
                term: v.term,
                type: v.type,
                budget: new HumanResourceBudget(total1, invest3),
                org: v.org
            };
        }));
    }
}
class ProjectCostRepository {
    all;
    projectMap;
    constructor(raws2, projects){
        this.projectMap = projects.reduce((memo4, v)=>{
            memo4[v.id] = v;
            return memo4;
        }, {
        });
        this.all = ProjectCostRepository.init(raws2, this.projectMap);
    }
    static init(raws, projectMap) {
        return raws.map((v)=>{
            const invest3 = typeof v.invest == "string" ? eval(v.invest) : v.invest;
            return {
                term: v.term,
                budget: new ProjectBudget(invest3),
                pjId: v.pjId,
                client: projectMap[v.pjId].client
            };
        });
    }
    findProject(projectId) {
        const result = this.projectMap[projectId];
        if (!result) {
            throw new Error('project not found: ' + projectId);
        }
        return result;
    }
}
function toHtml(ary2d) {
    const head = ary2d[0];
    const body = ary2d.slice(1).map((r)=>r.map((v)=>v.toLocaleString()
        )
    );
    const rowsHtml = body.map((row)=>"<tr>" + row.map((cell)=>"<td>" + cell + "</td>"
        ).join("") + "</tr>"
    ).join("");
    return `<table><thead><tr>${head.map((v)=>"<th>" + v + "</th>"
    ).join("")}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
}
function toTotalTable(annualHumanResourceCosts) {
    const toRow = (name, qb)=>[
            name,
            qb.q1.total,
            qb.q2.total,
            qb.q3.total,
            qb.q4.total,
            qb.totalBudget.total, 
        ].map((v)=>typeof v == "number" ? Math.floor(v).toLocaleString() : v
        )
    ;
    return toHtml([
        [
            "組織名",
            "1Q",
            "2Q",
            "3Q",
            "4Q",
            "合計"
        ],
        ...annualHumanResourceCosts.values.map((v)=>toRow(v.org, v.quarterBudgets)
        ),
        toRow("合計", annualHumanResourceCosts.quarterBudgets), 
    ]);
}
function toInvestTable(annualHumanResourceCosts) {
    const toRow = (name, qb)=>[
            name,
            ...[
                qb.q1,
                qb.q2,
                qb.q3,
                qb.q4,
                qb.totalBudget
            ].map((v)=>`${v.invest.toLocaleString()}<br>${v.investPer}%`
            ), 
        ]
    ;
    return toHtml([
        [
            "組織名",
            "1Q",
            "2Q",
            "3Q",
            "4Q",
            "合計"
        ],
        ...annualHumanResourceCosts.values.map((v)=>toRow(v.org, v.quarterBudgets)
        ),
        toRow("合計", annualHumanResourceCosts.quarterBudgets), 
    ]);
}
function toAnnualClientCostTable(annualClientCost, projectCostRepository) {
    const toRow = (texts, qb)=>[
            ...texts,
            ...[
                qb.q1,
                qb.q2,
                qb.q3,
                qb.q4,
                qb.totalBudget
            ].map((v)=>v.invest.toLocaleString()
            ), 
        ]
    ;
    return toHtml([
        [
            "案件番号",
            '案件名',
            "1Q",
            "2Q",
            "3Q",
            "4Q",
            "合計"
        ],
        ...annualClientCost.annualProjectCost.map((v)=>toRow([
                v.pjId,
                projectCostRepository.findProject(v.pjId).name
            ], v.quarterBudgets)
        ),
        toRow([
            '合計',
            ''
        ], annualClientCost.quarterBudgets), 
    ]);
}
function toAnnualClientCostTotalTable(annualClientCosts) {
    const toRow = (texts, qb)=>[
            ...texts,
            ...[
                qb.q1,
                qb.q2,
                qb.q3,
                qb.q4,
                qb.totalBudget
            ].map((v)=>v.invest.toLocaleString()
            ), 
        ]
    ;
    return toHtml([
        [
            "依頼元",
            "1Q",
            "2Q",
            "3Q",
            "4Q",
            "合計"
        ],
        ...annualClientCosts.values().map((v)=>toRow([
                v.client
            ], v.quarterBudgets)
        ),
        toRow([
            '合計'
        ], annualClientCosts.quarterBudgets), 
    ]);
}
class DefaultColorFactory {
    map = {
    };
    colorMap = [
        [
            "#03A9F4",
            '#29B6F6',
            '#4FC3F7'
        ],
        [
            "#00BCD4",
            '#26C6DA',
            '#4DD0E1'
        ],
        [
            "#4CAF50",
            "#66BB6A",
            "#81C784"
        ],
        [
            "#FFEE58",
            "#FFF59D",
            '#FFFDE7'
        ]
    ];
    contractTypeIndex = {
    };
    getColor(contractType, org) {
        if (this.contractTypeIndex[contractType] === undefined) {
            this.contractTypeIndex[contractType] = Object.keys(this.contractTypeIndex).length;
        }
        if (!this.map[contractType]) {
            this.map[contractType] = {
            };
        }
        if (!this.map[contractType][org]) {
            console.log(contractType, org);
            this.map[contractType][org] = this.colorMap[this.contractTypeIndex[contractType]][Object.keys(this.map[contractType]).length];
        }
        return this.map[contractType][org];
    }
}
const getConfig = (datasets)=>{
    const labels = [
        "1Q",
        "2Q",
        "3Q",
        "4Q", 
    ];
    return {
        type: "bar",
        data: {
            labels: labels,
            datasets: datasets
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    stacked: true
                },
                y: {
                    stacked: true
                }
            }
        }
    };
};
function main1(humanResourceCostRaws, projectCostRaws, projects1) {
    const repository = new HumanResourceCostRepository(humanResourceCostRaws);
    const projectCostRepository = new ProjectCostRepository(projectCostRaws, projects1);
    const list = repository.all.convertToAnnualHumanResourceCostByOrg().groupByContractType();
    console.log(list);
    const annualProjectCosts = projectCostRepository.all.reduce((memo4, v)=>memo4.add(v)
    , AnnualProjectCosts.empty());
    const annualClientCosts = annualProjectCosts.values().reduce((memo4, v)=>memo4.add(v)
    , AnnualClientCosts.empty());
    console.log(annualClientCosts);
    var html = "";
    html += "<h1>人件費</h1>";
    html += '<canvas id="totalGraph"></canvas>';
    html += "<h1>投資</h1>";
    html += '<canvas id="investGraph"></canvas>';
    html += "<h2>人件費</h2>";
    html += Object.keys(list).map((key)=>{
        return [
            `<h3>${key}</h3>`,
            toTotalTable(list[key])
        ].join("\n");
    }).join("\n");
    html += "<h2>投資</h2>";
    html += Object.keys(list).map((key)=>{
        return [
            `<h3>${key}</h3>`,
            toInvestTable(list[key])
        ].join("\n");
    }).join("\n");
    html += "<h1>案件</h1>";
    html += annualClientCosts.values().map((v)=>{
        return [
            `<h3>${v.client}</h3>`,
            toAnnualClientCostTable(v, projectCostRepository)
        ].join("\n");
    }).join("\n");
    html += "<h2>依頼元合計</h2>";
    html += toAnnualClientCostTotalTable(annualClientCosts);
    const colorFactory = new DefaultColorFactory();
    var totalDatasets = repository.all.convertToAnnualHumanResourceCostByOrg().values.map((v)=>{
        const quarterBudgets5 = v.quarterBudgets;
        return {
            label: v.org,
            data: [
                quarterBudgets5.q1.total,
                quarterBudgets5.q2.total,
                quarterBudgets5.q3.total,
                quarterBudgets5.q4.total, 
            ],
            backgroundColor: colorFactory.getColor(v.type, v.org)
        };
    });
    var investDatasets = repository.all.convertToAnnualHumanResourceCostByOrg().values.map((v)=>{
        const quarterBudgets5 = v.quarterBudgets;
        return {
            label: v.org,
            data: [
                quarterBudgets5.q1.invest,
                quarterBudgets5.q2.invest,
                quarterBudgets5.q3.invest,
                quarterBudgets5.q4.invest, 
            ],
            backgroundColor: colorFactory.getColor(v.type, v.org)
        };
    });
    document.getElementById("app").innerHTML = html;
    new Chart(document.getElementById("totalGraph"), getConfig(totalDatasets));
    new Chart(document.getElementById("investGraph"), getConfig(investDatasets));
}
console.log(main1);
export { main1 as main };
