const {themes: prismThemes} = require('prism-react-renderer');

const githubRepository = process.env.GITHUB_REPOSITORY || '';
const [repositoryOwner = 'gagaducko', repositoryName = 'gagaduck-agents-platform'] =
  githubRepository.split('/');
const isUserOrOrganizationPage =
  repositoryName.toLowerCase() === `${repositoryOwner}.github.io`.toLowerCase();

const siteUrl =
  process.env.DOCS_URL ||
  (githubRepository
    ? `https://${repositoryOwner}.github.io`
    : 'http://localhost:3000');
const baseUrl =
  process.env.DOCS_BASE_URL ||
  (githubRepository && !isUserOrOrganizationPage ? `/${repositoryName}/` : '/');
const frontendRepositoryUrl = 'https://github.com/gagaducko/gagaduck-agents-platform-frontend';
const backendRepositoryUrl = 'https://github.com/gagaducko/gagaduck-agents-platform-backend';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '嘎嘎鸭智能体快速开发部署平台',
  tagline: 'gagaduck-agents-platform：从基础资源到智能体交付与治理',
  favicon: 'img/logo.png',

  url: siteUrl,
  baseUrl,
  organizationName: repositoryOwner,
  projectName: repositoryName,
  trailingSlash: false,
  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'zh-CN',
    locales: ['zh-CN', 'en'],
    localeConfigs: {
      'zh-CN': {label: '简体中文', htmlLang: 'zh-CN'},
      en: {label: 'English', htmlLang: 'en-US'},
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: 'versions',
          sidebarPath: require.resolve('./sidebars.js'),
          showLastUpdateAuthor: Boolean(githubRepository),
          showLastUpdateTime: Boolean(githubRepository),
          versions: {
            current: {
              label: 'V2',
              path: '2.0',
              banner: 'none',
            },
          },
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      },
    ],
  ],

  themes: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexBlog: false,
        indexPages: true,
        language: ['en', 'zh'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        docsRouteBasePath: '/versions',
      },
    ],
  ],

  themeConfig: {
    image: 'img/logo.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'gagaduck-agents-platform',
      logo: {
        alt: '嘎嘎鸭智能体快速开发部署平台',
        src: 'img/logo.png',
      },
      hideOnScroll: false,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'platformSidebar',
          position: 'left',
          label: '文档',
        },
        {
          to: '/versions/2.0/overview/architecture',
          label: '产品架构',
          position: 'left',
        },
        {
          to: '/contributors',
          label: '贡献者',
          position: 'left',
        },
        {
          type: 'docsVersionDropdown',
          position: 'right',
        },
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: frontendRepositoryUrl,
          label: '前端仓库',
          position: 'right',
        },
        {
          href: backendRepositoryUrl,
          label: '后端仓库',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '开始使用',
          items: [
            {label: '平台概览', to: '/versions/2.0/intro'},
            {label: '快速启动', to: '/versions/2.0/getting-started/first-agent'},
            {label: '部署平台', to: '/versions/2.0/getting-started/deploy-platform'},
          ],
        },
        {
          title: '核心能力',
          items: [
            {label: '配置智能体', to: '/versions/2.0/agents/configuration'},
            {label: '多智能体编排', to: '/versions/2.0/orchestration/design'},
            {label: '知识库', to: '/versions/2.0/resources/knowledge-base'},
          ],
        },
        {
          title: '项目',
          items: [
            {label: '平台架构', to: '/versions/2.0/overview/architecture'},
            {label: '贡献者', to: '/contributors'},
            {label: '前端仓库', href: frontendRepositoryUrl},
            {label: '后端仓库', href: backendRepositoryUrl},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} gagaduck-agents-platform contributors.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'docker', 'json', 'yaml'],
    },
  },
};

module.exports = config;
