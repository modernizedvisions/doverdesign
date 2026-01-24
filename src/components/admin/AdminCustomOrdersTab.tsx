import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Archive } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useForm } from 'react-hook-form';
import { AdminSectionHeader } from './AdminSectionHeader';
import { AdminSaveButton } from './AdminSaveButton';
import { adminUploadImageScoped } from '../../lib/api';

interface AdminCustomOrdersTabProps {
  allCustomOrders: any[];
  onCreateOrder: (data: any) => Promise<void> | void;
  onUpdateOrder?: (id: string, data: any) => Promise<void> | void;
  onReloadOrders?: () => Promise<void> | void;
  onSendPaymentLink?: (id: string) => Promise<void> | void;
  onArchiveOrder?: (id: string) => Promise<void> | void;
  initialDraft?: any;
  onDraftConsumed?: () => void;
  isLoading?: boolean;
  error?: string | null;
}

type CustomOrderImageState = {
  url: string | null;
  imageId?: string | null;
  storageKey?: string | null;
  previewUrl?: string | null;
  uploading: boolean;
  optimizing?: boolean;
  uploadError?: string | null;
};

export const AdminCustomOrdersTab: React.FC<AdminCustomOrdersTabProps> = ({
  allCustomOrders,
  onCreateOrder,
  onUpdateOrder,
  onReloadOrders,
  onSendPaymentLink,
  onArchiveOrder,
  initialDraft,
  onDraftConsumed,
  isLoading,
  error,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const createImageInputRef = useRef<HTMLInputElement | null>(null);
  const viewImageInputRef = useRef<HTMLInputElement | null>(null);
  const buildImageState = (
    url?: string | null,
    imageId?: string | null,
    storageKey?: string | null
  ): CustomOrderImageState => ({
    url: url || null,
    imageId: imageId || null,
    storageKey: storageKey || null,
    previewUrl: url || null,
    uploading: false,
    uploadError: null,
  });
  const [draftImage, setDraftImage] = useState<CustomOrderImageState>(() => buildImageState(null));
  const [viewImage, setViewImage] = useState<CustomOrderImageState>(() => buildImageState(null));
  const [viewShipping, setViewShipping] = useState('');
  const [viewShowOnSoldProducts, setViewShowOnSoldProducts] = useState(false);
  const [viewSaveState, setViewSaveState] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [isArchiveConfirmOpen, setIsArchiveConfirmOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [archiveNotice, setArchiveNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const draftDefaults = useMemo(() => {
    if (!initialDraft) return undefined;
    const draftShipping =
      typeof initialDraft.shippingCents === 'number'
        ? (initialDraft.shippingCents / 100).toFixed(2)
        : '';
    return {
      customerName: initialDraft.customerName || '',
      customerEmail: initialDraft.customerEmail || '',
      description: initialDraft.description || '',
      amount: initialDraft.amount ?? '',
      shipping: draftShipping,
      showOnSoldProducts: false,
    };
  }, [initialDraft]);

  const { register, handleSubmit, reset, formState, setValue } = useForm({
    defaultValues: {
      customerName: '',
      customerEmail: '',
      description: '',
      amount: '',
      shipping: '',
      showOnSoldProducts: false,
    },
  });

  useEffect(() => {
    if (initialDraft) {
      const draftShipping =
        typeof initialDraft.shippingCents === 'number'
          ? (initialDraft.shippingCents / 100).toFixed(2)
          : '';
      const mappedDraft = {
        customerName: initialDraft.customerName || '',
        customerEmail: initialDraft.customerEmail || '',
        description: initialDraft.description || '',
        amount: initialDraft.amount ?? '',
        shipping: draftShipping,
        showOnSoldProducts: false,
      };
      reset(mappedDraft);
      setIsModalOpen(true);
      onDraftConsumed?.();
    }
  }, [initialDraft, onDraftConsumed, reset]);

  useEffect(() => {
    if (!isModalOpen) {
      reset({
        customerName: '',
        customerEmail: '',
        description: '',
        amount: '',
        shipping: '',
        showOnSoldProducts: false,
      });
      setDraftImage(buildImageState(null));
    }
  }, [isModalOpen, reset]);

  useEffect(() => {
    if (!archiveNotice) return;
    const timeout = window.setTimeout(() => setArchiveNotice(null), 3000);
    return () => window.clearTimeout(timeout);
  }, [archiveNotice]);

  const startImageUpload = async (
    file: File,
    setState: React.Dispatch<React.SetStateAction<CustomOrderImageState>>
  ) => {
    const previewUrl = URL.createObjectURL(file);
    let previousUrl: string | null = null;
    let previousImageId: string | null = null;
    let previousStorageKey: string | null = null;
    setState((prev) => {
      previousUrl = prev.url ?? null;
      previousImageId = prev.imageId ?? null;
      previousStorageKey = prev.storageKey ?? null;
      return {
        ...prev,
        previewUrl,
        uploading: true,
        optimizing: true,
        uploadError: null,
      };
    });

    try {
      const result = await adminUploadImageScoped(file, {
        scope: 'custom-orders',
        onStatus: (status) => {
          setState((prev) => ({
            ...prev,
            uploading: true,
            optimizing: status === 'optimizing',
          }));
        },
      });
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      const resolvedImageId = result.imageId || result.id || null;
      const resolvedStorageKey = result.storageKey || null;
      setState({
        url: result.url,
        imageId: resolvedImageId,
        storageKey: resolvedStorageKey,
        previewUrl: result.url,
        uploading: false,
        optimizing: false,
        uploadError: null,
      });
    } catch (err) {
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
      const message = err instanceof Error ? err.message : 'Upload failed';
      setState({
        url: previousUrl,
        imageId: previousImageId,
        storageKey: previousStorageKey,
        previewUrl: previousUrl,
        uploading: false,
        optimizing: false,
        uploadError: message,
      });
    }
  };

  const removeImage = (
    setState: React.Dispatch<React.SetStateAction<CustomOrderImageState>>
  ) => {
    setState((prev) => {
      if (prev.previewUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(prev.previewUrl);
      }
      return buildImageState(null);
    });
  };
  const handleDraftImageRemove = () => {
    removeImage(setDraftImage);
    setValue('showOnSoldProducts', false);
  };
  const handleViewImageRemove = () => {
    removeImage(setViewImage);
    setViewShowOnSoldProducts(false);
  };

  if (import.meta.env.DEV) {
    console.debug('[custom orders tab] render', { count: allCustomOrders.length });
  }

  const openView = (order: any) => {
    setSelectedOrder(order);
    setViewImage(
      buildImageState(
        order.imageUrl || order.image_url || null,
        order.imageId || order.image_id || null,
        order.imageStorageKey || order.image_storage_key || null
      )
    );
    const shipping = resolveShippingCents(order);
    setViewShipping(shipping ? (shipping / 100).toFixed(2) : '');
    const showOnSold = order.showOnSoldProducts === true || order.show_on_sold_products === 1;
    setViewShowOnSoldProducts(showOnSold);
    setViewSaveState('idle');
    setIsViewOpen(true);
  };

  const closeView = () => {
    setIsViewOpen(false);
    setSelectedOrder(null);
    setIsArchiveConfirmOpen(false);
    setIsArchiving(false);
    setViewImage(buildImageState(null));
    setViewSaveState('idle');
    setViewShipping('');
    setViewShowOnSoldProducts(false);
  };

  const handleArchive = async () => {
    if (!selectedOrder || !onArchiveOrder) return;
    setIsArchiving(true);
    setArchiveNotice(null);
    try {
      await onArchiveOrder(selectedOrder.id);
      setArchiveNotice({
        type: 'success',
        message: `Archived ${normalizeDisplayId(selectedOrder)}.`,
      });
      setIsArchiveConfirmOpen(false);
      closeView();
    } catch (err) {
      setArchiveNotice({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to archive custom order',
      });
    } finally {
      setIsArchiving(false);
    }
  };
  const formatCurrency = (cents: number | null | undefined) => `${((cents ?? 0) / 100).toFixed(2)}`;
  const safeDate = (value?: string | null) => (value ? new Date(value).toLocaleString() : 'Unknown date');
  const normalizeDisplayId = (order: any) =>
    order.displayCustomOrderId || order.display_custom_order_id || order.id || 'Order';
  const normalizeShippingCents = (raw: string): number => {
    const trimmed = raw.trim();
    if (!trimmed) return 0;
    const parsed = Number(trimmed);
    if (!Number.isFinite(parsed) || parsed < 0) return 0;
    return Math.round(parsed * 100);
  };
  const resolveShippingCents = (order: any) => {
    if (!order) return 0;
    if (typeof order.shippingCents === 'number') return order.shippingCents;
    if (typeof order.shipping_cents === 'number') return order.shipping_cents;
    return 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
      <div className="space-y-3">
        <AdminSectionHeader
          title="Custom Orders"
          subtitle="Manage bespoke customer requests and payment links."
        />
        <div className="flex justify-center sm:justify-end">
          <button
            type="button"
            onClick={() => {
              reset(draftDefaults || { customerName: '', customerEmail: '', description: '', amount: '' });
              setIsModalOpen(true);
            }}
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
          >
            New Custom Order
          </button>
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={() => onReloadOrders?.()}
              className="ml-2 rounded-md border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:border-gray-400"
            >
              Debug: Reload
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {archiveNotice && (
        <div
          className={`rounded-md border px-4 py-3 text-sm ${
            archiveNotice.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-red-200 bg-red-50 text-red-700'
          }`}
        >
          {archiveNotice.message}
        </div>
      )}

      <div className="rounded-md border border-gray-200">
        {isLoading ? (
          <div className="p-4 text-sm text-gray-600">Loading custom orders...</div>
        ) : allCustomOrders.length === 0 ? (
          <div className="p-4 text-sm text-gray-600">No custom orders yet.</div>
        ) : (
          <>
            <div className="sm:hidden">
              <div className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] gap-3 border-b border-gray-200 bg-gray-50 px-4 py-2 text-[11px] font-semibold uppercase text-gray-600">
                <div>Customer</div>
                <div className="text-center">Status</div>
                <div className="text-right">Actions</div>
              </div>
              <div className="divide-y divide-gray-200 bg-white">
                {allCustomOrders.map((order) => {
                  const statusLabel = order.status || 'pending';
                  const hasPaymentLink = !!order.paymentLink;
                  const isPaid = statusLabel === 'paid';
                  return (
                    <div
                      key={order.id}
                      className="grid grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,1fr)] gap-3 px-4 py-3 text-sm text-gray-900"
                    >
                      <div className="whitespace-normal break-words font-medium">
                        {order.customerName || 'Customer'}
                      </div>
                      <div className="flex items-start justify-center pt-1">
                        <span
                          role="img"
                          aria-label={isPaid ? 'Paid' : 'Not paid'}
                          className={`text-lg font-semibold ${isPaid ? 'text-emerald-600' : 'text-amber-600'}`}
                        >
                          {isPaid ? '\u2713' : '\u2715'}
                        </span>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          type="button"
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:border-gray-400"
                          onClick={() => openView(order)}
                        >
                          View
                        </button>
                        <button
                          type="button"
                          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                          disabled={isPaid}
                          title={isPaid ? 'Already paid' : hasPaymentLink ? 'Resend payment link' : ''}
                          onClick={() => onSendPaymentLink?.(order.id)}
                        >
                          <span className="block leading-tight">{hasPaymentLink ? 'Resend' : 'Send'}</span>
                          <span className="block leading-tight">Payment</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="hidden sm:block">
              <div className="overflow-x-auto">

            <table className="min-w-full divide-y divide-gray-200 text-sm">
  <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
    <tr>
      <th className="px-4 py-2 text-center">Order ID</th>
      <th className="px-4 py-2 text-center">Customer</th>
      <th className="px-4 py-2 text-center">Email</th>
      <th className="px-4 py-2 text-center">Amount</th>
      <th className="px-4 py-2 text-center">Status</th>
      <th className="px-4 py-2 text-center">View</th>
      <th className="px-4 py-2 text-center">Actions</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-200 bg-white text-gray-900">
    {allCustomOrders.map((order) => {
      const amount = typeof order.amount === 'number' ? order.amount : null;
      const shippingCents = resolveShippingCents(order);
      const totalCents = amount !== null ? amount + shippingCents : null;
      const amountLabel = totalCents !== null ? `$${(totalCents / 100).toFixed(2)}` : '--';
      const statusLabel = order.status || 'pending';
      const displayId = normalizeDisplayId(order);
      const hasPaymentLink = !!order.paymentLink;
      return (
        <tr key={order.id}>
          <td className="px-4 py-2 text-center align-middle font-mono text-xs text-gray-700">{displayId}</td>
          <td className="px-4 py-2 text-center align-middle">{order.customerName || 'Customer'}</td>
          <td className="px-4 py-2 text-center align-middle">{order.customerEmail || '--'}</td>
          <td className="px-4 py-2 text-center align-middle">{amountLabel}</td>
          <td className="px-4 py-2 text-center align-middle capitalize">{statusLabel}</td>
          <td className="px-4 py-2 text-center align-middle">
            <div className="flex justify-center">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:border-gray-400"
                onClick={() => openView(order)}
              >
                View
              </button>
            </div>
          </td>
          <td className="px-4 py-2 text-center align-middle">
            <div className="flex justify-center">
              <button
                type="button"
                className="rounded-md border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 disabled:opacity-60 disabled:cursor-not-allowed"
                disabled={statusLabel === 'paid'}
                title={statusLabel === 'paid' ? 'Already paid' : hasPaymentLink ? 'Resend payment link' : ''}
                onClick={() => onSendPaymentLink?.(order.id)}
              >
                {hasPaymentLink ? 'Resend Payment Link' : 'Send Payment Link'}
              </button>
            </div>
          </td>
        </tr>
      );
    })}
  </tbody>
</table>
          
              </div>
            </div>
          </>
        )}
      </div>

      {isViewOpen && selectedOrder && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-3 py-6">
          <div className="relative w-full max-w-xl rounded-2xl bg-white shadow-xl border border-slate-100 p-6 max-h-[85vh] overflow-y-auto">
                        <div className="absolute right-3 top-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsArchiveConfirmOpen(true)}
                disabled={!selectedOrder || !onArchiveOrder || isArchiving}
                className="rounded-full bg-slate-100 p-2 text-slate-700 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Archive custom order"
                title="Archive"
              >
                <Archive className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={closeView}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              >
                CLOSE
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1">Custom Order</p>
                <div className="text-xl font-semibold text-slate-900">
                  Order {normalizeDisplayId(selectedOrder)}
                </div>
                <p className="text-sm text-slate-600">
                  Placed {safeDate(selectedOrder.createdAt || selectedOrder.created_at)}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <section className="rounded-lg border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">Customer</p>
                  <div className="text-sm text-slate-900">{selectedOrder.customerName || '-'}</div>
                  <div className="text-sm text-slate-600">{selectedOrder.customerEmail || '-'}</div>
                </section>

                <section className="rounded-lg border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">Shipping</p>
                  {selectedOrder.shippingAddress ? (
                    <div className="text-sm text-slate-700 whitespace-pre-line">
                      {[
                        selectedOrder.shippingAddress.name,
                        selectedOrder.shippingAddress.line1,
                        selectedOrder.shippingAddress.line2,
                        [selectedOrder.shippingAddress.city, selectedOrder.shippingAddress.state, selectedOrder.shippingAddress.postal_code]
                          .filter(Boolean)
                          .join(', '),
                        selectedOrder.shippingAddress.country,
                        selectedOrder.shippingAddress.phone ? `Phone: ${selectedOrder.shippingAddress.phone}` : null,
                      ]
                        .filter((line) => line && String(line).trim().length > 0)
                        .join('\n') || 'No shipping address collected.'}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">No shipping address collected.</div>
                  )}
                </section>

                <section className="rounded-lg border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-1.5">Status</p>
                  <div className="flex flex-wrap gap-2 text-xs font-semibold">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 border ${
                        (selectedOrder.status || 'pending') === 'paid'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}
                    >
                      {(selectedOrder.status || 'pending').toUpperCase()}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-700 border border-slate-200">
                      {safeDate(selectedOrder.createdAt || selectedOrder.created_at)}
                    </span>
                    {viewShowOnSoldProducts && (
                      <span className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-white border border-slate-900">
                        Visible in Sold Products
                      </span>
                    )}
                  </div>
                </section>

                                <section className="rounded-lg border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">Totals</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Subtotal</span>
                      <span className="font-medium text-slate-900">
                        {typeof selectedOrder.amount === 'number' ? formatCurrency(selectedOrder.amount) : '--'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Shipping</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(resolveShippingCents(selectedOrder))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Total</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(
                          (typeof selectedOrder.amount === 'number' ? selectedOrder.amount : 0) +
                            resolveShippingCents(selectedOrder)
                        )}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-1">
                    <label className="block text-xs font-medium text-slate-600">Edit shipping (USD)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={viewShipping}
                      onChange={(e) => setViewShipping(e.target.value)}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                    />
                    <p className="text-[11px] text-slate-500">Leave blank for $0.00.</p>
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">Message</p>
                  <div className="text-sm text-slate-900 whitespace-pre-wrap">
                    {selectedOrder.description || '-'}
                  </div>
                </section>

                <section className="rounded-lg border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">Image</p>
                  <div className="flex flex-wrap items-start gap-4">
                    <div className="h-24 w-24 rounded-md border border-slate-200 bg-slate-50 overflow-hidden">
                      {viewImage.previewUrl ? (
                        <img
                          src={viewImage.previewUrl}
                          alt="Custom order"
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() => viewImageInputRef.current?.click()}
                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-400"
                      >
                        {viewImage.url ? 'Replace Image' : 'Upload Image'}
                      </button>
                      {viewImage.url && (
                        <button
                          type="button"
                          onClick={handleViewImageRemove}
                          className="block text-xs text-slate-600 underline hover:text-slate-800"
                        >
                          Remove image
                        </button>
                      )}
                      {viewImage.uploading && (
                        <div className="text-xs text-slate-500">
                          {viewImage.optimizing ? 'Optimizing image...' : 'Uploading image...'}
                        </div>
                      )}
                      {viewImage.uploadError && (
                        <div className="text-xs text-red-600">{viewImage.uploadError}</div>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 space-y-1">
                    <label className="flex items-center gap-2 text-sm text-slate-700">
                      <input
                        type="checkbox"
                        checked={viewShowOnSoldProducts}
                        onChange={(e) => setViewShowOnSoldProducts(e.target.checked)}
                        disabled={!viewImage.url}
                        className="h-4 w-4 rounded border-gray-300 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <span className={viewImage.url ? '' : 'opacity-50'}>Display Custom Order On Sold Products</span>
                    </label>
                    {!viewImage.url && (
                      <p className="text-xs text-slate-500">Upload an image to enable this option.</p>
                    )}
                  </div>
                  <input
                    ref={viewImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void startImageUpload(file, setViewImage);
                      }
                      if (viewImageInputRef.current) {
                        viewImageInputRef.current.value = '';
                      }
                    }}
                  />
                </section>

                <section className="rounded-lg border border-slate-200 p-4">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500 mb-2">Payment Link</p>
                  {selectedOrder.paymentLink ? (
                    <div className="flex items-center gap-3 flex-wrap">
                      <a
                        href={selectedOrder.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        Open Stripe Checkout
                      </a>
                      <button
                        type="button"
                        className="text-xs text-slate-600 hover:text-slate-800 underline"
                        onClick={() => {
                          if (navigator?.clipboard?.writeText) {
                            navigator.clipboard.writeText(selectedOrder.paymentLink);
                          }
                        }}
                      >
                        Copy link
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-600">Not sent yet.</div>
                  )}
                </section>

                <div className="flex justify-end">
                  <AdminSaveButton
                    saveState={viewSaveState}
                    onClick={async () => {
                      if (!selectedOrder || !onUpdateOrder) return;
                      const currentUrl = selectedOrder.imageUrl || selectedOrder.image_url || null;
                      const currentShipping = resolveShippingCents(selectedOrder);
                      const currentShowOnSold =
                        selectedOrder.showOnSoldProducts === true || selectedOrder.show_on_sold_products === 1;
                      const desiredShipping = normalizeShippingCents(viewShipping || '');
                      const hasImageChange = viewImage.url !== currentUrl;
                      const hasShippingChange = desiredShipping !== currentShipping;
                      const hasShowOnSoldChange = viewShowOnSoldProducts !== currentShowOnSold;
                      const hasChanges = hasImageChange || hasShippingChange || hasShowOnSoldChange;
                      if (viewImage.uploading || viewImage.uploadError || !hasChanges) return;
                      setViewSaveState('saving');
                      try {
                        const updates: any = {};
                        if (hasImageChange) {
                          updates.imageUrl = viewImage.url;
                          updates.imageId = viewImage.imageId || null;
                          updates.imageStorageKey = viewImage.storageKey || null;
                        }
                        if (hasShippingChange) updates.shippingCents = desiredShipping;
                        if (hasShowOnSoldChange) updates.showOnSoldProducts = viewShowOnSoldProducts;
                        await onUpdateOrder(selectedOrder.id, updates);
                        setSelectedOrder((prev: any) =>
                          prev
                            ? {
                                ...prev,
                                ...(hasImageChange ? { imageUrl: viewImage.url } : {}),
                                ...(hasShippingChange ? { shippingCents: desiredShipping } : {}),
                              }
                            : prev
                        );
                        setViewShipping(desiredShipping ? (desiredShipping / 100).toFixed(2) : '');
                        setViewSaveState('success');
                        setTimeout(() => setViewSaveState('idle'), 1500);
                      } catch (err) {
                        console.error('Failed to update custom order', err);
                        setViewSaveState('error');
                        setTimeout(() => setViewSaveState('idle'), 1500);
                      }
                    }}
                    disabled={
                      !onUpdateOrder ||
                      viewImage.uploading ||
                      !!viewImage.uploadError ||
                      (viewImage.url === (selectedOrder.imageUrl || selectedOrder.image_url || null) &&
                        normalizeShippingCents(viewShipping || '') === resolveShippingCents(selectedOrder) &&
                        viewShowOnSoldProducts ===
                          (selectedOrder.showOnSoldProducts === true ||
                            selectedOrder.show_on_sold_products === 1))
                    }
                    idleLabel="Save Changes"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={isArchiveConfirmOpen}
        title="Archive custom order?"
        description={`Confirm archiving "${selectedOrder ? normalizeDisplayId(selectedOrder) : 'Order'}". This removes it from the active list but keeps it saved for records.`}
        confirmText={isArchiving ? 'Archiving...' : 'Archive'}
        cancelText="Cancel"
        confirmVariant="danger"
        confirmDisabled={isArchiving}
        cancelDisabled={isArchiving}
        onCancel={() => setIsArchiveConfirmOpen(false)}
        onConfirm={handleArchive}
      />
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Order</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <form
              className="space-y-4"
              onSubmit={handleSubmit(async (values) => {
                if (draftImage.uploading || draftImage.uploadError) return;
                const shippingCents = normalizeShippingCents(values.shipping || '');
                const showOnSoldProducts = !!draftImage.url && values.showOnSoldProducts === true;
                await onCreateOrder({
                  ...values,
                  shippingCents,
                  showOnSoldProducts,
                  imageUrl: draftImage.url || null,
                  imageId: draftImage.imageId || null,
                  imageStorageKey: draftImage.storageKey || null,
                });
                setIsModalOpen(false);
              })}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    {...register('customerName', { required: true })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Email</label>
                  <input
                    type="email"
                    {...register('customerEmail', { required: true })}
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  rows={4}
                  {...register('description', { required: true })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image (optional)</label>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="h-24 w-24 rounded-md border border-slate-200 bg-slate-50 overflow-hidden">
                    {draftImage.previewUrl ? (
                      <img
                        src={draftImage.previewUrl}
                        alt="Custom order"
                        className="h-full w-full object-cover"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xs text-slate-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => createImageInputRef.current?.click()}
                      className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:border-gray-400"
                    >
                      {draftImage.url ? 'Replace Image' : 'Upload Image'}
                    </button>
                    {draftImage.url && (
                      <button
                        type="button"
                        onClick={handleDraftImageRemove}
                        className="block text-xs text-slate-600 underline hover:text-slate-800"
                      >
                        Remove image
                      </button>
                    )}
                    {draftImage.uploading && (
                      <div className="text-xs text-slate-500">
                        {draftImage.optimizing ? 'Optimizing image...' : 'Uploading image...'}
                      </div>
                    )}
                    {draftImage.uploadError && (
                      <div className="text-xs text-red-600">{draftImage.uploadError}</div>
                    )}
                  </div>
                </div>
                <input
                  ref={createImageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      void startImageUpload(file, setDraftImage);
                    }
                    if (createImageInputRef.current) {
                      createImageInputRef.current.value = '';
                    }
                  }}
                />
              </div>
              <div className="space-y-1">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    {...register('showOnSoldProducts')}
                    disabled={!draftImage.url}
                    className="h-4 w-4 rounded border-gray-300 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className={draftImage.url ? '' : 'opacity-50'}>Display Custom Order On Sold Products</span>
                </label>
                {!draftImage.url && (
                  <p className="text-xs text-slate-500">Upload an image to enable this option.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('amount', { required: true })}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Shipping (optional)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  {...register('shipping')}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:border-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formState.isSubmitting || draftImage.uploading || !!draftImage.uploadError}
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-60"
                >
                  {formState.isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};





