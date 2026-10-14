import {getTranslations, setRequestLocale} from 'next-intl/server';
import {isDbConfigured} from '@/lib/db';
import CheckoutFlow from '@/components/cart/CheckoutFlow';

function Notice({title, message}: {title: string; message: string}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-4 text-neutral-600">{message}</p>
    </div>
  );
}

export default async function CommanderPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('cart');

  if (!isDbConfigured) {
    return <Notice title={t('title')} message={t('dbRequired')} />;
  }
  const stripeReady =
    !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
    !!process.env.STRIPE_SECRET_KEY;
  if (!stripeReady) {
    return <Notice title={t('title')} message={t('stripeRequired')} />;
  }

  return <CheckoutFlow />;
}
