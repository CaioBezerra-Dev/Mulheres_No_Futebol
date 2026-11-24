/* =============================================================================
   MAIN — inicialização, roteador por hash e troca de telas.
   Rotas: #jornalistas  #arbitras  #gestoras  #historia/id  #abertura  #sobre
   (vazio = capa; qualquer outra coisa = 404 temática)
   ============================================================================= */
import {
  C, $, $$, EASE, DUR, t, esc, caminho, categorias, categoria, historia, estado, IDS_ANTIGOS,
  movimentoReduzido, ehToque, anunciar, objetoPicture, aguardar, carregarImagem, dividirLinhas,
} from './base.js';
import { iniciarPreloader } from './preloader.js';

const html = document.documentElement;

// As bibliotecas locais são carregadas com defer, na ordem, pelo index.html.

/* ---------- rotas ---------- */
export function lerRota(hash = window.location.hash) {
  let h = (hash || '').replace(/^#\/?/, '');
  try { h = decodeURIComponent(h); } catch { /* mantém */ }
  h = h.trim().replace(/\/+$/, '');
  if (!h || h === 'capa') return { tipo: 'capa' };
  if (categoria(h)) return { tipo: 'categoria', id: h };
  const m = h.match(/^historia\/([\w-]+)$/);
  if (m) {
    const id = IDS_ANTIGOS[m[1]] || m[1];
    return historia(id) ? { tipo: 'historia', id } : { tipo: '404' };
  }
  if (h === 'sobre') return { tipo: 'sobre' };
  if (h === 'abertura') return { tipo: 'abertura' };
  return { tipo: '404' };
}
const chave = r => `${r.tipo}:${r.id || ''}`;

async function iniciar() {
  // 1) preloader na hora (não depende de biblioteca nenhuma)
  let visitou = false;
  try { visitou = sessionStorage.getItem('mulheres-futebol:visitou') === '1'; sessionStorage.setItem('mulheres-futebol:visitou', '1'); } catch { /* sem sessionStorage */ }
  const pre = iniciarPreloader({ rapido: visitou || ehToque() || !!navigator.connection?.saveData, reduzido: movimentoReduzido(), textos: { carregando: t('carregando'), carregado: t('carregado') } });
  const rotaInicial = lerRota();
  if (document.fonts) {
    pre.acompanhar(document.fonts.load('800 1em "Bricolage Grotesque"'));
    pre.acompanhar(document.fonts.load('500 1em "Inter"'));
  }
  // só o essencial segura o contador: o gramado (maior imagem), o céu e os três objetos
  if (rotaInicial.tipo === 'capa') {
    $$('#tela-capa .gramado__img, #tela-capa .cena__ceu img, #tela-capa .objeto__img').forEach(img => pre.acompanhar(img.decode ? img.decode().catch(() => {}) : null));
  }

  // 2) deixa o navegador pintar antes de montar a cena e buscar a serifa de leitura
  await new Promise(r => requestAnimationFrame(() => setTimeout(r, 0)));
  html.classList.add('fontes-leitura');
  if (document.fonts) {
    if (rotaInicial.tipo !== 'capa') pre.acompanhar(document.fonts.load('400 1em "Source Serif 4"'));
  }
  if (!window.gsap) {
    // sem a biblioteca de animação não há site interativo: abre a capa estática
    html.classList.add('sem-biblioteca');
    await pre.terminar();
    return;
  }
  const { ScrollTrigger, Flip, CustomEase } = window;
  gsap.registerPlugin(...[ScrollTrigger, Flip, CustomEase].filter(Boolean));
  gsap.defaults({ ease: EASE.saida, duration: DUR.m });
  ScrollTrigger.config({ ignoreMobileResize: true });

  // módulos que dependem da GSAP carregam só agora
  const [{ som }, { rolagem, cursor, confete }, { criarCapa }, { criarTela, contadorTexto }, TR, { pausarTodos }] = await Promise.all([
    import('./som.js'), import('./efeitos.js'), import('./capa.js'), import('./telas.js'),
    import('./transicoes.js'), import('./audio.js'),
  ]);
  TR.prepararEases();

  const main = $('#conteudo');
  const topo = $('#topo');
  const dock = $('#dock');
  if (movimentoReduzido()) html.classList.add('movimento-reduzido');

  /* ---------- textos fixos do HTML ---------- */
  $$('[data-texto]').forEach(el => {
    const v = caminho(C, el.dataset.texto);
    if (typeof v === 'string') el.textContent = v;
  });
  $$('[data-rotulo]').forEach(el => {
    const v = caminho(C, el.dataset.rotulo);
    if (typeof v === 'string') el.setAttribute('aria-label', v);
  });
  $('.topo__marca').setAttribute('aria-label', `${C.site.titulo}: ${t('voltarCapa')}`);
  dock.setAttribute('aria-label', t('trocarCategoria'));

  /* ---------- dock ---------- */
  dock.innerHTML = `<div class="dock__trilho">
    <a class="dock__item dock__item--capa" href="#" aria-label="${esc(t('voltarCapa'))}" data-cursor="${esc(t('capa'))}">
      <picture><source type="image/avif" srcset="assets/img/objetos/bola-1x.avif 1x, assets/img/objetos/bola-2x.avif 2x"><img src="assets/img/objetos/bola-1x.webp" srcset="assets/img/objetos/bola-2x.webp 2x" alt="" width="80" height="82" decoding="async"></picture>
      <span class="dock__dica" aria-hidden="true">${esc(t('capa'))}</span>
    </a>
    <span class="dock__divisor" aria-hidden="true"></span>
    ${categorias().map(c => `<a class="dock__item" href="#${esc(c.id)}" data-dock="${esc(c.id)}" aria-label="${esc(c.nome)}" data-cursor="${esc(c.nome.replace(/^(as|os)\s+/i, ''))}">${objetoPicture(c.objeto, { mini: true })}<span class="dock__dica" aria-hidden="true">${esc(c.nome)}</span></a>`).join('')}</div>`;

  const atualizarContador = () => {
    const n = estado.lidas().size, total = C.historias.length;
    $('#contador-lidas').innerHTML = `<span class="lidas-longo">${esc(contadorTexto())}</span><span class="lidas-curto" aria-hidden="true">${n}/${total}</span>`;
  };
  estado.aoMudarLidas(atualizarContador);
  atualizarContador();

  /* ---------- serviços ---------- */
  rolagem.iniciar();
  cursor.iniciar();
  confete.iniciar();
  som.iniciar($('#botao-som'));

  const capa = criarCapa();
  capa.rota = { tipo: 'capa' };
  let telaAtual = null, emTransicao = false, pendente = false, proximaOrigem = null;

  /* ---------- topo, dock, som, título da aba do navegador ---------- */
  let dockVisivel = false;
  function aplicarChrome(tela) {
    html.dataset.tela = tela.tipo;
    topo.classList.toggle('topo--escuro', !!tela.escura);
    topo.classList.toggle('topo--capa', tela.tipo === 'capa');
    topo.classList.remove('is-escondido', 'is-solido');
    dock.classList.remove('is-escondido');
    const catAtual = tela.tipo === 'categoria' ? tela.categoria.id : tela.tipo === 'historia' ? tela.historia.categoria : null;
    $$('.dock__item[data-dock]', dock).forEach(a => {
      const sim = a.dataset.dock === catAtual;
      a.classList.toggle('is-atual', sim);
      if (sim && tela.tipo === 'categoria') a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    const mostrar = tela.tipo !== 'capa';
    if (mostrar !== dockVisivel) {
      dockVisivel = mostrar;
      dock.classList.toggle('is-visivel', mostrar);
      if (movimentoReduzido()) gsap.set(dock, { autoAlpha: mostrar ? 1 : 0, yPercent: 0 });
      else gsap.fromTo(dock, { yPercent: mostrar ? 160 : 0, autoAlpha: mostrar ? 0 : 1 }, { yPercent: mostrar ? 0 : 160, autoAlpha: mostrar ? 1 : 0, duration: DUR.g, ease: mostrar ? EASE.saida : EASE.antecipa, delay: mostrar ? 0.25 : 0, overwrite: true });
    }
    som.definirNivel(tela.tipo === 'capa' ? 'capa' : 'leitura');
    cursor.tema(!!tela.escura);
    document.title = tela.tipo === 'capa' ? `${C.site.titulo} · ${C.site.kicker}` : `${tela.titulo} · ${C.site.titulo}`;
  }

  // na leitura, topo e dock saem do caminho ao rolar para baixo e voltam ao subir
  rolagem.aoRolar((y, dir) => {
    if (!telaAtual || emTransicao) return;
    topo.classList.toggle('is-solido', y > 24 && telaAtual.tipo !== 'capa' && !telaAtual.escura);
    const leitura = ['historia', 'abertura', 'sobre'].includes(telaAtual.tipo);
    const esconder = leitura && dir > 0 && y > 360;
    topo.classList.toggle('is-escondido', esconder);
    dock.classList.toggle('is-escondido', esconder);
  });

  /* ---------- troca de tela ---------- */
  function congelar(tela) {
    const y = rolagem.y();
    Object.assign(tela.el.style, { position: 'fixed', top: `${-y}px`, left: '0', width: '100%' });
    tela.el.classList.add('is-congelada');
    return y;
  }
  function limpar(el) {
    el.classList.remove('is-congelada');
    ['position', 'top', 'left', 'width', 'zIndex'].forEach(p => { el.style[p] = ''; });
    gsap.set(el, { clearProps: 'clipPath,opacity,visibility' });
  }

  async function trocar(de, para, origem) {
    emTransicao = true;
    html.classList.add('em-transicao');
    pausarTodos();
    rolagem.parar();
    const transicao = TR.escolher(de, para, origem);
    if (para.tipo === 'capa') para.el.hidden = false;
    else { main.appendChild(para.el); para.prepararEntrada({ direto: transicao === TR.flipVolta }); }
    const yDe = congelar(de);
    if (transicao !== TR.flipVolta) rolagem.para(0, { imediato: true });

    let cobriu = false;
    const aoCobrir = () => { if (!cobriu) { cobriu = true; aplicarChrome(para); } };
    try {
      await transicao({ de, para, origem, capa, aoCobrir, yDe });
    } catch (erro) {
      console.error('[transição]', erro);
    }
    aoCobrir();

    if (de.tipo === 'capa') {
      capa.pausar();
      capa.el.hidden = true;
      limpar(capa.el);
      gsap.set(capa.cena.raiz, { clearProps: 'transform' });
    } else {
      de.desmontar();
      de.el.remove();
    }
    $$('.ator').forEach(a => a.remove());
    limpar(para.el);
    telaAtual = para;
    if (para.tipo === 'capa') { capa.ativar(); rolagem.parar(); }
    else { para.montar?.(); rolagem.retomar(); }
    ScrollTrigger.refresh();
    rolagem.atualizar();

    const foco = para.tipo === 'capa'
      ? (de.tipo === 'categoria' ? capa.objetoDaCategoria(de.categoria.id) : $('#capa-titulo'))
      : $('h1', para.el);
    foco?.focus({ preventScroll: true });
    anunciar(para.titulo);
    html.classList.remove('em-transicao');
    emTransicao = false;
    cursor.reiniciar();
  }

  async function navegar() {
    if (emTransicao) { pendente = true; return; }
    const rota = lerRota();
    if (telaAtual && chave(rota) === chave(telaAtual.rota)) return;
    const origem = proximaOrigem;
    proximaOrigem = null;
    const para = rota.tipo === 'capa' ? capa : criarTela(rota);
    await trocar(telaAtual, para, origem);
    if (pendente) { pendente = false; navegar(); }
  }

  /* ---------- cliques em links internos ---------- */
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.hasAttribute('data-pular')) {
      e.preventDefault();
      const alvo = telaAtual?.tipo === 'capa' ? $('.objeto', capa.el) : $('h1', telaAtual.el);
      (alvo || main).focus();
      return;
    }
    if (emTransicao) { e.preventDefault(); return; }
    const rota = lerRota(a.getAttribute('href'));
    if (telaAtual && chave(rota) === chave(telaAtual.rota)) {
      e.preventDefault();
      if (telaAtual.tipo !== 'capa') rolagem.para(0, { imediato: movimentoReduzido() });
      return;
    }
    proximaOrigem = a;
    if (rota.tipo === 'categoria' && a.closest('.objeto')) som.apito({ volume: 0.35 });
  });
  window.addEventListener('hashchange', navegar);

  /* ---------- títulos com quebra real de linha: refaz ao redimensionar ---------- */
  let timerResize, larguraAntes = window.innerWidth;
  window.addEventListener('resize', () => {
    clearTimeout(timerResize);
    timerResize = setTimeout(() => {
      if (emTransicao || !telaAtual || Math.abs(window.innerWidth - larguraAntes) < 2) return;
      larguraAntes = window.innerWidth;
      const raiz = telaAtual.el;
      $$('[data-texto-original]', raiz).forEach(el => gsap.set(dividirLinhas(el), { yPercent: 0 }));
      ScrollTrigger.refresh();
    }, 220);
  });

  /* ---------- primeira tela (inclusive deep link) ---------- */
  let inicial;
  if (rotaInicial.tipo === 'capa') {
    inicial = capa;
    capa.el.hidden = false;
    rolagem.parar();
  } else {
    capa.el.hidden = true;
    inicial = criarTela(rotaInicial);
    main.appendChild(inicial.el);
  }
  telaAtual = inicial;
  aplicarChrome(inicial);
  if (inicial !== capa) {
    $$('img', inicial.el).slice(0, 3).forEach(img => pre.acompanhar(img.decode ? img.decode().catch(() => {}) : null));
  }

  await pre.terminar({
    aoRevelar: () => {
      if (inicial === capa) { capa.prepararIntro(); capa.intro(); }
      else { inicial.prepararEntrada(); inicial.entrar(); }
    },
  });

  if (inicial !== capa) rolagem.retomar();
  ScrollTrigger.refresh();
  html.classList.add('pronto');

  // A transição usa a versão maior do objeto. Ela só é baixada quando a pessoa mira
  // aquele objeto (mouse por cima ou foco do teclado), e não para os três em toda visita.
  if (!navigator.connection?.saveData) {
    const pedidos = new Set();
    const preparar = e => {
      const o = e.target.closest?.('.objeto');
      const src = o && TR.srcObjeto2x(o.dataset.objeto, o.querySelector('.objeto__img')?.currentSrc);
      if (src && !pedidos.has(src)) { pedidos.add(src); carregarImagem(src); }
    };
    capa.el.addEventListener('pointerover', preparar);
    capa.el.addEventListener('focusin', preparar);
  }
}

iniciar();
