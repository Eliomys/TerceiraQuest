/* TERCEIRAQUEST — melhorias consolidadas sem alterar o catálogo-base */
(function () {
    "use strict";

    const CHAVE_UNDO_RECOMECAR = "terceiraQuestUndoRecomecar";

    function temEmojiInicial(texto) {
        return /^[\p{Extended_Pictographic}\u2600-\u27BF]/u.test(String(texto || "").trim());
    }

    function iconeDoEcra(id) {
        const mapa = {
            "ecran-desafios-ferias": "🌞",
            "ecran-desafios-diarios": "🎯",
            "ecran-jogos": "🎲",
            "ecran-mapa": "📍",
            "ecran-album": "📷",
            "ecran-diario": "📖",
            "ecran-mais": "🌊"
        };
        return mapa[id] || "⭐";
    }

    function uniformizarIconesNoEcra(id) {
        const ecra = document.getElementById(id);
        if (!ecra) return;
        const icone = iconeDoEcra(id);
        ecra.querySelectorAll(".painel h3").forEach(function (h3) {
            if (h3.querySelector(".icone-categoria-tq") || temEmojiInicial(h3.textContent)) return;
            const span = document.createElement("span");
            span.className = "icone-categoria-tq";
            span.textContent = icone;
            h3.insertBefore(span, h3.firstChild);
        });
    }

    /* ---------- CONQUISTAS / MEDALHAS ---------- */
    const medalhas = [
        "var(--tq-medalha_cagarro, var(--tq-conquistas))",
        "var(--tq-medalha_golfinho, var(--tq-conquistas))",
        "var(--tq-medalha_touro_bravo, var(--tq-conquistas))",
        "var(--tq-medalha_trilhos, var(--tq-conquistas))",
        "var(--tq-medalha_terceirense, var(--tq-conquistas))",
        "var(--tq-conquistas)"
    ];

    const renderConquistasOriginal = window.renderConquistas || renderConquistas;
    window.renderConquistas = renderConquistas = function (estado) {
        const conteudo = document.getElementById("conteudo-conquistas");
        if (!conteudo) return;
        conteudo.innerHTML = "";

        catalogo.conquistas.forEach(function (conquista, indice) {
            const desbloqueada = Boolean(estado.conquistasDesbloqueadas[conquista.id]);
            const cartao = criarCartaoArea(
                conquista.titulo,
                conquista.descricao,
                desbloqueada ? "✓ Medalha conquistada" : "Por desbloquear"
            );
            cartao.classList.add("conquista-cartao");
            cartao.classList.add(desbloqueada ? "conquista-desbloqueada" : "conquista-bloqueada");

            const medalha = document.createElement("div");
            medalha.className = "medalha-conquista";
            medalha.setAttribute("aria-label", desbloqueada ? "Medalha conquistada" : "Medalha por conquistar");
            medalha.style.backgroundImage = medalhas[indice % medalhas.length];
            cartao.insertBefore(medalha, cartao.firstChild);
            conteudo.appendChild(cartao);
        });
    };

    /* ---------- RECOMEÇAR COM CONFIRMAÇÃO E ANULAR ---------- */
    function snapshotRecomeco() {
        const dados = {
            estado: localStorage.getItem(CHAVE_ESTADO_FAMILIA),
            jogador: localStorage.getItem(CHAVE_JOGADOR_ATUAL),
            temporizadores: localStorage.getItem(CHAVE_TEMPORIZADORES),
            criadoEm: Date.now()
        };
        sessionStorage.setItem(CHAVE_UNDO_RECOMECAR, JSON.stringify(dados));
    }

    function executarRecomeco() {
        snapshotRecomeco();
        const confirmarOriginal = window.confirm;
        try {
            window.confirm = function () { return true; };
            reporProgressoTeste();
        } finally {
            window.confirm = confirmarOriginal;
        }
        setTimeout(mostrarUndoRecomeco, 120);
    }

    function fecharModal() {
        const modal = document.querySelector(".tq-modal-backdrop");
        if (modal) modal.remove();
    }

    function pedirRecomeco() {
        fecharModal();
        const fundo = document.createElement("div");
        fundo.className = "tq-modal-backdrop";
        fundo.innerHTML = [
            '<div class="tq-modal" role="dialog" aria-modal="true" aria-labelledby="titulo-recomecar">',
            '<h3 id="titulo-recomecar">Recomeçar a aventura?</h3>',
            '<p>O progresso, XP, atividades e conquistas desta instalação voltam ao início. As fotografias do Álbum são mantidas.</p>',
            '<div class="tq-modal-acoes">',
            '<button type="button" class="botao-secundario tq-voltar">Voltar</button>',
            '<button type="button" class="tq-perigo tq-confirmar">Recomeçar</button>',
            '</div></div>'
        ].join("");
        document.body.appendChild(fundo);
        fundo.querySelector(".tq-voltar").addEventListener("click", fecharModal);
        fundo.querySelector(".tq-confirmar").addEventListener("click", function () {
            fecharModal();
            executarRecomeco();
        });
        fundo.addEventListener("click", function (evento) {
            if (evento.target === fundo) fecharModal();
        });
    }

    function restaurarRecomeco() {
        try {
            const dados = JSON.parse(sessionStorage.getItem(CHAVE_UNDO_RECOMECAR) || "null");
            if (!dados) return;
            if (dados.estado === null) localStorage.removeItem(CHAVE_ESTADO_FAMILIA);
            else localStorage.setItem(CHAVE_ESTADO_FAMILIA, dados.estado);
            if (dados.jogador === null) localStorage.removeItem(CHAVE_JOGADOR_ATUAL);
            else localStorage.setItem(CHAVE_JOGADOR_ATUAL, dados.jogador);
            if (dados.temporizadores === null) localStorage.removeItem(CHAVE_TEMPORIZADORES);
            else localStorage.setItem(CHAVE_TEMPORIZADORES, dados.temporizadores);
            sessionStorage.removeItem(CHAVE_UNDO_RECOMECAR);
            window.location.reload();
        } catch (erro) {
            console.warn("Não foi possível anular o recomeço.", erro);
        }
    }

    function mostrarUndoRecomeco() {
        document.querySelectorAll(".tq-undo").forEach(function (el) { el.remove(); });
        if (!sessionStorage.getItem(CHAVE_UNDO_RECOMECAR)) return;
        const barra = document.createElement("div");
        barra.className = "tq-undo";
        barra.innerHTML = '<span>A aventura recomeçou.</span><button type="button">ANULAR</button>';
        barra.querySelector("button").addEventListener("click", restaurarRecomeco);
        document.body.appendChild(barra);
        setTimeout(function () { if (barra.isConnected) barra.remove(); }, 12000);
    }

    const renderMaisOriginal = window.renderMais || renderMais;
    window.renderMais = renderMais = function () {
        renderMaisOriginal();
        const botaoAntigo = document.querySelector("#ecran-mais .botao-reset-teste");
        if (botaoAntigo) {
            const botao = botaoAntigo.cloneNode(true);
            botao.innerHTML = "RECOMEÇAR";
            botaoAntigo.replaceWith(botao);
            botao.addEventListener("click", pedirRecomeco);
        }
        const tituloFerramentas = Array.from(document.querySelectorAll("#ecran-mais .painel h3")).find(function (h) {
            return /Ferramentas de teste/i.test(h.textContent);
        });
        if (tituloFerramentas) tituloFerramentas.textContent = "Recomeçar aventura";
    };

    /* ---------- RODA COM MOVIMENTO VISÍVEL ---------- */
    function prepararRoda() {
        const conteudo = document.getElementById("conteudo-mapa");
        if (!conteudo) return;
        const paineis = Array.from(conteudo.querySelectorAll(".painel"));
        const painelRoda = paineis.find(function (p) { return /Onde vamos hoje/i.test(p.textContent); });
        if (!painelRoda || painelRoda.querySelector(".roda-visual")) return;
        const roda = document.createElement("div");
        roda.className = "roda-visual";
        const botao = painelRoda.querySelector("button");
        if (botao) painelRoda.insertBefore(roda, botao);
        else painelRoda.appendChild(roda);
    }

    window.rodarRodaMapa = rodarRodaMapa = function () {
        const resultado = document.getElementById("resultado-roda-mapa");
        const roda = document.querySelector("#ecran-mapa .roda-visual");
        const botao = Array.from(document.querySelectorAll("#ecran-mapa button")).find(function (b) { return /RODAR A RODA/i.test(b.textContent); });
        if (!resultado || !catalogo.locais.length) return;
        if (botao) botao.disabled = true;
        if (roda) {
            roda.classList.remove("a-rodar");
            void roda.offsetWidth;
            roda.classList.add("a-rodar");
        }
        resultado.textContent = "A roda está a escolher…";
        let contador = 0;
        const amostra = setInterval(function () {
            const local = catalogo.locais[contador % catalogo.locais.length];
            resultado.textContent = local.nome;
            contador += 1;
        }, 95);
        setTimeout(function () {
            clearInterval(amostra);
            const destino = escolherAleatoriamente(catalogo.locais, 1)[0];
            resultado.textContent = destino ? `Hoje vamos a: ${destino.nome}` : "";
            if (botao) botao.disabled = false;
        }, 1650);
    };

    /* ---------- LUGARES COM UM VISUAL DISTINTO POR DESTINO ---------- */
    const fundosLocais = [
        "var(--tq-aventura)", "var(--tq-natureza)", "var(--tq-snorkeling)", "var(--tq-gastronomia)",
        "var(--tq-fotografia)", "var(--tq-observacao)", "var(--tq-vamos_sair)", "var(--tq-trilhos)",
        "var(--tq-se_acontecer)", "var(--tq-criatividade)", "var(--tq-ferias)", "var(--tq-para_hoje)",
        "var(--tq-geocaching)", "var(--tq-diario)", "var(--tq-mais)"
    ];

    function decorarLocais() {
        const conteudo = document.getElementById("conteudo-mapa");
        if (!conteudo) return;
        const nomes = new Map(catalogo.locais.map(function (local, indice) { return [local.nome, indice]; }));
        Array.from(conteudo.querySelectorAll(".painel")).forEach(function (painel) {
            const h3 = painel.querySelector("h3");
            if (!h3) return;
            const nome = h3.textContent.replace(/^[^\p{L}\p{N}]+/u, "").trim();
            let indice = -1;
            nomes.forEach(function (i, n) { if (nome.includes(n) || n.includes(nome)) indice = i; });
            if (indice < 0 || painel.classList.contains("cartao-local-tq")) return;
            painel.classList.add("cartao-local-tq");
            const imagem = document.createElement("div");
            imagem.className = "imagem-local-tq";
            imagem.style.backgroundImage = fundosLocais[indice % fundosLocais.length];
            const corpo = document.createElement("div");
            corpo.className = "corpo-local-tq";
            while (painel.firstChild) corpo.appendChild(painel.firstChild);
            painel.appendChild(imagem);
            painel.appendChild(corpo);
        });
    }

    const renderMapaOriginal = window.renderMapa || renderMapa;
    window.renderMapa = renderMapa = function () {
        renderMapaOriginal();
        prepararRoda();
        decorarLocais();
        uniformizarIconesNoEcra("ecran-mapa");
    };

    /* Reaplicar melhorias quando um ecrã é renderizado */
    const abrirAreaOriginal = window.abrirArea || abrirArea;
    window.abrirArea = abrirArea = function (id) {
        abrirAreaOriginal(id);
        setTimeout(function () {
            if (id === "ecran-mapa") {
                prepararRoda();
                decorarLocais();
            }
            uniformizarIconesNoEcra(id);
        }, 0);
    };

    document.addEventListener("DOMContentLoaded", function () {
        ["ecran-desafios-ferias", "ecran-desafios-diarios", "ecran-jogos", "ecran-mapa", "ecran-album", "ecran-diario", "ecran-mais"].forEach(uniformizarIconesNoEcra);
    });
})();
