import { setRequestLocale } from 'next-intl/server';
import { GlassCard } from '@/components/ui/GlassCard';

type Params = { locale: string };

export default async function TermsPage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const content = {
        sc: {
            title: '使用条款',
            lastUpdated: '最后更新：2026年1月',
            sections: [
                {
                    title: '服务说明',
                    content: 'Nancy 教你学汉语 提供在线中文学习课程，包括视频、音频和文档资料。我们的服务面向全球用户，帮助学习者从 HSK 1 到 HSK 6 系统学习汉语。'
                },
                {
                    title: '账户注册',
                    content: '使用我们的付费服务需要注册账户。您需要提供有效的电子邮件地址，并确保账户信息的准确性。您有责任保护账户安全，不得与他人共享账户。'
                },
                {
                    title: '付款与退款',
                    content: '课程费用通过 PayPal 收取。购买后您将获得相应课程的永久访问权限。由于数字内容的特殊性，一般情况下不提供退款，但如遇技术问题可联系我们协商解决。'
                },
                {
                    title: '知识产权',
                    content: '本平台所有内容（包括但不限于视频、音频、文档、图片）均受版权保护。未经授权，禁止复制、下载、传播或用于商业用途。'
                },
                {
                    title: '用户行为',
                    content: '用户在使用服务时应遵守法律法规，不得发布违法、侮辱性或骚扰性内容。违反规定的账户可能被暂停或终止。'
                },
                {
                    title: '免责声明',
                    content: '我们尽力确保课程内容的准确性，但不保证完全无误。学习效果因人而异，我们不对学习成果作任何保证。'
                },
                {
                    title: '条款修改',
                    content: '我们保留随时修改本条款的权利。重大变更将通过电子邮件通知用户。继续使用服务即表示接受修改后的条款。'
                }
            ]
        },
        tc: {
            title: '使用條款',
            lastUpdated: '最後更新：2026年1月',
            sections: [
                {
                    title: '服務說明',
                    content: 'Nancy 教你學漢語 提供在線中文學習課程，包括視頻、音頻和文檔資料。我們的服務面向全球用戶，幫助學習者從 HSK 1 到 HSK 6 系統學習漢語。'
                },
                {
                    title: '賬戶註冊',
                    content: '使用我們的付費服務需要註冊賬戶。您需要提供有效的電子郵件地址，並確保賬戶信息的準確性。您有責任保護賬戶安全，不得與他人共享賬戶。'
                },
                {
                    title: '付款與退款',
                    content: '課程費用通過 PayPal 收取。購買後您將獲得相應課程的永久訪問權限。由於數字內容的特殊性，一般情況下不提供退款，但如遇技術問題可聯繫我們協商解決。'
                },
                {
                    title: '知識產權',
                    content: '本平台所有內容（包括但不限於視頻、音頻、文檔、圖片）均受版權保護。未經授權，禁止複製、下載、傳播或用於商業用途。'
                },
                {
                    title: '用戶行為',
                    content: '用戶在使用服務時應遵守法律法規，不得發布違法、侮辱性或騷擾性內容。違反規定的賬戶可能被暫停或終止。'
                },
                {
                    title: '免責聲明',
                    content: '我們盡力確保課程內容的準確性，但不保證完全無誤。學習效果因人而異，我們不對學習成果作任何保證。'
                },
                {
                    title: '條款修改',
                    content: '我們保留隨時修改本條款的權利。重大變更將通過電子郵件通知用戶。繼續使用服務即表示接受修改後的條款。'
                }
            ]
        },
        en: {
            title: 'Terms of Service',
            lastUpdated: 'Last Updated: January 2026',
            sections: [
                {
                    title: 'Service Description',
                    content: 'Nancy Teaches Mandarin provides online Chinese learning courses, including videos, audio, and documents. Our services are available to users worldwide, helping learners systematically study Chinese from HSK 1 to HSK 6.'
                },
                {
                    title: 'Account Registration',
                    content: 'Using our paid services requires account registration. You must provide a valid email address and ensure the accuracy of your account information. You are responsible for maintaining account security and must not share your account.'
                },
                {
                    title: 'Payment and Refunds',
                    content: 'Course fees are collected via PayPal. After purchase, you will receive permanent access to the corresponding courses. Due to the nature of digital content, refunds are generally not provided, but technical issues can be resolved by contacting us.'
                },
                {
                    title: 'Intellectual Property',
                    content: 'All content on this platform (including but not limited to videos, audio, documents, images) is protected by copyright. Unauthorized copying, downloading, distribution, or commercial use is prohibited.'
                },
                {
                    title: 'User Conduct',
                    content: 'Users must comply with laws and regulations when using our services and must not post illegal, insulting, or harassing content. Accounts violating these rules may be suspended or terminated.'
                },
                {
                    title: 'Disclaimer',
                    content: 'We strive to ensure the accuracy of course content but do not guarantee it is error-free. Learning outcomes vary by individual, and we make no guarantees regarding learning results.'
                },
                {
                    title: 'Terms Modification',
                    content: 'We reserve the right to modify these terms at any time. Significant changes will be notified via email. Continued use of the service indicates acceptance of the modified terms.'
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
