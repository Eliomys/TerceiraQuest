/* TERCEIRAQUEST — afinação consolidada final */
(function(){
"use strict";

/* ---------- UTILITÁRIOS ---------- */
function ganhaConquista(c,estado){
  try{return Boolean(condicaoConquistaCumprida(c.condicao,estado));}
  catch(e){return Boolean(estado.conquistasDesbloqueadas&&estado.conquistasDesbloqueadas[c.id]);}
}
function normalizar(texto){return String(texto||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();}
function formatarDatas(root){
  if(!root)return;
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),lista=[];
  while(w.nextNode())lista.push(w.currentNode);
  lista.forEach(function(n){n.nodeValue=String(n.nodeValue).replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g,"$3/$2/$1");});
}

/* ---------- MEDALHAS ---------- */
function moedaSVG(tipo){
 const simbolos={
  cagarro:'<path d="M38 69c8-19 25-32 46-30-9 4-15 10-19 17 12-4 21-2 28 5-17-1-29 7-38 23-3-8-9-13-17-15z" fill="#f2efe0" stroke="#d3aa48" stroke-width="2"/><path d="M41 68c8 0 14 2 20 7" fill="none" stroke="#183f55" stroke-width="3" stroke-linecap="round"/>',
  golfinho:'<path d="M30 68c17-24 39-31 63-17-10 0-18 2-24 7 10 1 18 6 23 14-13-5-24-4-33 2-8 5-14 12-19 21-1-12-5-21-10-27z" fill="#8fd0d0" stroke="#f2e3a1" stroke-width="2"/><path d="M57 75c8 4 16 4 24 0" fill="none" stroke="#f5edd2" stroke-width="3" stroke-linecap="round"/>',
  touro:'<path d="M38 49c-10-6-16-13-18-22 10 2 18 7 24 15M82 49c10-6 16-13 18-22-10 2-18 7-24 15" fill="none" stroke="#f2d06d" stroke-width="5" stroke-linecap="round"/><path d="M39 50c7-9 35-9 42 0l-4 30-17 12-17-12z" fill="#70461a" stroke="#f1d57a" stroke-width="2"/><circle cx="50" cy="62" r="3" fill="#fff"/><circle cx="70" cy="62" r="3" fill="#fff"/>',
  turista:'<path d="M40 43h40v43H40z" rx="5" fill="#a86f30" stroke="#efd27a" stroke-width="3"/><path d="M50 43c0-12 20-12 20 0" fill="none" stroke="#f0d27b" stroke-width="4"/><path d="M40 62h40M55 43v43" stroke="#ead28a" stroke-width="2"/>',
  terceirense:'<path d="M32 74c9-22 22-34 39-36 11 5 20 17 25 36-12 8-24 12-36 12S39 82 32 74z" fill="#56a171" stroke="#eed480" stroke-width="2"/><path d="M33 72c14-9 29-11 46-6" fill="none" stroke="#b5d9df" stroke-width="5"/><circle cx="72" cy="48" r="7" fill="#f2d05d"/>',
  lenda:'<path d="M34 67 39 39l17 14 7-23 11 23 16-14-4 28z" fill="#e7bd4d" stroke="#fff0a7" stroke-width="2"/><path d="M36 71h50l-4 13H40z" fill="#c78b25" stroke="#f6df87" stroke-width="2"/>',
  trilhos:'<path d="M28 83c17-8 24-24 32-44 7 17 14 27 33 43" fill="none" stroke="#79a66e" stroke-width="8" stroke-linecap="round"/><path d="M34 83c13-7 21-18 29-37" fill="none" stroke="#ead28b" stroke-width="3" stroke-dasharray="5 5"/>',
  cacadores:'<circle cx="62" cy="60" r="27" fill="#f5edd7" stroke="#d6a63c" stroke-width="3"/><path d="M62 34 70 53 90 60 70 67 62 87 54 67 34 60 54 53z" fill="#bd7d1c" stroke="#7c5010" stroke-width="1.5"/><circle cx="62" cy="60" r="5" fill="#31796f" stroke="#fff" stroke-width="2"/>',
  ferias:'<circle cx="62" cy="48" r="14" fill="#efc448" stroke="#fff0a0" stroke-width="2"/><g stroke="#efc448" stroke-width="4" stroke-linecap="round"><path d="M62 25v8M62 63v8M39 48h8M77 48h8M46 32l5 6M73 58l5 6M78 32l-5 6M51 58l-5 6"/></g><path d="M31 80c9-7 18-7 28 0s19 7 32 0" fill="none" stroke="#f6eed7" stroke-width="7" stroke-linecap="round"/>'
 };
 const desenho=simbolos[tipo]||simbolos.ferias;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124"><defs><radialGradient id="o" cx="32%" cy="22%"><stop offset="0" stop-color="#fff3ad"/><stop offset=".32" stop-color="#e1b44a"/><stop offset=".72" stop-color="#a96d14"/><stop offset="1" stop-color="#60400c"/></radialGradient><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2f837b"/><stop offset=".55" stop-color="#1e6171"/><stop offset="1" stop-color="#123f54"/></linearGradient></defs><circle cx="62" cy="62" r="57" fill="url(#o)"/><circle cx="62" cy="62" r="50" fill="#f7e39a"/><circle cx="62" cy="62" r="45" fill="url(#c)" stroke="#8b5d16" stroke-width="1.5"/><circle cx="62" cy="62" r="39" fill="none" stroke="#f4d97d" stroke-width="1.8" opacity=".85"/>${desenho}<circle cx="62" cy="62" r="54" fill="none" stroke="#fff1a4" stroke-width="1.5" opacity=".8"/></svg>`;
 return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
}
const medalhas=[
 {nome:"Cagarro",bg:moedaSVG("cagarro")},{nome:"Golfinho",bg:moedaSVG("golfinho")},{nome:"Touro Bravo",bg:moedaSVG("touro")},
 {nome:"Turista",bg:moedaSVG("turista")},{nome:"Terceirense",bg:moedaSVG("terceirense")},{nome:"Lenda da TerceiraQuest",bg:moedaSVG("lenda")},
 {nome:"Pés na Terra",bg:moedaSVG("trilhos")},{nome:"Caçadores de Tesouros",bg:moedaSVG("cacadores")},{nome:"Férias em Grande",bg:moedaSVG("ferias")}
];
function medalhaEl(cfg,classe){const el=document.createElement("span");el.className=classe||"medalha-final";el.style.backgroundImage=cfg.bg;el.title=cfg.nome;return el;}
window.renderConquistas=renderConquistas=function(estado){
 const area=document.getElementById("conteudo-conquistas");if(!area)return;area.innerHTML="";
 catalogo.conquistas.forEach(function(c,i){
  const cfg=medalhas[i],ganha=ganhaConquista(c,estado),card=document.createElement("section");
  card.className="conquista-cartao-tq"+(ganha?" conquistada":"");
  const info=document.createElement("div");info.className="conquista-info-tq";
  const h=document.createElement("h3");h.textContent=c.titulo;
  const nome=document.createElement("small");nome.className="nome-medalha-tq3";nome.textContent="Medalha: "+cfg.nome;
  const p=document.createElement("p");p.textContent=c.descricao;
  const st=document.createElement("strong");st.className="estado-medalha-tq3";st.textContent=ganha?"✓ Conquistada":"Por conquistar";
  info.append(h,nome,p,st);card.append(medalhaEl(cfg),info);area.appendChild(card);
 });
 atualizarMedalhaHome();
};
function atualizarMedalhaHome(){
 const estado=obterEstadoFamilia();let total=0,ultima=-1;
 catalogo.conquistas.forEach((c,i)=>{if(ganhaConquista(c,estado)){total++;ultima=i;}});
 const n=document.getElementById("medalhas-jogador");if(n)n.textContent=String(total);
 const caixa=document.querySelector("#ecran-principal .estatistica:nth-child(2)");if(!caixa)return;
 caixa.querySelectorAll(".medalha-mini-final,.medalha-mini-tq,.medalha-mini-tq6").forEach(e=>e.remove());
 if(ultima>=0)caixa.insertBefore(medalhaEl(medalhas[ultima],"medalha-mini-final"),caixa.firstChild);
}

/* ---------- LUGARES + RODA ÚNICOS ---------- */
const fotosLocais={
 "angra do heroismo":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=900",
 "praia da vitoria":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
 "prainha":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Ba%C3%ADa%20da%20Praia%20da%20Vit%C3%B3ria%2C%20Praia%20Grande%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
 "biscoitos":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piscinas%20naturais%20dos%20Biscoitos.jpg?width=900",
 "furnas do enxofre":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Furnas%20do%20Enxofre%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%203.JPG?width=900",
 "serra do cume":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Serra%20do%20Cume%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
 "monte brasil":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Monte%20Brasil%2C%20vista%20da%20cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20Ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=900",
 "lagoa das patas":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Lagoa%20das%20patas1.jpg?width=900",
 "fortes de sao sebastiao":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Forte%20de%20s%C3%A3o%20sebasti%C3%A3o%2C%20ilha%20Terceira%20A%C3%A7ores%2C%20guarita%20e%20ilh%C3%A9us%20das%20Cabras%20ao%20fundo.jpg?width=900",
 "forte de sao sebastiao":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Forte%20de%20s%C3%A3o%20sebasti%C3%A3o%2C%20ilha%20Terceira%20A%C3%A7ores%2C%20guarita%20e%20ilh%C3%A9us%20das%20Cabras%20ao%20fundo.jpg?width=900",
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
  if(!foto){const filhos=Array.from(card.childNodes),corpo=document.createElement("div");corpo.className="corpo-lugar-tq";filhos.forEach(f=>corpo.appendChild(f));foto=document.createElement("div");foto.className="foto-lugar-tq";card.append(foto,corpo);}
  const chave=normalizar(local.nome);const url=fotosLocais[chave]||(chave.includes("sebastiao")?fotosLocais["forte de sao sebastiao"]:null);
  foto.classList.toggle("foto-lugar-pendente-tq",!url);foto.style.backgroundImage=url?`url("${url}")`:"none";
 });
}
let rotacao=0;
function garantirRoda(){
 const area=document.getElementById("conteudo-mapa"),resultado=document.getElementById("resultado-roda-mapa");if(!area||!resultado)return null;
 const painel=resultado.closest(".painel");if(!painel)return null;
 painel.querySelectorAll(".roda-visual,.roda-visual-tq,.ponteiro-roda-tq").forEach(e=>e.remove());
 const botao=Array.from(painel.querySelectorAll("button")).find(b=>/RODAR/i.test(b.textContent));
 const ponteiro=document.createElement("div");ponteiro.className="ponteiro-roda-tq";
 const roda=document.createElement("div");roda.className="roda-visual-tq";
 if(botao){painel.insertBefore(ponteiro,botao);painel.insertBefore(roda,botao);}else painel.insertBefore(roda,resultado);
 return roda;
}
window.rodarRodaMapa=rodarRodaMapa=function(){
 const resultado=document.getElementById("resultado-roda-mapa"),painel=resultado&&resultado.closest(".painel"),roda=painel&&painel.querySelector(".roda-visual-tq");
 if(!resultado||!roda||!catalogo.locais.length)return;
 const botao=Array.from(painel.querySelectorAll("button")).find(b=>/RODAR/i.test(b.textContent));if(botao)botao.disabled=true;
 const destino=escolherAleatoriamente(catalogo.locais,1)[0],nomes=catalogo.locais.map(l=>l.nome);let i=0;
 resultado.textContent="A roda está a escolher…";const intervalo=setInterval(()=>{resultado.textContent=nomes[i++%nomes.length];},105);
 rotacao+=2160+Math.floor(Math.random()*900);roda.style.transform=`rotate(${rotacao}deg)`;
 setTimeout(()=>{clearInterval(intervalo);resultado.textContent="Hoje vamos a: "+destino.nome;if(botao)botao.disabled=false;},4000);
};

/* ---------- DIÁRIO/DATAS ---------- */
function reverDiario(){
 const area=document.getElementById("conteudo-diario");if(!area)return;formatarDatas(area);
 area.querySelectorAll(".painel").forEach(card=>card.querySelectorAll(":scope > small").forEach(s=>{if(/^(Jorge|Olinda|Ema|Família)$/i.test(s.textContent.trim()))s.style.display="none";}));
}

/* ---------- GANCHOS ÚNICOS ---------- */
const abrirOriginal=window.abrirArea;
window.abrirArea=function(id){const r=abrirOriginal.apply(this,arguments);setTimeout(function(){
 if(id==="ecran-conquistas")renderConquistas(obterEstadoFamilia());
 if(id==="ecran-mapa"){decorarLocais();garantirRoda();}
 if(id==="ecran-diario")reverDiario();
 formatarDatas(document.getElementById(id));atualizarMedalhaHome();
},80);return r;};
const atualizarOriginal=window.atualizarEstadoJogo;
window.atualizarEstadoJogo=function(){const r=atualizarOriginal.apply(this,arguments);setTimeout(()=>{atualizarMedalhaHome();formatarDatas(document.body);},20);return r;};
document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{atualizarMedalhaHome();formatarDatas(document.body);},100));
})();
