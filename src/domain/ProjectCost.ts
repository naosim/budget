/*
export const projects = [
  {id: 'pj001', name: 'hoge project', client: 'サービス企画'},
  {id: 'pj002', name: 'kaizen project', client: '内部'}
]

export const projectCostRaws = [
  { pjId: 'pj001', term: '1Q', cost: 0, invest: 100 },
  { pjId: 'pj001', term: '2Q', cost: 0, invest: 100 },
  { pjId: 'pj002', term: '3Q', cost: 0, invest: 200 },
  { pjId: 'pj002', term: '4Q', cost: 0, invest: 200 },
]
*/

import { Add } from "../libs/Add.ts";
import { MemoMap } from '../libs/MemoMap.ts';
import { Quarter } from "./Quarter.ts";
import { QuarterBudgets } from "./QuarterBudgets.ts";

// 公称型用
declare const ProjectIdNominality: unique symbol
/**
 * 契約区分
 * 例：社員、派遣、請負
 */
export type ProjectId = string & { [ProjectIdNominality]: never };

export type Project = {
  id: ProjectId,
  name: string,
  client: string
};

export type ProjectCost = {
  term: Quarter,
  budget: ProjectBudget,
  pjId: ProjectId,
  client: string // 冗長
};

export class ProjectBudget implements Add<ProjectBudget> {
  constructor(readonly invest: number) {}
  add(other: ProjectBudget): ProjectBudget {
    return new ProjectBudget(this.invest + other.invest)
  }
  static readonly empty = new ProjectBudget(0) 
}

/**
 * プロジェクの年間予算
 */
export class AnnualProjectCost {
  constructor(
    readonly pjId: ProjectId, 
    readonly client: string, 
    readonly quarterBudgets: QuarterBudgets<ProjectBudget>,
    readonly projectCosts: ProjectCost[]
  ) {}
  add(projectBudget: ProjectCost): AnnualProjectCost {
    if(this.pjId !== projectBudget.pjId) {
      throw new Error(`pjId不一致: ${this.pjId} != ${projectBudget.pjId}`)
    }
    return new AnnualProjectCost(
      this.pjId, 
      this.client, 
      this.quarterBudgets.addQuarter(projectBudget.term, projectBudget.budget),
      [...this.projectCosts, projectBudget]
    )
  }
}

const emptyQuarterBudgets = new QuarterBudgets<ProjectBudget>(ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty)

export class AnnualProjectCosts {
  constructor(
    readonly memo:MemoMap<ProjectCost, ProjectId, AnnualProjectCost>, 
    readonly quarterBudgets: QuarterBudgets<ProjectBudget>
    ) {
  }

  private static readonly init = (e:ProjectCost) => new AnnualProjectCost(
    e.pjId,
    e.client,
    emptyQuarterBudgets,
    []);
  private static readonly getKey = (e:ProjectCost) => e.pjId;
  private static readonly merge: (e:ProjectCost, v: AnnualProjectCost) => AnnualProjectCost = (e, v) => v.add(e)
  
  add(projectCost: ProjectCost): AnnualProjectCosts {
    return new AnnualProjectCosts(this.memo.add(projectCost), this.quarterBudgets.addQuarter(projectCost.term, projectCost.budget))
  }

  values(): AnnualProjectCost[] {
    return this.memo.values();
  }
  static empty(): AnnualProjectCosts {
    return new AnnualProjectCosts(
      new MemoMap<ProjectCost, ProjectId, AnnualProjectCost>(
        AnnualProjectCosts.init, AnnualProjectCosts.getKey, AnnualProjectCosts.merge),
        emptyQuarterBudgets
    )
  }
}

/**
 * 依頼元年間予算
 */
export class AnnualClientCost {
  constructor(
    readonly client: string,
    readonly quarterBudgets: QuarterBudgets<ProjectBudget>,
    readonly annualProjectCost: AnnualProjectCost[]
  ) {}
  add(annualProjectCost: AnnualProjectCost): AnnualClientCost {
    if(this.client !== annualProjectCost.client) {
      throw new Error(`client不一致: ${this.client} != ${annualProjectCost.client}`)
    }
    return new AnnualClientCost(
      this.client,
      this.quarterBudgets.add(annualProjectCost.quarterBudgets),
      [...this.annualProjectCost, annualProjectCost]
    )
  }
}

export class AnnualClientCosts {
  // private memo: MemoMap<AnnualProjectCost, string, AnnualClientCost>
  constructor(
    readonly memo:MemoMap<AnnualProjectCost, string, AnnualClientCost>,
    readonly quarterBudgets: QuarterBudgets<ProjectBudget>
  ) {
    //this.memo = memo || new MemoMap<AnnualProjectCost, string, AnnualClientCost>(AnnualClientCosts.init, AnnualClientCosts.getKey, AnnualClientCosts.merge)
  }
  
  private static readonly init: (e:AnnualProjectCost) => AnnualClientCost = (e) => new AnnualClientCost(
    e.client,
    new QuarterBudgets<ProjectBudget>(ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty, ProjectBudget.empty),
    []
  );
  private static readonly getKey: (e:AnnualProjectCost) => string = (e) => e.client;
  private static readonly merge: (e:AnnualProjectCost, v: AnnualClientCost) => AnnualClientCost = (e, v) => v.add(e)
  
  add(v: AnnualProjectCost): AnnualClientCosts {
    return new AnnualClientCosts(this.memo.add(v), this.quarterBudgets.add(v.quarterBudgets))
  }
  
  values(): AnnualClientCost[] {
    return this.memo.values();
  }

  static empty(): AnnualClientCosts {
    return new AnnualClientCosts(
      new MemoMap<AnnualProjectCost, string, AnnualClientCost>(
        AnnualClientCosts.init, AnnualClientCosts.getKey, AnnualClientCosts.merge),
        emptyQuarterBudgets
    )
  }
}
