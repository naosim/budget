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
import { Lazy } from "../libs/Lazy.ts";
import { MemoMap } from "../libs/MemoMap.ts";
import { Quarter } from "./Quarter.ts";
import { QuarterBudgets } from "./QuarterBudgets.ts";

// 公称型用
declare const ProjectIdNominality: unique symbol;
/**
 * 契約区分
 * 例：社員、派遣、請負
 */
export type ProjectId = string & { [ProjectIdNominality]: never };

export type Project = {
  id: ProjectId;
  name: string;
  client: string;
};

export type ProjectCost = {
  term: Quarter;
  budget: ProjectBudget;
  pjId: ProjectId;
  client: string; // 冗長
};

export class ProjectBudget implements Add<ProjectBudget> {
  constructor(readonly invest: number) {}
  add(other: ProjectBudget): ProjectBudget {
    return new ProjectBudget(this.invest + other.invest);
  }
  static readonly empty = new ProjectBudget(0);
}

/**
 * プロジェクの年間予算
 */
export class AnnualProjectCost {
  constructor(
    readonly pjId: ProjectId,
    readonly client: string,
    readonly projectCosts: ProjectCost[],
  ) {}
  private _quarterBudgets = Lazy.of<QuarterBudgets<ProjectBudget>>(() => {
    return this.projectCosts.reduce(
      (memo, v) => memo.addQuarter(v.term, v.budget),
      emptyQuarterBudgets,
    );
  });
  get quarterBudgets(): QuarterBudgets<ProjectBudget> {
    return this._quarterBudgets.get();
  }
  add(projectBudget: ProjectCost): AnnualProjectCost {
    if (this.pjId !== projectBudget.pjId) {
      throw new Error(`pjId不一致: ${this.pjId} != ${projectBudget.pjId}`);
    }
    return new AnnualProjectCost(
      this.pjId,
      this.client,
      [...this.projectCosts, projectBudget],
    );
  }
}

const emptyQuarterBudgets = new QuarterBudgets<ProjectBudget>(
  ProjectBudget.empty,
  ProjectBudget.empty,
  ProjectBudget.empty,
  ProjectBudget.empty,
);

export class AnnualProjectCosts {
  constructor(
    readonly memo: MemoMap<ProjectCost, ProjectId, AnnualProjectCost>,
  ) {
  }

  private _quarterBudgets = Lazy.of<QuarterBudgets<ProjectBudget>>(() => {
    return this.memo.values().reduce(
      (memo, v) => memo.add(v.quarterBudgets),
      emptyQuarterBudgets,
    );
  });
  get quarterBudgets(): QuarterBudgets<ProjectBudget> {
    return this._quarterBudgets.get();
  }

  add(projectCost: ProjectCost): AnnualProjectCosts {
    return new AnnualProjectCosts(
      this.memo.add(projectCost),
    );
  }

  values(): AnnualProjectCost[] {
    return this.memo.values();
  }
  static empty(): AnnualProjectCosts {
    return new AnnualProjectCosts(
      new MemoMap<ProjectCost, ProjectId, AnnualProjectCost>({
        init: (e) => new AnnualProjectCost(e.pjId, e.client, []),
        getKey: (e) => e.pjId,
        merge: (e, v) => v.add(e),
      }),
    );
  }
}

/**
 * 依頼元年間予算
 */
export class AnnualClientCost {
  constructor(
    readonly client: string,
    readonly annualProjectCost: AnnualProjectCost[],
  ) {}
  private _quarterBudgets = Lazy.of<QuarterBudgets<ProjectBudget>>(() => {
    return this.annualProjectCost.reduce(
      (memo, v) => memo.add(v.quarterBudgets),
      emptyQuarterBudgets,
    );
  });
  get quarterBudgets(): QuarterBudgets<ProjectBudget> {
    return this._quarterBudgets.get();
  }
  add(annualProjectCost: AnnualProjectCost): AnnualClientCost {
    if (this.client !== annualProjectCost.client) {
      throw new Error(
        `client不一致: ${this.client} != ${annualProjectCost.client}`,
      );
    }
    return new AnnualClientCost(
      this.client,
      [...this.annualProjectCost, annualProjectCost],
    );
  }
}

export class AnnualClientCosts {
  constructor(
    readonly memo: MemoMap<AnnualProjectCost, string, AnnualClientCost>,
  ) {
  }
  private _quarterBudgets = Lazy.of<QuarterBudgets<ProjectBudget>>(() => {
    return this.memo.values().reduce(
      (memo, v) => memo.add(v.quarterBudgets),
      emptyQuarterBudgets,
    );
  });
  get quarterBudgets(): QuarterBudgets<ProjectBudget> {
    return this._quarterBudgets.get();
  }

  add(v: AnnualProjectCost): AnnualClientCosts {
    return new AnnualClientCosts(this.memo.add(v));
  }

  values(): AnnualClientCost[] {
    return this.memo.values();
  }
  map<T>(
    callbackfn: (
      value: AnnualClientCost,
      key: string,
    ) => T,
  ): T[] {
    return this.memo.map((v, k) => {
      return callbackfn(v, k);
    });
  }

  static empty(): AnnualClientCosts {
    return new AnnualClientCosts(
      new MemoMap<AnnualProjectCost, string, AnnualClientCost>({
        init: (e) => new AnnualClientCost(e.client, []),
        getKey: (e) => e.client,
        merge: (e, v) => v.add(e),
      }),
    );
  }
}
