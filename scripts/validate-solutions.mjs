import assert from 'node:assert/strict';
import fs from 'node:fs';
import {LEVELS} from '../src/content/levels.js';
import {capability} from '../src/content/capabilities.js';

const solutionsDir=new URL('../production/solutions/',import.meta.url);
let checks=0;
const active=entity=>entity?.kind==='console'?entity.active||entity.receiverReady:entity?.kind==='socket'?entity.powered:entity?.active;

function expectedRuns(number,level){
 if(number>=51)return 5;if(number>=40)return 4;if(number>=31)return 3;if(number>=16)return 2;
 return level.task.echoStages?.length??1;
}

function canReachRoom(level,from,to,opened,activated){
 const queue=[from],seen=new Set([from]);
 while(queue.length){const room=queue.shift();if(room===to)return true;
  for(const portal of level.geometry.entities.filter(entity=>entity.kind==='portal'&&entity.field==='patch'&&(entity.room??0)===room)){
   const opener=portal.requires&&level.geometry.entities.find(entity=>entity.id===portal.requires),available=portal.open!==false||opened.has(portal.id)||!!opener&&activated.has(opener.id)&&!opener.opensAfterEcho;
   if(!available||seen.has(portal.targetRoom))continue;seen.add(portal.targetRoom);queue.push(portal.targetRoom);
  }
 }
 return false;
}

for(const level of LEVELS){
 const number=Number(level.id.slice(1)),file=new URL(`${level.id}.json`,solutionsDir);assert.ok(fs.existsSync(file),`${level.id}: missing solution program`);checks++;
 const program=JSON.parse(fs.readFileSync(file,'utf8')),runtimeStages=level.task.echoStages?.length??1,entities=new Map(level.geometry.entities.map(entity=>[entity.id,entity]));
 assert.equal(program.levelId,level.id);assert.equal(program.id,level.task.solutionProgram.id);assert.equal(program.schemaVersion,1);assert.equal(program.echoRuns,runtimeStages);assert.equal(program.echoRuns,expectedRuns(number,level),`${level.id}: Echo-run difficulty ramp`);checks+=5;
 assert.equal(program.stages.length,runtimeStages);assert.equal(program.mechanic.district,level.chapterId);assert.equal(program.mechanic.mode,level.learning.mode);assert.equal(program.mechanic.focus,level.learning.puzzleFocus);checks+=4;
 const flattened=[],activated=new Set(),powered=new Set(),capabilities=new Set(),opened=new Set(level.geometry.entities.filter(entity=>entity.kind==='portal'&&entity.open!==false).map(entity=>entity.id));let room=level.actors.patchSpawn.room??0,cargo=null;
 for(const [stageIndex,stage] of program.stages.entries()){
  const runtime=level.task.echoStages?.[stageIndex]??null;assert.equal(stage.index,stageIndex);assert.equal(stage.echoSteps[0].op,'train-echo');assert.equal(stage.echoSteps[0].algorithm,level.learning.mode);assert.equal(stage.echoSteps[1].op,'run-echo');checks+=4;
  for(const instruction of stage.patchSteps){
   const entity=entities.get(instruction.targetId);assert.ok(entity,`${level.id}: solution target ${instruction.targetId}`);assert.ok(entity.field==='patch'||entity.patchOnly||entity.kind==='exit-patch'||entity.kind==='core'&&!entity.echoCarry,`${level.id}:${entity.id} is not a Patch target`);assert.ok(canReachRoom(level,room,entity.room??0,opened,activated),`${level.id}: room ${entity.room??0} is unreachable before ${entity.id}`);room=entity.room??0;checks+=3;
   if(instruction.op!=='collect-capability')flattened.push(entity.id);
   if(['battery','core'].includes(entity.kind)){assert.equal(cargo,null,`${level.id}: Patch already carries ${cargo} before ${entity.id}`);cargo=entity.id;}
   else if(entity.kind==='socket'){assert.equal(entity.accepts,cargo,`${level.id}:${entity.id} receives the wrong carried item`);cargo=null;powered.add(entity.id);if(entity.grantsCapability)capabilities.add(entity.grantsCapability);}
   else if(entity.kind==='cartridge'){capabilities.add(entity.capabilityId);}
   else if(['lever','console'].includes(entity.kind))activated.add(entity.id);
  }
  const required=stage.requiredCapability;if(required)assert.ok(capabilities.has(required),`${level.id}: winning run ${stageIndex+1} lacks ${required}`);
  for(const requirement of runtime?.requirements??[]){const entity=entities.get(requirement);assert.ok(entity?.kind==='socket'?powered.has(requirement):activated.has(requirement),`${level.id}: run ${stageIndex+1} starts before ${requirement}`);checks++;}
  if(runtime?.gateId)opened.add(runtime.gateId);
  assert.equal(stage.echoSteps[0].requiresCapability,required??null);checks+=2;
 }
 assert.deepEqual(flattened,program.patchRoute,`${level.id}: executable Patch instructions drifted from the canonical route`);assert.deepEqual(program.patchRoute,level.task.patchRoute??[],`${level.id}: solution route drifted from runtime content`);checks+=2;
 assert.ok(program.extraction.some(step=>step.targetId==='patchExit'),`${level.id}: solution never activates extraction`);assert.equal(program.stepCount,program.stages.reduce((sum,stage)=>sum+stage.patchSteps.length+stage.echoSteps.length,0)+program.extraction.length);checks+=2;
 const minimum=number>=51?34:number>=40?28:number>=31?22:number>=6?14:5;assert.ok(program.stepCount>=minimum,`${level.id}: solution is too short for its campaign band (${program.stepCount} < ${minimum})`);checks++;
 if(program.mechanic.requiredCapability){const item=capability(program.mechanic.requiredCapability);assert.ok(item,`${level.id}: unknown mechanic capability`);assert.notEqual(item.type,'LEGACY',`${level.id}: retired capability used by solution`);checks+=2;}
}

const firstByDistrict=new Map();for(const level of LEVELS)if(!firstByDistrict.has(level.chapterId))firstByDistrict.set(level.chapterId,level);
for(const [chapterId,level] of firstByDistrict){const program=JSON.parse(fs.readFileSync(new URL(`${level.id}.json`,solutionsDir),'utf8'));assert.ok(program.mechanic.mode&&program.mechanic.focus,`${chapterId}: first mission does not exercise its district mechanic`);checks++;}

console.log(`${checks} executable solution-program checks passed across all 60 missions.`);
