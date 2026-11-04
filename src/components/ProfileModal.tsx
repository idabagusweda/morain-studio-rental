import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { User, Save } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { user, profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user logged in via Google
  const isGoogleUser = user?.app_metadata?.provider === 'google';

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setWhatsapp(profile.whatsapp || '');
      setEmail(profile.email || user?.email || '');
    }
  }, [profile, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const updateData: any = {
      full_name: fullName,
      whatsapp
    };

    // Only update email if not Google user
    if (!isGoogleUser) {
      updateData.email = email;
    }

    const { error } = await updateProfile(updateData);

    if (error) {
      toast({
        title: 'Gagal menyimpan',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Profil berhasil diperbarui',
        description: 'Perubahan telah disimpan'
      });
      onClose();
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-display">
            <User className="w-5 h-5" />
            Akun Saya
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="profileName">Nama Lengkap</Label>
            <Input
              id="profileName"
              type="text"
              placeholder="Masukkan nama lengkap"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileWhatsapp">Nomor WhatsApp</Label>
            <Input
              id="profileWhatsapp"
              type="tel"
              placeholder="08xxxxxxxxxx"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="profileEmail">
              Email
              {isGoogleUser && (
                <span className="ml-2 text-xs text-muted-foreground">(tidak dapat diubah)</span>
              )}
            </Label>
            <Input
              id="profileEmail"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading || isGoogleUser}
              className={isGoogleUser ? 'bg-muted' : ''}
            />
          </div>

          <Button
            type="submit"
            variant="sage"
            className="w-full h-12"
            disabled={isLoading}
          >
            <Save className="w-4 h-4 mr-2" />
            Simpan Perubahan
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
