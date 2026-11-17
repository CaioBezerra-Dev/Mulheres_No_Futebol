/* =============================================================================
   CENA — o estádio por dentro.
   Parallax (mouse, toque, giroscópio), torcida viva + ola, refletores,
   poeira na luz, flashes de celular, bola que quica e o gol (easter egg).
   ============================================================================= */
import { $, $$, EASE, DUR, movimentoReduzido, ehToque, clamp, t } from './base.js';
import { som } from './som.js';
import { confete } from './efeitos.js';

const CORES_GOL = ['#1F7A3A', '#FFFFFF', '#7BC96F', '#F4F8F1', '#0E4D24'];

export function criarCena(capaEl) {
  const raiz = $('#cena', capaEl);
  const reduzido = movimentoReduzido();
  let ativo = false;
  let tempo = 0;

  /* ------------------------------------------------------------------ PARALLAX */
  const camadas = $$('[data-prof]', capaEl).map(el => ({
    el,
    prof: parseFloat(el.dataset.prof) || 0,
    sx: gsap.quickSetter(el, 'x', 'px'),
    sy: gsap.quickSetter(el, 'y', 'px'),
  }));
  const alvo = { x: 0, y: 0 }, atual = { x: 0, y: 0 };
  const amplitude = () => (window.innerWidth < 700 ? 34 : 64);

  const porPonto = (x, y) => {
    alvo.x = clamp((x / window.innerWidth - 0.5) * 2, -1, 1);
    alvo.y = clamp((y / window.innerHeight - 0.5) * 2, -1, 1);
  };
  window.addEventListener('pointermove', e => { if (ativo && e.pointerType === 'mouse') porPonto(e.clientX, e.clientY); }, { passive: true });
  window.addEventListener('touchmove', e => { if (ativo && e.touches[0]) porPonto(e.touches[0].clientX, e.touches[0].clientY); }, { passive: true });

  let base = null, giroscopioPedido = false;
  const aoGirar = e => {
    if (!ativo || e.gamma == null) return;
    if (!base) base = { b: e.beta, g: e.gamma };
    alvo.x = clamp((e.gamma - base.g) / 22, -1, 1);
    alvo.y = clamp((e.beta - base.b) / 22, -1, 1);
  };
  function pedirGiroscopio() {
    if (giroscopioPedido || reduzido || !('DeviceOrientationEvent' in window)) return;
    giroscopioPedido = true;
    const DOE = window.DeviceOrientationEvent;
    if (typeof DOE.requestPermission === 'function') {
      DOE.requestPermission().then(r => { if (r === 'granted') window.addEventListener('deviceorientation', aoGirar); }).catch(() => {});
    } else {
      window.addEventListener('deviceorientation', aoGirar);
    }
  }
  if (ehToque()) {
    // Android libera direto; no iOS o pedido precisa de um toque (feito no primeiro toque na cena)
    if (typeof window.DeviceOrientationEvent?.requestPermission !== 'function') pedirGiroscopio();
    capaEl.addEventListener('pointerup', e => { if (!e.target.closest('.objeto, a, button')) pedirGiroscopio(); });
  }

  function aplicarParallax() {
    atual.x += (alvo.x - atual.x) * 0.055;
    atual.y += (alvo.y - atual.y) * 0.055;
    const A = amplitude();
    for (const c of camadas) {
      c.sx(-atual.x * A * c.prof);
      c.sy(-atual.y * A * c.prof * 0.55);
    }
  }

  /* ------------------------------------------------------------------ TORCIDA */
  const aneis = $$('.torcida', raiz);
  let tiras = [];          // { set, x, anel, fase }
  let larguraTorcida = 0;
  const pulos = [];        // pulinhos aleatórios de grupos da torcida
  let ola = null;          // { inicio, dur }
  let festa = null;        // { inicio, dur } pulo geral (gol)

  function montarTiras() {
    tiras = [];
    aneis.forEach((anel, a) => {
      anel.innerHTML = '';
      const W = anel.clientWidth;
      larguraTorcida = W;
      const sw = reduzido ? Math.max(1, W) : ehToque() ? 32 : 24;
      const n = Math.ceil(W / sw);
      const desloc = (a + 1) * 211;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < n; i++) {
        const d = document.createElement('div');
        d.className = 'torcida__tira';
        d.style.left = `${i * sw}px`;
        d.style.width = `${sw + 1}px`;
        d.style.backgroundPositionX = `${-(i * sw) - desloc}px`;
        frag.appendChild(d);
        tiras.push({ el: d, set: gsap.quickSetter(d, 'y', 'px'), x: i * sw + sw / 2, anel: a, fase: Math.random() * 6.28, altura: 0 });
      }
      anel.appendChild(frag);
      const h = anel.clientHeight;
      tiras.forEach(tr => { if (tr.anel === a) tr.altura = h; });
    });
  }

  function animarTorcida(dt) {
    const agora = tempo;
    // novos pulinhos de vez em quando
    if (!reduzido && Math.random() < dt * 0.9) {
      pulos.push({ x: Math.random() * larguraTorcida, raio: 30 + Math.random() * 70, inicio: agora, dur: 0.45 + Math.random() * 0.35, amp: 2 + Math.random() * 3, anel: (Math.random() * 3) | 0 });
    }
    for (let k = pulos.length - 1; k >= 0; k--) if (agora - pulos[k].inicio > pulos[k].dur) pulos.splice(k, 1);

    const W = larguraTorcida || 1;
    let frenteOla = null, sigma = Math.max(56, W * 0.055);
    if (ola) {
      const p = (agora - ola.inicio) / ola.dur;
      if (p > 1.15) ola = null; else frenteOla = -0.15 * W + p * 1.3 * W;
    }
    let forcaFesta = 0;
    if (festa) {
      const p = (agora - festa.inicio) / festa.dur;
      if (p > 1) festa = null; else forcaFesta = Math.sin(p * Math.PI);
    }

    for (const tr of tiras) {
      let y = Math.sin(agora * 2.2 + tr.fase + tr.x * 0.01) * 0.6;
      for (const pl of pulos) {
        if (pl.anel !== tr.anel) continue;
        const d = Math.abs(tr.x - pl.x);
        if (d < pl.raio) y -= pl.amp * (1 - d / pl.raio) * Math.sin(((agora - pl.inicio) / pl.dur) * Math.PI);
      }
      if (frenteOla !== null) {
        const atraso = (2 - tr.anel) * 0.035 * W;
        const d = tr.x - (frenteOla - atraso);
        y -= tr.altura * 0.42 * Math.exp(-(d * d) / (2 * sigma * sigma));
      }
      if (forcaFesta) y -= tr.altura * 0.22 * forcaFesta * Math.abs(Math.sin(agora * 14 + tr.fase));
      tr.set(y);
    }
  }

  function puxarOla() {
    if (ola) return;
    ola = { inicio: tempo, dur: 2.6 };
    som.ola(2.6);
  }
  aneis.forEach(a => {
    a.dataset.cursor = t('cursorOla');
    a.addEventListener('click', puxarOla);
  });

  /* ------------------------------------------------------------------ BANDEIRAS */
  const bandeirasEl = $('.arquibancada__bandeiras', raiz);
  if (bandeirasEl && !bandeirasEl.children.length) {
    const tipos = ['listrada', 'lisa', 'verde', 'listrada', 'diagonal', 'lisa'];
    const posicoes = [9, 23, 41, 58, 74, 90];
    bandeirasEl.innerHTML = posicoes.map((x, i) =>
      `<span class="bandeira bandeira--${tipos[i]}" style="left:${x}%;--atraso:${(-i * 0.37).toFixed(2)}s;--dur:${(1.6 + (i % 3) * 0.35).toFixed(2)}s;--anel:${i % 2}"><i></i></span>`).join('');
  }

  /* ------------------------------------------------------------------ REFLETORES */
  const refletores = $$('.refletor', raiz);
  const brilhos = refletores.map(r => $('.refletor__brilho', r));
  const feixes = $$('.feixe', raiz);
  const camadaRefletores = $('.cena__refletores', raiz);
  const camadaFeixes = $('.cena__feixes', raiz);
  /** Cone de luz de cada torre até um ponto do gramado (recalculado no resize). */
  function posicionarFeixes() {
    if (!camadaFeixes) return;
    const base = camadaFeixes.getBoundingClientRect();
    const gram = $('.cena__gramado', raiz).getBoundingClientRect();
    const cena = raiz.getBoundingClientRect();
    const larguraLocal = camadaFeixes.offsetWidth;
    const alturaLocal = camadaFeixes.offsetHeight;
    if (!cena.width || !base.width || !base.height || !larguraLocal || !alturaLocal) return;
    // Os retângulos incluem o zoom da cena; left/top/width/height usam o
    // espaço local. Sem desfazer essa escala, o erro cresce para a direita
    // e só desaparece quando um resize recalcula tudo depois da abertura.
    const escalaX = base.width / larguraLocal;
    const escalaY = base.height / alturaLocal;
    const alvosX = [0.36, 0.45, 0.55, 0.64];
    const torres = refletores.map(r => $('.refletor__torre', r).getBoundingClientRect());
    torres.forEach((tr, i) => {
      const f = feixes[i];
      if (!f || !tr.width) return;
      const x0 = (tr.left + tr.width / 2 - base.left) / escalaX;
      const y0 = (tr.top + tr.height * 0.075 - base.top) / escalaY;
      const x1 = (cena.left + cena.width * alvosX[i] - base.left) / escalaX;
      const y1 = (gram.top + Math.min(gram.height, cena.bottom - gram.top) * 0.45 - base.top) / escalaY;
      const comp = Math.hypot(x1 - x0, y1 - y0);
      const ang = (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI - 90;
      const larg = comp * 0.46;
      Object.assign(f.style, { left: `${x0 - larg / 2}px`, top: `${y0}px`, width: `${larg}px`, height: `${comp}px`, transform: `rotate(${ang.toFixed(2)}deg)` });
    });
  }
  let pulsos = [];
  function iniciarPulsos() {
    pararPulsos();
    if (reduzido) return;
    brilhos.forEach(b => pulsos.push(gsap.to(b, { opacity: 'random(0.78, 1)', duration: 'random(0.9, 2.4)', ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true })));
    feixes.forEach(f => pulsos.push(gsap.to(f, { opacity: 'random(0.75, 1)', duration: 'random(1.4, 3)', ease: 'sine.inOut', repeat: -1, yoyo: true, repeatRefresh: true })));
  }
  function pararPulsos() { pulsos.forEach(p => p.kill()); pulsos = []; }

  let timerTremor = null;
  function agendarTremor() {
    clearTimeout(timerTremor);
    if (reduzido) return;
    timerTremor = setTimeout(() => {
      if (!ativo) return;
      const i = (Math.random() * brilhos.length) | 0;
      gsap.timeline()
        .to([brilhos[i], feixes[i]], { opacity: 0.35, duration: 0.05 })
        .to([brilhos[i], feixes[i]], { opacity: 1, duration: 0.06 })
        .to([brilhos[i], feixes[i]], { opacity: 0.55, duration: 0.05 })
        .to([brilhos[i], feixes[i]], { opacity: 1, duration: 0.2 });
      agendarTremor();
    }, 7000 + Math.random() * 9000);
  }

  const escuro = document.createElement('div');
  escuro.className = 'cena__escuro';
  raiz.appendChild(escuro);
  let apagando = false;
  function apagao() {
    if (apagando || reduzido) return;
    apagando = true;
    pararPulsos();
    const tl = gsap.timeline({ onComplete: () => { apagando = false; iniciarPulsos(); } });
    tl.to([...brilhos, ...feixes], { opacity: 0, duration: 0.08, ease: 'none' })
      .to(escuro, { opacity: 0.62, duration: 0.12 }, 0)
      .add(() => som.estalo(0.7), 0);
    refletores.forEach((r, i) => {
      const momento = 0.75 + i * 0.32;
      tl.add(() => som.estalo(0.55), momento)
        .fromTo(brilhos[i], { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.5, ease: EASE.passa }, momento)
        .to(feixes[i], { opacity: 1, duration: 0.4 }, momento)
        .to(escuro, { opacity: 0.62 * (1 - (i + 1) / refletores.length), duration: 0.3 }, momento);
    });
    tl.add(() => { festa = { inicio: tempo, dur: 1.4 }; som.torcida({ intensidade: 0.6, dur: 2.4 }); });
  }
  refletores.forEach(r => r.addEventListener('click', apagao));

  /* ------------------------------------------------------------------ PARTÍCULAS */
  const canvas = $('#particulas', raiz);
  const ctx = canvas?.getContext('2d');
  let W = 0, H = 0, dpr = 1, poeira = [], flashes = [];
  const arqEl = $('.cena__arquibancada', raiz);

  function ajustarCanvas() {
    if (!canvas) return;
    dpr = Math.min(ehToque() ? 1 : 1.5, window.devicePixelRatio || 1);
    W = raiz.clientWidth; H = raiz.clientHeight;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const n = W < 700 ? 26 : 56;
    poeira = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: H * (0.05 + Math.random() * 0.7),
      r: 0.5 + Math.random() * 1.5, vx: (Math.random() - 0.5) * 6, vy: -2 - Math.random() * 5,
      a: 0.15 + Math.random() * 0.45, fase: Math.random() * 6.28,
    }));
  }

  function desenharParticulas(dt) {
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'lighter';
    for (const p of poeira) {
      p.x += (p.vx + Math.sin(tempo * 0.7 + p.fase) * 4) * dt;
      p.y += p.vy * dt;
      if (p.y < H * 0.02) { p.y = H * (0.6 + Math.random() * 0.2); p.x = Math.random() * W; }
      if (p.x < -10) p.x = W + 10; else if (p.x > W + 10) p.x = -10;
      const brilho = p.a * (0.6 + 0.4 * Math.sin(tempo * 2 + p.fase));
      ctx.fillStyle = `rgba(244,248,241,${brilho.toFixed(3)})`;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    // flashes de celular na arquibancada
    if (!reduzido && arqEl && Math.random() < dt * 3) {
      const r = arqEl.getBoundingClientRect(), rr = raiz.getBoundingClientRect();
      flashes.push({ x: Math.random() * W, y: r.top - rr.top + r.height * (0.3 + Math.random() * 0.62), vida: 1, r: 1.1 + Math.random() * 1.2 });
    }
    for (let i = flashes.length - 1; i >= 0; i--) {
      const f = flashes[i];
      f.vida -= dt * 5.5;
      if (f.vida <= 0) { flashes.splice(i, 1); continue; }
      const g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
      g.addColorStop(0, `rgba(255,255,255,${(0.95 * f.vida).toFixed(3)})`);
      g.addColorStop(0.25, `rgba(244,248,241,${(0.35 * f.vida).toFixed(3)})`);
      g.addColorStop(1, 'rgba(244,248,241,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 7, 0, 6.283); ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ------------------------------------------------------------------ BOLA */
  const bola = $('#bola', raiz);
  const bolaCorpo = $('.bola__corpo', bola);
  const bolaSombra = $('.bola__sombra', bola);
  const bolaImg = $('img', bola);
  const gramadoEl = $('.cena__gramado', raiz);
  let tlBola = null, timerBola = null, bolaVisivel = false;
  bola.dataset.cursor = t('cursorChutar');

  function geometriaGramado() {
    const g = gramadoEl.getBoundingClientRect(), c = raiz.getBoundingClientRect();
    const topo = g.top - c.top;
    return { largura: g.width, alturaVisivel: Math.max(80, c.height - topo), x0: g.left - c.left };
  }

  function rolarBola() {
    if (!ativo || reduzido) return;
    const geo = geometriaGramado();
    const daEsquerda = Math.random() < 0.5;
    const v = 0.22 + Math.random() * 0.4;
    const chao = geo.alturaVisivel * v;
    const escala = 0.62 + v * 0.75;
    const xIni = daEsquerda ? -geo.x0 - 80 : geo.largura + 80;
    const xFim = daEsquerda ? geo.largura + 80 : -geo.x0 - 80;
    const quiques = [0.95, 0.55, 0.3, 0.14, 0.05, 0];
    const H0 = 120 * escala;
    const pesos = quiques.map(q => Math.sqrt(q + 0.02));
    const soma = pesos.reduce((a, b) => a + b, 0);
    const dur = 4.2 + Math.random() * 1.6;
    const giro = (daEsquerda ? 1 : -1) * (720 + Math.random() * 360);
    const prox = { p: 0 };
    bolaVisivel = true;
    gsap.set(bola, { autoAlpha: 1 });
    tlBola = gsap.to(prox, {
      p: 1, duration: dur, ease: 'none',
      onUpdate() {
        const p = prox.p;
        let acum = 0, h = 0;
        for (let k = 0; k < quiques.length; k++) {
          const fatia = pesos[k] / soma;
          if (p <= acum + fatia || k === quiques.length - 1) {
            const s = clamp((p - acum) / fatia, 0, 1);
            h = H0 * quiques[k] * 4 * s * (1 - s);
            break;
          }
          acum += fatia;
        }
        const x = xIni + (xFim - xIni) * p;
        bola._estado = { x, chao, h, escala };
        gsap.set(bolaCorpo, { x, y: chao - h, scale: escala });
        gsap.set(bolaImg, { rotation: giro * p });
        gsap.set(bolaSombra, { x, y: chao, scale: escala * (1 - Math.min(0.6, h / (H0 * 1.6))), opacity: 0.55 - Math.min(0.35, h / (H0 * 2)) });
      },
      onComplete() { bolaVisivel = false; gsap.set(bola, { autoAlpha: 0 }); agendarBola(); },
    });
  }
  function agendarBola(atraso) {
    clearTimeout(timerBola);
    if (reduzido) return;
    timerBola = setTimeout(rolarBola, atraso ?? 6000 + Math.random() * 8000);
  }

  function chutar() {
    if (!bolaVisivel || !bola._estado) return;
    tlBola?.kill();
    const { x, chao, h, escala } = bola._estado;
    const geo = geometriaGramado();
    const destinoX = geo.largura * (0.35 + Math.random() * 0.3);
    const destinoY = -geo.alturaVisivel * 0.55;
    som.apito({ volume: 0.25 });
    const tl = gsap.timeline({ onComplete: () => { bolaVisivel = false; gsap.set(bola, { autoAlpha: 0 }); } });
    tl.to(bolaCorpo, { scale: escala * 1.25, duration: 0.08, ease: 'power2.out' })
      .to(bolaCorpo, { x: destinoX, duration: 0.85, ease: 'power1.out' }, 0.08)
      .to(bolaCorpo, { y: destinoY, duration: 0.85, ease: 'power2.out' }, 0.08)
      .to(bolaCorpo, { scale: escala * 0.25, duration: 0.85, ease: 'power2.in' }, 0.08)
      .to(bolaImg, { rotation: '+=1080', duration: 0.85, ease: 'power1.out' }, 0.08)
      .to(bolaSombra, { opacity: 0, duration: 0.3 }, 0.08)
      .add(() => gol(), 0.82);
    agendarBola(9000);
  }
  bola.addEventListener('click', chutar);

  const golEl = $('#gol', capaEl);
  function gol() {
    golEl.textContent = t('gol');
    const tl = gsap.timeline();
    tl.fromTo(golEl, { autoAlpha: 0, scale: 0.35, rotation: -6 }, { autoAlpha: 1, scale: 1, rotation: -3, duration: 0.7, ease: 'back.out(2.2)' })
      .to(golEl, { autoAlpha: 0, scale: 1.12, duration: 0.5, ease: EASE.entrada }, 1.5);
    if (!reduzido) {
      gsap.fromTo(raiz, { x: -6 }, { x: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.25)' });
      confete.explodir({ x: window.innerWidth / 2, y: window.innerHeight * 0.55, n: 120, forca: 1.15, cores: CORES_GOL });
      setTimeout(() => confete.chuva({ n: 90, cores: CORES_GOL }), 250);
      gsap.fromTo(brilhos, { opacity: 1, scale: 1.25 }, { scale: 1, duration: 0.9, ease: EASE.saida, stagger: 0.08 });
    }
    festa = { inicio: tempo, dur: 2.4 };
    som.torcida({ intensidade: 1, dur: 3.4 });
  }

  /* ------------------------------------------------------------------ CICLO */
  let acumuladoMs = 0;
  function tick(_, deltaMs) {
    if (document.hidden) return;
    acumuladoMs += deltaMs || 16;
    // Só a cena decorativa usa 30 Hz no toque. Navegação e transições seguem
    // a taxa da tela, e a ola mantém a duração por usar o tempo acumulado.
    if (ehToque() && acumuladoMs < 1000 / 30) return;
    const dt = Math.min(0.05, acumuladoMs / 1000);
    acumuladoMs = 0;
    tempo += dt;
    if (!reduzido) aplicarParallax();
    animarTorcida(dt);
    if (!reduzido) desenharParticulas(dt);
  }

  let timerResize;
  const aoRedimensionar = () => {
    clearTimeout(timerResize);
    timerResize = setTimeout(() => { montarTiras(); ajustarCanvas(); posicionarFeixes(); if (reduzido && ctx) desenharParticulas(0); }, 160);
  };
  window.addEventListener('resize', aoRedimensionar);

  montarTiras();
  ajustarCanvas();
  posicionarFeixes();

  return {
    raiz,
    ativar() {
      if (ativo) return;
      ativo = true;
      // a capa pode ter nascido escondida (deep link): mede de novo
      if (!tiras.length || Math.abs(larguraTorcida - (aneis[0]?.clientWidth || 0)) > 2) montarTiras();
      if (canvas && (W !== raiz.clientWidth || H !== raiz.clientHeight)) ajustarCanvas();
      posicionarFeixes();
      acumuladoMs = 0;
      if (!reduzido) gsap.ticker.add(tick);
      iniciarPulsos();
      agendarTremor();
      agendarBola(3500 + Math.random() * 3000);
    },
    pausar() {
      ativo = false;
      gsap.ticker.remove(tick);
      pararPulsos();
      clearTimeout(timerTremor);
      clearTimeout(timerBola);
      tlBola?.kill();
      bolaVisivel = false;
      gsap.set(bola, { autoAlpha: 0 });
    },
    /** Zoom de câmera em direção a um ponto da tela (usado nas transições). */
    zoom({ x, y, escala = 1.35, duracao = 1.1, ease = EASE.troca } = {}) {
      const r = raiz.getBoundingClientRect();
      return gsap.to(raiz, { scale: escala, transformOrigin: `${x - r.left}px ${y - r.top}px`, duration: duracao, ease });
    },
    definirZoom({ x, y, escala }) {
      const r = raiz.getBoundingClientRect();
      gsap.set(raiz, { scale: escala, transformOrigin: `${x - r.left}px ${y - r.top}px` });
    },
    voltarZoom({ duracao = 1.2, ease = EASE.saida } = {}) {
      return gsap.to(raiz, { scale: 1, x: 0, duration: duracao, ease });
    },
    intro() {
      const tl = gsap.timeline({ onComplete: posicionarFeixes });
      if (reduzido) return tl;
      tl.fromTo(raiz, { scale: 1.14 }, { scale: 1, duration: 2.4, ease: EASE.saida }, 0);
      camadas.filter(c => raiz.contains(c.el)).forEach(c => {
        // Feixes e torres têm alturas diferentes, mas precisam percorrer os
        // mesmos pixels para a luz continuar presa ao refletor na abertura.
        const proporcao = c.el === camadaFeixes
          ? (camadaRefletores?.offsetHeight || 0) / (camadaFeixes.offsetHeight || 1)
          : 1;
        tl.fromTo(c.el, { yPercent: c.prof * 12 * proporcao }, { yPercent: 0, duration: 2.2, ease: EASE.saida }, 0);
      });
      tl.add(() => { festa = { inicio: tempo, dur: 1.6 }; }, 0.6);
      return tl;
    },
    puxarOla,
  };
}
