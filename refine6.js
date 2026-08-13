/* TERCEIRAQUEST — afinação funcional consolidada */
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
function valorImagemCSS(nome){
  if(!nome)return "";
  return getComputedStyle(document.documentElement).getPropertyValue(nome).trim();
}

/* ---------- MEDALHAS ----------
   As seis medalhas aprovadas usam diretamente as imagens incorporadas
   na biblioteca visual oficial. As três ainda sem imagem oficial usam
   um fallback simples, sem fingir que são medalhas aprovadas. */
const medalhas=[
  {nome:"Cagarro",css:"--tq-medalha_cagarro"},
  {nome:"Golfinho",css:"--tq-medalha_golfinho"},
  {nome:"Touro Bravo",css:"--tq-medalha_touro_bravo"},
  {nome:"Turista",css:"--tq-medalha_turista"},
  {nome:"Terceirense",css:"--tq-medalha_terceirense"},
  {nome:"Lenda da TerceiraQuest",fallback:true},
  {nome:"Pés na Terra",css:"--tq-medalha_trilhos"},
  {nome:"Caçadores de Tesouros",fallback:true},
  {nome:"Férias em Grande",fallback:true}
];
function imagemMedalha(cfg){
  const valor=cfg&&cfg.css?valorImagemCSS(cfg.css):"";
  return valor&&valor!=="none"?valor:"";
}
function medalhaEl(cfg,classe){
  const el=document.createElement("span");
  const imagem=imagemMedalha(cfg);
  el.className=classe||"medalha-final";
  el.title=cfg.nome;
  el.setAttribute("aria-label","Medalha "+cfg.nome);
  if(imagem){
    el.style.backgroundImage=imagem;
  }else{
    el.classList.add("medalha-fallback-final");
    el.textContent="★";
  }
  return el;
}
window.renderConquistas=renderConquistas=function(estado){
  const area=document.getElementById("conteudo-conquistas");if(!area)return;area.innerHTML="";
  catalogo.conquistas.forEach(function(c,i){
    const cfg=medalhas[i]||{nome:c.titulo,fallback:true};
    const ganha=ganhaConquista(c,estado),card=document.createElement("section");
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
  if(ultima>=0)caixa.insertBefore(medalhaEl(medalhas[ultima]||{nome:"Conquista",fallback:true},"medalha-mini-final"),caixa.firstChild);
}

/* ---------- LUGARES + RODA ÚNICOS ----------
   As fotografias abaixo são a solução atualmente existente. Mantêm-se
   até serem substituídas por ficheiros locais verificados para o offline. */
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
let rotacao=0;
function garantirRoda(){
  const area=document.getElementById("conteudo-mapa"),resultado=document.getElementById("resultado-roda-mapa");if(!area||!resultado)return null;
  const painel=resultado.closest(".painel");if(!painel)return null;
  painel.querySelectorAll(".roda-visual,.roda-visual-tq,.ponteiro-roda-tq").forEach(e=>e.remove());
  const botao=Array.from(painel.querySelectorAll("button")).find(b=>/RODAR/i.test(b.textContent));
  const ponteiro=document.createElement("div");ponteiro.className="ponteiro-roda-tq";
  const roda=document.createElement("div");roda.className="roda-visual-tq";
  if(botao){painel.insertBefore(ponteiro,botao);painel.insertBefore(roda,botao);}else{painel.append(ponteiro,roda);}
  for(let i=0;i<12;i++){
    const ponto=document.createElement("span");ponto.className="roda-ponto-tq";
    const a=(i/12)*Math.PI*2-Math.PI/2,r=94;
    ponto.style.left=`calc(50% + ${Math.cos(a)*r}px)`;ponto.style.top=`calc(50% + ${Math.sin(a)*r}px)`;roda.appendChild(ponto);
  }
  window.rodarRodaMapa=function(){
    const estado=obterEstadoFamilia();
    const disponiveis=catalogo.locais.filter(l=>!estado.locaisConcluidos||!estado.locaisConcluidos[l.id]);
    if(!disponiveis.length){resultado.textContent="Todos os locais já foram concluídos.";return;}
    const destino=disponiveis[Math.floor(Math.random()*disponiveis.length)];
    if(botao)botao.disabled=true;resultado.textContent="A roda está a escolher…";
    let i=0;const intervalo=setInterval(()=>{resultado.textContent=disponiveis[i++%disponiveis.length].nome;},115);
    rotacao+=2160+Math.floor(Math.random()*900);roda.style.transform=`rotate(${rotacao}deg)`;
    setTimeout(()=>{clearInterval(intervalo);resultado.textContent="Hoje vamos a: "+destino.nome;if(botao)botao.disabled=false;},4000);
  };
  return roda;
}

/* ---------- DIÁRIO/DATAS ---------- */
function reverDiario(){
  const area=document.getElementById("conteudo-diario");if(!area)return;formatarDatas(area);
  area.querySelectorAll(".painel").forEach(card=>card.querySelectorAll(":scope > small").forEach(s=>{
    if(/^(Jorge|Olinda|Ema|Família)$/i.test(s.textContent.trim()))s.style.display="none";
  }));
}

/* ---------- GANCHOS ÚNICOS ---------- */
const abrirOriginal=window.abrirArea;
window.abrirArea=function(id){
  const r=abrirOriginal.apply(this,arguments);
  setTimeout(function(){
    if(id==="ecran-conquistas")renderConquistas(obterEstadoFamilia());
    if(id==="ecran-mapa"){decorarLocais();garantirRoda();}
    if(id==="ecran-diario")reverDiario();
    formatarDatas(document.getElementById(id));atualizarMedalhaHome();
  },80);
  return r;
};
const atualizarOriginal=window.atualizarEstadoJogo;
window.atualizarEstadoJogo=function(){
  const r=atualizarOriginal.apply(this,arguments);
  setTimeout(()=>{atualizarMedalhaHome();formatarDatas(document.body);},20);
  return r;
};
document.addEventListener("DOMContentLoaded",function(){
  setTimeout(function(){atualizarMedalhaHome();formatarDatas(document.body);},100);
});
})();
