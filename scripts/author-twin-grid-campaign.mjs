import fs from 'node:fs';

const levelsDir=new URL('../src/content/levels/',import.meta.url);
const solutionsDir=new URL('../production/solutions/',import.meta.url);
const files=fs.readdirSync(levelsDir).filter(name=>/^L\d\d\.json$/.test(name)).sort();
fs.mkdirSync(solutionsDir,{recursive:true});
const hash=(...values)=>values.join(':').split('').reduce((n,ch)=>Math.imul(n^ch.charCodeAt(0),16777619)>>>0,2166136261);
const randomFor=seed=>{let n=seed>>>0;return()=>{n=(n+0x6d2b79f5)>>>0;let t=n;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};};

const borderFor=chapter=>chapter===1?5:chapter===2?4:chapter===3?3:1;
const key=(x,y)=>`${x},${y}`;
function allFloorConnected(grid){
 const floor=[];for(let y=0;y<20;y++)for(let x=0;x<20;x++)if(grid[y][x]==='.')floor.push([x,y]);
 if(!floor.length)return false;const queue=[floor[0]],seen=new Set([key(...floor[0])]);
 while(queue.length){const [x,y]=queue.shift();for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(grid[ny]?.[nx]==='.'&&!seen.has(k)){seen.add(k);queue.push([nx,ny]);}}}
 return seen.size===floor.length;
}
function maze(seed,anchors=[],border=1){
 const random=randomFor(seed),grid=Array.from({length:20},(_,y)=>Array.from({length:20},(_,x)=>x<border||y<border||x>=20-border||y>=20-border?'#':'.')),reserved=new Set(anchors.map(([x,y])=>key(x,y))),candidates=[];
 for(let y=border;y<20-border;y++)for(let x=border;x<20-border;x++)if(!reserved.has(key(x,y)))candidates.push([x,y,random()]);
 candidates.sort((a,b)=>a[2]-b[2]);const area=(20-border*2)**2,target=Math.floor(area*(border>=4?.16:border===3?.2:.27));let placed=0;
 for(const [x,y] of candidates){if(placed>=target)break;grid[y][x]='#';if(allFloorConnected(grid))placed++;else grid[y][x]='.';}
 return grid;
}

function nearestFloor(grid,wanted,used){
 let best=null,score=Infinity;
 for(let y=1;y<19;y++)for(let x=1;x<19;x++)if(grid[y][x]==='.'&&!used.has(`${x},${y}`)){const d=Math.abs(x-wanted.x)+Math.abs(y-wanted.y);if(d<score){score=d;best={x,y};}}
 used.add(`${best.x},${best.y}`);return best;
}
function nearestCommonFloor(grids,wanted,used){
 let best=null,score=Infinity;
 for(let y=1;y<19;y++)for(let x=1;x<19;x++)if(grids.every(grid=>grid[y][x]==='.')&&!used.has(`${x},${y}`)){const d=Math.abs(x-wanted.x)+Math.abs(y-wanted.y);if(d<score){score=d;best={x,y};}}
 if(!best)throw new Error(`No common connected floor near ${wanted.x},${wanted.y}.`);used.add(`${best.x},${best.y}`);return best;
}
function boundedPoint(seed,border){const span=20-border*2;return [border+(hash(seed,'x')%span),border+(hash(seed,'y')%span)];}
function replacePatchExitObjective(objective){
 if(!objective||typeof objective!=='object')return objective;
 if(objective.op==='atExit'&&objective.actor==='patch')return {op:'exitActivated',entityId:objective.entityId};
 if(Array.isArray(objective.children))objective.children=objective.children.map(replacePatchExitObjective);
 return objective;
}

function actorField(level,entity){
 if(entity.field)return entity.field;
 if(entity.patchOnly||entity.kind==='exit-patch'||entity.kind==='core'&&!entity.echoCarry)return'patch';
 const old=level.geometry.tiles[entity.y]?.[entity.x];return old==='p'?'patch':'echo';
}

function patchRoomFor(level,entity,roomCount){
 if(entity.id==='latch')return 0;if(['receiverControl','practiceDock','heavyGate','patchExit'].includes(entity.id)||entity.kind==='core')return roomCount-1;
 if(Number.isInteger(entity.room)&&(/^(?:relayDock|patchRelay(?:Cell|Socket))\d+$/.test(entity.id)))return Math.max(0,Math.min(roomCount-1,entity.room));
 const numbered=Number(entity.id.match(/(\d+)$/)?.[1]);
 if(Number.isFinite(numbered)){if(entity.id.startsWith('security'))return Math.min(roomCount-1,Math.max(0,numbered-1));if(entity.id.startsWith('relayDock'))return Math.min(roomCount-1,numbered);if(entity.id.startsWith('patchRelay'))return Math.min(roomCount-1,Math.max(0,(entity.stageIndex??numbered-1)));if(entity.kind==='sentry')return Math.min(roomCount-1,numbered);}
 const route=level.task.patchRoute??[],index=route.indexOf(entity.id);return index<0?Math.min(roomCount-1,Math.floor(hash(level.id,entity.id)%roomCount)):Math.min(roomCount-1,Math.floor(index*roomCount/Math.max(1,route.length)));
}

function targetStageCount(number,current){
 if(number>=51)return 5;
 if(number>=40)return 4;
 if(number>=31)return 3;
 if(number>=5)return 2;
 return current;
}

function rebuildRelayFlow(level,number,roomCount,stageCount){
 if(number<6||!level.task.echoStages?.length)return;
 const generated=/^(?:relayDock|patchRelay(?:Cell|Socket))\d+$/;
 level.geometry.entities=level.geometry.entities.filter(entity=>!generated.test(entity.id));
 for(const entity of level.geometry.entities)if(entity.kind==='lever'&&entity.patchOnly)delete entity.opensAfterEcho;
 const baseRoute=(level.task.patchRoute??[]).filter(id=>!generated.test(id)&&id!=='practiceDock'),entityById=new Map(level.geometry.entities.map(entity=>[entity.id,entity]));
 const gateNumbers=[];
 for(let stage=0;stage<stageCount-1;stage++){
  let gate=Math.max(1,Math.min(roomCount-1,Math.round((stage+1)*roomCount/stageCount)));
  while(gateNumbers.includes(gate)&&gate<roomCount-1)gate++;
  while(gateNumbers.includes(gate)&&gate>1)gate--;
  gateNumbers.push(gate);
 }
 const starts=level.learning.starts??[],labels=['SIGNAL PROBE','PRESSURE PROBE','HAZARD PROBE','NIGHT PROBE'],stages=[],stageParts=[];
 for(let stageIndex=0;stageIndex<stageCount;stageIndex++){
  const final=stageIndex===stageCount-1,room=final?roomCount-1:gateNumbers[stageIndex]-1,dockId=final?'practiceDock':`relayDock${stageIndex+1}`,cellId=`patchRelayCell${stageIndex+1}`,socketId=`patchRelaySocket${stageIndex+1}`;
  if(final){const dock=entityById.get('practiceDock');dock.stageIndex=stageIndex;dock.relay=true;dock.room=room;}
  else{const dock={id:dockId,kind:'dock',field:'patch',room,patchOnly:true,stageIndex,relay:true};level.geometry.entities.push(dock);entityById.set(dockId,dock);}
  const cell={id:cellId,kind:'battery',field:'patch',room,patchOnly:true,relayCell:true,stageIndex},socket={id:socketId,kind:'socket',field:'patch',room,patchOnly:true,relayPower:true,stageIndex,accepts:cellId};
  level.geometry.entities.push(cell,socket);entityById.set(cellId,cell);entityById.set(socketId,socket);stageParts.push({room,cellId,socketId,dockId});
  const gateId=final?null:`patchPortal${gateNumbers[stageIndex]}`,lever=final?null:entityById.get(`securityLever${gateNumbers[stageIndex]}`);if(lever)lever.opensAfterEcho=true;
  stages.push({id:final?'live-delivery':`relay-${stageIndex+1}`,dockId,gateId,label:final?'LIVE DELIVERY':labels[stageIndex]??`RELAY ${stageIndex+1}`,challenge:final?'Train or verify the cartridge for the real cargo run. This frozen deployment decides the mission.':stageIndex===0?'Train Echo on a real pickup-and-return route to power the next portal.':'Re-train the same honest learner for this room’s shifted start and hazard phase.',requirements:[],startId:starts.length?starts[stageIndex%starts.length].id:null,phase:stageIndex,...(final?{requiresReceiver:true,final:true}:{})});
 }
 const route=[];
 for(let room=0;room<roomCount;room++){
  for(const id of baseRoute){const entity=entityById.get(id);if((entity?.room??patchRoomFor(level,entity,roomCount))===room)route.push(id);}
  const part=stageParts.find(candidate=>candidate.room===room);if(part)route.push(part.cellId,part.socketId,part.dockId);
 }
 const requirementKinds=new Set(['lever','console','socket']);
 for(const stage of stages){const end=route.indexOf(stage.dockId);stage.requirements=route.slice(0,end).filter(id=>requirementKinds.has(entityById.get(id)?.kind));}
 level.task.patchRoute=route;level.task.echoStages=stages;level.task.echoActivationCount=stageCount;level.task.patchPowerPuzzleCount=stageCount;level.task.patchRequirements=[...stages.at(-1).requirements];level.task.solutionRamp='authored-2-3-4-5-v1';
}

function solutionProgram(level){
 const number=Number(level.id.slice(1)),runtimeStages=level.task.echoStages?.length?level.task.echoStages:[{id:'live-delivery',dockId:null,label:'LIVE DELIVERY',requirements:level.task.patchRequirements??[],requiredCapability:level.task.requiredCapability,final:true}],route=level.task.patchRoute??[],entities=new Map(level.geometry.entities.map(entity=>[entity.id,entity])),stages=[];let cursor=0;
 for(let index=0;index<runtimeStages.length;index++){
  const stage=runtimeStages[index],requiredCapability=stage.requiredCapability??level.task.requiredCapability??level.learning.capabilityPuzzle?.required,grants=[...entities.values()].find(entity=>entity.kind==='socket'&&entity.grantsCapability===requiredCapability),targetId=stage.dockId??grants?.id??route.at(-1),end=Math.max(cursor-1,route.indexOf(targetId)),ids=end>=cursor?route.slice(cursor,end+1):[],patchSteps=ids.map(patchTargetId=>{const entity=entities.get(patchTargetId),op=['battery','core'].includes(entity?.kind)?'collect':entity?.kind==='socket'?'install':'interact';return {op,targetId:patchTargetId,room:entity?.room??0};});
  const cartridge=[...entities.values()].find(entity=>entity.kind==='cartridge'&&entity.capabilityId===requiredCapability);
  if(index===0&&requiredCapability&&!grants&&cartridge)patchSteps.splice(Math.max(0,patchSteps.length-1),0,{op:'collect-capability',targetId:cartridge.id,room:cartridge.room??0,capabilityId:requiredCapability});
  stages.push({index,id:stage.id,label:stage.label,requiredCapability:requiredCapability??null,patchSteps,echoSteps:[{op:'train-echo',algorithm:level.learning.mode,focus:level.learning.puzzleFocus,requiresCapability:requiredCapability??null,authoredBatch:level.learning.maxSweeps?{sweeps:level.learning.maxSweeps}:{episodes:level.learning.episodesPerBatch,transitionBudget:level.learning.transitionBudget??null}},{op:'run-echo',expected:index===runtimeStages.length-1?'deliver-cargo':'open-portal',opens:stage.gateId??'exitGate'}]});cursor=Math.max(cursor,end+1);
 }
 const extraction=[...level.geometry.entities.filter(entity=>entity.kind==='core'&&!entity.echoCarry&&entity.requiresDelivery).map(entity=>({op:'collect',targetId:entity.id,room:entity.room??0})),{op:'interact',targetId:'patchExit',room:entities.get('patchExit')?.room??0}];
 const program={schemaVersion:1,id:`${level.id}-solution-v1`,levelId:level.id,title:level.title,mechanic:{district:level.chapterId,mode:level.learning.mode,focus:level.learning.puzzleFocus,requiredCapability:runtimeStages[0]?.requiredCapability??level.task.requiredCapability??level.learning.capabilityPuzzle?.required??null},patchRoute:[...route],echoRuns:runtimeStages.length,stages,extraction};
 program.stepCount=stages.reduce((sum,stage)=>sum+stage.patchSteps.length+stage.echoSteps.length,0)+extraction.length;program.complexity={mission:number,patchRooms:level.playfields?.patch?.length??level.task.patchRoomCount??1,echoRooms:level.playfields?.echo?.length??runtimeStages.length,echoRuns:program.echoRuns,programSteps:program.stepCount};return program;
}

function capabilityOptions(level,number){
 if(number===1)return {group:'L01-relay',required:'act-east',options:['act-east']};
 if(number===60)return null;
 const byChapter={C01:['reward-delivery','reward-scrap'],C02:['sense-cargo','sense-position'],C03:['policy-safe','policy-fast'],C04:['trace-long','trace-none'],C05:['explore-curious','explore-familiar'],C06:['sense-beacon','sense-position'],C07:['model-rehearse','model-real'],C08:['signal-safe','signal-sparse'],C09:['replay-uniform','replay-latest'],C10:['conditions-varied','conditions-single'],C11:['lesson-recovery','lesson-short'],C12:['target-steady','target-live']};
 const early={2:['act-east','act-west'],3:['future-far','future-near'],4:['explore-curious','explore-familiar'],5:['reward-delivery','reward-scrap']},pair=early[number]??(byChapter[level.chapterId]??byChapter.C01),ordered=number%2?[...pair]:[pair[1],pair[0]],chapter=Number(level.chapterId.slice(1));
 if(chapter>=9&&!ordered.includes('signal-sparse'))ordered.push('signal-sparse');
 return {group:`${level.id}-fork`,required:pair[0],options:ordered};
}

for(const file of files){
 const path=new URL(file,levelsDir),level=JSON.parse(fs.readFileSync(path,'utf8')),number=Number(level.id.slice(1)),chapter=Number(level.chapterId.slice(1)),missionIndex=(number-1)%5,border=borderFor(chapter),roomCount=Math.max(1,Math.min(7,level.task.patchRoomCount??(number<3?1:Math.ceil(number/10)+1))),stageCount=targetStageCount(number,Math.max(1,level.task.echoStages?.length??1));
 rebuildRelayFlow(level,number,roomCount,stageCount);
 const anchors=Array.from({length:Math.max(roomCount,stageCount)-1},(_,i)=>boundedPoint(`${level.id}:portal:${i}`,border));
 const cx=Math.max(border,Math.min(19-border,10+((number%3)-1))),cy=Math.max(border,Math.min(19-border,10+(((number*2)%3)-1))),distance=chapter<=3||[25,30,40,60].includes(number)?1:2,echoAnchors=[];for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const x=cx+dx,y=cy+dy;if(x>=border&&x<20-border&&y>=border&&y<20-border)echoAnchors.push([x,y]);}
 const patchMaps=Array.from({length:roomCount},(_,room)=>maze(hash(level.id,'patch',room),[...(room?[anchors[room-1]]:[]),...(room<roomCount-1?[anchors[room]]:[])],border));
 const echoMaps=Array.from({length:stageCount},(_,room)=>maze(hash(level.id,'echo',room),echoAnchors,border));
 const entities=[...new Map(level.geometry.entities.filter(entity=>entity.kind!=='portal'&&entity.kind!=='cartridge'&&entity.kind!=='echo-hunter'&&entity.id!=='exitGate').map(entity=>[entity.id,entity])).values()].map(entity=>({...entity})),patchByRoom=Array.from({length:roomCount},()=>[]),echoEntities=[];
 for(const entity of entities){if(actorField(level,entity)==='patch'){entity.field='patch';entity.room=patchRoomFor(level,entity,roomCount);patchByRoom[entity.room].push(entity);}else{entity.field='echo';entity.room=0;echoEntities.push(entity);}}
 if(!entities.some(entity=>entity.id==='echoExit')){const exit={id:'echoExit',kind:'exit-echo',field:'echo',room:0};entities.push(exit);echoEntities.push(exit);}
 const patchUsed=patchMaps.map((_,room)=>new Set([...(room?[`${anchors[room-1][0]},${anchors[room-1][1]}`]:[]),...(room<roomCount-1?[`${anchors[room][0]},${anchors[room][1]}`]:[])]));
 for(let room=0;room<roomCount;room++)for(const [index,entity] of patchByRoom[room].entries()){
  const desired={x:1+((number*3+index*7+room*5)%18),y:1+((number*5+index*11+room*3)%18)},point=nearestFloor(patchMaps[room],desired,patchUsed[room]);Object.assign(entity,point);
 }
 // Portals are paired at the same local coordinate. Patch changes rooms only by standing on one and pressing E.
 for(let room=0;room<roomCount-1;room++){
  const [x,y]=anchors[room],id=`patchPortal${room+1}`,openBy=entities.find(e=>e.id===`securityLever${room+1}`)?.id??(room===0?'latch':null);
  entities.push({id,kind:'portal',field:'patch',room,x,y,targetRoom:room+1,open:room===0&&!openBy,requires:openBy,patchOnly:true});
  entities.push({id:`${id}Return`,kind:'portal',field:'patch',room:room+1,x,y,targetRoom:room,open:true,patchOnly:true});
  const opener=openBy&&entities.find(e=>e.id===openBy);if(opener&&opener.id!=='latch')opener.opens=id;
  if(opener?.opensAfterEcho){const stage=level.task.echoStages?.find(candidate=>candidate.gateId===`securityGate${room+1}`||candidate.gateId===id);if(stage&&!stage.final)stage.gateId=id;}
 }
 const echoUsed=new Set(),echoStart=nearestCommonFloor(echoMaps,{x:cx,y:cy},echoUsed),turn=number===2?0:number%4,orient=([dx,dy])=>{for(let i=0;i<turn;i++)[dx,dy]=[-dy,dx];return{x:Math.max(border,Math.min(19-border,cx+dx)),y:Math.max(border,Math.min(19-border,cy+dy))};};
 const required=echoEntities.filter(entity=>entity.required&&(entity.kind!=='core'||entity.echoCarry)).sort((a,b)=>(a.sequence??99)-(b.sequence??99)||a.id.localeCompare(b.id)),sockets=echoEntities.filter(entity=>entity.kind==='socket'),gates=echoEntities.filter(entity=>entity.kind==='gate'),scraps=echoEntities.filter(entity=>entity.kind==='scrap');
 const itemOffsets=[[distance,0],[0,distance],[-distance,0],[0,-distance]],socketOffsets=[[-distance,0],[0,-distance],[distance,0],[0,distance]];
 required.forEach((entity,index)=>Object.assign(entity,nearestCommonFloor(echoMaps,orient(itemOffsets[index%itemOffsets.length]),echoUsed)));
 sockets.forEach((entity,index)=>Object.assign(entity,nearestCommonFloor(echoMaps,orient(socketOffsets[index%socketOffsets.length]),echoUsed)));
 gates.forEach((entity,index)=>Object.assign(entity,nearestCommonFloor(echoMaps,orient([[0,1],[0,2],[0,-2]][index%3]),echoUsed)));
 scraps.forEach((entity,index)=>Object.assign(entity,nearestCommonFloor(echoMaps,orient([[0,-1],[-1,-1],[1,-1]][index%3]),echoUsed)));
 if(number<=2&&required[0]&&sockets[0]){
  // The opening action-space lesson must be structurally true: cargo begins
  // two tiles east, so INTERACT from spawn cannot substitute for EAST.
  Object.assign(required[0],{x:echoStart.x+2,y:echoStart.y});Object.assign(sockets[0],{x:echoStart.x-1,y:echoStart.y});
 }
 for(const entity of echoEntities){
  if(required.includes(entity)||sockets.includes(entity)||gates.includes(entity)||scraps.includes(entity))continue;
  const point=entity.kind==='exit-echo'?(sockets[0]??nearestCommonFloor(echoMaps,orient([-2,2]),echoUsed)):nearestCommonFloor(echoMaps,entity.kind==='laser'?orient([0,1]):entity.kind==='boss'?orient([3,-2]):orient([((hash(entity.id)%5)-2),2+hash(entity.id,'y')%2]),echoUsed);Object.assign(entity,point);
 }
 if(chapter>=7){
  const makeHunter=(id,startOffset,endOffset,speed,phase)=>{const startWanted=orient(startOffset),endWanted=orient(endOffset),start=nearestCommonFloor(echoMaps,startWanted,echoUsed),axis=startWanted.x===endWanted.x?'y':'x',hunter={id,kind:'echo-hunter',field:'echo',room:0,...start,axis,min:Math.min(startWanted[axis],endWanted[axis]),max:Math.max(startWanted[axis],endWanted[axis]),direction:1,speed,phase,period:4,activePhases:[0],echoOnly:true};entities.push(hunter);echoEntities.push(hunter);};
  makeHunter('echoHunter1',[-3,2],[3,2],2,(number+1)%4);
 }
 const exit=echoEntities.find(entity=>entity.kind==='exit-echo'),receiver=sockets.find(entity=>entity.id==='receiver')??sockets[0];if(exit&&receiver)Object.assign(exit,{x:receiver.x,y:receiver.y});
 // Keep a visible same-coordinate Echo portal on every relay handoff.
 for(let room=0;room<stageCount-1;room++){
  const exit=entities.find(entity=>entity.id==='echoExit'),receiver=entities.find(entity=>entity.field==='echo'&&entity.kind==='socket'),point=exit??receiver??nearestCommonFloor([echoMaps[room],echoMaps[room+1]],{x:cx,y:cy},echoUsed),{x,y}=point;
  entities.push({id:`echoPortal${room+1}`,kind:'portal',field:'echo',room,x,y,targetRoom:room+1,open:true,echoOnly:true});
 }
 const patchStart=nearestFloor(patchMaps[0],{x:2+(number*3)%15,y:2+(number*7)%15},patchUsed[0]);
 const capabilityPuzzle=capabilityOptions(level,number);
 if(capabilityPuzzle){
  if(number>5){const dock=entities.find(e=>e.kind==='dock'&&e.field==='patch'&&(e.stageIndex??0)===0)??entities.find(e=>e.kind==='dock'&&e.field==='patch'),room=level.id==='L06'?0:dock?.room??Math.min(1,roomCount-1),used=patchUsed[room];
   capabilityPuzzle.options.forEach((capabilityId,index)=>{const point=nearestFloor(patchMaps[room],{x:index?16:3,y:2+((number*5+index*9)%15)},used);entities.push({id:`capability${index+1}`,kind:'cartridge',field:'patch',room,...point,capabilityId,choiceGroup:capabilityPuzzle.group,correct:capabilityId===capabilityPuzzle.required,patchOnly:true});});}
  for(const stage of level.task.echoStages??[])stage.requiredCapability=capabilityPuzzle.required;
  if(!(level.task.echoStages?.length))level.task.requiredCapability=capabilityPuzzle.required;
 }
 if(level.id==='L05'&&level.task.echoStages?.length===2){
  level.task.echoStages[0].requiredCapability='reward-delivery';level.task.echoStages[0].requirements=['patchRelaySocket1'];
  level.task.echoStages[1].requiredCapability='explore-curious';level.task.echoStages[1].requirements=['patchRelaySocket1','securityLever1','patchRelaySocket2'];
 }
 const patchExit=entities.find(entity=>entity.id==='patchExit');if(patchExit)entities.push({id:'exitGate',kind:'gate',field:'patch',room:patchExit.room,x:patchExit.x,y:patchExit.y,patchOnly:true,blocksMovement:true,opensAfterEcho:true,open:false});
 level.geometry.entities=entities;level.actors.patchSpawn={...level.actors.patchSpawn,...patchStart,room:0};level.actors.echoSpawn={...level.actors.echoSpawn,...echoStart,room:0};
 const learningStartUsed=new Set();level.learning.starts=(level.learning.starts??[]).map((start,index)=>({...start,...nearestCommonFloor(echoMaps,orient([[0,0],[-1,0],[0,-1],[1,0]][index%4]),learningStartUsed),room:0}));
 if(level.learning.alias)Object.assign(level.learning.alias,{...echoStart,action:0});
 for(const policy of level.learning.policies??[]){policy.blockedCells=[];if(policy.overrides)policy.overrides=[];}
 for(const rule of level.learning.model?.stochasticTransitions??[]){rule.cells=[`${echoStart.x},${echoStart.y}`];delete rule.actions;}
 level.playfields={version:'twin-grid-v2',size:20,border,patch:patchMaps.map((grid,index)=>({id:`patch-${index+1}`,tiles:grid.map(row=>row.join(''))})),echo:echoMaps.map((grid,index)=>({id:`echo-${index+1}`,tiles:grid.map(row=>row.join(''))}))};
 level.learning.capabilityPuzzle=capabilityPuzzle;level.learning.capabilityVersion=number<=5?'relay-sockets-v1':'physical-cartridges-v1';level.learning.puzzleFocus=number===1?'actions':['state','actions','reward','practice','policy'][missionIndex];level.learning.echoThreatVersion=chapter>=7?'patrol-state-v1':'none';
 if(level.id==='L26')level.learning.alpha=.04;
 if(level.id==='L30')level.learning.alpha=.08;
 if(level.id==='L23')level.learning.episodesPerBatch=420;
 if(level.id==='L24')level.learning.episodesPerBatch=420;
 if(level.id==='L25')level.learning.episodesPerBatch=660;
 if(level.id==='L30')level.learning.episodesPerBatch=400;
 if(level.id==='L35')level.learning.episodesPerBatch=690;
 if(level.id==='L37')level.learning.actorAlpha=.008;
 if(level.id==='L38')level.learning.entropyBeta=.12;
 if(level.id==='L28')level.learning.episodesPerBatch=450;
 // The last three actor-critic missions cross a moving-patrol state space.
 // One player-visible training batch must contain enough genuine trajectories
 // to learn the authored route without relying on a second hidden batch.
 if(level.id==='L38')level.learning.episodesPerBatch=580;
 if(level.id==='L39')level.learning.episodesPerBatch=480;
 if(level.id==='L40')level.learning.episodesPerBatch=400;
 if(level.id==='L60'){level.learning.episodesPerBatch=650;level.learning.transitionBudget=16000;}
 const exactModel=['policy-evaluation','policy-improvement','policy-iteration','value-iteration'].includes(level.learning.mode),echoBudget=exactModel?Math.min(30,8+required.length*5):Math.min(72,12+required.length*(distance*3+4)+(chapter>=7?8:0));level.task.twinGridVersion='20x20-portals-v2';level.task.completionInteraction='patchExit';level.task.objective=replacePatchExitObjective(level.task.objective);level.task.horizonSteps=number===1?28:echoBudget;level.task.administrativeRolloutLimit=number===1?28:echoBudget;
 // Some older campaign definitions expressed the delivery target only in the
 // objective. Materialize it last so repeated authoring cannot lose the target
 // while generated portals and cartridges are replaced.
 if(!entities.some(entity=>entity.id==='echoExit')){
  const target=sockets.find(entity=>entity.id==='receiver')??sockets[0]??{x:cx-2,y:cy};
  entities.push({id:'echoExit',kind:'exit-echo',field:'echo',room:0,x:target.x,y:target.y});
 }
 level.geometry.entities=[...new Map(entities.map(entity=>[entity.id,entity])).values()];
 level.scene.presentation='twin-grid-20x20-v2';level.scene.patchRooms=patchMaps.map((_,index)=>({label:['ENTRY','WORKSHOP','SECURITY','RELAY','MACHINE','VAULT','DISPATCH'][index]??`ROOM ${index+1}`,index}));level.contentVersion='5.4.0';
 const program=solutionProgram(level);level.task.solutionProgram={id:program.id,schemaVersion:program.schemaVersion,stepCount:program.stepCount,echoRuns:program.echoRuns};
 fs.writeFileSync(path,JSON.stringify(level,null,2)+'\n');
 fs.writeFileSync(new URL(`${level.id}.json`,solutionsDir),JSON.stringify(program,null,2)+'\n');
}
console.log(`Authored ${files.length} levels and executable solution programs with connected district-scaled 20x20 playfields, progressive 2/3/4/5-run Echo routes, late-game patrols, fixed-coordinate portals, gated exits, and physical capability forks.`);
