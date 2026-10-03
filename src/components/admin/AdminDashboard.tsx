import React, { useState, useEffect, useCallback, useRef } from 'react';
import { jsPDF } from 'jspdf';
import { useLanguage } from '../../context/LanguageContext';
import { useStore } from '../../context/StoreContext';
import { Order, ProductMedia } from '../../types';
import { formatPKR } from '../../utils/formatters';
import { downloadReceiptPng } from '../../utils/receiptGenerator';
import { VariantsManager } from './VariantsManager';
import {
  Shield,
  X,
  Lock,
  LogOut,
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Image as ImageIcon,
  Film,
  Upload,
  Link as LinkIcon,
  Trash2,
  Edit,
  Plus,
  Star,
  CheckCircle,
  Truck,
  MessageCircle,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  Search,
  Printer,
  Download,
  Play,
  Settings,
} from 'lucide-react';

const COURIER_OPTIONS = ['TCS Express', 'Leopards Courier', 'PostEx', 'Trax Logistics', 'Call Courier', 'M&P Express', 'Rider Self Delivery'];

export const AdminDashboard: React.FC = () => {
  const { isUrdu } = useLanguage();
  const { isAdminOpen, setIsAdminOpen, settings, product, variants, refreshStoreData } = useStore();

  // Auth State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('khyber_admin_token'));
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'variants' | 'media' | 'settings' | 'security'>('overview');

  // Orders Admin State
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateRangeFilter, setDateRangeFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrdersCount, setTotalOrdersCount] = useState(0);

  // Selected Order for Edit / View Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [editStatus, setEditStatus] = useState('pending');
  const [editPaymentStatus, setEditPaymentStatus] = useState('pending');
  const [editCourier, setEditCourier] = useState('');
  const [editTrackingNumber, setEditTrackingNumber] = useState('');
  const [editDispatchNotes, setEditDispatchNotes] = useState('');
  const [historyNote, setHistoryNote] = useState('');
  const [isUpdatingOrder, setIsUpdatingOrder] = useState(false);

  // Delete Order Dialog
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  // Reset Orders Dialog
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  // Media Management State
  const [mediaList, setMediaList] = useState<ProductMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaMsg, setMediaMsg] = useState('');
  const [uploadMode, setUploadMode] = useState<'device' | 'url'>('device');
  const [newMediaTitle, setNewMediaTitle] = useState('');
  const [newMediaUrduTitle, setNewMediaUrduTitle] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaCategory, setNewMediaCategory] = useState('showcase');
  const [newMediaIsHero, setNewMediaIsHero] = useState(false);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement>(null);

  // Edit Media Modal State
  const [editingMedia, setEditingMedia] = useState<ProductMedia | null>(null);
  const [replacingMedia, setReplacingMedia] = useState<ProductMedia | null>(null);
  const [replaceMode, setReplaceMode] = useState<'device' | 'url'>('device');
  const [replaceUrl, setReplaceUrl] = useState('');
  const [replacePreview, setReplacePreview] = useState<string | null>(null);
  const replaceFileInputRef = useRef<HTMLInputElement>(null);

  // Video Management State
  const [videoUrlInput, setVideoUrlInput] = useState(settings?.heroVideoUrl || '');
  const [videoMode, setVideoMode] = useState<'device' | 'url'>('url');
  const [videoFilePreview, setVideoFilePreview] = useState<string | null>(null);
  const [isSavingVideo, setIsSavingVideo] = useState(false);
  const [videoMsg, setVideoMsg] = useState('');
  const videoFileInputRef = useRef<HTMLInputElement>(null);

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<any>(settings || {});
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState('');
  const [sheetTestMsg, setSheetTestMsg] = useState('');

  // Password Change State
  const [currPass, setCurrPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [passMsg, setPassMsg] = useState('');

  // Google Apps Script template code
  const googleAppsScriptCode = `function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    // Append order row
    sheet.appendRow([
      data.orderId,
      data.createdAt,
      data.customerName,
      data.phone,
      data.whatsapp || data.phone,
      data.city,
      data.address,
      data.variantName,
      data.quantity,
      data.unitPrice,
      data.deliveryCharge,
      data.total,
      data.paymentMethod,
      data.transactionId || '',
      data.paymentStatus,
      data.orderStatus
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({result: "success"})).setMimeType(ContentService.MimeType.JSON);
  } catch(error) {
    return ContentService.createTextOutput(JSON.stringify({result: "error", error: error.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search: orderSearch,
        status: statusFilter,
        paymentStatus: paymentFilter,
        dateRange: dateRangeFilter,
      });

      const res = await fetch(`/api/orders?${params.toString()}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        setToken(null);
        localStorage.removeItem('khyber_admin_token');
        return;
      }

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        setStats(data.stats || null);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalOrdersCount(data.pagination?.total || 0);
      }
    } catch (err: any) {
      console.warn('Admin orders notice:', err?.message || err);
    } finally {
      setLoadingOrders(false);
    }
  }, [token, page, orderSearch, statusFilter, paymentFilter, dateRangeFilter]);

  const fetchMedia = useCallback(async () => {
    setLoadingMedia(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setMediaList(data.media || []);
      }
    } catch (err) {
      console.warn('Failed to load media list:', err);
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  useEffect(() => {
    if (token && isAdminOpen) {
      fetchOrders();
      fetchMedia();
    }
  }, [token, isAdminOpen, fetchOrders, fetchMedia]);

  useEffect(() => {
    if (settings) {
      setSettingsForm(settings);
      setVideoUrlInput(settings.heroVideoUrl || '');
    }
  }, [settings]);

  if (!isAdminOpen) return null;

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        setToken(data.token);
        localStorage.setItem('khyber_admin_token', data.token);
        setPassword('');
      } else {
        setLoginError(data.error || 'Invalid credentials');
      }
    } catch {
      setLoginError('Login request failed');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('khyber_admin_token');
  };

  const openOrderEdit = (order: Order) => {
    setSelectedOrder(order);
    setEditStatus(order.orderStatus);
    setEditPaymentStatus(order.paymentStatus);
    setEditCourier(order.courierName || 'TCS Express');
    setEditTrackingNumber(order.trackingNumber || '');
    setEditDispatchNotes(order.dispatchNotes || '');
    setHistoryNote('');
  };

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !token) return;

    setIsUpdatingOrder(true);
    try {
      const res = await fetch(`/api/orders/${selectedOrder.orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderStatus: editStatus,
          paymentStatus: editPaymentStatus,
          courierName: editCourier,
          trackingNumber: editTrackingNumber,
          dispatchNotes: editDispatchNotes,
          historyNote: historyNote.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSelectedOrder(null);
        fetchOrders();
      }
    } catch (err) {
      console.error('Update order error:', err);
    } finally {
      setIsUpdatingOrder(false);
    }
  };

  const handleDeleteOrder = async () => {
    if (!orderToDelete || !token) return;
    setIsDeletingOrder(true);
    try {
      const res = await fetch(`/api/orders/${orderToDelete.orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setOrderToDelete(null);
        fetchOrders();
      }
    } catch (err) {
      console.error('Delete order error:', err);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const handleResetOrders = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders/reset', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setShowResetConfirm(false);
        fetchOrders();
      }
    } catch (err) {
      console.error('Reset orders error:', err);
    }
  };

  const handleExportCsv = () => {
    if (!token) return;
    const url = `/api/orders/export?status=${statusFilter}`;
    window.open(url, '_blank');
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('KHYBER GURR CO. - DISPATCH & PACKING LIST', 14, 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString('en-PK')}`, 14, 28);
    doc.text(`Total Filtered Orders: ${orders.length}`, 14, 34);

    let y = 45;
    doc.setFont('helvetica', 'bold');
    doc.text('Order ID', 14, y);
    doc.text('Customer & City', 50, y);
    doc.text('Pack & Qty', 110, y);
    doc.text('Total (PKR)', 155, y);
    doc.text('Status', 185, y);

    doc.line(14, y + 2, 196, y + 2);
    y += 8;

    doc.setFont('helvetica', 'normal');
    orders.forEach((o) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(o.orderId, 14, y);
      doc.text(`${o.customerName} (${o.city})`, 50, y);
      doc.text(`${o.variantName} x${o.quantity}`, 110, y);
      doc.text(formatPKR(o.total), 155, y);
      doc.text(o.orderStatus.toUpperCase(), 185, y);
      y += 7;
    });

    doc.save(`Dispatch-Sheet-${Date.now()}.pdf`);
  };

  // Device Image File Selection Handler
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setUploadPreview(dataUrl);
      if (!newMediaTitle) {
        setNewMediaTitle(file.name.replace(/\.[^/.]+$/, ''));
      }
    };
    reader.readAsDataURL(file);
  };

  // Add / Upload New Media
  const handleAddMedia = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    let finalImageUrl = newMediaUrl.trim();

    setIsUploadingMedia(true);
    setMediaMsg('');

    try {
      // If uploading from device, send to /api/media/upload
      if (uploadMode === 'device') {
        if (!uploadPreview) {
          setMediaMsg('Please select an image file from your device');
          setIsUploadingMedia(false);
          return;
        }

        const uploadRes = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dataUrl: uploadPreview,
            fileName: newMediaTitle || 'image.jpg',
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || 'Failed to upload image file');
        }
        finalImageUrl = uploadData.url;
      }

      if (!finalImageUrl) {
        setMediaMsg('Image URL or file is required');
        setIsUploadingMedia(false);
        return;
      }

      // Save media record in Prisma
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: newMediaTitle.trim() || 'Gurr Product Photo',
          urduTitle: newMediaUrduTitle.trim() || 'گُڑ کی تصویر',
          imageUrl: finalImageUrl,
          category: newMediaCategory,
          isHero: newMediaIsHero,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMediaMsg('✓ Image successfully added to store!');
        setNewMediaTitle('');
        setNewMediaUrduTitle('');
        setNewMediaUrl('');
        setUploadPreview(null);
        setNewMediaIsHero(false);
        if (imageFileInputRef.current) imageFileInputRef.current.value = '';
        await fetchMedia();
        await refreshStoreData();
      } else {
        setMediaMsg(`Error: ${data.error || 'Failed to save media'}`);
      }
    } catch (err: any) {
      setMediaMsg(`Upload error: ${err.message}`);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Set Hero Image
  const handleSetHero = async (mediaId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isHero: true }),
      });
      if (res.ok) {
        await fetchMedia();
        await refreshStoreData();
        setMediaMsg('✓ Primary hero image updated!');
        setTimeout(() => setMediaMsg(''), 3000);
      }
    } catch (err) {
      console.warn('Failed to set hero image:', err);
    }
  };

  // Delete Media
  const handleDeleteMedia = async (mediaId: string) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this media image from the store?')) return;

    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        await fetchMedia();
        await refreshStoreData();
        setMediaMsg('✓ Image deleted');
        setTimeout(() => setMediaMsg(''), 3000);
      }
    } catch (err) {
      console.warn('Failed to delete media:', err);
    }
  };

  // Replace Media Handler
  const handleReplaceMediaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replacingMedia || !token) return;

    let targetUrl = replaceUrl.trim();
    setIsUploadingMedia(true);

    try {
      if (replaceMode === 'device' && replacePreview) {
        const uploadRes = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dataUrl: replacePreview,
            fileName: replacingMedia.title || 'replaced.jpg',
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || 'Failed to upload replacement file');
        }
        targetUrl = uploadData.url;
      }

      if (!targetUrl) {
        alert('Please select a replacement image or enter a URL');
        setIsUploadingMedia(false);
        return;
      }

      const res = await fetch(`/api/media/${replacingMedia.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl: targetUrl }),
      });

      if (res.ok) {
        setReplacingMedia(null);
        setReplacePreview(null);
        setReplaceUrl('');
        await fetchMedia();
        await refreshStoreData();
        setMediaMsg('✓ Image replaced successfully!');
        setTimeout(() => setMediaMsg(''), 3000);
      }
    } catch (err: any) {
      alert(`Replacement error: ${err.message}`);
    } finally {
      setIsUploadingMedia(false);
    }
  };

  // Video Device File Selection
  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setVideoFilePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Save / Upload Video Settings
  const handleSaveVideoSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    setIsSavingVideo(true);
    setVideoMsg('');
    let finalVideoUrl = videoUrlInput.trim();

    try {
      if (videoMode === 'device' && videoFilePreview) {
        setVideoMsg('Uploading video file to store...');
        const uploadRes = await fetch('/api/media/upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dataUrl: videoFilePreview,
            fileName: 'heritage_video.mp4',
          }),
        });

        const uploadData = await uploadRes.json();
        if (!uploadRes.ok || !uploadData.url) {
          throw new Error(uploadData.error || 'Failed to upload video');
        }
        finalVideoUrl = uploadData.url;
        setVideoUrlInput(finalVideoUrl);
      }

      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ heroVideoUrl: finalVideoUrl }),
      });

      if (res.ok) {
        setVideoMsg('✓ Product video updated successfully!');
        await refreshStoreData();
        setTimeout(() => setVideoMsg(''), 3000);
      } else {
        setVideoMsg('Failed to update video settings');
      }
    } catch (err: any) {
      setVideoMsg(`Video error: ${err.message}`);
    } finally {
      setIsSavingVideo(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSavingSettings(true);
    setSettingsMsg('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsForm),
      });

      if (res.ok) {
        setSettingsMsg('Store configuration saved successfully!');
        await refreshStoreData();
        setTimeout(() => setSettingsMsg(''), 3000);
      }
    } catch {
      setSettingsMsg('Failed to save settings');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleTestSheets = async () => {
    if (!token || !settingsForm.sheetsWebhookUrl) return;
    setSheetTestMsg('Testing webhook...');
    try {
      const res = await fetch('/api/settings/test-sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ webhookUrl: settingsForm.sheetsWebhookUrl }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setSheetTestMsg('✓ Test ping sent successfully to Google Sheets!');
      } else {
        setSheetTestMsg(`✗ Error: ${data.error}`);
      }
    } catch (e: any) {
      setSheetTestMsg(`✗ Failed: ${e.message}`);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPassMsg('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword: currPass, newPassword: newPass }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setPassMsg('Password changed successfully!');
        setCurrPass('');
        setNewPass('');
      } else {
        setPassMsg(data.error || 'Failed to update password');
      }
    } catch {
      setPassMsg('Network error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-6xl w-full my-auto shadow-2xl overflow-hidden relative max-h-[95vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top App Header */}
        <div className="bg-[#24140D] text-white px-6 py-4 flex items-center justify-between border-b border-[#3D2619] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8F5E2B] flex items-center justify-center text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold font-serif-brand">{settings?.storeName || 'Shahi Gurr Co.'} • Admin Operations</h2>
              <span className="text-[11px] text-[#D4A373]">Full Control: Media, Video, Orders & Store Settings</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {token && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 rounded-lg text-stone-200 transition-colors cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}

            <button
              onClick={() => setIsAdminOpen(false)}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label="Close Admin"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!token ? (
          /* Admin Login Screen */
          <div className="p-8 sm:p-12 max-w-md mx-auto w-full text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-[#EFE7DC] text-[#8F5E2B] flex items-center justify-center mx-auto shadow-sm">
              <Lock className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">Admin Authentication</h3>
              <p className="text-xs text-[#6B503D] mt-1">
                Enter your administrative credentials to manage store & media.
              </p>
            </div>

            {loginError && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-800 rounded-xl text-xs">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-[#4A3222] mb-1">Username</label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3222] mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="admin123"
                  className="w-full px-4 py-2.5 bg-white border border-[#D9C8B5] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3.5 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isLoggingIn ? 'Verifying...' : 'Sign In to Dashboard'}</span>
              </button>
            </form>
          </div>
        ) : (
          /* Main Admin Workspace */
          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            
            {/* Sidebar Navigation */}
            <div className="w-full md:w-60 bg-[#F4EDE1] border-r border-[#E0D1BF] p-3 flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'orders', label: 'Orders', icon: ShoppingBag, count: totalOrdersCount },
                { id: 'variants', label: 'Pricing & Sizing', icon: Tag, count: variants.length },
                { id: 'media', label: 'Media & Video', icon: ImageIcon, count: mediaList.length },
                { id: 'settings', label: 'Store Settings', icon: Settings },
                { id: 'security', label: 'Security', icon: Lock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      isActive
                        ? 'bg-[#8F5E2B] text-white shadow-sm'
                        : 'text-[#5A3E2B] hover:bg-[#EAE0D3] hover:text-[#24140D]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.count !== undefined && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-[#E0D1BF] text-[#24140D]'}`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto bg-[#FAF7F2]">
              
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">Performance Overview</h3>
                    <p className="text-xs text-[#6B503D]">Real-time operational indicators from SQLite.</p>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white border border-[#D9C8B5] p-4 rounded-2xl shadow-xs">
                      <span className="text-xs text-[#8C7662] block mb-1">Total Sales Revenue</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#24140D] tabular-nums font-mono">
                        {formatPKR(stats?.totalRevenue || 0)}
                      </span>
                      <span className="text-[11px] text-[#2E7D32] block mt-1">Confirmed & Delivered</span>
                    </div>

                    <div className="bg-white border border-[#D9C8B5] p-4 rounded-2xl shadow-xs">
                      <span className="text-xs text-[#8C7662] block mb-1">Total Orders</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#24140D] tabular-nums">
                        {stats?.totalOrders || 0}
                      </span>
                      <span className="text-[11px] text-[#8F5E2B] block mt-1">{stats?.todayCount || 0} placed today</span>
                    </div>

                    <div className="bg-white border border-[#D9C8B5] p-4 rounded-2xl shadow-xs">
                      <span className="text-xs text-[#8C7662] block mb-1">Pending Confirmation</span>
                      <span className="text-xl sm:text-2xl font-bold text-amber-800 tabular-nums">
                        {stats?.pendingCount || 0}
                      </span>
                      <span className="text-[11px] text-amber-800 block mt-1">Requires customer call</span>
                    </div>

                    <div className="bg-white border border-[#D9C8B5] p-4 rounded-2xl shadow-xs">
                      <span className="text-xs text-[#8C7662] block mb-1">Store Images & Media</span>
                      <span className="text-xl sm:text-2xl font-bold text-[#24140D] tabular-nums">
                        {mediaList.length}
                      </span>
                      <span className="text-[11px] text-[#8F5E2B] block mt-1">
                        {settings?.heroVideoUrl ? 'Video Active' : 'Photo Showcase Active'}
                      </span>
                    </div>
                  </div>

                  {/* Quick Action Hub */}
                  <div className="bg-[#F4EDE1] border border-[#E0D1BF] rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-[#24140D]">Quick Dispatch & Media Actions</h4>
                      <p className="text-xs text-[#6B503D]">Export printable packing manifests, manage photos, or upload product video.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setActiveTab('variants')}
                        className="px-4 py-2 bg-white hover:bg-[#FAF7F2] border border-[#D9C8B5] text-[#24140D] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Tag className="w-4 h-4 text-[#8F5E2B]" />
                        <span>Manage Pricing & Packs</span>
                      </button>

                      <button
                        onClick={() => setActiveTab('media')}
                        className="px-4 py-2 bg-white hover:bg-[#FAF7F2] border border-[#D9C8B5] text-[#24140D] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-[#8F5E2B]" />
                        <span>Manage Photos & Video</span>
                      </button>

                      <button
                        onClick={handleExportPdf}
                        className="px-4 py-2 bg-[#8F5E2B] hover:bg-[#73481E] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Print PDF Manifest</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ORDERS MANAGEMENT */}
              {activeTab === 'orders' && (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">Orders Management</h3>
                      <p className="text-xs text-[#6B503D]">
                        Total {totalOrdersCount} orders stored in SQLite database.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleExportCsv}
                        className="px-3.5 py-2 bg-white border border-[#D9C8B5] hover:bg-[#F4EDE1] text-xs font-bold text-[#24140D] rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-[#8F5E2B]" />
                        <span>CSV Export</span>
                      </button>

                      <button
                        onClick={handleExportPdf}
                        className="px-3.5 py-2 bg-white border border-[#D9C8B5] hover:bg-[#F4EDE1] text-xs font-bold text-[#24140D] rounded-xl flex items-center gap-1.5 cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5 text-[#8F5E2B]" />
                        <span>PDF Manifest</span>
                      </button>

                      <button
                        onClick={() => setShowResetConfirm(true)}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center gap-1 cursor-pointer"
                        title="Danger Zone: Reset Demo Orders"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Reset Orders</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter Toolbar */}
                  <div className="bg-white border border-[#D9C8B5] p-3 sm:p-4 rounded-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-[#8C7662] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => {
                          setOrderSearch(e.target.value);
                          setPage(1);
                        }}
                        placeholder="Search name, phone, order ID..."
                        className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                      />
                    </div>

                    {/* Status Filter */}
                    <div>
                      <select
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-medium text-[#24140D] focus:outline-none"
                      >
                        <option value="all">All Order Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="dispatched">Dispatched</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>

                    {/* Payment Status Filter */}
                    <div>
                      <select
                        value={paymentFilter}
                        onChange={(e) => {
                          setPaymentFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-medium text-[#24140D] focus:outline-none"
                      >
                        <option value="all">All Payment Statuses</option>
                        <option value="pending">Payment Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed / Refunded</option>
                      </select>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <select
                        value={dateRangeFilter}
                        onChange={(e) => {
                          setDateRangeFilter(e.target.value);
                          setPage(1);
                        }}
                        className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-medium text-[#24140D] focus:outline-none"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="yesterday">Yesterday</option>
                        <option value="last7days">Last 7 Days</option>
                        <option value="last30days">Last 30 Days</option>
                      </select>
                    </div>
                  </div>

                  {/* Orders Table */}
                  <div className="bg-white border border-[#D9C8B5] rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#24140D] text-white uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3">Order ID</th>
                            <th className="p-3">Customer</th>
                            <th className="p-3">City & Address</th>
                            <th className="p-3">Item / Pack</th>
                            <th className="p-3">Total</th>
                            <th className="p-3">Payment</th>
                            <th className="p-3">Status</th>
                            <th className="p-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#EADFCF]">
                          {loadingOrders ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-[#8C7662]">
                                Loading orders from SQLite...
                              </td>
                            </tr>
                          ) : orders.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-8 text-center text-[#8C7662]">
                                No orders matching the selected filters.
                              </td>
                            </tr>
                          ) : (
                            orders.map((o) => (
                              <tr key={o.id} className="hover:bg-[#FAF7F2] transition-colors">
                                <td className="p-3 font-mono font-bold text-[#8F5E2B]">
                                  {o.orderId}
                                  <span className="block text-[10px] text-[#8C7662] font-normal">
                                    {new Date(o.createdAt).toLocaleDateString('en-PK')}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-[#24140D] block">{o.customerName}</span>
                                  <a
                                    href={`https://wa.me/${o.whatsapp || o.phone}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[11px] text-[#1F4E38] hover:underline flex items-center gap-1 font-mono"
                                  >
                                    <MessageCircle className="w-3 h-3 text-[#25D366]" />
                                    <span>{o.phone}</span>
                                  </a>
                                </td>
                                <td className="p-3 max-w-[160px]">
                                  <span className="font-bold text-[#24140D] block">{o.city}</span>
                                  <span className="text-[11px] text-[#6B503D] truncate block" title={o.address}>
                                    {o.address}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span className="font-bold text-[#24140D] block">{o.variantName}</span>
                                  <span className="text-[#8C7662] text-[11px]">Qty: {o.quantity}</span>
                                </td>
                                <td className="p-3 font-bold tabular-nums text-[#24140D]">
                                  {formatPKR(o.total)}
                                </td>
                                <td className="p-3">
                                  <span className="font-bold uppercase text-[10px] bg-[#F4EDE1] px-2 py-0.5 rounded block text-center mb-0.5">
                                    {o.paymentMethod}
                                  </span>
                                  <span className={`text-[10px] block text-center ${o.paymentStatus === 'paid' ? 'text-[#2E7D32] font-bold' : 'text-amber-800'}`}>
                                    {o.paymentStatus}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase block text-center ${
                                      o.orderStatus === 'pending'
                                        ? 'bg-amber-100 text-amber-800'
                                        : o.orderStatus === 'confirmed'
                                        ? 'bg-blue-100 text-blue-800'
                                        : o.orderStatus === 'dispatched'
                                        ? 'bg-purple-100 text-purple-800'
                                        : o.orderStatus === 'delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-stone-100 text-stone-600'
                                    }`}
                                  >
                                    {o.orderStatus}
                                  </span>
                                </td>
                                <td className="p-3 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    <button
                                      onClick={() => openOrderEdit(o)}
                                      className="p-1.5 text-[#8F5E2B] hover:bg-[#EFE7DC] rounded-lg transition-colors cursor-pointer"
                                      title="Edit Order / Courier Details"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => downloadReceiptPng(o, settings)}
                                      className="p-1.5 text-[#5A3E2B] hover:bg-[#EFE7DC] rounded-lg transition-colors cursor-pointer"
                                      title="Download Receipt PNG"
                                    >
                                      <Download className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => setOrderToDelete(o)}
                                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      title="Delete Order"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-3 border-t border-[#E8DCcb] flex items-center justify-between text-xs text-[#6B503D]">
                        <span>
                          Page {page} of {totalPages}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setPage(Math.max(1, page - 1))}
                            disabled={page <= 1}
                            className="p-1.5 border border-[#D9C8B5] rounded-lg disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronLeft className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setPage(Math.min(totalPages, page + 1))}
                            disabled={page >= totalPages}
                            className="p-1.5 border border-[#D9C8B5] rounded-lg disabled:opacity-30 cursor-pointer"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: PRICING & SIZING MANAGEMENT (CRUD) */}
              {activeTab === 'variants' && <VariantsManager token={token} />}

              {/* TAB 4: MEDIA & VIDEO MANAGEMENT (REQUIREMENT 2) */}
              {activeTab === 'media' && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">Store Media & Video Control</h3>
                      <p className="text-xs text-[#6B503D]">
                        Upload images & video directly from your device (PC/Mobile) or enter external web links.
                      </p>
                    </div>

                    <button
                      onClick={fetchMedia}
                      className="px-3 py-1.5 bg-white border border-[#D9C8B5] hover:bg-[#F4EDE1] text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-[#8F5E2B]" />
                      <span>Refresh Media</span>
                    </button>
                  </div>

                  {mediaMsg && (
                    <div className="p-3 bg-[#EAF5EC] border border-[#B7DFC6] text-[#1E4D2B] rounded-xl text-xs flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#2E7D32]" />
                      <span>{mediaMsg}</span>
                    </div>
                  )}

                  {/* 1. HERO VIDEO & PREPARATION VIDEO SECTION */}
                  <div className="bg-white border border-[#D9C8B5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8DCcb]">
                      <div className="w-8 h-8 rounded-lg bg-[#3D2619] text-[#D4A373] flex items-center justify-center">
                        <Film className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#24140D]">Product Preparation Video</h4>
                        <p className="text-xs text-[#6B503D]">Controls the video player on the landing page.</p>
                      </div>
                    </div>

                    {videoMsg && (
                      <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl">
                        {videoMsg}
                      </div>
                    )}

                    <form onSubmit={handleSaveVideoSettings} className="space-y-4">
                      {/* Video Source Switch */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#4A3222]">Video Source:</span>
                        <div className="inline-flex rounded-xl bg-[#F4EDE1] p-1 border border-[#D9C8B5]">
                          <button
                            type="button"
                            onClick={() => setVideoMode('url')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              videoMode === 'url' ? 'bg-[#8F5E2B] text-white shadow-xs' : 'text-[#4A3222]'
                            }`}
                          >
                            <LinkIcon className="w-3 h-3 inline mr-1" />
                            URL Link
                          </button>
                          <button
                            type="button"
                            onClick={() => setVideoMode('device')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              videoMode === 'device' ? 'bg-[#8F5E2B] text-white shadow-xs' : 'text-[#4A3222]'
                            }`}
                          >
                            <Upload className="w-3 h-3 inline mr-1" />
                            Upload from Device
                          </button>
                        </div>
                      </div>

                      {videoMode === 'url' ? (
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">
                            Direct Video URL (MP4, WebM, Cloud CDN link)
                          </label>
                          <input
                            type="url"
                            value={videoUrlInput}
                            onChange={(e) => setVideoUrlInput(e.target.value)}
                            placeholder="https://example.com/videos/gurr_making.mp4"
                            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">
                            Select Video File from Computer / Mobile (MP4, WebM)
                          </label>
                          <input
                            ref={videoFileInputRef}
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime"
                            onChange={handleVideoFileChange}
                            className="w-full p-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8F5E2B] file:text-white hover:file:bg-[#73481E] cursor-pointer"
                          />
                        </div>
                      )}

                      {/* Video Live Preview */}
                      {(videoUrlInput || videoFilePreview) && (
                        <div className="p-3 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl max-w-md">
                          <span className="text-[11px] font-bold text-[#8C7662] block mb-2">Video Preview:</span>
                          <video
                            src={videoFilePreview || videoUrlInput}
                            controls
                            className="w-full rounded-lg aspect-video bg-black object-cover"
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 pt-2">
                        <button
                          type="submit"
                          disabled={isSavingVideo}
                          className="px-6 py-2.5 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <Check className="w-4 h-4" />
                          <span>{isSavingVideo ? 'Saving Video...' : 'Save Video Configuration'}</span>
                        </button>

                        {settings?.heroVideoUrl && (
                          <button
                            type="button"
                            onClick={async () => {
                              setVideoUrlInput('');
                              setVideoFilePreview(null);
                              await fetch('/api/settings', {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                                body: JSON.stringify({ heroVideoUrl: '' }),
                              });
                              await refreshStoreData();
                              setVideoMsg('Video cleared. Photo showcase active.');
                            }}
                            className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
                          >
                            Remove Video (Use Photo Showcase)
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* 2. ADD NEW IMAGE (DEVICE OR URL) */}
                  <div className="bg-white border border-[#D9C8B5] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div className="flex items-center gap-2.5 pb-3 border-b border-[#E8DCcb]">
                      <div className="w-8 h-8 rounded-lg bg-[#8F5E2B] text-white flex items-center justify-center">
                        <Plus className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#24140D]">Upload New Image to Store</h4>
                        <p className="text-xs text-[#6B503D]">
                          Add photos to the Hero Banner, Product Gallery, or Texture Closeups.
                        </p>
                      </div>
                    </div>

                    <form onSubmit={handleAddMedia} className="space-y-4">
                      {/* Upload Mode Selector */}
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#4A3222]">Upload Mode:</span>
                        <div className="inline-flex rounded-xl bg-[#F4EDE1] p-1 border border-[#D9C8B5]">
                          <button
                            type="button"
                            onClick={() => setUploadMode('device')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              uploadMode === 'device' ? 'bg-[#8F5E2B] text-white shadow-xs' : 'text-[#4A3222]'
                            }`}
                          >
                            <Upload className="w-3 h-3 inline mr-1" />
                            Upload from Device (PC / Mobile)
                          </button>
                          <button
                            type="button"
                            onClick={() => setUploadMode('url')}
                            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                              uploadMode === 'url' ? 'bg-[#8F5E2B] text-white shadow-xs' : 'text-[#4A3222]'
                            }`}
                          >
                            <LinkIcon className="w-3 h-3 inline mr-1" />
                            Paste Image Web Link
                          </button>
                        </div>
                      </div>

                      {/* File input / URL input */}
                      {uploadMode === 'device' ? (
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">
                            Choose Image from Device (JPG, PNG, WebP) *
                          </label>
                          <input
                            ref={imageFileInputRef}
                            type="file"
                            accept="image/*"
                            required={!uploadPreview}
                            onChange={handleImageFileChange}
                            className="w-full p-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#8F5E2B] file:text-white hover:file:bg-[#73481E] cursor-pointer"
                          />
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">
                            Image Web URL (HTTPS) *
                          </label>
                          <input
                            type="url"
                            required
                            value={newMediaUrl}
                            onChange={(e) => setNewMediaUrl(e.target.value)}
                            placeholder="https://images.unsplash.com/photo-xxx"
                            className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#8F5E2B]"
                          />
                        </div>
                      )}

                      {/* Preview Box */}
                      {(uploadPreview || (uploadMode === 'url' && newMediaUrl)) && (
                        <div className="p-3 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl flex items-center gap-4">
                          <img
                            src={uploadPreview || newMediaUrl}
                            alt="Upload Preview"
                            className="w-20 h-20 object-cover rounded-lg border border-[#D9C8B5]"
                          />
                          <span className="text-xs text-[#2E7D32] font-semibold">✓ Image Ready to Upload</span>
                        </div>
                      )}

                      {/* Metadata Inputs */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Title (English)</label>
                          <input
                            type="text"
                            value={newMediaTitle}
                            onChange={(e) => setNewMediaTitle(e.target.value)}
                            placeholder="e.g. Golden Jaggery with Roasted Cashews"
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Title (Urdu)</label>
                          <input
                            type="text"
                            value={newMediaUrduTitle}
                            onChange={(e) => setNewMediaUrduTitle(e.target.value)}
                            placeholder="مثلاً: اصلی دیسی گُڑ اور کاجو"
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-urdu"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Display Category</label>
                          <select
                            value={newMediaCategory}
                            onChange={(e) => setNewMediaCategory(e.target.value)}
                            className="w-full px-3 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-medium"
                          >
                            <option value="showcase">Showcase (Main Gallery)</option>
                            <option value="texture">Texture Detail</option>
                            <option value="packaging">Packaging Presentation</option>
                            <option value="lifestyle">Lifestyle (Tea & Dessert)</option>
                          </select>
                        </div>

                        <div className="pt-4 flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="setAsHero"
                            checked={newMediaIsHero}
                            onChange={(e) => setNewMediaIsHero(e.target.checked)}
                            className="w-4 h-4 text-[#8F5E2B] rounded cursor-pointer"
                          />
                          <label htmlFor="setAsHero" className="text-xs font-bold text-[#24140D] cursor-pointer">
                            Set as Main Hero Banner Image
                          </label>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isUploadingMedia}
                        className="px-6 py-3 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-4 h-4" />
                        <span>{isUploadingMedia ? 'Uploading Image...' : 'Add Image to Store'}</span>
                      </button>
                    </form>
                  </div>

                  {/* 3. ACTIVE MEDIA GALLERY GRID */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[#24140D]">
                        All Active Store Images ({mediaList.length})
                      </h4>
                      <span className="text-xs text-[#8C7662]">
                        Click "★ Set as Hero" to feature any image as the main banner.
                      </span>
                    </div>

                    {loadingMedia ? (
                      <div className="p-8 text-center text-xs text-[#8C7662]">Loading store media...</div>
                    ) : mediaList.length === 0 ? (
                      <div className="p-8 bg-white border border-[#D9C8B5] rounded-2xl text-center text-xs text-[#8C7662]">
                        No media images found. Upload your first photo above.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mediaList.map((m) => (
                          <div
                            key={m.id}
                            className={`bg-white border rounded-2xl overflow-hidden p-3 space-y-3 transition-all ${
                              m.isHero ? 'border-[#8F5E2B] ring-2 ring-[#8F5E2B]/20 shadow-md' : 'border-[#D9C8B5]'
                            }`}
                          >
                            {/* Image Container with Badges */}
                            <div className="relative aspect-video rounded-xl overflow-hidden bg-stone-100">
                              <img
                                src={m.imageUrl}
                                alt={m.title}
                                className="w-full h-full object-cover"
                              />
                              {m.isHero && (
                                <span className="absolute top-2 left-2 px-2.5 py-1 bg-[#8F5E2B] text-white text-[10px] font-bold rounded-lg shadow flex items-center gap-1">
                                  <Star className="w-3 h-3 fill-current" />
                                  Hero Image
                                </span>
                              )}
                              <span className="absolute top-2 right-2 px-2 py-0.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-medium rounded-md uppercase">
                                {m.category}
                              </span>
                            </div>

                            {/* Media Title */}
                            <div>
                              <h5 className="text-xs font-bold text-[#24140D] truncate" title={m.title}>
                                {m.title}
                              </h5>
                              <p className="text-[11px] text-[#8C7662] truncate font-urdu">
                                {m.urduTitle || 'گُڑ کی تصویر'}
                              </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-[#E8DCcb] flex items-center justify-between gap-1 text-xs">
                              {!m.isHero ? (
                                <button
                                  type="button"
                                  onClick={() => handleSetHero(m.id)}
                                  className="px-2.5 py-1.5 bg-[#EFE7DC] hover:bg-[#E4D7C7] text-[#8F5E2B] font-bold text-[11px] rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                >
                                  <Star className="w-3 h-3" />
                                  <span>Set Hero</span>
                                </button>
                              ) : (
                                <span className="text-[11px] text-[#2E7D32] font-bold flex items-center gap-1">
                                  <Check className="w-3.5 h-3.5" />
                                  Main Banner
                                </span>
                              )}

                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setReplacingMedia(m);
                                    setReplaceUrl('');
                                    setReplacePreview(null);
                                  }}
                                  className="p-1.5 text-[#5A3E2B] hover:bg-[#FAF7F2] border border-[#D9C8B5] rounded-lg transition-colors cursor-pointer"
                                  title="Replace Image File / URL"
                                >
                                  <Upload className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setEditingMedia(m)}
                                  className="p-1.5 text-[#8F5E2B] hover:bg-[#FAF7F2] border border-[#D9C8B5] rounded-lg transition-colors cursor-pointer"
                                  title="Edit Title & Category"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleDeleteMedia(m.id)}
                                  className="p-1.5 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer"
                                  title="Delete Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 4: STORE SETTINGS & PAYMENT & GOOGLE SHEETS */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">Store & Payment Settings</h3>
                    <p className="text-xs text-[#6B503D]">Update brand copy, pricing defaults, accounts, and webhook integrations.</p>
                  </div>

                  {settingsMsg && (
                    <div className="p-3 bg-green-100 border border-green-300 text-green-800 rounded-xl text-xs">
                      {settingsMsg}
                    </div>
                  )}

                  <form onSubmit={handleSaveSettings} className="space-y-6">
                    {/* Brand Info */}
                    <div className="bg-white border border-[#D9C8B5] p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-bold text-[#24140D]">Brand & Contact Information</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Store Name (English)</label>
                          <input
                            type="text"
                            value={settingsForm.storeName || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, storeName: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Store Name (Urdu)</label>
                          <input
                            type="text"
                            value={settingsForm.urduStoreName || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, urduStoreName: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-urdu"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">WhatsApp Helpline Number (with country code, e.g. 923001234567)</label>
                          <input
                            type="text"
                            value={settingsForm.whatsappNumber || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Free Delivery Threshold (PKR)</label>
                          <input
                            type="number"
                            value={settingsForm.freeDeliveryThreshold || 2000}
                            onChange={(e) => setSettingsForm({ ...settingsForm, freeDeliveryThreshold: Number(e.target.value) })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment Accounts */}
                    <div className="bg-white border border-[#D9C8B5] p-5 rounded-2xl space-y-4">
                      <h4 className="text-sm font-bold text-[#24140D]">Pakistani Payment Accounts Configuration</h4>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Easypaisa Account Title</label>
                          <input
                            type="text"
                            value={settingsForm.easypaisaTitle || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, easypaisaTitle: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Easypaisa Mobile Number</label>
                          <input
                            type="text"
                            value={settingsForm.easypaisaNumber || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, easypaisaNumber: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">JazzCash Account Title</label>
                          <input
                            type="text"
                            value={settingsForm.jazzcashTitle || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, jazzcashTitle: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">JazzCash Mobile Number</label>
                          <input
                            type="text"
                            value={settingsForm.jazzcashNumber || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, jazzcashNumber: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Bank Name</label>
                          <input
                            type="text"
                            value={settingsForm.bankName || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, bankName: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">Account Title</label>
                          <input
                            type="text"
                            value={settingsForm.bankTitle || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, bankTitle: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#4A3222] mb-1">IBAN / Raast ID</label>
                          <input
                            type="text"
                            value={settingsForm.bankIban || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, bankIban: e.target.value })}
                            className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Google Sheets Webhook */}
                    <div className="bg-white border border-[#D9C8B5] p-5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-[#24140D]">Optional Google Sheets Integration</h4>
                          <p className="text-xs text-[#6B503D]">
                            Automatically stream new orders to your personal Google Sheet webhook.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleTestSheets}
                          className="px-3 py-1.5 bg-[#EFE7DC] hover:bg-[#E4D7C7] text-xs font-bold rounded-lg text-[#24140D] cursor-pointer"
                        >
                          Send Test Ping
                        </button>
                      </div>

                      {sheetTestMsg && (
                        <div className="p-2.5 bg-[#FAF7F2] border border-[#D9C8B5] rounded-lg text-xs font-mono">
                          {sheetTestMsg}
                        </div>
                      )}

                      <div>
                        <label className="block text-xs font-bold text-[#4A3222] mb-1">
                          Google Apps Script Webhook URL (Deployed as Web App)
                        </label>
                        <input
                          type="url"
                          value={settingsForm.sheetsWebhookUrl || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, sheetsWebhookUrl: e.target.value })}
                          placeholder="https://script.google.com/macros/s/XXXXX/exec"
                          className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono"
                        />
                      </div>

                      <details className="text-xs text-[#6B503D] bg-[#FAF7F2] p-3 rounded-xl border border-[#D9C8B5]">
                        <summary className="font-bold text-[#24140D] cursor-pointer">
                          View Ready-to-Copy Google Apps Script Template
                        </summary>
                        <pre className="mt-2 p-3 bg-stone-900 text-stone-100 rounded-lg text-[11px] overflow-x-auto font-mono">
                          {googleAppsScriptCode}
                        </pre>
                      </details>
                    </div>

                    {/* Meta / Facebook Pixel Integration */}
                    <div className="bg-white border border-[#D9C8B5] p-5 rounded-2xl space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-bold text-[#24140D]">Facebook / Meta Pixel Tracking (اشتہارات اور پکسل)</h4>
                            {settingsForm.facebookPixelId?.trim() ? (
                              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-300">
                                Active & Tracking
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 text-[10px] font-medium bg-stone-100 text-stone-600 rounded-full border border-stone-300">
                                Inactive
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#6B503D] mt-0.5">
                            Connect your Meta Pixel from Facebook Ads Manager to automatically track page views, checkouts, and completed orders with revenue in PKR.
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#4A3222] mb-1">
                          Meta Pixel ID (فیس بک پکسل آئی ڈی)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.facebookPixelId || ''}
                          onChange={(e) => setSettingsForm({ ...settingsForm, facebookPixelId: e.target.value })}
                          placeholder="e.g. 1234567890123456 or paste script"
                          className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs font-mono focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#8F5E2B]"
                        />
                        <p className="text-[11px] text-[#6B503D] mt-1.5 leading-relaxed">
                          Enter your 15–16 digit Pixel ID from Ads Manager (or paste the snippet). The system automatically activates the tracking code across the whole website:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                          <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EADFCF] text-center">
                            <span className="block font-bold text-xs text-[#24140D]">PageView</span>
                            <span className="text-[10px] text-[#6B503D]">تمام پیج وزٹس</span>
                          </div>
                          <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EADFCF] text-center">
                            <span className="block font-bold text-xs text-[#24140D]">ViewContent</span>
                            <span className="text-[10px] text-[#6B503D]">پراڈکٹ کی تفصیلات</span>
                          </div>
                          <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EADFCF] text-center">
                            <span className="block font-bold text-xs text-[#24140D]">InitiateCheckout</span>
                            <span className="text-[10px] text-[#6B503D]">آرڈر فارم کھولنا</span>
                          </div>
                          <div className="bg-[#FAF7F2] p-2.5 rounded-lg border border-[#EADFCF] text-center">
                            <span className="block font-bold text-xs text-emerald-700">Purchase</span>
                            <span className="text-[10px] text-[#6B503D]">کامیاب آرڈر + رقم PKR</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSavingSettings}
                        className="px-8 py-3.5 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        {isSavingSettings ? 'Saving Settings...' : 'Save Store Configuration'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* TAB 5: SECURITY & PASSWORD */}
              {activeTab === 'security' && (
                <div className="space-y-6 max-w-lg">
                  <div>
                    <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">Admin Security Settings</h3>
                    <p className="text-xs text-[#6B503D]">Change your master authentication password.</p>
                  </div>

                  {passMsg && (
                    <div className="p-3 bg-[#EAF5EC] border border-[#B7DFC6] text-[#1E4D2B] rounded-xl text-xs">
                      {passMsg}
                    </div>
                  )}

                  <form onSubmit={handleChangePassword} className="bg-white border border-[#D9C8B5] p-5 rounded-2xl space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#4A3222] mb-1">Current Password *</label>
                      <input
                        type="password"
                        required
                        value={currPass}
                        onChange={(e) => setCurrPass(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#4A3222] mb-1">New Password (Min 6 chars) *</label>
                      <input
                        type="password"
                        required
                        value={newPass}
                        onChange={(e) => setNewPass(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl text-xs"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#8F5E2B] hover:bg-[#73481E] text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Update Admin Password
                    </button>
                  </form>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

      {/* Edit Media Metadata Modal */}
      {editingMedia && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCcb]">
              <h4 className="text-base font-bold text-[#24140D]">Edit Media Details</h4>
              <button
                onClick={() => setEditingMedia(null)}
                className="p-1 text-stone-500 hover:text-stone-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!token) return;
                try {
                  const res = await fetch(`/api/media/${editingMedia.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                      title: editingMedia.title,
                      urduTitle: editingMedia.urduTitle,
                      category: editingMedia.category,
                    }),
                  });
                  if (res.ok) {
                    setEditingMedia(null);
                    await fetchMedia();
                    await refreshStoreData();
                  }
                } catch (err) {
                  console.warn('Edit error:', err);
                }
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Title (English)</label>
                <input
                  type="text"
                  value={editingMedia.title}
                  onChange={(e) => setEditingMedia({ ...editingMedia, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Title (Urdu)</label>
                <input
                  type="text"
                  value={editingMedia.urduTitle || ''}
                  onChange={(e) => setEditingMedia({ ...editingMedia, urduTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-urdu"
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A3222] mb-1">Category</label>
                <select
                  value={editingMedia.category}
                  onChange={(e) => setEditingMedia({ ...editingMedia, category: e.target.value })}
                  className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl font-medium"
                >
                  <option value="showcase">Showcase (Main Gallery)</option>
                  <option value="texture">Texture Detail</option>
                  <option value="packaging">Packaging Presentation</option>
                  <option value="lifestyle">Lifestyle (Tea & Dessert)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingMedia(null)}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#8F5E2B] text-white rounded-xl font-bold shadow-xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Replace Image Modal */}
      {replacingMedia && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8DCcb]">
              <h4 className="text-base font-bold text-[#24140D]">Replace Image</h4>
              <button
                onClick={() => setReplacingMedia(null)}
                className="p-1 text-stone-500 hover:text-stone-900 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReplaceMediaSubmit} className="space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <span className="font-bold text-[#4A3222]">Source:</span>
                <div className="inline-flex rounded-xl bg-[#F4EDE1] p-1 border border-[#D9C8B5]">
                  <button
                    type="button"
                    onClick={() => setReplaceMode('device')}
                    className={`px-3 py-1 font-semibold rounded-lg ${
                      replaceMode === 'device' ? 'bg-[#8F5E2B] text-white' : 'text-[#4A3222]'
                    }`}
                  >
                    Upload from Device
                  </button>
                  <button
                    type="button"
                    onClick={() => setReplaceMode('url')}
                    className={`px-3 py-1 font-semibold rounded-lg ${
                      replaceMode === 'url' ? 'bg-[#8F5E2B] text-white' : 'text-[#4A3222]'
                    }`}
                  >
                    Enter URL
                  </button>
                </div>
              </div>

              {replaceMode === 'device' ? (
                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">
                    Select Replacement Image File from Device
                  </label>
                  <input
                    ref={replaceFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        const r = new FileReader();
                        r.onload = () => setReplacePreview(r.result as string);
                        r.readAsDataURL(f);
                      }
                    }}
                    className="w-full p-2 bg-white border border-[#D9C8B5] rounded-xl cursor-pointer"
                  />
                </div>
              ) : (
                <div>
                  <label className="block font-bold text-[#4A3222] mb-1">New Image URL</label>
                  <input
                    type="url"
                    value={replaceUrl}
                    onChange={(e) => setReplaceUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl"
                  />
                </div>
              )}

              {(replacePreview || replaceUrl) && (
                <div className="p-2 bg-[#FAF7F2] border border-[#D9C8B5] rounded-xl flex items-center gap-3">
                  <img
                    src={replacePreview || replaceUrl}
                    alt="Replacement Preview"
                    className="w-16 h-16 object-cover rounded-lg border border-[#D9C8B5]"
                  />
                  <span className="text-[11px] text-[#2E7D32] font-semibold">New Image Selected</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReplacingMedia(null)}
                  className="px-4 py-2 bg-stone-200 text-stone-800 rounded-xl font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploadingMedia}
                  className="px-5 py-2 bg-[#8F5E2B] text-white rounded-xl font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isUploadingMedia ? 'Uploading...' : 'Replace Image'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Edit / Dispatch Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-5 right-5 text-stone-500 hover:text-stone-900 p-1.5 rounded-lg hover:bg-[#EFE7DC] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-5 pb-4 border-b border-[#E8DCcb]">
              <span className="text-xs font-mono font-bold text-[#8F5E2B]">{selectedOrder.orderId}</span>
              <h3 className="text-xl font-bold text-[#24140D] font-serif-brand">
                Order & Courier Dispatch Details
              </h3>
              <p className="text-xs text-[#6B503D] mt-0.5">
                Customer: {selectedOrder.customerName} • {selectedOrder.city} • Phone: {selectedOrder.phone}
              </p>
            </div>

            <form onSubmit={handleUpdateOrder} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3222] mb-1">Order Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs font-bold text-[#24140D]"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="dispatched">Dispatched</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3222] mb-1">Payment Status</label>
                  <select
                    value={editPaymentStatus}
                    onChange={(e) => setEditPaymentStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs font-bold text-[#24140D]"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed / Refunded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4A3222] mb-1">Courier Partner</label>
                  <select
                    value={editCourier}
                    onChange={(e) => setEditCourier(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs"
                  >
                    {COURIER_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4A3222] mb-1">Tracking Number / CN Number</label>
                  <input
                    type="text"
                    value={editTrackingNumber}
                    onChange={(e) => setEditTrackingNumber(e.target.value)}
                    placeholder="e.g. TCS8492019"
                    className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3222] mb-1">Dispatch / Delivery Notes</label>
                <input
                  type="text"
                  value={editDispatchNotes}
                  onChange={(e) => setEditDispatchNotes(e.target.value)}
                  placeholder="e.g. Dispatched via Lahore Central Hub"
                  className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4A3222] mb-1">Add Note to Timeline History (Optional)</label>
                <input
                  type="text"
                  value={historyNote}
                  onChange={(e) => setHistoryNote(e.target.value)}
                  placeholder="e.g. Called customer for address verification"
                  className="w-full px-3 py-2 bg-white border border-[#D9C8B5] rounded-xl text-xs"
                />
              </div>

              <div className="pt-3 flex items-center justify-between gap-3">
                <a
                  href={`https://wa.me/${selectedOrder.whatsapp || selectedOrder.phone}?text=${encodeURIComponent(
                    `Assalam-o-Alaikum ${selectedOrder.customerName}, this is ${settings?.storeName || 'Shahi Gurr Co.'} regarding your order ${selectedOrder.orderId}.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-[#E3F2E9] hover:bg-[#D3EADB] text-[#1F4E38] border border-[#B7DFC6] text-xs font-semibold rounded-xl flex items-center gap-1.5"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>WhatsApp Customer</span>
                </a>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="px-4 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdatingOrder}
                    className="px-6 py-2.5 bg-[#8F5E2B] hover:bg-[#73481E] text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingOrder ? 'Saving...' : 'Update Order'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {orderToDelete && (
        <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-[#D9C8B5] rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-[#24140D] font-serif-brand">Delete Order Record</h3>
            <div className="bg-white border border-[#D9C8B5] p-3.5 rounded-xl text-xs text-left space-y-1">
              <div><span className="font-semibold">Order ID:</span> {orderToDelete.orderId}</div>
              <div><span className="font-semibold">Customer:</span> {orderToDelete.customerName}</div>
              <div><span className="font-semibold">Phone:</span> {orderToDelete.phone}</div>
              <div><span className="font-semibold">Total:</span> {formatPKR(orderToDelete.total)}</div>
            </div>

            <p className="text-xs text-red-600 font-bold">
              Warning: This action cannot be undone. The order will be permanently deleted from SQLite.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteOrder}
                disabled={isDeletingOrder}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer disabled:opacity-50"
              >
                {isDeletingOrder ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Orders Danger Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#FAF7F2] border border-red-300 rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <Trash2 className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-red-900 font-serif-brand">Reset All Orders</h3>
            <p className="text-xs text-stone-600 leading-relaxed">
              Are you sure you want to delete all order records and history from SQLite? This is intended for cleaning development demo data.
            </p>

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className="px-5 py-2.5 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetOrders}
                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer"
              >
                Yes, Reset All Orders
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
