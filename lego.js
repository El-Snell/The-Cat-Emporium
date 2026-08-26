const legoToggle = document.getElementById("lego");
const legoStage = document.getElementById("lego-stage");

let legoAnimating = false;

legoToggle.addEventListener("change", () => {
  if (!legoToggle.checked || legoAnimating) return;

  legoAnimating = true;
  runLegoAnimation();
});


function runLegoAnimation() {

  legoStage.innerHTML = "";
  legoStage.classList.add("active");

  /*
   * Elements we want to turn into LEGO pieces.
   *
   * Add/remove selectors here depending on your page.
   */
  const targets = document.querySelectorAll(`
    header,
    nav,
    main,
    section,
    article,
    aside,
    footer,
    button,
    a,
    img,
    h1,
    h2,
    h3,
    p,
    li
  `);

  const clones = [];

  /*
   * Create a clone of every visible element.
   */
  targets.forEach(element => {

    const rect = element.getBoundingClientRect();

    if (
      rect.width === 0 ||
      rect.height === 0 ||
      getComputedStyle(element).display === "none"
    ) {
      return;
    }

    /*
     * Don't clone elements inside other cloned elements.
     *
     * Otherwise a button inside a section would
     * get cloned twice.
     */
    if (
      [...element.parentElement?.querySelectorAll(
        "header, nav, main, section, article, aside, footer, button, a, img, h1, h2, h3, p, li"
      ) || []].some(child =>
        child !== element &&
        element.contains(child)
      )
    ) {
      return;
    }

    const clone = element.cloneNode(true);

    clone.classList.add("lego-clone");

    /*
     * Put clone at exact original position.
     */
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.width = `${rect.width}px`;
    clone.style.height = `${rect.height}px`;

    /*
     * Give it a fixed position so it doesn't move
     * when the actual page changes.
     */
    clone.style.position = "fixed";

    /*
     * Random destruction trajectory.
     */
    clone.style.setProperty(
      "--burst-x",
      `${(Math.random() - .5) * 100}px`
    );

    clone.style.setProperty(
      "--burst-y",
      `${(Math.random() - .5) * 100}px`
    );

    clone.style.setProperty(
      "--burst-r",
      `${(Math.random() - .5) * 40}deg`
    );

    clone.style.setProperty(
      "--explode-x",
      `${(Math.random() - .5) * 900}px`
    );

    clone.style.setProperty(
      "--explode-y",
      `${100 + Math.random() * 700}px`
    );

    clone.style.setProperty(
      "--explode-r",
      `${(Math.random() - .5) * 720}deg`
    );

    /*
     * Where the piece comes from during reconstruction.
     */
    clone.style.setProperty(
      "--start-x",
      `${(Math.random() - .5) * 1200}px`
    );

    clone.style.setProperty(
      "--start-y",
      `${-window.innerHeight - Math.random() * 500}px`
    );

    clone.style.setProperty(
      "--start-r",
      `${(Math.random() - .5) * 720}deg`
    );

    clone.style.setProperty(
      "--build-delay",
      `${Math.random() * 1.2}s`
    );

    legoStage.appendChild(clone);

    clones.push(clone);
  });


  /*
   * Hide the real page AFTER clones exist.
   */
  document.body.style.visibility = "hidden";


  /*
   * PHASE 1:
   * Page breaks apart.
   */
  requestAnimationFrame(() => {

    clones.forEach(clone => {
      clone.classList.add("breaking");
    });

  });


  /*
   * PHASE 2:
   * White screen.
   */
  setTimeout(() => {

    legoStage.classList.add("flash");

  }, 1150);


  /*
   * PHASE 3:
   * LEGO pieces fall from sky and rebuild.
   */
  setTimeout(() => {

    clones.forEach(clone => {

      clone.classList.remove("breaking");

      /*
       * Force animation restart.
       */
      void clone.offsetWidth;

      clone.classList.add("building");

    });

  }, 1500);


  /*
   * PHASE 4:
   * Reveal actual page.
   */
  setTimeout(() => {

    document.body.style.visibility = "";

    legoStage.classList.remove("flash");
    legoStage.classList.remove("active");

    legoStage.innerHTML = "";

    legoToggle.checked = false;

    legoAnimating = false;

  }, 4200);
}