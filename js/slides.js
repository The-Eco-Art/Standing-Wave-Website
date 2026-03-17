/**
 * Standing Wave - Slide Loader
 * Embeds slide content directly (no fetch required - works with file://)
 *
 * Architecture:
 * - Slide HTML is imported via <script type="text/html"> tags
 * - No fetch() needed - works with file:// protocol
 * - Initializes carousel hub after slides are loaded
 */

(function () {
    "use strict";

    /**
     * Load all slides from embedded templates
     */
    function loadAllSlides() {
        const track = document.getElementById("carouselTrack");
        if (!track) {
            return false;
        }

        // Find all slide templates
        const templates = document.querySelectorAll(
            'script[type="text/html"][data-slide]',
        );

        templates.forEach((template, index) => {
            const slideName = template.getAttribute("data-slide");

            // Create a temporary container to parse the HTML
            const temp = document.createElement("div");
            temp.innerHTML = template.textContent;

            // Get the slide element
            const slide = temp.querySelector(".carousel-slide");
            if (!slide) {
                return;
            }

            // Set attributes if not present
            if (!slide.getAttribute("data-name")) {
                slide.setAttribute("data-name", slideName);
            }
            if (!slide.getAttribute("data-index")) {
                slide.setAttribute("data-index", index.toString());
            }

            // Inject into track
            track.appendChild(slide);
        });

        const count = templates.length;
        return count > 0;
    }

    /**
     * Initialize the slide system
     */
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
            return;
        }

        // Load all slides
        const success = loadAllSlides();

        if (success) {
            // Small delay to ensure slides are in DOM
            setTimeout(() => {
                // Initialize wave visualizer (if Node slide loaded)
                if (window.initWaveVisualizer) {
                    window.initWaveVisualizer();
                }

                // Initialize carousel hub after slides are loaded
                if (window.carouselHub) {
                    window.carouselHub.init();
                }
            }, 100);
        }
    }

    // Start initialization
    init();

    // Expose for debugging
    window.SlideLoader = {
        loadAllSlides,
        init,
    };
})();
