const url = 'https://raw.githubusercontent.com/harmony-org/harmony/main/mod.ts'
const deps: string[] = await fetch('http://localhost:8000/api/deps-url?q=' + url).then((res) => res.json())

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
      const dep = sentence.split(/from ?'|"*'|"/)[1]
      if (!dep) continue
      if (!dep.endsWith('.js') && !dep.endsWith('.ts')) continue
      
      const depurl = new URL(!dep.startsWith('http://') && !dep.startsWith('https://') ? new URL(dep, url.toString()).toString() : dep)
      blob = blob.replace(dep, 'http://localhost:5500/deps-server/static' + depurl.pathname)
      break
    }
  }

  await Deno.mkdir('./static' + path.join('/'), { recursive: true })
  await Deno.writeTextFile('./static' + url.pathname, blob)
}
