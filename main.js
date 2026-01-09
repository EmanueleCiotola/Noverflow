/* 
 * NOVERFLOW PROJECT
 * Developer: Emanuele Ciotola
 * Copyright © 2025. All Rights Reserved.
 * Original logic and UI design.
*/

// ==========================================
// CONFIGURAZIONE & LINGUA
// ==========================================

const DICTIONARY = {
    it: {
        default: "In attesa di input...",
        awaitOp: "In attesa di operando...",
        invalid: "INPUT_NON_VALIDO",
        nan: "NON_È_UN_NUMERO",
        divZero: "ERR_DIV_PER_ZERO",
        wait32: "In attesa di 32 BIT...",
        wait64: "In attesa di 64 BIT...",
        tooLong: "INPUT_TROPPO_LUNGO",
        copiato: "COPIATO_NEGLI_APPUNTI!",
        intOnly: "AMMESSI_SOLO_INTERI",      
        noSign: "SOLO_SENZA_SEGNO" 
    },
    en: {
        default: "Awaiting input...",
        awaitOp: "Awaiting operands...",
        invalid: "INVALID_INPUT",
        nan: "NOT_A_NUMBER",
        divZero: "DIV_BY_ZERO_ERR",
        wait32: "Awaiting 32 bits...",
        wait64: "Awaiting 64 bits...",
        tooLong: "INPUT_TOO_LONG",
        copiato: "COPIED_TO_CLIPBOARD!",
        intOnly: "INTEGERS_ONLY_ALLOWED",      
        noSign: "UNSIGNED_ONLY_ALLOWED" 
    }
};

const currentLang = document.documentElement.lang.substring(0, 2) || 'en';
const MSG = DICTIONARY[currentLang] || DICTIONARY['en'];
const SYSTEM_MSGS = [...Object.values(DICTIONARY.it), ...Object.values(DICTIONARY.en)];

const REGEX = {
    BIN_FLOAT: /[^01.+\-]/g, 
    HEX_FLOAT: /[^0-9a-fA-F.+\-]/g,
    DEC_FLOAT: /[^0-9.+\-]/g
};

// ==========================================
// BOOTSTRAP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initUI(); 
    if (el('elementoDaConvertire')) initConversioni();
    else if (el('operando1')) initALU();
    else if (el('inputRappresentazione')) initRappresentazioni();
});

const el = (id) => document.getElementById(id);

const getVal = (selId) => {
    const element = document.querySelector(`#${selId} .elementoSelezionato`);
    return element ? element.getAttribute('data-value') : null;
};

const print = (text, id = 'risultato', success = true) => {
    const target = el(id);
    if (!target) return;
    target.innerText = text;
    target.classList.toggle('text-glow-green', success && !SYSTEM_MSGS.includes(text));
};

function sanitizza(val, regex) {
    val = val.replace(/,/g, '.'); 
    let segno = "";
    if (val.startsWith('-') || val.startsWith('+')) {
        segno = val[0];
        val = val.substring(1);
    }
    let corpo = val.replace(regex, '').replace(/[+\-]/g, '');
    const parti = corpo.split('.');
    if (parti.length > 2) corpo = parti[0] + '.' + parti.slice(1).join('');
    return segno + corpo;
}

function validaInput(val) {
    if (!val || val === "+" || val === "-") return { ok: false, msg: MSG.default };
    if (val.startsWith('.') || ((val.startsWith('+') || val.startsWith('-')) && val[1] === '.')) {
        return { ok: false, msg: MSG.invalid };
    }

    return { ok: true };
}

function isInputIncomplete(val) {
    return (!val || val === "+" || val === "-" || val.startsWith('.'));
}

// ==========================================
// CONVERSIONI
// ==========================================

function initConversioni() {
    el('elementoDaConvertire').addEventListener('input', (e) => {
        e.target.value = sanitizza(e.target.value, REGEX.HEX_FLOAT);
        calcConversioni();
    });
}

function calcConversioni() {
    const val = el('elementoDaConvertire').value;
    
    let bIn = parseInt(getVal('selettorePrimaBase'));
    let bOut = parseInt(getVal('selettoreSecondaBase'));

    if (isNaN(bIn)) bIn = 10;
    if (isNaN(bOut)) bOut = 10;

    const check = validaInput(val);
    if (!check.ok) return print(check.msg);

    const validChars = getBaseRegex(bIn);
    if (!validChars.test(val.replace(/[+-]/, ''))) return print(MSG.invalid);

    const cleanVal = val.replace(/^[+-]/, '');
    const isNeg = val.startsWith('-');
    const [intP, decP] = cleanVal.split('.');

    let numDec = parseInt(intP, bIn);
    if (isNaN(numDec)) return print(MSG.invalid);

    if (decP && decP.length > 0) {
        for (let i = 0; i < decP.length; i++) {
            numDec += parseInt(decP[i], bIn) / Math.pow(bIn, i + 1);
        }
    }

    let resInt = Math.floor(numDec).toString(bOut);
    let resto = numDec - Math.floor(numDec);
    let resDec = "";

    if (resto > 0) {
        resDec = ".";
        let maxIter = 12;
        while (resto > 0 && maxIter-- > 0) {
            resto *= bOut;
            let digit = Math.floor(resto);
            resDec += digit.toString(bOut);
            resto -= digit;
        }
    }

    print((isNeg ? "-" : "") + (resInt + resDec).toUpperCase());
}

function getBaseRegex(base) {
    if (base === 2) return /^[01.]+$/;
    if (base === 8) return /^[0-7.]+$/;
    if (base === 10) return /^[0-9.]+$/;
    return /^[0-9a-fA-F.]+$/;
}

// ==========================================
// ALU
// ==========================================

let currentOp = '+';

function initALU() {
    const btns = document.querySelectorAll('.btn-op');
    btns.forEach(b => b.addEventListener('click', () => {
        btns.forEach(btn => btn.classList.remove('active'));
        b.classList.add('active');
        currentOp = b.getAttribute('data-op');
        calcALU();
    }));

    const handler = (e) => {
        e.target.value = sanitizza(e.target.value, REGEX.BIN_FLOAT);
        calcALU();
    };
    el('operando1').addEventListener('input', handler);
    el('operando2').addEventListener('input', handler);
}

function calcALU() {
    const v1 = el('operando1').value;
    const v2 = el('operando2').value;

    if (isInputIncomplete(v1) || isInputIncomplete(v2)) {
        if (v1.startsWith('.') || v2.startsWith('.')) return print(MSG.invalid, 'risultatoOperazione', false);
        return print(MSG.awaitOp, 'risultatoOperazione', false);
    }

    const n1 = binToDecFloat(v1);
    const n2 = binToDecFloat(v2);

    if (isNaN(n1) || isNaN(n2)) return print(MSG.invalid, 'risultatoOperazione', false);

    let res = 0;
    switch (currentOp) {
        case '+': res = n1 + n2; break;
        case '-': res = n1 - n2; break;
        case '×': res = n1 * n2; break;
        case '÷': 
            if (n2 === 0) return print(MSG.divZero, 'risultatoOperazione', false);
            res = n1 / n2;
            break;
    }
    print(decToBinFloat(res), 'risultatoOperazione');
}

function binToDecFloat(str) {
    const isNeg = str.startsWith('-');
    const val = str.replace(/^[+-]/, '');
    const [i, d] = val.split('.');
    
    let num = parseInt(i || '0', 2);
    if (d && d.length > 0) {
        for (let k = 0; k < d.length; k++) if (d[k] === '1') num += Math.pow(2, -(k + 1));
    }
    return isNeg ? -num : num;
}

function decToBinFloat(num) {
    if (num === 0) return "0";
    const isNeg = num < 0;
    num = Math.abs(num);
    let iPart = Math.floor(num);
    let fPart = num - iPart;
    let bFrac = "";

    if (fPart > 0) {
        bFrac = ".";
        let max = 10;
        while (fPart > 0 && max-- > 0) {
            fPart *= 2;
            bFrac += (fPart >= 1 ? "1" : "0");
            if (fPart >= 1) fPart -= 1;
        }
    }
    return (isNeg ? "-" : "") + iPart.toString(2) + bFrac;
}

// ==========================================
// RAPPRESENTAZIONI
// ==========================================

// ==========================================
// RAPPRESENTAZIONI
// ==========================================

function initRappresentazioni() {
    el('inputRappresentazione').addEventListener('input', (e) => {
        e.target.value = sanitizza(e.target.value, REGEX.DEC_FLOAT);
        calcRep();
    });
}

function calcRep() {
    const val = el('inputRappresentazione').value;
    const typeIn = getVal('selettoreSorgenteRep') || 'DEC';     
    const typeOut = getVal('selettoreDestinazioneRep') || 'SM'; 
    const outID = 'risultatoRappresentazione';

    if (typeIn.includes('IEEE') || typeIn.includes('C1') || typeIn.includes('C2')) {
        if (val.includes('+') || val.includes('-')) {
            return print(MSG.noSign, outID, false);
        }
    }

    // 1. Controllo validità sintattica di base (gestisce stringhe vuote, solo punti, ecc.)
    const check = validaInput(val);
    if (!check.ok) return print(check.msg, outID, false);

    // 2. Validazione Specifica per Tipo Sorgente (Caratteri non ammessi)
    
    // CASO A: Formati "Raw Bits" 
    if (typeIn.includes('IEEE') || typeIn.includes('C1') || typeIn.includes('C2')) {
        if (val.includes('.')) return print(MSG.intOnly, outID, false);
        if (/[^01]/.test(val)) return print(MSG.invalid, outID, false);
    }
    
    // CASO B: Segno e Modulo (Binario Puro con Segno)
    else if (typeIn.includes('SM')) {
        if (/[^01.+\-]/.test(val)) return print(MSG.invalid, outID, false);
    }

    // CASO C: Decimale (già gestito dalla sanitizzazione di base)

    let numJS;
    let inputBits = val.length; 

    // 3. Logica di Parsing (Input -> Numero JS)
    if (typeIn === 'DEC') {
        numJS = parseFloat(val);
    } 
    else {
        if (typeIn.includes('IEEE')) {
            if (typeIn.includes('FP32')) {
                if (inputBits < 32) return print(MSG.wait32, outID, false);
                if (inputBits > 32) return print(MSG.tooLong, outID, false);
                numJS = rawBinToFloat(val, 32);
            } else { // FP64
                if (inputBits < 64) return print(MSG.wait64, outID, false);
                if (inputBits > 64) return print(MSG.tooLong, outID, false);
                numJS = rawBinToFloat(val, 64);
            }
        }
        else if (typeIn.includes('C1')) {
            if (val[0] === '0') numJS = parseInt(val, 2);
            else {
                const inverted = val.split('').map(b => b === '1' ? '0' : '1').join('');
                numJS = -parseInt(inverted, 2);
            }
        }
        else if (typeIn.includes('C2')) {
            if (val[0] === '0') numJS = parseInt(val, 2);
            else {
                const raw = parseInt(val, 2);
                const max = Math.pow(2, val.length);
                numJS = raw - max;
            }
        }
        else if (typeIn.includes('SM')) {
            numJS = binToDecFloat(val);
        }
    }

    if (isNaN(numJS)) return print(MSG.nan, outID, false);

    // 4. Controllo compatibilità Output
    if ((typeOut.includes('C1') || typeOut.includes('C2')) && !Number.isInteger(numJS)) {
        return print(MSG.intOnly, outID, false);
    }

    // 5. Generazione Output
    let res = numJS;

    if (typeOut === 'DEC') {
        res = numJS.toString();
    }
    else if (typeOut.includes('SM')) res = decToBinFloat(numJS);
    else if (typeOut.includes('C1')) res = calcC1(Math.trunc(numJS), inputBits);
    else if (typeOut.includes('C2')) res = calcC2(Math.trunc(numJS), inputBits);
    else if (typeOut.includes('FP32')) res = floatToIEEE(numJS, 32);
    else if (typeOut.includes('FP64')) res = floatToIEEE(numJS, 64);

    print(res, outID);
}

function calcC1(num, forcedBits = null) {
    if (num === 0) return forcedBits ? "0".repeat(forcedBits) : "0";
    const abs = Math.abs(num);
    const binStr = abs.toString(2);
    let minBits = binStr.length + 1;
    let bits = (forcedBits && forcedBits >= minBits) ? forcedBits : minBits;

    if (num > 0) return binStr.padStart(bits, '0');
    else {
        let padded = binStr.padStart(bits, '0');
        return padded.split('').map(b => b === '1' ? '0' : '1').join('');
    }
}

function calcC2(num, forcedBits = null) {
    if (num === 0) return forcedBits ? "0".repeat(forcedBits) : "0";
    const abs = Math.abs(num);
    const isPowerOfTwo = (abs & (abs - 1)) === 0;
    
    let minBits = abs.toString(2).length;
    if (num > 0 || !isPowerOfTwo) minBits += 1; 

    let bits = (forcedBits && forcedBits >= minBits) ? forcedBits : minBits;

    if (num > 0) return abs.toString(2).padStart(bits, '0');
    else {
        const max = Math.pow(2, bits);
        const c2Val = max - abs;
        return c2Val.toString(2).padStart(bits, '0');
    }
}

function floatToIEEE(num, bits) {
    const buf = new ArrayBuffer(bits === 64 ? 8 : 4);
    const view = new DataView(buf);
    bits === 64 ? view.setFloat64(0, num, false) : view.setFloat32(0, num, false);
    let bin = '';
    new Uint8Array(buf).forEach(b => bin += b.toString(2).padStart(8, '0'));
    if (bits === 32) return `${bin[0]}  ${bin.slice(1, 9)}  ${bin.slice(9)}`;
    return `${bin[0]}  ${bin.slice(1, 12)}  ${bin.slice(12)}`;
}

function rawBinToFloat(str, bits) {
    if (str.length !== bits) return NaN;

    const buffer = new ArrayBuffer(bits === 64 ? 8 : 4);
    const view = new DataView(buffer);
    const bytes = new Uint8Array(buffer);

    for (let i = 0; i < bits / 8; i++) {
        const byteStr = str.substring(i * 8, (i + 1) * 8);
        const byteVal = parseInt(byteStr, 2);
        // Se c'è un errore di parsing (es. caratteri non binari sfuggiti ai controlli)
        if (isNaN(byteVal)) return NaN;
        bytes[i] = byteVal;
    }

    return bits === 64 ? view.getFloat64(0, false) : view.getFloat32(0, false);
}

// ==========================================
// UI HANDLERS
// ==========================================

function initUI() {
    document.querySelectorAll('.selettore').forEach(sel => {
        sel.addEventListener('click', (e) => {
            e.stopPropagation();
            const list = sel.querySelector('.elementiSelettore');
            const icon = sel.querySelector('.iconaMenuSelezione');
            const isOpen = list.classList.contains('selettoreAperto');
            closeDropdowns();
            if (!isOpen) {
                list.classList.add('selettoreAperto');
                icon.classList.add('selettoreAperto');
            }
        });

        sel.querySelector('.elementiSelettore').addEventListener('click', (e) => {
            e.stopPropagation();
            if (e.target.tagName === 'LI') {
                const newText = e.target.innerText;
                const newValue = e.target.getAttribute('data-value');
                const partnerID = getPartner(sel.id);

                if (partnerID && getVal(partnerID) === newValue) {
                    executeSwitch(sel.id, partnerID);
                } else {
                    const elSel = sel.querySelector('.elementoSelezionato');
                    elSel.innerText = newText;
                    elSel.setAttribute('data-value', newValue); 
                    sel.querySelectorAll('li').forEach(l => l.classList.remove('selezionatoDaSelettore'));
                    e.target.classList.add('selezionatoDaSelettore');
                    closeDropdowns();
                    triggerUpdate();
                }
            }
        });
    });

    document.addEventListener('click', closeDropdowns);
    initObservers();

    window.addEventListener('resize', () => {
        // Se lo schermo supera i 750px E il menu è aperto forziamo la chiusura passando 'false'
        if (window.innerWidth > 750) {
            const m = el('mobileMenu');
            if (m && m.classList.contains('open')) {
                toggleMobileMenu(false);
            }
        }
    });
}

const getPartner = (id) => ({
    'selettorePrimaBase': 'selettoreSecondaBase',
    'selettoreSecondaBase': 'selettorePrimaBase',
    'selettoreSorgenteRep': 'selettoreDestinazioneRep',
    'selettoreDestinazioneRep': 'selettoreSorgenteRep'
}[id]);

function executeSwitch(id1, id2) {
    const isConv = id1.includes('Base');
    const inputId = isConv ? 'elementoDaConvertire' : 'inputRappresentazione';
    const outputId = isConv ? 'risultato' : 'risultatoRappresentazione';

    const s1 = document.querySelector(`#${id1} .elementoSelezionato`);
    const s2 = document.querySelector(`#${id2} .elementoSelezionato`);
    
    const tmpText = s1.innerText; s1.innerText = s2.innerText; s2.innerText = tmpText;
    const tmpVal = s1.getAttribute('data-value');
    s1.setAttribute('data-value', s2.getAttribute('data-value'));
    s2.setAttribute('data-value', tmpVal);

    [id1, id2].forEach(id => {
        const val = getVal(id);
        document.querySelectorAll(`#${id} li`).forEach(li => {
            li.classList.toggle('selezionatoDaSelettore', li.getAttribute('data-value') === val);
        });
    });

    const outTxt = el(outputId).innerText;
    const inpField = el(inputId);

    if (!SYSTEM_MSGS.includes(outTxt)) {
        let cleanVal = outTxt.replace(/\s+/g, '');
        const destType = getVal(id1.includes('Sorgente') ? id1 : id2) || '';
        if (destType.includes('IEEE') || destType.includes('C1') || destType.includes('C2')) {
            cleanVal = cleanVal.replace(/^[+-]/, '');
        }
        inpField.value = cleanVal;
    }

    const btn = document.querySelector('.btn-switch-base');
    if(btn) {
        btn.classList.add('ruota-attiva');
        setTimeout(() => btn.classList.remove('ruota-attiva'), 300);
    }
    closeDropdowns();
    triggerUpdate();
}

window.switchaSelettori = (id1, id2) => executeSwitch(id1, id2);

function closeDropdowns() {
    document.querySelectorAll('.selettoreAperto').forEach(e => e.classList.remove('selettoreAperto'));
}

function triggerUpdate() {
    if (el('elementoDaConvertire')) calcConversioni();
    else if (el('inputRappresentazione')) calcRep();
}

function initObservers() {
    const obs = new IntersectionObserver(es => es.forEach(e => {
        if(e.isIntersecting) e.target.classList.add('mostrato');
    }), { threshold: 0.1 });
    document.querySelectorAll('.osservato').forEach(el => obs.observe(el));
}

window.toggleMobileMenu = (force) => {
    const m = el('mobileMenu');
    const b = document.querySelector('.mobile-trigger');
    
    const isOpen = typeof force === 'boolean' ? force : !m.classList.contains('open');
    m.classList.toggle('open', isOpen);
    b.classList.toggle('open', isOpen);
    b.setAttribute('aria-expanded', isOpen);
    
    document.body.style.overflow = isOpen ? 'hidden' : '';
};

window.copiaNegliAppunti = () => {
    const txt = document.querySelector('.monitor-result-text')?.innerText;
    if (!txt || SYSTEM_MSGS.includes(txt)) return;
    
    navigator.clipboard.writeText(txt).then(() => {
        const lbl = el('copy-label');
        if(lbl) {
            const old = lbl.innerText;
            lbl.innerText = MSG.copiato;
            lbl.style.color = "var(--bgColor)";
            el('result-header').style.background = "var(--primaryColor)";
            el('copy-icon').style.color = "var(--bgColor)";
            setTimeout(() => {
                lbl.innerText = old;
                lbl.style.color = "";
                el('result-header').style.background = "";
                el('copy-icon').style.color = "";
            }, 1500);
        }
    });
};

window.apriUrl = (url) => window.location.href = url;