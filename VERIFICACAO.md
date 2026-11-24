# Verificação — 24/11/2026: fotos de Mariana Fraga, áudio de Cassia e grafia das Marianas

## O que mudou
- Mariana Fraga ganhou 5 fotos reais: a foto principal (estádio à noite, no Chile) e 4 no meio do texto (infância, beira do gramado, estúdio do Globo Esporte e Chile). A ilustração provisória saiu do site.
- Cassia França ganhou o player, logo depois da fala “Na minha federação era muito difícil…”, com o trecho de 45 s e a transcrição.
- A grafia segue as pastas enviadas: **Mariana Fraga** (um “n”) e **Marianna Líbano** (dois “n”). O endereço passou a ser `#historia/mariana-fraga`, e o antigo `#historia/marianna-fraga` continua abrindo a história, inclusive com a marcação de “lida” preservada.
- Peso novo no deploy: 1,0 MB das fotos (todas as larguras) e 0,6 MB do áudio (Opus + AAC). Saíram 332 KB da ilustração provisória. Quem lê a história de Mariana no celular baixa cerca de 190 KB de fotos, e só conforme rola.

## Verificações realizadas (Chrome headless)
- História de Mariana Fraga em 1440 px e 390 px: as 5 fotos carregam, nenhum “Marianna” no texto, nenhum erro de console ou de rede.
- Player de Cassia: toca o `cassia-franca.webm`, com duração de 45,2 s.
- Link antigo `#historia/marianna-fraga` abre a história de Mariana Fraga, e a leitura salva com o id antigo conta como lida.
- Todas as fotos e áudios citados em `conteudo.js` existem no manifesto, e nenhum arquivo do manifesto ficou sem uso. `node --check` em todos os módulos.

---

# Verificação — 19/11/2026: fotos, áudios e ajustes da capa

## O que mudou
- 21 fotos reais em 6 histórias (foto principal + fotos no meio do texto) e 6 trechos de áudio. Marianna Fraga segue com a ilustração (fotos não enviadas); Cassia França ficou sem player (áudio não enviado).
- Atalhos “Abertura · Sobre o projeto” no alto da capa; botão de som com ícone de alto-falante (X quando desligado, ondas quando ligado); subtítulo “…que marcam presença no futebol masculino no Brasil.”, também nas metatags.
- Player: não depende do som do estádio; nada é baixado antes do play; clicar na onda toca a partir do ponto escolhido; falhas aparecem na tela.
- Removidos o áudio demonstrativo e as 6 ilustrações substituídas (2,2 MB).

## Verificações realizadas (Chrome headless, sem usar o navegador da pessoa)
- **Áudio com o som do estádio desligado:** botão de play e clique na onda tocam (`paused: false`, tempo avançando). O áudio usa `nana-ednet.webm`, e o botão de som segue `aria-pressed="false"`. Antes do play, `preload="none"` e nenhum byte do áudio baixado.
- **Clique no meio da onda:** com servidor que aceita `Range` (como a Vercel), a reprodução começou em 17,4 s de 34,7 s. Com o `http.server` do Python, que não aceita `Range`, recomeça do início; a limitação é do servidor local.
- **Fluxo completo com cliques reais:** capa → apito → card de Edina (transição) → história → play → “Voltar às histórias” (selo “Lida”) → capa → “Sobre o projeto” → capa → “Abertura”. Sem erros de console.
- **As 7 histórias em celular (390 px, densidade 3), rolando até o fim:** nenhuma imagem quebrada e nenhuma pendente; nenhum erro de console. O navegador escolheu as versões de 800 px (densidade efetiva ~2,3×). Em computador 2×, escolheu as de 1080 px.
- **Arquivos:** os 12 arquivos de áudio decodificam sem erro no ffmpeg. O AAC tem o índice no início (`faststart`), e a Nana passou de −25,7 para −17,2 LUFS. O manifesto `js/midia.js` confere com os arquivos gerados (0 ausentes, 0 sobrando). `node --check` em todos os módulos e `vercel.json` válido.

## Peso da visita (laboratório, textos estimados com Brotli como a Vercel entrega)
| Visita | Antes | Depois |
| --- | ---: | ---: |
| Capa, computador | ~944 KB¹ | 528 KB |
| Capa, celular 3× | 645 KB | 650 KB |
| História de Carla no celular, rolando até o fim | 1.007 KB (ilustrações) | 1.049 KB (com 5 fotos reais) |

¹ 523 KB medidos + 421 KB das três versões grandes dos objetos em WebP, que a versão anterior baixava em segundo plano em computadores com mouse. O Chrome headless se apresenta como tela de toque, então essa parte foi somada pelos tamanhos dos arquivos, não medida.

Fotos e áudios só são baixados quando a leitura chega perto deles ou no play. Antes de otimizar, as 21 fotos somavam 17 MB e os 6 áudios 1,1 MB. Todas as versões das fotos somam 4,8 MB, e cada foto sai entre 10 e 165 KB na versão usada no celular. Os áudios (Opus + reserva AAC) somam 1,7 MB, mas cada pessoa baixa só um formato, e só ao dar play.

## Limites
Não houve teste no Safari, em iPhone ou em aparelho físico. A reserva em AAC existe para navegadores sem Opus, mas não foi exercitada num navegador real sem WebM. Nenhuma nota Lighthouse nova foi gerada. As transcrições vieram de reconhecimento de fala e precisam da escuta da autora (pontos listados no GUIA_TECNICO.md).

---

# Verificação da continuidade — 17/11/2026

## Carregamento no celular

Comparação em Chrome, 390 × 844 px, DPR 3, CPU com redução de 4× e rede Fast 4G. A página foi servida em `localhost:8766`, com gzip. O início da visita foi reiniciado para medir a primeira abertura.

| Medida | Antes | Depois |
| --- | ---: | ---: |
| Preloader removido, a partir da navegação | 4.831 ms | 1.999 ms |
| Inicialização concluída, classe `pronto` | 4.833 ms | 2.000 ms |
| Elementos animados da torcida | 126 | 48 |
| Largura do canvas decorativo | 585 px | 390 px |
| Requisições para domínios externos na abertura | CDN presente | 0 |

São amostras de laboratório, não uma média de produção. A comparação ocorreu antes dos ajustes finais no crédito de desenvolvimento e nos feixes dos refletores. A remoção do preloader mede o momento em que a página é liberada; a coreografia da capa continua depois disso. A cena decorativa usa 30 Hz no toque, enquanto as transições mantêm a taxa da tela. O desenho de partículas usa menos pixels, e não há pré-carga dos objetos grandes em celulares ou economia de dados.

**Não foi produzida uma nova nota Lighthouse.** A ferramenta de auditoria foi rejeitada pela política automática de aprovação do ambiente. As notas 87–89 no celular e 99–100 no desktop citadas no GUIA_TECNICO.md pertencem à entrega anterior do Claude. Não houve teste em aparelho físico.

## Verificações realizadas

- Capa em 390 px: título atualizado, três entradas de categoria presentes, sem rolagem horizontal e sem dependências de CDN.
- Clique no microfone abre Jornalistas; clique no card de Carla Pessoa abre a história. A transição termina, o título do navegador muda e o foco vai para o título da leitura.
- Player de Carla: arquivo de 16,04 s carregado, reprodução iniciada, tempo avançando e rótulo do botão alterado para pausar. Nenhum erro de console nas verificações móveis.
- Áudio demonstrativo identificado na legenda; as falas da reportagem aparecem como trecho da entrevista, sem serem apresentadas como transcrição do áudio sintetizado.
- Nova imagem de compartilhamento renderizada e inspecionada em 1200 × 630, com título, autoria e as ilustrações da capa. JPEG de aproximadamente 107 KB.
- Todos os módulos JavaScript próprios passaram por `node --check`.
- Integridade dos dados conferida: sete histórias, três categorias, identificadores únicos, retratos nos quatro formatos/tamanhos esperados e sete marcadores de áudio com arquivo existente.
- Referências locais de HTML, CSS e JS verificadas: nenhum arquivo ausente.
- Crédito de desenvolvimento conferido nos dados e no código: Caio Bezerra, com link discreto para `https://github.com/CaioBezerra-Dev` no Sobre. O campo de crédito de ilustrações foi removido a pedido do usuário.
- `node scripts/preparar-publicacao.mjs` executado: 132 arquivos, aproximadamente 5,86 MiB em `dist/`. Nenhuma pasta de originais incluída.

O usuário pediu verificações sem interferir no uso do computador. Os comandos de navegador foram interrompidos. Como não havia outra sessão de navegador disponível, a conclusão usou inspeção do código e checagens de arquivos. Navegação por teclado com teclas reais e uma nova auditoria completa permanecem sem validação nesta revisão; o comando de teclado também foi rejeitado pela política automática.

## Alinhamento dos refletores após atualizar

O posicionamento usava retângulos que já incluíam o zoom da abertura como se fossem coordenadas locais. Isso ampliava o deslocamento, principalmente nas torres da direita. Redimensionar a janela após a animação escondia o problema, pois o novo cálculo ocorria com escala 1.

A correção desfaz a escala antes de posicionar os cones, mantém o mesmo deslocamento em pixels para as camadas de torres e feixes na abertura e recalcula a geometria ao terminar a animação. As medidas dos quatro refletores são lidas antes de escrever os estilos.

Verificação geométrica sem navegador: 40 cenários, combinando 390 × 844, 768 × 1024, 928 × 732, 1280 × 720, 1366 × 768, 1440 × 900, 1920 × 1080 e 2560 × 1440 com cinco escalas. O cálculo original reproduziu um erro de até 213 px no caso 1366 × 768 com zoom 1,14. O novo cálculo manteve a origem dos cones a menos de 0,001 px do centro das lâmpadas em todos os cenários. O deslocamento da animação também foi conferido nas oito resoluções. Esses são testes numéricos; não houve nova inspeção visual após o pedido de preservar o uso do PC.

## Conteúdo e publicação

O título aprovado é **Mulheres no Futebol**. A apresentação do Sobre e a introdução de Árbitras foram redigidas com base na reportagem. Campos de créditos indefinidos ficam ocultos e podem ser preenchidos em `conteudo.js`. O ano de credenciamento de Edina foi corrigido para 2016, conforme o [cadastro da FIFA](https://inside.fifa.com/es/associations/BRA/referees); o arquivo original da reportagem foi preservado.

Ainda dependem da autora: fotos e áudios reais, transcrições correspondentes, créditos restantes e confirmação da cronologia de Marianna Fraga indicada no GUIA_TECNICO.md. Nenhuma hospedagem foi ativada durante esta revisão. Depois da publicação, as metatags de imagem precisam receber a URL absoluta do domínio real.
