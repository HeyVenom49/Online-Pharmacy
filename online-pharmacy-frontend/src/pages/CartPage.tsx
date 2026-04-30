import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { Trash2, ShoppingCart, ArrowRight } from 'lucide-react';

export function CartPage() {
  const navigate = useNavigate();
  const { cart, loading, fetchCart, updateItem, removeFromCart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [clearModalOpen, setClearModalOpen] = useState(false);

  const storedIsAuth = !!localStorage.getItem('token');
  const authenticated = isAuthenticated || storedIsAuth;

  useEffect(() => {
    if (authenticated) fetchCart();
  }, [authenticated]);

  const confirmDelete = (itemId: number) => {
    setItemToDelete(itemId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await removeFromCart(itemToDelete);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const handleClearCart = async () => {
    await clearCart();
    setClearModalOpen(false);
  };

  const handleQuantityChange = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(itemId);
    } else {
      await updateItem(itemId, quantity);
    }
  };

  if (!authenticated) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <ShoppingCart className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Please login to view your cart</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  const cartItems = cart?.items || [];

  if (!cart || cartItems.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <ShoppingCart className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Your cart is empty</p>
        <Link to="/"><Button>Continue Shopping</Button></Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold">Shopping Cart ({cart.totalItems} items)</h1>
            {cartItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setClearModalOpen(true)} className="text-red-600 hover:bg-red-50">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear Cart
              </Button>
            )}
          </div>
          <div className="space-y-4">
            {cartItems.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.medicineName}</h3>
                      <p className="text-sm text-slate-500">₹{item.unitPrice} each</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>-</Button>
                      <span className="w-12 text-center">{item.quantity}</span>
                      <Button variant="outline" size="icon" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>+</Button>
                    </div>
                    <div className="w-24 text-right">
                      <p className="font-medium">₹{item.subtotal}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => confirmDelete(item.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
        <div>
          <Card>
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{cart.subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>₹50</span></div>
              <div className="border-t pt-2">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{cart.subtotal + 50}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => navigate('/checkout')}>
                Proceed to Checkout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setItemToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Remove Item"
        message="Are you sure you want to remove this item from your cart?"
        confirmText="Remove"
        variant="danger"
      />

      <ConfirmModal
        isOpen={clearModalOpen}
        onClose={() => setClearModalOpen(false)}
        onConfirm={handleClearCart}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmText="Clear All"
        variant="danger"
      />
    </>
  );
}
