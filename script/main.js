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

// gestione dei selettori
let selettoreAperto = null; // variabile per tenere traccia del selettore attualmente aperto
document.querySelectorAll('.selettore').forEach(element => {
    const spazioSelezionatoSelettore = element.querySelector('.spazioSelezionatoSelettore');
    const elementoSelezionato = element.querySelector('.elementoSelezionato');
    const iconaMenuSelezione = element.querySelector('.iconaMenuSelezione');
    const elementiSelettore = element.querySelector('.elementiSelettore');
    const opzioni = element.querySelectorAll('.elementiSelettore li');
    const toggleSelettore = (event) => {
        if (selettoreAperto === elementiSelettore) {
            chiudiTuttiISelettori(); // chiudi il selettore se è già aperto
        } else {
            chiudiTuttiISelettori(); // chiudi gli altri selettori
            elementiSelettore.classList.add('selettoreAperto'); // apri il selettore
            iconaMenuSelezione.classList.add('selettoreAperto');
            selettoreAperto = elementiSelettore; // aggiorna il selettore aperto
        }
        event.stopPropagation();
    };
    spazioSelezionatoSelettore.addEventListener('click', toggleSelettore);
    opzioni.forEach(opzione => {
        opzione.addEventListener('click', (event) => {
            elementoSelezionato.innerText = opzione.innerText; // aggiorna il testo
            selezionaOpzione(opzione, opzioni); // seleziona l'opzione
            chiudiTuttiISelettori(); // chiudi tutti i selettori dopo la selezione
            selettoreAperto = null; // resetta la variabile del selettore aperto
            event.stopPropagation(); // impedisci la propagazione dell'evento
        });
    });
    // aggiungi un evento di clic sugli elementi del selettore per evitare di chiudere
    elementiSelettore.addEventListener('click', (event) => {
        event.stopPropagation(); // impedisci la propagazione dell'evento
    });
});
// funzione per chiudere tutti i selettori
const chiudiTuttiISelettori = () => {
    document.querySelectorAll('.selettoreAperto').forEach(elementoAperto => {
        elementoAperto.classList.remove('selettoreAperto');
    });
    selettoreAperto = null; // resetta la variabile del selettore aperto
};
// funzione per selezionare un'opzione
const selezionaOpzione = (opzioneSelezionata, tutteLeOpzioni) => {
    tutteLeOpzioni.forEach(op => op.classList.remove('selezionatoDaSelettore'));
    opzioneSelezionata.classList.add('selezionatoDaSelettore');
};
// aggiungi un listener globale per chiudere i selettori quando si clicca fuori o si scrolla
document.addEventListener('click', chiudiTuttiISelettori);
window.addEventListener('scroll', chiudiTuttiISelettori);

// gestione switch dei selettori
function switchaSelettori(idSelettore1, idSelettore2) {
    const selettore1 = document.getElementById(idSelettore1).querySelector('.elementoSelezionato');
    const selettore2 = document.getElementById(idSelettore2).querySelector('.elementoSelezionato');
    // recupera i testi delle opzioni selezionate
    const testo1 = selettore1.innerText;
    const testo2 = selettore2.innerText;
    // scambia i testi
    selettore1.innerText = testo2;
    selettore2.innerText = testo1;
    // aggiorna le classi delle opzioni selezionate
    const opzioni1 = document.querySelectorAll(`#${idSelettore1} .elementiSelettore li`);
    const opzioni2 = document.querySelectorAll(`#${idSelettore2} .elementiSelettore li`);
    opzioni1.forEach(op => op.classList.remove('selezionatoDaSelettore'));
    opzioni2.forEach(op => op.classList.remove('selezionatoDaSelettore'));
    opzioni1.forEach(op => { if (op.textContent === testo2) { op.classList.add('selezionatoDaSelettore'); } });
    opzioni2.forEach(op => { if (op.textContent === testo1) { op.classList.add('selezionatoDaSelettore'); } });
}

// gestione dei link esterni
function apriUrl(url) { window.open(url, "_self"); }