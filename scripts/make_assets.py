"""Rebuild original, aligned runtime art. Python 3 + Pillow + CairoSVG.
No external images/fonts or image-generation service is used. SVG is the editable source.
"""
from pathlib import Path
import math, json, random
import cairosvg
from PIL import Image, ImageDraw
ROOT=Path(__file__).resolve().parents[1]
AS=ROOT/'public/assets'
INK='#15212b'

def svg(body,w=128,h=128):
 return f'<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="0 0 {w} {h}">{body}</svg>'
def rect(x,y,w,h,fill,rx=3,stroke=INK,sw=2):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}"/>'
def ellipse(x,y,rx,ry,fill,stroke='none',sw=1):
 opacity = int(fill[7:9],16)/255 if len(fill)==9 and fill.startswith('#') else 1
 color=fill[:7] if len(fill)==9 and fill.startswith('#') else fill
 return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" fill="{color}" fill-opacity="{opacity}" stroke="{stroke}" stroke-width="{sw}"/>'
def line(x1,y1,x2,y2,col,sw=2):
 return f'<path d="M{x1} {y1}L{x2} {y2}" fill="none" stroke="{col}" stroke-width="{sw}" stroke-linecap="round"/>'
def path(d,fill,stroke=INK,sw=2):
 return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"/>'
def write_asset(path_,text,png=True):
 p=AS/path_;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text)
 if png:cairosvg.svg2png(bytestring=text.encode(),write_to=str(p.with_suffix('.png')))

def robot(who,direction,state,frame,n):
 patch=who=='patch'; rear=direction=='north'; side=direction in ['east','west']; left=direction=='west'
 phase=frame/n*math.tau
 bob=math.sin(phase)*1.5 if state in ['walk','carry'] else math.sin(phase)*.6
 main='#ed9b40' if patch else '#dcebf0'; low='#ba642c' if patch else '#83abb6'; hi='#ffce76' if patch else '#f3fbfa'
 face='#0b2637'; eye='#77e2eb'; small=not patch
 b=ellipse(64,106,28 if patch else 23,6,'#00000033')
 if state=='charge':b+=ellipse(64,106,29+frame*1.5,8,'none','#55d5d9',1.5)
 transform=f'translate(0 {bob})'
 if state=='caught':transform+=f' rotate({[0,-12,10,-5][frame%4]} 64 96)'
 if left:transform+=' translate(128 0) scale(-1 1)'
 b+=f'<g transform="{transform}">'
 if patch:
  for x,offset in [(47,math.sin(phase)*4),(73,-math.sin(phase)*4)]:
   y=90+(offset if state in ['walk','carry'] else 0)
   b+=rect(x,y,10,14,'#30424d',3)+rect(x-4,y+9,17,9,low,3)+line(x-1,y+12,x+9,y+12,hi,1)
 else:
  for x in ([42,76] if not side else [51,73]):
   b+=rect(x,83,12,20,'#203640',5)+line(x+3,86,x+3,99,'#668493',1.5)
   if state in ['walk','carry']:b+=line(x+4,88+frame%3*3,x+9,88+frame%3*3,'#73b9c3',2)
 # Body and back details.
 b+=rect(43 if patch else 42,64 if patch else 67,43 if patch else 45,30,low,10)
 b+=rect(46,64 if patch else 67,36,23,main,9)+line(49,72,76,72,hi,2)
 b+=rect(57,80,14,7,'#1f3745',2)+line(60,83,67,83,'#7ddfd9',2)
 if rear:b+=rect(53,69,22,18,'#3e5360',3)+line(56,74,70,74,'#718895')+line(56,78,70,78,'#718895')
 # Arms: useful terminal poses and carrying space, never a baked cargo object.
 for x,sign in [(36,-1),(90,1)]:
  raised=state=='celebrate'; use=state=='interact' and sign==1; carry=state=='carry'
  handY=50+frame%2*3 if raised else (73 if carry else (64-frame*2 if use else 88))
  handX=x+sign*(5 if raised else 0)
  b+=line(44 if sign<0 else 83,73,handX,handY,'#20333f',7)
  b+=ellipse(handX,handY,7,7,main,INK,2)+ellipse(handX-1,handY-2,3,2,hi)
  if patch and sign==1:b+=path(f'M{handX-5} {handY+4} l-2 7 4 3 3-3 3 3 4-3-2-7', '#617b88',INK,1.5)
 # Head silhouette, antenna, visor; shared anchor at (64,106).
 hx=36 if patch else 38; hy=29 if patch else 38; hw=57 if patch else 52; hh=42 if patch else 37
 b+=line(66,hy,69,hy-10,'#29414d',3)+ellipse(69,hy-12,4,4,'#ffd684' if patch else '#69dee6',INK,1.5)
 b+=rect(hx,hy,hw,hh,low,15)+rect(hx+2,hy,hw-4,hh-7,main,14)
 b+=path(f'M{hx+9} {hy+8} Q{hx+26} {hy-1} {hx+hw-9} {hy+7}', 'none',hi,3)
 if rear:
  b+=rect(hx+13,hy+14,hw-26,20,low,5)
  for y in range(hy+19,hy+30,4):b+=line(hx+18,y,hx+hw-18,y,'#52606a',2)
 elif side:
  b+=rect(hx+hw-27,hy+10,27,24,face,8)+ellipse(hx+hw-10,hy+21,4,6,eye)
  b+=ellipse(hx+12,hy+22,8,8,low,INK,1.5)+ellipse(hx+12,hy+22,4,4,'#adc6cb')
 else:
  b+=rect(hx+6,hy+10,hw-12,26,face,9)
  closed=state=='charge' or (state=='idle' and frame==3)
  if closed:
   b+=line(hx+15,hy+24,hx+23,hy+24,eye,3)+line(hx+hw-23,hy+24,hx+hw-15,hy+24,eye,3)
  elif state=='caught':
   for xx in [hx+19,hx+hw-19]:b+=line(xx-3,hy+19,xx+3,hy+25,'#ffa4a0',2)+line(xx+3,hy+19,xx-3,hy+25,'#ffa4a0',2)
  else:
   b+=rect(hx+15,hy+16,8,12,eye,3,'none')+rect(hx+hw-23,hy+16,8,12,eye,3,'none')
   b+=ellipse(hx+17,hy+18,2,2,'#e6ffff')+ellipse(hx+hw-21,hy+18,2,2,'#e6ffff')
 # Chassis screws.
 for xx in [48,80]:b+=ellipse(xx,91,2,2,hi)
 if state=='celebrate':
  for i in range(3):
   x=28+i*35;y=22-(frame*4+i*3)%19;b+=path(f'M{x} {y-4}l2 3 4 1-4 2-2 4-1-4-4-2 4-1z','#ffe0a1','none')
 b+='</g>'
 return svg(b)

states={'idle':4,'walk':6,'interact':4,'carry':6,'caught':4,'celebrate':6,'charge':4}
dirs=['south','west','east','north']
manifest={'schemaVersion':1,'style':'C01 vector production v1','tileSize':64,'characters':{},'objects':[],'tiles':[]}
for who in ['patch','echo']:
 atlas=Image.new('RGBA',(6*128,28*128));frames={};animations={};row=0
 for state,n in states.items():
  for d in dirs:
   names=[]
   for f in range(n):
    name=f'{who}_{state}_{d}_{f:02d}';names.append(name)
    text=robot(who,d,state,f,n);write_asset(f'characters/{who}/{name}.svg',text)
    image=Image.open(AS/f'characters/{who}/{name}.png');atlas.paste(image,(f*128,row*128))
    frames[name]={'frame':{'x':f*128,'y':row*128,'w':128,'h':128},'rotated':False,'trimmed':False,'spriteSourceSize':{'x':0,'y':0,'w':128,'h':128},'sourceSize':{'w':128,'h':128},'pivot':{'x':.5,'y':.828125}}
   animations[f'{state}_{d}']={'frames':names,'fps':8 if state in ['walk','carry'] else 5,'loop':state not in ['caught','interact','celebrate']}
   row+=1
 atlas.save(AS/f'characters/{who}-atlas.png')
 data={'frames':frames,'meta':{'image':f'{who}-atlas.png','format':'RGBA8888','size':{'w':atlas.width,'h':atlas.height},'scale':'1'},'animations':animations}
 (AS/f'characters/{who}-atlas.json').write_text(json.dumps(data,indent=2))
 manifest['characters'][who]={'image':f'characters/{who}-atlas.png','atlas':f'characters/{who}-atlas.json','frameSize':[128,128],'footAnchor':[64,106],'collisionFootprint':[.42,.42],'animations':animations}

# Props use one tile footprint (64x64) and a consistent grounded perspective.
def prop(name):
 b=ellipse(32,56,22,5,'#00000036')
 if name.startswith('crate'):
  b+=rect(9,12,46,43,'#62443a',4)+rect(11,9,42,40,'#bd8252',3)+rect(17,15,30,28,'#745346',2)
  b+=path('M12 11L51 46M51 11L12 46','none','#dfa463',5)+line(12,11,51,11,'#f2bb7b',2)
 elif name in ['battery','fuse','power-cell','token']:
  color='#94e5b1' if name=='battery' else '#71dbeb'
  b+=rect(20,13,25,39,'#304757',6)+rect(23,17,19,29,color,4)+rect(26,9,13,7,'#aabcca',2)
  b+=path('M35 21l-9 13h7l-3 12 11-16h-8z','#e5ffeb','none')
 elif name=='scrap':
  b+=path('M31 10l6 6 8-1 1 8 6 5-6 6-1 9-9-1-6 6-5-6-8 1-1-9-6-6 7-5 1-8 8 1z','#bc9362')+ellipse(31,29,8,8,'#32414c',INK,2)
 elif name in ['socket','socket-on']:
  b+=rect(10,12,45,43,'#3c5360',6)+rect(14,16,37,30,'#132c38',4)+rect(25,23,14,19,'#27434c',2)
  color='#86e2ba' if name.endswith('-on') else '#d7a864'
  b+=line(18,49,45,49,color,3)+path('M33 23l-7 9h5l-2 8 9-12h-5z',color,'none')
 elif name in ['lever','lever-on']:
  b+=rect(14,35,35,21,'#41535d',5)+ellipse(32,42,12,5,'#162c37')
  xx=43 if name.endswith('on') else 23
  b+=line(32,42,xx,18,'#c0c5bd',5)+ellipse(xx,17,8,7,'#69d7b4' if name.endswith('on') else '#edab57',INK,2)
 elif name in ['dock','dock-on']:
  b+=ellipse(32,41,29,17,'#41566a',INK,2)+ellipse(32,35,29,16,'#7797a4',INK,2)+ellipse(32,35,23,11,'#143c4b',INK,2)
  b+=ellipse(32,35,20,9,'none','#73dde3',2)+rect(5,15,10,27,'#425e6b',2)+rect(49,15,10,27,'#425e6b',2)
  b+=line(8,20,8,29,'#9be7ea',3)+line(53,20,53,29,'#9be7ea',3)
 elif name in ['gate','gate-open']:
  b+=rect(2,5,60,53,'#3c4e57',3)+rect(9,10,46,47,'#192e38',2)
  if name=='gate':
   for y in range(14,50,8):b+=rect(12,y,40,6,'#778082',0)+line(15,y+1,22,y+1,'#e5b767',2)
  b+=rect(1,10,8,43,'#be813d',2)+rect(55,10,8,43,'#be813d',2)+ellipse(58,14,2,2,'#73dfb4' if name.endswith('open') else '#e9a77d')
 elif name in ['exit-echo','exit-patch','exit-on']:
  color='#79d4e2' if name=='exit-echo' else '#f2ba74'
  if name=='exit-on':color='#85e6b0'
  b=rect(5,7,54,51,'#31474d',6)+rect(9,11,46,41,'#1d343b',3)+rect(12,15,40,32,'none',2,color,2)+path('M24 24h10v-5l11 12-11 12v-5H24z',color,'none')
 elif name=='core':
  b+=rect(12,14,41,38,'#7b664c',7)+path('M14 16L32 7l20 9-20 11z','#e6ba75')+ellipse(32,33,13,14,'#153b4b',INK,2)+ellipse(32,31,8,10,'#87eeef')+ellipse(29,28,3,4,'#f0ffff')
 elif name in ['laser','laser-off']:
  b=rect(2,18,11,29,'#5a6971',3)+rect(51,18,11,29,'#5a6971',3)
  if name=='laser':b+=line(12,32,52,32,'#dc6e76',7)+line(12,32,52,32,'#ffe0d3',2)
  else:b+=line(12,32,52,32,'#7b6464',1)
 elif name=='barrel':
  b+=rect(14,15,36,36,'#426675',5)+ellipse(32,16,18,8,'#648693',INK,2)+ellipse(32,50,18,7,'#314e5c',INK,2)+rect(13,26,38,5,'#92a5a5',1)+rect(13,41,38,5,'#92a5a5',1)
 elif name=='vent':
  b=rect(3,4,58,56,'#425a61',4)+rect(9,9,46,44,'#162e39',3)
  for x in range(13,52,7):b+=line(x,14,x,48,'#608390',3)
 elif name=='lamp':
  b=rect(23,8,18,44,'#463f38',4)+rect(27,14,10,27,'#ffbb66',4)+ellipse(32,30,24,28,'#ffb46414')
 elif name=='console':
  b+=rect(8,10,47,42,'#51636b',4)+rect(13,14,37,25,'#092d40',3)+line(18,20,40,20,'#80d5cd',2)+line(18,26,33,26,'#6096a9',2)+line(18,32,44,32,'#d4bd82',2)
  for x in [20,30,40]:b+=ellipse(x,45,2,2,'#e6ac61')
 return svg(b,64,64)
objects=['crate','battery','fuse','power-cell','token','scrap','socket','socket-on','lever','lever-on','dock','dock-on','gate','gate-open','exit-echo','exit-patch','exit-on','core','laser','laser-off','barrel','vent','lamp','console']
for name in objects:
 write_asset(f'objects/{name}.svg',prop(name));manifest['objects'].append({'id':name,'image':f'objects/{name}.png','source':f'objects/{name}.svg','frameSize':[64,64]})
for name in ['floor-a','floor-b','floor-c','wall','echo-floor','grate','hazard-stripe']:
 b=rect(0,0,64,64,'#23333e',0,'none')
 if name=='wall':
  b+=rect(1,1,62,60,'#354852',3)+rect(4,4,56,42,'#52616a',2)+line(5,6,58,6,'#778285',2)+rect(5,49,54,10,'#1a2b35',1)
  for x in [11,53]:b+=ellipse(x,12,2,2,'#a39980')
 else:
  c={'floor-a':'#35434a','floor-b':'#303e45','floor-c':'#38464a','echo-floor':'#2b4550','grate':'#273c47','hazard-stripe':'#63563e'}[name]
  b+=rect(2,2,60,60,c,2)+line(4,4,59,4,'#657077',1)+line(4,5,4,57,'#52646b',1)
  for x,y in [(8,8),(56,56)]:b+=ellipse(x,y,1.3,1.3,'#788181')
  if name=='echo-floor':
   for y in [24,37]:b+=path(f'M25 {y}l7-5 7 5','none','#527f87',1.5)
  if name=='grate':
   for y in range(12,58,7):b+=line(9,y,55,y,'#111f29',3)
  if name=='hazard-stripe':
   for x in range(-50,70,20):b+=path(f'M{x} 60l24-56h9l-24 56z','#ad854d','none')
  if name=='floor-c':b+=path('M15 50l7-8 12 4 9-5','none','#6a5e4b',1)
 write_asset(f'tiles/{name}.svg',svg(b,64,64));manifest['tiles'].append(name)
# Decorative city/elevator view, not collidable geometry.
rng=random.Random(7401);b='<defs><linearGradient id="sky" x2="0" y2="1"><stop stop-color="#102333"/><stop offset="1" stop-color="#716557"/></linearGradient><linearGradient id="fog" x2="0" y2="1"><stop stop-color="#8098a8" stop-opacity="0"/><stop offset="1" stop-color="#27424c" stop-opacity=".65"/></linearGradient></defs>'
b+=rect(0,0,1600,1000,'url(#sky)',0,'none')+ellipse(1150,230,220,220,'#f1b87408')+ellipse(1150,230,128,128,'#f1b8740b')+ellipse(1150,230,52,52,'#e2c3a15a')
for layer,(base,col) in enumerate([(700,'#2b3d4b'),(820,'#243541'),(1000,'#162a35')]):
 x=-40
 while x<1630:
  w=rng.randrange(44,130);h=rng.randrange(100,400);y=base-h
  b+=rect(x,y,w,h,col,1,'none')+rect(x+w*.2,y-12,w*.6,12,col,0,'none')
  if rng.random()<.45:b+=line(x+w/2,y-12,x+w/2,y-70,col,3)+ellipse(x+w/2,y-73,2,2,'#d99c72')
  for wx in range(x+12,x+w-10,14):
   for wy in range(y+18,base-12,22):
    if rng.random()<.45:b+=rect(wx,wy,4,8,rng.choice(['#af997166','#ddad7c77','#7fc7c644']),1,'none')
  x+=w+rng.randrange(8,25)
 b+=rect(0,base-180,1600,240,'url(#fog)',0,'none')
b+=path('M0 670Q600 580 1600 730','none','#12303b',7)+path('M0 680Q600 590 1600 740','none','#648187',1)
write_asset('ui/city.svg',svg(b,1600,1000),False)
# Small semantic icons, deliberately no baked labels.
icons={'play':'M22 14L51 32 22 50Z','pause':'M20 15H28V49H20ZM37 15H45V49H37Z','retry':'M48 21A20 20 0 1 0 51 39M48 9V23H34','sound':'M13 26H22L34 15V49L22 38H13ZM41 24Q53 32 41 40','settings':'M24 12H40L43 21 52 24V40L43 43 40 52H24L21 43 12 40V24L21 21ZM23 32A9 9 0 1 0 41 32A9 9 0 1 0 23 32','check':'M15 32L27 44 51 19','lock':'M19 29V21A13 13 0 0 1 45 21V29M15 29H49V53H15Z','scanner':'M27 11A16 16 0 1 0 27 43A16 16 0 1 0 27 11M39 39L53 53'}
for n,d in icons.items():write_asset(f'ui/{n}.svg',svg(path(d,'none','#d9e8df',3),64,64))
(AS/'asset-manifest.json').write_text(json.dumps(manifest,indent=2))
# Readable art inspection board. Only this board contains labels; sprites do not.
board=Image.new('RGB',(1500,950),'#152633');dr=ImageDraw.Draw(board)
dr.text((35,25),'ECHO HEIST / CHAPTER 01 / PRODUCTION ART v1',fill='#f4d7a5',font_size=28)
dr.text((35,64),'Editable vector masters. Transparent PNG exports. Shared foot anchors. Four directional facings.',fill='#a7c0c9',font_size=17)
for ri,who in enumerate(['patch','echo']):
 dr.text((35,125+ri*260),who.upper(),fill='#f4d7a5',font_size=22)
 for ci,d in enumerate(dirs):
  im=Image.open(AS/f'characters/{who}/{who}_idle_{d}_00.png').resize((180,180))
  board.paste(im,(180+ci*210,110+ri*260),im)
  dr.text((224+ci*210,291+ri*260),d.upper(),fill='#a7c0c9',font_size=15)
for i,n in enumerate(objects):
 x=30+(i%12)*122;y=668+(i//12)*136
 im=Image.open(AS/f'objects/{n}.png').resize((90,90));board.paste(im,(x,y),im);dr.text((x,y+96),n,fill='#a7c0c9',font_size=12)
board.save(ROOT/'production/art/asset-contact-sheet.png')
print('Generated',sum(1 for _ in AS.rglob('*') if _.is_file()),'art files')
