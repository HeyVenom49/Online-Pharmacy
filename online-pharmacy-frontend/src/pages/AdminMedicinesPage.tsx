import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ArrowLeft, Plus, Search, Edit, AlertTriangle, Trash2, Filter, X, ArrowUpDown } from 'lucide-react';
import type { Medicine } from '../types';

type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'stock-asc' | 'stock-desc';
type StockFilter = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

export function AdminMedicinesPage() {
  const navigate = useNavigate();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [categories, setCategories] = useState<{id: number; name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [stockFilter, setStockFilter] = useState<StockFilter>('all');
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchMedicines();
    fetchCategories();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await fetch('/api/catalog/medicines?page=0&size=100', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMedicines(data.data?.data || data.data || []);
    } catch {
      // Silently handle fetch errors
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/catalog/categories');
      const data = await res.json();
      setCategories(data.data || []);
    } catch {
      // Silently handle category fetch errors
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    setStockFilter('all');
    setSortOption('name-asc');
  };

  const filteredMedicines = medicines
    .filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.manufacturer?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || m.categoryId === selectedCategory;
      const matchesStock = stockFilter === 'all' ? true :
        stockFilter === 'in-stock' ? m.stock > 20 :
        stockFilter === 'low-stock' ? m.stock > 0 && m.stock <= 20 :
        m.stock === 0;
      return matchesSearch && matchesCategory && matchesStock;
    })
    .sort((a, b) => {
      switch (sortOption) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'stock-asc': return a.stock - b.stock;
        case 'stock-desc': return b.stock - a.stock;
        default: return 0;
      }
    });

  const handleEdit = (id: number) => {
    navigate(`/admin/medicines/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/catalog/medicines/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchMedicines();
    } catch {
      // Silently handle delete errors
    }
  };

  return (
    <div>
      <Link to="/admin/dashboard" className="mb-4 inline-flex items-center gap-2 text-sky-600 hover:text-sky-700">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Medicines</h1>
        <Link to="/admin/medicines/add">
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Medicine
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search medicines by name or manufacturer..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {(selectedCategory || stockFilter !== 'all') && (
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary text-white text-xs">
                {[selectedCategory ? 1 : 0, stockFilter !== 'all' ? 1 : 0].reduce((a, b) => a + b, 0)}
              </span>
            )}
          </Button>
          {(searchQuery || selectedCategory || stockFilter !== 'all' || sortOption !== 'name-asc') && (
            <Button variant="ghost" onClick={clearFilters} className="flex items-center gap-2 text-slate-600">
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl animate-slide-down">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Stock Status</label>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as StockFilter)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="all">All</option>
                <option value="in-stock">In Stock (20+)</option>
                <option value="low-stock">Low Stock (1-20)</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              >
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
                <option value="price-asc">Price (Low to High)</option>
                <option value="price-desc">Price (High to Low)</option>
                <option value="stock-asc">Stock (Low to High)</option>
                <option value="stock-desc">Stock (High to Low)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-slate-600">
        Showing {filteredMedicines.length} of {medicines.length} medicines
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-sky-500" />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-left text-sm">
                <th className="px-4 py-3 font-medium text-slate-600">Name</th>
                <th className="px-4 py-3 font-medium text-slate-600">Category</th>
                <th className="px-4 py-3 font-medium text-slate-600">Price</th>
                <th className="px-4 py-3 font-medium text-slate-600">Stock</th>
                <th className="px-4 py-3 font-medium text-slate-600">Manufacturer</th>
                <th className="px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMedicines.map((medicine) => (
                <tr key={medicine.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{medicine.name}</p>
                      {medicine.requiresPrescription && (
                        <span className="inline-block rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                          Rx Required
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{medicine.categoryName || '-'}</td>
                  <td className="px-4 py-3">
                    <span className="font-medium">₹{medicine.price}</span>
                    {medicine.mrp && medicine.mrp > medicine.price && (
                      <span className="ml-2 text-sm text-slate-400 line-through">₹{medicine.mrp}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {medicine.stock < 20 ? (
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                      ) : null}
                      <span className={medicine.stock < 20 ? 'text-red-600 font-medium' : ''}>
                        {medicine.stock}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{medicine.manufacturer || '-'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => handleEdit(medicine.id!)}>
                        <Edit className="h-3 w-3" />
                        Edit
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1 text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => handleDelete(medicine.id!)}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredMedicines.length === 0 && (
            <div className="py-12 text-center text-slate-500">
              No medicines found
            </div>
          )}
        </div>
      )}
    </div>
  );
}