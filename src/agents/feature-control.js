import {createEpisode,observeEcho,step,walkable} from '../sim/core.js?v=1.6.0';
import {rng} from './q-learning.js?v=1.6.0';

const ACTIONS=6;
const clone=value=>JSON.parse(JSON.stringify(value));
const dot=(a,b)=>a.reduce((sum,value,index)=>sum+value*(b[index]??0),0);

function currentTarget(state,config){
 if(config.encoder==='missing-cargo')return state.entities.filter(entity=>entity.required&&(entity.kind!=='core'||entity.echoCarry)).sort((a,b)=>(a.sequence??99)-(b.sequence??99)||a.id.localeCompare(b.id))[0]??state.echo;
 if(state.echo.cargo)return state.entities.find(entity=>entity.kind==='socket'&&entity.accepts===state.echo.cargo)??state.echo;
 return state.entities.filter(entity=>entity.required&&!entity.taken&&!entity.delivered&&(entity.kind!=='core'||entity.echoCarry)).sort((a,b)=>(a.sequence??99)-(b.sequence??99)||a.id.localeCompare(b.id))[0]??state.echo;
}

export function featureVector(level,config,state){
 const observation=observeEcho(state),target=currentTarget(state,config),echoGeometry=level.learning.echoGeometry??level.geometry,width=Math.max(1,echoGeometry.width-1),height=Math.max(1,echoGeometry.height-1),compact=config.sensorSuite==='compact',dx=compact?0:(target.x-observation.x)/width,dy=compact?0:(target.y-observation.y)/height;
 const facing=[1,2,3,4].map(value=>observation.facing===value?1:0),rawBlocked=[1,2,3,4].map(action=>{const delta=[[0,0],[0,-1],[1,0],[0,1],[-1,0]][action];return walkable(state,'echo',observation.x+delta[0],observation.y+delta[1])?0:1;}),blocked=compact?[0,0,0,0]:rawBlocked;
 const cargo=config.encoder==='missing-cargo'||compact?0:observation.cargo?1:0,laser=state.entities.find(entity=>entity.kind==='laser'),phase=compact?0:(observation.phase??0)/Math.max(1,(laser?.period??4)-1),remaining=compact||level.chapterId==='C06'?1:level.task.horizonSteps?observation.remaining/level.task.horizonSteps:1,atTarget=compact?0:observation.x===target.x&&observation.y===target.y?1:0,threat=observation.threatDx===undefined?[]:[observation.threatDx,observation.threatDy,Math.min(1,observation.threatDistance/(width+height)),observation.threatMotion/2,observation.threatAlert??0];
 if(config.encoder==='absolute')return [1,observation.x/width,observation.y/height,compact?0:target.x/width,compact?0:target.y/height,cargo,...facing,phase,remaining,...blocked,atTarget,...threat];
 if(config.encoder==='coarse')return [1,Math.round(observation.x/2)/(width/2),Math.round(observation.y/2)/(height/2),Math.sign(dx),Math.sign(dy),cargo,...facing,phase,remaining,atTarget,...threat];
 const relational=[1,dx,dy,Math.sign(dx),Math.sign(dy),cargo,...facing,phase,remaining,...blocked,atTarget,...threat];
 const encoded=config.encoder==='fine'?[...relational,observation.x/width,observation.y/height,compact?0:target.x/width,compact?0:target.y/height]:relational,distance=Math.min(1,(Math.abs(target.x-observation.x)+Math.abs(target.y-observation.y))/(width+height));
 if(config.sensorSuite==='beacon')return [...encoded,distance,Math.abs(dx),Math.abs(dy)];
 if(config.sensorSuite==='lidar')return [...encoded,distance,...rawBlocked];
 return encoded;
}

export function featureDimension(level,config){return featureVector(level,config,createEpisode(level,{practice:true,config})).length;}
export function linearValues(snapshot,features){return snapshot.weights.map(row=>dot(row,features));}
export function linearAction(snapshot,features,random,epsilon=0){
 if(epsilon>0&&random()<epsilon)return Math.floor(random()*ACTIONS);
 const values=linearValues(snapshot,features),best=Math.max(...values),ties=[];for(let action=0;action<ACTIONS;action++)if(Math.abs(values[action]-best)<1e-10)ties.push(action);return ties[Math.floor(random()*ties.length)];
}

function fresh(level,config){const dimensions=featureDimension(level,config);return {algorithm:'linear-sarsa',encoder:config.encoder,dimensions,weights:Array.from({length:ACTIONS},()=>Array(dimensions).fill(0)),episodes:0,transitions:0};}
function compatible(snapshot,level,config){return snapshot?.algorithm==='linear-sarsa'&&snapshot.encoder===config.encoder&&snapshot.dimensions===featureDimension(level,config)&&snapshot.weights?.length===ACTIONS&&snapshot.weights.every(row=>row.length===snapshot.dimensions&&row.every(Number.isFinite));}
function starts(level,config){const declared=level.learning.trainStarts?.length?level.learning.trainStarts:level.learning.starts?.map(start=>start.id);return declared?.length?declared:[config.start];}

export function trainLinearBatch(level,config,{snapshot=null,seed=1,episodes=level.learning.episodesPerBatch,scheduleOffset=0,scheduleEpisodes=episodes}={}){
 const out=compatible(snapshot,level,config)?clone(snapshot):fresh(level,config),random=rng(seed),trainingStarts=starts(level,config);let deliveries=0,caught=0,lastTrace=[];
 for(let episode=0;episode<episodes;episode++){
  const globalEpisode=scheduleOffset+episode,episodeConfig={...config,...(trainingStarts[globalEpisode%trainingStarts.length]?{start:trainingStarts[globalEpisode%trainingStarts.length]}:{})},epsilon=config.epsilonStart+(config.epsilonEnd-config.epsilonStart)*(globalEpisode/Math.max(1,scheduleEpisodes-1));let state=createEpisode(level,{practice:true,config:episodeConfig,episodeId:`${level.id}-linear-${out.episodes+episode}`}),features=featureVector(level,episodeConfig,state),action=linearAction(out,features,random,epsilon),trace=[];
  for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){
   const transition=step(state,{echoAction:action,stochasticSample:random()}),nextFeatures=featureVector(level,episodeConfig,transition.state),nextAction=transition.terminated?0:linearAction(out,nextFeatures,random,epsilon),prediction=dot(out.weights[action],features),target=transition.reward+(transition.terminated?0:config.gamma*dot(out.weights[nextAction],nextFeatures)),error=Math.max(-20,Math.min(20,target-prediction));
   for(let index=0;index<features.length;index++)out.weights[action][index]=Math.max(-100,Math.min(100,out.weights[action][index]+config.alpha*error*features[index]));
   trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events});out.transitions++;state=transition.state;if(transition.terminated)break;features=nextFeatures;action=nextAction;
  }
  if(state.courierOutcome==='delivered')deliveries++;if(state.courierOutcome==='caught')caught++;lastTrace=trace;
 }
 out.episodes+=episodes;return {snapshot:out,episodes,transitions:out.transitions,deliveries,caught,lastTrace};
}

export function evaluateLinear(level,config,snapshot,{seed=1,stochastic=false}={}){
 if(!compatible(snapshot,level,config))throw new Error('Linear cartridge is incompatible with this feature encoder.');const random=rng(seed);let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-linear-eval`}),trace=[];
 for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){const action=linearAction(snapshot,featureVector(level,config,state),random,stochastic?config.evaluationEpsilon??.04:0),transition=step(state,{echoAction:action,stochasticSample:random()});trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events});state=transition.state;if(transition.terminated)break;}
 return {outcome:state.courierOutcome??'truncated',steps:trace.length,trace,state};
}

export function linearSnapshotAction(level,config,state,snapshot,random){if(!compatible(snapshot,level,config))return 0;return linearAction(snapshot,featureVector(level,config,state),random,0);}
