import {defineRouting} from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['fr', 'en'],
  defaultLocale: 'fr',
  // 'as-needed': 기본 언어(불어)는 prefix 없이 /, 영어는 /en/...
  localePrefix: 'as-needed'
});
