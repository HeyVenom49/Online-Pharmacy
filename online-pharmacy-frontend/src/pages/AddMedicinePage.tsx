import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Plus, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import type { Category } from '../types';

export function AddMedicinePage() {
  const { medicineId } = useParams<{ medicineId: string }>();
  const isEditMode = Boolean(medicineId);
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingCategories, setFetchingCategories] = useState(true);
  const [fetchingMedicine, setFetchingMedicine] = useState(isEditMode);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: '',
    price: '',
    mrp: '',
    stock: '',
    requiresPrescription: false,
    dosageForm: '',
    strength: '',
    manufacturer: '',
    expiryDate: '',
    batchNumber: '',
  });

  useEffect(() => {
    fetchCategories();
    if (isEditMode && medicineId) {
      fetchMedicine(medicineId);
    }
  }, [medicineId]);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/catalog/categories');
      const data = await res.json();
      setCategories(data.data?.content || data.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setFetchingCategories(false);
    }
  };

  const fetchMedicine = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/catalog/medicines/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const medicine = data.data || data;
      setFormData({
        name: medicine.name || '',
        description: medicine.description || '',
        categoryId: medicine.categoryId || '',
        price: medicine.price?.toString() || '',
        mrp: medicine.mrp?.toString() || '',
        stock: medicine.stock?.toString() || '',
        requiresPrescription: medicine.requiresPrescription || false,
        dosageForm: medicine.dosageForm || '',
        strength: medicine.strength || '',
        manufacturer: medicine.manufacturer || '',
        expiryDate: medicine.expiryDate || '',
        batchNumber: medicine.batchNumber || '',
      });
    } catch (err) {
      console.error('Failed to fetch medicine:', err);
    } finally {
      setFetchingMedicine(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      const method = isEditMode ? 'PUT' : 'POST';
      const url = isEditMode 
        ? `/api/catalog/medicines/${medicineId}` 
        : '/api/catalog/medicines';

      const payload = {
        ...formData,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        price: parseFloat(formData.price),
        mrp: formData.mrp ? parseFloat(formData.mrp) : null,
        stock: formData.stock ? parseInt(formData.stock) : 0,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to save medicine');
      }

      setSuccess(isEditMode ? 'Medicine updated successfully!' : 'Medicine added successfully!');
      setTimeout(() => navigate('/admin/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Link to="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-sky-600 hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
              <Plus className="h-5 w-5 text-sky-600" />
            </div>
            <div>
              <CardTitle className="text-xl">{isEditMode ? 'Edit Medicine' : 'Add New Medicine'}</CardTitle>
              <p className="text-sm text-slate-500">
                {isEditMode ? 'Update medicine details below' : 'Fill in the details to add a new medicine'}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {fetchingMedicine ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-sky-600" />
              </div>
            ) : (
              <>
                {error && (
                  <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b">Basic Information</h3>
                    <div className="grid gap-4 mt-4 sm:grid-cols-2">
                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Medicine Name *</label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="e.g., Paracetamol 500mg"
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Description</label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={3}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          placeholder="Brief description of the medicine"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Category</label>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="">Select category</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Manufacturer</label>
                        <Input
                          name="manufacturer"
                          value={formData.manufacturer}
                          onChange={handleChange}
                          placeholder="e.g., Cipla, GSK"
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b">Pricing & Stock</h3>
                    <div className="grid gap-4 mt-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Price (₹) *</label>
                        <Input
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={handleChange}
                          required
                          placeholder="0.00"
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">MRP (₹)</label>
                        <Input
                          name="mrp"
                          type="number"
                          step="0.01"
                          value={formData.mrp}
                          onChange={handleChange}
                          placeholder="0.00"
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Stock Quantity</label>
                        <Input
                          name="stock"
                          type="number"
                          value={formData.stock}
                          onChange={handleChange}
                          placeholder="0"
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-900 pb-2 border-b">Medicine Details</h3>
                    <div className="grid gap-4 mt-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Dosage Form</label>
                        <select
                          name="dosageForm"
                          value={formData.dosageForm}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        >
                          <option value="">Select form</option>
                          <option value="Tablet">Tablet</option>
                          <option value="Capsule">Capsule</option>
                          <option value="Syrup">Syrup</option>
                          <option value="Injection">Injection</option>
                          <option value="Cream">Cream</option>
                          <option value="Ointment">Ointment</option>
                          <option value="Drops">Drops</option>
                          <option value="Inhaler">Inhaler</option>
                        </select>
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Strength</label>
                        <Input
                          name="strength"
                          value={formData.strength}
                          onChange={handleChange}
                          placeholder="e.g., 500mg, 250mg"
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Expiry Date</label>
                        <Input
                          name="expiryDate"
                          type="date"
                          value={formData.expiryDate}
                          onChange={handleChange}
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">Batch Number</label>
                        <Input
                          name="batchNumber"
                          value={formData.batchNumber}
                          onChange={handleChange}
                          placeholder="e.g., BATCH001"
                          className="border-slate-300 focus:border-sky-500 focus:ring-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 rounded-lg bg-sky-50 border border-sky-200">
                    <input
                      type="checkbox"
                      id="requiresPrescription"
                      name="requiresPrescription"
                      checked={formData.requiresPrescription}
                      onChange={handleChange}
                      className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor="requiresPrescription" className="text-sm font-medium text-slate-700">
                      Requires Prescription - Customers must upload a prescription to purchase this medicine
                    </label>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t">
                  <Button type="submit" disabled={loading} className="bg-sky-600 hover:bg-sky-700">
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {isEditMode ? 'Updating...' : 'Adding...'}
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        {isEditMode ? 'Update Medicine' : 'Add Medicine'}
                      </>
                    )}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => navigate('/admin/dashboard')}>
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}