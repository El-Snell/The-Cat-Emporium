const legoToggle = document.getElementById("lego");
const legoOverlay = document.getElementById("lego-overlay");

legoToggle.addEventListener("change", () => {
  if (!legoToggle.checked) return;

  // Clear previous pieces
  legoOverlay.innerHTML = "";

  // Create a bunch of LEGO pieces
  const pieces = 80;

  for (let i = 0; i < pieces; i++) {
    const lego = document.createElement("div");
    lego.className = "lego-piece";

    // Spread them across the page
    lego.style.left = `${Math.random() * 100}%`;

    // Different brick sizes
    const width = 45 + Math.random() * 70;
    lego.style.width = `${width}px`;

    // Random landing height
    lego.style.setProperty(
      "--bottom",
      `${Math.random() * 85}%`
    );

    // Random rotation while falling
    lego.style.setProperty(
      "--rotation",
      `${-360 + Math.random() * 720}deg`
    );

    // Different LEGO colors
    const colors = [
      "#e30613",
      "#0057b8",
      "#ffd500",
      "#00a650",
      "#ff6f00",
      "#ffffff"
    ];

    lego.style.background =
      colors[Math.floor(Math.random() * colors.length)];

    // Stagger the rain
    lego.style.animationDelay =
      `${Math.random() * 1.2}s`;

    legoOverlay.appendChild(lego);
  }

  legoOverlay.classList.remove("active");

  // Force animation restart
  void legoOverlay.offsetWidth;

  legoOverlay.classList.add("active");

  // Reset checkbox after animation
  setTimeout(() => {
    legoToggle.checked = false;
  }, 4000);
});