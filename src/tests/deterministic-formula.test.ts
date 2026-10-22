import assert from 'node:assert/strict';
import fixture from '../../tests/fixtures/native-6.0.6/deterministic-formulas.json';
import {deterministicFormula606,qualifiedFormulaBonus606} from '../logic/preparation/deterministic-formula';
for(const row of fixture.cases)assert.equal(deterministicFormula606(row.formula,fixture.bindings),row.expected,row.id);
for(const input of [true,{},[],NaN,Infinity,'@unknown','@prof-1','@constructor','1d20','2**3','2^3','random()','max()','round(1,2)','floor()','Math.floor(2)','(() => 1)()','1;2','1e3+2','1/0','0/0','1 +','(2+3','2,3',')','foo(1)','max(1,)','2 3','('.repeat(34)+'1'+')'.repeat(34),'1+'.repeat(140)+'1'])assert.equal(deterministicFormula606(input,fixture.bindings),null,String(input));
assert.equal(deterministicFormula606('@prof + 2',Object.create({prof:99})),null);
assert.equal(deterministicFormula606('1/3'),1/3);assert.equal(qualifiedFormulaBonus606(1/3),false);assert.equal(qualifiedFormulaBonus606(1.75),true);
assert.equal(deterministicFormula606('1e-3'),null);assert.equal(deterministicFormula606('   '),0);
process.stdout.write('R:26 independently frozen deterministic formulas,grammar/function/reference/input limits PASS\n');
