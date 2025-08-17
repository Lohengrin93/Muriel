document.addEventListener('DOMContentLoaded', function() {
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
        nav.classList.remove('intro-colors', 'atelier-colors', 'words-colors', 'tarifs-colors', 'contact-colors');
        
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
    
    
    // Accélérer la vidéo intro
    const introVideo = document.getElementById('intro-video');
    if (introVideo) {
        introVideo.playbackRate = 1.5; // Accélère la vidéo de 1.5x
        
        // S'assurer que la vidéo tourne en boucle
        introVideo.addEventListener('ended', function() {
            this.currentTime = 0;
            this.play();
        });
    }
    
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
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    const elementsToAnimate = document.querySelectorAll('#Atelier, #Words, #Tarifs, #Contact');
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(50px)';
        el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(el);
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
});