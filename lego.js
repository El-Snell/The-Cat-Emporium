const legoToggle = document.getElementById("lego");
const legoStage = document.getElementById("lego-stage");

let legoRunning = false;

legoToggle.addEventListener("change", () => {
    if (!legoToggle.checked || legoRunning) return;

    legoRunning = true;
    doLego();
});


async function doLego() {

    await new Promise(requestAnimationFrame);

    /*
     * Temporarily hide the settings menu.
     */
    const menu = document.getElementById("settingsMenu");

    if (menu) {
        menu.style.visibility = "hidden";
    }


    /*
     * ==========================================
     * FIX SVG <object>
     * ==========================================
     *
     * html2canvas doesn't reliably render an
     * external SVG inside <object>.
     *
     * We temporarily replace it with the actual
     * SVG contents while taking the screenshot.
     */

    const bannerObject = document.querySelector(
        ".svgbanner object[type='image/svg+xml']"
    );

    let originalBannerHTML = null;
    let inlineBanner = null;

    if (bannerObject) {

        try {

            const svgURL = bannerObject.data;

            const response = await fetch(svgURL);

            if (!response.ok) {
                throw new Error(
                    `Could not load ${svgURL}`
                );
            }

            const svgText = await response.text();


            /*
             * Save original object.
             */
            originalBannerHTML =
                bannerObject.outerHTML;


            /*
             * Parse SVG.
             */
            const parser = new DOMParser();

            const svgDocument =
                parser.parseFromString(
                    svgText,
                    "image/svg+xml"
                );


            inlineBanner =
                svgDocument.documentElement;


            /*
             * Make it behave like the
             * original <object>.
             */
            inlineBanner.style.width = "100%";
            inlineBanner.style.height = "100%";
            inlineBanner.style.display = "block";


            /*
             * Preserve the SVG's viewBox.
             */
            if (!inlineBanner.hasAttribute("preserveAspectRatio")) {
                inlineBanner.setAttribute(
                    "preserveAspectRatio",
                    "xMidYMid meet"
                );
            }


            /*
             * Replace object with inline SVG.
             */
            bannerObject.replaceWith(
                inlineBanner
            );


            /*
             * Allow browser to render it.
             */
            await new Promise(
                requestAnimationFrame
            );

        } catch (error) {

            console.warn(
                "LEGO: Could not inline banner SVG:",
                error
            );

            inlineBanner = null;
        }
    }


    /*
     * ==========================================
     * TAKE PAGE SNAPSHOT
     * ==========================================
     */

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
            "LEGO: html2canvas failed:",
            error
        );

        /*
         * Restore SVG.
         */
        restoreBanner(
            inlineBanner,
            originalBannerHTML
        );

        if (menu) {
            menu.style.visibility = "";
        }

        legoToggle.checked = false;
        legoRunning = false;

        return;
    }


    /*
     * ==========================================
     * RESTORE SVG
     * ==========================================
     */

    restoreBanner(
        inlineBanner,
        originalBannerHTML
    );


    /*
     * Restore settings menu.
     */
    if (menu) {
        menu.style.visibility = "";
    }


    /*
     * Convert screenshot to image.
     */
    const pageImage =
        canvas.toDataURL("image/png");


    /*
     * ==========================================
     * START LEGO STAGE
     * ==========================================
     */

    legoStage.innerHTML = "";
    legoStage.className = "lego-active";


    /*
     * Hide the actual page.
     */
    document.body.classList.add(
        "lego-page-hidden"
    );


    /*
     * ==========================================
     * CREATE LEGO PIECES
     * ==========================================
     */

    const PIECE_W = 50;
    const PIECE_H = 25;

    const screenW = window.innerWidth;
    const screenH = window.innerHeight;

    const pieces = [];


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

            const width =
                Math.min(
                    PIECE_W,
                    screenW - x
                );

            const height =
                Math.min(
                    PIECE_H,
                    screenH - y
                );


            const piece =
                document.createElement("div");


            piece.className =
                "lego-piece";


            /*
             * Exact final position.
             */
            piece.style.left =
                `${x}px`;

            piece.style.top =
                `${y}px`;

            piece.style.width =
                `${width}px`;

            piece.style.height =
                `${height}px`;


            /*
             * Give the piece its exact section
             * of the page screenshot.
             */
            piece.style.backgroundImage =
                `url("${pageImage}")`;

            piece.style.backgroundSize =
                `${screenW}px ${screenH}px`;

            piece.style.backgroundPosition =
                `-${x}px -${y}px`;


            /*
             * ==================================
             * EXPLOSION
             * ==================================
             */

            piece.style.setProperty(
                "--explode-x",
                `${(Math.random() - 0.5) * 1000}px`
            );

            piece.style.setProperty(
                "--explode-y",
                `${100 + Math.random() * 800}px`
            );

            piece.style.setProperty(
                "--explode-r",
                `${(Math.random() - 0.5) * 1000}deg`
            );


            /*
             * ==================================
             * FALL FROM SKY
             * ==================================
             */

            piece.style.setProperty(
                "--sky-x",
                `${(Math.random() - 0.5) * 1100}px`
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
             * ==================================
             * BUILD ORDER
             * ==================================
             *
             * Pieces reconstruct from top to
             * bottom in slightly staggered waves.
             */

            const row =
                Math.floor(y / PIECE_H);

            const delay =
                row * 0.018 +
                Math.random() * 0.25;


            piece.style.setProperty(
                "--delay",
                `${delay}s`
            );


            legoStage.appendChild(piece);

            pieces.push(piece);
        }
    }


    await new Promise(requestAnimationFrame);


    /*
     * ==========================================
     * 1. PAGE FALLS APART
     * ==========================================
     */

    pieces.forEach(piece => {

        piece.classList.add(
            "lego-break"
        );

    });


    /*
     * ==========================================
     * 2. WHITE FLASH
     * ==========================================
     */

    await sleep(1100);

    legoStage.classList.add(
        "lego-white"
    );


    /*
     * ==========================================
     * 3. LEGOS FALL FROM SKY
     * ==========================================
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
         * Force animation restart.
         */
        void piece.offsetWidth;

        piece.classList.add(
            "lego-build"
        );

    });


    /*
     * ==========================================
     * 4. LEGO CLICK SOUNDS
     * ==========================================
     */

    playLegoSounds();


    /*
     * ==========================================
     * 5. WAIT FOR CONSTRUCTION
     * ==========================================
     */

    await sleep(3500);


    /*
     * ==========================================
     * 6. REVEAL ACTUAL PAGE
     * ==========================================
     */

    document.body.classList.remove(
        "lego-page-hidden"
    );


    legoStage.className = "";
    legoStage.innerHTML = "";

    legoToggle.checked = false;

    legoRunning = false;
}


/*
 * ==========================================
 * RESTORE SVG OBJECT
 * ==========================================
 */

function restoreBanner(
    inlineBanner,
    originalBannerHTML
) {

    if (
        inlineBanner &&
        originalBannerHTML
    ) {

        inlineBanner.outerHTML =
            originalBannerHTML;
    }
}


/*
 * ==========================================
 * LEGO SOUND EFFECTS
 * ==========================================
 */

function playLegoSounds() {

    const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;


    if (!AudioContext) return;


    const audio =
        new AudioContext();


    /*
     * Small plastic clicks as pieces land.
     */
    const clicks = 20;


    for (
        let i = 0;
        i < clicks;
        i++
    ) {

        setTimeout(() => {

            const oscillator =
                audio.createOscillator();

            const gain =
                audio.createGain();


            oscillator.type =
                "square";


            oscillator.frequency.value =
                170 +
                Math.random() * 120;


            gain.gain.setValueAtTime(
                0.0001,
                audio.currentTime
            );


            gain.gain.exponentialRampToValueAtTime(
                0.045,
                audio.currentTime + 0.005
            );


            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                audio.currentTime + 0.055
            );


            oscillator.connect(gain);

            gain.connect(
                audio.destination
            );


            oscillator.start();

            oscillator.stop(
                audio.currentTime + 0.06
            );

        }, 1700 + i * 80);
    }


    setTimeout(() => {

        audio.close();

    }, 4000);
}


/*
 * ==========================================
 * UTILITY
 * ==========================================
 */

function sleep(ms) {

    return new Promise(
        resolve => setTimeout(
            resolve,
            ms
        )
    );
}