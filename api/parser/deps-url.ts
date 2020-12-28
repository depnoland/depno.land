interface Dependancy {
  isScaned: boolean,
  url: string
}

function parseDeps (url: string): Promise<Dependancy[]> {
  // deno-lint-ignore no-async-promise-executor
  return new Promise(async (resolve, reject) => {
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'accept': '*/*', 'user-agent': 'Depno/0.1.0' }
    }).then((res) => res.text()).catch(reject)
    
    if (!response) return
    const deps: Dependancy[] = []

    const sentences = response.split(/;|\n/g)
    for (const index in sentences) {
      const sentence = sentences[index].trim()

      if (!sentence.startsWith('import') && !sentence.startsWith('export')) continue
      for (let i = Number(index); i < sentences.length; i++) {
        const dep = sentence.split(/from ?'|"*'|"/)[1]
        if (!dep) continue
        if (!dep.endsWith('.js') && !dep.endsWith('.ts')) continue
        deps.push({ isScaned: false, url: !dep.startsWith('http://') && !dep.startsWith('https://') ? new URL(dep, url).toString() : dep })
        break
      }
    }

   resolve(deps)
  })
}

async function parseDepsDeep (deps: Dependancy[]): Promise<Dependancy[]> {
  for (const index in deps) {
    if (!deps[index].isScaned) {
      deps[index].isScaned = true
      console.log('Searching: ' + deps[index].url)
      const scaned = (await parseDeps(deps[index].url)).filter((dep) => !deps.find((d) => d.url === dep.url))
      deps.push(...scaned)
    }
  }

  if (deps.filter((dep) => !dep.isScaned).length < 1) return deps
  return await parseDepsDeep(deps)
}

const scanDeps = async (url: string) => (await parseDepsDeep([{isScaned: false, url}]))

export { scanDeps }
export type { Dependancy }
