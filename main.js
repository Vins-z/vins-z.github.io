// Loading Screen Setup
let touchStart;
let touchEnd;
let backgroundScene, backgroundCamera, backgroundRenderer, backgroundComposer;

document.addEventListener('DOMContentLoaded', () => {
    // Create loading screen
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: #000;
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
        transition: opacity 0.5s ease;
    `;

    // Add loading animation
    const loadingText = document.createElement('div');
    loadingText.style.cssText = `
        color: white;
        font-size: 1.5rem;
        letter-spacing: 0.3rem;
        text-transform: uppercase;
        opacity: 0;
        animation: pulse 2s infinite;
    `;
    loadingText.textContent = 'Loading';
    loadingScreen.appendChild(loadingText);

    // Add loading animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    // Set up black background for non-home sections
    document.body.style.backgroundColor = '#000000';
    
    // Initialize home screen effect, passing the loading screen element
    initMainScene(loadingScreen);
    
    // Get cube container and set initial opacity for smooth transitions
    const cubeContainer = document.getElementById('cube-container');
    if (cubeContainer) {
        cubeContainer.style.opacity = '1';
    }
    
    // Hide loading screen after content loads
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        // Check if loading screen still exists before manipulating
        if (loadingScreen) {
            loadingScreen.style.opacity = 0;
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = '';
                
                // After typing animation completes, remove the typing border
                setTimeout(() => {
                    const typedText = document.querySelector('.typed-text');
                    if (typedText) {
                        typedText.style.borderRight = 'none';
                    }
                }, 3500);
            }, 500); // Match fade duration
        }
    }, 2000);

    // Menu functionality
    const menuBtn = document.querySelector('.menu-btn');
    const menuOverlay = document.querySelector('.menu-overlay');
    const menuLinks = document.querySelectorAll('.menu-links a');

    menuBtn.addEventListener('click', () => {
        menuOverlay.classList.toggle('active');
        menuBtn.textContent = menuOverlay.classList.contains('active') ? 'Close' : 'Menu';
    });

    menuLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuOverlay.classList.remove('active');
            menuBtn.textContent = 'Menu';
        });
    });

    // Event listeners for buttons
    const resumeBtn = document.getElementById('resumeBtn');
    const githubBtn = document.getElementById('githubBtn');
    const viewProjectsBtn = document.getElementById('viewProjectsBtn');

    // Analytics events
    resumeBtn.addEventListener('click', function() {
        gtag('event', 'resume_download', {
            'event_category': 'Resume',
            'event_label': 'Resume Download'
        });
    });

    githubBtn.addEventListener('click', function() {
        gtag('event', 'github_click', {
            'event_category': 'GitHub',
            'event_label': 'GitHub Link Click'
        });
    });

    viewProjectsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        gtag('event', 'view_projects', {
            'event_category': 'Projects',
            'event_label': 'View Projects Click'
        });
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Scroll animations
    const fadeElements = document.querySelectorAll('.skill-item, .project-item, .interest-item, .education-item');
    const sectionTitles = document.querySelectorAll('.section h2');

    const observerOptions = {
        threshold: 0.1, // Trigger a bit earlier
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        let delay = 0;
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Apply visible class to section titles
                if (entry.target.tagName === 'H2') {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                    return;
                }
                
                // Apply staggered slide-in animations for grid items
                const gridItem = entry.target;
                // Determine slide direction based on position (simple left/right alternation)
                const grid = gridItem.closest('.skill-list, .project-list, .interest-list, .education-list');
                if (grid) {
                    const items = Array.from(grid.children);
                    const itemIndex = items.indexOf(gridItem);
                    const directionClass = itemIndex % 2 === 0 ? 'slide-in-left' : 'slide-in-right';
                    gridItem.classList.add(directionClass);
                }
                
                // Apply visible class with a delay
                setTimeout(() => {
                    gridItem.classList.add('visible');
                }, delay);
                delay += 100; // Increment delay for each visible item
                
                // Unobserve after animation starts
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeElements.forEach(element => {
        observer.observe(element);
    });
    
    sectionTitles.forEach(title => {
        observer.observe(title);
    });

    // Smooth scroll for all anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Setup modal functionality
    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeBtn = document.getElementsByClassName('close')[0];

    // Get all clickable items that should display modals
    const modalItems = document.querySelectorAll('.project-item, .education-item, .skill-item, .interest-item');

    // Add click event listener to each item
    modalItems.forEach(item => {
        item.addEventListener('click', () => {
            // For skill and interest items, get the text content from the skill-text or interest-text div
            const titleElement = item.querySelector('h3') || item.querySelector('.skill-text') || item.querySelector('.interest-text');
            
            modalTitle.textContent = titleElement.textContent;
            modalDescription.innerHTML = item.dataset.description.replace(/\n/g, '<br>');
            modal.classList.add('show');
            setTimeout(() => {
                modal.querySelector('.modal-content').classList.add('show');
            }, 100);
        });
    });

    // Add click event listener to close button
    closeBtn.addEventListener('click', () => {
        modal.querySelector('.modal-content').classList.remove('show');
        setTimeout(() => {
            modal.classList.remove('show');
        }, 300);
    });

    // Add click event listener to close modal when clicking outside of it
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.querySelector('.modal-content').classList.remove('show');
            setTimeout(() => {
                modal.classList.remove('show');
            }, 300);
        }
    });

    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Remove parallax effect for hero section based on mouse movement
    
    // Back to Top button functionality
    const backToTopButton = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    // Variables for subtle scroll speed effect
    let lastScrollY = 0;
    let scrollSpeed = 0;
    const maxScrollSpeedEffect = 0.005;

    window.addEventListener('scroll', () => {
        // Calculate scroll speed
        scrollSpeed = Math.abs(scrollY - lastScrollY);
        lastScrollY = scrollY;
    });
});

// Advanced Three.js Implementation
function initMainScene(loadingScreen) {
    // Get frequently accessed DOM elements once
    const threeContainer = document.getElementById('cube-container');

    // --- Mobile Optimization: Skip 3D on small screens --- 
    // Reverted: Removed screen width check to allow animation on all devices
    // if (window.innerWidth < 768) {
    //     console.log("Small screen detected, skipping Three.js initialization for performance.");
    //     // Ensure loading screen is hidden even if 3D is skipped
    //     if (loadingScreen) {
    //         loadingScreen.style.opacity = '0'; 
    //         setTimeout(() => {
    //             if (loadingScreen) loadingScreen.style.display = 'none';
    //             document.body.style.overflow = ''; // Ensure scrollbar is back
    //         }, 500);
    //     }
    //     // Hide the container if it exists
    //     if (threeContainer) {
    //         threeContainer.style.display = 'none';
    //     }
    //     return; // Exit the function, skipping 3D setup
    // }
    // --- End Mobile Optimization ---

    try { // Start of try block
        if (!threeContainer) {
            // If container is missing, log error and exit 3D setup
            console.error("Three.js container (#cube-container) not found!");
            // Ensure loading screen is hidden even if container is missing
            throw new Error("Missing 3D container"); // Throw to trigger catch block
        }

        // Main scene setup
        const scene = new THREE.Scene();
        
        // Create a perspective camera with better parameters
        const camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        // Set initial camera position further back to allow for zoom effect
        camera.position.set(0, 0, 40);
        
        // Variables for zoom effect
        let targetZoom = 40;
        let currentZoom = 40;
        const maxZoom = 5; // Closest we'll zoom in
        const scrollZoomFactor = 0.1; // How much zoom per scroll unit
        
        // Set up renderer with anti-aliasing and high pixel ratio
        const renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        // Further increase resolution by setting a higher pixel ratio, but capped to prevent performance issues
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));
        renderer.setClearColor(0x000000, 0);
        renderer.outputEncoding = THREE.sRGBEncoding;
        threeContainer.appendChild(renderer.domElement);

        // Add post-processing
        const composer = new THREE.EffectComposer(renderer);
        const renderPass = new THREE.RenderPass(scene, camera);
        composer.addPass(renderPass);
        
        // Add bloom effect
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.6,    // strength
            0.4,    // radius
            0.85    // threshold
        );
        composer.addPass(bloomPass);
        
        // Create geometry for particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 3000;
        
        const posArray = new Float32Array(particlesCount * 3);
        const scaleArray = new Float32Array(particlesCount);
        const colorArray = new Float32Array(particlesCount * 3);
        
        // Fill the arrays with random positions
        for(let i = 0; i < particlesCount * 3; i+=3) {
            // Position
            posArray[i] = (Math.random() - 0.5) * 50;
            posArray[i+1] = (Math.random() - 0.5) * 50;
            posArray[i+2] = (Math.random() - 0.5) * 50;
            
            // Scale (for size variation)
            scaleArray[i/3] = Math.random();
            
            // Color variation
            colorArray[i] = 0.3 + Math.random() * 0.7; // R
            colorArray[i+1] = 0.3 + Math.random() * 0.7; // G
            colorArray[i+2] = 0.5 + Math.random() * 0.5; // B - more blue tint
        }
        
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
        particlesGeometry.setAttribute('scale', new THREE.BufferAttribute(scaleArray, 1));
        particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorArray, 3));
        
        // Create material for particles with advanced shaders
        const particlesMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                attribute float scale;
                attribute vec3 color;
                
                varying vec3 vPosition;
                varying float vScale;
                varying vec3 vColor;
                
                void main() {
                    vPosition = position;
                    vScale = scale;
                    vColor = color;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = scale * 2.5 * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vPosition;
                varying float vScale;
                varying vec3 vColor;
                
                void main() {
                    // Create a soft circular particle with gradient
                    float distToCenter = length(gl_PointCoord - vec2(0.5));
                    float strength = 1.0 - smoothstep(0.0, 0.5, distToCenter);
                    
                    // Add color variation based on position, scale, and provided color
                    vec3 color = vColor * mix(
                        vec3(0.3, 0.4, 0.9),
                        vec3(0.9, 0.4, 0.6),
                        vScale
                    );
                    
                    // Apply the color with opacity based on strength
                    gl_FragColor = vec4(color, strength * 0.8);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            vertexColors: true
        });
        
        // Create the particles system
        const particlesSystem = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesSystem);
        
        // Add multiple dynamic light sources
        const pointLight1 = new THREE.PointLight(0x4488ff, 1, 100);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0xff4488, 0.8, 100);
        pointLight2.position.set(-10, -5, 10);
        scene.add(pointLight2);
        
        // Create fluid simulation mesh
        const fluidGeometry = new THREE.PlaneGeometry(40, 40, 256, 256);
        const fluidMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float uTime;
                uniform float uNoiseStrength;
                uniform float uWaveHeight;
                
                varying vec2 vUv;
                varying float vElevation;
                
                // Simplex 3D noise function
                vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    
                    // First corner
                    vec3 i  = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    
                    // Other corners
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    
                    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
                    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
                    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;
                    
                    // Permutations
                    i = mod(i, 289.0);
                    vec4 p = permute(permute(permute(
                                i.z + vec3(0.0, i1.z, i2.z)) +
                                i.y + vec3(0.0, i1.y, i2.y)) +
                                i.x + vec3(0.0, i1.x, i2.x));
                    
                    // Gradients
                    vec3 ns = 0.142857142857 * D.wyz - D.xzx;
                    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
                    
                    vec4 x_ = floor(j * ns.z);
                    vec4 y_ = floor(j - 7.0 * x_);
                    
                    vec4 x = x_ *ns.x + ns.yyyy;
                    vec4 y = y_ *ns.x + ns.yyyy;
                    vec4 h = 1.0 - abs(x) - abs(y);
                    
                    vec4 b0 = vec4(x.xy, y.xy);
                    vec4 b1 = vec4(x.zw, y.zw);
                    
                    vec4 s0 = floor(b0)*2.0 + 1.0;
                    vec4 s1 = floor(b1)*2.0 + 1.0;
                    vec4 sh = -step(h, vec4(0.0));
                    
                    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
                    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
                    
                    vec3 p0 = vec3(a0.xy, h.x);
                    vec3 p1 = vec3(a0.zw, h.y);
                    vec3 p2 = vec3(a1.xy, h.z);
                    vec3 p3 = vec3(a1.zw, h.w);
                    
                    // Normalise gradients
                    vec4 norm = 1.79284291400159 - 0.85373472095314 * vec4(
                        dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    
                    // Mix final noise value
                    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
                }
                
                void main() {
                    vUv = uv;
                    
                    // Create multiple layers of noise
                    float noise1 = snoise(vec3(position.x * 0.3, position.y * 0.3, uTime * 0.2)) * uNoiseStrength;
                    float noise2 = snoise(vec3(position.x * 0.5, position.y * 0.5, uTime * 0.15 + 100.0)) * uNoiseStrength * 0.5;
                    float noise3 = snoise(vec3(position.x * 0.2, position.y * 0.2, uTime * 0.1 + 200.0)) * uNoiseStrength * 0.3;
                    
                    // Calculate elevation using sin waves for fluid-like effect
                    float elevation = 
                        sin(position.x * 0.2 + uTime * 0.7) * sin(position.y * 0.2) * uWaveHeight * 0.5 +
                        sin(position.x * 0.1 - uTime * 0.5) * sin(position.y * 0.3 + uTime * 0.2) * uWaveHeight * 0.3 +
                        noise1 + noise2 + noise3;
                    
                    vElevation = elevation;
                    
                    // Apply elevation to vertex position
                    vec3 newPosition = position;
                    newPosition.z += elevation;
                    
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
                }
            `,
            fragmentShader: `
                uniform float uTime;
                uniform vec3 uBaseColor;
                uniform vec3 uHighlightColor;
                
                varying vec2 vUv;
                varying float vElevation;
                
                void main() {
                    // Calculate gradient based on elevation
                    float gradient = smoothstep(-0.5, 2.0, vElevation);
                    
                    // Mix colors based on elevation and time
                    vec3 mixedColor = mix(
                        uBaseColor, 
                        uHighlightColor, 
                        gradient + 0.3 * sin(uTime * 0.5)
                    );
                    
                    // Add subtle wave pattern
                    float pattern = 0.03 * sin((vUv.x * 20.0) + (vUv.y * 20.0) + uTime * 2.0);
                    
                    // Apply color with elevation-based opacity
                    float alpha = 0.1 + 0.3 * gradient + pattern;
                    gl_FragColor = vec4(mixedColor, alpha);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uNoiseStrength: { value: 0.6 },
                uWaveHeight: { value: 0.3 },
                uBaseColor: { value: new THREE.Color(0x1a237e) }, // Deep blue
                uHighlightColor: { value: new THREE.Color(0x7c4dff) } // Purple
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        const fluidMesh = new THREE.Mesh(fluidGeometry, fluidMaterial);
        fluidMesh.rotation.x = -Math.PI * 0.45;
        fluidMesh.position.set(0, -2, 0);
        scene.add(fluidMesh);
        
        // Create light trails system
        const trailsCount = 10;
        const trailPointsCount = 100;
        const trails = [];
        
        for (let i = 0; i < trailsCount; i++) {
            const trailGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(trailPointsCount * 3);
            const opacities = new Float32Array(trailPointsCount);
            
            // Initialize trail points in a circular pattern
            const angle = (i / trailsCount) * Math.PI * 2;
            const radius = 5 + Math.random() * 10;
            const centerX = Math.cos(angle) * radius * 0.2;
            const centerY = Math.sin(angle) * radius * 0.2;
            
            for (let j = 0; j < trailPointsCount; j++) {
                const t = j / trailPointsCount;
                positions[j * 3] = centerX + Math.cos(angle + t * Math.PI * 2) * radius * (1 - t * 0.9);
                positions[j * 3 + 1] = centerY + Math.sin(angle + t * Math.PI * 2) * radius * (1 - t * 0.9);
                positions[j * 3 + 2] = -5 + t * 10;
                opacities[j] = 1 - t;
            }
            
            trailGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            trailGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));
            
            const trailMaterial = new THREE.ShaderMaterial({
                vertexShader: `
                    attribute float opacity;
                    
                    varying float vOpacity;
                    
                    void main() {
                        vOpacity = opacity;
                        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = 3.0 * opacity;
                    }
                `,
                fragmentShader: `
                    varying float vOpacity;
                    
                    void main() {
                        // Create soft point with gradient
                        float strength = 1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0;
                        strength = max(0.0, strength);
                        
                        // Create rainbow-like color gradient
                        vec3 color = mix(
                            vec3(0.8, 0.2, 0.8), // Purple
                            vec3(0.2, 0.4, 0.9), // Blue
                            vOpacity
                        );
                        
                        gl_FragColor = vec4(color, strength * vOpacity);
                    }
                `,
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });
            
            const trail = new THREE.Points(trailGeometry, trailMaterial);
            scene.add(trail);
            
            // Store trail info for animation
            trails.push({
                mesh: trail,
                positions: positions,
                opacities: opacities,
                angle: angle,
                radius: radius,
                speed: 0.02 + Math.random() * 0.03,
                centerX: centerX,
                centerY: centerY
            });
        }
        
        // Create abstracted morphing mesh (inspired by lusion.co)
        const morphGeometry = new THREE.IcosahedronGeometry(5, 5);
        const morphMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            roughness: 0.2,
            metalness: 0.7,
            wireframe: true,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        const morphMesh = new THREE.Mesh(morphGeometry, morphMaterial);
        scene.add(morphMesh);
        
        // Create mouse tracking for interactive elements
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;
        
        // We're removing all mouse and touch event listeners since we don't need cursor-based movement
        // However, we'll keep the variables for future reference
        
        // Handle window resize events
        window.addEventListener('resize', () => {
            // Update camera
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            
            // Update renderer and composer
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 4));
            
            composer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Scroll related variables for 3D scene
        let scrollY = 0;
        let currentSection = 0;
        let maxScrollForZoom = 1000;
        let lastScrollY_3D = 0; // Use a different name to avoid conflict if needed
        let scrollSpeed_3D = 0;
        const maxScrollSpeedEffect = 0.005;

        const navbar = document.querySelector('.navbar');
        const backToTopButton = document.querySelector('.back-to-top');

        // Unified Scroll Handler
        function handleScroll() {
            scrollY = window.scrollY;
            
            // --- Navbar Effect --- 
            if (navbar) { // Check if navbar exists
                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
            
            // --- Back to Top Button Visibility --- 
            if (backToTopButton) { // Check if button exists
                if (scrollY > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            }

            // --- 3D Scene Zoom Calculation --- 
            maxScrollForZoom = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = Math.max(0, Math.min(scrollY / maxScrollForZoom, 1)); // Ensure progress is between 0 and 1
            targetZoom = 40 - (40 - maxZoom) * scrollProgress;
            
            // --- 3D Scene Opacity (Keep visible) --- 
            threeContainer.style.opacity = '1'; // Keep it visible (using renamed variable)

            // --- Scroll Speed Calculation for 3D --- 
            scrollSpeed_3D = Math.abs(scrollY - lastScrollY_3D);
            lastScrollY_3D = scrollY;
            
            // --- Current Section Logic (if needed for other effects) ---
            const sections = document.querySelectorAll('section');
            for (let i = 0; i < sections.length; i++) {
                const section = sections[i];
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                
                if (scrollY >= sectionTop - window.innerHeight / 2 && 
                    scrollY < sectionTop + sectionHeight - window.innerHeight / 2) {
                    currentSection = i;
                    break;
                }
            }
        }

        // Attach the unified scroll handler
        window.addEventListener('scroll', handleScroll, { passive: true }); // Use passive listener for performance

        // Initial call to set initial states
        handleScroll(); 
        
        // Animation loop
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            
            const elapsedTime = clock.getElapsedTime();
            const deltaTime = clock.getDelta();
            
            // Smooth zoom transition
            currentZoom += (targetZoom - currentZoom) * 0.05;
            camera.position.z = currentZoom;
            
            // Apply time-based motion
            camera.position.x = Math.sin(elapsedTime * 0.2) * 1.5;
            camera.position.y = Math.cos(elapsedTime * 0.15) * 1.5;
            
            // Apply subtle rotation based on scroll speed
            const scrollEffectRotation = Math.min(scrollSpeed_3D * 0.0001, maxScrollSpeedEffect);
            scene.rotation.y += scrollEffectRotation; // Gently rotate scene based on speed

            // Reset scroll speed effect gradually if scroll stops
            if (scrollSpeed_3D > 0) {
                scrollSpeed_3D *= 0.95; // Decay speed effect
            } else {
                // Only return to 0 if rotation is not already near 0
                if (Math.abs(scene.rotation.y) > 0.0001) {
                     scene.rotation.y += (0 - scene.rotation.y) * 0.01; // Gently return to 0 rotation
                }
            }
            
            // Update fluid shader uniforms
            fluidMaterial.uniforms.uTime.value = elapsedTime;
            
            // Animate light sources for dynamic lighting
            pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 15;
            pointLight1.position.y = Math.cos(elapsedTime * 0.3) * 15;
            
            pointLight2.position.x = Math.sin(elapsedTime * 0.4 + Math.PI) * 15;
            pointLight2.position.y = Math.cos(elapsedTime * 0.2 + Math.PI) * 15;
            
            // Update color cycling for lights based on time
            const lightHue1 = (elapsedTime * 0.05) % 1;
            const lightHue2 = ((elapsedTime * 0.05) + 0.5) % 1;
            
            pointLight1.color.setHSL(lightHue1, 0.7, 0.6);
            pointLight2.color.setHSL(lightHue2, 0.7, 0.6);
            
            // Update fluid mesh colors
            fluidMaterial.uniforms.uBaseColor.value.setHSL(lightHue1, 0.7, 0.3);
            fluidMaterial.uniforms.uHighlightColor.value.setHSL(lightHue2, 0.8, 0.6);
            
            // Update light trails
            trails.forEach(trail => {
                const positions = trail.positions;
                const opacities = trail.opacities;
                
                // Update trail head position
                trail.angle += trail.speed;
                
                // Update all trail points, creating a flowing effect
                for (let i = trailPointsCount - 1; i > 0; i--) {
                    positions[i * 3] = positions[(i - 1) * 3];
                    positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
                    positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
                    opacities[i] = opacities[i - 1] * 0.98; // Fade out
                }
                
                // Calculate new head position without mouse influence
                positions[0] = trail.centerX + Math.cos(trail.angle) * trail.radius;
                positions[1] = trail.centerY + Math.sin(trail.angle) * trail.radius;
                positions[2] = Math.sin(elapsedTime * 0.5 + trail.angle) * 2;
                opacities[0] = 1.0;
                
                trail.mesh.geometry.attributes.position.needsUpdate = true;
                trail.mesh.geometry.attributes.opacity.needsUpdate = true;
            });
            
            // Remove cursor-based rotation for particles
            particlesSystem.rotation.x = Math.sin(elapsedTime * 0.2) * 0.1;
            particlesSystem.rotation.y = Math.cos(elapsedTime * 0.3) * 0.1;
            particlesSystem.rotation.z += 0.001;
            
            // Move particles based on audio/scroll
            for (let i = 0; i < particlesCount; i++) {
                const i3 = i * 3;
                const xPos = particlesGeometry.attributes.position.array[i3];
                const yPos = particlesGeometry.attributes.position.array[i3 + 1];
                const zPos = particlesGeometry.attributes.position.array[i3 + 2];
                
                // Apply wave motion
                particlesGeometry.attributes.position.array[i3 + 1] = yPos + Math.sin(elapsedTime + xPos) * 0.01;
            }
            particlesGeometry.attributes.position.needsUpdate = true;
            
            // Update morph mesh
            morphMesh.rotation.x = elapsedTime * 0.1;
            morphMesh.rotation.y = elapsedTime * 0.15;
            
            // Apply noise deformation to morphMesh
            const vertices = morphMesh.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const y = vertices[i + 1];
                const z = vertices[i + 2];
                
                // Apply simplex noise
                const noiseX = 0.5 * Math.sin(x * 0.2 + elapsedTime * 0.7);
                const noiseY = 0.5 * Math.sin(y * 0.2 + elapsedTime * 0.7);
                const noiseZ = 0.5 * Math.sin(z * 0.2 + elapsedTime * 0.7);
                
                const scale = 1.0 + 0.3 * Math.sin(elapsedTime * 0.5);
                
                vertices[i] = (x + noiseX) * scale;
                vertices[i + 1] = (y + noiseY) * scale;
                vertices[i + 2] = (z + noiseZ) * scale;
            }
            morphMesh.geometry.attributes.position.needsUpdate = true;
            
            // Update post-processing effects
            composer.render();
        }
        
        animate();

    } catch (error) { // Catch block for errors during initMainScene
        console.error("Error during Three.js initialization:", error);
        
        // --- Fallback: Hide Loading Screen --- 
        // Ensures the loading screen is hidden even if 3D setup fails
        if (loadingScreen) {
            loadingScreen.style.opacity = '0'; 
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = ''; // Ensure scrollbar is back
            }, 500); // Match fade duration
        }
        
        // Hide the 3D container as it likely didn't initialize correctly
        if (threeContainer) {
            threeContainer.style.display = 'none'; 
        }
    } 
}

// Import required libraries for post-processing
// This will be added to the HTML in the next step

