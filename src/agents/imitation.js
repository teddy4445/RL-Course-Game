import {createEpisode,step} from '../sim/core.js?v=1.6.0';
import {featureDimension,featureVector} from './feature-control.js?v=1.6.0';
import {rng} from './q-learning.js?v=1.6.0';
import {createAdam,createMlp,loadMlp,predict,snapshotMlp,trainCloneExample} from './neural.js?v=1.6.0';

const clone=value=>JSON.parse(JSON.stringify(value));

function fresh(level,config,seed){const dimensions=featureDimension(level,config),model=createMlp({inputSize:dimensions,hiddenSize:level.learning.hiddenSize??16,outputSize:6,seed});return {algorithm:'behavioral-cloning',encoder:config.encoder,dimensions,model,epochs:0,updates:0,examples:0,episodes:0,loss:null};}
function restore(snapshot,level,config,seed){
 if(snapshot?.algorithm!=='behavioral-cloning'||snapshot.encoder!==config.encoder||snapshot.dimensions!==featureDimension(level,config))return fresh(level,config,seed);
 try{const model=loadMlp(snapshot.model);if(model.inputSize!==snapshot.dimensions||model.outputSize!==6)return fresh(level,config,seed);return {...fresh(level,config,seed),...clone(snapshot),model};}catch{return fresh(level,config,seed);}
}
function valid(example,dimensions){return example&&Array.isArray(example.input)&&example.input.length===dimensions&&example.input.every(Number.isFinite)&&Number.isInteger(example.action)&&example.action>=0&&example.action<=5&&typeof example.episodeId==='string';}

export function trainImitation(level,config,{snapshot=null,demonstrations=[],seed=1}={}){
 const out=restore(snapshot,level,config,seed),examples=demonstrations.filter(example=>valid(example,out.dimensions)).slice(-(level.learning.maxExamples??512));if(!examples.length)throw new Error('Record one successful demonstration before training Echo.');
 const episodeIds=[...new Set(examples.map(example=>example.episodeId))],heldOut=episodeIds.length>1?episodeIds.at(-1):null,training=examples.filter(example=>example.episodeId!==heldOut);if(!training.length)training.push(...examples);
 const validation=heldOut?examples.filter(example=>example.episodeId===heldOut):[],epochs=Math.max(1,Math.min(20,Number(config.epochs)||12)),model=out.model,adam=createAdam(model),random=rng(seed+29);let loss=0,updates=0;
 for(let epoch=0;epoch<epochs;epoch++)for(let index=training.length-1;index>=0;index--){const selected=Math.floor(random()*(index+1)),sample=training[selected];training[selected]=training[index];training[index]=sample;loss=trainCloneExample(model,adam,sample,{learningRate:.008,clipNorm:5});updates++;}
 const correct=validation.filter(sample=>predict(model,sample.input,{probabilities:true}).action===sample.action).length;
 return {snapshot:{algorithm:'behavioral-cloning',encoder:config.encoder,dimensions:out.dimensions,model:snapshotMlp(model),epochs:out.epochs+epochs,updates:out.updates+updates,examples:examples.length,episodes:episodeIds.length,loss},trainExamples:training.length,holdoutExamples:validation.length,holdoutCorrect:correct,loss};
}

export function evaluateImitation(level,config,snapshot,{seed=1}={}){
 const out=restore(snapshot,level,config,seed);if(!out.updates)throw new Error('Imitation cartridge has not been trained.');const random=rng(seed);let state=createEpisode(level,{practice:true,config,episodeId:`${level.id}-clone-eval`}),trace=[];
 for(let tick=0;tick<level.task.administrativeRolloutLimit;tick++){const action=predict(out.model,featureVector(level,config,state)).action,transition=step(state,{echoAction:action,stochasticSample:random()});trace.push({action,reward:transition.reward,x:transition.state.echo.x,y:transition.state.echo.y,facing:transition.state.echo.facing,cargo:transition.state.echo.cargo,events:transition.events});state=transition.state;if(transition.terminated)break;}
 return {outcome:state.courierOutcome??'truncated',steps:trace.length,trace,state};
}

export function imitationSnapshotAction(level,config,state,snapshot){if(snapshot?.algorithm!=='behavioral-cloning'||snapshot.encoder!==config.encoder)return 0;try{return predict(loadMlp(snapshot.model),featureVector(level,config,state)).action;}catch{return 0;}}
