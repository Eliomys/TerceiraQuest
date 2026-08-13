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

/* ---------- MEDALHAS ----------
   As nove medalhas usam exclusivamente o novo pack aprovado, guardado
   localmente para funcionar também offline. */
const medalhasPorConquista={
  "primeira-atividade":{nome:"Cagarro",ficheiro:"images/medalhas/medalha-cagarro.webp"},
  "dez-atividades":{nome:"Golfinho",ficheiro:"images/medalhas/medalha-golfinho.webp"},
  "quarenta-atividades":{nome:"Touro Bravo",ficheiro:"images/medalhas/medalha-touro-bravo.webp"},
  "sessenta-cinco-atividades":{nome:"Turista",ficheiro:"images/medalhas/medalha-turista.webp"},
  "oitenta-atividades":{nome:"Terceirense",ficheiro:"images/medalhas/medalha-terceirense.webp"},
  "cem-atividades":{nome:"Lenda da TerceiraQuest",ficheiro:"images/medalhas/medalha-lenda-terceiraquest.webp"},
  "trilhos-completos":{nome:"Pés na Terra",ficheiro:"images/medalhas/medalha-pes-na-terra.webp"},
  "geocaching-completo":{nome:"Caçadores de Tesouros",ficheiro:"images/medalhas/medalha-cacadores-tesouros.webp"},
  "desafios-ferias-completos":{nome:"Férias em Grande",ficheiro:"images/medalhas/medalha-ferias-em-grande.webp"}
};
function medalhaEl(cfg){
  const el=document.createElement("span");
  el.className="medalha-final medalha-pack-novo";
  el.title=cfg.nome;
  el.setAttribute("aria-label","Medalha "+cfg.nome);
  el.style.backgroundImage=`url("${cfg.ficheiro}")`;
  return el;
}
window.renderConquistas=renderConquistas=function(estado){
  const area=document.getElementById("conteudo-conquistas");if(!area)return;area.innerHTML="";
  catalogo.conquistas.forEach(function(c){
    const cfg=medalhasPorConquista[c.id];
    if(!cfg)return;
    const ganha=ganhaConquista(c,estado),card=document.createElement("section");
    card.className="conquista-cartao-tq"+(ganha?" conquistada":"");
    card.dataset.conquistaId=c.id;
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
  const estado=obterEstadoFamilia();let total=0;
  catalogo.conquistas.forEach(function(c){if(ganhaConquista(c,estado))total++;});
  const n=document.getElementById("medalhas-jogador");if(n)n.textContent=String(total);
  const caixa=document.querySelector("#ecran-principal .estatistica:nth-child(2)");
  if(caixa){
    caixa.querySelectorAll(".medalha-mini-final,.medalha-mini-tq,.medalha-mini-tq6").forEach(e=>e.remove());
    const icone=caixa.querySelector(":scope > span");if(icone)icone.textContent="🏅";
  }
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
let rotacao=0;
function garantirRoda(){
  const area=document.getElementById("conteudo-mapa"),resultado=document.getElementById("resultado-roda-mapa");if(!area||!resultado)return null;
  const painel=resultado.closest(".painel");if(!painel)return null;
  painel.querySelectorAll(".roda-visual,.roda-visual-tq,.ponteiro-roda-tq").forEach(e=>e.remove());

  const botaoAntigo=Array.from(painel.querySelectorAll("button")).find(b=>/RODAR/i.test(b.textContent));
  let botao=botaoAntigo;
  if(botaoAntigo){
    botao=botaoAntigo.cloneNode(true);
    botaoAntigo.replaceWith(botao);
  }

  const ponteiro=document.createElement("div");ponteiro.className="ponteiro-roda-tq";
  const roda=document.createElement("div");roda.className="roda-visual-tq";
  if(botao){painel.insertBefore(ponteiro,botao);painel.insertBefore(roda,botao);}else{painel.append(ponteiro,roda);}
  for(let i=0;i<12;i++){
    const ponto=document.createElement("span");ponto.className="roda-ponto-tq";
    const a=(i/12)*Math.PI*2-Math.PI/2,r=94;
    ponto.style.left=`calc(50% + ${Math.cos(a)*r}px)`;ponto.style.top=`calc(50% + ${Math.sin(a)*r}px)`;roda.appendChild(ponto);
  }

  function rodar(){
    const estado=obterEstadoFamilia();
    const disponiveis=catalogo.locais.filter(l=>!estado.locaisConcluidos||!estado.locaisConcluidos[l.id]);
    if(!disponiveis.length){resultado.textContent="Todos os locais já foram concluídos.";return;}
    const destino=disponiveis[Math.floor(Math.random()*disponiveis.length)];
    if(botao)botao.disabled=true;
    resultado.textContent="A roda está a escolher…";
    let i=0;
    const intervalo=setInterval(()=>{resultado.textContent=disponiveis[i++%disponiveis.length].nome;},115);

    roda.style.transition="none";
    roda.getBoundingClientRect();
    roda.style.transition="";
    requestAnimationFrame(function(){
      rotacao+=2160+Math.floor(Math.random()*900);
      roda.style.transform=`rotate(${rotacao}deg)`;
    });

    setTimeout(()=>{
      clearInterval(intervalo);
      resultado.textContent="Hoje vamos a: "+destino.nome;
      if(botao)botao.disabled=false;
    },4000);
  }

  window.rodarRodaMapa=rodar;
  if(botao)botao.addEventListener("click",rodar);
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
  setTimeout(()=>{atualizarMedalhaHome();garantirImagensEstruturais();formatarDatas(document.body);},20);
  return r;
};
document.addEventListener("DOMContentLoaded",function(){
  setTimeout(function(){atualizarMedalhaHome();garantirImagensEstruturais();formatarDatas(document.body);},100);
});
})();
