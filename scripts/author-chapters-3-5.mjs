import fs from 'node:fs';
import path from 'node:path';

const root=path.resolve(import.meta.dirname,'..');
const levelDir=path.join(root,'src','content','levels');
const directions=[[0,-1],[1,0],[0,1],[-1,0]];

function cells(...paths){
 const out=new Set();
 for(const points of paths)for(let i=0;i<points.length-1;i++){
  let [x,y]=points[i], [tx,ty]=points[i+1];out.add(`${x},${y}`);
  while(x!==tx||y!==ty){if(x!==tx)x+=Math.sign(tx-x);else y+=Math.sign(ty-y);out.add(`${x},${y}`);}
 }
 return out;
}

function geometry(width,height,echoCells,entities){
 const tiles=Array.from({length:height},(_,y)=>Array.from({length:width},(_,x)=>{
  if(x===0||y===0||x===width-1||y===height-1)return '#';
  if(echoCells.has(`${x},${y}`))return 'e';
  if(x<=5&&y<=height-2||y===height-2&&x<=width-2)return 'p';
  return '#';
 }).join(''));
 return {width,height,tiles,entities};
}

function common(width,height,extras){return [
 {id:'latch',kind:'lever',x:3,y:2,opens:'heavyGate'},
 {id:'receiverControl',kind:'console',x:3,y:4},
 {id:'practiceDock',kind:'dock',x:5,y:5},
 {id:'heavyGate',kind:'gate',x:6,y:height-2},
 ...extras,
 {id:'patchExit',kind:'exit-patch',x:width-2,y:height-2}
];}

function objective(items,{core=null,extra=[]}={}){return {op:'all',children:[
 ...items.map(itemId=>({op:'delivered',itemId})),
 {op:'atExit',actor:'patch',entityId:'patchExit'},
 {op:'atExit',actor:'echo',entityId:'echoExit'},
 {op:'gateLatched',entityId:'heavyGate'},
 {op:'stageComplete',stage:'receiver-ready'},
 ...(core?[{op:'itemOwned',actor:'patch',itemId:core}]:[]),...extra,{op:'notFailed'}
]};}

const chapterMeta={
 C03:{theme:'switchworks',assetGroup:'c03',root:43000,reward:'c03-planning-v1'},
 C04:{theme:'courier-quarter',assetGroup:'c04',root:44000,reward:'c04-prediction-v1'},
 C05:{theme:'neon-market',assetGroup:'c05',root:45000,reward:'c05-control-v1'}
};

function level({id,chapterId,title,concepts,echoCells,entities,echoSpawn,items,learning,horizon=42,horizonBasis='echo',core=null,stages=['prepare','compute','dispatch','extract'],reward={},width=16,height=10}){
 const n=Number(id.slice(1)),meta=chapterMeta[chapterId];
 return {
  schemaVersion:1,id,chapterId,contentVersion:'1.0.0',title,
  alignment:{status:'proposed',concepts,slideEvidence:[]},prerequisites:[`L${String(n-1).padStart(2,'0')}`],
  scene:{theme:meta.theme,layoutId:`${id.toLowerCase()}-room-v1`,assetGroup:meta.assetGroup},
  geometry:geometry(width,height,echoCells,common(width,height,entities)),
  actors:{patchSpawn:{x:2,y:height-3,facing:1},echoSpawn:{...echoSpawn}},
  task:{stages,horizonSteps:horizon,horizonBasis,administrativeRolloutLimit:horizon??72,objective:objective(items,{core})},
  observation:{profileId:`${meta.theme}-state-v1`,encoderId:chapterId==='C05'?'tabular-control-v2':chapterId==='C04'?'tabular-prediction-v1':'known-model-tabular-v2',fields:['x','y','facing','cargo','required-mask','gate-mask','hazard-phase','remaining-time']},
  learning,
  reward:{id:meta.reward,weights:{delivery:14,requiredPickup:1,gate:2,step:-.08,caught:-12,scrap:0,...reward},oneShotEvents:['pickup','gate-open','delivery']},
  seeds:{root:meta.root+n,domains:['train','validation','audit','environment','policy']},
  evaluation:{snapshotMode:'frozen',protocolId:chapterId==='C04'?'fixed-policy-prediction-clear-v1':chapterId==='C05'?'frozen-control-clear-v1':'known-model-plan-clear-v1',epsilon:0},
  medals:['clear'],cues:[{event:'delivery',audio:'echo_delivery'},{event:'mission-clear',audio:n%5===0?'stinger_district_restored':'stinger_heist_clear'}],
  validation:{referenceRecipeId:`${id.toLowerCase()}-reference-v1`,testedContentHash:null}
 };
}

const planDefaults={representation:'full',start:'dock'};
const planner=(mode,policies,{controls=['policy'],defaults={},model={},maxSweeps=96}={})=>({
 mode,allowedAlgorithms:[mode],exposedControls:controls,
 controls:controls.map(id=>id==='policy'?{id,label:'Courier policy',items:policies.map(p=>[p.id,p.label])}:id==='modelRevision'?{id,label:'Machine revision',items:[['old','Old switchboard'],['new','Changed switchboard']]}:{id,label:id,items:[]}),
 defaults:{...planDefaults,policy:policies[0]?.id??'initial',...defaults},gamma:.96,maxSweeps,tolerance:1e-8,policies,starts:[{id:'dock',label:'Dock',x:8,y:5}],model
});

const levels=[];

// C03: exact-model planning. The layouts have visible forks, gates and staged cargo.
{
 const lane=cells([[8,5],[13,5]],[[8,5],[8,2],[13,2],[13,5]]);
 levels.push(level({id:'L11',chapterId:'C03',title:'Wrong Turn',concepts:['one-step-policy-improvement'],echoCells:lane,echoSpawn:{x:8,y:5,facing:2},items:['switchFuse'],entities:[
  {id:'switchFuse',kind:'fuse',x:13,y:5,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:5,accepts:'switchFuse'},{id:'echoExit',kind:'exit-echo',x:8,y:5}
 ],learning:planner('policy-improvement',[
  {id:'wrong-turn',label:'Keep the wasteful turn',blockedCells:['9,5','10,5','11,5','12,5']},
  {id:'repair-turn',label:'Repair this junction',blockedCells:[]}
 ],{maxSweeps:64}),horizon:30}));
}
{
 const lane=cells([[8,5],[14,5]],[[8,5],[8,2],[11,2],[11,5]],[[11,2],[14,2],[14,5]]);
 levels.push(level({id:'L12',chapterId:'C03',title:'Chain Reaction',concepts:['policy-iteration','iterative-policy-evaluation'],echoCells:lane,echoSpawn:{x:8,y:5,facing:2},items:['switchKey'],entities:[
  {id:'switchKey',kind:'token',x:14,y:2,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:5,accepts:'switchKey'},{id:'echoExit',kind:'exit-echo',x:8,y:5}
 ],learning:planner('policy-iteration',[{id:'initial',label:'Old junction policy',blockedCells:['9,5','10,5']}],{controls:[],defaults:{policy:'initial'},maxSweeps:80}),horizon:36}));
}
{
 const lane=cells([[8,6],[8,2],[14,2],[14,6],[10,6],[10,4],[12,4]]);
 levels.push(level({id:'L13',chapterId:'C03',title:'Ripple Effect',concepts:['value-iteration','bellman-optimality'],echoCells:lane,echoSpawn:{x:8,y:6,facing:1},items:['rippleCell'],entities:[
  {id:'rippleCell',kind:'power-cell',x:12,y:4,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:6,accepts:'rippleCell'},{id:'echoExit',kind:'exit-echo',x:8,y:6}
 ],learning:planner('value-iteration',[{id:'initial',label:'Blank circuit values',blockedCells:[]}],{controls:[],defaults:{policy:'initial'},maxSweeps:96}),horizon:50}));
}
{
 const lane=cells([[8,5],[8,2],[14,2],[14,5],[8,5]],[[10,2],[10,5]],[[12,2],[12,5]]);
 levels.push(level({id:'L14',chapterId:'C03',title:'One Door Closed',concepts:['known-model-replanning','environment-revision'],echoCells:lane,echoSpawn:{x:8,y:5,facing:1},items:['revisionFuse'],entities:[
  {id:'topSwitchGate',kind:'gate',x:11,y:2},{id:'lowerSwitchGate',kind:'gate',x:11,y:5},
  {id:'revisionFuse',kind:'fuse',x:14,y:2,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:5,accepts:'revisionFuse'},{id:'echoExit',kind:'exit-echo',x:8,y:5}
 ],learning:planner('value-iteration',[{id:'initial',label:'Replanned route',blockedCells:[]}],{controls:['modelRevision'],defaults:{policy:'initial',modelRevision:'new'},model:{revisions:[{id:'old',openGates:['topSwitchGate']},{id:'new',openGates:['lowerSwitchGate']}]},maxSweeps:80}),horizon:40}));
}
{
 const lane=cells([[8,6],[8,2],[14,2],[14,6],[8,6]],[[10,2],[10,6]],[[12,2],[12,6]]);
 levels.push(level({id:'L15',chapterId:'C03',title:'The Switchmaster',concepts:['integrated-dynamic-programming'],echoCells:lane,echoSpawn:{x:8,y:6,facing:1},items:['relayA','relayB','relayC'],core:'switchCore',entities:[
  {id:'relayA',kind:'fuse',x:10,y:2,required:true,sequence:1},{id:'socketA',kind:'socket',x:14,y:2,accepts:'relayA'},
  {id:'relayB',kind:'power-cell',x:14,y:6,required:true,sequence:2},{id:'socketB',kind:'socket',x:10,y:6,accepts:'relayB'},
  {id:'relayC',kind:'token',x:12,y:2,required:true,sequence:3},{id:'receiver',kind:'socket',x:8,y:6,accepts:'relayC'},{id:'echoExit',kind:'exit-echo',x:8,y:6},
  {id:'switchCore',kind:'core',x:11,y:8,required:true,requiresDelivery:true}
 ],learning:planner('value-iteration',[{id:'initial',label:'Three-stage circuit',blockedCells:[]}],{controls:[],defaults:{policy:'initial'},maxSweeps:80}),horizon:45}));
}

const prediction=(policies,{controls=[],defaults={},starts=[{id:'dock',label:'Central dock',x:8,y:5}],model={}}={})=>({
 mode:'prediction',allowedAlgorithms:['first-visit-mc','td-0','td-lambda'],exposedControls:controls,
 controls:controls.map(id=>id==='policy'?{id,label:'Fixed courier line',items:policies.map(p=>[p.id,p.label])}:id==='start'?{id,label:'Dispatch depot',items:starts.map(s=>[s.id,s.label])}:id==='recorder'?{id,label:'Value recorder',items:[['mc','Completed receipts / MC'],['td','Immediate updates / TD(0)'],['trace','Fading traces / TD(lambda)']]}:id==='trace'?{id,label:'Trace reach',items:[['none','No trace'],['long','Long fading trace']]}:{id,label:id,items:[]}),
 defaults:{policy:policies[0].id,start:starts[0].id,recorder:'mc',trace:'long',...defaults},gamma:.95,alpha:.15,lambda:.8,episodesPerBatch:48,policies,starts,model
});

// C04: model-free value prediction. Policies remain immutable during recording.
{
 const lane=cells([[8,5],[14,5]],[[8,5],[8,2],[14,2],[14,5]]),starts=[{id:'north',label:'North receipts',x:8,y:2},{id:'south',label:'South receipts',x:8,y:5}];
 levels.push(level({id:'L16',chapterId:'C04',title:'Return Receipt',concepts:['first-visit-monte-carlo'],echoCells:lane,echoSpawn:{x:8,y:5,facing:2},items:['receiptParcel'],entities:[
  {id:'receiptParcel',kind:'fuse',x:14,y:5,required:true,sequence:1},{id:'receiver',kind:'socket',x:11,y:2,accepts:'receiptParcel'},{id:'echoExit',kind:'exit-echo',x:11,y:2}
 ],learning:prediction([{id:'courier',label:'Immutable courier policy',blockedCells:[]}],{controls:['start'],defaults:{recorder:'mc'},starts}),horizon:38}));
}
{
 const lane=cells([[8,6],[8,2],[14,2],[14,6],[10,6]]),starts=[{id:'early',label:'Early platform',x:8,y:6},{id:'midway',label:'Midway platform',x:12,y:2}];
 levels.push(level({id:'L17',chapterId:'C04',title:'Midway Message',concepts:['td-prediction','bootstrapping'],echoCells:lane,echoSpawn:{x:8,y:6,facing:1},items:['messageTube'],entities:[
  {id:'messageTube',kind:'token',x:14,y:6,required:true,sequence:1},{id:'receiver',kind:'socket',x:10,y:6,accepts:'messageTube'},{id:'echoExit',kind:'exit-echo',x:10,y:6}
 ],learning:prediction([{id:'courier',label:'Immutable courier policy',blockedCells:[]}],{controls:['start'],defaults:{recorder:'td'},starts}),horizon:42}));
}
{
 const lane=cells([[8,5],[14,5]],[[8,5],[8,2],[14,2],[14,5]]);
 levels.push(level({id:'L18',chapterId:'C04',title:'One Lucky Delivery',concepts:['sampling-variability','sample-support'],echoCells:lane,echoSpawn:{x:8,y:5,facing:2},items:['luckyParcel'],entities:[
  {id:'luckyParcel',kind:'power-cell',x:14,y:5,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:5,accepts:'luckyParcel'},{id:'echoExit',kind:'exit-echo',x:8,y:5}
 ],learning:prediction([
  {id:'elevator',label:'Uncertain express lift',blockedCells:['9,5','10,5','11,5','12,5','13,5']},
  {id:'stairs',label:'Dependable stairs',blockedCells:['9,2','10,2','11,2','12,2','13,2']}
 ],{controls:['policy'],defaults:{recorder:'mc'},model:{stochasticTransitions:[{id:'elevator-delay',cells:['8,2','9,2','10,2','11,2','12,2','13,2'],probability:.38,outcomeAction:0}]}}),horizon:40}));
}
{
 const lane=cells([[8,6],[8,2],[14,2],[14,6],[8,6]]);
 levels.push(level({id:'L19',chapterId:'C04',title:'Fading Footprints',concepts:['eligibility-traces','td-lambda'],echoCells:lane,echoSpawn:{x:8,y:6,facing:1},items:['traceParcel'],entities:[
  {id:'traceParcel',kind:'fuse',x:14,y:2,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:6,accepts:'traceParcel'},{id:'echoExit',kind:'exit-echo',x:8,y:6}
 ],learning:prediction([{id:'courier',label:'Immutable courier policy',blockedCells:[]}],{controls:['trace'],defaults:{recorder:'trace'}}),horizon:42}));
}
{
 const lane=cells([[8,6],[8,2],[14,2],[14,6],[8,6]],[[11,2],[11,6]]),starts=[{id:'north',label:'North tube',x:8,y:2},{id:'center',label:'Center tube',x:11,y:6},{id:'south',label:'South tube',x:8,y:6}];
 levels.push(level({id:'L20',chapterId:'C04',title:'Blind Delivery',concepts:['model-free-prediction','sampling-budget'],echoCells:lane,echoSpawn:{x:8,y:6,facing:1},items:['blindCore'],core:'quarterCore',entities:[
  {id:'blindCore',kind:'core',x:14,y:2,required:true,echoCarry:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:6,accepts:'blindCore'},{id:'echoExit',kind:'exit-echo',x:8,y:6},{id:'quarterCore',kind:'core',x:11,y:8,required:true,requiresDelivery:true}
 ],learning:prediction([{id:'courier',label:'Immutable courier policy',blockedCells:[]}],{controls:['recorder','start'],starts,model:{stochasticTransitions:[{id:'tube-delay',cells:['11,2','11,3','11,4','11,5'],probability:.22,outcomeAction:0}]}}),horizon:46}));
}

const control=(mode,{controls=[],defaults={},starts=null,episodes=900}={})=>({
 mode,allowedAlgorithms:[mode],exposedControls:controls,
 controls:controls.map(id=>id==='exploration'?{id,label:'Practice exploration',items:[['low','Constant low'],['decay','Wide then gradual decay']]}:id==='start'?{id,label:'Training dock',items:starts.map(s=>[s.id,s.label])}:{id,label:id,items:[]}),
 defaults:{exploration:'decay',...(starts?{start:starts[0].id}:{}),...defaults},alpha:.32,gamma:.95,episodesPerBatch:episodes,...(starts?{starts}:{}),prior:null
});

// C05: real model-free control. L23/L24 share exactly the same hazard task.
{
 const lane=cells([[8,5],[9,5]],[[8,5],[8,4],[9,4],[9,5]]);
 levels.push(level({id:'L21',chapterId:'C05',title:'Unmarked Alley',concepts:['action-values','model-free-control'],echoCells:lane,echoSpawn:{x:8,y:5,facing:2},items:['alleyToken'],entities:[
  {id:'alleyToken',kind:'token',x:9,y:5,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:5,accepts:'alleyToken'},{id:'echoExit',kind:'exit-echo',x:8,y:5}
 ],learning:control('q-learning',{controls:['exploration'],episodes:450}),horizon:12,reward:{delivery:20,requiredPickup:3,step:-.05}}));
}
{
 const lane=cells([[8,5],[8,4],[10,4],[10,5],[8,5]],[[9,4],[9,5]]);
 levels.push(level({id:'L22',chapterId:'C05',title:'Greedy Too Soon',concepts:['epsilon-greedy','exploration-schedule'],echoCells:lane,echoSpawn:{x:8,y:5,facing:1},items:['marketPass'],entities:[
  {id:'marketPass',kind:'power-cell',x:9,y:5,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:5,accepts:'marketPass'},{id:'echoExit',kind:'exit-echo',x:8,y:5}
 ],learning:control('q-learning',{controls:['exploration'],episodes:420}),horizon:14,reward:{delivery:20,requiredPickup:3,step:-.06}}));
}
const edgeLane=cells([[8,5],[11,5]],[[8,5],[8,3],[11,3],[11,5]]);
const edgeEntities=[{id:'edgeParcel',kind:'fuse',x:11,y:5,required:true,sequence:1},{id:'receiver',kind:'socket',x:8,y:5,accepts:'edgeParcel'},{id:'echoExit',kind:'exit-echo',x:8,y:5},{id:'recyclerA',kind:'laser',x:10,y:5,period:4,activePhases:[0,1]}];
levels.push(level({id:'L23',chapterId:'C05',title:'Edge Runner',concepts:['sarsa','on-policy-control'],echoCells:edgeLane,echoSpawn:{x:8,y:5,facing:2},items:['edgeParcel'],entities:edgeEntities,learning:control('sarsa',{controls:['exploration'],episodes:210}),horizon:28,reward:{delivery:20,requiredPickup:3,step:-.05}}));
levels.push(level({id:'L24',chapterId:'C05',title:'Perfect Plan, Imperfect Pilot',concepts:['q-learning','off-policy-control'],echoCells:edgeLane,echoSpawn:{x:8,y:5,facing:2},items:['edgeParcel'],entities:edgeEntities,learning:control('q-learning',{controls:['exploration'],episodes:210}),horizon:28,reward:{delivery:20,requiredPickup:3,step:-.05}}));
{
 const lane=cells([[8,5],[10,5]],[[8,5],[8,4],[10,4],[10,5]],[[9,4],[9,5]]),starts=[{id:'west',label:'West blackout dock',x:8,y:5},{id:'center',label:'Center blackout dock',x:9,y:4},{id:'east',label:'East blackout dock',x:10,y:5}];
 levels.push(level({id:'L25',chapterId:'C05',title:'Market Blackout',concepts:['integrated-model-free-control','start-distribution'],echoCells:lane,echoSpawn:{x:8,y:5,facing:1},items:['coreHalfA','coreHalfB'],core:'marketCore',entities:[
  {id:'coreHalfA',kind:'fuse',x:9,y:5,required:true,sequence:1},{id:'socketA',kind:'socket',x:10,y:5,accepts:'coreHalfA'},
  {id:'coreHalfB',kind:'power-cell',x:9,y:5,required:true,sequence:2},{id:'receiver',kind:'socket',x:8,y:5,accepts:'coreHalfB'},{id:'echoExit',kind:'exit-echo',x:8,y:5},
  {id:'marketCore',kind:'core',x:11,y:8,required:true,requiresDelivery:true}
 ],learning:control('q-learning',{controls:['exploration','start'],starts,episodes:330}),horizon:18,reward:{delivery:22,requiredPickup:4,step:-.04}}));
}

for(const candidate of levels){
 const file=path.join(levelDir,`${candidate.id}.json`);
 fs.writeFileSync(file,JSON.stringify(candidate,null,2)+'\n');
}
console.log(`Authored ${levels.length} canonical levels: ${levels[0].id}-${levels.at(-1).id}.`);
