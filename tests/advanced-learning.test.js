import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/content/levels.js';
import {configuration,createEpisode,findEntity} from '../src/sim/core.js';
import {featureVector,trainLinearBatch,evaluateLinear} from '../src/agents/feature-control.js';
import {trainDynaBatch,evaluateDyna,empiricalProbability} from '../src/agents/dyna-q.js';
import {stableSoftmax,reinforceGradient,trainPolicyBatch,evaluatePolicyGradient} from '../src/agents/policy-gradient.js';

const byId=id=>LEVELS.find(level=>level.id===id);

test('Cargo-blind features genuinely alias the same tile before and after pickup',()=>{
 const level=byId('L27'),blind=configuration(level,{encoder:'missing-cargo'}),full=configuration(level,{encoder:'relational'}),before=createEpisode(level,{practice:true,config:blind});
 before.echo={...before.echo,x:11,y:5};const after=structuredClone(before);after.echo.cargo='detailKey';findEntity(after,'detailKey').taken=true;
 assert.deepEqual(featureVector(level,blind,before),featureVector(level,blind,after));
 assert.notDeepEqual(featureVector(level,full,before),featureVector(level,full,after));
});

test('Linear semi-gradient SARSA updates weights through real shared transitions',()=>{
 const level=byId('L26'),required=level.learning.capabilityPuzzle.required,config=configuration(level,{capabilities:[required]}),trained=trainLinearBatch(level,config,{episodes:level.learning.episodesPerBatch,seed:level.seeds.root});
 assert.ok(trained.snapshot.weights.some(row=>row.some(value=>value!==0)));
 assert.ok(trained.snapshot.transitions>0&&trained.snapshot.transitions<=level.learning.episodesPerBatch*level.task.administrativeRolloutLimit);
 assert.equal(evaluateLinear(level,config,trained.snapshot,{seed:level.seeds.root+900000}).outcome,'delivered');
});

test('Dyna planning samples only observed empirical state-action outcomes',()=>{
 const level=byId('L33'),config=configuration(level),trained=trainDynaBatch(level,config,{episodes:3,seed:level.seeds.root});
 assert.ok(trained.realTransitions>0);assert.ok(trained.planningUpdates>trained.realTransitions);assert.ok(trained.modelPairs<=trained.realTransitions);
 const pair=trained.snapshot.model[trained.snapshot.modelKeys[0]],outcome=Object.values(pair.outcomes)[0];
 assert.equal(empiricalProbability(trained.snapshot,pair.stateKey,pair.action,outcome.nextKey,outcome.terminal),outcome.count/pair.total);
 assert.equal(Object.keys(trained.snapshot.model).length,trained.snapshot.modelKeys.length);
});

test('Dyna revision memory rules explicitly retain, forget, or reset experience',()=>{
 const level=byId('L34'),oldConfig=configuration(level,{machineRevision:'old',memory:'retain'}),old=trainDynaBatch(level,oldConfig,{episodes:4,seed:level.seeds.root}).snapshot;
 const retained=trainDynaBatch(level,configuration(level,{machineRevision:'new',memory:'retain'}),{snapshot:old,episodes:0,seed:1}).snapshot;
 const recent=trainDynaBatch(level,configuration(level,{machineRevision:'new',memory:'recent'}),{snapshot:old,episodes:0,seed:1}).snapshot;
 const reset=trainDynaBatch(level,configuration(level,{machineRevision:'new',memory:'reset'}),{snapshot:old,episodes:0,seed:1}).snapshot;
 assert.equal(retained.modelKeys.length,old.modelKeys.length);assert.equal(recent.modelKeys.length,0);assert.ok(Object.keys(recent.q).length>0);assert.equal(reset.modelKeys.length,0);assert.equal(Object.keys(reset.q).length,0);
});

test('Stable softmax and policy gradient remain finite and normalized',()=>{
 const probabilities=stableSoftmax([1000,999,-1000]);assert.ok(probabilities.every(Number.isFinite));assert.ok(Math.abs(probabilities.reduce((a,b)=>a+b,0)-1)<1e-12);
 const gradient=reinforceGradient([.2,.3,.5],1,2);assert.ok(gradient[1]>0);assert.ok(gradient[0]<0&&gradient[2]<0);assert.ok(Math.abs(gradient.reduce((a,b)=>a+b,0))<1e-12);
});

test('Policy-gradient evaluation freezes separate actor and critic parameters',()=>{
 const level=byId('L39'),required=level.learning.capabilityPuzzle.required,config=configuration(level,{capabilities:[required]}),trained=trainPolicyBatch(level,config,{episodes:level.learning.episodesPerBatch,seed:level.seeds.root}),before=JSON.stringify(trained.snapshot);
 assert.ok(trained.snapshot.actorUpdates>0&&trained.snapshot.criticUpdates>0);assert.notDeepEqual(trained.snapshot.actor[0],trained.snapshot.critic);
 assert.equal(evaluatePolicyGradient(level,config,trained.snapshot,{seed:level.seeds.root+900000}).outcome,'delivered');assert.equal(JSON.stringify(trained.snapshot),before);
});

test('Every Chapter 6-8 source recipe stays within its real-transition budget and delivers',()=>{
 for(const level of LEVELS.slice(25,40)){
  const required=level.learning.capabilityPuzzle.required,config=configuration(level,{capabilities:[required]}),linear=level.chapterId==='C06',dyna=level.chapterId==='C07';
  const trained=linear?trainLinearBatch(level,config,{episodes:level.learning.episodesPerBatch,seed:level.seeds.root}):dyna?trainDynaBatch(level,config,{episodes:level.learning.episodesPerBatch,seed:level.seeds.root}):trainPolicyBatch(level,config,{episodes:level.learning.episodesPerBatch,seed:level.seeds.root});
  const real=trained.snapshot.realTransitions??trained.snapshot.transitions,cap=level.learning.episodesPerBatch*level.task.administrativeRolloutLimit;assert.ok(real<=cap,`${level.id} used ${real}/${cap} real transitions`);
  const evaluation=linear?evaluateLinear(level,config,trained.snapshot,{seed:level.seeds.root+900000}):dyna?evaluateDyna(level,config,trained.snapshot,{seed:level.seeds.root+900000}):evaluatePolicyGradient(level,config,trained.snapshot,{seed:level.seeds.root+900000});
  assert.equal(evaluation.outcome,'delivered',`${level.id} source recipe did not deliver`);
 }
});
