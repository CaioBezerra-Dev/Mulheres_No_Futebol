/* =============================================================================
   PRELOADER — contador 0-100 sobre o verde, refletores acendendo um a um,
   e o reveal por clip-path que abre a cena ao meio.
   Não depende de nenhuma biblioteca (requestAnimationFrame + Web Animations):
   aparece na primeira pintura, enquanto o resto do site carrega por trás.
   O contador segue o carregamento real, com tempo mínimo para respirar e um
   limite para nunca prender ninguém em rede lenta.
   ============================================================================= */
const CURVA_TROCA = 'cubic-bezier(0.87, 0, 0.13, 1)';   // expo.inOut
const CURVA_SAIDA = 'cubic-bezier(0.16, 1, 0.3, 1)';    // expo.out
const CURVA_PASSA = 'cubic-bezier(0.34, 1.56, 0.64, 1)'; // back.out

export function iniciarPreloader({ rapido = false, reduzido = false, textos = {} } = {}) {
  const el = document.getElementById('preloader');
  const acompanhados = [];
  let feitos = 0;
  const acompanhar = p => {
    acompanhados.push(p);
    Promise.resolve(p).catch(() => {}).finally(() => { feitos++; });
  };
  if (!el) return { acompanhar, terminar: async ({ aoRevelar } = {}) => { aoRevelar?.(); } };

  const numero = el.querySelector('.preloader__numero');
  const bancos = [...el.querySelectorAll('.preloader__banco')];
  const legenda = el.querySelector('.preloader__legenda');
  if (textos.carregando) legenda.textContent = textos.carregando;
  bancos.forEach(b => {
    let html = '';
    for (let l = 0; l < 3; l++) for (let c = 0; c < 6; c++) html += `<circle cx="${15 + c * 18}" cy="${14 + l * 18}" r="6"/>`;
    b.querySelector('.banco__lampadas').innerHTML = html;
  });
  const clarao = document.createElement('div');
  clarao.className = 'preloader__clarao';
  el.appendChild(clarao);

  const anima = (alvo, quadros, opcoes) => (alvo.animate ? alvo.animate(quadros, opcoes) : null);
  if (!reduzido) {
    bancos.forEach((b, i) => anima(b, [{ opacity: 0, transform: 'translateY(-30px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: i * 70, easing: CURVA_SAIDA, fill: 'backwards' }));
    [legenda, el.querySelector('.preloader__contador')].forEach(n => anima(n, [{ opacity: 0, transform: 'translateY(30px)' }, { opacity: 1, transform: 'none' }], { duration: 900, delay: 100, easing: CURVA_SAIDA, fill: 'backwards' }));
  }

  const minimo = reduzido ? 0 : rapido ? 200 : 900;
  const limite = 4500;              // tempo máximo esperando fontes e imagens
  const inicio = performance.now();
  let v = 0, acesos = 0, liberado = false, aoChegar100 = null;
  let ultimoQuadro = inicio, ultimoNumero = -1;

  const acender = i => {
    const b = bancos[i];
    b.classList.add('is-aceso');
    if (reduzido) return;
    anima(b, [{ transform: 'scale(0.86)' }, { transform: 'scale(1)' }], { duration: 700, easing: CURVA_PASSA });
    anima(clarao, [{ opacity: 0.22 }, { opacity: 0 }], { duration: 500, easing: 'ease-out' });
  };

  const tick = agora => {
    const delta = Math.min(100, agora - ultimoQuadro);
    ultimoQuadro = agora;
    const passado = agora - inicio;
    const porTempo = minimo ? Math.min(100, (passado / minimo) * 100) : 100;
    const real = passado > limite || !acompanhados.length ? 100 : (feitos / acompanhados.length) * 100;
    let alvo = Math.min(porTempo, real);
    if (!liberado) alvo = Math.min(alvo, 96); // o site ainda está montando: segura em 96
    // Progresso monotônico, com a mesma duração em telas de 60 ou 120 Hz.
    v += Math.max(0, alvo - v) * (1 - Math.exp(-delta / 65));
    if (alvo === 100 && v >= 99.5) v = 100;
    const n = Math.floor(v + 0.001);
    if (n !== ultimoNumero) { numero.textContent = String(n); ultimoNumero = n; }
    while (acesos < bancos.length && n >= (acesos + 1) * (100 / bancos.length)) acender(acesos++);
    if (n >= 100) { aoChegar100?.(); return; }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  const chegou100 = new Promise(r => { aoChegar100 = r; });

  return {
    acompanhar,
    /** Libera o fim do contador; revela a cena e chama aoRevelar no começo da abertura. */
    async terminar({ aoRevelar } = {}) {
      liberado = true;
      await chegou100;
      if (textos.carregado) legenda.textContent = textos.carregado;
      if (reduzido || rapido) {
        aoRevelar?.();
        const f = anima(el, [{ opacity: 1 }, { opacity: 0 }], { duration: reduzido ? 150 : 300, fill: 'forwards' });
        await (f?.finished ?? Promise.resolve());
        el.remove();
        return;
      }
      anima(clarao, [{ opacity: 0 }, { opacity: 0.85, offset: 0.25 }, { opacity: 0 }], { duration: 650, delay: 150, easing: 'ease-out' });
      await new Promise(r => setTimeout(r, 100));
      aoRevelar?.();
      const abre = anima(el, [{ clipPath: 'inset(0% 0% 0% 0%)' }, { clipPath: 'inset(50% 0% 50% 0%)' }], { duration: 750, easing: CURVA_TROCA, fill: 'forwards' });
      await (abre?.finished ?? Promise.resolve());
      el.remove();
    },
  };
}
