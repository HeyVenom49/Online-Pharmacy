import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Pill, Package, Heart } from 'lucide-react';
import { catalogApi } from '../api/catalog';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { useUserPrefsStore } from '../store/userPrefsStore';
import type { MedicineDetail } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getMedicineImage } from '../utils/medicineImage';

export function MedicineDetailPage() {
  const { medicineId } = useParams<{ medicineId: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const [medicine, setMedicine] = useState<MedicineDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [relatedMedicines, setRelatedMedicines] = useState<any[]>([]);
  const { addRecentlyViewed, toggleWishlist, isWishlisted } = useUserPrefsStore();

  useEffect(() => {
    if (medicineId) fetchMedicine();
  }, [medicineId]);

  const fetchMedicine = async () => {
    try {
      setLoading(true);
      const data = await catalogApi.getMedicineById(Number(medicineId));
      setMedicine(data);
      addRecentlyViewed(data.id);
      if (data.categoryId) {
        const related = await catalogApi.searchMedicines({ categoryId: data.categoryId }, 0, 8);
        setRelatedMedicines(
          related.data.filter((m) => m.id !== data.id).slice(0, 4)
        );
      }
    } catch (error) {
      console.error('Failed to fetch medicine:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      setAddingToCart(true);
      await addToCart({ medicineId: Number(medicineId), quantity });
      alert(`Added ${quantity} item(s) to cart!`);
    } catch (error) {
      console.error('Failed to add to cart:', error);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
      </div>
    );
  }

  if (!medicine) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <Package className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Medicine not found</p>
        <Link to="/"><Button variant="outline">Back to Home</Button></Link>
      </div>
    );
  }

  const discount = medicine.mrp && medicine.mrp > medicine.price
    ? Math.round(((medicine.mrp - medicine.price) / medicine.mrp) * 100)
    : 0;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="mb-4 inline-flex items-center gap-2 text-sky-600 hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="h-64 rounded-lg overflow-hidden bg-slate-100">
          <img src={getMedicineImage(medicine)} alt={medicine.name} className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/med-${medicine.id}/400/300`; }} />
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <button
                onClick={() => toggleWishlist(medicine.id)}
                className="rounded-full border border-slate-200 bg-white p-1.5 hover:bg-slate-50"
                aria-label="Toggle wishlist"
              >
                <Heart
                  className={`h-4 w-4 ${
                    isWishlisted(medicine.id) ? 'fill-red-500 text-red-500' : 'text-slate-500'
                  }`}
                />
              </button>
              {medicine.requiresPrescription && (
                <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">Rx Required</span>
              )}
              {medicine.categoryName && (
                <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{medicine.categoryName}</span>
              )}
            </div>
            <h1 className="text-2xl font-bold">{medicine.name}</h1>
            {medicine.manufacturer && <p className="mt-1 text-slate-600">by {medicine.manufacturer}</p>}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-sky-600">₹{medicine.price}</span>
            {medicine.mrp && medicine.mrp > medicine.price && (
              <>
                <span className="text-lg text-slate-400 line-through">₹{medicine.mrp}</span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-sm font-medium text-green-800">{discount}% OFF</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-2">
            {medicine.inStock ? (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-sm text-green-700">{medicine.stock} units in stock</span>
              </>
            ) : (
              <>
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-sm text-red-700">Out of Stock</span>
              </>
            )}
          </div>

          {medicine.description && (
            <div>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="text-sm leading-relaxed text-slate-600">{medicine.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 rounded-lg bg-slate-50 p-4">
            {medicine.dosageForm && <div><p className="text-xs text-slate-500">Dosage Form</p><p className="font-medium">{medicine.dosageForm}</p></div>}
            {medicine.strength && <div><p className="text-xs text-slate-500">Strength</p><p className="font-medium">{medicine.strength}</p></div>}
            {medicine.expiryDate && (
              <div>
                <p className="text-xs text-slate-500">Expiry Date</p>
                <p className={`font-medium ${medicine.expiringSoon ? 'text-amber-600' : ''}`}>
                  {new Date(medicine.expiryDate).toLocaleDateString()}
                  {medicine.expiringSoon && ' (Expiring Soon!)'}
                </p>
              </div>
            )}
          </div>

          {medicine.inStock && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50">-</button>
                <Input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, Math.min(medicine.stock, Number(e.target.value) || 1)))} className="w-16 text-center" min={1} max={medicine.stock} />
                <button onClick={() => setQuantity(Math.min(medicine.stock, quantity + 1))} className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 hover:bg-slate-50">+</button>
              </div>
              <Button onClick={handleAddToCart} loading={addingToCart} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            </div>
          )}

          {medicine.requiresPrescription && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <Pill className="h-4 w-4" />
              <p>Prescription required. Please upload a valid prescription to purchase this medicine.</p>
            </div>
          )}
        </div>
      </div>

      {medicine.inventoryList && medicine.inventoryList.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 text-xl font-bold">Inventory Batches</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm">
                  <th className="px-4 py-3">Batch Number</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Expiry Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {medicine.inventoryList.map((batch) => (
                  <tr key={batch.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">{batch.batchNumber}</td>
                    <td className="px-4 py-3">{batch.quantity} units</td>
                    <td className="px-4 py-3">{new Date(batch.expiryDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {batch.expired ? (
                        <span className="rounded bg-red-100 px-2 py-1 text-xs font-medium text-red-800">Expired</span>
                      ) : batch.expiringSoon ? (
                        <span className="rounded bg-amber-100 px-2 py-1 text-xs font-medium text-amber-800">Expiring Soon</span>
                      ) : (
                        <span className="rounded bg-green-100 px-2 py-1 text-xs font-medium text-green-800">Active</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {relatedMedicines.length > 0 && (
        <div className="mt-10 animate-fade-in">
          <h2 className="mb-4 text-xl font-bold">Related Products</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {relatedMedicines.map((item) => (
              <Link key={item.id} to={`/medicine/${item.id}`} className="rounded-xl border border-slate-200 bg-white p-3 hover:shadow-card-hover">
                <img
                  src={getMedicineImage(item)}
                  alt={item.name}
                  className="mb-2 h-24 w-full rounded-lg object-cover"
                />
                <p className="line-clamp-1 font-medium text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-600">₹{item.price}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
