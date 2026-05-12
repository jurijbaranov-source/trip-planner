import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LogoutButton from '@/components/LogoutButton'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: profile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()

  return (
    <div
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(180deg, #bae6fd 0%, #e0f2fe 25%, #f0fdf4 65%, #dcfce7 100%)' }}
    >
      <style>{`
        @keyframes cf1 {
          0%   { transform: translateX(-280px) translateY(0px); }
          20%  { transform: translateX(18vw)   translateY(-28px); }
          50%  { transform: translateX(50vw)   translateY(18px); }
          75%  { transform: translateX(78vw)   translateY(-12px); }
          100% { transform: translateX(112vw)  translateY(0px); }
        }
        @keyframes cf2 {
          0%   { transform: translateX(-280px) translateY(0px); }
          30%  { transform: translateX(25vw)   translateY(22px); }
          55%  { transform: translateX(55vw)   translateY(-18px); }
          80%  { transform: translateX(82vw)   translateY(14px); }
          100% { transform: translateX(112vw)  translateY(0px); }
        }
        @keyframes cf3 {
          0%   { transform: translateX(-280px) translateY(0px); }
          25%  { transform: translateX(22vw)   translateY(16px); }
          50%  { transform: translateX(52vw)   translateY(-24px); }
          78%  { transform: translateX(80vw)   translateY(10px); }
          100% { transform: translateX(112vw)  translateY(0px); }
        }
        @keyframes cf4 {
          0%   { transform: translateX(-280px) translateY(0px); }
          35%  { transform: translateX(30vw)   translateY(-20px); }
          60%  { transform: translateX(60vw)   translateY(25px); }
          85%  { transform: translateX(86vw)   translateY(-8px); }
          100% { transform: translateX(112vw)  translateY(0px); }
        }
        @keyframes cf5 {
          0%   { transform: translateX(-280px) translateY(0px); }
          20%  { transform: translateX(20vw)   translateY(20px); }
          45%  { transform: translateX(48vw)   translateY(-22px); }
          72%  { transform: translateX(74vw)   translateY(16px); }
          100% { transform: translateX(112vw)  translateY(0px); }
        }
      `}</style>

      {/* Mraky – rozptýlené po obloze */}
      <div style={{ position: 'fixed', top: '56px', left: 0, right: 0, bottom: '200px', pointerEvents: 'none', zIndex: 0, overflow: 'visible' }} aria-hidden="true">

        {/* Mrak 1 – nahoře vlevo */}
        <div style={{ position: 'absolute', top: '10px', left: 0, animation: 'cf1 32s linear -6s infinite' }}>
          <svg width="230" height="270" viewBox="0 0 230 270">
            <defs><clipPath id="pc1"><ellipse cx="115" cy="148" rx="88" ry="108" /></clipPath></defs>
            <ellipse cx="115" cy="218" rx="108" ry="52" fill="white" opacity="0.92" />
            <ellipse cx="62"  cy="148" rx="70"  ry="82" fill="white" opacity="0.92" />
            <ellipse cx="168" cy="143" rx="68"  ry="80" fill="white" opacity="0.92" />
            <ellipse cx="115" cy="92"  rx="62"  ry="72" fill="white" opacity="0.92" />
            <image href="/friends/f1.jpg" x="27" y="40" width="176" height="206" clipPath="url(#pc1)" preserveAspectRatio="xMidYMid meet" />
          </svg>
        </div>

        {/* Mrak 2 – nízko */}
        <div style={{ position: 'absolute', top: '160px', left: 0, animation: 'cf2 26s linear -16s infinite' }}>
          <svg width="220" height="258" viewBox="0 0 220 258">
            <defs><clipPath id="pc2"><ellipse cx="110" cy="142" rx="84" ry="104" /></clipPath></defs>
            <ellipse cx="110" cy="210" rx="103" ry="50" fill="white" opacity="0.92" />
            <ellipse cx="59"  cy="142" rx="67"  ry="78" fill="white" opacity="0.92" />
            <ellipse cx="161" cy="138" rx="65"  ry="76" fill="white" opacity="0.92" />
            <ellipse cx="110" cy="88"  rx="59"  ry="68" fill="white" opacity="0.92" />
            <image href="/friends/f2.jpg" x="26" y="38" width="168" height="198" clipPath="url(#pc2)" preserveAspectRatio="xMidYMid meet" />
          </svg>
        </div>

        {/* Mrak 3 – střed výšky */}
        <div style={{ position: 'absolute', top: '70px', left: 0, animation: 'cf3 38s linear -24s infinite' }}>
          <svg width="245" height="285" viewBox="0 0 245 285">
            <defs><clipPath id="pc3"><ellipse cx="122" cy="156" rx="93" ry="114" /></clipPath></defs>
            <ellipse cx="122" cy="230" rx="114" ry="55" fill="white" opacity="0.92" />
            <ellipse cx="66"  cy="156" rx="74"  ry="87" fill="white" opacity="0.92" />
            <ellipse cx="178" cy="151" rx="72"  ry="85" fill="white" opacity="0.92" />
            <ellipse cx="122" cy="96"  rx="66"  ry="76" fill="white" opacity="0.92" />
            <image href="/friends/f3.jpg" x="29" y="42" width="186" height="218" clipPath="url(#pc3)" preserveAspectRatio="xMidYMid meet" />
          </svg>
        </div>

        {/* Mrak 4 – hodně nízko */}
        <div style={{ position: 'absolute', top: '200px', left: 0, animation: 'cf4 29s linear -5s infinite' }}>
          <svg width="225" height="262" viewBox="0 0 225 262">
            <defs><clipPath id="pc4"><ellipse cx="112" cy="144" rx="86" ry="106" /></clipPath></defs>
            <ellipse cx="112" cy="214" rx="105" ry="50" fill="white" opacity="0.92" />
            <ellipse cx="60"  cy="144" rx="68"  ry="80" fill="white" opacity="0.92" />
            <ellipse cx="164" cy="140" rx="66"  ry="78" fill="white" opacity="0.92" />
            <ellipse cx="112" cy="88"  rx="60"  ry="70" fill="white" opacity="0.92" />
            <image href="/friends/f4.jpg" x="26" y="38" width="172" height="202" clipPath="url(#pc4)" preserveAspectRatio="xMidYMid meet" />
          </svg>
        </div>

        {/* Mrak 5 – střed-nahoře */}
        <div style={{ position: 'absolute', top: '30px', left: 0, animation: 'cf5 22s linear -11s infinite' }}>
          <svg width="235" height="272" viewBox="0 0 235 272">
            <defs><clipPath id="pc5"><ellipse cx="117" cy="150" rx="90" ry="110" /></clipPath></defs>
            <ellipse cx="117" cy="222" rx="110" ry="52" fill="white" opacity="0.92" />
            <ellipse cx="63"  cy="150" rx="72"  ry="84" fill="white" opacity="0.92" />
            <ellipse cx="171" cy="146" rx="70"  ry="82" fill="white" opacity="0.92" />
            <ellipse cx="117" cy="92"  rx="63"  ry="73" fill="white" opacity="0.92" />
            <image href="/friends/f5.jpg" x="27" y="40" width="180" height="210" clipPath="url(#pc5)" preserveAspectRatio="xMidYMid meet" />
          </svg>
        </div>

      </div>

      {/* Hory dole */}
      <div className="fixed bottom-0 left-0 right-0 pointer-events-none z-0" aria-hidden="true">
        <svg viewBox="0 0 1440 220" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMax slice">
          <path d="M0,220 L0,160 L80,110 L160,155 L260,85 L360,140 L460,75 L560,130 L660,60 L760,125 L860,55 L960,120 L1060,80 L1160,135 L1260,70 L1360,125 L1440,90 L1440,220 Z" fill="#86efac" opacity="0.45" />
          <path d="M0,220 L0,185 L100,135 L200,175 L320,110 L430,165 L540,95 L650,158 L760,88 L870,155 L980,105 L1090,168 L1200,115 L1310,172 L1440,130 L1440,220 Z" fill="#4ade80" opacity="0.4" />
          <path d="M0,220 L0,200 L120,158 L230,196 L350,148 L460,190 L580,140 L690,188 L810,145 L920,192 L1040,150 L1150,195 L1270,152 L1380,192 L1440,165 L1440,220 Z" fill="#16a34a" opacity="0.35" />
        </svg>
      </div>

      {/* Navbar */}
      <nav
        className="sticky top-0 z-20 backdrop-blur-md border-b border-white/40 shadow-sm"
        style={{ background: 'rgba(255,255,255,0.65)' }}
      >
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <span className="text-lg font-semibold text-gray-800">Dětský sen na tripu 🌈</span>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Ahoj, <span className="font-medium text-gray-800">{profile?.full_name}</span>
            </span>
            <LogoutButton />
          </div>
        </div>
      </nav>

      {/* Obsah */}
      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 pb-52">
        {children}
      </main>

    </div>
  )
}
