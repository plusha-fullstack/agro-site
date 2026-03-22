export const store = {
  cart: [],
  add(product, qty = 1) {
    const existing = this.cart.find(i => i.name === product.name);
    if (existing) {
      existing.qty = qty;
    } else {
      this.cart.push({ ...product, qty });
    }
  },
  remove(name) {
    this.cart = this.cart.filter(i => i.name !== name);
  },
  get() { return this.cart; },
  clear() { this.cart = []; },
};
