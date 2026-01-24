import React, { useEffect, useMemo, useState } from 'react';
import { Copy, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { adminDeleteMessage } from '../../lib/api';
import { adminFetch } from '../../lib/adminAuth';
import { AdminSectionHeader } from './AdminSectionHeader';

interface AdminMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  imageUrl?: string | null;
  createdAt: string;
  status?: string;
  type?: 'message' | 'custom_order' | string;
  categoryId?: string | null;
  categoryName?: string | null;
  categoryIds?: string[];
  categoryNames?: string[];
  isRead?: boolean;
  readAt?: string | null;
  inspoExampleId?: string | null;
  inspoTitle?: string | null;
  inspoImageUrl?: string | null;
}

export interface AdminMessagesTabProps {
  onCreateCustomOrderFromMessage?: (message: {
    id: string;
    name: string;
    email: string;
    message: string;
  }) => void;
  onUnreadCountChange?: (count: number) => void;
}

export const AdminMessagesTab: React.FC<AdminMessagesTabProps> = ({ onCreateCustomOrderFromMessage, onUnreadCountChange }) => {
  const [messages, setMessages] = useState<AdminMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<AdminMessage | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const getTypeLabel = (type?: string | null) =>
    type === 'custom_order' ? 'Custom Order' : 'Message';

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await adminFetch('/api/admin/messages');
        if (!res.ok) throw new Error('Failed to load messages');
        const json = await res.json();
        let incoming: AdminMessage[];
        if (Array.isArray(json)) {
          incoming = json as AdminMessage[];
        } else if (Array.isArray(json?.messages)) {
          incoming = json.messages as AdminMessage[];
        } else {
          console.error('[AdminMessagesTab] Unexpected messages payload', json);
          incoming = [];
        }
        console.log('[AdminMessagesTab] Loaded messages', incoming);
        setMessages(incoming);
        const unreadCount =
          typeof json?.unreadCount === 'number'
            ? json.unreadCount
            : incoming.reduce((count, msg) => count + (msg.isRead ? 0 : 1), 0);
        onUnreadCountChange?.(unreadCount);
      } catch (err) {
        console.error('[AdminMessagesTab] Failed to load messages', err);
        setError('Failed to load messages');
      } finally {
        setIsLoading(false);
      }
    };

    void load();
  }, []);

  const sortedMessages = useMemo(
    () =>
      [...messages].sort((a, b) => {
        const aDate = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bDate = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bDate - aDate;
      }),
    [messages]
  );

  const openMessage = (msg: AdminMessage) => {
    setSelectedMessage(msg);
    setIsDialogOpen(true);
    if (!msg.isRead) {
      setMessages((prev) => {
        const next = prev.map((item) => (item.id === msg.id ? { ...item, isRead: true } : item));
        const unreadCount = next.reduce((count, item) => count + (item.isRead ? 0 : 1), 0);
        onUnreadCountChange?.(unreadCount);
        return next;
      });
      void markMessageRead(msg.id);
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
  };

  const handleDeleteMessage = () => {
    if (!selectedMessage) return;
    setIsDeleteConfirmOpen(true);
  };

  const handleCreateCustomOrder = () => {
    if (!selectedMessage || !onCreateCustomOrderFromMessage) return;
    onCreateCustomOrderFromMessage({
      id: selectedMessage.id,
      name: selectedMessage.name || '',
      email: selectedMessage.email || '',
      message: selectedMessage.message || '',
    });
    setIsDialogOpen(false);
    setSelectedMessage(null);
  };

  const markMessageRead = async (id: string) => {
    try {
      const res = await adminFetch('/api/admin/messages/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to mark message as read');
      }
      const data = await res.json().catch(() => null);
      if (typeof data?.unreadCount === 'number') {
        onUnreadCountChange?.(data.unreadCount);
      }
    } catch (err) {
      console.error('[AdminMessagesTab] Failed to mark message as read', err);
      setMessages((prev) => {
        const next = prev.map((item) => (item.id === id ? { ...item, isRead: false } : item));
        const unreadCount = next.reduce((count, item) => count + (item.isRead ? 0 : 1), 0);
        onUnreadCountChange?.(unreadCount);
        return next;
      });
      toast.error("Couldn't mark message as read");
    }
  };

  const confirmDeleteMessage = async () => {
    if (!selectedMessage) return;
    const id = selectedMessage.id;
    console.debug('[messages] delete clicked', { id, hasHandler: !!adminDeleteMessage });
    console.debug('[messages] calling delete endpoint', { url: `/api/admin/messages/${id}`, method: 'DELETE' });
    setIsDeleting(true);
    try {
      await adminDeleteMessage(id);
      setMessages((prev) => {
        const next = prev.filter((m) => m.id !== id);
        const unreadCount = next.reduce((count, msg) => count + (msg.isRead ? 0 : 1), 0);
        onUnreadCountChange?.(unreadCount);
        return next;
      });
      setSelectedMessage(null);
      setIsDialogOpen(false);
      setIsDeleteConfirmOpen(false);
      toast.success('Message deleted from dashboard');
    } catch (err) {
      console.error('[AdminMessagesTab] Failed to delete message', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete message');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <AdminSectionHeader title="Messages" subtitle="Customer messages from the contact form." />

      {isLoading && <div className="text-sm text-gray-500">Loading messages...</div>}
      {error && !isLoading && <div className="text-sm text-red-600">{error}</div>}

      {sortedMessages.length === 0 ? (
        <div className="text-sm text-gray-500">No messages yet.</div>
      ) : (
        <>
          <div className="sm:hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                  <th className="px-4 py-2 text-center text-xs font-semibold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {sortedMessages.map((msg) => (
                  <tr key={msg.id || `${msg.email}-${msg.createdAt}`}>
                    <td className="px-4 py-2 text-sm text-gray-900 whitespace-normal break-words leading-tight">
                      <div className="flex items-center gap-2">
                        <span>{msg.name || 'Unknown'}</span>
                        {!msg.isRead && (
                          <span className="notif-circle inline-flex h-2 w-2 rounded-full bg-red-500" aria-label="Unread message" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {getTypeLabel(msg.type)}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <button
                        type="button"
                        className="text-sm font-medium text-gray-700 underline"
                        onClick={() => openMessage(msg)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="hidden sm:block">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Received</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {sortedMessages.map((msg) => (
                    <tr key={msg.id || `${msg.email}-${msg.createdAt}`}>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div className="flex items-center gap-2">
                          <span>{msg.name || 'Unknown'}</span>
                          {!msg.isRead && (
                            <span className="notif-circle inline-flex h-2 w-2 rounded-full bg-red-500" aria-label="Unread message" />
                          )}
                        </div>
                      </td>
                    
                      <td className="px-4 py-2 text-sm text-gray-900">{msg.email || '-'}</td>
                      <td className="px-4 py-3">
                        {msg.imageUrl ? (
                          <img
                            src={msg.imageUrl}
                            alt={msg.name || 'Message image'}
                            className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <span className="text-xs text-slate-400">No image</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-slate-700">
                          {getTypeLabel(msg.type)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="text-sm font-medium text-gray-700 underline"
                          onClick={() => openMessage(msg)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="relative">
          <div className="absolute right-3 top-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleDeleteMessage}
              className="rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center"
              aria-label="Delete message"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={handleCloseDialog}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              CLOSE
            </button>
          </div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Message Details</h2>
          </div>
          {selectedMessage?.type === 'custom_order' && onCreateCustomOrderFromMessage && (
            <div className="mb-4">
              <button
                type="button"
                onClick={handleCreateCustomOrder}
                className="rounded-full bg-[#0b1220] px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#c89f6e]"
              >
                Create Custom Order
              </button>
            </div>
          )}

          <div className="max-h-[80vh] overflow-y-auto overflow-x-hidden">
            {selectedMessage && (
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Type</p>
                  <p className="text-sm text-gray-900">{getTypeLabel(selectedMessage.type)}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Name</p>
                  <p className="text-sm text-gray-900">{selectedMessage.name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Email</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-900">{selectedMessage.email || '-'}</p>
                    {selectedMessage.email && (
                      <Copy
                        className="h-4 w-4 cursor-pointer text-neutral-500 hover:text-neutral-800 transition"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedMessage.email);
                          toast.success('Email copied to clipboard!');
                        }}
                      />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Message</p>
                  <p className="whitespace-pre-wrap break-words text-sm text-gray-900">
                    {selectedMessage.message || '-'}
                  </p>
                </div>
                {selectedMessage.type === 'custom_order' && (
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase">Categories</p>
                    {selectedMessage.categoryNames && selectedMessage.categoryNames.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {selectedMessage.categoryNames.map((category) => (
                          <span
                            key={`${selectedMessage.id}-category-${category}`}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    ) : selectedMessage.categoryName ? (
                      <p className="text-sm text-gray-900">{selectedMessage.categoryName}</p>
                    ) : (
                      <p className="text-sm text-gray-400">None selected</p>
                    )}
                  </div>
                )}
                {selectedMessage.type === 'custom_order' &&
                  (selectedMessage.inspoTitle || selectedMessage.inspoImageUrl) && (
                    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Inspired by</p>
                      <div className="flex items-center gap-3">
                        {selectedMessage.inspoImageUrl && (
                          <img
                            src={selectedMessage.inspoImageUrl}
                            alt={selectedMessage.inspoTitle || 'Inspiration'}
                            className="h-12 w-12 rounded-md border border-slate-200 object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-slate-900">
                            {selectedMessage.inspoTitle || 'Custom inspiration'}
                          </p>
                          {selectedMessage.inspoImageUrl && (
                            <a
                              href={selectedMessage.inspoImageUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs font-medium text-sky-700 hover:underline"
                            >
                              View image
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                {selectedMessage.imageUrl && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold tracking-wide text-slate-500">IMAGE</span>
                      <a
                        href={selectedMessage.imageUrl}
                        download
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-medium text-sky-700 hover:underline"
                      >
                        Download image
                      </a>
                    </div>
                    <div className="overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                      <img
                        src={selectedMessage.imageUrl}
                        alt={selectedMessage.name || 'Uploaded image'}
                        className="block h-auto w-full max-h-[70vh] object-contain"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <ConfirmDialog
        open={isDeleteConfirmOpen}
        title="Are you sure?"
        description="This will permanently delete this message."
        confirmText={isDeleting ? 'Deleting...' : 'Confirm'}
        cancelText="Cancel"
        confirmVariant="danger"
        confirmDisabled={isDeleting}
        cancelDisabled={isDeleting}
        onCancel={() => {
          if (!isDeleting) setIsDeleteConfirmOpen(false);
        }}
        onConfirm={confirmDeleteMessage}
      />
    </div>
  );
};
