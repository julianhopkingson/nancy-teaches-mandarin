'use client';

import { PurchaseDropdown } from '@/components/payment/PurchaseDropdown';
import { PayPalProvider } from '@/components/providers/PayPalProvider';

export default function PaymentPage() {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 pt-24 pb-12">
            <div className="w-full max-w-md">
                <PayPalProvider>
                    <PurchaseDropdown />
                </PayPalProvider>
            </div>
        </div>
    );
}
