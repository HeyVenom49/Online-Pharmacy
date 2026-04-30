// Helper function to get medicine image URL
// In a real app, medicines would have imageUrl field from backend
// For now, we generate consistent placeholder images based on category or id

const categoryImageMap: Record<string, string> = {
  'Analgesics': 'https://images.unsplash.com/photo-1585431664137-636d4b0461d6?w=400&h=400&fit=crop',
  'Antibiotics': 'https://images.unsplash.com/photo-1584017914486-981d0f4b3b18?w=400&h=400&fit=crop',
  'Antipyretics': 'https://images.unsplash.com/photo-1471864190281-d3c36e0a3c8?w=400&h=400&fit=crop',
  'Antihistamines': 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop',
  'Vitamins': 'https://images.unsplash.com/photo-1571019613454-1cb2c29f3cc?w=400&h=400&fit=crop',
  'default': 'https://images.unsplash.com/photo-1587854680354-8b0c96da1d?w=400&h=400&fit=crop',
};

export function getMedicineImage(medicine: { id: number; categoryName?: string | null; name: string }): string {
  const category = medicine.categoryName || 'default';
  return categoryImageMap[category] || `https://picsum.photos/seed/med-${medicine.id}/400/400`;
}

export function getMedicineImageById(id: number, categoryName?: string | null): string {
  const category = categoryName || 'default';
  return categoryImageMap[category] || `https://picsum.photos/seed/med-${id}/400/400`;
}
