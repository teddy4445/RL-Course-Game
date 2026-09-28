import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const levelsDir=path.join(root,'src','content','levels');
const retired=new Set(['budget-brief','budget-deep']);
let changed=0;

for(const name of fs.readdirSync(levelsDir).filter(name=>/^L\d{2}\.json$/.test(name))){
 const number=Number(name.slice(1,3));
 if(number<6)continue;
 const target=path.join(levelsDir,name),level=JSON.parse(fs.readFileSync(target,'utf8'));
 const before=JSON.stringify(level);
 level.geometry.entities=(level.geometry.entities??[]).filter(entity=>!retired.has(entity.capabilityId));
 if(level.learning?.capabilityPuzzle?.options){
  level.learning.capabilityPuzzle.options=level.learning.capabilityPuzzle.options.filter(id=>!retired.has(id));
 }
 if(JSON.stringify(level)!==before){
  fs.writeFileSync(target,`${JSON.stringify(level,null,2)}\n`);
  changed++;
 }
}

console.log(`Retired practice-budget choices from ${changed} canonical missions.`);
