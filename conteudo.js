/* =============================================================================
   CONTEÚDO DO SITE
   -----------------------------------------------------------------------------
   Todo texto que aparece no site está neste arquivo. Para trocar algo, edite
   só o que está entre aspas. Não precisa mexer em nenhum outro arquivo.

   Cuidados:
   - Mantenha as aspas retas ("...") em volta de cada texto e a vírgula no fim.
   - Dentro do texto, use aspas curvas “assim” para falas (elas não quebram nada).
   - Itens marcados com PLACEHOLDER ainda esperam o conteúdo definitivo.

   Marcadores que funcionam dentro dos parágrafos das histórias:
     [[audio:carla-pessoa|legenda|transcrição]] player de áudio (a transcrição é opcional).
                                                Sem extensão: usa os arquivos otimizados pelo
                                                script (assets/audio/carla-pessoa.webm e .m4a).
     [[olho:frase|quem disse]]                  frase em destaque, grande (pull quote).
     [[foto:assets/fotos/carla-pessoa/infancia|legenda|crédito]]
                                                foto no meio do texto (o crédito é opcional).
     ## Intertítulo                             subtítulo dentro do texto.
   Um parágrafo que começa com aspas curvas (“) vira automaticamente uma fala.
   Fotos e áudios novos passam antes pelo scripts/otimizar-midia.mjs (veja o GUIA_TECNICO.md).

   Foto de cada história: troque só o campo "foto" (ex.: "assets/fotos/edina-alves/apito").
   ============================================================================= */

window.CONTEUDO = {

  /* ---------------------------------------------------------------------------
     O SITE
     ------------------------------------------------------------------------- */
  site: {
    titulo: "Mulheres no Futebol",
    kicker: "Reportagem multimídia",
    subtitulo: "Histórias reais de jornalistas, árbitras e gestoras que marcam presença no futebol masculino no Brasil.",
    instrucao: "Encoste nos objetos",            // aparece no computador
    instrucaoToque: "Toque nos objetos",         // aparece no celular
    linkAbertura: "Abertura",                   // atalho no alto da capa, ao lado de "Sobre o projeto"
    descricao: "Reportagem multimídia sobre mulheres no futebol masculino: jornalistas, árbitras e gestoras contam o preço de ocupar o campo, a cabine e a diretoria.",
  },

  /* ---------------------------------------------------------------------------
     ABERTURA DA REPORTAGEM (rota #abertura)
     ------------------------------------------------------------------------- */
  abertura: {
    kicker: "Abertura",
    titulo: "A inserção das mulheres no futebol masculino no Brasil",
    texto: [
      "O microfone na mão, o crachá no pescoço, o apito no peito. No futebol profissional masculino no Brasil, a chegada de uma mulher no estádio em dia de jogo costuma passar por um filtro invisível: a necessidade constante de provar que ela realmente deve estar lá.",
      "Diferentemente de quem entra em campo com a camisa do clube, as profissionais que atuam na arbitragem, no jornalismo e na gestão de clubes não jogam para a torcida. O trabalho acontece na tomada de decisão de um lance dentro do campo, na apuração de uma notícia do vestiário ou no comando financeiro ou administrativo. Nesses três territórios, historicamente moldados por e para homens, a presença feminina deixou de ser uma impossibilidade para ser uma realidade, mas bem longe de ser igualitária.",
      "Mas, para chegar até essa realidade, muitas tiveram que pagar o preço. Em 1941, Getúlio Vargas decretou por lei:",
      "[[olho:“Às mulheres não se permitirá a prática de desportos incompatíveis com as condições de sua natureza.”|Lei de 1941, governo Getúlio Vargas]]",
      "O único lugar reservado para elas era nas arquibancadas dos estádios. Um trecho chocante para os dias de hoje, mas na época funcionava como senso comum. As mulheres eram vistas como cuidadoras de seus lares, enquanto os maridos assumiam o papel de provedores da casa, e no esporte eram meras espectadoras.",
      "A lei foi revogada quase 40 anos depois e hoje ainda persistem dificuldades para adentrar esse espaço.",
    ],
    convite: "Escolha por onde seguir",
  },

  /* ---------------------------------------------------------------------------
     CATEGORIAS (as três abas). A ordem aqui é a ordem dos objetos na capa.
     ------------------------------------------------------------------------- */
  categorias: [
    {
      id: "jornalistas",
      objeto: "microfone",
      nome: "As Jornalistas",
      linhas: ["As", "Jornalistas"],         // como o título quebra em linhas
      capitulo: "Jornalismo",
      descricaoObjeto: "Microfone de repórter",
      intro: [
        "Falar sobre futebol, analisar esquemas táticos, segurar o microfone na beira do gramado e comandar a cobertura de um grande clube sempre exigiu das mulheres na imprensa uma dose extra de resiliência. Estar ali não significa apenas fazer o trabalho, mas ocupar um espaço que historicamente tentou empurrá-las para o canto, como se isso fosse algo exclusivo para homens.",
        "Seja nos gramados, nos estúdios ou nas redações, a presença feminina na cobertura esportiva foi conquistada metro por metro. Das mulheres, sempre é exigida mais perfeição. São vigiadas de perto e ainda precisam enfrentar comentários machistas.",
      ],
    },
    {
      id: "arbitras",
      objeto: "apito",
      nome: "As Árbitras",
      linhas: ["As", "Árbitras"],
      capitulo: "Arbitragem",
      descricaoObjeto: "Apito de árbitra",
      intro: [
        "O apito marca o começo do jogo, mas o caminho até ele começa muito antes. Para Edina Alves e Cassia França, entrar em campo significou enfrentar dificuldades financeiras, conquistar oportunidades e aprender a decidir sob a pressão de atletas e torcedores.",
        "“Em uma fração de segundo você tem que decidir e todo mundo gritando no seu ouvido.” A frase de Edina resume o ofício. Nas trajetórias das duas árbitras, o preparo para cada partida se encontra com outra exigência: provar, repetidamente, que aquele também é o lugar delas.",
      ],
    },
    {
      id: "gestoras",
      objeto: "caderneta",
      nome: "As Gestoras",
      linhas: ["As", "Gestoras"],
      capitulo: "Gestão",
      descricaoObjeto: "Caderneta de anotações",
      intro: [
        "Para quem acompanha o mundo do futebol, um nome que está gravado é o de Leila Pereira. A presidente da Sociedade Esportiva Palmeiras participa ativamente das redes sociais e da imprensa expondo suas opiniões como responsável pelo clube e também como torcedora. Ela é um dos maiores nomes do futebol profissional do Brasil e do mundo. Mas também existiram e existem outras mulheres em cargos de gestão que não são tão comentadas.",
      ],
    },
  ],

  /* ---------------------------------------------------------------------------
     HISTÓRIAS
     id: vira o endereço (#historia/id). Use letras minúsculas e hífens.
     titulo: os títulos abaixo são SUGESTÕES feitas a partir do texto. Revise.
     foto: foto principal (card e topo da história). Ex.: "assets/fotos/carla-pessoa/beira-do-campo".
           Fotos em assets/fotos/ são as versões leves geradas pelo script; os caminhos em
           assets/img/retratos/ são as ilustrações provisórias.
     fotoPosicao: ponto da foto que fica visível no corte ("50% 30%" = centro, um pouco acima).
     fotoCredito: crédito da foto principal (aparece sob a foto). Vazio = não aparece.
     ------------------------------------------------------------------------- */
  historias: [
    /* ======================= JORNALISTAS ======================= */
    {
      id: "carla-pessoa",
      categoria: "jornalistas",
      nome: "Carla Pessoa",
      funcao: "Setorista do Cruzeiro na Cazé TV",
      titulo: "A voz que ninguém escutava",
      destaque: "“Eu escutava meus amigos falando de futebol, queria falar também, mas ninguém me escutava. Eu não tinha voz.”",
      foto: "assets/fotos/carla-pessoa/beira-do-campo",
      fotoAlt: "Carla Pessoa sorri à beira do gramado, segurando o microfone da Cazé TV, com o estádio iluminado ao fundo.",
      fotoPosicao: "50% 30%",
      fotoCredito: "",   // Preencher com o crédito da foto (ex.: "Arquivo pessoal").
      texto: [
        "Carla Pessoa é setorista do Cruzeiro pela Cazé TV. Nascida em uma família na qual o clube era uma exigência, “ou você torce para o Cruzeiro ou sai de casa”, ela cresceu tendo o pai como grande parceiro nas arquibancadas, aprendendo escalações e histórias do time desde pequena.",
        "[[foto:assets/fotos/carla-pessoa/infancia|Carla Pessoa na infância, com a camisa do Cruzeiro.]]",
        "A paixão precoce, contudo, esbarrava na barreira do gênero. “Eu escutava meus amigos falando de futebol, queria falar também, mas ninguém me escutava. Eu não tinha voz”. Com o tempo, o medo de dar opiniões que fossem consideradas inúteis travava sua participação nas conversas sobre esporte.",
        "O cenário começou a mudar quando ela decidiu pesquisar e estudar o futebol por conta própria. Mas o ponto da virada aconteceu durante a pandemia de Covid-19, em 2021. Trancada em casa, esgotada psicologicamente com a reta final da faculdade de jornalismo e vivendo o drama do Cruzeiro na Série B, Carla buscou nas redes sociais uma válvula de escape.",
        "Em vez de apostar no xingamento ou no ódio após as derrotas do time, ela criou um conteúdo analítico e sensível nas redes sociais. O público respondeu rápido e a audiência cresceu. Com isso, o hobby ganhou proporções profissionais e ela tomou a coragem de pedir demissão do emprego CLT para viver do trabalho na internet.",
        "A parte profissional veio quando a Cazé TV, maior mídia digital do Brasil, olhou o seu trabalho e a convidou para cobrir o dia a dia do Cruzeiro. A experiência consolidou a transição: hoje, ela admite que a paixão pelo futebol no Brasil superou até mesmo o próprio clubismo.",
        "[[foto:assets/fotos/carla-pessoa/microfone-caze-tv|Carla Pessoa com o microfone da Cazé TV.]]",
        "Mas mostrar o rosto na internet exigiu estômago para lidar com a violência do machismo virtual. Os ataques raramente ficavam restritos à parte técnica. Ao falar sobre a convocação de um jogador, por exemplo, Carla passou a ser alvo de ameaças explícitas de morte à sua família, intimidação física e comentários absurdos como “vamos te achar no Mineirão”. Nas fotos pessoais, o corpo virava alvo constante de julgamento, limitando o que ela podia postar sem temer os comentários misóginos.",
        "A transição para o jornalismo de campo e para as zonas mistas (local de entrevistas pré e pós jogos) trouxe mais desafios. Nos primeiros tempos, a sensação de isolamento e a falta de abertura com os clubes pesavam. A virada de chave veio quando ela trocou a insegurança pelo estudo profundo do jogo.",
        "[[foto:assets/fotos/carla-pessoa/libertadores|Carla Pessoa trabalhando em um jogo da Libertadores.]]",
        "A linha de frente do gramado, no entanto, testa os limites psicológicos. Durante a cobertura da Libertadores, após um empate amargo do Cruzeiro, Carla entrevistou um jogador do time na saída do campo. Frustrado com o resultado, o atleta deu uma resposta ríspida diante de todos, minimizando a pergunta sobre o jogo de volta e mandando-a focar no Campeonato Brasileiro.",
        "“Ele me deu uma má resposta, eu não vou lembrar das palavras exatas, porque eu fiquei muito traumatizada, mas tipo assim: ‘Antes disso a gente tem um jogo, quarta-feira a gente pensa nisso, você deveria estar perguntando do jogo do Brasileirão, em vez de estar projetando o jogo da Libertadores’.”",
        "[[audio:carla-pessoa|Carla Pessoa relembra a entrevista na saída do gramado.|“Qual que é a projeção para esse jogo da volta, que vocês vão ter mais dificuldade ainda por jogar no Maracanã?” E ele me deu uma má resposta. Eu não vou lembrar as palavras exatas, porque eu fiquei muito traumatizada. Mas, tipo assim: ‘Antes disso a gente tem um jogo. Quarta-feira a gente pensa nisso. Você devia estar perguntando do jogo do Brasileirão, em vez de estar projetando o jogo da Libertadores’.]]",
        "O constrangimento na saída do gramado deixou cicatrizes, mas reforçou a realidade da profissão: na beira do campo, a repórter mulher costuma ser o alvo mais fácil para descarregar a frustração de uma derrota. Nos bastidores das salas de imprensa, a proporção continua desigual.",
        "[[olho:“Na zona mista, por exemplo, um lugar que eu vou bastante, de 30 pessoas que estão lá, três são mulheres.”|Carla Pessoa]]",
        "Mesmo diante da hostilidade das redes e da pressão nos estádios, Carla recusa o papel de vítima e prefere enxergar a profissão como uma conquista diária: a presença feminina na beira do gramado deixou de ser uma exceção para se tornar uma ocupação definitiva.",
        "[[foto:assets/fotos/carla-pessoa/gramado|Carla Pessoa à beira do gramado, em dia de jogo.]]",
      ],
    },
    {
      id: "nana-ednet",
      categoria: "jornalistas",
      nome: "Nana Ednet",
      funcao: "Repórter do portal Metrópoles",
      titulo: "Eu quis perguntar isso",
      destaque: "“Dane-se se eles acharem a pergunta ruim, se acharem a garota idiota. Eu quis perguntar isso.”",
      foto: "assets/fotos/nana-ednet/arquibancada",
      fotoAlt: "Nana Ednet sorri na arquibancada de um estádio lotado, com a camisa do Cruzeiro.",
      fotoPosicao: "55% 45%",
      fotoCredito: "",   // Preencher com o crédito da foto.
      texto: [
        "Nana Ednet cresceu em uma casa onde se respirava o esporte em cada canto. Filha de uma maratonista e de um ex-jogador de futebol, ela absorveu a paixão pela bola desde cedo. O hábito de assistir às partidas ao lado do pai transformou-se em vocação profissional. Aos 12 anos, após comentar uma partida e surpreender o pai com uma análise tática, percebeu que o caminho seria ser jornalista esportiva.",
        "[[foto:assets/fotos/nana-ednet/infancia-mineirao|Nana Ednet ainda criança, com a camisa do Cruzeiro, em um estádio.]]",
        "Formada em Brasília, Nana aproveitou as oportunidades logo cedo: fez um estágio no Correio Braziliense e teve uma passagem como articulista de futebol feminino no Poder360. A consolidação como jornalista esportiva veio com a entrada no portal Metrópoles, onde atua há quase dois anos.",
        "A transição da expectativa de infância para a realidade da profissão exigiu o ajuste natural de quem chega jovem ao mercado. Lidando com a rotina de redação, apuração e coberturas externas, Nana viu que a paixão pelo esporte precisava vir acompanhada de estômago e resiliência, especialmente em um ambiente que testa a autoridade feminina a todo instante.",
        "[[foto:assets/fotos/nana-ednet/tribuna-de-imprensa|Nana Ednet na tribuna de imprensa da Liga das Nações de Vôlei.]]",
        "Assim como muitas profissionais da área, os bastidores vieram com o machismo e a insegurança. Cobrindo partidas de grande porte, ela enfrentou situações de hostilidade e assédio nas ruas ao redor dos estádios, e episódios de chegadas de delegações com comentários machistas. A falta de respeito no espaço profissional exigiu a construção de uma casca grossa.",
        "“Fui cobrir um jogo do São Paulo que teve no Mané Garrincha, e saindo do estádio tinha três torcedores extremamente bêbados, eles ficaram falando ‘Ei, imprensa, vem aqui me entrevistar’, e ficavam mandando beijo. Eu fui para o banheiro, aí eu comecei a chorar.”",
        "[[audio:nana-ednet|Nana Ednet conta o que viveu na saída do Mané Garrincha.|Quando eu ainda era estagiária, eu fui cobrir um jogo do São Paulo que teve no Mané Garrincha. E aí, saindo do estádio, tinha três torcedores do São Paulo que estavam extremamente bêbados. Eu tava saindo sozinha, ali pro Mané Mercado (…). Aí, tava indo e eles ficaram falando: ‘Ei, imprensa, vem aqui me entrevistar, vem. Vem aqui me entrevistar’. Aí ficaram mandando beijo. E aí eu comecei a gravar, aí eles pararam. Aí eu fui pro Mané Mercado, eu fui pro banheiro, eu comecei a chorar, chorar, chorar. Eu só conseguia chorar. Eu ficava: ‘Cara, que saco, sabe? Será que vai ser sempre assim?’]]",
        "Nas redes sociais, o cenário se repete. Comentários como tentativas de desqualificar a capacidade técnica, ataques direcionados ao corpo e à família.",
        "“A internet, ao mesmo tempo que permite muitas coisas boas, ela dá um excesso de permissividade… as pessoas acham que é terra sem lei, que não tem punição, e se escondem atrás de perfis para falar coisas absurdas.”",
        "Apesar de o ambiente virtual ser difícil, a realidade da redação oferece o contraponto necessário para seguir em frente. Mesmo dividindo o dia a dia com uma equipe jovem e completamente masculina, ela encontrou um espaço onde o respeito e a valorização das pautas femininas são aceitas e abraçadas.",
        "Mas a rotina de apuração e o contato direto com atletas exigem um exercício constante de autoconfiança. No começo, a insegurança sobre o peso das perguntas diante de jogadores gerava dúvidas e receios, mas isso não deveria se tornar algo permanente.",
        "[[olho:“Dane-se se eles acharem a pergunta ruim, se acharem a garota idiota. Eu quis perguntar isso.”|Nana Ednet]]",
        "Lidar com a impaciência ou a rispidez de alguns jogadores faz parte da linha de frente do jornalismo esportivo. Embora evite levar para o lado pessoal a frustração dos competidores que respondem de forma ríspida, Nana aprendeu o ponto de encerrar entrevistas quando eles não fazem questão de estar ali.",
        "A ilusão de proximidade que alguns jogadores tentam estabelecer, transformando o crachá de imprensa em atalho para investidas pessoais, exige uma certa blindagem. Nana já recebeu convites e comentários de atletas que já a deixaram totalmente sem reação.",
        "Hoje, ela segue estabelecendo uma barreira rígida, para mostrar que a presença feminina nos bastidores não está à mercê da conveniência de atletas ou de outros profissionais.",
      ],
    },
    {
      id: "mariana-fraga",
      categoria: "jornalistas",
      nome: "Mariana Fraga",
      funcao: "Repórter da TV Globo",
      titulo: "Profissão de artista",
      destaque: "“Era uma coisa tão forte dentro de mim, uma força que me movimentava, que não tinha como silenciar.”",
      foto: "assets/fotos/mariana-fraga/estadio-a-noite",
      fotoAlt: "Mariana Fraga, com credencial de imprensa e mochila, sorri olhando para trás à beira do gramado de um estádio lotado e iluminado à noite.",
      fotoPosicao: "52% 38%",
      fotoCredito: "",   // Preencher com o crédito da foto.
      texto: [
        "Mariana Fraga não chegou ao jornalismo esportivo por acaso, tampouco seguiu uma rota tradicional. Nascida em Pirapora, cidade do interior de Minas Gerais, ela cresceu sem grandes opções de entretenimento ou veículos de comunicação ao alcance. A paixão pelo futebol veio nos bares da cidade, onde acompanhava as partidas com o pai.",
        "[[foto:assets/fotos/mariana-fraga/infancia|Mariana Fraga na infância.]]",
        "Quando tinha 14 anos, durante a histórica campanha do título da Copa Libertadores do seu clube do coração, tomou a decisão de virar jornalista pelo amor ao futebol. Vinda de uma realidade econômica humilde, em que sua mãe precisou se desdobrar após 30 anos para cursar faculdade, a ideia de trabalhar com esporte parecia distante para a família. Mas Mariana é uma mulher que sempre soube o que queria da vida.",
        "“Quando eu virava para a minha mãe e falava que queria ser jornalista esportiva, ela dizia: ‘minha filha, mas isso é profissão de artista’. Ninguém acreditava. Mas era uma coisa tão forte dentro de mim, uma força que me movimentava, que não tinha como silenciar.”",
        "[[audio:mariana-fraga|Mariana Fraga sobre a decisão de virar jornalista esportiva.|Quando eu virei pra minha mãe e falei assim: ‘Eu quero ser jornalista, eu quero ser jornalista esportiva’, a minha mãe falou assim: ‘Minha filha, mas isso é uma profissão de artista’ (…). A minha mãe não acreditou, ninguém acreditou nisso, sabe? Mas era uma coisa tão forte pra mim, era uma coisa tão, assim, poderosa, assim, dentro, que me movimentava, que eu falava assim: ‘Não tem como eu silenciar’, sabe? Não tem como.]]",
        "Como um plano já feito antes mesmo de começar no ensino superior, ela mudou para Brasília. Entre a rotina de estudos intensos e o cotidiano de conciliar trabalho com questões financeiras, ela construiu um portfólio desde os primeiros semestres da faculdade. Passou a produzir matérias de futebol feminino e assumiu as coberturas institucionais pela CBF TV.",
        "[[foto:assets/fotos/mariana-fraga/beira-do-campo|Mariana Fraga à beira do gramado, com o microfone na mão, em dia de jogo.]]",
        "Vivendo tantos momentos que aumentavam suas experiências e aprendizados, ela enfrentou o machismo sutil, como questionamentos da própria família ou homens tirando seus créditos. Mariana teve que rebater essas situações com estudo e apurações rigorosas.",
        "“As pessoas acham que nós, mulheres, não vamos sustentar o discurso, que eles vão ficar confortáveis nos deixando desconfortáveis, esperando que a gente se diminua ou peça desculpas por um constrangimento que eles causaram. Comigo isso não cresce.”",
        "Mariana já teve seu trabalho como jornalista ameaçado por dirigentes e seguranças que tentaram impedi-la de ter acesso à zona mista. Diante de profissionais que questionavam sua autoridade com argumentos evasivos sobre segurança, a repórter adotou outra postura: cobrar o cumprimento das diretrizes e deixar claro que tentativas de silenciamento não têm espaço.",
        "Em meio à rotina, Mariana passou por um diagnóstico para o qual não estava preparada. No final de 2021, foi diagnosticada com um câncer na tireoide e precisou fazer uma cirurgia de grande porte. Mesmo durante o processo de tratamento, ela não interrompeu a trajetória: seguiu com a maratona de estágios e reportagens ao vivo. Poucos meses após o procedimento, consolidou sua contratação na TV Globo no início de 2023.",
        "[[foto:assets/fotos/mariana-fraga/globo-esporte|Mariana Fraga no estúdio do Globo Esporte.]]",
        "Com tantas produções acumuladas, roteirizou e apresentou séries dedicadas aos bastidores do futebol do Distrito Federal, o que garantiu a ela um prêmio internacional de jornalismo esportivo em 2024, rendendo uma bolsa de especialização no Chile como a única representante brasileira entre tantos repórteres do mundo.",
        "[[foto:assets/fotos/mariana-fraga/chile|Mariana Fraga com a credencial de imprensa em um estádio no Chile.]]",
        "[[olho:“A menina que ficava no quarto sonhando em viajar o Brasil com o trabalho virou essa pessoa. O jornalismo esportivo exige que você seja estratégica e criativa para ocupar seu espaço com autoridade.”|Mariana Fraga]]",
      ],
    },

    /* ======================= ÁRBITRAS ======================= */
    {
      id: "edina-alves",
      categoria: "arbitras",
      nome: "Edina Alves",
      funcao: "Árbitra FIFA",
      titulo: "A aposta que virou carreira",
      destaque: "“Em uma fração de segundo você tem que decidir e todo mundo gritando no seu ouvido.”",
      foto: "assets/fotos/edina-alves/apito",
      fotoAlt: "Edina Alves em campo, com o apito na boca, durante uma partida.",
      fotoPosicao: "50% 10%",
      fotoCredito: "",   // Preencher com o crédito da foto.
      texto: [
        "Edina Alves é uma das maiores árbitras da história do futebol mundial. Nascida no interior do Paraná, ela cresceu em uma família de origem humilde em que o esporte era paixão, mas as opções para as meninas eram limitadas. Sem clube de futebol feminino na época, Edina jogava basquete e futsal para representar o município, enquanto ouvia da família que o esporte “não era coisa de menina”.",
        "O destino mudou de rumo por causa de uma aposta em uma partida de basquete. Ao perder para o time de uma amiga cujo pai era árbitro, Edina teve que trabalhar em uma partida como assistente. Sem nunca ter segurado uma bandeira ou um apito, ela foi para a beira do campo.",
        "“E eu peguei, acabei gostando bastante da adrenalina ali que envolve, porque é uma adrenalina: em uma fração de segundo você tem que decidir e todo mundo gritando no seu ouvido.”",
        "[[audio:edina-alves|Edina Alves sobre a primeira vez na beira do campo.|E eu peguei, acabei gostando, entendeu, daquela adrenalina ali que envolve, porque é uma adrenalina, entendeu? Uma fração de segundo, você tem que decidir aqui, todo mundo gritando no seu ouvido e a torcida atrás gritando.]]",
        "Para pagar o curso de arbitragem da federação, que custava meio salário mínimo, além das viagens semanais por várias cidades do Paraná, Edina precisou trabalhar.",
        "A entrada na arbitragem foi dificultada por barreiras institucionais. Ao se apresentar na liga de futebol do bairro, o presidente a recebeu com deboche: “Aqui não joga com a mão, hein”, fazendo piadas para diminuir sua capacidade.",
        "No comando da arbitragem paranaense, a resistência era algo ainda mais explícito. Em testes físicos que eram exigidos exclusivamente para homens, Edina e outras mulheres correram no teste para provar que são capazes. Mesmo assim o presidente mantinha restrições apenas para o quadro feminino e proibia o avanço para apitarem no futebol masculino, pois “mulher nunca chegará a lugar nenhum”.",
        "Após anos de dificuldade, em 2012, a mudança veio na diretoria da CBF e a liberação para que as mulheres pudessem fazer os testes masculinos e atuar nas principais categorias.",
        "[[olho:“Eu quero mostrar para ele que eu consigo, que a mulher consegue. O meu maior sonho era esse, trabalhar em um jogo da Série A. Foi a minha vida inteira querendo isso.”|Edina Alves]]",
        // Ano conferido no cadastro oficial da FIFA: https://inside.fifa.com/es/associations/BRA/referees
        "Em 2016, Edina recebeu o escudo da FIFA. Foi a primeira mulher a apitar em um mundial de clubes masculino e na Libertadores da América masculina, além de atuar em Copas do Mundo, Olimpíadas, Copa América e Eurocopa.",
        "[[foto:assets/fotos/edina-alves/copa-do-mundo-2019|Edina Alves na Copa do Mundo Feminina de 2019, na França.]]",
        "Mas estar na elite exigiu estômago para lidar com a violência do machismo. Jogadores, que são acostumados com um ambiente totalmente masculino, a testavam nas partidas. No calor durante a partida, quando apitava algum lance que não era do agrado dos jogadores, eles iam para cima dela, gritando e contestando a decisão de campo. Atletas que não aceitavam suas decisões de campo e iam até os árbitros assistentes.",
        "Edina já passou por campanhas de difamações, mentiras inventadas em sites, como boatos falsos de que estaria punida quando, na verdade, estava trabalhando nas Olimpíadas.",
        "Apesar de tudo, ela transformou a área de arbitragem do futebol masculino brasileiro. Hoje, com mais de 50 jogos na elite do Brasileirão e inspirando a nova geração de meninas que já cresceu vendo mulheres apitando na televisão, Edina resume seu legado com muito orgulho.",
        "[[foto:assets/fotos/edina-alves/antes-do-jogo|Edina Alves em campo, com a bola da partida.]]",
        "“Eu sou uma mulher realizada, eu faço o que eu amo, uma profissão maravilhosa. Se a pessoa duvida da sua capacidade, do seu potencial, o mundo duvida, você fala ‘Não, eu vou mostrar que nós conseguimos’. Nós somos boas também.”",
      ],
    },
    {
      id: "cassia-franca",
      categoria: "arbitras",
      nome: "Cassia França",
      funcao: "Árbitra da FFDF e da CBF",
      titulo: "O dobro para entregar o mínimo",
      destaque: "“Para a mulher, você tem que entregar o dobro para entregar o mínimo, porque a cobrança é muito alta.”",
      foto: "assets/fotos/cassia-franca/retrato",
      fotoAlt: "Cassia França em campo, com o uniforme de árbitra da CBF, o ponto de comunicação e a bola da partida nas mãos.",
      fotoPosicao: "55% 25%",
      fotoCredito: "",   // Preencher com o crédito da foto.
      texto: [
        "Cassia França tem 31 anos e divide sua rotina entre duas frentes que exigem extrema disciplina: de um lado, atua como profissional de Educação Física no Centro Olímpico e Paralímpico do Distrito Federal, dedicando seu dia a dia a alunos autistas, deficientes visuais e físicos; do outro, é árbitra de futebol pela Federação de Futebol do DF e pela CBF.",
        "A sua trajetória começou entre 2017 e 2018, após um curso intensivo na faculdade de Educação Física da UnB e treinos na pista de atletismo da Estrutural. Seu professor e colega de estágio enxergou um enorme potencial físico e deu um incentivo. Mas, no início da caminhada, ela enfrentou barreiras financeiras.",
        "“Eu não tinha nem grana na época para poder pagar o curso de arbitragem, mas o professor viu a minha vontade e não deixou que eu parasse.”",
        "Após se formar, Cassia optou inicialmente por atuar como árbitra assistente por encontrar uma porta de entrada mais direta no quadro nacional da CBF. Mas o desejo de comandar o jogo a partir do centro do gramado nunca desapareceu. Tudo mudou em 2024, após simulação e treinamentos em um curso da comissão nacional, quando pediu a transição oficial para árbitra central.",
        "[[foto:assets/fotos/cassia-franca/sinalizacao|Cassia França sinaliza um lance durante uma partida.]]",
        "Ela percebeu que, embora o cenário fosse desafiador, as árbitras começavam a receber mais respeito com o apoio da mídia.",
        "“Na minha federação era muito difícil eu apitar jogo naquele tempo, principalmente por ser mulher. Mas, hoje, depois de mais de seis anos, é mais leve, é mais tranquilo para a gente trabalhar porque tem mais respeito, a mídia já nos apoia muito.”",
        "[[audio:cassia-franca|Cassia França sobre como era apitar na federação e o que mudou desde então.|Na minha federação era muito difícil eu apitar jogo naquele tempo, né? Porque ia ser muito difícil ter uma oportunidade, principalmente porque eu era mulher, e principalmente na árbitra central, porque na assistência, até que, se você fizer um bom trabalho, com certeza eles vão confiar. Mas naquele tempo acho que era bem difícil. Não só pela questão de ser mulher, porque ainda era um pouco mais machista. Mas, depois de mais de seis anos, hoje é mais leve, é mais tranquilo pra gente trabalhar, porque tem mais respeito, hoje a mídia já nos apoia muito, então faz com que a gente vá fazer o trabalho mais tranquilo.]]",
        "Com essa mudança, Cassia passou a atuar no Campeonato Brasileiro Feminino e comandou partidas masculinas nas Séries D e C. Apesar das conquistas, se consolidar no apito central exigiu estômago blindado contra os preconceitos. Em um ambiente completamente masculino, a cobrança sobre sua competência física é maior.",
        "[[foto:assets/fotos/cassia-franca/cartao-amarelo|Cassia França mostra o cartão amarelo em uma partida masculina.]]",
        "“Já falaram para mim ‘Essa mulher tem que ir para a reciclagem’. Para a mulher, você tem que entregar o dobro para entregar o mínimo, porque a cobrança é muito alta. Se você for só na força do braço, você não vai conseguir; tem que juntar o trabalho mental com uma estratégia.”",
        "Com a mira tanto no futebol nacional quanto em integrar a FIFA, Cassia resume sua paixão pelo esporte e a sua resiliência diária:",
        "[[olho:“Eu gosto muito de estar no meio do futebol e sigo convicta de que, se você se preparar e não desistir, o momento vai chegar.”|Cassia França]]",
        "[[foto:assets/fotos/cassia-franca/em-campo|Cassia França durante uma partida.]]",
      ],
    },

    /* ======================= GESTORAS ======================= */
    {
      id: "mirian-monte",
      categoria: "gestoras",
      nome: "Mirian Monte",
      funcao: "Ex-presidente do CSA",
      titulo: "Era para ser só a vice",
      destaque: "“A minha visão é de que é possível entrar nesse espaço, é possível modificá-lo e melhorá-lo.”",
      foto: "assets/fotos/mirian-monte/retrato",
      fotoAlt: "Mirian Monte, com a camisa do CSA, olha para o lado em um estádio.",
      fotoPosicao: "58% 40%",
      fotoCredito: "",   // Preencher com o crédito da foto.
      texto: [
        "Mirian Monte é ex-presidente do CSA e uma das poucas mulheres a alcançar o topo da gestão do futebol profissional brasileiro. Sua trajetória com o esporte começou na infância, quando seu pai ensinou as primeiras regras nas arquibancadas. Tendo apenas uma irmã, Mirian cresceu carregando o fardo de ser um desgosto para o pai, que não teve um filho para introduzir no mundo do futebol.",
        "A entrada na política do CSA ocorreu através de um histórico familiar no auxílio de gestão do clube. Servidora pública, delegada e ex-secretária de Cultura de Maceió, foi eleita conselheira com expressiva votação. A partir daí, seu nome rapidamente entrou no radar dos políticos do clube.",
        "[[foto:assets/fotos/mirian-monte/onibus|Mirian Monte ao lado do ônibus do CSA.]]",
        "O time passava por uma crise política institucional em 2021, em que os dirigentes homens articulavam a inclusão de Mirian na chapa sob o argumento de que a presença feminina serviria para apaziguar a disputa. Mesmo relutante sobre o cargo, ela cedeu achando que seria apenas uma figura decorativa. Acabou sendo eleita vice-presidente.",
        "“O presidente me chamou, e me pediu para ser vice, pensei, vou estar ajudando como puder, mas vou ser só uma vice.”",
        "[[audio:mirian-monte|Mirian Monte sobre o convite para a vice-presidência.|Ele vai ser o presidente. Eu realmente vou ser uma vice aqui, que vou estar participando, vou estar ajudando como puder, mas vou ser uma vice.]]",
        "O cenário desabou em 2022 com o rebaixamento do clube para a Série C, salários de funcionários atrasados, energia cortada e a renúncia do presidente executivo em meio às denúncias e à trava das obras com o Centro de Treinamento.",
        "Com o afastamento do presidente do conselho por motivos de saúde, a administração do CSA caiu no colo de Mirian, que assumiu para evitar uma intervenção judicial.",
        "Mirian decidiu ser transparente com a mídia e com a torcida sobre os problemas financeiros do clube: falou abertamente sobre as dívidas e pediu uma vaquinha para a torcida.",
        "[[foto:assets/fotos/mirian-monte/coletiva|Mirian Monte em entrevista coletiva no CSA.]]",
        "“Eu vi a situação que o clube estava, falei com a torcida, e fui perguntando quem conseguia ajudar, entrei com o banco, consegui os cheques para melhorar as condições financeiras, e já estávamos devendo e muito.”",
        "No entanto, à medida que a gestão de Mirian dava resultados e o CSA voltava a se reestruturar competitivamente, os homens do clube perceberam que ela deixava de ser uma figura maleável para se tornar uma verdadeira líder.",
        "Mas as dificuldades não eram apenas dentro do clube. Torcedores queriam descredibilizar seu trabalho, com comentários como “não sabe nem chutar uma bola, imagina gerenciar um time de futebol”.",
        "A perseguição atingiu níveis de sabotagem em 2025, quando o clube alcançou campanhas de destaque na Copa do Brasil e na Copa do Nordeste. Temendo que o sucesso de Mirian se consolidasse, conselheiros articularam reuniões secretas com atletas para tentar tirá-la do poder.",
        "Mesmo com o desempenho do time, o clube sofreu um rebaixamento em que as probabilidades matemáticas eram mínimas. Para os homens de dentro do clube, esse colapso serviu como a melhor desculpa para retirar a Mirian da presidência.",
        "Com o rebaixamento, Mirian virou alvo nas redes sociais, onde os perfis divulgaram imagens do rosto dela com marcas de “X”.",
        "Com o ambiente completamente hostil e sem aguentar mais, Mirian convocou uma coletiva e renunciou à posição.",
        "Apesar de tudo que passou, uma coisa não mudou:",
        "[[olho:“A minha visão é de que é possível entrar nesse espaço [mundo do futebol], é possível modificá-lo e melhorá-lo.”|Mirian Monte]]",
      ],
    },
    {
      id: "marianna-libano",
      categoria: "gestoras",
      nome: "Marianna Líbano",
      funcao: "Presidente da Associação do Coritiba",
      titulo: "Da arquibancada à presidência",
      destaque: "Se nas arquibancadas ela encontrava apoio, nos bastidores o machismo tentava tirar sua autoridade todos os dias.",
      foto: "assets/fotos/marianna-libano/retrato",
      fotoAlt: "Marianna Líbano sentada à mesa, ao lado de uma bandeirinha do Coritiba, com fotos históricas do clube na parede.",
      fotoPosicao: "50% 30%",
      fotoCredito: "",   // Preencher com o crédito da foto.
      texto: [
        "Marianna Líbano fez história ao assumir a presidência da Associação do Coritiba, tornando-se a primeira mulher a comandar a instituição. Mas a trajetória até a liderança do clube associativo não nasceu de um plano político premeditado, ela começou nas arquibancadas do estádio.",
        "A relação com o futebol veio da infância. Embora o pai não tivesse nenhuma ligação com os bastidores políticos do clube, fazia questão de levá-la aos jogos desde nova. Com o passar dos anos, o pai foi tendo mais dificuldades para acompanhar o time, e Marianna passou a frequentar as partidas sozinha.",
        "[[foto:assets/fotos/marianna-libano/infancia|Marianna Líbano na infância.]]",
        "E foi justamente nas arquibancadas que ela se aproximou de torcedores que acompanhavam de perto a política alviverde. Historicamente, o Coritiba era dominado por um grupo restrito da elite que se revezava no poder. A atuação de Marianna chamou a atenção a ponto de receber um convite histórico: integrar a chapa para o comitê administrativo (G5) na penúltima eleição. Embora não tenha vencido nas urnas, o cenário do clube teria uma reviravolta.",
        "[[foto:assets/fotos/marianna-libano/couto-pereira|Marianna Líbano no gramado, com a torcida do Coritiba ao fundo.]]",
        "O Coritiba foi transformado em uma SAF (Sociedade Anônima do Futebol) e vendido para um fundo de investimentos. A mudança do futebol, contudo, veio acompanhada de um preço. A nova gestão assumiu sem conhecer a cultura do clube, a dinâmica do futebol brasileiro e o peso da torcida. O reflexo foi desastroso: o Coritiba acumulou campanhas vergonhosas, registrando a pior temporada da história na elite de pontos corridos e, em 2024, passando para a Série B sem ver a cor do acesso para a Série A.",
        "Diante de tudo isso, Marianna entendeu que era preciso agir. Formou uma chapa para assumir a diretoria da associação com a missão de resgatar o pertencimento da torcida e fiscalizar a reestruturação do clube.",
        "Em janeiro de 2025, a vitória nas urnas veio, mas, com isso, começou a resistência nos corredores do CT.",
        "[[olho:Se nas arquibancadas ela encontrava apoio, nos bastidores o machismo tentava tirar sua autoridade todos os dias.]]",
        "Gestores ignoravam suas diretrizes e ligavam diretamente para o marido dela, que atua no mesmo meio, para tentar contorná-la. Realizavam reuniões secretas para tomar decisões e presidentes do conselho se recusavam a sentar à mesa com ela.",
        "[[audio:marianna-libano|Marianna Líbano sobre os gestores que ligavam para o marido dela em vez de responder a ela.|(…) situações assim que eu passei com gestores que, por exemplo, eu estava debatendo com ele alguma coisa, né, por mensagem, mandando uma mensagem, cobrando alguma situação, ao invés dele me responder, ele ligava pro meu marido, né, assim, como se eu não existisse nesse processo. Então, foi extremamente complicado.]]",
        "Em meio a esse caos, também começaram os ataques feitos pela torcida. Suas redes sociais eram constantemente atacadas. Frases como “vai lavar uma louça” ou assobios constantes que a deixavam desconfortável.",
        "Para proteger a instituição do caos, Marianna escolheu o silêncio para a imprensa. Com o tempo, nos bastidores os homens foram saindo do poder. Apesar de a casa hoje estar organizada e o Coritiba estar firme na Série A, ela ainda sofre por ser mulher em um mundo tão machista.",
      ],
    },
  ],

  /* ---------------------------------------------------------------------------
     SOBRE O PROJETO (rota #sobre) — a "súmula" do TCC
     ------------------------------------------------------------------------- */
  creditos: {
    titulo: "Sobre o projeto",
    kicker: "Súmula",
    apresentacao: [
      "Mulheres no Futebol é uma reportagem multimídia de Rebecca Crecci, desenvolvida como Trabalho de Conclusão de Curso em Jornalismo. O projeto acompanha mulheres que trabalham no futebol masculino no Brasil e os desafios de ocupar espaços historicamente dominados por homens.",
      "Sete profissionais compartilham suas trajetórias no jornalismo, na arbitragem e na gestão. Suas histórias revelam a relação entre paixão pelo esporte, reconhecimento profissional e enfrentamento do machismo. Você pode começar por qualquer uma delas e construir seu próprio caminho de leitura.",
    ],
    ficha: [
      { rotulo: "Reportagem e textos", valor: "Rebecca Crecci" },
      { rotulo: "Orientação", valor: "" },              // Preencher quando definido. Campos vazios não aparecem.
      { rotulo: "Instituição", valor: "" },
      { rotulo: "Curso", valor: "Jornalismo" },                               // confirme
      { rotulo: "Ano", valor: "2026" },
      { rotulo: "Desenvolvimento do site", valor: "Caio Bezerra", link: "https://github.com/CaioBezerra-Dev" },
    ],
    entrevistadasTitulo: "Em campo",
    agradecimentosTitulo: "Agradecimentos",
    agradecimentos: "", // Preencher com os agradecimentos da autora quando estiverem definidos.
    contatoTitulo: "Contato",
    contatoTexto: "Para falar com a autora:",
    contatoEmail: "", // Preencher quando definido. O bloco de contato só aparece com um e-mail válido.
  },

  /* ---------------------------------------------------------------------------
     TEXTOS DA INTERFACE (botões, avisos, mensagens). Voz acolhedora e firme.
     {n}, {total}, {nome} etc. são trocados automaticamente. Não apague as chaves.
     ------------------------------------------------------------------------- */
  interface: {
    pular: "Pular para o conteúdo",
    carregando: "Acendendo os refletores",
    carregado: "Luzes acesas. Bom jogo.",
    capa: "Capa",
    voltarCapa: "Voltar para a capa",
    objetoAria: "{nome}: {qtd}",
    historiaUma: "1 história",
    historiasVarias: "{n} histórias",
    dicaInicio: "Comece por aqui",
    cursorAbrir: "Abrir",
    cursorChutar: "Chute!",
    cursorOla: "Puxe a ola",
    gol: "Gol!",
    capitulo: "Capítulo {n}",
    leituraMin: "{n} min de leitura",
    lerHistoria: "Ler história",
    lida: "Lida",
    lidasContador: "{n} de {total} histórias lidas",
    lidasNenhuma: "{total} histórias para ler",
    lidasTodas: "Você leu todas as {total} histórias",
    comecarAbertura: "Comece pela abertura",
    trocarCategoria: "Trocar de categoria",
    voltarHistorias: "Voltar às histórias",
    proximaHistoria: "Próxima história",
    lerOutra: "Ler outra história",
    fimHistoria: "Fim da história",
    fimMensagem: "Obrigada por ler até aqui. Tem mais gente em campo.",
    compartilhar: "Compartilhar",
    compartilharTexto: "Leia a história de {nome}",
    linkCopiado: "Link copiado. É só colar onde quiser.",
    linkErro: "Não deu para copiar. Copie o endereço na barra do navegador.",
    progressoLeitura: "Progresso da leitura",
    fotoProvisoria: "Ilustração provisória. A foto de {nome} entra aqui.",
    atalhosCapa: "Atalhos da reportagem",
    audioTocar: "Tocar áudio",
    audioPausar: "Pausar áudio",
    audioPosicao: "Posição do áudio",
    audioVelocidade: "Velocidade de reprodução: {v}",
    audioTranscricao: "Ler transcrição",
    audioErro: "Não foi possível carregar este áudio. Tente de novo em instantes.",
    audioBloqueado: "O navegador não deixou o áudio começar. Toque no play de novo.",
    audioCarregando: "Carregando áudio…",
    somLigar: "Ligar som do estádio",
    somDesligar: "Desligar som do estádio",
    sobre: "Sobre o projeto",
    naoEncontradaKicker: "Erro 404",
    naoEncontradaTitulo: "Impedimento!",
    naoEncontradaTexto: "Esta página está em posição irregular. O lance foi anulado, mas o jogo continua.",
    noscript: "Este site precisa de JavaScript para funcionar. Ative o JavaScript no navegador para ler as histórias.",
    anuncioTela: "{titulo}",
  },
};
