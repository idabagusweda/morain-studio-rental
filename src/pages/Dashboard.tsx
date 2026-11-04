import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import {
    LogOut,
    Calendar,
    Camera,
    ArrowRight,
    Clock,
    Sparkles,
    User,
    LayoutGrid,
    History,
    Check,
    Home,
    LayoutDashboard,
    MoreVertical,
    Search,
    Filter,
    FileText,
    AlertCircle
} from 'lucide-react';
import { BookingDetailModal } from '@/components/dashboard/BookingDetailModal';
import { format, addMinutes, isAfter } from 'date-fns';
import { id } from 'date-fns/locale';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePaymentLogic } from '@/hooks/usePaymentLogic';

const photoboxStyleMap: Record<string, string> = {
    'Cowboy': 'bg-gradient-to-r from-amber-700/20 via-orange-800/20 to-amber-700/20 animate-gradient-x text-amber-700',
    'Retro Film': 'bg-gradient-to-r from-orange-400/20 via-amber-200/20 to-orange-400/20 animate-gradient-x text-orange-600',
    'Cyberpunk': 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 animate-gradient-x text-purple-600',
    'Cute Pastel': 'bg-gradient-to-r from-pink-200/30 via-blue-200/30 to-pink-200/30 animate-gradient-x text-pink-500',
    'Minimal Clean': 'bg-secondary/50 text-foreground',
};

const getCountdown = (expiresAt: string | null, createdAt: string) => {
    // If no expiresAt, fallback to createdAt + 15 mins (though DB should have it)
    const targetDate = expiresAt ? new Date(expiresAt) : addMinutes(new Date(createdAt), 15);
    const now = new Date(); // This will be driven by parent re-renders if we pass it, but helper can just take diff
    // Actually, to sync with the single interval, we should pass 'now' or just let it calculate. 
    // Ideally we pass 'now' from state to ensure sync.
    // But for simplicity in helper, let's take a 'currentDate' arg.
    return (currentDate: Date) => {
        const difference = targetDate.getTime() - currentDate.getTime();

        if (difference <= 0) {
            return { timeLeftString: "00:00", isExpired: true };
        }

        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        return {
            timeLeftString: `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`,
            isExpired: false
        };
    };
};

export default function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();

    // Single interval for all timers
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setNow(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Sync active tab with URL
    useEffect(() => {
        if (location.pathname === '/dashboard/riwayat') {
            setActiveTab('history');
        } else if (location.pathname === '/dashboard/profil') {
            setActiveTab('profile');
        } else if (location.pathname === '/dashboard') {
            setActiveTab('overview');
        }
    }, [location.pathname]);
    const { user, profile, loading, signOut, updateProfile } = useAuth();
    const { syncExpiredPayments, resumePayment, isProcessing: isPaymentProcessing } = usePaymentLogic();
    const { toast } = useToast(); // Keep local toast for other things if needed

    // Check expired on mount AND every minute to be safe (or rely on the countdown ending to trigger sync)
    // The instructions say "if remaining <= 0... text 'Waktu pembayaran habis'". 
    // We can also trigger a sync if we detect an active pending booking just expired.
    useEffect(() => {
        syncExpiredPayments();
    }, [syncExpiredPayments]);

    // ... existing state ...
    const [activeTab, setActiveTab] = useState('overview');
    const [bookings, setBookings] = useState<any[]>([]);
    const [isLoadingBookings, setIsLoadingBookings] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState<any | null>(null);

    // ... Profile Form State ...
    const [fullName, setFullName] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [email, setEmail] = useState('');
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // ... Stats ...
    const [stats, setStats] = useState({
        total: 0,
        upcoming: 0,
        completed: 0
    });

    // Payment & Cancel State
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [bookingToPay, setBookingToPay] = useState<any | null>(null);
    const [bookingToCancel, setBookingToCancel] = useState<any | null>(null);
    const [isInternalProcessing, setIsInternalProcessing] = useState(false); // Local processing for non-payment stuff

    const isProcessing = isPaymentProcessing || isInternalProcessing;

    useEffect(() => {
        if (!loading && !user) {
            navigate('/');
        }
    }, [user, loading, navigate]);

    useEffect(() => {
        if (user) {
            fetchBookings();
        }
    }, [user]);

    useEffect(() => {
        if (profile) {
            setFullName(profile.full_name || '');
            setWhatsapp(profile.whatsapp || '');
            setEmail(profile.email || user?.email || '');
        }
    }, [profile, user]);

    const fetchBookings = async () => {
        // syncExpiredPayments(); // Optional: sync before fetch
        setIsLoadingBookings(true);

        const { data, error } = await supabase
            .from('bookings')
            .select('*')
            .eq('user_id', user?.id)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setBookings(data);

            // Calculate stats
            const total = data.length;
            const upcoming = data.filter(b => ['pending', 'dp', 'lunas', 'paid'].includes(b.payment_status)).length;
            const completed = data.filter(b => b.payment_status === 'selesai').length;

            setStats({ total, upcoming, completed });
        }
        setIsLoadingBookings(false);
    };

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsUpdatingProfile(true);

        const { error } = await updateProfile({
            full_name: fullName,
            whatsapp,
            // email is handled separately or read-only/linked to auth
        });

        if (error) {
            toast({
                title: 'Gagal memperbarui profil',
                description: error.message,
                variant: 'destructive'
            });
        } else {
            toast({
                title: 'Profil berhasil diperbarui',
                description: 'Perubahan telah disimpan.'
            });
        }
        setIsUpdatingProfile(false);
    };

    const handleResumePaymentClick = async (paymentType: 'FULL' | 'DP' | 'REMAINING', targetBookingId?: string) => {
        const idToProcess = targetBookingId || bookingToPay?.id;
        const booking = bookings.find(b => b.id === idToProcess);

        if (!booking) return;

        // If it's a new payment needed (e.g. DP -> Full, or initial payment creation if redirect_url missing), 
        // we might still need the old logic. But mostly we want to just resume or create.
        // For simplicity, if it's PENDING and has redirect_url, we resume.
        // If it's DP and we want to pay remainder, or PENDING but no URL, we likely need to hit the function.
        // The centralized hook's resumePayment is simple redirect. 
        // We will keep the old logic for CREATING transaction if needed, but use resume logic if available.

        // Actually, user request says: "Tombol 'Lanjut Bayar' untuk PENDING: langsung redirect ke redirect_url yang sudah ada (tanpa membuat sesi baru)"
        if (booking.payment_status === 'PENDING' && booking.redirect_url) {
            await resumePayment(booking);
            return;
        }

        // Fallback to creating transaction if no redirect URL or if it's a different type (e.g. paying off DP)
        setIsInternalProcessing(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            if (!accessToken) {
                throw new Error('Sesi tidak valid');
            }

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-midtrans-transaction`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({
                        booking_id: idToProcess,
                        payment_type: paymentType,
                    }),
                }
            );

            if (!response.ok) {
                const err = await response.json();

                // Handle 410 EXPIRED status - refresh bookings and close modal
                if (response.status === 410) {
                    toast({
                        title: 'Pembayaran Expired',
                        description: err.details || 'Waktu pembayaran habis. Silakan buat booking baru.',
                        variant: 'destructive'
                    });
                    setShowPaymentModal(false);
                    setBookingToPay(null);
                    fetchBookings(); // Refresh to show updated status
                    return;
                }

                throw new Error(err.details || err.error || 'Gagal memulai pembayaran');
            }

            const data = await response.json();
            if (data.redirect_url) {
                if (data.resumed) {
                    toast({
                        title: 'Melanjutkan Pembayaran',
                        description: 'Menggunakan sesi pembayaran yang sama.',
                    });
                }
                window.location.href = data.redirect_url;
            }
        } catch (error: any) {
            toast({
                title: 'Gagal Memproses',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsInternalProcessing(false);
        }
    };

    const handleCancelBooking = async () => {
        if (!bookingToCancel) return;
        setIsInternalProcessing(true);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const accessToken = sessionData?.session?.access_token;

            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/cancel-booking`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${accessToken}`,
                    },
                    body: JSON.stringify({ booking_id: bookingToCancel.id }),
                }
            );

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.details || err.error || 'Gagal membatalkan booking');
            }

            toast({
                title: "Booking Dibatalkan",
                description: "Booking berhasil dibatalkan."
            });

            setShowCancelDialog(false);
            setBookingToCancel(null);
            fetchBookings();
        } catch (error: any) {
            toast({
                title: 'Gagal Membatalkan',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setIsInternalProcessing(false);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || '';
        switch (lowerStatus) {
            case 'lunas':
            case 'paid':
            case 'selesai':
                return 'text-green-800 bg-green-100 border-green-200'; // Green
            case 'dp':
                return 'text-blue-800 bg-blue-100 border-blue-200'; // Blue for DP
            case 'pending':
                return 'text-amber-800 bg-amber-100 border-amber-200'; // Amber/Orange for Pending
            case 'expired':
                return 'text-gray-600 bg-gray-100 border-gray-200'; // Neutral Gray for Expired
            case 'batal':
            case 'cancelled':
                return 'text-red-800 bg-red-100 border-red-200'; // Red
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    if (loading || !user) {
        return null; // or loading spinner
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Dashboard Header */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="container-wide py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate('/')} className="flex items-center gap-3 group text-left">
                            <img
                                src="/images/logoMorain.png"
                                alt="Morain Studio Logo"
                                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 brightness-[0.8]"
                            />
                            <span className="font-display text-2xl font-bold tracking-tight text-black leading-none">
                                Morain
                            </span>
                        </button>
                        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                        <h1 className="text-sm font-medium text-muted-foreground hidden sm:block">User Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-6 w-px bg-gray-200 hidden md:block"></div>

                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                            <Home className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Home</span>
                        </Button>

                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleSignOut}>
                            <LogOut className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Keluar</span>
                        </Button>
                    </div>
                </div>
            </header>

            <div className="container-wide py-8">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar / Mobile Tabs */}
                    <aside className="w-full md:w-64 flex-shrink-0">
                        <div className="bg-white rounded-xl border p-6 mb-6">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xl font-display">
                                    {profile?.full_name?.charAt(0) || user.email?.charAt(0)}
                                </div>
                                <div className="overflow-hidden">
                                    <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
                                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                </div>
                            </div>

                            <nav className="space-y-1">
                                {/* Simplified Nav for Sidebar */}
                                <button
                                    onClick={() => navigate('/dashboard')}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === '/dashboard' ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-slate-50'}`}
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Overview
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/riwayat')}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/dashboard/riwayat') ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-slate-50'}`}
                                >
                                    <History className="w-4 h-4" />
                                    Riwayat Booking
                                </button>
                                <button
                                    onClick={() => navigate('/dashboard/profil')}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname.startsWith('/dashboard/profil') ? 'bg-primary/5 text-primary' : 'text-muted-foreground hover:bg-slate-50'}`}
                                >
                                    <User className="w-4 h-4" />
                                    Profil Akun
                                </button>
                            </nav>
                        </div>

                        <div className="bg-primary/5 rounded-xl border border-primary/10 p-4">
                            <h3 className="font-display font-medium text-primary mb-2">Book Now</h3>
                            <p className="text-xs text-muted-foreground mb-4">Siap untuk sesi foto berikutnya?</p>
                            <div className="space-y-2">
                                <Button
                                    className="w-full justify-start bg-white hover:bg-slate-50 text-foreground border shadow-soft"
                                    onClick={() => {
                                        // Navigate to home page and then scroll to packages section
                                        if (window.location.pathname !== '/') {
                                            navigate('/');
                                            // Small delay to ensure the page has loaded before scrolling
                                            setTimeout(() => {
                                                const element = document.getElementById('packages');
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }, 100);
                                        } else {
                                            const element = document.getElementById('packages');
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }
                                    }}
                                >
                                    <Camera className="w-4 h-4 mr-2 text-primary" />
                                    Studio
                                </Button>
                                <Button
                                    className="w-full justify-start bg-white hover:bg-slate-50 text-foreground border shadow-soft"
                                    onClick={() => {
                                        // Navigate to home page and then scroll to photobox section
                                        if (window.location.pathname !== '/') {
                                            navigate('/');
                                            // Small delay to ensure the page has loaded before scrolling
                                            setTimeout(() => {
                                                const element = document.getElementById('photobox');
                                                if (element) {
                                                    element.scrollIntoView({ behavior: 'smooth' });
                                                }
                                            }, 100);
                                        } else {
                                            const element = document.getElementById('photobox');
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }
                                    }}
                                >
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    Photobox
                                </Button>
                            </div>
                        </div>
                    </aside>

                    {/* Mobile Navigation (Horizontal Scroll) */}
                    <div className="md:hidden mb-6 -mx-4 px-4 overflow-x-auto no-scrollbar">
                        <div className="flex gap-2 min-w-max pb-2">
                            <button
                                onClick={() => navigate('/dashboard')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${location.pathname === '/dashboard' ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-gray-200'}`}
                            >
                                <LayoutDashboard className="w-4 h-4" />
                                Overview
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/riwayat')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${location.pathname.startsWith('/dashboard/riwayat') ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-gray-200'}`}
                            >
                                <History className="w-4 h-4" />
                                Riwayat
                            </button>
                            <button
                                onClick={() => navigate('/dashboard/profil')}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors border ${location.pathname.startsWith('/dashboard/profil') ? 'bg-primary text-primary-foreground border-primary' : 'bg-white text-muted-foreground border-gray-200'}`}
                            >
                                <User className="w-4 h-4" />
                                Profil
                            </button>
                        </div>
                    </div>

                    {/* Main Content */}
                    <main className="flex-1">
                        <Tabs
                            value={location.pathname === '/dashboard' ? 'overview' :
                                location.pathname.startsWith('/dashboard/riwayat') ? 'history' : 'profile'}
                            onValueChange={(value) => {
                                if (value === 'overview') navigate('/dashboard');
                                else if (value === 'history') navigate('/dashboard/riwayat');
                                else if (value === 'profile') navigate('/dashboard/profil');
                            }}
                            className="space-y-6"
                        >

                            {/* OVERVIEW TAB */}
                            <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
                                <div>
                                    <h2 className="text-2xl font-display font-bold mb-1">Hi, {profile?.full_name?.split(' ')[0] || 'User'} 👋</h2>
                                    <p className="text-muted-foreground">Selamat datang di dashboard Morain Studio.</p>
                                </div>

                                <div className="grid sm:grid-cols-3 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>Total Booking</CardDescription>
                                            <CardTitle className="text-3xl font-body">{stats.total}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>Booking Aktif</CardDescription>
                                            <CardTitle className="text-3xl font-body text-blue-600">{stats.upcoming}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2">
                                            <CardDescription>Selesai</CardDescription>
                                            <CardTitle className="text-3xl font-body text-green-600">{stats.completed}</CardTitle>
                                        </CardHeader>
                                    </Card>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="font-semibold text-lg">Booking Terakhir</h3>
                                        <Button variant="link" onClick={() => navigate('/dashboard/riwayat')} className="p-0 h-auto">Lihat Semua</Button>
                                    </div>

                                    {isLoadingBookings ? (
                                        <div className="space-y-3">
                                            {[1, 2].map(i => <div key={i} className="h-24 bg-white rounded-xl animate-pulse" />)}
                                        </div>
                                    ) : bookings.length > 0 ? (
                                        <div className="space-y-3">
                                            {bookings.slice(0, 2).map((booking, idx) => (
                                                <div key={booking.id} style={{ animationDelay: `${idx * 0.1}s` }} className="bg-white p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-backwards">
                                                    <div className="flex items-start gap-4">
                                                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${booking.service_type === 'studio' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                                                            {booking.service_type === 'studio' ? <Camera className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-medium">{booking.service_type === 'studio' ? 'Studio Session' : 'Photobox Session'}</p>
                                                                <span className="text-xs bg-slate-100 px-2 py-0.5 rounded text-muted-foreground font-mono">{booking.booking_code}</span>
                                                            </div>
                                                            <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {format(new Date(booking.booking_date), 'd MMMM yyyy', { locale: id })}
                                                                <span className="w-1 h-1 bg-gray-300 rounded-full" />
                                                                {booking.start_time}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${getStatusColor(booking.payment_status)}`}>
                                                            {booking.payment_status}
                                                        </span>
                                                        <Button size="sm" variant="outline" onClick={() => setSelectedBooking(booking)}>
                                                            Detail
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 bg-white rounded-xl border border-dashed">
                                            <p className="text-muted-foreground">Belum ada booking.</p>
                                            <Button variant="link" onClick={() => navigate('/#packages')} className="mt-2">Mulai Booking</Button>
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            {/* HISTORY TAB */}
                            <TabsContent value="history" className="space-y-6 animate-in fade-in duration-500">
                                <div>
                                    <h2 className="text-2xl font-display font-bold mb-1">Riwayat Booking</h2>
                                    <p className="text-muted-foreground">Semua aktivitas booking Anda.</p>
                                </div>

                                {isLoadingBookings ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-xl animate-pulse" />)}
                                    </div>
                                ) : bookings.length > 0 ? (
                                    <div className="bg-white rounded-xl border overflow-hidden">
                                        {/* Desktop Table Header */}
                                        <div className="hidden md:grid grid-cols-[160px_minmax(260px,1fr)_140px_140px_160px_72px] gap-0 border-b bg-slate-50 text-sm font-medium text-muted-foreground w-full">
                                            <div className="flex items-center justify-center text-center px-2 py-4 h-full">Kode</div>
                                            <div className="flex items-center justify-center text-center px-2 py-4 h-full">Detail Layanan</div>
                                            <div className="flex items-center justify-center text-center px-2 py-4 h-full">Status</div>
                                            <div className="flex items-center justify-center text-center px-2 py-4 h-full">Total</div>
                                            <div className="flex items-center justify-center text-center px-2 py-4 h-full">Pembayaran</div>
                                            <div className="flex items-center justify-center text-center px-2 py-4 h-full">Aksi</div>
                                        </div>

                                        {bookings.map((booking) => {
                                            const isPending = booking.payment_status === 'PENDING';
                                            const { timeLeftString, isExpired: isExpiredTime } = getCountdown(booking.expires_at, booking.created_at)(now);

                                            // Force expired status in UI if time is up, even if DB says pending
                                            // We check both: actual status EXPIRED OR (PENDING but timer ran out)
                                            let displayStatus = booking.payment_status;
                                            if (isPending && isExpiredTime) {
                                                displayStatus = 'EXPIRED';
                                            }

                                            return (
                                                <div key={booking.id} className="group border-b last:border-0 hover:bg-slate-50 transition-colors">
                                                    {/* Desktop View */}
                                                    <div className="hidden md:grid grid-cols-[160px_minmax(260px,1fr)_140px_140px_160px_72px] gap-0 items-center w-full min-h-[72px]">
                                                        {/* Kode */}
                                                        <div className="flex items-center justify-center text-center px-2 py-4">
                                                            <div className="text-sm font-medium font-mono text-muted-foreground">
                                                                {booking.booking_code}
                                                            </div>
                                                        </div>

                                                        {/* Detail Layanan */}
                                                        <div className="flex items-center justify-center gap-3 px-2 py-4">
                                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${booking.service_type === 'studio'
                                                                ? 'bg-indigo-50 text-indigo-600'
                                                                : (photoboxStyleMap[booking.style_name || ''] || 'bg-pink-50 text-pink-600')
                                                                }`}>
                                                                {booking.service_type === 'studio' ? <Camera className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                                            </div>
                                                            <div className="flex flex-col items-start overflow-hidden">
                                                                <p className="font-medium text-sm text-left truncate max-w-[180px]" title={booking.package_name || booking.style_name}>
                                                                    {booking.service_type === 'studio' ? 'Studio' : 'Photobox'} – {booking.package_name?.replace('Paket Foto Studio – ', '') || booking.style_name || booking.service_type}
                                                                </p>
                                                                <p className="text-xs text-muted-foreground text-left">
                                                                    {format(new Date(booking.booking_date), 'd MMM yyyy', { locale: id })} • {booking.start_time}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Status */}
                                                        <div className="flex items-center justify-center text-center px-2 py-4">
                                                            <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium border uppercase tracking-wide ${getStatusColor(displayStatus)}`}>
                                                                {displayStatus}
                                                            </span>
                                                        </div>

                                                        {/* Total */}
                                                        <div className="flex items-center justify-center text-center px-2 py-4">
                                                            <div className="text-sm font-medium text-muted-foreground">
                                                                Rp {booking.total_amount?.toLocaleString('id-ID')}
                                                            </div>
                                                        </div>

                                                        {/* Pembayaran */}
                                                        <div className="flex items-center justify-center text-center px-2 py-4 flex-col gap-2">
                                                            {displayStatus === 'PENDING' ? (
                                                                <div className="flex flex-col items-center gap-2 w-full">
                                                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded w-fit animate-pulse">
                                                                        <Clock className="w-3 h-3" />
                                                                        {timeLeftString}
                                                                    </div>
                                                                    <div className="flex gap-2 w-full justify-center">
                                                                        <Button
                                                                            size="sm"
                                                                            className="h-7 text-xs px-2 flex-1 bg-amber-600 hover:bg-amber-700 text-white border-none shadow-sm"
                                                                            onClick={() => handleResumePaymentClick('FULL', booking.id)}
                                                                        >
                                                                            Bayar
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="outline"
                                                                            className="h-7 text-xs px-2 flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                                                            onClick={() => {
                                                                                setBookingToCancel(booking);
                                                                                setShowCancelDialog(true);
                                                                            }}
                                                                        >
                                                                            Batal
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            ) : displayStatus === 'DP' ? (
                                                                <div className="flex flex-col items-center gap-1">
                                                                    <span className="text-xs font-medium text-blue-700 flex items-center gap-1">
                                                                        <Check className="w-3 h-3" />
                                                                        DP Terbayar
                                                                    </span>
                                                                    <span className="text-[10px] text-muted-foreground leading-tight text-center">
                                                                        Pelunasan di studio
                                                                    </span>
                                                                </div>
                                                            ) : displayStatus === 'LUNAS' || displayStatus === 'PAID' ? (
                                                                <span className="text-xs font-medium text-green-700 flex items-center gap-1">
                                                                    <Check className="w-3 h-3" />
                                                                    Lunas
                                                                </span>
                                                            ) : displayStatus === 'EXPIRED' ? (
                                                                <div className="flex flex-col items-center">
                                                                    <span className="text-xs font-medium text-muted-foreground">Waktu habis</span>
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-muted-foreground capitalize">-</span>
                                                            )}
                                                        </div>

                                                        {/* Aksi (Dropdown) */}
                                                        <div className="flex items-center justify-center px-2 py-4">
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                        <span className="sr-only">Lihat Detail</span>
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                                                                        <Search className="mr-2 h-4 w-4" />
                                                                        <span>Detail Booking</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => { /* In future: Open Invoice */ setSelectedBooking(booking); }}>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        <span>Invoice</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>
                                                    </div>

                                                    {/* Mobile View */}
                                                    <div className="md:hidden p-4 space-y-3">
                                                        <div className="flex items-start justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${booking.service_type === 'studio' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                                                                    {booking.service_type === 'studio' ? <Camera className="w-4 h-4" /> : <Calendar className="w-4 h-4" />}
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="font-medium text-sm capitalize">{booking.service_type}</p>
                                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wide ${getStatusColor(displayStatus)}`}>
                                                                            {displayStatus}
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{format(new Date(booking.booking_date), 'd MMM yyyy', { locale: id })} • {booking.start_time}</p>
                                                                </div>
                                                            </div>
                                                            <DropdownMenu>
                                                                <DropdownMenuTrigger asChild>
                                                                    <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground">
                                                                        <MoreVertical className="w-4 h-4" />
                                                                    </Button>
                                                                </DropdownMenuTrigger>
                                                                <DropdownMenuContent align="end">
                                                                    <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                                                                        <Search className="mr-2 h-4 w-4" />
                                                                        <span>Detail Booking</span>
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={() => setSelectedBooking(booking)}>
                                                                        <FileText className="mr-2 h-4 w-4" />
                                                                        <span>Invoice</span>
                                                                    </DropdownMenuItem>
                                                                </DropdownMenuContent>
                                                            </DropdownMenu>
                                                        </div>

                                                        {/* Mobile Actions / Status Detail */}
                                                        {displayStatus === 'PENDING' && (
                                                            <div className="bg-amber-50 rounded-lg p-3 border border-amber-100 flex flex-col gap-3">
                                                                <div className="flex items-center justify-between">
                                                                    <span className="text-xs text-amber-800">Sisa Waktu Pembayaran</span>
                                                                    <span className="font-mono font-bold text-amber-700 text-sm animate-pulse">{timeLeftString}</span>
                                                                </div>
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <Button size="sm" className="h-8 bg-amber-600 hover:bg-amber-700 text-white text-xs" onClick={() => handleResumePaymentClick('FULL', booking.id)}>
                                                                        Lanjut Bayar
                                                                    </Button>
                                                                    <Button size="sm" variant="outline" className="h-8 border-red-200 text-red-600 hover:bg-red-50 text-xs" onClick={() => { setBookingToCancel(booking); setShowCancelDialog(true); }}>
                                                                        Batalkan
                                                                    </Button>
                                                                </div>
                                                            </div>
                                                        )}
                                                        {displayStatus === 'DP' && (
                                                            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                                                                <div className="flex items-start gap-2">
                                                                    <Check className="w-4 h-4 text-blue-600 mt-0.5" />
                                                                    <div className="flex flex-col">
                                                                        <span className="text-xs font-medium text-blue-800">DP Sudah Dibayar</span>
                                                                        <span className="text-[10px] text-blue-600 mt-0.5">Pelunasan dilakukan langsung di studio.</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-16 bg-white rounded-xl border border-dashed">
                                        <History className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium">Belum ada riwayat booking</h3>
                                        <p className="text-muted-foreground mb-6">Booking studio atau photobox sekarang untuk membuat kenangan!</p>
                                        <div className="flex gap-4 justify-center">
                                            <Button onClick={() => navigate('/#packages')}>Book Studio</Button>
                                            <Button variant="outline" onClick={() => navigate('/#photobox')}>Book Photobox</Button>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>

                            {/* PROFILE TAB */}
                            <TabsContent value="profile" className="space-y-6 animate-in fade-in duration-500">
                                <div>
                                    <h2 className="text-2xl font-display font-bold mb-1">Profil Akun</h2>
                                    <p className="text-muted-foreground">Kelola informasi pribadi Anda.</p>
                                </div>

                                <div className="bg-white rounded-xl border p-6 max-w-2xl">
                                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="grid gap-2">
                                                <Label htmlFor="fullName">Nama Lengkap</Label>
                                                <Input
                                                    id="fullName"
                                                    value={fullName}
                                                    onChange={(e) => setFullName(e.target.value)}
                                                    placeholder="Nama Lengkap Anda"
                                                />
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="whatsapp">Nomor WhatsApp</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="whatsapp"
                                                        type="tel"
                                                        value={whatsapp}
                                                        onChange={(e) => setWhatsapp(e.target.value)}
                                                        placeholder="08xxxxxxxxxx"
                                                        className="pl-10"
                                                    />
                                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                                        <span className="text-xs font-medium">+62</span>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-muted-foreground">Nomor ini akan digunakan sebagai kontak utama untuk booking.</p>
                                            </div>

                                            <div className="grid gap-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={email}
                                                    disabled
                                                    className="bg-slate-50 text-muted-foreground"
                                                />
                                                <p className="text-xs text-muted-foreground">Email tidak dapat diubah karena terdaftar sebagai akun login.</p>
                                            </div>
                                        </div>

                                        <div className="pt-4 border-t flex justify-end">
                                            <Button type="submit" variant="sage" disabled={isUpdatingProfile}>
                                                {isUpdatingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </TabsContent>

                        </Tabs>
                    </main>
                </div>
            </div>

            <BookingDetailModal
                isOpen={!!selectedBooking}
                onClose={() => setSelectedBooking(null)}
                booking={selectedBooking}
            />

            <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Pilih Metode Pembayaran</DialogTitle>
                        <DialogDescription>
                            Anda ingin membayar lunas atau DP 50% dulu?
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <Button
                            variant="outline"
                            className="justify-between h-auto py-4 border-2 hover:border-[#849283] hover:bg-[#849283]/5"
                            onClick={() => handleResumePaymentClick('FULL')}
                            disabled={isProcessing}
                        >
                            <div className="text-left">
                                <div className="font-semibold">Full Payment</div>
                                <div className="text-xs text-muted-foreground">Bayar lunas sekarang</div>
                            </div>
                            <div className="text-[#849283] font-bold">100%</div>
                        </Button>
                        <Button
                            variant="outline"
                            className="justify-between h-auto py-4 border-2 hover:border-[#849283] hover:bg-[#849283]/5"
                            onClick={() => handleResumePaymentClick('DP')}
                            disabled={isProcessing}
                        >
                            <div className="text-left">
                                <div className="font-semibold">Down Payment (DP)</div>
                                <div className="text-xs text-muted-foreground">Bayar 50% untuk booking</div>
                            </div>
                            <div className="text-[#849283] font-bold">50%</div>
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Batalkan Booking?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini tidak dapat dibatalkan. Booking Anda akan dihapus dari jadwal aktif.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Kembali</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleCancelBooking();
                            }}
                            className="bg-red-600 hover:bg-red-700 text-white"
                        >
                            {isProcessing ? 'Memproses...' : 'Ya, Batalkan'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div >
    );
}
