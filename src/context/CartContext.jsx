import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

const CartContext = createContext(null);
const CART_STORAGE_KEY = 'vcl4x_cart';

function readStoredCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => readStoredCart());
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const itemCount = useMemo(
    () => items.reduce((n, i) => n + (i.quantity || 1), 0),
    [items]
  );

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const idx = prev.findIndex(
        (p) => p.productId === item.productId && p.billingInterval === item.billingInterval
      );
      if (idx >= 0) return prev;
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((productId, billingInterval) => {
    setItems((prev) => prev.filter(
      (p) => !(p.productId === productId && p.billingInterval === billingInterval)
    ));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setSummary(null);
  }, []);

  const updateSummary = useCallback((next) => {
    setSummary(next);
  }, []);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      summary,
      loading,
      setLoading,
      addItem,
      removeItem,
      clearCart,
      updateSummary,
      setItems,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
