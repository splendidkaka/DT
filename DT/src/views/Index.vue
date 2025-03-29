<template>
    <div class="portal-container">
        <!-- 导航栏 -->
        <nav class="navbar">
            <div class="navbar-logo">TechMusic Portal</div>
            <ul class="navbar-links">
                <li><a href="#hero">首页</a></li>
                <li><a href="#music">陶喆音乐</a></li>
                <li><a href="#ai-chat">DeepSeek问答</a></li>
                <li><a href="#ai-video">Qwen监控</a></li>
                <!-- <li><a href="#">关于</a></li> -->

            </ul>
        </nav>

        <!-- 英雄区域 -->
        <section id="hero" class="hero-section" ref="heroSection">
            <div class="hero-content">
                <h1 class="hero-title">音乐与AI的完美融合</h1>
                <p class="hero-subtitle">陶喆经典专辑 · DeepSeek智能问答 · Qwen视频分析</p>

                <RouterLink to="/home">
                    <button class="hero-button">开始探索</button>
                </RouterLink>
            </div>
            <div class="scroll-indicator">
                <span>向下滚动</span>
                <div class="arrow-down"></div>
            </div>
        </section>

        <!-- 陶喆音乐部分 -->
        <section id="music" class="product-section" ref="musicSection">
            <div class="section-container">
                <div class="product-content" :class="{ 'in-view': musicInView }">
                    <h2 class="product-title">陶喆音乐宇宙</h2>
                    <p class="product-description">
                        探索华语R&B教父的里程碑式专辑，从蓝专到太平盛世的音乐进化历程。每张专辑都代表了华语流行音乐的一个时代。
                    </p>

                    <div class="album-highlights">
                        <div class="highlight-item">
                            <div class="highlight-icon">🎵</div>
                            <div class="highlight-text">{{ albums.length }}张经典专辑</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-icon">🏆</div>
                            <div class="highlight-text">12项金曲奖</div>
                        </div>
                        <div class="highlight-item">
                            <div class="highlight-icon">📀</div>
                            <div class="highlight-text">50+热门单曲</div>
                        </div>
                    </div>

                    <div class="album-container">
                        <div v-for="album in albums" :key="album.id" class="album-card"
                            :class="{ 'expanded': expandedAlbum === album.id }" @click="toggleAlbum(album.id)">
                            <div class="album-color" :style="{ backgroundColor: album.color }"></div>
                            <div class="album-header">
                                <h3>{{ album.title }}</h3>
                                <p class="album-year">{{ album.year }}年发行</p>
                                <div class="album-cover">
                                    <img :src="album.cover" :alt="album.title">
                                </div>
                            </div>

                            <div class="album-details">
                                <ul class="album-tracks">
                                    <li v-for="(track, index) in album.tracks" :key="index">{{ track }}</li>
                                </ul>
                                <p class="album-desc">{{ album.description }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="album-timeline">
                        <h3>音乐发展历程</h3>
                        <div class="timeline-item" v-for="(item, index) in timeline" :key="index">
                            <div class="timeline-year">{{ item.year }}</div>
                            <div class="timeline-content">
                                <h4>{{ item.title }}</h4>
                                <p>{{ item.description }}</p>
                            </div>
                        </div>
                    </div>

                    <!-- <div class="artist-quote">
                        <blockquote>
                            "音乐是我表达情感的方式，每一张专辑都是我生命中的一个章节。"
                            <footer>- 陶喆</footer>
                        </blockquote>
                    </div> -->
                    <div class="video-showcase">
                        <div class="section-header">
                            <h2>陶喆音乐纪录片</h2>
                            <p class="subtitle">通过珍贵影像资料，探索音乐教父的创作历程</p>
                        </div>

                        <div class="video-grid">
                            <!-- 视频卡片 -->
                            <div v-for="(video, index) in videos" :key="index" class="video-card" ref="cardElement"
                                @mouseenter="handleMouseEnter(video.bvid, index)" @mouseleave="handleMouseLeave(index)">
                                <!-- 封面图 -->
                                <div class="video-cover" :class="{ hidden: activePlayers[index] }">
                                    <img :src="video.poster" :alt="video.title">
                                    <!-- <div class="play-hint">
                                        <div class="play-icon">▶</div>
                                    </div> -->
                                </div>

                                <!-- 悬停播放器 -->
                                <div class="video-player" :class="{ active: activePlayers[index] }" ref="playerRefs">
                                </div>


                            </div>
                        </div>

                        <!-- 全屏播放器 -->
                        <div class="fullscreen-overlay" :class="{ active: isFullscreen }" @click.self="closeFullscreen">
                            <div class="fullscreen-player" ref="fullscreenPlayer"></div>
                            <button class="close-btn" @click="closeFullscreen">
                                <svg width="24" height="24" viewBox="0 0 24 24">
                                    <path
                                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                                </svg>
                            </button>
                        </div>
                    </div>



                    <div class="product-links">
                        <a href="#" class="product-link">查看完整专辑列表</a>
                        <a href="#" class="product-link">观看音乐纪录片 ></a>
                        <a href="#" class="product-link">收听精选歌单 ></a>
                    </div>
                </div>

                <!-- <div class="product-image">
                    <img :src="currentCover" alt="陶喆专辑" :style="{ transform: `translateY(${hoverEffect ? 80 : 0}px)` }"
                        class="content-image">
                </div> -->
            </div>
        </section>

        <!-- DeepSeek问答部分 -->
        <section id="ai-chat" class="product-section dark" ref="chatSection">
            <div class="section-container">
                <div class="product-content" :class="{ 'in-view': chatInView }">
                    <h2 class="product-title">DeepSeek智能问答系统</h2>
                    <p class="product-description">
                        基于DeepSeek最新大语言模型，提供专业、准确的问答服务，涵盖科技、生活、教育等各个领域。我们的AI系统能够理解复杂问题并提供深入解答。
                    </p>

                    <div class="feature-container">
                        <div class="feature-card" @mouseenter="hoverCard" @mouseleave="resetCard">
                            <div class="feature-icon">💡</div>
                            <h3>多轮对话</h3>
                            <p>支持上下文记忆的连续对话体验，能够理解并跟进复杂的讨论话题，保持对话连贯性。</p>
                            <div class="feature-badge">New</div>
                        </div>

                        <div class="feature-card" @mouseenter="hoverCard" @mouseleave="resetCard">
                            <div class="feature-icon">📚</div>
                            <h3>知识广博</h3>
                            <p>覆盖2024年最新知识库，包含科技、历史、文化、艺术等各领域知识，信息准确可靠。</p>
                        </div>

                        <div class="feature-card" @mouseenter="hoverCard" @mouseleave="resetCard">
                            <div class="feature-icon">🌐</div>
                            <h3>多语言支持</h3>
                            <p>中英文无缝切换，支持混合语言输入，能够准确理解并回应多语言查询。</p>
                        </div>
                    </div>

                    <div class="feature-container">
                        <div class="feature-card" @mouseenter="hoverCard" @mouseleave="resetCard">
                            <div class="feature-icon">🔍</div>
                            <h3>深度思考</h3>
                            <p>基于Transformer-XL架构的增强型推理系统，可解析复杂问题中的隐含逻辑，支持多角度对比分析和趋势预测，推理深度提升300%。</p>
                        </div>

                        <div class="feature-card" @mouseenter="hoverCard" @mouseleave="resetCard">
                            <div class="feature-icon">📡</div>
                            <h3>联网查询</h3>
                            <p>集成智能网络爬虫技术，可在用户授权下实时获取最新网络信息。自动过滤不可靠来源，信息新鲜度保证在24小时以内。</p>
                            <!-- <div class="feature-badge">Beta</div> -->
                        </div>

                        <div class="feature-card" @mouseenter="hoverCard" @mouseleave="resetCard">
                            <div class="feature-icon">🚀</div>
                            <h3>DeepSeek V3</h3>
                            <p>新一代千亿参数大模型，采用MoE架构和强化学习优化，在逻辑推理、创意生成和专业咨询等场景表现超越GPT-4级别基准。</p>
                        </div>
                    </div>

                    <div class="demo-chat">
                        <div class="chat-message user">
                            <div class="avatar">👤</div>
                            <div class="message">陶喆的蓝专有什么音乐特点？这张专辑在华语乐坛的地位如何？</div>
                        </div>
                        <div class="chat-message bot">
                            <div class="avatar">🤖</div>
                            <div class="message">
                                陶喆的首张专辑《David Tao》(俗称"蓝专")具有以下音乐特点：
                                <ul>
                                    <li><strong>R&B风格创新</strong>：将西方R&B与华语流行完美融合，开创了华语乐坛新风格</li>
                                    <li><strong>演唱技巧</strong>：大量使用转音和即兴演唱，如《飞机场的10:30》中的标志性转音</li>
                                    <li><strong>编曲特点</strong>：节奏感强烈的R&B基底，搭配简洁而富有感染力的旋律</li>
                                    <li><strong>歌词创作</strong>：既有《爱，很简单》的直白表达，也有《望春风》的传统改编</li>
                                </ul>

                                在华语乐坛的地位：
                                <ol>
                                    <li>被誉为"华语R&B教父级"专辑，影响了周杰伦、王力宏等后来歌手</li>
                                    <li>获得1998年第9届金曲奖最佳新人奖和最佳专辑制作人奖</li>
                                    <li>专辑销量超过50万张，成为当年最畅销的华语专辑之一</li>
                                    <li>被众多乐评人评为"改变华语流行音乐走向的十大专辑"之一</li>
                                </ol>
                            </div>
                        </div>
                    </div>

                    <div class="product-links">
                        <a href="#" class="product-link">立即体验</a>
                        <a href="#" class="product-link">API文档 ></a>
                    </div>
                </div>
                <div class="product-image">
                    <img :src="deepseekImg" alt="DeepSeek问答" :style="{ transform: `translateY(${chatTransform}px)` }">

                </div>

            </div>
        </section>

        <!-- Qwen视频监控部分 -->
        <section id="ai-video" class="product-section" ref="videoSection">
            <div class="section-container">
                <div class="product-content" :class="{ 'in-view': videoInView }">
                    <h2 class="product-title">Qwen智能监控系统</h2>
                    <p class="product-description">
                        基于Qwen多模态大模型的视频分析系统，实时识别危险场景，保障公共安全。我们的系统已在多个城市的安全监控中发挥重要作用。
                    </p>

                    <div class="feature-container">
                        <div class="feature-card">
                            <div class="feature-icon">👀</div>
                            <h3>实时分析</h3>
                            <p>毫秒级识别异常行为，延迟低于200ms，支持4K高清视频流实时处理。</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">⚠️</div>
                            <h3>20+危险场景</h3>
                            <p>精准识别打架斗殴、跌倒、闯入等20多种危险场景，准确率达98.7%。</p>
                        </div>
                        <div class="feature-card">
                            <div class="feature-icon">📊</div>
                            <h3>数据统计</h3>
                            <p>自动生成安全报告与热力图，支持自定义时间段分析，提供决策支持。</p>
                        </div>
                    </div>

                    <div class="scenario-container">
                        <h3>典型识别场景</h3>
                        <div class="scenario-grid">
                            <div class="scenario-item">
                                <div class="scenario-icon">👊</div>
                                <p>打架斗殴</p>
                                <p class="scenario-desc">识别肢体冲突、推搡等暴力行为，自动触发报警</p>
                            </div>
                            <div class="scenario-item">
                                <div class="scenario-icon">🏃</div>
                                <p>异常奔跑</p>
                                <p class="scenario-desc">检测公共场所突然加速奔跑等异常移动模式</p>
                            </div>
                            <div class="scenario-item">
                                <div class="scenario-icon">🤕</div>
                                <p>跌倒受伤</p>
                                <p class="scenario-desc">识别老人跌倒、突发疾病等需要救助的情况</p>
                            </div>
                            <div class="scenario-item">
                                <div class="scenario-icon">🚨</div>
                                <p>持械威胁</p>
                                <p class="scenario-desc">检测刀具、枪支等危险器械，预防恶性事件</p>
                            </div>
                            <div class="scenario-item">
                                <div class="scenario-icon">🚧</div>
                                <p>禁区闯入</p>
                                <p class="scenario-desc">监控限制区域，识别未经授权的进入行为</p>
                            </div>
                            <div class="scenario-item">
                                <div class="scenario-icon">🔥</div>
                                <p>火灾烟雾</p>
                                <p class="scenario-desc">早期检测火灾迹象，比传统烟雾报警器快30秒</p>
                            </div>
                        </div>
                    </div>

                    <div class="case-study">
                        <h3>成功案例</h3>
                        <div class="case-card">
                            <h4>xx地铁安全系统</h4>
                            <p>部署Qwen系统后，地铁站内突发事件响应时间缩短60%，2023年协助预防了12起潜在危险事件。</p>
                        </div>
                        <div class="case-card">
                            <h4>xx校园安全项目</h4>
                            <p>在全市50所中小学部署，有效识别并处理校园暴力事件35起，学生安全感提升42%。</p>
                        </div>
                    </div>

                    <div class="product-links">
                        <a href="#" class="product-link">申请演示</a>
                        <a href="#" class="product-link">行业解决方案 ></a>
                    </div>
                </div>
                <div class="product-image">
                    <img :src="qwenImg" alt="Qwen监控" :style="{ transform: `translateY(${videoTransform}px)` }">
                </div>
            </div>
        </section>

        <!-- 页脚 -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>产品</h3>
                    <ul>
                        <li><a href="#music">陶喆音乐</a></li>
                        <li><a href="#ai-chat">DeepSeek问答</a></li>
                        <li><a href="#ai-video">Qwen监控</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>技术支持</h3>
                    <ul>
                        <li><a href="#">DeepSeek文档</a></li>
                        <li><a href="#">Qwen开发指南</a></li>
                        <li><a href="#">API中心</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>联系我们</h3>
                    <ul>
                        <li><a href="#">商务合作: xxxxxxxx</a></li>
                        <li><a href="#">技术支持: xxxxxxxx</a></li>
                        <li><a href="#">电话: xxxxxxxx</a></li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>© 2025 TechMusic Portal. 保留所有权利。</p>
            </div>
        </footer>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import { RouterLink, useRouter } from 'vue-router'

// 响应式数据
const musicSection = ref(null)
const chatSection = ref(null)
const videoSection = ref(null)
const heroSection = ref(null)

const musicTransform = ref(0)
const chatTransform = ref(0)
const videoTransform = ref(0)
const heroTransform = ref(0)

const musicInView = ref(false)
const chatInView = ref(false)
const videoInView = ref(false)
const heroInView = ref(false)

const davidTaoCover = new URL('@/assets/covers/david-tao.jpg', import.meta.url).href
const imokCover = new URL('@/assets/covers/imok.jpg', import.meta.url).href
const blackTangerineCover = new URL('@/assets/covers/black.jpg', import.meta.url).href
const soulpowerCover = new URL('@/assets/covers/SP.jpg', import.meta.url).href
const taipingCover = new URL('@/assets/covers/taiping.jpg', import.meta.url).href
const deepseekImg = new URL('@/assets/index/deepseek.png', import.meta.url).href
const qwenImg = new URL('@/assets/index/qwen.png', import.meta.url).href
const songsImg = new URL('@/assets/index/songs.avif', import.meta.url).href
const soulImg = new URL('@/assets/index/soul.avif', import.meta.url).href

// 视频数据
const videos = [
    {
        bvid: 'BV15C41187cx',
        title: '《音乐创作全记录》',
        description: '揭秘陶喆经典专辑的创作过程，包含未公开demo版本',
        poster: soulImg
    },
    {
        bvid: 'BV1NQ4y1f7Bc',
        title: '《太平盛世制作特辑》',
        description: '深度记录2005年经典专辑的录制花絮与创作理念',
        poster: songsImg
    }
]

const cardElement = ref([])

// DOM引用
const playerRefs = ref([])
const fullscreenPlayer = ref(null)
const activePlayers = ref([])
const isFullscreen = ref(false)

// 初始化激活状态
activePlayers.value = new Array(videos.length).fill(false)


const timeline = ref([
    {
        year: '1997',
        title: '蓝专横空出世',
        description: '首张专辑《David Tao》发布，开创华语乐坛R&B新风格'
    },
    {
        year: '1999',
        title: '黄专突破自我',
        description: '《I\'m OK》专辑展现多元音乐风格，奠定创作歌手地位'
    },
    {
        year: '2002',
        title: '黑色柳丁实验',
        description: '最具实验性的专辑，融合摇滚、电子等多种元素'
    },
    {
        year: '2005',
        title: '太平盛世成熟',
        description: '音乐风格更加成熟，获得多项金曲奖肯定'
    }
])
// 专辑数据
const albums = ref([
    {
        id: 'davidTao',
        title: 'David Tao (蓝专)',
        year: '1997',
        color: '#1e88e5',
        cover: new URL('@/assets/covers/david-tao.jpg', import.meta.url).href,
        tracks: [
            '飞机场的10:30', '爱，很简单', '流沙',
            '望春风', '是是非非', '望春风',
            '是是非非', '望春风', '是是非非'
        ],
        description: '陶喆的处女专辑，开创了华语乐坛的R&B风潮。专辑融合了西方R&B与华语流行元素，以《飞机场的10:30》为代表，展现了陶喆独特的转音技巧和音乐才华。'
    },
    {
        id: 'imok',
        title: 'I\'m OK (黄专)',
        year: '1999',
        color: '#fdd835',
        cover: new URL('@/assets/covers/imok.jpg', import.meta.url).href,
        tracks: [
            '找自己', '小镇姑娘', '普通朋友',
            '夜来香', '夜来香', '天天',
            '夜来香', '天天', '天天'
        ],
        description: '第二张专辑展现了更加成熟的音乐风格，包含了摇滚、放克等多种元素。《找自己》的摇滚风格和《小镇姑娘》的民谣风格形成了鲜明对比，展示了陶喆音乐风格的多样性。'
    },
    {
        id: 'blackTangerine',
        title: '黑色柳丁',
        year: '2002',
        color: '#000000',
        cover: new URL('@/assets/covers/black.jpg', import.meta.url).href,
        tracks: [
            '黑色柳丁', 'Melody', '今天晚间新闻',
            'Dear God', '月亮代表谁的心'
        ],
        description: '最具实验性和社会批判性的专辑，融合了摇滚、电子、古典等多种元素。标题曲《黑色柳丁》以重金属风格表达对社会现象的批判，展现了陶喆音乐创作的深度。'
    },
    {
        id: 'soulpower',
        title: 'Soul Power',
        year: '2003',
        color: '#e53935',
        cover: new URL('@/assets/covers/SP.jpg', import.meta.url).href,
        tracks: [
            'Runaway', '爱我还是他', 'Susan说',
            '无缘', '她的歌'
        ],
        description: '这张专辑展现了陶喆音乐中的灵魂力量，融合了更多流行元素。《爱我还是他》展现了情感深度，《Susan说》则巧妙结合了京剧元素，展示了陶喆的音乐创新。'
    },
    {
        id: 'taiping',
        title: '太平盛世',
        year: '2005',
        color: '#43a047',
        cover: new URL('@/assets/covers/taiping.jpg', import.meta.url).href,
        tracks: [
            '就是爱你', '爱是个什么东西', 'Susan说',
            '无缘', '孙子兵法'
        ],
        description: '这张专辑标志着陶喆音乐风格的进一步成熟，既有《就是爱你》这样的流行情歌，也有《孙子兵法》这样的社会思考作品，展现了陶喆音乐创作的广度与深度。'
    }
])

// 当前显示的封面
const currentCover = ref(davidTaoCover)
// const musicTransform = ref(0)

// 切换封面函数
const changeCover = (cover) => {
    currentCover.value = cover
}
const expandedAlbum = ref(null)

// 切换专辑展开状态
const toggleAlbum = (albumId) => {
    expandedAlbum.value = expandedAlbum.value === albumId ? null : albumId
}

// 处理滚动事件
const handleScroll = () => {
    if (heroSection.value) {
        const heroRect = heroSection.value.getBoundingClientRect()
        heroTransform.value = Math.max(0, -heroRect.top * 0.2)
        heroInView.value = heroRect.top < window.innerHeight * 0.75
    }


    if (musicSection.value) {
        const musicRect = musicSection.value.getBoundingClientRect()
        musicTransform.value = Math.max(0, -musicRect.top * 0.2)
        musicInView.value = musicRect.top < window.innerHeight * 0.75
    }

    if (chatSection.value) {
        const chatRect = chatSection.value.getBoundingClientRect()
        chatTransform.value = Math.max(0, -chatRect.top * 0.2)
        chatInView.value = chatRect.top < window.innerHeight * 0.75
    }

    if (videoSection.value) {
        const videoRect = videoSection.value.getBoundingClientRect()
        videoTransform.value = Math.max(0, -videoRect.top * 0.2)
        videoInView.value = videoRect.top < window.innerHeight * 0.75
    }
}



// 生命周期钩子
onMounted(() => {
    window.addEventListener('scroll', handleScroll)
    handleScroll()
    loadBilibiliScript()
    window.__bili_fingerprint_report__ = () => Promise.resolve()
    document.addEventListener('keydown', handleKeyDown)
    // 页面加载完成后初始化
})
onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeyDown)
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})




// 加载B站脚本
const loadBilibiliScript = () => {
    if (!window.BilibiliPlayer) {
        const script = document.createElement('script')
        script.src = '//player.bilibili.com/player.js'
        document.body.appendChild(script)
    }
}

// 鼠标进入处理
const handleMouseEnter = (bvid, index) => {
    if (!playerRefs.value[index] || activePlayers.value[index]) return

    activePlayers.value[index] = true

    // 延迟确保DOM更新完成
    setTimeout(() => {
        const container = playerRefs.value[index]
        console.log(container)
        container.innerHTML = ''

        const iframe = document.createElement('iframe')
        iframe.src = `//player.bilibili.com/player.html?bvid=${bvid}&autoplay=1`
        iframe.setAttribute('allowfullscreen', 'true')
        iframe.setAttribute('poster', 'true')
        iframe.setAttribute('muted', 'true')
        iframe.allow = 'autoplay'
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
        container.appendChild(iframe)
    }, 50)
}

// 鼠标离开处理 
const handleMouseLeave = (index) => {
    // activePlayers.value[index] = false
}

// 打开全屏
const openFullscreen = (bvid) => {
    isFullscreen.value = true
    document.body.style.overflow = 'hidden'

    // 延迟确保DOM更新
    setTimeout(() => {
        fullscreenPlayer.value.innerHTML = ''

        const iframe = document.createElement('iframe')
        iframe.src = `//player.bilibili.com/player.html?bvid=${bvid}&autoplay=1`
        iframe.style.width = '100%'
        iframe.style.height = '100%'
        iframe.style.border = 'none'
        fullscreenPlayer.value.appendChild(iframe)
    }, 50)
}

// 关闭全屏
const closeFullscreen = () => {
    isFullscreen.value = false
    document.body.style.overflow = ''
}



// 键盘事件
const handleKeyDown = (e) => {
    if (e.key === 'Escape' && isFullscreen.value) {
        closeFullscreen()
    }
}



</script>

<style scoped>
/* 基础样式重置 */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body,
html {
    width: 100%;
    height: 100%;
    overflow-x: hidden;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.portal-container {
    width: 100%;
    min-height: 100vh;
    position: relative;
    background-color: #fff;
}

/* 导航栏样式 */
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 50px;
    background-color: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    z-index: 1000;
    transition: all 0.3s ease;
}

.navbar-logo {
    font-size: 24px;
    font-weight: 600;
    color: white;
}

.navbar-links {
    /* // 当屏幕宽度小于768px时，导航链接隐藏 */

    display: flex;
    list-style: none;
}

.navbar-links li {
    margin-left: 30px;
}

.navbar-links a {
    color: white;
    text-decoration: none;
    font-size: 16px;
    transition: opacity 0.3s;
}

.navbar-links a:hover {
    opacity: 0.7;
}

@media (max-width: 768px) {
    .navbar {
        padding: 20px;
    }

    .navbar-links {
        display: none;
    }

    .navbar-links.active {
        display: flex;
        flex-direction: column;
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        padding: 20px;
        gap: 10px;
    }

    .navbar-links.active li {
        margin-left: 0;
    }
}

/* 英雄区域样式 */
.hero-section {
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    background: linear-gradient(135deg, #1a1a2e, #16213e);
    color: white;
    position: relative;
    overflow: hidden;
}

.hero-content {
    max-width: 800px;
    margin: 0 auto;
    padding: 0 20px;
    transform: translateY(-50px);
    opacity: 1;
    animation: fadeInUp 1s forwards 0.5s;
}

.hero-title {
    font-size: 3.5rem;
    margin-bottom: 20px;
    font-weight: 600;
}

.hero-subtitle {
    font-size: 1.5rem;
    margin-bottom: 40px;
    opacity: 0.8;
}

.hero-button {
    padding: 12px 30px;
    font-size: 1.1rem;
    background: transparent;
    color: white;
    border: 2px solid white;
    border-radius: 30px;
    cursor: pointer;
    transition: all 0.3s;
}

.hero-button:hover {
    background: white;
    color: #1a1a2e;
}

.scroll-indicator {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    color: white;
    display: flex;
    flex-direction: column;
    align-items: center;
    opacity: 1;
    animation: fadeIn 1s forwards 1.5s;
}

.arrow-down {
    width: 20px;
    height: 20px;
    border-left: 2px solid white;
    border-bottom: 2px solid white;
    transform: rotate(-45deg);
    margin-top: 10px;
    animation: bounce 2s infinite;
}

/* 产品部分通用样式 */
.product-section {
    width: 100%;
    min-height: 100vh;
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;


}

.section-container {
    width: 100%;
    max-width: 1800px;

    margin: 0 auto;
    padding: 100px 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 50px;
}

.product-section.dark {
    background-color: #f5f5f7;
}

.product-content {
    flex: 1;
    opacity: 1;
    transform: translateY(50px);
    transition: all 0.8s ease;
}

.product-content.in-view {
    opacity: 1;
    transform: translateY(0);
}

.product-title {
    font-size: 2.5rem;
    margin-bottom: 20px;
    font-weight: 600;
    color: #333;
}

.product-section.dark .product-title {
    color: #333;
}

.product-description {
    font-size: 1.2rem;
    line-height: 1.6;
    margin-bottom: 30px;
    color: #666;
}

.product-section.dark .product-description {
    color: #555;
}

.product-links {
    display: flex;
    align-items: center;
    margin-top: 30px;
}

.product-link {
    margin-right: 30px;
    font-size: 1.1rem;
    color: #0066cc;
    text-decoration: none;
    position: relative;
}

.product-link:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 1px;
    bottom: -2px;
    left: 0;
    background-color: #0066cc;
    transform: scaleX(0);
    transform-origin: bottom right;
    transition: transform 0.3s ease;
}

.product-link:hover:after {
    transform: scaleX(1);
    transform-origin: bottom left;
}

.product-image {
    /* flex: 1; */
    position: relative;
    height: 30rem;
    width: 30rem;
    overflow: hidden;
    border-radius: 20px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease-out;
}

/* 专辑卡片样式 */
.album-container {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    justify-content: center;
    /* 水平居中整个grid */
    gap: 25px;
    /* max-width: 1200px; */
    /* 限制最大宽度 */
    margin: 0 auto;
    /* 水平居中 */
}

/* 响应式调整 */
@media (max-width: 1200px) {
    .album-container {
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    }
}

@media (max-width: 768px) {
    .album-container {
        grid-template-columns: 1fr;
    }
}

.album-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
    cursor: pointer;
    overflow: hidden;
    max-height: 120px;
    /* 初始高度 */
}

.album-card.expanded {
    max-height: 600px;
    /* 展开后的高度 */
}

.album-card.active {
    box-shadow: 0 0 0 2px #0066cc;
    transform: translateY(-5px);
}

.album-card:hover {
    transform: translateY(-5px);
}

.album-color {
    width: 100%;
    height: 8px;
    border-radius: 4px;
    margin-bottom: 15px;
}

.album-card h3 {
    font-size: 1.3rem;
    margin-bottom: 5px;
    color: #333;
}

.album-year {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 15px;
}

.album-tracks {
    list-style: none;
    margin: 15px 0;
    padding: 0;
}

.album-tracks li {
    padding: 5px 0;
    border-bottom: 1px solid #eee;
    font-size: 0.95rem;
    color: #444;
}

.album-desc {
    font-size: 0.9rem;
    color: #666;
    margin: 10px 0;
    line-height: 1.5;
}

.album-button {
    width: 100%;
    padding: 8px 0;
    background: #f5f5f5;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: background 0.3s;
    margin-top: 15px;
    font-weight: 500;
}

.album-button:hover {
    background: #e0e0e0;
}

/* 特性卡片样式 */
.feature-container {
    display: flex;
    gap: 20px;
    margin: 30px 0;
}

.feature-card {
    flex: 1;
    background: white;
    border-radius: 12px;
    padding: 20px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
    }
}

.feature-icon {
    font-size: 2rem;
    margin-bottom: 10px;
}

.feature-card h3 {
    font-size: 1.1rem;
    margin-bottom: 8px;
    color: #333;
}

.feature-card p {
    color: #666;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* 聊天演示样式 */
.demo-chat {
    background: white;
    border-radius: 12px;
    padding: 20px;
    margin: 30px 0;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
}

.chat-message {
    display: flex;
    margin-bottom: 15px;
}

.chat-message.user {
    justify-content: flex-end;
}

.chat-message.bot {
    justify-content: flex-start;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 10px;
    flex-shrink: 0;
}

.chat-message.user .avatar {
    background: #e3f2fd;
}

.chat-message.bot .avatar {
    background: #f5f5f5;
}

.message {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 18px;
    line-height: 1.5;
    color: #333;
}

.chat-message.user .message {
    background: #e3f2fd;
    border-top-right-radius: 4px;
}

.chat-message.bot .message {
    background: #f5f5f5;
    border-top-left-radius: 4px;
}

.message ul,
.message ol {
    padding-left: 20px;
    margin: 10px 0;
}

.message li {
    margin-bottom: 5px;
}

/* 场景识别样式 */
.scenario-container {
    margin: 30px 0;
}

.scenario-container h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #333;
}

.scenario-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-top: 15px;
}

.scenario-item {
    background: white;
    border-radius: 8px;
    padding: 15px;
    text-align: center;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
    transition: transform 0.3s;
    cursor: pointer;

    &:hover {
        transform: translateY(-5px);
    }
}

.scenario-icon {
    font-size: 1.8rem;
    margin-bottom: 8px;
}

.scenario-item p {
    font-weight: 500;
    color: #333;
}

.scenario-desc {
    font-size: 0.8rem;
    color: #666;
    margin-top: 5px;
    line-height: 1.4;
}

/* 案例研究样式 */
.case-study {
    margin: 30px 0;
}

.case-study h3 {
    font-size: 1.5rem;
    margin-bottom: 20px;
    color: #333;
}

.case-card {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
}

.case-card h4 {
    color: #1e88e5;
    margin-bottom: 10px;
    font-size: 1.1rem;
}

.case-card p {
    font-size: 0.9rem;
    line-height: 1.5;
    color: #555;
}

/* 页脚样式 */
.footer {
    width: 100%;
    background-color: #1a1a1a;
    color: white;
    padding: 60px 0 30px;
}

.footer-content {
    width: 100%;
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    padding: 0 50px;
}

.footer-section {
    flex: 1;
    margin-right: 40px;
}

.footer-section:last-child {
    margin-right: 0;
}

.footer-section h3 {
    font-size: 1.2rem;
    margin-bottom: 20px;
    font-weight: 500;
}

.footer-section ul {
    list-style: none;
}

.footer-section li {
    margin-bottom: 10px;
}

.footer-section a {
    color: #ccc;
    text-decoration: none;
    font-size: 0.9rem;
    transition: color 0.3s;
}

.footer-section a:hover {
    color: white;
}

.footer-bottom {
    margin-top: 50px;
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid #333;
    font-size: 0.8rem;
    color: #888;
}


.album-highlights {
    display: flex;
    justify-content: space-around;
    margin: 20px 0;
    padding: 15px;
    background: rgba(0, 0, 0, 0.03);
    border-radius: 10px;
}

.highlight-item {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.highlight-icon {
    font-size: 24px;
    margin-bottom: 8px;
}

.highlight-text {
    font-size: 14px;
    font-weight: 500;
}

.album-timeline {
    margin: 30px 0;
    padding: 20px;
    background: #f9f9f9;
    border-radius: 10px;
}

.album-timeline h3 {
    margin-bottom: 15px;
    color: #333;
}

.timeline-item {
    display: flex;
    margin-bottom: 15px;
}

.timeline-year {
    min-width: 60px;
    font-weight: bold;
    color: #0066cc;
}

.timeline-content {
    flex: 1;
    padding-left: 15px;
}

.timeline-content h4 {
    margin: 0 0 5px 0;
    font-size: 16px;
}

.timeline-content p {
    margin: 0;
    font-size: 14px;
    color: #666;
}

.artist-quote {
    position: relative;
    margin: 40px 0;
    padding: 40px;
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
    border-radius: 12px;
}

.quote-icon {
    position: absolute;
    top: 20px;
    left: 20px;
    font-size: 5rem;
    color: rgba(30, 136, 229, 0.1);
    font-family: serif;
    line-height: 1;
}

.artist-quote blockquote {
    font-size: 1.2rem;
    line-height: 1.8;
    color: #333;
    position: relative;
    z-index: 1;
    font-style: italic;
    margin: 0;
    padding: 0 20px;
}

.artist-quote footer {
    margin-top: 20px;
    text-align: right;
    font-style: normal;
    font-size: 0.95rem;
    color: #666;
}


.product-links {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
    flex-wrap: wrap;
}

.product-link {
    padding: 8px 15px;
    background: #0066cc;
    color: white;
    border-radius: 20px;
    text-decoration: none;
    font-size: 14px;
    transition: all 0.3s;
}

.product-link:hover {
    background: #0052a3;
    transform: translateY(-2px);
}

.album-header {
    display: flex;
    flex-direction: column;
    position: relative;

}

.album-cover {
    position: absolute;
    right: 0;
    top: 0;
    width: 80px;
    height: 80px;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.album-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.album-details {
    margin-top: 20px;
    opacity: 0;
    transform: translateY(20px);
    visibility: hidden;
    transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1);
}

.album-card.expanded .album-details {
    opacity: 1;
    transform: translateY(0);
    visibility: visible;
}

.album-tracks {
    max-height: 200px;
    overflow-y: auto;
    margin-bottom: 15px;
}

/* 动画 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(50px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes bounce {

    0%,
    20%,
    50%,
    80%,
    100% {
        transform: translateY(0) rotate(-45deg);
    }

    40% {
        transform: translateY(-10px) rotate(-45deg);
    }

    60% {
        transform: translateY(-5px) rotate(-45deg);
    }
}

/* 响应式设计 */
@media (max-width: 1024px) {
    .section-container {
        flex-direction: column;
        padding: 80px 30px;
        gap: 30px;
    }

    .product-content {
        margin-bottom: 40px;
    }

    .product-image {
        width: 100%;
    }

    .album-container,
    .feature-container {
        flex-direction: column;
    }

    .scenario-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .navbar {
        padding: 15px 20px;
    }

    .hero-title {
        font-size: 2.5rem;
    }

    .hero-subtitle {
        font-size: 1.2rem;
    }

    .product-title {
        font-size: 2rem;
    }

    .section-container {
        padding: 60px 20px;
    }

    .footer-content {
        flex-direction: column;
        padding: 0 20px;
    }

    .footer-section {
        margin-bottom: 30px;
        margin-right: 0;
    }

    .scenario-grid {
        grid-template-columns: 1fr;
    }
}

/* 基础样式 */
.video-showcase {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1rem;
    font-family: 'Helvetica Neue', Arial, sans-serif;
}

.section-header {
    text-align: center;
    margin-bottom: 3rem;
}

.section-header h2 {
    font-size: 2.2rem;
    color: #333;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.section-header .subtitle {
    color: #666;
    font-size: 1.1rem;
    max-width: 600px;
    margin: 0 auto;
}

/* 网格布局 */
.video-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
}

/* 导引卡片 */
.guide-card {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8eb 100%);
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    align-items: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.guide-content h3 {
    font-size: 1.3rem;
    margin-bottom: 1rem;
    color: #333;
}

.guide-tips {
    list-style: none;
    padding: 0;
    margin: 0;
}

.guide-tips li {
    margin-bottom: 0.8rem;
    display: flex;
    align-items: center;
    color: #555;
}

.guide-tips .icon {
    margin-right: 0.8rem;
    font-size: 1.2rem;
}

/* 视频卡片 */
.video-card {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    aspect-ratio: 16/9;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    cursor: pointer;
}

.video-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.12);
}

/* 视频封面 */
.video-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: #000;
    transition: opacity 0.3s ease;
}

.video-cover.hidden {
    opacity: 0;
    pointer-events: none;
}

.video-cover img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0.9;
}

.play-hint {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: white;
    background: rgba(0, 0, 0, 0.6);
    padding: 0.8rem 1.2rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(4px);
    transition: all 0.3s ease;
}

.play-icon {
    font-size: 1.2rem;
}

/* 视频播放器 */
.video-player {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.video-player.active {
    opacity: 1;
}

/* 视频信息 */
.video-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1.5rem;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
    color: white;
    transition: all 0.3s ease;
}

.video-info.hidden {
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
}

.video-info h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
}

.video-info p {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-bottom: 1rem;
    line-height: 1.4;
}

.fullscreen-btn {
    display: inline-flex;
    align-items: center;
    background: rgba(255, 255, 255, 0.9);
    color: #333;
    border: none;
    padding: 0.5rem 1.2rem;
    border-radius: 50px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
}

.fullscreen-btn svg {
    margin-left: 0.5rem;
    fill: currentColor;
}

.fullscreen-btn:hover {
    background: white;
    transform: translateY(-2px);
}

/* 全屏模式 */
.fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease;
}

.fullscreen-overlay.active {
    opacity: 1;
    pointer-events: all;
}

.fullscreen-player {
    width: 90%;
    max-width: 1200px;
    aspect-ratio: 16/9;
    position: relative;
}

.close-btn {
    position: absolute;
    top: 2rem;
    right: 2rem;
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.3s ease;
}

.close-btn:hover {
    opacity: 1;
}

.close-btn svg {
    display: block;
    fill: currentColor;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .video-grid {
        grid-template-columns: 1fr;
    }

    .section-header h2 {
        font-size: 1.8rem;
    }

    .guide-card {
        grid-row: 1;
    }

    .video-info {
        padding: 1rem;
    }
}
</style>