/* TERCEIRAQUEST — sexta afinação funcional */
(function(){
"use strict";

function valorImagemCSS(nome){
 return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

function moedaNovaTQ6(tipo){
 const simbolos={
  lenda:'<path d="M34 67 39 39l17 14 7-23 11 23 16-14-4 28z" fill="#e7bd4d" stroke="#fff0a7" stroke-width="2"/><path d="M36 71h50l-4 13H40z" fill="#c78b25" stroke="#f6df87" stroke-width="2"/><circle cx="39" cy="39" r="3" fill="#fff1a7"/><circle cx="63" cy="30" r="3" fill="#fff1a7"/><circle cx="90" cy="39" r="3" fill="#fff1a7"/>',
  cacadores:'<circle cx="62" cy="60" r="27" fill="#f5edd7" stroke="#d6a63c" stroke-width="3"/><path d="M62 34 70 53 90 60 70 67 62 87 54 67 34 60 54 53z" fill="#bd7d1c" stroke="#7c5010" stroke-width="1.5"/><path d="m62 39 6 18-6 3-6-3z" fill="#14475b"/><circle cx="62" cy="60" r="5" fill="#31796f" stroke="#fff" stroke-width="2"/>',
  ferias:'<circle cx="62" cy="48" r="14" fill="#efc448" stroke="#fff0a0" stroke-width="2"/><g stroke="#efc448" stroke-width="4" stroke-linecap="round"><path d="M62 25v8M62 63v8M39 48h8M77 48h8M46 32l5 6M73 58l5 6M78 32l-5 6M51 58l-5 6"/></g><path d="M31 80c9-7 18-7 28 0s19 7 32 0" fill="none" stroke="#f6eed7" stroke-width="7" stroke-linecap="round"/><path d="M35 90c8-5 16-5 24 0s17 5 28 0" fill="none" stroke="#d3a238" stroke-width="3" stroke-linecap="round"/>'
 };
 const desenho=simbolos[tipo]||simbolos.ferias;
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 124 124"><defs><radialGradient id="o" cx="32%" cy="22%"><stop offset="0" stop-color="#fff3ad"/><stop offset=".32" stop-color="#e1b44a"/><stop offset=".72" stop-color="#a96d14"/><stop offset="1" stop-color="#60400c"/></radialGradient><linearGradient id="c" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#2f837b"/><stop offset=".55" stop-color="#1e6171"/><stop offset="1" stop-color="#123f54"/></linearGradient></defs><circle cx="62" cy="62" r="57" fill="url(#o)"/><circle cx="62" cy="62" r="50" fill="#f7e39a"/><circle cx="62" cy="62" r="45" fill="url(#c)" stroke="#8b5d16" stroke-width="1.5"/><circle cx="62" cy="62" r="39" fill="none" stroke="#f4d97d" stroke-width="1.8" opacity=".85"/>${desenho}<circle cx="62" cy="62" r="54" fill="none" stroke="#fff1a4" stroke-width="1.5" opacity=".8"/></svg>`;
 return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
}

const medalhasTQ6=[
 {nome:"Cagarro",css:"--tq-medalha_cagarro"},
 {nome:"Golfinho",css:"--tq-medalha_golfinho"},
 {nome:"Touro Bravo",css:"--tq-medalha_touro_bravo"},
 {nome:"Turista",css:"--tq-medalha_turista"},
 {nome:"Terceirense",css:"--tq-medalha_terceirense"},
 {nome:"Lenda da TerceiraQuest",bg:moedaNovaTQ6("lenda")},
 {nome:"Pés na Terra",css:"--tq-medalha_trilhos"},
 {nome:"Caçadores de Tesouros",bg:moedaNovaTQ6("cacadores")},
 {nome:"Férias em Grande",bg:moedaNovaTQ6("ferias")}
];

function ganhaTQ6(c,estado){
 try{return Boolean(condicaoConquistaCumprida(c.condicao,estado));}catch(e){return Boolean(estado.conquistasDesbloqueadas&&estado.conquistasDesbloqueadas[c.id]);}
}
function fundoMedalhaTQ6(cfg){return cfg.bg||valorImagemCSS(cfg.css)||"none";}
function medalhaElTQ6(cfg){const el=document.createElement("span");el.className=cfg.bg?"medalha-nova-tq6":"medalha-bg-tq6";el.style.backgroundImage=fundoMedalhaTQ6(cfg);el.title=cfg.nome;el.setAttribute("aria-label","Medalha "+cfg.nome);return el;}

window.renderConquistas=renderConquistas=function(estado){
 const area=document.getElementById("conteudo-conquistas");if(!area)return;area.innerHTML="";
 catalogo.conquistas.forEach(function(c,i){
  const cfg=medalhasTQ6[i]||medalhasTQ6[0],ganha=ganhaTQ6(c,estado);
  const card=document.createElement("section");card.className="conquista-cartao-tq"+(ganha?" conquistada":"");
  const info=document.createElement("div");info.className="conquista-info-tq";
  const h=document.createElement("h3");h.textContent=c.titulo;
  const nome=document.createElement("small");nome.className="nome-medalha-tq3";nome.textContent="Medalha: "+cfg.nome;
  const p=document.createElement("p");p.textContent=c.descricao;
  const st=document.createElement("strong");st.className="estado-medalha-tq3";st.textContent=ganha?"✓ Conquistada":"Por conquistar";
  info.append(h,nome,p,st);card.append(medalhaElTQ6(cfg),info);area.appendChild(card);
 });
 atualizarTopoTQ6();
};

function atualizarTopoTQ6(){
 const estado=obterEstadoFamilia();let n=0,ultimo=-1;catalogo.conquistas.forEach((c,i)=>{if(ganhaTQ6(c,estado)){n++;ultimo=i;}});
 const contador=document.getElementById("medalhas-jogador");if(contador)contador.textContent=String(n);
 const estat=document.querySelector("#ecran-principal .estatistica:nth-child(2)");if(!estat)return;
 estat.querySelectorAll(".medalha-mini-tq,.medalha-mini-tq6").forEach(el=>el.remove());
 if(ultimo>=0){const mini=document.createElement("span");mini.className="medalha-mini-tq6";mini.style.backgroundImage=fundoMedalhaTQ6(medalhasTQ6[ultimo]);mini.title=medalhasTQ6[ultimo].nome;estat.insertBefore(mini,estat.firstChild);}
}

const FOTO_FORTE='https://commons.wikimedia.org/wiki/Special:Redirect/file/Forte%20de%20s%C3%A3o%20sebasti%C3%A3o%2C%20ilha%20Terceira%20A%C3%A7ores%2C%20guarita%20e%20ilh%C3%A9us%20das%20Cabras%20ao%20fundo.jpg?width=900';
function garantirForteTQ6(){
 const area=document.getElementById("conteudo-mapa");if(!area)return;
 area.querySelectorAll(".cartao-lugar-tq").forEach(function(card){
  const h=card.querySelector("h3"),foto=card.querySelector(".foto-lugar-tq");if(!h||!foto)return;
  const t=h.textContent.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
  if(t.includes("sebastiao")){foto.classList.remove("foto-lugar-pendente-tq");foto.style.backgroundImage=`url("${FOTO_FORTE}")`;}
 });
}

const abrirAnterior=window.abrirArea;
window.abrirArea=function(id){const r=abrirAnterior.apply(this,arguments);setTimeout(function(){if(id==="ecran-conquistas")renderConquistas(obterEstadoFamilia());if(id==="ecran-mapa")garantirForteTQ6();atualizarTopoTQ6();},140);return r;};
const atualizarAnterior=window.atualizarEstadoJogo;
window.atualizarEstadoJogo=function(){const r=atualizarAnterior.apply(this,arguments);setTimeout(atualizarTopoTQ6,30);return r;};
document.addEventListener("DOMContentLoaded",function(){setTimeout(atualizarTopoTQ6,180);});
})();
