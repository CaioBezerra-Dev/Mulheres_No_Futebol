/* =============================================================================
   BASE — sistema de movimento, utilitários, estado e acesso ao conteúdo.
   ============================================================================= */

export const C = window.CONTEUDO;

/* ---------- Sistema de movimento (espelha css/tokens.css) ---------- */
export const EASE = {
  saida: 'expo.out',
  troca: 'expo.inOut',
  suave: 'power4.out',
  suaveTroca: 'power4.inOut',
  antecipa: 'power2.in',
  passa: 'back.out(1.5)',
  passaLeve: 'back.out(1.15)',
  entrada: 'expo.in',
};
export const DUR = { xs: 0.15, p: 0.3, m: 0.6, g: 0.9, xg: 1.4 };
export const STAGGER = 0.06;

const mqMovimento = window.matchMedia('(prefers-reduced-motion: reduce)');
const mqToque = window.matchMedia('(hover: none), (pointer: coarse)');
export const movimentoReduzido = () => mqMovimento.matches;
export const ehToque = () => mqToque.matches;
export function aoMudarMovimento(cb) { mqMovimento.addEventListener?.('change', cb); }

/* ---------- DOM ---------- */
export const $ = (sel, raiz = document) => raiz.querySelector(sel);
export const $$ = (sel, raiz = document) => Array.from(raiz.querySelectorAll(sel));

export function esc(s = '') {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export function deHTML(html) {
  const t = document.createElement('template');
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

/* ---------- Texto da interface ---------- */
export function fmt(str = '', vars = {}) {
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (k in vars ? vars[k] : `{${k}}`));
}
export function t(chave, vars) {
  return fmt(C.interface?.[chave] ?? chave, vars);
}
export function caminho(obj, rota) {
  return rota.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
}

/* ---------- Números ---------- */
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const aguardar = ms => new Promise(r => setTimeout(r, ms));
export const proximoQuadro = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

/* ---------- Estado persistente (localStorage com try/catch) ---------- */
const CHAVE_LIDAS = 'mulheres-futebol:lidas';
const CHAVE_SOM = 'mulheres-futebol:som';
const memoria = {};
function ler(chave, padrao) {
  try {
    const v = window.localStorage.getItem(chave);
    return v == null ? padrao : JSON.parse(v);
  } catch { return chave in memoria ? memoria[chave] : padrao; }
}
function gravar(chave, valor) {
  memoria[chave] = valor;
  try { window.localStorage.setItem(chave, JSON.stringify(valor)); } catch { /* modo privado ou cheio: segue só na memória */ }
}

const ouvintesLidas = new Set();
export const estado = {
  lidas() { const l = ler(CHAVE_LIDAS, []); return new Set(Array.isArray(l) ? l : []); },
  foiLida(id) { return this.lidas().has(id); },
  marcarLida(id) {
    const l = this.lidas();
    if (l.has(id)) return;
    l.add(id);
    gravar(CHAVE_LIDAS, [...l]);
    ouvintesLidas.forEach(cb => cb(l));
  },
  aoMudarLidas(cb) { ouvintesLidas.add(cb); },
  som() { return ler(CHAVE_SOM, false) === true; },
  definirSom(v) { gravar(CHAVE_SOM, !!v); },
};

/* ---------- Conteúdo ---------- */
export const categorias = () => C.categorias;
export const categoria = id => C.categorias.find(c => c.id === id);
export const categoriaDoObjeto = obj => C.categorias.find(c => c.objeto === obj);
export const historias = () => C.historias;
export const historia = id => C.historias.find(h => h.id === id);
export const historiasDa = catId => C.historias.filter(h => h.categoria === catId);
export const indiceCategoria = catId => C.categorias.findIndex(c => c.id === catId);

export function qtdHistorias(catId) {
  const n = historiasDa(catId).length;
  return n === 1 ? t('historiaUma') : t('historiasVarias', { n });
}

const PALAVRAS_POR_MINUTO = 200;
export function textoPuro(par) {
  return String(par).replace(/\[\[(audio|foto):[^\]]*\]\]/g, '').replace(/\[\[olho:([^|\]]*)(\|[^\]]*)?\]\]/g, '$1').replace(/^##\s*/, '');
}
export function tempoLeitura(h) {
  const palavras = h.texto.map(textoPuro).join(' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(palavras / PALAVRAS_POR_MINUTO));
}

/** Próxima história: a primeira não lida depois desta (em qualquer categoria); se todas lidas, a seguinte da lista. */
export function proximaHistoria(id) {
  const lista = C.historias;
  const i = lista.findIndex(h => h.id === id);
  const lidas = estado.lidas();
  for (let k = 1; k < lista.length; k++) {
    const h = lista[(i + k) % lista.length];
    if (!lidas.has(h.id)) return h;
  }
  return lista[(i + 1) % lista.length];
}

/** Duas sugestões de outras categorias, preferindo as não lidas. */
export function sugestoes(id, n = 2) {
  const atual = historia(id);
  const lidas = estado.lidas();
  const outras = C.categorias.filter(c => c.id !== atual?.categoria);
  const escolhidas = [];
  for (const cat of outras) {
    const da = historiasDa(cat.id);
    const h = da.find(x => !lidas.has(x.id)) || da[0];
    if (h) escolhidas.push(h);
  }
  // completa, se faltar, com qualquer outra
  for (const h of C.historias) {
    if (escolhidas.length >= n) break;
    if (h.id !== id && !escolhidas.includes(h)) escolhidas.push(h);
  }
  return escolhidas.slice(0, n);
}

/* ---------- Imagens ---------- */
/**
 * Gera <picture>. Se `base` não tem extensão, usa o conjunto otimizado do site
 * (base-1x/2x .avif/.webp). Se tem extensão (foto real), usa o arquivo direto.
 */
export function imagem(base, { alt = '', classe = '', lazy = true, prioridade = '', largura, altura, estilo = '' } = {}) {
  const attrs = `${classe ? ` class="${classe}"` : ''} alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async"${prioridade ? ` fetchpriority="${prioridade}"` : ''}${largura ? ` width="${largura}"` : ''}${altura ? ` height="${altura}"` : ''}${estilo ? ` style="${esc(estilo)}"` : ''}`;
  if (/\.(jpe?g|png|webp|avif|gif)$/i.test(base)) {
    return `<picture><img src="${esc(base)}"${attrs}></picture>`;
  }
  return `<picture>
    <source type="image/avif" srcset="${base}-1x.avif 1x, ${base}-2x.avif 2x">
    <img src="${base}-1x.webp" srcset="${base}-2x.webp 2x"${attrs}>
  </picture>`;
}
export const ehFotoProvisoria = base => !/\.(jpe?g|png|webp|avif|gif)$/i.test(base) && base.includes('/retratos/');

export const objetoImg = (obj, tam = '1x') => `assets/img/objetos/${obj}-${tam}.webp`;
export function objetoPicture(obj, { classe = '', lazy = false, mini = false } = {}) {
  if (mini) {
    return `<picture><source type="image/avif" srcset="assets/img/objetos/${obj}-mini.avif"><img${classe ? ` class="${classe}"` : ''} src="assets/img/objetos/${obj}-mini.webp" alt=""${lazy ? ' loading="lazy"' : ''} decoding="async"></picture>`;
  }
  return imagem(`assets/img/objetos/${obj}`, { classe, lazy });
}

export function carregarImagem(src) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = img.onerror = () => resolve(img);
    img.src = src;
  });
}

/* ---------- Linhas com máscara (reveal por linha) ---------- */
/**
 * Quebra o texto de `el` em linhas reais (medidas depois das fontes carregarem)
 * e embrulha cada uma em uma máscara. Retorna os elementos internos para animar.
 */
export function dividirLinhas(el, { forcadas } = {}) {
  const texto = el.dataset.textoOriginal ?? el.textContent.trim();
  el.dataset.textoOriginal = texto;
  el.setAttribute('aria-label', texto.replace(/\s+/g, ' '));
  let linhas;
  if (forcadas) {
    linhas = forcadas;
  } else {
    const palavras = texto.split(/\s+/);
    el.innerHTML = palavras.map(p => `<span class="palavra">${esc(p)}</span>`).join(' ');
    const spans = $$('.palavra', el);
    linhas = [];
    let topo = null;
    spans.forEach(s => {
      const y = Math.round(s.offsetTop);
      if (topo === null || Math.abs(y - topo) > 4) { linhas.push([]); topo = y; }
      linhas[linhas.length - 1].push(s.textContent);
    });
    linhas = linhas.map(l => l.join(' '));
  }
  el.innerHTML = linhas.map(l => `<span class="linha" aria-hidden="true"><span class="linha__in">${esc(l)}</span></span>`).join('');
  return $$('.linha__in', el);
}

/* ---------- Avisos ---------- */
export function anunciar(texto) {
  const a = document.getElementById('anuncio');
  if (!a) return;
  a.textContent = '';
  setTimeout(() => { a.textContent = texto; }, 60);
}

let toastTimer;
export function toast(texto) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = texto;
  el.classList.add('is-visivel');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visivel'), 2800);
}

/* ---------- Pseudo-aleatório com semente (ondas de áudio, confete estável) ---------- */
export function aleatorio(semente = 1) {
  let s = typeof semente === 'string' ? [...semente].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) : semente;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}
