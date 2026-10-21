import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
// Independent test-only tables. Runtime module code must never import this file.
export const rangeFixture=JSON.parse(readFileSync(new URL('../../tests/fixtures/native-6.0.6/d20-ranges.json',import.meta.url),'utf8'));
export function expectedRange(row,faces,mode){
    const selected=mode===1?Math.max(...faces):mode===-1?Math.min(...faces):faces[0],kept=faces.indexOf(selected);
    const results=faces.map((result,index)=>{
        const bounded=row.minimum!==null&&result<row.minimum||row.maximum!==null&&result>row.maximum;
        return {result,active:index===kept,...(index!==kept?{discarded:true}:{}),...(bounded?{count:row.contributions[result-1],rerolled:true}:{})};
    });
    return {kept,results,total:row.contributions[selected-1]+5};
}
export function rangeCases(){
    const cases=[];
    for(const row of rangeFixture.ranges)for(const mode of [0,1,-1])for(let a=1;a<=20;a++)for(let b=1;b<=(mode===0?1:20);b++){
        const faces=mode===0?[a]:[a,b],range=(row.minimum===null?'':`min${row.minimum}`)+(row.maximum===null?'':`max${row.maximum}`);
        cases.push({id:row.id,minimum:row.minimum,maximum:row.maximum,mode,faces,formula:`${mode===1?'2d20kh1':mode===-1?'2d20kl1':'1d20'}${range}+5`,...expectedRange(row,faces,mode)});
    }
    return cases;
}
/** Every nullable1–20 source range, normal mode, complete face distributions. */
export function normalRangeMatrix(){
    const cases=[],bounds=[null,...Array.from({length:20},(_,i)=>i+1)];
    for(const minimum of bounds)for(const maximum of bounds){
        const row={minimum,maximum,contributions:Array.from({length:20},(_,i)=>{
            const face=i+1;let contribution=minimum!==null&&face<minimum?minimum:face;
            if(maximum!==null&&face>maximum)contribution=maximum;return contribution;
        })};
        const range=(minimum===null?'':`min${minimum}`)+(maximum===null?'':`max${maximum}`);
        for(let face=1;face<=20;face++)cases.push({id:`normal-${minimum}-${maximum}`,minimum,maximum,mode:0,faces:[face],formula:`1d20${range}+5`,...expectedRange(row,[face],0)});
    }
    return cases;
}
/** Exact bounded profile, deliberately no equal-value index exception. */
export function verifyRangeData(serialized,row){
    assert.equal(serialized.class,'Roll');assert.equal(serialized.evaluated,true);assert.deepEqual(serialized.options,{});
    assert.ok(serialized.terms.every(term=>['Die','NumericTerm','OperatorTerm'].includes(term.class)));
    assert.equal(serialized.formula,row.formula);assert.equal(serialized.total,row.total);
    const terms=(serialized.terms??[]).filter(term=>term.class==='Die'),dice=terms.length?terms:(serialized.dice??[]).filter(term=>term.class==='Die');assert.equal(dice.length,1);
    const die=dice[0];assert.equal(die.faces,20);assert.equal(die.number,row.faces.length);
    assert.deepEqual(die.options,{});
    assert.deepEqual(die.results.map(r=>r.result),row.faces);
    assert.deepEqual(die.modifiers,[...(row.mode?[row.mode===1?'kh1':'kl1']:[]),...(row.minimum===null?[]:[`min${row.minimum}`]),...(row.maximum===null?[]:[`max${row.maximum}`])]);
    assert.equal(die.results.filter(r=>r.active&&!r.discarded).length,1);
    for(let index=0;index<row.results.length;index++){
        const expected=row.results[index],observed=die.results[index];
        assert.ok(Object.keys(observed).every(key=>['result','active','discarded','count','rerolled'].includes(key)),'Only qualified homogeneous range metadata');
        assert.equal(typeof observed.active,'boolean');
        assert.equal(!!observed.active,!observed.discarded,`active/discarded consistency[${index}]`);
        for(const key of ['rerolled','exploded','success','failure'])assert.equal(!!observed[key],!!expected[key],`${key}[${index}]`);
        assert.equal(observed.count,expected.count,`count[${index}]`);
    }
    return die;
}
export function verifyRangeSelection(die,row){
    for(let index=0;index<row.results.length;index++)for(const key of ['active','discarded'])assert.equal(!!die.results[index][key],!!row.results[index][key],`${key}[${index}]`);
    assert.equal(die.results.findIndex(r=>r.active&&!r.discarded),row.kept,'exact retained identity including equal faces');
}
export function verifyRange(serialized,row){
    verifyRangeSelection(verifyRangeData(serialized,row),row);
}
