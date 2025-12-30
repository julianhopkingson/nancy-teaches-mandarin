import { setRequestLocale } from 'next-intl/server';
import { GlassCard } from '@/components/ui/GlassCard';

type Params = { locale: string };

export default async function PrivacyPage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const content = {
        sc: {
            title: '隐私政策',
            lastUpdated: '最后更新：2026年1月',
            sections: [
                {
                    title: '信息收集',
                    content: '我们收集您在注册账户时提供的信息，包括电子邮件地址。我们也会收集您使用服务时产生的数据，如学习进度和课程完成情况。'
                },
                {
                    title: '信息使用',
                    content: '我们使用收集的信息来：提供和改进我们的服务、处理您的付款、发送重要通知和更新、个性化您的学习体验。'
                },
                {
                    title: '信息保护',
                    content: '我们采取适当的安全措施保护您的个人信息免受未经授权的访问、使用或披露。您的密码经过加密存储，支付信息由第三方支付处理商安全处理。'
                },
                {
                    title: '第三方服务',
                    content: '我们使用 Supabase 进行身份验证，PayPal 处理支付。这些服务提供商有各自的隐私政策，我们建议您查阅。'
                },
                {
                    title: '您的权利',
                    content: '您有权访问、更正或删除您的个人信息。如需行使这些权利，请通过电子邮件联系我们。'
                },
                {
                    title: '联系我们',
                    content: '如果您对我们的隐私政策有任何疑问，请联系：nancy@example.com'
                }
            ]
        },
        tc: {
            title: '隱私政策',
            lastUpdated: '最後更新：2026年1月',
            sections: [
                {
                    title: '信息收集',
                    content: '我們收集您在註冊賬戶時提供的信息，包括電子郵件地址。我們也會收集您使用服務時產生的數據，如學習進度和課程完成情況。'
                },
                {
                    title: '信息使用',
                    content: '我們使用收集的信息來：提供和改進我們的服務、處理您的付款、發送重要通知和更新、個性化您的學習體驗。'
                },
                {
                    title: '信息保護',
                    content: '我們採取適當的安全措施保護您的個人信息免受未經授權的訪問、使用或披露。您的密碼經過加密存儲，支付信息由第三方支付處理商安全處理。'
                },
                {
                    title: '第三方服務',
                    content: '我們使用 Supabase 進行身份驗證，PayPal 處理支付。這些服務提供商有各自的隱私政策，我們建議您查閱。'
                },
                {
                    title: '您的權利',
                    content: '您有權訪問、更正或刪除您的個人信息。如需行使這些權利，請通過電子郵件聯繫我們。'
                },
                {
                    title: '聯繫我們',
                    content: '如果您對我們的隱私政策有任何疑問，請聯繫：nancy@example.com'
                }
            ]
        },
        en: {
            title: 'Privacy Policy',
            lastUpdated: 'Last Updated: January 2026',
            sections: [
                {
                    title: 'Information Collection',
                    content: 'We collect information you provide when registering an account, including your email address. We also collect data generated when you use our services, such as learning progress and course completion.'
                },
                {
                    title: 'Information Use',
                    content: 'We use the collected information to: provide and improve our services, process your payments, send important notices and updates, and personalize your learning experience.'
                },
                {
                    title: 'Information Protection',
                    content: 'We take appropriate security measures to protect your personal information from unauthorized access, use, or disclosure. Your password is stored encrypted, and payment information is securely processed by third-party payment processors.'
                },
                {
                    title: 'Third-Party Services',
                    content: 'We use Supabase for authentication and PayPal for payment processing. These service providers have their own privacy policies, which we recommend you review.'
                },
                {
                    title: 'Your Rights',
                    content: 'You have the right to access, correct, or delete your personal information. To exercise these rights, please contact us via email.'
                },
                {
                    title: 'Contact Us',
                    content: 'If you have any questions about our privacy policy, please contact: nancy@example.com'
                }
            ]
        }
    };

    const c = content[locale as keyof typeof content] || content.sc;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-bold mb-2">{c.title}</h1>
                <p className="text-text-muted mb-8">{c.lastUpdated}</p>

                <div className="space-y-3">
                    {c.sections.map((section, i) => (
                        <GlassCard key={i} className="p-4" hover={false}>
                            <h2 className="text-xl font-bold mb-2">{section.title}</h2>
                            <p className="text-text-secondary">{section.content}</p>
                        </GlassCard>
                    ))}
                </div>
            </div>
        </div>
    );
}
