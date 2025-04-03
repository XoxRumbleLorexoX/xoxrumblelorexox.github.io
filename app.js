// === GSAP Image Sequence Animation ===
// Ensure you have a <canvas class="canvas-gsap"></canvas> in your HTML
// and included the GSAP libraries if you want this part.

const gsapCanvas = document.querySelector(".canvas-gsap"); // Use specific class/ID
// **Important**: Check if the element actually exists before proceeding
if (gsapCanvas) {
    gsapCanvas.width = window.innerWidth;
    gsapCanvas.height = window.innerHeight;

    const gsapContext = gsapCanvas.getContext("2d");
    const frameCount = 260; // Total number of frames

    const currentFrame = (index) => `./img/Rendered/${(index + 1).toString()}.jpg`; // Path to your images
    const images = [];
    let ball = { frame: 0 }; // Animation state object

    // Preload images
    let imagesLoaded = 0;
    for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = currentFrame(i);
        img.onload = () => {
            imagesLoaded++;
            if (imagesLoaded === frameCount) {
                // Start rendering only when all images are loaded
                images[0].onload = renderGsap; // Set initial render trigger
                renderGsap(); // Initial render call
                setupGsapAnimation(); // Setup the GSAP animation
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${img.src}`);
            imagesLoaded++; // Increment even on error to avoid getting stuck
             if (imagesLoaded === frameCount) {
                setupGsapAnimation(); // Still setup animation maybe? Or handle error
            }
        };
        images.push(img);
    }

    function setupGsapAnimation() {
         gsap.to(ball, {
            frame: frameCount - 1,
            snap: "frame",
            ease: "none",
            scrollTrigger: {
                trigger: gsapCanvas, // Use the canvas itself as the trigger
                scrub: true,
                pin: true, // Pin the canvas during scroll
                start: "top top", // Start animation when canvas top hits viewport top
                end: "+=500%", // Adjust scroll duration (e.g., 500% of viewport height)
            },
            onUpdate: renderGsap, // Call render on each update
        });
    }


    // Render function for GSAP animation
    function renderGsap() {
        if (images[ball.frame] && images[ball.frame].complete && images[ball.frame].naturalHeight !== 0) {
             gsapContext.clearRect(0, 0, gsapCanvas.width, gsapCanvas.height);
             gsapContext.drawImage(images[ball.frame], 0, 0, gsapCanvas.width, gsapCanvas.height);
        } else {
            // console.log("Waiting for frame:", ball.frame); // Optional: Debug logging
        }
    }

    // Resize handler for GSAP canvas
    window.addEventListener('resize', () => {
        gsapCanvas.width = window.innerWidth;
        gsapCanvas.height = window.innerHeight;
        renderGsap(); // Re-render on resize
    });

} else {
    console.log("GSAP canvas element (.canvas-gsap) not found. Skipping GSAP animation setup.");
}


// === Particle Visualizer ===
const particleCanvas = document.getElementById('particle-visualizer');
// **Important**: Check if the element exists
if (particleCanvas) {
    const particleCtx = particleCanvas.getContext('2d');
    particleCanvas.width = window.innerWidth;
    particleCanvas.height = window.innerHeight;

    let particlesArray = []; // Initialize here

    // Mouse position (remains the same)
    const mouse = {
        x: null,
        y: null,
        radius: 100 // Interaction radius
    };

    window.addEventListener('mousemove', function (event) {
        mouse.x = event.clientX;
        mouse.y = event.clientY;
    });
    window.addEventListener('mouseout', function () {
        mouse.x = undefined;
        mouse.y = undefined;
    });


    // Particle class (remove color property)
    class Particle {
        constructor(x, y, directionX, directionY, size) { // Removed color
            this.x = x;
            this.y = y;
            this.directionX = directionX;
            this.directionY = directionY;
            this.size = size;
        }

        // Draw method (sets fillStyle before drawing)
        draw() {
            // Set fill style HERE - the blend mode will invert this color
            particleCtx.fillStyle = 'white';
            particleCtx.beginPath();
            particleCtx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
            particleCtx.fill();
        }

        // Update method (logic remains similar)
        update() {
            if (this.x > particleCanvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > particleCanvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse interaction logic (remains similar)
            if (mouse.x !== null && mouse.y !== null) {
                 let dx = mouse.x - this.x;
                 let dy = mouse.y - this.y;
                 let distance = Math.sqrt(dx * dx + dy * dy);
                 if (distance < mouse.radius + this.size) {
                    // Push particle away logic (remains similar)
                     if (mouse.x < this.x && this.x < particleCanvas.width - this.size * 10) { this.x += 3; } // Slightly less push
                     if (mouse.x > this.x && this.x > this.size * 10) { this.x -= 3; }
                     if (mouse.y < this.y && this.y < particleCanvas.height - this.size * 10) { this.y += 3; }
                     if (mouse.y > this.y && this.y > this.size * 10) { this.y -= 3; }
                 }
            }

            this.x += this.directionX;
            this.y += this.directionY;
            this.draw();
        }
    }

    // Init function (remove color assignment)
    function initParticles() {
        particlesArray = [];
        let numberOfParticles = (particleCanvas.height * particleCanvas.width) / 1500; // Adjust density
        for (let i = 0; i < numberOfParticles; i++) {
            let size = (Math.random() * 2) + 1; // Smaller particles
            let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
            let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
            let directionX = (Math.random() * 0.6) - 0.3; // Slower movement
            let directionY = (Math.random() * 0.6) - 0.3;
            particlesArray.push(new Particle(x, y, directionX, directionY, size)); // No color passed
        }
    }

    // Animate function
    function animateParticles() {
        requestAnimationFrame(animateParticles);
        particleCtx.clearRect(0, 0, innerWidth, innerHeight);

        if (particlesArray) {
            for (let i = 0; i < particlesArray.length; i++) {
                particlesArray[i].update();
            }
        }
    }

    // Resize handler for particle canvas
     window.addEventListener('resize', () => {
        particleCanvas.width = window.innerWidth;
        particleCanvas.height = window.innerHeight;
        mouse.radius = ((particleCanvas.height / 90) * (particleCanvas.width / 90));
        initParticles(); // Reinitialize particles on resize
    });


    // Initial setup
    initParticles();
    animateParticles();

} else {
     console.log("Particle canvas element (#particle-visualizer) not found. Skipping particle animation setup.");
}

// Keep the GSAP Animation code if needed...
// ... (GSAP code) ...

// Keep the Particle Visualizer code...
// ... (Particle Visualizer code) ...


// === NEW Canvas Cursor Orbiter (Trails & Rainbow) ===
const orbiterCanvas = document.getElementById('cursor-orbiter-canvas');

// **Important**: Check if the canvas element exists
if (orbiterCanvas) {
    const orbiterCtx = orbiterCanvas.getContext('2d');
    let canvasWidth = window.innerWidth;
    let canvasHeight = window.innerHeight;
    orbiterCanvas.width = canvasWidth;
    orbiterCanvas.height = canvasHeight;

    let mouseX = canvasWidth / 2;
    let mouseY = canvasHeight / 2;
    let targetX = mouseX;
    let targetY = mouseY;
    let angle = 0;
    let baseHue = 0; // Starting hue for rainbow cycle

    const electrons = [];
    const numElectrons = 6; // How many electrons (can change to 3, 9, etc.)
    const trailLength = 0.15; // Lower value = longer/stronger trails (0.1 - 0.3 is typical)

    // Initialize electron properties
    for (let i = 0; i < numElectrons; i++) {
        electrons.push({
            radius: 20 + (i * 8),      // Orbit radius (increases for each electron)
            speedMultiplier: 1 + (i * 0.15), // Orbit speed (increases slightly)
            size: 4 - (i * 0.2),        // Electron size (decreases slightly)
            hueOffset: (360 / numElectrons) * i // Distribute hues evenly
        });
    }

    // Update mouse position (target for the center)
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });
     document.addEventListener('mouseout', () => {
        // Optionally fade out or stop when mouse leaves window
        // For simplicity, we'll just let it orbit the last known target
    });


    function animateOrbiterCanvas() {
        // --- Trail Effect ---
        // Fill with semi-transparent black (or another color) to fade previous frames
        // Inside animateOrbiterCanvas function:
        orbiterCtx.clearRect(0, 0, canvasWidth, canvasHeight);


        const trailLength = 0.15; // <--- THIS VALUE CONTROLS FADE SPEED

        // --- Trail Effect 

        // ... rest of the function ...
        orbiterCtx.fillStyle = `rgba(0, 0, 0, ${trailLength})`; // Adjust alpha for trail length
        orbiterCtx.fillRect(0, 0, canvasWidth, canvasHeight);

        // --- Smooth Follow ---
        // Move the center point smoothly towards the target mouse position
        mouseX += (targetX - mouseX) * 0.08; // Adjust smoothing factor (0.05 - 0.1)
        mouseY += (targetY - mouseY) * 0.08;

        // --- Update Angles and Colors ---
        angle += 0.04; // Base rotation speed
        baseHue = (baseHue + 0.5) % 360; // Slowly cycle base hue for rainbow effect

        // --- Draw Electrons ---
        electrons.forEach(electron => {
            // Calculate electron position
            let currentAngle = angle * electron.speedMultiplier;
            let x = mouseX + Math.cos(currentAngle) * electron.radius;
            let y = mouseY + Math.sin(currentAngle) * electron.radius;

            // Calculate electron color
            let currentHue = (baseHue + electron.hueOffset) % 360;
            let color = `hsl(${currentHue}, 100%, 60%)`; // HSL: Hue, Saturation (100%), Lightness (60%)

            // Draw the electron
            orbiterCtx.fillStyle = color;
            orbiterCtx.beginPath();
            orbiterCtx.arc(x, y, Math.max(1, electron.size), 0, Math.PI * 2); // Ensure size is at least 1
            orbiterCtx.fill();
        });

        // Loop the animation
        requestAnimationFrame(animateOrbiterCanvas);
    }

    // Resize handler
    window.addEventListener('resize', () => {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        orbiterCanvas.width = canvasWidth;
        orbiterCanvas.height = canvasHeight;
    });

    // Start the animation
    animateOrbiterCanvas();

} else {
    console.error("Cursor orbiter canvas element (#cursor-orbiter-canvas) not found!");
}