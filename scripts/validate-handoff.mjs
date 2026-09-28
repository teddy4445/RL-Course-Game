import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=process.cwd();
let checks=0;
const ok=(v,m)=>{assert.ok(v,m);checks++;};
const walk=(dir)=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
 if(['node_modules','dist','.git','__pycache__'].includes(e.name)) return [];
 const p=path.join(dir,e.name);return e.isDirectory()?walk(p):[p];
});
const files=walk(root);
for(const p of ['AGENTS.md','README.md','CODEX_START_HERE.md','ROADMAP.md','STATUS.md','package.json','src/main.js','specs/campaign/README.md','production/references/AUTHORITATIVE_GAMEPLAY.png']) ok(fs.existsSync(p),'Missing required path '+p);
const agents=files.filter(p=>['AGENTS.md','AGENTS.override.md'].includes(path.basename(p)));
ok(agents.length===1 && path.relative(root,agents[0])==='AGENTS.md','Exactly one active root instruction file is expected.');
const catalog=JSON.parse(fs.readFileSync('public/assets/audio/catalog.json','utf8'));
ok(catalog.assets.length===155,'Expected 155 delivered audio cues.');
ok(new Set(catalog.assets.map(a=>a.id)).size===155,'Audio IDs must be unique.');
let audioBytes=0;
for(const a of catalog.assets){
 const entries=Object.entries(a.paths);ok(entries.length===1,'One encoding per cue: '+a.id);
 for(const [ext,rel] of entries){
  ok(!path.isAbsolute(rel)&&!rel.split('/').includes('..'),'Unsafe audio path '+rel);
  ok(fs.existsSync(rel),'Missing audio '+rel);
  const data=fs.readFileSync(rel);audioBytes+=data.length;
  ok(data.length===a.files[ext].bytes,'Wrong audio size '+rel);
  ok(crypto.createHash('sha256').update(data).digest('hex')===a.files[ext].sha256,'Wrong audio hash '+rel);
 }
}
for(const chapter of catalog.chapters){
 const stems=['base','alert','extraction'].map(k=>catalog.assets.find(a=>a.id===chapter[k]));
 ok(stems.every(Boolean),'Missing chapter stems '+chapter.chapter);
 ok(stems.every(s=>s.frames===stems[0].frames),'Mismatched chapter stem frames '+chapter.chapter);
}
let links=0;
for(const f of files.filter(p=>p.endsWith('.md'))){
 const text=fs.readFileSync(f,'utf8');
 for(const m of text.matchAll(/\]\(([^)]+)\)/g)){
  const target=m[1].trim().split(/\s+"/)[0].replace(/^<|>$/g,'');
  if(/^(https?:|mailto:|data:|#)/.test(target))continue;
  const rel=decodeURIComponent(target.split('#')[0]);if(!rel)continue;
  ok(fs.existsSync(path.resolve(path.dirname(f),rel)),`Broken Markdown file link ${path.relative(root,f)} -> ${rel}`);links++;
 }
}
const chapters=files.filter(p=>/^specs\/campaign\/chapter-\d+.*\.md$/.test(path.relative(root,p).split(path.sep).join('/')));
ok(chapters.length===11,'Expected eleven chapter briefs.');
const levelIds=new Set(chapters.flatMap(p=>[...fs.readFileSync(p,'utf8').matchAll(/\bL(\d{2})\b/g)].map(m=>m[0])));
for(let i=1;i<=55;i++)ok(levelIds.has('L'+String(i).padStart(2,'0')),'Missing mission brief L'+String(i).padStart(2,'0'));
const report={scope:'File/link/hash validation only; not browser, learning, listening or playtest approval.',checks,passed:checks,audioCues:catalog.assets.length,audioBytes,chapterBriefs:chapters.length,missionIDs:levelIds.size,relativeMarkdownLinks:links};
fs.mkdirSync('evidence',{recursive:true});fs.writeFileSync('evidence/handoff-validation.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
