/**
 * Standing Wave Carousel Hub
 * The resonant chamber for the website
 *
 * Architecture: L0 (stable) hub with L1 (dynamic) slide capabilities
 * Phase-locking: Only active slide runs expensive animations
 * Resonance: Navigation matches current phase (slide index)
 */

class CarouselHub {
    constructor() {
        // Nodes = Registered slides (L0 - stable)
        this.nodes = new Map();

        // Current phase = Active slide index
        this.currentPhase = 1; // Start at Node (center)

        // System state
        this.track = null;
        this.dots = [];
        this.arrows = { prev: null, next: null };
        this.isTransitioning = false;

        // Phase lock for expensive operations
        this.phaseLock = {
            lastUpdate: 0,
            minInterval: 300, // ms between transitions
        };

        // Bind methods
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
    }

    /**
     * Register a slide (capability)
     * Each slide self-describes with metadata
     */
    register(slideNode) {
        const node = {
            id: slideNode.id,
            index: slideNode.index,
            metadata: slideNode.metadata,
            element: slideNode.element,
            onActivate: slideNode.onActivate || (() => {}),
            onDeactivate: slideNode.onDeactivate || (() => {}),
            level: slideNode.level || "L1", // Most slides are L1 (traveling waves)
        };

        this.nodes.set(node.id, node);
    }

    /**
     * Initialize the hub
     * Auto-discovers slides and sets up resonance
     */
    init() {
        // Find the track
        this.track = document.getElementById("carouselTrack");
        if (!this.track) {
            return;
        }

        // Auto-register slides from DOM
        this.autoRegisterSlides();

        // Setup navigation
        this.setupNavigation();

        // Setup input handlers
        this.setupInputHandlers();

        // Initial phase
        this.setPhase(this.currentPhase);
    }

    /**
     * Auto-discovery: Find all slides in DOM
     * Standing Wave Principle: Capabilities self-register
     */
    autoRegisterSlides() {
        const slides = document.querySelectorAll(".carousel-slide");

        slides.forEach((slide, index) => {
            // Extract metadata from data attributes or defaults
            const metadata = {
                name: slide.dataset.name || `slide-${index}`,
                description: slide.dataset.description || "",
                resonance: (slide.dataset.resonance || "")
                    .split(",")
                    .filter(Boolean),
            };

            this.register({
                id: metadata.name,
                index: index,
                metadata: metadata,
                element: slide,
                level: slide.dataset.level || "L1",
                onActivate: () => this.activateSlide(slide),
                onDeactivate: () => this.deactivateSlide(slide),
            });
        });
    }

    /**
     * Setup navigation elements (dots, arrows)
     */
    setupNavigation() {
        // Dots
        this.dots = document.querySelectorAll(".dot");
        this.dots.forEach((dot, index) => {
            dot.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.excite(index);
            });
        });

        // Arrows
        this.arrows.prev = document.querySelector(".nav-arrow.prev");
        this.arrows.next = document.querySelector(".nav-arrow.next");

        if (this.arrows.prev) {
            this.arrows.prev.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.excite(this.currentPhase - 1);
            });
        }
        if (this.arrows.next) {
            this.arrows.next.addEventListener("click", (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.excite(this.currentPhase + 1);
            });
        }
    }

    /**
     * Setup keyboard and touch input
     */
    setupInputHandlers() {
        document.addEventListener("keydown", this.handleKeyDown);

        const wrapper = document.querySelector(".carousel-wrapper");
        if (wrapper) {
            wrapper.addEventListener("touchstart", this.handleTouchStart, {
                passive: true,
            });
            wrapper.addEventListener("touchend", this.handleTouchEnd, {
                passive: true,
            });
        }
    }

    /**
     * Handle keyboard input
     */
    handleKeyDown(e) {
        if (e.key === "ArrowLeft") {
            e.preventDefault();
            this.excite(this.currentPhase - 1);
        } else if (e.key === "ArrowRight") {
            e.preventDefault();
            this.excite(this.currentPhase + 1);
        }
    }

    /**
     * Touch handling for swipe
     */
    handleTouchStart(e) {
        this.touchStartX = e.changedTouches[0].screenX;
    }

    handleTouchEnd(e) {
        const touchEndX = e.changedTouches[0].screenX;
        const diff = this.touchStartX - touchEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                this.excite(this.currentPhase + 1); // Swipe left = next
            } else {
                this.excite(this.currentPhase - 1); // Swipe right = prev
            }
        }
    }

    /**
     * Excite = Transition to new phase (slide)
     * Standing Wave Principle: Phase-locking for L2 operations
     */
    excite(targetIndex) {
        // Boundary check
        const totalNodes = this.nodes.size;
        if (targetIndex < 0 || targetIndex >= totalNodes) {
            return; // Hit boundary - no oscillation beyond
        }

        // Phase-locking: Prevent rapid transitions
        const now = Date.now();
        if (now - this.phaseLock.lastUpdate < this.phaseLock.minInterval) {
            return;
        }
        this.phaseLock.lastUpdate = now;

        // Execute transition
        this.setPhase(targetIndex);
    }

    /**
     * Set the current phase (slide)
     */
    setPhase(index) {
        const prevPhase = this.currentPhase;
        this.currentPhase = index;

        // Update visual position
        this.updateTrackPosition();

        // Update navigation indicators
        this.updateNavigation();

        // Deactivate previous slide
        const prevNode = this.getNodeByIndex(prevPhase);
        if (prevNode) {
            prevNode.onDeactivate();
        }

        // Activate new slide
        const newNode = this.getNodeByIndex(index);
        if (newNode) {
            newNode.onActivate();
        }

        // Force scroll to top of viewport after transition
        setTimeout(() => {
            const viewport = document.querySelector(".carousel-viewport");
            if (viewport) {
                viewport.scrollTop = 0;
            }
        }, 100);
    }

    /**
     * Update track position (the actual slide movement)
     */
    updateTrackPosition() {
        if (!this.track) return;

        const translateX = -(this.currentPhase * 100);
        this.track.style.transform = `translateX(${translateX}vw)`;
    }

    /**
     * Update navigation indicators
     */
    updateNavigation() {
        // Update dots
        this.dots.forEach((dot, index) => {
            dot.classList.toggle("active", index === this.currentPhase);
        });

        // Update arrow visibility
        if (this.arrows.prev) {
            this.arrows.prev.style.opacity =
                this.currentPhase === 0 ? "0.3" : "";
        }
        if (this.arrows.next) {
            const isLast = this.currentPhase === this.nodes.size - 1;
            this.arrows.next.style.opacity = isLast ? "0.3" : "";
        }

        // Update nav links
        this.updateNavLinks();
    }

    /**
     * Update nav link highlighting
     */
    updateNavLinks() {
        const links = document.querySelectorAll(".nav-links a");
        links.forEach((link, index) => {
            link.classList.toggle("active", index === this.currentPhase);
        });
    }

    /**
     * Activate a slide
     * Standing Wave Principle: Only active node has full energy
     */
    activateSlide(slide) {
        // Add active class for styling
        slide.classList.add("active");

        // Force scroll to top
        slide.scrollTop = 0;
        const container = slide.querySelector(".container > .stack");
        if (container) {
            container.scrollTop = 0;
        }

        // Also scroll the first content element into view
        const firstContent = slide.querySelector(".wave-pattern-intro");
        if (firstContent) {
            firstContent.scrollIntoView({ behavior: "auto", block: "start" });
        }

        // Resume any paused animations
        const canvas = slide.querySelector("canvas");
        if (canvas) {
            canvas.dataset.active = "true";
        }
    }

    /**
     * Deactivate a slide
     */
    deactivateSlide(slide) {
        slide.classList.remove("active");

        // Pause expensive animations
        const canvas = slide.querySelector("canvas");
        if (canvas) {
            canvas.dataset.active = "false";
        }
    }

    /**
     * Get node by index
     */
    getNodeByIndex(index) {
        for (const node of this.nodes.values()) {
            if (node.index === index) return node;
        }
        return null;
    }

    /**
     * Navigate to specific slide (public API)
     */
    goToSlide(index) {
        this.excite(index);
    }
}

// Global instance for navigation
window.carouselHub = new CarouselHub();

// Initialize on DOM ready
document.addEventListener("DOMContentLoaded", () => {
    window.carouselHub.init();
});

// Export for module systems if needed
if (typeof module !== "undefined" && module.exports) {
    module.exports = CarouselHub;
}
