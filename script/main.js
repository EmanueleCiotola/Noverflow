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
window.addEventListener('load', () => {
    var observer = new IntersectionObserver(callback, { threshold: 0 });
    elementiDaOsservare.forEach((element) => {
        observer.observe(element);
    });
}); // delay di 1 secondo


// gestione dei link esterni
function apriUrl(url) { window.open(url, "_self"); }