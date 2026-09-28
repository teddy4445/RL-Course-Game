import {createEpisode,step,observeEcho,encode} from '../sim/core.js?v=1.6.0';
/** Versioned Mulberry32 PRNG. Inference/practice randomness never uses Math.random. */
export function rng(seed){let a=seed>>>0;return ()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
export function values(q,key){return q[key]??[0,0,0,0,0,0];}
export function choose(q,key,random,epsilon=0){
 if(epsilon>0&&random()<epsilon)return Math.floor(random()*6);
 const v=values(q,key),max=Math.max(...v),ties=[];
 for(let i=0;i<6;i++)if(Math.abs(v[i]-max)<1e-10)ties.push(i);
 return ties[Math.floor(random()*ties.length)];
}
export function update(q,key,action,reward,nextKey,terminal,alpha,gamma){
 const row=q[key]??(q[key]=[0,0,0,0,0,0]);
 const target=reward+(terminal?0:gamma*Math.max(...values(q,nextKey)));
 row[action]+=alpha*(target-row[action]);return row[action];
}
export function updateSarsa(q,key,action,reward,nextKey,nextAction,terminal,alpha,gamma){
 const row=q[key]??(q[key]=[0,0,0,0,0,0]);
 const target=reward+(terminal?0:gamma*values(q,nextKey)[nextAction]);
 row[action]+=alpha*(target-row[action]);return row[action];
}
/** A disclosed *unhelpful* experience prior, never a hidden successful policy. */
export function familiarPrior(level,config){
 const q={};if(level.id!=='L04')return q;
 for(let repeat=0;repeat<35;repeat++){
  let s=createEpisode(level,{practice:true,config});
  for(const a of [1,1,5]){const k=encode(observeEcho(s)),t=step(s,{echoAction:a});update(q,k,a,t.reward,encode(observeEcho(t.state)),t.terminated,config.alpha,config.gamma);s=t.state;}
 }
 return q;
}
export function trainBatch(level,config,{q=null,seed=1,episodes=1800,onEpisode=null}={}){
 const table=q?JSON.parse(JSON.stringify(q)):familiarPrior(level,config),random=rng(seed);let deliveries=0,scrap=0,caught=0,transitions=0,lastTrace=[];
 for(let episode=0;episode<episodes;episode++){
  let s=createEpisode(level,{practice:true,config}),trace=[];
  // Exploration starts high enough to discover the short lane and decays, never
  // overriding the deliberately zero-exploration familiar cartridge in L04.
  const epsilon=config.epsilon===0?0:config.epsilonStart!==undefined?config.epsilonStart+(config.epsilonEnd-config.epsilonStart)*(episode/Math.max(1,episodes-1)):Math.max(.12,config.epsilon*(1-.75*episode/episodes));
  let key=encode(observeEcho(s)),action=choose(table,key,random,epsilon);
  for(let t=0;t<level.task.administrativeRolloutLimit;t++){
   const out=step(s,{echoAction:action}),nextKey=encode(observeEcho(out.state)),nextAction=out.terminated?0:choose(table,nextKey,random,epsilon);
   if(level.learning.mode==='sarsa')updateSarsa(table,key,action,out.reward,nextKey,nextAction,out.terminated,config.alpha,config.gamma);
   else update(table,key,action,out.reward,nextKey,out.terminated,config.alpha,config.gamma);
   trace.push({action,reward:out.reward,x:out.state.echo.x,y:out.state.echo.y,facing:out.state.echo.facing,cargo:out.state.echo.cargo,events:out.events});
   transitions++;s=out.state;if(out.terminated)break;key=nextKey;action=nextAction;
  }
  if(s.courierOutcome==='delivered')deliveries++;if(s.courierOutcome==='scrap')scrap++;if(s.courierOutcome==='caught')caught++;
  lastTrace=trace;if(onEpisode)onEpisode({episode:episode+1,deliveries,scrap,caught,transitions,trace});
 }
 return {q:table,episodes,transitions,deliveries,scrap,caught,lastTrace,seed};
}
export function evaluate(level,config,q,{seed=900001,cap=128}={}){
 let s=createEpisode(level,{practice:true,config});const random=rng(seed),trace=[];let totalReward=0;
 for(let i=0;i<cap;i++){
  const action=choose(q,encode(observeEcho(s)),random,0),out=step(s,{echoAction:action});s=out.state;
  trace.push({action,reward:out.reward,x:s.echo.x,y:s.echo.y,phase:observeEcho(s).phase,events:out.events});totalReward+=out.reward;if(out.terminated)break;
 }
 return {outcome:s.courierOutcome??'truncated',steps:trace.length,totalReward,scrap:s.entities.filter(e=>e.kind==='scrap'&&e.taken).length,trace,state:s};
}
