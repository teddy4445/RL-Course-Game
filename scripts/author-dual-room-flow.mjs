import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src/content/levels');

function entityAt(level,x,y){return level.geometry.entities.some(entity=>entity.x===x&&entity.y===y);}
function find(level,id){const entity=level.geometry.entities.find(candidate=>candidate.id===id);if(!entity)throw new Error(`${level.id} is missing ${id}`);return entity;}
function dockPosition(level,room,lever){
 const candidates=[];
 for(let y=room.y;y<room.y+room.height;y++)for(let x=room.x;x<room.x+room.width;x++){
  if(level.geometry.tiles[y]?.[x]!=='p'||entityAt(level,x,y)||(x===lever.x&&y===lever.y))continue;
  const distance=Math.abs(x-lever.x)+Math.abs(y-lever.y),edge=Math.min(x-room.x,room.x+room.width-1-x,y-room.y,room.y+room.height-1-y);
  candidates.push({x,y,score:distance*10+edge});
 }
 candidates.sort((a,b)=>b.score-a.score||a.y-b.y||a.x-b.x);
 if(!candidates.length)throw new Error(`${level.id} has no relay-dock tile before ${lever.id}`);
 return candidates[0];
}

for(let number=5;number<=60;number++){
 const id=`L${String(number).padStart(2,'0')}`,file=path.join(root,`${id}.json`),level=JSON.parse(fs.readFileSync(file,'utf8'));
 const rooms=level.task.patchRoomCount??level.scene.patchRooms?.length??1,stageCount=rooms>=5?3:2,separatorCount=Math.max(1,rooms-1);
 level.geometry.entities=level.geometry.entities.filter(entity=>!/^relayDock\d+$/.test(entity.id));
 for(const entity of level.geometry.entities){if(entity.kind==='gate'&&entity.patchOnly){delete entity.portal;delete entity.echoUnlock;}if(entity.kind==='lever'&&entity.patchOnly)delete entity.opensAfterEcho;}

 const portalGateNumbers=[];
 for(let stage=0;stage<stageCount-1;stage++){
  let gateNumber=Math.round((stage+1)*rooms/stageCount);gateNumber=Math.max(1,Math.min(separatorCount,gateNumber));
  while(portalGateNumbers.includes(gateNumber)&&gateNumber<separatorCount)gateNumber++;
  portalGateNumbers.push(gateNumber);
 }

 const relayDocks=[];
 for(const [stage,gateNumber] of portalGateNumbers.entries()){
  const gate=find(level,`securityGate${gateNumber}`),lever=find(level,`securityLever${gateNumber}`),room=level.scene.patchRooms[gateNumber-1],position=dockPosition(level,room,lever);
  gate.portal=true;gate.echoUnlock=true;lever.opensAfterEcho=true;
  const dock={id:`relayDock${stage+1}`,kind:'dock',x:position.x,y:position.y,patchOnly:true,stageIndex:stage,relay:true};
  level.geometry.entities.push(dock);relayDocks.push(dock);
 }
 const finalDock=find(level,'practiceDock');finalDock.stageIndex=stageCount-1;finalDock.relay=true;

 const originalRoute=(level.task.patchRoute??[]).filter(id=>!/^relayDock\d+$/.test(id)),patchRoute=[];
 for(const routeId of originalRoute){patchRoute.push(routeId);const relay=relayDocks.find((_,stage)=>routeId===`securityLever${portalGateNumbers[stage]}`);if(relay)patchRoute.push(relay.id);}
 const starts=level.learning.starts??[];
 const echoStages=relayDocks.map((dock,stage)=>({
  id:`relay-${stage+1}`,
  dockId:dock.id,
  gateId:`securityGate${portalGateNumbers[stage]}`,
  label:stage===0?'SIGNAL PROBE':'PRESSURE PROBE',
  challenge:stage===0?'Train Echo on a real pickup-and-return route to power the next portal.':'Recheck the frozen route from a shifted launch and hazard phase before the next portal.',
  requirements:patchRoute.slice(0,patchRoute.indexOf(dock.id)).filter(routeId=>!/^relayDock\d+$/.test(routeId)),
  startId:starts.length?starts[stage%starts.length].id:null,
  phase:stage
 }));
 echoStages.push({
  id:'live-delivery',dockId:'practiceDock',gateId:null,label:'LIVE DELIVERY',
  challenge:'Train or verify the cartridge for the real cargo run. This frozen deployment decides the mission.',
  requirements:[...(level.task.patchRequirements??[])],
  startId:starts.length?starts[(stageCount-1)%starts.length].id:null,
  phase:stageCount-1,requiresReceiver:true,final:true
 });

 level.contentVersion='3.0.0';
 level.scene.layoutId=`${id.toLowerCase()}-dual-room-stage-v3`;
 level.scene.presentation='dual-room-panels-v1';
 level.task.patchRoute=patchRoute;
 level.task.echoStages=echoStages;
 level.task.echoActivationCount=stageCount;
 level.task.dualPanelFlowVersion='relay-portals-v1';
 fs.writeFileSync(file,JSON.stringify(level,null,2)+'\n');
}

console.log('Authored dual-panel relay stages and Echo-powered Patch portals for L05-L60.');
