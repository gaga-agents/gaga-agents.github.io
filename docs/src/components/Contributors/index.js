import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import contributors from '@site/src/data/contributors';
import styles from './styles.module.css';

export default function Contributors({compact = false}) {
  const {i18n: {currentLocale}} = useDocusaurusContext();
  const isEnglish = currentLocale === 'en';

  return (
    <div className={`${styles.grid} ${compact ? styles.compact : ''}`}>
      {contributors.map((contributor) => (
        <a
          className={styles.card}
          href={contributor.profile}
          key={contributor.name}
          rel="noreferrer"
          target="_blank">
          <img
            className={styles.avatar}
            src={contributor.avatar}
            alt={isEnglish ? `${contributor.name}'s GitHub avatar` : `${contributor.name} 的 GitHub 头像`}
            loading="lazy"
          />
          <span>
            <strong>{contributor.name}</strong>
            <small>GitHub contributor ↗</small>
          </span>
        </a>
      ))}
    </div>
  );
}
