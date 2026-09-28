import {createEpisode,step} from '../sim/core.js?v=1.6.0';
import {featureDimension,featureVector} from './feature-control.js?v=1.6.0';
import {rng} from './q-learning.js?v=1.6.0';
import {cloneMlp,createAdam,createMlp,forward,loadMlp,predict,snapshotMlp,trainDqnExample} from './neural.js?v=1.6.0';

const ACTIONS=6;
const clone=value=>JSON.parse(JSON.stringify(value));

function loadAdam(value,model){
 const fresh=createAdam(model);if(!value||!Number.isInteger(value.step)||value.step<0)return fresh;
 for(const side of ['m','v'])for(const key of ['w1','b1','w2','b2']){
  const row=value[side]?.[key];if(!Array.isArray(row)||row.length!==model[key].length||row.some(number=>!Number.isFinite(number)))return fresh;
  fresh[side][key]=[...row];
 }
 fresh.step=value.step;return fresh;
}

function fresh(level,config,seed){
 const dimensions=featureDimension(level,config),online=createMlp({inputSize:dimensions,hiddenSize:level.learning.hiddenSize??16,outputSize:ACTIONS,seed});
 return {algorithm:'dqn',encoder:config.encoder,dimensions,online,target:cloneMlp(online),adam:createAdam(online),replay:[],episodes:0,realTransitions:0,optimizerUpdates:0,targetCopies:0,rngState:(seed+17)>>>0};
}

function restore(snapshot,level,config,seed){
 if(snapshot?.algorithm!=='dqn'||snapshot.encoder!==config.encoder||snapshot.dimensions!==featureDimension(level,config))return fresh(level,config,seed);
 try{
  const online=loadMlp(snapshot.online),target=loadMlp(snapshot.target);
  if(online.inputSize!==snapshot.dimensions||target.inputSize!==snapshot.dimensions||online.outputSize!==ACTIONS||target.outputSize!==ACTIONS)return fresh(level,config,seed);
  const replay=(snapshot.replay??[]).filter(item=>item&&Array.isArray(item.input)&&item.input.length===snapshot.dimensions&&Array.isArray(item.nextInput)&&item.nextInput.length===snapshot.dimensions&&item.input.every(Number.isFinite)&&item.nextInput.every(Number.isFinite)&&Number.isInteger(item.action)&&item.action>=0&&item.action<ACTIONS&&Number.isFinite(item.reward)&&typeof item.terminal==='boolean').slice(-(level.learning.replayCap??256)).map(clone);
  return {algorithm:'dqn',encoder:config.encoder,dimensions:snapshot.dimensions,online,target,adam:loadAdam(snapshot.adam,online),replay,episodes:Math.max(0,Number(snapshot.episodes)||0),realTransitions:Math.max(0,Number(snapshot.realTransitions)||0),optimizerUpdates:Math.max(0,Number(snapshot.optimizerUpdates)||0),targetCopies:Math.max(0,Number(snapshot.targetCopies)||0),rngState:Number.isInteger(snapshot.rngState)?snapshot.rngState>>>0:(seed+17)>>>0};
 }catch{return fresh(level,config,seed);}
}

function starts(level,config){
 const declared=level.learning.trainStarts?.length?level.learning.trainStarts:level.learning.starts?.map(start=>start.id)??[];
 if(config.coverage==='narrow')return [config.start??declared[0]].filter(Boolean);
 return declared.length?declared:[config.start].filter(Boolean);
}

function cadence(level,config){return config.targetCadence==='live'?1:config.targetCadence==='rapid'?64:level.learning.targetEvery??256;}

function select(model,input,random,epsilon){
 if(random()<epsilon)return Math.floor(random()*ACTIONS);
 const values=forward(model,input).output,best=Math.max(...values),ties=[];
 for(let action=0;action<ACTIONS;action++)if(Math.abs(values[action]-best)<1e-9)ties.push(action);
 return ties[Math.floor(random()*ties.length)];
}

function nextRandom(out){
 out.rngState=(out.rngState+0x6D2B79F5)>>>0;let t=out.rngState;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;
}

export function trainDqnBatch(level,config,{snapshot=null,seed=1,episodes=level.learning.episodesPerBatch,scheduleOffset=0,scheduleEpisodes=episodes,maxTransitions=level.learning.transitionBudget??10000}={}){
 const out=restore(snapshot,level,config,seed),trainingStarts=starts(level,config),cap=level.learning.replayCap??256,batchSize=level.learning.replayBatch??32,trainEvery=level.learning.trainEvery??3,targetEvery=cadence(level,config);
 const remainingBudget=Math.max(0,Math.min(maxTransitions,(level.learning.transitionBudget??10000)-out.realTransitions));let deliveries=0,caught=0,lastTrace=[],completed=0,spent=0,lastLoss=0;
 for(let episode=0;episode<episodes&&spent<remainingBudget;episode++){
  const globalEpisode=scheduleOffset+episode,random=()=>nextRandom(out),selected=trainingStarts[globalEpisode%Math.max(1,trainingStarts.length)],episodeConfig={...config,...(selected?{start:selected}:{})};
  const fraction=globalEpisode/Math.max(1,scheduleEpisodes-1),epsilon=config.epsilonStart+(config.epsilonEnd-config.epsilonStart)*Math.min(1,fraction);
  let state=createEpisode(level,{practice:true,config:episodeConfig,episodeId:`${level.id}-dqn-${out.episodes+episode}`}),trace=[];
  for(let tick=0;tick<level.task.administrativeRolloutLimit&&spent<remainingBudget;tick++){
   const input=featureVector(level,episodeConfig,state),action=select(out.online,input,random,epsilon),transition=step(state,{echoAction:action,stochasticSample:random()}),nextInput=featureVector(level,episodeConfig,transition.state),sample={input,action,reward:transition.reward,nextInput,terminal:transition.terminated};
   out.replay.push(sample);if(out.replay.length>cap)out.replay.shift();out.realTransitions++;spent++;
   if(out.realTransitions%trainEvery===0){
    const source=config.replay==='off'?[sample]:Array.from({length:Math.min(batchSize,out.replay.length)},()=>out.replay[Math.floor(random()*out.replay.length)]);
    for(const item of source){({loss:lastLoss}=trainDqnExample(out.online,out.target,out.adam,item,{learningRate:level.learning.alpha??.008,gamma:config.gamma,clipNorm:5}));out.optimizerUpdates++;if(out.optimizerUpdates%targetEvery===0){out.target=cloneMlp(out.online);out.targetCopies++;}}
   }
   trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events});state=transition.state;if(transition.terminated)break;
  }
  if(state.courierOutcome==='delivered')deliveries++;if(state.courierOutcome==='caught')caught++;lastTrace=trace;completed++;
 }
 out.episodes+=completed;
 return {snapshot:{...out,online:snapshotMlp(out.online),target:snapshotMlp(out.target),adam:clone(out.adam),replay:clone(out.replay)},episodes:completed,transitions:spent,deliveries,caught,lastLoss,lastTrace};
}

export function evaluateDqn(level,config,snapshot,{seed=1,stochastic=false}={}){
 const out=restore(snapshot,level,config,seed);if(out.episodes===0)throw new Error('DQN cartridge has no completed practice.');const random=rng(seed);let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-dqn-eval`}),trace=[];
 for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){
  const action=select(out.online,featureVector(level,config,state),random,stochastic?(config.evaluationEpsilon??.04):0),transition=step(state,{echoAction:action,stochasticSample:random()});
  trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events});state=transition.state;if(transition.terminated)break;
 }
 return {outcome:state.courierOutcome??'truncated',steps:trace.length,trace,state};
}

export function dqnSnapshotAction(level,config,state,snapshot,random){
 if(snapshot?.algorithm!=='dqn'||snapshot.encoder!==config.encoder)return 0;
 try{return predict(loadMlp(snapshot.online),featureVector(level,config,state)).action;}catch{return 0;}
}
