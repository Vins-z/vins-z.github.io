let touchStart;
let touchEnd;
let backgroundScene, backgroundCamera, backgroundRenderer, backgroundComposer;
let isMobile = false;
let globalThreeContainer;

let camera;
let renderer;
let composer;
let mouseX = 0;
let mouseY = 0;
let targetMouseX = 0;
let targetMouseY = 0;
let trails = [];
let trailPointsCount;
let morphMesh;
let fluidMesh;
let fluidMaterial;
let scene;
let pointLight1;
let pointLight2;

function checkMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;
}

document.addEventListener('DOMContentLoaded', () => {
    isMobile = checkMobile();
    
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

    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
        }
    `;
    document.head.appendChild(style);

    document.body.style.backgroundColor = '#000000';
    
    initMainScene(loadingScreen, isMobile);
    
    const cubeContainer = document.getElementById('cube-container');
    if (cubeContainer) {
        cubeContainer.style.opacity = isMobile ? '0.4' : '1';
        globalThreeContainer = cubeContainer;
    }
    
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        if (loadingScreen) {
            loadingScreen.style.opacity = 0;
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = '';
                
                setTimeout(() => {
                    const typedText = document.querySelector('.typed-text');
                    if (typedText) {
                        typedText.style.borderRight = 'none';
                    }
                }, 3500);
            }, 500);
        }
    }, 2000);

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

    const resumeBtn = document.getElementById('resumeBtn');
    const githubBtn = document.getElementById('githubBtn');
    const viewProjectsBtn = document.getElementById('viewProjectsBtn');

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

    const fadeElements = document.querySelectorAll('.skill-item, .project-item, .interest-item, .education-item');
    const sectionTitles = document.querySelectorAll('.section h2');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries, observer) => {
        let delay = 0;
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                if (entry.target.tagName === 'H2') {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                    return;
                }
                
                const gridItem = entry.target;
                const grid = gridItem.closest('.skill-list, .project-list, .interest-list, .education-list');
                if (grid) {
                    const items = Array.from(grid.children);
                    const itemIndex = items.indexOf(gridItem);
                    const directionClass = itemIndex % 2 === 0 ? 'slide-in-left' : 'slide-in-right';
                    gridItem.classList.add(directionClass);
                }
                
                setTimeout(() => {
                    gridItem.classList.add('visible');
                }, delay);
                delay += 100;
                
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

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeBtn = document.getElementsByClassName('close')[0];

    const modalItems = document.querySelectorAll('.project-item, .education-item, .skill-item, .interest-item');

    modalItems.forEach(item => {
        item.addEventListener('click', () => {
            const titleElement = item.querySelector('h3') || item.querySelector('.skill-text') || item.querySelector('.interest-text');
            
            modalTitle.textContent = titleElement.textContent;
            modalDescription.innerHTML = item.dataset.description.replace(/\n/g, '<br>');
            modal.classList.add('show');
            setTimeout(() => {
                modal.querySelector('.modal-content').classList.add('show');
            }, 100);
        });
    });

    closeBtn.addEventListener('click', () => {
        modal.querySelector('.modal-content').classList.remove('show');
        setTimeout(() => {
            modal.classList.remove('show');
        }, 300);
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.querySelector('.modal-content').classList.remove('show');
            setTimeout(() => {
                modal.classList.remove('show');
            }, 300);
        }
    });

    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    const backToTopButton = document.querySelector('.back-to-top');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    });

    let lastScrollY = 0;
    let scrollSpeed = 0;
    const maxScrollSpeedEffect = 0.005;

    window.addEventListener('scroll', () => {
        scrollSpeed = Math.abs(scrollY - lastScrollY);
        lastScrollY = scrollY;
    });

    if (isMobile) {
        const animatedElements = document.querySelectorAll('.skill-item, .project-item, .interest-item, .education-item');
        animatedElements.forEach(el => {
            el.style.transform = 'none';
            el.style.transition = 'opacity 0.5s ease';
        });
    }

    if (isMobile) {
        document.addEventListener('touchstart', function(e) {
            touchStart = e.touches[0].clientY;
        }, { passive: true });
        
        document.addEventListener('touchmove', function(e) {
            touchEnd = e.touches[0].clientY;
        }, { passive: true });
    }
    
    if (isMobile) {
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.width = '95%';
            modalContent.style.maxHeight = '80vh';
        }
    }

    document.addEventListener('mousemove', (event) => {
        targetMouseX = (event.clientX / window.innerWidth) * 0.5 - 1;
        targetMouseY = (event.clientY / window.innerHeight) * 0.2 - 1;
    });
});

function initMainScene(loadingScreen, isMobile) {
    try {
        const threeContainer = document.getElementById('cube-container');
        globalThreeContainer = threeContainer;
        
        if (!threeContainer) {
            console.error("Three.js container (#cube-container) not found!");
            throw new Error("Missing 3D container");
        }

        const useSimpleRendering = isMobile;
        
        scene = new THREE.Scene();
        
        camera = new THREE.PerspectiveCamera(
            60, 
            window.innerWidth / window.innerHeight, 
            0.1, 
            1000
        );
        camera.position.set(0, 0, 40);
        
        let targetZoom = 40;
        let currentZoom = 40;
        const maxZoom = 5;
        const scrollZoomFactor = 0.1;
        
        renderer = new THREE.WebGLRenderer({ 
            antialias: !useSimpleRendering,
            alpha: true,
            powerPreference: "high-performance"
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, useSimpleRendering ? 1.5 : 4));
        renderer.setClearColor(0x000000, 0);
        renderer.outputEncoding = THREE.sRGBEncoding;
        threeContainer.appendChild(renderer.domElement);

        if (!useSimpleRendering) {
            composer = new THREE.EffectComposer(renderer);
            const renderPass = new THREE.RenderPass(scene, camera);
            composer.addPass(renderPass);
            
            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                0.6,
                0.4,
                0.85
            );
            composer.addPass(bloomPass);
        }
        
        pointLight1 = new THREE.PointLight(0xCCCCCC, 1, 100);
        pointLight1.position.set(10, 10, 10);
        scene.add(pointLight1);
        
        pointLight2 = new THREE.PointLight(0xAAAAAA, 0.8, 100);
        pointLight2.position.set(-10, -5, 10);
        scene.add(pointLight2);
        
        const fluidGeometry = new THREE.PlaneGeometry(40, 40, 256, 256);
        fluidMaterial = new THREE.ShaderMaterial({
            vertexShader: `
                uniform float uTime;
                uniform float uNoiseStrength;
                uniform float uWaveHeight;
                
                varying vec2 vUv;
                varying float vElevation;
                
                vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
                vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
                
                float snoise(vec3 v) {
                    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
                    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
                    
                    vec3 i  = floor(v + dot(v, C.yyy));
                    vec3 x0 = v - i + dot(i, C.xxx);
                    
                    vec3 g = step(x0.yzx, x0.xyz);
                    vec3 l = 1.0 - g;
                    vec3 i1 = min(g.xyz, l.zxy);
                    vec3 i2 = max(g.xyz, l.zxy);
                    
                    vec3 x1 = x0 - i1 + C.xxx;
                    vec3 x2 = x0 - i2 + C.yyy;
                    vec3 x3 = x0 - 1.0 + vec3(C.x + C.y, C.x + C.y, C.x + C.y);
                    
                    i = mod(i, 289.0);
                    vec4 p = permute(permute(permute(
                              vec4(i.z, i1.z, i2.z, 1.0)) +
                              vec4(i.y, i1.y, i2.y, 1.0)) +
                              vec4(i.x, i1.x, i2.x, 1.0));
                              
                    float n_ = 1.0/7.0;
                    vec3 ns = n_ * D.wyz - D.xzx;
                    
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
                    
                    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
                    p0 *= norm.x;
                    p1 *= norm.y;
                    p2 *= norm.z;
                    p3 *= norm.w;
                    
                    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
                    m = m * m;
                    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
                }
                
                void main() {
                    vUv = uv;
                    
                    float noise1 = snoise(vec3(position.x * 0.3, position.y * 0.3, uTime * 0.2)) * uNoiseStrength;
                    float noise2 = snoise(vec3(position.x * 0.5, position.y * 0.5, uTime * 0.15 + 100.0)) * uNoiseStrength * 0.5;
                    float noise3 = snoise(vec3(position.x * 0.2, position.y * 0.2, uTime * 0.1 + 200.0)) * uNoiseStrength * 0.3;
                    
                    float elevation = 
                        sin(position.x * 0.2 + uTime * 0.7) * sin(position.y * 0.2) * uWaveHeight * 0.5 +
                        sin(position.x * 0.1 - uTime * 0.5) * sin(position.y * 0.3 + uTime * 0.2) * uWaveHeight * 0.3 +
                        noise1 + noise2 + noise3;
                    
                    vElevation = elevation;
                    
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
                    float gradient = smoothstep(-0.5, 2.0, vElevation);
                    
                    vec3 mixedColor = mix(
                        uBaseColor, 
                        uHighlightColor, 
                        gradient + 0.3 * sin(uTime * 0.5)
                    );
                    
                    float pattern = 0.03 * sin((vUv.x * 20.0) + (vUv.y * 20.0) + uTime * 2.0);
                    
                    float alpha = 0.1 + 0.3 * gradient + pattern;
                    gl_FragColor = vec4(mixedColor, alpha);
                }
            `,
            uniforms: {
                uTime: { value: 0 },
                uNoiseStrength: { value: 0.5 },
                uWaveHeight: { value: 0.2 },
                uBaseColor: { value: new THREE.Color(0x444444) },
                uHighlightColor: { value: new THREE.Color(0x888888) }
            },
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        
        fluidMesh = new THREE.Mesh(fluidGeometry, fluidMaterial);
        fluidMesh.rotation.x = -Math.PI * 0.01;
        fluidMesh.position.set(0, -2, 0);
        scene.add(fluidMesh);
        
        const trailsCount = 10;
        trailPointsCount = 100;
        trails = [];
        
        for (let i = 0; i < trailsCount; i++) {
            const trailGeometry = new THREE.BufferGeometry();
            const positions = new Float32Array(trailPointsCount * 3);
            const opacities = new Float32Array(trailPointsCount);
            
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
                        float strength = 1.0 - length(gl_PointCoord - vec2(0.5)) * 2.0;
                        strength = max(0.0, strength);
                        
                        vec3 color = mix(
                            vec3(0.5, 0.5, 0.5),
                            vec3(0.8, 0.8, 0.8),
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
            
            trails.push({
                mesh: trail,
                positions: positions,
                opacities: opacities,
                angle: angle,
                radius: radius,
                speed: 0.01 + Math.random() * 0.03,
                centerX: centerX,
                centerY: centerY
            });
        }
        
        const morphGeometry = new THREE.IcosahedronGeometry(5, 5);
        const morphMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xCCCCCC,
            roughness: 0.2,
            metalness: 0.7,
            wireframe: true,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        morphMesh = new THREE.Mesh(morphGeometry, morphMaterial);
        scene.add(morphMesh);
        
        document.addEventListener('touchmove', (event) => {
            if (event.touches.length > 0) {
                targetMouseX = (event.touches[0].clientX / window.innerWidth) * 0.5 - 1;
                targetMouseY = (event.touches[0].clientY / window.innerHeight) * 0.2 - 1;
                
                if (renderer && event.target === renderer.domElement) {
                    event.preventDefault();
                }
            }
        }, { passive: false });
        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, useSimpleRendering ? 1.5 : 4));
            
            if (composer) {
                composer.setSize(window.innerWidth, window.innerHeight);
            }
        });
        
        let scrollY = 0;
        let currentSection = 0;
        let maxScrollForZoom = 1000;
        let lastScrollY_3D = 0;
        let scrollSpeed_3D = 0;
        const maxScrollSpeedEffect = 0.005;

        const navbar = document.querySelector('.navbar');
        const backToTopButton = document.querySelector('.back-to-top');

        function handleScroll() {
            scrollY = window.scrollY;
            
            if (navbar) {
                if (scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }
            
            if (backToTopButton) {
                if (scrollY > 300) {
                    backToTopButton.classList.add('visible');
                } else {
                    backToTopButton.classList.remove('visible');
                }
            }

            maxScrollForZoom = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = Math.max(0, Math.min(scrollY / maxScrollForZoom, 1));
            targetZoom = 40 - (40 - maxZoom) * 0.5* scrollProgress;
            
            scrollSpeed_3D = Math.abs(scrollY - lastScrollY_3D);
            lastScrollY_3D = scrollY;
            
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

        window.addEventListener('scroll', handleScroll, { passive: true });

        handleScroll(); 
        
        const clock = new THREE.Clock();
        
        function animate() {
            requestAnimationFrame(animate);
            
            const elapsedTime = clock.getElapsedTime();
            const deltaTime = clock.getDelta();
            
            currentZoom += (targetZoom - currentZoom) * 0.03;
            camera.position.z = currentZoom;
            
            camera.position.x = Math.sin(elapsedTime * 0.2) * 1.5;
            camera.position.y = Math.cos(elapsedTime * 0.15) * 1.5;
            
            const scrollEffectRotation = Math.min(scrollSpeed_3D * 0.00002, maxScrollSpeedEffect);
            scene.rotation.y += scrollEffectRotation;

            if (scrollSpeed_3D > 0) {
                scrollSpeed_3D *= 0.95;
            } else {
                if (Math.abs(scene.rotation.y) > 0.0001) {
                     scene.rotation.y += (0 - scene.rotation.y) * 0.001;
                }
            }
            
            fluidMaterial.uniforms.uTime.value = elapsedTime;
            
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;
            
            fluidMesh.rotation.x = -Math.PI * 0.45 + mouseY * 0.1;
            fluidMesh.rotation.y = mouseX * 0.01;
            fluidMesh.rotation.z = mouseX * mouseY * 0.01;
            
            pointLight1.position.x = Math.sin(elapsedTime * 0.5) * 15;
            pointLight1.position.y = Math.cos(elapsedTime * 0.3) * 15;
            
            pointLight2.position.x = Math.sin(elapsedTime * 0.4 + Math.PI) * 15;
            pointLight2.position.y = Math.cos(elapsedTime * 0.2 + Math.PI) * 15;
            
            const intensity1 = 0.5 + 0.3 * Math.sin(elapsedTime * 0.05);
            const intensity2 = 0.5 + 0.3 * Math.sin((elapsedTime * 0.05) + Math.PI);
            
            pointLight1.color.setRGB(intensity1, intensity1, intensity1);
            pointLight2.color.setRGB(intensity2, intensity2, intensity2);
            
            const baseIntensity = 0.2 + 0.2 * Math.sin(elapsedTime * 0.05);
            const highlightIntensity = 0.5 + 0.3 * Math.sin((elapsedTime * 0.05) + Math.PI);
            
            fluidMaterial.uniforms.uBaseColor.value.setRGB(baseIntensity, baseIntensity, baseIntensity);
            fluidMaterial.uniforms.uHighlightColor.value.setRGB(highlightIntensity, highlightIntensity, highlightIntensity);
            
            trails.forEach(trail => {
                const positions = trail.positions;
                const opacities = trail.opacities;
                
                trail.angle += trail.speed;
                
                for (let i = trailPointsCount - 1; i > 0; i--) {
                    positions[i * 3] = positions[(i - 1) * 3];
                    positions[i * 3 + 1] = positions[(i - 1) * 3 + 1];
                    positions[i * 3 + 2] = positions[(i - 1) * 3 + 2];
                    opacities[i] = opacities[i - 1] * 0.98;
                }
                
                positions[0] = trail.centerX + Math.cos(trail.angle) * trail.radius;
                positions[1] = trail.centerY + Math.sin(trail.angle) * trail.radius;
                positions[2] = Math.sin(elapsedTime * 0.5 + trail.angle) * 2;
                opacities[0] = 1.0;
                
                trail.mesh.geometry.attributes.position.needsUpdate = true;
                trail.mesh.geometry.attributes.opacity.needsUpdate = true;
            });
            
            morphMesh.rotation.x = elapsedTime * 0.1;
            morphMesh.rotation.y = elapsedTime * 0.15;
            
            const vertices = morphMesh.geometry.attributes.position.array;
            for (let i = 0; i < vertices.length; i += 3) {
                const x = vertices[i];
                const y = vertices[i + 1];
                const z = vertices[i + 2];
                
                const noiseX = 0.5 * Math.sin(x * 0.2 + elapsedTime * 0.7);
                const noiseY = 0.5 * Math.sin(y * 0.2 + elapsedTime * 0.7);
                const noiseZ = 0.5 * Math.sin(z * 0.2 + elapsedTime * 0.7);
                
                const scale = 1.0 + 0.3 * Math.sin(elapsedTime * 0.5);
                
                vertices[i] = (x + noiseX) * scale;
                vertices[i + 1] = (y + noiseY) * scale;
                vertices[i + 2] = (z + noiseZ) * scale;
            }
            morphMesh.geometry.attributes.position.needsUpdate = true;
            
            if (useSimpleRendering) {
                renderer.render(scene, camera);
            } else {
                composer.render();
            }
        }
        
        animate();

    } catch (error) {
        console.error("Error during Three.js initialization:", error);
        
        if (loadingScreen) {
            loadingScreen.style.opacity = '0'; 
            setTimeout(() => {
                if (loadingScreen) loadingScreen.style.display = 'none';
                document.body.style.overflow = '';
            }, 500);
        }
        
        if (threeContainer) {
            threeContainer.innerHTML = '';
        }
    } 
}

