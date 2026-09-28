import {AUDIO} from './manifest.js?v=0.4.0';
const ROOT=new URL('../../',import.meta.url);
/** One audio owner. Failed audio never prevents movement or scene navigation. */
export class Mixer{
 constructor(settings){this.settings=settings;this.context=null;this.cache=new Map();this.loops=[];this.voices=new Set();this.last=new Map();this.generation=0;this.current=null;this.errors=[];}
 error(e){this.errors.push(String(e));if(this.errors.length>20)this.errors.shift();}
 async unlock(){try{this.context??=new AudioContext();if(this.context.state!=='running')await this.context.resume();if(this.current&&!this.loops.length)void this.theme(this.current);}catch(e){this.error(e);}}
 async buffer(id){
  if(!AUDIO[id])return null;
  if(!this.cache.has(id))this.cache.set(id,(async()=>{try{const response=await fetch(new URL(AUDIO[id].path,ROOT));if(!response.ok)throw new Error(`Audio ${id}: ${response.status}`);return await this.context.decodeAudioData(await response.arrayBuffer());}catch(e){this.error(e);return null;}})());
  return this.cache.get(id);
 }
 async theme(name){
  if(name===this.current&&this.loops.length)return;
  this.current=name;const gen=++this.generation;
  if(!this.context)return;
  const chapters={
   'chapter-1':['ch01_scrapyard_base','ch01_scrapyard_alert','ch01_scrapyard_extraction'],
   'chapter-2':['ch02_transit_depot_base','ch02_transit_depot_alert','ch02_transit_depot_extraction'],
   'chapter-3':['ch03_switchworks_base','ch03_switchworks_alert','ch03_switchworks_extraction'],
   'chapter-4':['ch04_courier_quarter_base','ch04_courier_quarter_alert','ch04_courier_quarter_extraction'],
   'chapter-5':['ch05_neon_market_base','ch05_neon_market_alert','ch05_neon_market_extraction'],
   'chapter-6':['ch06_modular_foundry_base','ch06_modular_foundry_alert','ch06_modular_foundry_extraction'],
   'chapter-7':['ch07_clockwork_docks_base','ch07_clockwork_docks_alert','ch07_clockwork_docks_extraction'],
   'chapter-8':['ch08_skybridge_base','ch08_skybridge_alert','ch08_skybridge_extraction'],
   'chapter-9':['ch09_neural_arcade_base','ch09_neural_arcade_alert','ch09_neural_arcade_extraction'],
   'chapter-10':['ch10_storm_grid_base','ch10_storm_grid_alert','ch10_storm_grid_extraction'],
   'chapter-11':['ch11_central_tower_base','ch11_central_tower_alert','ch11_central_tower_extraction'],
   'chapter-12':['ch11_central_tower_base','ch11_central_tower_alert','ch11_central_tower_extraction']
  },ids=chapters[name]??[name];
  const buffers=await Promise.all(ids.map(id=>this.buffer(id)));
  if(gen!==this.generation||!this.context)return;
  this.stopLoops();const when=this.context.currentTime+.035;
  ids.forEach((id,i)=>{
   if(!buffers[i])return;const source=this.context.createBufferSource(),gain=this.context.createGain();
   source.buffer=buffers[i];source.loop=true;source.loopStart=AUDIO[id].loopStart??0;source.loopEnd=Math.min(AUDIO[id].loopEnd??buffers[i].duration,buffers[i].duration);
   source.connect(gain);gain.connect(this.context.destination);gain.gain.value=0;source.start(when);
   this.loops.push({source,gain,id,weight:i===0?1:0});
  });this.apply();
 }
 setMood(mood){for(const l of this.loops)l.weight=l.id.endsWith('_base')?1:l.id.endsWith('_alert')?(mood==='active'?.5:0):l.id.endsWith('_extraction')?(mood==='extraction'?.7:0):1;this.apply();}
 apply(){if(!this.context)return;for(const l of this.loops)l.gain.gain.setTargetAtTime(this.settings.muted?0:this.settings.music*.6*l.weight,this.context.currentTime,.18);for(const v of this.voices)v.gain.gain.setTargetAtTime(this.settings.muted?0:this.settings.effects*v.weight,this.context.currentTime,.03);}
 async sfx(id){
  if(!this.context||this.context.state!=='running'||this.settings.muted||!AUDIO[id])return;
  const generation=this.generation;
  const now=performance.now(),a=AUDIO[id];if(now-(this.last.get(id)??-1e9)<Math.max(a.cooldownMs??0,id.startsWith('ui_hover')?120:50))return;
  this.last.set(id,now);if(this.voices.size>=12)return;
  const buffer=await this.buffer(id);if(!buffer||!this.context||this.settings.muted||this.voices.size>=12||generation!==this.generation)return;
  if([...this.voices].filter(v=>v.id===id).length>=(a.maxVoices??3))return;
  const source=this.context.createBufferSource(),gain=this.context.createGain();source.buffer=buffer;source.connect(gain);gain.connect(this.context.destination);
  const voice={source,gain,id,weight:(a.gain??1)*.65};gain.gain.value=this.settings.effects*voice.weight;
  this.voices.add(voice);source.onended=()=>{this.voices.delete(voice);source.disconnect();gain.disconnect();};source.start();
 }
 stopLoops(){for(const l of this.loops){try{l.source.stop();l.source.disconnect();l.gain.disconnect();}catch{ /* already ended */ }}this.loops=[];}
 pause(){if(this.context)this.context.suspend().catch(()=>{});}
 resume(){if(this.context&&!document.hidden)this.context.resume().catch(()=>{});}
}
