import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {LEVELS} from '../src/content/levels.js';
import {configuration} from '../src/sim/core.js';
import {evaluate} from '../src/agents/q-learning.js';
const workerURL=new URL('../src/training/worker.js',import.meta.url).href;
function transport(){
 // Node transport shim, not a substitute learner: import the actual ESM worker.
 const source=`import {parentPort} from 'node:worker_threads';\nglobalThis.self={postMessage:m=>parentPort.postMessage(m)};await import(${JSON.stringify(workerURL)});parentPort.on('message',data=>self.onmessage({data}));parentPort.postMessage({type:'ready'});`;
 return new Worker(new URL('data:text/javascript,'+encodeURIComponent(source)),{type:'module'});
}
test('Actual ESM worker trains, validates, and retains job/revision IDs',{timeout:15000},async()=>{
 const l=LEVELS[2],c=configuration(l,{future:'far'}),w=transport(),progress=[];
 try{
  const result=await new Promise((resolve,reject)=>{w.on('error',reject);w.on('message',d=>{
   if(d.type==='ready')w.postMessage({type:'train',jobId:13,revision:9,level:l,config:c,seed:l.seeds.root,episodes:1800,q:{}});
   else if(d.type==='progress'){assert.equal(d.jobId,13);assert.equal(d.revision,9);progress.push(d.completed);}
   else if(d.type==='complete')resolve(d);else if(d.type==='error')reject(new Error(d.message));
  });});
  assert.equal(progress.length,18);assert.equal(result.completed,1800);assert.equal(result.jobId,13);assert.equal(result.revision,9);
  assert.equal(result.validation.outcome,'delivered');assert.ok(Object.keys(result.q).length>0);
  assert.equal(evaluate(l,c,result.q,{seed:l.seeds.root+900000}).outcome,'delivered');
 }finally{await w.terminate();}
});
test('Actual ESM worker can be terminated without a committed checkpoint',{timeout:15000},async()=>{
 const l=LEVELS[1],w=transport();let committed=false;
 await new Promise((resolve,reject)=>{w.on('error',reject);w.on('message',d=>{
  if(d.type==='ready')w.postMessage({type:'train',jobId:1,revision:1,level:l,config:configuration(l),seed:99,episodes:100000,q:{}});
  if(d.type==='complete')committed=true;
  if(d.type==='progress')w.terminate().then(resolve,reject);
 });});
 assert.equal(committed,false);
});
test('Actual ESM worker evaluates a frozen Chapter 2 policy',{timeout:15000},async()=>{
 const l=LEVELS[5],w=transport(),progress=[];
 try{const result=await new Promise((resolve,reject)=>{w.on('error',reject);w.on('message',d=>{
  if(d.type==='ready')w.postMessage({type:'evaluate-policy',jobId:21,revision:3,level:l,config:configuration(l,{representation:'cargo'}),seed:l.seeds.root});
  else if(d.type==='progress')progress.push(d.sweep);else if(d.type==='complete')resolve(d);else if(d.type==='error')reject(new Error(d.message));
 });});assert.equal(result.jobId,21);assert.equal(result.revision,3);assert.equal(result.validation.outcome,'delivered');assert.equal(result.evaluation.successProbability,1);assert.ok(progress.length>1);
 }finally{await w.terminate();}
});
test('Actual ESM worker trains feature, Dyna, and policy-gradient cartridges',{timeout:15000},async()=>{
 for(const index of [25,30,35]){const l=LEVELS[index],w=transport();try{const result=await new Promise((resolve,reject)=>{w.on('error',reject);w.on('message',d=>{
   if(d.type==='ready')w.postMessage({type:'train',jobId:index,revision:4,level:l,config:configuration(l),seed:l.seeds.root,episodes:l.learning.episodesPerBatch,snapshot:null});
   else if(d.type==='complete')resolve(d);else if(d.type==='error')reject(new Error(d.message));
  });});assert.equal(result.jobId,index);assert.equal(result.revision,4);assert.equal(result.validation.outcome,'delivered');assert.ok(result.snapshot?.algorithm);
 }finally{await w.terminate();}}
});
