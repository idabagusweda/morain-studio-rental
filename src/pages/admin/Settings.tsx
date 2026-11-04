import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OperationalHours {
    open: string;
    close: string;
}

const Settings = () => {
    const { t } = useTranslation(['admin', 'common']);
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [hours, setHours] = useState<OperationalHours>({ open: '09:00', close: '20:00' });
    const [studioDuration, setStudioDuration] = useState('60');
    const [photoboxDuration, setPhotoboxDuration] = useState('15');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('app_settings')
                .select('*');

            if (error) {
                console.warn('Settings table not ready:', error.message);
                return;
            }

            const hoursSetting = data.find(s => s.key === 'operational_hours');
            const studioSetting = data.find(s => s.key === 'studio_slot_duration');
            const photoboxSetting = data.find(s => s.key === 'photobox_slot_duration');

            if (hoursSetting?.value) setHours(hoursSetting.value as OperationalHours);
            if (studioSetting?.value) setStudioDuration(String(studioSetting.value));
            if (photoboxSetting?.value) setPhotoboxDuration(String(photoboxSetting.value));
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const updates = [
                { key: 'operational_hours', value: hours },
                { key: 'studio_slot_duration', value: Number(studioDuration) },
                { key: 'photobox_slot_duration', value: Number(photoboxDuration) }
            ];

            for (const update of updates) {
                const { error } = await supabase
                    .from('app_settings')
                    .upsert({
                        key: update.key,
                        value: update.value,
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'key' });

                if (error) throw error;
            }

            toast({
                title: t('common:messages.success', 'Berhasil'),
                description: t('admin:settings.saveSuccess', 'Pengaturan berhasil disimpan.'),
            });
        } catch (error: unknown) {
            console.error('Error saving settings:', error);
            toast({
                title: t('common:messages.failed', 'Gagal'),
                description: t('admin:settings.saveError', 'Pastikan Anda telah menjalankan migrasi database.'),
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-display font-bold text-[#849283]">{t('admin:settings.title', 'Settings')}</h2>
                <p className="text-muted-foreground">{t('admin:settings.description', 'Konfigurasi operasional studio.')}</p>
            </div>

            <div className="grid gap-6 max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5" /> {t('admin:settings.operationalHours', 'Jam Operasional')}
                        </CardTitle>
                        <CardDescription>
                            {t('admin:settings.operationalHoursDesc', 'Atur jam buka dan tutup studio untuk ketersediaan slot.')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>{t('admin:settings.openTime', 'Jam Buka')}</Label>
                                <Input
                                    type="time"
                                    value={hours.open}
                                    onChange={(e) => setHours(prev => ({ ...prev, open: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>{t('admin:settings.closeTime', 'Jam Tutup')}</Label>
                                <Input
                                    type="time"
                                    value={hours.close}
                                    onChange={(e) => setHours(prev => ({ ...prev, close: e.target.value }))}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end">
                    <Button onClick={handleSave} disabled={loading} className="bg-[#849283] hover:bg-[#6b7a6b]">
                        <Save className="w-4 h-4 mr-2" />
                        {loading ? t('admin:settings.saving', 'Menyimpan...') : t('admin:settings.save', 'Simpan Pengaturan')}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
