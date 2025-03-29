<script setup lang="ts">
import { UserOutlined } from '@ant-design/icons-vue';
import { Flex } from 'ant-design-vue';
import { Bubble, Sender, useXAgent, useXChat, type BubbleListProps } from 'ant-design-x-vue';
import { ref } from 'vue';

defineOptions({ name: 'AXUseXChatBasicSetup' });

const roles: BubbleListProps['roles'] = {
    ai: {
        placement: 'start',
        avatar: { icon: UserOutlined, style: { background: '#fde3cf' } },
        typing: { step: 5, interval: 20 },
        style: {
            maxWidth: '600px',
        },
    },
    local: {
        placement: 'end',
        avatar: { icon: UserOutlined, style: { background: '#87d068' } },
    },
};

const content = ref('');
const senderLoading = ref(false);

const setContent = (v: string) => {
    content.value = v;
}

const messageList = reactive(
    JSON.parse(localStorage.getItem('chatMessages') || '[]')
);

watch(messageList, (newVal) => {
    localStorage.setItem('chatMessages', JSON.stringify(newVal));
    // nextTick(() => {
    //     chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    // });
});

// Agent for request
const [agent] = useXAgent({
    request: async ({ message }, { onSuccess, onError }) => {
        senderLoading.value = true;
        messageList.push(message);
        try {
            const response = await fetch('http://localhost:3000/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messageList }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            onSuccess(data.reply); // 假设返回格式为 { reply: string }
        } catch (error) {
            console.error('Request failed:', error);
            onError(error instanceof Error ? error : new Error('Request failed'));
        } finally {
            senderLoading.value = false;
        }
    },
});

// Chat messages
const { onRequest, messages } = useXChat({
    agent: agent.value,
    requestPlaceholder: 'Waiting...',
    requestFallback: 'Request failed. Please try again later.',
});
</script>

<template>
    <Flex vertical gap="middle">
        <Bubble.List :roles="roles" :style="{ maxHeight: '300px' }" :items="messages.map(({ id, message, status }) => ({
            key: id,
            loading: status === 'loading',
            role: status === 'local' ? 'local' : 'ai',
            content: message,
        }))" />
        <Sender :loading="senderLoading" :value="content" :on-change="setContent" :on-submit="(nextContent) => {
            onRequest(nextContent);
            setContent('');
        }" />
    </Flex>
</template>