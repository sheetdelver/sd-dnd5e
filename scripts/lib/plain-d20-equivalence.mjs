import assert from 'node:assert/strict';

/** Qualification oracle for homogeneous plain d20 only. Never edits a record. */
export function verifyPlainD20(serialized, row) {
    assert.equal(serialized.class,'Roll'); assert.equal(serialized.evaluated,true);
    assert.equal(serialized.total,row.expected); assert.equal(serialized.formula,row.formula);
    assert.ok([-1,0,1].includes(row.mode));
    assert.equal(row.faces.length,row.mode===0?1:2);
    assert.ok(row.faces.every(face=>Number.isInteger(face)&&face>=1&&face<=20));
    assert.deepEqual(serialized.options,{});
    assert.ok(serialized.terms.every(term=>['Die','NumericTerm','OperatorTerm'].includes(term.class)),'No groups or special terms');
    const dice=[...serialized.terms.filter(term=>term.class==='Die'),...serialized.dice];
    assert.equal(dice.length,1,'One homogeneous die term'); const die=dice[0];
    assert.equal(die.class,'Die'); assert.equal(die.faces,20); assert.equal(die.number,row.faces.length);
    assert.deepEqual(die.options,{});
    assert.deepEqual(die.modifiers,row.mode===0?[]:[row.mode===1?'kh1':'kl1']);
    assert.deepEqual(die.results.map(result=>result.result),row.faces);
    for(const result of die.results) {
        assert.ok(Object.keys(result).every(key=>['result','active','discarded'].includes(key)),'No distinguishable per-die metadata');
        assert.equal(typeof result.active,'boolean');
        if(result.active) assert.notEqual(result.discarded,true);
        else assert.equal(result.discarded,true);
    }
    const kept=die.results.flatMap((result,index)=>result.active?[index]:[]);
    assert.equal(kept.length,1);
    const selected=row.mode===1?Math.max(...row.faces):row.mode===-1?Math.min(...row.faces):row.faces[0];
    assert.equal(die.results[kept[0]].result,selected);
    const expectedIndex=row.faces.indexOf(selected);
    if(kept[0]===expectedIndex) return null;
    assert.equal(row.faces.length,2); assert.equal(row.faces[0],row.faces[1],'Unequal pairs require exact identity');
    return {formula:row.formula,faces:row.faces,expectedKept:[expectedIndex],observedKept:kept};
}
