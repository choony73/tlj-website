import {getTranslations, setRequestLocale} from 'next-intl/server';

interface FaqGroup {
  category: string;
  items: {q: string; a: string}[];
}

export default async function FaqPage({
  params
}: {
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  setRequestLocale(locale);
  const t = await getTranslations('faq');

  const groups = t.raw('groups') as FaqGroup[];

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="mt-2 text-neutral-600">{t('subtitle')}</p>

      {groups.map((group) => (
        <div key={group.category} className="mt-10">
          <h2 className="text-xl font-semibold">{group.category}</h2>
          <div className="mt-3 space-y-3">
            {group.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border p-5 open:shadow-sm"
              >
                <summary className="cursor-pointer font-medium">
                  {item.q}
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
