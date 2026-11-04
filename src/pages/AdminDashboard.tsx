import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PaymentTimer } from '@/components/PaymentTimer';
import { usePaymentLogic } from '@/hooks/usePaymentLogic';
import {
    CalendarDays,
    Users,
    FileText,
    LogOut,
    Search,
    Filter,
    Check,
    X,
    Clock,
    RefreshCw
} from 'lucide-react';

interface Booking {
    id: string;
    booking_code: string;
    user_id: string;
    service_type: string;
    package_name: string | null;
    style_name: string | null;
    booking_date: string;
    start_time: string;
    end_time: string;
    guest_count: number;
    client_name: string;
    client_whatsapp: string;
    client_email: string | null;
    payment_status: string;
    booking_status: string;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_method: string;
    notes: string | null;
    created_at: string;
    expires_at: string | null;
}

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    whatsapp: string | null;
    role: string;
    created_at: string;
}

const AdminDashboard = () => {
    const { user, profile, isAdmin, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { syncExpiredPayments } = usePaymentLogic();

    const [activeTab, setActiveTab] = useState<'bookings' | 'calendar' | 'users'>('bookings');
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [users, setUsers] = useState<Profile[]>([]);
    const [loadingData, setLoadingData] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

    // Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [serviceFilter, setServiceFilter] = useState<string>('all');

    // Redirect non-admin users
    useEffect(() => {
        if (!loading && (!user || !isAdmin)) {
            toast({
                title: 'Akses Ditolak',
                description: 'Anda tidak memiliki akses ke halaman admin.',
                variant: 'destructive'
            });
            navigate('/');
        }
    }, [user, isAdmin, loading, navigate, toast]);

    // Fetch bookings
    const fetchBookings = async () => {
        setLoadingData(true);
        // Sync expired first
        await syncExpiredPayments();

        try {
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('booking_date', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            toast({
                title: 'Gagal memuat data booking',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoadingData(false);
        }
    };

    // Fetch users
    const fetchUsers = async () => {
        setLoadingData(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: any) {
            console.error('Error fetching users:', error);
            toast({
                title: 'Gagal memuat data user',
                description: error.message,
                variant: 'destructive'
            });
        } finally {
            setLoadingData(false);
        }
    };

    useEffect(() => {
        if (isAdmin) {
            fetchBookings();
            fetchUsers();
        }
    }, [isAdmin]);

    // Update booking status
    const updateBookingStatus = async (bookingId: string, field: 'payment_status' | 'booking_status', value: string) => {
        try {
            const updateData: any = { [field]: value, updated_at: new Date().toISOString() };

            // If marking as LUNAS, set remaining_amount to 0
            if (field === 'payment_status' && value === 'LUNAS') {
                const booking = bookings.find(b => b.id === bookingId);
                if (booking) {
                    updateData.paid_amount = booking.total_amount;
                    updateData.remaining_amount = 0;
                }
            }

            const { error } = await supabase
                .from('bookings')
                .update(updateData)
                .eq('id', bookingId);

            if (error) throw error;

            toast({
                title: 'Berhasil',
                description: `Status berhasil diupdate ke ${value}`,
            });

            fetchBookings();
        } catch (error: any) {
            console.error('Error updating booking:', error);
            toast({
                title: 'Gagal update status',
                description: error.message,
                variant: 'destructive'
            });
        }
    };

    // Filter bookings
    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.client_whatsapp.includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || booking.payment_status === statusFilter;
        const matchesService = serviceFilter === 'all' || booking.service_type === serviceFilter;

        return matchesSearch && matchesStatus && matchesService;
    });

    // Get bookings for selected date (calendar view)
    const bookingsForDate = selectedDate
        ? bookings.filter(b => {
            const bookingDate = new Date(b.booking_date);
            return bookingDate.toDateString() === selectedDate.toDateString();
        })
        : [];

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    // Get status badge color
    const getStatusBadge = (status: string, type: 'payment' | 'booking') => {
        const colors: Record<string, string> = {
            'PENDING': 'bg-yellow-100 text-yellow-800',
            'DP': 'bg-blue-100 text-blue-800',
            'LUNAS': 'bg-green-100 text-green-800',
            'EXPIRED': 'bg-gray-100 text-gray-800',
            'CANCELLED': 'bg-red-100 text-red-800',
            'ACTIVE': 'bg-green-100 text-green-800',
            'DONE': 'bg-gray-100 text-gray-800',
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="w-8 h-8 animate-spin text-[#849283]" />
            </div>
        );
    }

    if (!isAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <header className="bg-white border-b border-border sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="text-xl font-display font-semibold text-[#849283]">
                            Admin Dashboard
                        </h1>
                        <span className="text-sm text-muted-foreground">
                            Selamat datang, {profile?.full_name || 'Admin'}
                        </span>
                    </div>
                    <Button variant="outline" onClick={signOut} size="sm">
                        <LogOut className="w-4 h-4 mr-2" />
                        Keluar
                    </Button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-6">
                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6 border-b border-border pb-4">
                    <Button
                        variant={activeTab === 'bookings' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('bookings')}
                        className={activeTab === 'bookings' ? 'bg-[#849283] hover:bg-[#6b7a6b]' : ''}
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Daftar Booking
                    </Button>
                    <Button
                        variant={activeTab === 'calendar' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('calendar')}
                        className={activeTab === 'calendar' ? 'bg-[#849283] hover:bg-[#6b7a6b]' : ''}
                    >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        Kalender
                    </Button>
                    <Button
                        variant={activeTab === 'users' ? 'default' : 'ghost'}
                        onClick={() => setActiveTab('users')}
                        className={activeTab === 'users' ? 'bg-[#849283] hover:bg-[#6b7a6b]' : ''}
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Pengguna
                    </Button>
                </div>

                {/* Bookings Tab */}
                {activeTab === 'bookings' && (
                    <div className="space-y-4">
                        {/* Filters */}
                        <div className="flex flex-wrap gap-4 items-center">
                            <div className="relative flex-1 min-w-[200px]">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="Cari kode booking, nama, atau WhatsApp..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Status Bayar" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Status</SelectItem>
                                    <SelectItem value="PENDING">Pending</SelectItem>
                                    <SelectItem value="DP">DP</SelectItem>
                                    <SelectItem value="LUNAS">Lunas</SelectItem>
                                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={serviceFilter} onValueChange={setServiceFilter}>
                                <SelectTrigger className="w-[150px]">
                                    <SelectValue placeholder="Layanan" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Semua Layanan</SelectItem>
                                    <SelectItem value="studio">Studio</SelectItem>
                                    <SelectItem value="photobox">Photobox</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button variant="outline" onClick={fetchBookings} disabled={loadingData}>
                                <RefreshCw className={`w-4 h-4 mr-2 ${loadingData ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>

                        {/* Booking Table */}
                        <div className="bg-white rounded-lg border border-border overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-secondary/50">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Kode</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Klien</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Layanan</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Jadwal</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status Bayar</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status Booking</th>
                                            <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {filteredBookings.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                                                    Tidak ada data booking
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredBookings.map((booking) => (
                                                <tr key={booking.id} className="hover:bg-secondary/30">
                                                    <td className="px-4 py-3 font-mono text-sm">{booking.booking_code}</td>
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-medium text-sm">{booking.client_name}</p>
                                                            <p className="text-xs text-muted-foreground">{booking.client_whatsapp}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 rounded text-xs font-medium ${booking.service_type === 'studio'
                                                            ? 'bg-purple-100 text-purple-800'
                                                            : 'bg-pink-100 text-pink-800'
                                                            }`}>
                                                            {booking.service_type === 'studio' ? booking.package_name : booking.style_name}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <CalendarDays className="w-3 h-3" />
                                                            {new Date(booking.booking_date).toLocaleDateString('id-ID')}
                                                        </div>
                                                        <div className="flex items-center gap-1 text-muted-foreground">
                                                            <Clock className="w-3 h-3" />
                                                            {booking.start_time} - {booking.end_time}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm font-medium">
                                                        {formatCurrency(booking.total_amount)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex flex-col gap-1 items-start">
                                                            {getStatusBadge(booking.payment_status, 'payment')}
                                                            {booking.payment_status === 'PENDING' && booking.expires_at && (
                                                                <PaymentTimer expiresAt={booking.expires_at} showLabel={false} center={false} />
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {getStatusBadge(booking.booking_status, 'booking')}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex gap-1">
                                                            {booking.payment_status !== 'LUNAS' && (
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => updateBookingStatus(booking.id, 'payment_status', 'LUNAS')}
                                                                    className="h-7 text-xs"
                                                                >
                                                                    <Check className="w-3 h-3 mr-1" />
                                                                    Lunas
                                                                </Button>
                                                            )}
                                                            {booking.booking_status === 'ACTIVE' && (
                                                                <>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => updateBookingStatus(booking.id, 'booking_status', 'DONE')}
                                                                        className="h-7 text-xs"
                                                                    >
                                                                        Selesai
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        onClick={() => updateBookingStatus(booking.id, 'booking_status', 'CANCELLED')}
                                                                        className="h-7 text-xs"
                                                                    >
                                                                        <X className="w-3 h-3" />
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Calendar Tab */}
                {activeTab === 'calendar' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white rounded-lg border border-border p-4">
                            <h3 className="font-medium mb-4">Pilih Tanggal</h3>
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={setSelectedDate}
                                className="rounded-md"
                            />
                        </div>
                        <div className="bg-white rounded-lg border border-border p-4">
                            <h3 className="font-medium mb-4">
                                Booking pada {selectedDate?.toLocaleDateString('id-ID', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </h3>
                            {bookingsForDate.length === 0 ? (
                                <p className="text-muted-foreground text-center py-8">
                                    Tidak ada booking pada tanggal ini
                                </p>
                            ) : (
                                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                    {bookingsForDate.map((booking) => (
                                        <div key={booking.id} className="p-3 bg-secondary/30 rounded-lg">
                                            <div className="flex justify-between items-start mb-2">
                                                <p className="font-mono text-sm font-medium">{booking.booking_code}</p>
                                                {getStatusBadge(booking.payment_status, 'payment')}
                                            </div>
                                            <p className="font-medium">{booking.client_name}</p>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <Clock className="w-3 h-3" />
                                                {booking.start_time} - {booking.end_time}
                                                <span className="px-1.5 py-0.5 rounded bg-secondary text-xs">
                                                    {booking.service_type === 'studio' ? booking.package_name : booking.style_name}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="bg-white rounded-lg border border-border overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Nama</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Email</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">WhatsApp</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Role</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Bergabung</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                                                Tidak ada data pengguna
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((u) => (
                                            <tr key={u.id} className="hover:bg-secondary/30">
                                                <td className="px-4 py-3 font-medium">{u.full_name || '-'}</td>
                                                <td className="px-4 py-3 text-sm">{u.email || '-'}</td>
                                                <td className="px-4 py-3 text-sm">{u.whatsapp || '-'}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === 'admin'
                                                        ? 'bg-purple-100 text-purple-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-muted-foreground">
                                                    {new Date(u.created_at).toLocaleDateString('id-ID')}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
