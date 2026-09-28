import fs from 'node:fs';
import {LEVELS} from '../src/content/levels.js';
import {configuration,createEpisode,step} from '../src/sim/core.js';
import {trainBatch,evaluate,familiarPrior} from '../src/agents/q-learning.js';
import {evaluatePolicy,planKnownModel,samplePolicyTrace} from '../src/agents/policy-evaluation.js';
import {predictionBatch,evaluatePrediction} from '../src/agents/prediction.js';
import {trainLinearBatch,evaluateLinear} from '../src/agents/feature-control.js';
import {trainDynaBatch,evaluateDyna} from '../src/agents/dyna-q.js';
import {trainPolicyBatch,evaluatePolicyGradient} from '../src/agents/policy-gradient.js';
import {featureVector} from '../src/agents/feature-control.js';
import {trainDqnBatch,evaluateDqn} from '../src/agents/deep-control.js';
import {trainImitation,evaluateImitation} from '../src/agents/imitation.js';
export function workerProtocol(l,c,{seed=l.seeds.root,episodes=1800,q=null}={}){
 q??=familiarPrior(l,c);let transitions=0,deliveries=0;
 for(let completed=0;completed<episodes;completed+=100){const out=trainBatch(l,c,{q,seed:seed+completed*7919,episodes:Math.min(100,episodes-completed)});q=out.q;transitions+=out.transitions;deliveries+=out.deliveries;}
 return {q,transitions,deliveries};
}
const auditConfiguration=(level,controls={})=>{const required=level.learning.capabilityPuzzle?.required;return configuration(level,{...controls,...(required?{capabilities:[required]}:{})});};
function auditPathTo(state,target){
 const stateKey=current=>[current.echo.room??0,current.echo.x,current.echo.y,current.echoTick,current.echoSteps,current.echo.cargo??'-',...current.entities.filter(entity=>entity.kind==='echo-hunter').flatMap(entity=>[entity.x,entity.y,entity.direction])].join(','),queue=[[state,[]]],seen=new Set([stateKey(state)]);
 while(queue.length){
  const [current,path]=queue.shift();if(current.echo.x===target.x&&current.echo.y===target.y)return path;
  for(const action of [0,1,2,3,4]){const next=step(current,{echoAction:action}).state,key=stateKey(next);if(next.failed||next.courierDone||seen.has(key))continue;seen.add(key);queue.push([next,[...path,action]]);}
 }
 throw new Error(`No honest Echo route to ${target.id}.`);
}
function playerFormatAuditLesson(level,config){
 let state=createEpisode(level,{practice:true,config}),examples=[],episodeId=`${level.id}-map-audit-lesson`;
 while(!state.courierDone&&!state.failed){
  const target=state.echo.cargo?state.entities.find(entity=>entity.kind==='socket'&&entity.accepts===state.echo.cargo):state.entities.filter(entity=>entity.field==='echo'&&entity.required&&!entity.taken&&!entity.delivered&&entity.kind!=='core').sort((a,b)=>(a.sequence??99)-(b.sequence??99))[0];
  if(!target)throw new Error(`${level.id} has no next Echo lesson target.`);
  for(const action of [...auditPathTo(state,target),5]){examples.push({input:featureVector(level,config,state),action,episodeId});state=step(state,{echoAction:action}).state;if(state.courierDone||state.failed)break;}
 }
 if(state.courierOutcome!=='delivered')throw new Error(`${level.id} map-derived audit lesson does not deliver.`);
 return examples;
}
if(process.argv[1]?.endsWith('audit-rl.mjs')){
 const cases=[['L01','missing-east',{}],['L01','sunrise-tread',{capabilities:['act-east']}],['L02','missing-east',{priority:'scrap'}],['L02','sunrise-tread',{priority:'delivery',capabilities:['act-east']}],['L03','short-return',{future:'near'}],['L03','long-light',{future:'far',capabilities:['future-far']}],['L04','familiar',{curiosity:'familiar'}],['L04','curiosity-coil',{curiosity:'curious',capabilities:['explore-curious']}],['L05','home-beacon',{capabilities:['reward-delivery']}]];
 const trials=Number(process.env.AUDIT_SEEDS??8),rows=[];
 for(const [id,label,controls] of cases){const l=LEVELS.find(x=>x.id===id),c=configuration(l,controls);
  for(let n=0;n<trials;n++){const seed=l.seeds.root+n*100003,episodes=l.learning.episodesPerBatch,t=performance.now(),o=workerProtocol(l,c,{seed,episodes}),v=evaluate(l,c,o.q,{seed:seed+900000});const row={kind:'q-learning',level:id,condition:label,seed,episodes,transitions:o.transitions,trainingDeliveries:o.deliveries,evaluation:{outcome:v.outcome,actions:v.steps,scrap:v.scrap},elapsedMs:Math.round(performance.now()-t)};rows.push(row);console.log(id,label,seed,v.outcome,v.steps,v.scrap);}
 }
 const planningCases=[['L06','position',{representation:'position'}],['L06','cargo',{representation:'cargo'}],['L07','express',{policy:'express'}],['L07','bypass',{policy:'bypass'}],['L08','lift',{policy:'lift'}],['L08','tunnel',{policy:'tunnel'}],['L09','north',{start:'north'}],['L09','near',{start:'near'}],['L09','south',{start:'south'}],['L10','platform',{policy:'platform'}],['L10','service',{policy:'service'}]];
 for(const [id,label,controls] of planningCases){const l=LEVELS.find(level=>level.id===id),c=configuration(l,controls),t=performance.now(),exact=await evaluatePolicy(l,c),modelElapsedMs=Math.round(performance.now()-t);
  for(let n=0;n<trials;n++){const seed=l.seeds.root+n*100003,sample=samplePolicyTrace(l,c,{seed});const row={kind:'policy-evaluation',level:id,condition:label,seed,model:{states:exact.stateCount,sweeps:exact.sweeps,expectedReturn:exact.startValue,deliveryProbability:exact.successProbability,policyHash:exact.policyHash,elapsedMs:modelElapsedMs},sample:{outcome:sample.outcome,actions:sample.steps,totalReward:sample.totalReward}};rows.push(row);console.log(id,label,seed,sample.outcome,sample.steps,exact.successProbability.toFixed(4));}
 }

 const controlPlans=[['L11',{policy:'repair-turn'}],['L12',{}],['L13',{}],['L14',{modelRevision:'new'}],['L15',{}]];
 for(const [id,controls] of controlPlans){const l=LEVELS.find(level=>level.id===id),c=configuration(l,controls),t=performance.now(),plan=await planKnownModel(l,c),sample=samplePolicyTrace(l,c,{seed:l.seeds.root,snapshot:plan}),row={kind:'known-model-control',level:id,condition:l.learning.mode,seed:l.seeds.root,model:{states:plan.stateCount,sweeps:plan.sweeps,iterations:plan.iterations??0,converged:plan.converged,expectedReturn:plan.startValue,deliveryProbability:plan.successProbability,policyHash:plan.policyHash,dispatchPolicyStates:Object.keys(plan.policy??{}).length,elapsedMs:Math.round(performance.now()-t)},sample:{outcome:sample.outcome,actions:sample.steps,totalReward:sample.totalReward}};rows.push(row);console.log(id,l.learning.mode,sample.outcome,sample.steps,plan.successProbability.toFixed(4));}

 for(const l of LEVELS.filter(level=>level.chapterId==='C04')){const c=configuration(l),recorded=predictionBatch(l,c,{seed:l.seeds.root,episodes:96});for(let n=0;n<trials;n++){const seed=l.seeds.root+n*100003+700000,sample=evaluatePrediction(l,c,recorded.snapshot,{seed}),row={kind:'fixed-policy-prediction',level:l.id,condition:c.predictor,seed,recording:{episodes:recorded.snapshot.episodes,completedEpisodes:recorded.snapshot.completedEpisodes,transitions:recorded.snapshot.transitions,policyHash:recorded.snapshot.policyHash,startValue:recorded.validation.startValue,startCount:recorded.validation.startCount},sample:{outcome:sample.outcome,actions:sample.steps,totalReward:sample.totalReward}};rows.push(row);console.log(l.id,c.predictor,seed,sample.outcome,sample.steps);}}

 const evaluationTrials=10;
 for(const l of LEVELS.filter(level=>level.chapterId==='C05')){const c=configuration(l);for(let n=0;n<trials;n++){const seed=l.seeds.root+n*100003,t=performance.now(),trained=trainBatch(l,c,{q:{},seed,episodes:l.learning.episodesPerBatch}),outcomes=[];for(let check=0;check<evaluationTrials;check++)outcomes.push(evaluate(l,c,trained.q,{seed:seed+900000+check*104729}));const delivered=outcomes.filter(result=>result.outcome==='delivered').length,row={kind:l.learning.mode,level:l.id,condition:c.exploration,seed,training:{episodes:l.learning.episodesPerBatch,transitions:trained.transitions,deliveries:trained.deliveries},frozenEvaluation:{trials:evaluationTrials,delivered,outcomes:outcomes.map(result=>({outcome:result.outcome,actions:result.steps}))},elapsedMs:Math.round(performance.now()-t)};rows.push(row);console.log(l.id,l.learning.mode,seed,`${delivered}/${evaluationTrials}`,trained.transitions);}}

 for(const l of LEVELS.filter(level=>['C06','C07','C08'].includes(level.chapterId))){const c=auditConfiguration(l);for(let n=0;n<trials;n++){const seed=l.seeds.root+n*100003,t=performance.now(),linear=l.chapterId==='C06',dyna=l.chapterId==='C07',trained=linear?trainLinearBatch(l,c,{seed,episodes:l.learning.episodesPerBatch}):dyna?trainDynaBatch(l,c,{seed,episodes:l.learning.episodesPerBatch}):trainPolicyBatch(l,c,{seed,episodes:l.learning.episodesPerBatch}),sample=linear?evaluateLinear(l,c,trained.snapshot,{seed:seed+900000}):dyna?evaluateDyna(l,c,trained.snapshot,{seed:seed+900000}):evaluatePolicyGradient(l,c,trained.snapshot,{seed:seed+900000}),realTransitions=trained.snapshot.realTransitions??trained.snapshot.transitions,row={kind:l.learning.mode,level:l.id,condition:linear?c.encoder:dyna?`${c.planning}-plans/${c.machineRevision}`:`${c.baseline}/${c.balance}`,seed,training:{episodes:l.learning.episodesPerBatch,realTransitions,deliveries:trained.deliveries,planningUpdates:trained.snapshot.planningUpdates??0,actorUpdates:trained.snapshot.actorUpdates??0,criticUpdates:trained.snapshot.criticUpdates??0},frozenEvaluation:{outcome:sample.outcome,actions:sample.steps},elapsedMs:Math.round(performance.now()-t)};rows.push(row);console.log(l.id,l.learning.mode,seed,sample.outcome,sample.steps,realTransitions);}}

 const deepTrials=Number(process.env.DEEP_AUDIT_SEEDS??1);
 for(const l of LEVELS.filter(level=>['C09','C10','C12'].includes(level.chapterId))){const c=auditConfiguration(l);for(let n=0;n<deepTrials;n++){const seed=l.seeds.root+n*100003,t=performance.now(),trained=trainDqnBatch(l,c,{seed,episodes:l.learning.episodesPerBatch,scheduleEpisodes:l.learning.episodesPerBatch,maxTransitions:l.learning.transitionBudget}),sample=evaluateDqn(l,c,trained.snapshot,{seed:seed+900000}),row={kind:'dqn',level:l.id,condition:`${c.replay}/${c.targetCadence}`,seed,training:{episodes:trained.snapshot.episodes,realTransitions:trained.snapshot.realTransitions,deliveries:trained.deliveries,replaySize:trained.snapshot.replay.length,optimizerUpdates:trained.snapshot.optimizerUpdates,targetCopies:trained.snapshot.targetCopies},frozenEvaluation:{outcome:sample.outcome,actions:sample.steps},elapsedMs:Math.round(performance.now()-t)};rows.push(row);console.log(l.id,'dqn',seed,sample.outcome,sample.steps,trained.snapshot.realTransitions);}}

 for(const l of LEVELS.filter(level=>level.chapterId==='C11')){const c=auditConfiguration(l),seed=l.seeds.root,t=performance.now(),demonstrations=playerFormatAuditLesson(l,c),trained=trainImitation(l,c,{demonstrations,seed}),sample=evaluateImitation(l,c,trained.snapshot,{seed:seed+900000}),row={kind:'behavioral-cloning',level:l.id,condition:`map-audit-lesson/${c.epochs}-passes`,seed,training:{playerFormatExamples:demonstrations.length,episodes:1,updates:trained.snapshot.updates,holdoutExamples:trained.holdoutExamples},frozenEvaluation:{outcome:sample.outcome,actions:sample.steps},elapsedMs:Math.round(performance.now()-t)};rows.push(row);console.log(l.id,'behavioral-cloning',seed,sample.outcome,sample.steps,demonstrations.length);}

 fs.mkdirSync('evidence',{recursive:true});fs.writeFileSync('evidence/rl-audit.json',JSON.stringify({protocol:'Chapter 1 matches the worker recipe: 18 batches of 100 real episodes and frozen epsilon-zero validation. Chapter 2 exactly evaluates declared fixed policies, then samples the same stochastic kernel. Chapter 3 computes exact known-model policies. Chapter 4 records values from immutable fixed-policy experience. Chapter 5 trains real bounded tabular SARSA or Q-learning jobs, then evaluates frozen snapshots on ten independent environment seeds per training seed. Chapter 6 uses linear semi-gradient SARSA with declared features. Chapter 7 builds empirical transition models from real samples and performs Dyna updates only from those tables. Chapter 8 uses fresh on-policy softmax trajectories with separate actor and critic parameters where declared. Chapters 9, 10 and the original Chapter 12 train compact DQN snapshots with bounded real replay and explicit target copies. Chapter 11 cloning uses only player-format pre-action examples from a transition-validated map route generated by this development audit; no lesson generator ships in the runtime. All advanced evaluations freeze their snapshots. This development cohort is reproducibility evidence, not a mastery or deployed-browser claim.',trialsPerCondition:trials,deepTrialsPerMission:deepTrials,chapter5EvaluationTrialsPerTrainingSeed:evaluationTrials,rows},null,2));
}
