'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({password})
    });
    if (res.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || '로그인에 실패했습니다.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-50 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl border bg-white p-8 shadow-sm"
      >
        <h1 className="text-xl font-bold">관리자 로그인</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Tous Les Jours 사이트 관리 페이지입니다.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          className="mt-6 w-full rounded-xl border px-4 py-3"
          autoFocus
        />
        {error && <p className="mt-2 text-sm text-red-700">{error}</p>}
        <button
          type="submit"
          className="mt-4 w-full rounded-xl bg-neutral-900 py-3 font-semibold text-white hover:bg-neutral-700"
        >
          로그인
        </button>
      </form>
    </div>
  );
}
