document.addEventListener('DOMContentLoaded', function() {
    // Video background effect for Intro section
    const introSection = document.getElementById('Intro');
    const videoOverlay = document.getElementById('intro-video-overlay');
    const backgroundVideo = document.querySelector('.intro-background-video');
    let videoTriggered = false;
    
    // Intersection Observer for intro section
    const introObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!videoTriggered) {
                    videoTriggered = true;
                    triggerVideoBackground();
                }
            } else {
                // Reset quand on quitte la section
                videoTriggered = false;
                const videoOverlay = document.getElementById('intro-video-overlay');
                const backgroundVideo = document.querySelector('.intro-background-video');
                const introContent = document.querySelector('.intro-content');
                const introGallery = document.querySelector('.intro-gallery');
                
                if (videoOverlay) {
                    videoOverlay.style.visibility = 'hidden';
                    videoOverlay.style.opacity = '0';
                }
                if (backgroundVideo) {
                    backgroundVideo.pause();
                    backgroundVideo.currentTime = 0;
                }
                if (introContent) {
                    introContent.classList.remove('revealed');
                }
                if (introGallery) {
                    introGallery.classList.remove('revealed');
                }
            }
        });
    }, {
        threshold: 0.3
    });
    
    if (introSection) {
        introObserver.observe(introSection);
    }
    
    // Video10 section observer
    const video10Section = document.getElementById('Video10');
    let video10Triggered = false;
    
    const video10Observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Toujours déclencher l'animation quand on arrive sur la section
                resetVideo10Animation(); // Reset d'abord
                setTimeout(() => {
                    triggerVideo10Animation();
                }, 100); // Petit délai pour le reset
            } else {
                // Reset quand on quitte la section
                resetVideo10Animation();
            }
        });
    }, {
        threshold: 0.5
    });
    
    if (video10Section) {
        video10Observer.observe(video10Section);
    }
    
    // VideosDiagonal section observer
    const videosDiagonalSection = document.getElementById('VideosDiagonal');
    
    const videosDiagonalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Démarrer les vidéos quand on arrive sur la section
                const leftVideo = document.querySelector('.diagonal-video-left');
                const rightVideo = document.querySelector('.diagonal-video-right');
                
                if (leftVideo) {
                    leftVideo.currentTime = 0;
                    leftVideo.play();
                }
                if (rightVideo) {
                    rightVideo.currentTime = 0;
                    rightVideo.play();
                }
            } else {
                // Arrêter et reset les vidéos quand on quitte la section
                const leftVideo = document.querySelector('.diagonal-video-left');
                const rightVideo = document.querySelector('.diagonal-video-right');
                
                if (leftVideo) {
                    leftVideo.pause();
                    leftVideo.currentTime = 0;
                }
                if (rightVideo) {
                    rightVideo.pause();
                    rightVideo.currentTime = 0;
                }
            }
        });
    }, {
        threshold: 0.3
    });
    
    if (videosDiagonalSection) {
        videosDiagonalObserver.observe(videosDiagonalSection);
    }
    
    function triggerVideo10Animation() {
        const video10Video = document.querySelector('.video10-background');
        const video10Text = document.querySelector('.video10-text');
        const video10Content = document.querySelector('.video10-content');
        
        if (video10Video) {
            video10Video.currentTime = 0;
            video10Video.play();
        }
        
        // Attendre que le pinceau passe (environ 2.5 secondes pour être plus rapide)
        setTimeout(() => {
            if (video10Text) {
                video10Text.classList.add('revealed');
            }
        }, 2500);
        
        // Contenu apparaît un peu après
        setTimeout(() => {
            if (video10Content) {
                video10Content.classList.add('revealed');
            }
        }, 2800);
    }
    
    function resetVideo10Animation() {
        const video10Video = document.querySelector('.video10-background');
        const video10Text = document.querySelector('.video10-text');
        const video10Content = document.querySelector('.video10-content');
        
        if (video10Video) {
            video10Video.pause();
            video10Video.currentTime = 0;
        }
        if (video10Text) {
            video10Text.classList.remove('revealed');
        }
        if (video10Content) {
            video10Content.classList.remove('revealed');
        }
    }
    
    
    function triggerVideoBackground() {
        if (!videoOverlay || !backgroundVideo) return;
        
        // Show video overlay at full opacity first
        videoOverlay.style.visibility = 'visible';
        videoOverlay.style.opacity = '1';
        videoOverlay.style.zIndex = '10';
        
        // Start background video
        backgroundVideo.currentTime = 0;
        backgroundVideo.play();
        
        // After 4 seconds, start fading to background and reveal content
        setTimeout(() => {
            // Keep video visible but move to background
            videoOverlay.style.opacity = '0.6';
            videoOverlay.style.zIndex = '1'; // Derrière le contenu mais visible
            
            // Reveal content using existing classes
            const introContent = document.querySelector('.intro-content');
            const introGallery = document.querySelector('.intro-gallery');
            
            if (introContent) {
                introContent.classList.add('revealed');
            }
            if (introGallery) {
                introGallery.classList.add('revealed');
            }
            
        }, 4000);
    }
    
    // Stripe configuration
    // IMPORTANT: Replace this with your actual Stripe publishable key
    const STRIPE_PUBLISHABLE_KEY = 'pk_test_51234567890abcdefghijklmnopqrstuvwxyzABCDEF'; // Demo key - replace with yours
    let stripe;
    
    // Initialize Stripe (only if key is provided and not demo)
    if (STRIPE_PUBLISHABLE_KEY && !STRIPE_PUBLISHABLE_KEY.includes('Demo')) {
        stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
    }
    
    // Shopping Cart functionality
    let cart = [];
    
    // Cart functions
    function updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartCountHeader = document.getElementById('cart-count-header');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartSummary = document.getElementById('cart-summary');
        const cartToggleContainer = document.querySelector('.cart-toggle-container');
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
            cartTotal.textContent = '0€';
            cartCount.textContent = '0';
            if (cartCountHeader) cartCountHeader.textContent = '0';
            if (cartSummary) cartSummary.value = '';
            
            // Hide cart button when empty
            if (cartToggleContainer) {
                cartToggleContainer.style.display = 'none';
            }
            
            // Auto-hide cart if it's open and empty
            hideCart();
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <span class="item-name">${item.service}</span>
                    <span class="item-duration">${item.duration}</span>
                    <span class="item-price">${parseInt(item.price) === 0 ? 'Sur devis' : item.price + '€'}</span>
                    <button class="remove-item" data-index="${index}">×</button>
                </div>
            `).join('');
            
            const total = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
            const hasQuoteItems = cart.some(item => parseInt(item.price) === 0);
            
            if (hasQuoteItems && total > 0) {
                cartTotal.textContent = total + '€ + devis';
            } else if (hasQuoteItems && total === 0) {
                cartTotal.textContent = 'Sur devis';
            } else {
                cartTotal.textContent = total + '€';
            }
            
            cartCount.textContent = cart.length;
            if (cartCountHeader) cartCountHeader.textContent = cart.length;
            
            if (cartSummary) {
                const summary = cart.map(item => `${item.service} (${item.duration}) - ${parseInt(item.price) === 0 ? 'Sur devis' : item.price + '€'}`).join('\\n');
                if (hasQuoteItems && total > 0) {
                    cartSummary.value = summary + '\\n\\nTotal: ' + total + '€ + prestations sur devis';
                } else if (hasQuoteItems && total === 0) {
                    cartSummary.value = summary + '\\n\\nTotal: Sur devis uniquement';
                } else {
                    cartSummary.value = summary + '\\n\\nTotal: ' + total + '€';
                }
            }
            
            // Show cart button when items are added
            if (cartToggleContainer) {
                cartToggleContainer.style.display = 'block';
            }
        }
    }
    
    // Cart toggle functions
    function showCart() {
        const cartContainer = document.getElementById('shopping-cart');
        cartContainer.style.display = 'block';
        
        // Scroll to Tarifs section where cart is located
        const tarifsSection = document.getElementById('Tarifs');
        if (tarifsSection) {
            tarifsSection.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        }
    }
    
    function hideCart() {
        const cartContainer = document.getElementById('shopping-cart');
        cartContainer.style.display = 'none';
    }
    
    function addToCart(service, duration, price) {
        cart.push({ service, duration, price });
        updateCartDisplay();
        
        // Show confirmation
        const button = event.target;
        const originalText = button.textContent;
        
        if (parseInt(price) === 0) {
            button.textContent = 'Demande ajoutée!';
            button.style.backgroundColor = '#17a2b8';
        } else {
            button.textContent = 'Ajouté!';
            button.style.backgroundColor = '#28a745';
        }
        
        setTimeout(() => {
            button.textContent = originalText;
            button.style.backgroundColor = '';
        }, 1500);
    }
    
    function removeFromCart(index) {
        cart.splice(index, 1);
        updateCartDisplay();
    }
    
    function clearCart() {
        cart = [];
        updateCartDisplay();
    }
    
    // Event listeners for book buttons
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('book-btn')) {
            const service = e.target.dataset.service;
            const duration = e.target.dataset.duration;
            const price = e.target.dataset.price;
            addToCart(service, duration, price);
        }
        
        if (e.target.classList.contains('remove-item')) {
            const index = parseInt(e.target.dataset.index);
            removeFromCart(index);
        }
    });
    
    // Clear cart button
    const clearCartBtn = document.getElementById('clear-cart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', clearCart);
    }
    
    // Proceed to booking button
    const proceedBtn = document.getElementById('proceed-booking');
    if (proceedBtn) {
        proceedBtn.addEventListener('click', function() {
            if (cart.length === 0) {
                alert('Votre panier est vide. Veuillez sélectionner au moins une séance.');
                return;
            }
            // Hide cart and scroll to contact form
            hideCart();
            document.getElementById('Contact').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Cart toggle button
    const cartToggleBtn = document.getElementById('cart-toggle');
    if (cartToggleBtn) {
        cartToggleBtn.addEventListener('click', showCart);
    }
    
    // Cart close button
    const cartCloseBtn = document.getElementById('cart-close');
    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', hideCart);
    }
    
    // Stripe payment function
    function processPayment() {
        if (cart.length === 0) {
            alert('Votre panier est vide. Veuillez sélectionner au moins une séance.');
            return;
        }
        
        // Check for quote items
        const hasQuoteItems = cart.some(item => parseInt(item.price) === 0);
        if (hasQuoteItems) {
            alert('Votre panier contient des prestations sur devis qui ne peuvent pas être payées en ligne. Veuillez utiliser "Réserver - Paiement espèces" pour soumettre votre demande.');
            return;
        }
        
        // Check if Stripe is initialized
        if (!stripe) {
            alert('Paiement temporairement indisponible. Veuillez utiliser "Réserver - Paiement espèces" pour le moment.');
            return;
        }
        
        const total = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
        const items = cart.map(item => ({
            name: item.service,
            description: `Durée: ${item.duration}`,
            amount: parseInt(item.price) * 100, // Stripe expects cents
            currency: 'eur'
        }));
        
        // Create checkout session (this would normally be done on your server)
        // For demo purposes, we'll simulate the process
        showPaymentDemo(total, items);
    }
    
    // Demo payment function (replace with actual Stripe integration)
    function showPaymentDemo(total, items) {
        const itemsList = items.map(item => `• ${item.name} (${item.description}) - ${item.amount/100}€`).join('\n');
        
        const confirmed = confirm(`🔒 DÉMONSTRATION STRIPE\n\nArticles à payer:\n${itemsList}\n\nTotal: ${total}€\n\nCliquez OK pour simuler le paiement.\n\n⚠️ Ceci est une démonstration. Aucun paiement réel ne sera effectué.`);
        
        if (confirmed) {
            // Simulate payment processing
            setTimeout(() => {
                alert('✅ Paiement simulé avec succès!\n\nVos séances ont été réservées.\nVous recevrez un email de confirmation.');
                
                // Clear cart after successful payment
                cart = [];
                updateCartDisplay();
                hideCart();
                
                // Scroll to contact form for additional details
                document.getElementById('Contact').scrollIntoView({ behavior: 'smooth' });
            }, 1500);
            
            // Show processing message
            alert('⏳ Traitement du paiement en cours...');
        }
    }
    
    // Pay now button
    const payNowBtn = document.getElementById('pay-now');
    if (payNowBtn) {
        payNowBtn.addEventListener('click', processPayment);
    }
    
    // Children's workshop dynamic pricing
    function updateChildrenPricing() {
        const childrenCount = document.getElementById('children-count');
        const childrenPrice = document.getElementById('children-price');
        const childrenBookBtn = document.getElementById('children-book-btn');
        
        if (childrenCount && childrenPrice && childrenBookBtn) {
            const count = parseInt(childrenCount.value);
            const totalPrice = count * 35;
            
            childrenPrice.textContent = totalPrice + '€';
            
            // Update button data attributes
            childrenBookBtn.setAttribute('data-service', `Atelier enfants (${count} enfant${count > 1 ? 's' : ''})`);
            childrenBookBtn.setAttribute('data-price', totalPrice.toString());
        }
    }
    
    // Children count change listener
    const childrenCountSelect = document.getElementById('children-count');
    if (childrenCountSelect) {
        childrenCountSelect.addEventListener('change', updateChildrenPricing);
        // Initialize with default value
        updateChildrenPricing();
    }
    
    // Floating navigation functionality with color adaptation
    function handleFloatingNav() {
        const floatingNav = document.getElementById('floating-nav');
        const intro = document.getElementById('Intro');
        
        if (floatingNav && intro) {
            const scrollY = window.scrollY;
            const introPosition = intro.offsetTop;
            
            // Apparaît dès qu'on arrive dans la section "Le langage de l'Art" (Intro)
            if (scrollY >= introPosition - 100) {
                floatingNav.classList.add('visible');
                
                // Adapter les couleurs selon la section visible
                adaptNavColors(floatingNav, scrollY);
            } else {
                floatingNav.classList.remove('visible');
            }
        }
    }
    
    // Fonction pour adapter les couleurs de la navigation selon la section
    function adaptNavColors(nav, scrollY) {
        const sections = [
            { id: 'Intro', colors: 'intro-colors' },
            { id: 'Description', colors: 'description-colors' },
            { id: 'VideosDiagonal', colors: 'videos-colors' },
            { id: 'Atelier', colors: 'atelier-colors' },
            { id: 'Words', colors: 'words-colors' },
            { id: 'Tarifs', colors: 'tarifs-colors' },
            { id: 'Contact', colors: 'contact-colors' }
        ];
        
        let currentSection = 'intro-colors'; // Couleur par défaut
        
        sections.forEach(section => {
            const element = document.getElementById(section.id);
            if (element) {
                const rect = element.getBoundingClientRect();
                const elementTop = rect.top + window.scrollY;
                const elementBottom = elementTop + element.offsetHeight;
                
                // Si on est dans cette section (avec une marge)
                if (scrollY >= elementTop - 200 && scrollY < elementBottom - 200) {
                    currentSection = section.colors;
                }
            }
        });
        
        // Retirer toutes les classes de couleur existantes
        nav.classList.remove('intro-colors', 'description-colors', 'videos-colors', 'atelier-colors', 'words-colors', 'tarifs-colors', 'contact-colors');
        
        // Ajouter la nouvelle classe de couleur
        nav.classList.add(currentSection);
    }
    
    // Add scroll listener for floating nav and smooth transitions
    window.addEventListener('scroll', function() {
        handleFloatingNav();
        handleSmoothTransitions();
    });
    
    // Fonction pour gérer les transitions fluides entre sections
    function handleSmoothTransitions() {
        const header = document.querySelector('header');
        const headerVideo = document.querySelector('.header-video');
        const intro = document.getElementById('Intro');
        
        if (header && headerVideo && intro) {
            const scrollY = window.scrollY;
            const headerHeight = header.offsetHeight;
            const introPosition = intro.offsetTop;
            
            // Calculer le pourcentage de scroll depuis le header vers l'intro
            const scrollProgress = Math.min(scrollY / (introPosition * 0.8), 1);
            
            // Effet parallaxe sur la vidéo
            if (scrollProgress > 0) {
                const videoTransform = scrollProgress * 20; // Déplacement subtil
                const videoOpacity = Math.max(1 - scrollProgress * 1.2, 0);
                
                headerVideo.style.transform = `translate(-50%, calc(-50% + ${videoTransform}px)) scale(${1 + scrollProgress * 0.1})`;
                headerVideo.style.opacity = videoOpacity;
            }
            
            // Effet sur l'overlay de transition du header
            const headerOverlay = header.querySelector('::after');
            if (scrollProgress > 0.3) {
                header.style.setProperty('--overlay-opacity', Math.min(scrollProgress * 1.5, 1));
            }
        }
    }
    
    
    // Variables pour le carousel
    let currentImageIndex = 0;
    const allImages = [
        { src: 'imgs2/MQ1.jpeg', alt: 'Atelier d\'art-thérapie', blur: 'face-blur-1' },
        { src: 'imgs2/MQ2.jpeg', alt: 'Séance de peinture', blur: 'face-blur-2' },
        { src: 'imgs2/MQ3.jpeg', alt: 'Création artistique', blur: 'face-blur-3' },
        { src: 'imgs2/mq4.jpeg', alt: 'Expression créative', blur: 'face-blur-4' },
        { src: 'imgs2/mq5.jpeg', alt: 'Art thérapie en groupe', blur: 'face-blur-5' },
        { src: 'imgs2/mq8.jpeg', alt: 'Méditation artistique', blur: 'face-blur-8' },
        { src: 'imgs2/mq10.jpeg', alt: 'Créativité partagée', blur: 'face-blur-10' },
        { src: 'imgs2/mq11.jpeg', alt: 'Inspiration artistique', blur: 'face-blur-11' },
        { src: 'imgs2/mq12.jpeg', alt: 'Développement créatif', blur: 'face-blur-12' },
        { src: 'imgs2/mq13.jpeg', alt: 'Expression libre', blur: 'face-blur-13' }
    ];

    // Variables pour la rotation automatique
    let autoRotateInterval;
    let isManualControl = false;

    // Fonction pour faire tourner le carousel
    window.changeSlide = function(direction) {
        const carouselImages = document.querySelectorAll('.carousel-image');
        
        // Marquer comme contrôle manuel temporairement
        isManualControl = true;
        clearInterval(autoRotateInterval);
        clearTimeout(manualOverrideTimeout);
        
        // Ajouter classe de transition
        carouselImages.forEach(img => img.classList.add('transitioning'));
        
        if (direction > 0) {
            // Rotation vers la droite - prendre la première image et la mettre à la fin
            const firstImage = carouselImages[0];
            const carouselStack = document.querySelector('.carousel-stack');
            carouselStack.appendChild(firstImage);
            
            // Mettre à jour les z-index
            updateZIndex();
        } else {
            // Rotation vers la gauche - prendre la dernière image et la mettre au début
            const lastImage = carouselImages[carouselImages.length - 1];
            const carouselStack = document.querySelector('.carousel-stack');
            carouselStack.insertBefore(lastImage, carouselImages[0]);
            
            // Mettre à jour les z-index
            updateZIndex();
        }
        
        // Retirer classe de transition après animation
        setTimeout(() => {
            carouselImages.forEach(img => img.classList.remove('transitioning'));
        }, 1500);
        
        // Reprendre la rotation automatique après 3 secondes
        manualOverrideTimeout = setTimeout(() => {
            isManualControl = false;
            startAutoRotation();
        }, 3000);
    };

    // Fonction pour rotation automatique
    function autoRotate() {
        const carouselImages = document.querySelectorAll('.carousel-image');
        const firstImage = carouselImages[0];
        const carouselStack = document.querySelector('.carousel-stack');
        
        // Ajouter classe de transition douce pour auto-rotation
        carouselImages.forEach(img => img.classList.add('transitioning'));
        
        carouselStack.appendChild(firstImage);
        updateZIndex();
        
        // Retirer classe de transition
        setTimeout(() => {
            carouselImages.forEach(img => img.classList.remove('transitioning'));
        }, 1500);
    }

    // Fonction pour démarrer la rotation automatique
    function startAutoRotation() {
        clearInterval(autoRotateInterval);
        autoRotateInterval = setInterval(autoRotate, 4000); // Rotation continue toutes les 4 secondes
    }

    // Fonction pour mettre à jour les z-index après rotation
    function updateZIndex() {
        const carouselImages = document.querySelectorAll('.carousel-image');
        carouselImages.forEach((image, index) => {
            image.style.zIndex = carouselImages.length - index;
        });
    }

    // Démarrer la rotation automatique immédiatement
    let manualOverrideTimeout;
    startAutoRotation();
    
    // Lightbox functionality
    const lightboxOverlay = document.getElementById('image-lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxClose = document.getElementById('lightbox-close');
    
    // Function to open lightbox
    function openLightbox(imageSrc, imageAlt, blurClass) {
        lightboxImage.src = imageSrc;
        lightboxImage.alt = imageAlt;
        lightboxOverlay.style.display = 'flex';
        
        // Apply face blur if needed
        const lightboxBlur = document.getElementById('lightbox-blur');
        if (lightboxBlur) {
            // Reset all blur classes
            lightboxBlur.className = 'lightbox-face-blur';
            
            // Add specific blur class if provided
            if (blurClass) {
                lightboxBlur.classList.add(blurClass);
            }
        }
        
        // Small delay to trigger transition
        setTimeout(() => {
            lightboxOverlay.classList.add('show');
        }, 10);
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }
    
    // Function to close lightbox
    function closeLightbox() {
        lightboxOverlay.classList.remove('show');
        
        setTimeout(() => {
            lightboxOverlay.style.display = 'none';
            lightboxImage.src = '';
        }, 300);
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
    
    // Event listeners for lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    // Close lightbox when clicking on overlay background
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', function(e) {
            if (e.target === lightboxOverlay) {
                closeLightbox();
            }
        });
    }
    
    // Close lightbox with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && lightboxOverlay.classList.contains('show')) {
            closeLightbox();
        }
    });
    
    // Add click event to all carousel images
    const carouselImages = document.querySelectorAll('.gallery-image');
    carouselImages.forEach(image => {
        image.addEventListener('click', function() {
            // Find the blur element in the same container to get the blur class
            const parentItem = this.closest('.gallery-item');
            const blurElement = parentItem ? parentItem.querySelector('.face-blur') : null;
            
            let blurClass = null;
            if (blurElement) {
                // Extract the face-blur class (face-blur-1, face-blur-2, etc.)
                const classes = blurElement.className.split(' ');
                blurClass = classes.find(cls => cls.startsWith('face-blur-') && cls !== 'face-blur');
            }
            
            openLightbox(this.src, this.alt, blurClass);
        });
    });
    
    // Add click handlers for floating nav links
    const floatingNavLinks = document.querySelectorAll('.floating-nav-menu a');
    floatingNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#Home') {
                // Ramener vers le haut du site
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } else if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
    
    // Système d'animation indépendant pour chaque section
    const sectionObserverOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -100px 0px'
    };

    // Observer pour les sections principales
    const sectionObserver = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            } else {
                // Réinitialiser l'animation quand on quitte la section
                entry.target.classList.remove('revealed');
            }
        });
    }, sectionObserverOptions);

    // Observer toutes les sections avec animations indépendantes
    const sectionsToObserve = document.querySelectorAll('#Intro .intro-content, #VideosDiagonal, #Atelier, #Galerie, #Tarifs, #Contact');
    sectionsToObserve.forEach(section => {
        sectionObserver.observe(section);
    });

    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    const tables = document.querySelectorAll('table tr');
    tables.forEach((row, index) => {
        row.style.animationDelay = `${index * 0.1}s`;
        row.addEventListener('mouseenter', function() {
            this.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            this.style.transform = 'scale(1.02)';
        });
        row.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
            this.style.transform = 'scale(1)';
        });
    });

    // Interactive links functionality
    const interactiveLinks = document.querySelectorAll('.interactive-link');
    interactiveLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('data-target');
            
            if (targetId) {
                // First scroll to the Tarifs section
                const tarifsSection = document.getElementById('Tarifs');
                if (tarifsSection) {
                    tarifsSection.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Then highlight the specific row after scrolling
                    setTimeout(() => {
                        const targetRow = document.getElementById(targetId + '-row');
                        if (targetRow) {
                            // Add highlight effect
                            targetRow.classList.add('highlighted-row');
                            
                            // Scroll to the specific row
                            targetRow.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                            
                            // Remove highlight after 3 seconds
                            setTimeout(() => {
                                targetRow.classList.remove('highlighted-row');
                            }, 3000);
                        }
                    }, 800);
                }
            }
        });
    });
});