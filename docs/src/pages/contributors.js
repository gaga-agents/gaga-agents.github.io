import React from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Contributors from '@site/src/components/Contributors';
import styles from './contributors.module.css';

export default function ContributorsPage() {
  const {i18n: {currentLocale}} = useDocusaurusContext();
  const isEnglish = currentLocale === 'en';

  return (
    <Layout
      title={isEnglish ? 'Contributors' : '贡献者'}
      description={isEnglish ? 'Contributors to gagaduck-agents-platform' : '嘎嘎鸭智能体快速开发部署平台贡献者'}>
      <main className={styles.page}>
        <div className="container">
          <div className={styles.heading}>
            <span>GAGADUCK COMMUNITY</span>
            <Heading as="h1">{isEnglish ? 'Contributors' : '贡献者'}</Heading>
            <p>
              {isEnglish
                ? 'The code, product and documentation of gagaduck-agents-platform are developed together by its contributors.'
                : 'gagaduck-agents-platform 的代码、产品与文档由贡献者共同推进。感谢每一位参与设计、开发、测试与维护的人。'}
            </p>
          </div>
          <Contributors />
          <section className={styles.note}>
            <Heading as="h2">{isEnglish ? 'How to contribute' : '如何加入'}</Heading>
            <p>
              {isEnglish
                ? 'Describe the purpose, validation and affected pages in your pull request. After it is merged, add your GitHub profile to this page.'
                : '提交代码或文档后，请在 Pull Request 中说明改动目的、验证方式和相关页面。合并后即可在此页补充你的 GitHub 资料。'}
            </p>
          </section>
        </div>
      </main>
    </Layout>
  );
}
