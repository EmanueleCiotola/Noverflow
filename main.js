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
            if (item.isIntersecting || position.bottom < 0) {
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
}, 300);



// gestioni variabili globali
const risultato = document.getElementById("risultato");
const messaggiRisultato = {
    risultatoDefault: "Il&nbsp;risultato&nbsp;verrà mostrato&nbsp;qui...",
    valoreIncompleto: "Il&nbsp;valore&nbsp;inserito è&nbsp;incompleto...",
    valoreNonValido: "Il&nbsp;valore&nbsp;inserito non&nbsp;è&nbsp;valido..."
};
const controlli = {
    2: /^[01.+-]+(\.[01]+)?$/, // binario
    "numeriBinariConSegno": /^[01+-]+$/, // binario senza virgola
    "numeriBinari": /^[01]+$/, // binario senza segno e virgola
    8: /^[0-7.+-]+(\.[0-7]+)?$/, // ottale
    10: /^[0-9.+-]+(\.[0-9]+)?$/, // decimale
    16: /^[0-9A-Fa-f.+-]+(\.[0-9A-Fa-f]+)?$/ // esadecimale
};



// gestione dei selettori
let selettoreAperto = null; // variabile per tenere traccia del selettore attualmente aperto
let rotazioneIconaSwitchSelettori = 0; // variabile per tenere traccia della rotazione dell'icona switchSelettori
document.querySelectorAll('.selettore').forEach(element => {
    const spazioSelezionatoSelettore = element.querySelector('.spazioSelezionatoSelettore');
    const elementoSelezionato = element.querySelector('.elementoSelezionato');
    const iconaMenuSelezione = element.querySelector('.iconaMenuSelezione');
    const elementiSelettore = element.querySelector('.elementiSelettore');
    const opzioni = element.querySelectorAll('.elementiSelettore li');
    const toggleSelettore = (event) => {
        if (selettoreAperto !== elementiSelettore) {
            chiudiTuttiISelettori(); // chiudi gli altri selettori
            apriSelettore(elementiSelettore, iconaMenuSelezione);
        } else chiudiTuttiISelettori(); // chiudi il selettore aperto se è cliccato di nuovo
        event.stopPropagation();
    };
    const gestisciOpzioneSelezionata = (opzione) => (event) => {
        const shouldUpdate = element.classList.contains('selettore-conversione') 
            ? verificaSeUguali(element.id, opzione.innerText, "selettorePrimaBase", "selettoreSecondaBase", "elementoDaConvertire")
            : element.classList.contains('selettore-rappresentazione') 
                ? verificaSeUguali(element.id, opzione.innerText, "selettorePrimaRappresentazione", "selettoreSecondaRappresentazione", "elementoDaRappresentare")
                : true;
        if (shouldUpdate) {
            aggiornaSelettore(opzione, elementoSelezionato, opzioni);
            if (element.classList.contains('selettore-conversione')) scegliConversione();
            else if (element.classList.contains('selettore-rappresentazione')) rappresenta();
            else {
                sincronizzaSelettoriOperandi(opzione.innerText);
                opera();
            }
        }
        chiudiTuttiISelettori(); // chiudi tutti i selettori dopo la selezione
        selettoreAperto = null; // resetta la variabile del selettore aperto
        event.stopPropagation(); // impedisci la propagazione dell'evento
    };
    spazioSelezionatoSelettore.addEventListener('click', toggleSelettore);
    opzioni.forEach(opzione => opzione.addEventListener('click', gestisciOpzioneSelezionata(opzione)));
    elementiSelettore.addEventListener('click', (event) => { event.stopPropagation(); });
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
    const uguali = (idElemento === selettore1.id && opzioneScelta === selettore2.innerText) ||
        (idElemento === selettore2.id && opzioneScelta === selettore1.innerText);
    if (uguali) switchaSelettori(idSelettore1, idSelettore2, idInput);
    return !uguali; // restituisce true se non sono uguali
}
// funzione per sincronizzare i selettori operatore piccolo e grande
function sincronizzaSelettoriOperandi(valore) {
    const selettoriPiccoliEGrandi = ['#selettoreOperazionePiccolo', '#selettoreOperazioneGrande'];
    selettoriPiccoliEGrandi.forEach(selettoreId => {
        const selettore = document.querySelector(`${selettoreId} .elementoSelezionato`);
        selettore.innerHTML = valore;
        aggiornaClassiOpzioni(selettoreId.slice(1), valore); // rimuovi il #
    });
}
// funzione per chiudere tutti i selettori
const chiudiTuttiISelettori = () => {
    document.querySelectorAll('.selettoreAperto').forEach(elementoAperto => { elementoAperto.classList.remove('selettoreAperto'); });
    selettoreAperto = null; // resetta la variabile del selettore aperto
};
// funzione per selezionare un'opzione
const selezionaOpzione = (opzioneSelezionata, tutteLeOpzioni) => {
    tutteLeOpzioni.forEach(op => op.classList.remove('selezionatoDaSelettore'));
    opzioneSelezionata.classList.add('selezionatoDaSelettore');
};
// gestione switch dei selettori
function switchaSelettori(idSelettore1, idSelettore2, idInput) {
    const selettore1 = document.getElementById(idSelettore1).querySelector('.elementoSelezionato');
    const selettore2 = document.getElementById(idSelettore2).querySelector('.elementoSelezionato');
    const input = document.getElementById(idInput);
    const icona = document.querySelector(".iconaBottoneSwitchaSelettori");
    // recupera i testi delle opzioni selezionate
    const [ testo1, testo2, testo3, testo4 ] = [ selettore1.innerText, selettore2.innerText, input.value, risultato.innerHTML] ;
    const valoriInvalidi = [ messaggiRisultato.risultatoDefault, messaggiRisultato.valoreIncompleto, messaggiRisultato.valoreNonValido ];
    const valido = /^(?!.*[+-]{2})(?!.*\..*\.)[0-9A-Fa-f]*([+-]?[0-9A-Fa-f]*(\.[0-9A-Fa-f]*)?)?$/.test(testo4) || valoriInvalidi.includes(testo4);
    if (valido) {
        // scambia i testi
        [selettore1.innerText, selettore2.innerText] = [testo2, testo1];
        // aggiorna le classi delle opzioni selezionate
        aggiornaClassiOpzioni(idSelettore1, testo2);
        aggiornaClassiOpzioni(idSelettore2, testo1);
        // ruota icona
        rotazioneIconaSwitchSelettori += 180;
        icona.style.transform = `rotate(${rotazioneIconaSwitchSelettori}deg)`;
        // scambia input e risultato se risultato esiste
        if (!valoriInvalidi.includes(testo4)) { 
            input.value = testo4;
            risultato.innerText = testo3;
        }
    }
}
// funzione per aggiornare le classi delle opzioni
const aggiornaClassiOpzioni = (idSelettore, testo) => {
    const opzioni = document.querySelectorAll(`#${idSelettore} .elementiSelettore li`);
    opzioni.forEach(op => { op.classList.toggle('selezionatoDaSelettore', op.textContent === testo); });
};
document.addEventListener('click', chiudiTuttiISelettori); // chiudi i selettori quando si clicca fuori



// gestione conversioni
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
    // verifica e conversione
    if (valoreDaConvertire.length === 1 &&
        (valoreDaConvertire == "+" ||
        valoreDaConvertire == "-")) {
            risultato.innerHTML = messaggiRisultato.risultatoDefault;
            risultato.classList.remove('risultatoCalcolato');
            return messaggiRisultato.risultatoDefault;
    } else {
        // controllo del valore in ingresso
        const controlloRisultato = controlli[basePrima];
        // calcolo risultato
        if (valoreDaConvertire === "") {
            risultato.innerHTML = messaggiRisultato.risultatoDefault;
            risultato.classList.remove('risultatoCalcolato');
            return messaggiRisultato.risultatoDefault;
        } else if (controlloRisultato.test(valoreDaConvertire)) {
            let numeroConvertito;
            if (valoreDaConvertire.includes('.')) {
                if ((valoreDaConvertire.indexOf('.') + 1) == (valoreDaConvertire.length)) {
                    risultato.innerHTML = messaggiRisultato.valoreIncompleto;
                    risultato.classList.remove('risultatoCalcolato');
                    return messaggiRisultato.valoreIncompleto;
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
        } else {
            risultato.innerHTML = messaggiRisultato.valoreNonValido;
            risultato.classList.remove('risultatoCalcolato');
            return messaggiRisultato.valoreNonValido;
        }
    }
}
function convertiDecimaleConVirgola(valore, basePrima, baseSeconda) {
    const [ parteIntera, parteDecimale ] = valore.split('.');
    let parteInteraConvertita = parseInt(parteIntera, basePrima).toString(baseSeconda);
    let parteDecimaleConvertita = '';
    if (parteDecimale) {
        let decimale = 0;
        for (let i = 0; i < parteDecimale.length; i++) {
            decimale += parseInt(parteDecimale[i], basePrima) / Math.pow(basePrima, i + 1);
        }
        for (let contatore = 0; decimale > 0 && contatore < 10; contatore++) {
            decimale *= baseSeconda;
            const cifra = Math.floor(decimale);
            parteDecimaleConvertita += cifra.toString(baseSeconda);
            decimale -= cifra;
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
    if (primaRappresentazione === "Binario" && (secondaRappresentazione == "C1" || secondaRappresentazione == "C2")) controlloRisultato = controlli["numeriBinariConSegno"]; // binario
    else if (primaRappresentazione === "Binario" && (secondaRappresentazione == "FP32" || secondaRappresentazione == "FP64")) controlloRisultato = controlli[2]; // binario
    else controlloRisultato = controlli["numeriBinari"]; // altre rappresentazioni
    // verifica e rappresentazione
    if (primaRappresentazione === "Binario" &&
        valoreDaRappresentare.length === 1 &&
        (valoreDaRappresentare == "+" ||
        valoreDaRappresentare == "-")) {
            risultato.innerHTML = messaggiRisultato.risultatoDefault;
            risultato.classList.remove('risultatoCalcolato');
    } else if (primaRappresentazione === "Binario" && valoreDaRappresentare.includes('.') &&
        (valoreDaRappresentare.indexOf('.') + 1) == (valoreDaRappresentare.length) &&
        (secondaRappresentazione != "C1" && secondaRappresentazione != "C2")) {
        risultato.innerHTML = messaggiRisultato.valoreIncompleto;
        risultato.classList.remove('risultatoCalcolato');
    } else if ((primaRappresentazione === "C1" || primaRappresentazione === "C2") && valoreDaRappresentare.length === 1) {
        if (controlloRisultato.test(valoreDaRappresentare)) {
            risultato.innerHTML = messaggiRisultato.risultatoDefault;
            risultato.classList.remove('risultatoCalcolato');
        }
        else {
            risultato.innerHTML = messaggiRisultato.valoreNonValido;
            risultato.classList.remove('risultatoCalcolato');
        }
    } else if (primaRappresentazione === "FP32" && valoreDaRappresentare.length != 32) {
        if (valoreDaRappresentare === "") {
            risultato.innerHTML = messaggiRisultato.risultatoDefault;
            risultato.classList.remove('risultatoCalcolato');
        } else if (valoreDaRappresentare.length < 32 && controlloRisultato.test(valoreDaRappresentare)) {
            risultato.innerHTML = messaggiRisultato.valoreIncompleto;
            risultato.classList.remove('risultatoCalcolato');
        } else {
            risultato.innerHTML = messaggiRisultato.valoreNonValido;
            risultato.classList.remove('risultatoCalcolato');
        }
    } else if (primaRappresentazione === "FP64" && valoreDaRappresentare.length != 64) {
        if (valoreDaRappresentare === "") {
            risultato.innerHTML = messaggiRisultato.risultatoDefault;
            risultato.classList.remove('risultatoCalcolato');
        } else if (valoreDaRappresentare.length < 64 && controlloRisultato.test(valoreDaRappresentare)) {
            risultato.innerHTML = messaggiRisultato.valoreIncompleto;
            risultato.classList.remove('risultatoCalcolato');
        } else {
            risultato.innerHTML = messaggiRisultato.valoreNonValido;
            risultato.classList.remove('risultatoCalcolato');
        }
    } else {
        if (valoreDaRappresentare === "") {
            risultato.innerHTML = messaggiRisultato.risultatoDefault;
            risultato.classList.remove('risultatoCalcolato');
        } else if (controlloRisultato.test(valoreDaRappresentare)) {
            let numeroRappresentato = convertiRappresentazione(primaRappresentazione, secondaRappresentazione, valoreDaRappresentare);
            risultato.innerText = numeroRappresentato; // mostra risultato
            risultato.classList.add('risultatoCalcolato');
        } else {
            risultato.innerHTML = messaggiRisultato.valoreNonValido;
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
    let complemento1 = valore;
    if (valore.charAt(0) === "1") {
        complemento1 = (parseInt(valore, 2) - 1).toString(2).padStart(valore.length, '0'); // calcola il complemento a 1
        if (complemento1.length <= valore.length && complemento1.charAt(0) != "1") complemento1 = `1${complemento1}`;
    }
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
    return parseFloat(converti(10, 2, float32View[0].toString())).toString();
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
    return parseFloat(converti(10, 2, float64View[0].toString())).toString();
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
    if (primoInDecimale === messaggiRisultato.risultatoDefault ||
        secondoInDecimale === messaggiRisultato.risultatoDefault) {
        risultatoCalcolato = messaggiRisultato.risultatoDefault;
        risultato.classList.remove('risultatoCalcolato');
    } else if (primoInDecimale === messaggiRisultato.valoreIncompleto ||
        secondoInDecimale === messaggiRisultato.valoreIncompleto) {
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



// gestione dei link esterni
function apriUrl(url) { window.open(url, "_self"); }