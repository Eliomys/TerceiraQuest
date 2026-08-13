/* TERCEIRAQUEST — segunda afinação funcional/visual */
(function(){
"use strict";

const medalhasTQ = [
  {nome:"Cagarro", imagem:"var(--tq-medalha_cagarro)", simbolo:"🐦"},
  {nome:"Golfinho", imagem:"var(--tq-medalha_golfinho)", simbolo:"🐬"},
  {nome:"Touro Bravo", imagem:"var(--tq-medalha_touro_bravo)", simbolo:"🐂"},
  {nome:"Turista", imagem:"var(--tq-medalha_turista)", simbolo:"🧳"},
  {nome:"Terceirense", imagem:"var(--tq-medalha_terceirense)", simbolo:"🏝️"},
  {nome:"Lenda da TerceiraQuest", simbolo:"👑"},
  {nome:"Pés na Terra", imagem:"var(--tq-medalha_trilhos)", simbolo:"🥾"},
  {nome:"Caçadores de Tesouros", simbolo:"🧭"},
  {nome:"Férias em Grande", simbolo:"🌞"}
];

function contarMedalhas(estado){
  return Object.values((estado && estado.conquistasDesbloqueadas)||{}).filter(Boolean).length;
}
function sincronizarMedalhas(){
  const el=document.getElementById("medalhas-jogador");
  if(el) el.textContent=String(contarMedalhas(obterEstadoFamilia()));
}

/* medalhas: nove conquistas, nove identidades visuais, nome sempre visível */
window.renderConquistas = renderConquistas = function(estado){
  const conteudo=document.getElementById("conteudo-conquistas");
  if(!conteudo) return;
  conteudo.innerHTML="";
  catalogo.conquistas.forEach(function(conquista,indice){
    const cfg=medalhasTQ[indice]||{nome:conquista.titulo,simbolo:"⭐"};
    const desbloqueada=Boolean(estado.conquistasDesbloqueadas[conquista.id]);
    const cartao=document.createElement("section");
    cartao.className="painel conquista-cartao "+(desbloqueada?"conquista-desbloqueada":"conquista-bloqueada");

    const medalha=document.createElement("div");
    medalha.className="medalha-conquista";
    if(cfg.imagem){ medalha.style.backgroundImage=cfg.imagem; }
    else { medalha.classList.add("medalha-css-tq"); medalha.dataset.simbolo=cfg.simbolo; }
    medalha.title=cfg.nome;

    const titulo=document.createElement("h3"); titulo.textContent=conquista.titulo;
    const nome=document.createElement("small"); nome.className="nome-medalha-tq"; nome.textContent="Medalha · "+cfg.nome;
    const desc=document.createElement("p"); desc.textContent=conquista.descricao;
    const estadoEl=document.createElement("strong"); estadoEl.className="estado-medalha-tq";
    estadoEl.textContent=desbloqueada?"✓ Medalha conquistada":"Por desbloquear";

    cartao.append(medalha,titulo,nome,desc,estadoEl);
    conteudo.appendChild(cartao);
  });
  sincronizarMedalhas();
};

/* sistema de ícones: depende do tipo do desafio; deixa de repetir o sol */
function simboloParaTitulo(texto,ecraId){
  const t=String(texto||"").toLowerCase();
  if(/ave|pássaro|cagarro/.test(t)) return "🐦";
  if(/mar|poça|snorkel|mergulho|água|praia/.test(t)) return "🌊";
  if(/foto|fotograf|imagem/.test(t)) return "📷";
  if(/comer|provar|receita|gelado|esbá|batata|almoç/.test(t)) return "🍴";
  if(/caminh|passeio|trilho|andar/.test(t)) return "🥾";
  if(/desen|invent|história|criar|bandeira/.test(t)) return "✏️";
  if(/cache|geocach|tesouro/.test(t)) return "🧭";
  if(/igreja|forte|brasão|império|monumento/.test(t)) return "🏛️";
  if(/jogo|imitar|pergunta|palavra/.test(t)) return "🎲";
  if(ecraId==="ecran-desafios-ferias") return "🌴";
  if(ecraId==="ecran-desafios-diarios") return "🎯";
  if(ecraId==="ecran-mapa") return "📍";
  return "◆";
}
function aplicarIcones(ecraId){
  const ecra=document.getElementById(ecraId); if(!ecra) return;
  ecra.querySelectorAll(".painel h3").forEach(function(h3){
    const antigo=h3.querySelector(".icone-desafio-tq"); if(antigo) antigo.remove();
    const span=document.createElement("span"); span.className="icone-desafio-tq";
    span.textContent=simboloParaTitulo(h3.textContent,ecraId);
    h3.prepend(span);
  });
}

/* fotografias reais/licenciadas dos lugares. Se não houver fonte confirmada, não se inventa imagem. */
const fotosLocais={
 "Angra do Heroísmo":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=800",
 "Praia da Vitória":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=800",
 "Prainha":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Ba%C3%ADa%20da%20Praia%20da%20Vit%C3%B3ria%2C%20Praia%20Grande%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=800",
 "Biscoitos":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piscinas%20naturais%20dos%20Biscoitos.jpg?width=800",
 "Furnas do Enxofre":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Furnas%20do%20Enxofre%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%203.JPG?width=800",
 "Serra do Cume":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Serra%20do%20Cume%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=800",
 "Monte Brasil":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Monte%20Brasil%2C%20vista%20da%20cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20Ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=800",
 "Lagoa das Patas":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Lagoa%20das%20patas1.jpg?width=800",
 "Lagoa do Negro / Gruta do Natal":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Gruta%20do%20Natal%20-%20Ilha%20Terceira%20-%20Portugal%20(2496741265).jpg?width=800",
 "Fortes de São Sebastião":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Forte%20de%20s%C3%A3o%20sebasti%C3%A3o%2C%20ilha%20Terceira%20A%C3%A7ores%2C%20guarita%20e%20ilh%C3%A9us%20das%20Cabras%20ao%20fundo.jpg?width=800",
 "Quatro Ribeiras":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Costa%20das%20Quatro%20Ribeiras%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores.JPG?width=800"
};

function decorarLocais(){
  const conteudo=document.getElementById("conteudo-mapa"); if(!conteudo) return;
  Array.from(conteudo.querySelectorAll(".painel")).forEach(function(cartao){
    const h3=cartao.querySelector("h3"); if(!h3) return;
    const nome=h3.textContent.replace(/^\s*[\p{Extended_Pictographic}\u2600-\u27BF◆]+\s*/u,"").trim();
    if(!catalogo.locais.some(function(l){return l.nome===nome;})) return;
    cartao.classList.add("cartao-lugar-tq");
    if(cartao.querySelector(".foto-lugar-tq")) return;
    const filhos=Array.from(cartao.childNodes);
    const corpo=document.createElement("div"); corpo.className="corpo-lugar-tq";
    filhos.forEach(function(f){corpo.appendChild(f);});
    const foto=document.createElement("div"); foto.className="foto-lugar-tq";
    if(fotosLocais[nome]) foto.style.backgroundImage='url("'+fotosLocais[nome]+'")';
    else { foto.classList.add("foto-lugar-pendente-tq"); foto.dataset.local=nome; }
    cartao.append(foto,corpo);
  });
  aplicarIcones("ecran-mapa");
}

/* roda visual: rotação física + nomes a passar até ao resultado */
let rotacaoRodaTQ=0;
function garantirRodaVisual(){
  const resultado=document.getElementById("resultado-roda-mapa"); if(!resultado) return null;
  const painel=resultado.closest(".painel"); if(!painel) return null;
  let roda=painel.querySelector(".roda-visual-tq");
  if(!roda){
    const ponteiro=document.createElement("div"); ponteiro.className="ponteiro-roda-tq";
    roda=document.createElement("div"); roda.className="roda-visual-tq";
    const botao=Array.from(painel.querySelectorAll("button")).find(function(b){return /RODAR/.test(b.textContent);});
    if(botao) painel.insertBefore(ponteiro,botao);
    if(botao) painel.insertBefore(roda,botao); else painel.insertBefore(roda,resultado);
  }
  return roda;
}
window.rodarRodaMapa = rodarRodaMapa = function(){
  const resultado=document.getElementById("resultado-roda-mapa");
  const roda=garantirRodaVisual();
  if(!resultado||!roda||!catalogo.locais.length) return;
  const destino=escolherAleatoriamente(catalogo.locais,1)[0];
  const nomes=catalogo.locais.map(function(l){return l.nome;});
  let i=0; resultado.textContent="A roda está a escolher…";
  const intervalo=setInterval(function(){resultado.textContent=nomes[i%nomes.length]; i++;},90);
  rotacaoRodaTQ += 1440 + Math.floor(Math.random()*540);
  roda.style.transform="rotate("+rotacaoRodaTQ+"deg)";
  setTimeout(function(){clearInterval(intervalo); resultado.textContent="Hoje vamos a: "+destino.nome;},1900);
};

function decorarRoda(){ garantirRodaVisual(); }

/* aplicar depois dos renderizadores existentes */
const abrirAreaAnterior=window.abrirArea;
window.abrirArea=function(id){
  const r=abrirAreaAnterior.apply(this,arguments);
  setTimeout(function(){
    aplicarIcones(id);
    if(id==="ecran-mapa"){decorarRoda();decorarLocais();}
    if(id==="ecran-conquistas") renderConquistas(obterEstadoFamilia());
    sincronizarMedalhas();
  },0);
  return r;
};

const atualizarAnterior=window.atualizarEstadoJogo;
window.atualizarEstadoJogo=function(){
  const r=atualizarAnterior.apply(this,arguments);
  sincronizarMedalhas();
  return r;
};

document.addEventListener("DOMContentLoaded",function(){
  sincronizarMedalhas();
  ["ecran-desafios-ferias","ecran-desafios-diarios","ecran-jogos"].forEach(aplicarIcones);
});
})();
