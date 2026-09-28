import {createEpisode,observeEcho,encode,step} from '../sim/core.js?v=1.6.0';
import {rng,choose,update} from './q-learning.js?v=1.6.0';

const clone=value=>JSON.parse(JSON.stringify(value));
const revision=config=>config.machineRevision??'base';
const pairKey=(stateKey,action)=>`${stateKey}~${action}`;

function fresh(config){return {algorithm:'dyna-q',environmentRevision:revision(config),q:{},model:{},modelKeys:[],episodes:0,realTransitions:0,planningUpdates:0};}
function prepare(snapshot,config){
 if(!snapshot||snapshot.algorithm!=='dyna-q')return fresh(config);const out=clone(snapshot),changed=out.environmentRevision!==revision(config);if(!changed)return out;
 if(config.memory==='reset')return fresh(config);if(config.memory==='recent'){out.model={};out.modelKeys=[];}out.modelKeys??=Object.keys(out.model);out.environmentRevision=revision(config);return out;
}
function observeModel(snapshot,key,action,reward,nextKey,terminal){
 const id=pairKey(key,action);if(!snapshot.model[id]){snapshot.model[id]={stateKey:key,action,outcomes:{},total:0};snapshot.modelKeys.push(id);}const pair=snapshot.model[id],outcomeKey=`${terminal?'T':'N'}:${nextKey}`,outcome=pair.outcomes[outcomeKey]??(pair.outcomes[outcomeKey]={nextKey,terminal,count:0,rewardMean:0});outcome.count++;pair.total++;outcome.rewardMean+=(reward-outcome.rewardMean)/outcome.count;
}
function imaginedUpdate(snapshot,config,random){
 if(!snapshot.modelKeys.length)return;const pair=snapshot.model[snapshot.modelKeys[Math.floor(random()*snapshot.modelKeys.length)]],pick=random()*pair.total;let cursor=0,outcome=Object.values(pair.outcomes)[0];for(const candidate of Object.values(pair.outcomes)){cursor+=candidate.count;if(pick<cursor){outcome=candidate;break;}}
 update(snapshot.q,pair.stateKey,pair.action,outcome.rewardMean,outcome.nextKey,outcome.terminal,config.alpha,config.gamma);snapshot.planningUpdates++;
}

export function trainDynaBatch(level,config,{snapshot=null,seed=1,episodes=level.learning.episodesPerBatch,scheduleOffset=0,scheduleEpisodes=episodes}={}){
 const out=prepare(snapshot,config),random=rng(seed),planning=Math.max(0,Math.min(20,Number(config.planning)||0));let deliveries=0,caught=0,lastTrace=[];
 for(let episode=0;episode<episodes;episode++){
  let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-dyna-${out.episodes+episode}`}),trace=[];
  const globalEpisode=scheduleOffset+episode,epsilon=config.epsilonStart+(config.epsilonEnd-config.epsilonStart)*(globalEpisode/Math.max(1,scheduleEpisodes-1));
  for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){
   const key=encode(observeEcho(state)),action=choose(out.q,key,random,epsilon),transition=step(state,{echoAction:action,stochasticSample:random()}),nextKey=encode(observeEcho(transition.state));update(out.q,key,action,transition.reward,nextKey,transition.terminated,config.alpha,config.gamma);observeModel(out,key,action,transition.reward,nextKey,transition.terminated);out.realTransitions++;
   for(let count=0;count<planning;count++)imaginedUpdate(out,config,random);
   trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events,projected:false});state=transition.state;if(transition.terminated)break;
  }
  if(state.courierOutcome==='delivered')deliveries++;if(state.courierOutcome==='caught')caught++;lastTrace=trace;
 }
 out.episodes+=episodes;return {snapshot:out,episodes,deliveries,caught,realTransitions:out.realTransitions,planningUpdates:out.planningUpdates,modelPairs:Object.keys(out.model).length,lastTrace};
}

export function evaluateDyna(level,config,snapshot,{seed=1}={}){
 if(snapshot?.algorithm!=='dyna-q')throw new Error('Missing learned-model cartridge.');const random=rng(seed);let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-dyna-eval`}),trace=[];
 for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){const action=choose(snapshot.q,encode(observeEcho(state)),random,0),transition=step(state,{echoAction:action,stochasticSample:random()});trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events,projected:false});state=transition.state;if(transition.terminated)break;}
 return {outcome:state.courierOutcome??'truncated',steps:trace.length,trace,state};
}

export function dynaSnapshotAction(state,snapshot,random){return snapshot?.algorithm==='dyna-q'?choose(snapshot.q,encode(observeEcho(state)),random,0):0;}
export function empiricalProbability(snapshot,stateKey,action,nextKey,terminal=false){const pair=snapshot?.model?.[pairKey(stateKey,action)];if(!pair?.total)return null;const outcome=pair.outcomes[`${terminal?'T':'N'}:${nextKey}`];return (outcome?.count??0)/pair.total;}
