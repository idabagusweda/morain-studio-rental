import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Eye, EyeOff, Check, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PasswordStrength {
  hasMinLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  hasSymbol: boolean;
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

  // Email validation
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Phone validation (Indonesian format, only numbers)
  const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^[0-9]{10,13}$/;
    return phoneRegex.test(phone);
  };

  // Password strength checker
  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    return {
      hasMinLength: pwd.length >= 8,
      hasUppercase: /[A-Z]/.test(pwd),
      hasLowercase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSymbol: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
    };
  };

  const passwordStrength = checkPasswordStrength(password);
  const isPasswordStrong = mode === 'register' 
    ? Object.values(passwordStrength).every(v => v === true)
    : true;

  // Format phone number (remove non-digits, enforce 08xxx format)
  const handlePhoneChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setWhatsapp(digitsOnly);
  };

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

    if (!isValidEmail(email)) {
      toast({
        title: 'Email tidak valid',
        description: 'Format email salah. Contoh: nama@domain.com',
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

    if (!isValidEmail(email)) {
      toast({
        title: 'Email tidak valid',
        description: 'Format email salah. Contoh: nama@domain.com',
        variant: 'destructive'
      });
      return;
    }

    if (!isValidPhone(whatsapp)) {
      toast({
        title: 'Nomor WhatsApp tidak valid',
        description: 'Nomor harus 10-13 digit angka (contoh: 08123456789)',
        variant: 'destructive'
      });
      return;
    }

    if (!isPasswordStrong) {
      toast({
        title: 'Password tidak memenuhi syarat',
        description: 'Pastikan semua kriteria password terpenuhi',
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

  const PasswordStrengthIndicator = () => {
    if (mode !== 'register' || !password) return null;

    const indicators = [
      { label: 'Minimal 8 karakter', met: passwordStrength.hasMinLength },
      { label: 'Huruf besar (A-Z)', met: passwordStrength.hasUppercase },
      { label: 'Huruf kecil (a-z)', met: passwordStrength.hasLowercase },
      { label: 'Angka (0-9)', met: passwordStrength.hasNumber },
      { label: 'Simbol (!@#$%...)', met: passwordStrength.hasSymbol },
    ];

    return (
      <div className="mt-2 space-y-1 p-3 bg-muted/50 rounded-md border">
        <p className="text-xs font-medium text-muted-foreground mb-1">Syarat Password:</p>
        {indicators.map((ind, idx) => (
          <div key={idx} className="flex items-center gap-2 text-xs">
            {ind.met ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <X className="w-3 h-3 text-muted-foreground" />
            )}
            <span className={ind.met ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
              {ind.label}
            </span>
          </div>
        ))}
      </div>
    );
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
                    <p className="text-xs text-red-500">Wajib diisi</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1">
                    Nomor WhatsApp <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder="08123456789 (10-13 digit)"
                    value={whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={isLoading}
                    maxLength={13}
                    className={whatsapp && !isValidPhone(whatsapp) ? "border-red-200 focus-visible:ring-red-200" : ""}
                  />
                  {whatsapp && !isValidPhone(whatsapp) && (
                    <p className="text-xs text-red-500">Nomor harus 10-13 digit angka</p>
                  )}
                  {!whatsapp && mode === 'register' && (
                    <p className="text-xs text-red-500">Wajib diisi</p>
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
                placeholder="nama@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={email && !isValidEmail(email) ? "border-red-200 focus-visible:ring-red-200" : ""}
              />
              {email && !isValidEmail(email) && (
                <p className="text-xs text-red-500">Format email tidak valid (contoh: nama@domain.com)</p>
              )}
              {!email && (
                <p className="text-xs text-red-500">Wajib diisi</p>
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
                  placeholder={mode === 'register' ? "Min. 8 karakter, besar, kecil, angka, simbol" : "Masukkan password"}
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
                <p className="text-xs text-red-500">Wajib diisi</p>
              )}
              <PasswordStrengthIndicator />
            </div>

            <Button
              type="submit"
              variant="sage"
              className="w-full h-12 text-base"
              disabled={isLoading || (mode === 'register' ? (!email || !password || !fullName || !whatsapp || !isPasswordStrong || !isValidEmail(email) || !isValidPhone(whatsapp)) : (!email || !password || !isValidEmail(email)))}
            >
              <Mail className="w-4 h-4 mr-2" />
              {mode === 'login' ? 'Masuk' : 'Daftar Akun'}
            </Button>
          </form>

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
