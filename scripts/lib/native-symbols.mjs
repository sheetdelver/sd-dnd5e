import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {join} from 'node:path';
import {nativeCommit} from './native-release.mjs';
/** Inert targeted source reader. Importing this helper runs no oracle suites. */
export function nativeSymbols606(core,repo){
 const ts=createRequire(join(core,'package.json'))('typescript');
 const actual=execFileSync('git',['-C',repo,'rev-parse','release-6.0.6^{commit}'],{encoding:'utf8'}).trim();
 if(actual!==nativeCommit)throw Error('Unexpected native release '+actual);
 const sources=new Map();
 const source=path=>{if(!sources.has(path))sources.set(path,execFileSync('git',['-C',repo,'show',nativeCommit+':'+path],{encoding:'utf8',maxBuffer:8e6}));return sources.get(path);};
 function member(text,cls,key){const ast=ts.createSourceFile(cls,text,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS),node=ast.statements.find(n=>ts.isClassDeclaration(n)&&n.name?.text===cls)?.members.find(n=>n.name?.getText(ast)===key);if(!node)throw Error('Missing '+cls+'.'+key);return node.getText(ast);}
 return {source,member,native:(path,cls,key)=>member(source(path),cls,key),sources};
}
