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
        <button class="secondary" id="repeatBtn">Ripeti fase</button>
      </div>
    </div>
  `;
  document.getElementById('repeatBtn').addEventListener('click', renderPhase1);
  document.querySelectorAll('.phase-item')[0].classList.add('done');
}

// avvio
renderPhase1();

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
  document.querySelectorAll('.phase-item')[1].classList.add('active');
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
        <button class="secondary" id="repeatBtn2">Ripeti fase</button>
      </div>
    </div>
  `;
  document.getElementById('repeatBtn2').addEventListener('click', renderPhase2);
  document.querySelectorAll('.phase-item')[1].classList.add('done');
}