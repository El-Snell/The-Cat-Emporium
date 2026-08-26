const legoToggle = document.getElementById("lego");
const legoStage = document.getElementById("lego-stage");

let legoRunning = false;


/* =========================================
   TOGGLE
   ========================================= */

legoToggle.addEventListener("change", () => {

    if (!legoToggle.checked || legoRunning)
        return;

    legoRunning = true;

    doLego();

});


/* =========================================
   MAIN ANIMATION
   ========================================= */

async function doLego() {

    await new Promise(requestAnimationFrame);


    /*
     * Temporarily hide settings menu from
     * the page snapshot.
     */
    const menu =
        document.getElementById("settingsMenu");

    if (menu)
        menu.style.visibility = "hidden";


    let canvas;


    try {

        canvas = await html2canvas(
            document.body,
            {
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
            }
        );

    } catch (error) {

        console.error(
            "LEGO animation failed:",
            error
        );

        if (menu)
            menu.style.visibility = "";

        legoToggle.checked = false;
        legoRunning = false;

        return;
    }


    if (menu)
        menu.style.visibility = "";


    const pageImage =
        canvas.toDataURL("image/png");


    /*
     * Start clean.
     */
    legoStage.innerHTML = "";

    legoStage.className =
        "lego-active";


    /*
     * Hide the actual page.
     */
    document.body.classList.add(
        "lego-page-hidden"
    );


    /*
     * LEGO dimensions.
     */
    const PIECE_W = 50;
    const PIECE_H = 25;


    const screenW =
        window.innerWidth;

    const screenH =
        window.innerHeight;


    const pieces = [];


    /*
     * Create page pieces.
     */
    for (
        let y = 0;
        y < screenH;
        y += PIECE_H
    ) {

        for (
            let x = 0;
            x < screenW;
            x += PIECE_W
        ) {

            const w =
                Math.min(
                    PIECE_W,
                    screenW - x
                );

            const h =
                Math.min(
                    PIECE_H,
                    screenH - y
                );


            const piece =
                document.createElement("div");


            piece.className =
                "lego-piece";


            piece.style.left =
                `${x}px`;

            piece.style.top =
                `${y}px`;

            piece.style.width =
                `${w}px`;

            piece.style.height =
                `${h}px`;


            /*
             * Exact section of the page.
             */
            piece.style.backgroundImage =
                `url("${pageImage}")`;

            piece.style.backgroundSize =
                `${screenW}px ${screenH}px`;

            piece.style.backgroundPosition =
                `-${x}px -${y}px`;


            /*
             * Explosion.
             */
            piece.style.setProperty(
                "--explode-x",
                `${(Math.random() - .5) * 1000}px`
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
             * Falling from sky.
             */
            piece.style.setProperty(
                "--sky-x",
                `${(Math.random() - .5) * 1100}px`
            );

            piece.style.setProperty(
                "--sky-y",
                `${-screenH - Math.random() * 500}px`
            );

            piece.style.setProperty(
                "--sky-r",
                `${(Math.random() - .5) * 900}deg`
            );


            /*
             * Stagger the reconstruction.
             *
             * Top pieces arrive first, then
             * progressively lower pieces.
             */
            const row =
                Math.floor(y / PIECE_H);

            const col =
                Math.floor(x / PIECE_W);


            const wave =
                row * .018 +
                Math.random() * .25;


            piece.style.setProperty(
                "--delay",
                `${wave}s`
            );


            legoStage.appendChild(piece);

            pieces.push(piece);
        }
    }


    await new Promise(requestAnimationFrame);


    /*
     * =====================================
     * PAGE EXPLODES
     * =====================================
     */

    pieces.forEach(piece => {

        piece.classList.add(
            "lego-break"
        );

    });


    /*
     * =====================================
     * WHITE
     * =====================================
     */

    await sleep(1100);

    legoStage.classList.add(
        "lego-white"
    );


    /*
     * =====================================
     * FALLING LEGO
     * =====================================
     */

    await sleep(550);

    legoStage.classList.remove(
        "lego-white"
    );


    pieces.forEach(piece => {

        piece.classList.remove(
            "lego-break"
        );

        /*
         * Force animation reset.
         */
        void piece.offsetWidth;

        piece.classList.add(
            "lego-build"
        );

    });


    /*
     * =====================================
     * CLICKING / LOCKING SOUNDS
     * =====================================
     */

    playLegoSounds();


    /*
     * =====================================
     * WAIT FOR FINAL PIECES
     * =====================================
     */

    await sleep(3500);


    /*
     * =====================================
     * REVEAL REAL PAGE
     * =====================================
     */

    document.body.classList.remove(
        "lego-page-hidden"
    );


    legoStage.className = "";

    legoStage.innerHTML = "";


    legoToggle.checked = false;

    legoRunning = false;
}


/* =========================================
   LEGO SOUND
   ========================================= */

function playLegoSounds() {

    /*
     * Web Audio API.
     *
     * No external audio files required.
     */
    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContext)
        return;


    const audio =
        new AudioContext();


    /*
     * Several little plastic clicks.
     */
    const clicks = 18;


    for (let i = 0; i < clicks; i++) {

        setTimeout(() => {

            const oscillator =
                audio.createOscillator();

            const gain =
                audio.createGain();


            oscillator.type =
                "square";


            oscillator.frequency.value =
                170 +
                Math.random() * 100;


            gain.gain.setValueAtTime(
                0.0001,
                audio.currentTime
            );


            gain.gain.exponentialRampToValueAtTime(
                0.045,
                audio.currentTime + .005
            );


            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                audio.currentTime + .055
            );


            oscillator.connect(gain);

            gain.connect(audio.destination);


            oscillator.start();

            oscillator.stop(
                audio.currentTime + .06
            );

        }, 1700 + i * 80);
    }


    /*
     * Close audio context after the effect.
     */
    setTimeout(() => {
        audio.close();
    }, 4000);
}


/* =========================================
   UTILITY
   ========================================= */

function sleep(ms) {
    return new Promise(
        resolve => setTimeout(resolve, ms)
    );
}