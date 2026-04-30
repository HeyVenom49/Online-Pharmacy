import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { addressApi } from '../api/address';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { MapPin, Home, Building, Trash2, Pencil, Check } from 'lucide-react';
import type { Address, AddressRequest } from '../types';

export function AddressPage() {
  const { isAuthenticated } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<AddressRequest>({
    fullAddress: '',
    pincode: '',
    city: '',
    state: '',
    type: 'HOME',
  });

  const loadAddresses = async () => {
    try {
      setLoading(true);
      const data = await addressApi.getAddresses();
      setAddresses(data);
    } catch (err) {
      console.error('Failed to load addresses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) loadAddresses();
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await addressApi.updateAddress(editingId, form);
      } else {
        await addressApi.addAddress(form);
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ fullAddress: '', pincode: '', city: '', state: '', type: 'HOME' });
      loadAddresses();
    } catch (err) {
      console.error('Failed to save address:', err);
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({
      fullAddress: addr.fullAddress,
      landmark: addr.landmark || undefined,
      pincode: addr.pincode,
      city: addr.city,
      state: addr.state,
      type: addr.type,
    });
    setEditingId(addr.id);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this address?')) return;
    await addressApi.deleteAddress(id);
    loadAddresses();
  };

  const handleSetDefault = async (id: number) => {
    await addressApi.setDefault(id);
    loadAddresses();
  };

  if (!isAuthenticated) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-4">
        <MapPin className="h-16 w-16 text-slate-300" />
        <p className="text-lg text-slate-600">Please login to manage addresses</p>
        <Link to="/login"><Button>Login</Button></Link>
      </div>
    );
  }

  const typeIcons: Record<string, React.ReactNode> = {
    HOME: <Home className="h-4 w-4" />,
    WORK: <Building className="h-4 w-4" />,
    OTHER: <MapPin className="h-4 w-4" />,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <Button onClick={() => { setShowForm(true); setEditingId(null); setForm({ fullAddress: '', pincode: '', city: '', state: '', type: 'HOME' }); }}>
          + Add Address
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Address' : 'Add New Address'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2">
                {(['HOME', 'WORK', 'OTHER'] as const).map(type => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setForm({ ...form, type })}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-colors ${
                      form.type === type
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {typeIcons[type]}
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
              <div>
                <label className="text-sm font-medium">Full Address</label>
                <textarea
                  required
                  value={form.fullAddress}
                  onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pincode</label>
                  <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} required />
                </div>
                <div>
                  <label className="text-sm font-medium">City</label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">State</label>
                <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{editingId ? 'Update' : 'Add'} Address</Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-xl skeleton" />
          ))}
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex h-64 flex-col items-center justify-center gap-4 text-slate-500">
          <MapPin className="h-16 w-16 text-slate-300" />
          <p>No addresses saved yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {addresses.map(addr => (
            <Card key={addr.id} className={addr.isDefault ? 'ring-2 ring-primary' : ''}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`mt-1 rounded-lg p-2 ${addr.type === 'HOME' ? 'bg-blue-100 text-blue-600' : addr.type === 'WORK' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-600'}`}>
                      {typeIcons[addr.type]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{addr.type.charAt(0) + addr.type.slice(1).toLowerCase()}</span>
                        {addr.isDefault && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                            <Check className="h-3 w-3" /> Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{addr.fullAddress}</p>
                      <p className="text-sm text-slate-500">{addr.city}, {addr.state} - {addr.pincode}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    {!addr.isDefault && (
                      <button onClick={() => handleSetDefault(addr.id)} className="p-2 text-slate-400 hover:text-green-600" title="Set as default">
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button onClick={() => handleEdit(addr)} className="p-2 text-slate-400 hover:text-blue-600">
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleDelete(addr.id)} className="p-2 text-slate-400 hover:text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
