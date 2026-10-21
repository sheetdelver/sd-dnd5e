import assert from 'node:assert/strict';
import vm from 'node:vm';
import {nativeCommit} from './native-release.mjs';

/** Test-only exact native configuration/localization capture. No game, pack
 * index or native preparation runtime is loaded. English order is explicit. */
export function trainingRegistry(files,english,ts) {
    const configSource=files.get('module/config.mjs'),utilsSource=files.get('module/utils.mjs');
    const config=ts.createSourceFile('config',configSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
    const utils=ts.createSourceFile('utils',utilsSource,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
    const registry=name=>vm.runInNewContext('('+config.statements.find(node=>ts.isExpressionStatement(node)&&node.expression.left?.getText(config)==='DND5E.'+name).expression.right.getText(config)+')');
    const declaration=name=>utils.statements.find(node=>ts.isFunctionDeclaration(node)&&node.name?.text===name).getText(utils).replace(/^export /,'');
    function lookup(obj,key){if(!obj||typeof obj!=='object')return;if(Object.hasOwn(obj,key))return obj[key];for(const prefix of Object.keys(obj).sort((a,b)=>b.length-a.length))if(key.startsWith(prefix+'.')){const value=lookup(obj[prefix],key.slice(prefix.length+1));if(value!==undefined)return value;}}
    const loc=key=>{const value=lookup(english,key);assert.equal(typeof value,'string',key);return value;};
    const names=['armorProficiencies','weaponProficiencies','languages','communicationTypes','weaponMasteries'];
    const data=Object.fromEntries(names.map(name=>[name,registry(name)]));
    const get=(obj,path)=>path.split('.').reduce((v,key)=>v?.[key],obj),set=(obj,path,value)=>{const keys=path.split('.');let cursor=obj;for(const key of keys.slice(0,-1))cursor=cursor[key]??={};cursor[keys.at(-1)]=value;};
    const calls=config.statements.filter(node=>ts.isExpressionStatement(node)&&ts.isCallExpression(node.expression)&&node.expression.expression.getText(config)==='preLocalize'&&names.some(name=>node.expression.arguments[0]?.text===name||node.expression.arguments[0]?.text?.startsWith(name+'.'))).map(node=>node.getText(config));
    const box={CONFIG:{DND5E:data,statusEffects:{}},foundry:{utils:{getProperty:get,setProperty:set,getType:value=>typeof value}},game:{i18n:{lang:'en'}},_loc:loc,console:{error:error=>{throw error;}}};
    vm.runInNewContext(`const _preLocalizationRegistrations={};
${['preLocalize','performPreLocalization','_localizeObject','sortObjectEntries'].map(declaration).join('\n')}
${calls.join('\n')}
performPreLocalization(CONFIG.DND5E);`,box);
    return {nativeCommit,locale:'en',armor:JSON.parse(JSON.stringify(data.armorProficiencies)),weapons:JSON.parse(JSON.stringify(data.weaponProficiencies)),languages:JSON.parse(JSON.stringify(data.languages)),communication:JSON.parse(JSON.stringify(data.communicationTypes)),mastery:JSON.parse(JSON.stringify(data.weaponMasteries)),allLanguages:loc('DND5E.Language.All'),
        armorReferences:{...registry('armorIds'),...registry('shieldIds')},weaponReferences:registry('weaponIds'),localizationCalls:calls};
}
