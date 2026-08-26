const legoCheckbox = document.getElementById("lego");
const legoTransition = document.getElementById("lego-transition");
const legoWhite = document.getElementById("lego-white");

let legoRunning = false;

legoCheckbox.addEventListener("change", async () => {

  if (!legoCheckbox.checked || legoRunning) return;

  legoRunning = true;

  /*
   * Hide the actual page only after we have
   * represented it with LEGO pieces.
   */
  const page = document.body;

  const width = window.innerWidth;
  const height = window.innerHeight;

  legoTransition.innerHTML = "";

  /*
   * LEGO grid.
   *
   * Smaller pieces = more detailed reconstruction.
   */
  const pieceWidth = 55;
  const pieceHeight = 28;

  const cols = Math.ceil(width / pieceWidth);
  const rows = Math.ceil(height / pieceHeight);

  /*
   * Capture the current page.
   *
   * This requires html2canvas.
   */
  const canvas = await html2canvas(document.body, {
    backgroundColor: null,
    scale: 1
  });

  const image = canvas.toDataURL();

  /*
   * Hide the actual page.
   */
  page.style.visibility = "hidden";

  legoTransition.style.opacity = "1";

  /*
   * Create LEGO pieces representing the page.
   */
  for (let row = 0; row < rows; row++) {

    for (let col = 0; col < cols; col++) {

      const tile = document.createElement("div");

      tile.className = "lego-tile";

      const x = col * pieceWidth;
      const y = row * pieceHeight;

      tile.style.width = `${pieceWidth}px`;
      tile.style.height = `${pieceHeight}px`;

      tile.style.left = `${x}px`;
      tile.style.top = `${y}px`;

      /*
       * Each LEGO contains the corresponding
       * section of the original page.
       */
      tile.style.backgroundImage = `url(${image})`;

      tile.style.backgroundSize =
        `${width}px ${height}px`;

      tile.style.backgroundPosition =
        `-${x}px -${y}px`;

      /*
       * Random destruction trajectory.
       */
      tile.style.setProperty(
        "--x1",
        `${(Math.random() - .5) * 120}px`
      );

      tile.style.setProperty(
        "--y1",
        `${-40 + Math.random() * 120}px`
      );

      tile.style.setProperty(
        "--r1",
        `${(Math.random() - .5) * 30}deg`
      );

      tile.style.setProperty(
        "--x2",
        `${(Math.random() - .5) * 900}px`
      );

      tile.style.setProperty(
        "--y2",
        `${100 + Math.random() * 700}px`
      );

      tile.style.setProperty(
        "--r2",
        `${(Math.random() - .5) * 720}deg`
      );

      legoTransition.appendChild(tile);
    }
  }

  /*
   * LET THE PAGE FALL APART.
   */
  await new Promise(resolve => setTimeout(resolve, 1450));


  /*
   * WHITE FLASH
   */
  legoWhite.classList.add("flash");

  await new Promise(resolve => setTimeout(resolve, 500));

  legoWhite.classList.remove("flash");


  /*
   * Reset the pieces so they're coming
   * from above instead.
   */
  const pieces =
    [...legoTransition.querySelectorAll(".lego-tile")];

  pieces.forEach(piece => {

    piece.style.setProperty(
      "--fall-x",
      `${(Math.random() - .5) * 1000}px`
    );

    piece.style.setProperty(
      "--fall-y",
      `${-window.innerHeight - Math.random() * 500}px`
    );

    piece.style.setProperty(
      "--fall-r",
      `${(Math.random() - .5) * 720}deg`
    );

    /*
     * Stagger the falling pieces.
     */
    piece.style.setProperty(
      "--delay",
      `${Math.random() * 1.2}s`
    );
  });


  /*
   * REBUILD THE PAGE.
   */
  legoTransition.classList.add("rebuild");


  /*
   * Wait until everything has locked together.
   */
  await new Promise(resolve => setTimeout(resolve, 3200));


  /*
   * Reveal the actual page.
   */
  page.style.visibility = "";

  legoTransition.style.opacity = "0";

  legoTransition.classList.remove("rebuild");

  legoTransition.innerHTML = "";

  legoRunning = false;

  legoCheckbox.checked = false;
});