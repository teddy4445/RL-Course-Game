"""Offline Chromium harness; respects the environment's blocked navigation policy.
Runs the actual source modules in isolated factories, with local bytes for assets.
Worker code runs in a real CLASSIC Blob Worker (offline factory adaptation).
The module-worker loader remains unverified here: opaque about:blank module
workers fail in this managed browser, whereas classic Blob workers run. localStorage is an in-memory adapter here.
This is not evidence of real HTTP-origin storage or deployed hosting behavior.
"""
from pathlib import Path
import base64,re,json,mimetypes,posixpath
from urllib.parse import urlparse,unquote
ROOT=Path(__file__).resolve().parents[1]
BASE='https://offline-echo.invalid/echo-heist/'
MODULES=['src/content/opening.js','src/content/levels.js','src/sim/core.js','src/agents/q-learning.js','src/persistence/save.js','src/audio/manifest.js','src/audio/mixer.js','src/ui/renderer.js','src/main.js']

def factory(name,source=None):
 code=(ROOT/name).read_text() if source is None else source
 exports=re.findall(r'export\s+(?:async\s+)?(?:function|class|const|let)\s+(\w+)',code)
 def imp(m):
  target=posixpath.normpath(posixpath.join(posixpath.dirname(name),m.group(2)))
  return 'const {'+m.group(1)+'}=globalThis.__M['+json.dumps(target)+'];'
 code=re.sub(r"import\s*\{([^}]+)\}\s*from\s*['\"]([^'\"]+)['\"];?",imp,code)
 code=re.sub(r'\bexport\s+','',code).replace('import.meta.url',json.dumps(BASE+name))
 if name=='src/main.js':code=code.replace("new URLSearchParams(location.search).get('test')==='1'",'true')
 return 'globalThis.__M['+json.dumps(name)+'] = (()=>{\n'+code+'\nreturn {'+','.join(exports)+'};\n})();\n'

def install(page):
 errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 images={}
 for folder in ['public/assets','production/layouts']:
  for p in (ROOT/folder).rglob('*'):
   if p.suffix not in ['.png','.svg']:continue
   mime=mimetypes.guess_type(p.name)[0] or 'image/png'
   images[p.relative_to(ROOT).as_posix()]='data:'+mime+';base64,'+base64.b64encode(p.read_bytes()).decode()
 css=(ROOT/'src/ui/style.css').read_text()
 def cssurl(m):
  val=m.group(1).strip("'\"");key=posixpath.normpath(posixpath.join('src/ui',val));return 'url("'+images.get(key,val)+'")'
 css=re.sub(r'url\(([^)]+)\)',cssurl,css)
 page.set_content('<html><head><style>'+css+'</style></head><body><div id="app"></div><div id="toast" role="status" aria-live="polite"></div><dialog id="dialog"></dialog></body></html>')
 page.evaluate('''images=>{
 window.__art=images;
 const key=u=>{try{let p=new URL(u,'https://offline-echo.invalid/echo-heist/').pathname;return decodeURIComponent(p.replace(/^\\/echo-heist\\//,''));}catch{return u;}};
 const ih=Object.getOwnPropertyDescriptor(Element.prototype,'innerHTML');
 Object.defineProperty(Element.prototype,'innerHTML',{get:ih.get,set:function(v){ih.set.call(this,v.replace(/src="([^"]+)"/g,(m,u)=>'src="'+(images[key(u)]||u)+'"'));}});
 const src=Object.getOwnPropertyDescriptor(HTMLImageElement.prototype,'src');
 Object.defineProperty(HTMLImageElement.prototype,'src',{get:src.get,set:function(u){src.set.call(this,images[key(u)]||u);}});
 window.__memory=new Map();
 Object.defineProperty(window,'localStorage',{value:{getItem:k=>window.__memory.get(k)??null,setItem:(k,v)=>window.__memory.set(k,String(v)),removeItem:k=>window.__memory.delete(k)},configurable:true});
 }''',images)
 def read(url):
  name=unquote(urlparse(url).path)
  if name.startswith('/echo-heist/'):name=name[len('/echo-heist/'):]
  p=(ROOT/name.lstrip('/')).resolve()
  if not p.is_relative_to(ROOT) or not p.is_file():return {'status':404,'body':''}
  return {'status':200,'body':base64.b64encode(p.read_bytes()).decode()}
 page.expose_function('__readBytes',read)
 page.evaluate('''()=>{window.fetch=async u=>{const r=await __readBytes(String(u));return new Response(Uint8Array.from(atob(r.body),c=>c.charCodeAt(0)),{status:r.status});};}''')
 worker='globalThis.__M={};\n'+factory('src/sim/core.js')+factory('src/agents/q-learning.js')+factory('src/training/worker.js')
 page.evaluate('''source=>{const NativeWorker=window.Worker;window.Worker=class extends NativeWorker{constructor(url,options){const blob=new Blob([source],{type:'text/javascript'});const local=URL.createObjectURL(blob);super(local,{type:"classic"});this.addEventListener("error",e=>console.error("Worker failed: "+e.message+" @ "+e.lineno));this.__url=local;}terminate(){super.terminate();URL.revokeObjectURL(this.__url);}};}''',worker)
 bundle='globalThis.__M={};\n'+''.join(factory(name) for name in MODULES)
 page.add_script_tag(content=bundle)
 return errors
