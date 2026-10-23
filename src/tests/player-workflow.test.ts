import assert from 'node:assert/strict';
import {DnD5eAdapter} from '../logic/adapter';
import {playerCorpus} from './fixtures/player-corpus';
import {preparationIssues} from '../ui/preparationIssues';
const adapter=new DnD5eAdapter();
for(const row of playerCorpus()){
 const before=structuredClone(row.source),actor=adapter.prepareActorData(row.source,row.context);
 assert.equal(adapter.getRollData(actor,'skill','prc')?.formula??null,row.formula,row.id);assert.deepEqual(row.source,before);
 if(row.id==='local-unavailable'){
  assert.equal(actor.derived.level,1);assert.equal((actor.derived.hp as any).value,7);
  assert.ok(preparationIssues(actor).some(issue=>issue.sources.some(s=>s.includes('UnknownCounter'))));
 }
 if(row.id==='unknown-mechanics')assert.ok(preparationIssues(actor).some(issue=>issue.sources.some(s=>s.includes('MigratedFocus'))));
 if(row.id==='unqualified-version')assert.equal(preparationIssues(actor).length,1);
}
process.stdout.write('Representative player corpus: checks, isolated unavailability, attribution and source preservation PASS\n');
