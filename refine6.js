/* TERCEIRAQUEST — afinação funcional consolidada */
(function(){
"use strict";

/* ---------- UTILITÁRIOS ---------- */
function normalizar(texto){return String(texto||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function formatarDatas(root){
  if(!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),lista=[];
  while(w.nextNode())lista.push(w.currentNode);
  lista.forEach(function(n){n.nodeValue=String(n.nodeValue).replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g,"$3/$2/$1");});
}

function urlRecursoCss(nome){
  const valor=getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const resultado=valor.match(/^url\(["']?(.*?)["']?\)$/);
  return resultado?resultado[1]:"";
}
function garantirImagemCabecalho(ecraId,variavelCss,alt){
  const cabecalho=document.querySelector(`#${ecraId} .cabecalho-area`);if(!cabecalho)return;
  let imagem=cabecalho.querySelector(":scope > img.imagem-cabecalho-tq");
  if(!imagem){
    imagem=document.createElement("img");imagem.className="imagem-cabecalho-tq";
    imagem.alt=alt;imagem.setAttribute("aria-hidden","true");cabecalho.appendChild(imagem);
  }
  const src=urlRecursoCss(variavelCss);if(src&&imagem.src!==src)imagem.src=src;
}
function garantirImagensEstruturais(){
  garantirImagemCabecalho("ecran-desafios-ferias","--tq-ferias","");
  garantirImagemCabecalho("ecran-mapa","--tq-natureza","");
  document.querySelectorAll("#ecran-principal .atividade-para-hoje").forEach(function(cartao){
    const tipo=cartao.querySelector(".tipo-atividade-hoje");if(!tipo||!/JOGO/i.test(tipo.textContent))return;
    let imagem=cartao.querySelector(":scope > img.imagem-jogo-dia-tq");
    if(!imagem){
      imagem=document.createElement("img");imagem.className="imagem-jogo-dia-tq";
      imagem.alt="";imagem.setAttribute("aria-hidden","true");cartao.appendChild(imagem);
    }
    const src=urlRecursoCss("--tq-jogo_do_dia");if(src&&imagem.src!==src)imagem.src=src;
  });
}

/* ---------- LUGARES + RODA ÚNICOS ----------
   Fotografias reais verificadas. Permanecem remotas nesta fase de teste;
   antes da versão final serão guardadas localmente para funcionar offline. */
const fotosLocais={
  "angra do heroismo":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=900",
  "praia da vitoria":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
  "prainha":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Ba%C3%ADa%20da%20Praia%20da%20Vit%C3%B3ria%2C%20Praia%20Grande%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
  "biscoitos":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piscinas%20naturais%20dos%20Biscoitos.jpg?width=900",
  "escaleiras":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Praia%20das%20Escaleiras%2C%20Vila%20Nova%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20terceira%2C%20A%C3%A7ores.jpg?width=900",
  "furnas do enxofre":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Furnas%20do%20Enxofre%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%203.JPG?width=900",
  "serra do cume":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Serra%20do%20Cume%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
  "monte brasil":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Monte%20Brasil%2C%20vista%20da%20cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20Ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=900",
  "lagoa das patas":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Lagoa%20das%20patas1.jpg?width=900",
  "lagoa do negro / gruta do natal":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Lagoa%20do%20Negro%2C%20Angra%20do%20Hero%C3%ADsmo%2C%20interior%20da%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal1.jpg?width=900",
  "serreta":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Farol%20da%20serreta%2C%20ilha%20Terceira%2C%20A%C3%A7ores%201.jpg?width=900",
  "fortes de sao sebastiao":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Forte%20de%20s%C3%A3o%20sebasti%C3%A3o%2C%20ilha%20Terceira%20A%C3%A7ores%2C%20guarita%20e%20ilh%C3%A9us%20das%20Cabras%20ao%20fundo.jpg?width=900",
  "forte de sao sebastiao":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Forte%20de%20s%C3%A3o%20sebasti%C3%A3o%2C%20ilha%20Terceira%20A%C3%A7ores%2C%20guarita%20e%20ilh%C3%A9us%20das%20Cabras%20ao%20fundo.jpg?width=900",
  "baias da agualva":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Baias%20de%20Agualva%20desde%20el%20miradouro%20de%20Alagoa%2C%20isla%20de%20Terceira%2C%20Azores%2C%20Portugal%2C%202020-07-25%2C%20DD%2076.jpg?width=900",
  "relheiras de sao bras":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Relheiras%20-%20S%C3%A3o%20Br%C3%A1s.jpg?width=900",
  "quatro ribeiras":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Costa%20das%20Quatro%20Ribeiras%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores.JPG?width=900"
};
function decorarLocais(){
  const area=document.getElementById("conteudo-mapa");if(!area)return;
  area.querySelectorAll(".imagem-local-tq,.roda-visual").forEach(e=>e.remove());
  Array.from(area.querySelectorAll(".painel")).forEach(function(card){
    const h=card.querySelector("h3");if(!h)return;
    const nomeLimpo=h.textContent.replace(/^\s*[^\p{L}\p{N}]+/u,"").trim();
    const local=catalogo.locais.find(l=>normalizar(l.nome)===normalizar(nomeLimpo));if(!local)return;
    card.classList.add("cartao-lugar-tq");
    let foto=card.querySelector(":scope > .foto-lugar-tq");
    if(!foto){
      const filhos=Array.from(card.childNodes),corpo=document.createElement("div");
      corpo.className="corpo-lugar-tq";filhos.forEach(f=>corpo.appendChild(f));
      foto=document.createElement("div");foto.className="foto-lugar-tq";card.append(foto,corpo);
    }
    const chave=normalizar(local.nome);
    const url=fotosLocais[chave]||(chave.includes("sebastiao")?fotosLocais["forte de sao sebastiao"]:null);
    foto.classList.toggle("foto-lugar-pendente-tq",!url);
    foto.style.backgroundImage=url?`url("${url}")`:"none";
  });
}
window.decorarLocaisTQ=decorarLocais;

/* ---------- DIÁRIO/DATAS ---------- */
function reverDiario(){
  const area=document.getElementById("conteudo-diario");if(!area)return;formatarDatas(area);
  area.querySelectorAll(".painel").forEach(card=>card.querySelectorAll(":scope > small").forEach(s=>{
    if(/^(Jorge|Olinda|Ema|Família)$/i.test(s.textContent.trim()))s.style.display="none";
  }));
}

/* ---------- GANCHOS VISUAIS SÍNCRONOS ---------- */
function temEmojiInicial(texto){return /^[\p{Extended_Pictographic}\u2600-\u27BF]/u.test(String(texto||"").trim());}
function iconeDoEcra(id){
  const mapa={"ecran-desafios-ferias":"🌞","ecran-desafios-diarios":"🎯","ecran-jogos":"🎲","ecran-mapa":"📍","ecran-album":"📷","ecran-diario":"📖","ecran-mais":"🌊"};
  return mapa[id]||"⭐";
}
function uniformizarIconesNoEcra(id){
  const ecra=document.getElementById(id);if(!ecra)return;
  const icone=iconeDoEcra(id);
  ecra.querySelectorAll(".painel h3").forEach(function(h3){
    if(h3.querySelector(".icone-categoria-tq")||temEmojiInicial(h3.textContent))return;
    const span=document.createElement("span");span.className="icone-categoria-tq";span.textContent=icone;h3.insertBefore(span,h3.firstChild);
  });
}
window.finalizarAberturaAreaTQ=function(id){
  if(id==="ecran-diario")reverDiario();
  uniformizarIconesNoEcra(id);
  formatarDatas(document.getElementById(id));
};
window.finalizarAtualizacaoVisualTQ=function(){
  garantirImagensEstruturais();
  formatarDatas(document.body);
};
})();
