const btn = document.getElementById("settingsBtn");
const menu = document.getElementById("settingsMenu");
const darkToggle = document.getElementById("darkToggle");
//const notifToggle = document.getElementById("notifToggle");
const extToggle = document.getElementById("extToggle");
const devMode = document.getElementById("devMode")
const middle = document.querySelector(".middle")
const normal = document.querySelector(".normal")
const extended = document.querySelector(".extended")
const dev = document.querySelector(".dev")
const devMenuItem = document.querySelector(".dev li")

// Reload page
function reload_page() {
  location.reload;
}

// Detect system dark mode
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  darkToggle.checked = true;
  if (!window.forceTransparentMiddle) {
    middle.style.background = "#000";
    middle.style.color = "white";
  }
}

// Load saved dark mode preference
if (localStorage.getItem("darkMode") === "true") {
  darkToggle.checked = true;
  if (!window.forceTransparentMiddle) {
    middle.style.background = "#000";
    middle.style.color = "white";
  }
} else if (localStorage.getItem("darkMode") === "false") {
  darkToggle.checked = false;
  if (!window.forceTransparentMiddle) {
    middle.style.background = "#FFF";
    middle.style.color = "black";
  }
}

// Toggle dark mode
darkToggle.addEventListener("change", function() {
  const isDark = darkToggle.checked;
  if (!window.forceTransparentMiddle) {
    middle.style.background = isDark ? "#FFF" : "#000";
    middle.style.color = isDark ? "black" : "white";
  }
  localStorage.setItem("darkMode", isDark);
  reload_page()
});

// Load saved extended paragraphs preference
if (localStorage.getItem("extPara") === "true") {
  extToggle.checked = true;
  normal.style.display = "none";
  extended.style.display = "inline";
} else if (localStorage.getItem("extPara") === "false") {
  extToggle.checked = false;
  normal.style.display = "inline";
  extended.style.display = "none";
}

// Toggle extended paragraphs
extToggle.addEventListener("change", function() {
  const isExt = extToggle.checked;
  normal.style.display = isExt ? "inline" : "none";
  extended.style.display = isExt ? "none" : "inline";
  localStorage.setItem("extPara", isExt);
  reload_page()
});

// Load saved dev mode
if (localStorage.getItem("devMode") === "true") {
  devMode.checked = true;
  dev.style.display = "flex";
  if (devMenuItem !== "null") {
    devMenuItem.style.width = "20%";
    devMenuItem.style.paddingleft = "10px";
    devMenuItem.style.paddingright = "10px";
  }
} else if (localStorage.getItem("devMode") === "false") {
  devMode.checked = false;
  dev.style.display = "none";
  if (devMenuItem !== "null") {
    devMenuItem.style.width = "0%";
    devMenuItem.style.paddingleft = "0px";
    devMenuItem.style.paddingright = "0px";
  }
}

// Toggle dev mode
devMode.addEventListener("change", function() {
  const isDev = devMode.checked;
  dev.style.display = isDev ? "none" : "flex";
  if (devMenuItem !== "null") {
    devMenuItem.style.width = isDev ? "0%" : "20%";
    devMenuItem.style.paddingleft = isDev ? "0px" : "10px";
    devMenuItem.style.paddingright = isDev ? "0px" : "10px";
  }
  localStorage.setItem("devMode", isDev);
  reload_page()
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
