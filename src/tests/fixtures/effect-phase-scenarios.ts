import fixture from '../../../tests/fixtures/native-6.0.6/effect-phases.json';
// C88 actual applicability comparisons supersede only the historical template
// restriction. Retain the original evidence unchanged.
export const effectPhaseCases=fixture.cases.map(row=>row.id==='nontransfer-item'?{...row,expected:{...row.expected,ready:true,decisions:['stored-template']}}:row);
