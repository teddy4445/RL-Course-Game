import {rng} from './q-learning.js?v=1.6.0';

const PARAMS=['w1','b1','w2','b2'];
const finiteArray=(values,length,name)=>{
 if(!Array.isArray(values)||values.length!==length||values.some(value=>!Number.isFinite(value)))throw new Error(`Invalid ${name} parameter array.`);
 return [...values];
};

export function createMlp({inputSize,hiddenSize=8,outputSize=6,seed=1}){
 if(!Number.isInteger(inputSize)||inputSize<1||!Number.isInteger(hiddenSize)||hiddenSize<1||!Number.isInteger(outputSize)||outputSize<1)throw new Error('Invalid network dimensions.');
 const random=rng(seed),scale1=Math.sqrt(2/inputSize),scale2=Math.sqrt(2/hiddenSize),sample=scale=>(random()*2-1)*scale;
 return {schemaVersion:1,inputSize,hiddenSize,outputSize,
  w1:Array.from({length:inputSize*hiddenSize},()=>sample(scale1)),b1:Array(hiddenSize).fill(0),
  w2:Array.from({length:hiddenSize*outputSize},()=>sample(scale2)),b2:Array(outputSize).fill(0)};
}

export function cloneMlp(model){return loadMlp(snapshotMlp(model));}
export function snapshotMlp(model){return {schemaVersion:1,inputSize:model.inputSize,hiddenSize:model.hiddenSize,outputSize:model.outputSize,...Object.fromEntries(PARAMS.map(key=>[key,[...model[key]]]))};}
export function loadMlp(value){
 if(!value||value.schemaVersion!==1)throw new Error('Invalid network snapshot.');
 const {inputSize,hiddenSize,outputSize}=value;
 if(!Number.isInteger(inputSize)||!Number.isInteger(hiddenSize)||!Number.isInteger(outputSize)||inputSize<1||hiddenSize<1||outputSize<1)throw new Error('Invalid network snapshot dimensions.');
 return {schemaVersion:1,inputSize,hiddenSize,outputSize,
  w1:finiteArray(value.w1,inputSize*hiddenSize,'w1'),b1:finiteArray(value.b1,hiddenSize,'b1'),
  w2:finiteArray(value.w2,hiddenSize*outputSize,'w2'),b2:finiteArray(value.b2,outputSize,'b2')};
}

export function forward(model,input){
 if(!Array.isArray(input)||input.length!==model.inputSize||input.some(value=>!Number.isFinite(value)))throw new Error('Invalid network input.');
 const hidden=Array(model.hiddenSize).fill(0),output=Array(model.outputSize).fill(0);
 for(let h=0;h<model.hiddenSize;h++){
  let sum=model.b1[h];for(let i=0;i<model.inputSize;i++)sum+=input[i]*model.w1[i*model.hiddenSize+h];hidden[h]=Math.max(0,sum);
 }
 for(let o=0;o<model.outputSize;o++){
  let sum=model.b2[o];for(let h=0;h<model.hiddenSize;h++)sum+=hidden[h]*model.w2[h*model.outputSize+o];output[o]=sum;
 }
 return {hidden,output};
}

export function softmax(logits,mask=null){
 const legal=logits.map((_,index)=>!mask||mask[index]!==0),max=Math.max(...logits.filter((_,index)=>legal[index]));
 if(!Number.isFinite(max))throw new Error('At least one action must be legal.');
 const weights=logits.map((value,index)=>legal[index]?Math.exp(value-max):0),sum=weights.reduce((a,b)=>a+b,0);
 return weights.map(value=>value/sum);
}

export function predict(model,input,{mask=null,probabilities=false}={}){
 const output=forward(model,input).output,values=probabilities?softmax(output,mask):output;
 let action=0,best=-Infinity;for(let i=0;i<values.length;i++)if((!mask||mask[i]!==0)&&values[i]>best){best=values[i];action=i;}
 return {action,values};
}

export function dqnTarget({reward,gamma,nextValues,terminal}){return reward+(terminal?0:gamma*Math.max(...nextValues));}

export function createAdam(model){
 const state={step:0,m:{},v:{}};for(const key of PARAMS){state.m[key]=Array(model[key].length).fill(0);state.v[key]=Array(model[key].length).fill(0);}return state;
}

function gradients(model,input,outputGradient,hidden){
 const grad={w1:Array(model.w1.length).fill(0),b1:Array(model.b1.length).fill(0),w2:Array(model.w2.length).fill(0),b2:[...outputGradient]};
 const hiddenGradient=Array(model.hiddenSize).fill(0);
 for(let h=0;h<model.hiddenSize;h++)for(let o=0;o<model.outputSize;o++){
  const index=h*model.outputSize+o;grad.w2[index]=hidden[h]*outputGradient[o];hiddenGradient[h]+=model.w2[index]*outputGradient[o];
 }
 for(let h=0;h<model.hiddenSize;h++){
  const value=hidden[h]>0?hiddenGradient[h]:0;grad.b1[h]=value;
  for(let i=0;i<model.inputSize;i++)grad.w1[i*model.hiddenSize+h]=input[i]*value;
 }
 return grad;
}

function applyAdam(model,grad,adam,{learningRate=.01,clipNorm=5,beta1=.9,beta2=.999,epsilon=1e-8}={}){
 let norm2=0;for(const key of PARAMS)for(const value of grad[key])norm2+=value*value;
 const scale=Math.sqrt(norm2)>clipNorm?clipNorm/Math.sqrt(norm2):1;adam.step++;
 for(const key of PARAMS)for(let i=0;i<model[key].length;i++){
  const g=grad[key][i]*scale;adam.m[key][i]=beta1*adam.m[key][i]+(1-beta1)*g;adam.v[key][i]=beta2*adam.v[key][i]+(1-beta2)*g*g;
  const m=adam.m[key][i]/(1-beta1**adam.step),v=adam.v[key][i]/(1-beta2**adam.step);model[key][i]-=learningRate*m/(Math.sqrt(v)+epsilon);
 }
}

export function trainCloneExample(model,adam,{input,action,mask=null},options={}){
 if(!Number.isInteger(action)||action<0||action>=model.outputSize||mask&&mask[action]===0)throw new Error('Invalid cloning action label.');
 const {hidden,output}=forward(model,input),probabilities=softmax(output,mask),gradient=[...probabilities];gradient[action]-=1;
 applyAdam(model,gradients(model,input,gradient,hidden),adam,options);return -Math.log(Math.max(probabilities[action],1e-12));
}

export function trainDqnExample(model,targetModel,adam,transition,{gamma=.9,huberDelta=1,...options}={}){
 const {input,action,reward,nextInput,terminal}=transition,{hidden,output}=forward(model,input),nextValues=forward(targetModel,nextInput).output;
 const target=dqnTarget({reward,gamma,nextValues,terminal}),difference=output[action]-target,absolute=Math.abs(difference);
 const gradient=Array(model.outputSize).fill(0);gradient[action]=absolute<=huberDelta?difference:huberDelta*Math.sign(difference);
 applyAdam(model,gradients(model,input,gradient,hidden),adam,options);
 return {loss:absolute<=huberDelta?.5*difference*difference:huberDelta*(absolute-.5*huberDelta),target};
}

export function parameterChecksum(model){
 let hash=2166136261;for(const key of PARAMS)for(const value of model[key]){const text=value.toPrecision(12);for(let i=0;i<text.length;i++){hash^=text.charCodeAt(i);hash=Math.imul(hash,16777619);}}return (hash>>>0).toString(16).padStart(8,'0');
}

const cloneSamples=[
 {input:[1,0],action:0,episodeId:'left-a'},{input:[.85,.15],action:0,episodeId:'left-b'},
 {input:[0,1],action:1,episodeId:'right-a'},{input:[.15,.85],action:1,episodeId:'right-b'}
];

export async function runCloningProbe({updates=500,seed=71001,onChunk=async()=>{},cancelled=()=>false}={}){
 const model=createMlp({inputSize:2,hiddenSize:8,outputSize:6,seed}),adam=createAdam(model),random=rng(seed+1),initial=parameterChecksum(model);let loss=0;
 for(let update=0;update<updates;update++){
  loss=trainCloneExample(model,adam,cloneSamples[Math.floor(random()*cloneSamples.length)],{learningRate:.012});
  if((update+1)%25===0){if(cancelled())return {cancelled:true,updates:update+1};await onChunk({updates:update+1,loss});}
 }
 const validation=[{input:[.92,.08],action:0},{input:[.08,.92],action:1}],correct=validation.filter(sample=>predict(model,sample.input,{probabilities:true}).action===sample.action).length;
 return {cancelled:false,updates,loss,initialChecksum:initial,finalChecksum:parameterChecksum(model),correct,total:validation.length,snapshot:snapshotMlp(model)};
}

function replayFixture(){
 const replay=[];for(const [input,correct] of [[[1,0],0],[[0,1],1]])for(let action=0;action<6;action++)replay.push({input,action,reward:action===correct?1:-1,nextInput:[0,0],terminal:true});
 replay.push({input:[.5,.5],action:0,reward:0,nextInput:[1,0],terminal:false},{input:[.5,.5],action:1,reward:0,nextInput:[0,1],terminal:false});return replay;
}

export async function runDqnProbe({updates=1200,seed=72001,targetEvery=100,onChunk=async()=>{},cancelled=()=>false}={}){
 const online=createMlp({inputSize:2,hiddenSize:8,outputSize:6,seed}),target=cloneMlp(online),adam=createAdam(online),random=rng(seed+1),replay=replayFixture(),initial=parameterChecksum(online);let loss=0,targetCopies=0;
 for(let update=0;update<updates;update++){
  ({loss}=trainDqnExample(online,target,adam,replay[Math.floor(random()*replay.length)],{learningRate:.008,gamma:.9}));
  if((update+1)%targetEvery===0){Object.assign(target,cloneMlp(online));targetCopies++;}
  if((update+1)%25===0){if(cancelled())return {cancelled:true,updates:update+1};await onChunk({updates:update+1,loss,targetCopies});}
 }
 const validation=[{input:[1,0],action:0},{input:[0,1],action:1}],correct=validation.filter(sample=>predict(online,sample.input).action===sample.action).length;
 return {cancelled:false,updates,loss,targetCopies,replaySize:replay.length,initialChecksum:initial,finalChecksum:parameterChecksum(online),correct,total:validation.length,snapshot:snapshotMlp(online)};
}
