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

**Não foi produzida uma nova nota Lighthouse.** A ferramenta de auditoria foi rejeitada pela política automática de aprovação do ambiente. As notas 87–89 no celular e 99–100 no desktop citadas no README pertencem à entrega anterior do Claude. Não houve teste em aparelho físico.

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

Ainda dependem da autora: fotos e áudios reais, transcrições correspondentes, créditos restantes e confirmação da cronologia de Marianna Fraga indicada no README. Nenhuma hospedagem foi ativada. Depois da publicação, as metatags de imagem precisam receber a URL absoluta do domínio real.
