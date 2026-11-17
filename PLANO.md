# PLANO — site da reportagem (TCC de Rebecca Crecci)

> Documento de trabalho da Fase 0. Diz o que vai ser feito, com quais regras e em que ordem.
> O GUIA_TECNICO.md explica como editar e publicar depois de pronto.
> Este é o plano original: o título atual é “Mulheres no Futebol”, as bibliotecas
> agora são locais e os textos do Sobre e de Árbitras já foram concluídos.
> Consulte o GUIA_TECNICO.md para as pendências atuais e VERIFICACAO.md para os testes.

## 1. Conceito: "Noite de jogo, dia de leitura"

A capa é a **noite de um jogo grande**: estádio por dentro, refletores acesos, torcida, gramado listrado.
Sobre o gramado flutuam três objetos de trabalho, as ferramentas de quem ocupa esse espaço:

| Objeto | Leva para | Histórias |
| --- | --- | --- |
| Microfone | **As Jornalistas** (`#jornalistas`) | Carla Pessoa, Nana Ednet, Marianna Fraga |
| Apito | **As Árbitras** (`#arbitras`) | Edina Alves, Cassia França |
| Caderneta | **As Gestoras** (`#gestoras`) | Mirian Monte, Marianna Líbano |

Tocar um objeto é **entrar em campo**: o objeto vem ao centro, a câmera dá zoom e um círculo verde nasce
dele e cobre a tela. Do outro lado é **dia**: papel branco, gramado listrado no rodapé, tipografia editorial.
A noite chama para explorar; o dia é para ler com calma.

A primeira frase da própria reportagem amarra o conceito: *"O microfone na mão, o crachá no pescoço, o apito no peito."*

### Conteúdo
A pasta `reportagem/` traz o texto real (`REAL REPORTAGEM.md`). Ele entra em `conteudo.js` no lugar dos
placeholders de história, com revisão leve de digitação (lista completa no GUIA_TECNICO.md). Continuam como
PLACEHOLDER: título do TCC, fotos, áudios, intro da aba Árbitras e os créditos que não estão no texto
(orientação, instituição, contato, agradecimentos, desenvolvimento).

## 2. Sistema de design

### Paleta (tokens em `css/tokens.css`)
| Token | Cor | Uso |
| --- | --- | --- |
| `--verde` | `#1F7A3A` | gramado, círculo da transição, links em fundo claro (5,4:1 no branco) |
| `--verde-escuro` | `#0E4D24` | listras escuras, fundos de cartão, preloader |
| `--verde-claro` | `#7BC96F` | detalhes sobre fundo escuro (8,6:1 na noite); nunca texto em fundo claro |
| `--branco` | `#FFFFFF` | texto sobre noite e verde |
| `--gelo` | `#F4F8F1` | papel das abas e da leitura |
| `--noite` | `#0A1F12` | fundo da capa, texto principal no claro (16:1) |
| `--cartao` | `#FFD23F` | acento único: foco, estado ativo, interação. Só sobre escuro ou como fundo de texto escuro |

### Tipografia (hospedada localmente, `font-display: swap`, preload das críticas)
- **Bricolage Grotesque** (variável: peso 200–800, largura 75–100, opsz): títulos gigantes, condensada e pesada.
- **Source Serif 4** (variável, com itálico): leitura, falas e olhos.
- **Inter** (variável): interface, rótulos, botões, metadados.

Escala fluida com `clamp()`: `--t-mega` (título da capa) → `--t-giga` (aba) → `--t-h1` (história) → `--t-h2` → `--t-corpo` (18–21 px, linha 1,65) → `--t-ui` → `--t-mini`.
Coluna de leitura: `max-width: 65ch`.

### Espaçamento
Base 4 px: `--e-1` 4 · `--e-2` 8 · `--e-3` 12 · `--e-4` 16 · `--e-5` 24 · `--e-6` 32 · `--e-7` 48 · `--e-8` 64 · `--e-9` 96 · `--e-10` 128.
Margem lateral fluida: `--margem: clamp(20px, 5vw, 72px)`.

### Movimento (iguais no CSS e no JS, `js/movimento.js`)
| Nome | Curva | Uso |
| --- | --- | --- |
| `saida` | `expo.out` / `cubic-bezier(.16,1,.3,1)` | entradas, reveals |
| `troca` | `expo.inOut` / `cubic-bezier(.87,0,.13,1)` | círculos, wipes, zoom de câmera |
| `suave` | `power4.out` / `cubic-bezier(.25,1,.5,1)` | hovers, micro-interações |
| `antecipa` | `power2.in` | recuo antes do salto (anticipation) |
| `passa` | `back.out(1.5)` | overshoot e assentamento |

Durações: `xs` .15 s · `p` .3 s · `m` .6 s · `g` .9 s · `xg` 1.4 s. Stagger padrão .06 s.
Regra: anima-se só `transform`, `opacity` e `clip-path` (este só nas transições). `will-change` só durante a animação.
`prefers-reduced-motion`: tudo vira fade curto, sem parallax, sem loops, sem confete, sem cursor custom.

## 3. Assets (gerados com o Codex / gpt-image, um estilo só)

Estilo comum dos prompts: ilustração editorial contemporânea, formas ousadas e simples, sombreamento
posterizado, grão de risografia/papel, luz de refletor fria vindo de cima com contorno branco, paleta restrita, sem texto.

| Arquivo | O que é | Fundo |
| --- | --- | --- |
| `cena/ceu` | céu noturno com névoa de refletor | opaco |
| `cena/refletor` | torre de refletor (reutilizada 4×) | transparente |
| `cena/arquibancada-fundo` | arquibancada oposta, vista frontal, repetível na horizontal | transparente |
| `cena/torcida` | torcida em faixa contínua (vira a "ola" fatiada em canvas) | transparente |
| `cena/arquibancada-frente` | silhuetas da arquibancada de perto | transparente |
| `cena/gramado` | gramado listrado em perspectiva | transparente acima da linha lateral |
| `objetos/microfone`, `apito`, `caderneta` | os três objetos navegáveis | transparente |
| `objetos/bola` | bola que quica (easter egg do gol) | transparente |
| `objetos/bandeira` | bandeira de assistente (tela 404 "Impedimento") | transparente |
| `texturas/papel`, `texturas/gramado` | texturas repetíveis | opaco |
| `texturas/ruido` | ruído sutil (gerado por script) | opaco |
| `retratos/retrato-*` (7) | retratos ilustrados genéricos em duotom verde | opaco |
| `og-image.jpg` | 1200×630, montada a partir da cena + tipografia real | — |
| `icones/favicon.svg` + PNGs | desenhado à mão em SVG (IA não rende bem a 16 px) | — |

Pipeline: PNG original em `assets/originais/` → `sharp` gera AVIF + WebP em 1x e 2x com nomes descritivos →
`<picture>` com `srcset`; `loading="lazy"` em tudo que não é da primeira dobra.
Sons: sintetizados em tempo real com Web Audio (apito, torcida, ola, refletor), zero arquivo. Áudio de entrevista de exemplo: um MP3 placeholder.

## 4. Stack e pastas
HTML/CSS/JS puro, sem build. GSAP 3.15.1 (+ ScrollTrigger, Flip, CustomEase) e Lenis 1.3.27 via jsDelivr, versão fixa e SRI.
Módulos ES nativos.

```
index.html          casca da página, metatags, preload
404.html            impedimento (rota inexistente no servidor)
conteudo.js         TODO o texto do site (histórias, créditos, interface)
css/tokens.css      variáveis do sistema
css/site.css        estilos por tela
js/main.js          inicialização e roteador
js/*.js             capa, cena, transicoes, aba, historia, audio, cursor, som, preloader, ...
assets/img/         imagens otimizadas (avif/webp 1x/2x)
assets/originais/   PNGs gerados (não são carregados pelo site)
assets/fontes/      woff2 variáveis
assets/audio/       áudios das entrevistas
```

## 5. Ordem de execução
1. Fase 0: este plano.
2. Fase 1: gerar assets em lote (Codex, 4 em paralelo) → revisar → regerar o que fugir do estilo → otimizar.
3. Fase 2: tokens, base CSS, fontes, `conteudo.js` com o texto real.
4. Fase 3: capa (preloader, título com máscara, cena em camadas, objetos, ambiente, easter eggs).
5. Fase 4: roteador por hash + transição objeto → aba (e o inverso).
6. Fase 5: abas (cards, dock, selo "lida", contador).
7. Fase 6: leitura (FLIP, progresso, capitular, olhos, player de áudio, fechamento).
8. Fase 7: Sobre o projeto ("súmula" com transição de listras de gramado) + 404.
9. Fase 8: revisão do conteúdo e dos microtextos.
10. Fase 9: cursor, Lenis, som, mobile, performance, acessibilidade, SEO.
11. Fase 10: QA em 390/768/1440 com Chrome headless, screenshots, Lighthouse, correções, README.
