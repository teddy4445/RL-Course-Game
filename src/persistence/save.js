/** Safe, bounded local progress. No account or remote telemetry. */
import {LEVELS} from '../content/levels.js?v=1.6.0';
import {playerControlDefaults,playerControlDefinitions} from '../content/cartridge-controls.js?v=1.6.0';
export const SAVE_KEY='echo-heist-c01-v1';
export function freshSave(){return {schemaVersion:1,completed:[],currentLevel:'L01',prologueSeen:false,cartridges:{},settings:{music:.4,effects:.65,muted:false,reducedMotion:false},updatedAt:null};}
export function validateSave(input){
 if(!input||input.schemaVersion!==1||!Array.isArray(input.completed))throw new Error('This is not a compatible Echo Heist save.');
 const out=freshSave();
 if(input.completed.length>60||input.completed.some(id=>!/^L(?:0[1-9]|[1-5][0-9]|60)$/.test(id)))throw new Error('Invalid mission progress.');
 out.completed=[...new Set(input.completed)].sort();
 // A save is locally editable, but malformed prerequisites should not break the UI.
 if(out.completed.some((id,i)=>id!==`L${String(i+1).padStart(2,'0')}`))throw new Error('Mission progress must be consecutive.');
 if(!/^L(?:0[1-9]|[1-5][0-9]|60)$/.test(input.currentLevel))throw new Error('Invalid current mission.');
 out.currentLevel=input.currentLevel;
 out.prologueSeen=!!input.prologueSeen;
 const st=input.settings??{};
 for(const k of ['music','effects']){if(typeof st[k]!=='number'||!Number.isFinite(st[k])||st[k]<0||st[k]>1)throw new Error('Invalid volume.');out.settings[k]=st[k];}
 for(const k of ['muted','reducedMotion'])out.settings[k]=!!st[k];
 if(input.cartridges&&typeof input.cartridges==='object'&&!Array.isArray(input.cartridges)){
  const entries=Object.entries(input.cartridges);if(entries.length>60)throw new Error('Too many cartridges.');
  for(const [id,c] of entries){
   if(!/^L(?:0[1-9]|[1-5][0-9]|60)$/.test(id)||!c||typeof c!=='object')throw new Error('Invalid cartridge.');
   const level=LEVELS.find(candidate=>candidate.id===id);if(!level)throw new Error('Invalid cartridge level.');
   const controls={},defaults={...playerControlDefaults(level),...level.learning.defaults};for(const [key,defaultValue] of Object.entries(defaults)){
    const definition=playerControlDefinitions(level).find(control=>control.id===key),allowed=definition?.items.map(item=>item[0])??(key==='policy'?level.learning.policies?.map(policy=>policy.id):key==='start'?level.learning.starts?.map(start=>start.id):key==='priority'?['scrap','delivery']:key==='future'?['near','far']:key==='curiosity'?['familiar','curious']:[defaultValue]);
    const selected=c.controls?.[key]??defaultValue;if(!allowed?.includes(selected))throw new Error('Invalid cartridge setting.');controls[key]=selected;
   }
   const contract=c.contract;
   if(contract!==undefined&&contract!==null&&(typeof contract!=='string'||contract.length>1000))throw new Error('Invalid cartridge contract.');
   const allowedCapabilities=level.learning.capabilityPuzzle?.options??[],legacyCapabilities=new Set(['budget-brief','budget-deep']),rawCapabilities=Array.isArray(c.capabilities)?[...new Set(c.capabilities)]:[],capabilities=rawCapabilities.filter(value=>!legacyCapabilities.has(value));
   const capabilityLimit=level.learning.capabilityVersion==='relay-sockets-v1'?Math.max(1,allowedCapabilities.length):1;
   if(rawCapabilities.some(value=>typeof value!=='string')||capabilities.length>capabilityLimit||capabilities.some(value=>!allowedCapabilities.includes(value)))throw new Error('Invalid physical capability cartridge.');
   const capabilityData=capabilities.length?{capabilities}:{};
   const stageCount=Math.max(1,level.task.echoStages?.length??0),preparedStage=Number.isInteger(c.preparedStage)&&c.preparedStage>=0&&c.preparedStage<stageCount?c.preparedStage:null,prepared=preparedStage===null?{}:{preparedStage};
   const sourceStats=c.stats,savedStats=sourceStats&&typeof sourceStats==='object'&&typeof sourceStats.outcome==='string'&&Number.isFinite(sourceStats.steps)?{outcome:sourceStats.outcome.slice(0,80),steps:Math.max(0,Math.min(sourceStats.steps,1e6)),...(Number.isFinite(sourceStats.successProbability)?{successProbability:Math.max(0,Math.min(1,sourceStats.successProbability))}:{}),...(Number.isFinite(sourceStats.validationTrials)?{validationTrials:Math.max(0,Math.min(1000,Math.round(sourceStats.validationTrials)))}:{}),...(Number.isFinite(sourceStats.validationDeliveries)?{validationDeliveries:Math.max(0,Math.min(1000,Math.round(sourceStats.validationDeliveries))) }:{})}:null;
   if(['q-learning','sarsa'].includes(level.learning.mode)){
    const q={};const rows=Object.entries(c.q??{});if(rows.length>12000)throw new Error('Cartridge exceeds size limit.');
    for(const [key,row] of rows){
     if(typeof key!=='string'||key.length>180||['__proto__','prototype','constructor'].includes(key)||!/^[0-9a-zA-Z_,.\-]+$/.test(key)||!Array.isArray(row)||row.length!==6||row.some(v=>!Number.isFinite(v)||Math.abs(v)>1e6))throw new Error('Invalid policy data.');q[key]=[...row];
    }
    out.cartridges[id]={controls,q,stats:savedStats,episodes:Number.isFinite(c.episodes)?Math.max(0,Math.min(c.episodes,1e8)):0,revision:1,...capabilityData,...prepared,...(contract?{contract}:{})};
   }else if(['linear-sarsa','dyna-q','reinforce','reinforce-baseline','actor-critic','dqn','behavioral-cloning'].includes(level.learning.mode)){
    const source=c.snapshot,finiteVector=(row,size,max=100)=>Array.isArray(row)&&row.length===size&&row.every(value=>Number.isFinite(value)&&Math.abs(value)<=max);let snapshot=null,demonstrations=[];
    if(source!==undefined&&source!==null){
     if(typeof source!=='object'||source.algorithm!==level.learning.mode||!Number.isInteger(source.episodes)||source.episodes<0||source.episodes>1e8)throw new Error('Invalid advanced cartridge.');
     if(level.learning.mode==='linear-sarsa'){
      const dimensions=Number(source.dimensions);if(!Number.isInteger(dimensions)||dimensions<4||dimensions>64||typeof source.encoder!=='string'||!Array.isArray(source.weights)||source.weights.length!==6||!source.weights.every(row=>finiteVector(row,dimensions)))throw new Error('Invalid linear cartridge.');
      snapshot={algorithm:'linear-sarsa',encoder:source.encoder,dimensions,weights:source.weights.map(row=>[...row]),episodes:source.episodes,transitions:Math.max(0,Math.min(Number(source.transitions)||0,1e9))};
     }else if(level.learning.mode==='dyna-q'){
      const q={},qRows=Object.entries(source.q??{});if(qRows.length>12000)throw new Error('Dyna values exceed size limit.');
      for(const [key,row] of qRows){if(typeof key!=='string'||key.length>180||!finiteVector(row,6,1e6))throw new Error('Invalid Dyna value.');q[key]=[...row];}
      const model={},pairs=Object.entries(source.model??{});if(pairs.length>3000)throw new Error('Dyna model exceeds size limit.');
      for(const [key,pair] of pairs){if(typeof key!=='string'||key.length>190||!pair||typeof pair!=='object'||typeof pair.stateKey!=='string'||pair.stateKey.length>180||!Number.isInteger(pair.action)||pair.action<0||pair.action>5)throw new Error('Invalid Dyna model pair.');const outcomes={};let total=0,rows=Object.entries(pair.outcomes??{});if(!rows.length||rows.length>24)throw new Error('Invalid Dyna outcomes.');for(const [outcomeKey,outcome] of rows){if(typeof outcomeKey!=='string'||outcomeKey.length>190||!outcome||typeof outcome.nextKey!=='string'||outcome.nextKey.length>180||typeof outcome.terminal!=='boolean'||!Number.isInteger(outcome.count)||outcome.count<1||outcome.count>1e8||!Number.isFinite(outcome.rewardMean)||Math.abs(outcome.rewardMean)>1e6)throw new Error('Invalid Dyna outcome.');outcomes[outcomeKey]={nextKey:outcome.nextKey,terminal:outcome.terminal,count:outcome.count,rewardMean:outcome.rewardMean};total+=outcome.count;}model[key]={stateKey:pair.stateKey,action:pair.action,outcomes,total};}
      snapshot={algorithm:'dyna-q',environmentRevision:String(source.environmentRevision??'base').slice(0,80),q,model,modelKeys:Object.keys(model),episodes:source.episodes,realTransitions:Math.max(0,Math.min(Number(source.realTransitions)||0,1e9)),planningUpdates:Math.max(0,Math.min(Number(source.planningUpdates)||0,1e10))};
     }else if(['reinforce','reinforce-baseline','actor-critic'].includes(level.learning.mode)){
      const dimensions=Number(source.dimensions);if(!Number.isInteger(dimensions)||dimensions<4||dimensions>64||typeof source.encoder!=='string'||!Array.isArray(source.actor)||source.actor.length!==6||!source.actor.every(row=>finiteVector(row,dimensions,30))||!finiteVector(source.critic,dimensions))throw new Error('Invalid policy-gradient cartridge.');
      snapshot={algorithm:source.algorithm,encoder:source.encoder,dimensions,actor:source.actor.map(row=>[...row]),critic:[...source.critic],episodes:source.episodes,transitions:Math.max(0,Math.min(Number(source.transitions)||0,1e9)),actorUpdates:Math.max(0,Math.min(Number(source.actorUpdates)||0,1e9)),criticUpdates:Math.max(0,Math.min(Number(source.criticUpdates)||0,1e9)),policyRevision:Math.max(0,Math.min(Number(source.policyRevision)||0,1e9))};
     }else{
      const dimensions=Number(source.dimensions),network=value=>{if(!value||value.schemaVersion!==1||value.inputSize!==dimensions||value.outputSize!==6||!Number.isInteger(value.hiddenSize)||value.hiddenSize<1||value.hiddenSize>64||!finiteVector(value.w1,dimensions*value.hiddenSize,1e4)||!finiteVector(value.b1,value.hiddenSize,1e4)||!finiteVector(value.w2,value.hiddenSize*6,1e4)||!finiteVector(value.b2,6,1e4))throw new Error('Invalid neural network cartridge.');return {schemaVersion:1,inputSize:dimensions,hiddenSize:value.hiddenSize,outputSize:6,w1:[...value.w1],b1:[...value.b1],w2:[...value.w2],b2:[...value.b2]};};
      if(!Number.isInteger(dimensions)||dimensions<4||dimensions>64||typeof source.encoder!=='string')throw new Error('Invalid neural cartridge dimensions.');
      if(level.learning.mode==='dqn'){
       const online=network(source.online),target=network(source.target),adam={step:Math.max(0,Math.min(Number(source.adam?.step)||0,1e9)),m:{},v:{}};
       for(const side of ['m','v'])for(const key of ['w1','b1','w2','b2']){if(!finiteVector(source.adam?.[side]?.[key],online[key].length,1e8))throw new Error('Invalid optimizer checkpoint.');adam[side][key]=[...source.adam[side][key]];}
       const replay=[];if(!Array.isArray(source.replay)||source.replay.length>(level.learning.replayCap??256))throw new Error('Invalid replay buffer.');for(const item of source.replay){if(!item||!finiteVector(item.input,dimensions,10)||!finiteVector(item.nextInput,dimensions,10)||!Number.isInteger(item.action)||item.action<0||item.action>5||!Number.isFinite(item.reward)||Math.abs(item.reward)>1e6||typeof item.terminal!=='boolean')throw new Error('Invalid replay transition.');replay.push({input:[...item.input],action:item.action,reward:item.reward,nextInput:[...item.nextInput],terminal:item.terminal});}
       snapshot={algorithm:'dqn',encoder:source.encoder,dimensions,online,target,adam,replay,episodes:source.episodes,realTransitions:Math.max(0,Math.min(Number(source.realTransitions)||0,1e9)),optimizerUpdates:Math.max(0,Math.min(Number(source.optimizerUpdates)||0,1e9)),targetCopies:Math.max(0,Math.min(Number(source.targetCopies)||0,1e9)),rngState:Number.isInteger(source.rngState)?source.rngState>>>0:null};
      }else snapshot={algorithm:'behavioral-cloning',encoder:source.encoder,dimensions,model:network(source.model),epochs:Math.max(0,Math.min(Number(source.epochs)||0,1e5)),updates:Math.max(0,Math.min(Number(source.updates)||0,1e9)),examples:Math.max(0,Math.min(Number(source.examples)||0,1e6)),episodes:source.episodes,loss:Number.isFinite(source.loss)?Math.max(0,Math.min(source.loss,1e6)):null};
     }
    }
    if(level.learning.mode==='behavioral-cloning'){
     const rows=c.demonstrations??[];if(!Array.isArray(rows)||rows.length>(level.learning.maxExamples??512))throw new Error('Invalid demonstration dataset.');const dimensions=snapshot?.dimensions??(Number(rows[0]?.input?.length)||0);
     for(const example of rows){if(!example||!finiteVector(example.input,dimensions,10)||!Number.isInteger(example.action)||example.action<0||example.action>5||typeof example.episodeId!=='string'||example.episodeId.length>120)throw new Error('Invalid demonstration example.');demonstrations.push({input:[...example.input],action:example.action,episodeId:example.episodeId});}
    }
    out.cartridges[id]={controls,snapshot,stats:savedStats,episodes:snapshot?.episodes??0,...(level.learning.mode==='behavioral-cloning'?{demonstrations}:{}),revision:1,...capabilityData,...prepared,...(contract?{contract}:{})};
   }else if(level.learning.mode==='prediction'){
    const prediction=c.prediction;
    if(prediction!==undefined&&prediction!==null){
     if(typeof prediction!=='object'||!['mc','td','trace'].includes(prediction.algorithm)||typeof prediction.policyHash!=='string')throw new Error('Invalid prediction snapshot.');
     const values={},counts={},valueRows=Object.entries(prediction.values??{}),countRows=Object.entries(prediction.counts??{});if(valueRows.length>20000||countRows.length>20000)throw new Error('Prediction snapshot exceeds size limit.');
     for(const [key,value] of valueRows){if(typeof key!=='string'||key.length>180||!Number.isFinite(value)||Math.abs(value)>1e6)throw new Error('Invalid prediction value.');values[key]=value;}
     for(const [key,value] of countRows){if(typeof key!=='string'||key.length>180||!Number.isInteger(value)||value<0||value>1e8)throw new Error('Invalid prediction count.');counts[key]=value;}
     out.cartridges[id]={controls,prediction:{algorithm:prediction.algorithm,values,counts,episodes:Math.max(0,Math.min(Number(prediction.episodes)||0,1e8)),completedEpisodes:Math.max(0,Math.min(Number(prediction.completedEpisodes)||0,1e8)),transitions:Math.max(0,Math.min(Number(prediction.transitions)||0,1e9)),policyHash:prediction.policyHash},stats:savedStats,episodes:Number.isFinite(c.episodes)?Math.max(0,Math.min(c.episodes,1e8)):0,revision:1,...capabilityData,...prepared,...(contract?{contract}:{})};
    }else out.cartridges[id]={controls,prediction:null,stats:savedStats,episodes:0,revision:1,...capabilityData,...prepared,...(contract?{contract}:{})};
   }else{
    const evaluation=c.evaluation;if(evaluation!==undefined&&evaluation!==null&&(typeof evaluation!=='object'||typeof evaluation.policyHash!=='string'||evaluation.policyHash.length>32||['startValue','successProbability','stateCount','sweeps'].some(key=>!Number.isFinite(evaluation[key]))))throw new Error('Invalid evaluation snapshot.');
    let policy=null;if(evaluation?.policy){const entries=Object.entries(evaluation.policy);if(entries.length>5000)throw new Error('Planned policy exceeds size limit.');policy={};for(const [key,action] of entries){if(typeof key!=='string'||key.length>1000||!Number.isInteger(action)||action<0||action>5)throw new Error('Invalid planned policy.');policy[key]=action;}}
    out.cartridges[id]={controls,evaluation:evaluation?{policyHash:evaluation.policyHash,startValue:evaluation.startValue,successProbability:evaluation.successProbability,stateCount:evaluation.stateCount,sweeps:evaluation.sweeps,...(typeof evaluation.algorithm==='string'?{algorithm:evaluation.algorithm}:{}),...(Number.isFinite(evaluation.iterations)?{iterations:evaluation.iterations}:{}),...(evaluation.policy?{policy}: {})}:null,stats:savedStats,revision:1,...capabilityData,...prepared,...(contract?{contract}:{})};
   }
  }
 }
 out.updatedAt=typeof input.updatedAt==='string'?input.updatedAt:null;return out;
}
export function parseSave(text){if(text.length>6000000)throw new Error('Save is too large.');return validateSave(JSON.parse(text));}
export function loadSave(storage){
 try{const raw=storage.getItem(SAVE_KEY);return {save:raw?parseSave(raw):freshSave(),warning:null};}
 catch{return {save:freshSave(),warning:'The saved data could not be read. It was left untouched; a temporary new session has opened.'};}
}
export function storeSave(storage,save){
 const clean=validateSave(save);clean.updatedAt=new Date().toISOString();
 storage.setItem(SAVE_KEY,JSON.stringify(clean));return clean;
}
