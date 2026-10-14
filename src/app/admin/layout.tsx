// 관리자 영역은 라이트 모드로 고정 (다크모드 기기에서도 글씨가 보이도록)
export default function AdminLayout({children}: {children: React.ReactNode}) {
  return (
    <div
      className="min-h-screen bg-white text-neutral-900"
      style={{colorScheme: 'light'}}
    >
      {children}
    </div>
  );
}
