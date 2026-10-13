/**
 * app.js — Application entry point (M1 + M2).
 *
 * M1 scope:
 *   - Render the product list with prices and Add to Cart buttons.
 *
 * M2 scope (this module):
 *   - Wire Add to Cart to cart.js.
 *   - Render the cart table with name, price, quantity, subtotal.
 *   - Wire increment / decrement / remove buttons.
 *   - Place a live total in the Order Summary (actual math lands in M3;
 *     M2 shows a running P0.00 placeholder to prove re-render works).
 *
 * Payment (M4) and receipt (M5) are intentionally NOT implemented here.
 */

"use strict";

/* ============================================================
   Utilities
   ============================================================ */

/**
 * Format a number as Philippine peso currency.
 * Single source of truth for money formatting across the app.
 */
function formatPeso(amount) {
  if (typeof amount !== "number" || !isFinite(amount)) {
    return "P0.00";
  }
  return "P" + amount.toFixed(2);
}

/**
 * Escape text before inserting into innerHTML.
 */
function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ============================================================
   Product List Rendering (R4, R5, R6)
   ============================================================ */

function buildProductCard(product) {
  return (
    '<article class="product-card" data-product-id="' + escapeHtml(product.id) + '">' +
      '<h3 class="product-name">' + escapeHtml(product.name) + "</h3>" +
      '<p class="product-price">' + formatPeso(product.price) + "</p>" +
      '<button type="button" class="btn btn-primary add-to-cart-btn" ' +
        'data-product-id="' + escapeHtml(product.id) + '">' +
        "Add to Cart" +
      "</button>" +
    "</article>"
  );
}

function renderProductList() {
  const container = document.getElementById("product-list");
  if (!container) {
    console.error("renderProductList: #product-list container not found.");
    return;
  }

  if (!Array.isArray(PRODUCTS) || PRODUCTS.length === 0) {
    container.innerHTML =
      '<p class="placeholder-text">No products available.</p>';
    return;
  }

  container.innerHTML = PRODUCTS.map(buildProductCard).join("");
}

/* ============================================================
   Cart Rendering (R9, R10, R12, R13)
   ============================================================ */

/**
 * Build a single cart row. Kept small so it is easy to read and test.
 * Note: the Subtotal column is a placeholder until M3.
 */
function buildCartRow(item) {
  const productId = escapeHtml(item.productId);
  const quantity = item.quantity;
  const decrementDisabled = quantity <= 1 ? " disabled" : "";

  return (
    "<tr>" +
      "<td>" + escapeHtml(item.name) + "</td>" +
      '<td class="numeric">' + formatPeso(item.unitPrice) + "</td>" +
      '<td class="numeric">' +
        '<span class="cart-qty-controls">' +
          '<button type="button" class="btn btn-qty decrement-btn" ' +
            'data-product-id="' + productId + '"' + decrementDisabled + ">&minus;</button>" +
          '<span class="cart-qty-value">' + quantity + "</span>" +
          '<button type="button" class="btn btn-qty increment-btn" ' +
            'data-product-id="' + productId + '">+</button>' +
        "</span>" +
      "</td>" +
      '<td class="numeric">' + formatPeso(item.unitPrice * quantity) + "</td>" +
      '<td class="numeric">' +
        '<button type="button" class="btn btn-remove remove-btn" ' +
          'data-product-id="' + productId + '">Remove</button>' +
      "</td>" +
    "</tr>"
  );
}

function renderCart() {
  const container = document.getElementById("cart-container");
  if (!container) {
    console.error("renderCart: #cart-container not found.");
    return;
  }

  const items = getCartItems();

  if (items.length === 0) {
    container.innerHTML =
      '<p class="placeholder-text">Your cart is empty.</p>';
    return;
  }

  const rowsHtml = items.map(buildCartRow).join("");

  container.innerHTML =
    '<table class="cart-table">' +
      "<thead>" +
        "<tr>" +
          "<th>Product</th>" +
          '<th class="numeric">Price</th>' +
          '<th class="numeric">Qty</th>' +
          '<th class="numeric">Subtotal</th>' +
          '<th class="numeric">Action</th>' +
        "</tr>" +
      "</thead>" +
      "<tbody>" + rowsHtml + "</tbody>" +
    "</table>";
}

/* ============================================================
   Order Summary (partial in M2 — full math in M3)
   ============================================================ */

/**
 * M2 placeholder: reflect cart state in the summary but do not yet
 * compute the full total. M3 replaces the body of this function.
 */
function renderOrderSummary() {
  const totalEl = document.getElementById("total-amount");
  if (!totalEl) {
    console.error("renderOrderSummary: #total-amount not found.");
    return;
  }

  if (isCartEmpty()) {
    totalEl.textContent = formatPeso(0);
    return;
  }

  // M3 will compute the real total. M2 shows a running placeholder
  // sum so the UI reflects that cart changes trigger a re-render.
  const provisionalTotal = getCartItems().reduce(function (sum, item) {
    return sum + item.unitPrice * item.quantity;
  }, 0);
  totalEl.textContent = formatPeso(provisionalTotal);
}

/**
 * Single re-render entry point so every cart mutation updates the UI
 * in one place (R13). M3 will extend this to recompute totals cleanly.
 */
function refreshCartUI() {
  renderCart();
  renderOrderSummary();
}

/* ============================================================
   Event Wiring
   ============================================================ */

/**
 * Add to Cart — delegated on the product list container.
 */
function handleProductListClick(event) {
  const button = event.target.closest(".add-to-cart-btn");
  if (!button) {
    return;
  }

  const productId = button.getAttribute("data-product-id");
  const product = getProductById(productId);
  if (!product) {
    console.warn("Add to Cart: unknown product id:", productId);
    return;
  }

  const added = addToCart(product);
  if (added) {
    refreshCartUI();
  }
}

/**
 * Cart table — delegated on the cart container so re-renders
 * do not require re-binding.
 */
function handleCartClick(event) {
  const target = event.target;

  const incrementBtn = target.closest(".increment-btn");
  if (incrementBtn) {
    const productId = incrementBtn.getAttribute("data-product-id");
    if (incrementQuantity(productId)) {
      refreshCartUI();
    }
    return;
  }

  const decrementBtn = target.closest(".decrement-btn");
  if (decrementBtn) {
    const productId = decrementBtn.getAttribute("data-product-id");
    // Re-check in logic: the button may be enabled but quantity could
    // already be at the floor due to a rapid double click.
    if (decrementQuantity(productId)) {
      refreshCartUI();
    }
    return;
  }

  const removeBtn = target.closest(".remove-btn");
  if (removeBtn) {
    const productId = removeBtn.getAttribute("data-product-id");
    if (removeFromCart(productId)) {
      refreshCartUI();
    }
    return;
  }
}

/* ============================================================
   Bootstrap
   ============================================================ */

function init() {
  try {
    renderProductList();
    refreshCartUI();

    const productContainer = document.getElementById("product-list");
    if (productContainer) {
      productContainer.addEventListener("click", handleProductListClick);
    } else {
      console.error("init: #product-list container not found; Add to Cart is disabled.");
    }

    const cartContainer = document.getElementById("cart-container");
    if (cartContainer) {
      cartContainer.addEventListener("click", handleCartClick);
    } else {
      console.error("init: #cart-container not found; cart interactions are disabled.");
    }
  } catch (error) {
    console.error("Failed to initialize the application:", error);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}