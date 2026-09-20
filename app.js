// ============ UTILITY ============
function shuffledIndices(n) {
  const arr = Array.from({ length: n }, (_, i) => i);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function escapeHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ============ DATI DEGLI SCENARI ============
const SCENARIOS = [
  { id: 'uber', title: 'Scenario 1 — Uber', subtitle: 'Accesso VPN compromesso', phases: [
    { label: 'MFA Fatigue',
      briefing: `Sono le 09:12. Sul telefono dell'amministratore di rete inizia ad arrivare una serie di notifiche push per l'autenticazione a più fattori, non richieste da nessun accesso volontario.`,
      feed: [
        { file: 'mfa_request.csv' },
        '09:12:04 — richiesta MFA — respinta','09:14:51 — richiesta MFA — respinta','09:19:23 — richiesta MFA — respinta','09:23:47 — richiesta MFA — respinta','09:28:10 — richiesta MFA — respinta'
      ],
      checklist: [
        { t: "Le richieste non sono state generate da un accesso volontario dell'utente", c: true },
        { t: "Le notifiche si ripetono a distanza di pochi minuti l'una dall'altra", c: true },
        { t: 'Non è arrivata nessuna comunicazione ufficiale che annunci un controllo di sicurezza', c: true },
        { t: "L'orario è compatibile con il normale accesso mattutino", c: false },
        { t: "Ogni richiesta MFA riporta un orario preciso al secondo", c: false }
      ],
      choices: [
        { t: "Rifiuta tutte le richieste e segnala subito l'anomalia all'IT", c: true },
        { t: "Approva l'ultima richiesta per far smettere le notifiche", c: false },
        { t: 'Ignora le notifiche, si fermeranno da sole', c: false },
        { t: "Contatta l'IT solo se continuano per più di un'ora", c: false }
      ],
      tech: { code: 'T1621', name: 'MFA Request Generation', text: "L'attaccante genera richieste ripetute confidando nella fatica dell'utente, che finisce per approvarne una solo per far cessare le notifiche.",
        also: 'Cyber Kill Chain: Delivery · CSE Kill Chain: sfruttamento della fiducia nel sistema MFA' }
    },
    { label: 'Contatto Help Desk',
      briefing: `Sono le 09:35. Un operatore che si presenta come "IT Support Desk" contatta la vittima in chat, proprio mentre le notifiche MFA continuano ad arrivare.`,
      feed: [
        { file: 'log_chat_helpdesk.txt' },
        { from: 'IT-SUPPORT-DESK', text: 'Buongiorno, la contatto dal supporto IT centrale. Abbiamo rilevato tentativi di accesso sospetti sul suo account e stiamo forzando un ricontrollo MFA.' },
        { from: 'utente.rossi', text: 'Ok, ma non ho richiesto nulla io' },
        { from: 'IT-SUPPORT-DESK', text: "Lo so, è la procedura automatica di verifica. Le arriveranno delle notifiche sul telefono, le chiedo di approvarle così chiudiamo il ticket prima che le venga bloccato l'accesso VPN." },
        { from: 'utente.rossi', text: 'Ne ho già rifiutate parecchie prima' },
        { from: 'IT-SUPPORT-DESK', text: "Esatto, è il sistema che ritenta. L'ultima che arriva è quella buona per la chiusura ticket, quella la approvi pure." }
      ],
      checklist: [
        { t: "L'operatore non fornisce alcun numero di ticket verificabile", c: true },
        { t: 'Chiede di approvare una notifica già in corso, non di generarne una nuova tramite procedura ufficiale', c: true },
        { t: 'Il contatto avviene su un canale chat non riconducibile ai sistemi IT ufficiali', c: true },
        { t: "Fa leva sulla minaccia di un blocco imminente dell'accesso per spingere all'azione immediata", c: true },
        { t: 'Il tono è cortese e professionale', c: false }
      ],
      choices: [
        { t: "Interrompi la conversazione e verifica l'identità dell'operatore chiamando il numero IT ufficiale già noto", c: true },
        { t: 'Approva la prossima notifica per chiudere subito il ticket', c: false },
        { t: "Chiedi il nome completo dell'operatore e continua a seguirlo", c: false },
        { t: 'Segui le istruzioni ma senza approvare nulla, per sicurezza', c: false }
      ],
      tech: { code: 'T1656', name: 'Impersonation', text: "L'attaccante si finge un ruolo di fiducia (supporto IT) per fornire un pretesto tecnico plausibile nel momento esatto in cui la vittima è più vulnerabile alla richiesta.",
        also: 'Cyber Kill Chain: Exploitation · CSE Kill Chain: contatto e ingaggio (pretexting)' }
    },
    { label: 'Esito',
      briefing: `Sono le 09:37:30. Il sistema di accesso remoto registra un'autenticazione riuscita, immediatamente dopo l'approvazione MFA forzata della Fase 2.`,
      feed: [
        { file: 'vpn_access.log' },
        '08:47:15 — AUTH_SUCCESS — user=prof.rossi — src=90.147.22.6 (postazione nota)','09:12:04 — AUTH_FAILURE — user=utente.rossi — src=185.14.22.90 — reason=MFA_TIMEOUT','09:37:30 — AUTH_SUCCESS — user=utente.rossi — src=185.14.22.90 — session=VPN-8841'
      ],
      checklist: [
        { t: "L'IP dell'accesso riuscito coincide con quello del tentativo fallito delle 09:12", c: true },
        { t: "L'accesso avviene esattamente 30 secondi dopo l'approvazione MFA forzata", c: true },
        { t: "L'IP è diverso da quello della postazione abituale nota (prof.rossi)", c: true },
        { t: "L'orario rientra nel normale orario lavorativo", c: false },
        { t: "Lo username coincide con quello dell'accesso precedente legittimo", c: false }
      ],
      choices: [
        { t: "Revoca subito la sessione attiva, blocca l'account e avvia la procedura di incident response", c: true },
        { t: 'Attendi il prossimo tentativo di accesso per avere conferma', c: false },
        { t: "Contatta l'utente via email per chiedere se è stato lui", c: false },
        { t: "Nessuna azione necessaria, l'MFA è stata approvata regolarmente", c: false }
      ],
      tech: { code: 'T1078', name: 'Valid Accounts', text: "Superata la MFA, l'attaccante accede con credenziali formalmente valide: da questo momento il traffico appare legittimo ai sistemi di controllo, il che rende la correlazione temporale tra i log l'unico modo per individuare la compromissione.",
        also: 'Cyber Kill Chain: Installation / Actions on Objectives · CSE Kill Chain: esecuzione dell\'azione' }
    }
  ]},

  { id: 'arup', title: 'Scenario 2 — Arup', subtitle: 'Frode tramite contenuti sintetici', phases: [
    { label: 'Email sospetta',
      briefing: `Arriva una email che si presenta come richiesta urgente e riservata da parte del CFO, riguardante un trasferimento di fondi.`,
      feed: [
        { file: 'urgent_request.eml' },
        'From: CFO <c.finance@arup-group.com>','Return-Path: <ops@arup-grp-finance.com>','Auth-Results: spf=fail dkim=fail','Oggetto: Operazione riservata — azione richiesta entro oggi','Corpo: "Serve la tua autorizzazione per un pagamento confidenziale, non discuterne con nessuno per ora."'
      ],
      checklist: [
        { t: 'Il campo Return-Path punta a un dominio diverso da quello del mittente visualizzato', c: true },
        { t: 'I controlli automatici anti-frode dell\'email (SPF, DKIM), visibili nell\'intestazione, risultano entrambi "fail"', c: true },
        { t: 'Il messaggio è scritto in un italiano formale e corretto', c: false },
        { t: 'Il messaggio ha un oggetto (subject) compilato', c: false },
        { t: 'Il messaggio include allegati sospetti', c: false }
      ],
      choices: [
        { t: "Verificare l'autenticità tramite un canale separato prima di qualsiasi azione", c: true },
        { t: 'Rispondere chiedendo conferma via email allo stesso mittente', c: false },
        { t: "Procedere e coinvolgere subito l'ufficio pagamenti", c: false },
        { t: 'Ignorare la richiesta senza segnalarla', c: false }
      ],
      tech: { code: 'T1656', name: 'Impersonation', text: "L'header contraffatto simula l'identità di un dirigente per legittimare la richiesta agli occhi del destinatario.",
        also: 'Cyber Kill Chain: Delivery · CSE Kill Chain: sviluppo del pretesto' }
    },
    { label: 'Videochiamata',
      briefing: `Segue una videochiamata in cui una persona dall'aspetto e dalla voce del CFO conferma la richiesta, insistendo su urgenza e riservatezza.`,
      feed: [
        { file: 'video_call_transcript.txt' },
        { from: 'CFO (voce)', text: "Deve restare tra noi, è un'operazione riservata e il tempo stringe." },
        { from: 'Assistente', text: 'Capito, procedo non appena confermato.' },
        { file: 'video_metadata.json' },
        'codec: H.264 / Opus — risoluzione: 1080p',
        'device: OBS Virtual Camera',
        'renderer: DeepFaceLab_GAN_Renderer_v2.0'
      ],
      checklist: [
        { t: 'Il nome del file di rendering ("DeepFaceLab_GAN_Renderer") richiama apertamente strumenti di generazione di volti sintetici (deepfake) tramite intelligenza artificiale', c: true },
        { t: 'Durante la chiamata viene richiesta esplicitamente riservatezza e urgenza', c: true },
        { t: 'Il dispositivo video indicato è una virtual camera anziché una webcam fisica', c: true },
        { t: 'Il video ha una risoluzione elevata (1080p)', c: false },
        { t: 'Il codec audio utilizzato (Opus) è uno standard comune', c: false }
      ],
      choices: [
        { t: "Interrompere la videochiamata e verificare l'identità tramite un canale indipendente noto", c: true },
        { t: "Procedere con la richiesta vista l'urgenza dichiarata", c: false },
        { t: 'Richiedere ulteriori dettagli ma continuare nella stessa chiamata', c: false },
        { t: 'Segnalare solo a fine giornata', c: false }
      ],
      tech: { code: 'T0087.001', name: 'Develop AI-Generated Video (DISARM)', text: "La componente audiovisiva sintetica rafforza la credibilità dell'impersonificazione, aggirando la naturale diffidenza verso una semplice richiesta scritta.",
        also: 'Cyber Kill Chain: Exploitation · MITRE ATT&CK: affine a T1656 (Impersonation)' }
    },
    { label: 'Esito',
      briefing: `Il bonifico viene autorizzato sulla base delle sole comunicazioni ricevute.`,
      feed: [
        { file: 'wire_transfer_auth.pdf' },
        'Beneficiario: nuovo fornitore, non presente in anagrafica abituale','IBAN: CH93 1234 5678 9012 3456 7','Importo: € 340.000 — soglia doppia approvazione: € 100.000','Verifica su canale secondario: NON registrata'
      ],
      checklist: [
        { t: 'Il bonifico è stato autorizzato senza verifica su un canale secondario', c: true },
        { t: "L'IBAN di destinazione non risulta tra quelli abitualmente utilizzati dal fornitore", c: true },
        { t: "L'importo supera la soglia che richiederebbe una doppia approvazione", c: true },
        { t: 'Il bonifico è stato effettuato in euro, la valuta abituale dei pagamenti aziendali', c: false },
        { t: 'Il nome del beneficiario coincide con un fornitore già presente in anagrafica', c: false }
      ],
      choices: [
        { t: 'Bloccare immediatamente il bonifico se non ancora eseguito e avviare la segnalazione alla banca e al CERT aziendale', c: true },
        { t: 'Attendere la prossima riunione per discuterne', c: false },
        { t: 'Contattare il presunto CFO via email per conferma a posteriori', c: false },
        { t: 'Non fare nulla, la procedura è stata seguita', c: false }
      ],
      tech: { code: 'T1657', name: 'Financial Theft', text: "Il trasferimento fraudolento costituisce l'obiettivo finale della catena di inganno avviata con l'email e rafforzata dalla videochiamata sintetica.",
        also: "Cyber Kill Chain: Actions on Objectives · CSE Kill Chain: esecuzione dell'azione" }
    }
  ]},

  { id: 'twitter', title: 'Scenario 3 — Twitter', subtitle: 'Compromissione via vishing e OSINT', phases: [
    { label: 'Ricognizione OSINT',
      briefing: `Durante l'attività di incident response, l'analista ricostruisce quali informazioni sulla vittima fossero pubblicamente disponibili prima dell'attacco, e che l'attaccante ha verosimilmente utilizzato per costruire un pretesto credibile.`,
      feed: [
        { file: 'employee_profile.txt' },
        '"disservizi sul portale vpn.twitter-corp.com ancora nel weekend..." — post pubblico','Menzioni a colleghi del reparto IT (es. "Marco dell\'IT")','Orari di lavoro abituali dedotti da post ricorrenti'
      ],
      checklist: [
        { t: 'Il profilo raccoglie lamentele pubbliche della vittima sulla VPN', c: true },
        { t: 'Il documento riporta dettagli personali dedotti da più post pubblici (nomi di colleghi, orari abituali)', c: true },
        { t: 'Il documento è stato ottenuto da fonti riservate aziendali', c: false },
        { t: 'Il documento è redatto in formato PDF', c: false },
        { t: "Il profilo cita esplicitamente l'indirizzo di casa della vittima", c: false }
      ],
      choices: [
        { t: "Documentare l'esposizione informativa come fattore abilitante dell'attacco nel rapporto", c: true },
        { t: 'Considerare l\'esposizione irrilevante, poiché si tratta solo di informazioni pubbliche', c: false },
        { t: 'Richiedere la rimozione immediata di tutti i contenuti pubblici della vittima dai social media', c: false },
        { t: 'Procedere direttamente alla fase successiva senza annotare la fonte dell\'esposizione', c: false }
      ],
      tech: { code: 'T1589.002', name: 'Gather Victim Identity Information: Social Media', text: "La ricognizione su fonti aperte fornisce all'attaccante i dettagli necessari a rendere credibile il pretesto della fase successiva.",
        also: 'Cyber Kill Chain: Reconnaissance · CSE Kill Chain: ricognizione' }
    },
    { label: 'Vishing',
      briefing: `Ore 11:42. Un operatore telefonico, citando dettagli raccolti nella ricognizione, contatta la vittima presentandosi come supporto IT.`,
      feed: [
        { file: 'call_transcript.txt' },
        '11:42 — chiamata in arrivo, numero non riconosciuto',
        { from: 'Operatore', text: "Buongiorno, la contatto per il ticket sui disservizi VPN — ne parlava anche Marco dell'IT nei giorni scorsi." },
        { from: 'm.conti', text: 'Ah sì, finalmente!' },
        { from: 'Operatore', text: "Le mando il link per riconfigurare l'accesso: vpn-support-helpdesk.it/login" },
        { file: 'vpn_phishing.html (estratto)' },
        '<form action="https://vpn-support-helpdesk.it/collect.php" method="POST">'
      ],
      checklist: [
        { t: "L'operatore non fornisce alcun codice ticket verificabile", c: true },
        { t: 'Il dominio menzionato per il portale VPN è diverso da quello ufficiale', c: true },
        { t: 'Il codice della pagina mostra che i dati del modulo vengono inviati ("action=") a un indirizzo diverso dal portale VPN ufficiale', c: true },
        { t: 'La chiamata proviene da un numero non riconosciuto', c: true },
        { t: 'La chiamata avviene dal numero ufficiale IT', c: false }
      ],
      choices: [
        { t: 'Interrompere la chiamata e verificare il canale attraverso i contatti IT ufficiali noti', c: true },
        { t: 'Fornire le credenziali per verificare l\'identità come richiesto', c: false },
        { t: 'Richiamare il numero da cui è arrivata la chiamata per conferma', c: false },
        { t: 'Continuare la conversazione senza fornire dati, per curiosità', c: false }
      ],
      tech: { code: 'T1684.001', name: 'Impersonation', text: "L'attaccante sfrutta un canale vocale e informazioni di contesto per costruire fiducia e indirizzare la vittima verso il portale contraffatto.",
        also: 'Cyber Kill Chain: Delivery / Exploitation · CSE Kill Chain: contatto e ingaggio' }
    },
    { label: 'Esito',
      briefing: `Il log del gateway VPN registra un accesso riuscito pochi minuti dopo la telefonata.`,
      feed: [
        { file: 'vpn_auth.log' },
        '16/03 — 08:03:34 — AUTH_SUCCESS — user=m.conti — src=82.50.12.9 — session=VPN-1907',
        '17/03 — 08:05:11 — AUTH_SUCCESS — user=m.conti — src=82.50.12.9 — session=VPN-1187',
        '18/03 — 08:12:47 — AUTH_SUCCESS — user=m.conti — src=82.50.12.9 — session=VPN-1201',
        '19/03 — 08:10:02 — AUTH_SUCCESS — user=m.conti — src=82.50.12.9 — session=VPN-1219',
        '19/03 — 11:47:55 — AUTH_SUCCESS — user=m.conti — src=203.0.113.88 — session=VPN-2291'
      ],
      checklist: [
        { t: "L'IP dell'accesso è nuovo rispetto agli accessi abituali della vittima", c: true },
        { t: "L'accesso avviene pochi minuti dopo la telefonata delle 11:42", c: true },
        { t: 'Il modulo della pagina phishing visto in Fase 2 instrada le credenziali verso un dominio esterno', c: true },
        { t: "L'orario è compatibile con l'attività lavorativa abituale", c: false },
        { t: 'Lo username coincide con quello utilizzato in precedenza', c: false }
      ],
      choices: [
        { t: "Revocare l'accesso, resettare le credenziali e bloccare il dominio phishing", c: true },
        { t: 'Attendere ulteriori accessi per avere conferma', c: false },
        { t: "Notificare solo l'utente via email", c: false },
        { t: "Nessuna azione, l'accesso è avvenuto con credenziali valide", c: false }
      ],
      tech: { code: 'T1078', name: 'Valid Accounts', text: "Come nello Scenario 1, il superamento dell'autenticazione rende l'accesso indistinguibile da uno legittimo senza correlazione temporale con gli eventi precedenti.",
        also: 'Cyber Kill Chain: Installation · CSE Kill Chain: esecuzione dell\'azione' }
    }
  ]},

  { id: 'tecnimont', title: 'Scenario 4 — Tecnimont', subtitle: 'Business Email Compromise', phases: [
    { label: 'Email CEO contraffatta',
      briefing: `Un messaggio a nome del CEO richiede l'esecuzione urgente di un bonifico da € 480.000, con toni di autorità e urgenza.`,
      feed: [
        { file: 'ceo_directive.eml' },
        'From: CEO <ceo@tecnimont.com>','Return-Path: <ops@tecnlmont.com>','Auth-Results: spf=fail dkim=fail dmarc=fail','Oggetto: Bonifico urgente € 480.000 — riservato'
      ],
      checklist: [
        { t: 'Nell\'intestazione, Return-Path e i controlli SPF/DKIM/DMARC risultano anomali', c: true },
        { t: "L'oggetto stesso del messaggio richiede urgenza e riservatezza, tipiche leve di pressione psicologica", c: true },
        { t: 'Il messaggio ha per oggetto un importo espresso in euro', c: false },
        { t: 'Il dominio nel campo Return-Path corrisponde esattamente al dominio ufficiale (tecnimont.com)', c: false },
        { t: 'Il messaggio include un numero di telefono diretto per conferme urgenti', c: false }
      ],
      choices: [
        { t: "Verificare l'autenticità tramite un canale indipendente prima di procedere", c: true },
        { t: 'Inoltrare la direttiva al reparto competente senza ulteriori verifiche', c: false },
        { t: 'Rispondere direttamente chiedendo conferma', c: false },
        { t: "Eseguire la direttiva vista l'urgenza", c: false }
      ],
      tech: { code: 'T1656', name: 'Impersonation', text: "Il dominio typosquattato, visivamente quasi identico all'originale, è pensato per superare un controllo visivo superficiale del client di posta.",
        also: 'Cyber Kill Chain: Delivery · CSE Kill Chain: sviluppo del pretesto' }
    },
    { label: 'Finta conference call',
      briefing: `Una riunione telefonica introduce una persona che si presenta come consulente legale a supporto della richiesta, facendo pressione per saltare le normali procedure di controllo.`,
      feed: [
        { file: 'meeting_minutes.txt' },
        '15:02 — inizio chiamata',
        { from: 'CEO (voce)', text: 'Buongiorno a tutti. Vi ho chiesto di collegarvi anche col nostro consulente, perché su questa operazione serve la massima cautela.' },
        { from: 'Consulente legale', text: 'Buongiorno. Sì, la situazione è delicata: per come è strutturata, questa operazione non può passare dai canali che usate di solito.' },
        { from: 'CFO', text: 'Scusi, non ho presente lo studio che rappresenta — può indicarci qualche riferimento?' },
        { from: 'Consulente legale', text: "Capisco la domanda, ma preferirei non entrare nei dettagli adesso: i tempi sono stretti, concentriamoci sull'operazione." },
        { from: 'CEO (voce)', text: 'Va bene così, andiamo avanti — per questa volta procediamo senza la doppia firma.' },
        '15:09 — fine chiamata'
      ],
      checklist: [
        { t: 'Alla richiesta diretta di specificare lo studio di appartenenza, il consulente evita la domanda', c: true },
        { t: 'Si chiede di saltare il controllo della doppia firma', c: true },
        { t: "Viene fatta pressione sulla riservatezza dell'operazione", c: true },
        { t: 'La riunione si svolge in lingua italiana', c: false },
        { t: 'Tutti i partecipanti sono identificabili tramite canali aziendali noti', c: false }
      ],
      choices: [
        { t: 'Rifiutare e seguire comunque la procedura di doppia firma', c: true },
        { t: "Accettare, vista l'autorità dichiarata dai partecipanti", c: false },
        { t: "Chiedere un secondo parere solo dopo l'operazione", c: false },
        { t: 'Procedere e documentare successivamente', c: false }
      ],
      tech: { code: 'Pretexting', name: 'CSE Kill Chain', text: "La combinazione di autorità percepita, urgenza e riservatezza è la leva psicologica centrale di questa fase, priva di tecnica MITRE dedicata ma ben descritta dalla Cyber Social Engineering Kill Chain.",
        also: 'Cyber Kill Chain: Exploitation · MITRE ATT&CK: affine a T1656' }
    },
    { label: 'Esito',
      briefing: `Il registro del sistema SWIFT documenta l'esecuzione del bonifico da € 480.000.`,
      feed: [
        { file: 'swift_transfer_log.pdf' },
        'Beneficiario: società "NovaTrade Ltd" — non presente tra i fornitori abituali','Importo: € 480.000 — soglia doppia approvazione: € 100.000','Doppia approvazione: NON eseguita'
      ],
      checklist: [
        { t: 'Il trasferimento è stato eseguito senza la doppia approvazione prevista dalla soglia', c: true },
        { t: 'Il beneficiario non è tra i fornitori abituali', c: true },
        { t: "L'importo supera abbondantemente la soglia dichiarata nella direttiva contraffatta", c: true },
        { t: 'Il documento è stato prodotto in formato PDF', c: false },
        { t: 'Il beneficiario è una persona fisica', c: false }
      ],
      choices: [
        { t: 'Bloccare il trasferimento se possibile e avviare la segnalazione bancaria e al CERT', c: true },
        { t: 'Attendere conferma dal CEO reale prima di agire', c: false },
        { t: "Considerare l'operazione conclusa e archiviare", c: false },
        { t: 'Contattare il consulente legale menzionato per chiarimenti', c: false }
      ],
      tech: { code: 'T1657', name: 'Financial Theft', text: "Il bypass della doppia approvazione, ottenuto tramite pressione psicologica nella fase precedente, è la condizione che rende possibile il trasferimento fraudolento.",
        also: "Cyber Kill Chain: Actions on Objectives · CSE Kill Chain: esecuzione dell'azione" }
    }
  ]},

  { id: 'lazio', title: 'Scenario 5 — Regione Lazio', subtitle: 'Ransomware su infrastruttura', phases: [
    { label: 'Phishing e accesso VPN',
      briefing: `Alle 09:38 un'email sfrutta l'urgenza di un aggiornamento del client VPN per indurre l'amministratore di rete a inserire le proprie credenziali su un portale contraffatto. Il portale VPN ufficialmente in uso presso l'ente è raggiungibile all'indirizzo vpn.regione-lazio.it.`,
      feed: [
        { file: 'phishing_lure.eml' },
        'From: IT Support <support@regione-lazio-it.it>','Oggetto: Aggiornamento urgente client VPN richiesto entro le 10:00','Link: hxxps://vpn-regione-lazio-update[.]com/renew',
        { file: 'vpn_gateway_logs.csv' },
        '17/03 — 08:52:14 — AUTH_SUCCESS — user=admin.rete — src=151.20.44.10 — session=VPN-7702',
        '18/03 — 09:03:41 — AUTH_SUCCESS — user=admin.rete — src=151.20.44.10 — session=VPN-7715',
        '19/03 — 09:41:02 — AUTH_SUCCESS — user=admin.rete — src=194.28.10.4 — session=VPN-9931'
      ],
      checklist: [
        { t: "L'email sfrutta l'urgenza di un aggiornamento del client VPN", c: true },
        { t: 'Il link porta a un dominio diverso da quello ufficiale (vpn-regione-lazio-update.com)', c: true },
        { t: "L'accesso delle 09:41 proviene da un IP diverso da quello utilizzato nei giorni precedenti dallo stesso utente", c: true },
        { t: 'Il link nel messaggio utilizza il protocollo HTTPS (hxxps)', c: false },
        { t: 'Il destinatario è un utente generico, non un amministratore', c: false }
      ],
      choices: [
        { t: "Revocare le credenziali compromesse e bloccare l'IP di origine", c: true },
        { t: 'Attendere ulteriori segnali prima di agire', c: false },
        { t: "Notificare solo l'utente coinvolto", c: false },
        { t: "Nessuna azione, l'accesso è avvenuto con credenziali valide", c: false }
      ],
      tech: { code: 'T1566.002', name: 'Spearphishing Link', text: "Il pretesto tecnico (aggiornamento urgente) e il bersaglio privilegiato (un amministratore di rete) massimizzano l'impatto potenziale dell'accesso ottenuto.",
        also: 'Cyber Kill Chain: Delivery / Exploitation · CSE Kill Chain: contatto e ingaggio' }
    },
    { label: 'Movimento laterale',
      briefing: `Nel Domain Controller viene rilevata, successivamente all'accesso della Fase 1, la creazione di una Group Policy — una regola che si applica automaticamente a tutti i computer della rete — non registrata tra le modifiche autorizzate.`,
      feed: [
        { file: 'windows_security_audit.log' },
        '19/03 — 09:15:02 — Event ID 4624 — Logon riuscito — user=admin.rete — workstation=DC01',
        '19/03 — 09:30:47 — Event ID 4624 — Logon riuscito — user=j.verdi — workstation=WS-14',
        '19/03 — 09:47:18 — Event ID 5136 — Directory Service Changes — oggetto modificato: GPO_Emergency_Patch_KB99812 — modificato da: admin.rete',
        '19/03 — 10:02:33 — Event ID 4624 — Logon riuscito — user=admin.rete — workstation=DC01',
        '19/03 — 10:15:09 — Event ID 4627 — Aggiornamento informazioni di gruppo — utente=j.verdi'
      ],
      checklist: [
        { t: "La modifica della GPO avviene pochi minuti dopo l'accesso anomalo delle 09:41 registrato in Fase 1", c: true },
        { t: "La modifica è stata eseguita dallo stesso account (admin.rete) coinvolto nell'accesso anomalo della Fase 1", c: true },
        { t: 'Il nome dell\'oggetto modificato ("GPO_Emergency_Patch_KB99812") imita il formato di un aggiornamento di sicurezza legittimo', c: true },
        { t: 'Gli eventi di logon (Event ID 4624) coinvolgono sempre lo stesso utente', c: false },
        { t: "L'evento Event ID 4627 è avvenuto prima della modifica della GPO", c: false }
      ],
      choices: [
        { t: 'Isolare la GPO malevola, revocarla e avviare threat hunting sugli host coinvolti', c: true },
        { t: 'Attendere la prossima finestra di manutenzione per intervenire', c: false },
        { t: 'Ignorare, le GPO cambiano regolarmente', c: false },
        { t: 'Notificare solo il fornitore del software', c: false }
      ],
      tech: { code: 'T1484.001', name: 'Group Policy Modification', text: "La distribuzione tramite GPO consente all'attaccante di propagare il payload a tutti gli host del dominio con un'unica azione centralizzata.",
        also: "Cyber Kill Chain: Installation · CSE Kill Chain: esecuzione dell'azione (fase a componente tecnica prevalente)" }
    },
    { label: 'Esito',
      briefing: `Sono le 10:22 del 19/03. Un tecnico dell'assistenza segnala diversi computer bloccati con una richiesta di riscatto a schermo. Il report di triage ricostruisce i comandi eseguiti sugli host colpiti, pochi minuti dopo la modifica della GPO vista in Fase 2 (09:47).`,
      feed: [
        { file: 'encrypted_host_triage.txt' },
        "10:22:07 — comando eseguito: vssadmin delete shadows /all /quiet (elimina le copie di backup automatiche di Windows)",
        "10:22:15 — comando eseguito: bcdedit /set {default} recoveryenabled no (disattiva il ripristino automatico all'avvio)",
        '10:23:40 — file system cifrato su 46 host del dominio',
        '10:24:02 — richiesta di riscatto (ransom note) comparsa su tutti gli host colpiti'
      ],
      checklist: [
        { t: 'Sono stati eseguiti comandi per impedire il ripristino di sistema, prima ancora che la cifratura avesse effetto', c: true },
        { t: 'Il file system risulta cifrato su decine di host, non su uno isolato', c: true },
        { t: 'I comandi delle 10:22 avvengono a poca distanza dalla modifica della GPO delle 09:47 vista in Fase 2', c: true },
        { t: 'Il ripristino automatico da backup è stato completato con successo prima della cifratura', c: false },
        { t: 'Solo un singolo host isolato è stato colpito', c: false }
      ],
      choices: [
        { t: 'Isolare la rete, attivare il piano di incident response e ripristinare da backup offline', c: true },
        { t: 'Pagare il riscatto per ripristinare rapidamente i sistemi', c: false },
        { t: 'Attendere che il problema si risolva autonomamente', c: false },
        { t: 'Riavviare gli host senza ulteriori verifiche', c: false }
      ],
      tech: { code: 'T1486', name: 'Data Encrypted for Impact', text: "L'inibizione del ripristino prima della cifratura è una scelta deliberata dell'attaccante per massimizzare la pressione verso il pagamento del riscatto.",
        also: "Cyber Kill Chain: Actions on Objectives · CSE Kill Chain: impatto/uscita" }
    }
  ]}
];

// ============ STATO E PERSISTENZA ============
const STORAGE_KEY = 'labscenari_progress';
function loadState() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch (e) { return {}; } }
function saveState(s) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (e) {} }
let state = loadState();
let currentView = { type: 'home' };

function getScenario(id) { return SCENARIOS.find(s => s.id === id); }
function getPhaseState(scenarioId, phaseIdx) { return (state[scenarioId] || {})['p' + phaseIdx]; }
function setPhaseState(scenarioId, phaseIdx, data) {
  if (!state[scenarioId]) state[scenarioId] = {};
  state[scenarioId]['p' + phaseIdx] = data;
  saveState(state);
}
function scenarioStats(sc) {
  const st = state[sc.id] || {};
  const done = sc.phases.map((p, i) => st['p' + i]).filter(Boolean);
  const avg = done.length ? Math.round(done.reduce((a, d) => a + d.score, 0) / done.length) : null;
  return { completedCount: done.length, total: sc.phases.length, avg };
}

const main = document.getElementById('mainView');
function statusText(t) { document.getElementById('statusLine').textContent = t; }

// ============ NAVIGAZIONE ============
function renderNav() {
  const nav = document.getElementById('navList');
  const isHome = currentView.type === 'home';
  const isReport = currentView.type === 'report';
  let html = `<div class="nav-item ${isHome ? 'active' : ''}" data-go="home">Scenari</div>`;
  if (currentView.type === 'phase') {
    const sc = getScenario(currentView.scenarioId);
    html += `<div class="nav-sub">${sc.title}</div>`;
    sc.phases.forEach((p, i) => {
      const done = !!getPhaseState(sc.id, i);
      const active = i === currentView.phaseIdx;
      html += `<div class="nav-item phase ${done ? 'done' : ''} ${active ? 'active' : ''}" data-go="phase" data-scenario="${sc.id}" data-phase="${i}">${i + 1}. ${p.label}${done ? ' ✓' : ''}</div>`;
    });
  }
  html += `<div class="nav-item ${isReport ? 'active' : ''}" data-go="report">Rapporto</div>`;
  nav.innerHTML = html;
  nav.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => {
      const go = el.dataset.go;
      if (go === 'home') renderHome();
      else if (go === 'report') renderReport();
      else if (go === 'phase') openPhase(el.dataset.scenario, Number(el.dataset.phase));
    });
  });
}

// ============ HOME ============
function renderHome() {
  currentView = { type: 'home' };
  renderNav();
  statusText('seleziona uno scenario');
  const cards = SCENARIOS.map(sc => {
    const { completedCount, total, avg } = scenarioStats(sc);
    const badge = completedCount === total ? `<span class="badge done">completato — ${avg}%</span>`
      : completedCount > 0 ? `<span class="badge partial">${completedCount}/${total} fasi</span>`
      : `<span class="badge">da iniziare</span>`;
    return `<div class="scenario-card" data-scenario="${sc.id}">
      <div class="sc-title">${sc.title}</div>
      <div class="sc-subtitle">${sc.subtitle}</div>
      ${badge}
    </div>`;
  }).join('');
  main.innerHTML = `
    <div class="brief">
      <strong>Come funziona:</strong> scegli uno scenario qui sotto. Ogni scenario è diviso in 3 fasi: in ciascuna
      leggerai degli artefatti (log, email, trascrizioni) e risponderai a due domande. Dopo ogni fase ricevi un
      punteggio e una spiegazione, poi puoi passare alla successiva. I progressi restano salvati su questo browser
      — puoi chiudere e tornare quando vuoi. Al termine, apri "Rapporto" ed esporta il file per il questionario.
    </div>
    <div class="scenario-grid">${cards}</div>
  `;
  main.querySelectorAll('.scenario-card').forEach(el => el.addEventListener('click', () => openPhase(el.dataset.scenario, 0)));
}

// ============ FASE ============
function renderFeedItem(item) {
  if (typeof item === 'string') return `<div class="row"><span>${escapeHtml(item)}</span></div>`;
  if (item.file) return `<div class="file-label">📄 ${escapeHtml(item.file)}</div>`;
  return `<div class="row"><span><strong>${escapeHtml(item.from)}:</strong> ${escapeHtml(item.text)}</span></div>`;
}

let phaseStartTime = null;

function openPhase(scenarioId, phaseIdx) {
  currentView = { type: 'phase', scenarioId, phaseIdx };
  renderNav();
  const sc = getScenario(scenarioId);
  statusText(`${sc.title} — fase ${phaseIdx + 1} di ${sc.phases.length}`);
  const saved = getPhaseState(scenarioId, phaseIdx);
  if (saved) renderDebriefView(scenarioId, phaseIdx, saved);
  else { phaseStartTime = Date.now(); renderPhaseView(scenarioId, phaseIdx); }
}

function renderPhaseView(scenarioId, phaseIdx) {
  const sc = getScenario(scenarioId);
  const phase = sc.phases[phaseIdx];
  const checkOrder = shuffledIndices(phase.checklist.length);
  const choiceOrder = shuffledIndices(phase.choices.length);
  main.innerHTML = `
    <div class="brief">${phase.briefing}</div>
    <div class="feed">${phase.feed.map(renderFeedItem).join('')}</div>
    <div class="qblock">
      <h3>Quali elementi richiedono attenzione?</h3>
      ${checkOrder.map(i => `<label class="opt"><input type="checkbox" name="check" value="${i}"> ${phase.checklist[i].t}</label>`).join('')}
    </div>
    <div class="qblock">
      <h3>Quale azione intraprenderesti?</h3>
      ${choiceOrder.map(i => `<label class="opt"><input type="radio" name="choice" value="${i}"> ${phase.choices[i].t}</label>`).join('')}
    </div>
    <button class="primary" id="confirmBtn">Conferma scelte</button>
    <button class="secondary" id="homeBtnQ">Torna al menu</button>
  `;
  document.getElementById('confirmBtn').addEventListener('click', () => evaluatePhase(scenarioId, phaseIdx));
  document.getElementById('homeBtnQ').addEventListener('click', renderHome);
}

function evaluatePhase(scenarioId, phaseIdx) {
  const sc = getScenario(scenarioId);
  const phase = sc.phases[phaseIdx];
  const checked = Array.from(document.querySelectorAll('input[name="check"]:checked')).map(i => Number(i.value));
  const chosen = document.querySelector('input[name="choice"]:checked');

  const tp = phase.checklist.filter((c, i) => c.c && checked.includes(i)).length;
  const fp = phase.checklist.filter((c, i) => !c.c && checked.includes(i)).length;
  const totalCorrect = phase.checklist.filter(c => c.c).length;
  const choiceCorrect = chosen ? !!phase.choices[Number(chosen.value)].c : false;

  const indicatorScore = Math.max(0, (tp - fp) / totalCorrect);
  const score = Math.round(((indicatorScore + (choiceCorrect ? 1 : 0)) / 2) * 100);

  const seconds = phaseStartTime ? Math.round((Date.now() - phaseStartTime) / 1000) : null;
  const data = { score, tp, fp, choiceCorrect, seconds };
  setPhaseState(scenarioId, phaseIdx, data);
  renderDebriefView(scenarioId, phaseIdx, data);
}

function renderDebriefView(scenarioId, phaseIdx, data) {
  const sc = getScenario(scenarioId);
  const phase = sc.phases[phaseIdx];
  const isLast = phaseIdx === sc.phases.length - 1;
  main.innerHTML = `
    <div class="debrief">
      <div class="score">${data.score}%</div>
      <div>${data.tp} indicatori corretti rilevati · ${data.fp} falsi positivi · decisione ${data.choiceCorrect ? 'corretta' : 'da rivedere'}${data.seconds ? ` · completata in ${data.seconds}s` : ''}</div>
      <div class="cols">
        <div><h4>Indicatori decisivi</h4><ul>${phase.checklist.filter(c => c.c).map(c => `<li>${c.t}</li>`).join('')}</ul></div>
        <div>
          <h4>Tecnica impiegata</h4>
          <p style="font-size:13px;line-height:1.6;"><strong>${phase.tech.code} — ${phase.tech.name}.</strong> ${phase.tech.text}</p>
          <div class="also-fw">${phase.tech.also}</div>
        </div>
      </div>
      <div style="margin-top:18px;">
        ${!isLast ? `<button class="primary" id="nextBtn">Fase successiva</button>` : `<button class="primary" id="toReportBtn">Vai al rapporto</button>`}
        <button class="secondary" id="repeatBtn">Ripeti fase</button>
        <button class="secondary" id="homeBtn">Torna al menu</button>
      </div>
    </div>
  `;
  document.getElementById('repeatBtn').addEventListener('click', () => renderPhaseView(scenarioId, phaseIdx));
  document.getElementById('homeBtn').addEventListener('click', renderHome);
  if (!isLast) document.getElementById('nextBtn').addEventListener('click', () => openPhase(scenarioId, phaseIdx + 1));
  else document.getElementById('toReportBtn').addEventListener('click', renderReport);
}

// ============ RAPPORTO ============
function renderReport() {
  currentView = { type: 'report' };
  renderNav();
  statusText('rapporto complessivo');
  const rows = SCENARIOS.map(sc => {
    const { completedCount, total, avg } = scenarioStats(sc);
    return `<div style="border-top:1px solid var(--line); padding-top:12px; margin-top:14px;">
      <h4 style="margin-bottom:4px;">${sc.title}</h4>
      <p style="font-size:13px;">${completedCount}/${total} fasi completate${avg !== null ? ` · punteggio medio ${avg}%` : ''}</p>
      <button class="secondary reopen" data-scenario="${sc.id}">Apri scenario</button>
    </div>`;
  }).join('');

  const allDone = SCENARIOS.flatMap(sc => sc.phases.map((p, i) => getPhaseState(sc.id, i))).filter(Boolean);
  const totalPhases = SCENARIOS.reduce((a, s) => a + s.phases.length, 0);
  const overall = allDone.length ? Math.round(allDone.reduce((a, d) => a + d.score, 0) / allDone.length) : 0;

  main.innerHTML = `
    <div class="brief">Il rapporto riassume i risultati raccolti su questo browser per tutti gli scenari svolti.</div>
    <div class="debrief">
      <div class="score">${overall}%</div>
      <div>punteggio medio complessivo su ${allDone.length} fasi completate (su ${totalPhases} totali)</div>
      ${rows}
      <div style="margin-top:20px;">
        <button class="secondary" id="exportBtn">Esporta rapporto JSON</button>
        <button class="secondary" id="resetBtn">Azzera sessione</button>
      </div>
    </div>
  `;
  main.querySelectorAll('.reopen').forEach(btn => btn.addEventListener('click', () => openPhase(btn.dataset.scenario, 0)));
  document.getElementById('exportBtn').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'rapporto_laboratorio.json'; a.click();
    URL.revokeObjectURL(url);
  });
  document.getElementById('resetBtn').addEventListener('click', () => {
    if (confirm('Azzerare tutti i risultati salvati su questo browser?')) { state = {}; saveState(state); renderHome(); }
  });
}

// avvio
renderHome();