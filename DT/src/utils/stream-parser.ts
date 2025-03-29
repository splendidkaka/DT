// utils/stream-parser.ts
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import DOMPurify from 'dompurify';

export class StreamParser {
    private md: MarkdownIt;
    private buffer: string[] = [];
    private codeBlockState = {
        inCode: false,
        currentLang: '',
        codeBuffer: '',
    };

    constructor() {
        this.md = new MarkdownIt({
            html: false,
            highlight: (code, lang) => this.highlightCode(code, lang)
        });
    }

    // 高亮处理核心方法
    private highlightCode(code: string, lang: string): string {
        const validLang = hljs.getLanguage(lang) ? lang : 'plaintext';
        try {
            return `<pre class="hljs"><code class="language-${validLang}">${hljs.highlight(code, { language: validLang, ignoreIllegals: true }).value
                }</code></pre>`;
        } catch (e) {
            return `<pre class="hljs"><code>${this.md.utils.escapeHtml(code)}</code></pre>`;
        }
    }

    // 流式数据处理方法
    public parseChunk(chunk: string): string {
        this.buffer.push(chunk);
        const content = this.buffer.join('');

        // 代码块边界检测
        const codeBlockMatch = content.match(/```([\w-]+)?\n?([\s\S]*?)```/);
        if (codeBlockMatch) {
            this.codeBlockState = {
                inCode: false,
                currentLang: '',
                codeBuffer: ''
            };
            this.buffer = [];
            return this.md.render(content);
        }

        // 增量渲染优化
        if (content.includes('\n```')) {
            return this.handlePartialCode(content);
        }

        // 普通文本立即渲染
        return this.safeRender(content);
    }

    // 处理不完整代码块
    private handlePartialCode(content: string): string {
        const [textBefore, partialCode] = content.split('\n```');
        const tempHtml = this.md.render(textBefore);

        // 临时高亮处理
        const highlightedPartial = hljs.highlightAuto(partialCode).value;
        return `${tempHtml}<pre class="hljs"><code>${highlightedPartial}</code></pre>`;
    }

    // 安全渲染方法
    private safeRender(content: string): string {
        const rawHtml = this.md.render(content);
        return DOMPurify.sanitize(rawHtml, {
            ALLOWED_ATTR: ['class', 'data-lang'],
            FORBID_TAGS: ['style', 'script']
        });
    }
}