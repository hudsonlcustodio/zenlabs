# GITHUB BOOTSTRAP — hudsonlcustodio/zenlabs

The generated ZIP is repository-root ready.

Recommended local sequence:

```bash
git clone https://github.com/hudsonlcustodio/zenlabs.git
cd zenlabs

# copy the CONTENTS of ZENLABS_FOUNDATION_V2 into this directory

node scripts/foundation/validate.mjs

git add .
git commit -m "chore: seed ZENLABS Foundation V2"
git push -u origin main
```

Then use a branch for Technical Foundation:

```bash
git checkout -b foundation/technical-gate
```

Do not mark the Technical Gate complete until install/lint/typecheck/test/build/fitness are green.
