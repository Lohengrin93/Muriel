document.addEventListener('DOMContentLoaded', function() {
    // Shopping Cart functionality
    let cart = [];
    
    // Cart functions
    function updateCartDisplay() {
        const cartCount = document.getElementById('cart-count');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartSummary = document.getElementById('cart-summary');
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p class="empty-cart">Votre panier est vide</p>';
            cartTotal.textContent = '0€';
            cartCount.textContent = '0';
            if (cartSummary) cartSummary.value = '';
        } else {
            cartItems.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <span class="item-name">${item.service}</span>
                    <span class="item-duration">${item.duration}</span>
                    <span class="item-price">${item.price}€</span>
                    <button class="remove-item" data-index="${index}">×</button>
                </div>
            `).join('');
            
            const total = cart.reduce((sum, item) => sum + parseInt(item.price), 0);
            cartTotal.textContent = total + '€';
            cartCount.textContent = cart.length;
            
            if (cartSummary) {
                const summary = cart.map(item => `${item.service} (${item.duration}) - ${item.price}€`).join('\\n');
                cartSummary.value = summary + '\\n\\nTotal: ' + total + '€';
            }
        }
    }
    
    function addToCart(service, duration, price) {
        cart.push({ service, duration, price });
        updateCartDisplay();
        
        // Show confirmation
        const button = event.target;
        const originalText = button.textContent;
        button.textContent = 'Ajouté!';
        button.style.backgroundColor = '#28a745';
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
            // Scroll to contact form
            document.getElementById('Contact').scrollIntoView({ behavior: 'smooth' });
        });
    }
    
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