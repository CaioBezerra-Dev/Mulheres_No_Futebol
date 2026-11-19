/* =============================================================================
   ÁUDIO — player customizado para os trechos de entrevista.
   Usa <audio> nativo e não depende do som do estádio: toca com ele ligado ou
   desligado. Um toca por vez; o ambiente do estádio, se estiver ligado, abaixa.
   Nada é baixado antes do play (preload="none"): duração e onda vêm de js/midia.js.
   ============================================================================= */
import { esc, t, aleatorio, movimentoReduzido, clamp } from './base.js';
import { AUDIOS } from './midia.js';
import { som } from './som.js';

const tocando = new Set();
const VELOCIDADES = [1, 1.25, 1.5];
const fmtVel = v => `${String(v).replace('.', ',')}x`;
const fmtTempo = s => {
  if (!Number.isFinite(s)) return '0:00';
  s = Math.max(0, Math.floor(s));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};
const resumo = s => String(s).split(/(?<=[.!?])\s/)[0];

const TIPOS = { webm: 'audio/webm; codecs="opus"', m4a: 'audio/mp4', mp4: 'audio/mp4', mp3: 'audio/mpeg', ogg: 'audio/ogg', wav: 'audio/wav' };
const idAudio = arq => String(arq).trim().split('/').pop().replace(/\.[a-z0-9]+$/i, '');

/**
 * Fontes de um trecho. "carla-pessoa" usa os arquivos otimizados pelo script
 * (Opus em WebM e, como reserva, AAC em M4A); "arquivo.mp3" usa o arquivo direto.
 * O navegador fica com a primeira fonte que consegue tocar.
 */
export function fontesAudio(arquivo) {
  const nome = String(arquivo).trim();
  const ext = nome.match(/\.([a-z0-9]+)$/i)?.[1]?.toLowerCase();
  const caminho = nome.includes('/') ? nome : `assets/audio/${nome}`;
  if (ext) return [{ src: caminho, tipo: TIPOS[ext] || '' }];
  return [{ src: `${caminho}.webm`, tipo: TIPOS.webm }, { src: `${caminho}.m4a`, tipo: TIPOS.m4a }];
}

let contador = 0;
export function playerHTML(arquivo, legenda = '', transcricao = '') {
  const id = `audio-${++contador}`;
  const info = AUDIOS[idAudio(arquivo)];
  const nome = legenda ? `: ${resumo(legenda)}` : '';
  const total = fmtTempo(info?.dur ?? NaN);
  return `<figure class="audio" data-audio id="${id}" data-arquivo="${esc(String(arquivo).trim())}">
    <div class="audio__linha">
      <button class="audio__play" type="button" aria-label="${esc(t('audioTocar') + nome)}" data-rotulo-tocar="${esc(t('audioTocar') + nome)}" data-rotulo-pausar="${esc(t('audioPausar') + nome)}">
        <svg class="audio__icone audio__icone--play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L18.8 12z"/></svg>
        <svg class="audio__icone audio__icone--pausa" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 5h3.7v14H6.8zM13.5 5h3.7v14h-3.7z"/></svg>
        <span class="audio__giro" aria-hidden="true"></span>
      </button>
      <div class="audio__onda" role="slider" tabindex="0" aria-label="${esc(t('audioPosicao'))}" aria-valuemin="0" aria-valuemax="${info ? Math.round(info.dur) : 0}" aria-valuenow="0" aria-valuetext="0:00 de ${total}"></div>
      <p class="audio__tempo"><span data-atual>0:00</span><span class="audio__barra-tempo" aria-hidden="true">/</span><span data-total>${total}</span></p>
      <button class="audio__vel" type="button" aria-label="${esc(t('audioVelocidade', { v: '1x' }))}">1x</button>
    </div>
    ${legenda ? `<figcaption class="audio__legenda">${esc(legenda)}</figcaption>` : ''}
    ${transcricao ? `<details class="audio__transcricao"><summary>${esc(t('audioTranscricao'))}</summary><p>${esc(transcricao)}</p></details>` : ''}
    <p class="audio__erro" role="alert" hidden>${esc(t('audioErro'))}</p>
  </figure>`;
}

export function pausarTodos() { tocando.forEach(a => a.pause()); }

export function montarPlayers(raiz) {
  const limpezas = [...raiz.querySelectorAll('[data-audio]')].map(montar);
  return () => limpezas.forEach(f => f());
}

/** Reduz a onda do manifesto a n barras (pico de cada faixa), com altura mínima visível. */
function alturasDaOnda(onda, n) {
  return Array.from({ length: n }, (_, i) => {
    const ini = Math.floor((i * onda.length) / n), fim = Math.max(ini + 1, Math.floor(((i + 1) * onda.length) / n));
    return 0.14 + 0.86 * Math.max(...onda.slice(ini, fim));
  });
}

function montar(fig) {
  const arquivo = fig.dataset.arquivo || '';
  const info = AUDIOS[idAudio(arquivo)];
  const play = fig.querySelector('.audio__play');
  const onda = fig.querySelector('.audio__onda');
  const atual = fig.querySelector('[data-atual]');
  const total = fig.querySelector('[data-total]');
  const vel = fig.querySelector('.audio__vel');
  const erro = fig.querySelector('.audio__erro');

  // O <audio> é criado aqui, direto no documento da página (e não dentro do <template>
  // usado para montar a tela): é o caminho mais seguro para tocar em todos os navegadores.
  const audio = document.createElement('audio');
  audio.preload = 'none';
  for (const f of fontesAudio(arquivo)) {
    const s = document.createElement('source');
    s.src = f.src;
    if (f.tipo) s.type = f.tipo;
    audio.appendChild(s);
  }
  fig.prepend(audio);

  // barras da onda: o volume real do trecho ou, sem manifesto, alturas estáveis derivadas do nome
  const n = fig.clientWidth && fig.clientWidth < 460 ? 32 : 54;
  let alturas;
  if (info?.onda?.length) alturas = alturasDaOnda(info.onda, n);
  else {
    const rnd = aleatorio(arquivo);
    alturas = Array.from({ length: n }, (_, i) => {
      const env = Math.pow(Math.sin(Math.PI * (i + 0.5) / n), 0.5);
      return 0.16 + 0.84 * (0.3 + 0.7 * rnd()) * (0.5 + 0.5 * env);
    });
  }
  onda.innerHTML = alturas.map(h => `<i style="--h:${h.toFixed(3)}"></i>`).join('') + '<span class="audio__cabeca" aria-hidden="true"></span>';
  const barras = [...onda.querySelectorAll('i')];

  let raf = 0, iVel = 0, kAnterior = -1, pendente = null;

  const duracao = () => (Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : info?.dur || 0);
  // antes de o arquivo carregar, a posição escolhida na onda fica guardada em "pendente"
  const posicao = () => (pendente ?? audio.currentTime) || 0;
  const atualizar = () => {
    const d = duracao(), c = posicao(), p = d ? clamp(c / d, 0, 1) : 0;
    const k = Math.round(p * n);
    if (k !== kAnterior) {
      barras.forEach((b, i) => b.classList.toggle('is-tocada', i < k));
      kAnterior = k;
    }
    onda.style.setProperty('--p', p.toFixed(4));
    atual.textContent = fmtTempo(c);
    onda.setAttribute('aria-valuenow', String(Math.round(c)));
    onda.setAttribute('aria-valuetext', `${fmtTempo(c)} de ${fmtTempo(d)}`);
  };

  const dancar = agora => {
    const tt = agora / 1000, k = (posicao() / (duracao() || 1)) * n;
    for (let i = 0; i < n; i++) {
      const dist = Math.abs(i - k);
      const f = dist < 7 ? 1 - dist / 7 : 0;
      const s = 1 + f * 0.55 * Math.abs(Math.sin(tt * 8.5 + i * 0.9));
      barras[i].style.transform = f ? `scaleY(${s.toFixed(3)})` : '';
    }
    raf = requestAnimationFrame(dancar);
  };
  const pararDanca = () => { cancelAnimationFrame(raf); raf = 0; barras.forEach(b => { b.style.transform = ''; }); };

  const mostrarErro = msg => {
    erro.textContent = msg;
    erro.hidden = false;
    fig.classList.add('is-erro');
    fig.classList.remove('is-carregando');
  };
  const limparErro = () => { erro.hidden = true; fig.classList.remove('is-erro'); };

  // Ponto escolhido antes de o arquivo carregar. Só é aplicado no canplay: com WebM/Opus,
  // o Chrome volta a posição para 0 logo depois dos metadados.
  const aplicarPendente = () => {
    if (pendente == null || audio.readyState < 1) return;
    const alvo = Math.min(pendente, Math.max(0, (audio.duration || pendente) - 0.1));
    pendente = null;
    if (Math.abs(audio.currentTime - alvo) > 0.25) audio.currentTime = alvo;
  };

  const definirTempo = seg => {
    const d = duracao();
    if (!d) return;
    const alvo = clamp(seg, 0, d);
    if (audio.readyState >= 3) { audio.currentTime = alvo; pendente = null; } else pendente = alvo;
    atualizar();
  };

  const alternar = () => {
    if (!audio.paused) { audio.pause(); return; }
    limparErro();
    if (audio.readyState < 3) fig.classList.add('is-carregando');
    const p = audio.play();
    p?.catch?.(e => {
      if (e?.name === 'AbortError') return; // pausado antes de começar
      mostrarErro(t(e?.name === 'NotAllowedError' ? 'audioBloqueado' : 'audioErro'));
    });
  };

  // eventos do <audio>
  const ev = {
    play: () => {
      tocando.forEach(a => { if (a !== audio) a.pause(); });
      tocando.add(audio);
      fig.classList.add('is-tocando');
      play.setAttribute('aria-label', play.dataset.rotuloPausar);
      som.abaixar(true);
      if (!movimentoReduzido() && !raf) raf = requestAnimationFrame(dancar);
    },
    pause: () => {
      tocando.delete(audio);
      fig.classList.remove('is-tocando', 'is-carregando');
      play.setAttribute('aria-label', play.dataset.rotuloTocar);
      if (!tocando.size) som.abaixar(false);
      pararDanca();
    },
    ended: () => ev.pause(),
    timeupdate: atualizar,
    loadedmetadata: () => {
      total.textContent = fmtTempo(duracao());
      onda.setAttribute('aria-valuemax', String(Math.round(duracao())));
      atualizar();
    },
    durationchange: () => ev.loadedmetadata(),
    waiting: () => fig.classList.add('is-carregando'),
    canplay: () => { aplicarPendente(); fig.classList.remove('is-carregando'); },
    playing: () => { aplicarPendente(); fig.classList.remove('is-carregando'); },
    error: () => { mostrarErro(t('audioErro')); ev.pause(); },
  };
  Object.entries(ev).forEach(([nome, fn]) => audio.addEventListener(nome, fn));
  // com <source>, a falha de cada arquivo chega na própria <source>; a última sem sucesso é erro de verdade
  const ultimaFonte = audio.querySelector('source:last-of-type');
  const falhaFonte = () => { mostrarErro(t('audioErro')); ev.pause(); };
  ultimaFonte?.addEventListener('error', falhaFonte);

  play.addEventListener('click', alternar);

  vel.addEventListener('click', () => {
    iVel = (iVel + 1) % VELOCIDADES.length;
    audio.playbackRate = VELOCIDADES[iVel];
    vel.textContent = fmtVel(VELOCIDADES[iVel]);
    vel.setAttribute('aria-label', t('audioVelocidade', { v: fmtVel(VELOCIDADES[iVel]) }));
    vel.classList.toggle('is-alterada', iVel > 0);
  });

  // onda: clicar ou arrastar escolhe o ponto; se estiver parado, começa a tocar dali
  const porPonteiro = e => {
    const r = onda.getBoundingClientRect();
    definirTempo(((e.clientX - r.left) / r.width) * duracao());
  };
  onda.addEventListener('pointerdown', e => {
    if (!duracao()) return;
    onda.setPointerCapture(e.pointerId);
    fig.classList.add('is-arrastando');
    porPonteiro(e);
    const mover = ev2 => porPonteiro(ev2);
    const soltar = () => {
      fig.classList.remove('is-arrastando');
      onda.removeEventListener('pointermove', mover);
      onda.removeEventListener('pointerup', soltar);
      onda.removeEventListener('pointercancel', soltar);
    };
    onda.addEventListener('pointermove', mover);
    onda.addEventListener('pointerup', soltar);
    onda.addEventListener('pointercancel', soltar);
  });
  onda.addEventListener('click', () => { if (audio.paused) alternar(); });

  // teclado no slider
  onda.addEventListener('keydown', e => {
    const d = duracao(), c = posicao();
    const mapa = {
      ArrowRight: c + 5, ArrowUp: c + 5, ArrowLeft: c - 5, ArrowDown: c - 5,
      PageUp: c + d * 0.1, PageDown: c - d * 0.1, Home: 0, End: d,
    };
    if (e.key in mapa) { e.preventDefault(); definirTempo(mapa[e.key]); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar(); }
  });

  atualizar();

  return () => {
    audio.pause();
    pararDanca();
    Object.entries(ev).forEach(([nome, fn]) => audio.removeEventListener(nome, fn));
    ultimaFonte?.removeEventListener('error', falhaFonte);
    tocando.delete(audio);
    if (!tocando.size) som.abaixar(false);
  };
}
