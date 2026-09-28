import {createEpisode,step} from '../sim/core.js?v=1.6.0';
import {rng} from './q-learning.js?v=1.6.0';
import {featureVector,featureDimension} from './feature-control.js?v=1.6.0';

const ACTIONS=6,clone=value=>JSON.parse(JSON.stringify(value)),dot=(a,b)=>a.reduce((sum,value,index)=>sum+value*(b[index]??0),0);
export function stableSoftmax(logits){const max=Math.max(...logits),exp=logits.map(value=>Math.exp(value-max)),total=exp.reduce((sum,value)=>sum+value,0);return exp.map(value=>value/total);}
export function policyProbabilities(snapshot,features){return stableSoftmax(snapshot.actor.map(row=>dot(row,features)));}
function sampleAction(probabilities,random){let pick=random(),sum=0;for(let action=0;action<probabilities.length;action++){sum+=probabilities[action];if(pick<sum)return action;}return probabilities.length-1;}
function greedyAction(probabilities){let best=0;for(let action=1;action<probabilities.length;action++)if(probabilities[action]>probabilities[best])best=action;return best;}
function fresh(level,config){const dimensions=featureDimension(level,config);return {algorithm:level.learning.mode,encoder:config.encoder,dimensions,actor:Array.from({length:ACTIONS},()=>Array(dimensions).fill(0)),critic:Array(dimensions).fill(0),episodes:0,transitions:0,actorUpdates:0,criticUpdates:0,policyRevision:0};}
function compatible(snapshot,level,config){const dimensions=featureDimension(level,config);return snapshot?.algorithm===level.learning.mode&&snapshot.encoder===config.encoder&&snapshot.dimensions===dimensions&&snapshot.actor?.length===ACTIONS&&snapshot.actor.every(row=>row.length===dimensions&&row.every(Number.isFinite))&&snapshot.critic?.length===dimensions&&snapshot.critic.every(Number.isFinite);}
function actorUpdate(snapshot,features,action,advantage,alpha,entropyBeta=0){advantage=Math.max(-12,Math.min(12,advantage));const probabilities=policyProbabilities(snapshot,features),entropy=-probabilities.reduce((sum,probability)=>sum+probability*Math.log(Math.max(1e-12,probability)),0);for(let candidate=0;candidate<ACTIONS;candidate++){const probability=probabilities[candidate],policyGradient=advantage*((candidate===action?1:0)-probability),entropyGradient=-probability*(Math.log(Math.max(1e-12,probability))+entropy),scale=alpha*(policyGradient+entropyBeta*entropyGradient);for(let index=0;index<features.length;index++)snapshot.actor[candidate][index]=Math.max(-14,Math.min(14,snapshot.actor[candidate][index]+scale*features[index]));}snapshot.actorUpdates++;}
function criticUpdate(snapshot,features,target,alpha){const value=dot(snapshot.critic,features),error=Math.max(-20,Math.min(20,target-value));for(let index=0;index<features.length;index++)snapshot.critic[index]=Math.max(-100,Math.min(100,snapshot.critic[index]+alpha*error*features[index]));snapshot.criticUpdates++;return value;}

export function reinforceGradient(probabilities,action,advantage){return probabilities.map((probability,index)=>advantage*((index===action?1:0)-probability));}

export function trainPolicyBatch(level,config,{snapshot=null,seed=1,episodes=level.learning.episodesPerBatch}={}){
 const out=compatible(snapshot,level,config)?clone(snapshot):fresh(level,config),random=rng(seed),actorCritic=level.learning.mode==='actor-critic',useBaseline=actorCritic||level.learning.mode==='reinforce-baseline'&&config.baseline!=='none';let deliveries=0,caught=0,lastTrace=[];
 for(let episode=0;episode<episodes;episode++){
  let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-policy-${out.episodes+episode}`}),trajectory=[];
  for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){
   const features=featureVector(level,config,state),probabilities=policyProbabilities(out,features),action=sampleAction(probabilities,random),transition=step(state,{echoAction:action,stochasticSample:random()}),nextFeatures=featureVector(level,config,transition.state);trajectory.push({features,action,reward:transition.reward,nextFeatures,terminal:transition.terminated,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events});out.transitions++;state=transition.state;
   if(actorCritic){const value=dot(out.critic,features),next=transition.terminated?0:dot(out.critic,nextFeatures),delta=transition.reward+config.gamma*next-value;actorUpdate(out,features,action,delta,config.actorAlpha,config.entropyBeta);criticUpdate(out,features,transition.reward+config.gamma*next,config.criticAlpha);}
   if(transition.terminated)break;
  }
  if(!actorCritic){let returnValue=0;const returns=Array(trajectory.length);for(let index=trajectory.length-1;index>=0;index--){returnValue=trajectory[index].reward+config.gamma*returnValue;returns[index]=returnValue;}for(let index=0;index<trajectory.length;index++){const transition=trajectory[index],baseline=useBaseline?dot(out.critic,transition.features):0,advantage=returns[index]-baseline;actorUpdate(out,transition.features,transition.action,advantage,config.actorAlpha,config.entropyBeta);if(useBaseline)criticUpdate(out,transition.features,returns[index],config.criticAlpha);}}
  if(state.courierOutcome==='delivered')deliveries++;if(state.courierOutcome==='caught')caught++;lastTrace=trajectory.map(({action,reward,x,y,facing,cargo,events})=>({action,reward,x,y,facing,cargo,events}));out.policyRevision++;
 }
 out.episodes+=episodes;return {snapshot:out,episodes,deliveries,caught,transitions:out.transitions,actorUpdates:out.actorUpdates,criticUpdates:out.criticUpdates,lastTrace};
}

export function policySnapshotAction(level,config,state,snapshot,random){if(!compatible(snapshot,level,config))return 0;const probabilities=policyProbabilities(snapshot,featureVector(level,config,state));return config.evaluationMode==='stochastic'?sampleAction(probabilities,random):greedyAction(probabilities);}
export function evaluatePolicyGradient(level,config,snapshot,{seed=1}={}){const random=rng(seed);let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-policy-eval`}),trace=[];for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){const action=policySnapshotAction(level,config,state,snapshot,random),transition=step(state,{echoAction:action,stochasticSample:random()});trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events});state=transition.state;if(transition.terminated)break;}return {outcome:state.courierOutcome??'truncated',steps:trace.length,trace,state};}
