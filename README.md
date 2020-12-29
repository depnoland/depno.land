# depno.land

![depno banner](docs/depno-banner.png)

> I'm korean, and not good at English. If you find any grammar mistakes, plz open issue or pull request

## introduction

when i was initalizing deno project\
i saw this shi\*\*y thing

![522 errors on cdn.esm.sh](docs/522esmsh.png)

so, we made this,\
the **deep cached dependency mirror**

## features

as you know, many modules are requesting their dependencies from a lot of web servers (like githubusercontent, cdn.esm.sh, deno.land...)

it's okay when all of deps servers works well,\
but if one of these web servers dead and you don't have any cache, \*hell gate opens\*

so we are trying to make following features:

### deep caching

you can request caching with our website.\
automated system will scan requested code, check dependencies and download all of dependencies recursively.

### deps url injection

when deep caching finishes, we will inject code's dependencies url to our mirror url.\
so if you import our cached module, deno will use one web server(our mirror)

### automated documentation

yeah we know, "doc.deno.land" is not good\
maybe we can make better automated-docs site

## license

Copyright 2020 **depno.land** collaborators.\
See [LICENCE](LICENSE) to more infomation.
