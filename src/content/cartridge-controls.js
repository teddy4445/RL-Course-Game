/**
 * Player-facing cartridge controls shared by UI, simulation, workers and saves.
 * These are deliberately mechanical: every selection changes an observation,
 * reward, or policy contract used by the real learner/evaluator. Each click
 * runs the authored fixed-size batch; players do not choose a practice budget.
 */
export const CARTRIDGE_CONTROLS=Object.freeze({
 sensorSuite:{
  id:'sensorSuite',label:'What Echo can sense',items:[
   ['compact','Position only'],
   ['mission','Mission telemetry'],
   ['beacon','Goal beacon + telemetry'],
   ['lidar','Beacon + local lidar']
  ]
 },
 rewardProfile:{
  id:'rewardProfile',label:'Signal shaping',items:[
   ['balanced','Balanced signals'],
   ['urgent','Fast delivery'],
   ['safe','Avoid capture'],
   ['sparse','Final result only']
  ]
 }
});

const FIXED_MODEL_MODES=new Set(['policy-evaluation','policy-improvement','policy-iteration','value-iteration']);

export function playerControlDefaults(level){
 if(!level||level.learning.mode==='none')return {};
 const out={};
 if(level.learning.mode!=='behavioral-cloning')out.rewardProfile='balanced';
 if(!FIXED_MODEL_MODES.has(level.learning.mode))out.sensorSuite='mission';
 return out;
}

export function playerControlDefinitions(level){
 const authored=level?.learning.controls??[],ids=new Set(authored.map(control=>control.id)),definitions=[...authored];
 for(const id of Object.keys(playerControlDefaults(level)))if(!ids.has(id))definitions.push(CARTRIDGE_CONTROLS[id]);
 return definitions;
}

export function exposedPlayerControls(level){
 const authored=level?.learning.exposedControls??[],out=[...authored];
 for(const id of Object.keys(playerControlDefaults(level)))if(!out.includes(id))out.push(id);
 return out;
}

export function effectiveEpisodes(level){
 return Math.max(1,Math.round(Number(level?.learning.episodesPerBatch??0)));
}

export function effectiveSweeps(level){
 return Math.max(2,Math.round(Number(level?.learning.maxSweeps??1)));
}

export function applyRewardProfile(reward,profile='balanced'){
 const out={...reward};
 if(profile==='urgent'){
  out.delivery=(out.delivery??0)*1.15;
  out.progress=(out.progress??0)*1.7;
  out.step=(out.step??0)*1.8;
 }else if(profile==='safe'){
  out.caught=(out.caught??0)*1.8;
  out.step=(out.step??0)*.65;
 }else if(profile==='sparse'){
  out.delivery=(out.delivery??0)*1.25;
  out.requiredPickup=0;
  out.gate=0;
  out.progress=0;
 }
 return out;
}
