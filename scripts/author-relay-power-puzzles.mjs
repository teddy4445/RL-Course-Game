import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src/content/levels');
const generated=/^patchRelay(?:Cell|Socket)\d+$/;

function find(level,id){const entity=level.geometry.entities.find(candidate=>candidate.id===id);if(!entity)throw new Error(`${level.id} is missing ${id}`);return entity;}
function key(x,y){return `${x},${y}`;}
function roomFor(level,point){return (level.scene.patchRooms??[]).find(room=>point.x>=room.x&&point.x<room.x+room.width&&point.y>=room.y&&point.y<room.y+room.height)??null;}
function reachableTiles(level,start){
 const blocked=new Set(level.geometry.entities.filter(entity=>entity.kind==='gate').map(entity=>key(entity.x,entity.y))),queue=[start],seen=new Set(),tiles=[];
 while(queue.length){const point=queue.shift(),id=key(point.x,point.y);if(seen.has(id)||blocked.has(id)||level.geometry.tiles[point.y]?.[point.x]!=='p')continue;seen.add(id);tiles.push(point);for(const [dx,dy] of [[0,-1],[1,0],[0,1],[-1,0]])queue.push({x:point.x+dx,y:point.y+dy});}
 return tiles;
}
function placePair(level,dock,stageIndex,number){
 const occupied=new Set(level.geometry.entities.map(entity=>key(entity.x,entity.y))),room=roomFor(level,dock),source=room?Array.from({length:room.height},(_,dy)=>Array.from({length:room.width},(_,dx)=>({x:room.x+dx,y:room.y+dy}))).flat():reachableTiles(level,dock);
 const candidates=source.filter(point=>level.geometry.tiles[point.y]?.[point.x]==='p'&&!occupied.has(key(point.x,point.y))&&!(point.x===level.actors.patchSpawn.x&&point.y===level.actors.patchSpawn.y));
 if(candidates.length<2)throw new Error(`${level.id} has no space for Patch relay power stage ${stageIndex+1}`);
 candidates.sort((a,b)=>(Math.abs(a.x-dock.x)+Math.abs(a.y-dock.y))-(Math.abs(b.x-dock.x)+Math.abs(b.y-dock.y))||a.y-b.y||a.x-b.x);
 const near=candidates.slice(0,Math.min(4,candidates.length)),socket=near[(number+stageIndex)%near.length],remaining=candidates.filter(point=>point!==socket);
 remaining.sort((a,b)=>(Math.abs(b.x-socket.x)+Math.abs(b.y-socket.y))-(Math.abs(a.x-socket.x)+Math.abs(a.y-socket.y))||b.y-a.y||b.x-a.x);
 return {cell:remaining[0],socket};
}

for(let number=2;number<=60;number++){
 const id=`L${String(number).padStart(2,'0')}`,file=path.join(root,`${id}.json`),level=JSON.parse(fs.readFileSync(file,'utf8'));
 level.geometry.entities=level.geometry.entities.filter(entity=>!generated.test(entity.id));
 const clean=items=>(items??[]).filter(item=>!generated.test(item));
 level.task.patchRoute=clean(level.task.patchRoute);
 level.task.patchRequirements=clean(level.task.patchRequirements);
 for(const stage of level.task.echoStages??[])stage.requirements=clean(stage.requirements);

 const stages=level.task.echoStages?.length?level.task.echoStages:[{dockId:'practiceDock',requirements:level.task.patchRequirements??[],final:true}],route=level.task.patchRoute?.length?[...level.task.patchRoute]:['latch','receiverControl','practiceDock'],generatedEntities=[];
 for(let stageIndex=0;stageIndex<stages.length;stageIndex++){
  const stage=stages[stageIndex],dock=find(level,stage.dockId),positions=placePair(level,dock,stageIndex,number),cellId=`patchRelayCell${stageIndex+1}`,socketId=`patchRelaySocket${stageIndex+1}`;
  generatedEntities.push({id:cellId,kind:'battery',x:positions.cell.x,y:positions.cell.y,patchOnly:true,relayCell:true,stageIndex},{id:socketId,kind:'socket',x:positions.socket.x,y:positions.socket.y,accepts:cellId,patchOnly:true,relayPower:true,stageIndex});
  const dockIndex=route.indexOf(stage.dockId);if(dockIndex>=0)route.splice(dockIndex,0,cellId,socketId);else route.push(cellId,socketId,stage.dockId);
  stage.requirements=[...new Set([...(stage.requirements??[]),socketId])];
  if(stage.final)level.task.patchRequirements=[...new Set([...(level.task.patchRequirements??[]),socketId])];
 }
 level.geometry.entities.push(...generatedEntities);
 level.task.patchRoute=route;
 level.task.patchPowerPuzzleCount=stages.length;
 level.task.patchPowerFlowVersion='relay-cells-v1';
 level.contentVersion='4.0.0';
 level.scene.layoutId=`${id.toLowerCase()}-relay-cells-v4`;
 fs.writeFileSync(file,JSON.stringify(level,null,2)+'\n');
}

console.log('Authored Patch relay-cell carry puzzles for L02-L60.');
