// js/script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variables & Cart Initialization ---
    let cart = JSON.parse(localStorage.getItem('ecoShopCart')) || [];

    // --- DOM Elements ---
    const cartCountElement = document.getElementById('cart-count');
    const featuredProductGrid = document.getElementById('featured-product-grid');
    const allProductGrid = document.getElementById('all-product-grid');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const cartSummaryContainer = document.getElementById('cart-summary-container');
    const contactForm = document.getElementById('contactForm');
    const loadingProductsMessage = document.getElementById('loading-products');


    // --- Helper Functions ---
    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (cartCountElement) {
            cartCountElement.textContent = totalItems;
        }
    };

    const saveCart = () => {
        localStorage.setItem('ecoShopCart', JSON.stringify(cart));
        updateCartCount();
    };

    const getProductById = (id) => {
        return products.find(product => product.id === parseInt(id));
    };

    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        document.body.appendChild(toast);

        // Basic toast styling (add to style.css or inline for simplicity here)
        toast.style.position = 'fixed';
        toast.style.bottom = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.padding = '10px 20px';
        toast.style.backgroundColor = type === 'success' ? 'var(--primary-color)' : 'var(--danger-color)';
        if(type === 'error') toast.style.backgroundColor = '#f44336';
        toast.style.color = 'white';
        toast.style.borderRadius = 'var(--border-radius)';
        toast.style.boxShadow = 'var(--box-shadow)';
        toast.style.zIndex = '2000';
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s ease';

        setTimeout(() => { toast.style.opacity = '1'; }, 10); // Fade in
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300); // Fade out and remove
        }, 3000);
    };

    // --- Product Display Functions ---
    const createProductCard = (product) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p class="price">$${product.price.toFixed(2)}</p>
            <p class="description" style="font-size: 0.9em; color: #666; margin-bottom: 1rem; flex-grow: 1;">${product.description.substring(0,100)}...</p>
            <button class="btn add-to-cart-btn" data-product-id="${product.id}">Add to Cart</button>
        `;
        return card;
    };

    const displayProducts = (productsToDisplay, containerElement, limit = productsToDisplay.length) => {
        if (!containerElement) return;
        containerElement.innerHTML = ''; // Clear previous content or loading message
        
        if(loadingProductsMessage && containerElement === allProductGrid) loadingProductsMessage.style.display = 'none';

        productsToDisplay.slice(0, limit).forEach(product => {
            const card = createProductCard(product);
            containerElement.appendChild(card);
        });

        // Add event listeners to new "Add to Cart" buttons
        containerElement.querySelectorAll('.add-to-cart-btn').forEach(button => {
            button.addEventListener('click', handleAddToCart);
        });
    };

    // --- Cart Functions ---
    const handleAddToCart = (event) => {
        const productId = event.target.dataset.productId;
        const product = getProductById(productId);

        if (product) {
            const cartItem = cart.find(item => item.id === product.id);
            if (cartItem) {
                cartItem.quantity++;
            } else {
                cart.push({ ...product, quantity: 1 });
            }
            saveCart();
            showToast(`${product.name} added to cart!`);
            if (cartItemsContainer) displayCartItems(); // Re-render cart if on cart page
        }
    };

    const displayCartItems = () => {
        if (!cartItemsContainer) return;

        if (cart.length === 0) {
            if (emptyCartMessage) emptyCartMessage.style.display = 'block';
            cartItemsContainer.innerHTML = ''; // Clear any table structure
             // Ensure the table structure is removed if it was there
            const existingTable = cartItemsContainer.querySelector('.cart-table');
            if (existingTable) existingTable.remove();
            cartItemsContainer.appendChild(emptyCartMessage); // Re-append if cleared

            if (cartSummaryContainer) cartSummaryContainer.style.display = 'none';
            return;
        }

        if (emptyCartMessage) emptyCartMessage.style.display = 'none';
        if (cartSummaryContainer) cartSummaryContainer.style.display = 'block';

        let tableHTML = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Product</th>
                        <th>Name</th>
                        <th>Price</th>
                        <th>Quantity</th>
                        <th>Subtotal</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        let total = 0;
        cart.forEach(item => {
            const subtotal = item.price * item.quantity;
            total += subtotal;
            tableHTML += `
                <tr>
                    <td><img src="${item.image}" alt="${item.name}"></td>
                    <td>${item.name}</td>
                    <td>$${item.price.toFixed(2)}</td>
                    <td class="cart-item-actions">
                        <button class="quantity-change" data-product-id="${item.id}" data-change="-1">-</button>
                        <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-product-id="${item.id}">
                        <button class="quantity-change" data-product-id="${item.id}" data-change="1">+</button>
                    </td>
                    <td>$${subtotal.toFixed(2)}</td>
                    <td><button class="btn btn-danger remove-from-cart-btn" data-product-id="${item.id}">Remove</button></td>
                </tr>
            `;
        });

        tableHTML += `</tbody></table>`;
        cartItemsContainer.innerHTML = tableHTML;

        if (cartTotalElement) cartTotalElement.textContent = total.toFixed(2);

        // Add event listeners for cart actions
        cartItemsContainer.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', handleRemoveFromCart);
        });
        cartItemsContainer.querySelectorAll('.quantity-change').forEach(button => {
            button.addEventListener('click', handleQuantityChange);
        });
        cartItemsContainer.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', handleQuantityInputChange);
        });
    };

    const handleRemoveFromCart = (event) => {
        const productId = parseInt(event.target.dataset.productId);
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        displayCartItems();
        showToast('Item removed from cart.', 'info');
    };

    const handleQuantityChange = (event) => {
        const productId = parseInt(event.target.dataset.productId);
        const change = parseInt(event.target.dataset.change);
        const cartItem = cart.find(item => item.id === productId);

        if (cartItem) {
            cartItem.quantity += change;
            if (cartItem.quantity < 1) {
                cartItem.quantity = 1; // Or remove item: cart = cart.filter(item => item.id !== productId);
            }
            saveCart();
            displayCartItems();
        }
    };

    const handleQuantityInputChange = (event) => {
        const productId = parseInt(event.target.dataset.productId);
        let newQuantity = parseInt(event.target.value);
        const cartItem = cart.find(item => item.id === productId);

        if (cartItem) {
            if (isNaN(newQuantity) || newQuantity < 1) {
                newQuantity = 1;
                event.target.value = 1; // Correct the input field
            }
            cartItem.quantity = newQuantity;
            saveCart();
            displayCartItems();
        }
    };
    
    const handleEmptyCart = () => {
        cart = [];
        saveCart();
        displayCartItems();
        showToast('Cart emptied.', 'info');
    };

    const handleCheckout = () => {
        if (cart.length === 0) {
            showToast('Your cart is empty. Add some products before checking out!', 'error');
            return;
        }
        // In a real app, this would redirect to a checkout page or payment gateway
        alert('Thank you for your order! (This is a mock checkout)');
        cart = []; // Empty cart after "checkout"
        saveCart();
        displayCartItems();
        // Optionally redirect to a thank you page or homepage
        // window.location.href = 'index.html';
    };

    // --- Contact Form Handler ---
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const feedbackElement = document.getElementById('form-feedback');
            // Basic validation (real app would have more robust validation)
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;

            if (!name || !email || !message) {
                feedbackElement.textContent = 'Please fill in all required fields.';
                feedbackElement.style.color = 'red';
                return;
            }
            
            // Simulate form submission
            feedbackElement.textContent = 'Thank you for your message! We will get back to you soon.';
            feedbackElement.style.color = 'var(--primary-color)';
            contactForm.reset();

            setTimeout(() => {
                feedbackElement.textContent = '';
            }, 5000);
        });
    }


    // --- Page Specific Initializations & Event Listeners ---
    // Update cart count on all pages
    updateCartCount();

    // Homepage: Display featured products
    if (featuredProductGrid) {
        displayProducts(products, featuredProductGrid, 3); // Display first 3 as featured
    }

    // Products Page: Display all products
    if (allProductGrid) {
        if (products && products.length > 0) {
            displayProducts(products, allProductGrid);
        } else if (loadingProductsMessage) {
            loadingProductsMessage.textContent = "No products found.";
        }
    }

    // Cart Page: Display cart items and set up cart actions
    if (cartItemsContainer) {
        displayCartItems();
        const emptyCartBtn = document.getElementById('empty-cart-btn');
        const checkoutBtn = document.getElementById('checkout-btn');
        if (emptyCartBtn) emptyCartBtn.addEventListener('click', handleEmptyCart);
        if (checkoutBtn) checkoutBtn.addEventListener('click', handleCheckout);
    }

    // Set active navigation link (simple version based on URL)
    const navLinks = document.querySelectorAll('header nav ul li a');
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPath) {
            link.classList.add('active');
        } else {
            link.classList.remove('active'); // Ensure only one is active
        }
    });
     // Special case for index.html if currentPath is empty (root)
    if (currentPath === '' && window.location.pathname === '/') {
        const homeLink = document.querySelector('header nav ul li a[href="index.html"]');
        if (homeLink) homeLink.classList.add('active');
    }

});