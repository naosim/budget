/*
 ここに humanResourceCostRaws を定義してください
 export const humanResourceCostRaws = [
  { term: '1Q', type: '社員', total: 1000, invest: 800, org: '社員'},
  { term: '1Q', type: '請負', total: 1000, invest: 1000, org: 'A社'},
 ]
 */

export const humanResourceCostRaws = [
  { term: '1Q', type: '社員', total: 1000, invest: 800, org: '社員'},
  { term: '2Q', type: '社員', total: 1000, invest: 800, org: '社員'},
  { term: '3Q', type: '社員', total: 1000, invest: 800, org: '社員'},
  { term: '4Q', type: '社員', total: 1000, invest: 800, org: '社員'},

  { term: '1Q', type: '請負', total: 1000, invest: 1000, org: 'A社'},  
  { term: '2Q', type: '請負', total: 1000, invest: 1000, org: 'A社'},
  { term: '2Q', type: '請負', total: 1000, invest: 1000, org: 'B社'},  
  { term: '3Q', type: '請負', total: 1000, invest: 1000, org: 'C社'},
  { term: '4Q', type: '請負', total: 1000, invest: 1000, org: 'C社'},
]

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
