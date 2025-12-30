'use client';

import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { ReactNode } from 'react';

// 占位符配置 - 需要替换为真实的 PayPal Client ID
const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

export function PayPalProvider({ children }: { children: ReactNode }) {
    return (
        <PayPalScriptProvider
            options={{
                clientId: paypalClientId,
                currency: 'USD',
            }}
        >
            {children}
        </PayPalScriptProvider>
    );
}

interface PayPalButtonProps {
    amount: string;
    description: string;
    onSuccess: (orderId: string) => void;
    onError: (error: unknown) => void;
}

export function PayPalButton({ amount, description, onSuccess, onError }: PayPalButtonProps) {
    return (
        <PayPalButtons
            style={{
                layout: 'vertical',
                color: 'gold',
                shape: 'rect',
                label: 'pay',
            }}
            createOrder={(_data, actions) => {
                return actions.order.create({
                    intent: 'CAPTURE',
                    purchase_units: [
                        {
                            amount: {
                                currency_code: 'USD',
                                value: amount,
                            },
                            description,
                        },
                    ],
                });
            }}
            onApprove={async (_data, actions) => {
                if (actions.order) {
                    const order = await actions.order.capture();
                    onSuccess(order.id || '');
                }
            }}
            onError={(err) => {
                onError(err);
            }}
        />
    );
}
