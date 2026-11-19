/* =============================================================================
   TRANSIÇÕES — coreografias entre telas.
   objeto      capa → aba: o objeto vem ao centro, a câmera aproxima, um círculo
               verde nasce dele e a aba branca vem logo atrás; o objeto pousa no
               cabeçalho (antecipação, overshoot, assentamento).
   objetoVolta o inverso, com o zoom saindo.
   circuloAtor troca de aba pelo dock (mesma ideia, mais curta).
   flip        card → história: o card cresce até a tela cheia e assenta na foto.
   flipVolta   história → aba, a foto volta para o card.
   listras     sobre / abertura / 404: listras de gramado, como um cortador.
   circulo     genérico, a partir de um ponto.
   fade        movimento reduzido.
   ============================================================================= */
import { $, EASE, DUR, movimentoReduzido } from './base.js';
import { rolagem } from './efeitos.js';

const camada = $('#transicao');
const circulo = $('.transicao__circulo', camada);
const listrasEl = $('.transicao__listras', camada);
listrasEl.innerHTML = Array.from({ length: 7 }, () => '<i></i>').join('');
const listras = [...listrasEl.children];

let palco = null; // retângulo de tela cheia para Flip.fit
function retanguloTela() {
  if (!palco) {
    palco = document.createElement('div');
    palco.className = 'palco-flip';
    palco.setAttribute('aria-hidden', 'true');
    document.body.appendChild(palco);
  }
  return palco;
}

const W = () => window.innerWidth;
const H = () => window.innerHeight;
const raio = (x, y) => Math.hypot(Math.max(x, W() - x), Math.max(y, H() - y)) + 6;
const centro = r => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });
const circ = (r, x, y) => `circle(${r}px at ${x}px ${y}px)`;

let POUSO = 'expo.out';
/** expo.out com um leve passo além do alvo e assentamento: o "pouso" do objeto. */
export function prepararEases() {
  if (!window.CustomEase) return;
  window.CustomEase.create('pouso', 'M0,0 C0.11,0.62 0.22,1.035 0.48,1.028 0.72,1.02 0.84,1 1,1');
  POUSO = 'pouso';
}

/* ---------------- utilidades de camada ---------------- */
function ativarCamada(z = 12) {
  camada.style.zIndex = String(z);
  camada.classList.add('is-ativa');
}
function desativarCamada() {
  camada.classList.remove('is-ativa');
  camada.style.zIndex = '';
  gsap.set(circulo, { clearProps: 'clipPath,opacity,visibility,backgroundColor' });
  gsap.set(listras, { clearProps: 'transform' });
}

function criarAtor(src, r, { foto = false, posicao = '' } = {}) {
  const a = document.createElement('div');
  a.className = foto ? 'ator ator--foto' : 'ator';
  a.setAttribute('aria-hidden', 'true');
  a.style.cssText = `left:${r.left}px;top:${r.top}px;width:${r.width}px;height:${r.height}px;`;
  const img = new Image();
  img.alt = '';
  img.decoding = 'async';
  img.src = src;
  if (posicao) img.style.objectPosition = posicao;
  a.appendChild(img);
  document.body.appendChild(a);
  return a;
}

/**
 * Ator criado já no MAIOR tamanho que vai atingir no voo e encolhido por scale.
 * Assim o navegador rasteriza grande e só reduz: nada pixela quando cresce.
 * k = maior escala do voo em relação ao tamanho inicial (w × h).
 */
function criarAtorEscalado(src, c, w, h, k) {
  const W2 = w * k, H2 = h * k;
  const a = criarAtor(src, { left: c.x - W2 / 2, top: c.y - H2 / 2, width: W2, height: H2 });
  gsap.set(a, { scale: 1 / k });
  return a;
}

/**
 * Versão 2x do objeto para o ator, para não pixelar ao crescer, no mesmo formato que o
 * navegador já usa (AVIF quando há suporte, menos da metade do WebP). Se a imagem
 * na tela já é a 2x (celulares), reaproveita o arquivo baixado.
 */
export function srcObjeto2x(obj, atual = '') {
  if (!obj) return atual;
  if (/-2x\.(avif|webp)$/.test(atual)) return atual;
  return `assets/img/objetos/${obj}-2x.${/\.avif$/.test(atual) ? 'avif' : 'webp'}`;
}

/** Tamanho "de layout" de um elemento (sem transformações) + centro visual. */
function medir(el) {
  const r = el.getBoundingClientRect();
  const c = centro(r);
  const w = el.offsetWidth || r.width, h = el.offsetHeight || r.height;
  return { r, c, w, h };
}

/* =========================================================================
   CAPA → ABA
   ========================================================================= */
export function objeto({ de, para, origem, capa, aoCobrir }) {
  const objetoEl = origem?.closest?.('.objeto') || capa.objetoDaCategoria(para.categoria.id);
  if (!objetoEl) return circulo_({ de, para, origem, aoCobrir });
  const img = objetoEl.querySelector('.objeto__img');
  const r0 = img.getBoundingClientRect();
  const c0 = centro(r0);
  const alvo = para.alvoObjeto;
  const m1 = medir(alvo);
  const rotAlvo = gsap.getProperty(para.objetoWrap, 'rotation') || 0;

  const escalaCentro = (Math.min(W(), H()) * 0.44) / Math.max(r0.width, r0.height);
  const k = Math.max(escalaCentro * 1.06, 1);
  const escalaFinal = m1.w / r0.width;
  const ator = criarAtorEscalado(srcObjeto2x(para.categoria.objeto, img.currentSrc), c0, r0.width, r0.height, k);
  gsap.set(img, { autoAlpha: 0 });
  gsap.set(alvo, { autoAlpha: 0 });

  const cx = W() / 2, cy = H() / 2, R = raio(cx, cy);
  de.el.style.zIndex = '11';
  para.el.style.zIndex = '13';
  ativarCamada(12);
  gsap.set(circulo, { clipPath: circ(0, cx, cy), autoAlpha: 1 });
  gsap.set(para.el, { clipPath: circ(0, cx, cy) });

  const tl = gsap.timeline();
  tl.add(capa.saida(objetoEl), 0)
    // antecipação: encolhe e gira para trás antes do salto
    .to(ator, { scale: 0.84 / k, rotation: -10, duration: 0.24, ease: EASE.antecipa }, 0)
    // vem ao centro (posição com expo, escala com overshoot)
    .to(ator, { x: cx - c0.x, y: cy - c0.y, duration: 0.9, ease: EASE.saida }, 0.22)
    .to(ator, { scale: escalaCentro / k, rotation: 6, duration: 1, ease: 'back.out(1.45)' }, 0.22)
    // a câmera aproxima do ponto onde o objeto estava
    .add(capa.cena.zoom({ x: c0.x, y: c0.y, escala: 1.42, duracao: 1.35, ease: EASE.troca }), 0.1)
    // círculo verde nasce do objeto; a aba branca vem logo atrás
    .to(circulo, { clipPath: circ(R, cx, cy), duration: 1, ease: EASE.troca }, 0.62)
    .to(para.el, { clipPath: circ(R, cx, cy), duration: 1, ease: EASE.troca }, 0.84)
    .add(aoCobrir, 1.2)
    // pouso no cabeçalho da aba
    .to(ator, { x: m1.c.x - c0.x, y: m1.c.y - c0.y, scale: escalaFinal / k, rotation: rotAlvo, duration: 1.05, ease: POUSO }, 1.36)
    .add(para.entrar(), 1.4)
    .set(alvo, { autoAlpha: 1 }, 2.42)
    .add(() => ator.remove(), 2.42);
  return tl.then(() => {
    gsap.set(img, { autoAlpha: 1 });
    desativarCamada();
  });
}

/* =========================================================================
   ABA → CAPA (o inverso, com o zoom saindo)
   ========================================================================= */
export function objetoVolta({ de, para: capaT, capa, aoCobrir, yDe = 0 }) {
  const cat = de.categoria;
  const objetoEl = capa.objetoDaCategoria(cat.id);
  const img = objetoEl.querySelector('.objeto__img');
  capa.estadoFinal();
  capa.prepararVolta(objetoEl);
  const r0 = img.getBoundingClientRect();
  const c0 = centro(r0);
  const alvoAba = de.alvoObjeto;
  const mA = medir(alvoAba);
  const rotA = gsap.getProperty(de.objetoWrap, 'rotation') || 0;

  // ator nasce do tamanho de layout do objeto da aba, centrado no lugar dele (rasterizado no maior tamanho)
  const escalaCentro = (Math.min(W(), H()) * 0.44) / Math.max(mA.w, mA.h);
  const k = Math.max(escalaCentro * 1.04, 1);
  const ator = criarAtorEscalado(srcObjeto2x(cat.objeto, img.currentSrc), mA.c, mA.w, mA.h, k);
  gsap.set(ator, { rotation: rotA });
  gsap.set(img, { autoAlpha: 0 });
  gsap.set(alvoAba, { autoAlpha: 0 });

  const cx = W() / 2, cy = H() / 2, R = raio(cx, cy);
  capa.cena.definirZoom({ x: c0.x, y: c0.y, escala: 1.42 });
  capaT.el.style.zIndex = '11';
  de.el.style.zIndex = '13';
  ativarCamada(12);
  gsap.set(circulo, { clipPath: circ(R, cx, cy), autoAlpha: 1 });
  gsap.set(de.el, { clipPath: circ(R, cx, cy + yDe) });

  const tl = gsap.timeline();
  tl.to(ator, { x: cx - mA.c.x, y: cy - mA.c.y, scale: escalaCentro / k, rotation: -5, duration: 0.8, ease: EASE.troca }, 0)
    .to(de.el, { clipPath: circ(0, cx, cy + yDe), duration: 0.9, ease: EASE.troca }, 0.12)
    .to(circulo, { clipPath: circ(0, cx, cy), duration: 0.9, ease: EASE.troca }, 0.3)
    .add(aoCobrir, 0.55)
    .add(capa.cena.voltarZoom({ duracao: 1.6, ease: EASE.saida }), 0.78)
    .to(ator, { x: c0.x - mA.c.x, y: c0.y - mA.c.y, scale: r0.width / mA.w / k, rotation: 0, duration: 1.1, ease: 'back.out(1.3)' }, 0.86)
    .add(capa.entradaVolta(objetoEl), 0.95)
    .set(img, { autoAlpha: 1 }, 1.96)
    .add(() => ator.remove(), 1.96);
  return tl.then(() => desativarCamada());
}

/* =========================================================================
   TROCA DE ABA (dock / convite): o objeto sai do ícone e pousa no cabeçalho
   ========================================================================= */
export function circuloAtor({ de, para, origem, aoCobrir }) {
  const fonte = origem?.closest?.('.dock__item, .convite__item') || document.querySelector(`.dock__item[data-dock="${para.categoria.id}"]`);
  const imgF = fonte?.querySelector('img');
  if (!imgF || !imgF.getBoundingClientRect().width) return circulo_({ de, para, origem, aoCobrir });
  const r0 = imgF.getBoundingClientRect();
  const c0 = centro(r0);
  const R = raio(c0.x, c0.y);
  const alvo = para.alvoObjeto;
  const m1 = medir(alvo);
  const rotAlvo = gsap.getProperty(para.objetoWrap, 'rotation') || 0;
  const k = Math.max(m1.w / r0.width, 1.5);
  const ator = criarAtorEscalado(srcObjeto2x(para.categoria.objeto, imgF.currentSrc), c0, r0.width, r0.height, k);
  gsap.set(alvo, { autoAlpha: 0 });
  gsap.set(imgF, { autoAlpha: 0 });

  de.el.style.zIndex = '11';
  para.el.style.zIndex = '13';
  ativarCamada(12);
  gsap.set(circulo, { clipPath: circ(0, c0.x, c0.y), autoAlpha: 1 });
  gsap.set(para.el, { clipPath: circ(0, c0.x, c0.y) });

  const tl = gsap.timeline();
  tl.to(ator, { scale: 0.8 / k, rotation: -12, duration: 0.16, ease: EASE.antecipa }, 0)
    .to(ator, { scale: 1.5 / k, rotation: 8, duration: 0.42, ease: 'back.out(2.2)' }, 0.16)
    .to(circulo, { clipPath: circ(R, c0.x, c0.y), duration: 0.85, ease: EASE.troca }, 0.12)
    .to(para.el, { clipPath: circ(R, c0.x, c0.y), duration: 0.85, ease: EASE.troca }, 0.28)
    .add(aoCobrir, 0.62)
    .to(ator, { x: m1.c.x - c0.x, y: m1.c.y - c0.y, scale: m1.w / r0.width / k, rotation: rotAlvo, duration: 1, ease: POUSO }, 0.42)
    .add(para.entrar(), 0.7)
    .set(alvo, { autoAlpha: 1 }, 1.42)
    .add(() => ator.remove(), 1.42);
  return tl.then(() => { gsap.set(imgF, { autoAlpha: 1 }); desativarCamada(); });
}

/* =========================================================================
   CARD → HISTÓRIA (FLIP: cresce até a tela cheia e assenta na foto)
   ========================================================================= */
export function flip({ de, para, origem, aoCobrir }) {
  const fonte = origem?.closest?.('.card, .sugestao') || de.cardDe?.(para.historia.id);
  const fig = fonte?.querySelector('[data-flip-foto], .sugestao__foto');
  const imgF = fig?.querySelector('img');
  if (!imgF) return circulo_({ de, para, origem, aoCobrir });
  const r0 = fig.getBoundingClientRect();
  const hero = para.fotoHero;
  const heroImg = hero.querySelector('img');
  const raioCard = parseFloat(getComputedStyle(fig).borderTopLeftRadius) || 0;
  const raioHero = parseFloat(getComputedStyle(hero).borderTopLeftRadius) || 0;
  // A foto do card já está carregada: o voo começa na hora e não baixa outro arquivo
  // (a foto da história ainda nem escolheu qual tamanho vai usar neste momento).
  const ator = criarAtor(imgF.currentSrc || heroImg.currentSrc || heroImg.src, r0, { foto: true, posicao: heroImg.style.objectPosition });
  gsap.set(ator, { borderRadius: raioCard });
  gsap.set(hero, { autoAlpha: 0 });
  gsap.set(fig, { autoAlpha: 0 });

  de.el.style.zIndex = '11';
  para.el.style.zIndex = '13';
  gsap.set(para.el, { autoAlpha: 0 });

  const tela = retanguloTela();
  const tl = gsap.timeline();
  tl.add(Flip.fit(ator, tela, { duration: 0.9, ease: EASE.troca, scale: false }), 0)
    .to(ator, { borderRadius: 0, duration: 0.9, ease: EASE.troca }, 0)
    .to(ator.firstChild, { scale: 1.06, duration: 0.9, ease: EASE.troca }, 0)
    .add(aoCobrir, 0.85)
    .set(para.el, { autoAlpha: 1 }, 0.92)
    .add(() => {
      // mede o destino só agora, já com a história no lugar
      const f = Flip.fit(ator, hero, { duration: 0.95, ease: EASE.saida, scale: false });
      gsap.to(ator, { borderRadius: raioHero, duration: 0.95, ease: EASE.saida });
      gsap.to(ator.firstChild, { scale: 1.04, duration: 0.95, ease: EASE.saida });
      return f;
    }, 0.95)
    .add(para.entrar(), 1)
    .set(hero, { autoAlpha: 1 }, 1.92)
    .add(() => ator.remove(), 1.94);
  return tl.then(() => { gsap.set(fig, { autoAlpha: 1 }); });
}

/* =========================================================================
   HISTÓRIA → ABA (a foto volta para o card)
   ========================================================================= */
export function flipVolta({ de, para, aoCobrir }) {
  const hero = de.fotoHero;
  const heroImg = hero.querySelector('img');
  const card = para.cardDe(de.historia.id);
  const fig = card?.querySelector('[data-flip-foto]');
  if (!fig) return circuloAtor({ de, para, aoCobrir });
  // rola a aba até o card ficar no meio da tela
  const rc = fig.getBoundingClientRect();
  const alvoY = Math.max(0, rc.top + rolagem.y() - (H() - rc.height) / 2);
  rolagem.para(alvoY, { imediato: true });
  const r0 = hero.getBoundingClientRect();
  const raioCard = parseFloat(getComputedStyle(fig).borderTopLeftRadius) || 0;
  const ator = criarAtor(heroImg.currentSrc || heroImg.src, r0, { foto: true, posicao: heroImg.style.objectPosition });
  gsap.set(ator, { borderRadius: getComputedStyle(hero).borderTopLeftRadius });
  gsap.set(hero, { autoAlpha: 0 });
  gsap.set(fig, { autoAlpha: 0 });
  para.el.style.zIndex = '11';
  de.el.style.zIndex = '13';
  const tl = gsap.timeline();
  tl.to(de.el, { autoAlpha: 0, duration: 0.55, ease: 'power2.out' }, 0.05)
    .add(aoCobrir, 0.3)
    .add(Flip.fit(ator, fig, { duration: 1, ease: EASE.troca, scale: false }), 0)
    .to(ator, { borderRadius: raioCard, duration: 1, ease: EASE.troca }, 0)
    .set(fig, { autoAlpha: 1 }, 1)
    .add(() => ator.remove(), 1.02);
  return tl;
}

/* =========================================================================
   CÍRCULO GENÉRICO (de um ponto)
   ========================================================================= */
function circulo_({ de, para, origem, aoCobrir, capa }) {
  let c = { x: W() / 2, y: H() / 2 };
  const fonte = origem?.getBoundingClientRect?.();
  if (fonte && fonte.width) c = centro(fonte);
  const R = raio(c.x, c.y);
  de.el.style.zIndex = '11';
  para.el.style.zIndex = '13';
  ativarCamada(12);
  gsap.set(circulo, { clipPath: circ(0, c.x, c.y), autoAlpha: 1 });
  gsap.set(para.el, { clipPath: circ(0, c.x, c.y) });
  const tl = gsap.timeline();
  tl.to(circulo, { clipPath: circ(R, c.x, c.y), duration: 0.85, ease: EASE.troca }, 0)
    .to(para.el, { clipPath: circ(R, c.x, c.y), duration: 0.85, ease: EASE.troca }, 0.17)
    .add(aoCobrir, 0.55);
  if (para.tipo === 'capa') { capa.prepararIntro(); tl.add(capa.intro(), 0.5); }
  else tl.add(para.entrar(), 0.55);
  return tl.then(() => desativarCamada());
}
export { circulo_ as circulo };

/* =========================================================================
   VOLTA GENÉRICA À CAPA: a tela se fecha no centro e o estádio se afasta
   ========================================================================= */
export function circuloVolta({ de, para: capaT, capa, aoCobrir, yDe = 0 }) {
  const cx = W() / 2, cy = H() / 2, R = raio(cx, cy);
  capa.prepararIntro();
  capaT.el.style.zIndex = '11';
  de.el.style.zIndex = '13';
  ativarCamada(12);
  gsap.set(circulo, { clipPath: circ(R, cx, cy), autoAlpha: 1 });
  gsap.set(de.el, { clipPath: circ(R, cx, cy + yDe) });
  const tl = gsap.timeline();
  tl.to(de.el, { clipPath: circ(0, cx, cy + yDe), duration: 0.85, ease: EASE.troca }, 0)
    .to(circulo, { clipPath: circ(0, cx, cy), duration: 0.85, ease: EASE.troca }, 0.16)
    .add(aoCobrir, 0.5)
    .add(capa.intro(), 0.55);
  return tl.then(() => desativarCamada());
}

/* =========================================================================
   LISTRAS DE GRAMADO (sobre, abertura, 404)
   ========================================================================= */
export function listrasT({ de, para, capa, aoCobrir }) {
  de.el.style.zIndex = '11';
  para.el.style.zIndex = '13';
  ativarCamada(80);
  gsap.set(para.el, { autoAlpha: 0 });
  gsap.set(listras, { scaleY: 0, transformOrigin: '50% 100%' });
  if (para.tipo === 'capa') capa.prepararIntro();
  const tl = gsap.timeline();
  tl.to(listras, { scaleY: 1, duration: 0.62, ease: EASE.troca, stagger: { each: 0.055, from: 'start' } }, 0)
    .add(() => {
      gsap.set(para.el, { autoAlpha: 1 });
      gsap.set(de.el, { autoAlpha: 0 });
      aoCobrir();
    }, 0.98)
    .set(listras, { transformOrigin: '50% 0%' }, 0.98)
    .to(listras, { scaleY: 0, duration: 0.7, ease: EASE.troca, stagger: { each: 0.055, from: 'start' } }, 1.02);
  if (para.tipo === 'capa') tl.add(capa.intro(), 1.05);
  else tl.add(para.entrar(), 1.12);
  return tl.then(() => desativarCamada());
}

/* =========================================================================
   FADE (movimento reduzido)
   ========================================================================= */
export function fade({ de, para, capa, aoCobrir }) {
  de.el.style.zIndex = '11';
  para.el.style.zIndex = '13';
  if (para.tipo === 'capa') { capa.estadoFinal(); capa.ativar(); }
  const tl = gsap.timeline();
  tl.fromTo(para.el, { autoAlpha: 0 }, { autoAlpha: 1, duration: DUR.p, ease: 'none' })
    .add(aoCobrir, DUR.p * 0.5);
  if (para.tipo !== 'capa') tl.add(para.entrar(), 0);
  return tl;
}

/* =========================================================================
   ESCOLHA
   ========================================================================= */
const ESPECIAIS = ['sobre', 'abertura', '404'];
function heroVisivel(tela) {
  const r = tela.fotoHero?.getBoundingClientRect();
  return !!r && r.bottom > 80 && r.top < H() - 80;
}

export function escolher(de, para, origem) {
  if (movimentoReduzido()) return fade;
  const a = de.tipo, b = para.tipo;
  const doDock = !!origem?.closest?.('.dock__item');
  if (a === 'capa' && b === 'categoria') return objeto;
  if (a === 'categoria' && b === 'capa') return objetoVolta;
  if (b === 'categoria') {
    if (a === 'historia' && !doDock && de.historia.categoria === para.categoria.id && heroVisivel(de)) return flipVolta;
    if (ESPECIAIS.includes(a) && !origem?.closest?.('.dock__item, .convite__item')) return listrasT;
    return circuloAtor;
  }
  if (b === 'historia' && (origem?.closest?.('.card, .sugestao') || (a === 'categoria' && de.cardDe?.(para.historia.id)))) return flip;
  if (ESPECIAIS.includes(b) || ESPECIAIS.includes(a)) return listrasT;
  if (b === 'capa') return circuloVolta;
  return circulo_;
}
