# Multi-Language (i18n) Implementation Guide
**Morain Studio Rental - Complete Translation Reference**

## ✅ Already Completed

### Core Setup
- ✅ i18n config (`src/i18n.ts`)
- ✅ Language switcher component (`src/components/LanguageSwitcher.tsx`)
- ✅ i18n utilities (`src/lib/i18nUtils.ts`)
- ✅ All translation files (6 namespaces × 2 languages)

### Components
- ✅ `App.tsx` - i18n initialized
- ✅ `Header.tsx` - Full navigation, user dropdown, language switcher
- ✅ `HeroSection.tsx` - Hero content
- ✅ `PackagesSection.tsx` - Studio packages
- ✅ `AuthModal.tsx` - Login/register forms

## 📋 Remaining Components (27)

### Landing Pages (High Priority)
1. `src/components/PhotoboxSection.tsx`
2. `src/components/WhyChooseSection.tsx`
3. `src/components/TestimonialsSection.tsx`
4. `src/components/FAQSection.tsx`
5. `src/components/ContactSection.tsx`
6. `src/components/Footer.tsx`
7. `src/components/PortfolioSection.tsx`

### Booking Flow
8. `src/components/BookingModal.tsx`
9. `src/components/PhotoboxBookingModal.tsx`
10. `src/components/BookingStepper.tsx`
11. `src/components/CalendarModal.tsx`
12. `src/components/TimeSlotGrid.tsx`
13. `src/components/PaymentTimer.tsx`

### User Dashboard
14. `src/pages/Dashboard.tsx` (LARGE - 994 lines)
15. `src/components/dashboard/BookingDetailModal.tsx`
16. `src/components/dashboard/InvoiceTemplate.tsx`
17. `src/components/PendingBookingModal.tsx`
18. `src/components/BookingHistoryModal.tsx`
19. `src/components/ProfileModal.tsx`
20. `src/components/TermsModal.tsx`

### Admin Dashboard
21. `src/pages/admin/Overview.tsx`
22. `src/pages/admin/Bookings.tsx`
23. `src/pages/admin/Calendar.tsx`
24. `src/pages/admin/Users.tsx`
25. `src/pages/admin/Settings.tsx`
26. `src/components/admin/BookingDetailModal.tsx`
27. `src/layouts/AdminLayout.tsx`

---

## 🔧 Translation Pattern

### Step 1: Import Hook
```tsx
import { useTranslation } from 'react-i18next';
```

### Step 2: Initialize in Component
```tsx
const MyComponent = () => {
  const { t, i18n } = useTranslation(['namespace1', 'namespace2']);
  
  // Component code...
}
```

### Step 3: Replace Hardcoded Text
**Before:**
```tsx
<h1>Selamat Datang</h1>
<Button>Simpan</Button>
```

**After:**
```tsx
<h1>{t('section.welcome')}</h1>
<Button>{t('common:buttons.save')}</Button>
```

### Step 4: Handle Dynamic Content
**Status badges:**
```tsx
<span>{t(`common:status.${booking.payment_status.toLowerCase()}`)}</span>
```

**Counts/Numbers:**
```tsx
<p>{t('dashboard:overview.stats.totalBookings')}: {stats.total}</p>
```

### Step 5: Format Currency & Dates
```tsx
import { formatCurrency, formatDate } from '@/lib/i18nUtils';

// Currency
<span>{formatCurrency(amount, i18n.language)}</span>

// Date
<span>{formatDate(booking.date, 'd MMMM yyyy', i18n.language)}</span>
```

---

## 📦 Available Translation Keys

### Common (`common.json`)
- `buttons.*` - All button labels
- `status.*` - Payment/booking statuses
- `labels.*` - Form labels
- `messages.*` - Generic messages
- `validation.*` - Validation errors
- `user.*` - User-related terms
- `navigation.*` - Nav menu items

### Landing (`landing.json`)
- `hero.*` - Hero section
- `packages.*` - Studio packages
- `photobox.*` - Photobox section
- `whyChoose.*` - Why choose section
- `testimonials.*` - Testimonials
- `faq.*` - FAQ section
- `contact.*` - Contact form
- `footer.*` - Footer content

### Auth (`auth.json`)
- `modal.*` - Modal titles
- `fields.*` - Form fields
- `passwordStrength.*` - Password requirements
- `validation.*` - Validation messages
- `messages.*` - Success/error messages
- `switch.*` - Toggle between login/register

### Dashboard (`dashboard.json`)
- `header.*` - Dashboard header
- `sidebar.*` - Sidebar navigation
- `overview.*` - Overview stats
- `history.*` - Booking history
- `profile.*` - Profile settings
- `booking.*` - Booking actions

### Admin (`admin.json`)
- `overview.*` - Admin overview
- `bookings.*` - Bookings management
- `calendar.*` - Calendar view
- `users.*` - User management
- `settings.*` - Settings page

### Booking (`booking.json`)
- `modal.*` - Booking modal
- `steps.*` - Booking steps
- `package.*` - Package selection
- `date.*` - Date selection
- `time.*` - Time selection
- `summary.*` - Booking summary
- `photobox.*` - Photobox booking
- `validation.*` - Validation messages

---

## 🎯 Quick Implementation Examples

### Example 1: Simple Section Header
**File: `src/components/TestimonialsSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next';

export const TestimonialsSection = () => {
  const { t } = useTranslation(['landing']);
  
  return (
    <section id="testimonials" className="section-padding">
      <div className="container-wide">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-primary font-medium text-sm uppercase">
            {t('testimonials.sectionTag')}
          </span>
          <h2 className="font-display text-3xl sm:text-4xl font-semibold mt-3 mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-lg">
            {t('testimonials.description')}
          </p>
        </div>
        {/* Rest of component */}
      </div>
    </section>
  );
};
```

### Example 2: Form with Validation
**File: `src/components/ContactSection.tsx`**

```tsx
import { useTranslation } from 'react-i18next';

export const ContactSection = () => {
  const { t } = useTranslation(['landing', 'common']);
  
  return (
    <form onSubmit={handleSubmit}>
      <Label>{t('contact.form.name')}</Label>
      <Input placeholder={t('contact.form.namePlaceholder')} />
      
      <Label>{t('contact.form.email')}</Label>
      <Input placeholder={t('contact.form.emailPlaceholder')} />
      
      <Label>{t('contact.form.message')}</Label>
      <Textarea placeholder={t('contact.form.messagePlaceholder')} />
      
      <Button type="submit">
        {t('contact.form.send')}
      </Button>
    </form>
  );
};
```

### Example 3: Toast Notifications
```tsx
const { t } = useTranslation(['dashboard', 'common']);

toast({
  title: t('dashboard:profile.success'),
  description: t('dashboard:profile.successDescription')
});

toast({
  title: t('common:messages.error'),
  description: error.message,
  variant: 'destructive'
});
```

### Example 4: Dynamic Keys (Status Badges)
```tsx
const { t } = useTranslation(['common']);

// Status is dynamic: 'PENDING', 'DP', 'LUNAS', etc.
<span className={getStatusColor(status)}>
  {t(`common:status.${status.toLowerCase()}`)}
</span>
```

### Example 5: Currency & Date
```tsx
import { formatCurrency, formatDate } from '@/lib/i18nUtils';
import { useTranslation } from 'react-i18next';

const { i18n } = useTranslation();

// Currency formatting
<div>
  {formatCurrency(booking.total_amount, i18n.language)}
</div>

// Date formatting
<div>
  {formatDate(booking.booking_date, 'd MMMM yyyy', i18n.language)}
</div>
```

---

## 🚀 Testing Checklist

### After Translating Each Component:

1. **Build Check**
   ```bash
   npm run build
   ```
   Ensure no TypeScript errors

2. **Visual Test**
   ```bash
   npm run dev
   ```
   - Switch language (Globe icon in header)
   - Navigate to the component
   - Verify all text changes ID ↔ EN
   - Check no hardcoded Indonesian text remains

3. **Layout Check**
   - English text sometimes longer than Indonesian
   - Ensure no text overflow or broken layouts
   - Test on mobile viewport

4. **Edge Cases**
   - Empty states
   - Error messages
   - Loading states
   - Modal titles & buttons

---

## 📊 Progress Tracking

Run this command to check remaining work:
```bash
bash scripts/complete-i18n.sh
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Translation key not found"
**Cause:** Key doesn't exist in JSON file
**Fix:** Add key to both `id.json` and `en.json`

### Issue 2: Text not changing when switching language
**Cause:** Hardcoded string instead of `t()` call
**Fix:** Replace string with translation key

### Issue 3: Layout breaks with English text
**Cause:** English text longer than Indonesian
**Fix:** Use `truncate`, `line-clamp`, or adjust container width

### Issue 4: Date format wrong
**Cause:** Using raw `format()` without locale
**Fix:** Use `formatDate()` helper from `i18nUtils.ts`

### Issue 5: Currency showing wrong format
**Cause:** Using raw `Intl.NumberFormat()`
**Fix:** Use `formatCurrency()` helper

---

## 🎓 Best Practices

1. **Namespace Selection**
   - Use `common` for shared terms (buttons, status, labels)
   - Use specific namespace for section content
   - Example: `const { t } = useTranslation(['landing', 'common']);`

2. **Key Naming**
   - Use descriptive hierarchical keys: `section.subsection.item`
   - Example: `packages.basic.description`

3. **Avoid String Concatenation**
   - ❌ Bad: `{t('hello')} {userName}!`
   - ✅ Good: `{t('greeting', { name: userName })}`
   - Requires interpolation in JSON: `"greeting": "Hello {{name}}!"`

4. **Keep Brand Names Untranslated**
   - Don't translate: "Morain", "Basic", "Standard", "Premium"
   - These are identifiers, not content

5. **Consistency**
   - Use same key for same concept across components
   - Example: Always use `common:buttons.save` for Save button

---

## 📝 Final Steps

1. Translate all 27 remaining components using patterns above
2. Run `bash scripts/complete-i18n.sh` to verify completion
3. Build and test: `npm run build && npm run dev`
4. Do full app walkthrough with language switching
5. Fix any layout issues or missing translations
6. Document any custom translations added

---

## 🎉 Completion Criteria

Project is **100% translated** when:
- [ ] All 27 components have `useTranslation` hook
- [ ] No hardcoded Indonesian/English strings in UI
- [ ] Language switcher works on all pages
- [ ] All dates use locale-aware formatting
- [ ] All currency displays use locale formatting
- [ ] Build completes without errors
- [ ] Visual test passes for both languages
- [ ] Mobile layout works in both languages

---

**Current Status:** 5/32 components complete (15.6%)
**Translation Files:** ✅ Complete
**Core Infrastructure:** ✅ Complete
**Remaining Work:** 27 components

**Estimated Time:** 4-6 hours for manual translation of all components
