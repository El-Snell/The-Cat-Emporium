const legoFallToggle =
    document.getElementById("legofall");

//const legoStage =
//    document.getElementById("lego-stage");

let legoFallRunning = false;


/* =========================================
   TOGGLE
   ========================================= */

legoFallToggle.addEventListener(
    "change",
    () => {

        if (
            !legoFallToggle.checked ||
            legoFallRunning
        ) {
            return;
        }

        legoFallRunning = true;

        runLegoFall();
    }
);


/* =========================================
   MAIN
   ========================================= */

async function runLegoFall() {

    /*
     * Let the checkbox finish changing.
     */
    await new Promise(
        requestAnimationFrame
    );


    /*
     * Hide settings menu.
     */
    const menu =
        document.getElementById(
            "settingsMenu"
        );


    if (menu) {
        menu.style.visibility =
            "hidden";
    }


    /*
     * =====================================
     * CAPTURE PAGE
     * =====================================
     */

    let canvas;


    try {

        canvas = await html2canvas(
            document.body,
            {
                backgroundColor: null,

                width:
                    window.innerWidth,

                height:
                    window.innerHeight,

                windowWidth:
                    window.innerWidth,

                windowHeight:
                    window.innerHeight,

                scrollX:
                    window.scrollX,

                scrollY:
                    window.scrollY,

                scale: 1,

                useCORS: true,

                allowTaint: false,

                logging: false
            }
        );

    } catch (error) {

        console.error(
            "LEGO FALL ERROR:",
            error
        );

        if (menu) {
            menu.style.visibility =
                "";
        }

        legoFallToggle.checked =
            false;

        legoFallRunning =
            false;

        return;
    }


    if (menu) {
        menu.style.visibility =
            "";
    }


    const pageImage =
        canvas.toDataURL(
            "image/png"
        );


    /*
     * =====================================
     * PREPARE STAGE
     * =====================================
     */

    legoStage.innerHTML = "";

    legoStage.className =
        "lego-fall-active";


    /*
     * Hide real page.
     */
    document.body.classList.add(
        "lego-fall-hidden"
    );


    /*
     * =====================================
     * LEGO GRID
     * =====================================
     */

    const screenWidth =
        window.innerWidth;

    const screenHeight =
        window.innerHeight;


    /*
     * These determine the LEGO grid.
     *
     * Every piece has the same width.
     * Therefore every row lines up.
     */

    const PIECE_WIDTH = 48;

    const PIECE_HEIGHT = 24;


    const columns =
        Math.ceil(
            screenWidth /
            PIECE_WIDTH
        );


    const rows =
        Math.ceil(
            screenHeight /
            PIECE_HEIGHT
        );


    const pieces = [];


    /*
     * =====================================
     * BUILD EVERY ROW
     * =====================================
     */

    for (
        let row = 0;
        row < rows;
        row++
    ) {

        /*
         * ---------------------------------
         * CREATE ONE COMPLETE ROW
         * ---------------------------------
         */

        for (
            let column = 0;
            column < columns;
            column++
        ) {

            const x =
                column *
                PIECE_WIDTH;


            const y =
                row *
                PIECE_HEIGHT;


            const width =
                Math.min(
                    PIECE_WIDTH,
                    screenWidth - x
                );


            const height =
                Math.min(
                    PIECE_HEIGHT,
                    screenHeight - y
                );


            if (
                width <= 0 ||
                height <= 0
            ) {
                continue;
            }


            const piece =
                document.createElement(
                    "div"
                );


            piece.className =
                "lego-fall-piece";


            /*
             * =================================
             * EXACT FINAL POSITION
             * =================================
             */

            piece.style.left =
                `${x}px`;


            piece.style.bottom =
                `${y}px`;


            piece.style.width =
                `${width}px`;


            piece.style.height =
                `${height}px`;


            /*
             * =================================
             * PAGE IMAGE
             * =================================
             *
             * Each LEGO is literally displaying
             * the corresponding part of your page.
             */

            piece.style.backgroundImage =
                `url("${pageImage}")`;


            piece.style.backgroundSize =
                `${screenWidth}px ${screenHeight}px`;


            piece.style.backgroundPosition =
                `-${x}px -${y}px`;


            /*
             * =================================
             * FALL DISTANCE
             * =================================
             *
             * Every piece starts above the
             * screen by the SAME amount.
             *
             * This keeps each row perfectly
             * aligned.
             */

            piece.style.setProperty(
                "--fall-distance",
                `${screenHeight + 200}px`
            );


            /*
             * =================================
             * ROW TIMING
             * =================================
             *
             * This is the important part.
             *
             * ROW 0
             * ↓
             * ROW 1
             * ↓
             * ROW 2
             * ↓
             * ROW 3
             *
             * The entire row moves together.
             */

            const rowDelay =
                row * 180;


            piece.style.setProperty(
                "--fall-delay",
                `${rowDelay}ms`
            );


            /*
             * Every piece in a row has exactly
             * the same duration.
             */

            piece.style.setProperty(
                "--fall-time",
                "850ms"
            );


            legoStage.appendChild(
                piece
            );


            pieces.push(piece);
        }


        /*
         * =================================
         * SMALL PAUSE BETWEEN ROWS
         * =================================
         *
         * This isn't necessary for the
         * animation itself; it just makes
         * the rows visibly distinct.
         */

    }


    /*
     * =====================================
     * START SOUND
     * =====================================
     */

    playOrganizedLegoSounds(
        rows
    );


    /*
     * =====================================
     * WAIT FOR ALL ROWS
     * =====================================
     */

    const totalTime =
        rows * 180 +
        1000;


    await sleep(
        totalTime
    );


    /*
     * =====================================
     * FINAL IMPACT
     * =====================================
     */

    legoStage.classList.add(
        "lego-fall-finished"
    );


    await sleep(500);


    /*
     * =====================================
     * SHOW REAL PAGE
     * =====================================
     */

    document.body.classList.remove(
        "lego-fall-hidden"
    );


    legoStage.className = "";

    legoStage.innerHTML = "";


    legoFallToggle.checked =
        false;

    legoFallRunning =
        false;
}


/* =========================================
   ORGANIZED LEGO SOUNDS
   ========================================= */

function playOrganizedLegoSounds(
    rows
) {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) {
        return;
    }


    const audio =
        new AudioContext();


    /*
     * ONE group of clicks per row.
     *
     * So you'll hear:
     *
     * click click click...
     *       ↓
     * click click click...
     *       ↓
     * click click click...
     */

    for (
        let row = 0;
        row < rows;
        row++
    ) {

        setTimeout(
            () => {

                /*
                 * Several clicks close together
                 * represent the LEGO row locking.
                 */

                for (
                    let i = 0;
                    i < 6;
                    i++
                ) {

                    setTimeout(
                        () => {

                            const oscillator =
                                audio.createOscillator();


                            const gain =
                                audio.createGain();


                            oscillator.type =
                                "square";


                            oscillator.frequency.value =
                                160 +
                                Math.random() * 100;


                            gain.gain.setValueAtTime(
                                0.0001,
                                audio.currentTime
                            );


                            gain.gain.exponentialRampToValueAtTime(
                                0.035,
                                audio.currentTime + 0.005
                            );


                            gain.gain.exponentialRampToValueAtTime(
                                0.0001,
                                audio.currentTime + 0.055
                            );


                            oscillator.connect(
                                gain
                            );


                            gain.connect(
                                audio.destination
                            );


                            oscillator.start();


                            oscillator.stop(
                                audio.currentTime + 0.06
                            );

                        },
                        i * 18
                    );
                }

            },

            row * 180 + 700
        );
    }


    setTimeout(
        () => {
            audio.close();
        },
        rows * 180 + 1500
    );
}


/* =========================================
   UTILITY
   ========================================= */

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );
}