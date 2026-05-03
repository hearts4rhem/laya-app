const SUPABASE_URL = "https://ofwkecklhqtxwlpmnxca.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_8MEOwWdbd9fK6q5JdmTapw_S50-_ILo";
const AUDIO_BUCKET = "whisper-audio";
const LOCAL_TRACKING_KEY = "laya-local-tracking";
const DEVICE_KEY = "whisper-room-device";
const USER_STATE_KEY = "whisper-room-user-state";
const DAY = 24 * 60 * 60 * 1000;
const supabaseClient = window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) || null;
console.error("Laýa debug: build 20260503-supabase-url-fixed loaded");

const moodGroups = {
  "Heavy feelings": ["Lonely", "Overwhelmed", "Heartbroken", "Anxious", "Angry", "Tired", "Confused"],
  "Tender feelings": ["Hopeful", "Grateful", "Relieved", "Proud"],
};
const heavyMoods = moodGroups["Heavy feelings"];
const tenderMoods = moodGroups["Tender feelings"];
const moods = Object.values(moodGroups).flat();
const intensityLabels = {
  1: "Barely there",
  2: "Soft",
  3: "Present",
  4: "Heavy",
  5: "Almost overflowing",
};
const moodWeights = {
  Lonely: 30,
  Overwhelmed: 30,
  Heartbroken: 28,
  Anxious: 25,
  Angry: 22,
  Tired: 20,
  Confused: 18,
  Hopeful: 10,
  Relieved: 8,
  Grateful: 6,
  Proud: 6,
};
const moodColorMap = {
  Lonely: ["#EDE7F6", "#D8C8F0", "#BFA9DD", "#9F83C6", "#7E61A8"],
  Overwhelmed: ["#EEF2F5", "#D7E0E6", "#AEBFCA", "#8299A8", "#5F7484"],
  Heartbroken: ["#FBECEF", "#F5CDD6", "#E9A8B8", "#D77F96", "#B85D78"],
  Anxious: ["#EEF6EE", "#D6E8D6", "#B8D4B8", "#8FB98F", "#6B996B"],
  Angry: ["#F7E8DF", "#EBC5B0", "#D99B7D", "#BF7357", "#98513D"],
  Tired: ["#F7F0E6", "#E7D8C3", "#D1BB9D", "#B99A73", "#927451"],
  Confused: ["#F0EAF7", "#DCCFEB", "#C2ACDA", "#A081C3", "#7D62A4"],
  Hopeful: ["#FFF0E8", "#FFD9C7", "#F8BFA5", "#EB9A78", "#D87857"],
  Grateful: ["#FFF6DC", "#F7E5B1", "#EBCF82", "#D8B557", "#B8923D"],
  Relieved: ["#EAF8F7", "#CBEDEA", "#9FDAD6", "#73C0BA", "#4E9E98"],
  Proud: ["#F5ECF3", "#E6D0DF", "#D0AFC3", "#B98A9F", "#9C6B80"],
};
const bubbleSizes = { 1: 56, 2: 68, 3: 82, 4: 96, 5: 112 };
const replyToneSets = {
  heavy: [
    "Hold space",
    "Encourage gently",
    "Remind them they're not alone",
    "Send strength",
    "Acknowledge the pain",
  ],
  tender: [
    "Celebrate softly",
    "Reflect the warmth",
    "Honor the moment",
    "Share gentle joy",
    "Let it linger",
  ],
};
const starterReplySets = {
  heavy: [
    "I hear you. That sounds really heavy.",
    "I don't know your full story, but I'm holding space for you.",
    "You're not alone in this moment.",
    "One small breath at a time.",
    "Thank you for letting this feeling be seen.",
  ],
  tender: [
    "I'm glad this feeling found you.",
    "This is worth holding onto.",
    "Let this softness stay a little longer.",
    "I'm quietly celebrating this with you.",
    "Thank you for letting this light be seen.",
  ],
};
const replyGuidance = {
  heavy: "No advice. No fixing. Just presence.",
  tender: "No advice. No fixing. Just presence.",
};
const kindnessReactions = ["💜", "💟"];
const safetyPatterns = {
  crisis: [
    "suicide",
    "kill myself",
    "i want to die",
    "i don't want to live",
    "i dont want to live",
    "end my life",
    "hurt myself",
    "self harm",
    "gusto ko nang mamatay",
    "gusto ko na mamatay",
    "ayoko na mabuhay",
    "gusto ko na mawala",
    "hindi ko na kaya",
    "magpakamatay",
    "saktan sarili",
    "quiero morir",
    "no quiero vivir",
    "terminar con mi vida",
    "hacerme dano",
    "je veux mourir",
    "je ne veux plus vivre",
    "mettre fin a ma vie",
    "ureed an amoot",
    "la ureed an aeesh",
    "mujhe marna hai",
    "jeena nahi hai",
    "saya mau mati",
    "tidak ingin hidup lagi",
  ],
  contact: [
    "dm me",
    "message me",
    "add me",
    "follow me",
    "meet me",
    "text me",
    "call me",
    "where are you",
    "what's your name",
    "whats your name",
    "send pic",
    "dm mo ako",
    "message mo ako",
    "add mo ako",
    "follow mo ako",
    "kita tayo",
    "saan ka",
    "anong pangalan mo",
    "mensajeame",
    "mandame mensaje",
    "agregame",
    "sigueme",
    "nos vemos",
    "donde estas",
    "como te llamas",
    "dm aku",
    "pesan aku",
    "tambah aku",
    "follow aku",
    "ketemu aku",
    "dimana kamu",
    "siapa namamu",
  ],
  dating: ["boyfriend", "girlfriend", "date", "hookup", "meet up", "ligaw", "jowa", "novio", "novia", "cita", "pacar"],
};

const blockedPatterns = [
  { label: "phone numbers", pattern: /(?:\+?\d[\s().-]*){8,}/i },
  { label: "email addresses", pattern: /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i },
  { label: "links", pattern: /\b(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|ph|co)\b)/i },
  { label: "social handles", pattern: /(^|\s)@[a-z0-9._]{3,}/i },
  { label: "contact requests", pattern: /\b(dm me|message me|meet me|add me|follow me|text me|call me|where are you|what'?s your name|send pic|ig ko|telegram ko|whatsapp|viber)\b/i },
  { label: "dating or chasing language", pattern: /\b(boyfriend|girlfriend|date|hookup)\b/i },
  { label: "directive advice", pattern: /\b(you should|you need to|just do|leave them|quit your job|confront them)\b/i },
  { label: "unsafe language", pattern: /\b(stupid|idiot|dumb|shut up|kill you|hurt you|sexy|nude|horny|fuck you|bitch)\b/i },
];

const replyBlockedPatterns = [
  ...blockedPatterns,
  { label: "links", pattern: /\b(?:https?:\/\/|www\.|[a-z0-9-]+\.(?:com|net|org|io|ph|co)\b)/i },
  { label: "chasing language", pattern: /\b(follow me|where are you|what'?s your name|send pic|boyfriend|girlfriend|date|hookup)\b/i },
  { label: "directive advice", pattern: /\b(you should|you need to|just do|leave them|quit your job|confront them)\b/i },
  { label: "unsafe language", pattern: /\b(stupid|idiot|dumb|shut up|kill you|hurt you|sexy|nude|horny|fuck you|bitch)\b/i },
];

const harshReplyPatterns = [
  /\b(always|never|must|have to|fix this|move on|get over it)\b/i,
  /!{2,}/,
];

function makeDemoAudioUrl(frequency = 180, seconds = 1.4) {
  const sampleRate = 8000;
  const sampleCount = Math.floor(sampleRate * seconds);
  const dataSize = sampleCount * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  function writeString(offset, value) {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }

  writeString(0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, "WAVE");
  writeString(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, "data");
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < sampleCount; i += 1) {
    const envelope = Math.sin(Math.PI * i / sampleCount);
    const wobble = Math.sin(2 * Math.PI * 3 * i / sampleRate) * 7;
    const wave = Math.sin(2 * Math.PI * (frequency + wobble) * i / sampleRate);
    view.setInt16(44 + i * 2, wave * envelope * 5200, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return `data:audio/wav;base64,${btoa(binary)}`;
}

const crisisPatterns = [
  /suicide/i,
  /kill myself/i,
  /end my life/i,
  /hurt myself/i,
  /self[-\s]?harm/i,
  /magpakamatay/i,
  /saktan sarili/i,
  /ayoko na mabuhay/i,
];

const starterState = {
  whispers: [
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I keep pretending I am fine because explaining why I am tired feels even more tiring.",
      audioUrl: "",
      mood: "Tired",
      createdAt: Date.now() - 1000 * 60 * 18,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 18,
      intensity: 3,
      kindnessCount: 2,
      responseCount: 2,
      reportedCount: 0,
      hidden: false,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I miss being someone's first thought. I know I should be okay alone, but tonight feels wide and quiet.",
      audioUrl: "",
      mood: "Lonely",
      createdAt: Date.now() - 1000 * 60 * 77,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 77,
      intensity: 4,
      kindnessCount: 0,
      responseCount: 0,
      reportedCount: 0,
      hidden: false,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "voice",
      content: "Anonymous voice whisper",
      audioUrl: makeDemoAudioUrl(176, 1.6),
      mood: "Overwhelmed",
      createdAt: Date.now() - 1000 * 60 * 150,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 150,
      intensity: 5,
      kindnessCount: 1,
      responseCount: 1,
      reportedCount: 0,
      hidden: false,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I feel anxious about tomorrow, even though nothing has happened yet.",
      audioUrl: "",
      mood: "Anxious",
      createdAt: Date.now() - 1000 * 60 * 9,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 9,
      responseCount: 0,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I am angry that I always have to be the understanding one.",
      audioUrl: "",
      mood: "Angry",
      createdAt: Date.now() - 1000 * 60 * 34,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 34,
      responseCount: 1,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "My heart still reaches for someone who already left.",
      audioUrl: "",
      mood: "Heartbroken",
      createdAt: Date.now() - 1000 * 60 * 48,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 48,
      responseCount: 0,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I do not know what I feel. Everything is foggy and loud at the same time.",
      audioUrl: "",
      mood: "Confused",
      createdAt: Date.now() - 1000 * 60 * 112,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 112,
      responseCount: 2,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I wish someone noticed how much effort it takes me to be okay.",
      audioUrl: "",
      mood: "Lonely",
      createdAt: Date.now() - 1000 * 60 * 210,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 210,
      responseCount: 0,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I am proud of myself for making it through today, even if it was messy.",
      audioUrl: "",
      mood: "Tired",
      createdAt: Date.now() - 1000 * 60 * 260,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 260,
      responseCount: 1,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "voice",
      content: "Anonymous voice whisper",
      audioUrl: makeDemoAudioUrl(220, 1.35),
      mood: "Heartbroken",
      createdAt: Date.now() - 1000 * 60 * 24,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 24,
      responseCount: 1,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "voice",
      content: "Anonymous voice whisper",
      audioUrl: makeDemoAudioUrl(146, 1.85),
      mood: "Lonely",
      createdAt: Date.now() - 1000 * 60 * 62,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 62,
      responseCount: 0,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "voice",
      content: "Anonymous voice whisper",
      audioUrl: makeDemoAudioUrl(196, 1.5),
      mood: "Anxious",
      createdAt: Date.now() - 1000 * 60 * 138,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 138,
      responseCount: 2,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "voice",
      content: "Anonymous voice whisper",
      audioUrl: makeDemoAudioUrl(165, 1.7),
      mood: "Confused",
      createdAt: Date.now() - 1000 * 60 * 310,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 310,
      responseCount: 0,
      reportedCount: 0,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "For the first time in a while, I think tomorrow might be kind to me.",
      audioUrl: "",
      mood: "Hopeful",
      intensity: 2,
      createdAt: Date.now() - 1000 * 60 * 44,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 44,
      kindnessCount: 0,
      responseCount: 0,
      reportedCount: 0,
      hidden: false,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I am grateful for one person who checked on me today.",
      audioUrl: "",
      mood: "Grateful",
      intensity: 3,
      createdAt: Date.now() - 1000 * 60 * 90,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 90,
      kindnessCount: 1,
      responseCount: 1,
      reportedCount: 0,
      hidden: false,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I finally cried and somehow my body feels lighter.",
      audioUrl: "",
      mood: "Relieved",
      intensity: 4,
      createdAt: Date.now() - 1000 * 60 * 126,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 126,
      kindnessCount: 0,
      responseCount: 0,
      reportedCount: 0,
      hidden: false,
      ownerId: "demo",
    },
    {
      id: crypto.randomUUID(),
      type: "text",
      content: "I did something hard today, and I want to remember that I showed up.",
      audioUrl: "",
      mood: "Proud",
      intensity: 3,
      createdAt: Date.now() - 1000 * 60 * 250,
      expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 250,
      kindnessCount: 0,
      responseCount: 0,
      reportedCount: 0,
      hidden: false,
      ownerId: "demo",
    },
  ],
  responses: [],
  reports: [],
  responded: {},
  reported: {},
  seen: {},
  reactions: {},
};

starterState.responses = [
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[0].id,
    replyTone: "Hold space",
    message: "I hear you.",
    createdAt: Date.now() - 1000 * 60 * 12,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[0].id,
    replyTone: "Encourage gently",
    message: "One small breath at a time.",
    createdAt: Date.now() - 1000 * 60 * 8,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[2].id,
    replyTone: "Acknowledge the pain",
    message: "That sounds heavy.",
    createdAt: Date.now() - 1000 * 60 * 42,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[4].id,
    replyTone: "Hold space",
    message: "I hear the frustration in that.",
    createdAt: Date.now() - 1000 * 60 * 22,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[6].id,
    replyTone: "Hold space",
    message: "Foggy feelings still deserve space.",
    createdAt: Date.now() - 1000 * 60 * 65,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[6].id,
    replyTone: "Encourage gently",
    message: "One small breath at a time.",
    createdAt: Date.now() - 1000 * 60 * 58,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[8].id,
    replyTone: "Send strength",
    message: "Messy still counts. You made it.",
    createdAt: Date.now() - 1000 * 60 * 180,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[9].id,
    replyTone: "Hold space",
    message: "I am holding this gently with you.",
    createdAt: Date.now() - 1000 * 60 * 15,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[11].id,
    replyTone: "Remind them they're not alone",
    message: "You are not alone in this moment.",
    createdAt: Date.now() - 1000 * 60 * 88,
    flagged: false,
  },
  {
    id: crypto.randomUUID(),
    whisperId: starterState.whispers[11].id,
    replyTone: "Encourage gently",
    message: "One small breath at a time.",
    createdAt: Date.now() - 1000 * 60 * 76,
    flagged: false,
  },
];

const deviceId = getDeviceId();

let state = loadState();
let selectedMood = "Lonely";
let selectedIntensity = 3;
let mediaRecorder = null;
let recordChunks = [];
let draftAudioUrl = "";
let draftAudioPreviewUrl = "";
let draftAudioBlob = null;
let pendingCrisisPost = null;
let activeWhisperId = null;
let activeReportWhisperId = null;
let activeReplyContext = "heavy";
let selectedReplyTone = replyToneSets.heavy[0];
let transitionMode = "";
let transitionCategory = "";
let transitionInProgress = false;
let receiveTransitionTimer = null;
let userState = loadUserState();

const els = {
  screens: document.querySelectorAll(".screen"),
  routeButtons: document.querySelectorAll("[data-route]"),
  navButtons: document.querySelectorAll(".nav-button"),
  moodGrid: document.querySelector("#moodGrid"),
  intensityGrid: document.querySelector("#intensityGrid"),
  whisperForm: document.querySelector("#whisperForm"),
  whisperLanguage: document.querySelector("#whisperLanguage"),
  whisperText: document.querySelector("#whisperText"),
  charCount: document.querySelector("#charCount"),
  blockNotice: document.querySelector("#blockNotice"),
  voiceRecorder: document.querySelector(".voice-recorder"),
  recordButton: document.querySelector("#recordButton"),
  playDraftButton: document.querySelector("#playDraftButton"),
  clearDraftButton: document.querySelector("#clearDraftButton"),
  recordStatus: document.querySelector("#recordStatus"),
  listenCapacityBanner: document.querySelector("#listenCapacityBanner"),
  kindnessJar: document.querySelector("#kindnessJar"),
  bubbleRoom: document.querySelector("#bubbleRoom"),
  myFeed: document.querySelector("#myFeed"),
  whisperTemplate: document.querySelector("#whisperTemplate"),
  receiveTransition: document.querySelector("#receiveTransition"),
  kindnessDialog: document.querySelector("#kindnessDialog"),
  kindnessForm: document.querySelector("#kindnessForm"),
  kindnessMood: document.querySelector("#kindnessMood"),
  kindnessTitle: document.querySelector("#kindnessTitle"),
  intensityLabel: document.querySelector("#intensityLabel"),
  kindnessContent: document.querySelector("#kindnessContent"),
  kindnessAudio: document.querySelector("#kindnessAudio"),
  kindnessCompose: document.querySelector("#kindnessCompose"),
  replyGuidance: document.querySelector("#replyGuidance"),
  toneList: document.querySelector("#toneList"),
  starterList: document.querySelector("#starterList"),
  kindnessMessage: document.querySelector("#kindnessMessage"),
  kindnessCount: document.querySelector("#kindnessCount"),
  replyWarning: document.querySelector("#replyWarning"),
  replySuccess: document.querySelector("#replySuccess"),
  sendKindnessButton: document.querySelector("#sendKindnessButton"),
  modalReportButton: document.querySelector("#modalReportButton"),
  crisisDialog: document.querySelector("#crisisDialog"),
  continuePostButton: document.querySelector("#continuePostButton"),
  senderSupportDialog: document.querySelector("#senderSupportDialog"),
  showSupportButton: document.querySelector("#showSupportButton"),
  supportResources: document.querySelector("#supportResources"),
  reportDialog: document.querySelector("#reportDialog"),
  reportForm: document.querySelector("#reportForm"),
  reportContext: document.querySelector("#reportContext"),
  reportSuccess: document.querySelector("#reportSuccess"),
  groundingDialog: document.querySelector("#groundingDialog"),
  groundingContinueButton: document.querySelector("#groundingContinueButton"),
  transitionEyebrow: document.querySelector("#transitionEyebrow"),
  transitionTitle: document.querySelector("#transitionTitle"),
  transitionBody: document.querySelector("#transitionBody"),
  transitionLine: document.querySelector("#transitionLine"),
  capacityActions: document.querySelector("#capacityActions"),
  capacityNoneButton: document.querySelector("#capacityNoneButton"),
  capacityYesButton: document.querySelector("#capacityYesButton"),
  resetDemoButton: document.querySelector("#resetDemoButton"),
};

function getDeviceId() {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

function loadUserState() {
  const saved = sessionStorage.getItem(USER_STATE_KEY);
  if (!saved) return { lastPostedMood: "", capacityLevel: "full" };
  try {
    return { lastPostedMood: "", capacityLevel: "full", ...JSON.parse(saved) };
  } catch {
    return { lastPostedMood: "", capacityLevel: "full" };
  }
}

function saveUserState() {
  sessionStorage.setItem(USER_STATE_KEY, JSON.stringify(userState));
}

function maybeShowSenderSupportPrompt(route) {
  if (!["mine", "whisper", "home"].includes(route) || els.senderSupportDialog?.open) return;
  userState.crisisPromptSeen ||= {};
  const flaggedOwnWhisper = state.whispers.find((whisper) => (
    whisper.ownerId === deviceId
    && whisper.crisis_flagged
    && !userState.crisisPromptSeen[whisper.id]
  ));
  if (!flaggedOwnWhisper) return;
  userState.crisisPromptSeen[flaggedOwnWhisper.id] = true;
  saveUserState();
  els.supportResources.classList.add("hidden");
  els.senderSupportDialog.showModal();
}

function loadState() {
  const localTracking = loadLocalTracking();
  if (!supabaseClient) return normalizeState({ ...createDemoState(), ...localTracking });
  return normalizeState({
    whispers: [],
    responses: [],
    reports: [],
    ...localTracking,
  });
}

function loadLocalTracking() {
  const saved = localStorage.getItem(LOCAL_TRACKING_KEY);
  if (!saved) {
    return {
      createdWhispers: {},
      responded: {},
      reported: {},
      seen: {},
      reactions: {},
    };
  }
  try {
    const parsed = JSON.parse(saved);
    return {
      createdWhispers: parsed.createdWhispers || {},
      responded: parsed.responded || {},
      reported: parsed.reported || {},
      seen: parsed.seen || {},
      reactions: parsed.reactions || {},
    };
  } catch {
    return {
      createdWhispers: {},
      responded: {},
      reported: {},
      seen: {},
      reactions: {},
    };
  }
}

function saveLocalTracking() {
  localStorage.setItem(LOCAL_TRACKING_KEY, JSON.stringify({
    createdWhispers: state.createdWhispers || {},
    responded: state.responded || {},
    reported: state.reported || {},
    seen: state.seen || {},
    reactions: state.reactions || {},
  }));
}

function normalizeState(nextState) {
  nextState.whispers ||= [];
  nextState.responses ||= [];
  nextState.reports ||= [];
  nextState.createdWhispers ||= {};
  nextState.responded ||= {};
  nextState.reported ||= {};
  nextState.seen ||= {};
  nextState.reactions ||= {};
  nextState.whispers = nextState.whispers.map((whisper) => ({
    ...whisper,
    language: whisper.language || "English",
    mood: moods.includes(whisper.mood) ? whisper.mood : "Confused",
    intensity: Math.min(5, Math.max(1, Number(whisper.intensity || 3))),
    kindnessCount: Number(whisper.kindnessCount ?? whisper.responseCount ?? 0),
    responseCount: Number(whisper.kindnessCount ?? whisper.responseCount ?? 0),
    reportedCount: Number(whisper.reportedCount || 0),
    crisis_flagged: Boolean(whisper.crisis_flagged),
    hidden: Boolean(whisper.hidden),
    reportReasons: Array.isArray(whisper.reportReasons) ? whisper.reportReasons : [],
    detectedFlags: Array.isArray(whisper.detectedFlags) ? whisper.detectedFlags : [],
    ownerId: whisper.ownerId || (nextState.createdWhispers?.[whisper.id] ? deviceId : "demo"),
  }));
  nextState.responses = nextState.responses.map((response) => ({
    ...response,
    ownerId: response.ownerId || "demo",
    reactionCount: Number(response.reactionCount || 0),
  }));
  return nextState;
}

function createDemoState() {
  const nextState = structuredClone(starterState);
  const myFirstWhisper = {
    id: crypto.randomUUID(),
    type: "text",
    content: "I keep telling myself I am okay, but I think I just want someone to know I am trying.",
    audioUrl: "",
    mood: "Tired",
    createdAt: Date.now() - 1000 * 60 * 27,
    expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 27,
    responseCount: 3,
    reportedCount: 0,
    ownerId: deviceId,
  };
  const mySecondWhisper = {
    id: crypto.randomUUID(),
    type: "text",
    content: "Tonight feels lonely in a way I cannot explain to people who know me.",
    audioUrl: "",
    mood: "Lonely",
    createdAt: Date.now() - 1000 * 60 * 96,
    expiresAt: Date.now() + 7 * DAY - 1000 * 60 * 96,
    responseCount: 2,
    reportedCount: 0,
    ownerId: deviceId,
  };

  nextState.whispers.unshift(mySecondWhisper);
  nextState.whispers.unshift(myFirstWhisper);
  nextState.responses.push(
    {
      id: crypto.randomUUID(),
      whisperId: myFirstWhisper.id,
      replyTone: "Hold space",
      message: "I hear you. Trying still counts, even when it feels quiet.",
      createdAt: Date.now() - 1000 * 60 * 18,
      flagged: false,
      blockedReason: "",
      ownerId: "demo",
      reactionCount: 0,
    },
    {
      id: crypto.randomUUID(),
      whisperId: myFirstWhisper.id,
      replyTone: "Encourage gently",
      message: "One small breath at a time.",
      createdAt: Date.now() - 1000 * 60 * 11,
      flagged: false,
      blockedReason: "",
      ownerId: "demo",
      reactionCount: 0,
    },
    {
      id: crypto.randomUUID(),
      whisperId: myFirstWhisper.id,
      replyTone: "Send strength",
      message: "You are still here. That matters.",
      createdAt: Date.now() - 1000 * 60 * 6,
      flagged: false,
      blockedReason: "",
      ownerId: "demo",
      reactionCount: 0,
    },
    {
      id: crypto.randomUUID(),
      whisperId: mySecondWhisper.id,
      replyTone: "Remind them they're not alone",
      message: "You are not alone in this moment.",
      createdAt: Date.now() - 1000 * 60 * 62,
      flagged: false,
      blockedReason: "",
      ownerId: "demo",
      reactionCount: 0,
    },
    {
      id: crypto.randomUUID(),
      whisperId: mySecondWhisper.id,
      replyTone: "Acknowledge the pain",
      message: "That kind of loneliness can feel so heavy.",
      createdAt: Date.now() - 1000 * 60 * 44,
      flagged: false,
      blockedReason: "",
      ownerId: "demo",
      reactionCount: 0,
    },
    {
      id: crypto.randomUUID(),
      whisperId: nextState.whispers[3].id,
      replyTone: "Hold space",
      message: "I am holding this gently with you.",
      createdAt: Date.now() - 1000 * 60 * 33,
      flagged: false,
      blockedReason: "",
      ownerId: deviceId,
      reactionCount: 2,
    },
    {
      id: crypto.randomUUID(),
      whisperId: nextState.whispers[5].id,
      replyTone: "Encourage gently",
      message: "May this soft moment stay with you.",
      createdAt: Date.now() - 1000 * 60 * 144,
      flagged: false,
      blockedReason: "",
      ownerId: deviceId,
      reactionCount: 1,
    }
  );
  return normalizeState(nextState);
}

function saveState() {
  saveLocalTracking();
}

function fromDbWhisper(row) {
  const createdAt = row.created_at ? new Date(row.created_at).getTime() : Date.now();
  const expiresAt = row.expires_at ? new Date(row.expires_at).getTime() : createdAt + 7 * DAY;
  const kindnessCount = Number(row.kindness_count ?? row.response_count ?? 0);
  const audioUrl = row.audio_url || "";
  return {
    id: row.id,
    type: row.type || (audioUrl ? "voice" : "text"),
    content: row.content || "",
    audioUrl,
    language: row.language || "English",
    mood: row.mood || "Confused",
    intensity: Number(row.intensity || 3),
    createdAt,
    expiresAt,
    kindnessCount,
    responseCount: kindnessCount,
    reportedCount: Number(row.reported_count || 0),
    crisis_flagged: Boolean(row.crisis_flagged),
    hidden: Boolean(row.hidden),
    reportReasons: Array.isArray(row.report_reasons) ? row.report_reasons : [],
    detectedFlags: Array.isArray(row.detected_flags) ? row.detected_flags : [],
    ownerId: row.device_id || (state.createdWhispers?.[row.id] ? deviceId : "remote"),
  };
}

function toDbWhisper(whisper) {
  return {
    id: whisper.id,
    content: whisper.content || null,
    audio_url: whisper.audioUrl || null,
    language: whisper.language,
    mood: whisper.mood,
    intensity: whisper.intensity,
    expires_at: new Date(whisper.expiresAt).toISOString(),
    kindness_count: activeKindnessCount(whisper),
    reported_count: Number(whisper.reportedCount || 0),
    crisis_flagged: Boolean(whisper.crisis_flagged),
    hidden: Boolean(whisper.hidden),
    report_reasons: whisper.reportReasons || [],
    detected_flags: whisper.detectedFlags || [],
  };
}

function fromDbReply(row) {
  return {
    id: row.id,
    whisperId: row.whisper_id,
    replyTone: row.reply_tone || "Hold space",
    message: row.message || row.preset_message || "",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    flagged: Boolean(row.flagged),
    blockedReason: row.blocked_reason || "",
    ownerId: row.device_id || "remote",
    reactionCount: Number(row.reaction_count || 0),
  };
}

function toDbReply(reply) {
  return {
    id: reply.id,
    whisper_id: reply.whisperId,
    reply_tone: reply.replyTone,
    message: reply.message,
  };
}

function fromDbReport(row) {
  return {
    id: row.id,
    whisperId: row.whisper_id,
    reason: row.reason || "Other",
    optionalContext: row.optional_context || "",
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
  };
}

function toDbReport(report) {
  return {
    id: report.id,
    whisper_id: report.whisperId,
    reason: report.reason,
    optional_context: report.optionalContext || "",
  };
}

async function refreshFromSupabase() {
  if (!supabaseClient) {
    render();
    return;
  }

  const nowIso = new Date().toISOString();
  const [whisperResult, replyResult, reportResult] = await Promise.all([
    supabaseClient
      .from("whispers")
      .select("*")
      .gt("expires_at", nowIso)
      .order("created_at", { ascending: false }),
    supabaseClient
      .from("kindness_replies")
      .select("*")
      .order("created_at", { ascending: true }),
    supabaseClient
      .from("reports")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (whisperResult.error) throw whisperResult.error;
  if (replyResult.error) throw replyResult.error;
  if (reportResult.error) console.error("Supabase report fetch failed", reportResult.error);

  const localTracking = loadLocalTracking();
  const activeIds = new Set((whisperResult.data || []).map((whisper) => whisper.id));
  state = normalizeState({
    whispers: (whisperResult.data || []).map(fromDbWhisper),
    responses: (replyResult.data || []).filter((reply) => activeIds.has(reply.whisper_id)).map(fromDbReply),
    reports: (reportResult.data || []).map(fromDbReport),
    ...localTracking,
  });
  render();
}

async function uploadVoiceAudio(whisper) {
  if (!supabaseClient || whisper.type !== "voice" || !whisper.audioUrl?.startsWith("data:")) {
    return whisper.audioUrl || "";
  }

  const blob = draftAudioBlob || (await fetch(whisper.audioUrl).then((response) => response.blob()));
  const extension = audioFileExtension(blob.type);
  const path = `${deviceId}/${whisper.id}.${extension}`;
  const { error } = await supabaseClient.storage
    .from(AUDIO_BUCKET)
    .upload(path, blob, {
      contentType: blob.type || "audio/webm",
      upsert: true,
    });

  if (error) throw error;
  const { data } = supabaseClient.storage.from(AUDIO_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function getPreferredAudioMimeType() {
  if (!window.MediaRecorder?.isTypeSupported) return "";
  return [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ].find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function audioFileExtension(mimeType = "") {
  if (mimeType.includes("mp4") || mimeType.includes("mpeg")) return "m4a";
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("wav")) return "wav";
  return "webm";
}

function microphoneErrorMessage(error) {
  const errorName = error?.name || "";
  if (errorName === "NotAllowedError" || errorName === "PermissionDeniedError") {
    return "Microphone access is blocked. Please allow the microphone for this site, then tap record again.";
  }
  if (errorName === "NotFoundError" || errorName === "DevicesNotFoundError") {
    return "Laýa could not find a microphone on this device.";
  }
  if (errorName === "NotReadableError" || errorName === "TrackStartError") {
    return "The microphone is unavailable right now. Close other apps using it, then try again.";
  }
  if (errorName === "SecurityError") {
    return "Voice recording needs localhost or HTTPS. Please open Laýa from http://localhost:5500/ or the deployed site.";
  }
  if (errorName === "OverconstrainedError") {
    return "This microphone setting is not available on this device. Please try another browser or mic.";
  }
  return `Microphone unavailable: ${errorName || error?.message || "the browser did not share a reason"}.`;
}

function pruneExpired() {
  state = normalizeState(state);
  const liveIds = new Set(state.whispers.filter((whisper) => whisper.expiresAt > Date.now()).map((whisper) => whisper.id));
  state.whispers = state.whispers.filter((whisper) => liveIds.has(whisper.id));
  state.responses = state.responses.filter((response) => liveIds.has(response.whisperId));
  saveState();
}

function setRoute(route) {
  if (route === "listen" && userState.capacityLevel === "none") {
    route = "rest";
  }
  const screenId = `${route}Screen`;
  els.screens.forEach((screen) => screen.classList.toggle("active", screen.id === screenId));
  els.navButtons.forEach((button) => button.classList.toggle("active", button.dataset.route === route));
  document.body.dataset.route = route;
  els.listenCapacityBanner?.classList.toggle("hidden", userState.capacityLevel !== "light");
  window.scrollTo({ top: 0, behavior: "smooth" });
  render();
  if (supabaseClient && ["listen", "mine"].includes(route)) {
    refreshFromSupabase().catch((error) => console.error("Supabase route refresh failed", error));
  }
  maybeShowSenderSupportPrompt(route);
}

function renderMoodButtons() {
  els.moodGrid.innerHTML = "";
  Object.entries(moodGroups).forEach(([group, groupMoods]) => {
    const section = document.createElement("div");
    section.className = "mood-group";
    section.innerHTML = `<p>${group}</p>`;
    const options = document.createElement("div");
    options.className = "mood-options";
    groupMoods.forEach((mood) => {
      const button = document.createElement("button");
      button.className = `mood-option${mood === selectedMood ? " active" : ""}`;
      button.type = "button";
      button.textContent = mood;
      button.addEventListener("click", () => {
        selectedMood = mood;
        renderMoodButtons();
      });
      options.appendChild(button);
    });
    section.appendChild(options);
    els.moodGrid.appendChild(section);
  });
}

function renderIntensityButtons() {
  els.intensityGrid.innerHTML = "";
  Object.entries(intensityLabels).forEach(([value, label]) => {
    const intensity = Number(value);
    const button = document.createElement("button");
    button.className = `intensity-option${intensity === selectedIntensity ? " active" : ""}`;
    button.type = "button";
    button.innerHTML = `<strong>${value}</strong><span>${label}</span>`;
    button.addEventListener("click", () => {
      selectedIntensity = intensity;
      renderIntensityButtons();
    });
    els.intensityGrid.appendChild(button);
  });
}

function relativeTime(date) {
  const minutes = Math.max(1, Math.round((Date.now() - date) / 60000));
  if (minutes < 3) return "just now";
  if (minutes < 60) return "a few minutes ago";
  const hours = Math.round(minutes / 60);
  if (hours < 2) return "about an hour ago";
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.round(hours / 24)} days ago`;
}

function expiryCountdown(expiresAt) {
  const hours = Math.max(0, Math.ceil((expiresAt - Date.now()) / (60 * 60 * 1000)));
  if (hours >= 24) return `${Math.ceil(hours / 24)} days left`;
  if (hours === 1) return "1 hour left";
  return `${hours} hours left`;
}

function normalizeSafetyText(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\u0600-\u06ff\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasPhrase(text, phrase) {
  const normalized = normalizeSafetyText(text);
  const target = normalizeSafetyText(phrase);
  return normalized.includes(target);
}

function detectSafetyFlags(text) {
  const flags = [];
  Object.entries(safetyPatterns).forEach(([type, phrases]) => {
    if (phrases.some((phrase) => hasPhrase(text, phrase))) flags.push(type);
  });
  if (blockedPatterns.some((item) => item.pattern.test(text))) flags.push("personal-info");
  return [...new Set(flags)];
}

function findBlockReason(text) {
  const flags = detectSafetyFlags(text).filter((flag) => flag !== "crisis");
  if (flags.includes("contact") || flags.includes("dating") || flags.includes("personal-info")) {
    return "Let’s keep this space gentle and safe. No personal info, no advice, no chasing — just kindness.";
  }
  const match = blockedPatterns.find((item) => item.pattern.test(text));
  return match ? `Please remove ${match.label}. Laýa blocks contact details and meetup requests.` : "";
}

function hasCrisisLanguage(text) {
  return crisisPatterns.some((pattern) => pattern.test(text)) || detectSafetyFlags(text).includes("crisis");
}

function createWhisper() {
  const text = els.whisperText.value.trim();
  const hasVoice = Boolean(draftAudioUrl);
  const detectedFlags = detectSafetyFlags(text);

  if (!text && !hasVoice) return { error: "Write a whisper or record a short voice note first." };

  const blockReason = findBlockReason(text);
  if (blockReason) return { error: blockReason };

  return {
    whisper: {
      id: crypto.randomUUID(),
      type: hasVoice ? "voice" : "text",
      content: text || null,
      audioUrl: hasVoice ? draftAudioUrl : "",
      language: els.whisperLanguage?.value || "English",
      mood: selectedMood,
      intensity: selectedIntensity,
      createdAt: Date.now(),
      expiresAt: Date.now() + 7 * DAY,
      kindnessCount: 0,
      responseCount: 0,
      reportedCount: 0,
      crisis_flagged: detectedFlags.includes("crisis"),
      hidden: false,
      reportReasons: [],
      detectedFlags,
      ownerId: deviceId,
    },
    crisis: detectedFlags.includes("crisis") || hasCrisisLanguage(text),
  };
}

function showNotice(message) {
  els.blockNotice.textContent = message;
  els.blockNotice.classList.remove("hidden");
}

function hideNotice() {
  els.blockNotice.textContent = "";
  els.blockNotice.classList.add("hidden");
}

function supabaseSetupHint(error) {
  const message = String(error?.message || error?.error_description || error?.details || "");
  if (/failed to fetch|networkerror|load failed/i.test(message)) {
    return " Supabase setup note: open Laýa from http://localhost instead of the file link so the browser can reach Supabase.";
  }
  if (/relation .*whispers|could not find the table|schema cache|does not exist/i.test(message)) {
    return " Supabase setup note: the whispers table may not exist yet.";
  }
  if (/bucket|storage|object/i.test(message)) {
    return " Supabase setup note: the whisper-audio bucket or its upload policy may need setup.";
  }
  if (/row-level security|violates row-level security|permission denied|policy/i.test(message)) {
    return " Supabase setup note: a table policy may be blocking this save.";
  }
  return message ? ` Supabase said: ${message}` : "";
}

function debugErrorMessage(error) {
  if (!error) return "Unknown Supabase error";
  if (error.message) return error.message;
  if (error.error_description) return error.error_description;
  if (error.details) return error.details;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

async function debugSupabaseNetwork() {
  if (window.location.protocol === "file:") {
    const fileError = new Error("Laýa is open from a file link. Open it from http://localhost so the browser can call Supabase.");
    console.error("Laýa debug: local file origin blocked", window.location.href);
    return { ok: false, networkError: fileError };
  }

  const endpoint = `${SUPABASE_URL}/rest/v1/whispers?select=id&limit=1`;
  console.error("Laýa debug: Supabase URL", SUPABASE_URL);
  console.error("Laýa debug: Supabase anon key prefix", SUPABASE_ANON_KEY.slice(0, 14));
  try {
    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const body = await response.text();
    console.error("Laýa debug: Supabase REST status", response.status, response.statusText);
    console.error("Laýa debug: Supabase REST body", body);
    return { ok: response.ok, status: response.status, body };
  } catch (error) {
    console.error("Laýa debug: Supabase REST network error", error);
    return { ok: false, networkError: error };
  }
}

async function postWhisper(whisper) {
  console.error("Laýa debug: Supabase client exists", Boolean(supabaseClient));
  if (!supabaseClient) {
    showNotice("Debug error: Supabase client is missing. Check that the Supabase script loaded before app.js.");
    return;
  }

  if (supabaseClient) {
    let audioUploadError = null;
    try {
      const networkCheck = await debugSupabaseNetwork();
      if (networkCheck.networkError) {
        throw new Error(
          `Cannot reach Supabase project at ${SUPABASE_URL}. Check that the Project URL is exact and the project is active. Browser error: ${debugErrorMessage(networkCheck.networkError)}`
        );
      }

      try {
        whisper.audioUrl = await uploadVoiceAudio(whisper);
      } catch (error) {
        audioUploadError = error;
        console.error("Laýa debug: audio upload error", error);
        if (whisper.content) {
          whisper.audioUrl = "";
          whisper.type = "text";
        } else {
          throw error;
        }
      }

      const payload = toDbWhisper(whisper);
      console.error("Laýa debug: whisper insert payload", payload);
      const { data, error } = await supabaseClient.from("whispers").insert(payload).select("id,created_at,expires_at").single();
      console.error("Laýa debug: whisper insert response data", data);
      if (error) throw error;
      if (data?.id) whisper.id = data.id;
      if (data?.created_at) whisper.createdAt = new Date(data.created_at).getTime();
      if (audioUploadError) console.error("Laýa debug: saved as text-only after audio upload failed", audioUploadError);
    } catch (error) {
      console.error("Laýa debug: whisper insert error", error);
      showNotice(`Debug error: ${debugErrorMessage(error)}`);
      console.error("Supabase whisper insert failed", error);
      return;
    }
  }

  state.createdWhispers ||= {};
  state.createdWhispers[whisper.id] = true;
  state.whispers.unshift(whisper);
  saveState();
  els.whisperForm.reset();
  els.charCount.textContent = "0";
  clearDraft();
  hideNotice();
  render();
  beginPostTransition(whisper);
}

function beginPostTransition(whisper) {
  transitionCategory = tenderMoods.includes(whisper.mood) ? "tender" : "heavy";
  transitionInProgress = true;
  userState.lastPostedMood = whisper.mood;
  userState.capacityLevel = "none";
  saveUserState();

  if (transitionCategory === "heavy") {
    showTransitionStep({
      eyebrow: "pause first",
      title: "Pause for a moment.",
      body: "That felt heavy to share.\nTake a breath before moving on.",
      line: "Inhale slowly. Exhale gently. You are here.",
      primary: "I'm ready",
      mode: "heavy-grounding",
    });
  } else {
    const affirmations = {
      Hopeful: "Let this hope stay a little longer.",
      Grateful: "This is something worth keeping.",
      Relieved: "You can soften here.",
      Proud: "This matters more than you think.",
    };
    showTransitionStep({
      eyebrow: "stay with it",
      title: "Hold onto this feeling.",
      body: affirmations[whisper.mood] || "Let this feeling stay a little longer.",
      line: "Let the warmth settle before you move on.",
      primary: "Continue",
      mode: "tender-affirmation",
    });
  }
}

function showTransitionStep({ eyebrow, title, body, line, primary, mode }) {
  transitionMode = mode;
  els.transitionEyebrow.textContent = eyebrow;
  els.transitionTitle.textContent = title;
  els.transitionBody.textContent = body;
  els.transitionLine.textContent = line;
  els.groundingContinueButton.textContent = primary;
  els.groundingContinueButton.classList.remove("hidden");
  els.capacityActions.classList.add("hidden");
  if (!els.groundingDialog.open) els.groundingDialog.showModal();
}

function showCapacityCheck() {
  if (transitionCategory === "heavy") {
    els.transitionEyebrow.textContent = "capacity check";
    els.transitionTitle.textContent = "Do you have space for someone else right now?";
    els.transitionBody.textContent = "You don't have to hold others if you're still holding a lot.";
    els.transitionLine.textContent = "Never force yourself to give. Always check in first.";
    els.capacityYesButton.textContent = "I can hold a little";
  } else {
    els.transitionEyebrow.textContent = "capacity check";
    els.transitionTitle.textContent = "Would you like to hold space for someone?";
    els.transitionBody.textContent = "Even small kindness can mean something.";
    els.transitionLine.textContent = "Only offer what feels steady in you.";
    els.capacityYesButton.textContent = "Yes, I can";
  }
  els.groundingContinueButton.classList.add("hidden");
  els.capacityActions.classList.remove("hidden");
  transitionMode = "capacity";
}

function finishCapacity(capacityLevel) {
  userState.capacityLevel = capacityLevel;
  saveUserState();
  transitionInProgress = false;
  els.groundingDialog.close();
  if (capacityLevel === "none") {
    setRoute(transitionCategory === "heavy" ? "rest" : "mine");
    return;
  }
  setRoute("listen");
}

function activeKindnessCount(whisper) {
  return Number(whisper.kindnessCount ?? whisper.responseCount ?? 0);
}

function priorityScore(whisper) {
  const kindness = activeKindnessCount(whisper);
  const noKindnessScore = kindness === 0 ? 50 : kindness === 1 ? 25 : kindness === 2 ? 10 : 0;
  const age = Date.now() - whisper.createdAt;
  const hours = age / (60 * 60 * 1000);
  const freshnessScore = hours <= 1 ? 20 : hours <= 6 ? 15 : hours <= 24 ? 10 : hours <= 72 ? 5 : 0;
  const expiresIn = whisper.expiresAt - Date.now();
  const expiresHours = expiresIn / (60 * 60 * 1000);
  const expirationScore = expiresHours <= 12 ? 25 : expiresHours <= 24 ? 15 : expiresHours <= 48 ? 8 : 0;
  const alreadySeenPenalty = state.seen?.[whisper.id] ? 40 : 0;
  return noKindnessScore + (moodWeights[whisper.mood] || 0) + whisper.intensity * 8 + freshnessScore + expirationScore - alreadySeenPenalty;
}

function prioritizedWhispers() {
  return state.whispers
    .filter((whisper) => whisper.expiresAt > Date.now())
    .filter((whisper) => !whisper.hidden)
    .filter((whisper) => !state.responded?.[whisper.id])
    .filter((whisper) => !state.reported?.[whisper.id])
    .filter((whisper) => userState.capacityLevel !== "light" || tenderMoods.includes(whisper.mood))
    .map((whisper) => ({ ...whisper, priorityScore: priorityScore(whisper) }))
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 20)
    .sort((a, b) => visualHash(a.id) - visualHash(b.id));
}

function visualHash(value) {
  return [...value].reduce((acc, char) => (acc * 31 + char.charCodeAt(0)) % 9973, 7);
}

function bubbleStyle(whisper, index) {
  const intensity = Math.min(5, Math.max(1, Number(whisper.intensity || 3)));
  const color = moodColorMap[whisper.mood]?.[intensity - 1] || moodColorMap.Confused[2];
  const size = bubbleSizes[intensity];
  const glow = [0.08, 0.14, 0.22, 0.32, 0.42][intensity - 1];
  const duration = [13, 15, 17, 20, 24][intensity - 1];
  return `
    --bubble-color: ${color};
    --bubble-glow-color: ${hexToRgba(color, glow)};
    --bubble-size: ${size}px;
    --bubble-duration: ${duration + (index % 4)}s;
  `;
}

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function renderBubbles(whispers) {
  els.bubbleRoom.innerHTML = "";
  if (!whispers.length) {
    els.bubbleRoom.innerHTML = `<div class="empty-state">The room is quiet. A whisper will drift in soon.</div>`;
    return;
  }

  whispers.forEach((whisper, index) => {
    const bubble = document.createElement("button");
    bubble.className = `whisper-bubble bubble-${index % 7}`;
    bubble.type = "button";
    bubble.style.cssText = bubbleStyle(whisper, index);
    bubble.setAttribute("aria-label", `Open ${whisper.mood.toLowerCase()} whisper from ${relativeTime(whisper.createdAt)}`);
    bubble.addEventListener("click", () => receiveWhisper(whisper.id, bubble));
    els.bubbleRoom.appendChild(bubble);
  });
}

function heldCopy(count) {
  if (count === 0) return "No one has held this yet.";
  return `${count} ${count === 1 ? "person" : "people"} held this`;
}

function revealKindness(card, kindness, whisperId) {
  if (kindness.classList.contains("expanded")) return;
  kindness.classList.add("expanded");
  card.classList.add("kindness-open");

  const notes = kindness.querySelectorAll(".reveal-note");
  notes.forEach((note, index) => {
    window.setTimeout(() => {
      note.hidden = false;
      note.classList.add("visible");
    }, index * 240);
  });

  const reactionRows = kindness.querySelectorAll(".reply-reaction-row");
  reactionRows.forEach((reactionRow, index) => {
    window.setTimeout(() => {
      reactionRow.hidden = false;
      reactionRow.classList.add("visible");
    }, index * 240 + 180);
  });

  kindness.querySelectorAll(".reaction-button").forEach((button) => {
    button.addEventListener("click", async (event) => {
      event.stopPropagation();
      const responseId = button.dataset.responseId;
      if (!responseId || state.reactions?.[responseId]) return;
      state.reactions ||= {};
      state.reactions[responseId] = button.dataset.reaction;
      const response = state.responses.find((item) => item.id === responseId);
      if (response) response.reactionCount = Number(response.reactionCount || 0) + 1;
      if (supabaseClient && response) {
        const { error } = await supabaseClient
          .from("kindness_replies")
          .update({ reaction_count: response.reactionCount })
          .eq("id", responseId);
        if (error) console.error("Supabase reaction update failed", error);
      }
      button.classList.add("reacted");
      button.closest(".reply-reaction-row")?.querySelectorAll(".reaction-button").forEach((item) => {
        if (item !== button) item.disabled = true;
      });
      saveState();
      renderKindnessJar();
    });
  });
}

function renderKindnessJar() {
  if (!els.kindnessJar) return;
  const sentReplies = state.responses.filter((response) => response.ownerId === deviceId);
  const reactionTotal = sentReplies.reduce((sum, response) => sum + Number(response.reactionCount || 0), 0);
  const hasNewWarmth = reactionTotal > 0;
  const jarFill = reactionTotal ? Math.min(100, Math.round((reactionTotal / 6) * 100)) : 8;
  els.kindnessJar.innerHTML = `
    <div class="jar-visual" aria-hidden="true">
      <span style="height: ${jarFill}%"></span>
    </div>
    <div>
      <p class="eyebrow">kindness jar</p>
      <h3>${reactionTotal}</h3>
      <p>${hasNewWarmth ? "Someone reacted to kindness you sent." : "Hold space for someone and warmth will gather here."}</p>
    </div>
  `;
}

function renderCards(container, whispers, options = {}) {
  container.innerHTML = "";
  if (!whispers.length) {
    container.innerHTML = `<div class="empty-state">${options.empty || "No whispers here yet."}</div>`;
    return;
  }

  whispers.forEach((whisper) => {
    const responses = state.responses.filter((response) => response.whisperId === whisper.id);
    const card = els.whisperTemplate.content.firstElementChild.cloneNode(true);
    card.querySelector(".mood-tag").textContent = whisper.mood;
    card.querySelector(".time-note").textContent = relativeTime(whisper.createdAt);
    card.querySelector(".whisper-content").textContent = whisper.content;
    card.querySelector(".response-count").textContent = `${heldCopy(responses.length)} · ${intensityLabels[whisper.intensity]} (${whisper.intensity}/5)`;

    const player = card.querySelector(".voice-player");
    if (whisper.type === "voice" && whisper.audioUrl) {
      player.src = whisper.audioUrl;
      player.classList.remove("hidden");
    } else if (whisper.type === "voice") {
      card.querySelector(".whisper-content").textContent = "Voice whisper demo. Audio will play here when recorded on this device.";
    }

    const kindness = card.querySelector(".kindness-received");
    if (options.mine) {
      const reveal = document.createElement("button");
      reveal.className = "kindness-reveal";
      reveal.type = "button";
      reveal.disabled = responses.length === 0;
      reveal.innerHTML = responses.length
        ? `<strong>🌼 ${heldCopy(responses.length)}</strong><span>tap to receive</span>`
        : `<strong>${heldCopy(0)}</strong>`;
      reveal.addEventListener("click", () => revealKindness(card, kindness, whisper.id));
      kindness.appendChild(reveal);

      responses.forEach((response, index) => {
        const reply = document.createElement("div");
        reply.className = "kindness-reply reveal-note";
        reply.hidden = true;
        reply.style.setProperty("--note-opacity", String(0.94 - (index % 3) * 0.05));

        const note = document.createElement("p");
        note.className = `kindness-note note-${index % 3}`;
        note.textContent = response.message || response.presetMessage;
        reply.appendChild(note);

        const reactionRow = document.createElement("div");
        reactionRow.className = "reply-reaction-row";
        kindnessReactions.forEach((reaction) => {
          const button = document.createElement("button");
          button.className = `reaction-button${state.reactions?.[response.id] === reaction ? " reacted" : ""}`;
          button.type = "button";
          button.dataset.reaction = reaction;
          button.dataset.responseId = response.id;
          button.textContent = reaction;
          button.disabled = Boolean(state.reactions?.[response.id]);
          button.setAttribute("aria-label", `React with ${reaction}`);
          reactionRow.appendChild(button);
        });
        reply.appendChild(reactionRow);
        kindness.appendChild(reply);
      });

      if (responses.length) {
        const afterCopy = document.createElement("p");
        afterCopy.className = "kindness-after reveal-note";
        afterCopy.textContent = "This kindness was left for you.";
        afterCopy.hidden = true;
        kindness.appendChild(afterCopy);
      }
    }

    if (options.mine) {
      const expiry = document.createElement("p");
      expiry.className = "expiry-note";
      expiry.textContent = expiryCountdown(whisper.expiresAt);
      kindness.appendChild(expiry);
    }

    const kindnessButton = card.querySelector(".kindness-action");
    const alreadyResponded = Boolean(state.responded[whisper.id]);
    kindnessButton.disabled = alreadyResponded || whisper.ownerId === deviceId;
    kindnessButton.textContent = alreadyResponded ? "Kindness sent" : "Send gently";
    kindnessButton.addEventListener("click", () => openKindness(whisper.id));

    card.querySelector(".report-action").addEventListener("click", () => openReportDialog(whisper.id));

    const deleteButton = card.querySelector(".delete-action");
    if (whisper.ownerId === deviceId) {
      deleteButton.classList.remove("hidden");
      deleteButton.addEventListener("click", () => deleteWhisper(whisper.id));
    }

    container.appendChild(card);
  });
}

function render() {
  pruneExpired();
  const whispers = [...state.whispers].sort((a, b) => b.createdAt - a.createdAt);
  const myWhispers = whispers.filter((whisper) => whisper.ownerId === deviceId || state.createdWhispers?.[whisper.id]);
  renderBubbles(prioritizedWhispers());
  renderKindnessJar();
  renderCards(els.myFeed, myWhispers, {
    mine: true,
    empty: "No whispers saved on this device yet.",
  });
}

function replyContextForMood(mood) {
  return tenderMoods.includes(mood) ? "tender" : "heavy";
}

function currentReplyTones() {
  return replyToneSets[activeReplyContext] || replyToneSets.heavy;
}

function currentStarterReplies() {
  return starterReplySets[activeReplyContext] || starterReplySets.heavy;
}

function receiveWhisper(whisperId, bubble) {
  if (receiveTransitionTimer) window.clearTimeout(receiveTransitionTimer);
  bubble?.classList.add("receiving");
  els.bubbleRoom.classList.add("receiving");
  els.receiveTransition.classList.remove("hidden");
  els.receiveTransition.setAttribute("aria-hidden", "false");

  receiveTransitionTimer = window.setTimeout(() => {
    bubble?.classList.remove("receiving");
    els.bubbleRoom.classList.remove("receiving");
    els.receiveTransition.classList.add("hidden");
    els.receiveTransition.setAttribute("aria-hidden", "true");
    openKindness(whisperId);
    receiveTransitionTimer = null;
  }, 420);
}

function openKindness(whisperId) {
  activeWhisperId = whisperId;
  const whisper = state.whispers.find((item) => item.id === whisperId);
  if (!whisper) return;

  activeReplyContext = replyContextForMood(whisper.mood);
  selectedReplyTone = currentReplyTones()[0];
  resetReplyState();
  state.seen ||= {};
  state.seen[whisper.id] = true;
  saveState();
  els.kindnessMood.textContent = whisper.mood;
  els.kindnessTitle.textContent = "Someone left this here.";
  els.intensityLabel.textContent = `${intensityLabels[whisper.intensity] || "Present"} · intensity ${whisper.intensity}/5`;
  els.kindnessContent.textContent = whisper.type === "voice" ? "A voice whisper is waiting here." : whisper.content;
  els.kindnessAudio.classList.add("hidden");
  els.kindnessAudio.removeAttribute("src");
  if (whisper.type === "voice" && whisper.audioUrl) {
    els.kindnessAudio.src = whisper.audioUrl;
    els.kindnessAudio.classList.remove("hidden");
  }
  els.replyGuidance.textContent = replyGuidance[activeReplyContext];

  const alreadyResponded = Boolean(state.responded[whisper.id]);
  const ownWhisper = whisper.ownerId === deviceId;
  renderToneChips(alreadyResponded || ownWhisper);
  renderStarters(alreadyResponded || ownWhisper);
  if (alreadyResponded || ownWhisper) {
    showReplyWarning(ownWhisper ? "This is your whisper. Let others leave kindness here." : "You already left kindness on this whisper.");
    els.kindnessMessage.disabled = true;
    els.sendKindnessButton.disabled = true;
  }
  els.kindnessDialog.showModal();
}

function resetReplyState() {
  els.kindnessMessage.value = "";
  els.kindnessMessage.disabled = false;
  els.kindnessCount.textContent = "0";
  els.sendKindnessButton.disabled = false;
  els.replyWarning.classList.add("hidden");
  els.replySuccess.classList.add("hidden");
}

function renderToneChips(disabled = false) {
  els.toneList.innerHTML = "";
  currentReplyTones().forEach((tone) => {
    const button = document.createElement("button");
    button.className = `tone-chip${tone === selectedReplyTone ? " active" : ""}`;
    button.type = "button";
    button.textContent = tone;
    button.disabled = disabled;
    button.addEventListener("click", () => {
      selectedReplyTone = tone;
      renderToneChips(disabled);
    });
    els.toneList.appendChild(button);
  });
}

function renderStarters(disabled = false) {
  els.starterList.innerHTML = "";
  currentStarterReplies().forEach((starter) => {
    const button = document.createElement("button");
    button.className = "starter-chip";
    button.type = "button";
    button.textContent = starter;
    button.disabled = disabled;
    button.addEventListener("click", () => {
      els.kindnessMessage.value = starter.slice(0, 150);
      updateKindnessCount();
      clearReplyWarning();
      els.kindnessMessage.focus();
    });
    els.starterList.appendChild(button);
  });
}

function updateKindnessCount() {
  els.kindnessCount.textContent = String(els.kindnessMessage.value.length);
}

function showReplyWarning(message) {
  els.replyWarning.textContent = message;
  els.replyWarning.classList.remove("hidden");
}

function clearReplyWarning() {
  els.replyWarning.textContent = "";
  els.replyWarning.classList.add("hidden");
}

function validateKindnessReply(message) {
  const trimmed = message.trim();
  if (trimmed.length < 8) {
    return { ok: false, warning: "Write at least 8 gentle characters before sending." };
  }
  if (trimmed.length > 150 || trimmed.includes("\n")) {
    return { ok: false, blocked: true };
  }
  const safetyFlags = detectSafetyFlags(trimmed).filter((flag) => flag !== "crisis");
  if (safetyFlags.length) {
    return { ok: false, blocked: true, reason: safetyFlags.join(", ") };
  }
  const blocked = replyBlockedPatterns.find((item) => item.pattern.test(trimmed));
  if (blocked) {
    return { ok: false, blocked: true, reason: blocked.label };
  }
  if (harshReplyPatterns.some((pattern) => pattern.test(trimmed))) {
    return { ok: false, warning: "This may feel a little too heavy for this space. Try making it softer, shorter, and more present." };
  }
  return { ok: true };
}

async function sendKindness(message, validation) {
  if (!activeWhisperId || state.responded[activeWhisperId]) return;
  const reply = {
    id: crypto.randomUUID(),
    whisperId: activeWhisperId,
    replyTone: selectedReplyTone,
    message,
    createdAt: Date.now(),
    flagged: false,
    blockedReason: validation?.reason || "",
    ownerId: deviceId,
    reactionCount: 0,
  };
  const whisper = state.whispers.find((item) => item.id === activeWhisperId);
  const nextKindnessCount = whisper ? activeKindnessCount(whisper) + 1 : 1;

  if (supabaseClient) {
    try {
      const { error: replyError } = await supabaseClient.from("kindness_replies").insert(toDbReply(reply));
      if (replyError) throw replyError;
      const { error: countError } = await supabaseClient
        .from("whispers")
        .update({ kindness_count: nextKindnessCount })
        .eq("id", activeWhisperId);
      if (countError) throw countError;
    } catch (error) {
      showReplyWarning(`Laýa could not send this kindness yet. ${debugErrorMessage(error)}`);
      console.error("Supabase kindness insert failed", error);
      return;
    }
  }

  state.responses.push(reply);
  if (whisper) {
    whisper.kindnessCount = nextKindnessCount;
    whisper.responseCount = whisper.kindnessCount;
  }
  state.responded[activeWhisperId] = true;
  saveState();
  els.replySuccess.classList.remove("hidden");
  els.sendKindnessButton.disabled = true;
  els.kindnessMessage.disabled = true;
  if (els.kindnessDialog.open) els.kindnessDialog.close();
  render();
}

function openReportDialog(whisperId) {
  activeReportWhisperId = whisperId;
  els.reportContext.value = "";
  els.reportSuccess.textContent = "Thank you. We’ll hold this carefully.";
  els.reportSuccess.classList.add("hidden");
  els.reportForm.querySelector('input[name="reportReason"]').checked = true;
  if (els.kindnessDialog.open) els.kindnessDialog.close();
  els.reportDialog.showModal();
}

async function submitReport() {
  const whisper = state.whispers.find((item) => item.id === activeReportWhisperId);
  if (!whisper) return;
  const reason = els.reportForm.querySelector('input[name="reportReason"]:checked')?.value || "Other";
  const optionalContext = els.reportContext.value.trim();
  const report = {
    id: crypto.randomUUID(),
    whisperId: whisper.id,
    reason,
    optionalContext,
    createdAt: Date.now(),
  };
  const reportReasons = [...(whisper.reportReasons || []), reason];
  const crisisFlagged = whisper.crisis_flagged || reason === "Self-harm or suicide concern";
  const hidden = whisper.hidden || reason === "Self-harm or suicide concern";

  if (supabaseClient) {
    try {
      const { error: reportError } = await supabaseClient.from("reports").insert(toDbReport(report));
      if (reportError) throw reportError;
      const { error: whisperError } = await supabaseClient
        .from("whispers")
        .update({
          reported_count: Number(whisper.reportedCount || 0) + 1,
          report_reasons: reportReasons,
          crisis_flagged: crisisFlagged,
          hidden,
        })
        .eq("id", whisper.id);
      if (whisperError) throw whisperError;
    } catch (error) {
      els.reportSuccess.textContent = `Laýa could not save this report yet. ${debugErrorMessage(error)}`;
      els.reportSuccess.classList.remove("hidden");
      console.error("Supabase report insert failed", error);
      return;
    }
  }

  state.reports ||= [];
  state.reports.push(report);
  whisper.reportedCount += 1;
  whisper.reportReasons = reportReasons;
  whisper.crisis_flagged = crisisFlagged;
  whisper.hidden = hidden;
  state.reported ||= {};
  state.reported[whisper.id] = true;
  saveState();
  render();
  els.reportSuccess.classList.remove("hidden");
  window.setTimeout(() => {
    if (els.reportDialog.open) els.reportDialog.close();
  }, 900);
}

async function deleteWhisper(whisperId) {
  if (supabaseClient) {
    const { error } = await supabaseClient
      .from("whispers")
      .update({ hidden: true })
      .eq("id", whisperId);
    if (error) {
      console.error("Supabase whisper hide failed", error);
      alert(`Laýa could not delete this whisper yet. ${debugErrorMessage(error)}`);
      return;
    }
  }

  const removedResponseIds = state.responses.filter((response) => response.whisperId === whisperId).map((response) => response.id);
  state.whispers = state.whispers.filter((whisper) => whisper.id !== whisperId);
  state.responses = state.responses.filter((response) => response.whisperId !== whisperId);
  delete state.createdWhispers?.[whisperId];
  delete state.responded[whisperId];
  delete state.reported?.[whisperId];
  delete state.seen?.[whisperId];
  removedResponseIds.forEach((responseId) => delete state.reactions?.[responseId]);
  saveState();
  render();
}

async function startRecording() {
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    els.recordStatus.textContent = "Voice recording needs localhost, HTTPS, and microphone access.";
    return;
  }

  clearDraft();
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  recordChunks = [];
  const mimeType = getPreferredAudioMimeType();
  mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  mediaRecorder.ondataavailable = (event) => {
    if (event.data.size) recordChunks.push(event.data);
  };
  mediaRecorder.onstop = () => {
    stream.getTracks().forEach((track) => track.stop());
    const blob = new Blob(recordChunks, { type: mediaRecorder?.mimeType || mimeType || "audio/webm" });
    if (!recordChunks.length || !blob.size) {
      els.recordStatus.textContent = "No audio was captured. Try again and allow microphone access.";
      els.playDraftButton.disabled = true;
      els.clearDraftButton.disabled = true;
      return;
    }

    draftAudioBlob = blob;
    draftAudioPreviewUrl = URL.createObjectURL(blob);
    const reader = new FileReader();
    reader.onloadend = () => {
      draftAudioUrl = String(reader.result || "");
      els.playDraftButton.disabled = !draftAudioUrl;
      els.clearDraftButton.disabled = !draftAudioUrl;
      els.recordStatus.textContent = "Your whisper is ready";
      els.voiceRecorder.classList.toggle("has-draft", Boolean(draftAudioUrl));
    };
    reader.onerror = () => {
      els.recordStatus.textContent = "Laýa could not prepare the voice preview. Please try again.";
      clearDraft();
    };
    reader.readAsDataURL(blob);
  };
  mediaRecorder.onerror = (event) => {
    console.error("Laýa recorder error", event.error || event);
    els.recordStatus.textContent = "Laýa could not keep recording. Please try again.";
    stream.getTracks().forEach((track) => track.stop());
    clearDraft();
  };
  mediaRecorder.start(250);
  els.recordButton.classList.add("recording");
  els.voiceRecorder.classList.add("recording");
  els.recordButton.setAttribute("aria-label", "Stop recording");
  els.recordStatus.textContent = "Recording… tap to stop";

  setTimeout(() => {
    if (mediaRecorder?.state === "recording") stopRecording();
  }, 60000);
}

function stopRecording() {
  if (mediaRecorder?.state === "recording") mediaRecorder.stop();
  els.recordButton.classList.remove("recording");
  els.voiceRecorder.classList.remove("recording");
  els.recordButton.setAttribute("aria-label", "Record voice whisper");
}

function clearDraft() {
  if (draftAudioPreviewUrl) URL.revokeObjectURL(draftAudioPreviewUrl);
  draftAudioUrl = "";
  draftAudioPreviewUrl = "";
  draftAudioBlob = null;
  els.playDraftButton.disabled = true;
  els.clearDraftButton.disabled = true;
  els.voiceRecorder.classList.remove("has-draft", "recording");
  els.recordButton.classList.remove("recording");
  els.recordButton.setAttribute("aria-label", "Record voice whisper");
  els.recordStatus.textContent = "Tap to begin recording";
}

function bindEvents() {
  els.routeButtons.forEach((button) => {
    button.addEventListener("click", () => setRoute(button.dataset.route));
  });

  els.whisperText.addEventListener("input", () => {
    els.charCount.textContent = String(els.whisperText.value.length);
    hideNotice();
  });

  els.kindnessMessage.addEventListener("input", () => {
    updateKindnessCount();
    clearReplyWarning();
  });

  els.whisperForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const result = createWhisper();
    if (result.error) {
      showNotice(result.error);
      return;
    }
    if (result.crisis) {
      pendingCrisisPost = result.whisper;
      els.crisisDialog.showModal();
      return;
    }
    await postWhisper(result.whisper);
  });

  els.continuePostButton.addEventListener("click", async () => {
    if (pendingCrisisPost) await postWhisper(pendingCrisisPost);
    pendingCrisisPost = null;
    els.crisisDialog.close();
  });

  els.groundingDialog.addEventListener("cancel", (event) => {
    if (transitionInProgress) event.preventDefault();
  });

  els.groundingContinueButton.addEventListener("click", () => {
    if (transitionMode === "heavy-grounding" || transitionMode === "tender-affirmation") {
      showCapacityCheck();
    }
  });

  els.capacityNoneButton.addEventListener("click", () => {
    finishCapacity("none");
  });

  els.capacityYesButton.addEventListener("click", () => {
    finishCapacity(transitionCategory === "heavy" ? "light" : "full");
  });

  els.recordButton.addEventListener("click", async () => {
    if (mediaRecorder?.state === "recording") {
      stopRecording();
      return;
    }
    try {
      await startRecording();
    } catch (error) {
      console.error("Laýa microphone start failed", error);
      els.recordStatus.textContent = microphoneErrorMessage(error);
    }
  });

  els.playDraftButton.addEventListener("click", () => {
    const audioSource = draftAudioPreviewUrl || draftAudioUrl;
    if (!audioSource) return;
    const audio = new Audio(audioSource);
    audio.play().catch((error) => {
      console.error("Laýa voice preview failed", error);
      els.recordStatus.textContent = "This browser could not play the preview. Try recording again.";
    });
  });

  els.clearDraftButton.addEventListener("click", clearDraft);

  els.showSupportButton.addEventListener("click", () => {
    els.supportResources.classList.remove("hidden");
  });

  els.kindnessForm.addEventListener("submit", async (event) => {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    const message = els.kindnessMessage.value.trim();
    const validation = validateKindnessReply(message);
    if (!validation.ok) {
      const blockedMessage = "Let's keep this space gentle and safe. No personal info, no advice, no chasing — just kindness.";
      showReplyWarning(validation.blocked ? blockedMessage : validation.warning);
      return;
    }
    await sendKindness(message, validation);
  });

  els.reportForm.addEventListener("submit", async (event) => {
    if (event.submitter?.value === "cancel") return;
    event.preventDefault();
    await submitReport();
  });

  els.resetDemoButton?.addEventListener("click", () => {
    state = normalizeState({
      whispers: [],
      responses: [],
      reports: [],
      createdWhispers: {},
      responded: {},
      reported: {},
      seen: {},
      reactions: {},
    });
    userState = { lastPostedMood: "", capacityLevel: "full" };
    saveUserState();
    saveState();
    render();
    setRoute("home");
  });

  els.modalReportButton.addEventListener("click", () => {
    if (!activeWhisperId) return;
    openReportDialog(activeWhisperId);
  });
}

async function init() {
  renderMoodButtons();
  renderIntensityButtons();
  bindEvents();
  saveState();
  try {
    await refreshFromSupabase();
  } catch (error) {
    console.error("Supabase refresh failed", error);
    showNotice("Laýa could not sync with the room yet. You can try refreshing in a moment.");
    render();
  }
  setRoute("home");
}

init();
