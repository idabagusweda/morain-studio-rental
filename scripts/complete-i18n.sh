#!/bin/bash

# Multi-language implementation completion script
# Run from project root: bash scripts/complete-i18n.sh

echo "🌍 Completing i18n implementation for remaining components..."

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if component needs translation
check_component() {
    local file=$1
    if grep -q "useTranslation" "$file"; then
        echo -e "${GREEN}✓ Already translated: $file${NC}"
        return 1
    else
        echo -e "${YELLOW}⚠ Needs translation: $file${NC}"
        return 0
    fi
}

# List of components to translate
COMPONENTS=(
    "src/components/PhotoboxSection.tsx"
    "src/components/WhyChooseSection.tsx"
    "src/components/TestimonialsSection.tsx"
    "src/components/FAQSection.tsx"
    "src/components/ContactSection.tsx"
    "src/components/Footer.tsx"
    "src/components/PortfolioSection.tsx"
    "src/components/BookingModal.tsx"
    "src/components/PhotoboxBookingModal.tsx"
    "src/components/BookingStepper.tsx"
    "src/components/CalendarModal.tsx"
    "src/components/TimeSlotGrid.tsx"
    "src/components/PaymentTimer.tsx"
    "src/components/PendingBookingModal.tsx"
    "src/components/BookingHistoryModal.tsx"
    "src/components/ProfileModal.tsx"
    "src/components/TermsModal.tsx"
    "src/components/dashboard/BookingDetailModal.tsx"
    "src/components/dashboard/InvoiceTemplate.tsx"
    "src/components/admin/BookingDetailModal.tsx"
    "src/pages/Dashboard.tsx"
    "src/pages/admin/Overview.tsx"
    "src/pages/admin/Bookings.tsx"
    "src/pages/admin/Calendar.tsx"
    "src/pages/admin/Users.tsx"
    "src/pages/admin/Settings.tsx"
    "src/layouts/AdminLayout.tsx"
)

echo ""
echo "📊 Checking translation status..."
echo "=================================="

NEEDS_TRANSLATION=()
for component in "${COMPONENTS[@]}"; do
    if [ -f "$component" ]; then
        if check_component "$component"; then
            NEEDS_TRANSLATION+=("$component")
        fi
    else
        echo -e "${YELLOW}⚠ File not found: $component${NC}"
    fi
done

echo ""
echo "=================================="
echo "📈 Summary:"
echo "Total components: ${#COMPONENTS[@]}"
echo "Needs translation: ${#NEEDS_TRANSLATION[@]}"
echo "Already translated: $((${#COMPONENTS[@]} - ${#NEEDS_TRANSLATION[@]}))"
echo ""

if [ ${#NEEDS_TRANSLATION[@]} -gt 0 ]; then
    echo "⚠️  Components still need translation:"
    for comp in "${NEEDS_TRANSLATION[@]}"; do
        echo "   - $comp"
    done
    echo ""
    echo "💡 Tip: Use pattern from translated components (Header.tsx, AuthModal.tsx)"
    echo "   1. Import: import { useTranslation } from 'react-i18next';"
    echo "   2. Hook: const { t } = useTranslation(['namespace']);"
    echo "   3. Use: {t('key.subkey')}"
fi

echo ""
echo "✅ Translation files ready at:"
echo "   src/locales/id/"
echo "   src/locales/en/"
echo ""
echo "🧪 Test the app: npm run dev"
echo "   Language switcher available in header (Globe icon)"
