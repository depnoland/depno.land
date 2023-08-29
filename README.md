# depno.land

![depno banner](docs/depno-banner.png)

## introduction

when i was initalizing deno project

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

## license

Copyright 2020~2023 **depno.land** collaborators.\
See [LICENCE](LICENSE) to more infomation.
