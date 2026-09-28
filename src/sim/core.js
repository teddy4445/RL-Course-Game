/** Deterministic game rules. No DOM, renderer, timer, or unseeded random dependency. */
import {applyRewardProfile,effectiveSweeps,playerControlDefaults} from '../content/cartridge-controls.js?v=1.6.0';
import {applyCapabilities} from '../content/capabilities.js?v=1.6.0';
export const ACTION = Object.freeze({WAIT:0,NORTH:1,EAST:2,SOUTH:3,WEST:4,INTERACT:5});
export const DELTA = [[0,0],[0,-1],[1,0],[0,1],[-1,0],[0,0]];
export const at = (a,b) => !!a&&!!b&&a.x===b.x && a.y===b.y && (a.room??0)===(b.room??0);
export const clone = value => JSON.parse(JSON.stringify(value));
export function configuration(level,controls={}) {
 const c=applyCapabilities({...playerControlDefaults(level),...level.learning.defaults,...controls},controls.capabilities??[],level);
 const exploration=c.exploration==='low'?{epsilonStart:.08,epsilonEnd:.08}:c.exploration==='decay'?{epsilonStart:.8,epsilonEnd:.08}:null;
 const baseReward={...level.reward.weights,scrap:level.id==='L02'?(c.priority==='scrap'?7:.02):(level.id==='L03'||level.id==='L04'?1.8:(level.reward.weights.scrap??.02))};
 return {...c,allowedActions:c.allowedActions??level.learning.baseAllowedActions,
  gamma:c.future?c.future==='near'?.45:.96:(level.learning.gamma??.96),epsilon:c.curiosity==='familiar'?0:.85,
  alpha:level.learning.alpha??.4,lambda:c.trace==='none'?0:(level.learning.lambda??.8),planning:Number(c.planning??0),
  epsilonStart:exploration?.epsilonStart??level.learning.epsilonStart??.8,epsilonEnd:exploration?.epsilonEnd??level.learning.epsilonEnd??.08,
  actorAlpha:(c.balance==='fast-critic'?.009:level.learning.actorAlpha)??.012,criticAlpha:(c.balance==='fast-critic'?.075:level.learning.criticAlpha)??.045,
  entropyBeta:level.learning.entropyBeta??.08,
  predictor:c.recorder??level.learning.defaults?.recorder??'mc',maxSweeps:effectiveSweeps(level,c),
  reward:applyRewardProfile(baseReward,c.rewardProfile)};
}
function selectedStart(level,config){return level.learning.starts?.find(start=>start.id===(config.stageStart??config.start))??level.learning.starts?.[0]??null;}
function applyCourierStart(state){
 const start=selectedStart(state.level,state.config);if(!start)return state;
 state.echo={...state.echo,x:start.x,y:start.y,room:Number(state.config.stageIndex??start.room??0),...(start.facing?{facing:start.facing}:{})};
 if(start.cargo){const item=state.entities.find(entity=>entity.id===start.cargo);if(!item)throw new Error(`Unknown start cargo ${start.cargo}.`);item.taken=true;state.echo.cargo=item.id;state.ledger.push(`pickup:${item.id}`);}
 return state;
}
function applyModelRevision(state){
 const selected=state.config.modelRevision??state.config.machineRevision,revision=state.level.learning.model?.revisions?.find(candidate=>candidate.id===selected);if(!revision)return state;
 const open=new Set(revision.openGates??[]);
 for(const entity of state.entities)if(entity.kind==='gate'&&entity.id!=='heavyGate'&&!entity.patchOnly)entity.open=open.has(entity.id);
 return state;
}
export function createEpisode(level,{practice=false,config=configuration(level),episodeId='local'}={}) {
 const entities=level.geometry.entities.map(e=>({...e,taken:false,delivered:false,locked:false,open:e.kind==='portal'?e.open!==false:practice&&e.id==='heavyGate'}));
 const state={level,config,episodeId,practice,tick:0,echoTick:config.stagePhase??0,
  patch:{room:0,...level.actors.patchSpawn,cargo:null},echo:{...level.actors.echoSpawn,room:Number(config.stageIndex??0),cargo:null},
  patchCheckpoint:{...level.actors.patchSpawn},patchStrikes:0,
  echoStage:Number(config.stageIndex??0),echoStagePrepared:false,activeDock:null,stageDeliveries:[],
  entities:entities.map(entity=>entity.field==='echo'&&entity.kind!=='portal'?{...entity,room:Number(config.stageIndex??0)}:entity),ledger:[],events:[],capabilities:[...(config.capabilities??[])],receiverReady:practice||Number(level.id.slice(1))<=5,awake:true,echoActive:practice,
  courierDone:false,courierOutcome:null,failed:false,complete:false,cancelled:false,echoSteps:0,missionStarted:practice,missionSteps:0};
 if(practice||level.learning.starts?.length)applyCourierStart(state);
 applyModelRevision(state);return state;
}
export function findEntity(s,id){return s.entities.find(e=>e.id===id);}
export function playfield(s,actor){
 const rooms=s.level.playfields?.[actor];
 return rooms?.[s[actor]?.room??0]??null;
}
function entityField(s,e){if(e.field)return e.field;const tile=s.level.geometry.tiles[e.y]?.[e.x];return e.patchOnly||tile==='p'||e.kind==='exit-patch'?'patch':'echo';}
export function walkable(s,actor,x,y){
 const field=playfield(s,actor),t=field?field.tiles[y]?.[x]:s.level.geometry.tiles[y]?.[x];
 if(!t||t==='#'||(!field&&actor==='patch'&&t==='e')||(!field&&actor==='echo'&&t==='p'))return false;
 return !s.entities.some(e=>entityField(s,e)===actor&&(e.room??0)===(s[actor].room??0)&&e.x===x&&e.y===y&&(e.kind==='crate'||(e.kind==='gate'&&!e.open&&(actor==='echo'||e.blocksMovement===true))));
}
/**
 * Renderer-facing Patch affordance derived from the same world rules as E.
 * Used interactions disappear; visible but currently impossible interactions
 * remain discoverable as a red E prompt.
 */
export function patchInteractionHint(s){
 const a=s?.patch;if(!a)return null;const d=DELTA[a.facing]??DELTA[ACTION.WAIT],cells=[a,{x:a.x+d[0],y:a.y+d[1],room:a.room??0}],priority={'exit-patch':0,portal:1,cartridge:2,lever:3,console:4,socket:5,battery:6,core:6,crate:7};
 for(const cell of cells){
  const candidates=s.entities.filter(e=>entityField(s,e)==='patch'&&at(e,{...cell,room:a.room??0})&&priority[e.kind]!==undefined).sort((left,right)=>priority[left.kind]-priority[right.kind]||left.id.localeCompare(right.id));
  for(const e of candidates){
   if(e.kind==='portal'){
    if(!at(e,a))continue;
    const opener=e.requires&&findEntity(s,e.requires),possible=e.open!==false||!!opener?.active&&!opener.opensAfterEcho;return {entity:e,possible};
   }
   if(e.kind==='cartridge'){if(e.taken)continue;return {entity:e,possible:!e.locked};}
   if(e.kind==='lever'){if(e.active)continue;return {entity:e,possible:true};}
   if(e.kind==='console'){if(e.active||s.receiverReady)continue;return {entity:e,possible:true};}
   if(e.kind==='socket'){if(e.powered)continue;return {entity:e,possible:!!a.cargo&&e.accepts===a.cargo};}
   if(e.kind==='exit-patch'){if(e.active)continue;return {entity:e,possible:!!findEntity(s,'exitGate')?.open};}
   if(e.kind==='crate'){
    const nx=e.x+d[0],ny=e.y+d[1],possible=!at(e,a)&&walkable(s,'patch',nx,ny)&&!at(s.echo,{x:nx,y:ny})&&!at(s.patch,{x:nx,y:ny});return {entity:e,possible};
   }
   if(['battery','core'].includes(e.kind)){if(e.taken||e.delivered)continue;return {entity:e,possible:!a.cargo};}
  }
 }
 return null;
}
function oneShot(s,key,event,reward){
 if(s.ledger.includes(key))return 0;s.ledger.push(key);s.events.push(event);return reward;
}
function learningTarget(s){
 if(s.echo.cargo)return s.entities.find(entity=>entity.kind==='socket'&&entity.accepts===s.echo.cargo)??null;
 return s.entities.filter(entity=>entity.required&&!entity.taken&&!entity.delivered&&(entity.kind!=='core'||entity.echoCarry)).sort((a,b)=>(a.sequence??99)-(b.sequence??99)||a.id.localeCompare(b.id))[0]??null;
}
function echoWorkComplete(s){
 const stages=s.level.task.echoStages??[];
 if(stages.length)return (s.echoStage??0)===stages.length-1&&s.courierOutcome==='delivered';
 return s.courierOutcome==='delivered';
}
function interact(s,who){
 const a=s[who],d=DELTA[a.facing],cells=[a,{x:a.x+d[0],y:a.y+d[1]}];let reward=0;
 for(const cell of cells){
  const es=s.entities.filter(e=>entityField(s,e)===who&&at(e,{...cell,room:a.room??0})).sort((a,b)=>a.id.localeCompare(b.id));
  if(a.cargo){const socket=es.find(e=>e.kind==='socket'&&e.accepts===a.cargo);
   const stage=s.level.task.echoStages?.[Math.min(s.echoStage??0,(s.level.task.echoStages?.length??1)-1)],relayReceiver=who==='echo'&&stage&&!stage.requiresReceiver;
   if(socket&&(who==='patch'||s.receiverReady||relayReceiver)){
    const item=findEntity(s,a.cargo);item.delivered=true;a.cargo=null;socket.powered=true;
    reward+=oneShot(s,`delivery:${item.id}`,{type:'delivery',actor:who,itemId:item.id,socketId:socket.id},who==='echo'?s.config.reward.delivery:0);
    if(who==='patch'&&socket.grantsCapability&&!s.capabilities.includes(socket.grantsCapability)){
     s.capabilities.push(socket.grantsCapability);
     s.events.push({type:'capability',actor:who,itemId:item.id,socketId:socket.id,capabilityId:socket.grantsCapability,correct:true,source:'relay-socket'});
    }
    if(who==='echo'){
     const pending=s.entities.some(entity=>entity.required&&!entity.taken&&!entity.delivered&&(entity.kind!=='core'||entity.echoCarry)&&(entity.sequence??1)>(item.sequence??1));
     if(!pending){s.courierDone=true;s.courierOutcome='delivered';s.echoActive=false;}
    }
    return reward;
   }
  }
  for(const e of es){
   if(e.kind==='portal'&&who==='patch'&&at(e,a)){
    const opener=e.requires&&findEntity(s,e.requires);if(e.open===false&&opener?.active&&!opener.opensAfterEcho)e.open=true;
    if(e.open===false){s.events.push({type:'portal-locked',entityId:e.id});return 0;}
    a.room=e.targetRoom;a.x=e.x;a.y=e.y;s.patchCheckpoint={x:a.x,y:a.y,facing:a.facing,room:a.room};s.events.push({type:'portal',actor:who,entityId:e.id,targetRoom:e.targetRoom});return 0;
   }
   if(e.kind==='cartridge'&&who==='patch'&&!e.taken&&!e.locked){
    e.taken=true;s.capabilities=[...new Set([...(s.capabilities??[]),e.capabilityId])];
    for(const alternative of s.entities)if(alternative.choiceGroup===e.choiceGroup&&alternative.id!==e.id)alternative.locked=true;
    s.events.push({type:'capability',actor:who,itemId:e.id,capabilityId:e.capabilityId,correct:e.correct});return 0;
   }
   if(e.kind==='crate'&&who==='patch'){
    const nx=e.x+d[0],ny=e.y+d[1];
    if(walkable(s,'patch',nx,ny)&&!at(s.echo,{x:nx,y:ny})&&!at(s.patch,{x:nx,y:ny})){
     e.x=nx;e.y=ny;s.events.push({type:'push',entityId:e.id});
    }return 0;
   }
   if(e.kind==='lever'&&who==='patch'){if(e.active)return 0;const gate=findEntity(s,e.opens);if(gate&&!gate.open&&!e.opensAfterEcho){gate.open=true;s.events.push({type:'gate-open',entityId:gate.id});}e.active=true;if(e.checkpoint)s.patchCheckpoint={x:s.patch.x,y:s.patch.y,facing:s.patch.facing};return 0;}
   if(e.kind==='gate'&&who==='echo'&&!e.open&&e.accepts===a.cargo){
    const item=findEntity(s,a.cargo);if(item)item.delivered=true;a.cargo=null;e.open=true;
    reward+=oneShot(s,`gate:${e.id}`,{type:'gate-open',actor:who,entityId:e.id},s.config.reward.gate??0);return reward;
   }
   if(e.kind==='console'&&who==='patch'){if(e.active||s.receiverReady)return 0;s.receiverReady=true;e.active=true;s.events.push({type:'receiver-ready'});if(e.checkpoint)s.patchCheckpoint={x:s.patch.x,y:s.patch.y,facing:s.patch.facing};return 0;}
   if(e.kind==='dock'&&who==='patch'){
    const stage=s.level.task.echoStages?.[e.stageIndex??0],required=stage?.requiredCapability??s.level.task.requiredCapability;
    if(required&&!s.capabilities.includes(required)){s.events.push({type:'dock-locked',entityId:e.id,requiredCapability:required});return 0;}
    s.activeDock=e.id;s.events.push({type:'dock-open',entityId:e.id});return 0;
   }
   if(e.kind==='exit-patch'&&who==='patch'){
    if(e.active)return 0;
    const gate=findEntity(s,'exitGate');
    if(gate&&!gate.open){s.events.push({type:'exit-locked',entityId:e.id});return 0;}
    e.active=true;s.events.push({type:'exit-activated',entityId:e.id});return 0;
   }
   if(e.taken||e.delivered)continue;
   if(e.kind==='scrap'&&who==='echo'){
    e.taken=true;reward+=oneShot(s,`scrap:${e.id}`,{type:'scrap',actor:who,itemId:e.id},s.config.reward.scrap);
    if(e.terminal){s.courierDone=true;s.courierOutcome='scrap';s.echoActive=false;}
    return reward;
   }
   if(['battery','fuse','power-cell','token','core'].includes(e.kind)&&!a.cargo){
    const nextSequence=Math.min(...s.entities.filter(item=>item.required&&!item.taken&&!item.delivered&&(item.kind!=='core'||item.echoCarry)).map(item=>item.sequence??1),Infinity);
    if(e.sequence!==undefined&&e.sequence!==nextSequence)continue;
    if(who==='patch'&&e.kind!=='battery'&&e.kind!=='core')continue;
    if(who==='echo'&&(e.kind==='battery'||e.kind==='core'&&!e.echoCarry))continue;
    if(e.requiresDelivery&&s.courierOutcome!=='delivered')continue;
    e.taken=true;a.cargo=e.id;
    reward+=oneShot(s,`pickup:${e.id}`,{type:'pickup',actor:who,itemId:e.id},who==='echo'?s.config.reward.requiredPickup:0);return reward;
   }
  }
 }
 return reward;
}
function stochasticRule(s,echoAction){
 if(!s.echoActive||echoAction<1||echoAction>4)return null;
 const key=`${s.echo.x},${s.echo.y}`;
 return s.level.learning.model?.stochasticTransitions?.find(rule=>(!rule.revisions||rule.revisions.includes(s.config.machineRevision??s.config.modelRevision))&&rule.cells.includes(key)&&(!rule.actions||rule.actions.includes(echoAction)))??null;
}
function advancePatchSentries(s){
 for(const sentry of s.entities.filter(entity=>entity.kind==='sentry'&&entityField(s,entity)==='patch'&&(entity.room??0)===(s.patch.room??0))){
  if((s.tick+(sentry.phase??0))%(sentry.speed??2)!==0)continue;
  const axis=sentry.axis==='y'?'y':'x',delta=sentry.direction??1,min=sentry.min??sentry[`min${axis.toUpperCase()}`]??0,max=sentry.max??sentry[`max${axis.toUpperCase()}`]??0,next=sentry[axis]+delta;
  const grid=playfield(s,'patch')?.tiles??s.level.geometry.tiles,canMove=next>=min&&next<=max&&grid[axis==='y'?next:sentry.y]?.[axis==='x'?next:sentry.x]!=='#';
  if(canMove)sentry[axis]=next;else{sentry.direction=-delta;const bounced=sentry[axis]-delta;if(bounced>=min&&bounced<=max&&grid[axis==='y'?bounced:sentry.y]?.[axis==='x'?bounced:sentry.x]!=='#')sentry[axis]=bounced;}
 }
}
function advanceEchoHunters(s){
 for(const hunter of s.entities.filter(entity=>entity.kind==='echo-hunter'&&entityField(s,entity)==='echo'&&(entity.room??0)===(s.echo.room??0))){
  if((s.echoTick+(hunter.phase??0))%(hunter.speed??1)!==0)continue;
  const axis=hunter.axis==='y'?'y':'x',delta=hunter.direction??1,min=hunter.min??0,max=hunter.max??19,next=hunter[axis]+delta,grid=playfield(s,'echo')?.tiles??s.level.geometry.tiles;
  const canMove=next>=min&&next<=max&&grid[axis==='y'?next:hunter.y]?.[axis==='x'?next:hunter.x]!=='#';
  if(canMove)hunter[axis]=next;else{hunter.direction=-delta;const bounced=hunter[axis]-delta;if(bounced>=min&&bounced<=max&&grid[axis==='y'?bounced:hunter.y]?.[axis==='x'?bounced:hunter.x]!=='#')hunter[axis]=bounced;}
 }
}
function echoHunterLive(s,hunter){return !hunter.activePhases||hunter.activePhases.includes(s.echoTick%(hunter.period??4));}
/** Pure public transition: returned dynamic data never aliases the caller's dynamic data. */
export function step(input,{patchAction=0,echoAction=0,transitionOutcome=null,stochasticSample=null}={}) {
 if(input.complete||input.failed||input.cancelled)return {state:input,reward:0,events:[],terminated:true};
 const s={...input,patch:{...input.patch},echo:{...input.echo},patchCheckpoint:{...(input.patchCheckpoint??input.level.actors.patchSpawn)},capabilities:[...(input.capabilities??[])],entities:input.entities.map(e=>({...e})),ledger:[...input.ledger],events:[]},progressTarget=learningTarget(input),progressBefore=progressTarget?Math.abs(input.echo.x-progressTarget.x)+Math.abs(input.echo.y-progressTarget.y):0;
 const activeBefore=input.echoActive;
 if(!activeBefore)echoAction=0;
 // Explicit post-delivery staging: one-cell dock alignment, not a learned route.
 const dock=findEntity(s,'echoExit');
 if(s.courierOutcome==='delivered'&&!at(s.echo,dock)){
  if(Math.abs(s.echo.x-dock.x)+Math.abs(s.echo.y-dock.y)!==1)throw new Error('Delivery staging must be adjacent.');
  echoAction=s.echo.x<dock.x?2:s.echo.x>dock.x?4:s.echo.y<dock.y?3:1;
 }
 patchAction=Number.isInteger(patchAction)&&patchAction>=0&&patchAction<=5?patchAction:0;
 echoAction=Number.isInteger(echoAction)&&echoAction>=0&&echoAction<=5?echoAction:0;
 if(s.config.allowedActions&&!s.config.allowedActions.includes(echoAction))echoAction=ACTION.WAIT;
 const stochastic=stochasticRule(input,echoAction),alternate=stochastic&&(transitionOutcome==='alternate'||transitionOutcome===null&&stochasticSample!==null&&stochasticSample<stochastic.probability);
 if(alternate)echoAction=stochastic.outcomeAction;
 const actions={patch:patchAction,echo:echoAction},dest={};
 for(const who of ['patch','echo']){
  const a=s[who],act=actions[who];if(act>0&&act<5)a.facing=act;
  const d=DELTA[act];const next={x:a.x+d[0],y:a.y+d[1]};
  dest[who]=act<5&&walkable(s,who,next.x,next.y)?next:{x:a.x,y:a.y};
 }
 const separate=!!s.level.playfields,conflict=!separate&&at(dest.patch,dest.echo);
 for(const who of ['patch','echo']){
  const other=who==='patch'?'echo':'patch';
  if(!conflict&&(separate||!at(dest[who],input[other])))Object.assign(s[who],dest[who]);
 }
 let reward=activeBefore?s.config.reward.step:0;
 if(activeBefore&&progressTarget&&s.config.reward.progress){const progressAfter=Math.abs(s.echo.x-progressTarget.x)+Math.abs(s.echo.y-progressTarget.y);reward+=s.config.reward.progress*(progressBefore-progressAfter);}
 if(alternate)s.events.push({type:'slip',transitionId:stochastic.id});
 if(patchAction===5)reward+=interact(s,'patch');
 if(echoAction===5&&activeBefore)reward+=interact(s,'echo');
 if(activeBefore&&s.courierOutcome==='delivered'&&!echoWorkComplete(s)){const portal=s.entities.find(entity=>entity.kind==='portal'&&entity.field==='echo'&&entity.open!==false&&at(entity,s.echo));if(portal){s.echo.room=portal.targetRoom;s.events.push({type:'portal',actor:'echo',entityId:portal.id,targetRoom:portal.targetRoom});}}
 const touchedSentry=patchAction>0&&s.entities.some(entity=>entity.kind==='sentry'&&entityField(s,entity)==='patch'&&at(entity,s.patch));
 if(patchAction>0)advancePatchSentries(s);
 if(touchedSentry||patchAction>0&&s.entities.some(entity=>entity.kind==='sentry'&&entityField(s,entity)==='patch'&&at(entity,s.patch))){s.patch={...s.patch,...s.patchCheckpoint};s.patchStrikes=(s.patchStrikes??0)+1;s.events.push({type:'patch-hit'});}
 const touchedHunter=activeBefore&&s.entities.some(entity=>entity.kind==='echo-hunter'&&entityField(s,entity)==='echo'&&echoHunterLive(s,entity)&&at(entity,s.echo));
 if(activeBefore)advanceEchoHunters(s);
 if(activeBefore&&(touchedHunter||s.entities.some(entity=>entity.kind==='echo-hunter'&&entityField(s,entity)==='echo'&&echoHunterLive(s,entity)&&at(entity,s.echo)))){s.failed=true;s.courierOutcome='caught';s.echoActive=false;s.events.push({type:'caught',source:'echo-hunter'});reward+=s.config.reward.caught;}
 if(activeBefore){s.echoTick++;s.echoSteps++;}
 // The deployment clock belongs to Echo's frozen run. Patch can cross rooms,
 // recover from patrol checkpoints, and extract after delivery without spending
 // an autonomous-action budget while Echo is idle.
 if(input.missionStarted&&activeBefore)s.missionSteps++;
 for(const h of s.entities.filter(e=>e.kind==='laser'&&(e.room??0)===(s.echo.room??0))){
  const live=h.activePhases.includes(s.echoTick%h.period);
  if(activeBefore&&live&&(at(s.echo,h)||at(s.patch,h))){s.failed=true;s.courierOutcome='caught';s.echoActive=false;s.events.push({type:'caught'});reward+=s.config.reward.caught;}
 }
 s.tick++;
 const exitGate=findEntity(s,'exitGate');if(exitGate&&!exitGate.open&&echoWorkComplete(s)){exitGate.open=true;s.events.push({type:'gate-open',entityId:exitGate.id});}
 if(!s.failed){s.complete=checkObjective(s,s.level.task.objective);if(s.complete)s.events.push({type:'mission-clear'});}
 // Patch may explore and collect a physical capability before Echo is launched.
 // Only an explicitly mission-wide clock includes concurrent Patch activity;
 // every other rollout budget is an autonomous Echo-action budget.
 const elapsed=s.level.task.horizonBasis==='mission'?s.missionSteps:s.echoSteps;
 // A delivery made on the final allowed Echo tick is still valid. Once the
 // final Echo task is complete, the autonomous clock is over and Patch gets
 // as long as needed to walk through the newly opened exit and press E.
 if(!s.complete&&!echoWorkComplete(s)&&s.level.task.horizonSteps!==null&&elapsed>=s.level.task.horizonSteps){s.failed=true;s.courierOutcome='timeout';s.echoActive=false;s.events.push({type:'timeout'});}
 return {state:s,reward,events:s.events,terminated:s.failed||s.complete||s.courierDone};
}
export function transitionBranches(input,actions={}){
 const rule=stochasticRule(input,actions.echoAction??0);
 if(!rule)return [{probability:1,...step(input,{...actions,transitionOutcome:'nominal'})}];
 return [
  {probability:1-rule.probability,...step(input,{...actions,transitionOutcome:'nominal'})},
  {probability:rule.probability,...step(input,{...actions,transitionOutcome:'alternate'})}
 ];
}
export function checkObjective(s,o){
 switch(o.op){
  case'all':return o.children.every(c=>checkObjective(s,c));
  case'atExit':return at(s[o.actor],findEntity(s,o.entityId));
  case'exitActivated':return !!findEntity(s,o.entityId)?.active;
  case'delivered':return !!findEntity(s,o.itemId)?.delivered;
  case'gateLatched':return !!findEntity(s,o.entityId)?.open;
  case'itemOwned':return s[o.actor].cargo===o.itemId;
  case'stageComplete':return o.stage==='receiver-ready'&&s.receiverReady;
  case'bossDefeated':{const boss=findEntity(s,o.entityId),delivered=s.entities.filter(entity=>entity.required&&entity.delivered&&(entity.kind!=='core'||entity.echoCarry)).length;return !!boss&&delivered>=(boss.stages??1);}
  case'notFailed':return !s.failed;
  default:throw new Error(`Unsupported objective ${o.op}`);
 }
}
export function observeEcho(s){
 // Patch cannot enter the courier lane; its independent position is not an Echo input.
 // Practice/deployment share a latched, prepared handoff. No hidden model or RNG state.
 const suite=s.config.sensorSuite??'mission',laser=s.entities.find(e=>e.kind==='laser'&&(e.room??0)===(s.echo.room??0)),hunters=s.entities.filter(e=>e.kind==='echo-hunter'&&(e.room??0)===(s.echo.room??0)).sort((left,right)=>(Math.abs(left.x-s.echo.x)+Math.abs(left.y-s.echo.y))-(Math.abs(right.x-s.echo.x)+Math.abs(right.y-s.echo.y))||left.id.localeCompare(right.id)),hunter=hunters[0],compact=suite==='compact',observation={room:s.echo.room??0,x:s.echo.x,y:s.echo.y,facing:s.echo.facing,cargo:compact?null:s.echo.cargo,
  scrapMask:compact?'':s.entities.filter(e=>e.kind==='scrap').map(e=>e.taken?1:0).join(''),
  phase:compact?0:laser?s.echoTick%laser.period:0};
 if(!compact&&s.level.chapterId!=='C01')Object.assign(observation,{
  requiredMask:s.entities.filter(e=>e.required&&(e.kind!=='core'||e.echoCarry)).map(e=>e.delivered?'d':e.taken?'t':'0').join(''),
  gateMask:s.entities.filter(e=>e.kind==='gate'&&!e.patchOnly).map(e=>e.open?1:0).join(''),
 remaining:Math.max(0,(s.level.task.horizonSteps??0)-(s.level.task.horizonBasis==='mission'?s.missionSteps:s.echoSteps))
 });
 if(Number(s.level.chapterId.slice(1))>=7)Object.assign(observation,{threatDx:compact||!hunter?0:Math.sign(hunter.x-s.echo.x),threatDy:compact||!hunter?0:Math.sign(hunter.y-s.echo.y),threatDistance:compact||!hunter?0:Math.abs(hunter.x-s.echo.x)+Math.abs(hunter.y-s.echo.y),threatMotion:compact||!hunter?0:(hunter.axis==='y'?2:1)*(hunter.direction??1),threatAlert:compact||!hunter?0:echoHunterLive(s,hunter)?1:0});
 if(['beacon','lidar'].includes(suite)){
  const target=learningTarget(s)??s.echo;observation.targetDx=Math.sign(target.x-s.echo.x);observation.targetDy=Math.sign(target.y-s.echo.y);
 }
 if(suite==='lidar')observation.blockedMask=[1,2,3,4].map(action=>{const d=DELTA[action];return walkable(s,'echo',s.echo.x+d[0],s.echo.y+d[1])?'0':'1';}).join('');
 return observation;
}
export function encode(o){const base=`${o.room??0},${o.x},${o.y},${o.facing},${o.cargo??'-'},${o.scrapMask},${o.phase}`,mission=o.gateMask===undefined?base:`${base},${o.requiredMask},${o.gateMask},${o.remaining}`,threat=o.threatDx===undefined?mission:`${mission},${o.threatDx},${o.threatDy},${o.threatDistance},${o.threatMotion},${o.threatAlert}`;return o.targetDx===undefined?threat:`${threat},${o.targetDx},${o.targetDy},${o.blockedMask??'-'}`;}
export function bootAction(s){
 if(s.level.id!=='L01'||!s.awake)return ACTION.WAIT;const target=findEntity(s,'echoExit');if(!target||at(s.echo,target))return ACTION.WAIT;
 const start=s.echo,key=point=>`${point.x},${point.y}`,queue=[{x:start.x,y:start.y}],seen=new Set([key(start)]),first=new Map();
 while(queue.length){const cell=queue.shift();for(const action of [ACTION.NORTH,ACTION.EAST,ACTION.SOUTH,ACTION.WEST]){const d=DELTA[action],next={x:cell.x+d[0],y:cell.y+d[1]},k=key(next);if(seen.has(k)||!walkable(s,'echo',next.x,next.y))continue;seen.add(k);first.set(k,key(cell)===key(start)?action:first.get(key(cell)));if(next.x===target.x&&next.y===target.y)return first.get(k);queue.push(next);}}
 return ACTION.WAIT;
}
function requirementsReady(s,required){return required.every(id=>{const entity=findEntity(s,id);if(entity?.kind==='console')return entity.active||s.receiverReady;if(entity?.kind==='socket')return !!entity.powered;return !!entity?.active;});}
export function canDeploy(s){
 if(!s||s.failed||s.echoActive)return false;
 if(Number(s.level.id.slice(1))<=5)return true;
 const stages=s.level.task.echoStages;
 if(stages?.length){const stage=stages[Math.min(s.echoStage??0,stages.length-1)],receiverReady=!stage.requiresReceiver||s.receiverReady,capabilityReady=!stage.requiredCapability||s.capabilities.includes(stage.requiredCapability);return capabilityReady&&receiverReady&&!!findEntity(s,'heavyGate')?.open&&requirementsReady(s,stage.requirements??[])&&!s.failed;}
 const required=s.level.task.patchRequirements??[],capabilityReady=!s.level.task.requiredCapability||s.capabilities.includes(s.level.task.requiredCapability);return capabilityReady&&s.receiverReady&&!!findEntity(s,'heavyGate')?.open&&requirementsReady(s,required)&&!s.failed;
}
export function canTrain(s){
 return !!s&&s.level.learning.mode!=='none'&&!s.failed&&!s.echoActive;
}
export function launch(s,{preview=false}={}){
 if(!preview&&!canDeploy(s))throw new Error('Latch the shutter and power the receiver first.');
 const launched={...s,config:configuration(s.level,{...s.config,capabilities:s.capabilities}),patch:{...s.patch},echo:{...s.echo},patchCheckpoint:{...s.patchCheckpoint},capabilities:[...(s.capabilities??[])],stageDeliveries:[...(s.stageDeliveries??[])],entities:s.entities.map(entity=>({...entity})),ledger:[...s.ledger],echoActive:true,previewEcho:preview,awake:true,echoTick:s.config.stagePhase??0,echoSteps:0,missionStarted:true,missionSteps:0,courierDone:false,courierOutcome:null};
 if(s.level.learning.starts?.length)applyCourierStart(launched);applyModelRevision(launched);return launched;
}
