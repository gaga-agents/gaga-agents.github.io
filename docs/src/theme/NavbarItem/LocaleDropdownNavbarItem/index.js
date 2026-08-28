import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import {useHistorySelector} from '@docusaurus/theme-common';
import {translate} from '@docusaurus/Translate';
import {useLocation} from '@docusaurus/router';
import DropdownNavbarItem from '@theme/NavbarItem/DropdownNavbarItem';
import IconLanguage from '@theme/Icon/Language';

/**
 * Docusaurus 3.10's default locale helper treats `/` as a removable base URL.
 * With a root base URL that turns `/en/` into `/en/en/` on the next switch.
 * Build the alternate path explicitly so local preview and GitHub Pages paths
 * behave identically.
 */
function useFixedLocaleDropdownUtils() {
  const {
    siteConfig,
    i18n: {
      currentLocale,
      defaultLocale: configuredDefaultLocale = 'zh-CN',
      localeConfigs,
    },
  } = useDocusaurusContext();
  const defaultLocale = configuredDefaultLocale;
  const {pathname} = useLocation();
  const search = useHistorySelector((history) => history.location.search);
  const hash = useHistorySelector((history) => history.location.hash);

  const configuredBase = siteConfig.baseUrl === '/'
    ? ''
    : siteConfig.baseUrl.replace(/\/$/, '');
  // During a localized build Docusaurus may expose `/en/` as the current
  // site base. It is a locale prefix, not the shared GitHub Pages base path.
  const localeBaseSuffix = currentLocale === defaultLocale ? '' : `/${currentLocale}`;
  const siteBase = localeBaseSuffix && configuredBase.endsWith(localeBaseSuffix)
    ? configuredBase.slice(0, -localeBaseSuffix.length)
    : configuredBase;

  const getPathSuffix = () => {
    let suffix = pathname || '/';
    if (siteBase && (suffix === siteBase || suffix.startsWith(`${siteBase}/`))) {
      suffix = suffix.slice(siteBase.length) || '/';
    }
    const currentPrefix = `/${currentLocale}`;
    if (currentLocale !== defaultLocale && (suffix === currentPrefix || suffix.startsWith(`${currentPrefix}/`))) {
      suffix = suffix.slice(currentPrefix.length) || '/';
    }
    return suffix.startsWith('/') ? suffix : `/${suffix}`;
  };

  return {
    getURL: (locale) => {
      const suffix = getPathSuffix();
      const localePrefix = locale === defaultLocale ? '' : `/${locale}`;
      // `pathname://` marks this as a same-domain alternate route to
      // Docusaurus' link checker, while keeping the generated href absolute.
      return `pathname://${siteBase}${localePrefix}${suffix}${search}${hash}`;
    },
    getLabel: (locale) => localeConfigs[locale].label,
    getLang: (locale) => localeConfigs[locale].htmlLang,
  };
}

export default function LocaleDropdownNavbarItem({
  mobile,
  dropdownItemsBefore = [],
  dropdownItemsAfter = [],
  ...props
}) {
  const utils = useFixedLocaleDropdownUtils();
  const {
    i18n: {currentLocale, locales},
  } = useDocusaurusContext();

  const localeItems = locales.map((locale) => ({
    label: utils.getLabel(locale),
    lang: utils.getLang(locale),
    to: utils.getURL(locale),
    target: '_self',
    autoAddBaseUrl: false,
    className: locale === currentLocale
      ? mobile ? 'menu__link--active' : 'dropdown__link--active'
      : '',
  }));

  const items = [...dropdownItemsBefore, ...localeItems, ...dropdownItemsAfter];
  const dropdownLabel = mobile
    ? translate({
        message: 'Languages',
        id: 'theme.navbar.mobileLanguageDropdown.label',
        description: 'The label for the mobile language switcher dropdown',
      })
    : utils.getLabel(currentLocale);

  return (
    <DropdownNavbarItem
      {...props}
      mobile={mobile}
      label={<><IconLanguage />{dropdownLabel}</>}
      items={items}
    />
  );
}
