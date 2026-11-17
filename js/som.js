/* =============================================================================
   SOM — sintetizado na hora com Web Audio (nenhum arquivo para baixar).
   Desligado por padrão; a preferência fica salva. Durante um áudio de
   entrevista, o ambiente do estádio abaixa sozinho ("ducking").
   ============================================================================= */
import { estado, t } from './base.js';

const VOL_MESTRE = 0.55;
const NIVEIS = { capa: 1, leitura: 0.32, silencio: 0 };

class Som {
  constructor() {
    this.ctx = null;
    this.ligado = false;
    this.nivel = NIVEIS.capa;
    this.abaixado = false;
    this.botao = null;
    this._ondas = null;
  }

  iniciar(botao) {
    this.botao = botao;
    this.ligado = false;
    this._atualizarBotao();
    botao?.addEventListener('click', () => this.alternar());
    // A preferência salva só vale depois de um gesto (política de autoplay).
    if (estado.som()) {
      const religar = () => { if (!this.ligado && estado.som()) this.ligar(false); };
      window.addEventListener('pointerdown', religar, { once: true, capture: true });
      window.addEventListener('keydown', religar, { once: true, capture: true });
      this._marcarPendente(true);
    }
  }

  _marcarPendente(v) { this.botao?.classList.toggle('is-pendente', v); }

  _garantir() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); return true; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    const ctx = this.ctx = new AC();
    this.mestre = ctx.createGain();
    this.mestre.gain.value = 0;
    this.mestre.connect(ctx.destination);
    this.duck = ctx.createGain();
    this.duck.connect(this.mestre);
    this.efeitos = ctx.createGain();
    this.efeitos.gain.value = 0.9;
    this.efeitos.connect(this.mestre);
    this.ruidoRosa = this._criarRuido(4);
    this._montarAmbiente();
    return true;
  }

  _criarRuido(segundos) {
    const ctx = this.ctx, n = Math.floor(ctx.sampleRate * segundos);
    const buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + w * 0.0555179; b1 = 0.99332 * b1 + w * 0.0750759;
        b2 = 0.969 * b2 + w * 0.153852; b3 = 0.8665 * b3 + w * 0.3104856;
        b4 = 0.55 * b4 + w * 0.5329522; b5 = -0.7616 * b5 - w * 0.016898;
        d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
        b6 = w * 0.115926;
      }
    }
    return buf;
  }

  _fonteRuido(destino, { inicio = 0 } = {}) {
    const s = this.ctx.createBufferSource();
    s.buffer = this.ruidoRosa;
    s.loop = true;
    s.loopStart = Math.random() * 2;
    s.connect(destino);
    s.start(this.ctx.currentTime + inicio, Math.random() * 3);
    return s;
  }

  _montarAmbiente() {
    const ctx = this.ctx;
    this.ambiente = ctx.createGain();
    this.ambiente.gain.value = 0;
    this.ambiente.connect(this.duck);
    // murmúrio da torcida: banda média, com ondas lentas
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 520; bp.Q.value = 0.7;
    const murm = ctx.createGain(); murm.gain.value = 0.42;
    const lfo = ctx.createOscillator(); lfo.frequency.value = 0.09;
    const lfoG = ctx.createGain(); lfoG.gain.value = 0.16;
    lfo.connect(lfoG).connect(murm.gain); lfo.start();
    bp.connect(murm).connect(this.ambiente);
    this._fonteRuido(bp);
    // camada aguda de vozes distantes
    const bp2 = ctx.createBiquadFilter(); bp2.type = 'bandpass'; bp2.frequency.value = 1500; bp2.Q.value = 1.1;
    const agud = ctx.createGain(); agud.gain.value = 0.12;
    bp2.connect(agud).connect(this.ambiente);
    this._fonteRuido(bp2);
    // ronco grave do estádio
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 160;
    const grave = ctx.createGain(); grave.gain.value = 0.5;
    lp.connect(grave).connect(this.ambiente);
    this._fonteRuido(lp);
    this.murmurio = murm;
  }

  _ondasAleatorias() {
    clearTimeout(this._ondas);
    const prox = () => {
      if (!this.ligado || !this.ctx) return;
      const ag = this.ctx.currentTime, g = this.murmurio.gain;
      g.cancelScheduledValues(ag);
      g.setValueAtTime(g.value, ag);
      g.linearRampToValueAtTime(0.42 + Math.random() * 0.35, ag + 1.4);
      g.linearRampToValueAtTime(0.42, ag + 3.8);
      this._ondas = setTimeout(prox, 6000 + Math.random() * 9000);
    };
    this._ondas = setTimeout(prox, 4000);
  }

  _aplicarNivel(tempo = 1.2) {
    if (!this.ctx) return;
    const ag = this.ctx.currentTime;
    const alvo = this.ligado ? 0.32 * this.nivel : 0;
    this.ambiente.gain.cancelScheduledValues(ag);
    this.ambiente.gain.setTargetAtTime(alvo, ag, tempo / 3);
    const d = this.abaixado ? 0.08 : 1;
    this.duck.gain.cancelScheduledValues(ag);
    this.duck.gain.setTargetAtTime(d, ag, this.abaixado ? 0.12 : 0.6);
  }

  ligar(gravar = true) {
    if (!this._garantir()) return;
    this.ligado = true;
    if (gravar) estado.definirSom(true);
    this._marcarPendente(false);
    const ag = this.ctx.currentTime;
    this.mestre.gain.cancelScheduledValues(ag);
    this.mestre.gain.setTargetAtTime(VOL_MESTRE, ag, 0.25);
    this._aplicarNivel(2);
    this._ondasAleatorias();
    this._atualizarBotao();
  }

  desligar() {
    this.ligado = false;
    estado.definirSom(false);
    this._marcarPendente(false);
    if (this.ctx) {
      const ag = this.ctx.currentTime;
      this.mestre.gain.cancelScheduledValues(ag);
      this.mestre.gain.setTargetAtTime(0, ag, 0.15);
      clearTimeout(this._ondas);
      setTimeout(() => { if (!this.ligado) this.ctx?.suspend(); }, 900);
    }
    this._atualizarBotao();
  }

  alternar() { this.ligado ? this.desligar() : this.ligar(); }

  _atualizarBotao() {
    const b = this.botao;
    if (!b) return;
    b.setAttribute('aria-pressed', String(this.ligado));
    b.classList.toggle('is-ligado', this.ligado);
    const rotulo = this.ligado ? t('somDesligar') : t('somLigar');
    b.setAttribute('aria-label', rotulo);
    b.dataset.cursor = this.ligado ? 'Silenciar' : 'Ouvir';
    const sr = b.querySelector('[data-rotulo-som]');
    if (sr) sr.textContent = rotulo;
  }

  /** Nível do ambiente por tela: 'capa' | 'leitura' | 'silencio'. */
  definirNivel(nome) {
    this.nivel = NIVEIS[nome] ?? 1;
    this._aplicarNivel();
  }

  /** Abaixa o ambiente enquanto um áudio de entrevista toca. */
  abaixar(sim) {
    this.abaixado = !!sim;
    this._aplicarNivel();
  }

  /* ---------------- Efeitos ---------------- */
  _pode() { return this.ligado && this.ctx && this.ctx.state === 'running'; }

  apito({ longo = false, volume = 0.5 } = {}) {
    if (!this._pode()) return;
    const ctx = this.ctx, ag = ctx.currentTime;
    const dur = longo ? 0.75 : 0.32;
    const saida = ctx.createGain(); saida.gain.value = 0;
    saida.connect(this.efeitos);
    // tom principal (~2,9 kHz) com o trinado da ervilha (~30 Hz)
    const osc = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = 2870;
    const osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = 2870 * 2.01;
    const trin = ctx.createOscillator(); trin.frequency.value = 31;
    const trinF = ctx.createGain(); trinF.gain.value = 140;
    const trinA = ctx.createGain(); trinA.gain.value = 0.35;
    trin.connect(trinF); trinF.connect(osc.frequency); trinF.connect(osc2.frequency);
    const am = ctx.createGain(); am.gain.value = 0.65;
    trin.connect(trinA).connect(am.gain);
    const h2 = ctx.createGain(); h2.gain.value = 0.12;
    osc.connect(am); osc2.connect(h2).connect(am);
    am.connect(saida);
    // sopro
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 3200; bp.Q.value = 1.6;
    const sopro = ctx.createGain(); sopro.gain.value = 0.06;
    const ruido = this._fonteRuido(bp);
    bp.connect(sopro).connect(saida);
    saida.gain.setValueAtTime(0, ag);
    saida.gain.linearRampToValueAtTime(volume * 0.5, ag + 0.018);
    saida.gain.setValueAtTime(volume * 0.5, ag + dur - 0.06);
    saida.gain.linearRampToValueAtTime(0, ag + dur);
    [osc, osc2, trin].forEach(o => { o.start(ag); o.stop(ag + dur + 0.05); });
    ruido.stop(ag + dur + 0.05);
  }

  torcida({ intensidade = 1, dur = 3.2 } = {}) {
    if (!this._pode()) return;
    const ctx = this.ctx, ag = ctx.currentTime;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.55;
    bp.frequency.setValueAtTime(380, ag);
    bp.frequency.exponentialRampToValueAtTime(1150, ag + 0.7);
    bp.frequency.exponentialRampToValueAtTime(700, ag + dur);
    const g = ctx.createGain(); g.gain.value = 0;
    bp.connect(g).connect(this.efeitos);
    const fonte = this._fonteRuido(bp);
    const pico = 0.95 * intensidade;
    g.gain.setValueAtTime(0, ag);
    g.gain.linearRampToValueAtTime(pico, ag + 0.28);
    g.gain.setTargetAtTime(pico * 0.55, ag + 0.9, 0.6);
    g.gain.setTargetAtTime(0, ag + dur - 1.2, 0.45);
    fonte.stop(ag + dur + 1.5);
    // palmas: ruído agudo picotado
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 2400;
    const pal = ctx.createGain(); pal.gain.value = 0;
    hp.connect(pal).connect(this.efeitos);
    const f2 = this._fonteRuido(hp);
    for (let i = 0; i < 18; i++) {
      const tt = ag + 0.4 + i * 0.13 + Math.random() * 0.05;
      pal.gain.setValueAtTime(0.18 * intensidade, tt);
      pal.gain.setTargetAtTime(0, tt + 0.01, 0.03);
    }
    f2.stop(ag + dur + 0.5);
  }

  ola(dur = 2.6) {
    if (!this._pode()) return;
    const ctx = this.ctx, ag = ctx.currentTime;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.value = 820; bp.Q.value = 0.9;
    const g = ctx.createGain(); g.gain.value = 0;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    if (pan) { bp.connect(g).connect(pan).connect(this.efeitos); pan.pan.setValueAtTime(-0.9, ag); pan.pan.linearRampToValueAtTime(0.9, ag + dur); }
    else bp.connect(g).connect(this.efeitos);
    const fonte = this._fonteRuido(bp);
    g.gain.setValueAtTime(0, ag);
    g.gain.linearRampToValueAtTime(0.7, ag + dur * 0.3);
    g.gain.linearRampToValueAtTime(0.75, ag + dur * 0.7);
    g.gain.linearRampToValueAtTime(0, ag + dur + 0.3);
    bp.frequency.setValueAtTime(600, ag);
    bp.frequency.linearRampToValueAtTime(1050, ag + dur * 0.5);
    bp.frequency.linearRampToValueAtTime(700, ag + dur);
    fonte.stop(ag + dur + 0.5);
  }

  estalo(volume = 0.6) {
    if (!this._pode()) return;
    const ctx = this.ctx, ag = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'sine';
    o.frequency.setValueAtTime(95, ag);
    o.frequency.exponentialRampToValueAtTime(42, ag + 0.18);
    const g = ctx.createGain(); g.gain.setValueAtTime(volume, ag); g.gain.exponentialRampToValueAtTime(0.001, ag + 0.28);
    o.connect(g).connect(this.efeitos);
    o.start(ag); o.stop(ag + 0.3);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 1800;
    const c = ctx.createGain(); c.gain.setValueAtTime(0.25 * volume, ag); c.gain.exponentialRampToValueAtTime(0.001, ag + 0.04);
    hp.connect(c).connect(this.efeitos);
    const r = this._fonteRuido(hp); r.stop(ag + 0.06);
  }

  toque() {
    if (!this._pode()) return;
    const ctx = this.ctx, ag = ctx.currentTime;
    const o = ctx.createOscillator(); o.type = 'triangle'; o.frequency.value = 660;
    const g = ctx.createGain(); g.gain.setValueAtTime(0.05, ag); g.gain.exponentialRampToValueAtTime(0.0008, ag + 0.12);
    o.connect(g).connect(this.efeitos); o.start(ag); o.stop(ag + 0.13);
  }
}

export const som = new Som();
