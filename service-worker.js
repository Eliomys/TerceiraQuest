"use strict";

const CACHE_NAME = "terceiraquest-app-v23";
const APP_SHELL = [
    "./",
    "./index.html",
    "./style.css",
    "./home.css",
    "./welcome.css",
    "./areas.css",
    "./shell.css",
    "./polish.css",
    "./assets.css",
    "./assets-data-01.css",
    "./assets-data-02.css",
    "./assets-data-03.css",
    "./assets-data-04.css",
    "./assets-data-05.css",
    "./assets-data-06.css",
    "./assets-data-07.css",
    "./assets-data-08.css",
    "./assets-data-09.css",
    "./assets-data-10.css",
    "./assets-data-11.css",
    "./assets-data-12.css",
    "./final.css",
    "./refine2.css",
    "./refine3.css",
    "./refine4.css",
    "./refine5.css",
    "./refine6.css",
    "./finalfix.css",
    "./script.js",
    "./enhancements.js",
    "./refine6.js",
    "./manifest.webmanifest",
    "./icons/terceiraquest-192.png",
    "./icons/terceiraquest-512.png",
    "./images/avatars/jorge.png",
    "./images/avatars/olinda.png",
    "./images/avatars/ema.png",
    "./images/missoes/arco-iris.jpg",
    "./images/inicio/por-aqui.webp",
    "./images/inicio/vamos-sair.webp",
    "./images/inicio/marca-terceira.svg",
    "./images/cartoes/ferias.webp",
    "./images/medalhas/medalha-cagarro.webp",
    "./images/medalhas/medalha-golfinho.webp",
    "./images/medalhas/medalha-touro-bravo.webp",
    "./images/medalhas/medalha-turista.webp",
    "./images/medalhas/medalha-terceirense.webp",
    "./images/medalhas/medalha-lenda-terceiraquest.webp",
    "./images/medalhas/medalha-pes-na-terra.webp",
    "./images/medalhas/medalha-cacadores-tesouros.webp",
    "./images/medalhas/medalha-ferias-em-grande.webp"
];

const RECURSOS_ESSENCIAIS = new Set(APP_SHELL.map(function(caminho) {
    return new URL(caminho, self.registration.scope).href;
}));

self.addEventListener("install", function(evento) {
    evento.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                const pedidosAtualizados = APP_SHELL.map(function(caminho) {
                    return new Request(caminho, { cache: "reload" });
                });
                return cache.addAll(pedidosAtualizados);
            })
            .then(function() { return self.skipWaiting(); })
    );
});

self.addEventListener("activate", function(evento) {
    evento.waitUntil(
        caches.keys()
            .then(function(nomes) {
                return Promise.all(nomes.map(function(nome) {
                    return nome.startsWith("terceiraquest-app-") && nome !== CACHE_NAME
                        ? caches.delete(nome)
                        : Promise.resolve(false);
                }));
            })
            .then(function() { return self.clients.claim(); })
    );
});

self.addEventListener("fetch", function(evento) {
    const pedido = evento.request;
    if (pedido.method !== "GET") return;

    const url = new URL(pedido.url);
    if (url.origin !== self.location.origin || !url.href.startsWith(self.registration.scope)) return;

    if (pedido.mode === "navigate") {
        evento.respondWith(
            fetch(pedido)
                .then(function(resposta) {
                    if (resposta && resposta.ok) {
                        const copia = resposta.clone();
                        caches.open(CACHE_NAME).then(function(cache) { cache.put("./index.html", copia); });
                    }
                    return resposta;
                })
                .catch(function() { return caches.match("./index.html"); })
        );
        return;
    }

    if (!RECURSOS_ESSENCIAIS.has(url.href)) return;

    evento.respondWith(
        caches.match(pedido).then(function(emCache) {
            return emCache || fetch(pedido);
        })
    );
});
