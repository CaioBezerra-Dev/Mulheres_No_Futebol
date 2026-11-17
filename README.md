# Mulheres no Futebol

Reportagem multimídia do TCC de Rebecca Crecci. HTML, CSS e JavaScript puros, sem etapa de build.
Abra com um servidor local (abrir o `index.html` direto do disco não carrega os módulos JS):

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# Acesse http://localhost:8765
```

## Como trocar textos, fotos e áudios

Tudo que aparece escrito no site está em **`conteudo.js`**. Edite só o que está entre aspas.

- **Título:** “Mulheres no Futebol”, definido para esta versão. Para trocar, edite `site.titulo` em `conteudo.js`, as metatags de título no `index.html` e o título de `404.html`. O título da capa se ajusta sozinho ao tamanho.
- **Histórias:** cada uma tem `nome`, `funcao`, `titulo`, `destaque` (frase do card) e `texto` (lista de parágrafos). Parágrafo que começa com “ vira fala.
- **Marcadores no texto:**
  - `[[audio:arquivo.mp3|legenda|transcrição]]` insere o player (o arquivo vai em `assets/audio/`; a transcrição é opcional).
  - `[[olho:frase|quem disse]]` insere uma frase em destaque.
  - `[[foto:assets/fotos/x.jpg|legenda]]` insere uma foto no meio do texto.
  - `## Intertítulo` insere um subtítulo.
- **Fotos:** troque só o campo `foto` da história, por exemplo `"assets/fotos/edina.jpg"`. Ajuste `fotoAlt` (descrição para leitores de tela) e, se precisar, `fotoPosicao` (`"50% 30%"` = ponto da foto que fica no corte). Fotos de até ~1600 px de largura, em JPG ou WebP, deixam o site leve.
- **Áudios:** coloque o MP3 em `assets/audio/` e use o nome no marcador. Hoje todas as histórias usam `exemplo-entrevista.mp3`, um áudio sintetizado identificado como demonstrativo no player. Os trechos de fala disponíveis aparecem como “Ler trecho da entrevista”; quando o arquivo real for usado, o rótulo passa a ser “Ler transcrição”. Confira se a transcrição corresponde à gravação.
- **Créditos:** `creditos` em `conteudo.js` (aparece em `#sobre`). Desenvolvimento: Caio Bezerra, com link para o GitHub. Para vincular outro crédito a uma página, use o campo opcional `link`. Orientação e instituição ainda estão vazios; os campos aparecem quando preenchidos. Agradecimentos e contato também ficam ocultos até serem definidos. O contato precisa de um e-mail válido.
- **Textos da interface** (botões, avisos, mensagens): `interface` em `conteudo.js`.

### O que ainda depende da autora
Fotos reais das entrevistadas; gravações e transcrições definitivas; orientação, instituição, agradecimentos e e-mail. Os retratos são ilustrações provisórias e os áudios são demonstrativos, identificados na página. Os **títulos das histórias são sugestões** tiradas do próprio texto: revise. A apresentação do Sobre e a introdução de Árbitras já estão escritas a partir da reportagem e também podem passar pela revisão editorial da autora.

### Revisão feita no texto da reportagem (`reportagem/REAL REPORTAGEM.md`)
O texto real entrou em `conteudo.js` com correções leves. Confira e desfaça se quiser:
- Digitação: "quandoseu", "foir", "qualo", "ocaminho", "soubeo", "precisoufazer", "queo", "enfrentoupor", "Braisleiro", "bebados" → "bêbados", "Mane" → "Mané", "de uma lado" → "de um lado", "quando em integrar" → "quanto em integrar", aspas e espaços duplos.
- Padronização: **Miriam → Mirian** (como no título da seção) e **Libano → Líbano**; "série A/B" → "Série A/B"; "Metrópolis" → **Metrópoles** (nome do portal).
- Pequenos ajustes de frase: "há cerca de quase 2 anos" → "há quase dois anos"; "tentaram a impedir" → "tentaram impedi-la"; "segue estabelecendo com uma barreira" → "segue estabelecendo uma barreira"; "Série D e C" → "Séries D e C".
- **Ano corrigido:** o credenciamento de Edina Alves é de **2016**, conforme o [cadastro oficial da FIFA](https://inside.fifa.com/es/associations/BRA/referees). O original da reportagem foi preservado; a correção está em `conteudo.js`.
- **Verificar com a fonte:** Marianna Fraga: cirurgia no fim de 2021 e contratação “poucos meses” depois, no início de 2023. A cronologia foi mantida aguardando confirmação.

## Como publicar

É um site estático, sem publicação automática. Para gerar uma pasta limpa de publicação:

```bash
node scripts/preparar-publicacao.mjs
```

O comando usa apenas o Node.js, não precisa de instalação e recria `dist/` com HTML, CSS, JS e os assets usados pelo site. Exclui os originais, ferramentas e documentos de trabalho. Para conferir a pasta gerada, rode `python3 -m http.server 8000 --directory dist` e acesse `http://localhost:8000`.

- **Netlify:** envie `dist/` em app.netlify.com/drop ou configure o comando acima e a pasta de publicação `dist`.
- **Vercel:** importe o repositório como site sem framework, com o comando acima e a pasta de saída `dist`.
- **GitHub Pages:** ative Pages na branch principal e na pasta raiz. `.nojekyll` desativa o processamento Jekyll. O `404.html` já funciona em subpastas. Os originais não entram no Git.

Depois de publicar, troque `assets/img/og-image.jpg` nas metatags `og:image` e `twitter:image` do `index.html` pelo endereço completo (ex.: `https://seu-site.netlify.app/assets/img/og-image.jpg`).
A imagem `assets/img/og-image.jpg` já contém o título aprovado, em 1200 × 630. O quadro editável está em `scripts/og-image.html`: abra com o servidor local, espere as fontes e imagens carregarem e capture o quadro em 1200 × 630, escala 1, formato JPEG. Ele usa as mesmas ilustrações e fontes da capa e lê o título de `conteudo.js`.

`assets/originais/` guarda os PNGs gerados (≈48 MB), e `assets/fontes/originais/` guarda as fontes antes da redução. Essas pastas foram preservadas localmente e estão no `.gitignore`; não entram no commit nem em `dist/`.

## Revisão técnica de continuidade

- Bibliotecas locais, em versões fixas: GSAP 3.15.1 e Lenis 1.3.27, com ScrollTrigger, Flip e CustomEase. A inicialização não consulta mais o jsDelivr.
- Preloader com espera menor, progresso independente da taxa da tela e abertura curta em dispositivos de toque, visitas seguintes e economia de dados.
- Torcida com menos elementos e atualização da cena a 30 Hz no toque; navegação e transições mantêm a taxa da tela. Partículas com resolução menor no celular; movimento reduzido dispensa o ciclo contínuo da torcida.
- Versões grandes dos objetos não são pré-carregadas no celular ou em economia de dados.
- Feixes dos refletores calculados no espaço local da cena, descontando o zoom. A luz acompanha a torre durante a abertura e recebe um recálculo final, sem depender de redimensionar a janela.
- Título, metadados, imagem de compartilhamento, apresentação do Sobre e introdução de Árbitras atualizados. Créditos indefinidos ficam ocultos.
- Resultados e limites da verificação atual em `VERIFICACAO.md`.

## O que foi feito em cada fase

0. **Plano:** `PLANO.md` com conceito ("noite de jogo, dia de leitura"), sistema de design, assets e ordem.
1. **Assets com IA:** 20 imagens geradas no Codex (gpt-image) com um único bloco de estilo; prompts em `assets/originais/prompts/`. Pipeline com `sharp`: recorte, céu escurecido, arquibancada e torcida repetíveis, AVIF + WebP em 1x/2x, recortes para celular. Favicon desenhado em SVG; og-image renderizada a partir da capa.
2. **Identidade e stack:** tokens em `css/tokens.css` (paleta, Bricolage Grotesque / Source Serif 4 / Inter hospedadas e reduzidas de 445 para 255 KB, espaços, curvas e durações). GSAP 3.15.1 + ScrollTrigger + Flip + CustomEase e Lenis 1.3.27 em `js/vendor/`. A primeira versão usava jsDelivr com SRI; a revisão passou a usar diretamente os arquivos locais.
3. **Capa:** preloader com contador 0–100 e refletores acendendo, reveal por clip-path; título em máscara; estádio em camadas com parallax (mouse, toque, giroscópio); torcida viva, bandeiras, poeira e flashes, bola que quica; objetos flutuantes magnéticos com halo e cursor com rótulo; dica após 6 s parado. Easter eggs: clique na bola (gol), na torcida (ola) e nas torres de refletor (apagão).
4. **Transição:** objeto → centro com antecipação e overshoot, zoom da câmera, círculo verde nascendo do objeto, aba branca atrás e pouso no cabeçalho; volta inversa com zoom saindo. Rotas por hash, botão voltar e deep links.
5. **Abas:** cards não lineares com tilt 3D, selo "Lida", contador, dock com troca de aba e rodapé de grama ao vento.
6. **Leitura:** FLIP do card até a tela cheia, progresso, capitular, falas, olhos, player de áudio (onda, busca, teclado, 1x/1,25x/1,5x, ducking do som), fechamento com confete, compartilhar e sugestões.
7. **Sobre:** "súmula" do projeto com transição de listras de gramado; 404 "Impedimento!" no app e em `404.html`.
8. **Conteúdo:** texto real da reportagem em `conteudo.js`, microtextos em português.
9. **Polimento:** som opcional sintetizado (Web Audio), lembrando a preferência; movimento reduzido com fades; foco visível, navegação por teclado, aria e contraste AA; SEO, Open Graph e `robots.txt`.
10. **QA anterior (Claude):** rotas, voltar/avançar, áudio, easter eggs e transições testados com Chrome headless em 390, 768 e 1440 px, sem erros de console. Lighthouse com gzip: desktop 99–100; celular com acessibilidade, boas práticas e SEO em 100 e performance entre 87 e 89. Essas notas são da versão anterior e não representam uma nova medição da versão atual.
