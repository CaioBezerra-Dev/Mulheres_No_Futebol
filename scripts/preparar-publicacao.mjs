// Gera uma pasta com apenas os arquivos usados pelo site, sem dependências.
// Uso: node scripts/preparar-publicacao.mjs
import { cp, mkdir, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const destino = path.join(raiz, 'dist');
const arquivos = ['index.html', '404.html', 'conteudo.js', 'robots.txt', '.nojekyll', 'vercel.json', 'css', 'js', 'assets'];

await rm(destino, { recursive: true, force: true });
await mkdir(destino, { recursive: true });
for (const arquivo of arquivos) {
  await cp(path.join(raiz, arquivo), path.join(destino, arquivo), {
    recursive: true,
    filter: origem => !['assets/originais', 'assets/fontes/originais'].includes(path.relative(raiz, origem).split(path.sep).join('/')),
  });
}
console.log('Pronto: dist/ contém apenas os arquivos de publicação.');
