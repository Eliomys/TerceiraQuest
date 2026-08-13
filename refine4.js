/* TERCEIRAQUEST — quarta afinação */
(function(){
"use strict";

const medalhasTQ4=[
 {nome:"Cagarro",classe:"medalha-cagarro-tq"},
 {nome:"Golfinho",classe:"medalha-golfinho-tq"},
 {nome:"Touro Bravo",classe:"medalha-touro-tq"},
 {nome:"Turista",classe:"medalha-turista-tq"},
 {nome:"Terceirense",classe:"medalha-terceirense-tq"},
 {nome:"Lenda da TerceiraQuest",classe:"medalha-lenda-tq"},
 {nome:"Pés na Terra",classe:"medalha-trilhos-tq"},
 {nome:"Caçadores de Tesouros",classe:"medalha-cacadores-tq"},
 {nome:"Férias em Grande",classe:"medalha-ferias-tq"}
];

function conquistaCumpridaTQ4(conquista,estado){
 try{return typeof condicaoConquistaCumprida==="function" && condicaoConquistaCumprida(conquista.condicao,estado);}catch(e){return false;}
}
function numeroMedalhasTQ4(estado){
 return catalogo.conquistas.filter(function(c){return conquistaCumpridaTQ4(c,estado);}).length;
}
function criarImagemMedalhaTQ4(cfg){
 const el=document.createElement("div");
 el.className="medalha-real-tq "+cfg.classe;
 el.title=cfg.nome;el.setAttribute("aria-label","Medalha "+cfg.nome);
 return el;
}

window.renderConquistas=renderConquistas=function(estado){
 const conteudo=document.getElementById("conteudo-conquistas");if(!conteudo)return;
 conteudo.innerHTML="";
 catalogo.conquistas.forEach(function(conquista,indice){
  const cfg=medalhasTQ4[indice]||{nome:conquista.titulo,classe:"medalha-ferias-tq"};
  const ganha=conquistaCumpridaTQ4(conquista,estado);
  const card=document.createElement("section");card.className="conquista-cartao-tq"+(ganha?" conquistada":"");
  const med=criarImagemMedalhaTQ4(cfg);
  const info=document.createElement("div");info.className="conquista-info-tq";
  const h=document.createElement("h3");h.textContent=conquista.titulo;
  const nome=document.createElement("small");nome.className="nome-medalha-tq3";nome.textContent="Medalha: "+cfg.nome;
  const p=document.createElement("p");p.textContent=conquista.descricao;
  const estadoEl=document.createElement("strong");estadoEl.className="estado-medalha-tq3";estadoEl.textContent=ganha?"✓ Conquistada":"Por conquistar";
  info.append(h,nome,p,estadoEl);card.append(med,info);conteudo.appendChild(card);
 });
 atualizarMedalhasTopoTQ4();
};

function atualizarMedalhasTopoTQ4(){
 const estado=obterEstadoFamilia();
 const n=numeroMedalhasTQ4(estado);
 const contador=document.getElementById("medalhas-jogador");if(contador)contador.textContent=String(n);
 const estat=document.querySelector("#ecran-principal .estatistica:nth-child(2)");if(!estat)return;
 let mini=estat.querySelector(".medalha-mini-tq");if(mini)mini.remove();
 if(n>0){
  let ultimo=-1;catalogo.conquistas.forEach(function(c,i){if(conquistaCumpridaTQ4(c,estado))ultimo=i;});
  const cfg=medalhasTQ4[Math.max(0,ultimo)];
  mini=document.createElement("span");mini.className="medalha-mini-tq "+cfg.classe;mini.title=cfg.nome;
  estat.insertBefore(mini,estat.firstChild);
 }
 const faixa=document.querySelector("#ecran-principal .medalha-home-tq");if(faixa)faixa.remove();
}

/* Datas visíveis sempre DD/MM/AAAA; o valor ISO interno mantém-se para a lógica. */
function formatarDatasTextoTQ4(texto){
 return String(texto||"").replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g,"$3/$2/$1");
}
function normalizarDatasVisiveisTQ4(root){
 if(!root)return;
 const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);
 const nos=[];while(walker.nextNode())nos.push(walker.currentNode);
 nos.forEach(function(n){const novo=formatarDatasTextoTQ4(n.nodeValue);if(novo!==n.nodeValue)n.nodeValue=novo;});
}
function reverDiarioTQ4(){
 const area=document.getElementById("conteudo-diario");if(!area)return;
 area.querySelectorAll(".painel").forEach(function(card){
  card.querySelectorAll("small").forEach(function(s){if(/^(Jorge|Olinda|Ema|Família)$/.test(s.textContent.trim()))s.classList.add("diario-autor-tq");});
 });
 normalizarDatasVisiveisTQ4(area);
}

/* Limpar duplicações criadas pelas camadas visuais anteriores. */
function limparMapaTQ4(){
 const area=document.getElementById("conteudo-mapa");if(!area)return;
 const rodas=area.querySelectorAll(".roda-visual-tq");rodas.forEach(function(r,i){if(i>0)r.remove();});
 const pont=area.querySelectorAll(".ponteiro-roda-tq");pont.forEach(function(r,i){if(i>0)r.remove();});
 area.querySelectorAll(".cartao-lugar-tq").forEach(function(card){const fotos=card.querySelectorAll(":scope > .foto-lugar-tq");fotos.forEach(function(f,i){if(i>0)f.remove();});});
}

/* Roda: cerca de 4 segundos, com resultado apenas quando termina. */
let rotacaoTQ4=0;
window.rodarRodaMapa=rodarRodaMapa=function(){
 limparMapaTQ4();
 const resultado=document.getElementById("resultado-roda-mapa");
 const roda=document.querySelector("#conteudo-mapa .roda-visual-tq");
 if(!resultado||!roda||!catalogo.locais.length)return;
 const destino=escolherAleatoriamente(catalogo.locais,1)[0];
 const nomes=catalogo.locais.map(function(l){return l.nome;});let i=0;
 resultado.textContent="A roda está a escolher…";
 const intervalo=setInterval(function(){resultado.textContent=nomes[i++%nomes.length];},115);
 rotacaoTQ4+=1800+Math.floor(Math.random()*720);roda.style.transform="rotate("+rotacaoTQ4+"deg)";
 setTimeout(function(){clearInterval(intervalo);resultado.textContent="Hoje vamos a: "+destino.nome;},3900);
};

const abrirAreaAnteriorTQ4=window.abrirArea;
window.abrirArea=function(id){
 const r=abrirAreaAnteriorTQ4.apply(this,arguments);
 setTimeout(function(){
  if(id==="ecran-conquistas")renderConquistas(obterEstadoFamilia());
  if(id==="ecran-mapa")limparMapaTQ4();
  if(id==="ecran-diario")reverDiarioTQ4();
  normalizarDatasVisiveisTQ4(document.getElementById(id));
  atualizarMedalhasTopoTQ4();
 },40);return r;
};

const atualizarAnteriorTQ4=window.atualizarEstadoJogo;
window.atualizarEstadoJogo=function(){const r=atualizarAnteriorTQ4.apply(this,arguments);setTimeout(function(){atualizarMedalhasTopoTQ4();normalizarDatasVisiveisTQ4(document.body);},0);return r;};

document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){atualizarMedalhasTopoTQ4();normalizarDatasVisiveisTQ4(document.body);},80);});
})();
