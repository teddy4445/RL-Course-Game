import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/content/levels.js';
import {configuration} from '../src/sim/core.js';
import {updateSarsa,trainBatch,evaluate} from '../src/agents/q-learning.js';
import {planKnownModel,samplePolicyTrace,policyHash} from '../src/agents/policy-evaluation.js';
import {firstVisitMc,tdZero,tdLambda,predictionBatch,evaluatePrediction} from '../src/agents/prediction.js';

test('F02 SARSA uses the actually sampled next action',()=>{
 const q={s:[0,0,2,0,0,0],next:[4,1,0,0,0,0]};
 updateSarsa(q,'s',2,1,'next',1,false,.5,.9);assert.equal(q.s[2],1.95);
});

test('F03 first-visit MC updates a repeated state once with its first return',()=>{
 const snapshot={values:{},counts:{}},trace=[{stateKey:'A',reward:1},{stateKey:'A',reward:4}];
 firstVisitMc(snapshot,trace,.5);assert.equal(snapshot.values.A,3);assert.equal(snapshot.counts.A,1);
});

test('TD(lambda=0) matches TD(0) transition by transition',()=>{
 const trace=[{stateKey:'A',nextKey:'B',reward:1,terminated:false},{stateKey:'B',nextKey:'T',reward:4,terminated:true}],a={values:{},counts:{}},b={values:{},counts:{}};
 tdZero(a,trace,{alpha:.2,gamma:.9});tdLambda(b,trace,{alpha:.2,gamma:.9,lambda:0});assert.deepEqual(b,a);
});

test('Chapter 3 policy iteration and value iteration dispatch actual computed policies',async()=>{
 for(const level of [LEVELS[11],LEVELS[12],LEVELS[14]]){
  const config=configuration(level),planned=await planKnownModel(level,config),sample=samplePolicyTrace(level,config,{snapshot:planned,seed:level.seeds.root});
  assert.equal(planned.converged,true,level.id);assert.equal(planned.policyHash,policyHash(level,config));assert.ok(planned.stateCount>0);assert.ok(Object.keys(planned.policy).length>0);assert.equal(sample.outcome,'delivered',level.id);
 }
});

test('Chapter 4 recorders change values but never the fixed policy hash',()=>{
 for(const level of LEVELS.slice(15,20)){
  const config=configuration(level),before=JSON.stringify(level.learning.policies),out=predictionBatch(level,config,{episodes:level.learning.episodesPerBatch,seed:level.seeds.root}),sample=evaluatePrediction(level,config,out.snapshot,{seed:level.seeds.root+900000});
  assert.equal(out.snapshot.policyHash,policyHash(level,config));assert.equal(JSON.stringify(level.learning.policies),before);assert.ok(out.snapshot.transitions>0);assert.equal(sample.outcome,'delivered',level.id);
 }
});

test('Chapter 5 Q-learning and SARSA use real bounded transitions and frozen evaluation',()=>{
 for(const level of LEVELS.slice(20,25)){
  const required=level.learning.capabilityPuzzle.required,config=configuration(level,{capabilities:[required]}),trained=trainBatch(level,config,{episodes:level.learning.episodesPerBatch,seed:level.seeds.root}),before=JSON.stringify(trained.q),sample=evaluate(level,config,trained.q,{seed:level.seeds.root+900000,cap:level.task.administrativeRolloutLimit});
  assert.ok(trained.transitions<=level.learning.episodesPerBatch*level.task.administrativeRolloutLimit,`${level.id}: ${trained.transitions}`);assert.equal(sample.outcome,'delivered',level.id);assert.equal(JSON.stringify(trained.q),before,'frozen evaluation mutated the learner');
 }
});
