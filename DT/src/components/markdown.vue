<!-- components/MarkdownRenderer.vue -->
<template>
    <div class="markdown-content" v-html="renderedContent" />
  </template>
  
  <script setup lang="ts">
  import { marked } from 'marked';
  import { computed } from 'vue';
  
  const props = defineProps<{
    content: string;
  }>();
  
  const renderedContent = computed(() => marked(props.content, {
    breaks: true,
    highlight: (code) => {
      return Prism.highlight(code, Prism.languages.javascript, 'javascript');
    }
  }));
  </script>
  
  <style>
  .markdown-content {
    line-height: 1.6;
    
    h1, h2, h3 {
      margin: 1em 0 0.5em;
    }
    
    code {
      background: var(--color-gray-100);
      padding: 0.2em 0.4em;
      border-radius: 0.3em;
    }
    
    pre {
      background: var(--color-gray-50);
      padding: 1em;
      border-radius: 0.5em;
      overflow-x: auto;
      
      code {
        background: none;
        padding: 0;
      }
    }
    
    blockquote {
      border-left: 3px solid var(--color-primary-200);
      margin: 0.5em 0;
      padding-left: 1em;
      color: var(--color-gray-600);
    }
  }
  </style>