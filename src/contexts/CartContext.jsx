import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function useCart() {
  return useContext(CartContext);
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('tfb_cart');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('tfb_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addItem = (item, quantity = 1, specialInstructions = '') => {
    setCartItems(prev => {
      const existing = prev.find(i => i.id === item.id && i.specialInstructions === specialInstructions);
      if (existing) {
        return prev.map(i => i.id === item.id && i.specialInstructions === specialInstructions
          ? { ...i, quantity: i.quantity + quantity } 
          : i);
      }
      return [...prev, { ...item, quantity, specialInstructions }];
    });
    // Shake cart icon or show toast logic usually handled via event emitter or state
  };

  const removeItem = (itemId, specialInstructions = '') => {
    setCartItems(prev => prev.filter(i => !(i.id === itemId && i.specialInstructions === specialInstructions)));
  };

  const updateQuantity = (itemId, quantity, specialInstructions = '') => {
    if (quantity <= 0) {
      removeItem(itemId, specialInstructions);
      return;
    }
    setCartItems(prev => prev.map(i => (i.id === itemId && i.specialInstructions === specialInstructions) ? { ...i, quantity } : i));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const deliveryFee = 100;
  const cartTotal = cartSubtotal > 0 ? cartSubtotal + deliveryFee : 0;

  const value = {
    cartItems,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    cartCount,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    isCartOpen,
    setIsCartOpen
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}
