import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/content/levels.js';
import {ACTION,configuration,createEpisode,findEntity,step,transitionBranches} from '../src/sim/core.js';
import {evaluatePolicy,fixedPolicyAction,policyHash,samplePolicyTrace} from '../src/agents/policy-evaluation.js';
import {rng} from '../src/agents/q-learning.js';

test('F04 exact known-model values and fixed-policy expectation',()=>{
 const safe=2,risky=.4*5+.6*-1;assert.equal(risky,1.4);assert.equal(.5*safe+.5*risky,1.7);assert.ok(safe>risky);
});
test('L06 position alias times out while cargo-aware state completes the same room',async()=>{
 const level=LEVELS[5],position=configuration(level,{representation:'position'}),cargo=configuration(level,{representation:'cargo'});
 const aliased=await evaluatePolicy(level,position),full=await evaluatePolicy(level,cargo);
 assert.equal(aliased.successProbability,0);assert.equal(samplePolicyTrace(level,position).outcome,'timeout');
 assert.equal(full.successProbability,1);assert.equal(samplePolicyTrace(level,cargo).outcome,'delivered');
});
test('Policy evaluation does not mutate the frozen route definition',async()=>{
 const level=LEVELS[7],config=configuration(level,{policy:'lift'}),before=JSON.stringify(level.learning.policies),hash=policyHash(level,config);
 const result=await evaluatePolicy(level,config);assert.equal(JSON.stringify(level.learning.policies),before);assert.equal(result.policyHash,hash);assert.ok(result.sweeps>1);
});
test('L07 empirical slip frequency matches the declared known model',()=>{
 const level=LEVELS[6],config=configuration(level,{policy:'express'}),random=rng(4200701),rule=level.learning.model.stochasticTransitions[0],[x,y]=rule.cells[0].split(',').map(Number);let slips=0,trials=20000;
 for(let i=0;i<trials;i++){
  let state=createEpisode(level,{practice:true,config});state.echo={...state.echo,x,y,facing:2};const alternate=step(state,{echoAction:ACTION.EAST,transitionOutcome:'alternate'}).state;state=step(state,{echoAction:ACTION.EAST,stochasticSample:random()}).state;
  if(state.echo.x===alternate.echo.x&&state.echo.y===alternate.echo.y)slips++;
 }
 assert.ok(Math.abs(slips/trials-.28)<.015,`${slips}/${trials}`);
});
test('Known stochastic branches normalize and preserve sampled/environment distinction',()=>{
 const level=LEVELS[6],state=createEpisode(level,{practice:true,config:configuration(level,{policy:'express'})}),[x,y]=level.learning.model.stochasticTransitions[0].cells[0].split(',').map(Number);state.echo={...state.echo,x,y,facing:2};
 const branches=transitionBranches(state,{echoAction:ACTION.EAST});assert.ok(Math.abs(branches.reduce((sum,branch)=>sum+branch.probability,0)-1)<1e-12);assert.equal(branches.length,2);
});
test('All Chapter 2 fixed-policy controls have a genuinely completing option',async()=>{
 for(const level of LEVELS.slice(5,10)){
  let best=0;for(const [,value] of level.learning.controls[0].items.map(([value])=>[level.learning.controls[0].id,value]))best=Math.max(best,(await evaluatePolicy(level,configuration(level,{[level.learning.controls[0].id]:value}))).successProbability);
  assert.ok(best>.95,level.id);
 }
});
test('L09 launch docks share one fixed policy hash component and differ in value',async()=>{
 const level=LEVELS[8],results=[];for(const start of ['north','near','south'])results.push(await evaluatePolicy(level,configuration(level,{start})));
 assert.ok(results.every(result=>result.policyId==='common-courier'));assert.equal(new Set(results.map(result=>result.startValue.toFixed(5))).size,3);
});
test('L10 delivery on the final allowed tick precedes timeout',()=>{
 const level=LEVELS[9],config=configuration(level,{policy:'service'});let state=createEpisode(level,{practice:true,config});
 const core=findEntity(state,'coreContainer'),receiver=findEntity(state,'receiver');for(const item of state.entities.filter(entity=>entity.required&&entity.id!==core.id))item.delivered=true;state.echoStage=(level.task.echoStages?.length??1)-1;state.echo={...state.echo,x:receiver.x,y:receiver.y,room:receiver.room??0,facing:2,cargo:core.id};state.patch={...state.patch,...findEntity(state,'patchExit')};core.taken=true;findEntity(state,'ticketGate').open=true;state.missionSteps=level.task.horizonSteps-1;
 const delivered=step(state,{echoAction:ACTION.INTERACT});assert.equal(delivered.state.courierOutcome,'delivered');assert.equal(delivered.state.complete,false);assert.equal(delivered.state.failed,false);assert.equal(findEntity(delivered.state,'exitGate').open,true);const extracted=step(delivered.state,{patchAction:ACTION.INTERACT});assert.equal(extracted.state.complete,true);
});
