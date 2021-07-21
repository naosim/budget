import {
  Project,
  ProjectBudget,
  ProjectCost,
  ProjectId,
} from "../domain/ProjectCost.ts";
import { Quarter } from "../domain/Quarter.ts";

// export const projects = [
//   {id: 'pj001', name: 'hoge project', client: 'サービス企画'},
//   {id: 'pj002', name: 'kaizen project', client: '内部'}
// ]

// export const projectCostRaws = [
//   { pjId: 'pj001', term: '1Q', cost: 0, invest: 100 },
//   { pjId: 'pj001', term: '2Q', cost: 0, invest: 100 },
//   { pjId: 'pj002', term: '3Q', cost: 0, invest: 200 },
//   { pjId: 'pj002', term: '4Q', cost: 0, invest: 200 },
// ]

export type ProjectCostRaw = {
  term: Quarter;
  invest: number | string;
  pjId: ProjectId;
};

export class ProjectCostRepository {
  readonly all: ProjectCost[];
  private projectMap: { [key: string]: Project };
  constructor(raws: ProjectCostRaw[], projects: Project[]) {
    this.projectMap = projects.reduce((memo: { [key: string]: Project }, v) => {
      memo[v.id] = v;
      return memo;
    }, {});
    this.all = ProjectCostRepository.init(raws, this.projectMap);
  }
  private static init(
    raws: ProjectCostRaw[],
    projectMap: { [key: string]: Project },
  ): ProjectCost[] {
    return raws.map((v) => {
      const invest = typeof v.invest == "string" ? eval(v.invest) : v.invest;
      return {
        term: v.term,
        budget: new ProjectBudget(invest),
        pjId: v.pjId,
        client: projectMap[v.pjId].client,
      };
    });
  }
  findProject(projectId: ProjectId): Project {
    const result = this.projectMap[projectId];
    if (!result) {
      throw new Error("project not found: " + projectId);
    }
    return result;
  }
}
