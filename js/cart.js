/**
 * cart.js — Shopping cart state and operations (M2).
 *
 * Scope of this module (per the approved plan):
 *   - Add product to cart (R8)
 *   - Increase / decrease quantity (R10)
 *   - Quantity floor at 1; removal only via explicit remove (R11, F11 default)
 *   - Remove item (R12)
 *   - Expose cart contents for rendering (R9)
 *
 * Out of scope here:
 *   - Subtotal / total computation (M3)
 *   - Payment (M4)
 *   - Receipt (M5)
 *
 * The cart is an in-memory array. No persistence (F11).
 */

"use strict";

/**
 * Cart item shape:
 *   { productId: string, name: string, unitPrice: number, quantity: number }
 *
 * The cart array is module-private. All reads go through getCartItems(),
 * which returns a shallow copy, so callers cannot mutate internal state
 * by accident.
 */
const cartItems = [];

/**
 * Return a shallow copy of the cart array.
 * Each item is also shallow-copied so callers cannot edit cart state.
 */
function getCartItems() {
  return cartItems.map(function (item) {
    return Object.assign({}, item);
  });
}

/**
 * Return the current quantity for a product, or 0 if not in cart.
 */
function getQuantity(productId) {
  const item = cartItems.find(function (entry) {
    return entry.productId === productId;
  });
  return item ? item.quantity : 0;
}

/**
 * Add a product to the cart.
 * If the product is already in the cart, its quantity is incremented by 1.
 * Returns true on success, false if the product payload is invalid.
 */
function addToCart(product) {
  if (!product || typeof product.id !== "string" || typeof product.name !== "string") {
    console.warn("addToCart: invalid product payload.", product);
    return false;
  }
  if (typeof product.price !== "number" || !isFinite(product.price) || product.price < 0) {
    console.warn("addToCart: invalid product price.", product);
    return false;
  }

  const existing = cartItems.find(function (entry) {
    return entry.productId === product.id;
  });

  if (existing) {
    existing.quantity += 1;
    return true;
  }

  cartItems.push({
    productId: product.id,
    name: product.name,
    unitPrice: product.price,
    quantity: 1
  });
  return true;
}

/**
 * Increase the quantity of an existing cart item by 1.
 * Returns true if the item existed, false otherwise.
 */
function incrementQuantity(productId) {
  const item = cartItems.find(function (entry) {
    return entry.productId === productId;
  });
  if (!item) {
    return false;
  }
  item.quantity += 1;
  return true;
}

/**
 * Decrease the quantity of an existing cart item by 1.
 * Quantity will NOT drop below 1 (R11). Removal is handled by removeFromCart.
 * Returns true if the item existed, false otherwise.
 */
function decrementQuantity(productId) {
  const item = cartItems.find(function (entry) {
    return entry.productId === productId;
  });
  if (!item) {
    return false;
  }
  if (item.quantity > 1) {
    item.quantity -= 1;
  }
  return true;
}

/**
 * Remove a cart item entirely (R12).
 * Returns true if an item was removed, false otherwise.
 */
function removeFromCart(productId) {
  const index = cartItems.findIndex(function (entry) {
    return entry.productId === productId;
  });
  if (index === -1) {
    return false;
  }
  cartItems.splice(index, 1);
  return true;
}

/**
 * Empty the cart. Used by New Transaction in M5.
 * Kept here so cart state is owned in one place.
 */
function clearCart() {
  cartItems.length = 0;
}

/**
 * Whether the cart currently has any items.
 */
function isCartEmpty() {
  return cartItems.length === 0;
}