let canvas, ctx;
let displayState = {
    phase: 0,
    targetPhase: 0,
    time: 0,
};
let isWaveSlideVisible = true;

// Smooth tweening utility
function lerp(start, end, amt) {
    return (1 - amt) * start + amt * end;
}

function initWaveVisualizer() {
    canvas = document.getElementById("waveCanvas");
    if (!canvas) {
        return false;
    }
    ctx = canvas.getContext("2d");

    // Set up Intersection Observer for scrollytelling steps
    const steps = document.querySelectorAll(".story-scroll-steps .step");
    if (steps.length > 0) {
        // Determine the scroll container
        const scrollContainer = document.getElementById("storyScrollSteps");

        // Create an observer. We want a step to become active when it crosses the middle of the viewport.
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        // Remove active from all steps first
                        steps.forEach((s) => s.classList.remove("active"));

                        // Activate current step
                        entry.target.classList.add("active");

                        // Set the target phase for the canvas engine
                        displayState.targetPhase = parseInt(
                            entry.target.getAttribute("data-phase"),
                        );

                        // Update the CSS labels (Node, Extrinsic, Intrinsic) fading based on phase
                        updateLabelsForPhase(displayState.targetPhase);
                    }
                });
            },
            {
                root: null,
                threshold: 0.4, // Lower threshold for mobile visibility
                rootMargin: "-25% 0px -25% 0px", // Focus on the bottom half of the screen
            },
        );

        steps.forEach((step) => observer.observe(step));

        // Set initial active state correctly
        steps[0].classList.add("active");
        updateLabelsForPhase(0);
    }

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    drawWave();

    return true;
}

function updateLabelsForPhase(phase) {
    const extrinsic = document.getElementById("extrinsicLabel");
    const intrinsic = document.getElementById("intrinsicLabel");
    const center = document.getElementById("centerLabel");
    const banner = document.getElementById("statusBanner");

    if (!extrinsic || !intrinsic || !center || !banner) return;

    // Fade in the Extrinsic/Intrinsic labels only when we reach the oscillation phases (Phase 3+)
    if (phase >= 3) {
        extrinsic.style.opacity = 1;
        intrinsic.style.opacity = 1;
    } else {
        extrinsic.style.opacity = 0;
        intrinsic.style.opacity = 0;
    }

    // Update classes and text based on phase
    banner.className = "status-banner"; // reset
    if (phase === 0 || phase === 1) {
        center.style.opacity = 0;
        banner.style.opacity = 0;
    } else {
        center.style.opacity = 1;
        banner.style.opacity = 1;

        if (phase === 2) {
            center.innerText = "Node";
            banner.innerText = "The Integrated Self";
            banner.classList.add("healthy");
        } else if (phase === 3) {
            center.innerText = "Node";
            banner.innerText = "Healthy Resonance";
            banner.classList.add("healthy");
        } else if (phase === 4) {
            center.innerText = "Node (Frozen)";
            banner.innerText = "Pathology: Rigidity & Suppression";
            banner.classList.add("rigid");
        } else if (phase === 5) {
            center.innerText = "Shattered Node";
            banner.innerText = "Pathology: Uncontained Chaos";
            banner.classList.add("chaotic");
        } else if (phase === 6) {
            center.innerText = "Node (Extracted)";
            banner.innerText = "Pathology: Asymmetric Extraction";
            banner.classList.add("suppressed");
        } else if (phase >= 7) {
            center.innerText = "Node";
            banner.innerText = "Fractal Alignment";
            banner.classList.add("healthy");
        }
    }
}

function checkSlideVisibility() {
    const track = document.getElementById("carouselTrack");
    if (!track) return;
    const transform = track.style.transform;
    const match = transform.match(/translateX\((-?\d+)px\)/);
    if (match) {
        const offset = parseInt(match[1]);
        const slideWidth = window.innerWidth;
        isWaveSlideVisible =
            offset >= -slideWidth * 0.5 && offset <= slideWidth * 0.5;
    }
}

function resizeCanvas() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
}

function drawWave() {
    checkSlideVisibility();
    if (!isWaveSlideVisible || document.hidden) {
        setTimeout(() => requestAnimationFrame(drawWave), 500);
        return;
    }

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    if (w === 0 || h === 0) {
        requestAnimationFrame(drawWave);
        return;
    }

    // Smoothly lerp our drawing phase to the target scroll phase
    displayState.phase = lerp(
        displayState.phase,
        displayState.targetPhase,
        0.05,
    );
    displayState.time += 0.025; // Constant time passing

    ctx.clearRect(0, 0, w, h);

    const centerY = h / 2;
    const leftX = w * 0.12;
    const rightX = w * 0.88;
    const nodeX = w * 0.5;

    // PROPORTIONAL SCALING FOR MOBILE
    const isMobile = window.innerWidth <= 768;
    const uiScale = isMobile ? 0.6 : 1.0; // 40% smaller elements on mobile

    // -------------------------------------------------------------------
    // PHASE 1: The Boundaries (Anchors)
    // Fade in starts after phase 0.1
    // -------------------------------------------------------------------
    if (displayState.phase > 0.1) {
        // Calculate opacity (0 at phase 0.1, 1 at phase 1.0)
        let anchorOpacity = Math.min(
            1,
            Math.max(0, (displayState.phase - 0.1) / 0.9),
        );

        // When chaos phase hits (phase > 4.5), fade out the boundaries to represent loss of containment
        if (displayState.phase > 4.5 && displayState.phase < 6) {
            anchorOpacity = Math.min(
                1,
                Math.max(0, 1 - (displayState.phase - 4.5)),
            );
        } else if (displayState.phase >= 6) {
            anchorOpacity = 1; // restore for analogies
        }

        ctx.globalAlpha = anchorOpacity;

        [leftX, rightX].forEach((x) => {
            // Draw bold glowing boundary walls
            ctx.beginPath();
            ctx.strokeStyle = "rgba(64, 224, 208, 0.4)";
            ctx.lineWidth = 4 * uiScale;
            ctx.shadowColor = "rgba(64, 224, 208, 0.8)";
            ctx.shadowBlur = 15 * uiScale;

            const wallHeight = h * 0.4 * uiScale;
            ctx.moveTo(x, centerY - wallHeight);
            ctx.lineTo(x, centerY + wallHeight);
            ctx.stroke();

            // Draw the anchor points
            ctx.fillStyle = "rgba(64, 224, 208, 0.95)";
            ctx.shadowBlur = 0;
            ctx.beginPath();
            ctx.arc(x, centerY, 11 * uiScale, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = "#0a0e17";
            ctx.font = `bold ${Math.floor(10 * uiScale)}px monospace`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText("⚓", x, centerY);
        });

        ctx.globalAlpha = 1.0;
    }

    // -------------------------------------------------------------------
    // PHASE 2: The Still Point (Node)
    // Fade in starts after phase 1.1
    // -------------------------------------------------------------------
    if (displayState.phase > 1.1) {
        // Calculate opacity
        const nodeOpacity = Math.min(
            1,
            Math.max(0, (displayState.phase - 1.1) / 0.9),
        );
        ctx.globalAlpha = nodeOpacity;

        // Center line (Baseline)
        ctx.strokeStyle = "rgba(64, 224, 208, 0.2)";
        ctx.lineWidth = 2 * uiScale;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(w * 0.1, h / 2);
        ctx.lineTo(w * 0.9, h / 2);
        ctx.stroke();
        ctx.setLineDash([]);

        // The Integrated Node
        ctx.fillStyle = "rgba(64, 224, 208, 0.9)";
        ctx.beginPath();
        ctx.arc(nodeX, centerY, 10 * uiScale, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#0a0e17";
        ctx.font = `bold ${Math.floor(11 * uiScale)}px monospace`;
        ctx.fillText("●", nodeX, centerY);

        ctx.globalAlpha = 1.0;
    }

    // -------------------------------------------------------------------
    // PHASE 3-7: THE WAVE PHYSICS
    // Phase 3 (Healthy): Full oscillation
    // Phase 4 (Rigid): Damped heavily to a near flat-line
    // Phase 5 (Chaos): Node breaks, chaotic uncontained vibration
    // Phase 6 (Suppression): Left side flatlines, right side swings
    // Phase 7 (Analogies): Returns to healthy as base visualization
    // -------------------------------------------------------------------
    if (displayState.phase > 2.1) {
        const waveOpacity = Math.min(
            1,
            Math.max(0, (displayState.phase - 2.1) / 0.9),
        );
        ctx.globalAlpha = waveOpacity;

        let amplitude = h * 0.35 * uiScale;
        let timeScale = displayState.time;

        let rigidDamping = 1;
        let chaosIntensity = 0;
        let suppIntensity = 0;

        // Smooth blending based on phase
        // 3 -> 4: Fade into Rigidity
        if (displayState.phase > 3 && displayState.phase <= 4) {
            rigidDamping = lerp(1, 0.05, displayState.phase - 3);
        } else if (displayState.phase > 4 && displayState.phase <= 5) {
            // 4 -> 5: Break out of rigidity into Chaos
            rigidDamping = lerp(0.05, 1.2, displayState.phase - 4);
            chaosIntensity = displayState.phase - 4;
        } else if (displayState.phase > 5 && displayState.phase <= 6) {
            // 5 -> 6: Collapse chaos into Asymmetric Suppression
            chaosIntensity = lerp(1, 0, displayState.phase - 5);
            suppIntensity = displayState.phase - 5;
        } else if (displayState.phase > 6) {
            // 6 -> 7: Return to Healthy
            suppIntensity = Math.max(0, 1 - (displayState.phase - 6));
        }

        ctx.beginPath();
        ctx.strokeStyle = "rgba(64, 224, 208, 0.9)";
        ctx.lineWidth = 4;

        // Glassmorphism glow
        ctx.shadowColor = "rgba(64, 224, 208, 0.6)";
        ctx.shadowBlur = 15;

        const waveWidth = rightX - leftX;

        for (let x = leftX; x <= rightX; x += 2) {
            let relativeX = (x - leftX) / waveWidth; // 0 to 1
            let yOffset = 0;

            // Calculate Standard Structural Wave (2 antinodes, 1 central node)
            let structuralWave =
                Math.sin(relativeX * Math.PI * 2) * Math.sin(timeScale * 2.5);

            // Calculate Chaotic Wave (Broken boundaries and broken node, noisy)
            const noise =
                (Math.sin(relativeX * 15 + timeScale * 12) +
                    Math.cos(relativeX * 25 - timeScale * 18)) *
                0.15;
            let chaoticWave =
                Math.sin(relativeX * Math.PI) * Math.sin(timeScale * 4) + noise;

            // Blend structure and chaos
            yOffset = lerp(structuralWave, chaoticWave, chaosIntensity);

            // Apply suppression (Intrinsic/Left side flatlines)
            if (suppIntensity > 0 && relativeX < 0.5) {
                // Fade the left side to 0
                yOffset = lerp(yOffset, 0, suppIntensity);
            }

            // Apply global rigidity damping and amplitude scale
            yOffset = yOffset * amplitude * rigidDamping;

            if (x === leftX) ctx.moveTo(x, centerY - yOffset);
            else ctx.lineTo(x, centerY - yOffset);
        }

        ctx.stroke();

        // Draw the active Antinode peaks if healthy
        if (
            (displayState.phase >= 2.8 && displayState.phase <= 3.5) ||
            displayState.phase > 6.5
        ) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
            ctx.shadowBlur = 20;
            ctx.shadowColor = "#ffffff";

            let peekOpacity = 1;
            if (displayState.phase < 3)
                peekOpacity = (displayState.phase - 2.8) * 5;
            if (displayState.phase > 3)
                peekOpacity = 1 - (displayState.phase - 3) * 2;
            if (displayState.phase > 6.5) peekOpacity = 1;

            ctx.globalAlpha =
                Math.max(0, Math.min(1, peekOpacity)) * waveOpacity;

            // Left Intrinsic peak
            let leftPeakAmp =
                Math.sin(0.25 * Math.PI * 2) *
                Math.sin(timeScale * 2.5) *
                amplitude *
                rigidDamping;
            ctx.beginPath();
            ctx.arc(
                leftX + waveWidth * 0.25,
                centerY - leftPeakAmp,
                4 * uiScale,
                0,
                Math.PI * 2,
            );
            ctx.fill();

            // Right Extrinsic peak
            let rightPeakAmp =
                Math.sin(0.75 * Math.PI * 2) *
                Math.sin(timeScale * 2.5) *
                amplitude *
                rigidDamping;
            ctx.beginPath();
            ctx.arc(
                leftX + waveWidth * 0.75,
                centerY - rightPeakAmp,
                4 * uiScale,
                0,
                Math.PI * 2,
            );
            ctx.fill();
        }

        // Reset shadow
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1.0;
    }

    ctx.restore(); // Restore context state to avoid compounding scale
    requestAnimationFrame(drawWave);
}

// Export for slides.js
window.initWaveVisualizer = initWaveVisualizer;
