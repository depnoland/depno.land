import { serve } from 'https://deno.land/std/http/server.ts'
import { scanDeps } from './parser/deps-url.ts'

const s = serve({ port: 8000 })

console.log('http://localhost:8000/')

for await (const req of s) {
  const url = new URL(req.url, 'https://localhost:8000')

  switch (url.pathname) {
    case '/api/deps-url': {
      if (req.method !== 'GET') break
      const q = url.searchParams.get('q')
      if (!q) {
        req.respond({ status: 401, body: 'params are not valid' })
        break
      } else {
        req.respond({
          status: 200,
          headers: new Headers({ 'Content-Type': 'application/json' }),
          body: JSON.stringify((await scanDeps(q)).reduce((prev: string[], curr) => [...prev, curr.url], []))
        })
      }
      
      break
    }

    case '/api/doc': {
        if (req.method !== 'GET') break
        const q = url.searchParams.get('q')
        if (!q) {
            req.respond({ status: 401, body: 'params are not valid' })
            break
        }
        //TODO: DADA
      break
    }

    default: {
      req.respond({ status: 404, body: '404 not found' })
    }
  }
}
