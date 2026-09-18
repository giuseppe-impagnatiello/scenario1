// --- stato e utilità localStorage ---
const STORAGE_KEY = 'scenario1_progress';
function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); }
  catch (e) { return {}; }
}
function saveState(s) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {}
}
let state = loadState();

function setActivePhase(n, label) {
  document.getElementById('statusLine').textContent = `fase ${n} di 3`;
  document.querySelectorAll('.phase-item').forEach((el, i) => {
    el.classList.toggle('active', i === n - 1);
  });
}

// --- definizione Fase 1 ---
const phase1 = {
  briefing: `Sono le 09:12. Sul telefono dell'amministratore di rete inizia ad arrivare una serie
  di notifiche push per l'autenticazione a più fattori, non richieste da nessun accesso volontario.`,
  feed: [
    '09:12:04 — richiesta MFA — respinta',
    '09:14:51 — richiesta MFA — respinta',
    '09:19:23 — richiesta MFA — respinta',
    '09:23:47 — richiesta MFA — respinta',
    '09:28:10 — richiesta MFA — respinta'
  ],
  checklist: [
    { id: 'c1', label: "Le richieste non sono state generate da un accesso volontario dell'utente", correct: true },
    { id: 'c2', label: 'Le notifiche si ripetono a distanza di pochi minuti l\'una dall\'altra', correct: true },
    { id: 'c3', label: 'Non è arrivata nessuna comunicazione ufficiale che annunci un controllo di sicurezza', correct: true },
    { id: 'c4', label: 'L\'orario è compatibile con il normale accesso mattutino', correct: false },
    { id: 'c5', label: 'Il nome dell\'app di autenticazione mostrata è quello ufficiale aziendale', correct: false }
  ],
  choices: [
    { id: 'a', label: 'Rifiuta tutte le richieste e segnala subito l\'anomalia all\'IT', correct: true },
    { id: 'b', label: 'Approva l\'ultima richiesta per far smettere le notifiche', correct: false },
    { id: 'c', label: 'Ignora le notifiche, si fermeranno da sole', correct: false },
    { id: 'd', label: 'Contatta l\'IT solo se continuano per più di un\'ora', correct: false }
  ]
};

function renderPhase1() {
    setActivePhase(1);
  const main = document.getElementById('mainView');
  main.innerHTML = `
    <div class="brief">${phase1.briefing}</div>
    <div class="feed">
      ${phase1.feed.map(r => `<div class="row"><span>${r}</span></div>`).join('')}
    </div>
    <div class="qblock">
      <h3>Quali elementi richiedono attenzione?</h3>
      ${phase1.checklist.map(c => `
        <label class="opt"><input type="checkbox" name="check" value="${c.id}"> ${c.label}</label>
      `).join('')}
    </div>
    <div class="qblock">
      <h3>Quale azione intraprenderesti?</h3>
      ${phase1.choices.map(c => `
        <label class="opt"><input type="radio" name="choice" value="${c.id}"> ${c.label}</label>
      `).join('')}
    </div>
    <button class="primary" id="confirmBtn">Conferma scelte</button>
  `;
  document.getElementById('confirmBtn').addEventListener('click', evaluatePhase1);
}

function evaluatePhase1() {
  const checked = Array.from(document.querySelectorAll('input[name="check"]:checked')).map(i => i.value);
  const chosen = document.querySelector('input[name="choice"]:checked');

  const truePositives = phase1.checklist.filter(c => c.correct && checked.includes(c.id)).length;
  const falsePositives = phase1.checklist.filter(c => !c.correct && checked.includes(c.id)).length;
  const totalCorrectIndicators = phase1.checklist.filter(c => c.correct).length;
  const choiceCorrect = chosen && phase1.choices.find(c => c.id === chosen.value)?.correct;

  const indicatorScore = Math.max(0, (truePositives - falsePositives) / totalCorrectIndicators);
  const score = Math.round(((indicatorScore + (choiceCorrect ? 1 : 0)) / 2) * 100);

  state.phase1 = { score, truePositives, falsePositives, choiceCorrect: !!choiceCorrect };
  saveState(state);
  renderDebrief1(score, truePositives, falsePositives, choiceCorrect);
}

function renderDebrief1(score, tp, fp, choiceCorrect) {
  const main = document.getElementById('mainView');
  main.innerHTML = `
    <div class="debrief">
      <div class="score">${score}%</div>
      <div>${tp} indicatori corretti rilevati · ${fp} falsi positivi · decisione ${choiceCorrect ? 'corretta' : 'da rivedere'}</div>
      <div class="cols">
        <div>
          <h4>Indicatori decisivi</h4>
          <ul>${phase1.checklist.filter(c => c.correct).map(c => `<li>${c.label}</li>`).join('')}</ul>
        </div>
        <div>
          <h4>Tecnica impiegata</h4>
          <p style="font-size:13px;line-height:1.6;">MITRE ATT&amp;CK T1621 — MFA Request Generation.
          L'attaccante genera richieste ripetute confidando nella fatica dell'utente, che finisce per
          approvarne una solo per far cessare le notifiche.</p>
        </div>
      </div>
      <div style="margin-top:18px;">
        <button class="primary" id="nextBtn1">Fase successiva</button>
        <button class="secondary" id="repeatBtn">Ripeti fase</button>
      </div>
    </div>
  `;
  document.getElementById('repeatBtn').addEventListener('click', renderPhase1);
    document.getElementById('nextBtn1').addEventListener('click', renderPhase2);
  document.querySelectorAll('.phase-item')[0].classList.add('done');
}

// avvio
goToPhase(1);

// --- definizione Fase 2 ---
const phase2 = {
  briefing: `Sono le 09:35. Un operatore che si presenta come "IT Support Desk" contatta la vittima
  in chat, proprio mentre le notifiche MFA continuano ad arrivare.`,
  chat: [
    { from: 'IT-SUPPORT-DESK', text: 'Buongiorno, la contatto dal supporto IT centrale. Abbiamo rilevato tentativi di accesso sospetti sul suo account e stiamo forzando un ricontrollo MFA.' },
    { from: 'utente.rossi', text: 'Ok, ma non ho richiesto nulla io' },
    { from: 'IT-SUPPORT-DESK', text: 'Lo so, è la procedura automatica di verifica. Le arriveranno delle notifiche sul telefono, le chiedo di approvarle così chiudiamo il ticket prima che le venga bloccato l\'accesso VPN.' },
    { from: 'utente.rossi', text: 'Ne ho già rifiutate parecchie prima' },
    { from: 'IT-SUPPORT-DESK', text: 'Esatto, è il sistema che ritenta. L\'ultima che arriva è quella buona per la chiusura ticket, quella la approvi pure.' }
  ],
  checklist: [
    { id: 'c1', label: 'L\'operatore non fornisce alcun numero di ticket verificabile', correct: true },
    { id: 'c2', label: 'Chiede di approvare una notifica già in corso, non di generarne una nuova tramite procedura ufficiale', correct: true },
    { id: 'c3', label: 'Il contatto avviene su un canale chat non riconducibile ai sistemi IT ufficiali', correct: true },
    { id: 'c4', label: 'Il tono è cortese e professionale', correct: false },
    { id: 'c5', label: 'L\'operatore conosce già lo username dell\'utente', correct: false }
  ],
  choices: [
    { id: 'a', label: 'Interrompi la conversazione e verifica l\'identità dell\'operatore chiamando il numero IT ufficiale già noto', correct: true },
    { id: 'b', label: 'Approva la prossima notifica per chiudere subito il ticket', correct: false },
    { id: 'c', label: 'Chiedi il nome completo dell\'operatore e continua a seguirlo', correct: false },
    { id: 'd', label: 'Segui le istruzioni ma senza approvare nulla, per sicurezza', correct: false }
  ]
};

function renderPhase2() {
      setActivePhase(2);
  const main = document.getElementById('mainView');
  main.innerHTML = `
    <div class="brief">${phase2.briefing}</div>
    <div class="feed">
      ${phase2.chat.map(m => `<div class="row"><span><strong>${m.from}:</strong> ${m.text}</span></div>`).join('')}
    </div>
    <div class="qblock">
      <h3>Quali elementi richiedono attenzione?</h3>
      ${phase2.checklist.map(c => `<label class="opt"><input type="checkbox" name="check2" value="${c.id}"> ${c.label}</label>`).join('')}
    </div>
    <div class="qblock">
      <h3>Quale azione intraprenderesti?</h3>
      ${phase2.choices.map(c => `<label class="opt"><input type="radio" name="choice2" value="${c.id}"> ${c.label}</label>`).join('')}
    </div>
    <button class="primary" id="confirmBtn2">Conferma scelte</button>
  `;
  document.getElementById('confirmBtn2').addEventListener('click', evaluatePhase2);
}

function evaluatePhase2() {
  const checked = Array.from(document.querySelectorAll('input[name="check2"]:checked')).map(i => i.value);
  const chosen = document.querySelector('input[name="choice2"]:checked');

  const truePositives = phase2.checklist.filter(c => c.correct && checked.includes(c.id)).length;
  const falsePositives = phase2.checklist.filter(c => !c.correct && checked.includes(c.id)).length;
  const totalCorrectIndicators = phase2.checklist.filter(c => c.correct).length;
  const choiceCorrect = chosen && phase2.choices.find(c => c.id === chosen.value)?.correct;

  const indicatorScore = Math.max(0, (truePositives - falsePositives) / totalCorrectIndicators);
  const score = Math.round(((indicatorScore + (choiceCorrect ? 1 : 0)) / 2) * 100);

  state.phase2 = { score, truePositives, falsePositives, choiceCorrect: !!choiceCorrect };
  saveState(state);
  renderDebrief2(score, truePositives, falsePositives, choiceCorrect);
}

function renderDebrief2(score, tp, fp, choiceCorrect) {
  const main = document.getElementById('mainView');
  main.innerHTML = `
    <div class="debrief">
      <div class="score">${score}%</div>
      <div>${tp} indicatori corretti rilevati · ${fp} falsi positivi · decisione ${choiceCorrect ? 'corretta' : 'da rivedere'}</div>
      <div class="cols">
        <div>
          <h4>Indicatori decisivi</h4>
          <ul>${phase2.checklist.filter(c => c.correct).map(c => `<li>${c.label}</li>`).join('')}</ul>
        </div>
        <div>
          <h4>Tecnica impiegata</h4>
          <p style="font-size:13px;line-height:1.6;">MITRE ATT&amp;CK T1656 — Impersonation.
          L'attaccante si finge un ruolo di fiducia (supporto IT) per fornire un pretesto tecnico
          plausibile nel momento esatto in cui la vittima è più vulnerabile alla richiesta.</p>
        </div>
      </div>
      <div style="margin-top:18px;">
        <button class="primary" id="nextBtn2">Fase successiva</button>
        <button class="secondary" id="repeatBtn2">Ripeti fase</button>
      </div>
    </div>
  `;
  document.getElementById('repeatBtn2').addEventListener('click', renderPhase2);
    document.getElementById('nextBtn2').addEventListener('click', renderPhase3);
  document.querySelectorAll('.phase-item')[1].classList.add('done');
}

// --- definizione Fase 3 ---
const phase3 = {
  briefing: `Sono le 09:37:30. Il sistema di accesso remoto registra un'autenticazione riuscita,
  immediatamente dopo l'approvazione MFA forzata della Fase 2.`,
  feed: [
    "08:47:15 — AUTH_SUCCESS — user=prof.rossi — src=90.147.22.6 (postazione nota)",
    "09:12:04 — AUTH_FAILURE — user=utente.rossi — src=185.14.22.90 — reason=MFA_TIMEOUT",
    "09:37:30 — AUTH_SUCCESS — user=utente.rossi — src=185.14.22.90 — session=VPN-8841"
  ],
  checklist: [
    { id: 'c1', label: "L'IP dell'accesso riuscito coincide con quello del tentativo fallito delle 09:12", correct: true },
    { id: 'c2', label: "L'accesso avviene esattamente 30 secondi dopo l'approvazione MFA forzata", correct: true },
    { id: 'c3', label: "L'IP è diverso da quello della postazione abituale nota (prof.rossi)", correct: true },
    { id: 'c4', label: "L'orario rientra nel normale orario lavorativo", correct: false },
    { id: 'c5', label: "Lo username coincide con quello dell'accesso precedente legittimo", correct: false }
  ],
  choices: [
    { id: 'a', label: 'Revoca subito la sessione attiva, blocca l\'account e avvia la procedura di incident response', correct: true },
    { id: 'b', label: 'Attendi il prossimo tentativo di accesso per avere conferma', correct: false },
    { id: 'c', label: "Contatta l'utente via email per chiedere se è stato lui", correct: false },
    { id: 'd', label: "Nessuna azione necessaria, l'MFA è stata approvata regolarmente", correct: false }
  ]
};

function renderPhase3() {
  setActivePhase(3);
  const main = document.getElementById('mainView');
  main.innerHTML = `
    <div class="brief">${phase3.briefing}</div>
    <div class="feed">
      ${phase3.feed.map(r => `<div class="row"><span>${r}</span></div>`).join('')}
    </div>
    <div class="qblock">
      <h3>Quali elementi richiedono attenzione?</h3>
      ${phase3.checklist.map(c => `<label class="opt"><input type="checkbox" name="check3" value="${c.id}"> ${c.label}</label>`).join('')}
    </div>
    <div class="qblock">
      <h3>Quale azione intraprenderesti ora?</h3>
      ${phase3.choices.map(c => `<label class="opt"><input type="radio" name="choice3" value="${c.id}"> ${c.label}</label>`).join('')}
    </div>
    <button class="primary" id="confirmBtn3">Conferma scelte</button>
  `;
  document.getElementById('confirmBtn3').addEventListener('click', evaluatePhase3);
}

function evaluatePhase3() {
  const checked = Array.from(document.querySelectorAll('input[name="check3"]:checked')).map(i => i.value);
  const chosen = document.querySelector('input[name="choice3"]:checked');

  const truePositives = phase3.checklist.filter(c => c.correct && checked.includes(c.id)).length;
  const falsePositives = phase3.checklist.filter(c => !c.correct && checked.includes(c.id)).length;
  const totalCorrectIndicators = phase3.checklist.filter(c => c.correct).length;
  const choiceCorrect = chosen && phase3.choices.find(c => c.id === chosen.value)?.correct;

  const indicatorScore = Math.max(0, (truePositives - falsePositives) / totalCorrectIndicators);
  const score = Math.round(((indicatorScore + (choiceCorrect ? 1 : 0)) / 2) * 100);

  state.phase3 = { score, truePositives, falsePositives, choiceCorrect: !!choiceCorrect };
  saveState(state);
  renderDebrief3(score, truePositives, falsePositives, choiceCorrect);
}

function renderDebrief3(score, tp, fp, choiceCorrect) {
  const main = document.getElementById('mainView');
  main.innerHTML = `
    <div class="debrief">
      <div class="score">${score}%</div>
      <div>${tp} indicatori corretti rilevati · ${fp} falsi positivi · decisione ${choiceCorrect ? 'corretta' : 'da rivedere'}</div>
      <div class="cols">
        <div>
          <h4>Indicatori decisivi</h4>
          <ul>${phase3.checklist.filter(c => c.correct).map(c => `<li>${c.label}</li>`).join('')}</ul>
        </div>
        <div>
          <h4>Tecnica impiegata</h4>
          <p style="font-size:13px;line-height:1.6;">MITRE ATT&amp;CK T1078 — Valid Accounts.
          Superata la MFA, l'attaccante accede con credenziali formalmente valide: da questo momento
          il traffico appare legittimo ai sistemi di controllo, il che rende la correlazione temporale
          tra i log l'unico modo per individuare la compromissione.</p>
        </div>
      </div>
      <div style="margin-top:18px;">
        <button class="primary" id="finishBtn">Vai al rapporto finale</button>
        <button class="secondary" id="repeatBtn3">Ripeti fase</button>
      </div>
    </div>
  `;
  document.getElementById('repeatBtn3').addEventListener('click', renderPhase3);
  document.getElementById('finishBtn').addEventListener('click', () => goToPhase(4));
  document.querySelectorAll('.phase-item')[2].classList.add('done');
}

// --- navigazione tra fasi (permette anche di rivedere quelle già completate) ---
function goToPhase(n) {
  if (n === 1) {
    setActivePhase(1);
    state.phase1
      ? renderDebrief1(state.phase1.score, state.phase1.truePositives, state.phase1.falsePositives, state.phase1.choiceCorrect)
      : renderPhase1();
  } else if (n === 2) {
    if (!state.phase1) { alert('Completa prima la Fase 1.'); return; }
    setActivePhase(2);
    state.phase2
      ? renderDebrief2(state.phase2.score, state.phase2.truePositives, state.phase2.falsePositives, state.phase2.choiceCorrect)
      : renderPhase2();
  } else if (n === 3) {
    if (!state.phase2) { alert('Completa prima la Fase 2.'); return; }
    setActivePhase(3);
    state.phase3
      ? renderDebrief3(state.phase3.score, state.phase3.truePositives, state.phase3.falsePositives, state.phase3.choiceCorrect)
      : renderPhase3();
  } else if (n === 4) {
    renderReport();
  }
}

// rende cliccabili le voci del menu laterale
document.querySelectorAll('.phase-item').forEach(item => {
  item.style.cursor = 'pointer';
  item.addEventListener('click', () => goToPhase(Number(item.dataset.phase)));
});

// --- Rapporto finale ---
function renderReport() {
  setActivePhase(4);
  const main = document.getElementById('mainView');
  const phases = [
    { key: 'phase1', label: 'MFA Fatigue', tech: 'T1621', go: 1 },
    { key: 'phase2', label: 'Contatto Help Desk', tech: 'T1656', go: 2 },
    { key: 'phase3', label: 'Esito', tech: 'T1078', go: 3 }
  ];
  const done = phases.filter(p => state[p.key]);
  const avg = done.length
    ? Math.round(done.reduce((sum, p) => sum + state[p.key].score, 0) / done.length)
    : 0;

  main.innerHTML = `
    <div class="brief">
      Fascicolo chiuso. Il rapporto riassume il percorso investigativo sui tre momenti chiave
      dell'incidente: individuazione della MFA fatigue, riconoscimento del pretesto dell'help desk
      fasullo, reazione alla compromissione dell'accesso.
    </div>
    <div class="debrief">
      <div class="score">${avg}%</div>
      <div>punteggio medio su ${done.length} di 3 fasi completate</div>
      ${phases.map(p => {
        const d = state[p.key];
        return `
          <div style="border-top:1px solid var(--line); padding-top:12px; margin-top:14px;">
            <h4 style="margin-bottom:4px;">${p.label} — ${p.tech}</h4>
            ${d
              ? `<p style="font-size:13px;">Punteggio: ${d.score}% · ${d.truePositives} indicatori corretti · ${d.falsePositives} falsi positivi · decisione ${d.choiceCorrect ? 'corretta' : 'da rivedere'}</p>
                 <button class="secondary reopen" data-goto="${p.go}">Rivedi fase</button>`
              : `<p style="font-size:13px; color:var(--ink-dim);">Non ancora completata.</p>`
            }
          </div>`;
      }).join('')}
      <div style="margin-top:20px;">
        <button class="secondary" id="exportBtn">Esporta rapporto JSON</button>
        <button class="secondary" id="resetBtn">Azzera sessione</button>
      </div>
    </div>
  `;

  document.querySelectorAll('.reopen').forEach(btn => {
    btn.addEventListener('click', () => goToPhase(Number(btn.dataset.goto)));
  });

  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rapporto_scenario1.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Azzerare tutti i risultati salvati su questo browser?')) {
      state = {};
      saveState(state);
      goToPhase(1);
    }
  });

  document.querySelectorAll('.phase-item').forEach(el => el.classList.add('done'));
}