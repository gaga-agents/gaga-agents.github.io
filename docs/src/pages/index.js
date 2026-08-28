import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import Contributors from '@site/src/components/Contributors';
import styles from './index.module.css';

const copy = {
  'zh-CN': {
    pageTitle: '产品文档',
    pageDescription: '嘎嘎鸭智能体快速开发部署平台：从模型、知识和工具接入，到智能体构建、编排、部署与治理。',
    eyebrow: 'gagaduck-agents-platform',
    heading: ['嘎嘎鸭智能体', '快速开发部署平台'],
    lead: '在一个项目空间内连接模型、知识和 Skills，完成单智能体开发、多智能体编排、构建部署与运行治理。',
    primary: '开始构建首个智能体',
    secondary: '认识平台',
    diagramKicker: '平台交付主线',
    diagramTitle: '从项目治理到构建部署',
    diagramAlt: '平台四阶段生命周期',
    signals: [['4', '交付阶段'], ['5', '核心工程域'], ['1', '统一项目边界']],
    capabilityKicker: 'PLATFORM CAPABILITIES',
    capabilityTitle: '围绕智能体交付组织能力',
    capabilityLead: '平台不是孤立功能的集合。资源先被验证，智能体再被配置和调试，最后进入构建、部署与治理。',
    cardLink: '进入文档 →',
    capabilities: [
      ['01', '模型与知识资源', '统一管理 LLM、机理模型、Skills、文档、向量索引与知识图谱。', '/versions/2.0/resources/llm-mechanism'],
      ['02', '单智能体开发', '配置 Prompt、模型、工具、知识、记忆和规划策略，并查看完整调试轨迹。', '/versions/2.0/agents/configuration'],
      ['03', '多智能体编排', '用 DAG、条件、并行、循环、子流程和 A2A 组织复杂任务协作。', '/versions/2.0/orchestration/design'],
      ['04', '构建与运行治理', '把调试通过的配置构建为可追踪版本，并持续观测日志、调用链和成本。', '/versions/2.0/operations/observability'],
    ],
    learningKicker: 'LEARNING PATH',
    learningTitle: '文档沿真实工作路径展开',
    learningLead: '先建立项目和资源边界，再调试行为与依赖；复杂协作在单智能体稳定后进入编排。',
    deploy: '部署平台',
    architecture: '查看架构 →',
    lifecycle: [
      ['Govern', '登录平台，建立项目和权限边界'],
      ['Connect', '接入模型、Skills 与知识库'],
      ['Build', '配置、调试并编排智能体'],
      ['Deliver', '构建、部署、观测与持续优化'],
    ],
    contributorsKicker: 'CONTRIBUTORS',
    contributorsTitle: '由贡献者共同建设',
    contributorsLink: '查看贡献者页面 →',
  },
  en: {
    pageTitle: 'Product Documentation',
    pageDescription: 'gagaduck-agents-platform: connect models, knowledge and tools, then build, orchestrate, deploy and govern production agents.',
    eyebrow: 'gagaduck-agents-platform',
    heading: ['Build, orchestrate,', 'and deploy agents faster'],
    lead: 'Connect models, knowledge and Skills inside one project boundary, then develop single agents, orchestrate teams, release builds and govern runtime behavior.',
    primary: 'Build your first agent',
    secondary: 'Explore the platform',
    diagramKicker: 'DELIVERY LIFECYCLE',
    diagramTitle: 'From project governance to deployment',
    diagramAlt: 'Four-stage platform lifecycle',
    signals: [['4', 'delivery stages'], ['5', 'engineering domains'], ['1', 'project boundary']],
    capabilityKicker: 'PLATFORM CAPABILITIES',
    capabilityTitle: 'Capabilities organized around delivery',
    capabilityLead: 'Resources are validated first. Agents are configured and debugged next. Reproducible builds, deployment and runtime governance complete the loop.',
    cardLink: 'Read the guide →',
    capabilities: [
      ['01', 'Models and knowledge', 'Manage LLMs, mechanism models, Skills, documents, vector indexes and knowledge graphs.', '/versions/2.0/resources/llm-mechanism'],
      ['02', 'Single-agent development', 'Configure prompts, models, tools, knowledge, memory and planning with traceable debugging.', '/versions/2.0/agents/configuration'],
      ['03', 'Multi-agent orchestration', 'Compose DAGs, branches, parallel work, loops, subflows and A2A collaboration.', '/versions/2.0/orchestration/design'],
      ['04', 'Delivery and governance', 'Build versioned releases and observe logs, traces, latency, failures and cost.', '/versions/2.0/operations/observability'],
    ],
    learningKicker: 'LEARNING PATH',
    learningTitle: 'Documentation follows the real workflow',
    learningLead: 'Establish project and resource boundaries first. Stabilize single agents before introducing orchestration complexity.',
    deploy: 'Deploy the platform',
    architecture: 'View architecture →',
    lifecycle: [
      ['Govern', 'Sign in and establish project boundaries'],
      ['Connect', 'Connect models, Skills and knowledge'],
      ['Build', 'Configure, debug and orchestrate agents'],
      ['Deliver', 'Build, deploy, observe and improve'],
    ],
    contributorsKicker: 'CONTRIBUTORS',
    contributorsTitle: 'Built by contributors',
    contributorsLink: 'Meet the contributors →',
  },
};

function Hero({text}) {
  const lifecycleDiagram = useBaseUrl('/img/diagrams/platform-lifecycle.svg');

  return (
    <header className={styles.hero}>
      <div className="container">
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span>V2</span>{text.eyebrow}</div>
            <Heading as="h1">{text.heading[0]}<br />{text.heading[1]}</Heading>
            <p>{text.lead}</p>
            <div className={styles.heroActions}>
              <Link className="button button--primary button--lg" to="/versions/2.0/getting-started/first-agent">
                {text.primary}
              </Link>
              <Link className={styles.secondaryAction} to="/versions/2.0/intro">
                {text.secondary} <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className={styles.heroVisual}>
            <div className={styles.heroDiagramCard}>
              <div className={styles.platformLabel}>
                <span>{text.diagramKicker}</span>
                <strong>{text.diagramTitle}</strong>
              </div>
              <img className={styles.heroDiagram} src={lifecycleDiagram} alt={text.diagramAlt} />
            </div>
            <div className={styles.signalGrid}>
              {text.signals.map(([value, label]) => <div key={label}><b>{value}</b><span>{label}</span></div>)}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {i18n: {currentLocale}} = useDocusaurusContext();
  const text = copy[currentLocale] || copy['zh-CN'];

  return (
    <Layout title={text.pageTitle} description={text.pageDescription}>
      <Hero text={text} />
      <main>
        <section className={styles.section}>
          <div className="container">
            <div className={styles.sectionHeading}>
              <span>{text.capabilityKicker}</span>
              <Heading as="h2">{text.capabilityTitle}</Heading>
              <p>{text.capabilityLead}</p>
            </div>
            <div className={styles.capabilityGrid}>
              {text.capabilities.map(([number, title, description, link]) => (
                <Link className={styles.capabilityCard} to={link} key={title}>
                  <span className={styles.capabilityNumber}>{number}</span>
                  <Heading as="h3">{title}</Heading>
                  <p>{description}</p>
                  <span className={styles.cardLink}>{text.cardLink}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.lifecycleSection)}>
          <div className="container">
            <div className={styles.lifecycleGrid}>
              <div className={styles.sectionHeading}>
                <span>{text.learningKicker}</span>
                <Heading as="h2">{text.learningTitle}</Heading>
                <p>{text.learningLead}</p>
                <div className={styles.heroActions}>
                  <Link className="button button--primary" to="/versions/2.0/getting-started/prerequisites">{text.deploy}</Link>
                  <Link className={styles.secondaryAction} to="/versions/2.0/overview/architecture">{text.architecture}</Link>
                </div>
              </div>
              <ol className={styles.lifecycle}>
                {text.lifecycle.map(([title, description], index) => (
                  <li key={title}>
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <div><strong>{title}</strong><small>{description}</small></div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className="container">
            <div className={styles.contributorHeading}>
              <div className={styles.sectionHeading}>
                <span>{text.contributorsKicker}</span>
                <Heading as="h2">{text.contributorsTitle}</Heading>
              </div>
              <Link to="/contributors">{text.contributorsLink}</Link>
            </div>
            <Contributors compact />
          </div>
        </section>
      </main>
    </Layout>
  );
}
