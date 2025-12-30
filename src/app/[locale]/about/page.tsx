import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { GlassCard } from '@/components/ui/GlassCard';

type Params = { locale: string };

export default async function AboutPage({ params }: { params: Promise<Params> }) {
    const { locale } = await params;
    setRequestLocale(locale);
    const t = await getTranslations('nav');

    const content = {
        sc: {
            title: '关于 Nancy',
            subtitle: '用真正有效的方法教你学汉语',
            bio: `大家好！我是 Nancy，一位热爱教学的中文老师。

我从事中文教学已经超过 10 年，帮助了来自世界各地的学生成功掌握汉语。我相信学习语言应该是有趣且高效的，所以我创建了这个平台，将我多年的教学经验整理成系统化的课程。

我的教学特点：
• 实用优先 - 教你真正能用的中文
• 循序渐进 - 从 HSK 1 到 HSK 6 完整规划
• 文化融合 - 在学习语言的同时了解中国文化
• 个性化指导 - 根据学生水平调整教学内容

无论你是零基础的初学者，还是想要进一步提升的学习者，我都能帮助你达成目标。`,
            contact: '联系我',
            email: '邮箱',
        },
        tc: {
            title: '關於 Nancy',
            subtitle: '用真正有效的方法教你學漢語',
            bio: `大家好！我是 Nancy，一位熱愛教學的中文老師。

我從事中文教學已經超過 10 年，幫助了來自世界各地的學生成功掌握漢語。我相信學習語言應該是有趣且高效的，所以我創建了這個平台，將我多年的教學經驗整理成系統化的課程。

我的教學特點：
• 實用優先 - 教你真正能用的中文
• 循序漸進 - 從 HSK 1 到 HSK 6 完整規劃
• 文化融合 - 在學習語言的同時了解中國文化
• 個性化指導 - 根據學生水平調整教學內容

無論你是零基礎的初學者，還是想要進一步提升的學習者，我都能幫助你達成目標。`,
            contact: '聯繫我',
            email: '電郵',
        },
        en: {
            title: 'About Nancy',
            subtitle: 'Teaching Mandarin with methods that actually work',
            bio: `Hello everyone! I'm Nancy, a passionate Chinese language teacher.

I have been teaching Chinese for over 10 years, helping students from around the world successfully master Mandarin. I believe language learning should be fun and effective, which is why I created this platform to organize my years of teaching experience into systematic courses.

My teaching philosophy:
• Practical First - Teaching Chinese you can actually use
• Step by Step - Complete pathway from HSK 1 to HSK 6
• Cultural Integration - Learn about Chinese culture while studying the language
• Personalized Guidance - Adjusting content based on student level

Whether you're a complete beginner or looking to advance further, I can help you achieve your goals.`,
            contact: 'Contact Me',
            email: 'Email',
        },
    };

    const c = content[locale as keyof typeof content] || content.sc;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-3xl bg-gradient-to-br from-coral to-coral-dark text-white text-6xl font-bold shadow-2xl mb-6">
                        N
                    </div>
                    <h1 className="text-4xl font-bold mb-4">{c.title}</h1>
                    <p className="text-text-secondary text-lg">{c.subtitle}</p>
                </div>

                {/* Bio */}
                <GlassCard className="p-8 mb-8" heavy hover={false}>
                    <div className="prose prose-lg max-w-none">
                        {c.bio.split('\n\n').map((paragraph, i) => (
                            <p key={i} className="mb-4 text-text-secondary whitespace-pre-line">
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </GlassCard>

                {/* Contact */}
                <GlassCard className="p-6" hover={false}>
                    <h2 className="text-xl font-bold mb-4">{c.contact}</h2>
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">📧</span>
                        <a
                            href="mailto:nancy@example.com"
                            className="text-coral hover:underline"
                        >
                            nancy@example.com
                        </a>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}
