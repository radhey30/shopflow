import useCartStore from "../store/cartStore";
import type { Product } from "../types";

export const useCart = () => {
  const store = useCartStore();

  const formatPrice = (price: number): string =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);

  const isInCart = (productId: string): boolean =>
    store.items.some((i) => i.product._id === productId);

  const getItemQuantity = (productId: string): number =>
    store.items.find((i) => i.product._id === productId)?.quantity ?? 0;

  return {
    items: store.items,
    totalItems: store.totalItems(),
    totalPrice: store.totalPrice(),
    formattedTotal: formatPrice(store.totalPrice()),
    addItem: store.addItem,
    removeItem: store.removeItem,
    updateQuantity: store.updateQuantity,
    clearCart: store.clearCart,
    isInCart,
    getItemQuantity,
  };
};
