import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';

export default async function Header() {
  const t = await getTranslations('nav');
  const links = [
    {href: '/', label: t('home')},
    {href: '/menu', label: t('menu')},
    {href: '/livraison', label: t('delivery')},
    {href: '/nous-trouver', label: t('findUs')},
    {href: '/a-propos', label: t('about')},
    {href: '/galerie', label: t('gallery')},
    {href: '/faq', label: t('faq')}
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-xl font-bold tracking-tight">
          Tous Les Jours <span className="font-normal text-neutral-500">Sushi & Korean</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-red-700">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/commander"
            className="rounded-full bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800"
          >
            {t('order')}
          </Link>
        </div>
      </div>
    </header>
  );
}
