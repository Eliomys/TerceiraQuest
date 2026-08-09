// ==================================================
// TERCEIRA QUEST — CATÁLOGO E ESTADO FAMILIAR
// ==================================================

const CHAVE_ESTADO_FAMILIA = "terceiraQuestEstadoFamilia";
const CHAVE_JOGADOR_ATUAL = "terceiraQuestJogadorAtual";
const MISSOES_DIARIAS_POR_DIA = 3;
const XP_DESAFIO_DIARIO = 30;
const XP_DESAFIO_FERIAS = 20;
const XP_DESAFIO_LOCAL = 20;
const XP_JOGO = 30;
const META_ATIVIDADES_AVENTURA = 80;
const MAX_FOTOGRAFIAS_POR_ATIVIDADE = 3;
const NOME_BASE_FOTOGRAFIAS = "terceiraQuestFotosDB";
const STORE_FOTOGRAFIAS = "fotografias";

let urlsAlbum = [];
let urlFotografiaAberta = null;

// Os jogadores identificam quem está a usar a aplicação. O progresso é sempre familiar.
const jogadores = [
    { id: "jorge", nome: "Jorge", avatar: "images/avatars/jorge.png" },
    { id: "olinda", nome: "Olinda", avatar: "images/avatars/olinda.png" },
    { id: "ema", nome: "Ema", avatar: "images/avatars/ema.png" }
];

function criarIdConteudo(prefixo, titulo) {
    return `${prefixo}-${titulo
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")}`;
}

function criarDesafioDiario(titulo, categoria, jogadorAlvo) {
    return {
        id: criarIdConteudo("diario", titulo),
        titulo: titulo,
        descricao: "",
        categoria: categoria,
        tipo: "missao",
        xp: XP_DESAFIO_DIARIO,
        jogadorAlvo: jogadorAlvo || null
    };
}

function criarDesafioLocal(localId, titulo) {
    return {
        id: criarIdConteudo(`local-${localId}`, titulo),
        localId: localId,
        titulo: titulo,
        descricao: "",
        categoria: "local",
        tipo: "desafio-local",
        xp: XP_DESAFIO_LOCAL
    };
}

function criarJogo(titulo, descricao, regras, duracao, id) {
    return {
        id: id || criarIdConteudo("jogo", titulo),
        titulo: titulo,
        descricao: descricao,
        regras: regras,
        duracao: duracao || "",
        tipo: "jogo",
        xp: XP_JOGO
    };
}

function abrirBaseFotografias() {
    return new Promise(function(resolve, reject) {
        if (!("indexedDB" in window)) {
            reject(new Error("IndexedDB indisponível"));
            return;
        }

        const pedido = window.indexedDB.open(NOME_BASE_FOTOGRAFIAS, 1);
        pedido.onupgradeneeded = function() {
            const base = pedido.result;
            if (!base.objectStoreNames.contains(STORE_FOTOGRAFIAS)) {
                base.createObjectStore(STORE_FOTOGRAFIAS, { keyPath: "id" });
            }
        };
        pedido.onsuccess = function() { resolve(pedido.result); };
        pedido.onerror = function() { reject(pedido.error || new Error("Erro ao abrir IndexedDB")); };
    });
}

async function guardarBlobFotografia(fotografia) {
    const base = await abrirBaseFotografias();
    return new Promise(function(resolve, reject) {
        const transacao = base.transaction(STORE_FOTOGRAFIAS, "readwrite");
        transacao.objectStore(STORE_FOTOGRAFIAS).put(fotografia);
        transacao.oncomplete = function() {
            base.close();
            resolve();
        };
        transacao.onerror = function() {
            base.close();
            reject(transacao.error || new Error("Erro ao guardar fotografia"));
        };
    });
}

async function obterBlobFotografia(id) {
    const base = await abrirBaseFotografias();
    return new Promise(function(resolve, reject) {
        const transacao = base.transaction(STORE_FOTOGRAFIAS, "readonly");
        const pedido = transacao.objectStore(STORE_FOTOGRAFIAS).get(id);
        pedido.onsuccess = function() {
            base.close();
            resolve(pedido.result || null);
        };
        pedido.onerror = function() {
            base.close();
            reject(pedido.error || new Error("Erro ao ler fotografia"));
        };
    });
}

async function apagarBlobFotografia(id) {
    const base = await abrirBaseFotografias();
    return new Promise(function(resolve, reject) {
        const transacao = base.transaction(STORE_FOTOGRAFIAS, "readwrite");
        transacao.objectStore(STORE_FOTOGRAFIAS).delete(id);
        transacao.oncomplete = function() {
            base.close();
            resolve();
        };
        transacao.onerror = function() {
            base.close();
            reject(transacao.error || new Error("Erro ao apagar fotografia"));
        };
    });
}

function criarIdFotografia() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return `foto-${window.crypto.randomUUID()}`;
    }
    return `foto-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function obterFotografiasDaAtividade(estado, atividadeId) {
    return Object.values(estado.fotografias || {}).filter(function(fotografia) {
        return fotografia.atividadeId === atividadeId;
    });
}

function textoIndicadorFotografias(quantidade) {
    return `📷 ${quantidade} ${quantidade === 1 ? "fotografia" : "fotografias"}`;
}

function criarControlosFotografia(atividadeId) {
    const estado = obterEstadoFamilia();
    const quantidade = obterFotografiasDaAtividade(estado, atividadeId).length;
    const controlos = document.createElement("div");
    controlos.className = "controlos-fotografia";
    controlos.dataset.fotografiasAtividade = atividadeId;

    const indicador = document.createElement("small");
    indicador.className = "indicador-fotografias";
    indicador.textContent = textoIndicadorFotografias(quantidade);
    controlos.appendChild(indicador);

    if (quantidade < MAX_FOTOGRAFIAS_POR_ATIVIDADE) {
        const botaoCamara = document.createElement("button");
        botaoCamara.className = "botao-secundario";
        botaoCamara.textContent = "📷 TIRAR FOTO";
        botaoCamara.addEventListener("click", function() {
            adicionarFotografiaAtividade(atividadeId, "camara");
        });
        controlos.appendChild(botaoCamara);

        const botaoGaleria = document.createElement("button");
        botaoGaleria.className = "botao-secundario";
        botaoGaleria.textContent = "🖼️ ESCOLHER FOTO";
        botaoGaleria.addEventListener("click", function() {
            adicionarFotografiaAtividade(atividadeId, "galeria");
        });
        controlos.appendChild(botaoGaleria);
    }

    return controlos;
}

function atualizarIndicadoresFotografias(atividadeId) {
    const quantidade = obterFotografiasDaAtividade(obterEstadoFamilia(), atividadeId).length;
    document.querySelectorAll(`[data-fotografias-atividade="${atividadeId}"]`).forEach(function(controlos) {
        const indicador = controlos.querySelector(".indicador-fotografias");
        if (indicador) {
            indicador.textContent = textoIndicadorFotografias(quantidade);
        }
        if (quantidade >= MAX_FOTOGRAFIAS_POR_ATIVIDADE) {
            controlos.querySelectorAll("button").forEach(function(botao) {
                botao.classList.add("escondido");
            });
        }
    });
}

function redimensionarFotografia(ficheiro) {
    return new Promise(function(resolve, reject) {
        const url = URL.createObjectURL(ficheiro);
        const imagem = new Image();
        imagem.onload = function() {
            const maiorLado = Math.max(imagem.naturalWidth, imagem.naturalHeight);
            if (!maiorLado || maiorLado <= 1600) {
                URL.revokeObjectURL(url);
                resolve({ blob: ficheiro, mimeType: ficheiro.type || "image/jpeg" });
                return;
            }

            const escala = 1600 / maiorLado;
            const canvas = document.createElement("canvas");
            canvas.width = Math.round(imagem.naturalWidth * escala);
            canvas.height = Math.round(imagem.naturalHeight * escala);
            const contexto = canvas.getContext("2d");
            contexto.drawImage(imagem, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            canvas.toBlob(function(blob) {
                resolve({
                    blob: blob || ficheiro,
                    mimeType: blob ? "image/jpeg" : (ficheiro.type || "image/jpeg")
                });
            }, "image/jpeg", 0.8);
        };
        imagem.onerror = function() {
            URL.revokeObjectURL(url);
            reject(new Error("Não foi possível processar a fotografia"));
        };
        imagem.src = url;
    });
}

function adicionarFotografiaAtividade(atividadeId, origem) {
    const estado = obterEstadoFamilia();
    const atividade = obterAtividadePorId(atividadeId);
    if (!atividade || obterEstadoAtividade(atividadeId, estado) !== "concluida") {
        return;
    }

    if (obterFotografiasDaAtividade(estado, atividadeId).length >= MAX_FOTOGRAFIAS_POR_ATIVIDADE) {
        window.alert("Máximo de 3 fotografias nesta atividade.");
        return;
    }

    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    if (origem === "camara") {
        input.setAttribute("capture", "environment");
    }
    input.addEventListener("change", async function() {
        const ficheiro = input.files && input.files[0];
        if (!ficheiro) {
            return;
        }

        try {
            const estadoAtual = obterEstadoFamilia();
            if (obterFotografiasDaAtividade(estadoAtual, atividadeId).length >= MAX_FOTOGRAFIAS_POR_ATIVIDADE) {
                window.alert("Máximo de 3 fotografias nesta atividade.");
                return;
            }

            const processada = await redimensionarFotografia(ficheiro);
            const jogador = obterJogadorAtual();
            const criadoEm = new Date().toISOString();
            const fotografia = {
                id: criarIdFotografia(),
                atividadeId: atividade.id,
                tituloAtividade: atividade.titulo,
                jogadorId: jogador ? jogador.id : null,
                criadoEm: criadoEm,
                data: dataLocalAtual(),
                mimeType: processada.mimeType,
                blob: processada.blob
            };

            await guardarBlobFotografia(fotografia);

            const metadados = { ...fotografia };
            delete metadados.blob;
            estadoAtual.fotografias[metadados.id] = metadados;
            const conclusao = estadoAtual.conclusoes[atividadeId];
            if (conclusao && conclusao.estado === "concluida") {
                conclusao.fotografiaIds = Array.isArray(conclusao.fotografiaIds)
                    ? conclusao.fotografiaIds : [];
                if (!conclusao.fotografiaIds.includes(metadados.id)) {
                    conclusao.fotografiaIds.push(metadados.id);
                }
            }
            guardarEstadoFamilia(estadoAtual);
            atualizarIndicadoresFotografias(atividadeId);

            if (missaoAbertaId === atividadeId) {
                abrirMissao(atividadeId);
            } else if (jogoAbertoId === atividadeId) {
                renderJogoAberto();
            }
        } catch (erro) {
            console.warn("Não foi possível guardar a fotografia.", erro);
            window.alert("Não foi possível guardar a fotografia nesta instalação.");
        }
    }, { once: true });
    input.click();
}

const jogosFamiliares = [
    ["Proibido dizer Sim ou Não", "Evitem dizer duas palavras proibidas.", "Durante 10 minutos, ninguém pode dizer \"sim\" nem \"não\". Os outros jogadores podem fazer perguntas para tentar provocar o erro. Quem disser uma das palavras perde essa ronda.", "10 minutos"],
    ["A palavra proibida", "Escolham uma palavra que ninguém pode dizer.", "Escolham uma palavra comum, por exemplo \"vaca\", \"mar\" ou \"Terceira\". Durante 15 minutos ninguém a pode dizer. Quem disser perde.", "15 minutos"],
    ["Quem vê primeiro?", "Procurem algo e vejam quem o encontra primeiro.", "Escolham algo para procurar: uma vaca, uma igreja, uma hortênsia, um barco, etc. O primeiro a encontrar ganha a ronda. Façam 5 rondas.", "5 rondas"],
    ["10 Perguntas", "Descubram o que alguém está a pensar.", "Uma pessoa pensa numa pessoa, animal, objeto ou lugar. Os restantes têm no máximo 10 perguntas de resposta sim/não para descobrir.", "10 perguntas", "jogo-20-perguntas"],
    ["Duas verdades e uma mentira", "Descubram qual é a afirmação falsa.", "Cada pessoa diz três afirmações sobre si. Duas são verdadeiras e uma é falsa. Os outros tentam descobrir a mentira."],
    ["História a três", "Criem uma história em conjunto.", "Uma pessoa começa uma história com uma frase. A seguinte acrescenta outra frase. Continuem durante pelo menos 3 minutos. A história deve incluir a Ilha Terceira.", "3 minutos"],
    ["Alfabeto da Terceira", "Encontrem palavras das férias de A a Z.", "Tentem encontrar palavras relacionadas com as férias começadas sucessivamente por A, B, C, D... Continuem até ficarem bloqueados."],
    ["Cinco coisas", "Digam cinco exemplos antes do tempo acabar.", "Uma pessoa escolhe uma categoria. Exemplo: \"coisas que encontramos no mar\". Outra pessoa tem 10 segundos para dizer cinco exemplos. Rodem entre os três jogadores.", "10 segundos por ronda"],
    ["Eu vejo...", "Adivinhem o objeto a partir de uma pista.", "Uma pessoa escolhe algo que esteja à vista e diz apenas uma pista, por exemplo a cor. Os outros tentam descobrir o objeto."],
    ["Desenho às cegas", "Desenhem sem olhar para o papel.", "Uma pessoa escolhe algo que esteja à vista. Outra tenta desenhá-lo durante 1 minuto sem olhar para o papel. No fim comparem o resultado.", "1 minuto"],
    ["Quem estou a imitar?", "Adivinhem a imitação.", "Uma pessoa imita um animal, pessoa conhecida ou personagem sem dizer o nome. Os outros tentam adivinhar. Façam pelo menos 3 rondas.", "3 rondas"],
    ["Som misterioso", "Descubram a origem de um som.", "Uma pessoa produz um som usando um objeto próximo, sem os outros verem. Os restantes tentam descobrir o que produziu o som."],
    ["Memória relâmpago", "Testem a memória de um local.", "Observem um local durante 30 segundos. Depois virem-se de costas. Uma pessoa faz 5 perguntas sobre aquilo que acabaram de observar.", "30 segundos"],
    ["O intruso", "Encontrem a palavra fora da categoria.", "Uma pessoa diz quatro palavras. Três pertencem à mesma categoria e uma é o intruso. Os outros têm de descobrir qual e explicar porquê."],
    ["Palavra encadeada", "Criem palavras pela última letra.", "Uma pessoa diz uma palavra. A seguinte tem de dizer outra que comece pela última letra da anterior. Não se podem repetir palavras. Continuem até alguém ficar sem resposta."],
    ["Adivinha o número", "Descubram um número entre 1 e 100.", "Uma pessoa escolhe mentalmente um número entre 1 e 100. Os outros vão tentando. Só pode responder \"mais alto\" ou \"mais baixo\"."],
    ["Fotografia impossível", "Criem uma fotografia com perspetiva.", "Escolham uma ideia absurda para uma fotografia: segurar uma nuvem, empurrar uma montanha, comer o Sol, ser gigante, etc. Tentem criar a fotografia usando perspetiva."],
    ["Caça às cores", "Encontrem objetos de cinco cores.", "Escolham cinco cores. Tentem encontrar um objeto diferente para cada uma. A primeira pessoa a encontrar as cinco ganha."],
    ["O guia turístico", "Apresentem o local como um guia turístico.", "Durante 2 minutos uma pessoa tem de apresentar o local onde estão como se fosse um guia turístico. Pode misturar factos reais e invenções. Os outros tentam identificar o que foi inventado.", "2 minutos"],
    ["Campeonato de Pedra-Papel-Tesoura", "Façam um campeonato à melhor de 5.", "Façam um pequeno campeonato à melhor de 5. Registem mentalmente quem venceu.", "À melhor de 5"]
].map(function(jogo) {
    return criarJogo(jogo[0], jogo[1], jogo[2], jogo[3], jogo[4]);
});

const desafiosDiarios = [
    ["Comer uma Dona Amélia.", "gastronomia"],
    ["Beber uma Kima.", "gastronomia"],
    ["Provar um gelado de queijo.", "gastronomia"],
    ["Comer bolo lêvedo.", "gastronomia"],
    ["Comer lapas.", "gastronomia"],
    ["Comer cracas.", "gastronomia"],
    ["Encontrar um restaurante onde nunca tenham estado.", "gastronomia"],
    ["Comer um gelado junto ao mar.", "gastronomia"],
    ["Comer um esbá.", "gastronomia"],
    ["Comer uma donete.", "gastronomia"],
    ["Comer uma bifana.", "gastronomia"],
    ["Comer batatas fritas dos Touros.", "gastronomia"],
    ["Ver um cardume \"incontável\".", "natureza"],
    ["Encontrar uma árvore centenária.", "natureza"],
    ["Encontrar uma figueira.", "natureza"],
    ["Encontrar uma criptoméria.", "natureza"],
    ["Encontrar uma hortênsia branca.", "natureza"],
    ["Encontrar uma vaca deitada.", "natureza"],
    ["Ver uma vaca com o bezerro.", "natureza"],
    ["Observar uma ave de rapina.", "natureza"],
    ["Ouvir uma ave durante 1 minuto sem falar.", "natureza"],
    ["Ouvir um cagarro.", "natureza"],
    ["Encontrar uma joaninha.", "natureza"],
    ["Ver uma borboleta.", "natureza"],
    ["Encontrar uma libélula.", "natureza"],
    ["Encontrar uma aranha de jardim.", "natureza"],
    ["Encontrar um arco-íris.", "natureza"],
    ["Sentir uma nuvem passar por vocês.", "natureza"],
    ["Ver o mar completamente liso.", "natureza"],
    ["Contar mais de 20 hortênsias numa só curva.", "observacao"],
    ["Encontrar uma pedra em forma de coração.", "observacao"],
    ["Encontrar uma pedra vulcânica com buracos.", "observacao"],
    ["Encontrar uma pedra com líquenes.", "observacao"],
    ["Encontrar um muro de pedra seca.", "observacao"],
    ["Encontrar um portão verde.", "observacao"],
    ["Encontrar uma porta azul.", "observacao"],
    ["Encontrar uma aldraba.", "observacao"],
    ["Encontrar uma chaminé diferente.", "observacao"],
    ["Encontrar um relógio antigo.", "observacao"],
    ["Mergulhar nas Escaleiras ao nascer do Sol.", "aventura"],
    ["Andar de paddle.", "aventura"],
    ["Fazer snorkeling durante pelo menos 20 minutos.", "aventura"],
    ["Entrar numa gruta vulcânica.", "aventura"],
    ["Nadar numa piscina natural onde nunca tenham estado.", "aventura"],
    ["Caminhar descalços durante 200 metros numa praia.", "aventura"],
    ["Saltar de uma rocha, em segurança.", "aventura"],
    ["Encontrar um caranguejo.", "aventura"],
    ["Encontrar uma estrela-do-mar.", "aventura"],
    ["Encontrar um ouriço-do-mar.", "aventura"],
    ["Encontrar uma anémona.", "aventura"],
    ["Encontrar uma poça de maré com pelo menos 5 espécies.", "aventura"],
    ["Ver o nascer do Sol junto ao mar.", "aventura"],
    ["Ver o pôr do Sol junto ao mar.", "aventura"],
    ["Dar 10 mergulhos seguidos.", "aventura"],
    ["Descobrir uma rua onde nunca tenham passado.", "cultura"],
    ["Encontrar uma pedra com data gravada.", "cultura"],
    ["Encontrar um brasão em pedra.", "cultura"],
    ["Encontrar um relógio de sol.", "cultura"],
    ["Encontrar uma antiga fonte pública.", "cultura"],
    ["Encontrar um fontanário.", "cultura"],
    ["Entrar num forte.", "cultura"],
    ["Encontrar uma igreja aberta.", "cultura"],
    ["Permanecer em silêncio durante 1 minuto dentro da igreja.", "cultura"],
    ["Encontrar uma placa curiosa.", "cultura"],
    ["Identificar uma pedra vulcânica com formas estranhas.", "cultura"],
    ["Tirar uma fotografia onde ninguém aparece.", "fotografia"],
    ["Tirar uma fotografia onde todos parecem gigantes.", "fotografia"],
    ["Fotografar um reflexo perfeito.", "fotografia"],
    ["Fazer uma fotografia apenas em tons verdes.", "fotografia"],
    ["Fotografar uma sombra curiosa.", "fotografia"],
    ["Fotografar um animal sem o assustar.", "fotografia"],
    ["Fazer uma fotografia macro de uma flor.", "fotografia"],
    ["Fazer uma fotografia de um pôr do Sol.", "fotografia"],
    ["Inventar uma lenda para um local.", "criatividade"],
    ["Dar um nome a uma rocha.", "criatividade"],
    ["Construir uma pequena torre de pedras.", "criatividade"],
    ["Desenhar uma paisagem em 2 minutos.", "criatividade"],
    ["Escrever um haiku sobre a ilha.", "criatividade"],
    ["Inventar uma bandeira para a TerceiraQuest.", "criatividade"],
    ["Desenhar um mapa do local sem olhar para o telemóvel.", "criatividade"],
    ["Encontrar um lugar onde nunca tenham estado em 20 anos.", "misterio"],
    ["Descobrir um caminho sem saída.", "misterio"],
    ["Encontrar um objeto abandonado interessante.", "misterio"],
    ["Descobrir um miradouro novo.", "misterio"],
    ["Encontrar um banco isolado.", "misterio"],
    ["Encontrar uma árvore caída.", "misterio"],
    ["Encontrar uma escada que não leva a lado nenhum.", "misterio"],
    ["Encontrar uma ruína.", "misterio"],
    ["Encontrar a primeira estrela.", "noite"],
    ["Ouvir o mar durante 2 minutos sem luzes.", "noite"],
    ["Identificar três sons diferentes.", "noite"],
    ["Encontrar a Via Láctea.", "noite"],
    ["Ver um satélite.", "noite"],
    ["Encontrar um morcego.", "noite"],
    ["Sentir sol, chuva e vento no mesmo dia.", "clima"],
    ["Atravessar uma nuvem.", "clima"],
    ["Ver nevoeiro.", "clima"],
    ["Ver chuva a aproximar-se.", "clima"],
    ["Ver um arco-íris.", "clima"],
    ["Fazer uma receita nova para os avós.", "familia", "ema"],
    ["Aprender/fazer malha com a avó.", "familia", "ema"],
    ["Aprender um ponto de costura com a avó.", "familia", "ema"],
    ["Ler 50 páginas de um livro.", "familia", "olinda"],
    ["Jogar um jogo novo.", "familia"],
    ["Descobrir um local que nenhum dos três conhecia.", "familia"],
    ["Fazer a fotografia oficial das férias.", "familia"],
    ["Escolher o \"tesouro do dia\".", "familia"],
    ["Ensinar uma coisa nova a outro membro da família.", "familia"],
    ["Durante 30 minutos só podem comunicar por gestos.", "desafios-malucos"],
    ["Inventar um nome para todas as vacas encontradas durante 10 minutos.", "desafios-malucos"],
    ["Durante uma hora ninguém pode dizer a palavra \"vaca\".", "desafios-malucos"],
    ["Caminhar 15 minutos sem olhar para o telemóvel.", "desafios-malucos"],
    ["Fazer uma fotografia onde todos saltam ao mesmo tempo.", "desafios-malucos"],
    ["Fazer um vídeo de 15 segundos sem dizer uma palavra.", "desafios-malucos"],
    ["Inventar um animal dos Açores que não existe.", "desafios-malucos"],
    ["Descobrir o eco mais forte da ilha.", "desafios-malucos"],
    ["Encontrar um \"tesouro\" que caiba na palma da mão.", "desafios-malucos"],
    ["Escrever uma mensagem para abrir nas férias do próximo ano.", "desafios-malucos"],
    ["Caminhar 10 minutos completamente em silêncio.", "desafios-malucos"],
    ["Cumprimentar uma vaca sem a incomodar.", "desafios-malucos"]
].map(function(desafio) {
    return criarDesafioDiario(desafio[0], desafio[1], desafio[2]);
});

const locaisDaIlha = [
    { id: "angra-do-heroismo", nome: "Angra do Heroísmo", categoria: "cidade" },
    { id: "praia-da-vitoria", nome: "Praia da Vitória", categoria: "cidade" },
    { id: "biscoitos", nome: "Biscoitos", categoria: "costa" },
    { id: "escaleiras", nome: "Escaleiras", categoria: "costa" },
    { id: "furnas-do-enxofre", nome: "Furnas do Enxofre", categoria: "natureza" },
    { id: "serra-do-cume", nome: "Serra do Cume", categoria: "miradouro" },
    { id: "monte-brasil", nome: "Monte Brasil", categoria: "natureza" },
    { id: "lagoa-das-patas", nome: "Lagoa das Patas", categoria: "natureza" },
    { id: "misterios-negros", nome: "Mistérios Negros", categoria: "trilho" },
    { id: "serreta", nome: "Serreta", categoria: "natureza" },
    { id: "fortes-de-sao-sebastiao", nome: "Fortes de São Sebastião", categoria: "patrimonio" },
    { id: "baias-da-agualva", nome: "Baías da Agualva", categoria: "costa" },
    { id: "relheiras-de-sao-bras", nome: "Relheiras de São Brás", categoria: "patrimonio" },
    { id: "quatro-ribeiras", nome: "Quatro Ribeiras", categoria: "natureza" }
];

const desafiosLocaisDaIlha = [
    ["angra-do-heroismo", ["Encontrar um dragão num brasão.", "Encontrar uma varanda em ferro forjado.", "Encontrar uma rua em calçada artística.", "Encontrar uma porta com aldraba.", "Encontrar uma antiga fonte."]],
    ["praia-da-vitoria", ["Encontrar uma concha inteira.", "Encontrar um barco de pesca.", "Encontrar um barco à vela.", "Caminhar 500 metros descalços na areia.", "Encontrar uma ave marinha que não seja uma gaivota."]],
    ["biscoitos", ["Fazer snorkeling.", "Encontrar um caranguejo.", "Encontrar uma anémona.", "Encontrar uma poça de maré.", "Encontrar uma rocha vulcânica com buracos."]],
    ["escaleiras", ["Mergulhar ao nascer do Sol.", "Encontrar um ouriço-do-mar.", "Encontrar um peixe.", "Ver o Sol nascer sobre o mar.", "Tirar uma fotografia subaquática."]],
    ["furnas-do-enxofre", ["Encontrar uma fumarola.", "Sentir o cheiro a enxofre.", "Encontrar líquenes.", "Encontrar uma placa científica.", "Encontrar vapor a sair do solo."]],
    ["serra-do-cume", ["Encontrar cinco tons diferentes de verde.", "Encontrar uma vaca deitada.", "Encontrar um milhafre.", "Ver uma nuvem abaixo do miradouro.", "Encontrar uma hortênsia branca."]],
    ["monte-brasil", ["Encontrar um canhão.", "Encontrar um forte.", "Encontrar um túnel.", "Encontrar um veado.", "Identificar três ilhéus."]],
    ["lagoa-das-patas", ["Ver um pato.", "Encontrar uma ponte de madeira.", "Encontrar um nenúfar.", "Encontrar uma libélula."]],
    ["misterios-negros", ["Encontrar musgo em cinco árvores.", "Encontrar uma árvore caída.", "Encontrar uma raiz exposta.", "Encontrar um túnel de vegetação.", "Caminhar 10 minutos em silêncio."]],
    ["serreta", ["Encontrar a Lagoinha.", "Encontrar uma ribeira.", "Encontrar um cedro-do-mato.", "Encontrar um caminho rodeado de hortênsias.", "Encontrar um miradouro."]]
].reduce(function(todos, grupo) {
    return todos.concat(grupo[1].map(function(titulo) {
        return criarDesafioLocal(grupo[0], titulo);
    }));
}, []);

// Este catálogo descreve conteúdo. Nunca guarda progresso ou estados de conclusão.
const catalogo = {
    missoes: [
        {
            id: "missao-cacar-arco-iris",
            titulo: "Caçar um arco-íris",
            descricao: "Encontra um arco-íris na Ilha Terceira e regista o momento.",
            categoria: "natureza",
            xp: 30,
            imagem: "images/missoes/arco-iris.jpg",
            instrucoes: "Tira uma fotografia como prova.",
            prova: { tipo: "fotografia", obrigatoria: false }
        },
        ...desafiosDiarios
    ],
    jogos: jogosFamiliares,
    desafiosGerais: [
        {
            id: "ferias-trilhos-ilha",
            titulo: "Completar 3 trilhos da ilha",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xpPorUnidade: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-trilhos-ilha.jpg",
            objetivo: 3,
            unidade: "trilhos"
        },
        {
            id: "ferias-piquenique",
            titulo: "Fazer 1 piquenique",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-piquenique.jpg"
        },
        {
            id: "ferias-paddle",
            titulo: "Fazer paddle",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-paddle.jpg"
        },
        {
            id: "ferias-almocar-fora",
            titulo: "Ir almoçar fora",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-almocar-fora.jpg"
        },
        {
            id: "ferias-atividade-tipica-terceira",
            titulo: "Fazer uma atividade típica da Terceira",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-atividade-tipica-terceira.jpg"
        },
        {
            id: "ferias-local-desconhecido",
            titulo: "Descobrir um local que nenhum dos três conhecia",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-local-desconhecido.jpg"
        },
        {
            id: "ferias-piscina-natural-nova",
            titulo: "Nadar numa piscina natural onde nunca tenham estado",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-piscina-natural-nova.jpg"
        },
        {
            id: "ferias-snorkeling",
            titulo: "Fazer snorkeling",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-snorkeling.jpg"
        },
        {
            id: "ferias-receita-avos",
            titulo: "Fazer uma receita nova para os avós",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-receita-avos.jpg"
        },
        {
            id: "ferias-jogo-novo",
            titulo: "Jogar um jogo novo",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-jogo-novo.jpg"
        },
        {
            id: "ferias-algo-novo-familia",
            titulo: "Fazer algo novo em família",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-algo-novo-familia.jpg"
        },
        {
            id: "ferias-ler-50-paginas",
            titulo: "Ler 50 páginas de um livro durante as férias",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xp: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-ler-50-paginas.jpg"
        },
        {
            id: "ferias-geocaching-10-caches",
            titulo: "Fazer 10 caches de Geocaching",
            tipo: "desafio-ferias",
            categoria: "ferias",
            xpPorUnidade: XP_DESAFIO_FERIAS,
            imagem: "images/desafios-ferias/ferias-geocaching-10-caches.jpg",
            objetivo: 10,
            unidade: "caches"
        }
    ],
    desafiosLocais: desafiosLocaisDaIlha,
    desafiosTrilhoReferencia: [
        { id: "trilho-ponte-madeira", titulo: "Atravessar uma ponte de madeira.", categoria: "trilho" },
        { id: "trilho-ribeira", titulo: "Encontrar uma ribeira.", categoria: "trilho" },
        { id: "trilho-tunel-vegetacao", titulo: "Encontrar um túnel de vegetação.", categoria: "trilho" },
        { id: "trilho-placa-pr", titulo: "Encontrar uma placa de PR.", categoria: "trilho" },
        { id: "trilho-raiz-exposta", titulo: "Encontrar uma raiz exposta.", categoria: "trilho" },
        { id: "trilho-musgo", titulo: "Encontrar musgo.", categoria: "trilho" },
        { id: "trilho-arvore-caida", titulo: "Encontrar uma árvore caída.", categoria: "trilho" }
    ],
    locais: locaisDaIlha,
    medalhas: [],
    conquistas: [
        {
            id: "primeira-atividade",
            titulo: "Primeiros Passos",
            descricao: "Completar a primeira atividade.",
            icone: "🌱",
            condicao: { tipo: "atividades", minimo: 1 }
        },
        {
            id: "dez-atividades",
            titulo: "Já estamos lançados",
            descricao: "Completar 10 atividades.",
            icone: "🚀",
            condicao: { tipo: "atividades", minimo: 10 }
        },
        {
            id: "quarenta-atividades",
            titulo: "Meio caminho andado",
            descricao: "Completar 40 atividades.",
            icone: "🗺️",
            condicao: { tipo: "atividades", minimo: 40 }
        },
        {
            id: "sessenta-cinco-atividades",
            titulo: "Da Nossa Terra",
            descricao: "Completar 65 atividades.",
            icone: "🏡",
            condicao: { tipo: "atividades", minimo: 65 }
        },
        {
            id: "oitenta-atividades",
            titulo: "De Gema",
            descricao: "Completar 80 atividades e concluir a aventura principal.",
            icone: "❤️",
            condicao: { tipo: "atividades", minimo: 80 }
        },
        {
            id: "cem-atividades",
            titulo: "Lenda da TerceiraQuest",
            descricao: "Completar 100 atividades.",
            icone: "🌟",
            condicao: { tipo: "atividades", minimo: 100 }
        },
        {
            id: "trilhos-completos",
            titulo: "Pés na Terra",
            descricao: "Completar os 3 trilhos.",
            icone: "🥾",
            condicao: { tipo: "atividade-concluida", atividadeId: "ferias-trilhos-ilha" }
        },
        {
            id: "geocaching-completo",
            titulo: "Caçadores de Tesouros",
            descricao: "Completar as 10 caches.",
            icone: "🧭",
            condicao: { tipo: "atividade-concluida", atividadeId: "ferias-geocaching-10-caches" }
        },
        {
            id: "desafios-ferias-completos",
            titulo: "Férias em Grande",
            descricao: "Concluir todos os desafios de férias.",
            icone: "🌞",
            condicao: { tipo: "desafios-ferias", minimo: 13 }
        }
    ],
    album: []
};

const niveis = [
    { minimoAtividades: 0, nome: "🌊 Maré Mansa" },
    { minimoAtividades: 10, nome: "🍬 Candins" },
    { minimoAtividades: 20, nome: "🧠 Bem Discretos" },
    { minimoAtividades: 30, nome: "😄 Sem Fazer Negaças" },
    { minimoAtividades: 40, nome: "🐂 Gueixas & Touros" },
    { minimoAtividades: 50, nome: "🌋 Cheira a Enxofre" },
    { minimoAtividades: 65, nome: "🏡 Da Nossa Terra" },
    { minimoAtividades: 80, nome: "❤️ De Gema" }
];

let missaoAbertaId = null;
let jogoAbertoId = null;

function criarEstadoInicial() {
    return {
        versao: 1,
        ajustesXP: [],
        medalhasConquistadas: {},
        medalhasLegado: 0,
        conquistasDesbloqueadas: {},
        conclusoes: {},
        agendaDiaria: {},
        jogosUtilizados: [],
        album: { itensDesbloqueados: {} },
        fotografias: {},
        diario: [],
        migracao: null
    };
}

function numeroSeguro(valor) {
    const numero = Number.parseInt(valor, 10);
    return Number.isFinite(numero) && numero >= 0 ? numero : 0;
}

function normalizarEstado(estado) {
    const base = criarEstadoInicial();
    const origem = estado && typeof estado === "object" ? estado : {};

    return {
        ...base,
        ...origem,
        versao: numeroSeguro(origem.versao) || base.versao,
        ajustesXP: Array.isArray(origem.ajustesXP) ? origem.ajustesXP : [],
        medalhasConquistadas: origem.medalhasConquistadas && typeof origem.medalhasConquistadas === "object"
            ? origem.medalhasConquistadas : {},
        medalhasLegado: numeroSeguro(origem.medalhasLegado),
        conquistasDesbloqueadas: origem.conquistasDesbloqueadas && typeof origem.conquistasDesbloqueadas === "object"
            ? origem.conquistasDesbloqueadas : {},
        conclusoes: origem.conclusoes && typeof origem.conclusoes === "object"
            ? origem.conclusoes : {},
        agendaDiaria: origem.agendaDiaria && typeof origem.agendaDiaria === "object"
            ? origem.agendaDiaria : {},
        jogosUtilizados: Array.isArray(origem.jogosUtilizados) ? origem.jogosUtilizados : [],
        album: origem.album && typeof origem.album === "object"
            ? { ...base.album, ...origem.album } : base.album,
        fotografias: origem.fotografias && typeof origem.fotografias === "object"
            ? origem.fotografias : {},
        diario: Array.isArray(origem.diario) ? origem.diario : []
    };
}

function criarEstadoMigrado() {
    const estado = criarEstadoInicial();
    const xpLegado = numeroSeguro(localStorage.getItem("familiaXP"));
    const medalhasLegado = numeroSeguro(localStorage.getItem("familiaMedalhas"));
    const arcoIrisConcluido = localStorage.getItem("missaoArcoIrisConcluida") === "true";
    const jogadorLegado = normalizarJogadorId(localStorage.getItem("jogadorAtual"));

    estado.medalhasLegado = medalhasLegado;

    if (arcoIrisConcluido) {
        estado.conclusoes["missao-cacar-arco-iris"] = {
            tipo: "missao",
            estado: "concluida",
            concluidaEm: null,
            concluidaPor: jogadorLegado,
            xpAtribuido: 30,
            fotografiaIds: [],
            origem: "migracao"
        };
    }

    const xpReconstruido = calcularXP(estado);
    const diferencaXP = xpLegado - xpReconstruido;

    if (diferencaXP !== 0) {
        estado.ajustesXP.push({
            id: "migracao-xp-legado",
            valor: diferencaXP,
            motivo: "Preservação do XP anterior à refatoração",
            criadoEm: new Date().toISOString()
        });
    }

    estado.migracao = {
        realizadaEm: new Date().toISOString(),
        chavesLegadasPreservadas: true
    };

    return estado;
}

function obterEstadoFamilia() {
    const guardado = localStorage.getItem(CHAVE_ESTADO_FAMILIA);

    if (!guardado) {
        const migrado = criarEstadoMigrado();
        guardarEstadoFamilia(migrado);
        return migrado;
    }

    try {
        return normalizarEstado(JSON.parse(guardado));
    } catch (erro) {
        console.warn("Não foi possível ler o estado familiar. Foi repetida a migração segura.", erro);
        const migrado = criarEstadoMigrado();
        guardarEstadoFamilia(migrado);
        return migrado;
    }
}

function guardarEstadoFamilia(estado) {
    localStorage.setItem(CHAVE_ESTADO_FAMILIA, JSON.stringify(normalizarEstado(estado)));
}

function normalizarJogadorId(valor) {
    if (!valor) {
        return null;
    }

    const texto = String(valor).toLowerCase();
    const jogador = jogadores.find(function(item) {
        return item.id === texto || item.nome.toLowerCase() === texto;
    });

    return jogador ? jogador.id : null;
}

function obterNomeJogadorAlvo(atividade) {
    if (!atividade || !atividade.jogadorAlvo) {
        return "";
    }

    const jogador = jogadores.find(function(item) {
        return item.id === atividade.jogadorAlvo;
    });
    return jogador ? `Para ${jogador.nome}` : "";
}

function obterJogadorAtual() {
    const id = normalizarJogadorId(localStorage.getItem(CHAVE_JOGADOR_ATUAL));
    return jogadores.find(function(jogador) {
        return jogador.id === id;
    }) || null;
}

function escolherJogador(id) {
    const jogadorId = normalizarJogadorId(id);
    const jogador = jogadores.find(function(item) {
        return item.id === jogadorId;
    });

    if (!jogador) {
        return;
    }

    localStorage.setItem(CHAVE_JOGADOR_ATUAL, jogador.id);
    preencherPerfilJogador(jogador);
    atualizarEstadoJogo();
    mostrarEcra("ecran-principal");
}

function preencherPerfilJogador(jogador) {
    const nomeElemento = document.getElementById("nome-jogador");
    const avatarElemento = document.getElementById("avatar-principal");

    if (nomeElemento) {
        nomeElemento.textContent = jogador.nome;
    }

    if (avatarElemento) {
        avatarElemento.src = jogador.avatar;
        avatarElemento.alt = jogador.nome;
    }
}

function voltarEscolha() {
    mostrarEcra("ecran-jogadores");
}

function mostrarEcra(id) {
    document.querySelectorAll(".container").forEach(function(ecra) {
        ecra.classList.add("escondido");
    });

    const ecra = document.getElementById(id);
    if (ecra) {
        ecra.classList.remove("escondido");
    }
}

// ==================================================
// NAVEGAÇÃO ENTRE ÁREAS
// ==================================================

function abrirInicio() {
    atualizarEstadoJogo();
    mostrarEcra("ecran-principal");
}

function criarPainelVazio(mensagem) {
    const painel = document.createElement("div");
    painel.className = "painel";

    const texto = document.createElement("p");
    texto.textContent = mensagem;
    painel.appendChild(texto);

    return painel;
}

function criarCartaoArea(titulo, descricao, detalhe) {
    const cartao = document.createElement("div");
    cartao.className = "painel";

    const tituloElemento = document.createElement("h3");
    tituloElemento.textContent = titulo;
    cartao.appendChild(tituloElemento);

    if (descricao) {
        const descricaoElemento = document.createElement("p");
        descricaoElemento.textContent = descricao;
        cartao.appendChild(descricaoElemento);
    }

    if (detalhe) {
        const detalheElemento = document.createElement("small");
        detalheElemento.textContent = detalhe;
        cartao.appendChild(detalheElemento);
    }

    return cartao;
}

function preencherArea(idConteudo, elementos, mensagemVazia, criarElemento) {
    const conteudo = document.getElementById(idConteudo);
    if (!conteudo) {
        return;
    }

    conteudo.textContent = "";

    if (!elementos.length) {
        conteudo.appendChild(criarPainelVazio(mensagemVazia));
        return;
    }

    elementos.forEach(function(elemento) {
        conteudo.appendChild(criarElemento(elemento));
    });
}

function renderDesafiosFerias(estado) {
    const conteudo = document.getElementById("conteudo-desafios-ferias");
    const desafios = obterDesafiosGerais(estado)
        .filter(function(desafio) { return desafio.tipo === "desafio-ferias"; });

    if (!conteudo) {
        return;
    }

    conteudo.textContent = "";

    const resumo = document.createElement("div");
    resumo.className = "resumo-desafios-ferias";
    resumo.textContent = `${contarDesafiosFeriasConcluidos(estado)} / ${desafios.length} concluídos`;
    conteudo.appendChild(resumo);

    desafios.forEach(function(desafio) {
        const progresso = obterProgressoDesafio(desafio, estado);
        const concluido = desafio.estado === "concluida";
        const detalhe = desafio.objetivo
            ? `${progresso.atual} / ${progresso.objetivo} ${desafio.unidade}` : null;
        const cartao = criarCartaoArea(desafio.titulo, null, detalhe);

        const botao = document.createElement("button");
        botao.className = "botao-principal";
        botao.disabled = concluido;

        if (desafio.objetivo) {
            botao.textContent = concluido ? "✓ CONCLUÍDO" : `REGISTAR 1 ${desafio.unidade.slice(0, -1).toUpperCase()}`;
            botao.addEventListener("click", function() {
                adicionarProgressoDesafioFerias(desafio.id);
            });
        } else {
            botao.textContent = concluido ? "✓ CONCLUÍDO" : "MARCAR COMO CONCLUÍDO";
            botao.addEventListener("click", function() {
                concluirDesafioFerias(desafio.id);
            });
        }

        cartao.appendChild(botao);

        const podeAnular = desafio.objetivo ? progresso.atual > 0 : concluido;
        if (podeAnular) {
            const botaoAnular = document.createElement("button");
            botaoAnular.className = "botao-secundario";
            botaoAnular.textContent = desafio.objetivo
                ? "ANULAR ÚLTIMO REGISTO" : "ANULAR CONCLUSÃO";
            botaoAnular.addEventListener("click", function() {
                const resultado = desafio.objetivo
                    ? desfazerUnidadeAtividade(desafio.id)
                    : desfazerAtividade(desafio.id);

                if (resultado.desfeita) {
                    renderDesafiosFerias(obterEstadoFamilia());
                }
            });
            cartao.appendChild(botaoAnular);
        }

        if (concluido) {
            cartao.appendChild(criarControlosFotografia(desafio.id));
        }

        conteudo.appendChild(cartao);
    });
}

function renderDesafiosDiarios(estado) {
    const data = dataLocalAtual();
    garantirAgendaDiaria(estado, data);
    const missoes = obterMissoesDoDia(estado, data);

    preencherArea(
        "conteudo-desafios-diarios",
        missoes,
        "Não há desafios diários disponíveis para hoje.",
        function(missao) {
            const jogadorAlvo = obterNomeJogadorAlvo(missao);
            const estadoTexto = missao.estado === "concluida"
                ? jogadorAlvo ? `${jogadorAlvo} · Concluído` : "Concluído"
                : jogadorAlvo ? `${jogadorAlvo} · ⭐ ${missao.xp} XP` : `⭐ ${missao.xp} XP`;
            const cartao = criarCartaoArea(missao.titulo, missao.descricao, estadoTexto);
            const botao = document.createElement("button");
            const concluida = missao.estado === "concluida";

            botao.className = "botao-principal";
            botao.textContent = concluida ? "✓ CONCLUÍDO" : "ABRIR DESAFIO";
            botao.disabled = concluida;
            botao.addEventListener("click", function() {
                abrirMissao(missao.id);
            });
            cartao.appendChild(botao);

            if (concluida) {
                const botaoAnular = document.createElement("button");
                botaoAnular.className = "botao-secundario";
                botaoAnular.textContent = "ANULAR CONCLUSÃO";
                botaoAnular.addEventListener("click", function() {
                    const resultado = desfazerAtividade(missao.id);
                    if (resultado.desfeita) {
                        renderDesafiosDiarios(obterEstadoFamilia());
                    }
                });
                cartao.appendChild(botaoAnular);
                cartao.appendChild(criarControlosFotografia(missao.id));
            }

            return cartao;
        }
    );
}

function renderJogos(estado) {
    const data = dataLocalAtual();
    garantirAgendaDiaria(estado, data);
    const jogo = obterJogoDoDia(estado, data);
    const conteudo = document.getElementById("conteudo-jogos");

    if (!conteudo) {
        return;
    }

    conteudo.textContent = "";

    if (!jogo) {
        const todosUtilizados = catalogo.jogos.length > 0 &&
            estado.jogosUtilizados.length >= catalogo.jogos.length;
        conteudo.appendChild(criarPainelVazio(todosUtilizados
            ? "Todos os jogos destas férias já foram utilizados."
            : "Ainda não há jogo disponível para hoje."));
        return;
    }

    const resumo = document.createElement("div");
    resumo.className = "resumo-jogos";
    resumo.textContent = `Jogos utilizados: ${estado.jogosUtilizados.length} / ${catalogo.jogos.length}`;
    conteudo.appendChild(resumo);

    const concluido = jogo.estado === "concluida";
    const cartao = criarCartaoArea(
        `🎲 ${jogo.titulo}`,
        jogo.descricao,
        concluido ? "Jogo concluído" : `⭐ ${jogo.xp} XP`
    );
    const regras = document.createElement("p");
    regras.textContent = jogo.regras;
    cartao.appendChild(regras);

    const botao = document.createElement("button");
    botao.className = "botao-principal";
    botao.textContent = concluido ? "✓ JOGO CONCLUÍDO" : "ABRIR JOGO";
    botao.disabled = concluido;
    botao.addEventListener("click", function() {
        abrirJogo(jogo.id);
    });
    cartao.appendChild(botao);

    if (concluido) {
        const botaoAnular = document.createElement("button");
        botaoAnular.className = "botao-secundario";
        botaoAnular.textContent = "ANULAR CONCLUSÃO";
        botaoAnular.addEventListener("click", function() {
            const resultado = desfazerAtividade(jogo.id);
            if (resultado.desfeita) {
                renderJogos(obterEstadoFamilia());
            }
        });
        cartao.appendChild(botaoAnular);
        cartao.appendChild(criarControlosFotografia(jogo.id));
    }

    conteudo.appendChild(cartao);
}

function abrirJogo(id) {
    const jogo = obterAtividadePorId(id);
    if (!jogo || jogo.tipo !== "jogo") {
        return;
    }

    jogoAbertoId = id;
    renderJogoAberto();
    mostrarEcra("ecran-jogo");
}

function renderJogoAberto() {
    const conteudo = document.getElementById("conteudo-jogo");
    const jogo = obterAtividadePorId(jogoAbertoId);
    if (!conteudo || !jogo || jogo.tipo !== "jogo") {
        return;
    }

    const estado = obterEstadoFamilia();
    const concluido = obterEstadoAtividade(jogo.id, estado) === "concluida";
    conteudo.textContent = "";

    const detalhe = jogo.duracao ? `${jogo.duracao} · ⭐ ${jogo.xp} XP` : `⭐ ${jogo.xp} XP`;
    const cartao = criarCartaoArea(`🎲 ${jogo.titulo}`, jogo.regras, detalhe);
    const botao = document.createElement("button");
    botao.className = "botao-principal";
    botao.textContent = concluido ? "✓ JOGO CONCLUÍDO" : "CONCLUIR JOGO";
    botao.disabled = concluido;
    botao.addEventListener("click", concluirJogoAtual);
    cartao.appendChild(botao);

    if (concluido) {
        const botaoAnular = document.createElement("button");
        botaoAnular.className = "botao-secundario";
        botaoAnular.textContent = "ANULAR CONCLUSÃO";
        botaoAnular.addEventListener("click", desfazerJogoAtual);
        cartao.appendChild(botaoAnular);
        cartao.appendChild(criarControlosFotografia(jogo.id));
    }

    conteudo.appendChild(cartao);
}

function concluirJogoAtual() {
    if (!jogoAbertoId) {
        return;
    }

    concluirAtividade(jogoAbertoId);
    atualizarEstadoJogo();
    renderJogoAberto();
}

function desfazerJogoAtual() {
    if (!jogoAbertoId) {
        return;
    }

    const resultado = desfazerAtividade(jogoAbertoId);
    if (resultado.desfeita) {
        renderJogoAberto();
    }
}

function renderMapa(localAbertoId) {
    const conteudo = document.getElementById("conteudo-mapa");
    if (!conteudo) {
        return;
    }

    conteudo.textContent = "";

    const localAberto = catalogo.locais.find(function(local) {
        return local.id === localAbertoId;
    });

    if (localAberto) {
        renderDesafiosDoLocal(conteudo, localAberto);
        return;
    }

    const roda = criarCartaoArea(
        "🎡 Onde vamos hoje?",
        "A roda da sorte escolhe apenas entre os destinos disponíveis no mapa."
    );
    const resultado = document.createElement("p");
    resultado.id = "resultado-roda-mapa";

    if (catalogo.locais.length) {
        const botao = document.createElement("button");
        botao.className = "botao-principal";
        botao.textContent = "RODAR A RODA";
        botao.addEventListener("click", rodarRodaMapa);
        roda.appendChild(botao);
    } else {
        resultado.textContent = "A roda estará disponível quando existirem locais no mapa.";
    }

    roda.appendChild(resultado);
    conteudo.appendChild(roda);

    if (!catalogo.locais.length) {
        return;
    }

    catalogo.locais.forEach(function(local) {
        const cartao = criarCartaoArea(local.nome, local.descricao || local.categoria || "Local a explorar");
        const botao = document.createElement("button");
        botao.className = "botao-principal";
        botao.textContent = "VER DESAFIOS";
        botao.addEventListener("click", function() {
            abrirLocal(local.id);
        });
        cartao.appendChild(botao);
        conteudo.appendChild(cartao);
    });
}

function abrirLocal(localId) {
    renderMapa(localId);
    mostrarEcra("ecran-mapa");
}

function renderDesafiosDoLocal(conteudo, local) {
    const botaoVoltar = document.createElement("button");
    botaoVoltar.className = "botao-secundario";
    botaoVoltar.textContent = "← TODOS OS LOCAIS";
    botaoVoltar.addEventListener("click", function() {
        renderMapa();
    });
    conteudo.appendChild(botaoVoltar);

    const cabecalho = criarCartaoArea(local.nome, local.descricao || local.categoria || "Local a explorar");
    conteudo.appendChild(cabecalho);

    const estado = obterEstadoFamilia();
    const desafios = obterDesafiosLocais(estado, local.id);
    if (!desafios.length) {
        conteudo.appendChild(criarPainelVazio("Desafios deste local serão adicionados em breve."));
        return;
    }

    desafios.forEach(function(desafio) {
        const concluido = desafio.estado === "concluida";
        const cartao = criarCartaoArea(
            desafio.titulo,
            desafio.descricao,
            concluido ? "Concluído" : `⭐ ${desafio.xp} XP`
        );
        const botao = document.createElement("button");
        botao.className = "botao-principal botao-desafio-local";
        botao.textContent = concluido ? "✓ CONCLUÍDO" : "MARCAR COMO CONCLUÍDO";
        botao.disabled = concluido;
        botao.addEventListener("click", function() {
            concluirAtividade(desafio.id);
            renderMapa(local.id);
        });
        cartao.appendChild(botao);

        if (concluido) {
            const botaoAnular = document.createElement("button");
            botaoAnular.className = "botao-secundario";
            botaoAnular.textContent = "ANULAR CONCLUSÃO";
            botaoAnular.addEventListener("click", function() {
                const resultado = desfazerAtividade(desafio.id);
                if (resultado.desfeita) {
                    renderMapa(local.id);
                }
            });
            cartao.appendChild(botaoAnular);
            cartao.appendChild(criarControlosFotografia(desafio.id));
        }

        conteudo.appendChild(cartao);
    });
}

function rodarRodaMapa() {
    const destino = escolherAleatoriamente(catalogo.locais, 1)[0];
    const resultado = document.getElementById("resultado-roda-mapa");

    if (!resultado || !destino) {
        return;
    }

    resultado.textContent = `Hoje vamos a: ${destino.nome}`;
}

function libertarUrlsAlbum() {
    urlsAlbum.forEach(function(url) { URL.revokeObjectURL(url); });
    urlsAlbum = [];
}

function libertarUrlFotografiaAberta() {
    if (urlFotografiaAberta) {
        URL.revokeObjectURL(urlFotografiaAberta);
        urlFotografiaAberta = null;
    }
}

async function renderAlbum(estado) {
    const fotografias = Object.values(estado.fotografias || {})
        .sort(function(a, b) { return new Date(b.criadoEm) - new Date(a.criadoEm); });
    const conteudo = document.getElementById("conteudo-album");

    if (!conteudo) {
        return;
    }

    libertarUrlsAlbum();
    conteudo.textContent = "";

    if (!fotografias.length) {
        conteudo.appendChild(criarPainelVazio("O álbum da família ainda não tem fotografias."));
        return;
    }

    const grelha = document.createElement("div");
    grelha.className = "grelha-album";

    for (const fotografia of fotografias) {
        const item = document.createElement("button");
        item.className = "item-album";
        item.type = "button";
        item.addEventListener("click", function() {
            abrirFotografia(fotografia.id);
        });

        try {
            const guardada = await obterBlobFotografia(fotografia.id);
            if (guardada && guardada.blob) {
                const url = URL.createObjectURL(guardada.blob);
                urlsAlbum.push(url);
                const imagem = document.createElement("img");
                imagem.src = url;
                imagem.alt = fotografia.tituloAtividade;
                item.appendChild(imagem);
            }
        } catch (erro) {
            console.warn("Não foi possível carregar uma fotografia do álbum.", erro);
        }

        const titulo = document.createElement("strong");
        titulo.textContent = fotografia.tituloAtividade;
        const jogador = jogadores.find(function(itemJogador) {
            return itemJogador.id === fotografia.jogadorId;
        });
        const detalhe = document.createElement("small");
        detalhe.textContent = `${fotografia.data} · ${jogador ? jogador.nome : "Família"}`;
        item.appendChild(titulo);
        item.appendChild(detalhe);
        grelha.appendChild(item);
    }

    conteudo.appendChild(grelha);
}

async function abrirFotografia(id) {
    const conteudo = document.getElementById("conteudo-fotografia");
    const estado = obterEstadoFamilia();
    const fotografia = estado.fotografias[id];
    if (!conteudo || !fotografia) {
        return;
    }

    libertarUrlsAlbum();
    libertarUrlFotografiaAberta();
    conteudo.textContent = "";

    try {
        const guardada = await obterBlobFotografia(id);
        if (!guardada || !guardada.blob) {
            throw new Error("Fotografia não encontrada");
        }

        urlFotografiaAberta = URL.createObjectURL(guardada.blob);
        const imagem = document.createElement("img");
        imagem.className = "fotografia-ampliada";
        imagem.src = urlFotografiaAberta;
        imagem.alt = fotografia.tituloAtividade;
        conteudo.appendChild(imagem);
    } catch (erro) {
        conteudo.appendChild(criarPainelVazio("Não foi possível abrir esta fotografia nesta instalação."));
        return;
    }

    const jogador = jogadores.find(function(item) { return item.id === fotografia.jogadorId; });
    conteudo.appendChild(criarCartaoArea(
        fotografia.tituloAtividade,
        `${fotografia.data} · ${jogador ? jogador.nome : "Família"}`
    ));

    const botaoGuardar = document.createElement("button");
    botaoGuardar.className = "botao-principal";
    botaoGuardar.textContent = "GUARDAR NO TELEMÓVEL";
    botaoGuardar.addEventListener("click", function() { guardarFotografiaNoTelemovel(id); });
    conteudo.appendChild(botaoGuardar);

    const botaoApagar = document.createElement("button");
    botaoApagar.className = "botao-secundario";
    botaoApagar.textContent = "APAGAR FOTOGRAFIA";
    botaoApagar.addEventListener("click", function() { apagarFotografia(id); });
    conteudo.appendChild(botaoApagar);

    mostrarEcra("ecran-fotografia");
}

async function guardarFotografiaNoTelemovel(id) {
    const estado = obterEstadoFamilia();
    const fotografia = estado.fotografias[id];
    if (!fotografia) {
        return;
    }

    try {
        const guardada = await obterBlobFotografia(id);
        if (!guardada || !guardada.blob) {
            throw new Error("Fotografia não encontrada");
        }

        const extensao = fotografia.mimeType === "image/png" ? "png" : "jpg";
        const nome = `terceiraquest-${fotografia.data}-${criarIdConteudo("atividade", fotografia.tituloAtividade)}.${extensao}`;
        const ficheiro = new File([guardada.blob], nome, { type: fotografia.mimeType || "image/jpeg" });

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [ficheiro] })) {
            await navigator.share({ files: [ficheiro], title: fotografia.tituloAtividade });
            return;
        }

        const url = URL.createObjectURL(guardada.blob);
        const ligacao = document.createElement("a");
        ligacao.href = url;
        ligacao.download = nome;
        document.body.appendChild(ligacao);
        ligacao.click();
        ligacao.remove();
        setTimeout(function() { URL.revokeObjectURL(url); }, 0);
    } catch (erro) {
        console.warn("Não foi possível guardar a fotografia no telemóvel.", erro);
    }
}

async function apagarFotografia(id) {
    if (!window.confirm("Queres mesmo apagar esta fotografia do Álbum?")) {
        return;
    }

    try {
        await apagarBlobFotografia(id);
        const estado = obterEstadoFamilia();
        delete estado.fotografias[id];
        Object.values(estado.conclusoes).forEach(function(conclusao) {
            if (Array.isArray(conclusao.fotografiaIds)) {
                conclusao.fotografiaIds = conclusao.fotografiaIds.filter(function(fotoId) {
                    return fotoId !== id;
                });
            }
        });
        guardarEstadoFamilia(estado);
        libertarUrlFotografiaAberta();
        abrirArea("ecran-album");
    } catch (erro) {
        console.warn("Não foi possível apagar a fotografia.", erro);
        window.alert("Não foi possível apagar a fotografia nesta instalação.");
    }
}

function renderConquistas(estado) {
    const conquistas = catalogo.conquistas.map(function(conquista) {
        return {
            ...conquista,
            desbloqueada: Boolean(estado.conquistasDesbloqueadas[conquista.id])
        };
    });

    preencherArea(
        "conteudo-conquistas",
        conquistas,
        "As conquistas desbloqueadas pela família aparecerão aqui.",
        function(conquista) {
            const cartao = criarCartaoArea(
                `${conquista.icone || "🏆"} ${conquista.titulo}`,
                conquista.descricao,
                conquista.desbloqueada ? "Desbloqueada" : "Por desbloquear"
            );

            if (conquista.desbloqueada) {
                cartao.classList.add("conquista-desbloqueada");
            }

            return cartao;
        }
    );
}

function renderDiario(estado) {
    const entradas = [...estado.diario].sort(function(a, b) {
        return new Date(b.criadoEm) - new Date(a.criadoEm);
    });

    preencherArea(
        "conteudo-diario",
        entradas,
        "O diário familiar ainda não tem entradas.",
        function(entrada) {
            const jogador = jogadores.find(function(item) {
                return item.id === entrada.jogadorId;
            });
            const autor = jogador ? jogador.nome : "Família";
            const temFotografia = Object.values(estado.fotografias || {}).some(function(fotografia) {
                return fotografia.atividadeId === entrada.atividadeId;
            });
            return criarCartaoArea(
                `${entrada.data || "Hoje"} · ${entrada.titulo || "Atividade"}${temFotografia ? " 📷" : ""}`,
                entrada.texto,
                autor
            );
        }
    );
}

function renderMais() {
    const conteudo = document.getElementById("conteudo-mais");
    if (!conteudo) {
        return;
    }

    conteudo.textContent = "";
    const apresentacao = criarCartaoArea(
        "TERCEIRAQUEST",
        "Uma aventura familiar pela Ilha Terceira."
    );
    const jogadoresTexto = document.createElement("p");
    jogadoresTexto.textContent = "Jogadores: Jorge · Olinda · Ema";
    apresentacao.appendChild(jogadoresTexto);

    const regras = document.createElement("ul");
    regras.className = "regras-terceiraquest";
    [
        "O progresso é familiar: todos contribuem para XP e Atividades.",
        "Cada dia existem até 3 desafios e 1 jogo.",
        "Desafios diários e jogos não se repetem enquanto houver conteúdo disponível.",
        "Desafios de férias podem ser realizados em qualquer momento; os locais surgem no Mapa.",
        "Registos por engano podem ser anulados.",
        "A aventura principal completa-se às 80 atividades, mas podem continuar a jogar.",
        "As fotografias permanecem no Álbum mesmo após o reset do progresso."
    ].forEach(function(regra) {
        const item = document.createElement("li");
        item.textContent = regra;
        regras.appendChild(item);
    });
    apresentacao.appendChild(regras);
    conteudo.appendChild(apresentacao);

    const painel = criarCartaoArea(
        "Ferramentas de teste",
        "Esta opção apaga o progresso atual desta instalação."
    );
    const botao = document.createElement("button");
    botao.className = "botao-principal botao-reset-teste";
    botao.innerHTML = "REPOR PROGRESSO<br>DE TESTE";
    botao.addEventListener("click", reporProgressoTeste);
    painel.appendChild(botao);
    conteudo.appendChild(painel);

    const copyright = document.createElement("small");
    copyright.className = "copyright-terceiraquest";
    copyright.textContent = "© 2026 TerceiraQuest";
    conteudo.appendChild(copyright);
}

function reporProgressoTeste() {
    const confirmar = window.confirm(
        "O progresso será apagado. As fotografias do Álbum serão mantidas. Continuar?"
    );

    if (!confirmar) {
        return;
    }

    const fotografias = obterEstadoFamilia().fotografias;
    localStorage.removeItem(CHAVE_ESTADO_FAMILIA);
    const estadoReposto = criarEstadoInicial();
    estadoReposto.fotografias = fotografias;
    guardarEstadoFamilia(estadoReposto);
    missaoAbertaId = null;
    jogoAbertoId = null;
    abrirInicio();
}

function abrirArea(id) {
    if (id !== "ecran-fotografia") {
        libertarUrlFotografiaAberta();
    }
    if (id !== "ecran-album") {
        libertarUrlsAlbum();
    }

    const estado = obterEstadoFamilia();
    const renderizadores = {
        "ecran-desafios-ferias": function() { renderDesafiosFerias(estado); },
        "ecran-desafios-diarios": function() { renderDesafiosDiarios(estado); },
        "ecran-jogos": function() { renderJogos(estado); },
        "ecran-mapa": renderMapa,
        "ecran-album": function() { renderAlbum(estado); },
        "ecran-conquistas": function() { renderConquistas(estado); },
        "ecran-diario": function() { renderDiario(estado); },
        "ecran-mais": renderMais
    };

    const renderizador = renderizadores[id];
    if (!renderizador) {
        return;
    }

    renderizador();
    mostrarEcra(id);
}

function dataLocalAtual() {
    const agora = new Date();
    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
}

function obterAtividadePorId(id) {
    const tipos = ["missoes", "jogos", "desafiosGerais", "desafiosLocais"];

    for (const tipo of tipos) {
        const atividade = catalogo[tipo].find(function(item) {
            return item.id === id;
        });

        if (atividade) {
            return {
                ...atividade,
                tipo: atividade.tipo || (tipo === "missoes" ? "missao" : tipo === "jogos" ? "jogo" : "desafio")
            };
        }
    }

    return null;
}

function obterEstadoAtividade(id, estado) {
    const conclusao = estado.conclusoes[id];
    return conclusao && conclusao.estado === "concluida" ? "concluida" : "por_concluir";
}

function obterMissoesDoDia(estado, data) {
    const agenda = estado.agendaDiaria[data];
    if (!agenda || !Array.isArray(agenda.missoesIds)) {
        return [];
    }

    return agenda.missoesIds
        .map(obterAtividadePorId)
        .filter(Boolean)
        .map(function(missao) {
            return { ...missao, estado: obterEstadoAtividade(missao.id, estado) };
        });
}

function escolherAleatoriamente(itens, quantidade) {
    const restantes = [...itens];
    const escolhidos = [];

    while (restantes.length > 0 && escolhidos.length < quantidade) {
        const indice = Math.floor(Math.random() * restantes.length);
        escolhidos.push(restantes.splice(indice, 1)[0]);
    }

    return escolhidos;
}

function garantirAgendaDiaria(estado, data) {
    const agendaExistente = estado.agendaDiaria[data];
    const missoesIdsExistentes = agendaExistente && Array.isArray(agendaExistente.missoesIds)
        ? [...agendaExistente.missoesIds] : [];

    const missoesJaSorteadas = new Set();
    Object.keys(estado.agendaDiaria).forEach(function(dataAgenda) {
        if (dataAgenda === data) {
            return;
        }

        const agendaAnterior = estado.agendaDiaria[dataAgenda];
        if (!agendaAnterior || !Array.isArray(agendaAnterior.missoesIds)) {
            return;
        }

        agendaAnterior.missoesIds.forEach(function(id) {
            missoesJaSorteadas.add(id);
        });
    });

    const missoesDisponiveis = catalogo.missoes.filter(function(missao) {
        return obterEstadoAtividade(missao.id, estado) !== "concluida" &&
            !missoesJaSorteadas.has(missao.id) &&
            !missoesIdsExistentes.includes(missao.id);
    });

    const vagas = Math.max(0, MISSOES_DIARIAS_POR_DIA - missoesIdsExistentes.length);
    const novosMissoesIds = escolherAleatoriamente(missoesDisponiveis, vagas)
        .map(function(missao) { return missao.id; });

    let agenda = agendaExistente;
    let alterouAgenda = false;

    if (agenda) {
        if (novosMissoesIds.length) {
            agenda.missoesIds = [...missoesIdsExistentes, ...novosMissoesIds];
            alterouAgenda = true;
        }
    } else {
        agenda = {
            criadaEm: new Date().toISOString(),
            missoesIds: novosMissoesIds,
            jogoId: null
        };
        estado.agendaDiaria[data] = agenda;
        alterouAgenda = true;
    }

    if (!agenda.jogoId) {
        const jogosDisponiveis = catalogo.jogos.filter(function(jogo) {
            return !estado.jogosUtilizados.includes(jogo.id);
        });
        const jogo = escolherAleatoriamente(jogosDisponiveis, 1)[0] || null;

        if (jogo) {
            agenda.jogoId = jogo.id;
            estado.jogosUtilizados.push(jogo.id);
            alterouAgenda = true;
        }
    } else if (!estado.jogosUtilizados.includes(agenda.jogoId)) {
        estado.jogosUtilizados.push(agenda.jogoId);
        alterouAgenda = true;
    }

    if (alterouAgenda) {
        guardarEstadoFamilia(estado);
    }
    return agenda;
}

function obterJogoDoDia(estado, data) {
    const agenda = estado.agendaDiaria[data];
    if (!agenda || !agenda.jogoId) {
        return null;
    }

    const jogo = obterAtividadePorId(agenda.jogoId);
    return jogo ? { ...jogo, estado: obterEstadoAtividade(jogo.id, estado) } : null;
}

function obterDesafiosGerais(estado) {
    return catalogo.desafiosGerais.map(function(desafio) {
        return {
            ...desafio,
            tipo: desafio.tipo || "desafio",
            estado: obterEstadoAtividade(desafio.id, estado)
        };
    });
}

function obterDesafiosLocais(estado, localId) {
    return catalogo.desafiosLocais
        .filter(function(desafio) { return !localId || desafio.localId === localId; })
        .map(function(desafio) {
            return {
                ...desafio,
                tipo: desafio.tipo || "desafio",
                estado: obterEstadoAtividade(desafio.id, estado)
            };
        });
}

function obterUnidadesAtividade(atividade) {
    return Math.max(1, numeroSeguro(atividade.objetivo));
}

function obterAtividadesCatalogadas() {
    return [
        ...catalogo.missoes,
        ...catalogo.desafiosGerais,
        ...catalogo.jogos,
        ...catalogo.desafiosLocais
    ];
}

function obterTotalAtividades() {
    return obterAtividadesCatalogadas().reduce(function(total, atividade) {
        return total + obterUnidadesAtividade(atividade);
    }, 0);
}

function obterAtividadesConcluidas(estado) {
    return obterAtividadesCatalogadas().reduce(function(total, atividade) {
        const conclusao = estado.conclusoes[atividade.id];
        const unidades = obterUnidadesAtividade(atividade);

        if (conclusao && conclusao.estado === "concluida") {
            return total + unidades;
        }

        if (atividade.objetivo && conclusao && conclusao.estado === "em_progresso") {
            return total + Math.min(numeroSeguro(conclusao.progresso), unidades);
        }

        return total;
    }, 0);
}

function calcularXP(estado) {
    const xpDasConclusoes = Object.values(estado.conclusoes)
        .filter(function(conclusao) {
            return conclusao.estado === "concluida" ||
                (conclusao.tipo === "desafio-ferias" && conclusao.estado === "em_progresso");
        })
        .reduce(function(total, conclusao) {
            return total + Number(conclusao.xpAtribuido || 0);
        }, 0);

    const ajustes = estado.ajustesXP.reduce(function(total, ajuste) {
        return total + Number(ajuste.valor || 0);
    }, 0);

    return Math.max(0, xpDasConclusoes + ajustes);
}

function obterNivelPorAtividades(atividadesConcluidas) {
    return niveis.reduce(function(nivelAtual, nivel) {
        return atividadesConcluidas >= nivel.minimoAtividades ? nivel : nivelAtual;
    }, niveis[0]);
}

function contarMissoesConcluidas(estado) {
    return catalogo.missoes.filter(function(missao) {
        return obterEstadoAtividade(missao.id, estado) === "concluida";
    }).length;
}

function contarMedalhas(estado) {
    return estado.medalhasLegado + Object.keys(estado.medalhasConquistadas).length;
}

function contarDesafiosFeriasConcluidos(estado) {
    return catalogo.desafiosGerais.filter(function(desafio) {
        const conclusao = estado.conclusoes[desafio.id];
        return conclusao && conclusao.tipo === "desafio-ferias" && conclusao.estado === "concluida";
    }).length;
}

function registarEntradaDiario(estado, atividade, jogador, criadoEm, unidade) {
    const sufixo = unidade ? `unidade-${unidade}` : "conclusao";
    const id = `diario-${atividade.id}-${sufixo}`;

    if (estado.diario.some(function(entrada) { return entrada.id === id; })) {
        return;
    }

    const nomeJogador = jogador ? jogador.nome : "A família";
    const unidadeSingular = unidade && atividade.unidade
        ? atividade.unidade.slice(0, -1) : null;
    const texto = unidadeSingular
        ? `${nomeJogador} registou 1 ${unidadeSingular} — ${atividade.titulo}`
        : `${nomeJogador} concluiu — ${atividade.titulo}`;

    estado.diario.push({
        id: id,
        atividadeId: atividade.id,
        tipo: atividade.tipo,
        titulo: atividade.titulo,
        jogadorId: jogador ? jogador.id : null,
        data: dataLocalAtual(),
        criadoEm: criadoEm,
        texto: texto
    });
}

function condicaoConquistaCumprida(condicao, estado) {
    if (condicao.tipo === "atividades") {
        return obterAtividadesConcluidas(estado) >= condicao.minimo;
    }

    if (condicao.tipo === "atividade-concluida") {
        return estado.conclusoes[condicao.atividadeId] &&
            estado.conclusoes[condicao.atividadeId].estado === "concluida";
    }

    if (condicao.tipo === "desafios-ferias") {
        return contarDesafiosFeriasConcluidos(estado) >= condicao.minimo;
    }

    return false;
}

function verificarConquistas(estado) {
    const anteriores = estado.conquistasDesbloqueadas;
    const atuais = {};

    catalogo.conquistas.forEach(function(conquista) {
        if (condicaoConquistaCumprida(conquista.condicao, estado)) {
            atuais[conquista.id] = anteriores[conquista.id] || {
                desbloqueadaEm: new Date().toISOString()
            };
        }
    });

    const houveAlteracao = JSON.stringify(anteriores) !== JSON.stringify(atuais);
    estado.conquistasDesbloqueadas = atuais;
    return houveAlteracao;
}

function obterProgressoDesafio(desafio, estado) {
    const objetivo = numeroSeguro(desafio.objetivo);
    const conclusao = estado.conclusoes[desafio.id];

    if (!objetivo) {
        return { atual: 0, objetivo: 0 };
    }

    if (conclusao && conclusao.estado === "concluida") {
        return { atual: objetivo, objetivo: objetivo };
    }

    const atual = conclusao ? Math.min(numeroSeguro(conclusao.progresso), objetivo) : 0;
    return { atual: atual, objetivo: objetivo };
}

function concluirAtividade(id) {
    const atividade = obterAtividadePorId(id);
    if (!atividade) {
        return { concluida: false, motivo: "atividade-inexistente" };
    }

    if (numeroSeguro(atividade.objetivo) > 0) {
        return { concluida: false, motivo: "atividade-quantitativa" };
    }

    const estado = obterEstadoFamilia();
    if (obterEstadoAtividade(id, estado) === "concluida") {
        return { concluida: false, motivo: "ja-concluida" };
    }

    const jogador = obterJogadorAtual();
    const agora = new Date().toISOString();
    estado.conclusoes[id] = {
        tipo: atividade.tipo,
        estado: "concluida",
        concluidaEm: agora,
        concluidaPor: jogador ? jogador.id : null,
        xpAtribuido: numeroSeguro(atividade.xp),
        fotografiaIds: []
    };

    registarEntradaDiario(estado, atividade, jogador, agora);
    verificarConquistas(estado);
    guardarEstadoFamilia(estado);
    return { concluida: true, atividade: atividade };
}

function concluirDesafioFerias(id) {
    const atividade = obterAtividadePorId(id);
    if (!atividade || atividade.tipo !== "desafio-ferias" || numeroSeguro(atividade.objetivo) > 0) {
        return { concluida: false, motivo: "desafio-invalido" };
    }

    const resultado = concluirAtividade(id);
    atualizarEstadoJogo();
    renderDesafiosFerias(obterEstadoFamilia());
    return resultado;
}

function adicionarProgressoDesafioFerias(id) {
    const atividade = obterAtividadePorId(id);
    const objetivo = atividade ? numeroSeguro(atividade.objetivo) : 0;

    if (!atividade || atividade.tipo !== "desafio-ferias" || !objetivo) {
        return { concluida: false, motivo: "desafio-invalido" };
    }

    const estado = obterEstadoFamilia();
    const anterior = estado.conclusoes[id];
    if (anterior && anterior.estado === "concluida") {
        return { concluida: false, motivo: "ja-concluida" };
    }

    const progressoAtual = anterior ? Math.min(numeroSeguro(anterior.progresso), objetivo) : 0;
    const progresso = Math.min(objetivo, progressoAtual + 1);
    const concluida = progresso === objetivo;
    const jogador = obterJogadorAtual();
    const agora = new Date().toISOString();

    const xpAnterior = anterior && Number.isFinite(Number(anterior.xpAtribuido))
        ? Number(anterior.xpAtribuido) : 0;
    const xpPorUnidade = numeroSeguro(atividade.xpPorUnidade || atividade.xp);

    estado.conclusoes[id] = {
        ...anterior,
        tipo: "desafio-ferias",
        estado: concluida ? "concluida" : "em_progresso",
        progresso: progresso,
        objetivo: objetivo,
        atualizadaEm: agora,
        atualizadaPor: jogador ? jogador.id : null,
        xpAtribuido: xpAnterior + xpPorUnidade,
        fotografiaIds: anterior && Array.isArray(anterior.fotografiaIds) ? anterior.fotografiaIds : []
    };

    if (concluida) {
        estado.conclusoes[id].concluidaEm = agora;
        estado.conclusoes[id].concluidaPor = jogador ? jogador.id : null;
    }

    registarEntradaDiario(estado, atividade, jogador, agora, progresso);
    verificarConquistas(estado);
    guardarEstadoFamilia(estado);
    atualizarEstadoJogo();
    renderDesafiosFerias(obterEstadoFamilia());
    return { concluida: concluida, progresso: progresso, objetivo: objetivo };
}

function removerEntradaDiario(estado, id) {
    estado.diario = estado.diario.filter(function(entrada) {
        return entrada.id !== id;
    });
}

function confirmarAnulacao() {
    return window.confirm("Queres mesmo anular este registo?");
}

function desfazerAtividade(id) {
    const atividade = obterAtividadePorId(id);
    if (!atividade) {
        return { desfeita: false, motivo: "atividade-inexistente" };
    }

    if (numeroSeguro(atividade.objetivo) > 0) {
        return desfazerUnidadeAtividade(id);
    }

    const estado = obterEstadoFamilia();
    const conclusao = estado.conclusoes[id];
    if (!conclusao || conclusao.estado !== "concluida" || !confirmarAnulacao()) {
        return { desfeita: false, motivo: "sem-conclusao" };
    }

    delete estado.conclusoes[id];
    removerEntradaDiario(estado, `diario-${id}-conclusao`);
    verificarConquistas(estado);
    guardarEstadoFamilia(estado);
    atualizarEstadoJogo();
    return { desfeita: true, atividade: atividade };
}

function desfazerUnidadeAtividade(id) {
    const atividade = obterAtividadePorId(id);
    const objetivo = atividade ? numeroSeguro(atividade.objetivo) : 0;

    if (!atividade || !objetivo) {
        return { desfeita: false, motivo: "atividade-invalida" };
    }

    const estado = obterEstadoFamilia();
    const conclusao = estado.conclusoes[id];
    const progressoAtual = conclusao
        ? conclusao.estado === "concluida" ? objetivo : Math.min(numeroSeguro(conclusao.progresso), objetivo)
        : 0;

    if (!progressoAtual || !confirmarAnulacao()) {
        return { desfeita: false, motivo: "sem-progresso" };
    }

    const progresso = progressoAtual - 1;
    const xpAnterior = Number(conclusao.xpAtribuido || 0);
    const xpPorUnidade = numeroSeguro(atividade.xpPorUnidade || atividade.xp);

    if (!progresso) {
        delete estado.conclusoes[id];
    } else {
        estado.conclusoes[id] = {
            ...conclusao,
            estado: "em_progresso",
            progresso: progresso,
            objetivo: objetivo,
            xpAtribuido: Math.max(0, xpAnterior - xpPorUnidade),
            atualizadaEm: new Date().toISOString()
        };
        delete estado.conclusoes[id].concluidaEm;
        delete estado.conclusoes[id].concluidaPor;
    }

    removerEntradaDiario(estado, `diario-${id}-unidade-${progressoAtual}`);
    verificarConquistas(estado);
    guardarEstadoFamilia(estado);
    atualizarEstadoJogo();
    return { desfeita: true, progresso: progresso, objetivo: objetivo };
}

function abrirMissao(id) {
    const missao = obterAtividadePorId(id);
    if (!missao || missao.tipo !== "missao") {
        return;
    }

    missaoAbertaId = id;
    const estado = obterEstadoFamilia();
    preencherEcraMissao(missao, obterEstadoAtividade(id, estado));
    mostrarEcra("ecran-missao");
}

function abrirMissaoDoDia() {
    const estado = obterEstadoFamilia();
    garantirAgendaDiaria(estado, dataLocalAtual());
    const missoes = obterMissoesDoDia(estado, dataLocalAtual());
    const missao = missoes.find(function(item) { return item.estado !== "concluida"; }) || missoes[0];

    if (missao) {
        abrirMissao(missao.id);
    }
}

function concluirMissao(id) {
    const resultado = concluirAtividade(id);
    atualizarEstadoJogo();
    return resultado;
}

function concluirMissaoAtual() {
    const id = missaoAbertaId;
    if (!id) {
        return;
    }

    concluirMissao(id);
    abrirMissao(id);
}

function desfazerMissaoAtual() {
    if (!missaoAbertaId) {
        return;
    }

    const resultado = desfazerAtividade(missaoAbertaId);
    if (resultado.desfeita) {
        abrirMissao(missaoAbertaId);
    }
}

function preencherEcraMissao(missao, estadoMissao) {
    const imagem = document.getElementById("imagem-missao");
    const titulo = document.getElementById("titulo-missao");
    const xp = document.getElementById("xp-missao");
    const descricao = document.getElementById("descricao-missao");
    const prova = document.getElementById("prova-missao");
    const botao = document.getElementById("botao-concluir-missao");
    const botaoAnular = document.getElementById("botao-anular-missao");
    const controlosFoto = document.getElementById("controlos-foto-missao");
    const indicadorFotos = controlosFoto ? controlosFoto.querySelector(".indicador-fotografias") : null;
    const botaoTirarFoto = document.getElementById("botao-tirar-foto-missao");
    const botaoEscolherFoto = document.getElementById("botao-escolher-foto-missao");

    const areaImagem = imagem ? imagem.closest(".missao-imagem") : null;
    if (imagem && missao.imagem) {
        imagem.src = missao.imagem;
        imagem.alt = missao.titulo;
    }
    if (areaImagem) {
        areaImagem.classList.toggle("escondido", !missao.imagem);
    }
    if (titulo) titulo.textContent = missao.titulo;
    if (xp) xp.textContent = `⭐ ${missao.xp} XP`;
    if (descricao) descricao.textContent = missao.descricao || "";
    if (prova) prova.textContent = missao.instrucoes || "Conclui esta atividade em família.";
    if (botao) {
        botao.textContent = estadoMissao === "concluida" ? "✓ MISSÃO CONCLUÍDA" : "CONCLUIR MISSÃO";
        botao.disabled = estadoMissao === "concluida";
    }
    if (botaoAnular) {
        botaoAnular.classList.toggle("escondido", estadoMissao !== "concluida");
    }
    if (controlosFoto) {
        const quantidadeFotos = obterFotografiasDaAtividade(obterEstadoFamilia(), missao.id).length;
        controlosFoto.dataset.fotografiasAtividade = missao.id;
        controlosFoto.classList.toggle("escondido", estadoMissao !== "concluida");
        if (indicadorFotos) {
            indicadorFotos.textContent = textoIndicadorFotografias(quantidadeFotos);
        }
        if (botaoTirarFoto) {
            botaoTirarFoto.classList.toggle("escondido", estadoMissao !== "concluida" || quantidadeFotos >= MAX_FOTOGRAFIAS_POR_ATIVIDADE);
        }
        if (botaoEscolherFoto) {
            botaoEscolherFoto.classList.toggle("escondido", estadoMissao !== "concluida" || quantidadeFotos >= MAX_FOTOGRAFIAS_POR_ATIVIDADE);
        }
    }
}

function renderMissaoDestaque(estado, data) {
    const cartao = document.getElementById("missao-destaque");
    const tituloSeccao = document.getElementById("titulo-seccao-missao");
    const missoes = obterMissoesDoDia(estado, data);
    const jogo = obterJogoDoDia(estado, data);
    const atividades = jogo ? [...missoes, jogo] : missoes;

    if (tituloSeccao) {
        tituloSeccao.textContent = "Para hoje";
    }

    if (!atividades.length) {
        if (cartao) {
            cartao.classList.remove("escondido");
            cartao.textContent = "";
            const mensagem = document.createElement("p");
            mensagem.className = "mensagem-para-hoje";
            mensagem.textContent = "Não há desafios diários disponíveis para hoje.";
            cartao.appendChild(mensagem);
        }
        return;
    }

    if (!cartao) {
        return;
    }

    cartao.classList.remove("escondido");
    cartao.textContent = "";

    const lista = document.createElement("div");
    lista.className = "lista-para-hoje";

    atividades.forEach(function(atividade) {
        const concluida = atividade.estado === "concluida";
        const item = document.createElement("div");
        item.className = "atividade-para-hoje";

        const tipo = document.createElement("small");
        tipo.className = "tipo-atividade-hoje";
        const jogadorAlvo = obterNomeJogadorAlvo(atividade);
        tipo.textContent = atividade.tipo === "jogo"
            ? "🎲 JOGO"
            : jogadorAlvo ? `MISSÃO · ${jogadorAlvo}` : "MISSÃO";

        const titulo = document.createElement("h3");
        titulo.textContent = atividade.tipo === "jogo"
            ? atividade.titulo : `🌈 ${atividade.titulo}`;

        const xp = document.createElement("span");
        xp.textContent = `⭐ ${atividade.xp} XP`;

        const botao = document.createElement("button");
        botao.className = "botao-principal";
        botao.textContent = concluida ? "✓ CONCLUÍDA" : atividade.tipo === "jogo" ? "ABRIR JOGO" : "COMEÇAR";
        botao.disabled = concluida;
        botao.addEventListener("click", function() {
            if (atividade.tipo === "missao") {
                abrirMissao(atividade.id);
            } else {
                abrirJogo(atividade.id);
            }
        });

        item.appendChild(tipo);
        item.appendChild(titulo);
        item.appendChild(xp);
        item.appendChild(botao);

        if (concluida) {
            const botaoAnular = document.createElement("button");
            botaoAnular.className = "botao-secundario";
            botaoAnular.textContent = "ANULAR CONCLUSÃO";
            botaoAnular.addEventListener("click", function() {
                desfazerAtividade(atividade.id);
            });
            item.appendChild(botaoAnular);
        }

        lista.appendChild(item);
    });

    cartao.appendChild(lista);
}

function atualizarEstadoJogo() {
    const estado = obterEstadoFamilia();
    const data = dataLocalAtual();
    garantirAgendaDiaria(estado, data);

    if (verificarConquistas(estado)) {
        guardarEstadoFamilia(estado);
    }

    const atividadesConcluidas = obterAtividadesConcluidas(estado);
    const xp = calcularXP(estado);
    const nivel = obterNivelPorAtividades(atividadesConcluidas);
    const percentagem = Math.min(100, (atividadesConcluidas / META_ATIVIDADES_AVENTURA) * 100);

    const elementoXP = document.getElementById("xp-jogador");
    const elementoMedalhas = document.getElementById("medalhas-jogador");
    const elementoMissoes = document.getElementById("missoes-jogador");
    const elementoPercentagem = document.getElementById("progresso-percentagem");
    const tituloProgresso = document.getElementById("titulo-progresso");
    const barra = document.querySelector(".barra-preenchida");

    if (elementoXP) elementoXP.textContent = xp;
    if (elementoMedalhas) elementoMedalhas.textContent = contarMedalhas(estado);
    if (elementoMissoes) elementoMissoes.textContent = atividadesConcluidas;
    if (elementoPercentagem) elementoPercentagem.textContent = `${percentagem.toFixed(1)}%`;
    if (tituloProgresso) tituloProgresso.textContent = `Progresso da aventura · ${nivel.nome}`;
    if (barra) barra.style.width = `${percentagem}%`;

    renderMissaoDestaque(estado, data);
}

document.addEventListener("DOMContentLoaded", function() {
    const jogador = obterJogadorAtual();
    if (jogador) {
        preencherPerfilJogador(jogador);
    }

    atualizarEstadoJogo();
});
