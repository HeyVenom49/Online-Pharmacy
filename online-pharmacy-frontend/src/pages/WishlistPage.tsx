import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import type { MedicineDetail } from '../types';
import { catalogApi } from '../api/catalog';
import { useUserPrefsStore } from '../store/userPrefsStore';
import { useCartStore } from '../store/cartStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { getMedicineImage } from '../utils/medicineImage';

export function WishlistPage() {
  const { wishlistIds, removeFromWishlist } = useUserPrefsStore();
  const { addToCart } = useCartStore();
  const [items, setItems] = useState<MedicineDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (wishlistIds.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const details = await Promise.all(
          wishlistIds.map((id) => catalogApi.getMedicineById(id).catch(() => null))
        );
        setItems(details.filter(Boolean) as MedicineDetail[]);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [wishlistIds]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-56 rounded skeleton" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-44 rounded-xl skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900">My Wishlist</h1>
        <p className="text-sm text-slate-500">{items.length} saved item(s)</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <Heart className="mx-auto mb-3 h-10 w-10 text-slate-300" />
          <p className="text-slate-600">No wishlist items yet.</p>
          <Link to="/" className="mt-4 inline-block">
            <Button>Browse Medicines</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((medicine) => (
            <Card key={medicine.id} className="overflow-hidden">
              <img
                src={getMedicineImage(medicine)}
                alt={medicine.name}
                className="h-36 w-full object-cover"
              />
              <div className="space-y-3 p-4">
                <div>
                  <p className="text-sm text-slate-500">{medicine.categoryName}</p>
                  <h3 className="font-semibold text-slate-900">{medicine.name}</h3>
                  <p className="text-sm text-slate-600">₹{medicine.price}</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => addToCart({ medicineId: medicine.id, quantity: 1 })}
                    disabled={!medicine.inStock}
                  >
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add
                  </Button>
                  <Button variant="outline" onClick={() => removeFromWishlist(medicine.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

