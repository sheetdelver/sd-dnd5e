import test from 'node:test';
import assert from 'node:assert/strict';
import {rangeCases,rangeFixture,verifyRange,verifyRangeData} from './lib/range-expectations.mjs';
const cases=rangeCases();
const serialized=row=>({formula:row.formula,total:row.total,dice:[{class:'Die',number:row.faces.length,faces:20,modifiers:[...(row.mode?[row.mode===1?'kh1':'kl1']:[]),...(row.minimum===null?[]:[`min${row.minimum}`]),...(row.maximum===null?[]:[`max${row.maximum}`])],results:structuredClone(row.results)}]});
test('crossed bounds use native ordered raw-face contributions, not clamp approximation',()=>{
    const row=rangeFixture.ranges.find(r=>r.id==='crossed');assert.equal(row.contributions[4],15);assert.equal(row.contributions[15],10);assert.equal(cases.length,6560);
    for(const example of cases)verifyRange(serialized(example),example);
});
test('bounded equal faces retain exact identity; no plain-profile exception',()=>{
    const row=cases.find(r=>r.mode===1&&r.faces[0]===2&&r.faces[1]===2),roll=serialized(row);
    roll.dice[0].results[0].active=false;roll.dice[0].results[0].discarded=true;roll.dice[0].results[1].active=true;delete roll.dice[0].results[1].discarded;
    verifyRangeData(roll,row);assert.throws(()=>verifyRange(roll,row));
});
test('range comparison rejects count, entropy-face, flags and active/discarded inconsistency',()=>{
    const row=cases.find(r=>r.mode===0&&r.faces[0]===2);
    for(const mutate of [r=>r.dice[0].results[0].count++,r=>r.dice[0].results[0].result++,r=>r.dice[0].results[0].rerolled=false,r=>r.dice[0].results[0].discarded=true]){const roll=serialized(row);mutate(roll);assert.throws(()=>verifyRangeData(roll,row));}
});
