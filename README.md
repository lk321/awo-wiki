# awo-ki · la wiki de Amazing World Online

Astro + Starlight **sobre el código del juego**: importa `../awo/shared/` y `../awo/client/src/art/` por ruta relativa y construye sus tablas llamando a las mismas funciones que él. No copia ni un número ni un sprite.

Necesita **Node 22** (hay un `.nvmrc`); con uno más viejo, cada comando te lo dice y para:

```bash
nvm use        # o: export PATH="$HOME/.nvm/versions/node/v22.21.1/bin:$PATH"
npm install
npm run dev     # :4321
npm run shots   # las capturas, con el juego en marcha (ver abajo)
npm run build   # verifica las referencias y compila a dist/
npm run check   # sus pruebas, el verificador de referencias y el typecheck
```

El repositorio del juego tiene que estar en `../awo`.

Las capturas (`npm run shots`) conducen el juego real con Playwright: necesitan `npm run dev` en `../awo` (servidor :2567 y cliente :5180), MongoDB y la cuenta de prueba (`cd ../awo/server && npx tsx scripts/seed-test.ts`). **Cierra el juego en tu navegador antes**: solo se admite una conexión por cuenta.

La documentación completa está en [`../awo/docs/wiki.md`](../awo/docs/wiki.md).
