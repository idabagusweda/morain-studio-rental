import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Search,
    RefreshCw,
    CalendarDays,
    Clock,
    Eye,
    Camera
} from 'lucide-react';
import { BookingDetailModal } from '@/components/admin/BookingDetailModal';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Booking {
    id: string;
    booking_code: string;
    booking_date: string;
    start_time: string;
    end_time: string;
    client_name: string;
    client_whatsapp: string;
    client_email: string | null;
    service_type: string;
    package_name: string | null;
    style_name: string | null;
    total_amount: number;
    paid_amount: number;
    remaining_amount: number;
    payment_status: string;
    booking_status: string;
    payment_method: string;
    notes: string | null;
    created_at: string;
}

const Bookings = () => {
    const { toast } = useToast();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [serviceFilter, setServiceFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('bookings')
                .select('*')
                .order('booking_date', { ascending: false });

            if (error) throw error;
            setBookings(data || []);
        } catch (error: any) {
            console.error('Error fetching bookings:', error);
            toast({
                title: 'Error',
                description: 'Gagal memuat data booking',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        const lowerStatus = status?.toLowerCase() || '';
        switch (lowerStatus) {
            case 'lunas':
            case 'paid':
            case 'selesai':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'dp':
                return 'text-amber-600 bg-amber-50 border-amber-200';
            case 'pending':
                return 'text-gray-600 bg-gray-50 border-gray-200';
            case 'batal':
            case 'cancelled':
                return 'text-red-600 bg-red-50 border-red-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    };

    const filteredBookings = bookings.filter(booking => {
        const matchesSearch =
            booking.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            booking.client_whatsapp.includes(searchQuery);

        const matchesStatus = statusFilter === 'all' || booking.payment_status === statusFilter;
        const matchesService = serviceFilter === 'all' || booking.service_type === serviceFilter;

        return matchesSearch && matchesStatus && matchesService;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-display font-bold mb-1 text-[#849283]">Bookings</h2>
                    <p className="text-muted-foreground">Kelola semua booking studio dan photobox.</p>
                </div>
                <Button onClick={fetchBookings} variant="outline" size="sm" disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Filters (Styled as User Card) */}
            <div className="flex flex-wrap gap-4 items-center bg-white p-4 rounded-xl border shadow-soft">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari kode, nama, atau WhatsApp..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 border-gray-200"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] border-gray-200">
                        <SelectValue placeholder="Status Pembayaran" />
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
                    <SelectTrigger className="w-[150px] border-gray-200">
                        <SelectValue placeholder="Tipe Layanan" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Semua Layanan</SelectItem>
                        <SelectItem value="studio">Studio</SelectItem>
                        <SelectItem value="photobox">Photobox</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table (Styled matching User Dashboard History) */}
            <div className="bg-white rounded-xl border shadow-soft overflow-hidden">
                <div className="overflow-x-auto">
                    {/* Header Row */}
                    <div className="min-w-[800px] grid grid-cols-7 gap-4 p-4 border-b bg-slate-50 text-sm font-medium text-muted-foreground">
                        <div className="col-span-2">Klien & Layanan</div>
                        <div className="text-center">Jadwal</div>
                        <div className="text-center">Paket</div>
                        <div className="text-center">Total</div>
                        <div className="text-center">Status</div>
                        <div className="text-center">Aksi</div>
                    </div>

                    <div className="divide-y">
                        {loading ? (
                            <div className="p-8 text-center text-muted-foreground">Memuat data...</div>
                        ) : filteredBookings.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground">Tidak ada data booking yang sesuai filter.</div>
                        ) : (
                            filteredBookings.map((booking) => (
                                <div key={booking.id} className="min-w-[800px] grid grid-cols-7 gap-4 p-4 items-center hover:bg-slate-50 transition-colors">
                                    {/* Client & Service */}
                                    <div className="col-span-2 flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${booking.service_type === 'studio' ? 'bg-indigo-50 text-indigo-600' : 'bg-pink-50 text-pink-600'}`}>
                                            {booking.service_type === 'studio' ? <Camera className="w-5 h-5" /> : <CalendarDays className="w-5 h-5" />}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-medium text-sm truncate">{booking.client_name}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span className="capitalize">{booking.service_type}</span>
                                                <span>•</span>
                                                <span className="font-mono">{booking.booking_code}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Schedule */}
                                    <div className="text-center">
                                        <div className="text-sm font-medium">{format(new Date(booking.booking_date), 'd MMM yyyy', { locale: id })}</div>
                                        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {booking.start_time} - {booking.end_time}
                                        </div>
                                    </div>

                                    {/* Package */}
                                    <div className="text-center text-sm">
                                        {booking.package_name?.replace('Paket Foto Studio – ', '') || booking.style_name || '-'}
                                    </div>

                                    {/* Total */}
                                    <div className="text-center">
                                        <div className="font-medium text-sm">{formatCurrency(booking.total_amount)}</div>
                                        {booking.remaining_amount > 0 && (
                                            <div className="text-[10px] text-red-500 font-medium">Sisa: {formatCurrency(booking.remaining_amount)}</div>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="text-center">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border capitalize ${getStatusColor(booking.payment_status)}`}>
                                            {booking.payment_status}
                                        </span>
                                    </div>

                                    {/* Action */}
                                    <div className="text-center">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedBooking(booking);
                                                setIsModalOpen(true);
                                            }}
                                            className="h-8 hover:bg-slate-100"
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Detail
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <BookingDetailModal
                booking={selectedBooking}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onUpdate={fetchBookings}
            />
        </div>
    );
};

export default Bookings;
