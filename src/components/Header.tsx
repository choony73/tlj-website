import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';
import LanguageSwitcher from './LanguageSwitcher';
import CartButton from './cart/CartButton';

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
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/95 text-white backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <img
            src="/logo.webp"
            alt="TLJ Sushi & Korean"
            className="h-10 w-10 rounded-full object-cover"
          />
          <span className="text-xl font-bold tracking-tight">
            Tous Les Jours{' '}
            <span className="font-normal text-amber-400">Sushi & Korean</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium text-neutral-300 md:flex">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <CartButton />
          <Link
            href="/commander"
            className="rounded-full bg-amber-400 px-4 py-2 text-sm font-semibold text-neutral-950 hover:bg-amber-300"
          >
            {t('order')}
          </Link>
        </div>
      </div>
    </header>
  );
}
