import test from 'node:test';
import assert from 'node:assert/strict';
import {initiativeRollExpectedTotal} from './lib/initiative-expectations.mjs';
test('native initiative operand order is preserved without regrouping or decimal rounding',()=>{
    assert.equal(initiativeRollExpectedTotal(3,2,14),5.14);
    assert.notEqual(initiativeRollExpectedTotal(3,2,14),3+(2+14/100));
    assert.equal(initiativeRollExpectedTotal(7,2,1001),19.009999999999998);
    assert.notEqual(initiativeRollExpectedTotal(7,2,1001),(100*(7+2)+1001)/100);
    assert.equal(initiativeRollExpectedTotal(7,2,1000000000),10000009);
});
