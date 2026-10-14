'use client';

import {useState} from 'react';

export default function SeedButton() {
  const [state, setState] = useState<'idle' | 'busy' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function run() {
    if (
      !confirm(
        'DB에 메뉴 초기 데이터를 입력합니다. 계속하시겠습니까?\n(기존 메뉴는 이름·가격·설명이 덮어써집니다)'
      )
    ) {
      return;
    }
    setState('busy');
    try {
      const res = await fetch('/api/admin/seed', {method: 'POST'});
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '실패');
      setState('done');
      setMessage(`완료: 카테고리 ${data.categories}개, 메뉴 ${data.items}개`);
    } catch (e) {
      setState('error');
      setMessage(e instanceof Error ? e.message : '실패했습니다.');
    }
  }

  return (
    <div className="mt-8 rounded-2xl border p-6">
      <p className="font-semibold">DB 초기화</p>
      <p className="mt-1 text-sm text-neutral-500">
        Neon DB를 처음 연결한 뒤 한 번 눌러주세요. 메뉴 105개가 DB에
        들어갑니다.
      </p>
      <button
        onClick={run}
        disabled={state === 'busy'}
        className="mt-3 rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700 disabled:opacity-50"
      >
        {state === 'busy' ? '입력 중…' : '메뉴 초기 데이터 입력'}
      </button>
      {message && (
        <p
          className={`mt-2 text-sm ${state === 'done' ? 'text-green-700' : 'text-red-700'}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
