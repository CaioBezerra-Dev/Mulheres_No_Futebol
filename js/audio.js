/* =============================================================================
   ÁUDIO — player customizado para os trechos de entrevista.
   Usa <audio> nativo. Um toca por vez. O ambiente do estádio abaixa sozinho.
   ============================================================================= */
import { esc, t, aleatorio, movimentoReduzido } from './base.js';
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

export const resolverAudio = arq => (arq.includes('/') ? arq : `assets/audio/${arq}`);

let contador = 0;
export function playerHTML(arquivo, legenda = '', transcricao = '') {
  const id = `audio-${++contador}`;
  const src = resolverAudio(arquivo.trim());
  const demonstrativo = arquivo.trim().split('/').pop() === 'exemplo-entrevista.mp3';
  const nome = demonstrativo ? `: ${resumo(t('audioDemonstrativo'))}` : legenda ? `: ${resumo(legenda)}` : '';
  return `<figure class="audio" data-audio id="${id}">
    <audio preload="metadata" src="${esc(src)}"></audio>
    <div class="audio__linha">
      <button class="audio__play" type="button" aria-label="${esc(t('audioTocar') + nome)}" data-rotulo-tocar="${esc(t('audioTocar') + nome)}" data-rotulo-pausar="${esc(t('audioPausar') + nome)}">
        <svg class="audio__icone audio__icone--play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L18.8 12z"/></svg>
        <svg class="audio__icone audio__icone--pausa" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.8 5h3.7v14H6.8zM13.5 5h3.7v14h-3.7z"/></svg>
        <span class="audio__giro" aria-hidden="true"></span>
      </button>
      <div class="audio__onda" role="slider" tabindex="0" aria-label="${esc(t('audioPosicao'))}" aria-valuemin="0" aria-valuemax="0" aria-valuenow="0" aria-valuetext="0:00"></div>
      <p class="audio__tempo"><span data-atual>0:00</span><span class="audio__barra-tempo" aria-hidden="true">/</span><span data-total>0:00</span></p>
      <button class="audio__vel" type="button" aria-label="${esc(t('audioVelocidade', { v: '1x' }))}">1x</button>
    </div>
    ${legenda || demonstrativo ? `<figcaption class="audio__legenda">${demonstrativo ? `<strong>${esc(t('audioDemonstrativo'))}</strong> ` : ''}${esc(legenda)}</figcaption>` : ''}
    ${transcricao ? `<details class="audio__transcricao"><summary>${esc(t(demonstrativo ? 'audioTrechoPrevisto' : 'audioTranscricao'))}</summary><p>${esc(transcricao)}</p></details>` : ''}
    <p class="audio__erro" role="alert" hidden>${esc(t('audioErro'))}</p>
  </figure>`;
}

export function pausarTodos() { tocando.forEach(a => a.pause()); }

export function montarPlayers(raiz) {
  const limpezas = [...raiz.querySelectorAll('[data-audio]')].map(montar);
  return () => limpezas.forEach(f => f());
}

function montar(fig) {
  const audio = fig.querySelector('audio');
  const play = fig.querySelector('.audio__play');
  const onda = fig.querySelector('.audio__onda');
  const atual = fig.querySelector('[data-atual]');
  const total = fig.querySelector('[data-total]');
  const vel = fig.querySelector('.audio__vel');
  const erro = fig.querySelector('.audio__erro');

  // barras da onda (alturas estáveis, derivadas do nome do arquivo)
  const n = fig.clientWidth && fig.clientWidth < 460 ? 32 : 54;
  const rnd = aleatorio(audio.getAttribute('src'));
  onda.innerHTML = Array.from({ length: n }, (_, i) => {
    const env = Math.pow(Math.sin(Math.PI * (i + 0.5) / n), 0.5);
    const h = 0.16 + 0.84 * (0.3 + 0.7 * rnd()) * (0.5 + 0.5 * env);
    return `<i style="--h:${h.toFixed(3)}"></i>`;
  }).join('') + '<span class="audio__cabeca" aria-hidden="true"></span>';
  const barras = [...onda.querySelectorAll('i')];

  let raf = 0, iVel = 0, kAnterior = -1;

  const duracao = () => (Number.isFinite(audio.duration) ? audio.duration : 0);
  const atualizar = () => {
    const d = duracao(), c = audio.currentTime || 0, p = d ? c / d : 0;
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
    const tt = agora / 1000, k = (audio.currentTime / (duracao() || 1)) * n;
    for (let i = 0; i < n; i++) {
      const dist = Math.abs(i - k);
      const f = dist < 7 ? 1 - dist / 7 : 0;
      const s = 1 + f * 0.55 * Math.abs(Math.sin(tt * 8.5 + i * 0.9));
      barras[i].style.transform = f ? `scaleY(${s.toFixed(3)})` : '';
    }
    raf = requestAnimationFrame(dancar);
  };
  const pararDanca = () => { cancelAnimationFrame(raf); raf = 0; barras.forEach(b => { b.style.transform = ''; }); };

  const definirTempo = seg => {
    const d = duracao();
    if (!d) return;
    audio.currentTime = Math.min(d, Math.max(0, seg));
    atualizar();
  };

  const alternar = () => {
    if (audio.paused) {
      erro.hidden = true;
      const p = audio.play();
      p?.catch?.(() => { /* erro tratado no evento */ });
    } else audio.pause();
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
      fig.classList.remove('is-tocando');
      play.setAttribute('aria-label', play.dataset.rotuloTocar);
      if (!tocando.size) som.abaixar(false);
      pararDanca();
    },
    ended: () => ev.pause(),
    timeupdate: atualizar,
    loadedmetadata: () => { total.textContent = fmtTempo(duracao()); onda.setAttribute('aria-valuemax', String(Math.round(duracao()))); atualizar(); },
    durationchange: () => ev.loadedmetadata(),
    waiting: () => fig.classList.add('is-carregando'),
    canplay: () => fig.classList.remove('is-carregando'),
    playing: () => fig.classList.remove('is-carregando'),
    error: () => {
      fig.classList.add('is-erro');
      fig.classList.remove('is-carregando');
      erro.hidden = false;
      ev.pause();
    },
  };
  Object.entries(ev).forEach(([nome, fn]) => audio.addEventListener(nome, fn));
  if (audio.readyState >= 1) ev.loadedmetadata();

  play.addEventListener('click', alternar);

  vel.addEventListener('click', () => {
    iVel = (iVel + 1) % VELOCIDADES.length;
    audio.playbackRate = VELOCIDADES[iVel];
    vel.textContent = fmtVel(VELOCIDADES[iVel]);
    vel.setAttribute('aria-label', t('audioVelocidade', { v: fmtVel(VELOCIDADES[iVel]) }));
    vel.classList.toggle('is-alterada', iVel > 0);
  });

  // busca com ponteiro (clicar ou arrastar na onda)
  const porPonteiro = e => {
    const r = onda.getBoundingClientRect();
    definirTempo(((e.clientX - r.left) / r.width) * duracao());
  };
  onda.addEventListener('pointerdown', e => {
    if (!duracao()) { audio.preload = 'auto'; audio.load(); return; }
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

  // teclado no slider
  onda.addEventListener('keydown', e => {
    const d = duracao(), c = audio.currentTime;
    const mapa = {
      ArrowRight: c + 5, ArrowUp: c + 5, ArrowLeft: c - 5, ArrowDown: c - 5,
      PageUp: c + d * 0.1, PageDown: c - d * 0.1, Home: 0, End: d,
    };
    if (e.key in mapa) { e.preventDefault(); definirTempo(mapa[e.key]); }
    else if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); alternar(); }
  });

  return () => {
    audio.pause();
    pararDanca();
    Object.entries(ev).forEach(([nome, fn]) => audio.removeEventListener(nome, fn));
    tocando.delete(audio);
    if (!tocando.size) som.abaixar(false);
  };
}
