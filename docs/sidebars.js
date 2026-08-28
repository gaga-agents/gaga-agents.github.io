/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  platformSidebar: [
    {type: 'doc', id: 'intro', label: '平台简介'},
    {
      type: 'category',
      label: '教程',
      collapsed: false,
      items: ['tutorial/core-concepts', 'tutorial/message-context'],
    },
    {
      type: 'category',
      label: '认识平台',
      collapsed: false,
      items: [
        'overview/why-platform',
        'overview/lifecycle',
        'overview/architecture',
        'overview/technology-stack',
        'overview/design-principles',
      ],
    },
    {
      type: 'category',
      label: '快速启动',
      collapsed: false,
      items: [
        'getting-started/prerequisites',
        'getting-started/deploy-platform',
        'getting-started/python-local',
        'getting-started/first-project',
        'getting-started/first-agent',
      ],
    },
    {
      type: 'category',
      label: '基础资源',
      items: [
        'resources/llm-mechanism',
        'resources/skills',
        'resources/knowledge-base',
      ],
    },
    {
      type: 'category',
      label: '模型与上下文',
      items: ['tutorial/model-context-memory'],
    },
    {
      type: 'category',
      label: '工具与协议',
      items: ['tutorial/tools-mcp-skills'],
    },
    {
      type: 'category',
      label: '单智能体开发',
      items: [
        'agents/configuration',
        'agents/runtime-memory',
        'agents/debugging',
      ],
    },
    {
      type: 'category',
      label: '多智能体编排',
      items: ['orchestration/design', 'orchestration/a2a'],
    },
    {
      type: 'category',
      label: '工作流模式',
      items: ['workflows/conversation', 'workflows/routing-handoff'],
    },
    {
      type: 'category',
      label: '特性与评测',
      items: [
        'features/rag-patterns',
        'features/multimodal-knowledge',
        'features/evaluation-tracing',
      ],
    },
    {
      type: 'category',
      label: '交付与运维',
      items: ['delivery/build-deploy', 'operations/observability'],
    },
    {
      type: 'category',
      label: '最佳实践',
      items: [
        'best-practices/knowledge-agent',
        'best-practices/tool-agent',
        'best-practices/multi-agent',
      ],
    },
    {
      type: 'category',
      label: '参考',
      items: ['reference/services', 'reference/contracts', 'reference/comparisons', 'reference/version-status', 'reference/faq'],
    },
  ],
};

module.exports = sidebars;
