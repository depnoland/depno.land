const PORT = Number(Deno.env.get('port')) || 8080
const TOKEN = Deno.env.get('token')

import { serve } from 'https://deno.land/std/http/server.ts'
import { scanDeps } from 'https://deno.land/x/depscan@v0.9.0/mod.ts'

const srv = serve({ port: PORT })
if (!TOKEN) console.log('WARNING: token not provided')
console.log('Server is now on: http://localhost:' + PORT)

for await (const req of srv) {
  if (req.method !== 'GET') continue
  let url: URL | undefined = undefined
  try {
    url = new URL(req.url, 'http://localhost:' + PORT)
  } catch (err) { req.respond({ status: 401, body: err.message }) }

  if (!url) continue
  if (url.pathname !== '/api') {
    const str = await Deno.readTextFile('./static/' + url.pathname)
      .catch((err) => req.respond({ status: 404, body: err.message }))
    
    if (!str) continue
    req.respond({ status: 200, body: str, headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }) })
    continue
  }

  const task = url.searchParams.get('task')
  const urls = url.searchParams.get('urls')

  if (!task || !urls) {
    req.respond({ status: 401, body: 'search params not valid' })
    continue
  }

  if (req.headers.get('Authorization') !== 'Bearer ' + TOKEN) {
    req.respond({ status: 403, body: 'Authorization header not valid' })
    continue
  }

  switch (task) {
    case 'cache': {
      try {
        const deps = urls.split(';')
        for (const dep of deps) {
          const url = new URL(dep)
          const path = url.pathname.split('/')
          path.splice(-1, 1)
          console.log('Download at: ./static' + path.join('/'))
        
          let blob = await fetch(url.toString(), {
            method: 'GET',
            headers: { 'accept': '*/*', 'user-agent': 'Depno/0.1.0' }
          }).then((res) => res.text())
        
          console.log('ㄴdoing code injection...')
          
          const sentences = blob.split(/;|\n/g)
          for (const index in sentences) {
            const sentence = sentences[index].trim()
        
            if (!sentence.startsWith('import') && !sentence.startsWith('export')) continue
            for (let i = Number(index); i < sentences.length; i++) {
              const dep = sentences[i].split(/from ?'|"*'|"/)[1]
              console.log(dep)
              if (!dep) continue
              if (!dep.endsWith('.js') && !dep.endsWith('.ts')) continue
              
              const depurl = new URL(!dep.startsWith('http://') && !dep.startsWith('https://') ? new URL(dep, url.toString()).toString() : dep)
              blob = blob.replace(dep, 'http://localhost:' + PORT + '/' + depurl.pathname)
              break
            }
          }
        
          await Deno.mkdir('./static' + path.join('/'), { recursive: true })
          await Deno.writeTextFile('./static' + url.pathname, blob)
          
          req.respond({
            status: 200,
            headers: new Headers({ 'Content-Type': 'application/json' }),
            body: JSON.stringify({ success: true })
          })
        }
      } catch (err) {
        req.respond({
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ success: true, data: await scanDeps(urls, { recursive: true, debug: true }) })
        })
      }
      break
    }

    case 'depscan': {
      try {
        req.respond({
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ success: true, data: await scanDeps(urls, { recursive: true, debug: true }) })
        })
      } catch (err) {
        req.respond({
          status: 502,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify({ success: false, message: err.message })
        })
      }
      break
    }
  } 
}
