import {join,relative,resolve} from 'node:path';
/** Inert collection policy; selection never imports/runs a rules oracle. */
export function selectRegressions(root,all,args){
 const selected=[];for(let i=0;i<args.length;i++)if(args[i]==='--test'){
  if(!args[i+1]||args[i+1].startsWith('--'))throw Error('--test requires a maintained module test path');selected.push(resolve(root,args[++i]));
 }
 if(args.includes('--smoke')&&selected.length)throw Error('Choose smoke or explicit affected tests');
 if(args.includes('--affected')&&!selected.length)throw Error('Affected checks require at least one --test path');
 const smoke=['player-workflow','effect-metadata','presentation','skill-review','rules-context','command-journal'].map(name=>join(root,'src/tests',name+'.test.ts'));
 const layer=args.includes('--smoke')?'smoke':selected.length?'affected':'deep';
 const tests=layer==='smoke'?smoke:layer==='affected'?[...new Set(selected)]:all;
 if(!tests.length||tests.some(path=>!all.includes(path)))throw Error('Selected test is not a maintained module regression');
 return {layer,tests,paths:tests.map(path=>relative(root,path)),tooling:layer==='deep'};
}
