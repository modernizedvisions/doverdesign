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

const normalizeOptionList = (items: string[]) => {
  const seen = new Set<string>();
  const normalized: string[] = [];
  items.forEach((entry) => {
    const trimmed = entry.trim();
    if (!trimmed) return;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    normalized.push(trimmed);
  });
  return normalized;
};

const addOptionToList = (list: string[], raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return list;
  const key = trimmed.toLowerCase();
  if (list.some((item) => item.toLowerCase() === key)) return list;
  return [...list, trimmed];
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
  const [newCategoryOrder, setNewCategoryOrder] = useState('0');
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionInput, setNewOptionInput] = useState('');
  const [newOptionList, setNewOptionList] = useState<string[]>([]);
  const [categoryMessage, setCategoryMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [editCategoryId, setEditCategoryId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    name: string;
    subtitle: string;
    shipping: string;
    sortOrder: string;
    optionGroupLabel: string;
    optionGroupOptions: string[];
  } | null>(null);
  const [editOptionInput, setEditOptionInput] = useState('');
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

  const normalizeSortOrderInput = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return null;
    return Math.round(parsed);
  };

  const adjustOrderInput = (value: string, delta: number) => {
    const parsed = Number(value);
    const base = Number.isFinite(parsed) ? parsed : 0;
    const next = Math.max(0, Math.round(base + delta));
    return String(next);
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
    const normalizedOrder = normalizeSortOrderInput(editDraft.sortOrder);
    if (normalizedOrder === null) {
      setCategoryMessage('Order must be a non-negative integer.');
      return;
    }

    try {
      const updated = await adminUpdateCategory(cat.id, {
        name: trimmedName,
        subtitle: editDraft.subtitle.trim() || undefined,
        shippingCents: normalized,
        sortOrder: normalizedOrder,
        optionGroupLabel: editDraft.optionGroupLabel.trim() || null,
        optionGroupOptions: normalizeOptionList(editDraft.optionGroupOptions),
      });
      if (updated) {
        const updatedList = normalizeCategoriesList(
          categories.map((c) => (c.id === cat.id ? updated : c))
        );
        onCategoriesChange(updatedList);
        setCategoryMessage('');
        setEditCategoryId(null);
        setEditDraft(null);
        setEditOptionInput('');
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
    const normalizedOrder = normalizeSortOrderInput(newCategoryOrder);
    if (normalizedOrder === null) {
      setCategoryMessage('Order must be a non-negative integer.');
      return;
    }
    try {
      const created = await adminCreateCategory({
        name: trimmed,
        subtitle: newCategorySubtitle.trim() || undefined,
        shippingCents: normalizedShipping,
        sortOrder: normalizedOrder,
        optionGroupLabel: newOptionLabel.trim() || null,
        optionGroupOptions: normalizeOptionList(newOptionList),
      });
      if (created) {
        const updated = normalizeCategoriesList([...categories, created]);
        onCategoriesChange(updated);
        onCategorySelected?.(created.name);
        setNewCategoryName('');
        setNewCategorySubtitle('');
        setNewCategoryShipping('0.00');
        setNewCategoryOrder('0');
        setNewOptionLabel('');
        setNewOptionInput('');
        setNewOptionList([]);
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
      <DialogContent className="flex w-full max-w-2xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden p-0 bg-white">
        {/* Keep header fixed and allow body to scroll within the modal. */}
        <div className="flex items-start justify-between gap-3 border-b border-driftwood/60 px-6 pt-6 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="text-center lux-heading text-lg">
              Category Management
            </DialogTitle>
            <p className="text-center text-sm text-charcoal/70">
              Add or delete categories available to products.
            </p>
          </DialogHeader>
          <button
            type="button"
            onClick={onClose}
            className="lux-button--ghost px-3 py-1 text-[10px]"
          >
            CLOSE
          </button>
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden px-6 pb-6 pt-4">
          {categoryMessage && (
            <div className="rounded-shell border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              {categoryMessage}
            </div>
          )}

          <div className="lux-panel p-4 space-y-3">
            <div className="grid gap-3 md:grid-cols-[1.2fr_1.2fr_0.6fr_0.5fr_auto] md:items-end">
              <div>
                <label className="lux-label text-[10px]">Title</label>
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Category title"
                  className="lux-input text-sm mt-1"
                />
              </div>
              <div>
                <label className="lux-label text-[10px]">Subtitle</label>
                <input
                  type="text"
                  value={newCategorySubtitle}
                  onChange={(e) => setNewCategorySubtitle(e.target.value)}
                  placeholder="Optional subtitle"
                  className="lux-input text-sm mt-1"
                />
              </div>
              <div>
                <label className="lux-label text-[10px]">Shipping</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="^\\d*(\\.\\d{0,2})?$"
                  value={newCategoryShipping}
                  onChange={(e) => setNewCategoryShipping(e.target.value)}
                  className="lux-input text-sm mt-1"
                />
              </div>
              <div>
                <label className="lux-label text-[10px]">Order</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={newCategoryOrder}
                    onChange={(e) => setNewCategoryOrder(e.target.value)}
                    className="lux-input text-sm w-full"
                  />
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => setNewCategoryOrder((prev) => adjustOrderInput(prev, -1))}
                      className="lux-button--ghost px-2 py-1 text-[10px]"
                      aria-label="Decrease order"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewCategoryOrder((prev) => adjustOrderInput(prev, 1))}
                      className="lux-button--ghost px-2 py-1 text-[10px]"
                      aria-label="Increase order"
                    >
                      +
                    </button>
                  </div>
                </div>
                <p className="mt-1 text-[10px] text-charcoal/60">Lower numbers appear first.</p>
              </div>
              <button
                type="button"
                onClick={handleAddCategory}
                disabled={!newCategoryName.trim()}
                className="lux-button px-4 py-2 text-[10px] disabled:opacity-50"
              >
                Add Category
              </button>
            </div>
            <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
              <div>
                <label className="lux-label text-[10px]">Option Group Label</label>
                <input
                  type="text"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  placeholder="Style"
                  className="lux-input text-sm mt-1"
                />
              </div>
              <div>
                <label className="lux-label text-[10px]">Options</label>
                <div className="mt-1 flex gap-2">
                  <input
                    type="text"
                    value={newOptionInput}
                    onChange={(e) => setNewOptionInput(e.target.value)}
                    placeholder="Plain Ring"
                    className="lux-input text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newOptionInput.trim()) return;
                      setNewOptionList((prev) => addOptionToList(prev, newOptionInput));
                      setNewOptionInput('');
                    }}
                    className="lux-button--ghost px-3 py-2 text-[10px]"
                  >
                    Add
                  </button>
                </div>
                {newOptionList.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {newOptionList.map((opt) => (
                      <span key={opt} className="inline-flex items-center gap-2 rounded-full border border-driftwood/60 bg-white/80 px-2 py-1 text-[11px]">
                        {opt}
                        <button
                          type="button"
                          onClick={() => setNewOptionList((prev) => prev.filter((item) => item !== opt))}
                          className="text-charcoal/60 hover:text-red-600"
                          aria-label={`Remove ${opt}`}
                        >
                          x
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="text-xs text-charcoal/60">
              Shipping is a flat per-order fee; the lowest category shipping wins (0 makes shipping free).
            </p>
          </div>

          <div className="border border-driftwood/60 rounded-shell-lg">
            <div className="max-h-72 overflow-y-auto divide-y divide-driftwood/60">
              {isLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-charcoal/60">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : categories.length === 0 ? (
                <p className="px-3 py-2 text-sm text-charcoal/60">No categories yet.</p>
              ) : (
                categories.map((cat) => (
                  <div key={cat.id} className="px-3 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] uppercase tracking-[0.22em] font-semibold text-charcoal truncate">
                          {cat.name || 'UNNAMED CATEGORY'}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.18em] text-charcoal/50">
                          Order {cat.sortOrder ?? 0}
                        </div>
                        {cat.subtitle && (
                          <div className="text-[10px] uppercase tracking-[0.18em] text-charcoal/60 truncate">
                            {cat.subtitle}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          className="lux-button--ghost px-3 py-1 text-[10px]"
                          onClick={() => {
                            if (editCategoryId === cat.id) {
                              setEditCategoryId(null);
                              setEditDraft(null);
                              setEditOptionInput('');
                              return;
                            }
                            const cents = typeof cat.shippingCents === 'number' ? cat.shippingCents : 0;
                            setEditCategoryId(cat.id);
                            setEditDraft({
                              name: cat.name || '',
                              subtitle: cat.subtitle || '',
                              shipping: (cents / 100).toFixed(2),
                              sortOrder: String(cat.sortOrder ?? 0),
                              optionGroupLabel: cat.optionGroupLabel || '',
                              optionGroupOptions: normalizeOptionList(cat.optionGroupOptions || []),
                            });
                            setEditOptionInput('');
                          }}
                        >
                          {editCategoryId === cat.id ? 'Close' : 'Edit'}
                        </button>
                        {isOtherItemsCategory(cat) ? (
                          <span className="text-[10px] uppercase tracking-[0.18em] text-charcoal/50">Required</span>
                        ) : (
                          <button
                            type="button"
                            className="text-charcoal/60 hover:text-red-600"
                            onClick={() => handleDeleteCategory(cat)}
                            aria-label={`Delete ${cat.name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                    {editCategoryId === cat.id && editDraft && (
                      <div className="mt-3 lux-panel p-3 space-y-3">
                        <div className="grid gap-3 md:grid-cols-4">
                          <div>
                            <label className="lux-label text-[10px]">
                              Title
                            </label>
                            <input
                              ref={editTitleRef}
                              type="text"
                              value={editDraft.name}
                              onChange={(e) =>
                                setEditDraft((prev) => (prev ? { ...prev, name: e.target.value } : prev))
                              }
                              className="lux-input text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label className="lux-label text-[10px]">
                              Order
                            </label>
                            <div className="mt-1 flex items-center gap-2">
                              <input
                                type="number"
                                min={0}
                                step={1}
                                value={editDraft.sortOrder}
                                onChange={(e) =>
                                  setEditDraft((prev) => (prev ? { ...prev, sortOrder: e.target.value } : prev))
                                }
                                className="lux-input text-sm w-full"
                              />
                              <div className="flex flex-col gap-1">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditDraft((prev) =>
                                      prev ? { ...prev, sortOrder: adjustOrderInput(prev.sortOrder, -1) } : prev
                                    )
                                  }
                                  className="lux-button--ghost px-2 py-1 text-[10px]"
                                  aria-label="Decrease order"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setEditDraft((prev) =>
                                      prev ? { ...prev, sortOrder: adjustOrderInput(prev.sortOrder, 1) } : prev
                                    )
                                  }
                                  className="lux-button--ghost px-2 py-1 text-[10px]"
                                  aria-label="Increase order"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                            <p className="mt-1 text-[10px] text-charcoal/60">Lower numbers appear first.</p>
                          </div>
                          <div>
                            <label className="lux-label text-[10px]">
                              Subtitle
                            </label>
                            <input
                              type="text"
                              value={editDraft.subtitle}
                              onChange={(e) =>
                                setEditDraft((prev) => (prev ? { ...prev, subtitle: e.target.value } : prev))
                              }
                              className="lux-input text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label className="lux-label text-[10px]">
                              Shipping
                            </label>
                            <input
                              type="text"
                              inputMode="decimal"
                              pattern="^\\d*(\\.\\d{0,2})?$"
                              value={editDraft.shipping}
                              onChange={(e) =>
                                setEditDraft((prev) => (prev ? { ...prev, shipping: e.target.value } : prev))
                              }
                              className="lux-input text-sm mt-1"
                            />
                          </div>
                        </div>
                        <div className="grid gap-3 md:grid-cols-[1fr_1fr]">
                          <div>
                            <label className="lux-label text-[10px]">
                              Option Group Label
                            </label>
                            <input
                              type="text"
                              value={editDraft.optionGroupLabel}
                              onChange={(e) =>
                                setEditDraft((prev) => (prev ? { ...prev, optionGroupLabel: e.target.value } : prev))
                              }
                              placeholder="Style"
                              className="lux-input text-sm mt-1"
                            />
                          </div>
                          <div>
                            <label className="lux-label text-[10px]">Options</label>
                            <div className="mt-1 flex gap-2">
                              <input
                                type="text"
                                value={editOptionInput}
                                onChange={(e) => setEditOptionInput(e.target.value)}
                                placeholder="Plain Ring"
                                className="lux-input text-sm flex-1"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (!editOptionInput.trim()) return;
                                  setEditDraft((prev) =>
                                    prev
                                      ? {
                                          ...prev,
                                          optionGroupOptions: addOptionToList(prev.optionGroupOptions, editOptionInput),
                                        }
                                      : prev
                                  );
                                  setEditOptionInput('');
                                }}
                                className="lux-button--ghost px-3 py-2 text-[10px]"
                              >
                                Add
                              </button>
                            </div>
                            {editDraft.optionGroupOptions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {editDraft.optionGroupOptions.map((opt) => (
                                  <span key={opt} className="inline-flex items-center gap-2 rounded-full border border-driftwood/60 bg-white/80 px-2 py-1 text-[11px]">
                                    {opt}
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditDraft((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                optionGroupOptions: prev.optionGroupOptions.filter((item) => item !== opt),
                                              }
                                            : prev
                                        )
                                      }
                                      className="text-charcoal/60 hover:text-red-600"
                                      aria-label={`Remove ${opt}`}
                                    >
                                      x
                                    </button>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditCategoryId(null);
                              setEditDraft(null);
                              setEditOptionInput('');
                            }}
                            className="lux-button--ghost px-4 py-2 text-[10px]"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(cat)}
                            className="lux-button px-4 py-2 text-[10px]"
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
