import assert from 'node:assert/strict';
import {test} from 'node:test';
import {verifyPlainD20} from './lib/plain-d20-equivalence.mjs';
const row={formula:'2d20kh1+5',faces:[10,10],expected:15,mode:1};
const record=()=>({class:'Roll',evaluated:true,total:15,formula:row.formula,options:{},dice:[],terms:[{class:'Die',faces:20,number:2,modifiers:['kh1'],options:{},results:[{result:10,active:false,discarded:true},{result:10,active:true}]}]});
test('plain equal d20 identity is diagnostic; host bytes remain unchanged',()=>{
    const roll=record(), bytes=JSON.stringify(roll);
    assert.deepEqual(verifyPlainD20(roll,row)?.observedKept,[1]);assert.equal(JSON.stringify(roll),bytes);
});
test('wrong value/count, faces, flags, metadata, groups, modifiers and totals are rejected',()=>{
    const corrupt=[r=>r.total++,r=>r.terms[0].results[0].result=9,r=>r.terms[0].results[0].active=true,
        r=>delete r.terms[0].results[0].discarded,r=>r.terms[0].results[1].discarded=true,
        r=>r.terms[0].results[0].flavor='distinguishable',r=>r.terms.push({class:'PoolTerm'}),
        r=>r.terms[0].modifiers.push('r1'),r=>r.terms[0].faces=6];
    for(const change of corrupt){const roll=record();change(roll);assert.throws(()=>verifyPlainD20(roll,row));}
    const unequal=record();unequal.terms[0].results[0].result=18;
    assert.throws(()=>verifyPlainD20(unequal,{...row,faces:[18,10],expected:15}));
});
