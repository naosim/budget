class Budget {
    total;
    invest;
    investRate;
    investPer;
    constructor(total, invest){
        this.total = total;
        this.invest = invest;
        this.investRate = total > 0 ? invest / total : 0;
        this.investPer = Math.floor(this.investRate * 100);
    }
    add(other) {
        return new Budget(this.total + other.total, this.invest + other.invest);
    }
    static empty = new Budget(0, 0);
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
    static empty = new QuarterBudgets(Budget.empty, Budget.empty, Budget.empty, Budget.empty);
}
class HumanResourceCosts {
    values;
    constructor(values1){
        this.values = values1;
    }
    convertToAnnualHumanResourceCostByOrg() {
        const map = this.values.reduce((memo, v)=>{
            if (!memo[v.org]) {
                memo[v.org] = {
                    type: v.type,
                    quarterBudgets: QuarterBudgets.empty,
                    org: v.org
                };
            }
            memo[v.org].quarterBudgets = memo[v.org].quarterBudgets.addQuarter(v.term, v.budget);
            return memo;
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
        this.quarterBudgets = values2.reduce((memo, v)=>memo.add(v.quarterBudgets)
        , QuarterBudgets.empty);
    }
    push(value) {
        return new AnnualHumanResourceCosts([
            ...this.values,
            value
        ]);
    }
    groupByContractType() {
        return this.values.reduce((memo, v)=>{
            if (!memo[v.type]) {
                memo[v.type] = new AnnualHumanResourceCosts([]);
            }
            memo[v.type] = memo[v.type].push(v);
            return memo;
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
            const invest1 = typeof v.invest == "string" ? eval(v.invest) : v.invest;
            return {
                term: v.term,
                type: v.type,
                budget: new Budget(total1, invest1),
                org: v.org
            };
        }));
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
class DefaultColorFactory {
    map = {
    };
    colorMap = [
        [
            "#03A9F4"
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
            "#FFF59D"
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
function main1(humanResourceCostRaws) {
    const repository = new HumanResourceCostRepository(humanResourceCostRaws);
    const list = repository.all.convertToAnnualHumanResourceCostByOrg().groupByContractType();
    console.log(list);
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
    const colorFactory = new DefaultColorFactory();
    var totalDatasets = repository.all.convertToAnnualHumanResourceCostByOrg().values.map((v)=>{
        const quarterBudgets = v.quarterBudgets;
        return {
            label: v.org,
            data: [
                quarterBudgets.q1.total,
                quarterBudgets.q2.total,
                quarterBudgets.q3.total,
                quarterBudgets.q4.total, 
            ],
            backgroundColor: colorFactory.getColor(v.type, v.org)
        };
    });
    var investDatasets = repository.all.convertToAnnualHumanResourceCostByOrg().values.map((v)=>{
        const quarterBudgets = v.quarterBudgets;
        return {
            label: v.org,
            data: [
                quarterBudgets.q1.invest,
                quarterBudgets.q2.invest,
                quarterBudgets.q3.invest,
                quarterBudgets.q4.invest, 
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
