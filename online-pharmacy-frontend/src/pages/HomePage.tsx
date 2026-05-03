import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useProductStore } from '../store/productStore';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';
import { getMedicineImage } from '../utils/medicineImage';
import { prescriptionApi } from '../api/prescription';
import { catalogApi } from '../api/catalog';
import { useUserPrefsStore } from '../store/userPrefsStore';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { ShoppingCart, AlertCircle, ChevronLeft, ChevronRight, Shield, Truck, Clock, HeartPulse, Sparkles, ArrowRight, Upload, CheckCircle, X, Search, Heart } from 'lucide-react';

const categoryIcons: Record<string, React.ReactNode> = {
  'Analgesics': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>,
  'Antibiotics': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>,
  'default': <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
};

export function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const searchQuery = searchParams.get('search');
  const [localSearch, setLocalSearch] = useState(searchQuery || '');
  const [sortOption, setSortOption] = useState<string>('default');
  const [mounted, setMounted] = useState(false);
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [prescriptionFile, setPrescriptionFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [pendingMedicine, setPendingMedicine] = useState<{id: number; name: string} | null>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    medicines,
    categories,
    pagination,
    loading,
    error,
    fetchMedicines,
    searchMedicines,
    fetchCategories
  } = useProductStore();
  const { isAuthenticated } = useAuthStore();
  const { addToCart } = useCartStore();
  const { recentMedicineIds, toggleWishlist, isWishlisted } = useUserPrefsStore();

  useEffect(() => { setMounted(true); }, []);

  const loadCategories = async () => {
    try {
      const res = await fetch('/api/catalog/categories');
      const data = await res.json();
      // categories loaded
    } catch {
      // Silently handle category fetch errors
    }
  };

  useEffect(() => {
    loadCategories();
    fetchCategories().catch(() => {});
    if (searchQuery) {
      searchMedicines({ name: searchQuery });
    } else {
      fetchMedicines();
    }
  }, [searchQuery]);

  useEffect(() => {
    const loadRecentItems = async () => {
      if (!recentMedicineIds.length) {
        setRecentItems([]);
        return;
      }
      const details = await Promise.all(
        recentMedicineIds.slice(0, 8).map((id) => catalogApi.getMedicineById(id).catch(() => null))
      );
      setRecentItems(details.filter(Boolean) as any[]);
    };
    loadRecentItems();
  }, [recentMedicineIds]);

  const handleCategoryClick = (categoryId: number | undefined) => {
    if (categoryId) {
      searchMedicines({ categoryId: categoryId });
    } else {
      fetchMedicines();
    }
  };

  const handleLocalSearch = (value: string) => {
    setLocalSearch(value);
    if (value.trim()) {
      searchMedicines({ name: value });
      setSearchParams({ search: value });
    } else {
      fetchMedicines();
      setSearchParams({});
    }
  };

  const handleAddToCart = async (medicineId: number, medicineName?: string, requiresPrescription?: boolean) => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (requiresPrescription) {
      setPendingMedicine({ id: medicineId, name: medicineName || '' });
      setUploadModalOpen(true);
      return;
    }
    const quantity = quantities[medicineId] || 1;
    try {
      await addToCart({ medicineId, quantity });
    } catch {
      // Silently handle add to cart errors
    }
  };

  const updateQuantity = (medicineId: number, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [medicineId]: Math.max(1, (prev[medicineId] || 1) + delta)
    }));
  };

  const handlePageChange = (newPage: number) => {
    fetchMedicines(newPage);
  };

  return (
    <div className="space-y-12">
      {!searchQuery && (
        <section className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-12 lg:p-16">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-light/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />

          <div className={`relative z-10 grid lg:grid-cols-2 gap-8 items-center ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 shadow-sm">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-slate-700">Trusted by 50,000+ Customers</span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight">
                Your Health, <span className="text-gradient">Delivered</span> to Your Door
              </h1>
              <p className="text-lg text-slate-600 max-w-xl">
                Order genuine medicines and healthcare products from verified pharmacies. Fast delivery, best prices, and 100% authentic products.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" onClick={() => document.getElementById('medicines')?.scrollIntoView({ behavior: 'smooth' })}>
                  Browse Medicines
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button variant="outline" size="lg" onClick={() => setUploadModalOpen(true)}>
                  Upload Prescription
                </Button>
              </div>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="flex h-64 w-64 items-center justify-center rounded-3xl shadow-2xl animate-float ring-1 ring-indigo-300/40"
                  style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)' }}>
                  <div className="flex h-36 w-36 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                    <HeartPulse className="h-20 w-20 text-white drop-shadow-md" strokeWidth={2.5} />
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 px-4 py-2 rounded-xl bg-white shadow-lg animate-scale-in animation-delay-200">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-success" />
                    <span className="text-sm font-medium">100% Genuine</span>
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 px-4 py-2 rounded-xl bg-white shadow-lg animate-scale-in animation-delay-400">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">Fast Delivery</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      <section id="medicines">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {searchQuery ? 'Search Results' : 'Popular Medicines'}
            </h2>
            <p className="text-slate-600">{pagination.totalElements} products available</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search medicines..."
                value={localSearch}
                onChange={(e) => handleLocalSearch(e.target.value)}
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              <option value="default">Sort by</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
            {searchQuery && (
              <Button variant="outline" size="sm" onClick={() => { handleLocalSearch(''); setSortOption('default'); }}>
                Clear
              </Button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-danger" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 space-y-4">
                <div className="h-32 bg-slate-200 rounded-xl skeleton" />
                <div className="h-6 bg-slate-200 rounded-lg skeleton" />
                <div className="h-4 bg-slate-200 rounded-lg w-2/3 skeleton" />
                <div className="h-8 bg-slate-200 rounded-lg skeleton" />
              </div>
            ))}
          </div>
        ) : !medicines || medicines.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-100 mb-4">
              <AlertCircle className="h-10 w-10" />
            </div>
            <p className="text-lg font-medium text-slate-700 mb-2">No medicines found</p>
            <p className="text-sm">Try adjusting your search or filter criteria</p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...medicines].sort((a, b) => {
                switch (sortOption) {
                  case 'price-asc': return a.price - b.price;
                  case 'price-desc': return b.price - a.price;
                  case 'name-asc': return a.name.localeCompare(b.name);
                  case 'name-desc': return b.name.localeCompare(a.name);
                  default: return 0;
                }
              }).map((medicine, index) => (
                <Link
                  key={medicine.id}
                  to={`/medicine/${medicine.id}`}
                  className={`group block transition-all duration-300 hover:shadow-card-hover ${mounted ? 'animate-slide-up' : 'opacity-0'}`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <Card className="overflow-hidden h-full">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          toggleWishlist(medicine.id);
                        }}
                        className="absolute left-3 top-3 z-10 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white"
                        aria-label="Toggle wishlist"
                      >
                        <Heart className={`h-4 w-4 ${isWishlisted(medicine.id) ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
                      </button>
                      <img
                        src={getMedicineImage(medicine)}
                        alt={medicine.name}
                        className="h-40 w-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/med-${medicine.id}/400/400`; }}
                      />
                      {(medicine as any).requiresPrescription && (
                        <div className="absolute top-3 left-3">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-medium">
                            Rx
                          </span>
                        </div>
                      )}
                      {!medicine.inStock && (
                        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                          <span className="px-3 py-1.5 rounded-full bg-red-500 text-white text-sm font-medium">
                            Out of Stock
                          </span>
                        </div>
                      )}
                      {medicine.mrp && medicine.mrp > medicine.price && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2 py-1 rounded-lg bg-danger text-white text-xs font-bold">
                            {Math.round((1 - medicine.price / medicine.mrp) * 100)}% OFF
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <p className="text-xs text-primary font-medium">{medicine.categoryName}</p>
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{medicine.name}</h3>
                        <p className="text-sm text-slate-500 line-clamp-1">{medicine.manufacturer || `${medicine.dosageForm} ${medicine.strength}`}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-bold text-slate-900">₹{medicine.price}</span>
                        {medicine.mrp && medicine.mrp > medicine.price && (
                          <span className="text-sm text-slate-400 line-through">₹{medicine.mrp}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <div className={`flex items-center gap-1 ${medicine.inStock ? 'text-success' : 'text-danger'}`}>
                          <div className={`h-2 w-2 rounded-full ${medicine.inStock ? 'bg-success' : 'bg-danger'}`} />
                          {medicine.inStock ? `${medicine.stock} in stock` : 'Out of stock'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 pt-2">
                        <div className="flex items-center gap-1 bg-slate-100 rounded-lg">
                          <button
                            onClick={(e) => { e.preventDefault(); updateQuantity(medicine.id, -1); }}
                            disabled={!medicine.inStock || (quantities[medicine.id] || 1) <= 1}
                            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-medium text-sm">{quantities[medicine.id] || 1}</span>
                          <button
                            onClick={(e) => { e.preventDefault(); updateQuantity(medicine.id, 1); }}
                            disabled={!medicine.inStock}
                            className="w-9 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-200 disabled:opacity-50 rounded-lg transition-colors"
                          >
                            +
                          </button>
                        </div>
                        <Button
                          onClick={(e) => { e.preventDefault(); handleAddToCart(medicine.id, (medicine as any).name, (medicine as any).requiresPrescription); }}
                          disabled={!medicine.inStock}
                          className="flex-1 h-9 text-sm"
                        >
                          <ShoppingCart className="h-4 w-4 mr-1.5" />
                          Add
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-2">
                  {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                    let pageNum = i;
                    if (pagination.totalPages > 5) {
                      const offset = Math.max(0, Math.min(pagination.page - 2, pagination.totalPages - 5));
                      pageNum = offset + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`h-10 w-10 rounded-lg text-sm font-medium transition-colors ${
                          pagination.page === pageNum
                            ? 'bg-primary text-white'
                            : 'bg-white text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {pageNum + 1}
                      </button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages - 1}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      {!searchQuery && recentItems.length > 0 && (
        <section className="animate-slide-up">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Recently Viewed</h2>
            <Link to="/" className="text-sm text-primary hover:underline">Keep exploring</Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recentItems.map((item) => (
              <Link key={item.id} to={`/medicine/${item.id}`} className="min-w-[220px] max-w-[220px]">
                <Card className="overflow-hidden">
                  <img src={getMedicineImage(item)} alt={item.name} className="h-28 w-full object-cover" />
                  <div className="p-3">
                    <p className="truncate font-medium text-slate-900">{item.name}</p>
                    <p className="text-sm text-slate-600">₹{item.price}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      <Modal open={uploadModalOpen} onClose={() => { setUploadModalOpen(false); setPrescriptionFile(null); setPendingMedicine(null); }} title="Upload Prescription">
        <div className="space-y-4">
          {pendingMedicine && (
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100">
              <p className="text-sm text-sky-700">
                <strong>{pendingMedicine.name}</strong> requires a prescription.
              </p>
            </div>
          )}
          <p className="text-slate-600 text-sm">
            Upload your prescription. Accepted formats: JPG, PNG, PDF.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setPrescriptionFile(file);
            }}
          />

          {prescriptionFile ? (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
              <CheckCircle className="h-5 w-5 text-success" />
              <span className="text-sm text-slate-700 flex-1 truncate">{prescriptionFile.name}</span>
              <button onClick={() => setPrescriptionFile(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-8 border-2 border-dashed border-slate-300 rounded-xl hover:border-sky-500 hover:bg-sky-50/50 transition-colors flex flex-col items-center gap-2"
            >
              <Upload className="h-8 w-8 text-slate-400" />
              <span className="text-sm text-slate-600">Click to upload prescription</span>
            </button>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => { setUploadModalOpen(false); setPrescriptionFile(null); setPendingMedicine(null); }}>
              Cancel
            </Button>
            <Button className="flex-1" disabled={!prescriptionFile || uploading} onClick={async () => {
              if (!prescriptionFile || !pendingMedicine) return;
              setUploading(true);
              try {
                const prescription = await prescriptionApi.upload(pendingMedicine.id, prescriptionFile);
                const quantity = quantities[pendingMedicine.id] || 1;
                await addToCart({ medicineId: pendingMedicine.id, quantity, prescriptionId: (prescription as any).id });
                setUploading(false);
                setUploadModalOpen(false);
                setPrescriptionFile(null);
                setPendingMedicine(null);
              } catch (err) {
                setUploading(false);
                alert('Failed to upload prescription. Please try again.');
              }
            }}>
              {uploading ? 'Uploading...' : 'Submit & Add to Cart'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
