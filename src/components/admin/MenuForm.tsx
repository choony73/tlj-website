'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import type {Category, MenuItem} from '@/lib/menu';

interface Props {
  categories: Category[];
  initial?: MenuItem | null;
}

export default function MenuForm({categories, initial}: Props) {
  const router = useRouter();
  const isNew = !initial;
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    slug: initial?.slug || '',
    category: initial?.category || categories[0]?.slug || '',
    name_fr: initial?.name_fr || '',
    name_en: initial?.name_en || '',
    price_cad: initial?.price_cad?.toString() || '',
    description_fr: initial?.description_fr || '',
    description_en: initial?.description_en || '',
    available: initial?.available !== false
  });

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((f) => ({...f, [key]: value}));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const payload = {
        ...form,
        price_cad: parseFloat(form.price_cad),
        slug: form.slug
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '')
      };
      const url = isNew ? '/api/admin/menu' : `/api/admin/menu/${initial!.slug}`;
      const res = await fetch(url, {
        method: isNew ? 'POST' : 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '저장에 실패했습니다.');
      router.push('/admin/menu');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  }

  const input =
    'w-full rounded-xl border px-4 py-2.5 text-sm focus:border-neutral-900 focus:outline-none';
  const label = 'mb-1 block text-sm font-medium text-neutral-700';

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-2xl space-y-5">
      {isNew && (
        <div>
          <label className={label}>슬러그 (URL용, 영문 소문자)</label>
          <input
            className={input}
            value={form.slug}
            onChange={(e) => set('slug', e.target.value)}
            placeholder="ex: roll-saumon-epice"
            required
          />
        </div>
      )}
      <div>
        <label className={label}>카테고리</label>
        <select
          className={input}
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name_fr}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={label}>이름 (불어) *</label>
          <input
            className={input}
            value={form.name_fr}
            onChange={(e) => set('name_fr', e.target.value)}
            required
          />
        </div>
        <div>
          <label className={label}>이름 (영어)</label>
          <input
            className={input}
            value={form.name_en}
            onChange={(e) => set('name_en', e.target.value)}
            placeholder="비워두면 불어가 표시됩니다"
          />
        </div>
      </div>
      <div>
        <label className={label}>가격 (CAD) *</label>
        <input
          className={input}
          type="number"
          step="0.01"
          min="0"
          value={form.price_cad}
          onChange={(e) => set('price_cad', e.target.value)}
          required
        />
      </div>
      <div>
        <label className={label}>설명 (불어)</label>
        <textarea
          className={input}
          rows={3}
          value={form.description_fr}
          onChange={(e) => set('description_fr', e.target.value)}
        />
      </div>
      <div>
        <label className={label}>설명 (영어)</label>
        <textarea
          className={input}
          rows={3}
          value={form.description_en}
          onChange={(e) => set('description_en', e.target.value)}
          placeholder="비워두면 불어가 표시됩니다"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.available}
          onChange={(e) => set('available', e.target.checked)}
          className="h-4 w-4"
        />
        판매 중 (체크 해제 시 품절 표시)
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-neutral-900 px-6 py-3 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
        >
          {saving ? '저장 중…' : '저장'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/menu')}
          className="rounded-xl border px-6 py-3 text-sm hover:bg-neutral-100"
        >
          취소
        </button>
      </div>
    </form>
  );
}
