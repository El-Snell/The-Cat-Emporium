const legoToggle = document.getElementById("lego");
const legoStage = document.getElementById("lego-stage");

let legoRunning = false;

legoToggle.addEventListener("change", () => {
    if (!legoToggle.checked || legoRunning) return;

    legoRunning = true;
    doLego();
});


async function doLego() {

    /*
     * Make sure the page is completely rendered.
     */
    await new Promise(requestAnimationFrame);


    /*
     * Take a picture of the CURRENT PAGE.
     *
     * We temporarily close the settings menu so it
     * doesn't become part of the LEGO reconstruction.
     */
    const menu = document.getElementById("settingsMenu");

    const wasOpen =
        menu &&
        getComputedStyle(menu).display !== "none";

    if (menu) {
        menu.style.visibility = "hidden";
    }


    let canvas;

    try {

        canvas = await html2canvas(document.body, {
            backgroundColor: null,

            width: window.innerWidth,
            height: window.innerHeight,

            windowWidth: window.innerWidth,
            windowHeight: window.innerHeight,

            scrollX: window.scrollX,
            scrollY: window.scrollY,

            scale: 1,

            useCORS: true,

            allowTaint: false,

            logging: false
        });

    } catch (error) {

        console.error("Could not create LEGO page:", error);

        if (menu) {
            menu.style.visibility = "";
        }

        legoToggle.checked = false;
        legoRunning = false;

        return;
    }


    if (menu) {
        menu.style.visibility = "";
    }


    /*
     * Convert screenshot into an image.
     */
    const image = canvas.toDataURL("image/png");


    /*
     * Prepare animation stage.
     */
    legoStage.innerHTML = "";
    legoStage.className = "lego-active";


    /*
     * Hide the REAL page.
     *
     * The LEGO copy is now on top.
     */
    document.body.classList.add("lego-page-hidden");


    /*
     * LEGO piece size.
     *
     * Smaller = more pieces / more accurate page.
     */
    const PIECE_W = 50;
    const PIECE_H = 25;


    const screenW = window.innerWidth;
    const screenH = window.innerHeight;


    const pieces = [];


    /*
     * Build the page out of LEGO pieces.
     */
    for (let y = 0; y < screenH; y += PIECE_H) {

        for (let x = 0; x < screenW; x += PIECE_W) {

            const w = Math.min(
                PIECE_W,
                screenW - x
            );

            const h = Math.min(
                PIECE_H,
                screenH - y
            );


            const piece =
                document.createElement("div");

            piece.className = "lego-piece";


            /*
             * Exact location.
             */
            piece.style.left = `${x}px`;
            piece.style.top = `${y}px`;

            piece.style.width = `${w}px`;
            piece.style.height = `${h}px`;


            /*
             * Give this LEGO piece the exact
             * pixels from its section of the page.
             */
            piece.style.backgroundImage =
                `url(${image})`;

            piece.style.backgroundSize =
                `${screenW}px ${screenH}px`;

            piece.style.backgroundPosition =
                `-${x}px -${y}px`;


            /*
             * Slight LEGO styling.
             */
            piece.style.setProperty(
                "--lego-color",
                getRandomLegoColor()
            );


            /*
             * Explosion direction.
             */
            piece.style.setProperty(
                "--explode-x",
                `${(Math.random() - 0.5) * 900}px`
            );

            piece.style.setProperty(
                "--explode-y",
                `${(Math.random() - 0.2) * 800}px`
            );

            piece.style.setProperty(
                "--explode-r",
                `${(Math.random() - 0.5) * 900}deg`
            );


            /*
             * Starting point for reconstruction.
             *
             * Pieces come from ABOVE the screen.
             */
            piece.style.setProperty(
                "--sky-x",
                `${(Math.random() - 0.5) * 900}px`
            );

            piece.style.setProperty(
                "--sky-y",
                `${-screenH - Math.random() * 500}px`
            );

            piece.style.setProperty(
                "--sky-r",
                `${(Math.random() - 0.5) * 900}deg`
            );


            /*
             * Random build delay.
             */
            piece.style.setProperty(
                "--delay",
                `${Math.random() * 1.1}s`
            );


            legoStage.appendChild(piece);

            pieces.push(piece);
        }
    }


    /*
     * Give browser one frame to place everything.
     */
    await new Promise(requestAnimationFrame);


    /*
     * ===============================
     * PAGE BREAKS APART
     * ===============================
     */

    pieces.forEach(piece => {
        piece.classList.add("lego-break");
    });


    /*
     * ===============================
     * WHITE FLASH
     * ===============================
     */

    await sleep(1100);

    legoStage.classList.add("lego-white");


    /*
     * ===============================
     * LEGO FALLS FROM SKY
     * ===============================
     */

    await sleep(500);

    legoStage.classList.remove("lego-white");


    pieces.forEach(piece => {

        /*
         * Remove destruction animation.
         */
        piece.classList.remove("lego-break");

        /*
         * Force browser to reset animation.
         */
        void piece.offsetWidth;

        /*
         * Start reconstruction.
         */
        piece.classList.add("lego-build");

    });


    /*
     * ===============================
     * WAIT FOR REBUILD
     * ===============================
     */

    await sleep(3300);


    /*
     * ===============================
     * REVEAL REAL PAGE
     * ===============================
     */

    document.body.classList.remove("lego-page-hidden");

    legoStage.className = "";
    legoStage.innerHTML = "";

    legoToggle.checked = false;

    legoRunning = false;
}


/*
 * Random LEGO colors.
 */
function getRandomLegoColor() {

    const colors = [
        "#d71920",
        "#0057b8",
        "#ffd500",
        "#00852b",
        "#ff6f00",
        "#ffffff"
    ];

    return colors[
        Math.floor(Math.random() * colors.length)
    ];
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}