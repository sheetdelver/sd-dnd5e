import assert from 'node:assert/strict';
import {writeFileSync} from 'node:fs';
import {nativeCommit,sha256} from './lib/native-release.mjs';
import {option} from './lib/toolchain.mjs';
import {filterOracle606 as oracle} from './native-filter-oracle.mjs';
const {box,files,Filter}=oracle,priorGet=box.foundry.utils.getProperty;
const comparisons=['exact','contains','icontains','startswith','istartswith','endswith','iendswith','empty','has','hasany','hasall','subsetof','in','gt','gte','lt','lte'];
assert.deepEqual(Array.from(box.native.comparisonNames).sort(),[...comparisons].sort());
assert.deepEqual(Array.from(box.native.operatorNames).sort(),['AND','NAND','NOT','NOR','OR','XOR'].sort());
const examples={exact:[14,14],contains:[14,'4'],icontains:['Wisdom','wis'],startswith:['skill','sk'],istartswith:['Wisdom','WIS'],endswith:['skill','ill'],iendswith:['Wisdom','DOM'],empty:[[],true],has:[['fire'],'fire'],hasany:[['fire'],['cold','fire']],hasall:[['fire'],['fire']],subsetof:[['fire'],['fire','cold']],in:[14,[12,14]],gt:[14,13],gte:[14,14],lt:[14,15],lte:[14,14]};
box.game={i18n:{lang:'en'}};box.foundry.utils.getProperty=(data,key)=>key.split('.').reduce((value,part)=>value?.[part],data);
const rows=[];
const check=(definition,data)=>new Filter(box.native.parse(JSON.stringify(definition))).check(box.native.parse(JSON.stringify(data)));
try{for(const operation of comparisons){const [operand,literal]=examples[operation],kind=Array.isArray(operand)?'set':typeof operand==='number'?'number':'scalar',definition={k:'value',o:operation,v:literal};
 assert.equal(check(definition,{value:operand}),true,operation);
 rows.push({id:operation,operation,kind,operand,literal,native:true,moduleStatus:operation.startsWith('i')&&operation!=='in'?'unavailable':'ready',decision:operation.startsWith('i')&&operation!=='in'?'Case-insensitive predicates require qualified caller locale;do not assume en or process locale':'Qualified scalar/Set operand and literal profile only;unknown snapshot reads remain unavailable'});
}
// Unsupported native collection traversal cannot be approximated by Set string
// membership. Operator support never authorizes an unavailable snapshot read.
const nested={k:'value',o:'has',v:{k:'score',o:'gte',v:14}};
assert.equal(check(nested,{value:[{score:14}]}),true);
assert.equal(check({k:'value',o:'contains',v:14},{value:14}),true,'Frozen C35 contains(14,14) boundary');
rows.push({id:'nested-has',operation:'has',kind:'unqualified-collection',operand:[{score:14}],literal:{k:'score',o:'gte',v:14},native:true,moduleStatus:'unavailable',decision:'Native Array/object traversal requires an independently initialized collection snapshot;string Set membership is not equivalent'});
}finally{box.foundry.utils.getProperty=priorGet;}
const out=option(process.argv.slice(2),'--write-evidence');if(out)writeFileSync(out,JSON.stringify({nativeCommit,comparisons,operators:Array.from(box.native.operatorNames),cases:rows,sourceHashes:{filter:sha256(files.get('module/filter.mjs')),foundryHelpers:oracle.foundryHelpersSha256},limits:['Actual release Filter/comparison/boolean functions and static Foundry helper types execute on declared initialized scalar/Array snapshots. English locale is explicit for the three native case-insensitive examples,not a module default.','This comparison does not qualify native replacement-data phase/collection/effect caches,all snapshot paths,locale access or installed/native/operator behavior. These remain separate from the predicate vocabulary decision.']},null,2)+'\n');
process.stdout.write('S:17 native comparison/6 operator inventory and18 explicit predicate dispositions PASS\n');
