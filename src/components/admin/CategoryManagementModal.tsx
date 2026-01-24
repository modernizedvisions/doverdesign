import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { adminCreateCategory, adminDeleteCategory, adminFetchCategories, adminUpdateCategory } from '../../lib/api';
import type { Category } from '../../lib/types';

interface CategoryManagementModalProps {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onCategoriesChange: (categories: Category[]) => void;
  onCategorySelected?: (name: string) => void;
}

const OTHER_ITEMS_CATEGORY = {
  slug: 'other-items',
  name: 'Other Items',
};

const isOtherItemsCategory = (category: Category) =>
  (category.slug || '').toLowerCase() === OTHER_ITEMS_CATEGORY.slug ||
  (category.name || '').trim().toLowerCase() === OTHER_ITEMS_CATEGORY.name.toLowerCase();

const normalizeCategoriesList = (items: Category[]): Category[] => {
  const map = new Map<string, Category>();
  items.forEach((cat) => {
    const key = cat.id || cat.name;
    if (!key) return;
    const normalized: Category = { ...cat, id: cat.id || key };
    map.set(key, normalized);
  });
  const ordered = Array.from(map.values()).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
  const otherItems = ordered.filter((cat) => isOtherItemsCategory(cat));
  const withoutOtherItems = ordered.filter((cat) => !isOtherItemsCategory(cat));
  return [...withoutOtherItems, ...otherItems];
};

export function CategoryManagementModal({
  open,
  onClose,
  categories,
  onCategoriesChange,
  onCategorySelected,
}: CategoryManagementModalProps) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategorySubtitle, setNewCategorySubtitle] = useState('');
  const [newCategoryShipping, setNewCategoryShipping] = useState('0.00');
  const [categoryMessage, setCategoryMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{ name: string; subtitle: string; shipping: string } | null>(null);
  const editTitleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const apiCategories = await adminFetchCategories();
        const normalized = normalizeCategoriesList(apiCategories);
        onCategoriesChange(normalized);
        setEditCategoryId(null);
        setEditDraft(null);
        setCategoryMessage('');
      } catch (error) {
        console.error('Failed to load categories', error);
        setCategoryMessage('Could not load categories.');
      } finally {
        setIsLoading(false);
      }
    };
    void load();
  }, [open]);

  useEffect(() => {
    if (editCategoryId && editTitleRef.current) {
      editTitleRef.current.focus();
      editTitleRef.current.select();
    }
  }, [editCategoryId]);

  const normalizeShippingInput = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed * 100);
  };

  const handleSaveEdit = async (cat: Category) => {
    if (!editDraft) return;
    const trimmedName = editDraft.name.trim();
    if (!trimmedName) {
      setCategoryMessage('Title is required.');
      return;
    }
    const raw = editDraft.shipping;
    const normalized = normalizeShippingInput(raw);
    if (normalized === null) {
      setCategoryMessage('Shipping must be a non-negative number.');
      return;
    }

    try {
      const updated = await adminUpdateCategory(cat.id, {
        name: trimmedName,
        subtitle: editDraft.subtitle.trim() || undefined,
        shippingCents: normalized,
      });
      if (updated) {
        const updatedList = normalizeCategoriesList(
          categories.map((c) => (c.id === cat.id ? updated : c))
        );
        onCategoriesChange(updatedList);
        setCategoryMessage('');
        setEditCategoryId(null);
        setEditDraft(null);
      }
    } catch (error) {
      console.error('Failed to update category', error);
      setCategoryMessage('Could not update category.');
    }
  };

  const handleAddCategory = async () => {
    const trimmed = newCategoryName.trim();
    if (!trimmed) {
      setCategoryMessage('Title is required.');
      return;
    }
    const normalizedShipping = normalizeShippingInput(newCategoryShipping);
    if (normalizedShipping === null) {
      setCategoryMessage('Shipping must be a non-negative number.');
      return;
    }
    try {
      const created = await adminCreateCategory({
        name: trimmed,
        subtitle: newCategorySubtitle.trim() || undefined,
        shippingCents: normalizedShipping,
      });
      if (created) {
        const updated = normalizeCategoriesList([...categories, created]);
        onCategoriesChange(updated);
        onCategorySelected?.(created.name);
        setNewCategoryName('');
        setNewCategorySubtitle('');
        setNewCategoryShipping('0.00');
        setCategoryMessage('');
      }
    } catch (error) {
      console.error('Failed to create category', error);
      setCategoryMessage('Could not create category.');
    }
  };

  const handleDeleteCategory = async (cat: Category) => {
    if (isOtherItemsCategory(cat)) {
      setCategoryMessage('This category is required and cannot be deleted.');
      return;
    }
    const confirmed = window.confirm('Delete this category?');
    if (!confirmed) return;
    try {
      await adminDeleteCategory(cat.id);
      const updated = normalizeCategoriesList(categories.filter((c) => c.id !== cat.id));
      onCategoriesChange(updated);
      if (editCategoryId === cat.id) {
        setEditCategoryId(null);
        setEditDraft(null);
      }
    } catch (error) {
      console.error('Failed to delete category', error);
      setCategoryMessage('Could not delete category.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="relative max-w-lg">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
        >
          CLOSE
        </button>
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-center text-lg font-semibold tracking-[0.15em] uppercase text-slate-900">
            Category Management
          </DialogTitle>
          <p className="text-center text-sm text-slate-600">
            Add or delete categories available to products.
          </p>
        </DialogHeader>

        <div className="space-y-4">
          {categoryMessage && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {categoryMessage}
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-[1.2fr_1.2fr_0.6fr_auto] md:items-end">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">Title</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category title"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">Subtitle</label>
                <input
                  type="text"
                  value={newCategorySubtitle}
                  onChange={(e) => setNewCategorySubtitle(e.target.value)}
                  placeholder="Optional subtitle"
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">Shipping</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={newCategoryShipping}
                  onChange={(e) => setNewCategoryShipping(e.target.value)}
                  className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                />
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Shipping is a flat per-order fee; the lowest category shipping wins (0 makes shipping free).
            </p>
          </div>

          <div className="border border-slate-200 rounded-lg">
            <div className="max-h-72 overflow-y-auto divide-y divide-slate-200">
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : categories.length === 0 ? (
                <p className="px-3 py-2 text-sm text-slate-500">No categories yet.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-medium text-slate-800 truncate">{cat.name}</div>
                        {cat.subtitle && (
                          <div className="text-xs text-slate-500 truncate">{cat.subtitle}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="rounded-md border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          onClick={() => {
                            if (editCategoryId === cat.id) {
                              setEditCategoryId(null);
                              setEditDraft(null);
                              return;
                            }
                            const cents = typeof cat.shippingCents === 'number' ? cat.shippingCents : 0;
                            setEditCategoryId(cat.id);
                            setEditDraft({
                              name: cat.name || '',
                              subtitle: cat.subtitle || '',
                              shipping: (cents / 100).toFixed(2),
                            });
                          }}
                        >
                          {editCategoryId === cat.id ? 'Close' : 'Edit'}
                        </button>
                        {isOtherItemsCategory(cat) ? (
                          <span className="text-xs text-slate-400">Required</span>
                        ) : (
                          <button
                            type="button"
                            className="text-slate-500 hover:text-red-600"
                            onClick={() => handleDeleteCategory(cat)}
                            aria-label={`Delete ${cat.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {editCategoryId === cat.id && editDraft && (
                      <div className="mt-3 rounded-md border border-slate-200 bg-white p-3 space-y-3">
                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Title
                            </label>
                            <input
                              ref={editTitleRef}
                              type="text"
                              value={editDraft.name}
                              onChange={(e) =>
                                setEditDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                              }
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Subtitle
                            </label>
                            <input
                              type="text"
                              value={editDraft.subtitle}
                              onChange={(e) =>
                                setEditDraft((prev) => (prev ? { ...prev, subtitle: e.target.value } : prev))
                              }
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600">
                              Shipping
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={editDraft.shipping}
                              onChange={(e) =>
                                setEditDraft((prev) => (prev ? { ...prev, shipping: e.target.value } : prev))
                              }
                              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditCategoryId(null);
                              setEditDraft(null);
                            }}
                            className="rounded-md border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat)}
                            className="rounded-md bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
