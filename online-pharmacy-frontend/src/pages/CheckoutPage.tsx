import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useProductStore } from '../store/productStore';
import { ordersApi } from '../api/orders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

export function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [deliverySlot, setDeliverySlot] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'CASH_ON_DELIVERY' | 'CARD' | 'UPI'>('CASH_ON_DELIVERY');

  if (!isAuthenticated || !cart || !cart.items || cart.items.length === 0) {
    navigate('/cart');
    return null;
  }

  const cartItems = cart.items || [];

  const { fetchMedicines } = useProductStore();
  
  const handleCheckout = async () => {
    setLoading(true);
    setError('');
    try {
      const order = await ordersApi.checkout({
        address,
        pincode,
        deliverySlot,
        notes,
      });
      
      await ordersApi.initiatePayment(order.id, { paymentMethod });
      
      // Refresh medicines to update stock display
      await fetchMedicines();
      
      await clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">Checkout</h1>
      
      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Delivery Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <Input
                placeholder="Enter your delivery address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pincode</label>
              <Input
                placeholder="Enter pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Delivery Slot (optional)</label>
              <Input
                placeholder="e.g., Morning, Afternoon, Evening"
                value={deliverySlot}
                onChange={(e) => setDeliverySlot(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes (optional)</label>
              <Input
                placeholder="Any special instructions"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-slate-50">
              <input
                type="radio"
                name="paymentMethod"
                value="CASH_ON_DELIVERY"
                checked={paymentMethod === 'CASH_ON_DELIVERY'}
                onChange={() => setPaymentMethod('CASH_ON_DELIVERY')}
              />
              <span>Cash on Delivery</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-slate-50">
              <input
                type="radio"
                name="paymentMethod"
                value="UPI"
                checked={paymentMethod === 'UPI'}
                onChange={() => setPaymentMethod('UPI')}
              />
              <span>UPI</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2 rounded-md border p-3 hover:bg-slate-50">
              <input
                type="radio"
                name="paymentMethod"
                value="CARD"
                checked={paymentMethod === 'CARD'}
                onChange={() => setPaymentMethod('CARD')}
              />
              <span>Card</span>
            </label>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({cart.totalItems} items)</span>
              <span>₹{cart.subtotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span>₹50</span>
            </div>
            <div className="flex justify-between border-t pt-2 font-bold">
              <span>Total</span>
              <span>₹{cart.subtotal + 50}</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              onClick={handleCheckout}
              disabled={loading || !address || !pincode}
            >
              {loading ? 'Processing...' : 'Place Order'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}