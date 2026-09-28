import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve('src/content/levels');
const roomNames=['ENTRY','CONTROL','SECURITY','RELAY','MACHINE','VAULT','DISPATCH'];

function designFor(number){
 if(number<=4)return {rooms:2,areaHeight:4,sentries:0};
 if(number<=7)return {rooms:3,areaHeight:5,sentries:number===7?1:0};
 if(number<=10)return {rooms:2,areaHeight:3,sentries:number===10?1:0};
 if(number<=20)return {rooms:3,areaHeight:5,sentries:number%5===0?1:0};
 if(number<=30)return {rooms:4,areaHeight:6,sentries:number%5===0?1:0};
 if(number<=40)return {rooms:5,areaHeight:7,sentries:number%5===0?2:0};
 if(number<=50)return {rooms:6,areaHeight:8,sentries:number%5===0?2:number%5===4?1:0};
 return {rooms:7,areaHeight:9,sentries:number%5===0?3:number%5===4?2:0};
}

function normalizeExistingPatrols(level,number){
 const before=JSON.stringify(level.geometry.entities),{sentries}=designFor(number),existing=level.geometry.entities.filter(entity=>entity.kind==='sentry');
 const keep=new Set(existing.slice(0,sentries).map(entity=>entity.id));
 level.geometry.entities=level.geometry.entities.filter(entity=>entity.kind!=='sentry'||keep.has(entity.id));
 const patrols=level.geometry.entities.filter(entity=>entity.kind==='sentry'),rooms=(level.scene.patchRooms??[]).map((room,index)=>({...room,index})).filter(room=>room.index>0&&room.width>=3);
 for(const [index,sentry] of patrols.entries()){
  const room=rooms[index%Math.max(1,rooms.length)];if(!room)continue;
  const occupied=new Set(level.geometry.entities.filter(entity=>entity.kind!=='sentry').map(entity=>`${entity.x},${entity.y}`)),runs=[];
  for(let y=room.y;y<room.y+room.height;y++){
   let start=null;
   for(let x=room.x;x<=room.x+room.width;x++){
    const clear=x<room.x+room.width&&level.geometry.tiles[y]?.[x]==='p'&&!occupied.has(`${x},${y}`);
    if(clear&&start===null)start=x;
    if(!clear&&start!==null){if(x-start>=3)runs.push({y,min:start,max:x-1,length:x-start});start=null;}
   }
  }
  const candidates=runs.sort((a,b)=>b.length-a.length||a.y-b.y||a.min-b.min),run=candidates[(number+index)%Math.max(1,candidates.length)];if(!run)continue;
  const x=Math.floor((run.min+run.max)/2),y=run.y;
  Object.assign(sentry,{x,y,axis:'x',min:run.min,max:run.max,direction:index%2?1:-1,home:{x,y},room:room.index+1});
 }
 level.task.patchSentryCount=sentries;
 level.task.patchPatrolRooms=patrols.map(entity=>entity.room);
 return before!==JSON.stringify(level.geometry.entities);
}

function setTile(grid,x,y,value){if(grid[y]?.[x]!==undefined)grid[y][x]=value;}

for(let number=3;number<=60;number++){
 const id=`L${String(number).padStart(2,'0')}`,file=path.join(root,`${id}.json`),level=JSON.parse(fs.readFileSync(file,'utf8'));
 if(level.task.patchDesignVersion==='progressive-rooms-v1'){
  if(normalizeExistingPatrols(level,number))fs.writeFileSync(file,JSON.stringify(level,null,2)+'\n');
  continue;
 }
 const originalWidth=level.geometry.width,originalHeight=level.geometry.height,exit=find(level,'patchExit'),exitY=exit.y;
 const {rooms,areaHeight,sentries}=designFor(number),width=Math.max(originalWidth,rooms*4),areaTop=exitY,areaBottom=areaTop+areaHeight-1,boundaryY=areaBottom+1,finalY=boundaryY+1,height=finalY+2;
 const grid=Array.from({length:height},()=>Array(width).fill('#'));

 // Preserve the complete Echo learning floor and the original upper Patch entry room.
 for(let y=0;y<exitY;y++)for(let x=0;x<originalWidth;x++)grid[y][x]=level.geometry.tiles[y][x];
 for(let y=areaTop;y<=areaBottom;y++)for(let x=1;x<width-1;x++)grid[y][x]='p';
 for(let x=1;x<width-1;x++)grid[finalY][x]='p';
 setTile(grid,2,exitY-1,'p');setTile(grid,2,areaTop,'p');

 const edges=Array.from({length:rooms+1},(_,index)=>index===0?1:index===rooms?width-1:Math.round(1+(width-2)*index/rooms));
 const separators=[];
 for(let index=1;index<rooms;index++){
  const x=edges[index],doorY=index%2?areaTop+1:areaBottom-1;
  for(let y=areaTop;y<=areaBottom;y++)grid[y][x]='#';
  grid[doorY][x]='p';separators.push({x,y:doorY,index});
 }

 // Each level gets a different but always connected set of machine islands.
 for(let room=0;room<rooms;room++){
  const left=edges[room]+1,right=edges[room+1]-1,span=right-left+1;
  if(span<3||areaHeight<5)continue;
  const x=left+((number+room)%span),y=areaTop+1+((number*3+room)%Math.max(1,areaHeight-2));
  if(x>left&&x<right&&!(room===rooms-1&&x>=right-1))grid[y][x]='#';
 }

 const entities=level.geometry.entities.filter(entity=>!entity.patchOnly&&entity.kind!=='sentry').map(entity=>({...entity}));
 const latch=entities.find(entity=>entity.id==='latch'),receiverControl=entities.find(entity=>entity.id==='receiverControl'),practiceDock=entities.find(entity=>entity.id==='practiceDock'),heavyGate=entities.find(entity=>entity.id==='heavyGate'),patchExit=entities.find(entity=>entity.id==='patchExit');
 const entryOptions=[[1,1],[5,1],[1,3],[5,3],[3,2],[2,5]],entry=entryOptions[number%entryOptions.length];
 Object.assign(latch,{x:entry[0],y:entry[1],checkpoint:true});setTile(grid,latch.x,latch.y,'p');
 Object.assign(heavyGate,{x:width-3,y:boundaryY,patchOnly:true});setTile(grid,heavyGate.x,heavyGate.y,'p');
 Object.assign(patchExit,{x:1,y:finalY});setTile(grid,patchExit.x,patchExit.y,'p');

 const lastLeft=edges[rooms-1]+1,lastRight=width-2;
 Object.assign(receiverControl,{x:lastRight-1,y:areaTop+1,checkpoint:true});
 Object.assign(practiceDock,{x:lastRight,y:areaBottom-1});
 setTile(grid,receiverControl.x,receiverControl.y,'p');setTile(grid,practiceDock.x,practiceDock.y,'p');
 setTile(grid,width-3,boundaryY,'p');

 const patchRoute=['latch'];
 for(const separator of separators){
  const gateId=`securityGate${separator.index}`,leverId=`securityLever${separator.index}`;
  entities.push({id:gateId,kind:'gate',x:separator.x,y:separator.y,patchOnly:true});
  const lever={id:leverId,kind:'lever',x:separator.x-1,y:separator.y,opens:gateId,patchOnly:true,checkpoint:true,room:separator.index};
  entities.push(lever);setTile(grid,lever.x,lever.y,'p');patchRoute.push(leverId);
 }
 patchRoute.push('receiverControl','practiceDock');

 for(const entity of entities){
  if(entity.kind==='core'&&!entity.echoCarry){entity.x=Math.max(3,Math.floor(width/2));entity.y=finalY;setTile(grid,entity.x,entity.y,'p');}
 }

 const patrolRooms=[],wideRooms=Array.from({length:rooms},(_,room)=>({room,left:edges[room]+1,right:edges[room+1]-1})).filter(candidate=>candidate.room>0&&candidate.right-candidate.left+1>=3);
 for(let index=0;index<sentries;index++){
  const selected=wideRooms[index%Math.max(1,wideRooms.length)]??{room:Math.min(rooms-2,1+index),left:edges[Math.min(rooms-2,1+index)]+1,right:edges[Math.min(rooms-2,1+index)+1]-1},room=selected.room,left=selected.left,right=selected.right,y=areaTop+1+(number+index)%Math.max(1,areaHeight-2),x=Math.floor((left+right)/2);
  const sentry={id:`patchSentry${index+1}`,kind:'sentry',x,y,patchOnly:true,axis:'x',min:left,max:right,speed:2+index%2,direction:index%2?1:-1,phase:(number+index)%3,home:{x,y},room:room+1};
  entities.push(sentry);setTile(grid,x,y,'p');patrolRooms.push(room+1);
 }

 const patchRooms=Array.from({length:rooms},(_,index)=>({label:roomNames[index]??`ROOM ${index+1}`,x:edges[index]+1,y:areaTop,width:Math.max(1,edges[index+1]-edges[index]-1),height:areaHeight}));
 level.contentVersion='2.0.0';
 level.scene.layoutId=`${id.toLowerCase()}-progressive-rooms-v2`;
 level.scene.patchRooms=patchRooms;
 level.geometry={width,height,tiles:grid.map(row=>row.join('')),entities};
 level.learning.echoGeometry={width:originalWidth,height:originalHeight};
 level.task.patchDesignVersion='progressive-rooms-v1';
 level.task.patchRoute=patchRoute;
 level.task.patchRequirements=patchRoute.filter(target=>target!=='practiceDock');
 level.task.patchRoomCount=rooms;
 level.task.patchSentryCount=sentries;
 level.task.patchPatrolRooms=patrolRooms;
 fs.writeFileSync(file,JSON.stringify(level,null,2)+'\n');
}

function find(level,id){const entity=level.geometry.entities.find(candidate=>candidate.id===id);if(!entity)throw new Error(`${level.id} is missing ${id}`);return entity;}

console.log('Expanded Patch gameplay for L03-L60 with progressive linked rooms, security doors, and milestone patrols.');
