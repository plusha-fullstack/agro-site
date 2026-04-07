const CART_KEY = 'agro_cart';

export const store = {
  cart: JSON.parse(localStorage.getItem(CART_KEY) || '[]'),
  _save() { localStorage.setItem(CART_KEY, JSON.stringify(this.cart)); },
  add(product, qty = 1) {
    const existing = this.cart.find(i => i.name === product.name);
    if (existing) {
      existing.qty = qty;
    } else {
      this.cart.push({ ...product, qty });
    }
    this._save();
  },
  remove(name) {
    this.cart = this.cart.filter(i => i.name !== name);
    this._save();
  },
  get() { return this.cart; },
  clear() { this.cart = []; this._save(); },
};
