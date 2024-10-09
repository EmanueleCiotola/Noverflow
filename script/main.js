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
            apriSelettore(elementiSelettore, iconaMenuSelezione);
        }
        event.stopPropagation();
    };
    const gestisciOpzioneSelezionata = (opzione) => (event) => {
        let shouldUpdate = true; // variabile per controllare se aggiornare
        if (element.classList.contains('selettore-conversione')) {
            shouldUpdate = verificaSeUguali(element.id, opzione.innerText, "selettorePrimaBase", "selettoreSecondaBase", "elementoDaConvertire");
        } else if (element.classList.contains('selettore-rappresentazione')) {
            shouldUpdate = verificaSeUguali(element.id, opzione.innerText, "selettorePrimaRappresentazione", "selettoreSecondaRappresentazione", "elementoDaRappresentare");
        }
        if (shouldUpdate) aggiornaSelettore(opzione, elementoSelezionato, opzioni);
        if (element.classList.contains('selettore-conversione')) converti();
        else if (element.classList.contains('selettore-rappresentazione')) rappresenta();
        else operaLa();
        chiudiTuttiISelettori(); // chiudi tutti i selettori dopo la selezione
        selettoreAperto = null; // resetta la variabile del selettore aperto
        event.stopPropagation(); // impedisci la propagazione dell'evento
    };
    spazioSelezionatoSelettore.addEventListener('click', toggleSelettore);
    opzioni.forEach(opzione => opzione.addEventListener('click', gestisciOpzioneSelezionata(opzione)));
    // aggiungi un evento di clic sugli elementi del selettore per evitare di chiudere
    elementiSelettore.addEventListener('click', (event) => {
        event.stopPropagation(); // impedisci la propagazione dell'evento
    });
});
// funzione per aprire il selettore
const apriSelettore = (elementiSelettore, iconaMenuSelezione) => {
    elementiSelettore.classList.add('selettoreAperto'); // apri il selettore
    iconaMenuSelezione.classList.add('selettoreAperto');
    selettoreAperto = elementiSelettore; // aggiorna il selettore aperto
};
// funzione per aggiornare il selettore
const aggiornaSelettore = (opzioneSelezionata, elementoSelezionato, tutteLeOpzioni) => {
    elementoSelezionato.innerText = opzioneSelezionata.innerText; // aggiorna il testo
    selezionaOpzione(opzioneSelezionata, tutteLeOpzioni); // seleziona l'opzione
};
// funzione per verificare se i selettori di conversione sono uguali
function verificaSeUguali(idElemento, opzioneScelta, idSelettore1, idSelettore2, idInput) {
    const selettore1 = document.getElementById(idSelettore1);
    const selettore2 = document.getElementById(idSelettore2);
    if (idElemento === selettore1.id && opzioneScelta === selettore2.innerText) {
        switchaSelettori(idSelettore1, idSelettore2, idInput);
        return false;
    } else if (idElemento === selettore2.id && opzioneScelta === selettore1.innerText) {
        switchaSelettori(idSelettore1, idSelettore2, idInput);
        return false;
    }
    return true;
}
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
function switchaSelettori(idSelettore1, idSelettore2, idInput) {
    const selettore1 = document.getElementById(idSelettore1).querySelector('.elementoSelezionato');
    const selettore2 = document.getElementById(idSelettore2).querySelector('.elementoSelezionato');
    const input = document.getElementById(idInput);
    const risultato = document.getElementById("risultato");
    // recupera i testi delle opzioni selezionate
    const testo1 = selettore1.innerText;
    const testo2 = selettore2.innerText;
    // scambia i testi
    selettore1.innerText = testo2;
    selettore2.innerText = testo1;
    // aggiorna le classi delle opzioni selezionate
    aggiornaClassiOpzioni(idSelettore1, testo2);
    aggiornaClassiOpzioni(idSelettore2, testo1);
    // scambia input e risultato se quest'ultimo è non nullo
    const testo3 = input.value;
    const testo4= risultato.innerText;
    console.log(testo3, testo4)
    if (/^[0-9A-Fa-f]+$/.test(testo4)) {
        input.value = testo4;
        risultato.innerText = testo3;
    }
}
// funzione per aggiornare le classi delle opzioni
const aggiornaClassiOpzioni = (idSelettore, testo) => {
    const opzioni = document.querySelectorAll(`#${idSelettore} .elementiSelettore li`);
    opzioni.forEach(op => op.classList.remove('selezionatoDaSelettore'));
    opzioni.forEach(op => { if (op.textContent === testo) { op.classList.add('selezionatoDaSelettore'); } });
};



const risultato = document.getElementById("risultato");
function converti() {
    // ottieni le basi selezionate
    const primaBase = document.querySelector('#selettorePrimaBase .elementoSelezionato').innerText;
    const secondaBase = document.querySelector('#selettoreSecondaBase .elementoSelezionato').innerText;
    const valoreDaConvertire = document.getElementById('elementoDaConvertire').value;
    let controlloRisultato;
    let basePrima, baseSeconda;
    // mappa delle basi
    const baseMappa = {
        "Binario": 2,
        "Ottale": 8,
        "Decimale": 10,
        "Hex": 16
    };
    // ottenere le basi numeriche
    basePrima = baseMappa[primaBase];
    baseSeconda = baseMappa[secondaBase];
    // controllo del valore in ingresso
    if (basePrima === 2) controlloRisultato = /^[01]+$/; // Binario
    else if (basePrima === 8) controlloRisultato = /^[0-7]+$/; // Ottale
    else if (basePrima === 10) controlloRisultato = /^\d+$/; // Decimale
    else if (basePrima === 16) controlloRisultato = /^[0-9A-Fa-f]+$/; // Esadecimale
    // verifica e conversione
    if (controlloRisultato.test(valoreDaConvertire)) {
        let numeroConvertito = parseInt(valoreDaConvertire, basePrima).toString(baseSeconda);
        risultato.innerText = numeroConvertito.toUpperCase(); // Mostra in maiuscolo se esadecimale
    } else if (valoreDaConvertire === "") risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà&nbsp;mostrato&nbsp;qui...";
    else risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido...";
}
function rappresenta() {
    const as = document.querySelector('#selettorePrimaRappresentazione .elementoSelezionato').innerText;
    const fs = document.querySelector('#selettorePrimaRappresentazione .elementoSelezionato').innerText;
}
function operaLa() {
    const ged = document.querySelectorAll('.selettore-conversione .elementoSelezionato').innerText;
    console.log("yeah")
}



// gestione dei link esterni
function apriUrl(url) { window.open(url, "_self"); }