from playwright.sync_api import sync_playwright
from offline_browser import install,factory,ROOT
import re,json
with sync_playwright() as p:
 b=p.chromium.launch(executable_path='/usr/bin/chromium',headless=True,args=['--no-sandbox']);page=b.new_page(viewport={'width':1600,'height':1000});errors=install(page)
 text=(ROOT/'asset-viewer.html').read_text();css=re.search(r'<style>(.*?)</style>',text,re.S).group(1);body=re.search(r'<body>(.*?)<script',text,re.S).group(1)
 page.evaluate('(s)=>{document.head.insertAdjacentHTML("beforeend","<style>"+s.css+"</style>");document.body.innerHTML=s.body}',{'css':css,'body':body})
 page.add_script_tag(content=factory('src/ui/asset-viewer.js'));page.wait_for_function('document.querySelectorAll("#objects .asset").length===24')
 page.select_option('#who','echo');page.select_option('#state','walk');page.select_option('#facing','north');page.wait_for_timeout(600)
 assert page.locator('#strip img').count()==6
 assert 'walk_north' in page.locator('#metadata').inner_text()
 page.get_by_role('button',name='Pause',exact=True).click();assert page.get_by_role('button',name='Play',exact=True).count()==1
 page.screenshot(path=str(ROOT/'evidence/asset-viewer.png'),full_page=True)
 (ROOT/'evidence/asset-viewer.json').write_text(json.dumps({'checks':4,'passed':4,'errors':errors,'mode':'Same offline local-byte/factory adaptation as main browser checks.'},indent=2));assert not errors
 b.close()
print('4 asset-viewer browser checks passed')
