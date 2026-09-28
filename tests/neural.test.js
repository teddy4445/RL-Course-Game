import test from 'node:test';
import assert from 'node:assert/strict';
import {Worker} from 'node:worker_threads';
import {createMlp,cloneMlp,createAdam,forward,softmax,dqnTarget,trainDqnExample,parameterChecksum,runCloningProbe,runDqnProbe} from '../src/agents/neural.js';

test('F06 standard DQN target uses the target-network maximum',()=>{
 assert.ok(Math.abs(dqnTarget({reward:1,gamma:.9,nextValues:[2,7],terminal:false})-7.3)<1e-12);
 assert.equal(dqnTarget({reward:1,gamma:.9,nextValues:[2,7],terminal:true}),1);
});
test('F07 softmax is stable and honors legal-action masks',()=>{
 assert.deepEqual(softmax(Array(6).fill(1000)).map(value=>Number(value.toFixed(12))),Array(6).fill(Number((1/6).toFixed(12))));
 const masked=softmax(Array(6).fill(1000),[1,1,1,1,1,0]);assert.equal(masked[5],0);for(const value of masked.slice(0,5))assert.ok(Math.abs(value-.2)<1e-12);
});
test('Target parameters remain separate until an explicit copy',()=>{
 const online=createMlp({inputSize:2,seed:3}),target=cloneMlp(online),adam=createAdam(online),before=parameterChecksum(target);
 trainDqnExample(online,target,adam,{input:[1,0],action:0,reward:1,nextInput:[0,1],terminal:false});
 assert.notEqual(parameterChecksum(online),before);assert.equal(parameterChecksum(target),before);
});
test('Cloning probe reduces loss and chooses by observation on shifted starts',async()=>{
 const out=await runCloningProbe({updates:500,seed:7});assert.equal(out.cancelled,false);assert.equal(out.correct,out.total);assert.notEqual(out.initialChecksum,out.finalChecksum);assert.ok(out.loss<.2);
});
test('Tiny DQN probe updates real parameters and learns distinct actions',async()=>{
 const out=await runDqnProbe({updates:1200,seed:9});assert.equal(out.cancelled,false);assert.equal(out.correct,out.total);assert.ok(out.targetCopies>=1);assert.notEqual(out.initialChecksum,out.finalChecksum);
});
test('Plain-JS snapshot inference is finite',()=>{const model=createMlp({inputSize:2,seed:11});assert.ok(forward(model,[.2,.8]).output.every(Number.isFinite));});

const workerURL=new URL('../src/training/neural-worker.js',import.meta.url).href;
function transport(){const source=`import {parentPort} from 'node:worker_threads';globalThis.self={postMessage:m=>parentPort.postMessage(m)};await import(${JSON.stringify(workerURL)});parentPort.on('message',data=>self.onmessage({data}));parentPort.postMessage({type:'ready'});`;return new Worker(new URL('data:text/javascript,'+encodeURIComponent(source)),{type:'module'});}
test('Neural worker completes a cloning job and exports a snapshot',{timeout:15000},async()=>{
 const worker=transport();try{const result=await new Promise((resolve,reject)=>worker.on('message',data=>{if(data.type==='ready')worker.postMessage({type:'probe',jobId:4,mode:'clone',updates:500,seed:19});else if(data.type==='complete')resolve(data);else if(data.type==='error')reject(new Error(data.message));}));assert.equal(result.jobId,4);assert.equal(result.correct,result.total);assert.equal(result.snapshot.schemaVersion,1);}finally{await worker.terminate();}
});
test('Neural worker cancellation does not publish a completed snapshot',{timeout:15000},async()=>{
 const worker=transport();let completed=false;try{await new Promise((resolve,reject)=>worker.on('message',data=>{if(data.type==='ready')worker.postMessage({type:'probe',jobId:5,mode:'dqn',updates:100000,seed:23});else if(data.type==='progress')worker.postMessage({type:'cancel',jobId:5});else if(data.type==='cancelled')resolve();else if(data.type==='complete')completed=true;else if(data.type==='error')reject(new Error(data.message));}));assert.equal(completed,false);}finally{await worker.terminate();}
});
