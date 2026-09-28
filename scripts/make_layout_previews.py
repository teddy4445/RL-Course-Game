from pathlib import Path
import json, os
from PIL import Image,ImageDraw,ImageFont
R=Path(__file__).resolve().parents[1]
def f(size):
 for name in [os.environ.get('ECHO_FONT'), 'DejaVuSans.ttf', 'Arial.ttf']:
  if not name: continue
  try: return ImageFont.truetype(name,size)
  except OSError: pass
 try: return ImageFont.load_default(size=size)
 except TypeError: return ImageFont.load_default()
for path in sorted((R/'src/content/levels').glob('*.json')):
 l=json.loads(path.read_text());w=l['geometry']['width'];h=l['geometry']['height'];T=60;ox=55;oy=130
 im=Image.new('RGB',(max(1150,w*T+370),h*T+270),'#112530');d=ImageDraw.Draw(im)
 d.text((35,25),f"{l['id']}  /  {l['title']}",font=f(30),fill='#f0c58e')
 d.text((35,70),f"{l['chapterId']} / {w} x {h} / content {l['contentVersion']} / x right, y down / exact authored layout",font=f(16),fill='#adc6cd')
 for y,row in enumerate(l['geometry']['tiles']):
  d.text((ox-24,oy+y*T+20),str(y),font=f(13),fill='#9bb3bb')
  for x,t in enumerate(row):
   if y==0:d.text((ox+x*T+25,oy-25),str(x),font=f(13),fill='#9bb3bb')
   c={'#':'#40515b','.':'#243d45','p':'#4a453d','e':'#1c5263'}[t]
   d.rounded_rectangle((ox+x*T+1,oy+y*T+1,ox+(x+1)*T-2,oy+(y+1)*T-2),3,fill=c,outline='#657983' if t=='#' else '#3b5d67')
   if t=='#':d.line((ox+x*T+10,oy+y*T+30,ox+x*T+50,oy+y*T+30),fill='#263b45',width=3)
 legend=[]
 for n,e in enumerate(l['geometry']['entities'],1):
  if e['kind']=='boss':
   bx=ox+e['x']*T+30;by=oy+e['y']*T+30
   for radius,color in [(27,'#e64a91'),(20,'#17071e'),(8,'#ffd376')]:d.ellipse((bx-radius,by-radius,bx+radius,by+radius),fill=color)
  elif e['kind']=='sentry':
   bx=ox+e['x']*T+30;by=oy+e['y']*T+30
   d.rounded_rectangle((bx-20,by-14,bx+20,by+14),6,fill='#301821',outline='#ff7a73',width=3)
   d.ellipse((bx-6,by-6,bx+6,by+6),fill='#ff5b66')
   d.ellipse((bx-18,by+10,bx-7,by+21),fill='#111b23');d.ellipse((bx+7,by+10,bx+18,by+21),fill='#111b23')
  else:
   icon=Image.open(R/f"public/assets/objects/{e['kind']}.png").resize((48,48))
   im.paste(icon,(ox+e['x']*T+6,oy+e['y']*T+6),icon)
  d.ellipse((ox+e['x']*T+2,oy+e['y']*T+2,ox+e['x']*T+17,oy+e['y']*T+17),fill='#f1cb96')
  d.text((ox+e['x']*T+4,oy+e['y']*T+1),str(n),font=f(10),fill='#1b3442')
  legend.append(f"{n:02d}  {e['id']} ({e['x']},{e['y']})")
 for who,key,col in [('patch','patchSpawn','#f7c78b'),('echo','echoSpawn','#8cdee7')]:
  a=l['actors'][key];xx=ox+a['x']*T;yy=oy+a['y']*T
  d.rectangle((xx+1,yy+1,xx+T-2,yy+T-2),outline=col,width=3)
  img=Image.open(R/f'public/assets/characters/{who}/{who}_idle_south_00.png').resize((72,72));im.paste(img,(xx-6,yy-19),img)
  legend.append(f"{who.upper()} spawn ({a['x']},{a['y']})")
 lx=ox+w*T+24
 d.text((lx,oy),'ENTITY REGISTER',font=f(16),fill='#f0c58e')
 for i,line in enumerate(legend):d.text((lx,oy+32+i*23),line,font=f(12),fill='#bad0d3')
 d.text((35,oy+h*T+25),'DARK = walls    AMBER = Patch lane    CYAN = Echo-only lane    SLATE = shared floor',font=f(14),fill='#b7cdd1')
 d.text((35,oy+h*T+56),'Numbers identify entities, not interaction order. JSON is the geometry source of truth.',font=f(14),fill='#829fa9')
 im.save(R/f'production/layouts/{l["id"]}.png')
 (R/f'production/layouts/{l["id"]}.json').write_text(json.dumps(l,indent=2))
print('Coordinate-labelled previews and JSON copies written for every canonical runtime level')
