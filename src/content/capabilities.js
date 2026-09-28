/** Tangible cartridges Patch installs in Echo. Every effect is consumed by the real runtime config. */
export const ECHO_CAPABILITIES=Object.freeze({
 'act-east':{name:'Sunrise Tread',type:'ACTION',story:'Adds the missing right-hand drive pulse to Echo’s full movement set.',effect:{allowedActions:[0,1,2,3,4,5]}},
 'act-west':{name:'Sunset Tread',type:'ACTION',story:'Keeps the sunrise rail dark, so Echo still cannot move right.',effect:{allowedActions:[0,1,3,4,5]}},
 'reward-delivery':{name:'Home Beacon',type:'REWARD',story:'Makes a safe delivery shine brighter than loose scrap.',effect:{priority:'delivery',rewardProfile:'urgent'}},
 'reward-scrap':{name:'Magpie Bell',type:'REWARD',story:'Rings loudly for every shiny distraction.',effect:{priority:'scrap'}},
 'future-far':{name:'Long Light',type:'RETURN',story:'Keeps a distant good outcome bright enough to follow.',effect:{future:'far'}},
 'future-near':{name:'Quick Spark',type:'RETURN',story:'Favors what pays immediately, even when the way home is longer.',effect:{future:'near'}},
 'explore-curious':{name:'Curiosity Coil',type:'PRACTICE',story:'Lets practice try unfamiliar turns before the route freezes.',effect:{curiosity:'curious',exploration:'decay'}},
 'explore-familiar':{name:'Comfort Coil',type:'PRACTICE',story:'Repeats familiar turns and avoids uncertain alleys.',effect:{curiosity:'familiar',exploration:'low'}},
 'sense-cargo':{name:'Pocket Sensor',type:'STATE',story:'Lets Echo tell an empty claw from one carrying cargo.',effect:{representation:'cargo',sensorSuite:'mission'}},
 'sense-position':{name:'Floor Counter',type:'STATE',story:'Reports the tile but not what Echo carries.',effect:{representation:'position',sensorSuite:'compact'}},
 'sense-beacon':{name:'Beacon Eye',type:'STATE',story:'Adds the direction of the next useful handoff.',effect:{sensorSuite:'beacon',encoder:'relational'}},
 'sense-lidar':{name:'Whisker Array',type:'STATE',story:'Adds four honest wall contacts around Echo.',effect:{sensorSuite:'lidar',encoder:'relational'}},
 'policy-safe':{name:'Patient Blueprint',type:'POLICY',story:'Installs the longer route that avoids the unreliable belt.',effect:{policyIntent:'safe'}},
 'policy-fast':{name:'Express Blueprint',type:'POLICY',story:'Installs the short route through the declared slip zone.',effect:{policyIntent:'fast'}},
 'signal-safe':{name:'Guardian Chime',type:'REWARD',story:'Makes capture costly enough to reshape practice.',effect:{rewardProfile:'safe'}},
 'signal-sparse':{name:'Silent Bell',type:'REWARD',story:'Keeps quiet until the final delivery succeeds.',effect:{rewardProfile:'sparse'}},
 // Kept as inert legacy IDs so old local saves can be migrated safely. Current
 // maps no longer expose selectable practice-budget cartridges.
 'budget-deep':{name:'Retired Deep-Wind Spring',type:'LEGACY',story:'A retired cartridge from an older maintenance contract.',effect:{}},
 'budget-brief':{name:'Retired Pocket Spring',type:'LEGACY',story:'A retired cartridge from an older maintenance contract.',effect:{}},
 'model-rehearse':{name:'Dream Gear',type:'MODEL',story:'Rehearses only transitions Echo has truly observed.',effect:{planning:'15'}},
 'model-real':{name:'Iron Gear',type:'MODEL',story:'Updates only from the newest physical experience.',effect:{planning:'0'}},
 'trace-long':{name:'Afterglow Wire',type:'MEMORY',story:'Carries recent surprise backward through visited states.',effect:{trace:'long'}},
 'trace-none':{name:'Single-Pulse Wire',type:'MEMORY',story:'Lets only the newest state hear each correction.',effect:{trace:'none'}},
 'replay-uniform':{name:'Memory Carousel',type:'MEMORY',story:'Replays bounded real transitions in an even shuffle.',effect:{replay:'uniform'}},
 'replay-latest':{name:'Last-Moment Reel',type:'MEMORY',story:'Keeps only the newest experience at the front.',effect:{replay:'off'}},
 'target-steady':{name:'Moon Twin',type:'TARGET',story:'Holds a quiet frozen target while the live network changes.',effect:{targetCadence:'stable'}},
 'target-live':{name:'Mirror Twin',type:'TARGET',story:'Copies every change immediately, losing the steady reference.',effect:{targetCadence:'live'}},
 'conditions-varied':{name:'Storm Almanac',type:'ROBUSTNESS',story:'Practices across every declared weather phase.',effect:{conditions:'varied',coverage:'broad'}},
 'conditions-single':{name:'Fair-Sky Note',type:'ROBUSTNESS',story:'Practices only the weather visible right now.',effect:{conditions:'single',coverage:'narrow'}},
 'lesson-recovery':{name:'Second-Chance Lesson',type:'IMITATION',story:'Keeps a recovery demonstration beside the clean route.',effect:{epochs:'12'}},
 'lesson-short':{name:'Perfect-Take Lesson',type:'IMITATION',story:'Keeps only the cleanest short demonstration.',effect:{epochs:'4'}}
});

export function capability(id){return ECHO_CAPABILITIES[id]??null;}

export function applyCapabilities(controls,ids=[],level=null){
 const out={...controls};
 for(const id of ids){const item=capability(id);if(item)Object.assign(out,item.effect);}
 if(out.policyIntent&&level?.learning?.policies?.length){const policies=level.learning.policies;out.policy=out.policyIntent==='safe'?policies.at(-1).id:policies[0].id;}
 return out;
}

const DISTRICT_PAIRS=Object.freeze({
 C01:['reward-delivery','reward-scrap'],
 C02:['sense-cargo','sense-position'],
 C03:['policy-safe','policy-fast'],
 C04:['trace-long','trace-none'],
 C05:['explore-curious','explore-familiar'],
 C06:['sense-beacon','sense-position'],
 C07:['model-rehearse','model-real'],
 C08:['signal-safe','signal-sparse'],
 C09:['replay-uniform','replay-latest'],
 C10:['conditions-varied','conditions-single'],
 C11:['lesson-recovery','lesson-short'],
 C12:['target-steady','target-live']
});

export function capabilityPair(chapterId,missionNumber){
 if(missionNumber===2)return ['act-east','act-west'];
 const pair=DISTRICT_PAIRS[chapterId]??DISTRICT_PAIRS.C01;
 return missionNumber%2?pair:[pair[1],pair[0]];
}
