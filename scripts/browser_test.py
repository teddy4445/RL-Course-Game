"""Actual-source offline UI/worker tests. See offline_browser.py for test limitations."""
import json,traceback,time
from playwright.sync_api import sync_playwright
from offline_browser import install,ROOT
results=[]
def check(name,passed,detail=None):
 results.append({'name':name,'passed':bool(passed),'detail':detail});print(('PASS ' if passed else 'FAIL ')+name,flush=True)
 if not passed:raise AssertionError(name)
def direct(page,actions):page.evaluate('(actions)=>actions.forEach(a=>__echoTest.command(a))',actions)
def snap(page,name):page.wait_for_timeout(180);page.screenshot(path=str(ROOT/'evidence'/name))
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox','--autoplay-policy=user-gesture-required'])
 page=browser.new_page(viewport={'width':1600,'height':960},device_scale_factor=1)
 page.set_default_timeout(7000)
 errors=install(page)
 page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
 try:
  check('Landing page has a real Play entry',page.get_by_role('button',name='Enter the city').count()==1);snap(page,'landing.png')
  check('Audio stays inactive before a gesture',page.evaluate('__echoTest.audio.context===undefined'))
  page.get_by_role('button',name='Enter the city').click();page.wait_for_timeout(400);snap(page,'main-menu.png')
  check('Menu opens after gesture',page.evaluate('__echoTest.page')=='menu')
  page.get_by_role('button',name='Missions').click();check('Five cards; four initially locked',page.locator('.level-card').count()==5 and page.locator('.level-card:disabled').count()==4);snap(page,'mission-selection.png')
  page.get_by_role('button',name='Back to lift').click();page.get_by_role('button',name='Settings').click();page.get_by_label('Reduced motion').check();check('Reduced motion applies to root',page.locator('body.reduced-motion').count()==1);snap(page,'settings.png')
  page.get_by_role('button',name='Back',exact=True).click();page.get_by_role('button',name='Start the heist').click();page.wait_for_timeout(700);snap(page,'gameplay-L01.png')
  check('Cold Boot starts at exact fixture coordinates',page.evaluate('__echoTest.state.patch.x===1&&__echoTest.state.patch.y===1'))
  for key in ['ArrowRight','ArrowRight','e','ArrowDown','ArrowDown','e','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowRight','ArrowDown','ArrowDown','ArrowDown','ArrowLeft']:
   page.keyboard.press(key);page.wait_for_timeout(260)
  page.wait_for_function('__echoTest.state.complete');check('L01 completed through keyboard input',True);snap(page,'mission-clear.png')
  for i in range(2,6):
   page.get_by_role('button',name='Next mission').click();page.wait_for_timeout(600)
   check(f'L0{i} loads only after predecessor',page.evaluate('__echoTest.state.level.id')==f'L0{i}')
   # The coordinator receives real commands, never state injection or an oracle agent.
   direct(page,[1,1,1,1,1,2,5,3,3,5,2,2,3,5]);page.wait_for_timeout(150)
   check(f'L0{i} requires gate and receiver preparation',page.locator('dialog[open]').count()==1 and page.evaluate('__echoTest.state.receiverReady'))
   if i==2:
    page.get_by_role('button',name='The delivery',exact=True).click();snap(page,'echo-dock.png')
    page.evaluate("async()=>{document.querySelector('[data-action=practice]').click();await new Promise(r=>setTimeout(r,0));document.querySelector('[data-action=practice]').click();}");page.wait_for_timeout(350)
    check('Practice cancellation preserves previous checkpoint',page.evaluate('!__echoTest.training&&__echoTest.save.cartridges.L02.episodes===0'))
   if i==3:page.get_by_role('button',name='Think ahead',exact=True).click()
   if i==4:page.get_by_role('button',name='Be curious',exact=True).click()
   page.get_by_role('button',name='Practice',exact=True).click();page.wait_for_function('!__echoTest.training',timeout=30000)
   check(f'L0{i} real Worker produces a nonempty policy',page.evaluate('Object.keys(__echoTest.q).length>0'))
   check(f'L0{i} frozen validation delivers cargo',page.evaluate('__echoTest.stats.outcome')=='delivered',page.evaluate('__echoTest.stats'))
   before=page.evaluate('JSON.stringify(__echoTest.q)')
   page.get_by_role('button',name='Send Echo').click();page.wait_for_timeout(300)
   if i==2:snap(page,'AUTHORITATIVE_GAMEPLAY.png')
   page.wait_for_function('__echoTest.state.courierOutcome!==null',timeout=30000)
   check(f'L0{i} visible autonomous run delivers',page.evaluate('__echoTest.state.courierOutcome')=='delivered')
   page.wait_for_timeout(400)
   check(f'L0{i} inference does not mutate learned policy',page.evaluate('JSON.stringify(__echoTest.q)')==before)
   direct(page,[3,3,3,2,2,2,2]) # From dock(5,5) to (9,8).
   if i==3:
    direct(page,[5,2,5,2,5,2,5,2]) # Push crate to (14,8), Patch reaches (13,8).
   elif i==5:direct(page,[2,5,2,2,2,2]) # Collect core from (10,8), then the final lift.
   else:direct(page,[2,2,2,2])
   page.wait_for_timeout(150)
   check(f'L0{i} cooperative objective clears',page.evaluate('__echoTest.state.complete'))
   if i==5:snap(page,'chapter-restored.png')
  check('Exactly five completed missions saved',page.evaluate('__echoTest.save.completed.join(",")')=='L01,L02,L03,L04,L05')
  page.get_by_role('button',name='Back to the district').click();snap(page,'district-restored.png')
  check('Finished prototype does not claim later missions playable',page.get_by_text('The other ten districts are not implemented').count()==1)
  page.get_by_role('button',name='Back to lift').click();page.get_by_role('button',name='Settings').click()
  with page.expect_download() as info:page.get_by_role('button',name='Export save').click()
  download=info.value;download.save_as(ROOT/'evidence/exported-test-save.json');check('Save export produces JSON',json.loads((ROOT/'evidence/exported-test-save.json').read_text())['completed']==['L01','L02','L03','L04','L05'])
  old=page.evaluate('JSON.stringify(__echoTest.save)');page.locator('#import-file').set_input_files({'name':'bad.json','mimeType':'application/json','buffer':b'{"schemaVersion":99}'});page.wait_for_timeout(200)
  check('Invalid import leaves previous progress untouched',page.evaluate('JSON.stringify(__echoTest.save)')==old)
  check('No uncaught application errors',not errors,errors)
  page.set_viewport_size({'width':390,'height':844});page.get_by_role('button',name='Back',exact=True).click();snap(page,'menu-mobile.png')
  check('Menu fits narrow viewport without horizontal overflow',page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'))
  version=browser.version
 except Exception as e:
  print('BROWSER FAILURE',e);page.screenshot(path=str(ROOT/'evidence/browser-failure.png'));traceback.print_exc();errors.append(str(e));version=browser.version
 finally:browser.close()
report={'mode':'Offline Chromium. Actual source modules run in isolated factories; local bytes supplied without network navigation; real classic Blob Worker (module-loader not tested); in-memory storage adapter.','browser':version,'checks':results,'pageErrors':errors,'notTested':['Production module-worker loading from HTTP','Real HTTP-origin localStorage persistence','Live GitHub Pages deployment','Firefox','Safari/iOS','Human listening or playtesting','Real touch hardware','Live HTTP navigation (blocked by environment policy)']}
(ROOT/'evidence/browser-results.json').write_text(json.dumps(report,indent=2))
print('BROWSER',sum(r['passed'] for r in results),'/',len(results),'checks; errors:',errors)
if errors or any(not r['passed'] for r in results):raise SystemExit(1)
