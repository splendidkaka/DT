<template>
    <div class="container">
        <!-- 自动连接控制 -->
        <div class="auto-connect">
            <el-button type="primary" @click="toggleAutoConnect" :icon="Connection" :loading="isConnecting">
                {{ isAutoConnect ? '停止监控' : '实时监控' }}
            </el-button>
            <span class="connect-status">
                状态: {{ connectStatusText }}
            </span>
        </div>

        <!-- 统计面板 -->
        <div class="statistics-panel">
            <el-card v-for="(stat, key) in statistics" :key="key" class="stat-card"
                :style="{ borderLeft: `4px solid ${getStatColor(key)}` }">
                <div class="stat-header">
                    <span class="stat-title">{{ stat.title }}</span>
                    <el-tag :type="stat.type">{{ stat.value }}</el-tag>
                </div>
                <div class="stat-trend">
                    <span>趋势:</span>
                    <el-icon :color="stat.trend > 0 ? '#f56c6c' : '#67c23a'">
                        <CaretTop v-if="stat.trend > 0" />
                        <CaretBottom v-else />
                    </el-icon>
                    <span :style="{ color: stat.trend > 0 ? '#f56c6c' : '#67c23a' }">
                        {{ Math.abs(stat.trend) }}%
                    </span>
                </div>
            </el-card>
        </div>

        <!-- 查询表单 -->
        <div class="query-form">
            <el-form :inline="true">
                <el-form-item label="时间范围">
                    <el-date-picker v-model="queryParams.timeRange" type="datetimerange" range-separator="至"
                        start-placeholder="开始时间" end-placeholder="结束时间" value-format="timestamp" />
                </el-form-item>
                <el-form-item label="关键词">
                    <el-input v-model="queryParams.keyword" placeholder="输入描述关键词" clearable />
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleQuery">查询</el-button>
                    <el-button @click="exportCSV">导出CSV</el-button>
                </el-form-item>
            </el-form>
        </div>

        <!-- 文件上传区域 -->
        <el-upload class="upload-demo" drag :auto-upload="false" :on-change="handleFileChange" :show-file-list="false">
            <template #trigger>
                <el-button type="primary">选择视频文件</el-button>
            </template>

            <div class="upload-area">
                <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                <div class="el-upload__text">
                    拖拽文件到这里 或 <em>点击选择</em>
                </div>
                <div v-if="selectedFile" class="file-info">
                    {{ selectedFile.name }} ({{ formatSize(selectedFile.size) }})
                </div>
            </div>
        </el-upload>

        <!-- 上传控制 -->
        <div class="upload-control">
            <el-button type="success" :loading="isUploading" @click="startUpload">
                {{ isUploading ? `上传中 ${uploadProgress}%` : '开始上传' }}
            </el-button>
        </div>

        <!-- 任务状态 -->
        <div class="task-status" v-if="currentTask">
            <el-alert :title="taskStatusText" :type="taskStatusType" show-icon>
                <template #default>
                    <div>任务ID: {{ currentTask.task_id }}</div>
                    <div>状态: {{ currentTask.status }}</div>
                    <div>分析结果数量: {{ currentTask.results.length }}</div>
                </template>
            </el-alert>
        </div>

        <!-- WebSocket实时数据展示 -->
        <div class="ws-monitor">
            <h3 class="monitor-title">实时分析监控</h3>
            <div class="monitor-container" ref="monitorScroll">
                <div v-for="(item, index) in wsData" :key="index" class="monitor-card"
                    :style="{ borderLeft: `4px solid ${getAlertColor(item.alert)}` }">
                    <div class="card-header">
                        <el-tag :type="item.description.alert === '无异常' ? 'success' : 'danger'" size="small">
                            {{ item.description.alert || '未知状态' }}
                        </el-tag>
                        <span class="timestamp">{{ formatTime(item.timestamp) }}</span>
                    </div>
                    <div class="card-content">
                        <p class="description">{{ item.description || '暂无详细描述' }}</p>
                        <div v-if="item.confidence" class="confidence-bar">
                            <span class="label">置信度：</span>
                            <el-progress :percentage="Math.round(item.confidence * 100)" :stroke-width="16"
                                :color="customColors" />
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 事件日志 -->
        <div class="event-log">
            <el-card>
                <template #header>
                    <div class="log-header">
                        <span>事件日志</span>
                        <el-tag type="info">总数：{{ filteredEvents.length }}</el-tag>
                    </div>
                </template>

                <el-table :data="paginatedEvents" height="500" style="width: 100%" v-loading="loading">
                    <el-table-column prop="timestamp" label="时间" width="180">
                        <template #default="{ row }">
                            {{ formatFullTime(row.timestamp) }}
                        </template>
                    </el-table-column>

                    <el-table-column prop="description" label="事件描述">
                        <template #default="{ row }">
                            <div class="description-cell">
                                {{ row.description }}
                                <el-tag v-if="row.alertType" :type="row.alertType === '无异常' ? 'success' : 'danger'"
                                    size="small" class="tag">
                                    {{ row.alertType }}
                                </el-tag>
                            </div>
                        </template>
                    </el-table-column>

                    <el-table-column label="操作" width="120">
                        <template #default="{ row }">
                            <el-button type="primary" size="small" @click="handleDetail(row)">
                                详情
                            </el-button>
                        </template>
                    </el-table-column>
                </el-table>

                <div class="pagination">
                    <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                        :total="filteredEvents.length" layout="total, prev, pager, next" />
                </div>
            </el-card>
        </div>

        <!-- 历史结果展示 -->
        <div class="results-container">
            <div class="result-chart">
                <div ref="chartContainer" style="width: 100%; height: 400px"></div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Connection, UploadFilled, CaretTop, CaretBottom } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import * as echarts from 'echarts'
import axios from 'axios'

// 自动连接相关
const isAutoConnect = ref(false)
const isConnecting = ref(false)
const connectStatusText = ref('未连接')
const autoConnectSocket = ref(null)

// 统计面板
const statistics = reactive({
    total: { title: '总事件数', value: 0, trend: 0, type: 'info' },
    normal: { title: '正常事件', value: 0, trend: 0, type: 'success' },
    fire: { title: '火灾警报', value: 0, trend: 0, type: 'danger' },
    intrusion: { title: '入侵检测', value: 0, trend: 0, type: 'warning' }
})

// 查询系统
const queryParams = reactive({ timeRange: [], keyword: '' })
const allEvents = ref([])
const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(20)

// 文件上传相关
const selectedFile = ref(null)
const isUploading = ref(false)
const uploadProgress = ref(0)
const currentTask = reactive({ task_id: null, status: 'pending', results: [] })

// 可视化相关
const chartContainer = ref(null)
const monitorScroll = ref(null)
let chartInstance = null
let socket = null
const wsData = ref([])
const MAX_WS_ITEMS = 50
const CHUNK_SIZE = 5 * 1024 * 1024
const customColors = [
    { color: '#67c23a', percentage: 20 },
    { color: '#e6a23c', percentage: 50 },
    { color: '#f56c6c', percentage: 80 }
]

/* 自动连接逻辑 */
const toggleAutoConnect = () => {
    isAutoConnect.value ? disconnectWebSocket() : connectWebSocket()
    isAutoConnect.value = !isAutoConnect.value
}

const connectWebSocket = () => {
    isConnecting.value = true
    connectStatusText.value = '连接中...'

    autoConnectSocket.value = new WebSocket('ws://localhost:16532/info')

    autoConnectSocket.value.onopen = () => {
        isConnecting.value = false
        connectStatusText.value = '已连接'
        ElMessage.success('实时监控已启动')
    }

    autoConnectSocket.value.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('Received data:', data)
        if (validateWsData(data)) {
            updateStatistics(data)
            storeEventData(data) // ✅ 使用统一的存储函数
            processWsData(data)  // ✅ 如果需要展示实时监控数据
        }
    }

    autoConnectSocket.value.onerror = (error) => {
        ElMessage.error(`连接错误: ${error}`)
        resetConnection()
    }

    autoConnectSocket.value.onclose = () => {
        if (isAutoConnect.value) {
            ElMessage.warning('连接已断开，正在重连...')
            setTimeout(connectWebSocket, 3000)
        }
    }
}

const disconnectWebSocket = () => {
    autoConnectSocket.value?.close()
    resetConnection()
    ElMessage.info('已停止实时监控')
}

const resetConnection = () => {
    isConnecting.value = false
    isAutoConnect.value = false
    connectStatusText.value = '未连接'
}

/* 数据存储逻辑 */
const validateWsData = (data) => {
    return Array.isArray(data)
        ? data.every(validateDataItem)
        : validateDataItem(data)
}

const validateDataItem = (item) => {
    return item?.timestamp && item?.description
}

const storeEventData = (data) => {
    const events = Array.isArray(data) ? data : [data]
    events.forEach(event => {
        const normalized = {
            timestamp: new Date(event.timestamp).getTime(),
            description: event.description.description,
            alertType: event.description.alert || '无异常'
        }

        if (!allEvents.value.some(e => e.timestamp === normalized.timestamp)) {
            allEvents.value.unshift(normalized)
            trimEventStore()
        }
    })
}

const trimEventStore = () => {
    if (allEvents.value.length > 1000) {
        allEvents.value = allEvents.value.slice(0, 1000)
    }
}

/* 统计逻辑 */
const updateStatistics = (data) => {
    const events = Array.isArray(data) ? data : [data]

    // 更新总数
    const prevTotal = statistics.total.value
    statistics.total.value += events.length
    statistics.total.trend = calcTrend(prevTotal, statistics.total.value)

    // 分类统计
    events.forEach(event => {
        const type = event.description.alert || '无异常'
        if (type === '无异常') statistics.normal.value++
        if (type === '火灾警报') statistics.fire.value++
        if (type === '入侵检测') statistics.intrusion.value++
    })
}

const calcTrend = (prev, current) => {
    return prev === 0 ? (current > 0 ? 100 : 0) : Math.round(((current - prev) / prev) * 100)
}

/* 查询系统 */
const filteredEvents = computed(() => {
    return allEvents.value.filter(event => {
        const [start, end] = queryParams.timeRange || []
        return (!start || (event.timestamp >= start && event.timestamp <= end)) &&
            (!queryParams.keyword || event.description.includes(queryParams.keyword))
    })
})

const paginatedEvents = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    return filteredEvents.value.slice(start, start + pageSize.value)
})

const handleQuery = () => {
    currentPage.value = 1
    loading.value = true
    setTimeout(() => loading.value = false, 300)
}

const exportCSV = () => {
    const csvContent = [
        '时间,类型,描述',
        ...filteredEvents.value.map(e =>
            `"${formatFullTime(e.timestamp)}","${e.alertType}","${e.description.replace(/"/g, '""')}"`
        )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `events_${Date.now()}.csv`
    link.click()
}

/* 文件上传逻辑 */
const handleFileChange = (file) => {
    selectedFile.value = file.raw
}

const formatSize = (bytes) => {
    const units = ['B', 'KB', 'MB', 'GB']
    let unitIndex = 0
    while (bytes >= 1024 && unitIndex < units.length - 1) {
        bytes /= 1024
        unitIndex++
    }
    return `${bytes.toFixed(1)}${units[unitIndex]}`
}

const startUpload = async () => {
    if (!selectedFile.value) {
        ElMessage.warning('请先选择文件')
        return
    }

    isUploading.value = true
    const file = selectedFile.value
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
    const taskId = crypto.randomUUID()

    try {
        for (let index = 0; index < totalChunks; index++) {
            const chunk = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
            const formData = new FormData()
            formData.append('file', chunk)
            formData.append('chunk_index', index)
            formData.append('total_chunks', totalChunks)
            formData.append('task_id', taskId)

            await axios.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            uploadProgress.value = Math.round(((index + 1) / totalChunks) * 100)
        }

        currentTask.task_id = taskId
        currentTask.status = 'processing'
        setupWebSocket(taskId)
        ElMessage.success('上传成功，开始分析')
    } catch (error) {
        ElMessage.error(`上传失败: ${error.message}`)
    } finally {
        isUploading.value = false
        uploadProgress.value = 0
    }
}

/* 任务WebSocket处理 */
const setupWebSocket = (taskId) => {
    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const wsUrl = `${protocol}//${location.host}/task_updates/${taskId}`

    socket = new WebSocket(wsUrl)

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.error) {
            currentTask.status = 'error'
            ElMessage.error(data.error)
            return
        }

        currentTask.status = data.status
        currentTask.results = data.results || []
        processWsData(data.results)
        updateChart(data.results)
    }

    socket.onclose = () => {
        if (currentTask.status !== 'completed') {
            setTimeout(() => setupWebSocket(taskId), 3000)
        }
    }
}

const processWsData = (newResults) => {
    const validData = newResults.filter(validateDataItem)
    wsData.value = [...validData, ...wsData.value]
        .slice(0, MAX_WS_ITEMS)
        .sort((a, b) => b.timestamp - a.timestamp)
}

/* 可视化逻辑 */
const initChart = () => {
    chartInstance = echarts.init(chartContainer.value)
    chartInstance.setOption({
        title: { text: '异常事件时间线' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'time' },
        yAxis: { type: 'value' },
        series: [{
            name: '异常级别',
            type: 'line',
            smooth: true,
            data: []
        }]
    })
}

const updateChart = (results) => {
    const chartData = results.map(r => ({
        name: r.alert,
        value: [new Date(r.timestamp), r.confidence || 0],
        itemStyle: { color: getAlertColor(r.alert) }
    }))

    chartInstance.setOption({
        series: [{
            data: chartData
        }]
    })
}

/* 工具函数 */
const getAlertColor = (alert) => {
    const colorMap = {
        '无异常': '#67C23A',
        '火灾警报': '#E6A23C',
        '入侵检测': '#F56C6C',
        '异常行为': '#409EFF'
    }
    return colorMap[alert] || '#909399'
}

const getStatColor = (key) => {
    const colors = {
        total: '#909399',
        normal: '#67C23A',
        fire: '#F56C6C',
        intrusion: '#E6A23C'
    }
    return colors[key] || '#409EFF'
}

const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('zh-CN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    })
}

const formatFullTime = (timestamp) => {
    const date = new Date(timestamp)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`
}

const handleDetail = (row) => {
    ElMessageBox.alert(
        `<div>
        <p><strong>时间：</strong>${formatFullTime(row.timestamp)}</p>
        <p><strong>类型：</strong>${row.alertType}</p>
        <p><strong>描述：</strong></p>
        <p>${row.description}</p>
      </div>`,
        '事件详情',
        {
            dangerouslyUseHTMLString: true,
            customClass: 'event-detail-modal'
        }
    )
}

/* 生命周期 */
onMounted(() => {
    initChart()
    autoConnectSocket.value?.addEventListener('reconnect', connectWebSocket)
})

onBeforeUnmount(() => {
    socket?.close()
    autoConnectSocket.value?.close()
})
</script>

<style scoped>
.container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 20px;
}

.auto-connect {
    margin: 20px 0;
    display: flex;
    align-items: center;
    gap: 15px;
}

.connect-status {
    color: #666;
    font-size: 0.9em;
}

.statistics-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.stat-card {
    transition: transform 0.3s;
    border-radius: 8px;
}

.stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.stat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.stat-title {
    font-weight: 500;
    color: #606266;
}

.stat-trend {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.9em;
    color: #909399;
}

.upload-area {
    padding: 20px;
    text-align: center;
}

.upload-control {
    margin: 20px 0;
    text-align: center;
}

.file-info {
    margin-top: 10px;
    color: #666;
}

.task-status {
    margin: 20px 0;
}

.ws-monitor {
    margin: 40px 0;
    border: 1px solid #ebeef5;
    border-radius: 4px;
    overflow: hidden;
}

.monitor-title {
    padding: 16px;
    margin: 0;
    background: #f5f7fa;
    font-size: 16px;
    color: #303133;
}

.monitor-container {
    max-height: 600px;
    overflow-y: auto;
    padding: 16px;
}

.monitor-card {
    background: #ffffff;
    margin-bottom: 12px;
    padding: 16px;
    border-radius: 4px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, .1);
    transition: transform 0.2s;
}

.monitor-card:hover {
    transform: translateX(5px);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
}

.timestamp {
    font-size: 0.85em;
    color: #909399;
}

.description {
    margin: 0;
    color: #606266;
    line-height: 1.6;
}

.confidence-bar {
    margin-top: 12px;
    display: flex;
    align-items: center;
}

.label {
    font-size: 0.9em;
    color: #909399;
    margin-right: 8px;
}

.results-container {
    margin-top: 40px;
    display: grid;
    gap: 20px;
}

.result-chart {
    border: 1px solid #eee;
    padding: 15px;
    border-radius: 8px;
}

:deep(.el-progress-bar) {
    flex-grow: 1;
}


.container {
    max-width: 1200px;
    margin: 2rem auto;
    padding: 20px;
}

.auto-connect {
    margin: 20px 0;
    display: flex;
    align-items: center;
    gap: 15px;
}

.statistics-panel {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin: 20px 0;
}

.query-form {
    margin: 20px 0;
    padding: 20px;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.event-log {
    margin: 30px 0;
}

.upload-area {
    padding: 20px;
    text-align: center;
}

.ws-monitor {
    margin: 40px 0;
    border: 1px solid #ebeef5;
    border-radius: 4px;
}

.monitor-container {
    max-height: 600px;
    overflow-y: auto;
    padding: 16px;
}

.results-container {
    margin-top: 40px;
}

/* 其他详细样式与之前相同 */
</style>