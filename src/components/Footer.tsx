import {getTranslations} from 'next-intl/server';
import {Link} from '@/i18n/navigation';

export default async function Footer() {
  const tNav = await getTranslations('nav');
  const tCommon = await getTranslations('common');
  const tFooter = await getTranslations('footer');

  return (
    <footer className="mt-auto border-t bg-neutral-950 text-neutral-300">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold text-white">Tous Les Jours Sushi & Korean</p>
          <p className="mt-2 text-sm">{tCommon('address')}</p>
          <p className="mt-1 text-sm">
            {tCommon('phone')} · {tCommon('email')}
          </p>
        </div>
        <div>
          <p className="font-semibold text-white">{tFooter('hours')}</p>
          <p className="mt-2 text-sm">{tFooter('hoursDetail')}</p>
        </div>
        <div>
          <p className="font-semibold text-white">{tNav('menu')}</p>
          <ul className="mt-2 space-y-1 text-sm">
            <li><Link href="/menu" className="hover:text-white">{tNav('menu')}</Link></li>
            <li><Link href="/livraison" className="hover:text-white">{tNav('delivery')}</Link></li>
            <li><Link href="/faq" className="hover:text-white">{tNav('faq')}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-neutral-800 py-4 text-center text-xs text-neutral-500">
        © 2026 Tous Les Jours Sushi & Korean. {tCommon('allRights')}
      </div>
    </footer>
  );
}
