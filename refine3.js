/* TERCEIRAQUEST — terceira afinação funcional/visual */
(function(){
"use strict";

const medalhasTQ3 = [
  {nome:"Cagarro", classe:"medalha-cagarro-tq"},
  {nome:"Golfinho", classe:"medalha-golfinho-tq"},
  {nome:"Touro Bravo", classe:"medalha-touro-tq"},
  {nome:"Turista", classe:"medalha-turista-tq"},
  {nome:"Terceirense", classe:"medalha-terceirense-tq"},
  {nome:"Lenda da TerceiraQuest", classe:null},
  {nome:"Pés na Terra", classe:"medalha-trilhos-tq"},
  {nome:"Caçadores de Tesouros", classe:null},
  {nome:"Férias em Grande", classe:null}
];

function totalMedalhasReal(estado){
  if(typeof contarMedalhas === "function") return contarMedalhas(estado);
  return Number(estado.medalhasLegado||0)+Object.keys(estado.medalhasConquistadas||{}).length;
}

function conquistaEstaDesbloqueada(estado,conquista,indice){
  if(estado.conquistasDesbloqueadas && estado.conquistasDesbloqueadas[conquista.id]) return true;
  /* compatibilidade com instalações antigas: se já existe pelo menos uma medalha, a primeira conquista é visualmente reconhecida */
  if(indice===0 && totalMedalhasReal(estado)>0) return true;
  return false;
}

function criarMedalhaVisual(cfg,desbloqueada){
  const medalha=document.createElement("div");
  if(cfg.classe){
    medalha.className="medalha-real-tq "+cfg.classe;
  } else {
    medalha.className="medalha-sem-imagem-tq";
    medalha.textContent=desbloqueada?"★":"○";
  }
  medalha.setAttribute("aria-label","Medalha "+cfg.nome);
  medalha.title=cfg.nome;
  return medalha;
}

window.renderConquistas = renderConquistas = function(estado){
  const conteudo=document.getElementById("conteudo-conquistas");
  if(!conteudo) return;
  conteudo.innerHTML="";
  catalogo.conquistas.forEach(function(conquista,indice){
    const cfg=medalhasTQ3[indice]||{nome:conquista.titulo,classe:null};
    const desbloqueada=conquistaEstaDesbloqueada(estado,conquista,indice);
    const cartao=document.createElement("section");
    cartao.className="conquista-cartao-tq"+(desbloqueada?" conquistada":"");
    const medalha=criarMedalhaVisual(cfg,desbloqueada);
    const info=document.createElement("div"); info.className="conquista-info-tq";
    const titulo=document.createElement("h3"); titulo.textContent=conquista.titulo;
    const nome=document.createElement("small"); nome.className="nome-medalha-tq3"; nome.textContent="Medalha: "+cfg.nome;
    const desc=document.createElement("p"); desc.textContent=conquista.descricao;
    const estadoEl=document.createElement("strong"); estadoEl.className="estado-medalha-tq3";
    estadoEl.textContent=desbloqueada?"✓ Conquistada":"Por conquistar";
    info.append(titulo,nome,desc,estadoEl);
    cartao.append(medalha,info);
    conteudo.appendChild(cartao);
  });
};

function medalhaAtual(estado){
  let indice=-1;
  catalogo.conquistas.forEach(function(c,i){ if(conquistaEstaDesbloqueada(estado,c,i)) indice=i; });
  if(indice<0 && totalMedalhasReal(estado)>0) indice=0;
  return indice>=0 ? {indice:indice,cfg:medalhasTQ3[indice]||medalhasTQ3[0]} : null;
}

function atualizarMedalhaHome(){
  const home=document.getElementById("ecran-principal");
  const progresso=home && home.querySelector(".progresso");
  if(!home||!progresso) return;
  let faixa=home.querySelector(".medalha-home-tq");
  const atual=medalhaAtual(obterEstadoFamilia());
  if(!atual){ if(faixa) faixa.remove(); return; }
  if(!faixa){
    faixa=document.createElement("div"); faixa.className="medalha-home-tq";
    progresso.insertAdjacentElement("afterend",faixa);
  }
  faixa.innerHTML="";
  const img=criarMedalhaVisual(atual.cfg,true);
  img.classList.add("medalha-home-imagem");
  const texto=document.createElement("div");
  const rotulo=document.createElement("small"); rotulo.textContent="Medalha conquistada";
  const nome=document.createElement("strong"); nome.textContent=atual.cfg.nome;
  const estado=document.createElement("div"); estado.className="medalha-home-estado"; estado.textContent="🏅 Faz parte da aventura";
  texto.append(rotulo,nome,estado); faixa.append(img,texto);
  const contador=document.getElementById("medalhas-jogador"); if(contador) contador.textContent=String(totalMedalhasReal(obterEstadoFamilia()));
}

/* Fotografias reais dos locais; nenhuma ilustração substitui um lugar. */
const fotosLocaisTQ3={
 "Angra do Heroísmo":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=900",
 "Praia da Vitória":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
 "Prainha":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Prainha%20.jpg?width=900",
 "Biscoitos":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Piscinas%20naturais%20dos%20Biscoitos.jpg?width=900",
 "Escaleiras":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Praia%20das%20Escaleiras%2C%20Vila%20Nova%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20terceira%2C%20A%C3%A7ores.jpg?width=900",
 "Furnas do Enxofre":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Furnas%20do%20Enxofre%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%203.JPG?width=900",
 "Serra do Cume":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Serra%20do%20Cume%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores%2C%20Portugal.jpg?width=900",
 "Monte Brasil":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Monte%20Brasil%2C%20vista%20da%20cidade%20de%20Angra%20do%20Hero%C3%ADsmo%2C%20Ilha%20Terceira%2C%20A%C3%A7ores.jpg?width=900",
 "Lagoa das Patas":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Lagoa%20das%20patas1.jpg?width=900",
 "Lagoa do Negro / Gruta do Natal":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Gruta%20do%20Natal%20-%20Ilha%20Terceira%20-%20Portugal%20(2496741265).jpg?width=900",
 "Serreta":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Imp%C3%A9rio%20do%20Esp%C3%ADrito%20Santo%2C%20Serreta%2C%20isla%20de%20Terceira%2C%20Azores%2C%20Portugal%2C%202020-07-25%2C%20DD%2091.jpg?width=900",
 "Fortes de São Sebastião":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Forte%20de%20s%C3%A3o%20sebasti%C3%A3o%2C%20ilha%20Terceira%20A%C3%A7ores%2C%20guarita%20e%20ilh%C3%A9us%20das%20Cabras%20ao%20fundo.jpg?width=900",
 "Baías da Agualva":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Baias%20de%20Agualva%20desde%20el%20miradouro%20de%20Alagoa%2C%20isla%20de%20Terceira%2C%20Azores%2C%20Portugal%2C%202020-07-25%2C%20DD%2076.jpg?width=900",
 "Relheiras de São Brás":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Relheiras%20-%20S%C3%A3o%20Br%C3%A1s.jpg?width=900",
 "Quatro Ribeiras":"https://commons.wikimedia.org/wiki/Special:Redirect/file/Costa%20das%20Quatro%20Ribeiras%2C%20Praia%20da%20Vit%C3%B3ria%2C%20ilha%20Terceira%2C%20A%C3%A7ores.JPG?width=900"
};

function corrigirFotosLocais(){
  const area=document.getElementById("conteudo-mapa"); if(!area) return;
  area.querySelectorAll(".cartao-lugar-tq").forEach(function(cartao){
    const h3=cartao.querySelector("h3"); const foto=cartao.querySelector(".foto-lugar-tq");
    if(!h3||!foto) return;
    const nome=h3.textContent.replace(/^[^\p{L}\p{N}]+/u,"").trim();
    foto.classList.remove("foto-lugar-pendente-tq");
    foto.style.backgroundImage=fotosLocaisTQ3[nome] ? 'url("'+fotosLocaisTQ3[nome]+'")' : "none";
    if(!fotosLocaisTQ3[nome]) foto.classList.add("foto-lugar-pendente-tq");
  });
}

function enriquecerRoda(){
  const roda=document.querySelector("#conteudo-mapa .roda-visual-tq"); if(!roda||roda.dataset.pontos==="1") return;
  roda.dataset.pontos="1";
  for(let i=0;i<12;i++){
    const p=document.createElement("i"); p.className="roda-ponto-tq";
    const a=(i*30-90)*Math.PI/180, r=91;
    p.style.left=(109+Math.cos(a)*r)+"px"; p.style.top=(109+Math.sin(a)*r)+"px";
    roda.appendChild(p);
  }
}

const abrirAreaTQ3=window.abrirArea;
window.abrirArea=function(id){
  const r=abrirAreaTQ3.apply(this,arguments);
  setTimeout(function(){
    if(id==="ecran-conquistas") renderConquistas(obterEstadoFamilia());
    if(id==="ecran-mapa"){ corrigirFotosLocais(); enriquecerRoda(); }
    atualizarMedalhaHome();
  },20);
  return r;
};

const atualizarTQ3=window.atualizarEstadoJogo;
window.atualizarEstadoJogo=function(){
  const r=atualizarTQ3.apply(this,arguments);
  setTimeout(atualizarMedalhaHome,0);
  return r;
};

document.addEventListener("DOMContentLoaded",function(){ setTimeout(atualizarMedalhaHome,50); });
})();
