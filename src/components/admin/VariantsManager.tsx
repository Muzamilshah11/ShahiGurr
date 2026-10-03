import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { ProductVariant } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { Plus, Edit, Trash2, Check, Star, AlertTriangle, Truck, Tag, X } from 'lucide-react';

interface Props {
  token: string;
}

export const VariantsManager: React.FC<Props> = ({ token }) => {
  const { isUrdu } = useLanguage();
  const { variants, settings, refreshStoreData } = useStore();

  const [deliveryChargeInput, setDeliveryChargeInput] = useState<number>(
    settings?.deliveryCharges !== undefined ? settings.deliveryCharges : 199
  );
  const [savingDelivery, setSavingDelivery] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // New Variant Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWeight, setNewWeight] = useState('1kg');
  const [newName, setNewName] = useState('');
  const [newUrduName, setNewUrduName] = useState('');
  const [newPrice, setNewPrice] = useState<number>(1199);
  const [newOriginalPrice, setNewOriginalPrice] = useState<number>(1699);
  const [newDiscount, setNewDiscount] = useState<number>(29);
  const [newStock, setNewStock] = useState<number>(100);
  const [newBadge, setNewBadge] = useState('');
  const [newUrduBadge, setNewUrduBadge] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrduDesc, setNewUrduDesc] = useState('');
  const [newIsDefault, setNewIsDefault] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Edit Variant Modal State
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Variant Confirmation State
  const [variantToDelete, setVariantToDelete] = useState<ProductVariant | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showNotification = (msg: string) => {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(''), 3500);
  };

  // Save Delivery Fee
  const handleSaveDeliveryCharges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSavingDelivery(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ deliveryCharges: Number(deliveryChargeInput) }),
      });

      if (res.ok) {
        await refreshStoreData();
        showNotification('✓ Delivery charges updated successfully!');
      }
    } catch {
      showNotification('Failed to update delivery charges');
    } finally {
      setSavingDelivery(false);
    }
  };

  // Create Variant (CRUD: Create)
  const handleCreateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsCreating(true);
    try {
      const calculatedDiscount =
        newOriginalPrice > newPrice
          ? Math.round(((newOriginalPrice - newPrice) / newOriginalPrice) * 100)
          : newDiscount;

      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: newName.trim() || `${newWeight} Pack`,
          urduName: newUrduName.trim() || `${newWeight} پیک`,
          weight: newWeight.trim(),
          price: Number(newPrice),
          originalPrice: Number(newOriginalPrice),
          discount: calculatedDiscount,
          stock: Number(newStock),
          badge: newBadge.trim() || undefined,
          urduBadge: newUrduBadge.trim() || undefined,
          description: newDesc.trim() || undefined,
          urduDescription: newUrduDesc.trim() || undefined,
          isDefault: newIsDefault,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showNotification('✓ New variant added successfully!');
        setShowAddForm(false);
        setNewName('');
        setNewUrduName('');
        setNewDesc('');
        setNewUrduDesc('');
        setNewBadge('');
        setNewUrduBadge('');
        setNewIsDefault(false);
        await refreshStoreData();
      } else {
        showNotification(`Error: ${data.error || 'Failed to create'}`);
      }
    } catch (err: any) {
      showNotification(`Failed: ${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  // Update Variant (CRUD: Update)
  const handleUpdateVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVariant || !token) return;

    setIsUpdating(true);
    try {
      const calculatedDiscount =
        editingVariant.originalPrice > editingVariant.price
          ? Math.round(((editingVariant.originalPrice - editingVariant.price) / editingVariant.originalPrice) * 100)
          : editingVariant.discount;

      const res = await fetch(`/api/variants/${editingVariant.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editingVariant.name,
          urduName: editingVariant.urduName,
          weight: editingVariant.weight,
          price: Number(editingVariant.price),
          originalPrice: Number(editingVariant.originalPrice),
          discount: calculatedDiscount,
          stock: Number(editingVariant.stock),
          badge: editingVariant.badge || null,
          urduBadge: editingVariant.urduBadge || null,
          description: editingVariant.description || null,
          urduDescription: editingVariant.urduDescription || null,
          isDefault: Boolean(editingVariant.isDefault),
          isActive: Boolean(editingVariant.isActive),
        }),
      });

      if (res.ok) {
        showNotification('✓ Variant updated successfully!');
        setEditingVariant(null);
        await refreshStoreData();
      }
    } catch (err: any) {
      showNotification(`Update error: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Variant (CRUD: Delete)
  const handleDeleteVariant = async () => {
    if (!variantToDelete || !token) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/variants/${variantToDelete.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        showNotification('✓ Variant deleted from store');
        setVariantToDelete(null);
        await refreshStoreData();
      }
    } catch (err: any) {
      showNotification(`Delete error: ${err.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick Set Default
  const handleSetDefault = async (v: ProductVariant) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/variants/${v.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isDefault: true }),
      });
      if (res.ok) {
        showNotification(`✓ ${v.name} set as default pack`);
        await refreshStoreData();
      }
    } catch (err) {
      console.warn('Set default error:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">Pricing & Sizing Management (CRUD)</h3>
          <p className="text-xs text-[#6B503D]">
            Add, update, delete product size packs, pricing, cut prices, stock, and delivery charges.
          </p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-[#8F5E2B] hover:bg-[#73481E] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? 'Close Add Form' : 'Add New Size Pack'}</span>
        </button>
      </div>

      {statusMsg && (
        <div className="p-3 bg-[#EAF5EC] border border-[#B7DFC6] text-[#1E4D2B] rounded-xl text-xs font-semibold">
          {statusMsg}
        </div>
      )}

      {/* 1. Delivery Charge Controller */}
      <div className="bg-white border border-[#D9C8B5] p-5 rounded-2xl shadow-xs">
        <form onSubmit={handleSaveDeliveryCharges} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#D9C8B5] flex items-center justify-center text-[#8F5E2B]">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#24140D]">Standard Nationwide Delivery Fee (PKR)</h4>
              <p className="text-[11px] text-[#6B503D]">Applied to every customer checkout order.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C7662]">Rs.</span>
              <input
                type="number"
                min="0"
                value={deliveryChargeInput}
                onChange={(e) => setDeliveryChargeInput(Number(e.target.value))}
                className="w-32 pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-bold text-[#24140D]"
              />
            </div>
            <button
              type="submit"
              disabled={savingDelivery}
              className="px-4 py-2 bg-[#24140D] hover:bg-[#3D2619] text-white text-xs font-bold rounded-xl cursor-pointer disabled:opacity-50"
            >
              {savingDelivery ? 'Saving...' : 'Save Delivery Fee'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Add New Variant Form (Create) */}
      {showAddForm && (
        <div className="bg-white border-2 border-[#8F5E2B] p-5 sm:p-6 rounded-2xl shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8DCcb]">
            <h4 className="text-sm font-bold text-[#24140D] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#8F5E2B]" />
              <span>Create New Product Variant Pack</span>
            </h4>
            <button onClick={() => setShowAddForm(false)} className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateVariant} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Weight / Size (e.g. 250g, 500g, 1kg, 2kg, 5kg) *</label>
                <input
                  type="text"
                  required
                  value={newWeight}
                  onChange={(e) => {
                    setNewWeight(e.target.value);
                    if (!newName) setNewName(`${e.target.value} Pack`);
                    if (!newUrduName) setNewUrduName(`${e.target.value} پیک`);
                  }}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Variant Name (English) *</label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. 1kg Classic Pack"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Variant Name (Urdu) *</label>
                <input
                  type="text"
                  required
                  value={newUrduName}
                  onChange={(e) => setNewUrduName(e.target.value)}
                  placeholder="مثلاً: 1 کلو گرام کلاسک پیک"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl font-urdu"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Sale Price (PKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newPrice}
                  onChange={(e) => setNewPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Original / Cut Price (PKR) *</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newOriginalPrice}
                  onChange={(e) => setNewOriginalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Stock Quantity *</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={newStock}
                  onChange={(e) => setNewStock(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Badge (e.g. Most Popular)</label>
                <input
                  type="text"
                  value={newBadge}
                  onChange={(e) => setNewBadge(e.target.value)}
                  placeholder="e.g. Best Value"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Short Description (English)</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="e.g. Flagship pack loaded with extra roasted cashews."
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Short Description (Urdu)</label>
                <input
                  type="text"
                  value={newUrduDesc}
                  onChange={(e) => setNewUrduDesc(e.target.value)}
                  placeholder="مثلاً: سب سے زیادہ پسندیدہ پیکنگ، کاجو اور بادام سے بھرپور۔"
                  className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl font-urdu"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="newIsDefault"
                  checked={newIsDefault}
                  onChange={(e) => setNewIsDefault(e.target.checked)}
                  className="w-4 h-4 text-[#8F5E2B] rounded cursor-pointer"
                />
                <label htmlFor="newIsDefault" className="font-bold text-[#24140D] cursor-pointer">
                  Set as Default Selected Pack
                </label>
              </div>

              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2.5 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isCreating ? 'Creating Variant...' : 'Save New Variant'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 3. Active Variants Table (Read / Update / Delete) */}
      <div className="bg-white border border-[#D9C8B5] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 bg-[#F4EDE1] border-b border-[#E0D1BF] flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#24140D]">
            All Active Store Variants ({variants.length})
          </h4>
          <span className="text-[11px] text-[#6B503D]">Click Edit to update price or Delete to remove</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#24140D] text-white uppercase text-[10px] tracking-wider">
              <tr>
                <th className="p-3">Weight</th>
                <th className="p-3">Variant Name</th>
                <th className="p-3">Sale Price</th>
                <th className="p-3">Original Price</th>
                <th className="p-3">Discount</th>
                <th className="p-3">Stock</th>
                <th className="p-3">Badge</th>
                <th className="p-3 text-center">Default</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EADFCF]">
              {variants.map((v) => (
                <tr key={v.id} className="hover:bg-[#FAF7F2] transition-colors">
                  <td className="p-3 font-bold text-[#8F5E2B] font-mono">{v.weight}</td>
                  <td className="p-3">
                    <span className="font-bold text-[#24140D] block">{v.name}</span>
                    <span className="text-[11px] text-[#8C7662] font-urdu">{v.urduName}</span>
                  </td>
                  <td className="p-3 font-bold text-[#24140D] tabular-nums font-mono text-sm">
                    {formatPKR(v.price)}
                  </td>
                  <td className="p-3 text-[#8C7662] line-through tabular-nums font-mono">
                    {formatPKR(v.originalPrice)}
                  </td>
                  <td className="p-3 font-semibold text-[#2E7D32]">{v.discount}% off</td>
                  <td className="p-3 tabular-nums font-mono">{v.stock} units</td>
                  <td className="p-3">
                    {v.badge ? (
                      <span className="px-2 py-0.5 bg-[#EFE7DC] text-[#8F5E2B] font-bold text-[10px] rounded-md">
                        {v.badge}
                      </span>
                    ) : (
                      <span className="text-stone-400">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {v.isDefault ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2E7D32] bg-[#EAF5EC] px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> Default
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSetDefault(v)}
                        className="text-[10px] text-[#8F5E2B] hover:underline font-semibold cursor-pointer"
                      >
                        Set Default
                      </button>
                    )}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setEditingVariant({ ...v })}
                        className="p-1.5 text-[#8F5E2B] hover:bg-[#EFE7DC] rounded-lg transition-colors cursor-pointer"
                        title="Edit Price & Details"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setVariantToDelete(v)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Variant Modal (CRUD: Update) */}
      {editingVariant && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCcb]">
              <h4 className="text-base font-bold text-[#24140D]">Edit Variant Price & Pack Details</h4>
              <button onClick={() => setEditingVariant(null)} className="p-1 text-stone-500 hover:text-stone-900 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateVariant} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Weight / Size</label>
                  <input
                    type="text"
                    required
                    value={editingVariant.weight}
                    onChange={(e) => setEditingVariant({ ...editingVariant, weight: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={editingVariant.stock}
                    onChange={(e) => setEditingVariant({ ...editingVariant, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Sale Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingVariant.price}
                    onChange={(e) => setEditingVariant({ ...editingVariant, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-bold text-sm text-[#8F5E2B]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Original / Cut Price (PKR)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={editingVariant.originalPrice}
                    onChange={(e) => setEditingVariant({ ...editingVariant, originalPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Variant Name (English)</label>
                  <input
                    type="text"
                    required
                    value={editingVariant.name}
                    onChange={(e) => setEditingVariant({ ...editingVariant, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Variant Name (Urdu)</label>
                  <input
                    type="text"
                    required
                    value={editingVariant.urduName}
                    onChange={(e) => setEditingVariant({ ...editingVariant, urduName: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-urdu"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Badge (English)</label>
                  <input
                    type="text"
                    value={editingVariant.badge || ''}
                    onChange={(e) => setEditingVariant({ ...editingVariant, badge: e.target.value })}
                    placeholder="e.g. Most Popular"
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">Badge (Urdu)</label>
                  <input
                    type="text"
                    value={editingVariant.urduBadge || ''}
                    onChange={(e) => setEditingVariant({ ...editingVariant, urduBadge: e.target.value })}
                    placeholder="مثلاً: سب سے مقبول"
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-urdu"
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editDefault"
                    checked={editingVariant.isDefault}
                    onChange={(e) => setEditingVariant({ ...editingVariant, isDefault: e.target.checked })}
                    className="w-4 h-4 text-[#8F5E2B] rounded cursor-pointer"
                  />
                  <label htmlFor="editDefault" className="font-bold text-[#24140D] cursor-pointer">
                    Default Pack
                  </label>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="editActive"
                    checked={editingVariant.isActive}
                    onChange={(e) => setEditingVariant({ ...editingVariant, isActive: e.target.checked })}
                    className="w-4 h-4 text-[#8F5E2B] rounded cursor-pointer"
                  />
                  <label htmlFor="editActive" className="font-bold text-[#24140D] cursor-pointer">
                    Active for Sale
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E8DCcb]">
                <button
                  type="button"
                  onClick={() => setEditingVariant(null)}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-[#8F5E2B] hover:bg-[#73481E] text-white rounded-xl font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (CRUD: Delete) */}
      {variantToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-red-300 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-red-900 font-serif-brand">Delete Variant Pack</h3>
            <p className="text-xs text-stone-600">
              Are you sure you want to delete <span className="font-bold text-[#24140D]">{variantToDelete.name} ({variantToDelete.weight})</span>? This variant will no longer be available on the storefront.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setVariantToDelete(null)}
                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteVariant}
                disabled={isDeleting}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete Variant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
