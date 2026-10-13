/**
 * app.js — Application entry point for M1.
 *
 * M1 scope (per the approved plan):
 *   - Render the product list with prices and Add to Cart buttons.
 *   - Wire a placeholder click handler that logs the selected product.
 *
 * Cart logic, totals, payment, and receipt are intentionally NOT
 * implemented here — they belong to M2–M5. This keeps M1 small and
 * testable on its own.
 */

"use strict";

/* ============================================================
   Utilities
   ============================================================ */

/**
 * Format a number as Philippine peso currency.
 * Used app-wide so money formatting stays consistent (M3 will reuse).
 */
function formatPeso(amount) {
  if (typeof amount !== "number" || !isFinite(amount)) {
    return "P0.00";
  }
  return "P" + amount.toFixed(2);
}

/**
 * Safely escape text before inserting into innerHTML.
 * Product names are hard-coded today, but this prevents future
 * regressions if the source ever becomes dynamic.
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

/**
 * Build the HTML markup for a single product card.
 */
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

/**
 * Render every product into the #product-list container.
 */
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

  const cardsHtml = PRODUCTS.map(buildProductCard).join("");
  container.innerHTML = cardsHtml;
}

/* ============================================================
   Add to Cart — M1 stub only (full logic arrives in M2)
   ============================================================ */

/**
 * Temporary handler for Add to Cart clicks.
 * M2 will replace this with real cart operations.
 */
function handleAddToCartClick(event) {
  const button = event.target.closest(".add-to-cart-btn");
  if (!button) {
    return;
  }

  const productId = button.getAttribute("data-product-id");
  const product = typeof getProductById === "function"
    ? getProductById(productId)
    : null;

  if (!product) {
    console.warn("Add to Cart: unknown product id:", productId);
    return;
  }

  // M1 behavior: log only. M2 will push into the cart state.
  console.log("[M1 stub] Add to Cart clicked:", product.name, formatPeso(product.price));
}

/**
 * Attach a single delegated listener to the product list.
 * Delegation means we do not re-bind on every re-render.
 */
function bindProductListEvents() {
  const container = document.getElementById("product-list");
  if (!container) {
    console.error("bindProductListEvents: #product-list container not found.");
    return;
  }
  container.addEventListener("click", handleAddToCartClick);
}

/* ============================================================
   Bootstrap
   ============================================================ */

function init() {
  try {
    renderProductList();
    bindProductListEvents();
  } catch (error) {
    console.error("Failed to initialize the application:", error);
  }
}

// Run after the DOM is parsed. The script tags are at the end of
// <body>, so DOMContentLoaded is safe and also covers cached loads.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}