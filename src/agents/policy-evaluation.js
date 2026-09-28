import {ACTION,DELTA,at,createEpisode,findEntity,step,transitionBranches,walkable} from '../sim/core.js?v=1.6.0';
import {rng} from './q-learning.js?v=1.6.0';
import {playerControlDefaults} from '../content/cartridge-controls.js?v=1.6.0';

const DIRECTIONS=[ACTION.NORTH,ACTION.EAST,ACTION.SOUTH,ACTION.WEST];
const keyOf=point=>`${point.x},${point.y}`;
const directionTo=(from,to)=>to.x>from.x?ACTION.EAST:to.x<from.x?ACTION.WEST:to.y>from.y?ACTION.SOUTH:ACTION.NORTH;

function policyDefinition(level,policyId){
 const policy=level.learning.policies?.find(candidate=>candidate.id===policyId);if(!policy)throw new Error(`Unknown fixed policy ${policyId}.`);return policy;
}

function nextTarget(state){
 if(state.echo.cargo){
  const gate=state.entities.find(entity=>entity.kind==='gate'&&!entity.open&&entity.accepts===state.echo.cargo);if(gate)return gate;
  const receiver=state.entities.find(entity=>entity.kind==='socket'&&entity.accepts===state.echo.cargo);if(receiver)return receiver;
 }
 return state.entities.filter(entity=>entity.required&&!entity.taken&&!entity.delivered&&(entity.kind!=='core'||entity.echoCarry)).sort((a,b)=>(a.sequence??99)-(b.sequence??99)||a.id.localeCompare(b.id))[0]??null;
}

function routeAction(state,target,policy){
 const blocked=new Set(policy.blockedCells??[]),start=state.echo;
 if(at(start,target))return ACTION.INTERACT;
 const targetSolid=target.kind==='gate'&&!target.open;
 if(targetSolid&&Math.abs(start.x-target.x)+Math.abs(start.y-target.y)===1){
  const direction=directionTo(start,target);return start.facing===direction?ACTION.INTERACT:direction;
 }
 const goals=[];
 if(targetSolid){
  for(const action of DIRECTIONS){const delta=DELTA[action],point={x:target.x-delta[0],y:target.y-delta[1]};if(walkable(state,'echo',point.x,point.y))goals.push(point);}
 }else goals.push({x:target.x,y:target.y});
 const goalKeys=new Set(goals.map(keyOf)),queue=[{x:start.x,y:start.y}],parent=new Map([[keyOf(start),null]]),parentAction=new Map();let found=null;
 while(queue.length){
  const current=queue.shift(),currentKey=keyOf(current);if(goalKeys.has(currentKey)){found=current;break;}
  for(const action of DIRECTIONS){const delta=DELTA[action],next={x:current.x+delta[0],y:current.y+delta[1]},nextKey=keyOf(next);
   if(parent.has(nextKey)||blocked.has(nextKey)&&nextKey!==keyOf(start)||!walkable(state,'echo',next.x,next.y))continue;
   parent.set(nextKey,currentKey);parentAction.set(nextKey,action);queue.push(next);
  }
 }
 if(!found)return ACTION.WAIT;
 let cursor=keyOf(found),action=ACTION.WAIT;while(parent.get(cursor)!==null){action=parentAction.get(cursor);const previous=parent.get(cursor);if(previous===keyOf(start))return action;cursor=previous;}
 return action;
}

export function fixedPolicyAction(level,controls,state){
 if(state.courierDone||state.failed)return ACTION.WAIT;
 const alias=level.learning.alias;
 if(controls.representation==='position'&&alias&&state.echo.x===alias.x&&state.echo.y===alias.y)return alias.action;
 const target=nextTarget(state);if(!target)return ACTION.WAIT;
 const policy=policyDefinition(level,controls.policy),override=policy.overrides?.find(item=>item.x===state.echo.x&&item.y===state.echo.y&&(!item.cargo||item.cargo===state.echo.cargo));
 return override?.action??routeAction(state,target,policy);
}

export function policyHash(level,controls){
 const policy=policyDefinition(level,controls.policy),controlKeys=Object.keys({...playerControlDefaults(level),...level.learning.defaults}),selectedControls=Object.fromEntries(controlKeys.map(key=>[key,controls[key]])),text=JSON.stringify({level:level.id,content:level.contentVersion,policy,controls:selectedControls});let hash=2166136261;
 for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}return (hash>>>0).toString(16).padStart(8,'0');
}

export function dynamicKey(state){
 const entities=state.entities.map(entity=>`${entity.id}:${entity.taken?1:0}${entity.delivered?1:0}${entity.open?1:0}${entity.powered?1:0}`).join('|');
 return `${state.echo.x},${state.echo.y},${state.echo.facing},${state.echo.cargo??'-'},${state.echoSteps},${state.courierOutcome??'-'},${state.failed?1:0}|${entities}`;
}

export function plannedPolicyAction(level,controls,state,snapshot){return snapshot?.policy?.[dynamicKey(state)]??fixedPolicyAction(level,controls,state);}

function buildModel(level,config,{maxStates=50000}={}){
 const start=createEpisode(level,{practice:true,config,episodeId:`${level.id}-model`}),states=new Map(),records=new Map(),queue=[];
 const startKey=dynamicKey(start);states.set(startKey,start);queue.push(startKey);
 while(queue.length){
  const key=queue.shift(),state=states.get(key),action=fixedPolicyAction(level,config,state),branches=transitionBranches(state,{echoAction:action});
  const record={action,branches:[]};records.set(key,record);
  for(const branch of branches){
   const terminal=branch.terminated,nextKey=terminal?null:dynamicKey(branch.state);
   record.branches.push({probability:branch.probability,reward:branch.reward,terminal,success:branch.state.courierOutcome==='delivered',nextKey});
   if(!terminal&&!states.has(nextKey)){if(states.size>=maxStates)throw new Error(`Known model exceeds ${maxStates.toLocaleString()} states.`);states.set(nextKey,branch.state);queue.push(nextKey);}
  }
 }
 return {start,startKey,states,records};
}

export async function evaluatePolicy(level,config,{onSweep=async()=>{},cancelled=()=>false,maxStates=50000}={}){
 const definition=policyDefinition(level,config.policy),before=JSON.stringify(definition),model=buildModel(level,config,{maxStates}),values=new Map([...model.states.keys()].map(key=>[key,0])),success=new Map([...model.states.keys()].map(key=>[key,0]));
 let converged=false,sweeps=0,residual=Infinity;
 for(let sweep=1;sweep<=(config.maxSweeps??level.learning.maxSweeps);sweep++){
  if(cancelled())return {cancelled:true};
  const nextValues=new Map(),nextSuccess=new Map();residual=0;
  for(const [key,record] of model.records){let value=0,chance=0;for(const branch of record.branches){value+=branch.probability*(branch.reward+(branch.terminal?0:config.gamma*values.get(branch.nextKey)));chance+=branch.probability*(branch.terminal?(branch.success?1:0):success.get(branch.nextKey));}nextValues.set(key,value);nextSuccess.set(key,chance);residual=Math.max(residual,Math.abs(value-values.get(key)));}
  for(const [key,value] of nextValues)values.set(key,value);for(const [key,value] of nextSuccess)success.set(key,value);sweeps=sweep;
  await onSweep({sweep,stateCount:model.states.size,residual,startValue:values.get(model.startKey),successProbability:success.get(model.startKey)});
  if(residual<level.learning.tolerance){converged=true;break;}if(sweep%4===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 if(JSON.stringify(definition)!==before)throw new Error('Fixed policy changed during evaluation.');
 return {cancelled:false,policyId:config.policy,policyHash:policyHash(level,config),representation:config.representation,startId:config.start,stateCount:model.states.size,sweeps,residual,converged,startValue:values.get(model.startKey),successProbability:success.get(model.startKey)};
}

function actionValue(record,values,gamma){let total=0;for(const branch of record.branches)total+=branch.probability*(branch.reward+(branch.terminal?0:gamma*values.get(branch.nextKey)));return total;}
function actionSuccess(record,success){let total=0;for(const branch of record.branches)total+=branch.probability*(branch.terminal?(branch.success?1:0):success.get(branch.nextKey));return total;}

function buildControlModel(level,config,{maxStates=50000}={}){
 const start=createEpisode(level,{practice:true,config,episodeId:`${level.id}-control-model`}),states=new Map(),records=new Map(),queue=[];
 const startKey=dynamicKey(start);states.set(startKey,start);queue.push(startKey);
 while(queue.length){
  const key=queue.shift(),state=states.get(key),actions=new Map();records.set(key,actions);
  for(let action=0;action<=5;action++){
   const branches=transitionBranches(state,{echoAction:action}),record={action,branches:[]};actions.set(action,record);
   for(const branch of branches){
    const terminal=branch.terminated,nextKey=terminal?null:dynamicKey(branch.state);
    record.branches.push({probability:branch.probability,reward:branch.reward,terminal,success:branch.state.courierOutcome==='delivered',nextKey});
    if(!terminal&&!states.has(nextKey)){if(states.size>=maxStates)throw new Error(`Known control model exceeds ${maxStates.toLocaleString()} states.`);states.set(nextKey,branch.state);queue.push(nextKey);}
   }
  }
 }
 return {start,startKey,states,records};
}

function greedyAction(actions,values,gamma){let best=0,bestValue=-Infinity;for(const [action,record] of actions){const value=actionValue(record,values,gamma);if(value>bestValue+1e-12){best=action;bestValue=value;}}return best;}

async function evaluateActionPolicy(model,policy,config,{maxSweeps,onSweep,cancelled,counter}){
 const values=new Map([...model.states.keys()].map(key=>[key,0])),success=new Map([...model.states.keys()].map(key=>[key,0]));let residual=Infinity,converged=false;
 for(let sweep=1;sweep<=maxSweeps;sweep++){
  if(cancelled())return {cancelled:true};const nextValues=new Map(),nextSuccess=new Map();residual=0;
  for(const [key,actions] of model.records){const record=actions.get(policy.get(key));const value=actionValue(record,values,config.gamma);nextValues.set(key,value);nextSuccess.set(key,actionSuccess(record,success));residual=Math.max(residual,Math.abs(value-values.get(key)));}
  for(const [key,value] of nextValues)values.set(key,value);for(const [key,value] of nextSuccess)success.set(key,value);counter.count++;
  await onSweep({sweep:counter.count,stateCount:model.states.size,residual,startValue:values.get(model.startKey),successProbability:success.get(model.startKey)});
  if(residual<(config.tolerance??1e-8)){converged=true;break;}if(sweep%3===0)await new Promise(resolve=>setTimeout(resolve,0));
 }
 return {values,success,residual,converged};
}

function compactReachablePolicy(model,policy){
 const out={},queue=[model.startKey],seen=new Set();
 while(queue.length){const key=queue.shift();if(seen.has(key))continue;seen.add(key);const action=policy.get(key),record=model.records.get(key)?.get(action);if(!record)continue;out[key]=action;for(const branch of record.branches)if(!branch.terminal&&!seen.has(branch.nextKey))queue.push(branch.nextKey);}
 return out;
}

export async function planKnownModel(level,config,{onSweep=async()=>{},cancelled=()=>false,maxStates=50000}={}){
 if(!['policy-iteration','value-iteration'].includes(level.learning.mode))return evaluatePolicy(level,config,{onSweep,cancelled,maxStates});
 const model=buildControlModel(level,config,{maxStates}),values=new Map([...model.states.keys()].map(key=>[key,0])),success=new Map([...model.states.keys()].map(key=>[key,0])),counter={count:0};let policy=new Map([...model.states].map(([key,state])=>[key,fixedPolicyAction(level,config,state)])),residual=Infinity,converged=false,iterations=0;
 if(level.learning.mode==='value-iteration'){
  for(let sweep=1;sweep<=(config.maxSweeps??level.learning.maxSweeps);sweep++){
   if(cancelled())return {cancelled:true};const next=new Map();residual=0;
   for(const [key,actions] of model.records){let best=-Infinity;for(const record of actions.values())best=Math.max(best,actionValue(record,values,config.gamma));next.set(key,best);residual=Math.max(residual,Math.abs(best-values.get(key)));}
   for(const [key,value] of next)values.set(key,value);counter.count++;
   await onSweep({sweep:counter.count,stateCount:model.states.size,residual,startValue:values.get(model.startKey),successProbability:0});
   if(residual<level.learning.tolerance){converged=true;break;}if(sweep%3===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  policy=new Map([...model.records].map(([key,actions])=>[key,greedyAction(actions,values,config.gamma)]));
 }else{
  for(iterations=1;iterations<=24;iterations++){
   const evaluated=await evaluateActionPolicy(model,policy,config,{maxSweeps:config.maxSweeps??level.learning.maxSweeps,onSweep,cancelled,counter});if(evaluated.cancelled)return evaluated;
   for(const [key,value] of evaluated.values)values.set(key,value);for(const [key,value] of evaluated.success)success.set(key,value);residual=evaluated.residual;
   let stable=true;for(const [key,actions] of model.records){const next=greedyAction(actions,values,config.gamma);if(next!==policy.get(key)){policy.set(key,next);stable=false;}}
   if(stable){converged=evaluated.converged;break;}
  }
 }
 // Re-evaluate the final greedy policy so delivery probability and start value refer to the dispatched snapshot.
 const final=await evaluateActionPolicy(model,policy,config,{maxSweeps:config.maxSweeps??level.learning.maxSweeps,onSweep,cancelled,counter});if(final.cancelled)return final;
 for(const [key,value] of final.values)values.set(key,value);for(const [key,value] of final.success)success.set(key,value);
 return {cancelled:false,algorithm:level.learning.mode,policyId:config.policy,policyHash:policyHash(level,config),stateCount:model.states.size,sweeps:counter.count,iterations,residual:final.residual,converged:converged||final.converged,startValue:values.get(model.startKey),successProbability:success.get(model.startKey),policy:compactReachablePolicy(model,policy)};
}

export function samplePolicyTrace(level,config,{seed=1,cap=level.task.administrativeRolloutLimit??128,snapshot=null}={}){
 let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-trace`});const random=rng(seed),trace=[];let totalReward=0;
 for(let tick=0;tick<cap;tick++){
  const action=plannedPolicyAction(level,config,state,snapshot),out=step(state,{echoAction:action,stochasticSample:random()});state=out.state;totalReward+=out.reward;
  trace.push({action,reward:out.reward,x:state.echo.x,y:state.echo.y,facing:state.echo.facing,cargo:state.echo.cargo,events:out.events});if(out.terminated)break;
 }
 return {outcome:state.courierOutcome??'truncated',steps:trace.length,totalReward,trace,state};
}
