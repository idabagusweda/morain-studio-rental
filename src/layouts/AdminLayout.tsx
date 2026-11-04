import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
    LayoutDashboard,
    CalendarDays,
    Users,
    FileText,
    LogOut,
    Settings,
    Menu,
    X,
    Home
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const AdminLayout = () => {
    const { user, profile, isAdmin, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [isMobileOpen, setIsMobileOpen] = useState(false);

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

    if (loading) return null;
    if (!isAdmin) return null;

    const navItems = [
        { href: '/admin', label: 'Overview', icon: LayoutDashboard },
        { href: '/admin/bookings', label: 'Bookings', icon: FileText },
        { href: '/admin/calendar', label: 'Calendar', icon: CalendarDays },
        { href: '/admin/users', label: 'Users', icon: Users },
        { href: '/admin/settings', label: 'Settings', icon: Settings },
    ];

    const SidebarContent = () => (
        <div className="bg-white rounded-xl border p-6 h-fit sticky top-24">
            <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-[#849283]/10 flex items-center justify-center text-[#849283] text-xl font-display font-bold">
                    {profile?.full_name?.charAt(0) || 'A'}
                </div>
                <div className="overflow-hidden">
                    <p className="font-medium truncate">{profile?.full_name || 'Admin'}</p>
                    <p className="text-xs text-muted-foreground truncate">Administrator Access</p>
                </div>
            </div>

            <nav className="space-y-1">
                {navItems.map((item) => {
                    const isActive = item.href === '/admin'
                        ? location.pathname === '/admin'
                        : location.pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                                ? 'bg-[#849283]/5 text-[#849283]'
                                : 'text-muted-foreground hover:bg-slate-50'
                                }`}
                        >
                            <item.icon className="w-4 h-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-6 pt-6 border-t">
                <Button
                    variant="ghost"
                    onClick={signOut}
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 px-4"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                </Button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header (Matching User Dashboard) */}
            <header className="bg-white border-b sticky top-0 z-30">
                <div className="container-wide py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link to="/" className="flex items-center gap-3 group">
                            <img
                                src="/images/logoMorain.png"
                                alt="Morain Studio Logo"
                                className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105 brightness-[0.8]"
                            />
                            <span className="font-display text-2xl font-bold tracking-tight text-black leading-none">
                                Morain
                            </span>
                        </Link>
                        <div className="h-6 w-px bg-gray-200 mx-2 hidden sm:block"></div>
                        <h1 className="text-sm font-medium text-muted-foreground hidden sm:block">Admin Dashboard</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Mobile Menu Trigger */}
                        <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="lg:hidden">
                                    <Menu className="w-5 h-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-80">
                                <div className="p-6">
                                    <SidebarContent />
                                </div>
                            </SheetContent>
                        </Sheet>

                        <div className="h-6 w-px bg-gray-200 hidden md:block"></div>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" onClick={() => navigate('/')}>
                            <Home className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Home</span>
                        </Button>
                    </div>
                </div>
            </header>

            {/* Main Container Layout */}
            <div className="container-wide py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar (Desktop) */}
                    <aside className="hidden lg:block w-64 flex-shrink-0">
                        <SidebarContent />
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
