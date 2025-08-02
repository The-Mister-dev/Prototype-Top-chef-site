// Global variables
let cart = [];
let cartCount = 0;

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
  loadCart();
  updateCartDisplay();
  initializeOrderForm();
  initializeMobileMenu();
  initializeScrollAnimations();
});

// Initialize the application
function initializeApp() {
  console.log("Restaurant Top Chef - Application initialisée");

  // Load cart from localStorage
  const savedCart = localStorage.getItem("topchef_cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}

// Mobile menu functionality
function initializeMobileMenu() {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu) {
    hamburger.addEventListener("click", function () {
      hamburger.classList.toggle("active");
      navMenu.classList.toggle("active");
    });

    // Close menu when clicking on a link
    const navLinks = document.querySelectorAll(".nav-link");
    navLinks.forEach((link) => {
      link.addEventListener("click", function () {
        hamburger.classList.remove("active");
        navMenu.classList.remove("active");
      });
    });
  }
}

// Smooth scroll for menu navigation
function initializeScrollAnimations() {
  // Smooth scroll for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const headerHeight = document.querySelector(".header").offsetHeight;
        const targetPosition = targetElement.offsetTop - headerHeight - 20;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Simple scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("aos-animate");
      }
    });
  }, observerOptions);

  // Observe elements with data-aos attribute
  const animatedElements = document.querySelectorAll("[data-aos]");
  animatedElements.forEach((el) => observer.observe(el));
}

// Cart functionality
function addToCart(name, price, image = "") {
  const existingItem = cart.find((item) => item.name === name);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: Date.now(),
      name: name,
      price: price,
      image: image,
      quantity: 1,
    });
  }

  updateCartCount();
  saveCart();
  showAddToCartFeedback(name);
  updateCartDisplay();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  updateCartCount();
  saveCart();
  updateCartDisplay();
}

function updateQuantity(id, newQuantity) {
  if (newQuantity <= 0) {
    removeFromCart(id);
    return;
  }

  const item = cart.find((item) => item.id === id);
  if (item) {
    item.quantity = newQuantity;
    updateCartCount();
    saveCart();
    updateCartDisplay();
  }
}

function updateCartCount() {
  cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const cartCountElements = document.querySelectorAll("#cartCount");
  cartCountElements.forEach((element) => {
    element.textContent = cartCount;
    element.style.display = cartCount > 0 ? "flex" : "none";
  });
}

function calculateTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function saveCart() {
  localStorage.setItem("topchef_cart", JSON.stringify(cart));
}

function loadCart() {
  const savedCart = localStorage.getItem("topchef_cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
    updateCartCount();
  }
}

function showAddToCartFeedback(itemName) {
  // Create and show a temporary notification
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-red);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
        z-index: 3000;
        font-weight: 600;
        transform: translateX(400px);
        transition: transform 0.3s ease;
    `;
  notification.textContent = `✓ ${itemName} ajouté au panier`;
  document.body.appendChild(notification);

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)";
  }, 100);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Cart sidebar functionality
function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartSidebar && cartOverlay) {
    const isOpen = cartSidebar.classList.contains("open");

    if (isOpen) {
      cartSidebar.classList.remove("open");
      cartOverlay.classList.remove("open");
      document.body.style.overflow = "";
    } else {
      cartSidebar.classList.add("open");
      cartOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
      updateCartDisplay();
    }
  }
}

function updateCartDisplay() {
  const cartItemsContainer = document.getElementById("cartItems");
  const cartTotalElement = document.getElementById("cartTotal");

  if (!cartItemsContainer || !cartTotalElement) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML =
      '<p class="empty-cart">Votre panier est vide</p>';
    cartTotalElement.textContent = "0 F CFA";
    return;
  }

  const cartHTML = cart
    .map(
      (item) => `
        <div class="cart-item">
            ${
              item.image
                ? `<img src="${item.image}" alt="${item.name}" class="cart-item-image">`
                : ""
            }
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${(
                  item.price * item.quantity
                ).toLocaleString("fr-FR")} F CFA</div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="updateQuantity(${
                      item.id
                    }, ${item.quantity - 1})">-</button>
                    <span class="cart-item-quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${
                      item.id
                    }, ${item.quantity + 1})">+</button>
                    <button class="remove-item" onclick="removeFromCart(${
                      item.id
                    })" title="Supprimer">🗑️</button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  cartItemsContainer.innerHTML = cartHTML;
  cartTotalElement.textContent = `${calculateTotal().toLocaleString(
    "fr-FR"
  )} F CFA`;
}

// Order on WhatsApp
function orderOnWhatsApp() {
  if (cart.length === 0) {
    alert("Votre panier est vide");
    return;
  }

  let message = "🍽️ *Commande Restaurant Top Chef*\n\n";
  message += "*Articles commandés :*\n";

  cart.forEach((item) => {
    message += `• ${item.name} x${item.quantity} - ${(
      item.price * item.quantity
    ).toLocaleString("fr-FR")} F CFA\n`;
  });

  message += `\n*Total : ${calculateTotal().toLocaleString(
    "fr-FR"
  )} F CFA*\n\n`;
  message += "📍 Livraison ou à emporter ?\n";
  message += "💳 Mode de paiement souhaité ?\n";
  message += "⏰ Heure souhaitée ?\n\n";
  message += "Merci ! 😊";

  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/2250595857542?text=${encodedMessage}`;

  window.open(whatsappURL, "_blank");

  // Vider le panier et afficher un message de remerciement
  setTimeout(() => {
    cart = [];
    updateCartCount();
    saveCart();
    updateCartDisplay();
    toggleCart();
    showThankYouNotification();
  }, 1000);
}

function showThankYouNotification() {
  const notification = document.createElement("div");
  notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #16a34a;
        color: white;
        padding: 1.2rem 2rem;
        border-radius: 10px;
        box-shadow: 0 5px 20px rgba(0,0,0,0.18);
        z-index: 4000;
        font-size: 1.1rem;
        font-weight: 700;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.4s cubic-bezier(.4,2,.6,1);
    `;
  notification.textContent = "Merci d'avoir commandé !";
  document.body.appendChild(notification);
  setTimeout(() => {
    notification.style.opacity = "1";
    notification.style.transform = "translateX(0)";
  }, 100);
  setTimeout(() => {
    notification.style.opacity = "0";
    notification.style.transform = "translateX(400px)";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 400);
  }, 3000);
}

// Order form functionality
function initializeOrderForm() {
  const orderForm = document.getElementById("orderForm");
  const orderTypeSelect = document.getElementById("orderType");
  const addressGroup = document.getElementById("addressGroup");
  const checkboxes = document.querySelectorAll('input[name="dishes"]');
  const quantityInputs = document.querySelectorAll(".quantity-input");
  const totalInput = document.getElementById("orderTotal");

  // Show/hide address field based on order type
  if (orderTypeSelect && addressGroup) {
    orderTypeSelect.addEventListener("change", function () {
      if (this.value === "livraison") {
        addressGroup.style.display = "block";
        document.getElementById("deliveryAddress").required = true;
      } else {
        addressGroup.style.display = "none";
        document.getElementById("deliveryAddress").required = false;
      }
    });
  }

  // Handle dish selection and quantity changes
  function updateOrderTotal() {
    let total = 0;

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        const price = parseInt(checkbox.value.split(" - ")[1]);
        const quantityInput = document.querySelector(
          `input[data-dish="${checkbox.id}"]`
        );
        const quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1;
        total += price * quantity;
      }
    });

    if (totalInput) {
      totalInput.value = `${total.toLocaleString("fr-FR")} F CFA`;
    }
  }

  // Add event listeners for checkboxes
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const quantityInput = document.querySelector(
        `input[data-dish="${this.id}"]`
      );
      if (this.checked && quantityInput) {
        quantityInput.value = Math.max(1, parseInt(quantityInput.value) || 1);
      } else if (!this.checked && quantityInput) {
        quantityInput.value = 0;
      }
      updateOrderTotal();
    });
  });

  // Add event listeners for quantity inputs
  quantityInputs.forEach((input) => {
    input.addEventListener("change", function () {
      const dishId = this.getAttribute("data-dish");
      const checkbox = document.getElementById(dishId);
      const quantity = parseInt(this.value) || 0;

      if (quantity > 0) {
        checkbox.checked = true;
      } else {
        checkbox.checked = false;
        this.value = 0;
      }

      updateOrderTotal();
    });
  });

  // Handle form submission
  if (orderForm) {
    orderForm.addEventListener("submit", function (e) {
      e.preventDefault();

      const formData = new FormData(this);
      const selectedDishes = [];

      checkboxes.forEach((checkbox) => {
        if (checkbox.checked) {
          const quantityInput = document.querySelector(
            `input[data-dish="${checkbox.id}"]`
          );
          const quantity = quantityInput
            ? parseInt(quantityInput.value) || 1
            : 1;
          const dishInfo = checkbox.value.split(" - ");
          selectedDishes.push({
            name: dishInfo[0],
            price: parseInt(dishInfo[1]),
            quantity: quantity,
          });
        }
      });

      if (selectedDishes.length === 0) {
        alert("Veuillez sélectionner au moins un plat");
        return;
      }

      // Create WhatsApp message
      let message = "🍽️ *Nouvelle Commande - Restaurant Top Chef*\n\n";
      message += `*Client :* ${formData.get("customerName")}\n`;
      message += `*WhatsApp :* ${formData.get("customerPhone")}\n`;
      message += `*Type :* ${formData.get("orderType")}\n`;

      if (
        formData.get("orderType") === "livraison" &&
        formData.get("deliveryAddress")
      ) {
        message += `*Adresse :* ${formData.get("deliveryAddress")}\n`;
      }

      message += "\n*Articles commandés :*\n";
      let total = 0;

      selectedDishes.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        message += `• ${item.name} x${
          item.quantity
        } - ${itemTotal.toLocaleString("fr-FR")} F CFA\n`;
      });

      message += `\n*Total : ${total.toLocaleString("fr-FR")} F CFA*\n`;

      if (formData.get("specialRequest")) {
        message += `\n*Demande spéciale :*\n${formData.get(
          "specialRequest"
        )}\n`;
      }

      message += "\nMerci pour votre commande ! 😊";

      // Send to WhatsApp
      const encodedMessage = encodeURIComponent(message);
      const whatsappURL = `https://wa.me/2250595857542?text=${encodedMessage}`;

      window.open(whatsappURL, "_blank");

      // Show success message
      alert("Votre commande a été envoyée sur WhatsApp !");

      // Reset form
      this.reset();
      updateOrderTotal();
      if (addressGroup) {
        addressGroup.style.display = "none";
      }
    });
  }
}

// Utility functions
function formatPrice(price) {
  return price.toLocaleString("fr-FR") + " F CFA";
}

function validatePhone(phone) {
  const phoneRegex = /^(\+225)?[0-9\s-]{8,}$/;
  return phoneRegex.test(phone);
}

function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

// Add scroll to top functionality
window.addEventListener("scroll", function () {
  const scrollButton = document.getElementById("scrollToTop");
  if (scrollButton) {
    if (window.pageYOffset > 300) {
      scrollButton.style.display = "block";
    } else {
      scrollButton.style.display = "none";
    }
  }
});

// Header scroll effect
window.addEventListener("scroll", function () {
  const header = document.querySelector(".header");
  if (header) {
    if (window.pageYOffset > 100) {
      header.style.background = "rgba(255, 255, 255, 0.98)";
      header.style.boxShadow = "0 2px 25px rgba(0, 0, 0, 0.15)";
    } else {
      header.style.background = "rgba(255, 255, 255, 0.95)";
      header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.1)";
    }
  }
});

// Close mobile menu when clicking outside
document.addEventListener("click", function (e) {
  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburger && navMenu && navMenu.classList.contains("active")) {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
      hamburger.classList.remove("active");
      navMenu.classList.remove("active");
    }
  }
});

// Keyboard navigation for cart
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    const cartSidebar = document.getElementById("cartSidebar");
    if (cartSidebar && cartSidebar.classList.contains("open")) {
      toggleCart();
    }
  }
});

// Performance optimization: Lazy load images
function lazyLoadImages() {
  const images = document.querySelectorAll("img[data-src]");
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  images.forEach((img) => imageObserver.observe(img));
}

// Initialize lazy loading if needed
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", lazyLoadImages);
} else {
  lazyLoadImages();
}

// Export functions for global use
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.toggleCart = toggleCart;
window.orderOnWhatsApp = orderOnWhatsApp;
window.scrollToTop = scrollToTop;
