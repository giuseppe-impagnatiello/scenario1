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