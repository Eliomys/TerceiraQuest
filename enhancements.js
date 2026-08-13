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

    window.renderConquistas = renderConquistas = function (estado) {
        const conteudo = document.getElementById("conteudo-conquistas");
        if (!conteudo) return;
        conteudo.innerHTML = "";
        catalogo.conquistas.forEach(function (conquista, indice) {
            const desbloqueada = Boolean(estado.conquistasDesbloqueadas[conquista.id]);
            const cartao = criarCartaoArea(conquista.titulo, conquista.descricao,
                desbloqueada ? "✓ Medalha conquistada" : "Por desbloquear");
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
        fundo.querySelector(".tq-confirmar").addEventListener("click", function () { fecharModal(); executarRecomeco(); });
        fundo.addEventListener("click", function (evento) { if (evento.target === fundo) fecharModal(); });
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
        } catch (erro) { console.warn("Não foi possível anular o recomeço.", erro); }
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

    /* A roda e as imagens de Lugares são agora tratadas exclusivamente pelas camadas refine2+.
       As versões antigas foram removidas daqui para impedir duplicações. */
    function limparElementosAntigosMapa() {
        const conteudo = document.getElementById("conteudo-mapa");
        if (!conteudo) return;
        conteudo.querySelectorAll(".roda-visual, .imagem-local-tq").forEach(function (el) { el.remove(); });
    }

    const renderMapaOriginal = window.renderMapa || renderMapa;
    window.renderMapa = renderMapa = function () {
        renderMapaOriginal();
        limparElementosAntigosMapa();
        uniformizarIconesNoEcra("ecran-mapa");
    };

    const abrirAreaOriginal = window.abrirArea || abrirArea;
    window.abrirArea = abrirArea = function (id) {
        abrirAreaOriginal(id);
        setTimeout(function () {
            if (id === "ecran-mapa") limparElementosAntigosMapa();
            uniformizarIconesNoEcra(id);
        }, 0);
    };

    document.addEventListener("DOMContentLoaded", function () {
        ["ecran-desafios-ferias", "ecran-desafios-diarios", "ecran-jogos", "ecran-mapa", "ecran-album", "ecran-diario", "ecran-mais"].forEach(uniformizarIconesNoEcra);
    });
})();