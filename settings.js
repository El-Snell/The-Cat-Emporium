const btn = document.getElementById("settingsBtn");
const menu = document.getElementById("settingsMenu");
const darkToggle = document.getElementById("darkToggle");
//const notifToggle = document.getElementById("notifToggle");
const extToggle = document.getElementById("extToggle");
const middle = document.querySelector(".middle")
const normal = document.querySelector(".normal")
const extended = document.querySelector(".extended")
const fontToggle = document.getElementById("fontToggle");
const body = document.querySelector("body[name='body']");
const reg = document.querySelectorAll(".reginf");
const cust = document.querySelectorAll(".custfontinf");
const search = document.getElementById("search");
const menucomp = window.getComputedStyle(menu);

// Reload page
function reload_page() {
  location.reload();
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

// Load saved custom font preference
if (localStorage.getItem("custFont") === "true") {
  fontToggle.checked = true;
  body.classList.add("font");
  for (let i = 0; i < reg.length; i++) {
    reg[i].style.display = "none";
    cust[i].style.display = "inline";
  }
} else if (localStorage.getItem("custFont") === "false") {
  fontToggle.checked = false;
  for (let i = 0; i < reg.length; i++) {
    reg[i].style.display = "inline";
    cust[i].style.display = "none";
  }
}

// Toggle custom font
fontToggle.addEventListener("change", function() {
  const isFont = fontToggle.checked;
  if (isFont === "true") {
    body.classList.add("font"); 
  } else if (isFont === "false") {
    body.classList.remove("font");
  }
  for (let i = 0; i < reg.length; i++) {
    reg[i].style.display = isFont ? "inline" : "none";
    cust[i].style.display = isFont ? "none" : "inline";
  }
  localStorage.setItem("custFont", isFont);
  reload_page()
});

// Show/hide menu
btn.addEventListener("click", function(e) {
  e.stopPropagation();
  menu.classList.toggle("show");
  if (search) {
    if (menu.classList.contains("show")) {
      let val = (38.5 + (parseInt(menucomp.getPropertyValue("height"))) + 20);
      console.log(val);
      search.style.top = `${val}px`;
    } else {
      search.style.top = "38.5px";
    }
  }
});
// Close when clicking outside
document.addEventListener("click", function() {
  menu.classList.remove("show");
  if (search) {
    search.style.top = "38.5px";
  }
});
