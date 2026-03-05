/* ===============================
   Dev Mode Toggle Hook
================================= */

const devMode = localStorage.getItem("devMode") === "true"; 
const CHAT_STORAGE_KEY = "tce_chat_history_v1";

if (devMode) {
  document.getElementById("catGPT").classList.remove("hidden-cat-gpt");
}
// i havent decided on this yet...
//if (window.settings?.devMode || true /* allow public use */) {
//  loadCat();
//}


/* Custom Brain Logic */
/*function catBrain(text) {
  text = text.toLowerCase();

  if (text.includes("hello") || text.includes("hi")) {
    return "Meow! 🐾 Welcome! Want cat facts or site help?";
  }

  if (text.includes("cats")) {
    return "Cats purr when happy and nap often 🐱.";
  }

  if (text.includes("images")) {
    const imgs = document.querySelectorAll("img").length;
    return `I count ${imgs} cat images on this page!`;
  }

  if (text.includes("dark mode")) {
    return "Dark Mode is an excellent choice for nocturnal cats 😼.";
  }

  if (devMode && text.startsWith("/inspect")) {
    const sel = text.replace("/inspect", "").trim();
    const el = document.querySelector(sel);
    return el ? `Found <${el.tagName.toLowerCase()}>` : "Not found.";
  }

  if (devMode && text === "/dumpimages") {
    const srcs = [...document.querySelectorAll("img")].map(i => i.src);
    return "Image sources:\n" + srcs.join("\n");
  }

  return "Meow? I know about cats, images, and page elements!";
}*/

/* ===============================
   Helper: tiny intent utils
================================= */

function setCatStatus(msg, show = true) {
  const el = document.getElementById("catStatus");
  if (!el) return;
  el.style.display = show ? "block" : "none";
  el.textContent = msg;
}

function catLog(label, data) {
  // Writes to chat + status so you can see issues on mobile
  const text = data ? `${label}: ${String(data)}` : label;
  setCatStatus(text, true);
  try { addCatMessage("System", text, false); } catch {}
}

function includesAny(t, arr) {
  return arr.some(w => t.includes(w));
}

function normalize(s) {
  return String(s || "").toLowerCase().trim();
}

function listProjects() {
  const projects = window.catKnowledge?.projects || [];
  if (!projects.length) return "No projects are listed yet.";
  return projects.map(p => `• ${p.name}: ${p.desc}`).join("\n");
}

function getSocials() {
  const socials = window.catKnowledge?.socials || {};
  const keys = Object.keys(socials);
  if (!keys.length) return "No socials are listed yet.";
  return keys.map(k => `• ${k}: ${socials[k]}`).join("\n");
}

function pageSummary() {
  const title = document.title || "(untitled)";
  const url = location.href;
  const imgs = document.querySelectorAll("img").length;
  const links = document.querySelectorAll("a").length;
  const forms = document.querySelectorAll("form").length;
  return `Page: ${title}\nURL: ${url}\nLinks: ${links} | Images: ${imgs} | Forms: ${forms}`;
}

function findTextOnPage(query) {
  const q = normalize(query);
  if (!q) return "Tell me what text to find. Example: find \"shop\"";
  const bodyText = normalize(document.body?.innerText || "");
  const idx = bodyText.indexOf(q);
  if (idx === -1) return `I couldn't find "${query}" on this page.`;
  // show a small snippet around it
  const start = Math.max(0, idx - 60);
  const end = Math.min(bodyText.length, idx + q.length + 60);
  const snippet = (document.body.innerText || "").slice(start, end).replace(/\s+/g, " ").trim();
  return `Found it:\n“…${snippet}…”`;
}

function helperHelp(isDev) {
  const base =
`Try:
• "help" – show commands
• "page" – page summary (title/url/counts)
• "projects" – list site projects
• "about" / "owner" – info from catKnowledge
• "socials" / "github link" – links from catKnowledge
• "find <text>" – search for text on this page
• "how many images" – count images
• "theme" / "dark mode" – theme response
• "fact" – random cat fact`;

  const dev =
`\nDev commands:
• /inspect <css selector>
• /dumpimages
• /repo
• /export
• /import
• /clear`;

  return isDev ? base + dev : base;
}
function buildPageContext() {
  // Keep it short to avoid huge prompts.
  const title = document.title || "";
  const url = location.href;

  const styles = Array.from(document.styleSheets || [])
    .slice(0, 5)
    .map(ss => ss.href ? `stylesheet: ${ss.href}` : "stylesheet: inline")
    .join("\n");

  const scripts = Array.from(document.scripts || [])
    .slice(0, 8)
    .map(s => s.src ? `script: ${s.src}` : "script: inline")
    .join("\n");

  // Lightweight DOM snapshot: main landmarks + ids/classes (no full HTML dump)
  /*const landmarks = Array.from(document.querySelectorAll("header, nav, main, section, footer"))
    .slice(0, 12)
    .map(el => {
      const id = el.id ? `#${el.id}` : "";
      const cls = el.className ? `.${String(el.className).trim().split(/\s+/).slice(0, 3).join(".")}` : "";
      return `<${el.tagName.toLowerCase()}${id}${cls}>`;
    })
    .join("\n");*/

  const counts = {
    links: document.querySelectorAll("a").length,
    images: document.querySelectorAll("img").length,
    buttons: document.querySelectorAll("button").length,
    forms: document.querySelectorAll("form").length
  };

  // A little visible text helps the model answer “where is X” questions
  const textSample = (document.body?.innerText || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1200);

  return {
    title,
    url,
    counts,
    assets: { styles, scripts },
//    landmarks,
    textSample
  };
}


/* ===============================
   Cat Brain
================================= */

const input = document.getElementById("catGPTInput");
const messages = document.getElementById("catGPTMessages");
const AI_ENDPOINT = "https://the-cat-emporium-worker.angsutton03.workers.dev";

const catFacts = [
  "Cats sleep 12–16 hours a day.",
  "A group of cats is called a clowder.",
  "Cats have five toes on their front paws but four on the back.",
  "A cat's nose print is unique like a fingerprint.",
  "Cats can rotate their ears 180 degrees.",
  "The world's oldest cat lived to be 38 years old.",
  "Cats use their whiskers to measure spaces.",
  "Purring can help heal bones and tissues.",
  "Ancient Egyptians worshipped cats.",
  "Cats can jump up to six times their body length."
];

document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("catGPTInput");
  if (!input) return;

  async function sendMessage() => {
    // Physical keyboard support + safety
    //if (e.key !== "Enter" && e.keyCode !== 13) return;
    //if (e.shiftKey) return; // allow Shift+Enter if you ever want multiline

    //e.preventDefault;

    const userMessage = input.value.trim();
    if (!userMessage) return;

    addCatMessage("You", userMessage);
    input.value = "";

    const reply = await catBrain(userMessage);
    setTimeout(() => addCatMessage("Cat EmporiumGPT", reply), 300);
  });
});
/*async function sendMessage() => {
  const userMessage = input.value.trim();
  if (!userMessage) {return;};

  addCatMessage("You", userMessage);
  input.value = "";

  try {
    setCatStatus("Thinking…", true);
    const reply = await catBrain(userMessage);
    addCatMessage("Cat EmporiumGPT", reply);
    setCatStatus("", false);
  } catch (err) {
    catLog("Chat error", err?.message || err);
  }
});*/

function addCatMessage(sender, text, save = true) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  catGPTMessages.appendChild(div);
  catGPTMessages.scrollTop = catGPTMessages.scrollHeight;

  if (save) {
    saveMessage(sender, text);
  }
}
window.catKnowledge = {
  owner: "********",
  about: "Creative developer building fun web experiments.",
  projects: [
    { name: "Project One", desc: "Interactive portfolio piece." },
    { name: "Project Two", desc: "AI-powered widget." }
  ],
  socials: {
    github: "https://github.com/el-snell"
  }
};
const catMoods = ["😼", "😺", "🐾", "😸", "😽"];

function randomMood() {
  return catMoods[Math.floor(Math.random() * catMoods.length)];
}

function randomFact() {
  return catFacts[Math.floor(Math.random() * catFacts.length)];
}
async function askCatAI(userText) {
  const payload = {
    userText,
    pageContext: buildPageContext(),
    // Optional: include your catKnowledge for “project” / “socials” questions
    catKnowledge: window.catKnowledge || null
  };

  const res = await fetch("/api/cat-ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("AI endpoint error");
  const data = await res.json();
  return String(data.reply || "").trim();
}
async function fetchRepoInfo() {
  try {
    const res = await fetch("https://api.github.com/repos/el-snell/The-Cat-Emporium");
    const data = await res.json();

    return `
⭐ Stars: ${data.stargazers_count}
🍴 Forks: ${data.forks_count}
📅 Last Updated: ${new Date(data.updated_at).toLocaleDateString()}
    `;
  } catch {
    return "Could not fetch repo data.";
  }
}
function isDarkMode() {
  return document.body.classList.contains("dark");
}
function saveMessage(sender, text) {
  const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
  history.push({ sender, text, timestamp: Date.now() });
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(history));
}

function loadChatHistory() {
  const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];
  history.forEach(msg => {
    addCatMessage(msg.sender, msg.text, false);
  });
}
function exportChat() {
  const history = JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY)) || [];

  const chatFile = {
    version: "1.0",
    created: Date.now(),
    site: "The Cat Emporium",
    messages: history
  };

  const blob = new Blob(
    [JSON.stringify(chatFile, null, 2)],
    { type: "application/json" }
  );

  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "chat.tcechat";
  a.click();
}
const chatImport = document.getElementById("chatImport");

function importChat() {
  chatImport.click();
}

chatImport.addEventListener("change", function() {
  const file = this.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const data = JSON.parse(e.target.result);

      if (data.version && data.messages) {
        localStorage.setItem(
          CHAT_STORAGE_KEY,
          JSON.stringify(data.messages)
        );

        catGPTMessages.innerHTML = "";
        loadChatHistory();
        alert("Chat imported successfully 🐾");
      } else {
        alert("Invalid .tcechat file.");
      }
    } catch {
      alert("Error reading file.");
    }
  };

  reader.readAsText(file);
});
function clearChat() {
  localStorage.removeItem(CHAT_STORAGE_KEY);
  catGPTMessages.innerHTML = "";
}
loadChatHistory();

/* ===============================
   Response Engine
================================= */

async function catBrain(text) {
  text = String(text || "");
  const t = text.toLowerCase();
  const avatar = document.getElementById("catAvatar");
  avatar.classList.add("cat-thinking");

  // keep your dev logic exactly as you already use it:
  const isDev = Boolean(localStorage.getItem("devMode")) || devMode;

  let response;

  /* --- NEW: help / command discovery --- */
  if (t === "help" || t === "commands" || t === "menu" || t === "?") {
    response = helperHelp(isDev);
  }

  /* --- Existing behavior: facts/greetings/page/theme/github --- */
  else if (t.includes("fact")) {
    response = randomFact() + " " + randomMood();
  }

  else if (t.includes("hello") || t.includes("hi")) {
    response = "Welcome to The Cat Emporium. I guard this realm. " + randomMood();
  }

  else if (t.includes("how many images")) {
    const imgs = document.querySelectorAll("img").length;
    response = `There are ${imgs} glorious cat images on this page.`;
  }

  else if (t.includes("github")) {
    // keep existing response, but if user asks for link, be more helpful
    if (includesAny(t, ["link", "url", "profile", "repo"])) {
      const gh = window.catKnowledge?.socials?.github;
      response = gh ? `GitHub: ${gh}` : "This site lives proudly on GitHub Pages.";
    } else {
      response = "This site lives proudly on GitHub Pages.";
    }
  }

  else if (t.includes("theme")) {
    response = isDarkMode()
      ? "The shadows embrace us."
      : "The sun shines upon the cats.";
  }

  else if (t.includes("dark mode")) {
    response = "Dark Mode suits nocturnal hunters like me.";
  }

  /* --- NEW: site helper intents using catKnowledge --- */
  else if (includesAny(t, ["about", "who are you", "what are you"])) {
    const about = window.catKnowledge?.about;
    response = about ? about : "I am the Cat Emporium helper.";
  }

  else if (includesAny(t, ["owner", "creator", "made you", "who made"])) {
    const owner = window.catKnowledge?.owner;
    response = owner ? `Owner: ${owner}` : "Owner info is not set.";
  }

  else if (includesAny(t, ["projects", "project"])) {
    response = listProjects();
  }

  else if (includesAny(t, ["socials", "social", "links"])) {
    response = getSocials();
  }

  /* --- NEW: page utilities --- */
  else if (t === "page" || t === "page info" || t === "summary") {
    response = pageSummary();
  }

  else if (t.startsWith("find ")) {
    response = findTextOnPage(text.slice(5));
  }

  /* --- Existing dev commands (unchanged behavior) --- */
  else if (window.settings?.devMode && t === "/repo") {
    response = await fetchRepoInfo();
  }

  else if (devMode && t.startsWith("/inspect")) {
    const sel = t.replace("/inspect", "").trim();
    const el = document.querySelector(sel);
    response = el ? `Found <${el.tagName.toLowerCase()}>` : "Not found.";
  }

  else if (window.settings?.devMode && t === "/export") {
    exportChat();
    response = "Chat exported as .tcechat file.";
  }

  else if (window.settings?.devMode && t === "/import") {
    importChat();
    response = "Select a .tcechat file to import.";
  }

  else if (window.settings?.devMode && t === "/clear") {
    clearChat();
    response = "Chat history cleared.";
  }

  else if (devMode && t === "/dumpimages") {
    const srcs = [...document.querySelectorAll("img")].map(i => i.src);
    response = "Image sources:\n" + srcs.join("\n");
  }

  /* --- NEW: smarter fallback (still safe + minimal) --- */
  else {
    try {
      // Let “real AI” handle everything you didn’t explicitly pattern-match.
      response = await askCatAI(text);
      if (!response) response = "I couldn't think of a helpful reply. Type \"help\".";
    } catch {
      // Preserve your existing non-AI fallback if the backend is down.
      response = "I am but a humble cat oracle. Ask me for a fact — or type \"help\".";
    }
  }

  setTimeout(() => avatar.classList.remove("cat-thinking"), 500);
  return response;
}