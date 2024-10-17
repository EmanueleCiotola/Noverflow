// gestione items osservati
var elementiDaOsservare = document.querySelectorAll('.osservato');
// rimozione preventiva per evitare effetto taglio animazione
elementiDaOsservare.forEach((element) => {
    element.classList.remove("mostrato");
});
setTimeout(() => {
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
    var observer = new IntersectionObserver(callback, {threshold: .05});
    elementiDaOsservare.forEach((element) => {
        observer.observe(element);
    });
}, 400);


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
        if (shouldUpdate) {
            aggiornaSelettore(opzione, elementoSelezionato, opzioni);
            if (element.classList.contains('selettore-operazione')) sincronizzaSelettoriOperandi(opzione.innerText);
        }
        if (element.classList.contains('selettore-conversione')) scegliConversione();
        else if (element.classList.contains('selettore-rappresentazione')) rappresenta();
        else opera();
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
// funzione per sincronizzare i selettori operatore piccolo e grande
function sincronizzaSelettoriOperandi(valore) {
    const selettorePiccolo = document.querySelector('#selettoreOperazionePiccolo .elementoSelezionato');
    const selettoreGrande = document.querySelector('#selettoreOperazioneGrande .elementoSelezionato');
    selettorePiccolo.innerHTML = valore;
    selettoreGrande.innerHTML = valore;
    // aggiorna le classi delle opzioni selezionate
    aggiornaClassiOpzioni('selettoreOperazionePiccolo', valore);
    aggiornaClassiOpzioni('selettoreOperazioneGrande', valore);
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
    const testo3 = input.value;
    const testo4 = risultato.innerHTML;
    if (/^(?!.*[+-]{2})(?!.*\..*\.)[0-9A-Fa-f]*([+-]?[0-9A-Fa-f]*(\.[0-9A-Fa-f]*)?)?$/.test(testo4) || testo4 == "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui..." ||
    testo4 == "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido..." || testo4 == "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...") {
        // scambia i testi
        selettore1.innerText = testo2;
        selettore2.innerText = testo1;
        // aggiorna le classi delle opzioni selezionate
        aggiornaClassiOpzioni(idSelettore1, testo2);
        aggiornaClassiOpzioni(idSelettore2, testo1);
        // scambia input e risultato se risultato esiste
        if (testo4 != "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui..." &&
            testo4 != "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido..." &&
            testo4 != "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...") { 
            input.value = testo4;
            risultato.innerText = testo3;
        }
    }
}
// funzione per aggiornare le classi delle opzioni
const aggiornaClassiOpzioni = (idSelettore, testo) => {
    const opzioni = document.querySelectorAll(`#${idSelettore} .elementiSelettore li`);
    opzioni.forEach(op => op.classList.remove('selezionatoDaSelettore'));
    opzioni.forEach(op => { if (op.textContent === testo) { op.classList.add('selezionatoDaSelettore'); } });
};


// gestione conversioni
const risultato = document.getElementById("risultato");

function scegliConversione() {
    // ottieni le basi selezionate
    const primaBase = document.querySelector('#selettorePrimaBase .elementoSelezionato').innerText;
    const secondaBase = document.querySelector('#selettoreSecondaBase .elementoSelezionato').innerText;
    const valoreDaConvertire = document.getElementById('elementoDaConvertire').value;
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
    risultato.innerHTML = converti(basePrima, baseSeconda, valoreDaConvertire);
}
function converti(basePrima, baseSeconda, valoreDaConvertire) {
    let controlloRisultato;
    // controllo del valore in ingresso
    if (basePrima === 2) controlloRisultato = /^[01.+-]+(\.[01]+)?$/; // binario
    else if (basePrima === 8) controlloRisultato = /^[0-7.+-]+(\.[0-7]+)?$/; // ottale
    else if (basePrima === 10) controlloRisultato = /^[0-9.+-]+(\.[0-9]+)?$/; // decimale
    else controlloRisultato = /^[0-9A-Fa-f.+-]+(\.[0-9A-Fa-f]+)?$/; // esadecimale
    // verifica e conversione
    if (valoreDaConvertire.length === 1 &&
        (valoreDaConvertire == "+" ||
        valoreDaConvertire == "-")) {
            risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
            risultato.classList.remove('risultatoCalcolato');
            return "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
    } else {
        if (controlloRisultato.test(valoreDaConvertire)) {
            let numeroConvertito;
            if (valoreDaConvertire.includes('.')) {
                if ((valoreDaConvertire.indexOf('.') + 1) == (valoreDaConvertire.length)) {
                    risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...";
                    risultato.classList.remove('risultatoCalcolato');
                    return "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...";
                } else {
                    numeroConvertito = convertiDecimaleConVirgola(valoreDaConvertire, basePrima, baseSeconda);
                    risultato.innerHTML = numeroConvertito.toUpperCase();
                    risultato.classList.add('risultatoCalcolato');
                    return numeroConvertito.toUpperCase(); // mostra risultato in maiuscolo se esadecimale
                }
            } else {
                numeroConvertito = parseInt(valoreDaConvertire, basePrima).toString(baseSeconda);
                risultato.innerHTML = numeroConvertito.toUpperCase();
                risultato.classList.add('risultatoCalcolato');
                return numeroConvertito.toUpperCase(); // mostra risultato in maiuscolo se esadecimale
            }
        } else if (valoreDaConvertire === "") {
            risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
            risultato.classList.remove('risultatoCalcolato');
            return "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
        } else {
            risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido...";
            risultato.classList.remove('risultatoCalcolato');
            return "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido...";
        }
    }
}
function convertiDecimaleConVirgola(valore, basePrima, baseSeconda) {
    const [parteIntera, parteDecimale] = valore.split('.');
    let parteInteraConvertita = parseInt(parteIntera, basePrima).toString(baseSeconda);
    let parteDecimaleConvertita = '';
    if (parteDecimale) {
        let decimale = 0;
        for (let i = 0; i < parteDecimale.length; i++) {
            decimale += parseInt(parteDecimale[i], basePrima) / Math.pow(basePrima, i + 1);
        }
        let contatore = 0;
        while (decimale > 0 && contatore < 10) {
            decimale *= baseSeconda;
            let cifra = Math.floor(decimale);
            parteDecimaleConvertita += cifra.toString(baseSeconda);
            decimale -= cifra;
            contatore++;
        }
    }
    return parteInteraConvertita + (parteDecimaleConvertita ? '.' + parteDecimaleConvertita : '');
}

// gestione rappresentazioni
function rappresenta() {
    const primaRappresentazione = document.querySelector('#selettorePrimaRappresentazione .elementoSelezionato').innerText;
    const secondaRappresentazione = document.querySelector('#selettoreSecondaRappresentazione .elementoSelezionato').innerText;
    const valoreDaRappresentare = document.getElementById('elementoDaRappresentare').value;
    let controlloRisultato;
    // controllo del valore in ingresso
    if (primaRappresentazione === "Binario") controlloRisultato = /^[01.+-]+(\.[01]+)?$/; // binario
    else controlloRisultato = /^[01]+$/; // altre rappresentazioni
    // verifica e rappresentazione
    if (primaRappresentazione === "Binario" &&
        valoreDaRappresentare.length === 1 &&
        (valoreDaRappresentare == "+" ||
        valoreDaRappresentare == "-")) {
            risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
            risultato.classList.remove('risultatoCalcolato');
        }
    else if ((primaRappresentazione === "C1" || primaRappresentazione === "C2") && valoreDaRappresentare.length === 1) {
        if (controlloRisultato.test(valoreDaRappresentare)) {
            risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
            risultato.classList.remove('risultatoCalcolato');
        }
        else {
            risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido...";
            risultato.classList.remove('risultatoCalcolato');
        }
    }
    else if (primaRappresentazione === "FP32" && valoreDaRappresentare.length != 32) {
        if (valoreDaRappresentare === "") {
            risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
            risultato.classList.remove('risultatoCalcolato');
        } else if (valoreDaRappresentare.length < 32 && controlloRisultato.test(valoreDaRappresentare)) {
            risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...";
            risultato.classList.remove('risultatoCalcolato');
        } else {
            risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido...";
            risultato.classList.remove('risultatoCalcolato');
        }
    } else if (primaRappresentazione === "FP64" && valoreDaRappresentare.length != 64) {
        if (valoreDaRappresentare === "") {
            risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
            risultato.classList.remove('risultatoCalcolato');
        } else if (valoreDaRappresentare.length < 64 && controlloRisultato.test(valoreDaRappresentare)) {
            risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...";
            risultato.classList.remove('risultatoCalcolato');
        } else {
            risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido...";
            risultato.classList.remove('risultatoCalcolato');
        }
    } else {
        if (controlloRisultato.test(valoreDaRappresentare)) {
            let numeroRappresentato = convertiRappresentazione(primaRappresentazione, secondaRappresentazione, valoreDaRappresentare);
            risultato.innerText = numeroRappresentato; // mostra risultato
            risultato.classList.add('risultatoCalcolato');
        } else if (valoreDaRappresentare === "") {
            risultato.innerHTML = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
            risultato.classList.remove('risultatoCalcolato');
        }
        
        else {
            risultato.innerHTML = "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido...";
            risultato.classList.remove('risultatoCalcolato');
        }
    }
}
function convertiRappresentazione(primaRappresentazione, secondaRappresentazione, valore) {
    let risultatoConversione;
    // converti l'input iniziale in binario se non lo è già
    let valoreBinario = valore;
    switch (primaRappresentazione) {
        case "C1":
            valoreBinario = C1_Binario(valore);
            break;
        case "C2":
            valoreBinario = C2_Binario(valore);
            break;
        case "FP32":
            valoreBinario = FP32_Binario(valore);
            break;
        case "FP64":
            valoreBinario = FP64_Binario(valore);
            break;
    }
    // converti il valore binario nella rappresentazione desiderata
    switch (secondaRappresentazione) {
        case "Binario":
            risultatoConversione = valoreBinario;
            break;
        case "C1":
            risultatoConversione = Binario_C1(valoreBinario);
            break;
        case "C2":
            risultatoConversione = Binario_C2(valoreBinario);
            break;
        case "FP32":
            risultatoConversione = Binario_FP32(valoreBinario);
            break;
        case "FP64":
            risultatoConversione = Binario_FP64(valoreBinario);
            break;
    }

    return risultatoConversione;
}
function C1_Binario(valore) {
    const segno = valore.charAt(0) === "1" ? "-" : ""; // se il primo bit è 1, il numero è negativo
    let valoreAssoluto = valore.slice(1); // esclude il bit segno
    if (segno === "-") { valoreAssoluto = [...valoreAssoluto].map(bit => bit === '0' ? '1' : '0').join('').replace(/^([+-]?)(0+)(\d)/, '$1$3'); }
    return `${segno}${valoreAssoluto}`; // restituisce il valore come stringa
}
function C2_Binario(valore) {
    const complemento1 = (parseInt(valore, 2) - 1).toString(2).padStart(valore.length, '0'); // calcola il complemento a 1
    return C1_Binario(complemento1); // restituisce il valore come stringa
}
function FP32_Binario(valore) {
    // converte la stringa binaria in un numero intero senza segno (32 bit)
    const intValue = parseInt(valore, 2);
    // creazione di un array buffer di 4 byte (32 bit)
    const buffer = new ArrayBuffer(4);
    // creazione di una vista Uint32Array per scrivere il valore intero nel buffer
    const intView = new Uint32Array(buffer);
     intView[0] = intValue;
    // creazione di una vista Float32Array per leggere il valore in virgola mobile dal buffer
    const float32View = new Float32Array(buffer);
    return parseFloat(converti(10, 2, float32View[0].toString()).toString());
}
function FP64_Binario(valore) {
    // converte la stringa binaria in un BigInt
    const intValue = BigInt('0b' + valore);
    // creazione di un array buffer di 8 byte (64 bit)
    const buffer = new ArrayBuffer(8);
    // creazione di una vista BigUint64Array per scrivere il valore intero nel buffer
    const intView = new BigUint64Array(buffer);
    intView[0] = intValue;
    // creazione di una vista Float64Array per leggere il valore in virgola mobile dal buffer
    const float64View = new Float64Array(buffer);
    return parseFloat(converti(10, 2, float64View[0].toString().toString()));
}
function Binario_C1(valore) {
    const primoCarattere = valore.charAt(0);
    const segno = (primoCarattere === "-") ? "1" : "0"; // se il primo carattere è '-', il segno è '1'; altrimenti è '0'
    if (primoCarattere === "-" || primoCarattere == "+") valore = valore.slice(1);
    // se il numero è negativo, inverti i bit
    if (segno === "1") valore = [...valore].map(bit => bit === '0' ? '1' : '0').join('');
    return `${segno}${valore}`; // restituisce il valore come stringa
}
function Binario_C2(valore) {
    const primoCarattere = valore.charAt(0);
    const segno = (primoCarattere === "-") ? "1" : "0"; // se il primo carattere è '-', il segno è '1'; altrimenti è '0'
    if (primoCarattere === "-" || primoCarattere == "+") valore = valore.slice(1);
    let complemento2 = valore;
    // se il numero è negativo, aggiungi 1 al complemento a 1
    if (segno === "1") {
        const complemento1 = Binario_C1((-valore).toString());
        complemento2 = (parseInt(complemento1, 2) + 1).toString(2).padStart(complemento1.length, '0').slice(1); // calcola il complemento a 2
    }
    return `${segno}${complemento2}`; // restituisce il valore come stringa
}
function Binario_FP32(valore) {
    const valoreDecimale = converti(2, 10, valore.toString());
    // creazione di un array Float32Array e impostazione del valore decimale
    const float32 = new Float32Array(1);
    float32[0] = valoreDecimale;
    // creazione di una vista Uint32Array per leggere i bit del Float32Array
    const intView = new Uint32Array(float32.buffer);
    // converte il valore in una stringa binaria di 32 bit
    return intView[0].toString(2).padStart(32, '0');
}
function Binario_FP64(valore) {
    const valoreDecimale = converti(2, 10, valore.toString());
    // creazione di un array Float64Array e impostazione del valore decimale
    const float64 = new Float64Array(1);
    float64[0] = valoreDecimale;
    // creazione di una vista Uint64Array per leggere i bit del Float64Array
    const intView = new BigUint64Array(float64.buffer);
    // converte il valore in una stringa binaria di 64 bit
    return intView[0].toString(2).padStart(64, '0');
}

// gestione operazioni
function opera() {
    const primoOperando = document.getElementById('primoOperando').value;
    const secondoOperando = document.getElementById('secondoOperando').value;
    const operatore = document.querySelector('.selettore-operazione .elementoSelezionato').innerText;
    // converti in decimale
    const primoInDecimale = converti(2, 10, primoOperando.toString());
    const secondoInDecimale = converti(2, 10, secondoOperando.toString());
    let risultatoCalcolato;
    if (primoInDecimale === "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui..." ||
        secondoInDecimale === "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...") {
        risultatoCalcolato = "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...";
        risultato.classList.remove('risultatoCalcolato');
    } else if (primoInDecimale === "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto..." ||
        secondoInDecimale === "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...") {
        risultatoCalcolato = "Un&nbsp;valore&nbsp;inserito è&nbsp;incompleto...";
        risultato.classList.remove('risultatoCalcolato'); 
    } else {
        let risultatoinDecimale;
        switch (operatore) {
            case 'ADD':
                risultatoinDecimale = parseFloat(primoInDecimale) + parseFloat(secondoInDecimale);
                break;
            case 'SUB':
                risultatoinDecimale = parseFloat(primoInDecimale) - parseFloat(secondoInDecimale);
                break;
            case 'MUL':
                risultatoinDecimale = parseFloat(primoInDecimale) * parseFloat(secondoInDecimale);
                break;
            case 'DIV':
                risultatoinDecimale = parseFloat(primoInDecimale) / parseFloat(secondoInDecimale);
                break;
        }
        // riconverti in binario e setta risultato
        risultatoCalcolato = parseFloat(converti(10, 2, risultatoinDecimale.toString()).toString());
    }
    risultato.innerHTML = risultatoCalcolato; // conversioni in più per la rimozione degli 0 non significativi
}



// gestione copia risultato al click
// todo
let timerCopiato;
function copiaRisultato() {
    const risultato = document.getElementById('risultato');
    const testoRisultato = risultato.innerHTML;
    const avvisoMessaggioCopiato = document.getElementById('avvisoMessaggioCopiato');
    if (testoRisultato !== "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui..." &&
        testoRisultato !== "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido..." &&
        testoRisultato !== "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto..." &&
        testoRisultato !== "Un&nbsp;valore&nbsp;inserito è&nbsp;incompleto...") {
        navigator.clipboard.writeText(testoRisultato).then(() => {
            // rimuovi qualsiasi timer precedente
            clearTimeout(timerCopiato);
            // mostra il messaggio "Copiato"
            avvisoMessaggioCopiato.classList.add('visibile');
            // avvia un nuovo timer per nascondere il messaggio dopo 2 secondi
            timerCopiato = setTimeout(() => { avvisoMessaggioCopiato.classList.remove('visibile'); }, 1300);
        });
    }
}





// gestione dei link esterni
function apriUrl(url) { window.open(url, "_self"); }