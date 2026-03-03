/* ===============================
   Dev Mode Toggle Hook
================================= */

const devMode = localStorage.getItem("devMode") === true; 
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
   Cat Brain
================================= */

const input = document.getElementById("catGPTInput");
const messages = document.getElementById("catGPTMessages");

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

input.addEventListener("keydown", function(e) {
  if (e.key === "Enter") {
    const userMessage = input.value.trim();
    if (!userMessage) return;

    addCatMessage("You", userMessage);
    input.value = "";

    const reply = catBrain(userMessage);
    setTimeout(() => addCatMessage("Cat EmporiumGPT", reply), 300);
  }
});

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
  text = text.toLowerCase();
  const avatar = document.getElementById("catAvatar");

  avatar.classList.add("cat-thinking");

  let response;

  if (text.includes("fact")) {
    response = randomFact() + " " + randomMood();
  }

  else if (text.includes("hello") || text.includes("hi")) {
    response = "Welcome to The Cat Emporium. I guard this realm. " + randomMood();
  }

  else if (text.includes("how many images")) {
    const imgs = document.querySelectorAll("img").length;
    response = `There are ${imgs} glorious cat images on this page.`;
  }

  else if (text.includes("github")) {
    response = "This site lives proudly on GitHub Pages.";
  }
  
  else if (text.includes("theme")) {
    response = isDarkMode()
      ? "The shadows embrace us."
      : "The sun shines upon the cats.";
  }

  else if (text.includes("dark mode")) {
    response = "Dark Mode suits nocturnal hunters like me.";
  }

  else if (window.settings?.devMode && text === "/repo") {
    response = await fetchRepoInfo();
  }
  
  else if (devMode && text.startsWith("/inspect")) {
    const sel = text.replace("/inspect", "").trim();
    const el = document.querySelector(sel);
    response = el ? `Found <${el.tagName.toLowerCase()}>` : "Not found.";
  }
  
  else if (window.settings?.devMode && text === "/export") {
    exportChat();
    response = "Chat exported as .tcechat file.";
  }
  
  else if (window.settings?.devMode && text === "/import") {
    importChat();
    response = "Select a .tcechat file to import.";
  }
    
  else if (window.settings?.devMode && text === "/clear") {
    clearChat();
    response = "Chat history cleared.";
  }
  
  else if (devMode && text === "/dumpimages") {
    const srcs = [...document.querySelectorAll("img")].map(i => i.src);
    response = "Image sources:\n" + srcs.join("\n");
  }

  else {
    response = "I am but a humble cat oracle. Ask me for a fact.";
  }

  setTimeout(() => avatar.classList.remove("cat-thinking"), 500);

  return response;
}