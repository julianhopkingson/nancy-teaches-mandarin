// 双语关键词过滤器
// Bilingual Keyword Filter for Comment Moderation

// 敏感词列表 (示例)
const sensitiveWords = {
    cn: [
        '广告', '推销', '代购', '微信', 'QQ', '联系方式',
        '骗子', '诈骗', '赌博', '色情', '暴力',
        '政治敏感词1', '政治敏感词2', // 实际使用时替换为真实词汇
    ],
    en: [
        'spam', 'advertisement', 'promotion', 'buy now', 'click here',
        'scam', 'fraud', 'gambling', 'porn', 'violence',
        'political sensitive word 1', // 实际使用时替换
    ],
};

// 正则模式用于检测变体
const patterns = [
    /\d{5,}/g,           // 5位以上数字 (可能是联系方式)
    /[\w.-]+@[\w.-]+/g,  // 邮箱地址
    /https?:\/\/\S+/g,   // URL 链接
];

export interface FilterResult {
    isClean: boolean;
    flaggedWords: string[];
    reason?: string;
}

export function filterKeywords(content: string): FilterResult {
    const lowerContent = content.toLowerCase();
    const flaggedWords: string[] = [];

    // 检查中文敏感词
    for (const word of sensitiveWords.cn) {
        if (content.includes(word)) {
            flaggedWords.push(word);
        }
    }

    // 检查英文敏感词
    for (const word of sensitiveWords.en) {
        if (lowerContent.includes(word.toLowerCase())) {
            flaggedWords.push(word);
        }
    }

    // 检查模式匹配
    let reason: string | undefined;
    for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches) {
            reason = `Contains suspicious pattern: ${matches[0]}`;
            break;
        }
    }

    return {
        isClean: flaggedWords.length === 0 && !reason,
        flaggedWords,
        reason,
    };
}

// 自动生成过滤词汇 (可由 AI 扩展)
export function generateKeywordVariants(word: string): string[] {
    const variants: string[] = [word];

    // 添加常见变体
    // 例如：数字替换字母 (a -> 4, e -> 3)
    const leetSpeak = word
        .replace(/a/gi, '4')
        .replace(/e/gi, '3')
        .replace(/i/gi, '1')
        .replace(/o/gi, '0');
    if (leetSpeak !== word) variants.push(leetSpeak);

    // 添加空格分隔
    if (word.length > 2) {
        variants.push(word.split('').join(' '));
    }

    return variants;
}
