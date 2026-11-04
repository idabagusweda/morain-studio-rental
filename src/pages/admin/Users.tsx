import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, ShieldAlert, User, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslation } from 'react-i18next';
import { formatDate } from '@/lib/i18nUtils';

interface Profile {
    id: string;
    full_name: string | null;
    email: string | null;
    whatsapp: string | null;
    role: string;
    created_at: string;
}

const Users = () => {
    const { t, i18n } = useTranslation(['admin', 'common']);
    const { toast } = useToast();
    const [users, setUsers] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setUsers(data || []);
        } catch (error: unknown) {
            console.error('Error fetching users:', error);
            toast({
                title: t('common:messages.error', 'Error'),
                description: t('admin:users.errorFetch', 'Gagal memuat data pengguna'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        const action = newRole === 'admin' ? 'promote' : 'demote';

        if (!confirm(t('admin:users.confirmChangeRole', { role: newRole, defaultValue: `Apakah Anda yakin ingin mengubah role user ini menjadi ${newRole}?` }))) return;

        setUpdating(userId);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ role: newRole })
                .eq('id', userId);

            if (error) throw error;

            toast({
                title: t('common:messages.success', 'Berhasil'),
                description: t('admin:users.roleSuccess', { action, defaultValue: `User berhasil di-${action}` }),
            });

            setUsers(users.map(u =>
                u.id === userId ? { ...u, role: newRole } : u
            ));
        } catch (error: unknown) {
            console.error('Error updating role:', error);
            const message = error instanceof Error ? error.message : '';
            toast({
                title: t('common:messages.failed', 'Gagal'),
                description: message,
                variant: 'destructive'
            });
        } finally {
            setUpdating(null);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.full_name?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-display font-bold mb-1 text-[#849283]">{t('admin:users.title', 'Users')}</h2>
                    <p className="text-muted-foreground">{t('admin:users.description', 'Kelola pengguna dan akses admin.')}</p>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <div className="p-4 border-b bg-slate-50 flex items-center justify-between">
                    <h3 className="font-medium flex items-center gap-2">
                        <UserCheck className="w-4 h-4 text-muted-foreground" />
                        {t('admin:users.listTitle', { count: filteredUsers.length, defaultValue: `Daftar Pengguna (${filteredUsers.length})` })}
                    </h3>
                    <div className="relative max-w-xs w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder={t('admin:users.searchPlaceholder', 'Cari user (nama/email)...')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-9 bg-white"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50/50 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('admin:users.table.name', 'User')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('admin:users.table.whatsapp', 'Kontak')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('admin:users.table.role', 'Role')}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('admin:users.table.registered', 'Bergabung')}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">{t('admin:users.table.action', 'Aksi')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">{t('admin:bookings.loading', 'Memuat data...')}</td></tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">{t('admin:users.noFilteredUsers', 'Tidak ada user ditemukan')}</td></tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-foreground">{user.full_name || 'Tanpa Nama'}</div>
                                                    <div className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm">
                                                <div>{user.email}</div>
                                                <div className="text-muted-foreground text-xs">{user.whatsapp || '-'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className={
                                                user.role === 'admin' ? 'bg-[#849283] hover:bg-[#6b7a6b]' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            }>
                                                {user.role === 'admin' ? t('admin:users.roles.admin', 'Admin') : t('admin:users.roles.user', 'User')}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                                            {formatDate(new Date(user.created_at), 'd MMM yyyy', i18n.language)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                disabled={updating === user.id}
                                                onClick={() => handleRoleUpdate(user.id, user.role)}
                                                className={user.role === 'admin' ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : 'text-[#849283] hover:text-[#6b7a6b] hover:bg-[#849283]/10'}
                                            >
                                                {user.role === 'user' ? (
                                                    <>
                                                        <Shield className="w-4 h-4 mr-2" />
                                                        {t('admin:users.promoteAdmin', 'Jadikan Admin')}
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShieldAlert className="w-4 h-4 mr-2" />
                                                        {t('admin:users.demoteAdmin', 'Hapus Admin')}
                                                    </>
                                                )}
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
