/* =============================================================================
   TELAS — abas, leitura, abertura, sobre e 404. Cada tela é criada sob demanda
   a partir do conteudo.js e sabe montar/desmontar seus efeitos.
   ============================================================================= */
import {
  C, $, $$, EASE, DUR, STAGGER, t, esc, deHTML, imagem, objetoPicture, ehFotoProvisoria,
  categoria, historia, historiasDa, indiceCategoria, qtdHistorias, tempoLeitura,
  proximaHistoria, sugestoes, estado, dividirLinhas, movimentoReduzido, ehToque, toast, categorias,
} from './base.js';
import { playerHTML, montarPlayers, pausarTodos } from './audio.js';
import { montarGrama, confete, rolagem } from './efeitos.js';
import { som } from './som.js';

const SETA = '<svg class="seta" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h15m-6-6 6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const SETA_ESQ = '<svg class="seta seta--esq" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 12H5m6-6-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const CHECK = '<svg class="selo__icone" viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const COMPARTILHAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3m0 0L7.5 7.5M12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const ficha = rot => C.creditos?.ficha?.find(f => f.rotulo.toLowerCase().includes(rot))?.valor || '';

/* =============================== TEXTO =============================== */
const RE_MARCADOR = /\[\[(audio|olho|foto):((?:(?!\]\]).)*)\]\]/g;

export function renderizarTexto(paragrafos, { capitular = true } = {}) {
  const blocos = [];
  for (const bruto of paragrafos) {
    const s = String(bruto).trim();
    if (!s) continue;
    let ultimo = 0, m;
    RE_MARCADOR.lastIndex = 0;
    while ((m = RE_MARCADOR.exec(s))) {
      const antes = s.slice(ultimo, m.index).trim();
      if (antes) blocos.push({ tipo: 'texto', s: antes });
      blocos.push({ tipo: m[1], partes: m[2].split('|').map(p => p.trim()) });
      ultimo = m.index + m[0].length;
    }
    const resto = s.slice(ultimo).trim();
    if (resto) blocos.push({ tipo: 'texto', s: resto });
  }
  let primeiro = capitular;
  return blocos.map(b => {
    if (b.tipo === 'audio') return playerHTML(b.partes[0], b.partes[1] || '', b.partes.slice(2).join(' | '));
    if (b.tipo === 'olho') {
      const texto = b.partes[0], autoria = b.partes[1];
      const fala = /^[“"‘]/.test(texto);
      return `<figure class="olho${fala ? ' olho--fala' : ''}"><blockquote class="olho__texto"><p>${esc(texto)}</p></blockquote>${autoria ? `<figcaption class="olho__autoria">${esc(autoria)}</figcaption>` : ''}</figure>`;
    }
    if (b.tipo === 'foto') {
      return `<figure class="foto-texto">${imagem(b.partes[0], { alt: b.partes[1] || '' })}${b.partes[1] ? `<figcaption>${esc(b.partes[1])}</figcaption>` : ''}</figure>`;
    }
    const s = b.s;
    if (s.startsWith('## ')) return `<h2 class="intertitulo">${esc(s.slice(3))}</h2>`;
    if (/^[“"]/.test(s)) return `<blockquote class="fala"><p>${esc(s)}</p></blockquote>`;
    if (primeiro) { primeiro = false; return `<p class="capitular">${esc(s)}</p>`; }
    return `<p>${esc(s)}</p>`;
  }).join('\n');
}

/* =============================== PEÇAS COMUNS =============================== */
function rodapeGramado() {
  const autora = ficha('reportagem') || 'Rebecca Crecci';
  const ano = ficha('ano');
  return `<footer class="rodape-gramado">
    <canvas class="rodape-gramado__grama" aria-hidden="true"></canvas>
    <div class="rodape-gramado__faixa">
      <div class="rodape-gramado__conteudo">
        <a class="link-discreto link-discreto--claro" href="#sobre">${esc(t('sobre'))}</a>
        <p class="rodape-gramado__assinatura">${esc(autora)}${ano ? ` · ${esc(ano)}` : ''}</p>
      </div>
    </div>
  </footer>`;
}

function progressoHTML() {
  return `<div class="progresso" role="progressbar" aria-label="${esc(t('progressoLeitura'))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><span class="progresso__barra"></span></div>`;
}

function montarProgresso(el, alvo) {
  const barra = $('.progresso__barra', el), pb = $('.progresso', el);
  if (!barra) return;
  const set = gsap.quickSetter(barra, 'scaleX');
  let ultimo = -1;
  ScrollTrigger.create({
    trigger: alvo, start: 'top top', end: 'bottom bottom',
    onUpdate(self) {
      set(self.progress);
      const v = Math.round(self.progress * 100);
      if (v !== ultimo) { ultimo = v; pb.setAttribute('aria-valuenow', String(v)); }
    },
  });
}

function revelarAoRolar(alvos, { y = 28, inicio = 'top 88%' } = {}) {
  if (!alvos.length) return;
  if (movimentoReduzido()) return;
  gsap.set(alvos, { autoAlpha: 0, y });
  ScrollTrigger.batch(alvos, {
    start: inicio,
    once: true,
    onEnter: lote => gsap.to(lote, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida, stagger: 0.08, overwrite: true }),
  });
}

function montarRodape(el) {
  const canvas = $('.rodape-gramado__grama', el);
  return canvas ? montarGrama(canvas) : () => {};
}

async function compartilhar(h) {
  const url = window.location.href;
  const dados = { title: h ? h.titulo : C.site.titulo, text: h ? t('compartilharTexto', { nome: h.nome }) : C.site.subtitulo, url };
  if (navigator.share) {
    try { await navigator.share(dados); return; } catch (e) { if (e?.name === 'AbortError') return; }
  }
  try { await navigator.clipboard.writeText(url); toast(t('linkCopiado')); }
  catch { toast(t('linkErro')); }
}

/** Botões com leve atração magnética (só mouse). */
function magnetizar(raiz) {
  if (ehToque() || movimentoReduzido()) return;
  $$('.botao', raiz).forEach(b => {
    const qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' });
    const qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
    b.addEventListener('pointermove', e => {
      const r = b.getBoundingClientRect();
      qx((e.clientX - r.left - r.width / 2) * 0.22);
      qy((e.clientY - r.top - r.height / 2) * 0.3);
    });
    b.addEventListener('pointerleave', () => { qx(0); qy(0); });
  });
}

function baseTela({ tipo, rota, el, titulo, escura = false, nivelSom = 'leitura' }) {
  const limpezas = [];
  let ctx = null, montada = false;
  return {
    tipo, rota, el, titulo, escura, nivelSom,
    limpezas,
    montarCom(fn) {
      if (montada) return;
      montada = true;
      ctx = gsap.context(() => fn(limpezas), el);
    },
    desmontar() {
      pausarTodos();
      limpezas.forEach(f => { try { f(); } catch { /* segue */ } });
      limpezas.length = 0;
      ctx?.revert();
      ctx = null;
    },
  };
}

/* =============================== CATEGORIA (ABA) =============================== */
function cardHTML(h, i, lida) {
  const min = tempoLeitura(h);
  const rotulo = `${h.nome}: ${h.titulo}. ${t('leituraMin', { n: min })}${lida ? `. ${t('lida')}` : ''}`;
  return `<li class="card-item">
    <a class="card${lida ? ' is-lida' : ''}" href="#historia/${esc(h.id)}" data-historia="${esc(h.id)}" data-cursor="${esc(t('lerHistoria'))}" aria-label="${esc(rotulo)}">
      <span class="card__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span>
      <span class="card__fig" data-flip-foto>
        ${imagem(h.foto, { alt: '', classe: 'card__img', estilo: `object-position:${h.fotoPosicao || '50% 30%'}` })}
        <span class="card__brilho" aria-hidden="true"></span>
      </span>
      <span class="card__corpo">
        <span class="card__funcao">${esc(h.funcao)}</span>
        <span class="card__nome">${esc(h.nome)}</span>
        <span class="card__titulo">${esc(h.titulo)}</span>
        <span class="card__frase">${esc(h.destaque)}</span>
        <span class="card__meta"><span>${esc(t('leituraMin', { n: min }))}</span><span class="card__ler">${esc(t('lerHistoria'))}${SETA}</span></span>
      </span>
      <span class="card__selo"${lida ? '' : ' hidden'}>${CHECK}${esc(t('lida'))}</span>
    </a>
  </li>`;
}

function inclinarCards(raiz) {
  if (ehToque() || movimentoReduzido()) return;
  $$('.card', raiz).forEach(card => {
    const fig = $('.card__fig', card);
    const rx = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
    const ry = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
    const brilho = $('.card__brilho', card);
    gsap.set(card, { transformPerspective: 1100 });
    card.addEventListener('pointerenter', () => gsap.to(card, { y: -10, duration: DUR.m, ease: EASE.suave }));
    card.addEventListener('pointermove', e => {
      const r = fig.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5, py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * 7); ry(px * 9);
      brilho.style.setProperty('--bx', `${(px + 0.5) * 100}%`);
      brilho.style.setProperty('--by', `${(py + 0.5) * 100}%`);
    });
    card.addEventListener('pointerleave', () => { rx(0); ry(0); gsap.to(card, { y: 0, duration: DUR.g, ease: EASE.saida }); });
  });
}

function telaCategoria(id) {
  const cat = categoria(id);
  if (!cat) return telaNaoEncontrada();
  const idx = indiceCategoria(id);
  const lista = historiasDa(id);
  const lidas = estado.lidas();
  const el = deHTML(`<section class="tela tela--aba tela--clara" data-tela="categoria" data-categoria="${esc(cat.id)}" aria-labelledby="titulo-${esc(cat.id)}">
    <header class="aba__topo">
      <p class="aba__kicker"><span>${esc(t('capitulo', { n: idx + 1 }))}</span><span class="aba__ponto" aria-hidden="true"></span><span>${esc(cat.capitulo)}</span><span class="aba__ponto" aria-hidden="true"></span><span>${esc(qtdHistorias(cat.id))}</span></p>
      <h1 class="aba__titulo" id="titulo-${esc(cat.id)}" tabindex="-1" aria-label="${esc(cat.nome)}">${(cat.linhas || [cat.nome]).map((l, i, arr) => `<span class="linha${i === 0 && arr.length > 1 ? ' linha--artigo' : ''}" aria-hidden="true"><span class="linha__in">${esc(l)}</span></span>`).join('')}</h1>
      <div class="aba__objeto" data-objeto="${esc(cat.objeto)}" aria-hidden="true"><div class="aba__objeto-flut">${objetoPicture(cat.objeto, { classe: 'aba__objeto-img' })}</div></div>
      <div class="aba__intro">${cat.intro.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <a class="link-seta aba__abertura" href="#abertura"><span>${esc(t('comecarAbertura'))}</span>${SETA}</a>
    </header>
    <ol class="aba__cards" data-qtd="${lista.length}" role="list">${lista.map((h, i) => cardHTML(h, i, lidas.has(h.id))).join('')}</ol>
    ${rodapeGramado()}
  </section>`);

  const tela = baseTela({ tipo: 'categoria', rota: { tipo: 'categoria', id }, el, titulo: cat.nome });
  const linhas = $$('.linha__in', el);
  const kicker = $('.aba__kicker', el);
  const intro = [...$$('.aba__intro p', el), $('.aba__abertura', el)];
  const cards = $$('.card-item', el);
  const objeto = $('.aba__objeto', el);

  Object.assign(tela, {
    categoria: cat,
    get alvoObjeto() { return $('.aba__objeto-img', el); },
    objetoWrap: objeto,
    cardDe: hid => $(`.card[data-historia="${hid}"]`, el),
    prepararEntrada() {
      if (movimentoReduzido()) return;
      gsap.set(linhas, { yPercent: 115 });
      gsap.set(kicker, { autoAlpha: 0, y: 14 });
      gsap.set(intro, { autoAlpha: 0, y: 24 });
      gsap.set(cards, { autoAlpha: 0, y: 90, rotation: 1.2 });
    },
    entrar() {
      const tl = gsap.timeline({ onStart: () => tela.montar() });
      if (movimentoReduzido()) return tl;
      tl.to(linhas, { yPercent: 0, duration: 1.15, ease: EASE.saida, stagger: 0.1 }, 0)
        .to(kicker, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0.1)
        .to(intro, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida, stagger: STAGGER * 1.5 }, 0.35);
      return tl;
    },
    montar() {
      tela.montarCom(limpezas => {
        if (!movimentoReduzido()) {
          // flutuação do objeto do cabeçalho
          gsap.to($('.aba__objeto-flut', el), { y: -14, rotation: 3, duration: 3.2, ease: 'sine.inOut', yoyo: true, repeat: -1 });
          // cards em stagger conforme entram na tela
          ScrollTrigger.batch(cards, {
            start: 'top 94%', once: true,
            onEnter: lote => gsap.to(lote, { autoAlpha: 1, y: 0, rotation: 0, duration: 1.1, ease: EASE.saida, stagger: 0.13, overwrite: true }),
          });
          // o objeto gira de leve com a rolagem
          gsap.to(objeto, { yPercent: 18, rotation: -6, ease: 'none', scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } });
        } else {
          gsap.set(cards, { autoAlpha: 1, y: 0, rotation: 0 });
        }
        inclinarCards(el);
        limpezas.push(montarRodape(el));
      });
    },
  });
  return tela;
}

/* =============================== HISTÓRIA =============================== */
function sugestaoHTML(s) {
  const cat = categoria(s.categoria);
  return `<li><a class="sugestao" href="#historia/${esc(s.id)}" data-historia="${esc(s.id)}" data-cursor="${esc(t('lerHistoria'))}">
    <span class="sugestao__foto">${imagem(s.foto, { alt: '', estilo: `object-position:${s.fotoPosicao || '50% 30%'}` })}</span>
    <span class="sugestao__textos">
      <span class="sugestao__cat">${esc(cat?.nome || '')}</span>
      <span class="sugestao__nome">${esc(s.nome)}</span>
      <span class="sugestao__titulo">${esc(s.titulo)}</span>
    </span>
    ${estado.foiLida(s.id) ? `<span class="sugestao__lida">${CHECK}${esc(t('lida'))}</span>` : ''}
  </a></li>`;
}

function contadorTexto() {
  const total = C.historias.length, n = estado.lidas().size;
  if (n >= total) return t('lidasTodas', { total });
  if (!n) return t('lidasNenhuma', { total });
  return t('lidasContador', { n, total });
}

function telaHistoria(id) {
  const h = historia(id);
  if (!h) return telaNaoEncontrada();
  const cat = categoria(h.categoria);
  const min = tempoLeitura(h);
  const provisoria = ehFotoProvisoria(h.foto);
  const prox = proximaHistoria(h.id);
  const sugs = sugestoes(h.id, 2);
  const pos = h.fotoPosicao || '50% 30%';

  const el = deHTML(`<article class="tela tela--historia tela--clara" data-tela="historia" data-historia="${esc(h.id)}" data-categoria="${esc(h.categoria)}" aria-labelledby="titulo-${esc(h.id)}">
    ${progressoHTML()}
    <header class="historia__topo">
      <div class="historia__textos">
        <p class="historia__kicker"><a class="historia__cat" href="#${esc(cat.id)}">${objetoPicture(cat.objeto, { mini: true, classe: 'historia__cat-obj' })}<span>${esc(cat.nome)}</span></a><span class="aba__ponto" aria-hidden="true"></span><span>${esc(t('leituraMin', { n: min }))}</span></p>
        <h1 class="historia__titulo" id="titulo-${esc(h.id)}" tabindex="-1">${esc(h.titulo)}</h1>
        <p class="historia__pessoa"><strong>${esc(h.nome)}</strong><span>${esc(h.funcao)}</span></p>
        <button class="historia__rolar" type="button" data-rolar-texto><span class="historia__rolar-linha" aria-hidden="true"></span><span>Role para ler</span></button>
      </div>
      <figure class="historia__foto">
        <span class="historia__moldura" data-flip-foto>${imagem(h.foto, { alt: h.fotoAlt || `Foto de ${h.nome}`, classe: 'historia__img', lazy: false, prioridade: 'high', estilo: `object-position:${pos}` })}</span>
        ${provisoria ? `<figcaption class="historia__legenda-foto">${esc(t('fotoProvisoria', { nome: h.nome }))}</figcaption>` : (h.fotoCredito ? `<figcaption class="historia__legenda-foto">${esc(h.fotoCredito)}</figcaption>` : '')}
      </figure>
    </header>
    <div class="historia__corpo" data-corpo>${renderizarTexto(h.texto)}</div>
    <section class="historia__fim" aria-labelledby="fim-${esc(h.id)}">
      <div class="fim__objeto" aria-hidden="true">${objetoPicture(cat.objeto, { lazy: true })}</div>
      <p class="fim__kicker">${esc(t('fimHistoria'))}</p>
      <h2 class="fim__titulo" id="fim-${esc(h.id)}">${esc(t('fimMensagem'))}</h2>
      <p class="fim__contador" data-contador-fim></p>
      <div class="fim__acoes">
        <button class="botao botao--primario" type="button" data-compartilhar>${COMPARTILHAR}<span>${esc(t('compartilhar'))}</span></button>
        <a class="botao botao--contorno" href="#${esc(cat.id)}" data-voltar-historias>${SETA_ESQ}<span>${esc(t('voltarHistorias'))}</span></a>
        <a class="botao botao--claro" href="#historia/${esc(prox.id)}" data-proxima><span>${esc(t('proximaHistoria'))}<small>${esc(prox.nome)}</small></span>${SETA}</a>
      </div>
      <div class="fim__sugestoes">
        <h3 class="fim__sugestoes-titulo">${esc(t('lerOutra'))}</h3>
        <ul class="sugestoes" role="list">${sugs.map(sugestaoHTML).join('')}</ul>
      </div>
    </section>
    ${rodapeGramado()}
  </article>`);

  const tela = baseTela({ tipo: 'historia', rota: { tipo: 'historia', id }, el, titulo: `${h.titulo} · ${h.nome}` });
  const tituloEl = $('.historia__titulo', el);
  const kicker = $('.historia__kicker', el);
  const pessoa = $('.historia__pessoa', el);
  const rolar = $('.historia__rolar', el);
  const legenda = $('.historia__legenda-foto', el);
  let linhas = [];

  Object.assign(tela, {
    historia: h,
    categoria: cat,
    get fotoHero() { return $('.historia__moldura', el); },
    prepararEntrada() {
      linhas = dividirLinhas(tituloEl);
      if (movimentoReduzido()) return;
      gsap.set(linhas, { yPercent: 115 });
      gsap.set([kicker, pessoa, rolar, legenda].filter(Boolean), { autoAlpha: 0, y: 16 });
    },
    entrar() {
      const tl = gsap.timeline({ onStart: () => tela.montar() });
      if (movimentoReduzido()) return tl;
      tl.to(kicker, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0)
        .to(linhas, { yPercent: 0, duration: 1.15, ease: EASE.saida, stagger: 0.09 }, 0.05)
        .to(pessoa, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0.35)
        .to([rolar, legenda].filter(Boolean), { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0.55);
      return tl;
    },
    montar() {
      tela.montarCom(limpezas => {
        estado.marcarLida(h.id);
        const corpo = $('[data-corpo]', el);
        montarProgresso(el, el);
        revelarAoRolar($$(':scope > *', corpo));
        limpezas.push(montarPlayers(corpo));
        limpezas.push(montarRodape(el));
        magnetizar(el);

        // parallax suave na foto
        if (!movimentoReduzido()) {
          gsap.fromTo($('.historia__img', el), { yPercent: 0, scale: 1.04 }, { yPercent: 6, scale: 1.1, ease: 'none', scrollTrigger: { trigger: $('.historia__topo', el), start: 'top top', end: 'bottom top', scrub: true } });
        }

        rolar.addEventListener('click', () => {
          const alvo = corpo.getBoundingClientRect().top + rolagem.y() - 72;
          rolagem.para(alvo, { imediato: movimentoReduzido(), duracao: 1.4 });
        });

        // fechamento: contador, celebração (uma vez por visita)
        const fim = $('.historia__fim', el);
        $('[data-contador-fim]', el).textContent = contadorTexto();
        const objFim = $('.fim__objeto', el);
        let celebrou = false;
        ScrollTrigger.create({
          trigger: fim, start: 'top 65%', once: true,
          onEnter: () => {
            if (celebrou) return;
            celebrou = true;
            $('[data-contador-fim]', el).textContent = contadorTexto();
            if (movimentoReduzido()) return;
            gsap.fromTo(objFim, { scale: 0.4, rotation: -30, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 1.1, ease: 'back.out(2)' });
            const r = objFim.getBoundingClientRect();
            setTimeout(() => confete.explodir({ x: r.left + r.width / 2, y: r.top + r.height / 2, n: 70, forca: 0.85 }), 260);
            if (cat.objeto === 'apito') som.apito({ longo: true, volume: 0.35 });
          },
        });
        revelarAoRolar([$('.fim__kicker', el), $('.fim__titulo', el), $('.fim__contador', el), $('.fim__acoes', el), ...$$('.sugestoes li', el)], { y: 24, inicio: 'top 92%' });

        $('[data-compartilhar]', el).addEventListener('click', () => compartilhar(h));
      });
    },
  });
  return tela;
}

/* =============================== ABERTURA =============================== */
function telaAbertura() {
  const a = C.abertura;
  const el = deHTML(`<article class="tela tela--abertura tela--clara" data-tela="abertura" aria-labelledby="titulo-abertura">
    ${progressoHTML()}
    <header class="abertura__topo">
      <p class="abertura__kicker">${esc(a.kicker)}</p>
      <h1 class="abertura__titulo" id="titulo-abertura" tabindex="-1">${esc(a.titulo)}</h1>
      <div class="abertura__objetos" aria-hidden="true">${categorias().map(c => `<span class="abertura__obj abertura__obj--${esc(c.objeto)}">${objetoPicture(c.objeto)}</span>`).join('')}</div>
    </header>
    <div class="historia__corpo abertura__corpo" data-corpo>${renderizarTexto(a.texto)}</div>
    <section class="abertura__convite" aria-labelledby="convite-titulo">
      <h2 class="abertura__convite-titulo" id="convite-titulo">${esc(a.convite)}</h2>
      <ul class="convite" role="list">${categorias().map(c => `<li><a class="convite__item" href="#${esc(c.id)}" data-cursor="${esc(c.nome.replace(/^(as|os)\s+/i, ''))}"><span class="convite__obj" data-ator>${objetoPicture(c.objeto, { lazy: true })}</span><span class="convite__nome">${esc(c.nome)}</span><span class="convite__qtd">${esc(qtdHistorias(c.id))}</span></a></li>`).join('')}</ul>
    </section>
    ${rodapeGramado()}
  </article>`);
  const tela = baseTela({ tipo: 'abertura', rota: { tipo: 'abertura' }, el, titulo: a.titulo });
  const tituloEl = $('.abertura__titulo', el), kicker = $('.abertura__kicker', el), objs = $$('.abertura__obj', el);
  let linhas = [];
  Object.assign(tela, {
    prepararEntrada() {
      linhas = dividirLinhas(tituloEl);
      if (movimentoReduzido()) return;
      gsap.set(linhas, { yPercent: 115 });
      gsap.set(kicker, { autoAlpha: 0, y: 14 });
      gsap.set(objs, { autoAlpha: 0, scale: 0.5, y: 40 });
    },
    entrar() {
      const tl = gsap.timeline({ onStart: () => tela.montar() });
      if (movimentoReduzido()) return tl;
      tl.to(kicker, { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0)
        .to(linhas, { yPercent: 0, duration: 1.2, ease: EASE.saida, stagger: 0.08 }, 0.05)
        .to(objs, { autoAlpha: 1, scale: 1, y: 0, duration: 1.1, ease: 'back.out(1.7)', stagger: 0.12 }, 0.4);
      return tl;
    },
    montar() {
      tela.montarCom(limpezas => {
        const corpo = $('[data-corpo]', el);
        montarProgresso(el, el);
        revelarAoRolar($$(':scope > *', corpo));
        revelarAoRolar($$('.convite li', el), { y: 50 });
        limpezas.push(montarPlayers(corpo));
        limpezas.push(montarRodape(el));
        if (!movimentoReduzido()) {
          objs.forEach((o, i) => gsap.to(o, { y: -12, rotation: i % 2 ? 4 : -4, duration: 2.6 + i * 0.4, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.4 + i * 0.2 }));
          // o decreto de 1941 pesa: o olho escurece a página ao passar
          const olho = $('.olho', corpo);
          if (olho) gsap.fromTo(olho, { '--tinta-olho': 0 }, { '--tinta-olho': 1, ease: 'none', scrollTrigger: { trigger: olho, start: 'top 80%', end: 'center 45%', scrub: true } });
        }
      });
    },
  });
  return tela;
}

/* =============================== SOBRE (SÚMULA) =============================== */
function telaSobre() {
  const cr = C.creditos;
  const email = cr.contatoEmail || '';
  const emailValido = /^[^\s@[\]]+@[^\s@[\]]+\.[^\s@[\]]+$/.test(email);
  const emailHTML = emailValido ? `<a href="mailto:${esc(email)}">${esc(email)}</a>` : '';
  const el = deHTML(`<section class="tela tela--sobre tela--clara" data-tela="sobre" aria-labelledby="titulo-sobre">
    <div class="sumula">
      <header class="sumula__topo">
        <p class="sumula__kicker">${esc(cr.kicker)}</p>
        <h1 class="sumula__titulo" id="titulo-sobre" tabindex="-1">${esc(cr.titulo)}</h1>
      </header>
      <div class="sumula__apresentacao">${cr.apresentacao.map(p => `<p>${esc(p)}</p>`).join('')}</div>
      <div class="sumula__folha">
        <div class="sumula__cabecalho" aria-hidden="true"><span>${esc(cr.kicker)}</span><span>${esc(C.site.titulo)}</span><span>${esc(ficha('ano'))}</span></div>
        <dl class="sumula__campos">${cr.ficha.filter(f => f.valor.trim()).map(f => `<div class="campo"><dt class="campo__rotulo">${esc(f.rotulo)}</dt><dd class="campo__valor">${f.link ? `<a class="campo__link" href="${esc(f.link)}" target="_blank" rel="noopener noreferrer">${esc(f.valor)}<span aria-hidden="true"> ↗</span></a>` : esc(f.valor)}</dd></div>`).join('')}</dl>
        <div class="sumula__escalacao">
          <h2 class="sumula__subtitulo">${esc(cr.entrevistadasTitulo)}</h2>
          <ol class="escalacao" role="list">${C.historias.map((h, i) => `<li class="escalacao__item"><span class="escalacao__num" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><a class="escalacao__nome" href="#historia/${esc(h.id)}">${esc(h.nome)}</a><span class="escalacao__funcao">${esc(h.funcao)}</span></li>`).join('')}</ol>
        </div>
        ${cr.agradecimentos || emailValido ? `<div class="sumula__rodape">
          ${cr.agradecimentos ? `<div class="sumula__bloco"><h2 class="sumula__subtitulo">${esc(cr.agradecimentosTitulo)}</h2><p>${esc(cr.agradecimentos)}</p></div>` : ''}
          ${emailValido ? `<div class="sumula__bloco"><h2 class="sumula__subtitulo">${esc(cr.contatoTitulo)}</h2><p>${esc(cr.contatoTexto)} ${emailHTML}</p></div>` : ''}
        </div>` : ''}
        <div class="sumula__assinatura"><span class="sumula__assinatura-nome">${esc(ficha('reportagem'))}</span><span class="sumula__assinatura-linha">Assinatura da autora</span></div>
      </div>
    </div>
    ${rodapeGramado()}
  </section>`);
  const tela = baseTela({ tipo: 'sobre', rota: { tipo: 'sobre' }, el, titulo: cr.titulo });
  const tituloEl = $('.sumula__titulo', el);
  let linhas = [];
  Object.assign(tela, {
    prepararEntrada() {
      linhas = dividirLinhas(tituloEl);
      if (movimentoReduzido()) return;
      gsap.set(linhas, { yPercent: 115 });
      gsap.set([$('.sumula__kicker', el), $('.sumula__apresentacao', el)], { autoAlpha: 0, y: 16 });
      gsap.set($('.sumula__folha', el), { autoAlpha: 0, y: 70, rotation: -1.5 });
    },
    entrar() {
      const tl = gsap.timeline({ onStart: () => tela.montar() });
      if (movimentoReduzido()) return tl;
      tl.to($('.sumula__kicker', el), { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0)
        .to(linhas, { yPercent: 0, duration: 1.15, ease: EASE.saida, stagger: 0.09 }, 0.05)
        .to($('.sumula__apresentacao', el), { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida }, 0.3)
        .to($('.sumula__folha', el), { autoAlpha: 1, y: 0, rotation: -0.6, duration: 1.2, ease: EASE.saida }, 0.4);
      return tl;
    },
    montar() {
      tela.montarCom(limpezas => {
        revelarAoRolar($$('.campo, .escalacao__item, .sumula__bloco', el), { y: 18, inicio: 'top 95%' });
        limpezas.push(montarRodape(el));
      });
    },
  });
  return tela;
}

/* =============================== 404 =============================== */
function telaNaoEncontrada() {
  const el = deHTML(`<section class="tela tela--erro" data-tela="404" aria-labelledby="titulo-404">
    <div class="erro">
      <div class="erro__bandeira" aria-hidden="true">${imagem('assets/img/objetos/bandeira', { alt: '', lazy: false })}</div>
      <p class="erro__kicker">${esc(t('naoEncontradaKicker'))}</p>
      <h1 class="erro__titulo" id="titulo-404" tabindex="-1">${esc(t('naoEncontradaTitulo'))}</h1>
      <p class="erro__texto">${esc(t('naoEncontradaTexto'))}</p>
      <a class="botao botao--primario" href="#">${SETA_ESQ}<span>${esc(t('voltarCapa'))}</span></a>
    </div>
  </section>`);
  const tela = baseTela({ tipo: '404', rota: { tipo: '404' }, el, titulo: t('naoEncontradaTitulo'), escura: true, nivelSom: 'leitura' });
  const bandeira = $('.erro__bandeira', el);
  Object.assign(tela, {
    prepararEntrada() {
      if (movimentoReduzido()) return;
      gsap.set(bandeira, { rotation: -70, yPercent: 40, autoAlpha: 0, transformOrigin: '12% 92%' });
      gsap.set($$('.erro > :not(.erro__bandeira)', el), { autoAlpha: 0, y: 20 });
    },
    entrar() {
      const tl = gsap.timeline({ onStart: () => tela.montar() });
      if (movimentoReduzido()) return tl;
      tl.to(bandeira, { rotation: 0, yPercent: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(2.4)' }, 0)
        .to($$('.erro > :not(.erro__bandeira)', el), { autoAlpha: 1, y: 0, duration: DUR.g, ease: EASE.saida, stagger: 0.08 }, 0.25)
        .add(() => som.apito({ volume: 0.3 }), 0.1);
      return tl;
    },
    montar() {
      tela.montarCom(() => {
        if (!movimentoReduzido()) gsap.to(bandeira, { rotation: 7, duration: 0.42, ease: 'sine.inOut', yoyo: true, repeat: -1, transformOrigin: '12% 92%' });
        magnetizar(el);
      });
    },
  });
  return tela;
}

/* =============================== FÁBRICA =============================== */
export function criarTela(rota) {
  switch (rota.tipo) {
    case 'categoria': return telaCategoria(rota.id);
    case 'historia': return telaHistoria(rota.id);
    case 'abertura': return telaAbertura();
    case 'sobre': return telaSobre();
    default: return telaNaoEncontrada();
  }
}

export { contadorTexto };
