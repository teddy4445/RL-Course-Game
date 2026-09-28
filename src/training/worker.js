import {trainBatch,evaluate,familiarPrior} from '../agents/q-learning.js?v=1.6.0';
import {planKnownModel,samplePolicyTrace} from '../agents/policy-evaluation.js?v=1.6.0';
import {predictionBatch,evaluatePrediction} from '../agents/prediction.js?v=1.6.0';
import {trainLinearBatch,evaluateLinear} from '../agents/feature-control.js?v=1.6.0';
import {trainDynaBatch,evaluateDyna} from '../agents/dyna-q.js?v=1.6.0';
import {trainPolicyBatch,evaluatePolicyGradient} from '../agents/policy-gradient.js?v=1.6.0';
import {trainDqnBatch,evaluateDqn} from '../agents/deep-control.js?v=1.6.0';
import {trainImitation,evaluateImitation} from '../agents/imitation.js?v=1.6.0';
let generation=0;
function validationCohort(run,seed,trials=12){
 let delivered=0;const outcomes=[];
 for(let index=0;index<trials;index++){const sample=run(seed+index*104729),outcome=sample.outcome??'unknown';outcomes.push(outcome);if(outcome==='delivered')delivered++;}
 return {validationTrials:trials,validationDeliveries:delivered,successProbability:delivered/trials,outcomes};
}
self.onmessage=async ({data})=>{
 if(data.type==='cancel'){generation++;return;}
 if(data.type==='evaluate-policy'){
  const token=++generation,{jobId,revision,level,config}=data;
  try{
   const started=performance.now(),evaluation=await planKnownModel(level,config,{cancelled:()=>token!==generation,onSweep:async progress=>{if(token===generation)self.postMessage({type:'progress',jobId,revision,...progress});}});
   if(token!==generation||evaluation.cancelled)return;
   const sampled=samplePolicyTrace(level,config,{seed:data.seed,snapshot:evaluation});
   self.postMessage({type:'complete',jobId,revision,evaluation,elapsedMs:performance.now()-started,validation:{outcome:sampled.outcome,steps:sampled.steps,successProbability:evaluation.successProbability,startValue:evaluation.startValue,stateCount:evaluation.stateCount,sweeps:evaluation.sweeps,policyHash:evaluation.policyHash},trace:sampled.trace});
  }catch(error){if(token===generation)self.postMessage({type:'error',jobId,revision,message:String(error?.message??error)});}return;
 }
 if(data.type==='predict'){
  const token=++generation,{jobId,revision,level,config}=data;let snapshot=data.snapshot??null,completed=0,deliveries=0,transitions=0,lastTrace=[];
  try{
   const started=performance.now();
   while(completed<data.episodes){
    if(token!==generation)return;const count=Math.min(8,data.episodes-completed),out=predictionBatch(level,config,{snapshot,seed:data.seed+completed*6151,episodes:count});
    snapshot=out.snapshot;completed+=count;deliveries+=out.deliveries;transitions=snapshot.transitions;lastTrace=out.lastTrace;
    self.postMessage({type:'progress',jobId,revision,completed,deliveries,transitions,trace:lastTrace,startValue:out.validation.startValue,startCount:out.validation.startCount});
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   if(token!==generation)return;const validation=evaluatePrediction(level,config,snapshot,{seed:data.seed+900000}),cohort=validationCohort(seed=>evaluatePrediction(level,config,snapshot,{seed}),data.seed+910000);
   self.postMessage({type:'complete',jobId,revision,prediction:snapshot,completed,deliveries,transitions,elapsedMs:performance.now()-started,validation:{outcome:validation.outcome,steps:validation.steps,startValue:validation.startValue,startCount:validation.startCount,policyHash:snapshot.policyHash,...cohort},trace:validation.trace});
  }catch(error){if(token===generation)self.postMessage({type:'error',jobId,revision,message:String(error?.message??error)});}return;
 }
 if(data.type!=='train')return;
 const token=++generation,{jobId,revision,level,config,seed}=data;
 if(level.learning.mode==='behavioral-cloning'){
  try{
   const started=performance.now(),out=trainImitation(level,config,{snapshot:data.snapshot,demonstrations:data.demonstrations,seed});
   if(token!==generation)return;self.postMessage({type:'progress',jobId,revision,completed:out.snapshot.epochs,transitions:out.snapshot.updates,examples:out.snapshot.examples,holdoutCorrect:out.holdoutCorrect,holdoutExamples:out.holdoutExamples});await new Promise(resolve=>setTimeout(resolve,0));if(token!==generation)return;
   const validation=evaluateImitation(level,config,out.snapshot,{seed:seed+900000}),cohort=validationCohort(sampleSeed=>evaluateImitation(level,config,out.snapshot,{seed:sampleSeed}),seed+910000);self.postMessage({type:'complete',jobId,revision,snapshot:out.snapshot,completed:out.snapshot.epochs,deliveries:validation.outcome==='delivered'?1:0,transitions:out.snapshot.updates,elapsedMs:performance.now()-started,validation:{outcome:validation.outcome,steps:validation.steps,holdoutCorrect:out.holdoutCorrect,holdoutExamples:out.holdoutExamples,...cohort},trace:validation.trace});
  }catch(error){if(token===generation)self.postMessage({type:'error',jobId,revision,message:String(error?.message??error)});}return;
 }
 const advanced=['linear-sarsa','dyna-q','reinforce','reinforce-baseline','actor-critic','dqn'].includes(level.learning.mode);
 if(advanced){
  let snapshot=data.snapshot??null,completed=0,deliveries=0,lastTrace=[];
  try{
   const started=performance.now(),linear=level.learning.mode==='linear-sarsa',dyna=level.learning.mode==='dyna-q',deep=level.learning.mode==='dqn';let jobTransitions=0;
   while(completed<data.episodes&&(!deep||jobTransitions<(level.learning.transitionBudget??10000))){
    if(token!==generation)return;
    const count=dyna||deep?Math.min(20,data.episodes-completed):data.episodes-completed,options={snapshot,seed:deep?seed:seed+completed*7919,episodes:count,scheduleOffset:completed,scheduleEpisodes:data.episodes,...(deep?{maxTransitions:(level.learning.transitionBudget??10000)-jobTransitions}:{})};
    const out=linear?trainLinearBatch(level,config,options):dyna?trainDynaBatch(level,config,options):deep?trainDqnBatch(level,config,options):trainPolicyBatch(level,config,options);
    snapshot=out.snapshot;if((out.episodes??count)===0)break;completed+=out.episodes??count;deliveries+=out.deliveries;lastTrace=out.lastTrace;jobTransitions+=out.transitions??0;
    self.postMessage({type:'progress',jobId,revision,completed,deliveries,trace:lastTrace,transitions:snapshot.transitions??snapshot.realTransitions??0,realTransitions:snapshot.realTransitions??snapshot.transitions??0,planningUpdates:snapshot.planningUpdates??0,modelPairs:snapshot.modelKeys?.length??0,actorUpdates:snapshot.actorUpdates??0,criticUpdates:snapshot.criticUpdates??0,optimizerUpdates:snapshot.optimizerUpdates??0,replaySize:snapshot.replay?.length??0,targetCopies:snapshot.targetCopies??0});
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   if(token!==generation)return;
   const runValidation=sampleSeed=>linear?evaluateLinear(level,config,snapshot,{seed:sampleSeed}):dyna?evaluateDyna(level,config,snapshot,{seed:sampleSeed}):deep?evaluateDqn(level,config,snapshot,{seed:sampleSeed}):evaluatePolicyGradient(level,config,snapshot,{seed:sampleSeed}),validation=runValidation(seed+900000),cohort=validationCohort(runValidation,seed+910000);
   self.postMessage({type:'complete',jobId,revision,snapshot,completed,deliveries,transitions:snapshot.transitions??snapshot.realTransitions??0,realTransitions:snapshot.realTransitions??snapshot.transitions??0,planningUpdates:snapshot.planningUpdates??0,modelPairs:snapshot.modelKeys?.length??0,actorUpdates:snapshot.actorUpdates??0,criticUpdates:snapshot.criticUpdates??0,optimizerUpdates:snapshot.optimizerUpdates??0,replaySize:snapshot.replay?.length??0,targetCopies:snapshot.targetCopies??0,elapsedMs:performance.now()-started,validation:{outcome:validation.outcome,steps:validation.steps,...cohort},trace:validation.trace});
  }catch(error){if(token===generation)self.postMessage({type:'error',jobId,revision,message:String(error?.message??error)});}return;
 }
 let q=data.q??familiarPrior(level,config),completed=0,deliveries=0,transitions=0;
 try{
  const started=performance.now();
  while(completed<data.episodes){
   if(token!==generation)return;
   const count=Math.min(100,data.episodes-completed);
   const out=trainBatch(level,config,{q,seed:seed+completed*7919,episodes:count});
   q=out.q;completed+=count;deliveries+=out.deliveries;transitions+=out.transitions;
   self.postMessage({type:'progress',jobId,revision,completed,deliveries,transitions,trace:out.lastTrace});
   await new Promise(resolve=>setTimeout(resolve,0));
  }
  if(token!==generation)return;
  const validation=evaluate(level,config,q,{seed:seed+900000}),cohort=validationCohort(sampleSeed=>evaluate(level,config,q,{seed:sampleSeed}),seed+910000);
  self.postMessage({type:'complete',jobId,revision,q,completed,deliveries,transitions,elapsedMs:performance.now()-started,
   validation:{outcome:validation.outcome,steps:validation.steps,scrap:validation.scrap,...cohort},trace:validation.trace});
 }catch(error){self.postMessage({type:'error',jobId,revision,message:String(error?.message??error)});}
};
