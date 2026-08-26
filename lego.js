const legoToggle = document.getElementById("lego");
const legoStage = document.getElementById("lego-stage");

let legoRunning = false;

legoToggle.addEventListener("change", async () => {

    if (!legoToggle.checked || legoRunning) return;

    legoRunning = true;

    try {
        await legoPage();
    } catch (error) {
        console.error("LEGO animation failed:", error);

        document.documentElement.style.visibility = "";
        legoStage.className = "";
        legoStage.innerHTML = "";
    }

    legoToggle.checked = false;
    legoRunning = false;
});


async function legoPage() {

    /*
     * Make sure the browser has finished
     * rendering before taking the snapshot.
     */
    await new Promise(requestAnimationFrame);


    /*
     * Capture the ENTIRE visible page.
     */
    const canvas = await html2canvas(document.documentElement, {

        backgroundColor: null,

        width: window.innerWidth,
        height: window.innerHeight,

        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight,

        scrollX: window.scrollX,
        scrollY: window.scrollY,

        scale: Math.min(window.devicePixelRatio || 1, 2),

        useCORS: true,

        logging: false
    });


    /*
     * The page is now safely captured.
     */

    const pageImage = canvas.toDataURL("image/png");


    legoStage.innerHTML = "";
    legoStage.className = "active";


    /*
     * Hide the REAL page.
     *
     * The LEGO pieces now represent it.
     */
    document.documentElement.style.visibility = "hidden";


    /*
     * LEGO dimensions.
     */
    const pieceWidth = 48;
    const pieceHeight = 24;


    const cols =
        Math.ceil(window.innerWidth / pieceWidth);

    const rows =
        Math.ceil(window.innerHeight / pieceHeight);


    const pieces = [];


    /*
     * Create the page out of pieces.
     */
    for (let row = 0; row < rows; row++) {

        for (let col = 0; col < cols; col++) {

            const x = col * pieceWidth;
            const y = row * pieceHeight;

            const width =
                Math.min(
                    pieceWidth,
                    window.innerWidth - x
                );

            const height =
                Math.min(
                    pieceHeight,
                    window.innerHeight - y
                );


            const piece =
                document.createElement("div");

            piece.className = "lego-piece";


            /*
             * Exact position.
             */
            piece.style.left = `${x}px`;
            piece.style.top = `${y}px`;

            piece.style.width = `${width}px`;
            piece.style.height = `${height}px`;


            /*
             * The piece contains the exact
             * corresponding section of the page.
             */
            piece.style.backgroundImage =
                `url("${pageImage}")`;

            piece.style.backgroundSize =
                `${window.innerWidth}px ${window.innerHeight}px`;

            piece.style.backgroundPosition =
                `-${x}px -${y}px`;


            /*
             * Slight random kick.
             */
            piece.style.setProperty(
                "--kick-x",
                `${(Math.random() - .5) * 50}px`
            );

            piece.style.setProperty(
                "--kick-y",
                `${(Math.random() - .5) * 50}px`
            );

            piece.style.setProperty(
                "--kick-r",
                `${(Math.random() - .5) * 20}deg`
            );


            /*
             * Where the piece flies during destruction.
             */
            piece.style.setProperty(
                "--explode-x",
                `${(Math.random() - .5) * 1100}px`
            );

            piece.style.setProperty(
                "--explode-y",
                `${100 + Math.random() * 800}px`
            );

            piece.style.setProperty(
                "--explode-r",
                `${(Math.random() - .5) * 1000}deg`
            );


            /*
             * Where the piece comes from
             * during reconstruction.
             */
            piece.style.setProperty(
                "--sky-x",
                `${(Math.random() - .5) * 1000}px`
            );

            piece.style.setProperty(
                "--sky-y",
                `${-window.innerHeight - Math.random() * 500}px`
            );

            piece.style.setProperty(
                "--sky-r",
                `${(Math.random() - .5) * 900}deg`
            );


            /*
             * Randomized falling timing.
             */
            piece.style.setProperty(
                "--delay",
                `${Math.random() * .9}s`
            );


            legoStage.appendChild(piece);

            pieces.push(piece);
        }
    }


    /*
     * ================================
     * 1. PAGE DISINTEGRATES
     * ================================
     */

    await new Promise(requestAnimationFrame);

    pieces.forEach(piece => {
        piece.classList.add("break");
    });


    /*
     * ================================
     * 2. WHITE
     * ================================
     */

    await sleep(1050);

    legoStage.classList.add("white");


    /*
     * ================================
     * 3. LEGO FALLS FROM SKY
     * ================================
     */

    await sleep(550);

    legoStage.classList.remove("white");


    pieces.forEach(piece => {

        piece.classList.remove("break");

        /*
         * Force animation restart.
         */
        void piece.offsetWidth;

        piece.classList.add("build");

    });


    /*
     * ================================
     * 4. LEGO FINISHES
     * ================================
     */

    await sleep(3000);


    /*
     * ================================
     * 5. REVEAL REAL PAGE
     * ================================
     */

    document.documentElement.style.visibility = "";

    legoStage.className = "";

    legoStage.innerHTML = "";
}


function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}