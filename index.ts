const PORT = Number(Deno.env.get('port')) || 8080
const HOST = Deno.env.get('host') || 'depno.org'
const TOKEN = Deno.env.get('token') || 'depno.land'

import { serve } from "https://deno.land/std@0.154.0/http/server.ts"
import { scanDeps } from 'https://raw.githubusercontent.com/depnoland/depscan/main/mod.ts'
// import { scanDeps } from 'https://deno.land/x/depscan@v0.9.0/mod.ts'

if (!TOKEN) console.log('WARNING: token not provided')
console.log('Server is now on: http://'+ HOST + ':' + PORT)

serve(async (req: Request) => {
  if (req.method !== 'GET') return new Response('not GET method', { status: 401 })
  let url: URL | undefined = undefined
  try {
    url = new URL(req.url, 'http://'+ HOST +':' + PORT)
  } catch (err) { new Response(err.messasge, { status: 401 }) }

  if (!url)  return new Response('not valid', { status: 404 })
  if (url.pathname !== '/api') {
    const str = await Deno.readTextFile('./static/' + url.pathname)
      .catch(() => new Response('path is invalid', { status: 404 }))

    if (!str) return new Response('not static valid', { status: 401 })
    if (typeof str != 'string') return str
    return new Response(str, { status: 200, headers: new Headers({ 'Content-Type': 'text/plain; charset=utf-8' }) })
  }

  const task = url.searchParams.get('task')
  const urls = url.searchParams.get('urls')

  if (!task || !urls) {
    return new Response('search params not valid', { status: 401 })
  }

  if (req.headers.get('Authorization') !== 'Bearer ' + TOKEN) {
    return new Response('Authorization header not valid', { status: 403 })
  }

  switch (task) {
    case 'cache': {
      try {
        let deps = urls.split(';')
        deps = await scanDeps(urls, { recursive: true, debug: false })
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
              if (!dep) continue
              console.log(dep)
              if (!dep.endsWith('.js') && !dep.endsWith('.ts')) continue

              const depurl = new URL(!dep.startsWith('http://') && !dep.startsWith('https://') ? new URL(dep, url.toString()).toString() : dep)
              blob = blob.replace(dep, 'http://' + HOST + ':' + PORT + depurl.pathname)
            }
          }

          await Deno.mkdir('./static' + path.join('/'), { recursive: true })
          await Deno.writeTextFile('./static' + url.pathname, blob)
        }
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
        })
      } catch (_) {
        return new Response(JSON.stringify({ success: true, data: await scanDeps(urls, { recursive: true, debug: true }) }), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
        })
      }
    }

    case 'depscan': {
      try {
        return new Response(JSON.stringify({ success: true, data: await scanDeps(urls, { recursive: true, debug: true }) }), {
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
        })
      } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), {
          status: 502,
          headers: new Headers({ 'Content-Type': 'application/json' }),
        })
      }
    }

    default: {
      return new Response('there is nothing', { status: 404 })
    }
  }
}, { hostname: HOST, port: PORT })
