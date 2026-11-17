/* =============================================================================
   CAPA — título, objetos tocáveis e descoberta guiada.
   ============================================================================= */
import { C, $, $$, EASE, DUR, STAGGER, t, categoriaDoObjeto, qtdHistorias, dividirLinhas, movimentoReduzido, ehToque } from './base.js';
import { criarCena } from './cena.js';

const OCIOSO_MS = 6000;

export function criarCapa() {
  const el = $('#tela-capa');
  const cena = criarCena(el);
  const reduzido = movimentoReduzido();
  const titulo = $('#capa-titulo', el);
  const kicker = $('.capa__kicker', el);
  const sub = $('.capa__apoio', el);
  const rodape = $('.capa__rodape', el);
  const itens = $$('.objeto-item', el);
  const objetos = $$('.objeto', el);
  let ativa = false;
  let linhas = [];
  // centraliza pelo GSAP (percentual relativo ao próprio tamanho, mesmo antes das imagens carregarem)
  gsap.set(itens, { x: 0, y: 0, xPercent: -50, yPercent: -50 });

  /* ---------------- textos ---------------- */
  titulo.textContent = C.site.titulo;
  $$('[data-instrucao]', el).forEach(i => { i.textContent = ehToque() ? C.site.instrucaoToque : C.site.instrucao; });
  objetos.forEach(o => {
    const cat = categoriaDoObjeto(o.dataset.objeto);
    if (!cat) { o.closest('.objeto-item')?.remove(); return; }
    o.href = `#${cat.id}`;
    o.dataset.categoria = cat.id;
    $('.objeto__nome', o).textContent = cat.nome;
    $('.objeto__qtd', o).textContent = qtdHistorias(cat.id);
    o.setAttribute('aria-label', t('objetoAria', { nome: cat.nome, qtd: qtdHistorias(cat.id) }));
    o.dataset.cursor = cat.nome.replace(/^(as|os|a|o)\s+/i, '');
  });

  /**
   * Títulos longos: reduz a fonte até o bloco caber na faixa do céu (acima da
   * arquibancada). Assim a autora pode trocar o título sem mexer no CSS.
   */
  function ajustarTitulo() {
    titulo.style.fontSize = '';
    const cena = el.getBoundingClientRect();
    if (!cena.height) return;
    const maxAltura = cena.height * (window.innerWidth / window.innerHeight < 0.8 ? 0.2 : 0.26);
    let tam = parseFloat(getComputedStyle(titulo).fontSize);
    const minimo = Math.max(30, tam * 0.4);
    let guarda = 0;
    while (titulo.offsetHeight > maxAltura && tam > minimo && guarda++ < 24) {
      tam *= 0.93;
      titulo.style.fontSize = `${tam}px`;
    }
  }
  function dividirTitulo() {
    if (titulo.dataset.textoOriginal) titulo.textContent = titulo.dataset.textoOriginal;
    ajustarTitulo();
    linhas = dividirLinhas(titulo);
    return linhas;
  }

  /* ---------------- flutuação ---------------- */
  const flutuacoes = reduzido ? [] : objetos.map((o, i) => gsap.to($('.objeto__flut', o), {
    y: -12, rotation: i % 2 ? 2.4 : -2.4,
    duration: 2.4 + i * 0.5, ease: 'sine.inOut', yoyo: true, repeat: -1, paused: true, delay: i * 0.3,
  }));

  /* ---------------- interação dos objetos ---------------- */
  objetos.forEach(o => {
    const mag = $('.objeto__mag', o);
    const halo = $('.objeto__halo', o);
    const qx = gsap.quickTo(mag, 'x', { duration: 0.7, ease: 'power3' });
    const qy = gsap.quickTo(mag, 'y', { duration: 0.7, ease: 'power3' });
    const qr = gsap.quickTo(mag, 'rotation', { duration: 0.8, ease: 'power3' });
    let dentro = false;

    const acender = () => {
      if (dentro) return;
      dentro = true;
      o.classList.add('is-ativo');
      if (reduzido) { gsap.to(halo, { opacity: 1, duration: DUR.p }); return; }
      gsap.to(mag, { scale: 1.13, duration: DUR.m, ease: 'back.out(2)', overwrite: 'auto' });
      qr(7);
      gsap.to(halo, { opacity: 1, scale: 1, duration: DUR.m, ease: EASE.saida, overwrite: 'auto' });
    };
    const apagar = () => {
      if (!dentro) return;
      dentro = false;
      o.classList.remove('is-ativo');
      if (reduzido) { gsap.to(halo, { opacity: 0, duration: DUR.p }); return; }
      gsap.to(mag, { scale: 1, x: 0, y: 0, rotation: 0, duration: 1.1, ease: 'elastic.out(1, 0.42)', overwrite: true });
      gsap.to(halo, { opacity: 0, scale: 0.7, duration: DUR.m, ease: EASE.saida, overwrite: 'auto' });
    };
    o._acender = acender;
    o._apagar = apagar;

    o.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') acender(); });
    o.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') apagar(); });
    o.addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse' || reduzido || !dentro) return;
      const r = o.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      qx(dx * 0.3); qy(dy * 0.3); qr(7 + dx * 0.05);
    });
    // toque: aperta e solta (nada depende de hover)
    o.addEventListener('pointerdown', e => {
      if (e.pointerType === 'mouse' || reduzido) return;
      gsap.to(mag, { scale: 0.92, duration: DUR.xs, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(halo, { opacity: 1, duration: DUR.xs });
    });
    const soltar = e => {
      if (e.pointerType === 'mouse' || reduzido) return;
      gsap.to(mag, { scale: 1, duration: DUR.m, ease: 'back.out(3)', overwrite: 'auto' });
      gsap.to(halo, { opacity: 0, duration: DUR.m });
    };
    o.addEventListener('pointerup', soltar);
    o.addEventListener('pointercancel', soltar);
    o.addEventListener('focus', () => { if (o.matches(':focus-visible')) acender(); });
    o.addEventListener('blur', apagar);
  });

  /* ---------------- descoberta guiada (6s parado) ---------------- */
  let timerOcioso = null, indiceDica = 0, tlDica = null;
  const reiniciarOcio = () => {
    clearTimeout(timerOcioso);
    if (ativa) timerOcioso = setTimeout(dica, OCIOSO_MS);
  };
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, () => { if (ativa) reiniciarOcio(); }, { passive: true }));

  function dica() {
    if (!ativa) return;
    const visiveis = objetos.filter(o => o.isConnected);
    const o = visiveis[indiceDica++ % visiveis.length];
    const mag = $('.objeto__mag', o);
    let balao = $('.objeto__dica', o);
    if (!balao) {
      balao = document.createElement('span');
      balao.className = 'objeto__dica';
      balao.setAttribute('aria-hidden', 'true');
      balao.textContent = t('dicaInicio');
      mag.appendChild(balao);
      gsap.set(balao, { xPercent: -50 });
    }
    const sonar = document.createElement('span');
    sonar.className = 'objeto__sonar';
    mag.insertBefore(sonar, mag.firstChild);
    tlDica?.kill();
    tlDica = gsap.timeline({ onComplete: () => { sonar.remove(); reiniciarOcio(); } });
    tlDica.fromTo(balao, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: DUR.m, ease: EASE.saida }, 0)
      .to(balao, { autoAlpha: 0, y: -6, duration: DUR.p }, 2.6);
    if (!reduzido) {
      tlDica.fromTo(sonar, { scale: 0.55, opacity: 0.9 }, { scale: 2.3, opacity: 0, duration: 1.3, ease: 'power2.out', repeat: 1, repeatDelay: 0.1 }, 0)
        .to(mag, { scale: 1.1, duration: 0.22, ease: 'power2.out', yoyo: true, repeat: 3 }, 0)
        .to(mag, { rotation: 8, duration: 0.11, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0.05)
        .set(mag, { rotation: 0 });
    } else {
      tlDica.set(sonar, { display: 'none' }, 0);
    }
    o.classList.add('is-dica');
    setTimeout(() => o.classList.remove('is-dica'), 2800);
  }

  /* ---------------- coreografias ---------------- */
  function prepararIntro() {
    if (!linhas.length) dividirTitulo();
    gsap.set(linhas, { yPercent: 115 });
    gsap.set([kicker, sub, rodape], { autoAlpha: 0, y: 18 });
    gsap.set(itens, { autoAlpha: 0, scale: 0.55, y: 60 });
  }

  function intro() {
    const tl = gsap.timeline({ onStart: ativar });
    if (reduzido) {
      gsap.set(linhas, { yPercent: 0 });
      tl.to([kicker, sub, rodape, ...itens], { autoAlpha: 1, y: 0, scale: 1, duration: DUR.m, ease: 'none' });
      return tl;
    }
    tl.add(cena.intro(), 0)
      .to(kicker, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0.15)
      .to(linhas, { yPercent: 0, duration: 1.25, ease: EASE.saida, stagger: 0.11 }, 0.2)
      .to(sub, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0.55)
      .to(itens, { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'back.out(1.6)', stagger: 0.13 }, 0.7)
      .to(rodape, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 1.1);
    return tl;
  }

  /** Esconde tudo menos o objeto escolhido (início da transição para uma aba). */
  function saida(objetoEl) {
    const tl = gsap.timeline();
    const outros = itens.filter(i => !i.contains(objetoEl));
    if (reduzido) return tl.to([...outros, kicker, sub, rodape, titulo], { autoAlpha: 0, duration: DUR.p });
    tl.to(outros, { autoAlpha: 0, scale: 0.7, y: 30, duration: DUR.m, ease: EASE.antecipa, stagger: 0.05 }, 0)
      .to(linhas, { yPercent: -115, duration: 0.7, ease: EASE.troca, stagger: 0.05 }, 0)
      .to([kicker, sub, rodape], { autoAlpha: 0, y: -12, duration: DUR.p }, 0)
      .to($('.objeto__rotulo', objetoEl), { autoAlpha: 0, duration: DUR.xs }, 0);
    return tl;
  }

  /** Estado "câmera aproximada" para a volta de uma aba. */
  function prepararVolta(objetoEl) {
    const outros = itens.filter(i => !i.contains(objetoEl));
    gsap.set(outros, { autoAlpha: 0, scale: 0.7, y: 30 });
    gsap.set(linhas, { yPercent: 115 });
    gsap.set([kicker, sub, rodape], { autoAlpha: 0, y: 18 });
    gsap.set($('.objeto__rotulo', objetoEl), { autoAlpha: 0 });
    gsap.set(itens.find(i => i.contains(objetoEl)), { autoAlpha: 1, scale: 1, y: 0 });
  }

  function entradaVolta(objetoEl) {
    const tl = gsap.timeline();
    const outros = itens.filter(i => !i.contains(objetoEl));
    if (reduzido) return tl.to([...outros, kicker, sub, rodape, $('.objeto__rotulo', objetoEl)], { autoAlpha: 1, y: 0, scale: 1, duration: DUR.p }).set(linhas, { yPercent: 0 }, 0);
    tl.to(linhas, { yPercent: 0, duration: 1.1, ease: EASE.saida, stagger: 0.09 }, 0.1)
      .to(outros, { autoAlpha: 1, scale: 1, y: 0, duration: 1, ease: 'back.out(1.5)', stagger: 0.1 }, 0.25)
      .to([kicker, sub, rodape], { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0.35)
      .to($('.objeto__rotulo', objetoEl), { autoAlpha: 1, duration: DUR.m }, 0.6);
    return tl;
  }

  /** Mostra a capa inteira sem animação (deep link / volta genérica). */
  function estadoFinal() {
    if (!linhas.length) dividirTitulo();
    gsap.set(linhas, { yPercent: 0 });
    gsap.set([kicker, sub, rodape, ...itens, ...$$('.objeto__rotulo', el)], { autoAlpha: 1, y: 0, scale: 1 });
    objetos.forEach(o => gsap.set($('.objeto__mag', o), { clearProps: 'transform' }));
  }

  // a quebra do título muda com a largura: refaz as linhas (sem animação)
  let timerResize;
  window.addEventListener('resize', () => {
    clearTimeout(timerResize);
    timerResize = setTimeout(() => { if (ativa) gsap.set(dividirTitulo(), { yPercent: 0 }); }, 200);
  });

  function ativar() {
    if (ativa) return;
    ativa = true;
    flutuacoes.forEach(f => f.play());
    cena.ativar();
    reiniciarOcio();
  }
  function pausar() {
    ativa = false;
    flutuacoes.forEach(f => f.pause());
    cena.pausar();
    clearTimeout(timerOcioso);
    tlDica?.kill();
    objetos.forEach(o => o._apagar?.());
  }

  return {
    tipo: 'capa',
    el,
    cena,
    get titulo() { return C.site.titulo; },
    escura: true,
    objetoDaCategoria: id => objetos.find(o => o.dataset.categoria === id),
    dividirTitulo,
    prepararIntro,
    intro,
    saida,
    prepararVolta,
    entradaVolta,
    estadoFinal,
    ativar,
    pausar,
    get ativa() { return ativa; },
  };
}
