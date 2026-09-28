import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const root=path.resolve(process.argv[2]??'.');const port=Number(process.env.PORT??4173);
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.mp3':'audio/mpeg','.wav':'audio/wav','.md':'text/plain'};
http.createServer((req,res)=>{try{
 let url=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 // The prefix intentionally exercises a GitHub project-page base path.
 if(url.startsWith('/echo-heist/'))url=url.slice('/echo-heist'.length);
 if(url.endsWith('/'))url+='index.html';const file=path.resolve(root,'.'+url);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{
  'Content-Type':types[path.extname(file)]??'application/octet-stream',
  // Keep the development and preview servers from reusing an older app shell
  // after files change beneath the same localhost URL.
  'Cache-Control':'no-store, max-age=0',
  'Pragma':'no-cache',
  'Expires':'0',
  'X-Content-Type-Options':'nosniff'
 });fs.createReadStream(file).pipe(res);
}catch{res.writeHead(400);res.end('Bad request');}}).listen(port,'127.0.0.1',()=>console.log(`Echo Heist: http://127.0.0.1:${port}/ (root ${root})`));
