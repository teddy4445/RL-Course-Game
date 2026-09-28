"""Atlas integrity and usable alpha; no human art-approval claim."""
from pathlib import Path
from PIL import Image
import json
R=Path(__file__).resolve().parents[1];A=R/'public/assets';checks=[]
def check(name,value):
 checks.append({'name':name,'passed':bool(value)})
 if not value:raise AssertionError(name)
for who in ['patch','echo']:
 meta=json.loads((A/f'characters/{who}-atlas.json').read_text());im=Image.open(A/f'characters/{who}-atlas.png')
 check(who+' atlas fixed size',im.size==(768,3584));check(who+' atlas alpha',im.mode=='RGBA');check(who+' 136 named frames',len(meta['frames'])==136)
 for name,record in meta['frames'].items():
  f=record['frame'];frame=Image.open(A/f'characters/{who}/{name}.png');check(name+' atlas pixel match',im.crop((f['x'],f['y'],f['x']+f['w'],f['y']+f['h'])).tobytes()==frame.tobytes());check(name+' transparent corner',frame.getpixel((0,0))[3]==0);check(name+' nonempty',frame.getbbox() is not None)
for p in (A/'objects').glob('*.png'):
 im=Image.open(p);check(p.stem+' prop export 64x64 alpha',im.size==(64,64) and im.mode=='RGBA')
report={'checks':len(checks),'passed':sum(c['passed'] for c in checks),'details':checks,'limits':'Pixel/frame integrity only. Human visual review and motion appeal are not implied.'};(R/'evidence/asset-validation.json').write_text(json.dumps(report,indent=2));print(f"{report['passed']} / {report['checks']} asset-integrity checks passed")
