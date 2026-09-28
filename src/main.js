import {LEVELS} from './content/levels.js?v=1.6.0';
import {OPENING} from './content/opening.js?v=1.6.0';
import {effectiveEpisodes,effectiveSweeps,exposedPlayerControls,playerControlDefaults,playerControlDefinitions} from './content/cartridge-controls.js?v=1.6.0';
import {applyCapabilities,capability} from './content/capabilities.js?v=1.6.0';
import {createEpisode,configuration,step,bootAction,observeEcho,encode,findEntity,canDeploy,canTrain,launch,at,clone} from './sim/core.js?v=1.6.0';
import {choose,values,rng,familiarPrior} from './agents/q-learning.js?v=1.6.0';
import {fixedPolicyAction,plannedPolicyAction,policyHash} from './agents/policy-evaluation.js?v=1.6.0';
import {linearSnapshotAction,linearValues,featureVector} from './agents/feature-control.js?v=1.6.0';
import {dynaSnapshotAction} from './agents/dyna-q.js?v=1.6.0';
import {policySnapshotAction,policyProbabilities} from './agents/policy-gradient.js?v=1.6.0';
import {dqnSnapshotAction} from './agents/deep-control.js?v=1.6.0';
import {imitationSnapshotAction} from './agents/imitation.js?v=1.6.0';
import {forward,loadMlp,predict} from './agents/neural.js?v=1.6.0';
import {Renderer} from './ui/renderer.js?v=1.6.0';
import {Mixer} from './audio/mixer.js?v=1.6.0';
import {freshSave,loadSave,storeSave,parseSave} from './persistence/save.js?v=1.6.0';

const BUILD_MODE='development';
const app=document.querySelector('#app'),dialog=document.querySelector('#dialog'),toastNode=document.querySelector('#toast');
let storage;try{storage=window.localStorage;}catch{storage={getItem(){return null;},setItem(){throw new Error('Browser storage is unavailable.');}};}
const loaded=loadSave(storage);let save=loaded.save,protectSave=!!loaded.warning;
const audio=new Mixer(save.settings);
let page='landing',level=null,state=null,renderer=null,controls=null,q=null,deployedQ=null,deployedControls=null,episodes=0,previewBase=null;
let worker=null,jobId=0,revision=0,training=false,trace=[],paused=false,lastDecision=0,random=rng(80001),environmentRandom=rng(81001),keys=new Set(),queue=[],lastFrame=0;
let dialogType=null,returnPage='menu',toastTimer=null,focusBefore=null,renderGeneration=0,lastStats=null,renderedHash=null;
let demonstrations=[],demonstrating=false,demonstrationBase=null,currentDemonstration=[],demonstrationId=0;
let introducedLevel=null,l01ObservedFailure=false;
const ASSET=new URL('../public/assets/',import.meta.url).href;
const img=(who,anim='idle',facing='south')=>`${ASSET}characters/${who}/${who}_${anim}_${facing}_00.svg`;
const icon=name=>`<img src="${ASSET}ui/${name}.svg" alt="">`;
const button=(text,action,cls='',extra='')=>`<button class="btn ${cls}" data-action="${action}" ${extra}>${text}</button>`;
const brand=`<div class="brand"><img class="brand-logo" src="${ASSET}ui/echo-heist-title-v1.png" alt="A City Wakes — Echo Heist"></div>`;
const topbar=(right)=>`<header class="topbar">${brand}${right}</header>`;
const CHAPTERS=[
 {id:'C01',number:'01',name:'The Scrapyard',short:'SCRAPYARD',theme:'scrapyard',blurb:'Wake a discarded courier and bring the first relay back online.',signal:'RUST / SPARKS / FIRST ROUTES'},
 {id:'C02',number:'02',name:'Transit Depot',short:'TRANSIT DEPOT',theme:'transit',blurb:'Read frozen routes through platforms, gates and uncertain conveyors.',signal:'RAILS / BLUEPRINTS / LAST SERVICE'},
 {id:'C03',number:'03',name:'Switchworks',short:'SWITCHWORKS',theme:'switchworks',blurb:'Repair policies and let real Bellman backups light the junctions.',signal:'CIRCUITS / PLANNING / POWER'},
 {id:'C04',number:'04',name:'Courier Quarter',short:'COURIER QUARTER',theme:'courier',blurb:'No blueprint. Collect receipts and learn what fixed routes are worth.',signal:'PARCELS / RECEIPTS / FORECASTS'},
 {id:'C05',number:'05',name:'Neon Market',short:'NEON MARKET',theme:'neon',blurb:'Train Echo to navigate shuttered alleys and dangerous recycler strips.',signal:'NEON / CONTROL / BLACKOUT'},
 {id:'C06',number:'06',name:'Modular Foundry',short:'MODULAR FOUNDRY',theme:'foundry',blurb:'Build useful signals that transfer when the warehouse floor shifts.',signal:'MODULES / FEATURES / TRANSFER'},
 {id:'C07',number:'07',name:'Clockwork Docks',short:'CLOCKWORK DOCKS',theme:'docks',blurb:'Learn how the machinery moves, then rehearse only what experience supports.',signal:'TIDES / MODELS / REHEARSAL'},
 {id:'C08',number:'08',name:'Skybridge',short:'SKYBRIDGE',theme:'skybridge',blurb:'Shape a stochastic courier policy across the bridges above the city.',signal:'WIND / POLICY / EXTRACTION'},
 {id:'C09',number:'09',name:'Neural Arcade',short:'NEURAL ARCADE',theme:'arcade',blurb:'Turn real courier experience into a compact deep action-value network.',signal:'TOKENS / REPLAY / FROZEN TWIN'},
 {id:'C10',number:'10',name:'Storm Grid',short:'STORM GRID',theme:'storm',blurb:'Build a route that holds when addresses, rewards and weather shift.',signal:'THUNDER / ROBUSTNESS / LAST LINE'},
 {id:'C11',number:'11',name:'Central Tower',short:'CENTRAL TOWER',theme:'tower',blurb:'Take Echo’s controls, show the rescue, then let your partner fly solo.',signal:'TRUST / DEMONSTRATION / HOMECOMING'},
 {id:'C12',number:'12',name:'Eclipse Citadel',short:'ECLIPSE CITADEL',theme:'eclipse',blurb:'Breach the black-sun fortress and bring down the Eclipse Warden together.',signal:'ECLIPSE / WARDEN / DAWN'}
];
const DISTRICT_MECHANICS={
 C01:{name:'Reward circuits',intro:'Repair Echo’s actions and choose the signals and sensing that shape what it learns.'},
 C02:{name:'Frozen blueprints',intro:'Evaluate an unchanging route before committing the real courier.'},
 C03:{name:'Switchboard planning',intro:'Use a known machine model to repair and improve a route.'},
 C04:{name:'Return receipts',intro:'Estimate an unchanged courier from sampled experience without controlling it.'},
 C05:{name:'Live action control',intro:'Balance exploration and value updates when no blueprint exists.'},
 C06:{name:'Feature cartridges',intro:'Choose what signals transfer instead of memorizing every tile.'},
 C07:{name:'Model rehearsal',intro:'Learn machinery outcomes from experience, then rehearse only observed dynamics.'},
 C08:{name:'Stochastic policy',intro:'Shape action probabilities and separate the actor from its critic.'},
 C09:{name:'Replay and target twin',intro:'Train a compact neural courier from bounded real replay and frozen targets.'},
 C10:{name:'Robust conditions',intro:'Prepare one policy across launches, weather phases, and sparse signals.'},
 C11:{name:'Lessons by hand',intro:'Record successful actions yourself; Echo learns only from your examples.'},
 C12:{name:'Warden shield chain',intro:'Combine every relay skill in sequential autonomous shield breaches.'}
};
const EARLY_DYNAMICS={
 L01:{patch:'Carry the Relay cell to its Socket, then extract after Echo delivers.',echo:'First fails without EAST, then genuinely learns after Patch installs that action.',change:'First contact: a physical Socket changes Echo’s real action space, and honest practice changes its policy.'},
 L02:{patch:'Find and install the action relay before taking the extraction corridor.',echo:'Learns which pickups deserve reward from real practice episodes.',change:'A second action-space repair combines with reward priority; neither Patch nor the UI supplies a winning route.'},
 L03:{patch:'Thread the maintenance maze and open the portal that leads to extraction.',echo:'Learns whether a later delivery can outweigh a nearby distraction.',change:'The Socket restores long-horizon value, so later outcomes can shape Echo’s learned route.'},
 L04:{patch:'Cross the split workshop and install a practice circuit.',echo:'Must explore beyond a familiar scrap route to discover the useful token.',change:'The Socket restores curious practice; the resulting frozen delivery remains autonomous.'},
 L05:{patch:'Power two linked relays and open the security portal between them.',echo:'Combines reward priority, exploration, and a moving laser phase.',change:'Two Socket repairs change reward and practice in sequence while Patch opens the physical route.'},
 L06:{patch:'Open the depot perimeter, power the receiver, and extract by the rail gate.',echo:'Evaluates a fixed courier route through two states that share one location.',change:'The sensor cartridge can include cargo, revealing why the same tile may need a different action.'},
 L07:{patch:'Loop through the platform controls while Echo waits at the dispatch lane.',echo:'Follows one of two frozen routes through a conveyor that can slip.',change:'A shorter route is now uncertain; expected outcome matters more than distance alone.'}
};
function dynamicsFor(l=level){
 if(EARLY_DYNAMICS[l?.id])return EARLY_DYNAMICS[l.id];
 const rooms=l?.task.patchRoomCount??1,doors=Math.max(0,(l?.task.patchRoute?.length??3)-3),patrols=l?.task.patchSentryCount??0;
 return {patch:`Breach ${rooms} rooms / ${doors} security ${doors===1?'lock':'locks'}${patrols?` / ${patrols} grounded ${patrols===1?'patrol':'patrols'}`:''}, then extract.`,echo:'Crosses the separate cyan grid with the frozen policy you prepared.',change:`Patch’s route now spans ${rooms} linked rooms${patrols?' with checkpointed patrol pressure':''}; Echo’s learning contract and lane remain separate.`};
}
function settingImpact(key){
 if(!level||!controls)return '';
 const missionValue={
  L02:controls.priority==='delivery'?'Delivery is worth far more than scrap, so successful practice should prefer the fuse.':'Scrap is currently rewarded most; Echo may rationally finish at the shiny dead end.',
  L03:controls.future==='far'?'Future rewards keep their weight, so the distant power cell can beat nearby scrap.':'Later rewards fade quickly, making the nearby terminal scrap more attractive.',
  L04:controls.curiosity==='curious'?'Practice tries unfamiliar actions often enough to escape the old scrap habit.':'Practice leans on the familiar scrap trace and may never discover the useful token.',
  L05:`${controls.priority==='delivery'?'Delivery outranks distractions.':'Scrap has priority.'} ${controls.curiosity==='curious'?'Practice explores alternate timing around the laser.':'Practice favors routes it already knows.'}`,
  L06:controls.representation==='cargo'?'Echo observes position and cargo, so the junction can mean “find key” or “deliver ticket.”':'Echo sees position only; distinct jobs at the same junction are intentionally aliased.',
  L07:controls.policy==='bypass'?'The frozen courier uses the longer upper bypass and avoids conveyor slip.':'The frozen courier uses the short express belt, including its declared slip probability.'
 }[level.id],selected=controls[key],generic={
  representation:selected==='cargo'?'Echo can distinguish the same tile before and after pickup.':'Echo sees only its tile, so cargo-dependent decisions are deliberately merged.',
  policy:`You are freezing the authored ${selected} route; computation measures this route rather than secretly replacing it.`,
  start:`Practice and evaluation begin at the ${selected} launch state for this relay check.`,
  modelRevision:selected==='new'?'The planner uses the changed gate layout; old values no longer match the machine.':'The planner uses the original switchboard transition model.',
  trace:selected==='long'?'Recent states share later TD errors through fading eligibility traces.':'Only the current one-step TD error updates value.',
  recorder:selected==='mc'?'Values update from complete sampled returns after a run ends.':selected==='td'?'Values bootstrap after every real transition.':'TD errors flow backward through fading traces.',
  exploration:selected==='decay'?'Practice starts broad, then becomes focused as experience accumulates.':'Practice keeps exploration cautious and concentrates on familiar actions.',
  encoder:selected==='missing-cargo'?'This diagnostic hides cargo and intentionally aliases decisions.':selected==='coarse'?'Nearby tiles share coarse features, trading detail for generalization.':selected==='fine'?'Fine coding preserves tight corners with more specific features.':selected==='absolute'?'The network memorizes absolute tiles; shifted rooms may not transfer.':'Relational signals describe target direction and blocked moves so routes can transfer.',
  planning:Number(selected)>0?`Each real transition earns ${selected} extra updates sampled only from Echo’s learned empirical model.`:'Only real experienced transitions update the action values.',
  machineRevision:selected==='new'?'The physical tide gear is reversed for this practice stage.':'Practice uses the original dock machinery.',
  memory:selected==='retain'?'Old model counts stay, even where the machine changed.':selected==='recent'?'Old action values remain but transition counts are relearned.':'Both stale model counts and values are cleared.',
  baseline:selected==='value'?'A learned value baseline reduces return variance without choosing Echo’s actions.':'Policy gradients use raw completed returns.',
  balance:selected==='fast-critic'?'The critic learns faster than the actor for this stage.':'Actor and critic use the steadier authored learning-rate balance.',
  evaluationMode:selected==='stochastic'?'Deployment samples the probabilities of the frozen learned policy.':'Deployment chooses the highest-probability frozen action.',
  replay:selected==='uniform'?'Updates revisit uniformly sampled real transitions from bounded replay.':'Updates use only the newest experienced transition.',
  coverage:selected==='broad'?'Practice samples every declared launch state.':'Practice concentrates on one familiar launch.',
  targetCadence:selected==='live'?'The target copy follows every update, removing most separation.':selected==='rapid'?'The frozen target refreshes every 64 updates.':'The target stays fixed for 256 updates before copying.',
  curriculum:selected==='staged'?'Practice begins from easier starts and expands to the full route.':'Every practice episode begins on the full route.',
  conditions:selected==='varied'?'Practice rotates through all declared storm settings.':'Practice uses only the current storm setting.',
  epochs:`The clone makes ${selected} passes over only your successful labelled actions.`,
  sensorSuite:selected==='compact'?'Echo receives position and facing only. Cargo, hazard phase, goal direction, and local walls are hidden.':selected==='mission'?'Echo receives the authored mission state used by the reference cartridge.':selected==='beacon'?'The input adds normalized goal distance and bearing to the authored mission telemetry.':'The input adds goal range plus four real local wall sensors to mission telemetry.',
  rewardProfile:selected==='urgent'?'Delivery pays more, progress signals are stronger, and every extra step costs more.':selected==='safe'?'Capture is punished more strongly while ordinary movement costs less.':selected==='sparse'?'Pickup and progress hints are removed; the final delivery carries the signal.':'The authored delivery, pickup, movement, progress, and capture signals remain balanced.'
 }[key];
 return key===(level.learning.exposedControls?.[0])&&missionValue?missionValue:generic??'';
}
const PAGE_ROUTES={landing:'#/',menu:'#/menu',map:'#/districts',settings:'#/settings',finale:'#/finale'};
function routeFor(target,id=null){return target==='game'?`#/play/${id}`:target==='district'?`#/district/${id}`:PAGE_ROUTES[target]??PAGE_ROUTES.landing;}
function routeTo(target,id=null,{replace=false}={}){
 const hash=routeFor(target,id),method=replace?'replaceState':'pushState';
 if(location.hash!==hash)history[method]({echoHeist:true,backHash:location.hash||PAGE_ROUTES.landing},'',hash);
 syncRoute(true);
}
function backTo(fallback){if(history.state?.backHash)history.back();else routeTo(fallback,null,{replace:true});}
function toast(text){clearTimeout(toastTimer);toastNode.textContent=text;toastNode.classList.add('show');toastTimer=setTimeout(()=>toastNode.classList.remove('show'),3900);}
function clearToast(){clearTimeout(toastTimer);toastNode.textContent='';toastNode.classList.remove('show');}
function persist(){if(protectSave)return;try{save=storeSave(storage,save);audio.settings=save.settings;}catch{toast('Local saving is unavailable. Export your progress from Settings.');}}
function applySettings(){document.body.classList.toggle('reduced-motion',save.settings.reducedMotion);audio.settings=save.settings;audio.apply();if(renderer)renderer.reducedMotion=save.settings.reducedMotion;}
function setFocus(){requestAnimationFrame(()=>{const el=app.querySelector('button:not(:disabled),canvas');el?.focus({preventScroll:true});});}
function cancelTraining(message=null){jobId++;if(worker){try{worker.postMessage({type:'cancel'});}catch{/* worker is already gone */}worker.terminate();worker=null;}const had=training;training=false;if(had&&['dock','terminal'].includes(dialogType)&&dialog.open)refreshDock();if(had&&message)toast(message);}
function closeDialog(){if(dialog.open)dialog.close();dialogType=null;paused=false;keys.clear();queue=[];lastDecision=performance.now();focusBefore?.focus?.({preventScroll:true});}
function showDialog(type,html){focusBefore=document.activeElement;dialogType=type;dialog.innerHTML=html;paused=true;keys.clear();queue=[];if(!dialog.open)dialog.showModal();requestAnimationFrame(()=>dialog.querySelector('button:not(:disabled)')?.focus());}
function navigate(target,fromRoute=false){if(!fromRoute){routeTo(target);return;}clearToast();cancelTraining();closeDialog();page=target;state=null;level=null;renderer=null;deployedQ=null;deployedControls=null;keys.clear();queue=[];renderGeneration++;
 if(target==='landing')landing();else if(target==='menu')menu();else if(target==='map')map();else if(target==='settings')settings();else if(target==='finale')finale();
 window.scrollTo(0,0);setFocus();
}
function currentChapter(){return CHAPTERS.find(chapter=>chapter.id===(LEVELS.find(candidate=>candidate.id===save.currentLevel)?.chapterId??'C01'))??CHAPTERS[0];}
function chapterUnlocked(chapter){return chapter.id==='C01'||save.completed.includes(`L${String((Number(chapter.number)-1)*5).padStart(2,'0')}`);}
function landing(){
 audio.theme('screen_landing');
 app.innerHTML=`<div class="screen landing-page">
  <header class="landing-nav">${brand}<nav aria-label="Landing page"><button class="landing-nav-link" data-action="landing-learn">How Echo learns</button><button class="landing-nav-link" data-action="landing-story">The story</button>${button('Play now','enter','primary')}</nav></header>
  <main>
   <section class="landing-hero" aria-labelledby="landing-title">
    <div class="landing-hero-art" role="img" aria-label="Patch and Echo overlook the sleeping robot city before their heist"></div>
    <div class="landing-hero-shade"></div>
    <div class="landing-hero-copy">
     <div class="eyebrow">A GAME ABOUT LEARNING TOGETHER</div>
     <h1 id="landing-title">Teach a little robot.<br><span>Steal back a city.</span></h1>
     <p>You are Patch, a maintenance robot with a wrench and a plan. Echo is your tiny autonomous partner—and every route it learns comes from the world you build around it.</p>
     <div class="actions">${button('Enter the city &nbsp; &#8594;','enter','primary')}${button('Discover how Echo learns','landing-learn','quiet')}</div>
     <div class="landing-facts" aria-label="Campaign features"><span><b>12</b> districts</span><span><b>60</b> handcrafted missions</span><span><b>1</b> learning partner</span></div>
    </div>
    <button class="landing-scroll" data-action="landing-learn" aria-label="Scroll to how Echo learns"><i></i><span>THE HEIST HAS A BRAIN</span></button>
   </section>

   <section class="landing-learn" id="landing-learn" aria-labelledby="learn-title">
    <div class="landing-section-head"><div class="eyebrow">PLAY FIRST / LEARN BY DOING</div><h2 id="learn-title">A heist that teaches by letting you play.</h2><p>Echo is not a scripted sidekick and this is not a quiz. You change what your partner can sense, which actions it can take, and which outcomes matter—then a real local learner practices inside the same rules used during the mission.</p></div>
    <div class="landing-learning-grid">
     <figure class="landing-learning-art"><img src="${ASSET}ui/landing/learning-loop-v1.png" alt="Patch installs a capability while Echo learns routes through a holographic maze"><figcaption>Every glowing route is earned through actual simulated experience.</figcaption></figure>
     <div class="learning-steps">
      <article><span>01</span><div><h3>Find the missing piece</h3><p>Explore with Patch. Carry sensors, actions, reward circuits, memory and training capabilities to Echo's relay.</p></div></article>
      <article><span>02</span><div><h3>Shape the problem</h3><p>Decide what Echo observes and what success means. Later districts make those choices mutually exclusive.</p></div></article>
      <article><span>03</span><div><h3>Let experience change it</h3><p>Train a genuine tabular, planning, policy-gradient, deep-RL or imitation model in your browser—no server and no hidden winning route.</p></div></article>
      <article><span>04</span><div><h3>Freeze it. Trust it. Run.</h3><p>The policy stops learning when the door opens. Echo must finish with what the two of you prepared.</p></div></article>
     </div>
    </div>
    <div class="landing-promise"><span>STATE</span><i></i><span>ACTIONS</span><i></i><span>REWARD</span><i></i><span>EXPERIENCE</span><i></i><strong>POLICY</strong></div>
   </section>

   <section class="landing-story" id="landing-story" aria-labelledby="story-title">
    <img class="landing-story-art" src="${ASSET}ui/landing/story-journey-v1.png" alt="Patch and Echo cross the city from the scrapyard toward the Eclipse Citadel">
    <div class="landing-story-shade"></div>
    <div class="landing-story-copy">
     <div class="eyebrow">A CITY WAKES / THE STORY</div>
     <h2 id="story-title">One city.<br>Two discarded robots.</h2>
     <p>The Eclipse Warden silenced every relay and taught the city to obey one perfect route. Patch survived in the Scrapyard. Echo woke with an empty policy and one stubborn spark.</p>
     <p>Together they will climb through twelve districts—rail depots, neon markets, storm bridges and the black-sun Citadel—repairing a network that learns from mistakes instead of erasing them.</p>
     <blockquote>“I do not need the perfect route. I need one we found together.”<cite>— Echo</cite></blockquote>
    </div>
    <div class="story-beats" aria-label="Campaign journey">
     <article><span>01</span><b>Wake Echo</b><small>Build the first action. Bring one relay home.</small></article>
     <article><span>02</span><b>Light the districts</b><small>New machines, new uncertainty, longer plans.</small></article>
     <article><span>03</span><b>Break the eclipse</b><small>Face the Warden with everything Echo learned.</small></article>
    </div>
   </section>

   <section class="landing-callout" aria-labelledby="callout-title">
    <div><div class="eyebrow">THE FIRST RELAY IS WAITING</div><h2 id="callout-title">Ready to wake the city?</h2><p>Your progress stays in this browser. Start playing immediately; discover the learning systems through the heist itself.</p></div>
    <div class="actions">${button(save.completed.length?'Continue your heist &nbsp; &#8594;':'Begin the heist &nbsp; &#8594;','enter','primary')}${button('See the story again','landing-story','quiet')}</div>
   </section>
  </main>
 </div>`;
}
function menu(){
 const chapter=currentChapter();
 audio.theme('screen_menu');
 app.innerHTML=`<section class="screen city menu-shell theme-${chapter.theme}">${topbar('')}<main class="menu-content content"><div><div class="chapter-signal"><span>DISTRICT ${chapter.number} / ${chapter.signal}</span><strong>${chapter.name}</strong><small>${chapter.blurb}</small></div><div class="menu-buttons">${button(save.completed.length||save.cartridges.L02?'Continue':'Start the heist','continue','primary')}${button('Choose district <span>01 - 12</span>','map')}${button('Settings '+icon('settings'),'settings')}${button('New game <span>&#43;</span>','newgame')}</div></div><div class="menu-portrait" aria-label="Patch and Echo riding toward ${chapter.name}"><div class="lift-number">${chapter.number}</div><img src="${img('patch')}"><img src="${img('echo')}"></div></main></section>`;
}
function map(){
 audio.theme('screen_map');
 app.innerHTML=`<section class="screen city map-shell theme-${currentChapter().theme}">${topbar(button('Back to lift','back-menu','quiet'))}<main class="map-content content"><div class="eyebrow">CITY RELAY NETWORK / TWELVE ACTIVE DISTRICTS</div><h1>Choose a district.</h1><p class="map-intro">Ride the maintenance lift to a restored stop, or continue toward the Eclipse Citadel.</p><div class="district-grid">${CHAPTERS.map(chapter=>{const unlocked=chapterUnlocked(chapter),levels=LEVELS.filter(level=>level.chapterId===chapter.id),done=levels.filter(level=>save.completed.includes(level.id)).length;return `<button class="district-card theme-${chapter.theme} ${done===5?'complete':''}" data-action="district" data-chapter="${chapter.id}" ${unlocked?'':'disabled'} aria-label="District ${chapter.number}, ${chapter.name}. ${unlocked?`${done} of 5 missions complete`:'Locked'}"><span class="district-number">${chapter.number}</span><span class="eyebrow">${unlocked?done===5?'RELAY ONLINE':'ACCESS OPEN':'LIFT STOP LOCKED'}</span><strong>${chapter.name}</strong><small>${chapter.blurb}</small><span class="district-progress"><i style="--progress:${done/5}"></i>${done} / 5</span></button>`;}).join('')}</div></main></section>`;
}
function district(chapterId){
 const chapter=CHAPTERS.find(candidate=>candidate.id===chapterId);if(!chapter||!chapterUnlocked(chapter)){routeTo('map',null,{replace:true});toast('Restore the previous district to unlock this lift stop.');return;}
 audio.theme('screen_map');page='district';const levels=LEVELS.filter(candidate=>candidate.chapterId===chapterId),done=levels.filter(candidate=>save.completed.includes(candidate.id)).length;
 app.innerHTML=`<section class="screen city map-shell theme-${chapter.theme}">${topbar(button('All districts','map','quiet'))}<main class="map-content content"><div class="eyebrow">DISTRICT ${chapter.number} / ${done===5?'RELAY ONLINE':'FIELD OPERATIONS'}</div><h1>${chapter.name}</h1><p class="map-intro">${chapter.blurb}</p><div class="level-cards">${levels.map((l,missionIndex)=>{const i=LEVELS.indexOf(l),cleared=save.completed.includes(l.id),unlocked=i===0||save.completed.includes(LEVELS[i-1].id),status=cleared?'CLEARED / PLAY AGAIN':unlocked?'READY TO ENTER':'LOCKED / FINISH PREVIOUS';return `<button class="level-card ${cleared?'complete':''}" data-action="level" data-level="${l.id}" aria-label="Mission ${l.id}, ${l.title}. ${cleared?'Cleared; play again':unlocked?'Ready to enter':'Locked; finish the previous mission'}" ${unlocked?'':'disabled'}><span class="level-order">MISSION ${String(missionIndex+1).padStart(2,'0')}</span><span class="number">${l.id.slice(1)}</span><h2>${l.title}</h2><span class="micro">${status}</span><span class="level-state" aria-hidden="true">${cleared?'✓':unlocked?'→':'×'}</span></button>`;}).join('')}</div><div class="restored micro"><span>${done} OF 5 MISSIONS COMPLETE</span><span>${done===5?'DISTRICT RELAY ONLINE':'NEXT JOB WAITING'} &nbsp; &#9679;</span></div></main></section>`;window.scrollTo(0,0);setFocus();
}
function settings(){
 audio.theme('screen_settings');
 app.innerHTML=`<section class="screen city">${topbar(button('Back','settings-back','quiet'))}<main class="settings-wrap content"><div class="panel"><div class="eyebrow">MAINTENANCE PANEL</div><h1>Make yourself at home.</h1><label class="setting"><span>Music<small>Screen themes and chapter layers</small></span><span class="range-wrap"><input aria-label="Music volume" type="range" min="0" max="1" step=".05" value="${save.settings.music}" data-setting="music"><output data-value-for="music">${Math.round(save.settings.music*100)}%</output></span></label><label class="setting"><span>Sound effects<small>Robots, machinery, interface</small></span><span class="range-wrap"><input aria-label="Sound effects volume" type="range" min="0" max="1" step=".05" value="${save.settings.effects}" data-setting="effects"><output data-value-for="effects">${Math.round(save.settings.effects*100)}%</output></span></label><label class="setting"><span>Mute all audio</span><input aria-label="Mute all audio" type="checkbox" data-setting="muted" ${save.settings.muted?'checked':''}></label><label class="setting"><span>Reduced motion<small>Disable decorative motion and movement interpolation</small></span><input aria-label="Reduced motion" type="checkbox" data-setting="reducedMotion" ${save.settings.reducedMotion?'checked':''}></label><div class="save-tools"><div class="actions">${button('Export save','export','quiet')}${button('Import save','import','quiet')}</div><input id="import-file" type="file" accept=".json,application/json" hidden><p class="note">Progress stays in this browser. Export a copy before moving computers. Imports are validated before replacing the current save.</p></div><div class="divider"></div>${button('Controls','controls','quiet')}</div></main></section>`;
}
function about(){showDialog('about',`<button class="close" data-action="close" aria-label="Close">&times;</button><div class="eyebrow">CHAPTERS 01 - 12 / PLAYABLE CAMPAIGN</div><h2>Twelve districts. Sixty real missions.</h2><p>Echo progresses from tabular control and exact planning through approximation, learned models, policy gradients, compact deep Q-learning, and learning from your demonstrations.</p><p>District 12 is an original five-mission finale beyond the eleven supplied course briefs. Its boss still uses the same honest simulation and frozen learned policy rules.</p><div class="actions">${button('Let us play','close','primary')}</div>`);}
function prologue(l){
 page='prologue';level=l;state=null;renderer=null;audio.theme('screen_landing');const chapter=CHAPTERS[0];
 app.innerHTML=`<section class="screen city prologue-screen theme-${chapter.theme}">${topbar(button('Back to lift','back-menu','quiet'))}<main class="prologue-content content"><div class="prologue-copy"><div class="eyebrow">THE NIGHT THE CITY WENT QUIET</div><h1>One spark.<br>Two ways forward.</h1><p>The Eclipse Warden has cut every relay in the city. Patch, a stubborn maintenance robot, finds one last courier asleep beneath the Scrapyard. Its name is Echo—and it can learn, if you give it honest experience.</p><p>You control Patch directly. Echo controls itself from a model you train. Patch can carry Relay cells to Sockets; each connection adds a real piece to Echo’s state, action space, reward signal, policy, or practice routine. Open the model with R at any time, train it, freeze it, and watch the result. A failed run returns Echo safely so you can change the machine and try again.</p><div class="prologue-controls" aria-label="How to play"><span><b>WASD / ARROWS</b>Move Patch</span><span><b>E</b>Pick up, power, portal, exit</span><span><b>R</b>Train and run Echo anywhere</span><span><b>T / ESC</b>Retry / pause</span></div><div class="actions">${button('Wake the city &nbsp; &#8594;','begin-heist','primary')}${button('Settings','settings','quiet')}</div></div><div class="prologue-robots" aria-label="Patch finds Echo in the sleeping scrapyard"><div class="prologue-spark"></div><img class="prologue-patch" src="${img('patch')}" alt="Patch, the orange robot"><img class="prologue-echo" src="${img('echo','charge')}" alt="Echo, the sleeping courier"><p>“We learn the way out together.”</p></div></main></section>`;
 window.scrollTo(0,0);setFocus();
}
const DISTRICT_STORIES={
 C01:['A spark under the scrap','Patch finds a courier no bigger than a toolbox, asleep beneath a fallen sign. The first relay needs hands, courage, and one honest signal. Wake Echo gently; the city has been quiet for a long time.'],
 C02:['The platform remembers','The last train left its route lights behind. Echo can count every tile, but one corner means two different things depending on what sits in its claw. Find the little Pocket Sensor before asking it to choose.'],
 C03:['A switchboard with dreams','Copper paths branch like a sleeping tree. The old blueprints disagree about the safest way through, so Patch must carry one route to Echo and leave the tempting other route behind.'],
 C04:['Receipts in the rain','Thousands of undelivered notes flutter through the quarter. A faint wire can carry surprise backward through the route, helping old footsteps learn from what happened later.'],
 C05:['The alley that dares you','Neon shutters hide useful turns and glittering traps. Echo needs a small Curiosity Coil: permission to try, fail safely, and remember that the familiar way is not always home.'],
 C06:['The room that moved','Foundry walls click into new arrangements overnight. Absolute addresses are brittle here. Find the Beacon Eye that describes where the useful thing is, even after the floor changes.'],
 C07:['Gears that rehearse','The tide machines refuse to explain themselves. Echo can build a tiny dream from outcomes it truly witnessed, then turn that Dream Gear between real attempts—never inventing a transition.'],
 C08:['A promise in the wind','Above the clouds, no action is perfectly certain. The Guardian Chime does not remove chance; it teaches Echo which risks deserve less probability before the bridge run freezes.'],
 C09:['The quiet twin','The arcade kept two minds: one learning quickly, one holding still long enough to become a trustworthy target. Real memories circle between them on a bounded carousel.'],
 C10:['Weather in every wire','The storm changes the same address into many different journeys. Patch must recover an almanac of real conditions so Echo practices for the city that exists, not just the calm one it hoped for.'],
 C11:['Teach me the way home','The Tower has no surviving blueprint. Patch will guide Echo by hand, keeping successful actions as lessons. One recovery route may matter more than a dozen perfect performances.'],
 C12:['The last black sun','No new trick waits in the Citadel. Only everything you and Echo already earned: observation, memory, honest practice, and the trust to freeze a decision and let your partner carry it into dawn.']
};
const STORY_ART={C02:'c02-transit.png',C03:'c03-switchworks.png',C04:'c04-courier.png',C05:'c05-neon.png',C06:'c06-foundry.png',C07:'c07-docks.png',C08:'c08-skybridge.png',C09:'c09-arcade.png',C10:'c10-storm.png',C11:'c11-tower.png'};
function missionIntro(l){
 page='intro';level=l;state=null;renderer=null;const chapter=CHAPTERS.find(item=>item.id===l.chapterId),[title,copy]=DISTRICT_STORIES[l.chapterId],art=STORY_ART[l.chapterId]?`${ASSET}ui/story/${STORY_ART[l.chapterId]}`:l.chapterId==='C12'?`${ASSET}ui/finale-dawn-v1.png`:`${ASSET}ui/districts/${chapter.theme}.svg`;
 const discovery=l.learning.capabilityVersion==='relay-sockets-v1'?'A Relay cell is hidden in Patch’s maze. Carry it to its matching Socket to install a real capability in Echo; open R before and after to see exactly what changed.':l.learning.capabilityPuzzle?`${l.learning.capabilityPuzzle.options.length} cartridges are hidden in the maze. Installing one seals every other case. Read what each promises, then bring your choice to the relay.`:'This job asks you to use what the two of you already know.';
 audio.theme('screen_map');app.innerHTML=`<section class="screen mission-intro theme-${chapter.theme}" style="--story-art:url('${art}')">${topbar(button('Back to missions','map','quiet'))}<main class="mission-intro-copy content"><div class="eyebrow">${chapter.name} / ${l.title}</div><h1>${title}</h1><p>${copy}</p><div class="intro-discovery"><span>PATCH FOUND SOMETHING FOR ECHO</span>${discovery}</div><div class="actions">${button('Enter the maze &nbsp; &#8594;','enter-mission','primary',`data-level="${l.id}"`)}</div></main></section>`;window.scrollTo(0,0);setFocus();
}

function showL01Welcome(){
 showDialog('tutorial',`<img class="dialog-robot" src="${img('echo','charge')}" alt="Echo"><div class="eyebrow">FIRST CONNECTION / PATCH + ECHO</div><h2>Patch finds things.<br>Echo learns what they make possible.</h2><p>Echo has five moving parts: what it <b>sees</b>, which <b>actions</b> it can take, the <b>reward</b> it follows, the learned <b>policy</b> it freezes, and how much <b>practice</b> it receives. Press R at any time to inspect all five.</p><p>First, train and run Echo exactly as it is. The failure is safe—and it will reveal what the little courier is missing.</p><div class="tutorial-steps"><span class="active"><b>1</b> OPEN R</span><span><b>2</b> TRAIN + RUN</span><span><b>3</b> REPAIR</span><span><b>4</b> TRAIN + RUN</span></div><div class="actions">${button('Open Echo’s model','tutorial-open-echo','primary')}${button('Look around first','close','quiet')}</div>`);
}
const FINALE_STORY=`When the Eclipse Warden fell silent, the city did not cheer at first. It listened. Across the dark, one relay answered another: a cyan pulse in the Scrapyard, a warm window above the Transit Depot, a row of lamps waking along the Skybridge. Then the sound arrived—trains restarting, shutters lifting, voices carrying between streets that had forgotten morning.

Patch stood at the broken gate with the city heart humming safely in both hands. Echo rolled beside them, smaller than the shadow of the Citadel and brighter than anything left inside it. No perfect route had been waiting for them. There had only been wrong turns, patient repairs, scraps of experience, and the choice to try again without pretending the failure had never happened.

The people below would tell stories about the two robots who stole back the dawn. They would get some details wrong. They would make Patch fearless and Echo certain. But the truth was better: Patch had been afraid and kept moving. Echo had begun with almost nothing and learned whom to trust, one honest signal at a time.

They left the city because it no longer needed heroes standing over it. Behind them, twelve districts made their own light. Ahead, the road had no map—only weather, distance, and room for new mistakes.

Echo looked up at Patch. Patch looked toward the sunrise. Together, they took the first step beyond the last known state.`;
function finale(){
 if(!save.completed.includes('L60')){routeTo('menu',null,{replace:true});toast('The road beyond the Citadel opens after the final mission.');return;}
 page='finale';audio.theme('chapter-12');
 app.innerHTML=`<section class="screen finale-screen"><div class="finale-shade"></div><header class="finale-top">${brand}<div class="eyebrow">ALL TWELVE RELAYS / ONLINE</div></header><main class="finale-stage"><div class="finale-story-window" tabindex="0" aria-label="End of game story"><div class="finale-story-roll"><div class="eyebrow">ECHOES AT DAWN</div><h1>A city wakes.</h1>${FINALE_STORY.split('\n\n').map(paragraph=>`<p>${paragraph}</p>`).join('')}<div class="finale-signoff">PATCH + ECHO<br><span>THE ROAD CONTINUES</span></div></div></div></main><footer class="finale-actions">${button('Return to the city','map','primary')}${button('Replay the final heist','replay-final','quiet')}</footer></section>`;
 window.scrollTo(0,0);requestAnimationFrame(()=>app.querySelector('.finale-story-window')?.focus({preventScroll:true}));
}
const CARTRIDGE_RUNTIME={"q-learning":'tabular-q-v2',sarsa:'tabular-sarsa-v1',"policy-evaluation":'known-policy-v1',"policy-improvement":'known-improvement-v1',"policy-iteration":'known-policy-iteration-v1',"value-iteration":'known-value-iteration-v1',prediction:'fixed-policy-prediction-v1',"linear-sarsa":'linear-sarsa-v1',"dyna-q":'empirical-dyna-v2',reinforce:'softmax-reinforce-v2',"reinforce-baseline":'softmax-reinforce-baseline-v2',"actor-critic":'softmax-actor-critic-v2',dqn:'compact-dqn-v2',"behavioral-cloning":'player-demonstration-cloning-v2'};
const isPlanningMode=mode=>['policy-evaluation','policy-improvement','policy-iteration','value-iteration'].includes(mode);
const isControlMode=mode=>['q-learning','sarsa'].includes(mode);
const isAdvancedMode=mode=>['linear-sarsa','dyna-q','reinforce','reinforce-baseline','actor-critic','dqn','behavioral-cloning'].includes(mode);
const echoStagesFor=l=>l?.task.echoStages??[];
function echoStageFor(s=state){const stages=echoStagesFor(s?.level??level);return stages[Math.min(s?.echoStage??0,Math.max(0,stages.length-1))]??null;}
function configurationForStage(l,c,index=0,capabilities=state?.level?.id===l.id?state.capabilities:[]){const stage=echoStagesFor(l)[index],playerChoosesStart=exposedPlayerControls(l).includes('start');return configuration(l,{...applyCapabilities(c,capabilities,l),capabilities:[...capabilities],stageIndex:index,stageStart:playerChoosesStart?null:stage?.startId??null,stagePhase:stage?.phase??0});}
function stagePracticeRequired(){return Number(level?.id.slice(1))>5&&!!echoStageFor(state)&&!state.echoStagePrepared&&!reliableEnough();}
const READINESS_TARGET=.67;
function routeReliability(){
 if(isPlanningMode(level?.learning.mode))return Number(q?.successProbability);
 return Number(lastStats?.successProbability);
}
function reliableEnough(){const chance=routeReliability();return Number.isFinite(chance)&&chance>=READINESS_TARGET;}
function advancedSnapshotValid(l,c,snapshot){if(!snapshot)return false;if(l.learning.mode==='linear-sarsa')return snapshot.algorithm==='linear-sarsa'&&snapshot.encoder===c.encoder;if(l.learning.mode==='dyna-q')return snapshot.algorithm==='dyna-q'&&snapshot.environmentRevision===(c.machineRevision??'base');if(l.learning.mode==='dqn')return snapshot.algorithm==='dqn'&&snapshot.encoder===c.encoder&&snapshot.online;if(l.learning.mode==='behavioral-cloning')return snapshot.algorithm==='behavioral-cloning'&&snapshot.encoder===c.encoder&&snapshot.updates>0;return snapshot.algorithm===l.learning.mode&&snapshot.encoder===c.encoder;}
function cartridgeContract(l,c){const cfg=configuration(l,c);return JSON.stringify({runtime:CARTRIDGE_RUNTIME[l.learning.mode],content:l.contentVersion,observation:[l.observation.profileId,l.observation.encoderId],reward:[l.reward.id,cfg.gamma,cfg.reward],controls:c,policies:l.learning.policies??null});}
function contractCompatible(saved,current){if(!saved)return true;try{const normalize=value=>Array.isArray(value)?value.map(normalize):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key])])):value;return JSON.stringify(normalize(JSON.parse(saved)))===JSON.stringify(normalize(JSON.parse(current)));}catch{return false;}}
async function startLevel(id,fromRoute=false,skipIntro=false){
 if(!fromRoute){routeTo('game',id);return;}
 const l=LEVELS.find(l=>l.id===id);if(!l)return;
 if(l.prerequisites.some(p=>!save.completed.includes(p))){history.replaceState({echoHeist:true},'',PAGE_ROUTES.map);renderedHash=PAGE_ROUTES.map;navigate('map',true);toast('Finish the previous mission first.');return;}
 if(id==='L01'&&!save.prologueSeen&&!save.completed.includes('L01')){clearToast();cancelTraining();closeDialog();prologue(l);return;}
 if(!skipIntro&&introducedLevel!==id){clearToast();cancelTraining();closeDialog();missionIntro(l);return;}
 clearToast();cancelTraining();closeDialog();page='game';level=l;revision++;lastStats=null;l01ObservedFailure=false;previewBase=null;
 const saved=save.cartridges[id],savedCapabilities=[...(saved?.capabilities??[])];controls=applyCapabilities({...playerControlDefaults(l),...l.learning.defaults,...saved?.controls},savedCapabilities,l);const compatible=contractCompatible(saved?.contract,cartridgeContract(l,controls));if(!compatible)controls=applyCapabilities({...playerControlDefaults(l),...l.learning.defaults},[],l);
 const controlMode=isControlMode(l.learning.mode),planningMode=isPlanningMode(l.learning.mode),predictionMode=l.learning.mode==='prediction',advancedMode=isAdvancedMode(l.learning.mode);
 q=compatible?(controlMode?saved?.q:predictionMode?saved?.prediction:advancedMode?saved?.snapshot:saved?.evaluation):null;episodes=compatible?(saved?.episodes??q?.episodes??0):0;demonstrations=compatible&&l.learning.mode==='behavioral-cloning'?(saved?.demonstrations??[]).map(clone):[];demonstrating=false;demonstrationBase=null;currentDemonstration=[];demonstrationId=0;if(controlMode&&!q)q=id==='L04'?familiarPrior(l,configuration(l,controls)):{};
 if(controlMode&&q&&saved?.stats)lastStats=saved.stats;if(planningMode&&q)lastStats={...q,outcome:q.successProbability>.5?'model ready':'low delivery chance',steps:0};if(predictionMode&&q)lastStats=saved?.stats??{startValue:0,startCount:0,outcome:'receipts restored',steps:0,policyHash:q.policyHash};if(advancedMode&&q)lastStats=saved?.stats??{outcome:'cartridge restored',steps:0};
 if(saved&&!compatible){delete save.cartridges[id];persist();}
 // A mission may restore only its own compatible cartridge. Nothing deployed,
 // queued, or selected for another level crosses this boundary.
 deployedQ=null;deployedControls=null;state=createEpisode(l,{config:configurationForStage(l,controls,0,compatible?savedCapabilities:[]),episodeId:`${id}-${revision}`});
 if(compatible&&savedCapabilities.length){for(const entity of state.entities.filter(entity=>entity.kind==='cartridge')){entity.taken=savedCapabilities.includes(entity.capabilityId);entity.locked=!entity.taken&&entity.choiceGroup===l.learning.capabilityPuzzle?.group;}}
 state.echoStagePrepared=compatible&&saved?.preparedStage===0;trace=[];random=rng(l.seeds.root+900000);environmentRandom=rng(l.seeds.root+910000+revision);keys.clear();queue=[];save.currentLevel=id;persist();
 const chapter=CHAPTERS.find(candidate=>candidate.id===l.chapterId)??CHAPTERS[0];
 const mechanic=DISTRICT_MECHANICS[l.chapterId],firstMission=Number(id.slice(1))%5===1;
 app.innerHTML=`<section class="screen game theme-${chapter.theme}"><div class="world-panels"><div class="world-panel patch-panel"><canvas id="patch-world" width="800" height="800" tabindex="0" aria-label="${l.title}, Patch maze. Move with WASD or arrows, E to interact, R to inspect Echo, T to retry, Escape to pause."></canvas><span class="maze-label patch-label">PATCH / YOU</span><div class="echo-run-lock" aria-hidden="true"><b>ECHO IS RUNNING</b><span>PATCH CONTROLS PAUSED</span></div></div><div class="world-panel echo-panel"><canvas id="echo-world" width="800" height="800" aria-label="${l.title}, autonomous Echo maze."></canvas><span class="maze-label echo-label">ECHO / AUTONOMOUS</span></div></div><header class="game-header"><div class="game-heading"><div class="eyebrow">${chapter.short}</div><h1>${l.title}</h1></div><div class="actions"><button class="mechanic-pill ${firstMission?'new':''}" data-action="dynamics"><span>${firstMission?'NEW DISCOVERY':'ECHO LOADOUT'}</span>${mechanic.name}</button>${button(icon('sound'),'mute','icon quiet',`aria-label="${save.settings.muted?'Turn audio on':'Mute audio'}" aria-pressed="${save.settings.muted}"`)}${button(icon('pause'),'pause','icon quiet','aria-label="Pause game"')}</div></header><footer class="game-footer"><span id="mission-state" class="sr-only" role="status" aria-live="polite"></span><div class="controls-hint"><span><span class="key">WASD</span> MOVE PATCH</span><span><span class="key">E</span> USE / EXIT</span><button class="terminal-hotkey" data-action="echo-terminal" aria-label="Open Echo model"><b>R</b><span>ECHO MODEL</span></button><span><span class="key">T</span> RETRY</span></div><div class="touch-controls" aria-label="Touch controls">${[['&#8592;',4],['&#8593;',1],['&#8594;',2],['&#8595;',3],['E',5]].map(([text,a])=>button(text,'touch','quiet',`data-command="${a}" aria-label="${{1:'Move north',2:'Move east',3:'Move south',4:'Move west',5:'Interact'}[a]}"`)).join('')}${button('R','echo-terminal','quiet','aria-label="Open Echo model"')}</div></footer></section>`;
 const gen=++renderGeneration;renderer=new Renderer(app.querySelector('#patch-world'),app.querySelector('#echo-world'));renderer.reducedMotion=save.settings.reducedMotion;
 try{await renderer.init();if(gen!==renderGeneration)return;lastDecision=performance.now();updateHud();renderer.draw(state,performance.now());app.querySelector('#patch-world')?.focus();audio.theme(`chapter-${Number(chapter.number)}`);if(id==='L01'&&!save.completed.includes('L01')&&!savedCapabilities.length)showL01Welcome();else if(firstMission&&id!=='L01')toast(`New district system: ${mechanic.name}. ${mechanic.intro}`);else if(saved&&!compatible)toast('This cartridge used an older state, model, or reward contract, so its incompatible work was safely reset.');}
 catch(e){toast(`Could not load game art: ${e.message}`);}
}
function objectiveText(){
 if(demonstrating)return 'You have Echo’s controls. Complete the cyan delivery; Patch waits safely.';
 if(state.echoActive)return state.previewEcho?'Echo is testing the current incomplete contract. This rehearsal cannot open Patch’s doors.':'Echo is running the frozen policy. Patch controls are paused until Echo returns.';
 if(level.id==='L01'){const gate=findEntity(state,'exitGate'),socket=findEntity(state,'patchRelaySocket1');if(gate?.open)return 'Echo delivered the fuse. Reach the open orange exit lock and press E.';if(socket?.powered)return 'Sunrise Tread installed. Press R, train again, then run Echo.';if(l01ObservedFailure)return state.patch.cargo==='patchRelayCell1'?'Carry the Relay cell to the Socket and press E.':'Find the orange Relay cell, press E to carry it, then install it in the Socket.';return 'Press R anywhere. Train Echo, then run the frozen policy and watch what it cannot do yet.';}
 const patchTask=nextPatchTask();if(patchTask)return patchTask;
 const exitGate=findEntity(state,'exitGate'),patchExit=findEntity(state,'patchExit');if(exitGate?.open&&!patchExit?.active)return 'Echo finished every relay. Reach the open orange exit lock and press E to finish the mission.';
 const relayStage=echoStageFor();
 if(relayStage&&state.courierOutcome!=='delivered'){
  if(state.echoActive)return `${relayStage.label}: Echo is running the frozen policy in the right-hand room.`;
  if(canTrain(state))return `${relayStage.label}: press R, choose the visible state, reward and practice settings, train, then run Echo.`;
 }
 const heavyGate=findEntity(state,'heavyGate');if(heavyGate&&!heavyGate.open)return 'Latch the heavy shutter with the orange lever.';
 if(!state.receiverReady)return 'Prepare the receiving socket at the console.';
 if(['C02','C03'].includes(level.chapterId)){
  if(state.courierOutcome==='delivered')return level.id==='L10'?'The container is aboard. Reach the orange train platform before departure.':'Delivery complete. Meet Echo on the orange exit platform.';
  if(state.echoActive)return `Echo is following the frozen ${deployedControls?.policy??controls.policy} policy. You handle extraction.`;
  return level.chapterId==='C03'?'Press R to compute and freeze the next route.':'Press R to evaluate the fixed route, then run Echo.';
 }
 if(level.chapterId==='C04'){
  if(state.courierOutcome==='delivered')return state.patch.cargo?`Carry the district core to the orange exit.`:'The fixed courier delivered. Complete the extraction.';
  if(state.echoActive)return 'Echo follows the unchanged courier policy. Your receipts only predicted its return.';
  return 'Collect real delivery receipts, compare the value estimate, then dispatch the frozen courier.';
 }
 if(level.chapterId==='C06'){
  if(state.courierOutcome==='delivered')return state.patch.cargo?'Carry the foundry core to the orange exit.':'Echo transferred the modules. Complete the extraction.';
  if(state.echoActive)return 'Echo follows the frozen linear policy. You handle the foundry extraction.';
  return 'Choose a feature cartridge, run real semi-gradient SARSA practice, then freeze the policy.';
 }
 if(level.chapterId==='C07'){
  if(state.courierOutcome==='delivered')return state.patch.cargo?'Carry the dock core to the orange exit.':'The learned machine model held. Complete the extraction.';
  if(state.echoActive)return 'Echo follows frozen action values learned from real and empirical-model updates.';
  return 'Gather real dock experience, rehearse from the learned model, then freeze the route.';
 }
 if(level.chapterId==='C08'){
  if(state.courierOutcome==='delivered')return state.patch.cargo?'Carry the sky core to the orange exit.':'Echo crossed the skybridge. Complete the extraction.';
  if(state.echoActive)return 'Echo follows the frozen softmax policy. You handle the bridge extraction.';
  return 'Train the on-policy courier, freeze its softmax policy, then dispatch Echo.';
 }
 if(['C09','C10'].includes(level.chapterId)){
  if(state.courierOutcome==='delivered')return state.patch.cargo?'Carry the district core to the orange exit.':'The frozen neural courier delivered. Complete the extraction.';
  if(state.echoActive)return 'Echo follows the frozen deep action-value network. You handle extraction.';
  return level.chapterId==='C09'?'Gather real replay, update the target twin, then freeze the neural route.':'Train across the selected storm conditions, then dispatch the frozen robust route.';
 }
 if(level.chapterId==='C11'){
  if(demonstrating)return 'You have Echo’s controls. Demonstrate the complete delivery with WASD and E.';
  if(state.courierOutcome==='delivered')return state.patch.cargo?'Carry the tower core to the orange exit.':'Echo repeated your lesson alone. Complete the rescue.';
  if(state.echoActive)return 'Echo follows the frozen policy cloned only from your successful demonstrations.';
  return 'Record a successful Echo run, train the clone, then let your partner repeat it alone.';
 }
 if(level.chapterId==='C12'){
  const boss=findEntity(state,'eclipseWarden'),delivered=state.entities.filter(entity=>entity.required&&entity.delivered&&(entity.kind!=='core'||entity.echoCarry)).length;
  if(state.courierOutcome==='delivered')return state.patch.cargo?'The Warden is down. Carry the city heart to the dawn gate.':'The Warden is down. Reach the orange extraction gate.';
  if(state.echoActive)return boss?`Echo is breaking Warden shield ${Math.min(delivered+1,boss.stages)} of ${boss.stages}. Keep Patch moving.`:'Echo follows the frozen finale network. You handle extraction.';
  return 'Train one last honest neural cartridge. Freeze it, then breach the Citadel together.';
 }
 if(state.courierOutcome==='delivered')return level.id==='L05'&&state.patch.cargo!=='relayCore'?'Collect the relay core, then meet Echo at the lift.':'Echo delivered the cargo. Reach the orange exit pad.';
 if(state.echoActive)return 'Echo handles the service lane. You handle the exit.';
 return 'Press R anywhere to inspect, train and run Echo.';
}
function nextPatchTask(){
 if(!level?.task.patchRoute)return null;
 if(level.id==='L06'&&!state.capabilities.includes('sense-cargo'))return state.capabilities.length?'ROOM 1 / Floor Counter cannot separate Echo’s two jobs. Press T to release it and choose Pocket Sensor.':'ROOM 1 / Find Pocket Sensor in the orange maze. It lets Echo distinguish carrying cargo from searching for it.';
 const route=level.task.patchRoute;
 for(let index=0;index<route.length;index++){
  const entity=findEntity(state,route[index]);if(!entity)continue;
  if(entity.relayCell&&!entity.taken&&!entity.delivered&&state.patch.cargo!==entity.id)return `ROOM ${entity.stageIndex+1} / Find the orange relay cell hidden in this room.`;
  if(entity.relayCell)continue;
  if(entity.relayPower&&!entity.powered){const cell=findEntity(state,entity.accepts);return state.patch.cargo===entity.accepts?`ROOM ${entity.stageIndex+1} / Carry the Relay cell to its Socket. It will change Echo’s real model.`:cell&&!cell.taken?`ROOM ${entity.stageIndex+1} / Find the Relay cell that changes Echo’s model.`:`ROOM ${entity.stageIndex+1} / Install the Relay cell in its Socket.`;}
   if(entity.kind==='dock')continue;
  if(entity.kind==='lever'&&!entity.active)return entity.id==='latch'?`ROOM 1 / Open the extraction shutter with the orange lever.`:`ROOM ${entity.room+1} / Activate security switch ${entity.room} to breach the next room.`;
  if(entity.kind==='console'&&!state.receiverReady)return `ROOM ${level.task.patchRoomCount} / Arm Echo’s receiving socket at the console.`;
 }
 return null;
}
function updateHud(){
 if(page!=='game'||!state)return;
 const status=app.querySelector('#mission-state');if(status){const stages=echoStagesFor(level),phase=state.courierOutcome==='delivered'?'delivered':state.failed?'failed':state.echoActive?'running':state.echoStagePrepared?'trained and ready':'ready';status.textContent=`${objectiveText()}${stages.length?` Echo relay ${(state.echoStage??0)+1} of ${stages.length}: ${phase}.`:''}`;}
 const locked=state.echoActive&&!demonstrating;app.querySelector('.patch-panel')?.classList.toggle('echo-running',locked);const lock=app.querySelector('.echo-run-lock');if(lock)lock.setAttribute('aria-hidden',String(!locked));for(const control of app.querySelectorAll('.touch-controls button[data-command]'))control.disabled=locked;
}
function snapshotForPersistence(){
 if(!q)return null;
 const snapshot=clone(q);
 // Dyna's action values are the deployable policy. Keep them all, while
 // bounding the auxiliary empirical rehearsal table to recent, genuinely
 // observed pairs so a late-district cartridge remains reloadable in browser
 // storage. Continued practice simply observes and rebuilds older pairs again.
 if(level?.learning.mode==='dyna-q'&&snapshot.modelKeys?.length>512){
  snapshot.modelKeys=snapshot.modelKeys.slice(-512);
  snapshot.model=Object.fromEntries(snapshot.modelKeys.map(key=>[key,snapshot.model[key]]).filter(([,pair])=>pair));
 }
 return snapshot;
}
function recordCartridge(){
 if(!level||level.learning.mode==='none')return;
 const prepared=state?.echoStagePrepared?{preparedStage:state.echoStage??0}:{},physical=state?.capabilities?.length?{capabilities:[...state.capabilities]}:{},stats=lastStats?{outcome:String(lastStats.outcome??'checked'),steps:Number(lastStats.steps)||0,...(Number.isFinite(lastStats.successProbability)?{successProbability:lastStats.successProbability}:{}),...(Number.isFinite(lastStats.validationTrials)?{validationTrials:lastStats.validationTrials}:{}),...(Number.isFinite(lastStats.validationDeliveries)?{validationDeliveries:lastStats.validationDeliveries}:{})}:null;
 if(isControlMode(level.learning.mode))save.cartridges[level.id]={controls:{...controls},q:q??{},stats,episodes,...physical,...prepared,revision:1,contract:cartridgeContract(level,controls)};
 else if(level.learning.mode==='prediction')save.cartridges[level.id]={controls:{...controls},prediction:q?JSON.parse(JSON.stringify(q)):null,stats,episodes:q?.episodes??episodes,...physical,...prepared,revision:1,contract:cartridgeContract(level,controls)};
 else if(isAdvancedMode(level.learning.mode))save.cartridges[level.id]={controls:{...controls},snapshot:snapshotForPersistence(),stats,episodes:q?.episodes??episodes,...physical,...prepared,...(level.learning.mode==='behavioral-cloning'?{demonstrations:demonstrations.map(clone)}:{}),revision:1,contract:cartridgeContract(level,controls)};
 else save.cartridges[level.id]={controls:{...controls},evaluation:q?{policyHash:q.policyHash,startValue:q.startValue,successProbability:q.successProbability,stateCount:q.stateCount,sweeps:q.sweeps,algorithm:q.algorithm,iterations:q.iterations??0,policy:q.policy??null}:null,stats,...physical,...prepared,revision:1,contract:cartridgeContract(level,controls)};
 persist();
}
function resetEarlyEchoAttempt(reason){
 const previous=state,fresh=createEpisode(level,{config:configurationForStage(level,controls,previous.echoStage??0,previous.capabilities),episodeId:`${level.id}-${revision}-echo-retry`});
 const preserveEntity=entity=>entity.field==='patch'||['latch','receiverControl','practiceDock','heavyGate','patchExit'].includes(entity.id)||entity.kind==='crate'||entity.kind==='core'&&!entity.echoCarry;
 const previousById=new Map(previous.entities.map(entity=>[entity.id,entity]));
 state={...fresh,patch:clone(previous.patch),patchCheckpoint:clone(previous.patchCheckpoint),capabilities:[...(previous.capabilities??[])],receiverReady:previous.receiverReady,awake:true,missionStarted:true,entities:fresh.entities.map(entity=>preserveEntity(entity)?clone(previousById.get(entity.id)??entity):entity)};
 trace=[];environmentRandom=rng(level.seeds.root+910000+revision+previous.tick);audio.setMood('idle');updateHud();
 if(level.id==='L01'&&!state.capabilities.includes('act-east')){
  l01ObservedFailure=true;
  showDialog('echo-retry',`<img class="dialog-robot" src="${img('echo','charge')}"><div class="eyebrow">SAFE FAILURE / THE MODEL WAS HONEST</div><h2>Echo cannot move toward the cargo yet.</h2><p>The frozen run used exactly the actions shown in R. EAST was dark, so no amount of practice could invent that motor pulse.</p><p>Guide Patch to the orange <b>Relay cell</b>, press E to carry it, then bring it to the <b>Socket</b>. That physical connection installs Sunrise Tread in Echo.</p><div class="tutorial-steps"><span class="done"><b>1</b> OPEN R</span><span class="done"><b>2</b> FAIL SAFELY</span><span class="active"><b>3</b> CELL → SOCKET</span><span><b>4</b> TRAIN + RUN</span></div><div class="actions">${button('Find the Relay cell','close','primary')}${button('Inspect Echo again','adjust-echo','quiet')}</div>`);
 }else showDialog('echo-retry',`<img class="dialog-robot" src="${img('echo')}"><div class="eyebrow">ECHO ROUTE RESET / PATCH PROGRESS KEPT</div><h2>Echo is back at the start.</h2><p>${reason} Patch stays where you left it, and the compatible frozen model is still installed.</p><div class="actions">${button('Try the same route','redeploy','primary')}${button('Train or change Echo','adjust-echo')}${button('Restart whole mission','retry','quiet')}</div>`);
}
function advanceEchoRelay(){
 const stages=echoStagesFor(level),current=echoStageFor(),nextIndex=(state.echoStage??0)+1;if(!current||nextIndex>=stages.length)return false;
 const previous=state,previousById=new Map(previous.entities.map(entity=>[entity.id,entity])),fresh=createEpisode(level,{config:configurationForStage(level,controls,nextIndex),episodeId:`${level.id}-${revision}-relay-${nextIndex+1}`});
 const patchEntity=entity=>entity.field==='patch'||entity.patchOnly||(!entity.field&&level.geometry.tiles?.[entity.y]?.[entity.x]==='p')||entity.kind==='exit-patch'||entity.kind==='core'&&!entity.echoCarry;
 const entities=fresh.entities.map(entity=>patchEntity(entity)&&previousById.has(entity.id)?clone(previousById.get(entity.id)):entity),stageDeliveries=[...(previous.stageDeliveries??[]),current.id];
 state={...fresh,tick:previous.tick,patch:clone(previous.patch),patchCheckpoint:clone(previous.patchCheckpoint),patchStrikes:previous.patchStrikes,receiverReady:previous.receiverReady,awake:true,missionStarted:false,missionSteps:0,echoStage:nextIndex,echoStagePrepared:false,activeDock:null,stageDeliveries,entities,ledger:previous.ledger.filter(entry=>{const id=entry.split(':')[1];return patchEntity(previousById.get(id)??{});})};
 const portal=current.gateId?findEntity(state,current.gateId):null;if(portal)portal.open=true;
 q=null;episodes=0;lastStats=null;deployedQ=null;deployedControls=null;trace=[];random=rng(level.seeds.root+900000+nextIndex*997);environmentRandom=rng(level.seeds.root+910000+revision+nextIndex*997);audio.setMood('idle');audio.sfx('door_open');toast(`Echo powered ${current.label.toLowerCase()}. Portal open — the next mini-puzzle needs its own training run.`);updateHud();return true;
}
function resetCurrentRelayAttempt(reason){
 const previous=state,index=previous.echoStage??0,previousById=new Map(previous.entities.map(entity=>[entity.id,entity])),fresh=createEpisode(level,{config:configurationForStage(level,controls,index),episodeId:`${level.id}-${revision}-relay-retry-${index+1}`});
 const patchEntity=entity=>entity.field==='patch'||entity.patchOnly||(!entity.field&&level.geometry.tiles?.[entity.y]?.[entity.x]==='p')||entity.kind==='exit-patch'||entity.kind==='core'&&!entity.echoCarry;
 state={...fresh,tick:previous.tick,patch:clone(previous.patch),patchCheckpoint:clone(previous.patchCheckpoint),patchStrikes:previous.patchStrikes,receiverReady:previous.receiverReady,awake:true,missionStarted:false,missionSteps:0,echoStage:index,echoStagePrepared:previous.echoStagePrepared,activeDock:previous.activeDock??echoStagesFor(level)[index]?.dockId??null,stageDeliveries:[...(previous.stageDeliveries??[])],entities:fresh.entities.map(entity=>patchEntity(entity)&&previousById.has(entity.id)?clone(previousById.get(entity.id)):entity),ledger:previous.ledger.filter(entry=>{const id=entry.split(':')[1];return patchEntity(previousById.get(id)??{});})};
 trace=[];environmentRandom=rng(level.seeds.root+910000+revision+index*997+previous.tick);audio.setMood('idle');updateHud();showDialog('echo-retry',`<img class="dialog-robot" src="${img('echo')}"><div class="eyebrow">RELAY RUN RESET / PATCH ROOM KEPT</div><h2>Echo is back in its panel.</h2><p>${reason} Patch, opened portals, checkpoints, and the compatible trained cartridge remain intact.</p><div class="actions">${button('Retry frozen run','redeploy','primary')}${button('Tune and train again','adjust-echo')}${button('Restart mission','retry','quiet')}</div>`);
}
function finishPreview(outcome){
 const success=outcome==='delivered',base=previewBase;if(!base)return;state=base;previewBase=null;deployedQ=null;deployedControls=null;trace=[];audio.setMood('idle');updateHud();
 if(level.id==='L01'){resetEarlyEchoAttempt('Echo tested the incomplete drive set.');return;}
 const stage=echoStageFor(),requiredId=stage?.requiredCapability??level.task.requiredCapability??level.learning.capabilityPuzzle?.required,required=capability(requiredId),missing=(stage?.requirements??level.task.patchRequirements??[]).find(id=>{const entity=findEntity(state,id);return entity?.kind==='console'?!entity.active&&!state.receiverReady:entity?.kind==='socket'?!entity.powered:!entity?.active;}),missingEntity=findEntity(state,missing),next=requiredId&&!state.capabilities.includes(requiredId)?`Recover <b>${required?.name??requiredId}</b> with Patch.`:missingEntity?.kind==='socket'?`Carry its Relay cell to <b>${missingEntity.id.replace(/patchRelaySocket/,'Socket ')}</b>.`:missingEntity?`Reach and activate <b>${missingEntity.id.replace(/([a-z])([A-Z])/g,'$1 $2')}</b>.`:'Complete the remaining orange relay path.';
 showDialog('echo-preview',`<img class="dialog-robot" src="${img('echo')}" alt="Echo"><div class="eyebrow">SAFE REHEARSAL / PATCH PROGRESS PROTECTED</div><h2>${success?'Echo reached the practice receiver—but the relay stayed dark.':'Echo’s incomplete model could not finish this relay.'}</h2><p>${success?'The rehearsal used the real frozen model, but an unfinished Patch contract cannot power a door or advance the mission.':'The run used only the state, actions, signal, and hardware Patch has installed so far. It reset without erasing Patch progress.'}</p><p>${next} Then train a fresh compatible policy and run again.</p><div class="actions">${button('Return to Patch','close','primary')}${button('Inspect Echo','adjust-echo')}${button('Restart mission','retry','quiet')}</div>`);
}
function command(action){if(page!=='game'||paused||!renderer?.ready||!state||state.complete||state.failed)return;
 if(demonstrating){
  const sample={input:featureVector(level,configuration(level,controls),state),action,episodeId:`${level.id}-player-${revision}-${demonstrationId}`},out=step(state,{echoAction:action,stochasticSample:environmentRandom()});currentDemonstration.push(sample);state=out.state;
  for(const event of out.events){const sound={pickup:'patch_carry_pickup',delivery:'echo_delivery',caught:'laser_caught',slip:'patch_bump'}[event.type];if(sound)audio.sfx(sound);}
  updateHud();
  if(out.terminated){const success=state.courierOutcome==='delivered';if(success)demonstrations=[...demonstrations,...currentDemonstration].slice(-(level.learning.maxExamples??512));state=demonstrationBase;demonstrating=false;demonstrationBase=null;currentDemonstration=[];recordCartridge();showDialog('terminal',echoTerminalHtml());toast(success?'Successful lesson recorded. Train Echo when you are ready.':'That lesson did not reach the receiver, so it was not added. Try again.');updateHud();}
  return;
 }
 const before=state,mode=level.learning.mode,snapshot=deployedQ??q??{};
 const ea=state.echoActive?(isPlanningMode(mode)?plannedPolicyAction(level,deployedControls??controls,state,deployedQ):mode==='prediction'?fixedPolicyAction(level,deployedControls??controls,state):mode==='linear-sarsa'?linearSnapshotAction(level,deployedControls??controls,state,snapshot,random):mode==='dyna-q'?dynaSnapshotAction(state,snapshot,random):['reinforce','reinforce-baseline','actor-critic'].includes(mode)?policySnapshotAction(level,deployedControls??controls,state,snapshot,random):mode==='dqn'?dqnSnapshotAction(level,deployedControls??controls,state,snapshot,random):mode==='behavioral-cloning'?imitationSnapshotAction(level,deployedControls??controls,state,snapshot):choose(snapshot,encode(observeEcho(state)),random,0)):0;
 const patchAction=state.echoActive?0:action,out=step(state,{patchAction,echoAction:ea,stochasticSample:environmentRandom()});state=out.state;
 if(patchAction>0&&patchAction<5){audio.sfx(at(before.patch,state.patch)?'patch_bump':state.tick%2?'patch_step_metal_01':'patch_step_metal_02');}
 for(const event of out.events){
   const sound={pickup:event.itemId==='relayCore'||event.itemId==='coreContainer'?'item_core':'patch_carry_pickup',capability:'terminal_accept',portal:'door_open',delivery:event.actor==='echo'?'echo_delivery':'echo_boot',scrap:'item_scrap_01','gate-open':'door_open','receiver-ready':'terminal_accept','exit-activated':'terminal_accept',push:'patch_push_start',caught:'laser_caught','patch-hit':'laser_caught',slip:'patch_bump'}[event.type];
  if(sound)audio.sfx(sound);
  if(event.type==='patch-hit')toast('Security patrol caught Patch. Returning to the last activated room checkpoint.');
  if(event.type==='gate-open'&&event.entityId!=='exitGate')toast('Security door opened. Patch can continue through the orange maze.');
  if(event.type==='pickup'&&level.id==='L01'&&event.itemId==='patchRelayCell1')toast('Relay cell collected. Carry it to the Socket and press E to install Sunrise Tread.');
  if(event.type==='gate-open'&&level.id==='L01'&&event.entityId==='exitGate')toast('Echo delivered the fuse. Patch’s orange exit door is open.');
  if(event.type==='capability'){
   const item=capability(event.capabilityId);controls=applyCapabilities(controls,state.capabilities,level);q=isControlMode(level.learning.mode)?{}:null;episodes=0;trace=[];lastStats=null;state={...state,config:configurationForStage(level,controls,state.echoStage??0,state.capabilities),echoStagePrepared:false};revision++;recordCartridge();toast(`${item?.name??'Capability'} installed. ${item?.story??''}`);
   if(level.id==='L01')showDialog('tutorial',`<img class="dialog-robot" src="${img('patch')}" alt="Patch"><div class="eyebrow">SUNRISE TREAD / INSTALLED</div><h2>The Socket changed Echo’s action space.</h2><p>Open R again. EAST is now lit beside Echo’s other actions. Training starts a fresh compatible table because the old policy was learned for a different machine.</p><p>Train, check the visible delivery estimate, then run the newly frozen policy. A successful delivery opens Patch’s orange exit door.</p><div class="tutorial-steps"><span class="done"><b>1</b> OPEN R</span><span class="done"><b>2</b> FAIL SAFELY</span><span class="done"><b>3</b> CELL → SOCKET</span><span class="active"><b>4</b> TRAIN + RUN</span></div><div class="actions">${button('Open the repaired model','tutorial-open-echo','primary')}${button('Return to Patch','close','quiet')}</div>`);
  }
  if(event.type==='dock-locked')toast('The relay key is red. Find and install the cartridge that completes Echo’s route first.');
   if(event.type==='portal-locked')toast('This portal is dark. Activate its room switch first.');
   if(event.type==='exit-locked')toast('The exit lock is red. Echo must finish every relay task before this door opens.');
  if(event.type==='dock-open')openDock(event.entityId);
  }
 if(previewBase&&(state.courierOutcome||state.failed||!state.echoActive)){finishPreview(state.courierOutcome??'stopped');return;}
 if(state.courierOutcome==='delivered'&&advanceEchoRelay())return;
 if(state.courierOutcome==='delivered')audio.setMood('extraction');
 updateHud();
 if(state.complete){clearMission();return;}
 if(state.failed){if(echoStagesFor(level).length)resetCurrentRelayAttempt('The sampled route was caught or exhausted this relay’s budget.');else if(Number(level.id.slice(1))<=7)resetEarlyEchoAttempt('The sampled route was caught or ran out of its mission budget.');else failAttempt(['C02','C03','C04'].includes(level.chapterId)?'The route ran out of room.':'The machinery got the better of us.',['C02','C03','C04'].includes(level.chapterId)?'The sampled outcome or mission budget stopped this run. The frozen snapshot is still intact.':'A quick reset. A little more practice. Echo keeps its compatible cartridge.');return;}
 if(state.courierOutcome==='scrap'){if(echoStagesFor(level).length)resetCurrentRelayAttempt('Echo chose the shiny dead end instead of powering this relay.');else if(Number(level.id.slice(1))<=7)resetEarlyEchoAttempt('Echo chose the shiny dead end instead of the delivery.');else failAttempt('That is shiny. It is not the cargo.','Echo completed a scrap collection instead of the delivery. Try another cartridge setting and practice again.');return;}
 if(state.echoActive&&state.echoSteps>=level.task.administrativeRolloutLimit){if(previewBase){finishPreview('budget');return;}state={...state,cancelled:true};if(echoStagesFor(level).length)resetCurrentRelayAttempt('This frozen policy used its action budget before finishing the relay.');else if(Number(level.id.slice(1))<=7)resetEarlyEchoAttempt('This route used its action budget before reaching the receiver.');else failAttempt('Time to try another route.','This attempt reached its action budget. The attempt was stopped; Echo can keep practicing.');}
}
function openDock(dockId=null){
 const relayStage=echoStageFor();if(relayStage&&dockId!==relayStage.dockId){toast('That relay belongs to another room. Follow Patch’s current portal route.');return;}
 openEchoTerminal();
}
const ALGORITHM_PRESENTATION={
 none:['Boot route','A disclosed fixed wake-up check; no learning yet.'],
 'q-learning':['Tabular Q-learning','A table stores one learned value for every visible state-action pair.'],
 sarsa:['Tabular SARSA','A table learns from the next action Echo actually samples.'],
 'policy-evaluation':['Exact policy evaluation','A fixed route is measured against the complete known machine model.'],
 'policy-improvement':['Policy improvement','Exact values replace a wasteful action with a better continuation.'],
 'policy-iteration':['Policy iteration','Exact evaluation and greedy improvement alternate until stable.'],
 'value-iteration':['Value iteration','Bellman optimality sweeps build a greedy route from the known model.'],
 prediction:['MC / TD prediction','Experience receipts estimate return while the courier policy remains fixed.'],
 'linear-sarsa':['Linear SARSA','Feature weights share learning between states instead of keeping one table row each.'],
 'dyna-q':['Dyna-Q','Real transitions build a model; rehearsal samples only outcomes that model observed.'],
 reinforce:['REINFORCE','A softmax policy raises or lowers action probabilities from completed returns.'],
 'reinforce-baseline':['REINFORCE + baseline','A learned value baseline reduces variance without choosing actions.'],
 'actor-critic':['Actor-critic','A separate critic supplies one-step advantages to the probability actor.'],
 dqn:['Compact DQN','A neural action-value model learns from bounded real replay and a frozen target twin.'],
 'behavioral-cloning':['Behavioral cloning','A neural policy imitates only successful pre-action examples recorded by you.']
};
const ACTION_NAMES=['WAIT','NORTH','EAST','SOUTH','WEST','USE'];
function stateFieldNames(runtime){
 const fields=['room','x / y tile','facing'];if(runtime.sensorSuite!=='compact')fields.push('carried cargo','required items','open gates','time remaining','hazard phase');if(Number(level.chapterId.slice(1))>=7)fields.push(runtime.sensorSuite==='compact'?'enemy hidden by this sensor':'nearest enemy direction, range + motion');if(['beacon','lidar'].includes(runtime.sensorSuite))fields.push('goal direction');if(runtime.sensorSuite==='lidar')fields.push('north/east/south/west wall contacts');return fields;
}
function currentPolicyVector(runtime){
 if(!state)return null;const mode=level.learning.mode,observation=observeEcho(state),features=()=>featureVector(level,runtime,state);let row=null;
 try{
  if(isControlMode(mode))row=values(q??{},encode(observation));
  else if(mode==='dyna-q')row=values(q?.q??{},encode(observation));
  else if(mode==='linear-sarsa'&&q)row=linearValues(q,features());
  else if(['reinforce','reinforce-baseline','actor-critic'].includes(mode)&&q)row=policyProbabilities(q,features());
  else if(mode==='dqn'&&q?.online)row=forward(loadMlp(q.online),features()).output;
  else if(mode==='behavioral-cloning'&&q?.model)row=predict(loadMlp(q.model),features(),{probabilities:true}).values;
  else if(isPlanningMode(mode)&&q){const action=plannedPolicyAction(level,runtime,state,q);row=Array.from({length:6},(_,index)=>index===action?1:0);}
  else if(mode==='prediction'){const action=fixedPolicyAction(level,runtime,state);row=Array.from({length:6},(_,index)=>index===action?1:0);}
  else if(mode==='none'){const action=bootAction(state);row=Array.from({length:6},(_,index)=>index===action?1:0);}
 }catch{return null;}
 if(!row?.length)return null;const allowed=new Set(runtime.allowedActions??[0,1,2,3,4,5]),legal=row.map((value,index)=>allowed.has(index)?Number(value)||0:-Infinity),alreadyProbabilities=legal.every(value=>value>=0&&Number.isFinite(value))&&Math.abs(legal.reduce((sum,value)=>sum+value,0)-1)<.02;
 if(alreadyProbabilities)return legal;const max=Math.max(...legal),weights=legal.map(value=>Number.isFinite(value)?Math.exp(Math.max(-40,Math.min(40,value-max))):0),sum=weights.reduce((total,value)=>total+value,0)||1;return weights.map(value=>value/sum);
}
function capabilityReadoutHtml(){
 const installed=(state.capabilities??[]).map(capability).filter(Boolean),runtime=configurationForStage(level,controls,state.echoStage??0,state.capabilities),observation=observeEcho(state),vector=currentPolicyVector(runtime),algorithm=ALGORITHM_PRESENTATION[level.learning.mode]??[level.learning.mode,'This core uses the current district learner.'],chapterIndex=Number(level.chapterId.slice(1)),collectedAlgorithms=CHAPTERS.slice(0,chapterIndex).map(chapter=>ALGORITHM_PRESENTATION[LEVELS.find(candidate=>candidate.chapterId===chapter.id)?.learning.mode]?.[0]).filter(Boolean),hyperparameters=[['discount γ',runtime.gamma],['step size α',runtime.alpha],['exploration ε',runtime.epsilonStart??runtime.epsilon],['entropy β',runtime.entropyBeta],['trace λ',runtime.lambda],['planning updates',runtime.planning],['practice batch',level.learning.maxSweeps?`${effectiveSweeps(level,runtime)} sweeps`:`${effectiveEpisodes(level,runtime)} episodes`]].filter(([,value])=>value!==undefined),chance=routeReliability(),chanceText=Number.isFinite(chance)?isPlanningMode(level.learning.mode)?`${Math.round(chance*100)}% exact-model delivery`:`${Math.round(chance*100)}% (${lastStats?.validationDeliveries??0}/${lastStats?.validationTrials??0} frozen checks)`:'not measured',ready=state.echoStagePrepared||reliableEnough();
 const focus=level.learning.puzzleFocus??'policy',contractCards=[['state','STATE',runtime.sensorSuite??runtime.representation??level.observation.profileId,'Exactly which facts reach the policy.'],['actions','ACTIONS',(runtime.allowedActions??[0,1,2,3,4,5]).map(action=>ACTION_NAMES[action]).join(' · '),'Only these moves can be selected or learned.'],['reward','REWARD',runtime.rewardProfile??runtime.priority??level.reward.id,'These real signals drive every update.'],['policy','POLICY',algorithm[0],'The frozen decision rule Echo will actually run.']],contractHtml=`<div class="learning-contract">${contractCards.map(([id,name,value,copy])=>`<article class="${focus===id?'focus':''}"><span>${name}${focus===id?' / THIS LEVEL':''}</span><b>${value}</b><small>${copy}</small></article>`).join('')}</div>`;
 return `<div class="echo-terminal"><div class="terminal-title"><div><span>ECHO / INNER MODEL</span><h2>${algorithm[0]}</h2><p>${algorithm[1]}</p></div><div class="terminal-readiness ${ready?'ready':'unready'}"><b>${ready?'ROUTE READY':'NEEDS PRACTICE'}</b><strong>${chanceText}</strong><i style="--confidence:${Number.isFinite(chance)?Math.max(0,Math.min(1,chance)):0}"></i><small>${Number(level.id.slice(1))<=5?'You may run any frozen result; weak models can fail safely.':`Dispatch unlocks at ${Math.round(READINESS_TARGET*100)}% measured delivery.`}</small></div></div>${contractHtml}<div class="terminal-sections"><section><b>INPUT STATE / WHAT ECHO SEES</b><ul>${stateFieldNames(runtime).map(field=>`<li>${field}</li>`).join('')}</ul><code>${Object.entries(observation).map(([key,value])=>`${key}=${value??'empty'}`).join('  ')}</code></section><section><b>ACTION SPACE / WHAT ECHO CAN DO</b><div class="action-space">${ACTION_NAMES.map((name,index)=>`<span class="${(runtime.allowedActions??[0,1,2,3,4,5]).includes(index)?'enabled':'disabled'}">${index} · ${name}</span>`).join('')}</div></section><section><b>POLICY / CURRENT STATE</b><p>The bars show the frozen policy’s preference at Echo’s visible state—not a scripted route.</p><div class="policy-bars">${ACTION_NAMES.map((name,index)=>`<span><label>${name}</label><i style="--weight:${vector?.[index]??0}"></i><em>${vector?Math.round(vector[index]*100):0}%</em></span>`).join('')}</div></section><section><b>TRAINING ALGORITHM</b><p>${algorithm[0]}</p><small>Recovered cores: ${collectedAlgorithms.join(' · ')}</small></section><section><b>HYPERPARAMETERS</b><dl>${hyperparameters.map(([name,value])=>`<div><dt>${name}</dt><dd>${typeof value==='number'?Number(value).toFixed(value<1?3:0):value}</dd></div>`).join('')}</dl></section></div>${installed.length?`<div class="capability-loadout">${installed.map(item=>`<article><span>${item.type}</span><b>${item.name}</b><small>${item.story}</small></article>`).join('')}</div>`:''}</div>`;
}
function echoTerminalHtml(){return `<div class="echo-dialog-toolbar"><button class="echo-info-button" data-action="echo-info" aria-label="How Echo learns" title="How Echo learns">?</button><button class="echo-close" data-action="close" aria-label="Close Echo model"><b>&times;</b> Close</button></div><div class="echo-workbench">${dockHtml()}</div>`;}
function replaceEchoDialog(type,html){dialogType=type;dialog.innerHTML=html;requestAnimationFrame(()=>dialog.querySelector('button:not(:disabled)')?.focus());}
function echoInfoHtml(){return `<div class="echo-dialog-toolbar"><button class="btn quiet" data-action="echo-back">&#8592; Echo controls</button><button class="echo-close" data-action="close" aria-label="Close Echo model"><b>&times;</b> Close</button></div>${capabilityReadoutHtml()}`;}
function echoSolutionHtml(){
 const relayStage=echoStageFor(),requiredId=relayStage?.requiredCapability??level.task.requiredCapability??level.learning.capabilityPuzzle?.required,required=capability(requiredId),installed=!requiredId||state.capabilities.includes(requiredId),qOptions={priority:{label:'Priority cartridge',items:[['scrap','Shiny things'],['delivery','The delivery']]},future:{label:'Future priority',items:[['near','Right now'],['far','Think ahead']]},curiosity:{label:'Try new routes',items:[['familiar','Stay familiar'],['curious','Be curious']]}},definitions=Object.fromEntries(playerControlDefinitions(level).map(control=>[control.id,control])),options={...qOptions,...definitions},recommended={...applyCapabilities({...playerControlDefaults(level),...level.learning.defaults},requiredId?[requiredId]:[],level),...(level.id==='L02'?{priority:'delivery'}:{})},focus={state:'Echo needs the observation that separates states requiring different actions.',actions:'A learner cannot select a movement its installed action space does not contain.',reward:'The reward must make mission progress more valuable than a tempting dead end.',policy:'The frozen decision rule must match this room’s route and hazards.'}[level.learning.puzzleFocus]??'The installed capability and visible choices must describe the same task Echo will face.';
 const settings=exposedPlayerControls(level).map(key=>{const definition=options[key],value=recommended[key],label=definition?.items?.find(item=>item[0]===value)?.[1]??String(value??'authored default'),matches=controls[key]===value;return `<li class="${matches?'matched':'unmatched'}"><b>${definition?.label??key}</b><span>${label}</span><small>${matches?'Selected now':'Change this before training'}</small></li>`;}).join('');
 const stage=(state.echoStage??0)+1,source=level.id==='L06'&&!installed?`Both scanner cartridges are in Patch’s first orange room. Install <b>${required.name}</b>, carry Relay cell 1 to Socket 1, then open the portal switch and arm the workshop switch.`:required?level.learning.capabilityVersion==='relay-sockets-v1'?`Find the orange Relay cell and install it in its Socket. That Socket adds <b>${required.name}</b> to Echo.`:`Find the <b>${required.name}</b> cartridge, then complete this room’s Relay cell → Socket path so Echo can use it.`:'No new cartridge is hidden for this run. Complete the visible Patch switches, Relay cell → Socket path, and receiver shown in the orange maze.';
 return `<div class="echo-dialog-toolbar"><button class="btn quiet" data-action="echo-back">&#8592; Echo controls</button><button class="echo-close" data-action="close" aria-label="Close Echo model"><b>&times;</b> Close</button></div><section class="solution-guide"><div class="eyebrow">MISSION ${level.id.slice(1)} / ECHO RUN ${stage}</div><h2>Help for ${relayStage?.label??level.title}</h2><div class="solution-grid"><article><span>WHAT PATCH MUST FIND</span><p>${source}</p><small>${required?`${installed?'Installed now.':'Not installed yet.'} ${required.story}`:'This finale run uses the capabilities already recovered.'}</small></article><article><span>RIGHT COMBINATION</span>${settings?`<ul>${settings}</ul>`:'<p>This run has no extra selector. Install the required capability, train the authored batch, and run the measured frozen policy.</p>'}</article><article><span>WHY IT WORKS</span><p>${focus}</p><small>${relayStage?.challenge??'Training updates the real local model; Run uses only the frozen result.'}</small></article></div><div class="actions">${button('Back to Echo controls','echo-back','primary')}</div></section>`;
}
function openEchoTerminal(){if(page!=='game'||!state)return;showDialog('terminal',echoTerminalHtml());}
function previewRunAvailable(){
 if(!level||level.learning.mode==='none'||!state||state.failed||state.echoActive)return false;
 const stage=echoStageFor(),required=stage?.requiredCapability??level.task.requiredCapability??level.learning.capabilityPuzzle?.required,missingCapability=!!required&&!state.capabilities.includes(required);
 return missingCapability||!canDeploy(state);
}
function snapshotReadyForRun(){
 const mode=level?.learning.mode;if(!mode||mode==='none')return false;
 if(isAdvancedMode(mode))return advancedSnapshotValid(level,controls,q);
 if(isPlanningMode(mode)||mode==='prediction')return !!q&&q.policyHash===policyHash(level,controls);
 if(isControlMode(mode))return episodes>0&&!!q;
 return !!q;
}
function settingRequiresMissingCapability(key,value){
 const requiredId=echoStageFor()?.requiredCapability??level?.task.requiredCapability??level?.learning.capabilityPuzzle?.required,item=capability(requiredId);
 if(!requiredId||state?.capabilities?.includes(requiredId)||!item?.effect||!Object.hasOwn(item.effect,key))return null;
 return JSON.stringify(item.effect[key])===JSON.stringify(value)?item:null;
}
function dockHtml(){
 const qOptions={priority:{label:'Priority cartridge',items:[['scrap','Shiny things'],['delivery','The delivery']]},future:{label:'Future priority',items:[['near','Right now'],['far','Think ahead']]},curiosity:{label:'Try new routes',items:[['familiar','Stay familiar'],['curious','Be curious']]}};
 const definitions=Object.fromEntries(playerControlDefinitions(level).map(control=>[control.id,control])),options={...qOptions,...definitions},exposed=exposedPlayerControls(level),planning=isPlanningMode(level.learning.mode),prediction=level.learning.mode==='prediction',advanced=isAdvancedMode(level.learning.mode),dyna=level.learning.mode==='dyna-q',policy=['reinforce','reinforce-baseline','actor-critic'].includes(level.learning.mode),deep=level.learning.mode==='dqn',imitation=level.learning.mode==='behavioral-cloning';
 const descriptions={L02:'The damaged cartridge likes scrap a little too much.',L03:'The useful cargo is not the nearest prize.',L04:'Echo knows one old scrap-collecting routine. There is another way.',L05:'One last job. Watch the laser phase, and bring the relay fuse home.',L06:'The same junction means two different jobs once Echo is carrying the key.',L07:'The short conveyor may slip. The upper bypass does exactly what the blueprint says.',L08:'These courier policies stay frozen while their projected values settle.',L09:'One courier policy, three launch states, three different futures.',L10:'The full blueprint includes cargo, conveyor outcomes, and the departure clock.',L11:'One junction entry is wasteful. Compare the exact continuation before changing it.',L12:'Policy evaluation and greedy improvement alternate until the switchboard stops changing.',L13:'Every pulse is a real synchronous Bellman optimality sweep.',L14:'The machinery revision changes which physical gate is open. Old results are stale.',L15:'Three machine handoffs share one exact planning snapshot.',L16:'Completed delivery receipts update first-visit returns. The courier never changes.',L17:'The recorder updates after each transition while the courier remains fixed.',L18:'Raw samples can be lucky or disappointing. Counts and returns stay unfiltered.',L19:'Eligibility traces carry real TD errors back through visited states.',L20:'Spend a small sampling budget, choose a depot, then trust the fixed courier.',L21:'No blueprint is available. Echo learns action values from real alley experience.',L22:'Exploration follows simulated steps, never wall-clock time or a hidden win flag.',L23:'SARSA bootstraps from the next action Echo actually samples during practice.',L24:'Q-learning updates toward the best next value while its behavior may still explore.',L25:'Train across declared blackout docks, then freeze the cartridge for two deliveries.',L26:'Relational features can carry a learned route to a shifted module bay.',L27:'Remove cargo from the feature vector and two different decisions become indistinguishable.',L28:'Compare memorizing absolute tiles with compact signals that generalize.',L29:'Fine features preserve the tight corner that coarse coding merges away.',L30:'Train across declared starts, then freeze one linear policy for the moving warehouse.',L31:'Every model count begins with a transition Echo actually experienced.',L32:'Projected Dyna updates sample the empirical machine model, never a hidden simulator.',L33:'Keep real transitions and model rehearsals separate while both improve the same values.',L34:'The tide gear changed. Decide what stale model memory can safely survive.',L35:'Adapt the learned dock model, then freeze one policy for both handoffs.',L36:'A stable softmax policy learns which actions deserve more probability.',L37:'Completed returns assign credit backward from the exit without replay.',L38:'A learned value baseline reduces variance without choosing actions for the actor.',L39:'The critic supplies one-step advantages while the actor remains a separate policy.',L40:'Train on-policy across both bridge starts, then freeze the final extraction policy.',L41:'A compact neural network now estimates all six courier actions from structured state.',L42:'Uniform replay revisits real transitions. Turning it off trains only on the latest step.',L43:'The frozen target twin changes only at the selected copy cadence.',L44:'Combine position, cargo, facing, remaining time and blocked directions without pixels.',L45:'One bounded replay buffer and one frozen neural policy open the Arcade Vault.',L46:'Train beyond one familiar launch address before trusting a shifted delivery.',L47:'Sparse delivery reward makes purposeful exploration matter.',L48:'Stage the practice starts, but evaluate the full route with no training assistance.',L49:'Rehearse the observed storm settings without hiding the weather phase from Echo.',L50:'Freeze one robust neural courier for the Eye of the Storm.',L51:'Take Echo’s controls and record a successful run. Every label is your pre-action choice.',L52:'The clone sees state, not a recording: demonstrate from the selected shifted start.',L53:'Add a recovery lesson from where the learner is likely to drift.',L54:'Record another correction, then retrain on the combined player-made dataset.',L55:'Teach the final tower rescue, freeze the clone, and let Echo perform it alone.',L56:'One final neural breach opens the Citadel gate.',L57:'Every delivered charge visibly breaks one Warden shield.',L58:'The black-sun hazard keeps moving while the frozen courier commits.',L59:'Three ordered charges leave the Warden’s core exposed.',L60:'This is it: three shields, the city heart, and one autonomous route into dawn.'};
 let meter;
 if(planning)meter=training?'KNOWN MODEL COMPUTATION IN PROGRESS':lastStats?`MODEL: ${lastStats.stateCount} STATES / ${lastStats.sweeps} SWEEPS${lastStats.iterations?` / ${lastStats.iterations} IMPROVEMENTS`:''}<br>EXPECTED RETURN ${Number(lastStats.startValue).toFixed(2)} / DELIVERY ${(lastStats.successProbability*100).toFixed(1)}%`:'NO BLUEPRINT RESULT YET';
 else if(prediction)meter=training?'FIXED-POLICY RECEIPTS IN PROGRESS':q?`${q.episodes.toLocaleString()} RECEIPTS / ${q.transitions.toLocaleString()} TRANSITIONS<br>START VALUE ${Number(lastStats?.startValue??0).toFixed(2)} / SUPPORT ${lastStats?.startCount??0}`:'NO RECEIPTS RECORDED YET';
 else if(advanced&&q)meter=dyna?`${q.episodes.toLocaleString()} EPISODES / ${q.realTransitions.toLocaleString()} REAL TRANSITIONS<br>${q.planningUpdates.toLocaleString()} EMPIRICAL MODEL UPDATES / ${q.modelKeys?.length??0} OBSERVED PAIRS`:policy?`${q.episodes.toLocaleString()} ON-POLICY EPISODES / ${q.transitions.toLocaleString()} TRANSITIONS<br>${q.actorUpdates.toLocaleString()} ACTOR / ${q.criticUpdates.toLocaleString()} CRITIC UPDATES`:deep?`${q.episodes.toLocaleString()} EPISODES / ${q.realTransitions.toLocaleString()} REAL TRANSITIONS<br>${q.replay?.length??0} REAL REPLAY SAMPLES / ${q.targetCopies.toLocaleString()} TARGET COPIES`:imitation?`${demonstrations.length.toLocaleString()} PLAYER-LABELED ACTIONS / ${q.episodes.toLocaleString()} DEMONSTRATIONS<br>${q.updates.toLocaleString()} CLONE UPDATES / ${q.epochs} PASSES`:`${q.episodes.toLocaleString()} EPISODES / ${q.transitions.toLocaleString()} REAL TRANSITIONS<br>${q.encoder.toUpperCase()} FEATURES`;
 else if(imitation)meter=training?'CLONING PLAYER DEMONSTRATIONS':demonstrations.length?`${demonstrations.length.toLocaleString()} PLAYER-LABELED ACTIONS RECORDED<br>TRAIN THE CLONE, THEN CHECK ITS AUTONOMOUS ROUTE`:'NO SUCCESSFUL DEMONSTRATION YET';
 else meter=(training?'REAL PRACTICE IN PROGRESS':episodes?`${episodes.toLocaleString()} PRACTICE EPISODES SAVED`:'NO NEW PRACTICE YET')+(lastStats?`<br>Last check: ${lastStats.outcome}, ${lastStats.steps} actions.${Number.isFinite(lastStats.successProbability)?` ${Math.round(lastStats.successProbability*100)}% delivery across ${lastStats.validationTrials} frozen checks.`:' Not a guarantee.'}`:'');
 const validSnapshot=snapshotReadyForRun(),relayStage=echoStageFor(),stages=echoStagesFor(level),stageNumber=(state.echoStage??0)+1;
 const terminalName=planning?'PLANNING CONSOLE':prediction?'RECEIPT RECORDER':dyna?'MODEL PROJECTOR':policy?'POLICY LAB':deep?'NEURAL BAY':imitation?'TEACHING LINK':advanced?'FEATURE BAY':'MAINTENANCE DOCK',heading=planning?'Plan the route.':prediction?'Read the receipts.':dyna?'Learn the machine.':policy?'Shape the policy.':deep?'Train the network.':imitation?'Show Echo how.':advanced?'Build the signals.':'A little preparation.',runLabel=planning?'Compute blueprint':prediction?'Collect receipts':imitation?'Train Echo':'Practice',stopLabel=planning?'computation':prediction?'recording':imitation?'cloning':'practice';
 const stageTitle=relayStage?`RUN ${stageNumber} OF ${stages.length} / ${relayStage.label}`:`ECHO / ${terminalName}`,stageCopy=relayStage?.challenge??descriptions[level.id]??'Prepare a compatible frozen courier snapshot.';
 const preview=previewRunAvailable(),trainDisabled=!canTrain(state)||imitation&&!demonstrations.length,runDisabled=training||!validSnapshot||(!preview&&(!canDeploy(state)||stagePracticeRequired())),early=Number(level.id.slice(1))<=6,requiredId=relayStage?.requiredCapability??level.task.requiredCapability??level.learning.capabilityPuzzle?.required,required=capability(requiredId),tutorial=level.id==='L01'?`<div class="workbench-guide"><b>${state.capabilities.includes('act-east')?'STEP 4 / TRAIN THE REPAIRED ECHO':'STEP 2 / TEST THE INCOMPLETE ECHO'}</b><span>${state.capabilities.includes('act-east')?'EAST is available now. Train a fresh compatible policy, then run it.':'Train first, then run the frozen result. The model cannot choose an action its hardware does not provide.'}</span></div>`:preview?`<div class="workbench-guide"><b>TRAIN + RUN / SAFE REHEARSAL</b><span>The real learner is available now, but this run cannot power a door until Patch completes the orange contract${required&&!state.capabilities.includes(requiredId)?` and installs ${required.name}`:''}.</span></div>`:'';
 return `<section class="terminal-command-deck">${tutorial}<div class="terminal-command-head"><div><span>${stageTitle}</span><h3>${relayStage?relayStage.label:heading}</h3><p>${stageCopy}</p></div></div><div class="terminal-action-row">${imitation?button('Record Echo lesson','demonstrate','',!canTrain(state)||training?'disabled':''):''}${button(training?'Stop training':'Train Echo','practice','primary',trainDisabled?'disabled':'')}${button(preview?'Run safe rehearsal &#8594;':relayStage?.final?'Run Echo / final relay &#8594;':'Run Echo &#8594;','deploy','run',runDisabled?'disabled':'')}${button(planning?'Clear plan':prediction?'Clear receipts':imitation?'Clear lessons':'Reset model','reset-cartridge','quiet',training?'disabled':'')}</div><div class="terminal-settings"><div class="terminal-settings-title"><b>TRAINING SETTINGS</b><span>${early?'You can train and run from anywhere. Patch’s physical finds change the real contract below.':'Every choice below changes the real worker or shared simulation.'}</span></div><div class="cartridge-board">${exposed.map((key,index)=>`<div class="chip-row"><label><span>${String(index+1).padStart(2,'0')}</span>${options[key].label}<small>${settingImpact(key)}</small></label><div class="chips">${options[key].items.map(([v,label])=>{const locked=settingRequiresMissingCapability(key,v);return `<button class="chip ${controls[key]===v?'selected':''}" data-action="chip" data-control="${key}" data-value="${v}" ${training||locked?'disabled':''} ${locked?`title="Recover ${locked.name} with Patch to unlock this setting."`:''} aria-pressed="${controls[key]===v}">${label}</button>`;}).join('')}</div></div>`).join('')}</div></div><div id="dock-meter" class="dock-meter">${meter}</div><div class="terminal-help-row"><span>Stuck? See the Patch pickup, exact settings, and why they fit this run.</span>${button('Help for this run','echo-help','quiet')}</div></section>`;
}
function refreshDock(){if(['dock','terminal'].includes(dialogType))dialog.innerHTML=echoTerminalHtml();}
function beginDemonstration(){
 if(level.learning.mode!=='behavioral-cloning'||training||!canTrain(state))return;demonstrationBase=clone(state);demonstrationId++;currentDemonstration=[];state=createEpisode(level,{practice:true,config:configurationForStage(level,controls,demonstrationBase.echoStage??0),episodeId:`${level.id}-player-${revision}-${demonstrationId}`});demonstrating=true;closeDialog();audio.sfx('echo_ack_01');toast('You have Echo’s controls. Complete this relay route; failed runs are discarded.');updateHud();
}
function changeChip(key,value){
 if(training)return;const locked=settingRequiresMissingCapability(key,value);if(locked){toast(`Recover ${locked.name} with Patch before Echo can use that setting.`);refreshDock();return;}controls[key]=value;revision++;state={...state,config:configurationForStage(level,controls,state.echoStage??0),echoStagePrepared:false};
 if(key==='modelRevision'){
  const modelRevision=level.learning.model?.revisions?.find(candidate=>candidate.id===value),open=new Set(modelRevision?.openGates??[]);state={...state,entities:state.entities.map(entity=>entity.kind==='gate'&&entity.id!=='heavyGate'&&!entity.patchOnly?{...entity,open:open.has(entity.id)}:entity)};
 }
 if(['sensorSuite','rewardProfile'].includes(key)){q=isControlMode(level.learning.mode)?{}:null;episodes=0;trace=[];lastStats=null;if(level.learning.mode==='behavioral-cloning')demonstrations=[];toast(key==='sensorSuite'?'Echo’s input contract changed. Start a fresh compatible cartridge.':'The reward signal changed. Start a fresh cartridge so old values are not mislabelled.');}
 else if(isPlanningMode(level.learning.mode)){q=null;trace=[];lastStats=null;toast('Blueprint changed. Compute a fresh frozen plan before dispatch.');}
 else if(level.learning.mode==='prediction'){q=null;episodes=0;trace=[];lastStats=null;toast('Recorder, depot, or fixed line changed. Collect new receipts for this exact setup.');}
 else if(level.learning.mode==='linear-sarsa'&&key==='encoder'){q=null;episodes=0;trace=[];lastStats=null;toast('Feature dimensions changed. Start a compatible linear cartridge.');}
 else if(['reinforce','reinforce-baseline','actor-critic'].includes(level.learning.mode)&&['baseline','balance'].includes(key)){q=null;episodes=0;trace=[];lastStats=null;toast('The on-policy learner changed. Start a fresh actor and critic.');}
 else if(level.learning.mode==='dqn'&&['replay','targetCadence','coverage','exploration','curriculum','conditions'].includes(key)){q=null;episodes=0;trace=[];lastStats=null;toast('That changes how the neural route learns. Start a fresh bounded replay run for this relay.');}
 else if(level.learning.mode==='dyna-q'&&key==='machineRevision'){lastStats=null;trace=[];toast('The machine changed. Practice will apply the selected memory rule before dispatch.');}
 else if(key==='priority'||key==='future'){q={};episodes=0;trace=[];lastStats=null;toast('New reward or future setting: a fresh cartridge. Practice again.');}
 recordCartridge();audio.sfx('ui_confirm');refreshDock();
}
function beginPractice(){
 const planning=isPlanningMode(level.learning.mode),prediction=level.learning.mode==='prediction',advanced=isAdvancedMode(level.learning.mode),dyna=level.learning.mode==='dyna-q',policy=['reinforce','reinforce-baseline','actor-critic'].includes(level.learning.mode),deep=level.learning.mode==='dqn',imitation=level.learning.mode==='behavioral-cloning';
 if(training){cancelTraining(planning?'Computation stopped. The last complete blueprint result is kept.':prediction?'Recording stopped. Completed receipts are kept.':'Practice stopped. The last complete cartridge is kept.');refreshDock();return;}
 if(!canTrain(state))return;
 cancelTraining();training=true;const id=++jobId,rev=revision;
 try{worker=new Worker(new URL('./training/worker.js?v=1.6.0',import.meta.url),{type:'module'});}
 catch(error){training=false;worker=null;refreshDock();toast('Practice is unavailable in this browser context. Use the local HTTP server.');return;}
 const startEpisodes=episodes;
 worker.onmessage=({data})=>{
  if(data.jobId!==id||data.revision!==rev||id!==jobId||rev!==revision||page!=='game')return;
  if(data.type==='progress'){
    if(data.trace)trace=data.trace;const meter=dialog.querySelector('#dock-meter');if(meter)meter.textContent=planning?`${data.stateCount.toLocaleString()} MODEL STATES / SWEEP ${data.sweep} / RESIDUAL ${Number(data.residual).toExponential(2)}`:prediction?`${data.completed.toLocaleString()} RECEIPTS / ${data.transitions.toLocaleString()} EXPERIENCED TRANSITIONS / ${data.deliveries??0} DELIVERIES`:dyna?`${data.completed.toLocaleString()} EPISODES / ${data.realTransitions.toLocaleString()} REAL TRANSITIONS / ${data.deliveries??0} DELIVERIES / ${data.planningUpdates.toLocaleString()} MODEL UPDATES`:policy?`${data.completed.toLocaleString()} ON-POLICY EPISODES / ${data.transitions.toLocaleString()} TRANSITIONS / ${data.deliveries??0} DELIVERIES`:deep?`${data.completed.toLocaleString()} EPISODES / ${data.realTransitions.toLocaleString()} REAL TRANSITIONS / ${data.deliveries??0} DELIVERIES / ${data.replaySize} REPLAY`:imitation?`${data.examples} PLAYER-LABELED ACTIONS / ${data.transitions} CLONE UPDATES / ${data.holdoutCorrect} OF ${data.holdoutExamples} HELD-OUT LABELS`:`${data.completed.toLocaleString()} REAL EPISODES / ${data.transitions.toLocaleString()} TRANSITIONS / ${data.deliveries??0} DELIVERIES`;
  }else if(data.type==='complete'){
   q=planning?data.evaluation:prediction?data.prediction:advanced?data.snapshot:data.q;if(!planning&&!prediction)episodes=advanced?q.episodes:startEpisodes+data.completed;if(prediction)episodes=q.episodes;lastStats=data.validation;trace=data.trace;const ready=reliableEnough();state={...state,echoStagePrepared:ready};training=false;worker?.terminate();worker=null;recordCartridge();refreshDock();audio.sfx('learning_session_complete');toast(ready?`Frozen checks estimate ${Math.round(routeReliability()*100)}% delivery. Echo is ready to run.`:`Frozen checks estimate ${Math.round((routeReliability()||0)*100)}% delivery—below ${Math.round(READINESS_TARGET*100)}%. Train again or reconsider the installed capability.`);updateHud();
  }else if(data.type==='error'){training=false;worker?.terminate();worker=null;refreshDock();toast(`${planning?'Computation':prediction?'Recording':'Practice'} could not finish: `+data.message);}
 };
 worker.onerror=()=>{cancelTraining();refreshDock();toast('The learning worker could not start. Serve this game over HTTP, not file://.');};
 worker.onmessageerror=()=>{cancelTraining();refreshDock();toast('Practice returned unreadable data. Your last complete cartridge is still safe.');};
 const stageConfig=configurationForStage(level,controls,state.echoStage??0),practiceEpisodes=effectiveEpisodes(level,stageConfig);
 worker.postMessage(planning?{type:'evaluate-policy',jobId:id,revision:rev,level,config:stageConfig,seed:level.seeds.root+revision*31}:prediction?{type:'predict',jobId:id,revision:rev,level,config:stageConfig,snapshot:q,seed:level.seeds.root+episodes*31,episodes:practiceEpisodes}:{type:'train',jobId:id,revision:rev,level,config:stageConfig,...(advanced?{snapshot:q}:{q}),...(imitation?{demonstrations:demonstrations.map(clone)}:{}),seed:level.seeds.root+episodes*31,episodes:practiceEpisodes});
 audio.sfx('learning_launch');refreshDock();updateHud();
}
function deploy(){
 const preview=previewRunAvailable(),invalidSnapshot=!snapshotReadyForRun();
 if(training||(!preview&&(!canDeploy(state)||stagePracticeRequired()||invalidSnapshot)))return;
 clearToast();const stageConfig=configurationForStage(level,controls,state.echoStage??0);previewBase=preview?clone(state):null;deployedQ=JSON.parse(JSON.stringify(q??{}));deployedControls=JSON.parse(JSON.stringify({...controls,stageIndex:state.echoStage??0,stageStart:stageConfig.stageStart??null,stagePhase:stageConfig.stagePhase??0}));state=launch(state,{preview});random=rng(level.seeds.root+900000+(state.echoStage??0)*997);environmentRandom=rng(level.seeds.root+910000+revision+(state.echoStage??0)*997);keys.clear();queue=[];closeDialog();audio.sfx('echo_ack_01');audio.setMood('active');updateHud();toast(preview?'Echo is rehearsing the incomplete route. Patch progress is protected.':'Echo is running the frozen policy. Patch controls will return when this run ends.');
}
function retry(){
 const id=level.id,puzzle=level.learning.capabilityPuzzle,physical=level.learning.capabilityVersion==='physical-cartridges-v1',wrong=physical&&puzzle?.required&&(state?.capabilities??[]).some(capabilityId=>puzzle.options?.includes(capabilityId)&&capabilityId!==puzzle.required);
 if(wrong){delete save.cartridges[id];persist();}else recordCartridge();audio.sfx('attempt_reset');void startLevel(id,true).then(()=>{if(wrong)toast('The wrong cartridge was released. Both choices are available again.');});
}
function clearMission(){
 clearToast();recordCartridge();if(!save.completed.includes(level.id))save.completed.push(level.id);save.completed.sort();
 const next=LEVELS.findIndex(l=>l.id===level.id)+1,final=next>=LEVELS.length,districtClear=Number(level.id.slice(1))%5===0;save.currentLevel=LEVELS[Math.min(next,LEVELS.length-1)].id;persist();
 audio.sfx(districtClear?'stinger_district_restored':'stinger_heist_clear');
 const chapter=CHAPTERS.find(candidate=>candidate.id===level.chapterId),nextChapter=CHAPTERS[CHAPTERS.indexOf(chapter)+1];
 const finale=level.id==='L60';
 if(finale){routeTo('finale');return;}
 showDialog('clear',`<img class="dialog-robot" src="${img('echo','celebrate')}"><div class="eyebrow">${finale?'THE ECLIPSE BREAKS / A CITY WAKES':districtClear?`DISTRICT ${chapter.number} / RELAY ONLINE`:'DELIVERY COMPLETE / BOTH ROBOTS SAFE'}</div><h2>${finale?'Echoes at dawn.':districtClear?`${chapter.name}<br>lights up.`:'A good little heist.'}</h2><p>${finale?'The Warden is silent. Twelve relays answer at once, windows ignite from the Scrapyard to the Tower, and Patch and Echo watch their city choose morning. You taught a discarded courier how to come home.':districtClear?(nextChapter?`The maintenance lift can now reach ${nextChapter.name}.`:'All twelve relays are awake. The city is yours again.'):'One more door open. One more reason to trust your partner.'}</p><div class="divider"></div><div class="micro">${state.tick} JOINT DECISION TICKS &nbsp; / &nbsp; ${state.echoSteps} COURIER ACTIONS</div><div class="actions">${button(final?'See the restored city':'Next mission &#8594;',final?'map':'next','primary')}${button('Replay','retry','quiet')}</div>`);
}
function failAttempt(title,message){cancelTraining();audio.sfx('stinger_retry');showDialog('fail',`<div class="eyebrow">A SETBACK, NOT THE END</div><h2>${title}</h2><p>${message}</p><div class="actions">${button('Try again','retry','primary')}${button('Mission map','map','quiet')}</div>`);}
function pause(){if(page!=='game')return;cancelTraining('Practice stopped at the last saved cartridge.');audio.pause();showDialog('pause',`<div class="eyebrow">TAKE A BREATHER</div><h2>We will wait here.</h2><div class="menu-buttons">${button('Resume','resume','primary')}${button('Controls','controls')}${button('Retry this room','retry')}${button('Mission map','map','quiet')}</div>`);}
function iconGuideHtml(){const object=name=>`${ASSET}objects/${name}.png`,items=[
 [`<img src="${img('patch')}" alt="">`,'Patch','You control the orange robot.'],[`<img src="${img('echo')}" alt="">`,'Echo','Autonomous; follows the frozen learned policy.'],['<i class="guide-floor patch"></i>','Orange floor','Only Patch uses this maze.'],['<i class="guide-floor echo"></i>','Cyan floor','Only Echo uses this maze.'],[`<img src="${object('lever')}" alt="">`,'Lever','Opens doors and portals.'],[`<img src="${object('power-cell')}" alt="">`,'Relay cell','Carry it to the matching Socket to change Echo.'],[`<img src="${object('socket')}" alt="">`,'Socket','Installs a Relay cell or receives Echo’s cargo.'],['<i class="guide-strip cartridge"></i>','Capability cartridge','Changes real state, actions, signal, memory, or practice.'],['<i class="guide-strip portal"></i>','Room portal','Patch presses E; Echo crosses automatically.'],[`<img src="${object('dock')}" alt="">`,'Relay marker','Marks the next Echo task. Press R anywhere to open the model.'],[`<img src="${object('console')}" alt="">`,'Receiver console','Press E to arm the final handoff.'],[`<img src="${object('fuse')}" alt="">`,'Required cargo','Echo must collect and deliver it in order.'],[`<img src="${object('scrap')}" alt="">`,'Scrap','A tempting distraction; it may be rewarded by a bad signal.'],[`<img src="${object('laser')}" alt="">`,'Laser','Active phases can reset Echo’s run.'],['<i class="guide-strip sentry"></i>','Patch sentry','Returns Patch to the latest checkpoint.'],['<i class="guide-strip sentry echo-enemy"></i>','Echo hunter','Moving patrols are part of Echo’s observed state and can catch a bad policy.'],[`<img src="${object('gate')}" alt="">`,'Exit lock','Opens only after every Echo task; stand at the exit and press E.']];return `<div class="icon-guide">${items.map(([visual,name,copy])=>`<article>${visual}<span><b>${name}</b><small>${copy}</small></span></article>`).join('')}</div>`;}
function showControls(){showDialog('controls',`<button class="close" data-action="close" aria-label="Close controls">&times;</button><div class="eyebrow">MAINTENANCE REFERENCE</div><h2>Your hands. Echo's decisions.</h2><div class="help-grid"><span>WASD / arrows</span><span>Move Patch</span><span>E</span><span>Interact, use a portal, or activate the open exit</span><span>R</span><span>Open Echo’s live state, actions, policy, algorithm, hyperparameters, training and frozen checks</span><span>T</span><span>Retry the mission while retaining compatible learning</span><span>Escape</span><span>Pause</span></div><p>Echo acts only from the frozen learned model. Press R from any point in a mission to train or run it; Relay cells installed by Patch change the real learning contract.</p><div class="actions">${button('Got it','close','primary')}</div>`);}
function showDynamics(){const dynamic=dynamicsFor(),mechanic=DISTRICT_MECHANICS[level.chapterId];showDialog('dynamics',`<button class="close" data-action="close" aria-label="Close mission briefing">&times;</button><div class="eyebrow">DISTRICT SYSTEM / ${mechanic.name}</div><h2>${mechanic.intro}</h2><div class="mechanic-callout"><b>HOW THIS DISTRICT CHANGES THE HEIST</b>${dynamic.change} Later districts keep the physical relay chain and add a new learning problem on top.</div><h3 class="guide-heading">What every icon means</h3>${iconGuideHtml()}<div class="actions">${button('Back to the heist','close','primary')}</div>`);}
app.addEventListener('input',e=>{const input=e.target;if(!input.dataset.setting)return;save.settings[input.dataset.setting]=input.type==='checkbox'?input.checked:Number(input.value);const output=app.querySelector(`[data-value-for="${input.dataset.setting}"]`);if(output)output.textContent=`${Math.round(Number(input.value)*100)}%`;applySettings();persist();});
app.addEventListener('change',async e=>{if(e.target.id!=='import-file')return;const f=e.target.files[0];if(!f)return;try{if(f.size>6000000)throw new Error('Save exceeds 6 MB.');const candidate=parseSave(await f.text());cancelTraining();storeSave(storage,candidate);save=candidate;protectSave=false;applySettings();settings();toast('Save imported.');}catch(error){toast(error.message+' Your previous save was not changed.');}});
document.addEventListener('click',async e=>{
 const b=e.target.closest('button[data-action]');if(!b||b.disabled)return;const action=b.dataset.action;
 void audio.unlock();audio.sfx('ui_press');
 if(action==='enter'){navigate('menu');if(loaded.warning)toast(loaded.warning);}
 else if(action==='begin-heist'){save.prologueSeen=true;introducedLevel='L01';persist();void startLevel('L01',true,true);}
 else if(action==='enter-mission'){introducedLevel=b.dataset.level;void startLevel(b.dataset.level,true,true);}
 else if(action==='about')about();
 else if(action==='landing-learn'||action==='landing-story')app.querySelector(`#${action}`)?.scrollIntoView({behavior:save.settings.reducedMotion?'auto':'smooth',block:'start'});
 else if(['menu','map'].includes(action)){audio.resume();navigate(action);}
 else if(action==='back-menu'){audio.resume();navigate('menu');}
 else if(action==='district'){audio.resume();routeTo('district',b.dataset.chapter);}
 else if(action==='settings'){returnPage=page==='game'?'map':page;navigate('settings');}
 else if(action==='settings-back')backTo(returnPage);
 else if(action==='continue'){
  if(save.completed.includes('L60'))routeTo('finale');
  else startLevel(save.currentLevel);
 }
 else if(action==='level')startLevel(b.dataset.level);
 else if(action==='close'||action==='resume'){cancelTraining('Practice stopped at the last saved cartridge.');closeDialog();audio.resume();}
 else if(action==='pause')pause();
 else if(action==='controls')showControls();
 else if(action==='dynamics')showDynamics();
 else if(action==='echo-info')replaceEchoDialog('echo-info',echoInfoHtml());
 else if(action==='echo-help')replaceEchoDialog('echo-help',echoSolutionHtml());
 else if(action==='echo-back')replaceEchoDialog('terminal',echoTerminalHtml());
 else if(action==='tutorial-open-echo'){closeDialog();openEchoTerminal();}
 else if(action==='echo-terminal')openEchoTerminal();
 else if(action==='mute'){save.settings.muted=!save.settings.muted;applySettings();persist();b.setAttribute('aria-pressed',String(save.settings.muted));b.setAttribute('aria-label',save.settings.muted?'Turn audio on':'Mute audio');toast(save.settings.muted?'Audio muted.':'Audio on.');}
 else if(action==='touch')command(Number(b.dataset.command));
 else if(action==='chip')changeChip(b.dataset.control,b.dataset.value);
 else if(action==='demonstrate')beginDemonstration();
 else if(action==='practice')beginPractice();
 else if(action==='deploy')deploy();
 else if(action==='redeploy'){if(level.id==='L01'){state={...state,echoActive:true,awake:true};closeDialog();updateHud();}else deploy();}
 else if(action==='adjust-echo')openEchoTerminal();
 else if(action==='retry'){audio.resume();retry();}
 else if(action==='next'){const next=LEVELS[LEVELS.findIndex(l=>l.id===level.id)+1];audio.resume();startLevel(next.id);}
 else if(action==='replay-final'){audio.resume();startLevel('L60');}
 else if(action==='newgame')showDialog('newgame',`<div class="eyebrow">NEW GAME</div><h2>Start over together?</h2><p>This replaces local mission progress and cartridges. Export your current save from Settings before continuing.</p><div class="actions">${button('Keep my progress','close','primary')}${button('Start a new game','confirm-new','danger')}</div>`);
 else if(action==='confirm-new'){const settings=save.settings;save=freshSave();save.settings=settings;protectSave=false;persist();startLevel('L01');}
 else if(action==='reset-cartridge'){q=isPlanningMode(level.learning.mode)||level.learning.mode==='prediction'||isAdvancedMode(level.learning.mode)?null:level.id==='L04'?familiarPrior(level,configuration(level,controls)):{};if(level.learning.mode==='behavioral-cloning')demonstrations=[];episodes=0;lastStats=null;trace=[];state={...state,echoStagePrepared:false};revision++;recordCartridge();refreshDock();toast(isPlanningMode(level.learning.mode)?'Plan cleared. The physical room has not changed.':level.learning.mode==='prediction'?'Receipts cleared. The fixed courier policy has not changed.':level.learning.mode==='behavioral-cloning'?'Lessons and cloned policy cleared. The room has not changed.':'Fresh cartridge. The room has not changed.');}
 else if(action==='export'){const blob=new Blob([JSON.stringify(save,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='echo-heist-save.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
 else if(action==='import')app.querySelector('#import-file').click();
});
document.addEventListener('pointerover',e=>{if(e.target.closest('button:not(:disabled)'))audio.sfx('ui_hover_01');});
dialog.addEventListener('cancel',e=>{e.preventDefault();if(['clear','fail'].includes(dialogType))return;cancelTraining('Practice stopped at the last saved cartridge.');closeDialog();audio.resume();});
const keyActions={w:1,ArrowUp:1,d:2,ArrowRight:2,s:3,ArrowDown:3,a:4,ArrowLeft:4};
document.addEventListener('keydown',e=>{
 const key=e.key.length===1?e.key.toLowerCase():e.key;if(page!=='game')return;
 if(key==='r'&&!e.repeat){e.preventDefault();if(dialog.open){if(['terminal','echo-info','echo-help'].includes(dialogType)){cancelTraining('Practice stopped at the last saved cartridge.');closeDialog();audio.resume();}}else openEchoTerminal();return;}
 if(dialog.open)return;
 if(key==='Escape'){e.preventDefault();pause();return;}
 if(['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName))return;
 if(key in keyActions){e.preventDefault();if(!keys.has(key)){queue.push(keyActions[key]);lastDecision=0;}keys.add(key);}
 if(key==='e'&&!e.repeat){e.preventDefault();queue.push(5);lastDecision=0;}
 if(key==='t'&&!e.repeat){e.preventDefault();retry();}
});
document.addEventListener('keyup',e=>keys.delete(e.key.length===1?e.key.toLowerCase():e.key));
window.addEventListener('blur',()=>{keys.clear();queue=[];});
function suspendForBackground(){keys.clear();queue=[];cancelTraining();audio.pause();if(page==='game'&&!dialog.open)pause();}
document.addEventListener('visibilitychange',()=>{if(document.hidden)suspendForBackground();else if(!paused)audio.resume();});
document.addEventListener('freeze',suspendForBackground);
function syncRoute(force=false){
 let hash=location.hash||PAGE_ROUTES.landing;
 if(!location.hash){history.replaceState({echoHeist:true},'',hash);}
 if(!force&&hash===renderedHash)return;renderedHash=hash;
 const target=Object.entries(PAGE_ROUTES).find(([,value])=>value===hash)?.[0];
 if(target){navigate(target,true);return;}
 const districtMatch=hash.match(/^#\/district\/(C(?:0[1-9]|1[0-2]))$/);if(districtMatch){clearToast();cancelTraining();closeDialog();level=null;renderer=null;renderGeneration++;district(districtMatch[1]);return;}
 const match=hash.match(/^#\/play\/(L(?:0[1-9]|[1-5][0-9]|60))$/);
 if(match){void startLevel(match[1],true);return;}
 history.replaceState({echoHeist:true},'',PAGE_ROUTES.landing);renderedHash=PAGE_ROUTES.landing;navigate('landing',true);toast('That route does not exist. Back to the city entrance.');
}
window.addEventListener('popstate',()=>syncRoute());
window.addEventListener('hashchange',()=>syncRoute());
function frame(t){
 if(page==='game'&&renderer?.ready&&state){
  if(!paused&&!document.hidden&&t-lastDecision>=230){
   const settling=state.courierOutcome==='delivered'&&!at(state.echo,findEntity(state,'echoExit'));
   const action=queue.length?queue.shift():keys.size?keyActions[[...keys][0]]:0;
   if(action||!demonstrating&&(state.echoActive||settling)){lastDecision=t;command(action);}
  }
  renderer.draw(state,t,{trace,training});
 }
 lastFrame=t;requestAnimationFrame(frame);
}
applySettings();syncRoute(true);requestAnimationFrame(frame);
// Development-only coordinator probes; stripped from the static production build.
function previewCompleteNextMission(){
 const index=LEVELS.findIndex(candidate=>!save.completed.includes(candidate.id));
 if(index<0){toast('Progress preview: all 60 missions are already marked complete.');return;}
 const completed=LEVELS[index];cancelTraining();closeDialog();save.completed.push(completed.id);save.completed.sort();save.currentLevel=LEVELS[Math.min(index+1,LEVELS.length-1)].id;persist();
 if(index===LEVELS.length-1)routeTo('map');
 else if(page==='game')routeTo('game',save.currentLevel);
 else if(page==='menu')menu();
 else if(page==='map')map();
 else if(page==='district'){const chapterId=location.hash.match(/^#\/district\/(C(?:0[1-9]|1[0-2]))$/)?.[1];if(chapterId)district(chapterId);else map();}
 else if(page==='settings')settings();
 toast(`Progress preview: ${completed.id} marked complete.`);setFocus();
}
document.addEventListener('keydown',event=>{
 if(event.code!=='Backquote'||event.repeat||['INPUT','TEXTAREA','SELECT'].includes(event.target.tagName))return;
 event.preventDefault();previewCompleteNextMission();
});
if(BUILD_MODE==='development'&&new URLSearchParams(location.search).get('test')==='1'){
 window.__echoTest={get state(){return state;},get page(){return page;},get training(){return training;},get workerActive(){return !!worker;},get q(){return q;},get deployedQ(){return deployedQ;},get controls(){return controls;},get deployedControls(){return deployedControls;},get stats(){return lastStats;},get demonstrating(){return demonstrating;},get demonstrations(){return demonstrations;},get audio(){return {errors:[...audio.errors],loops:audio.loops.length,context:audio.context?.state,cache:[...audio.cache.keys()],gains:audio.loops.map(l=>l.gain.gain.value)};},command,get save(){return save;}};
}
