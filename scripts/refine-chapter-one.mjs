import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const read=id=>JSON.parse(fs.readFileSync(path.join(root,'src/content/levels',`${id}.json`),'utf8'));
const write=level=>fs.writeFileSync(path.join(root,'src/content/levels',`${level.id}.json`),`${JSON.stringify(level,null,2)}\n`);
const remove=(level,ids)=>{const unwanted=new Set(ids);level.geometry.entities=level.geometry.entities.filter(entity=>!unwanted.has(entity.id));};
const entity=(level,id)=>level.geometry.entities.find(candidate=>candidate.id===id);
const simplifyObjective=level=>{level.task.objective.children=level.task.objective.children.filter(child=>!['gateLatched','stageComplete'].includes(child.op));};

{
 const level=read('L01'),patchExit=entity(level,'patchExit'),exitGate=entity(level,'exitGate'),echoExit=entity(level,'echoExit');
 level.contentVersion='5.3.0';
 level.geometry.entities=[
  {id:'patchRelayCell1',kind:'battery',x:5,y:6,patchOnly:true,relayCell:true,stageIndex:0,field:'patch',room:0},
  {id:'patchRelaySocket1',kind:'socket',x:11,y:14,accepts:'patchRelayCell1',patchOnly:true,relayPower:true,stageIndex:0,grantsCapability:'act-east',field:'patch',room:0},
  {id:'receiver',kind:'socket',x:8,y:9,accepts:'fuseA',field:'echo',room:0},
  {id:'fuseA',kind:'fuse',x:13,y:13,required:true,field:'echo',room:0},
  patchExit,exitGate,{...echoExit,x:8,y:9}
 ];
 level.actors.echoSpawn={x:8,y:13,facing:2,room:0};
 level.reward.weights.progress=.4;
 level.task={
  ...level.task,
  stages:['inspect','practice','repair','practice-again','extract'],
  horizonSteps:28,
  administrativeRolloutLimit:28,
  objective:{op:'all',children:[
   {op:'delivered',itemId:'patchRelayCell1'},
   {op:'delivered',itemId:'fuseA'},
   {op:'exitActivated',entityId:'patchExit'},
   {op:'atExit',actor:'echo',entityId:'echoExit'},
   {op:'notFailed'}
  ]},
  patchRoute:['patchRelayCell1','patchRelaySocket1'],
  patchRequirements:[],
  patchPowerPuzzleCount:1,
  patchPowerFlowVersion:'relay-capabilities-v2',
  requiredCapability:'act-east'
 };
 level.learning={
  ...level.learning,
  mode:'q-learning',
  allowedAlgorithms:['q-learning'],
  exposedControls:[],
  defaults:{priority:'delivery',future:'far',curiosity:'curious'},
  baseAllowedActions:[0,1,3,4,5],
  alpha:.1,
  episodesPerBatch:900,
  prior:null,
  starts:[],
  capabilityPuzzle:{group:'L01-relay',required:'act-east',options:['act-east']},
  capabilityVersion:'relay-sockets-v1',
  puzzleFocus:'actions',
  echoThreatVersion:'none'
 };
 write(level);
}

const chapterOne={
 L02:{grant:'act-east',baseAllowedActions:[0,1,3,4,5]},
 L03:{grant:'future-far'},
 L04:{grant:'explore-curious'},
 L05:{grant:'reward-delivery',secondGrant:'explore-curious'}
};

for(const [id,setup] of Object.entries(chapterOne)){
 const level=read(id);
 level.contentVersion='5.3.0';
 remove(level,['latch','receiverControl','practiceDock','heavyGate','capability1','capability2','securityGate1','securityGate2',...(id==='L05'?['relayDock1','securityLever2']:[])]);
 simplifyObjective(level);
 const socket1=entity(level,'patchRelaySocket1');socket1.grantsCapability=setup.grant;
 if(setup.baseAllowedActions)level.learning.baseAllowedActions=setup.baseAllowedActions;else delete level.learning.baseAllowedActions;
 if(id==='L02'){
  entity(level,'fuseA').x=14;
  level.learning.alpha=.1;
  level.reward.weights.progress=.4;
 }
 if(id==='L05'){
  const socket2=entity(level,'patchRelaySocket2');socket2.grantsCapability=setup.secondGrant;
  const portal2=entity(level,'patchPortal2');delete portal2.requires;
  level.task.patchRoute=['patchRelayCell1','patchRelaySocket1','securityLever1','patchRelayCell2','patchRelaySocket2'];
  level.task.patchRequirements=[];
  level.task.echoStages[0].dockId=null;level.task.echoStages[0].requirements=[];level.task.echoStages[0].requiredCapability=setup.grant;
  level.task.echoStages[1].dockId=null;level.task.echoStages[1].requirements=[];level.task.echoStages[1].requiredCapability=setup.secondGrant;
  level.learning.capabilityPuzzle={group:'L05-relays',required:setup.grant,options:[setup.grant,setup.secondGrant]};
 }else{
  level.task.patchRoute=[...(entity(level,'securityLever1')?['securityLever1']:[]),'patchRelayCell1','patchRelaySocket1'];
  level.task.patchRequirements=[];
 }
 level.task.patchPowerFlowVersion='relay-capabilities-v2';
 level.learning.capabilityVersion='relay-sockets-v1';
 write(level);
}

console.log('Refined L01-L05 around always-available Echo runs and socket-installed capabilities.');
