// gestione degli items osservati dopo il caricamento della pagina (utile per animazioni)
function onLoadHandler() {
    // loadingScreen di almeno 50ms
    var loadTime = Date.now() - performance.timeOrigin;
    var delay = Math.max(50 - loadTime, 0);

    setTimeout(function() {
        // gestione items osservati
        var elementiDaOsservare = document.querySelectorAll('.osservato');
        var callback = function(items) {
            items.forEach((item) => {
                var position = item.target.getBoundingClientRect();
                if (item.isIntersecting) {
                    item.target.classList.add("mostrato");
                } else if (position.top > 0) { // rimuove la classe mostrato solo se l'item si trova nella parte non visibile superiore dello schermo
                    item.target.classList.remove("mostrato");
                }
            });
        }
        var observer = new IntersectionObserver(callback, {threshold: 0});
        elementiDaOsservare.forEach((element) => {
            observer.observe(element);
        });
    }, delay);
    window.removeEventListener("load", onLoadHandler);
}
// Aggiunta dell'event listener
window.addEventListener("load", onLoadHandler);

// gestione dei link esterni
function apriUrl(url) { window.open(url, "_self"); }