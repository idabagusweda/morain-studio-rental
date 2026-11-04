import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Mail, Eye, EyeOff, Check, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation(['auth', 'common']);
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
      hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd),
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
        title: t('validation.incompleteData'),
        description: t('validation.fillEmailPassword'),
        variant: 'destructive'
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: t('validation.invalidEmail'),
        description: t('validation.invalidEmailFormat'),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signInWithEmail(email, password);
    if (error) {
      let message = error.message;
      if (error.message.includes('Invalid login credentials')) {
        message = t('messages.invalidCredentials');
      }
      toast({
        title: t('messages.loginFailed'),
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('messages.loginSuccess'),
        description: t('messages.loginSuccessDescription')
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
        title: t('validation.incompleteData'),
        description: t('validation.fillAllFields'),
        variant: 'destructive'
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast({
        title: t('validation.invalidEmail'),
        description: t('validation.invalidEmailFormat'),
        variant: 'destructive'
      });
      return;
    }

    if (!isValidPhone(whatsapp)) {
      toast({
        title: t('validation.invalidWhatsapp'),
        description: t('validation.whatsappDigits'),
        variant: 'destructive'
      });
      return;
    }

    if (!isPasswordStrong) {
      toast({
        title: t('validation.passwordNotStrong'),
        description: t('validation.passwordCriteria'),
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUpWithEmail(email, password, fullName, whatsapp);
    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = t('messages.emailAlreadyRegistered');
      }
      toast({
        title: t('messages.registerFailed'),
        description: message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: t('messages.registerSuccess'),
        description: t('messages.registerSuccessDescription')
      });
      handleClose();
      onSuccess?.();
    }
    setIsLoading(false);
  };

  const PasswordStrengthIndicator = () => {
    if (mode !== 'register' || !password) return null;

    const indicators = [
      { label: t('passwordStrength.minLength'), met: passwordStrength.hasMinLength },
      { label: t('passwordStrength.uppercase'), met: passwordStrength.hasUppercase },
      { label: t('passwordStrength.lowercase'), met: passwordStrength.hasLowercase },
      { label: t('passwordStrength.number'), met: passwordStrength.hasNumber },
      { label: t('passwordStrength.symbol'), met: passwordStrength.hasSymbol },
    ];

    return (
      <div className="mt-2 space-y-1 p-3 bg-muted/50 rounded-md border">
        <p className="text-xs font-medium text-muted-foreground mb-1">{t('passwordStrength.title')}</p>
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
            {mode === 'login' ? t('modal.loginTitle') : t('modal.registerTitle')}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <form onSubmit={mode === 'login' ? handleEmailSignIn : handleEmailSignUp} className="space-y-4">
            {mode === 'register' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="flex items-center gap-1">
                    {t('fields.fullName')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder={t('fields.fullNamePlaceholder')}
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                    className={!fullName && mode === 'register' ? "border-red-200 focus-visible:ring-red-200" : ""}
                  />
                  {!fullName && mode === 'register' && (
                    <p className="text-xs text-red-500">{t('common:validation.required')}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp" className="flex items-center gap-1">
                    {t('fields.whatsapp')} <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    placeholder={t('fields.whatsappPlaceholder')}
                    value={whatsapp}
                    onChange={(e) => handlePhoneChange(e.target.value)}
                    disabled={isLoading}
                    maxLength={13}
                    className={whatsapp && !isValidPhone(whatsapp) ? "border-red-200 focus-visible:ring-red-200" : ""}
                  />
                  {whatsapp && !isValidPhone(whatsapp) && (
                    <p className="text-xs text-red-500">{t('validation.whatsappDigits')}</p>
                  )}
                  {!whatsapp && mode === 'register' && (
                    <p className="text-xs text-red-500">{t('common:validation.required')}</p>
                  )}
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1">
                {t('fields.email')} {mode === 'register' && <span className="text-red-500">*</span>}
              </Label>
              <Input
                id="email"
                type="email"
                placeholder={t('fields.emailPlaceholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className={email && !isValidEmail(email) ? "border-red-200 focus-visible:ring-red-200" : ""}
              />
              {email && !isValidEmail(email) && (
                <p className="text-xs text-red-500">{t('validation.invalidEmailFormat')}</p>
              )}
              {!email && (
                <p className="text-xs text-red-500">{t('common:validation.required')}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-1">
                {t('fields.password')} {mode === 'register' && <span className="text-red-500">*</span>}
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={mode === 'register' ? t('fields.passwordRegisterPlaceholder') : t('fields.passwordPlaceholder')}
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
                <p className="text-xs text-red-500">{t('common:validation.required')}</p>
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
              {mode === 'login' ? t('buttons.login') : t('buttons.register')}
            </Button>
          </form>

          <div className="text-center text-sm">
            {mode === 'login' ? (
              <p className="text-muted-foreground">
                {t('switch.noAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('register')}
                  className="text-primary font-medium hover:underline"
                >
                  {t('switch.registerNow')}
                </button>
              </p>
            ) : (
              <p className="text-muted-foreground">
                {t('switch.haveAccount')}{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-primary font-medium hover:underline"
                >
                  {t('switch.loginNow')}
                </button>
              </p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
