class Lazy {
    func;
    value;
    evaluated = false;
    constructor(func1){
        this.func = func1;
    }
    get() {
        if (!this.evaluated) {
            this.value = this.func();
            this.evaluated = true;
            console.log('lazy init');
        } else {
            console.log('lazy fast!!');
        }
        return this.value;
    }
    isEvaluated() {
        return this.evaluated;
    }
    static of(func) {
        return new Lazy(func);
    }
}
class MemoMap {
    methods;
    memo;
    init;
    getKey;
    merge;
    constructor(methods, memo1 = new Map()){
        this.methods = methods;
        this.memo = memo1;
        this.init = methods.init;
        this.getKey = methods.getKey;
        this.merge = methods.merge;
    }
    add(e) {
        const k = this.getKey(e);
        if (!this.memo.has(k)) {
            this.memo.set(k, this.init(e));
        }
        this.memo.set(k, this.merge(e, this.memo.get(k)));
        return new MemoMap(this.methods, this.memo);
    }
    values() {
        return [
            ...this.memo.values()
        ];
    }
    map(callbackfn) {
        const result = [];
        this.memo.forEach((value, key, map)=>{
            result.push(callbackfn(value, key, map));
        });
        return result;
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
    toArray() {
        return [
            this.q1,
            this.q2,
            this.q3,
            this.q4, 
        ];
    }
}
class HumanResourceBudget {
    total;
    invest;
    investRate;
    investPer;
    constructor(total, invest1){
        this.total = total;
        this.invest = invest1;
        this.investRate = total > 0 ? invest1 / total : 0;
        this.investPer = Math.floor(this.investRate * 100);
    }
    add(other) {
        return new HumanResourceBudget(this.total + other.total, this.invest + other.invest);
    }
    static empty = new HumanResourceBudget(0, 0);
}
const emptyQuarterBudgets1 = new QuarterBudgets(HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty, HumanResourceBudget.empty);
class AnnualOrgHumanResourceCost {
    type;
    org;
    humanResourceCosts;
    constructor(type1, org1, humanResourceCosts){
        this.type = type1;
        this.org = org1;
        this.humanResourceCosts = humanResourceCosts;
    }
    _quarterBudgets = Lazy.of(()=>{
        return this.humanResourceCosts.reduce((memo1, v)=>memo1.addQuarter(v.term, v.budget)
        , emptyQuarterBudgets1);
    });
    get quarterBudgets() {
        return this._quarterBudgets.get();
    }
    add(humanResourceCost) {
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
class AnnualOrgHumanResourceCosts {
    memo;
    constructor(memo2){
        this.memo = memo2;
    }
    get quarterBudgets() {
        return this.values().reduce((memo3, v)=>memo3.add(v.quarterBudgets)
        , emptyQuarterBudgets1);
    }
    static empty() {
        return new AnnualOrgHumanResourceCosts(new MemoMap({
            init: (e)=>new AnnualOrgHumanResourceCost(e.type, e.org, [])
            ,
            getKey: (e)=>e.org
            ,
            merge: (e, v)=>v.add(e)
        }));
    }
    add(v) {
        return new AnnualOrgHumanResourceCosts(this.memo.add(v));
    }
    values() {
        return this.memo.values();
    }
}
class AnnualContractTypeHumanResourceCost {
    type;
    annualOrgHumanResourceCost;
    constructor(type2, annualOrgHumanResourceCost1){
        this.type = type2;
        this.annualOrgHumanResourceCost = annualOrgHumanResourceCost1;
    }
    _quarterBudgets = Lazy.of(()=>{
        return this.annualOrgHumanResourceCost.reduce((memo3, v)=>memo3.add(v.quarterBudgets)
        , emptyQuarterBudgets1);
    });
    get quarterBudgets() {
        return this._quarterBudgets.get();
    }
    add(annualOrgHumanResourceCost) {
        if (this.type !== annualOrgHumanResourceCost.type) {
            throw new Error("type missmatch: " + annualOrgHumanResourceCost.type);
        }
        return new AnnualContractTypeHumanResourceCost(this.type, [
            ...this.annualOrgHumanResourceCost,
            annualOrgHumanResourceCost, 
        ]);
    }
}
class AnnualContractTypeHumanResourceCosts {
    memo;
    constructor(memo3){
        this.memo = memo3;
    }
    get quarterBudgets() {
        return this.values().reduce((memo4, v)=>memo4.add(v.quarterBudgets)
        , emptyQuarterBudgets1);
    }
    add(value) {
        return new AnnualContractTypeHumanResourceCosts(this.memo.add(value));
    }
    static empty() {
        return new AnnualContractTypeHumanResourceCosts(new MemoMap({
            init: (e)=>new AnnualContractTypeHumanResourceCost(e.type, [])
            ,
            getKey: (e)=>e.type
            ,
            merge: (e, v)=>v.add(e)
        }));
    }
    values() {
        return this.memo.values();
    }
    map(callbackfn) {
        return this.memo.map((v, k)=>{
            return callbackfn(v, k);
        });
    }
}
class ProjectBudget {
    invest;
    constructor(invest2){
        this.invest = invest2;
    }
    add(other) {
        return new ProjectBudget(this.invest + other.invest);
    }
    static empty = new ProjectBudget(0);
}
class AnnualProjectCost {
    pjId;
    client;
    projectCosts;
    constructor(pjId, client1, projectCosts){
        this.pjId = pjId;
        this.client = client1;
        this.projectCosts = projectCosts;
    }
    _quarterBudgets = Lazy.of(()=>{
        return this.projectCosts.reduce((memo4, v)=>memo4.addQuarter(v.term, v.budget)
        , emptyQuarterBudgets2);
    });
    get quarterBudgets() {
        return this._quarterBudgets.get();
    }
    add(projectBudget) {
        if (this.pjId !== projectBudget.pjId) {
            throw new Error(`pjId不一致: ${this.pjId} != ${projectBudget.pjId}`);
        }
        return new AnnualProjectCost(this.pjId, this.client, [
            ...this.projectCosts,
            projectBudget
        ]);
    }
}
const emptyQuarterBudgets2 = new QuarterBudgets(ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty);
class AnnualProjectCosts {
    memo;
    constructor(memo4){
        this.memo = memo4;
    }
    _quarterBudgets = Lazy.of(()=>{
        return this.memo.values().reduce((memo5, v)=>memo5.add(v.quarterBudgets)
        , emptyQuarterBudgets2);
    });
    get quarterBudgets() {
        return this._quarterBudgets.get();
    }
    add(projectCost) {
        return new AnnualProjectCosts(this.memo.add(projectCost));
    }
    values() {
        return this.memo.values();
    }
    static empty() {
        return new AnnualProjectCosts(new MemoMap({
            init: (e)=>new AnnualProjectCost(e.pjId, e.client, [])
            ,
            getKey: (e)=>e.pjId
            ,
            merge: (e, v)=>v.add(e)
        }));
    }
}
class AnnualClientCost {
    client;
    annualProjectCost;
    constructor(client2, annualProjectCost1){
        this.client = client2;
        this.annualProjectCost = annualProjectCost1;
    }
    _quarterBudgets = Lazy.of(()=>{
        return this.annualProjectCost.reduce((memo5, v)=>memo5.add(v.quarterBudgets)
        , emptyQuarterBudgets2);
    });
    get quarterBudgets() {
        return this._quarterBudgets.get();
    }
    add(annualProjectCost) {
        if (this.client !== annualProjectCost.client) {
            throw new Error(`client不一致: ${this.client} != ${annualProjectCost.client}`);
        }
        return new AnnualClientCost(this.client, [
            ...this.annualProjectCost,
            annualProjectCost
        ]);
    }
}
class AnnualClientCosts {
    memo;
    constructor(memo5){
        this.memo = memo5;
    }
    _quarterBudgets = Lazy.of(()=>{
        return this.memo.values().reduce((memo6, v)=>memo6.add(v.quarterBudgets)
        , emptyQuarterBudgets2);
    });
    get quarterBudgets() {
        return this._quarterBudgets.get();
    }
    add(v) {
        return new AnnualClientCosts(this.memo.add(v));
    }
    values() {
        return this.memo.values();
    }
    map(callbackfn) {
        return this.memo.map((v, k)=>{
            return callbackfn(v, k);
        });
    }
    static empty() {
        return new AnnualClientCosts(new MemoMap({
            init: (e)=>new AnnualClientCost(e.client, [])
            ,
            getKey: (e)=>e.client
            ,
            merge: (e, v)=>v.add(e)
        }));
    }
}
class HumanResourceCostRepository {
    all;
    constructor(raws1){
        this.all = HumanResourceCostRepository.init(raws1);
    }
    static init(raws) {
        return raws.map((v)=>{
            const total1 = typeof v.total == "string" ? eval(v.total) : v.total;
            const invest3 = typeof v.invest == "string" ? eval(v.invest) : v.invest;
            return {
                term: v.term,
                type: v.type,
                budget: new HumanResourceBudget(total1, invest3),
                org: v.org
            };
        }).reduce((memo6, v)=>memo6.add(v)
        , AnnualOrgHumanResourceCosts.empty()).values();
    }
}
class ProjectCostRepository {
    all;
    projectMap;
    constructor(raws2, projects){
        this.projectMap = projects.reduce((memo6, v)=>{
            memo6[v.id] = v;
            return memo6;
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
            throw new Error("project not found: " + projectId);
        }
        return result;
    }
}
class DefaultColorFactory {
    map = {
    };
    colorMap = [
        [
            "#03A9F4",
            "#29B6F6",
            "#4FC3F7"
        ],
        [
            "#00BCD4",
            "#26C6DA",
            "#4DD0E1"
        ],
        [
            "#4CAF50",
            "#66BB6A",
            "#81C784"
        ],
        [
            "#FFEE58",
            "#FFF59D",
            "#FFFDE7"
        ], 
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
function toTotalTable(annualContractTypeHumanResourceCost) {
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
        ...annualContractTypeHumanResourceCost.annualOrgHumanResourceCost.map((v)=>toRow(v.org, v.quarterBudgets)
        ),
        toRow("合計", annualContractTypeHumanResourceCost.quarterBudgets), 
    ]);
}
function toInvestTable(annualContractTypeHumanResourceCost) {
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
        ...annualContractTypeHumanResourceCost.annualOrgHumanResourceCost.map((v)=>toRow(v.org, v.quarterBudgets)
        ),
        toRow("合計", annualContractTypeHumanResourceCost.quarterBudgets), 
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
            "案件名",
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
            "合計",
            ""
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
            "合計"
        ], annualClientCosts.quarterBudgets), 
    ]);
}
function createSummaryGraphDatasets(annualContractTypeHumanResourceCosts, annualClientCosts) {
    return [
        {
            label: "投資",
            data: annualContractTypeHumanResourceCosts.quarterBudgets.toArray().map((q)=>q.invest
            ),
            backgroundColor: "blue",
            stack: "人"
        },
        {
            label: "費用",
            data: annualContractTypeHumanResourceCosts.quarterBudgets.toArray().map((q)=>q.total - q.invest
            ),
            backgroundColor: "red",
            stack: "人"
        },
        ...annualClientCosts.map((v)=>{
            return {
                label: v.client,
                data: v.quarterBudgets.toArray().map((q)=>q.invest
                ),
                backgroundColor: "yellow",
                stack: "案件"
            };
        }), 
    ];
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
const join2d = (ary2d)=>ary2d.map((v)=>v.join("\n")
    ).join("\n")
;
function main1(humanResourceCostRaws, projectCostRaws, projects1) {
    const repository = new HumanResourceCostRepository(humanResourceCostRaws);
    const projectCostRepository = new ProjectCostRepository(projectCostRaws, projects1);
    const annualOrgHumanResourceCosts = repository.all;
    const annualContractTypeHumanResourceCosts = annualOrgHumanResourceCosts.reduce((memo6, v)=>memo6.add(v)
    , AnnualContractTypeHumanResourceCosts.empty());
    const annualProjectCosts = projectCostRepository.all.reduce((memo6, v)=>memo6.add(v)
    , AnnualProjectCosts.empty());
    const annualClientCosts = annualProjectCosts.values().reduce((memo6, v)=>memo6.add(v)
    , AnnualClientCosts.empty());
    console.log(annualClientCosts);
    var html = "";
    html += "<h1>サマリ</h1>";
    html += '<canvas id="summaryGraph"></canvas>';
    html += "<h1>人件費</h1>";
    html += '<canvas id="totalGraph"></canvas>';
    html += "<h1>投資</h1>";
    html += '<canvas id="investGraph"></canvas>';
    html += "<h2>人件費</h2>";
    html += join2d(annualContractTypeHumanResourceCosts.map((v, key)=>[
            `<h3>${key}</h3>`,
            toTotalTable(v)
        ]
    ));
    html += "<h2>投資</h2>";
    html += join2d(annualContractTypeHumanResourceCosts.map((v, key)=>[
            `<h3>${key}</h3>`,
            toInvestTable(v)
        ]
    ));
    html += "<h1>案件</h1>";
    html += join2d(annualClientCosts.map((v)=>[
            `<h3>${v.client}</h3>`,
            toAnnualClientCostTable(v, projectCostRepository), 
        ]
    ));
    html += "<h2>依頼元合計</h2>";
    html += toAnnualClientCostTotalTable(annualClientCosts);
    const colorFactory = new DefaultColorFactory();
    var totalDatasets = repository.all.map((v)=>{
        const quarterBudgets = v.quarterBudgets;
        return {
            label: v.org,
            data: quarterBudgets.toArray().map((q)=>q.total
            ),
            backgroundColor: colorFactory.getColor(v.type, v.org)
        };
    });
    var investDatasets = repository.all.map((v)=>{
        const quarterBudgets = v.quarterBudgets;
        return {
            label: v.org,
            data: quarterBudgets.toArray().map((q)=>q.invest
            ),
            backgroundColor: colorFactory.getColor(v.type, v.org)
        };
    });
    document.getElementById("app").innerHTML = html;
    new Chart(document.getElementById("totalGraph"), getConfig(totalDatasets));
    new Chart(document.getElementById("investGraph"), getConfig(investDatasets));
    new Chart(document.getElementById("summaryGraph"), getConfig(createSummaryGraphDatasets(annualContractTypeHumanResourceCosts, annualClientCosts)));
}
console.log(main1);
export { main1 as main };
