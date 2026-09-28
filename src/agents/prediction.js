import {createEpisode,observeEcho,encode,step} from '../sim/core.js?v=1.6.0';
import {fixedPolicyAction,policyHash} from './policy-evaluation.js?v=1.6.0';
import {rng} from './q-learning.js?v=1.6.0';

const clone=value=>JSON.parse(JSON.stringify(value));

function completedTrace(level,config,random){
 let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-prediction`}),trace=[];
 for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){
  const stateKey=encode(observeEcho(state)),action=fixedPolicyAction(level,config,state),out=step(state,{echoAction:action,stochasticSample:random()});
  trace.push({stateKey,action,reward:out.reward,nextKey:encode(observeEcho(out.state)),terminated:out.terminated,x:out.state.echo.x,y:out.state.echo.y,facing:out.state.echo.facing,cargo:out.state.echo.cargo,events:out.events});
  state=out.state;if(out.terminated)break;
 }
 return {trace,state,complete:state.courierOutcome!==null||state.failed||state.complete};
}

export function firstVisitMc(snapshot,trace,gamma){
 let returns=new Array(trace.length),value=0;
 for(let i=trace.length-1;i>=0;i--){value=trace[i].reward+gamma*value;returns[i]=value;}
 const seen=new Set();
 for(let i=0;i<trace.length;i++){
  const key=trace[i].stateKey;if(seen.has(key))continue;seen.add(key);
  const count=(snapshot.counts[key]??0)+1,old=snapshot.values[key]??0;
  snapshot.counts[key]=count;snapshot.values[key]=old+(returns[i]-old)/count;
 }
}

export function tdZero(snapshot,trace,{alpha,gamma}){
 for(const transition of trace){const old=snapshot.values[transition.stateKey]??0,next=transition.terminated?0:(snapshot.values[transition.nextKey]??0);snapshot.values[transition.stateKey]=old+alpha*(transition.reward+gamma*next-old);snapshot.counts[transition.stateKey]=(snapshot.counts[transition.stateKey]??0)+1;}
}

export function tdLambda(snapshot,trace,{alpha,gamma,lambda}){
 const eligibility={};
 for(const transition of trace){
  for(const key of Object.keys(eligibility)){eligibility[key]*=gamma*lambda;if(Math.abs(eligibility[key])<1e-12)delete eligibility[key];}
  eligibility[transition.stateKey]=(eligibility[transition.stateKey]??0)+1;
  const old=snapshot.values[transition.stateKey]??0,next=transition.terminated?0:(snapshot.values[transition.nextKey]??0),delta=transition.reward+gamma*next-old;
  for(const [key,weight] of Object.entries(eligibility))snapshot.values[key]=(snapshot.values[key]??0)+alpha*delta*weight;
  snapshot.counts[transition.stateKey]=(snapshot.counts[transition.stateKey]??0)+1;
 }
}

export function predictionBatch(level,config,{snapshot=null,seed=1,episodes=24}={}){
 const before=JSON.stringify(level.learning.policies),random=rng(seed),out=snapshot?clone(snapshot):{algorithm:config.predictor,values:{},counts:{},episodes:0,completedEpisodes:0,transitions:0,policyHash:policyHash(level,config)};
 if(out.algorithm!==config.predictor||out.policyHash!==policyHash(level,config))throw new Error('Prediction snapshot is incompatible with this fixed policy or recorder.');
 let lastTrace=[],deliveries=0;
 for(let episode=0;episode<episodes;episode++){
  const sample=completedTrace(level,config,random);lastTrace=sample.trace;out.episodes++;out.transitions+=sample.trace.length;
  if(sample.state.courierOutcome==='delivered')deliveries++;
  if(config.predictor==='mc'){if(sample.complete){firstVisitMc(out,sample.trace,config.gamma);out.completedEpisodes++;}}
  else if(config.predictor==='trace')tdLambda(out,sample.trace,config);
  else tdZero(out,sample.trace,config);
 }
 if(JSON.stringify(level.learning.policies)!==before)throw new Error('The fixed prediction policy changed during recording.');
 const startKey=lastTrace[0]?.stateKey,startValue=startKey?(out.values[startKey]??0):0,startCount=startKey?(out.counts[startKey]??0):0;
 return {snapshot:out,episodes,deliveries,transitions:lastTrace.length?out.transitions:0,lastTrace,validation:{outcome:lastTrace.at(-1)?.events?.some(event=>event.type==='delivery')?'delivered':'sampled',steps:lastTrace.length,startValue,startCount,policyHash:out.policyHash}};
}

export function evaluatePrediction(level,config,snapshot,{seed=1}={}){
 const sample=completedTrace(level,config,rng(seed)),startKey=sample.trace[0]?.stateKey;
 return {outcome:sample.state.courierOutcome??(sample.state.failed?'failed':'truncated'),steps:sample.trace.length,totalReward:sample.trace.reduce((sum,item)=>sum+item.reward,0),startKey,startValue:snapshot?.values?.[startKey]??0,startCount:snapshot?.counts?.[startKey]??0,trace:sample.trace,state:sample.state};
}
