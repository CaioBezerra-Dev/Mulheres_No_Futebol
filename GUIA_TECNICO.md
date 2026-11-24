# Guia técnico — Mulheres no Futebol

Orientações para editar o conteúdo, executar o projeto e preparar a publicação.

[Apresentação do projeto](README.md) · [Site publicado](https://mulheres-no-futebol.vercel.app/)

## Executar localmente

O site usa HTML, CSS e JavaScript puros. O preparo para publicação apenas copia os arquivos necessários, sem compilar o código.
Abra com um servidor local (abrir o `index.html` direto do disco não carrega os módulos JS):

```bash
python3 -m http.server 8765 --bind 127.0.0.1
# Acesse http://localhost:8765
```

O servidor do Python não aceita pedidos parciais (`Range`). Localmente, os áudios tocam, mas clicar no meio da onda recomeça do início. Na Vercel, e em servidores que aceitam `Range`, o player pula para o ponto clicado.

## Como trocar textos, fotos e áudios

Tudo que aparece escrito no site está em **`conteudo.js`**. Edite só o que está entre aspas.

- **Título:** “Mulheres no Futebol”, definido para esta versão. Para trocar, edite `site.titulo` em `conteudo.js`, as metatags de título no `index.html` e o título de `404.html`. O título da capa se ajusta sozinho ao tamanho.
- **Histórias:** cada uma tem `nome`, `funcao`, `titulo`, `destaque` (frase do card) e `texto` (lista de parágrafos). Parágrafo que começa com “ vira fala.
- **Marcadores no texto:**
  - `[[audio:carla-pessoa|legenda|transcrição]]` insere o player. Sem extensão, usa os arquivos otimizados `assets/audio/carla-pessoa.webm` e `.m4a`. A transcrição é opcional e aparece em “Ler transcrição”.
  - `[[olho:frase|quem disse]]` insere uma frase em destaque.
  - `[[foto:assets/fotos/carla-pessoa/infancia|legenda|crédito]]` insere uma foto no meio do texto. O crédito é opcional e aparece sob a legenda. Fotos em pé ficam centralizadas e limitadas pela altura da tela.
  - `## Intertítulo` insere um subtítulo.
- **Foto principal:** campo `foto` da história, por exemplo `"assets/fotos/edina-alves/apito"`, sem extensão. Ela aparece no card da aba, no topo da história e nas sugestões. Ajuste `fotoAlt` (descrição para leitores de tela), `fotoPosicao` (`"50% 30%"` = ponto da foto que fica no corte) e `fotoCredito` (crédito sob a foto; vazio não aparece).
- **Fotos e áudios novos** passam antes pelo script de otimização (veja abaixo). As sete histórias já usam fotos reais; se uma foto principal apontar para `assets/img/retratos/`, a página avisa sob a imagem que é uma ilustração provisória.

### Fotos e áudios: como adicionar ou trocar

1. Coloque o original em `assets/originais/`, que fica fora do Git:
   - fotos em `assets/originais/fotos/<id-da-historia>/<nome>.jpg` (também PNG, WebP ou TIFF; HEIC precisa ser convertido antes);
   - um trecho de áudio por história em `assets/originais/audio/<id-da-historia>.m4a` (também MP3, WAV etc.).
2. Rode o script. Ele precisa do `sharp` e do `ffmpeg` com `libopus`. O `sharp` fica fora do projeto, para o site continuar sem dependências:
   ```bash
   npm install --prefix ~/.cache/midia-reportagem sharp
   NODE_PATH=~/.cache/midia-reportagem/node_modules node scripts/otimizar-midia.mjs
   # se o ffmpeg não estiver no PATH: FFMPEG=/caminho/do/ffmpeg ...
   ```
3. Use o caminho sem extensão no `conteudo.js`: `assets/fotos/<id>/<nome>` nas fotos e `<id>` no marcador de áudio.

O que o script faz:
- **Fotos:** AVIF em 640, 800, 1080 e, nas deitadas, 1600 px, sem ampliar. Gera também um WebP de 800 px para navegadores sem AVIF. Corrige a orientação, converte para sRGB e remove os metadados, inclusive a localização GPS das fotos de celular. A qualidade 50 do AVIF foi comparada a um recorte ampliado do original e ficou igual a olho nu, com quase metade do peso da qualidade 58.
- **Navegador:** escolhe sozinho o menor arquivo que serve. Em celulares de densidade 3, o pedido equivale a ~2× (diferença imperceptível em foto). As fotos do texto só carregam quando a leitura chega perto delas.
- **Áudios:** uniformiza o volume em −17 LUFS, porque a gravação de Nana estava 9 dB abaixo das outras. Também tira graves de manuseio, suaviza o começo e o fim e gera Opus/WebM de 40 kbps, com AAC/M4A de 64 kbps como reserva. O player não baixa nada antes do play: a duração e o desenho da onda (o volume real do trecho) vêm do manifesto.
- **Manifesto:** escreve `js/midia.js` com proporção, cor de fundo enquanto a foto carrega, larguras, duração e onda. Não edite esse arquivo à mão.
- **Bordas e recortes:** a lista `RECORTES`, no início do script, remove bordas de fotos recebidas com faixa. Hoje só a foto da Copa de 2019 de Edina passa por ela.
- **Execução incremental:** só processa originais novos ou alterados. Use `--forcar` para refazer tudo.

### Por que o player toca sem o som do estádio
O botão com o alto-falante, no alto à direita, liga e desliga só o som ambiente do estádio, que é sintetizado na hora. Os áudios das entrevistas usam um `<audio>` próprio e tocam com ele ligado ou desligado. Quando os dois tocam juntos, o ambiente abaixa sozinho. Clicar ou tocar na onda também começa a reprodução, a partir do ponto escolhido.
- **Créditos:** `creditos` em `conteudo.js` (aparece em `#sobre`). Desenvolvimento: Caio Bezerra, com link para o GitHub. Para vincular outro crédito a uma página, use o campo opcional `link`. Orientação e instituição ainda estão vazios; os campos aparecem quando preenchidos. Agradecimentos e contato também ficam ocultos até serem definidos. O contato precisa de um e-mail válido.
- **Textos da interface** (botões, avisos, mensagens): `interface` em `conteudo.js`.

### O que ainda depende da autora
- **Créditos das fotos:** nenhum crédito foi informado. Preencha `fotoCredito` em cada história e o terceiro campo dos marcadores `[[foto:…|legenda|crédito]]` (ex.: “Arquivo pessoal”, “Fulano/CBF”).
- **Legendas:** foram escritas a partir do que a foto mostra e do texto. Confira principalmente “Copa do Mundo Feminina de 2019, na França” (Edina, pelo patch da camisa) e “Liga das Nações de Vôlei” (Nana, pelas placas).
- **Transcrições:** feitas com reconhecimento de fala (Whisper) e conferidas trecho a trecho. Dois pedaços pouco claros viraram (…): Mariana Fraga, depois de “profissão de artista”, em que se ouve algo como “eu tenho certeza que você tá falando…”; e Nana, depois de “Mané Mercado”, com “só tinha esse que tinha o Mané Mercado ali”. Em Carla, o trecho “Antes disso a gente tem um jogo” segue o texto da reportagem; a máquina ouviu variações como “antes a gente só tem um jogo”. Ouça e ajuste se preciso. A transcrição de Cassia foi conferida de ouvido em 24/11/2026: “se você fizer um bom trabalho”, “porque ainda era um pouco mais machista” (sem “eu”) e “na árbitra central” estão como ela fala.
- **Grafia das Marianas:** segue o nome das pastas enviadas: **Mariana Fraga** (um “n”, endereço `#historia/mariana-fraga`) e **Marianna Líbano** (dois “n”). O endereço antigo `#historia/marianna-fraga` continua abrindo a história (lista `IDS_ANTIGOS` em `js/base.js`). O texto original em `reportagem/REAL REPORTAGEM.md` foi preservado com a grafia recebida.
- **Fotos não usadas:** a seleção evitou repetições e imagens com terceiros identificáveis ao lado de trechos sobre conflitos. Também ficaram de fora duas capturas de tela do Instagram com a interface aparecendo. De Mariana Fraga, entraram 5 das 10 fotos; ficaram de fora a segunda foto de infância, a da estátua de Maradona, a do visor da câmera e as duas gravações de basquete (de máscara). Todas continuam em `auxilio_reportagem` e no pacote do Drive.
- **Grafia de Mirian:** confirmada como **Mirian**, com “n” (24/11/2026). A reportagem alternava “Miriam” e “Mirian”, e a pasta enviada diz “Miriam”; o site usa “Mirian” em todo lugar.
- **Ainda em aberto:** orientação, instituição, agradecimentos e e-mail. Os **títulos das histórias são sugestões** tiradas do próprio texto: revise. A apresentação do Sobre e a introdução de Árbitras também podem passar pela revisão editorial da autora.

### Revisão feita no texto da reportagem (`reportagem/REAL REPORTAGEM.md`)
O texto real entrou em `conteudo.js` com correções leves. Confira e desfaça se quiser:
- Digitação: "quandoseu", "foir", "qualo", "ocaminho", "soubeo", "precisoufazer", "queo", "enfrentoupor", "Braisleiro", "bebados" → "bêbados", "Mane" → "Mané", "de uma lado" → "de um lado", "quando em integrar" → "quanto em integrar", aspas e espaços duplos.
- Padronização: **Miriam → Mirian** (como no título da seção) e **Libano → Líbano**; "série A/B" → "Série A/B"; "Metrópolis" → **Metrópoles** (nome do portal).
- Pequenos ajustes de frase: "há cerca de quase 2 anos" → "há quase dois anos"; "tentaram a impedir" → "tentaram impedi-la"; "segue estabelecendo com uma barreira" → "segue estabelecendo uma barreira"; "Série D e C" → "Séries D e C".
- **Ano corrigido:** o credenciamento de Edina Alves é de **2016**, conforme o [cadastro oficial da FIFA](https://inside.fifa.com/es/associations/BRA/referees). O original da reportagem foi preservado; a correção está em `conteudo.js`.
- **Verificar com a fonte:** Mariana Fraga: cirurgia no fim de 2021 e contratação “poucos meses” depois, no início de 2023. A cronologia foi mantida aguardando confirmação.

## Como publicar

É um site estático. Para gerar uma pasta limpa de publicação:

```bash
node scripts/preparar-publicacao.mjs
```

O comando usa apenas o Node.js, não precisa de instalação e recria `dist/` com HTML, CSS, JS e os assets usados pelo site. Exclui os originais, ferramentas e documentos de trabalho. Para conferir a pasta gerada, rode `python3 -m http.server 8000 --directory dist` e acesse `http://localhost:8000`.

- **Netlify:** envie `dist/` em app.netlify.com/drop ou configure o comando acima e a pasta de publicação `dist`.
- **Vercel:** importe o repositório como site sem framework, com o comando acima e a pasta de saída `dist`. O `vercel.json` define o cache: imagens, fotos, áudios e ícones por 1 dia, bibliotecas por 30 dias e fontes por 1 ano. HTML, CSS, `conteudo.js` e o JS do site continuam sem cache, para as atualizações aparecerem na hora. Ao trocar uma foto, prefira um nome novo, porque quem já visitou pode ver a anterior por até um dia.
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
- Fotos reais e trechos de áudio das entrevistadas, otimizados por `scripts/otimizar-midia.mjs` (veja “Fotos e áudios”).
- Capa: atalhos “Abertura · Sobre o projeto” no alto, na altura do botão de som (antes ficavam escondidos no rodapé); botão de som com ícone de alto-falante; subtítulo com “que marcam presença”, a pedido da orientação.
- No computador, a versão grande de cada objeto só é baixada quando a pessoa aponta para ele. Antes, as três versões em WebP (~420 KB) eram baixadas em toda visita. Agora é uma só, em AVIF.
- Cache na Vercel pelo `vercel.json` (detalhes em “Como publicar”).
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
