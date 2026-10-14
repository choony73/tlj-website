'use client';

import {usePathname, useRouter} from '@/i18n/navigation';
import {useLocale} from 'next-intl';

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const other = locale === 'fr' ? 'en' : 'fr';

  return (
    <button
      onClick={() => router.replace(pathname, {locale: other})}
      className="rounded-full border border-neutral-300 px-3 py-1 text-sm font-semibold tracking-wide hover:bg-neutral-100"
      aria-label={locale === 'fr' ? 'Switch to English' : 'Passer au français'}
    >
      {other.toUpperCase()}
    </button>
  );
}
