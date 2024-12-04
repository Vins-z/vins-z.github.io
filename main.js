// Loading Screen Setup
const loadingScreen = document.createElement('div');
loadingScreen.id = 'loading-screen';
loadingScreen.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(255, 255, 255, 0.9);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    transition: opacity 0.5s ease;
    transition-delay: 0.5s;
`;

const loadingCanvas = document.createElement('canvas');
loadingCanvas.id = 'loading-canvas';
loadingCanvas.style.width = '100%';
loadingCanvas.style.height = '100%';
loadingScreen.appendChild(loadingCanvas);
document.body.appendChild(loadingScreen);

// Three.js Loading Screen Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ canvas: loadingCanvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Create wireframe torus for loading screen
const loadingTorus1 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 1, 11, 12),
    new THREE.MeshBasicMaterial({
        color: "black",
        wireframe: true,
        transparent: true,
        opacity: 0.1
    })
);
const loadingTorus2 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 1, 11, 12),
    new THREE.MeshBasicMaterial({
        color: "black",
        wireframe: true,
        transparent: true,
        opacity: 0.1
    })
);
const loadingTorus3 = new THREE.Mesh(
    new THREE.TorusGeometry(1, 1, 11, 12),
    new THREE.MeshBasicMaterial({
        color: "black",
        wireframe: true,
        transparent: true,
        opacity: 0.1
    })
);
scene.add(loadingTorus1);
scene.add(loadingTorus2);
scene.add(loadingTorus3);

// Animate loading screen
function loadingAnimate() {
    loadingTorus1.rotation.x += 0.0035;
    loadingTorus2.rotation.y += 0.0035;
    loadingTorus3.rotation.z += 0.0035;

    renderer.render(scene, camera);
    requestAnimationFrame(loadingAnimate);
}
loadingAnimate();

document.addEventListener('DOMContentLoaded', () => {
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        loadingScreen.style.transition = 'opacity 0.7s ease-out';
        loadingScreen.style.opacity = 0;
        setTimeout(() => {
            loadingScreen.style.display = 'none';
            document.body.style.overflow = '';
        }, 300);
    }, 2700); 

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

    // Resume button touch listener
    const resumeBtn = document.getElementById('resumeBtn');
    resumeBtn.addEventListener('touchstart', function() {
        gtag('event', 'resume_download', {
            'event_category': 'Resume',
            'event_label': 'Resume Download'
        });
    });

    // GitHub link button touch listener
    const githubBtn = document.getElementById('githubBtn');
    githubBtn.addEventListener('touchstart', function() {
        gtag('event', 'github_click', {
            'event_category': 'GitHub',
            'event_label': 'GitHub Link Click'
        });
    });

    // View projects button touch listener
    const viewProjectsBtn = document.getElementById('viewProjectsBtn');
    viewProjectsBtn.addEventListener('touchstart', function() {
        gtag('event', 'view_projects', {
            'event_category': 'Projects',
            'event_label': 'View Projects Click'
        });
    });

    // Smooth scroll for View Projects button
    viewProjectsBtn.addEventListener('click', function(e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });

    // Ensure links open correctly on touch devices
    resumeBtn.addEventListener('click', function(e) {
        if (e.type === 'touchstart') {
            window.open(this.href, '_blank');
        }
    });

    githubBtn.addEventListener('click', function(e) {
        if (e.type === 'touchstart') {
            window.open(this.href, '_blank');
        }
    });

    // Scroll animations
    const projectCards = document.querySelectorAll('.project-card');

    const observerOptions = {
        threshold: 0.2
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    projectCards.forEach(card => {
        observer.observe(card);
    });

    // Smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Intersection Observer for fade-in effect
    const observer2 = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.skill-item, .project-item, .interest-item, .education-item').forEach(item => {
        observer2.observe(item);
    });

    const modal = document.getElementById('projectModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalDescription = document.getElementById('modalDescription');
    const closeBtn = document.getElementsByClassName('close')[0];

    // Get all project items
    const projectItems = document.querySelectorAll('.project-item, .education-item');

    // Add click event listener to each project item
    projectItems.forEach(item => {
        item.addEventListener('click', () => {
            modalTitle.textContent = item.querySelector('h3').textContent;
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

    // Three.js Scene Setup
    const container = document.getElementById('cube-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true });

    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create abstract shapes
    const geometry1 = new THREE.TorusGeometry(3.5, 3.5, 35, 35);
    const material1 = new THREE.MeshBasicMaterial({
        color: "#666666",
        wireframe: true,
        transparent: true,
        opacity: 0.05
    });
    const torus = new THREE.Mesh(geometry1, material1);
    scene.add(torus);

    const geometry2 = new THREE.TorusGeometry(3.5, 3.5, 35, 35);
    const material2 = new THREE.MeshBasicMaterial({
        color: "#666666",
        wireframe: true,
        transparent: true,
        opacity: 0.05
    });
    const torus2 = new THREE.Mesh(geometry2, material2);
    scene.add(torus2);

    const geometry3 = new THREE.TorusGeometry(3.5, 3.5, 35, 35);
    const material3 = new THREE.MeshBasicMaterial({
        color: "#666666",
        wireframe: true,
        transparent: true,
        opacity: 0.05

    });
    const torus3 = new THREE.Mesh(geometry3, material3);
    scene.add(torus3)

    camera.position.z = 15;

    // Animation
    function animate() {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
    }
    animate();

    // Handle window resize
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    });

    // Handle scroll events
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        torus.position.z = +scrollTop * 0.0054;
        torus2.position.z = +scrollTop * 0.0054;
        torus3.position.z = +scrollTop * 0.0054;
        });

    // Blur toruses on mobile site
    window.addEventListener('touchmove', (event) => {
        touchEnd = event.touches[0].clientY;
        if (touchEnd - touchStart > 0) {
            torus.material.opacity = 0.1;
            torus2.material.opacity = 0.1;
            torus3.material.opacity = 0.1;
        } else {
            torus.material.opacity = 0.2;
            torus2.material.opacity = 0.2;
            torus3.material.opacity = 0.2;
        }
    });
    // Handle mouse move events
    window.addEventListener('mousemove', (event) => {
    const x = event.clientX / window.innerWidth - 0.5;
    const y = event.clientY / window.innerHeight - 0.5;
        camera.lookAt(scene.position);
        });
    });
    // Handle mobile device object resize
    window.addEventListener('resize', () => {
        const scaleFactor = Math.min(window.innerWidth / 1920, 1); // Auto scale based on window width, max scale is 1

        // Scale objects based on scaleFactor
        torus.scale.set(scaleFactor, scaleFactor, scaleFactor);
        torus2.scale.set(scaleFactor, scaleFactor, scaleFactor);
        torus3.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Adjust positions for better view
        torus.position.y = 2 * scaleFactor;
        torus2.position.y = 0;
        torus3.position.y = -2 * scaleFactor;

        // Adjust rotation speed based on scaleFactor
        torus.rotation.x = 0.005 * scaleFactor;
        torus2.rotation.y = -0.005 * scaleFactor;
        torus3.rotation.z = 0.005 * scaleFactor;

        // Adjust camera settings
        camera.position.z = 5 + (3 * (1 - scaleFactor)); // Closer for smaller screens
        camera.fov = 75 - (15 * (1 - scaleFactor)); // Wider field of view for smaller screens
        camera.updateProjectionMatrix();

        // Force renderer update
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.render(scene, camera);
    });

    // Initial check on load
    window.dispatchEvent(new Event('resize'));
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) { // Adjust the scroll value as needed
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

