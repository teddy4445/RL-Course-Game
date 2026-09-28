import {LEVELS} from '../src/content/levels.js';
import {configuration} from '../src/sim/core.js';
import {trainBatch,evaluate} from '../src/agents/q-learning.js';
for(const l of LEVELS.slice(1))for(const controls of [l.learning.defaults,{priority:'delivery',future:'far',curiosity:'curious'}]){
 const c=configuration(l,controls),t=performance.now(),train=trainBatch(l,c,{seed:41005,episodes:1800}),e=evaluate(l,c,train.q);
 console.log(l.id,controls,'train',train.deliveries,train.scrap,train.transitions,'eval',e.outcome,e.steps,e.scrap,'ms',(performance.now()-t).toFixed());
}
