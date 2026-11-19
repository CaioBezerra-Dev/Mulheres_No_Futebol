// Otimiza as fotos e os áudios reais da reportagem e gera js/midia.js.
//
// Uso:
//   NODE_PATH=/pasta/com/node_modules FFMPEG=/caminho/do/ffmpeg node scripts/otimizar-midia.mjs [--forcar]
//
// Precisa do sharp (npm) e do ffmpeg com libopus. Instale o sharp fora do projeto, por exemplo:
//   npm install --prefix ~/.cache/midia-reportagem sharp
//   NODE_PATH=~/.cache/midia-reportagem/node_modules node scripts/otimizar-midia.mjs
//
// Entradas (ficam fora do Git, em assets/originais/):
//   fotos/<id-da-historia>/<nome>.jpg|png|webp|tif   uma pasta por história
//   audio/<id-da-historia>.m4a|mp3|wav|...            um trecho por história
// Saídas:
//   assets/fotos/<id>/<nome>-<largura>.avif           640, 1080 e 1600 px (sem ampliar)
//   assets/fotos/<id>/<nome>-<largura>.webp           uma reserva para navegadores sem AVIF
//   assets/audio/<id>.webm (Opus) e <id>.m4a (AAC)    volume uniformizado
//   js/midia.js                                       proporções, cor de fundo, duração e onda
//
// O manifesto é montado a partir dos arquivos gerados. Sem os originais, o script só o refaz.
import { createRequire } from 'node:module';
import { readdir, mkdir, stat, writeFile, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
let sharp;
try { sharp = require('sharp'); } catch {
  console.error('Não encontrei o sharp. Instale com "npm install --prefix ~/.cache/midia-reportagem sharp"\ne rode com NODE_PATH=~/.cache/midia-reportagem/node_modules.');
  process.exit(1);
}
const FFMPEG = process.env.FFMPEG || 'ffmpeg';
const raiz = fileURLToPath(new URL('../', import.meta.url));
const forcar = process.argv.includes('--forcar');

// Fotos deitadas chegam a 1600 px (ocupam a coluna inteira); as em pé param em 1080 px,
// porque no texto a altura delas é limitada pela tela. O degrau de 800 px atende celulares
// de densidade 3, que recebem o equivalente a ~2x (veja TAMANHOS em js/base.js).
const LARGURAS = { deitada: [640, 800, 1080, 1600], em_pe: [640, 800, 1080] };
const RESERVA = 800; // reserva em WebP para navegadores sem AVIF (poucos): menor de propósito
// Qualidade 50 no AVIF: num recorte ampliado, igual ao original a olho nu e com quase metade do peso de 58.
const AVIF = { quality: 50, effort: 6 };
const WEBP = { quality: 78, effort: 6, smartSubsample: true };
// Bordas a remover (em px) quando a foto original chega com faixa ou moldura.
const RECORTES = {
  'edina-alves/copa-do-mundo-2019': { topo: 14 },   // faixa preta no alto do arquivo recebido
};
const ALVO_LUFS = -17;          // volume integrado dos trechos
const LIMITE = 0.84;            // ≈ -1,5 dBFS de pico
const BARRAS = 64;              // resolução da onda guardada no manifesto

const ORIG_FOTOS = path.join(raiz, 'assets/originais/fotos');
const ORIG_AUDIO = path.join(raiz, 'assets/originais/audio');
const SAIDA_FOTOS = path.join(raiz, 'assets/fotos');
const SAIDA_AUDIO = path.join(raiz, 'assets/audio');

const existe = async p => { try { return await stat(p); } catch { return null; } };
const listar = async p => { try { return await readdir(p, { withFileTypes: true }); } catch { return []; } };
const slug = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const kb = n => `${(n / 1024).toFixed(0)} KB`;

async function atualizado(destino, origem) {
  if (forcar) return false;
  const [d, o] = await Promise.all([existe(destino), existe(origem)]);
  return !!(d && o && d.mtimeMs >= o.mtimeMs);
}

function rodar(args, { saidaBinaria = false } = {}) {
  return new Promise((ok, erro) => {
    const p = spawn(FFMPEG, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const out = [], err = [];
    p.stdout.on('data', d => out.push(d));
    p.stderr.on('data', d => err.push(d));
    p.on('error', erro);
    p.on('close', code => {
      const stderr = Buffer.concat(err).toString();
      if (code !== 0) return erro(new Error(`ffmpeg saiu com ${code}:\n${stderr.slice(-1500)}`));
      ok({ stdout: saidaBinaria ? Buffer.concat(out) : Buffer.concat(out).toString(), stderr });
    });
  });
}

/* =============================== FOTOS =============================== */
async function processarFotos() {
  let geradas = 0;
  for (const pasta of (await listar(ORIG_FOTOS)).filter(d => d.isDirectory())) {
    const id = slug(pasta.name);
    const destinoDir = path.join(SAIDA_FOTOS, id);
    await mkdir(destinoDir, { recursive: true });
    const esperados = new Map();
    for (const arq of (await readdir(path.join(ORIG_FOTOS, pasta.name))).filter(f => /\.(jpe?g|png|webp|tiff?)$/i.test(f)).sort()) {
      const origem = path.join(ORIG_FOTOS, pasta.name, arq);
      const nome = slug(arq.replace(/\.[^.]+$/, ''));
      const meta = await sharp(origem, { failOn: 'none' }).metadata();
      const girada = (meta.orientation || 1) >= 5;
      const corte = { topo: 0, base: 0, esquerda: 0, direita: 0, ...RECORTES[`${id}/${nome}`] };
      const [l0, a0] = girada ? [meta.height, meta.width] : [meta.width, meta.height];
      const largura = l0 - corte.esquerda - corte.direita, altura = a0 - corte.topo - corte.base;
      const escada = altura > largura ? LARGURAS.em_pe : LARGURAS.deitada;
      const topo = Math.min(largura, escada.at(-1));
      const larguras = [...escada.filter(w => w < topo * 0.88), topo];
      const reserva = Math.min(RESERVA, topo);
      const alvos = [...larguras.map(w => [w, 'avif']), [reserva, 'webp']];
      esperados.set(nome, new Set(alvos.map(([w, f]) => `${nome}-${w}.${f}`)));
      for (const [w, formato] of alvos) {
        const destino = path.join(destinoDir, `${nome}-${w}.${formato}`);
        if (await atualizado(destino, origem)) continue;
        // rotate() aplica a orientação do EXIF; a saída sai em sRGB e sem metadados (sem GPS).
        let p = sharp(origem, { failOn: 'none' }).rotate();
        if (largura !== l0 || altura !== a0) p = p.extract({ left: corte.esquerda, top: corte.topo, width: largura, height: altura });
        p = p.resize({ width: w, withoutEnlargement: true }).toColourspace('srgb');
        p = formato === 'avif' ? p.avif(AVIF) : p.webp(WEBP);
        const info = await p.toFile(destino);
        geradas++;
        console.log(`  ${id}/${nome}-${w}.${formato}  ${info.width}×${info.height}  ${kb(info.size)}`);
      }
    }
    // remove larguras antigas de fotos que ainda têm original
    for (const arq of await readdir(destinoDir)) {
      const m = arq.match(/^(.+)-(\d+)\.(avif|webp)$/);
      if (m && esperados.has(m[1]) && !esperados.get(m[1]).has(arq)) {
        await unlink(path.join(destinoDir, arq));
        console.log(`  removido (largura antiga): ${id}/${arq}`);
      }
    }
  }
  return geradas;
}

async function manifestoFotos() {
  const fotos = {};
  for (const pasta of (await listar(SAIDA_FOTOS)).filter(d => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const grupos = new Map();
    for (const arq of (await readdir(path.join(SAIDA_FOTOS, pasta.name))).sort()) {
      const m = arq.match(/^(.+)-(\d+)\.(avif|webp)$/);
      if (!m) continue;
      const g = grupos.get(m[1]) || { avif: [], webp: [] };
      g[m[3]].push(Number(m[2]));
      grupos.set(m[1], g);
    }
    for (const [nome, g] of grupos) {
      if (!g.avif.length || !g.webp.length) { console.warn(`  aviso: ${pasta.name}/${nome} sem AVIF ou WebP, ficou de fora`); continue; }
      g.avif.sort((a, b) => a - b);
      const maior = path.join(SAIDA_FOTOS, pasta.name, `${nome}-${g.avif.at(-1)}.avif`);
      const menor = path.join(SAIDA_FOTOS, pasta.name, `${nome}-${g.avif[0]}.avif`);
      const { width, height } = await sharp(maior).metadata();
      // cor média, um pouco escurecida: fundo enquanto a foto carrega
      const { channels } = await sharp(menor).resize(48).removeAlpha().stats();
      const cor = `#${channels.slice(0, 3).map(c => Math.round(c.mean * 0.8).toString(16).padStart(2, '0')).join('')}`;
      fotos[`assets/fotos/${pasta.name}/${nome}`] = { l: width, a: height, avif: g.avif, webp: Math.max(...g.webp), cor };
    }
  }
  return fotos;
}

/* =============================== ÁUDIOS =============================== */
async function processarAudios() {
  let gerados = 0;
  await mkdir(SAIDA_AUDIO, { recursive: true });
  for (const arq of (await listar(ORIG_AUDIO)).filter(d => d.isFile() && /\.(m4a|mp4|mp3|wav|aac|ogg|opus|flac|webm|caf)$/i.test(d.name))) {
    const origem = path.join(ORIG_AUDIO, arq.name);
    const id = slug(arq.name.replace(/\.[^.]+$/, ''));
    const webm = path.join(SAIDA_AUDIO, `${id}.webm`), m4a = path.join(SAIDA_AUDIO, `${id}.m4a`);
    if (await atualizado(webm, origem) && await atualizado(m4a, origem)) continue;
    // 1) mede o volume integrado (EBU R128)
    const { stderr } = await rodar(['-hide_banner', '-nostats', '-i', origem, '-af', 'loudnorm=print_format=json', '-f', 'null', '-']);
    const medida = JSON.parse(stderr.slice(stderr.lastIndexOf('{'), stderr.lastIndexOf('}') + 1));
    const ganho = (ALVO_LUFS - Number(medida.input_i)).toFixed(2);
    // 2) ganho linear até o alvo, limitador só nos picos, corte de graves (vento, manuseio) e fades curtos contra estalos
    const filtro = [
      'highpass=f=70',
      `volume=${ganho}dB`,
      `alimiter=limit=${LIMITE}:attack=4:release=60:level=false`,
      'afade=t=in:d=0.03', 'areverse', 'afade=t=in:d=0.06', 'areverse',
    ].join(',');
    const comum = ['-hide_banner', '-loglevel', 'error', '-y', '-i', origem, '-map', '0:a:0', '-af', filtro, '-ac', '1', '-map_metadata', '-1'];
    await rodar([...comum, '-ar', '48000', '-c:a', 'libopus', '-b:a', '40k', '-vbr', 'on', '-compression_level', '10', '-application', 'audio', webm]);
    await rodar([...comum, '-ar', '44100', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', m4a]);
    gerados++;
    const [a, b, c] = await Promise.all([stat(origem), stat(webm), stat(m4a)]);
    console.log(`  ${id}: ${medida.input_i} LUFS → ${ALVO_LUFS} (${ganho > 0 ? '+' : ''}${ganho} dB)  original ${kb(a.size)} · opus ${kb(b.size)} · aac ${kb(c.size)}`);
  }
  return gerados;
}

async function manifestoAudios() {
  const audios = {};
  const arquivos = (await listar(SAIDA_AUDIO)).filter(d => d.isFile()).map(d => d.name);
  for (const nome of arquivos.filter(n => n.endsWith('.webm')).sort()) {
    const id = nome.slice(0, -5);
    if (!arquivos.includes(`${id}.m4a`)) { console.warn(`  aviso: ${id}.m4a não existe; o áudio ficou de fora do manifesto`); continue; }
    const { stdout } = await rodar(['-hide_banner', '-loglevel', 'error', '-i', path.join(SAIDA_AUDIO, nome), '-ac', '1', '-ar', '8000', '-f', 'f32le', '-'], { saidaBinaria: true });
    const amostras = new Float32Array(stdout.buffer, stdout.byteOffset, Math.floor(stdout.length / 4));
    const porBarra = Math.max(1, Math.floor(amostras.length / BARRAS));
    const rms = Array.from({ length: BARRAS }, (_, i) => {
      let s = 0;
      for (let k = i * porBarra; k < (i + 1) * porBarra && k < amostras.length; k++) s += amostras[k] ** 2;
      return Math.sqrt(s / porBarra);
    });
    const db = rms.map(v => Math.max(0, 1 + 20 * Math.log10(v + 1e-9) / 30)); // escala de 30 dB: -30 dB → 0
    const max = Math.max(...db) || 1;
    audios[id] = { dur: Math.round((amostras.length / 8000) * 100) / 100, onda: db.map(v => Math.round((v / max) * 100) / 100) };
  }
  return audios;
}

/* =============================== EXECUÇÃO =============================== */
const temFotos = (await listar(ORIG_FOTOS)).length > 0, temAudios = (await listar(ORIG_AUDIO)).length > 0;
if (!temFotos && !temAudios) console.log('Sem originais em assets/originais/: só o manifesto será refeito a partir dos arquivos já gerados.');
console.log('Fotos:');
const nf = temFotos ? await processarFotos() : 0;
console.log(nf ? `  ${nf} arquivo(s) gerado(s)` : '  nada novo');
console.log('Áudios:');
const na = temAudios ? await processarAudios() : 0;
console.log(na ? `  ${na} trecho(s) gerado(s)` : '  nada novo');

const fotos = await manifestoFotos();
const audios = await manifestoAudios();
const linhas = obj => Object.entries(obj).map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`).join('\n');
await writeFile(path.join(raiz, 'js/midia.js'), `/* Gerado por scripts/otimizar-midia.mjs a partir de assets/fotos e assets/audio.
   Não edite à mão: rode o script de novo depois de trocar fotos ou áudios.
   FOTOS: l × a = proporção, avif = larguras geradas, webp = largura da reserva, cor = fundo enquanto carrega.
   AUDIOS: dur = duração em segundos, onda = volume ao longo do trecho (0 a 1). */
export const FOTOS = {
${linhas(fotos)}
};

export const AUDIOS = {
${linhas(audios)}
};
`);
console.log(`Manifesto js/midia.js: ${Object.keys(fotos).length} foto(s), ${Object.keys(audios).length} áudio(s).`);
