/* =============================================================================
   EFEITOS — rolagem suave (Lenis), cursor custom, confete e grama ao vento.
   ============================================================================= */
import { $, EASE, DUR, movimentoReduzido, ehToque, clamp, aleatorio } from './base.js';

/* =============================== ROLAGEM =============================== */
let lenis = null;
const ouvintesRolagem = new Set();

export const rolagem = {
  iniciar() {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const aoRolar = (y, dir) => ouvintesRolagem.forEach(cb => cb(y, dir));
    if (!movimentoReduzido() && window.Lenis) {
      lenis = new window.Lenis({
        duration: 1.15,
        easing: x => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x)), // expo.out
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 1.3,
      });
      lenis.on('scroll', e => { window.ScrollTrigger?.update(); aoRolar(e.scroll, e.direction); });
      gsap.ticker.add(tempo => lenis.raf(tempo * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      let ultimo = window.scrollY;
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        aoRolar(y, y > ultimo ? 1 : -1);
        ultimo = y;
      }, { passive: true });
    }
  },
  para(y, { imediato = true, duracao = 1.2 } = {}) {
    if (lenis) lenis.scrollTo(y, { immediate: imediato, force: true, duration: duracao, lock: !imediato });
    else window.scrollTo({ top: typeof y === 'number' ? y : 0, behavior: imediato ? 'instant' : 'smooth' });
  },
  y() { return lenis ? lenis.scroll : window.scrollY; },
  parar() { lenis?.stop(); document.documentElement.classList.add('rolagem-parada'); },
  retomar() { lenis?.start(); document.documentElement.classList.remove('rolagem-parada'); },
  aoRolar(cb) { ouvintesRolagem.add(cb); return () => ouvintesRolagem.delete(cb); },
  atualizar() { lenis?.resize(); window.ScrollTrigger?.refresh(); },
};

/* =============================== CURSOR =============================== */
export const cursor = {
  ativo: false,
  iniciar() {
    if (ehToque() || movimentoReduzido() || !window.matchMedia('(pointer: fine)').matches) return;
    const el = $('#cursor');
    if (!el) return;
    this.ativo = true;
    this.el = el;
    const ponto = $('.cursor__ponto', el), anel = $('.cursor__anel', el), rotulo = $('.cursor__rotulo', el);
    document.documentElement.classList.add('tem-cursor');
    const px = gsap.quickTo(ponto, 'x', { duration: 0.08, ease: 'power3' });
    const py = gsap.quickTo(ponto, 'y', { duration: 0.08, ease: 'power3' });
    const ax = gsap.quickTo(anel, 'x', { duration: 0.42, ease: 'power3' });
    const ay = gsap.quickTo(anel, 'y', { duration: 0.42, ease: 'power3' });
    gsap.set(rotulo, { xPercent: -50, yPercent: -50 });
    const lx = gsap.quickTo(rotulo, 'x', { duration: 0.42, ease: 'power3' });
    const ly = gsap.quickTo(rotulo, 'y', { duration: 0.42, ease: 'power3' });
    let visivel = false, alvoAtual = null;

    window.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      if (!visivel) { visivel = true; gsap.to(el, { autoAlpha: 1, duration: DUR.p }); gsap.set([ponto, anel, rotulo], { x: e.clientX, y: e.clientY }); }
      px(e.clientX); py(e.clientY); ax(e.clientX); ay(e.clientY); lx(e.clientX); ly(e.clientY);
    }, { passive: true });
    document.addEventListener('pointerleave', () => { visivel = false; gsap.to(el, { autoAlpha: 0, duration: DUR.p }); });
    window.addEventListener('blur', () => { visivel = false; gsap.to(el, { autoAlpha: 0, duration: DUR.p }); });

    const definir = alvo => {
      if (alvo === alvoAtual) return;
      alvoAtual = alvo;
      const texto = alvo?.dataset.cursor;
      el.classList.toggle('cursor--rotulo', !!texto);
      el.classList.toggle('cursor--link', !!alvo && !texto);
      if (texto) {
        rotulo.textContent = texto;
        gsap.to(anel, { scale: 3, duration: DUR.m, ease: EASE.saida, overwrite: 'auto' });
        gsap.to(rotulo, { autoAlpha: 1, scale: 1, duration: DUR.p, ease: EASE.suave, overwrite: 'auto' });
        gsap.to(ponto, { scale: 0, duration: DUR.p, overwrite: 'auto' });
      } else {
        gsap.to(anel, { scale: alvo ? 1.55 : 1, duration: DUR.m, ease: EASE.saida, overwrite: 'auto' });
        gsap.to(rotulo, { autoAlpha: 0, scale: 0.6, duration: DUR.xs, overwrite: 'auto' });
        gsap.to(ponto, { scale: alvo ? 0.5 : 1, duration: DUR.p, overwrite: 'auto' });
      }
    };
    document.addEventListener('pointerover', e => {
      if (e.pointerType && e.pointerType !== 'mouse') return;
      definir(e.target.closest('[data-cursor], a, button, summary, [role="slider"], label'));
    });
    window.addEventListener('pointerdown', () => gsap.to(anel, { scale: '*=0.82', duration: DUR.xs, yoyo: true, repeat: 1 }));
    this.definir = definir;
  },
  /** Recalcula o alvo (ex.: depois de trocar de tela com o mouse parado). */
  reiniciar() { this.definir?.(null); },
  tema(escuro) { this.el?.classList.toggle('cursor--escuro', !!escuro); },
};

/* =============================== CONFETE =============================== */
const CORES_CONFETE = ['#1F7A3A', '#FFFFFF', '#7BC96F', '#0E4D24', '#F4F8F1'];
export const confete = {
  pecas: [],
  rodando: false,
  iniciar() {
    this.canvas = $('#confete');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    const ajustar = () => {
      this.dpr = Math.min(2, window.devicePixelRatio || 1);
      this.canvas.width = Math.round(window.innerWidth * this.dpr);
      this.canvas.height = Math.round(window.innerHeight * this.dpr);
    };
    ajustar();
    window.addEventListener('resize', ajustar);
    this._tick = this._tick.bind(this);
  },
  explodir({ x = window.innerWidth / 2, y = window.innerHeight / 2, n = 90, forca = 1, angulo = -Math.PI / 2, abertura = Math.PI * 0.9, cores = CORES_CONFETE } = {}) {
    if (!this.ctx || movimentoReduzido()) return;
    const rnd = Math.random;
    for (let i = 0; i < n; i++) {
      const a = angulo + (rnd() - 0.5) * abertura;
      const v = (7 + rnd() * 9) * forca;
      this.pecas.push({
        x, y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        g: 0.22 + rnd() * 0.12,
        rot: rnd() * Math.PI, vr: (rnd() - 0.5) * 0.35,
        fase: rnd() * Math.PI * 2, vf: 0.08 + rnd() * 0.12,
        w: 6 + rnd() * 7, h: 3 + rnd() * 4,
        cor: cores[(rnd() * cores.length) | 0],
        circulo: rnd() < 0.18,
        vida: 1,
      });
    }
    if (!this.rodando) { this.rodando = true; gsap.ticker.add(this._tick); }
  },
  chuva({ n = 120, cores = CORES_CONFETE } = {}) {
    if (!this.ctx || movimentoReduzido()) return;
    const W = window.innerWidth;
    for (let i = 0; i < n; i++) {
      this.pecas.push({
        x: Math.random() * W, y: -20 - Math.random() * window.innerHeight * 0.6,
        vx: (Math.random() - 0.5) * 2, vy: 2 + Math.random() * 3, g: 0.04,
        rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.2,
        fase: Math.random() * 6, vf: 0.1, w: 6 + Math.random() * 6, h: 3 + Math.random() * 3,
        cor: cores[(Math.random() * cores.length) | 0], circulo: Math.random() < 0.15, vida: 1,
      });
    }
    if (!this.rodando) { this.rodando = true; gsap.ticker.add(this._tick); }
  },
  _tick() {
    const { ctx, canvas, dpr } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const H = window.innerHeight + 40;
    this.pecas = this.pecas.filter(p => p.y < H && p.vida > 0);
    for (const p of this.pecas) {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + p.g;
      p.x += p.vx + Math.sin(p.fase) * 0.6; p.y += p.vy;
      p.rot += p.vr; p.fase += p.vf;
      if (p.vy > 0) p.vida -= 0.0025;
      ctx.save();
      ctx.globalAlpha = clamp(p.vida * 1.4, 0, 1);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.fase));
      ctx.fillStyle = p.cor;
      if (p.circulo) { ctx.beginPath(); ctx.arc(0, 0, p.h, 0, Math.PI * 2); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (!this.pecas.length) {
      this.rodando = false;
      gsap.ticker.remove(this._tick);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  },
};

/* =============================== GRAMA AO VENTO =============================== */
const CORES_GRAMA = ['#1F7A3A', '#1F7A3A', '#0E4D24', '#2A8A47', '#24803F', '#7BC96F'];
/** Lâminas de grama em canvas, balançando ao vento; desviam do cursor. */
export function montarGrama(canvas) {
  const ctx = canvas.getContext('2d');
  const rnd = aleatorio(canvas.dataset.semente || 'grama');
  let laminas = [], W = 0, H = 0, dpr = 1, visivel = false, rodando = false, t0 = performance.now();
  let mx = -9999, my = -9999, mxSuave = -9999;

  const criar = () => {
    dpr = Math.min(1.5, window.devicePixelRatio || 1);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const n = Math.round(W / 2.6);
    laminas = Array.from({ length: n }, (_, i) => {
      const x = (i / n) * W + (rnd() - 0.5) * 4;
      return {
        x,
        h: H * (0.35 + rnd() * 0.6),
        w: 1.6 + rnd() * 2.6,
        cor: CORES_GRAMA[(rnd() * CORES_GRAMA.length) | 0],
        fase: rnd() * Math.PI * 2,
        rigidez: 0.6 + rnd() * 0.8,
        inclina: (rnd() - 0.5) * 0.35,
      };
    }).sort((a, b) => (a.cor === '#7BC96F') - (b.cor === '#7BC96F'));
  };

  const desenhar = agora => {
    const t = (agora - t0) / 1000;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (Math.abs(mx - mxSuave) > 300) mxSuave = mx; else mxSuave += (mx - mxSuave) * 0.12;
    const rajada = Math.sin(t * 0.35) * 0.5 + Math.sin(t * 0.9 + 1.3) * 0.25;
    for (const l of laminas) {
      let curva = (Math.sin(t * 1.6 * l.rigidez + l.x * 0.018 + l.fase) * 0.22 + rajada * 0.28 + l.inclina) * l.h;
      const dx = l.x - mxSuave;
      if (Math.abs(dx) < 90 && my > -20) curva += Math.sign(dx || 1) * (1 - Math.abs(dx) / 90) * l.h * 0.85;
      const bx = l.x, by = H;
      const tx = bx + curva, ty = H - l.h + Math.abs(curva) * 0.18;
      const cx = bx + curva * 0.15, cy = H - l.h * 0.55;
      ctx.beginPath();
      ctx.moveTo(bx - l.w, by);
      ctx.quadraticCurveTo(cx - l.w * 0.5, cy, tx, ty);
      ctx.quadraticCurveTo(cx + l.w * 0.5, cy, bx + l.w, by);
      ctx.closePath();
      ctx.fillStyle = l.cor;
      ctx.fill();
    }
  };

  const loop = agora => { if (!rodando) return; desenhar(agora); requestAnimationFrame(loop); };
  const iniciarLoop = () => {
    if (movimentoReduzido()) { desenhar(performance.now()); return; }
    if (rodando || !visivel) return;
    rodando = true; requestAnimationFrame(loop);
  };

  criar();
  desenhar(performance.now());
  const io = new IntersectionObserver(([e]) => { visivel = e.isIntersecting; if (visivel) iniciarLoop(); else rodando = false; });
  io.observe(canvas);
  const ro = new ResizeObserver(() => { criar(); desenhar(performance.now()); });
  ro.observe(canvas);
  const mover = e => {
    const r = canvas.getBoundingClientRect();
    mx = e.clientX - r.left; my = e.clientY - r.top;
    if (my < -40 || my > H + 20) { mx = -9999; }
  };
  window.addEventListener('pointermove', mover, { passive: true });
  return () => { rodando = false; io.disconnect(); ro.disconnect(); window.removeEventListener('pointermove', mover); };
}
