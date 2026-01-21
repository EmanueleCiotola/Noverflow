# Noverflow

Toolkit binario all-in-one per conversioni di base, rappresentazioni (C1, C2, IEEE 754) e aritmetica binaria stile ALU, pensato per studenti di Informatica e Ingegneria.

## Live Demo
- IT: https://emanueleciotola.github.io/Noverflow/
- EN: https://emanueleciotola.github.io/Noverflow/en/

## Perché usarlo
- Unico punto d'accesso: conversioni, rappresentazioni e operazioni binarie senza saltare tra mille tool diversi.
- Pensato per lo studio: messaggi chiari (IT/EN), controlli sugli input e formati compatibili con gli esami di Fondamenti di Informatica e Architettura degli Elaboratori.

## Cosa fa (in breve)
- Conversioni: basi 2/8/10/16, parte frazionaria inclusa, switch istantaneo tra sorgente e destinazione.
- Rappresentazioni: Binario con segno, C1, C2, IEEE 754 FP32/FP64.
- Operazioni: addizione, sottrazione, moltiplicazione e divisione con numeri binari.

## Moduli principali
- Home: panoramica dei tre moduli e accesso rapido.
- Conversioni: selettori sincronizzati di base, validazione input e algoritmo frazionario ad alta precisione.
- Rappresentazioni: conversione tra formati interi e floating, parsing raw bitstring (FP32/FP64) e generazione di mantissa/esponente normalizzati.
- Operazioni: simulatore ALU con scelta operatore, parsing binario con segno e controllo dell'input.

## Avvio rapido in locale
1) Clona o scarica il progetto.
2) Apri `index.html` in un browser moderno **oppure** lancia un server statico (es. `npx serve .`).
3) Visita le pagine: `conversioni.html`, `rappresentazioni.html`, `operazioni.html`.

## Stack e scelte tecniche
- HTML + CSS custom (tema retro/console, layout responsive) senza framework.
- JavaScript vanilla in `main.js` per UI, validazioni, e logica generale.
- i18n semplice basato sul `lang` del documento (it/en).

## Segnala un bug o suggerisci una feature
Apri una Issue su GitHub descrivendo: pagina, input inseriti, output atteso e browser usato. Screenshot o video sono molto utili.

## Licenza
Vedi [LICENSE](LICENSE). Il codice, la logica e il design sono protetti da copyright: ogni riuso richiede autorizzazione esplicita dell'autore.
