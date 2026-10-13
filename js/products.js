/**
 * products.js — Hard-coded product catalog (R4, R7, C3).
 *
 * No database is used. This array is the single source of truth for
 * product names and prices in the application.
 *
 * Prices are stored as numbers (pesos). Display formatting is handled
 * by the UI layer so the data stays clean.
 */

"use strict";

const PRODUCTS = Object.freeze([
  Object.freeze({ id: "ballpen",   name: "Ballpen",   price: 12.0 }),
  Object.freeze({ id: "pencil",    name: "Pencil",    price: 10.0 }),
  Object.freeze({ id: "notebook",  name: "Notebook",  price: 35.0 }),
  Object.freeze({ id: "yellowpad", name: "Yellow Pad", price: 45.0 }),
  Object.freeze({ id: "eraser",    name: "Eraser",    price: 8.0  }),
  Object.freeze({ id: "ruler",     name: "Ruler",     price: 15.0 })
]);

/**
 * Look up a product by its id.
 * Returns the frozen product object, or undefined if not found.
 */
function getProductById(productId) {
  return PRODUCTS.find(function (product) {
    return product.id === productId;
  });
}