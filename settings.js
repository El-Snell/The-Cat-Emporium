const btn = document.getElementById("settingsBtn");
const menu = document.getElementById("settingsMenu");
const darkToggle = document.getElementById("darkToggle");
//const notifToggle = document.getElementById("notifToggle");
const extToggle = document.getElementById("extToggle");

// Detect system dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  darkToggle.checked = true;
  document.middle.style.background = "#000";
  document.middle.style.color = "white";
}

// Load saved dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  darkToggle.checked = true;
  document.middle.style.background = "#000";
  document.middle.style.color = "white";
} else if (localStorage.getItem("darkMode") === "false") {
  darkToggle.checked = false;
  document.middle.style.background = "#FFF";
  document.middle.style.color = "black";
}

// Toggle dark mode
darkToggle.addEventListener("change", function() {
  const isDark = darkToggle.checked;
  document.middle.style.background = isDark ? "#FFF" : "#000";
  document.middle.style.color = isDark ? "white" : "black";
  localStorage.setItem("darkMode", isDark);
});

// Load saved extended paragraphs preference
if (localStorage.getItem("extPara") === "true") {
  extToggle.checked = true;
  document.normal.style.display = none;
  document.extended.style.display = inline;
} else if (localStorage.getItem("extPara") === "false") {
  extToggle.checked = false;
  document.normal.style.display = inline;
  document.extended.style.display = none;
}

// Toggle extended paragraphs
extToggle.addEventListener("change", function() {
  const isExt = extToggle.checked;
  document.normal.style.display = isExt ? inline : none;
  document.extended.style.display = isExt ? none : inline;
  localStorage.setItem("extPara", isExt);
});

  // Toggle notifications (optional localStorage)
  //notifToggle.addEventListener("change", function() {
  //  localStorage.setItem("notifications", notifToggle.checked);
  //});

// Show/hide menu
btn.addEventListener("click", function(e) {
  e.stopPropagation();
  menu.classList.toggle("show");
});
// Close when clicking outside
document.addEventListener("click", function() {
  menu.classList.remove("show");
});
