import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {AUDIO} from '../src/audio/manifest.js';

const root=process.cwd();
const out=path.resolve(root,'dist');
assert.equal(path.dirname(out),root,'Build output must stay directly inside the repository.');
fs.rmSync(out,{recursive:true,force:true});
fs.mkdirSync(out,{recursive:true});

function copy(relative){
 const source=path.resolve(root,relative),destination=path.resolve(out,relative);
 assert.ok(source.startsWith(root+path.sep)&&destination.startsWith(out+path.sep),`Unsafe build path: ${relative}`);
 assert.ok(fs.statSync(source).isFile(),`Runtime file is missing: ${relative}`);
 fs.mkdirSync(path.dirname(destination),{recursive:true});
 fs.copyFileSync(source,destination);
}

const runtimeSource=[
 'index.html',
 'src/main.js',
 'src/agents/neural.js',
 'src/agents/deep-control.js',
 'src/agents/imitation.js',
 'src/agents/feature-control.js',
 'src/agents/dyna-q.js',
 'src/agents/policy-gradient.js',
 'src/agents/policy-evaluation.js',
 'src/agents/prediction.js',
 'src/agents/q-learning.js',
 'src/audio/manifest.js',
 'src/audio/mixer.js',
 'src/content/levels.js',
 'src/content/opening.js',
 'src/content/cartridge-controls.js',
 'src/content/capabilities.js',
 'src/persistence/save.js',
 'src/sim/core.js',
 'src/training/worker.js',
 'src/training/neural-worker.js',
 'src/ui/renderer.js',
 'src/ui/style.css',
 'src/ui/polish.css'
];
runtimeSource.forEach(copy);

const manifest=JSON.parse(fs.readFileSync(path.join(root,'public/assets/asset-manifest.json'),'utf8'));
const art=[
 'public/assets/characters/patch-atlas.png',
 'public/assets/characters/patch-atlas.json',
 'public/assets/characters/echo-atlas.png',
 'public/assets/characters/echo-atlas.json',
 'public/assets/characters/patch/patch_idle_south_00.svg',
 'public/assets/characters/echo/echo_idle_south_00.svg',
 'public/assets/characters/echo/echo_charge_south_00.svg',
 'public/assets/characters/echo/echo_celebrate_south_00.svg',
 ...manifest.objects.map(item=>`public/assets/${item.image}`),
 ...manifest.tiles.map(name=>`public/assets/tiles/${name}.png`),
 ...['city','pause','play','settings','sound'].map(name=>`public/assets/ui/${name}.svg`),
 ...['scrapyard','transit','switchworks','courier','neon','foundry','docks','skybridge','arcade','storm','tower','eclipse'].map(name=>`public/assets/ui/districts/${name}.svg`),
 'public/assets/ui/echo-heist-title-v1.png',
 'public/assets/ui/finale-dawn-v1.png'
 ,...['hero-heist-v1','learning-loop-v1','story-journey-v1'].map(name=>`public/assets/ui/landing/${name}.png`)
 ,...['c02-transit','c03-switchworks','c04-courier','c05-neon','c06-foundry','c07-docks','c08-skybridge','c09-arcade','c10-storm','c11-tower'].map(name=>`public/assets/ui/story/${name}.png`)
 ,...['sentry','warden','portal','cartridge'].map(name=>`public/assets/characters/generated/${name}-strip.png`)
];
[...new Set(art)].forEach(copy);

const runtimeManifest={
 schemaVersion:manifest.schemaVersion,
 style:manifest.style,
 tileSize:manifest.tileSize,
 objects:manifest.objects.map(({id,image,frameSize})=>({id,image,frameSize})),
 tiles:manifest.tiles
};
fs.mkdirSync(path.join(out,'public/assets'),{recursive:true});
fs.writeFileSync(path.join(out,'public/assets/asset-manifest.json'),JSON.stringify(runtimeManifest,null,2)+'\n');

for(const relative of new Set(Object.values(AUDIO).map(item=>item.path)))copy(relative);

const mainPath=path.join(out,'src/main.js');
const marker='// Development-only coordinator probes;';
let main=fs.readFileSync(mainPath,'utf8').replace("const BUILD_MODE='development';\n",'');
assert.ok(main.includes(marker),'Development probe marker is missing.');
main=main.slice(0,main.indexOf(marker)).trimEnd()+'\n';
fs.writeFileSync(mainPath,main);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
copy('CNAME');

function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const item=path.join(dir,entry.name);return entry.isDirectory()?walk(item):[item];});}
const built=walk(out),relativeBuilt=built.map(file=>path.relative(out,file).split(path.sep).join('/'));
for(const forbidden of ['asset-viewer.html','production/','docs/','tests/','scripts/','evidence/']){
 assert.ok(!relativeBuilt.some(file=>file===forbidden||file.startsWith(forbidden)),`Authoring path leaked into release: ${forbidden}`);
}
assert.ok(!relativeBuilt.some(file=>/\.(md|py)$/i.test(file)),'Documentation or Python tooling leaked into release.');
assert.ok(!fs.readFileSync(mainPath,'utf8').includes('__echoTest'),'Development browser probe leaked into release.');
assert.ok(!fs.readFileSync(mainPath,'utf8').includes('previewCompleteNextMission'),'Development progress shortcut leaked into release.');
const bytes=built.reduce((sum,file)=>sum+fs.statSync(file).size,0);
console.log(`Built lean static dist/: ${built.length} files, ${(bytes/1024/1024).toFixed(2)} MiB. No server, runtime CDN, authoring references, or test tools included.`);
