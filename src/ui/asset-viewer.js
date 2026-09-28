const root=new URL('../../public/assets/',import.meta.url);
const $=s=>document.querySelector(s),canvas=$('#preview'),ctx=canvas.getContext('2d');
let manifest,atlases={},images={},paused=false,start=0,freeze=0,last=0;
async function init(){
 const response=await fetch(new URL('asset-manifest.json',root));if(!response.ok)throw new Error('Serve this project over HTTP to load its assets.');manifest=await response.json();
 for(const who of ['patch','echo']){atlases[who]=await (await fetch(new URL(`characters/${who}-atlas.json`,root))).json();const image=new Image();image.src=new URL(`characters/${who}-atlas.png`,root).href;await image.decode();images[who]=image;}
 for(const e of manifest.objects){const card=document.createElement('a');card.className='asset';card.href=new URL(e.image,root).href;card.innerHTML=`<img src="${card.href}" alt="${e.id}"><small>${e.id}</small>`;$('#objects').append(card);}
 for(const tile of manifest.tiles){const card=document.createElement('a');card.className='asset';card.href=new URL(`tiles/${tile}.png`,root).href;card.innerHTML=`<img src="${card.href}" alt="${tile}"><small>${tile}</small>`;$('#tiles').append(card);}
 selection();requestAnimationFrame(draw);
}
function selection(){start=performance.now();freeze=0;const who=$('#who').value,name=`${$('#state').value}_${$('#facing').value}`,def=atlases[who].animations[name];
 $('#metadata').textContent=JSON.stringify({character:who,animation:name,frames:def.frames.length,fps:def.fps,loop:def.loop,frameSize:[128,128],footAnchor:[64,106],atlasSize:[768,3584]},null,2);
 $('#strip').replaceChildren();for(const frame of def.frames){const image=new Image();image.src=new URL(`characters/${who}/${frame}.png`,root).href;image.alt=frame;image.title=frame;$('#strip').append(image);}
}
function draw(t){
 const elapsed=paused?freeze:t-start,who=$('#who').value,def=atlases[who].animations[`${$('#state').value}_${$('#facing').value}`];
 const frames=Math.floor(Math.max(0,elapsed)*def.fps/1000),n=$('#repeat').checked||def.loop?frames%def.frames.length:Math.min(frames,def.frames.length-1),frame=atlases[who].frames[def.frames[n]].frame,z=Number($('#zoom').value),size=128*z,x=(800-size)/2,y=(520-size)/2;
 ctx.clearRect(0,0,800,520);for(let yy=0;yy<520;yy+=20)for(let xx=0;xx<800;xx+=20){ctx.fillStyle=(xx/20+yy/20)%2?'#1c333e':'#223d46';ctx.fillRect(xx,yy,20,20);}
 ctx.imageSmoothingEnabled=true;ctx.drawImage(images[who],frame.x,frame.y,128,128,x,y,size,size);
 if($('#anchor').checked){const px=x+64*z,py=y+106*z;ctx.strokeStyle='#f4c684';ctx.lineWidth=1;ctx.strokeRect(x,y,size,size);ctx.beginPath();ctx.moveTo(px-22,py);ctx.lineTo(px+22,py);ctx.moveTo(px,py-22);ctx.lineTo(px,py+22);ctx.stroke();ctx.fillStyle='#f7dfb8';ctx.font='12px monospace';ctx.fillText('(64,106)',px+26,py+5);}
 ctx.fillStyle='#dbe8e7';ctx.font='13px monospace';ctx.fillText(def.frames[n],22,490);ctx.fillText(`${n+1} / ${def.frames.length}`,690,490);last=t;requestAnimationFrame(draw);
}
for(const id of ['who','state','facing'])$('#'+id).addEventListener('change',selection);
$('#play').addEventListener('click',()=>{if(paused){start=performance.now()-freeze;paused=false;}else{freeze=last-start;paused=true;}$('#play').textContent=paused?'Play':'Pause';});
$('#restart').addEventListener('click',selection);
init().catch(e=>{$('#metadata').textContent=e.message;});
