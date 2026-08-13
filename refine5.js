/* TERCEIRAQUEST — quinta afinação funcional/visual */
(function(){
"use strict";

function srcDaVariavelCSS(nome){
  const valor=getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
  const m=valor.match(/^url\((?:"|')?(.*?)(?:"|')?\)$/);
  return m&&m[1]?m[1]:null;
}

function svgMoeda(tipo){
  const baseInicio=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><defs><radialGradient id="ouro" cx="35%" cy="25%"><stop offset="0" stop-color="#fff0a6"/><stop offset=".28" stop-color="#e2b64e"/><stop offset=".72" stop-color="#b77a18"/><stop offset="1" stop-color="#70460b"/></radialGradient><linearGradient id="campo" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2c7b83"/><stop offset="1" stop-color="#123f54"/></linearGradient><filter id="s"><feDropShadow dx="0" dy="3" stdDeviation="2.5" flood-opacity=".28"/></filter></defs><circle cx="60" cy="60" r="55" fill="url(#ouro)" filter="url(#s)"/><circle cx="60" cy="60" r="47" fill="#f8e8a6"/><circle cx="60" cy="60" r="42" fill="url(#campo)" stroke="#d6aa3d" stroke-width="2"/><circle cx="60" cy="60" r="35" fill="none" stroke="#f5dc85" stroke-width="1.6" opacity=".65"/>`;
  const fim=`<circle cx="60" cy="60" r="52" fill="none" stroke="#fff2b5" stroke-width="1.4" opacity=".7"/></svg>`;
  let desenho="";
  if(tipo==="lenda"){
    desenho=`<path d="M31 69h58l-5 17H36z" fill="#d6a83c" stroke="#fff0aa" stroke-width="2"/><path d="M34 64 39 38l17 14 7-22 10 22 16-14-3 26z" fill="#edc65c" stroke="#fff0aa" stroke-width="2"/><circle cx="39" cy="38" r="3.5" fill="#f7e7a0"/><circle cx="63" cy="30" r="3.5" fill="#f7e7a0"/><circle cx="89" cy="38" r="3.5" fill="#f7e7a0"/><path d="M43 76h34" stroke="#123f54" stroke-width="3" stroke-linecap="round"/>`;
  } else if(tipo==="cacadores"){
    desenho=`<circle cx="60" cy="60" r="24" fill="#f4ead1" stroke="#d6a83c" stroke-width="3"/><path d="M60 34 68 53 88 60 68 67 60 88 52 67 32 60 52 53z" fill="#c68725" stroke="#8a5812" stroke-width="1.5"/><path d="m60 40 6 17-6 3-6-3z" fill="#123f54"/><circle cx="60" cy="60" r="5" fill="#2a6f74" stroke="#fff" stroke-width="2"/><circle cx="60" cy="60" r="29" fill="none" stroke="#fff1ac" stroke-width="1.5" stroke-dasharray="2 5"/>`;
  } else {
    desenho=`<circle cx="60" cy="48" r="15" fill="#f1c94f" stroke="#fff0a6" stroke-width="2"/><g stroke="#f1c94f" stroke-width="4" stroke-linecap="round"><path d="M60 24v7M60 65v7M36 48h7M77 48h7M43 31l5 5M72 60l5 5M77 31l-5 5M48 60l-5 5"/></g><path d="M27 80c10-8 20-8 31 0s21 8 35 0" fill="none" stroke="#f4eee0" stroke-width="7" stroke-linecap="round"/><path d="M31 89c9-6 18-6 27 0s18 6 31 0" fill="none" stroke="#d6aa3d" stroke-width="3" stroke-linecap="round"/>`;
  }
  return "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(baseInicio+desenho+fim);
}

const medalhasTQ5=[
 {nome:"Cagarro",varCSS:"--tq-medalha_cagarro"},
 {nome:"Golfinho",varCSS:"--tq-medalha_golfinho"},
 {nome:"Touro Bravo",varCSS:"--tq-medalha_touro_bravo"},
 {nome:"Turista",varCSS:"--tq-medalha_turista"},
 {nome:"Terceirense",varCSS:"--tq-medalha_terceirense"},
 {nome:"Lenda da TerceiraQuest",src:svgMoeda("lenda")},
 {nome:"Pés na Terra",varCSS:"--tq-medalha_trilhos"},
 {nome:"Caçadores de Tesouros",src:svgMoeda("cacadores")},
 {nome:"Férias em Grande",src:svgMoeda("ferias")}
];

function conquistaGanhaTQ5(c,estado){
 try{return Boolean(condicaoConquistaCumprida(c.condicao,estado));}catch(e){return Boolean(estado.conquistasDesbloqueadas&&estado.conquistasDesbloqueadas[c.id]);}
}
function srcMedalhaTQ5(cfg){return cfg.src||srcDaVariavelCSS(cfg.varCSS)||"";}
function imagemMedalhaTQ5(cfg,classe){
 const img=document.createElement("img");img.className=classe||"medalha-img-tq5";img.alt="Medalha "+cfg.nome;img.title=cfg.nome;
 const src=srcMedalhaTQ5(cfg);if(src)img.src=src;return img;
}
function numeroMedalhasTQ5(estado){return catalogo.conquistas.filter(c=>conquistaGanhaTQ5(c,estado)).length;}

window.renderConquistas=renderConquistas=function(estado){
 const conteudo=document.getElementById("conteudo-conquistas");if(!conteudo)return;conteudo.innerHTML="";
 catalogo.conquistas.forEach(function(c,indice){
  const cfg=medalhasTQ5[indice]||medalhasTQ5[0],ganha=conquistaGanhaTQ5(c,estado);
  const card=document.createElement("section");card.className="conquista-cartao-tq"+(ganha?" conquistada":"");
  const med=imagemMedalhaTQ5(cfg,cfg.src?"medalha-svg-tq5":"medalha-img-tq5");
  const info=document.createElement("div");info.className="conquista-info-tq";
  const h=document.createElement("h3");h.textContent=c.titulo;
  const nome=document.createElement("small");nome.className="nome-medalha-tq3";nome.textContent="Medalha: "+cfg.nome;
  const p=document.createElement("p");p.textContent=c.descricao;
  const est=document.createElement("strong");est.className="estado-medalha-tq3";est.textContent=ganha?"✓ Conquistada":"Por conquistar";
  info.append(h,nome,p,est);card.append(med,info);conteudo.appendChild(card);
 });
 atualizarTopoMedalhasTQ5();
};

function atualizarTopoMedalhasTQ5(){
 const estado=obterEstadoFamilia(),n=numeroMedalhasTQ5(estado),contador=document.getElementById("medalhas-jogador");
 if(contador)contador.textContent=String(n);
 const estat=document.querySelector("#ecran-principal .estatistica:nth-child(2)");if(!estat)return;
 estat.querySelectorAll(".medalha-mini-tq").forEach(el=>el.remove());
 if(n){let ultimo=0;catalogo.conquistas.forEach((c,i)=>{if(conquistaGanhaTQ5(c,estado))ultimo=i;});const cfg=medalhasTQ5[ultimo];
  const box=document.createElement("span");box.className="medalha-mini-tq";box.appendChild(imagemMedalhaTQ5(cfg,""));estat.insertBefore(box,estat.firstChild);
 }
 const faixa=document.querySelector("#ecran-principal .medalha-home-tq");if(faixa)faixa.remove();
}

function limparDuplicadosMapaTQ5(){
 const area=document.getElementById("conteudo-mapa");if(!area)return;
 area.querySelectorAll(".roda-visual,.imagem-local-tq").forEach(el=>el.remove());
 const rodas=area.querySelectorAll(".roda-visual-tq");rodas.forEach((r,i)=>{if(i)r.remove();});
 const ponteiros=area.querySelectorAll(".ponteiro-roda-tq");ponteiros.forEach((p,i)=>{if(i)p.remove();});
 area.querySelectorAll(".cartao-lugar-tq").forEach(card=>{const fotos=card.querySelectorAll(":scope > .foto-lugar-tq");fotos.forEach((f,i)=>{if(i)f.remove();});});
}

function reverDiarioTQ5(){
 const area=document.getElementById("conteudo-diario");if(!area)return;
 area.querySelectorAll(".painel").forEach(function(card){
  card.querySelectorAll(":scope > small").forEach(s=>{if(/^(Jorge|Olinda|Ema|Família)$/i.test(s.textContent.trim()))s.classList.add("diario-autor-tq5");});
  const h=card.querySelector("h3");if(h&&!h.dataset.formatadoTq5){
   const texto=h.textContent.trim();const m=texto.match(/^(\d{2}\/\d{2}\/\d{4})\s*[·\-]\s*(.*)$/);
   if(m){h.textContent="";const data=document.createElement("span");data.className="data-diario-tq5";data.textContent=m[1];const titulo=document.createElement("span");titulo.className="titulo-diario-tq5";titulo.textContent=m[2];h.append(data,titulo);}
   h.dataset.formatadoTq5="1";
  }
 });
}

function normalizarDatasTQ5(root){
 if(!root)return;const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);const lista=[];while(walker.nextNode())lista.push(walker.currentNode);
 lista.forEach(n=>{n.nodeValue=String(n.nodeValue).replace(/\b(\d{4})-(\d{2})-(\d{2})\b/g,"$3/$2/$1");});
}

const abrirAreaTQ5=window.abrirArea;
window.abrirArea=function(id){const r=abrirAreaTQ5.apply(this,arguments);setTimeout(function(){
 if(id==="ecran-conquistas")renderConquistas(obterEstadoFamilia());
 if(id==="ecran-mapa")limparDuplicadosMapaTQ5();
 normalizarDatasTQ5(document.getElementById(id));if(id==="ecran-diario")reverDiarioTQ5();atualizarTopoMedalhasTQ5();
},80);return r;};

const atualizarTQ5=window.atualizarEstadoJogo;
window.atualizarEstadoJogo=function(){const r=atualizarTQ5.apply(this,arguments);setTimeout(function(){normalizarDatasTQ5(document.body);atualizarTopoMedalhasTQ5();},20);return r;};

let normalizarPendente=false;
const observador=new MutationObserver(function(){if(normalizarPendente)return;normalizarPendente=true;setTimeout(function(){normalizarPendente=false;normalizarDatasTQ5(document.body);},60);});

document.addEventListener("DOMContentLoaded",function(){setTimeout(function(){normalizarDatasTQ5(document.body);atualizarTopoMedalhasTQ5();observador.observe(document.body,{childList:true,subtree:true,characterData:true});},120);});
})();
