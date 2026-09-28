import {runCloningProbe,runDqnProbe} from '../agents/neural.js?v=0.4.0';

let generation=0;
self.onmessage=async ({data})=>{
 if(data.type==='cancel'){generation++;self.postMessage({type:'cancelled',jobId:data.jobId});return;}
 if(data.type!=='probe')return;
 const token=++generation,{jobId,mode}=data,started=performance.now();
 try{
  const run=mode==='dqn'?runDqnProbe:mode==='clone'?runCloningProbe:null;if(!run)throw new Error('Unknown neural probe.');
  const result=await run({updates:data.updates,seed:data.seed,
   cancelled:()=>token!==generation,
   onChunk:async progress=>{if(token!==generation)return;self.postMessage({type:'progress',jobId,mode,...progress});await new Promise(resolve=>setTimeout(resolve,0));}
  });
  if(token!==generation||result.cancelled)return;
  self.postMessage({type:'complete',jobId,mode,elapsedMs:performance.now()-started,...result});
 }catch(error){if(token===generation)self.postMessage({type:'error',jobId,mode,message:String(error?.message??error)});}
};
