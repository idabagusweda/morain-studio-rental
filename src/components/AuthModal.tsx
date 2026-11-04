import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Eye, EyeOff } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AuthModal = ({ isOpen, onClose, onSuccess }: AuthModalProps) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { signInWithEmail, signUpWithEmail } = useAuth();
  const { toast } = useToast();

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setWhatsapp('');
    setShowPassword(false);
  };

  const handleClose = () => {
    resetForm();
    setMode('login');
    onClose();
  };



  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon isi email dan password',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      let message = error.message;
      if (error.message.includes('Invalid login credentials')) {
        message = 'Email atau password salah';
      }
      toast({
        title: 'Gagal masuk',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Login berhasil',
        description: 'Selamat datang kembali!'
      });
      handleClose();
      onSuccess?.();
    }
    setIsLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName || !whatsapp) {
      toast({
        title: 'Data tidak lengkap',
        description: 'Mohon lengkapi semua field',
        variant: 'destructive'
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Password terlalu pendek',
        description: 'Password minimal 6 karakter',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUpWithEmail(email, password, fullName, whatsapp);
    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = 'Email sudah terdaftar. Silakan login.';
      }
      toast({
        title: 'Gagal mendaftar',
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Pendaftaran berhasil',
        description: 'Akun Anda telah dibuat!'
      });
      handleClose();
      onSuccess?.();
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-display">
            {mode === 'login' ? 'Masuk ke Akun' : 'Daftar Akun Baru'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Email Form */}
          <form onSubmit={mode === 'login' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-1">
                    Nama Lengkap <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Masukkan nama lengkap"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className={!fullName && mode === 'register' ? "border-red-200 focus-visible:ring-red-200" : ""}
                  />
                  {!fullName && mode === 'register' && (
                    <p className="text-[10px] text-red-500">Wajib diisi</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    disabled={isLoading}
                    className={!whatsapp && mode === 'register' ? "border-red-200 focus-visible:ring-red-200" : ""}
                  />
                  {!whatsapp && mode === 'register' && (
                    <p className="text-[10px] text-red-500">Wajib diisi</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                Email {mode === 'register' && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={!email ? "border-red-200 focus-visible:ring-red-200" : ""}
              />
              {!email && (
                <p className="text-[10px] text-red-500">Wajib diisi</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1">
                Password {mode === 'register' && <span className="text-red-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className={`pr-10 ${!password ? "border-red-200 focus-visible:ring-red-200" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {!password && (
                <p className="text-[10px] text-red-500">Wajib diisi</p>
              )}
            </div>

            <Button
              type="submit"
              variant="sage"
              className="w-full h-12 text-base"
              disabled={isLoading || (mode === 'register' ? (!email || !password || !fullName || !whatsapp) : (!email || !password))}
            >
              <Mail className="w-4 h-4 mr-2" />
              {mode === 'login' ? 'Masuk' : 'Daftar Akun'}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p className="text-muted-foreground">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary font-medium hover:underline"
                >
                  Daftar Sekarang
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                Sudah punya akun?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary font-medium hover:underline"
                >
                  Masuk
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
