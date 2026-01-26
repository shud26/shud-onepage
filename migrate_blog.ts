/**
 * Blog Migration Script
 * Run: npx tsx migrate_blog.ts
 *
 * Migrates Day 1-10 blog posts from shud-portfolio to Supabase blog_posts table.
 * One-time use script.
 *
 * Before running, create the table in Supabase SQL Editor:
 *
 * CREATE TABLE blog_posts (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   slug TEXT UNIQUE NOT NULL,
 *   title TEXT NOT NULL,
 *   description TEXT NOT NULL DEFAULT '',
 *   content TEXT NOT NULL DEFAULT '',
 *   tags TEXT[] DEFAULT '{}',
 *   date TEXT NOT NULL,
 *   published BOOLEAN DEFAULT true,
 *   created_at TIMESTAMPTZ DEFAULT now(),
 *   updated_at TIMESTAMPTZ DEFAULT now()
 * );
 * ALTER TABLE blog_posts DISABLE ROW LEVEL SECURITY;
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ofpbscpcryquxrtojpei.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mcGJzY3BjcnlxdXhydG9qcGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkyMTY2MTMsImV4cCI6MjA4NDc5MjYxM30.xqmqiAXsxU9rCk6j9tV_0c3UjrX-t5ee5xsLUccpmE4';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface BlogPostInsert {
  slug: string;
  title: string;
  description: string;
  content: string;
  tags: string[];
  date: string;
  published: boolean;
}

const posts: BlogPostInsert[] = [
  // ===== DAY 1 =====
  {
    slug: 'vibe-coding-day1',
    title: '바이브 코딩 시작하기 Day 1',
    description: '코딩을 전혀 모르는 상태에서 Claude Code와 함께 첫 프로그램을 만들었다.',
    tags: ['Vibe Coding', 'Day 1', '시작'],
    date: '2026-01-17',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  코딩을 전혀 모르는 상태에서 Claude Code와 함께 첫 프로그램을 만들었다.
  생각보다 훨씬 쉬웠고, 하루 만에 실제로 동작하는 툴을 만들 수 있었다.
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> Claude Code 설치</h3>
  <p>
    터미널에서 Claude와 대화하면서 코딩할 수 있는 도구를 설치했다.
    jq 설치하고, hook 스크립트 PATH 설정하고, 업적 시스템까지 세팅 완료.
  </p>
  <div><span class="tag">Claude Code</span><span class="tag">터미널</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> BTC 가격 조회</h3>
  <p>
    Hyperliquid API를 연동해서 실시간 비트코인 가격을 가져오는 스크립트를 만들었다.
    Python으로 API 호출하는 방법을 처음 배웠다.
  </p>
  <pre><code>$ python3 btc_price.py
BTC: $95,000.00</code></pre>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> 텔레그램 알림 봇</h3>
  <p>
    BTC 가격이 만 달러 단위를 돌파하면 텔레그램으로 알림을 보내주는 봇을 만들었다.
    백그라운드에서 계속 실행되면서 가격을 모니터링한다.
  </p>
  <ul>
    <li>btc_telegram.py - 가격을 텔레그램으로 전송</li>
    <li>btc_alert.py - 만 달러 돌파 시 알림</li>
  </ul>
</div>

<div class="section-card">
  <h3><span class="text-accent">4.</span> GitHub 연동</h3>
  <p>
    GitHub CLI를 설치하고 로그인해서 코드를 올릴 수 있게 됐다.
    crypto-portfolio 레포를 만들고 BTC, ETH, SOL 가격 트래커를 올렸다.
  </p>
  <ul>
    <li>gh CLI 설치 &amp; 로그인</li>
    <li>crypto-portfolio 레포 생성</li>
    <li>GitHub Actions로 매 시간 자동 업데이트</li>
  </ul>
</div>

<h2>배운 것</h2>
<ul>
  <li>Python으로 API 호출하는 방법 (requests, urllib)</li>
  <li>텔레그램 Bot API 사용법</li>
  <li>GitHub Actions로 자동화하는 방법</li>
  <li>백그라운드 프로세스 실행 (nohup)</li>
</ul>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    코딩을 전혀 몰라도 AI한테 말만 하면 진짜 프로그램이 만들어진다.
    "바이브 코딩"이라는 말이 딱 맞는 것 같다.
    내일은 더 복잡한 것도 만들어봐야지.
  </p>
</div>

<h2>내일 할 것</h2>
<ul>
  <li>펀딩비 트래커 만들기</li>
  <li>여러 거래소 비교</li>
</ul>
`
  },

  // ===== DAY 2 =====
  {
    slug: 'vibe-coding-day2',
    title: '바이브 코딩 시작하기 Day 2',
    description: '포트폴리오 사이트, 멀티 DEX 트래커, GitHub Actions까지. 바이브 코딩의 속도가 무섭다.',
    tags: ['Vibe Coding', 'Day 2', 'Vercel'],
    date: '2026-01-18',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  오늘은 진짜 많이 만들었다. 포트폴리오 사이트, 멀티 DEX 펀딩비 트래커,
  그리고 컴퓨터 꺼도 알림 오게 하는 것까지. 바이브 코딩의 속도가 무섭다.
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> 포트폴리오 웹사이트 (GitHub Pages)</h3>
  <p>
    shud26.github.io 도메인으로 간단한 포트폴리오 사이트를 만들었다.
    미니멀한 디자인으로 프로젝트들을 보여주는 페이지.
  </p>
  <div><span class="tag">HTML/CSS</span><span class="tag">GitHub Pages</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> 멀티 DEX 펀딩비 트래커</h3>
  <p>
    Hyperliquid, Pacifica, Variational 3개 거래소의 펀딩비를 동시에 모니터링하는
    트래커를 만들었다. 차익거래 기회도 감지해서 알려준다.
  </p>
  <div><span class="tag">Python</span><span class="tag">REST API</span><span class="tag">Telegram</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> GitHub Actions 자동 알림</h3>
  <p>
    컴퓨터를 꺼도 1시간마다 자동으로 펀딩비를 체크하고 텔레그램으로 알림을 보내준다.
    GitHub가 무료로 서버를 빌려주는 거라 공짜!
  </p>
</div>

<div class="section-card">
  <h3><span class="text-accent">4.</span> Next.js 포트폴리오 + Vercel 배포</h3>
  <p>
    제대로 된 포트폴리오 사이트를 Next.js로 만들었다.
    다크 테마, 실시간 대시보드, 블로그까지. Vercel로 배포해서 전 세계에서 접속 가능.
  </p>
  <ul>
    <li>메인 페이지 - 자기소개 &amp; 프로젝트 미리보기</li>
    <li>Projects - 만든 것들 목록</li>
    <li>Blog - 이 글!</li>
    <li>Dashboard - 실시간 펀딩비 데이터</li>
  </ul>
</div>

<div class="section-card">
  <h3><span class="text-accent">5.</span> DEX 정보 리서치 &amp; 백업</h3>
  <p>
    Nado, Pacifica, Extended, Variational 등 여러 퍼프 DEX를 조사했다.
    API 정보, 체인, 특징 등을 정리해서 나중에 다시 찾아보지 않아도 되게 백업.
  </p>
  <div><span class="tag">Research</span><span class="tag">Documentation</span></div>
</div>

<h2>배운 것</h2>
<ul>
  <li>여러 API를 동시에 연동하는 방법</li>
  <li>GitHub Actions로 무료 서버 돌리기</li>
  <li>Next.js + Tailwind CSS로 웹사이트 만들기</li>
  <li>Vercel 무료 배포 (GitHub 연동하면 자동 배포)</li>
  <li>펀딩비 차익거래 원리</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">3</div><div class="stat-label">DEX 연동</div></div>
  <div class="stat-card"><div class="stat-value">4</div><div class="stat-label">페이지 생성</div></div>
  <div class="stat-card"><div class="stat-value">24/7</div><div class="stat-label">자동 모니터링</div></div>
  <div class="stat-card"><div class="stat-value">$0</div><div class="stat-label">서버 비용</div></div>
</div>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    이틀 만에 이 정도를 만들 수 있다니 진짜 신기하다.
    예전 같으면 몇 달은 걸렸을 것 같은데, AI한테 말만 하면 된다.
    이제 진짜 돈 버는 툴을 만들 수 있을 것 같은 자신감이 생겼다.
    내일은 뭘 만들지?
  </p>
</div>

<h2>내일 할 것</h2>
<ul>
  <li>자동매매 봇 (페이퍼 트레이딩부터)</li>
  <li>더 많은 DEX 추가</li>
  <li>블로그 글 계속 쓰기</li>
</ul>
`
  },

  // ===== DAY 3 =====
  {
    slug: 'vibe-coding-day3',
    title: '바이브 코딩 시작하기 Day 3',
    description: '대시보드 실시간 연동, Todo List + 텔레그램 알림, 그리고 React Hooks 버그와의 싸움.',
    tags: ['Vibe Coding', 'Day 3', 'Bug Fix'],
    date: '2026-01-19',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  오늘은 대시보드에 실시간 데이터를 연동하고, Todo List를 만들었다.
  그리고 프로덕션 배포에서 버그를 만나고 해결하는 과정을 경험했다.
  실제 서비스를 운영할 때 겪는 문제를 미리 맛본 느낌!
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> 대시보드 풀 업그레이드</h3>
  <p>
    어제 만든 대시보드를 완전히 업그레이드했다. 3개 코인에서 9개 코인으로 확장하고,
    차익거래 기회를 자동으로 계산해서 보여주는 기능을 추가했다.
  </p>
  <ul>
    <li>9개 코인 지원 (BTC, ETH, SOL, DOGE, AVAX, ARB, SUI, LINK, XRP)</li>
    <li>차익거래 기회 TOP 3 카드</li>
    <li>예상 일일 수익률 계산</li>
    <li>60초 자동 새로고침 타이머</li>
    <li>코인별 롱/숏 전략 표시</li>
  </ul>
  <div><span class="tag">Next.js API Routes</span><span class="tag">Real-time Data</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> Todo List + 텔레그램 알림</h3>
  <p>
    개인 생산성 툴을 만들었다. 할 일을 추가하거나 완료하면 텔레그램으로 알림이 온다.
    PIN 잠금 기능도 넣어서 나만 사용할 수 있게 했다.
  </p>
  <ul>
    <li>할 일 추가/완료/삭제</li>
    <li>텔레그램 실시간 알림</li>
    <li>PIN 코드 잠금 (보안)</li>
    <li>일일 요약 보내기 기능</li>
  </ul>
</div>

<div class="warning-box">
  <h3><span class="text-danger">3.</span> 버그와의 싸움 (React Hooks)</h3>
  <p>
    로컬에서는 잘 되는데 Vercel 배포하니까 Todo 페이지에서 에러가 났다.
    "Application error: a client-side exception has occurred" 이런 에러...
  </p>
  <pre><code>// 문제의 코드:
if (!isAuthenticated) {
  return &lt;PinScreen /&gt;;  // 여기서 리턴
}

// useEffect가 조건부 return 아래에!
useEffect(() =&gt; {
  localStorage.setItem(...);
}, [todos]);</code></pre>
  <p>
    <strong style="color:#e5e5e5">원인:</strong> React Hooks는 항상 같은 순서로 호출되어야 하는데,
    조건부 return 아래에 useEffect를 넣어서 규칙 위반이 됐다.
  </p>
  <p>
    <strong class="text-success">해결:</strong> 모든 useEffect를 조건문 위로 이동시켰더니 해결!
  </p>
</div>

<h2>배운 것</h2>
<ul>
  <li>Next.js API Routes로 서버사이드 데이터 처리 (CORS 해결)</li>
  <li>React Hooks 규칙: 조건문 안에서 hooks 호출하면 안 됨!</li>
  <li>Hydration 에러: 서버/클라이언트 상태 불일치 해결법</li>
  <li>텔레그램 Bot API로 웹에서 알림 보내기</li>
  <li>로컬 vs 프로덕션 환경 차이 (배포하면 다른 에러 발생)</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">9</div><div class="stat-label">코인 지원</div></div>
  <div class="stat-card"><div class="stat-value">2</div><div class="stat-label">새 기능</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#ef4444">3</div><div class="stat-label">버그 수정</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#22c55e">7</div><div class="stat-label">커밋</div></div>
</div>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    오늘 버그 잡으면서 진짜 개발자가 된 기분이었다.
    로컬에서 되는데 배포하면 안 되는 거, React Hooks 규칙 위반...
    이런 게 실제 개발하면서 겪는 문제구나 싶었다.
  </p>
  <p>
    Claude한테 에러 메시지 보여주니까 바로 원인 찾아서 해결해줬다.
    혼자였으면 몇 시간은 걸렸을 것 같은데, 바이브 코딩의 힘!
  </p>
</div>

<h2>내일 할 것</h2>
<ul>
  <li>자동매매 봇 (페이퍼 트레이딩)</li>
  <li>더 많은 DEX 추가 (Nado, Extended)</li>
  <li>펀딩비 히스토리 차트</li>
</ul>
`
  },

  // ===== DAY 4 =====
  {
    slug: 'vibe-coding-day4',
    title: '바이브 코딩 시작하기 Day 4',
    description: 'Cross-DEX 펀딩비 차익거래 봇, Google Calendar 연동, Todo 풀 업그레이드까지!',
    tags: ['Vibe Coding', 'Day 4', 'Trading Bot'],
    date: '2026-01-20',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  오늘은 진짜 트레이딩 봇의 시작을 알리는 날이었다.
  펀딩비 차익거래 모니터링 봇, 그리고 Todo에 Google Calendar 연동까지!
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> Cross-DEX 펀딩비 차익거래 봇</h3>
  <p>
    Hyperliquid와 Binance의 펀딩비를 실시간 비교해서 차익거래 기회를 찾아주는 봇을 만들었다.
    델타뉴트럴 전략으로 거의 무위험 수익을 노릴 수 있다!
  </p>
  <pre><code>코인    Hyperliquid  Binance    스프레드  연수익률
APT     -0.0001%    -0.0178%   0.0177%   19.4% ⭐
SEI     -0.0022%    +0.0100%   0.0122%   13.4% ⭐
BTC     -0.0008%    +0.0094%   0.0102%   11.2% ⭐</code></pre>
  <div><span class="tag">Python</span><span class="tag">Hyperliquid API</span><span class="tag">Binance API</span><span class="tag">Telegram</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> Google Calendar 연동</h3>
  <p>
    할 일을 추가하면 자동으로 Google 캘린더에 이벤트가 생성된다!
    OAuth 인증부터 API 연동까지 처음 해봤는데 생각보다 복잡했다.
  </p>
  <pre><code class="text-success">✓ Google Cloud 프로젝트 생성
✓ Calendar API 활성화
✓ OAuth 동의 화면 설정
✓ 인증 토큰 발급
✓ API 연동 완료!</code></pre>
  <div><span class="tag">Google Calendar API</span><span class="tag">OAuth 2.0</span><span class="tag">Next.js API Routes</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> Todo 페이지 풀 업그레이드</h3>
  <p>
    기존 Todo 페이지에 날짜, 시간, 데드라인 기능을 추가했다.
    데드라인이 가까우면 노란색, 지나면 빨간색으로 표시된다!
  </p>
  <ul>
    <li>날짜/시간 선택 UI</li>
    <li>데드라인 설정</li>
    <li>Google Calendar 자동 연동</li>
    <li>캘린더 ON/OFF 토글</li>
    <li>오늘/예정 필터 추가</li>
    <li>데드라인 색상 표시</li>
  </ul>
</div>

<div class="section-card">
  <h3><span class="text-accent">4.</span> Variational DEX 리서치</h3>
  <p>
    델타뉴트럴 봇을 만들려고 Variational API를 조사했는데...
    Trading API가 아직 개발 중이라 사용할 수 없었다.
    대신 Hyperliquid + Binance 조합으로 방향 전환!
  </p>
  <p class="text-warning">⚠️ "The trading API is still in development, and is not yet available to any users."</p>
</div>

<h2>배운 것</h2>
<ul>
  <li>펀딩비 차익거래 원리와 델타뉴트럴 전략</li>
  <li>Google OAuth 2.0 인증 플로우</li>
  <li>Google Calendar API 사용법</li>
  <li>여러 거래소 API 동시 연동 (Hyperliquid + Binance)</li>
  <li>API 문서 읽고 가능/불가능 판단하기</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">2</div><div class="stat-label">거래소 연동</div></div>
  <div class="stat-card"><div class="stat-value">15</div><div class="stat-label">모니터링 코인</div></div>
  <div class="stat-card"><div class="stat-value">19.4%</div><div class="stat-label">최고 연수익률</div></div>
  <div class="stat-card"><div class="stat-value">1</div><div class="stat-label">캘린더 연동</div></div>
</div>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    오늘 드디어 "돈 버는 툴"의 첫 발을 뗐다.
    아직 자동매매는 아니지만, 차익거래 기회를 실시간으로 찾아주는 봇이 생겼다.
    APT에서 연 19%? 진짜면 대박인데... 내일 실제로 테스트해봐야겠다.
    Google Calendar 연동은 생각보다 복잡했지만, 한 번 해놓으니까
    다른 프로젝트에도 쓸 수 있을 것 같다. 점점 뭔가 쌓이는 느낌!
  </p>
</div>

<h2>내일 할 것</h2>
<ul>
  <li>펀딩비 차익거래 실제 테스트 (소액)</li>
  <li>자동 진입/청산 기능 추가</li>
  <li>Bybit 거래소 추가</li>
  <li>웹 대시보드에 차익거래 기회 표시</li>
</ul>
`
  },

  // ===== DAY 5 =====
  {
    slug: 'vibe-coding-day5',
    title: '바이브 코딩 시작하기 Day 5',
    description: 'Morning Briefing Bot으로 P성향 극복하기, 김치 프리미엄 모니터링 대시보드 추가!',
    tags: ['Vibe Coding', 'Day 5', '생산성'],
    date: '2026-01-21',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  오늘은 P성향인 나를 위한 생산성 도구를 만들었다.
  아침마다 뭐 해야 하는지 알려주는 봇, 그리고 김치 프리미엄 모니터링까지!
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> Morning Briefing Bot</h3>
  <p>
    P성향이라 계획 세우는 게 어려운데, 매일 아침 8시에 텔레그램으로
    오늘 일정과 할 일을 알려주는 봇을 만들었다!
    격려 메시지도 랜덤으로 보내준다.
  </p>
  <pre><code>☀️ Good Morning!
📅 2026년 01월 21일 (수)

📆 오늘의 일정
  📌 종일 - 펀딩비 차익거래 공부
  ⏰ 11:21 - 미팅

✅ 오늘의 할 일
  1. 펀딩비 차익거래 공부

💬 P성향이라도 괜찮아요! 하나씩 해보자 ✨</code></pre>
  <div><span class="tag">Python</span><span class="tag">Google Calendar API</span><span class="tag">Telegram</span><span class="tag">GitHub Actions</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> 김치 프리미엄 모니터링</h3>
  <p>
    업비트(한국)와 바이낸스(해외) 가격 차이를 실시간으로 보여주는 김프 모니터링!
    대시보드에 추가해서 한 눈에 확인할 수 있다.
  </p>
  <p style="color:#8B8B90;font-size:0.875rem;">
    🔴 양수 = 한국이 비쌈 (역프 기회) · 🟢 음수 = 한국이 쌈 (정프 기회)
  </p>
  <div><span class="tag">Upbit API</span><span class="tag">Binance API</span><span class="tag">Next.js</span><span class="tag">실시간 환율</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> 기회 포착 전략 브레인스토밍</h3>
  <p>
    펀딩비 차익거래 외에 다른 기회들도 정리했다.
    업비트 상장 알림, 거래량 급증 감지 등등... 다음에 만들어볼 것들!
  </p>
  <ul>
    <li>업비트 신규 상장 알림 → DEX에서 빠르게 진입</li>
    <li>거래량 급증 감지 → 상장 루머 포착</li>
    <li>DEX 신규 페어 알림 → 초기 진입 기회</li>
    <li>에어드랍 스냅샷 알림 → 스냅샷 전 매수</li>
  </ul>
  <div><span class="tag tag-accent">아이디어</span><span class="tag">리서치</span></div>
</div>

<h2>배운 것</h2>
<ul>
  <li>GitHub Actions cron으로 매일 자동 실행 설정</li>
  <li>환율 API 연동 (exchangerate-api.com)</li>
  <li>업비트 API와 바이낸스 API 동시 호출</li>
  <li>김치 프리미엄 계산법: (업비트÷환율 - 바이낸스) ÷ 바이낸스 × 100</li>
  <li>P성향한테 시스템이 중요하다는 것!</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">08:00</div><div class="stat-label">매일 알림 시간</div></div>
  <div class="stat-card"><div class="stat-value">10</div><div class="stat-label">김프 모니터링 코인</div></div>
  <div class="stat-card"><div class="stat-value">8</div><div class="stat-label">격려 메시지 종류</div></div>
  <div class="stat-card"><div class="stat-value">2</div><div class="stat-label">새 기능 추가</div></div>
</div>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    P성향이라 계획 세우는 게 진짜 어려웠는데, 시스템이 대신 챙겨주니까 훨씬 낫다.
    아침에 "오늘 이거 해야 해~" 알려주면 시작하기가 쉬워지는 느낌!
  </p>
  <p>
    김프 모니터링도 재밌다. 한국이 얼마나 비싼지 실시간으로 보이니까
    시장 분위기도 어느 정도 파악이 된다. 나중에 업비트 상장 알림까지 만들면
    진짜 기회 포착 툴이 될 것 같다.
  </p>
</div>

<h2>내일 할 것</h2>
<ul>
  <li>업비트 신규 상장 알림 만들기</li>
  <li>습관 트래커 (스트릭 기능)</li>
  <li>펀딩비 차익거래 실제 테스트</li>
  <li>DEX 신규 페어 알림</li>
</ul>
`
  },

  // ===== DAY 6 =====
  {
    slug: 'vibe-coding-day6',
    title: '바이브 코딩 시작하기 Day 6',
    description: '업비트 상장 알림 도전기. 공지 API가 없어서 실패했지만, 안 되는 이유를 알게 됐다!',
    tags: ['Vibe Coding', 'Day 6', 'API 리서치'],
    date: '2026-01-23',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  이틀 쉬고 다시 돌아왔다. 오늘은 업비트 상장 알림 봇을 만들려고 했는데...
  현실의 벽에 부딪혔다. 하지만 배운 게 있다!
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> 업비트 상장 알림 리서치</h3>
  <p>
    원래 목표는 업비트 공지가 올라오자마자 알림을 받고, 퍼프덱에서 바로 긁는 것이었다.
    그래서 여러 가지 방법을 시도해봤다.
  </p>
  <ul>
    <li>업비트 공지 API 검색 → 공식 API 없음</li>
    <li>api-manager.upbit.com → 막혀있음</li>
    <li>코인니스 RSS → SPA라서 RSS 없음</li>
    <li>크립토패닉 API → IP 차단됨</li>
    <li>구글 뉴스 RSS → 작동 안 함</li>
    <li>Nitter (트위터 RSS) → Captcha 차단</li>
  </ul>
  <div class="warning-box">
    <p><strong class="text-danger">결론: 업비트 공지 API는 공식적으로 제공 안 함</strong></p>
    <p style="font-size:0.875rem;">
      기존 텔레그램 봇들은 Selenium 스크래핑 또는 예전 API가 열려있을 때 만들어진 것으로 추정
    </p>
  </div>
  <div><span class="tag">API 리서치</span><span class="tag">웹 스크래핑</span><span class="tag">RSS</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> 마켓 리스트 방식 봇 (대안)</h3>
  <p>
    공지 API가 없어서 차선책으로 마켓 리스트 방식의 봇을 만들었다.
    10분마다 업비트 마켓 리스트를 체크해서 새 코인이 추가되면 알림을 보낸다.
  </p>
  <pre><code># 작동 원리
1. api.upbit.com/v1/market/all API 호출
2. 이전에 저장한 리스트와 비교
3. 새 마켓 발견 시 텔레그램 알림

# 문제점
공지 → 마켓 오픈까지 시간차 있음
스나이핑 목적으로는 부적합</code></pre>
  <div><span class="tag">Python</span><span class="tag">Upbit API</span><span class="tag">Telegram</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> 시도해본 API들</h3>
  <table>
    <thead><tr><th>서비스</th><th>결과</th></tr></thead>
    <tbody>
      <tr><td>업비트 공지 API</td><td class="text-danger">❌ 없음</td></tr>
      <tr><td>api-manager.upbit.com</td><td class="text-danger">❌ 차단됨</td></tr>
      <tr><td>코인니스</td><td class="text-danger">❌ SPA (API 없음)</td></tr>
      <tr><td>크립토패닉</td><td class="text-danger">❌ IP 차단</td></tr>
      <tr><td>Nitter (트위터)</td><td class="text-danger">❌ Captcha</td></tr>
      <tr><td>업비트 마켓 리스트</td><td class="text-success">✅ 작동</td></tr>
    </tbody>
  </table>
</div>

<h2>배운 것</h2>
<ul>
  <li>대부분의 거래소는 공지 API를 공개하지 않음</li>
  <li>빠른 알림을 위해서는 Selenium 스크래핑 필요</li>
  <li>뉴스 RSS도 대부분 막혀있거나 유료임</li>
  <li>예전에 작동했던 API도 시간이 지나면 막힐 수 있음</li>
  <li>안 되는 이유를 아는 것도 중요한 배움!</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value" style="color:#ef4444">6</div><div class="stat-label">시도한 API</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#ef4444">5</div><div class="stat-label">실패한 방법</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#22c55e">1</div><div class="stat-label">작동하는 API</div></div>
  <div class="stat-card"><div class="stat-value">683</div><div class="stat-label">업비트 마켓 수</div></div>
</div>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    오늘은 좀 아쉬웠다. 업비트 상장 공지 알림을 만들어서 퍼프덱 스나이핑 하고 싶었는데,
    공지 API가 없어서 원래 목표는 달성 못 했다.
  </p>
  <p>
    하지만 "왜 안 되는지"를 알게 된 것도 의미가 있다고 생각한다.
    다른 방법을 찾아보거나, 아니면 다른 기회를 찾아야겠다.
    마켓 리스트 방식 봇은 만들어놨으니까, 나중에 필요하면 쓸 수 있을 것 같다.
  </p>
</div>

<h2>다음에 할 것</h2>
<ul>
  <li>펀딩비 차익거래 실제 테스트 (소액)</li>
  <li>DEX 신규 페어 알림 방법 리서치</li>
  <li>Selenium 스크래핑 공부 (필요할 때)</li>
  <li>다른 기회 포착 방법 찾아보기</li>
</ul>
`
  },

  // ===== DAY 7 =====
  {
    slug: 'vibe-coding-day7',
    title: '바이브 코딩 시작하기 Day 7',
    description: 'CEX/DEX 가격 갭 모니터링 완성! 5개 거래소, 500개 코인 실시간 추적.',
    tags: ['Vibe Coding', 'Day 7', '갭 매매'],
    date: '2026-01-23',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  드디어 갭 매매 모니터링 도구를 만들었다! CEX와 DEX 간 가격 차이를 실시간으로 추적하고,
  1% 이상 갭이 발생하면 알림을 받는다.
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> CEX/DEX 가격 갭 모니터링</h3>
  <p>
    같은 코인이라도 거래소마다 가격이 다르다. 이 차이를 이용하면 차익거래가 가능!
    5개 거래소의 가격을 실시간으로 비교하는 도구를 만들었다.
  </p>
  <pre><code>🚨 가격 갭 발견!
BNT: 4.5%
  📈 Bitget: $0.4005
  📉 Hyperliquid: $0.3828
  💡 HL에서 사서 Bitget에서 팔기</code></pre>
  <div><span class="tag">Binance</span><span class="tag">Bybit</span><span class="tag">OKX</span><span class="tag">Bitget</span><span class="tag">Hyperliquid</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> 대시보드 업그레이드</h3>
  <p>
    대시보드에 가격 갭 알림 섹션을 추가했다. 1% 이상 갭이 발생하면
    자동으로 표시되고, 없으면 섹션 자체가 숨겨진다.
  </p>
  <ul>
    <li>Hyperliquid 전체 코인 모니터링 (500개+)</li>
    <li>1% 이상 갭만 표시 (노이즈 필터링)</li>
    <li>15% 이상은 제외 (다른 토큰일 가능성)</li>
    <li>최소 3개 거래소에서 가격 있어야 표시</li>
  </ul>
  <div><span class="tag">Next.js API</span><span class="tag">React</span><span class="tag">Vercel</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> 텔레그램 알림 연동</h3>
  <p>
    대시보드를 열 때마다 자동으로 갭을 체크하고, 1% 이상 갭이 발견되면
    텔레그램으로 알림을 보낸다.
  </p>
  <div class="success-box">
    <p><strong class="text-success">실시간 알림 작동!</strong></p>
    <p style="font-size:0.875rem;">대시보드 새로고침할 때마다 갭 체크 → 발견 시 텔레그램 알림</p>
  </div>
  <div><span class="tag">Telegram Bot</span><span class="tag">Webhook</span></div>
</div>

<h2>배운 것</h2>
<ul>
  <li>거래소마다 API 응답 형식이 다 다름 (파싱 노가다)</li>
  <li>같은 심볼이라도 다른 토큰일 수 있음 (NTRN 등)</li>
  <li>False positive 필터링이 중요함 (15% 이상 제외)</li>
  <li>Promise.all로 여러 API 동시 호출하면 빠름</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">5</div><div class="stat-label">연동 거래소</div></div>
  <div class="stat-card"><div class="stat-value">500+</div><div class="stat-label">모니터링 코인</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#22c55e">1%</div><div class="stat-label">알림 임계값</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#f59e0b">4.5%</div><div class="stat-label">발견된 최대 갭</div></div>
</div>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    갭 매매는 이론적으로 무위험 차익거래인데, 실제로는 수수료, 슬리피지,
    전송 시간 등 고려할 게 많다. 하지만 이렇게 모니터링 도구가 있으면
    기회가 왔을 때 빠르게 판단할 수 있다.
  </p>
  <p>
    어제 업비트 상장 알림은 실패했지만, 오늘 갭 모니터링은 성공!
    안 되는 것도 있고 되는 것도 있다. 그게 개발이지 뭐.
  </p>
</div>

<h2>다음에 할 것</h2>
<ul>
  <li>갭 매매 실제 테스트 (소액)</li>
  <li>자동 매매 기능 추가</li>
  <li>수수료 계산 포함</li>
  <li>더 많은 DEX 추가</li>
</ul>
`
  },

  // ===== DAY 8 =====
  {
    slug: 'vibe-coding-day8',
    title: '바이브 코딩 시작하기 Day 8',
    description: 'Triangle Dice를 Base Mini App으로 변환! VPN으로 한국 차단 우회하고 Account Association 완료.',
    tags: ['Vibe Coding', 'Day 8', 'Base Mini App'],
    date: '2026-01-24',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  Triangle Dice 게임을 Base Mini App으로 변환했다!
  Coinbase의 Base App에서 실행되는 미니앱을 만드는 과정은 생각보다 복잡했다.
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> Base Mini App 변환</h3>
  <p>
    기존 Vite + React 앱에 OnchainKit과 Farcaster SDK를 추가해서
    Base Mini App으로 변환했다. Mini App은 Base App(구 Coinbase Wallet) 안에서
    실행되는 경량 앱이다.
  </p>
  <pre><code>$ npm install @coinbase/onchainkit
$ npm install @farcaster/miniapp-sdk
# wagmi 다운그레이드 필요 (호환성)
$ npm install wagmi@^2.16</code></pre>
  <div><span class="tag">OnchainKit</span><span class="tag">MiniKit</span><span class="tag">wagmi 2.x</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> Account Association 등록</h3>
  <p>
    Mini App을 등록하려면 base.dev에서 소유권을 인증해야 한다.
    문제는... 한국에서 base.dev 접속이 안 된다! VPN으로 우회해서 해결.
  </p>
  <div class="warning-box">
    <p><strong class="text-warning">한국에서 base.dev 차단됨</strong></p>
    <p style="font-size:0.875rem;">Coinbase 서비스가 한국에서 제한됨. 미국 VPN 사용하면 접속 가능!</p>
  </div>
  <p>등록 과정:</p>
  <ol>
    <li>index.html에 메타태그 추가 (소유권 인증)</li>
    <li>base.dev에서 Verify 클릭</li>
    <li>지갑으로 서명</li>
    <li>farcaster.json에 Account Association 추가</li>
  </ol>
  <div><span class="tag">base.dev</span><span class="tag">VPN</span><span class="tag">Wallet Signature</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> farcaster.json 설정</h3>
  <p>Mini App의 메타데이터를 담는 manifest 파일. 앱 이름, 아이콘, 카테고리 등을 설정한다.</p>
  <pre><code>// .well-known/farcaster.json
{
  "frame": {
    "name": "Triangle Dice",
    "primaryCategory": "games",
    "tags": ["gaming", "betting", "dice"]
  }
}</code></pre>
</div>

<div class="section-card">
  <h3><span class="text-accent">4.</span> 이미지 에셋 생성</h3>
  <p>Mini App에 필요한 이미지들을 Python PIL로 직접 생성했다.</p>
  <ul>
    <li>icon.png (200x200) - 앱 아이콘</li>
    <li>splash.png (400x400) - 로딩 화면</li>
    <li>preview.png (1200x630) - 소셜 공유용</li>
  </ul>
  <div><span class="tag">Python</span><span class="tag">Pillow</span></div>
</div>

<h2>배운 것</h2>
<ul>
  <li>Base Mini App = Farcaster Mini App (호환됨)</li>
  <li>OnchainKit 1.x는 wagmi 2.x 필요 (3.x 호환 안 됨)</li>
  <li>sdk.actions.ready() 호출해야 앱 로딩 완료 신호</li>
  <li>한국에서 Coinbase 서비스 제한됨 (VPN 필요)</li>
  <li>Base App은 170개국 지원 (한국 포함)</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">2</div><div class="stat-label">스마트 컨트랙트</div></div>
  <div class="stat-card"><div class="stat-value">3</div><div class="stat-label">SDK 패키지</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#22c55e">170+</div><div class="stat-label">지원 국가</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#f59e0b">1</div><div class="stat-label">VPN 필요</div></div>
</div>

<h2>현재 상태</h2>
<ul>
  <li class="text-success">✓ Vercel 배포 완료</li>
  <li class="text-success">✓ 스마트 컨트랙트 배포 (Base Sepolia)</li>
  <li class="text-success">✓ OnchainKit + MiniKit 통합</li>
  <li class="text-success">✓ Account Association 완료</li>
  <li class="text-success">✓ 메타데이터 설정 완료</li>
  <li class="text-warning">⏳ Ready call 디버깅 중</li>
  <li class="text-warning">⏳ Base App 검색 인덱싱 대기</li>
</ul>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    Mini App 개발은 생각보다 삽질이 많았다. 문서도 여기저기 흩어져 있고,
    한국에서 base.dev 접속이 안 되는 것도 몰랐다.
  </p>
  <p>
    그래도 VPN으로 우회해서 Account Association까지 완료했다!
    아직 Ready call 문제가 남아있지만, 거의 다 왔다.
    Base App이 한국에서도 사용 가능하다는 게 다행이다.
  </p>
</div>

<h2>링크</h2>
<ul>
  <li><a href="https://triangle-dice-miniapp.vercel.app" target="_blank" rel="noopener noreferrer">Triangle Dice Mini App (Vercel)</a></li>
  <li><a href="https://github.com/shud26/triangle-dice-miniapp" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
</ul>

<h2>다음에 할 것</h2>
<ul>
  <li>Ready call 문제 해결</li>
  <li>Base App에서 검색 가능하게</li>
  <li>메인넷 배포 (실제 USDC)</li>
  <li>게임 UI/UX 개선</li>
</ul>
`
  },

  // ===== DAY 9 =====
  {
    slug: 'vibe-coding-day9',
    title: '바이브 코딩 시작하기 Day 9',
    description: '남는 도메인으로 원페이지 대시보드 완성! Supabase + Vercel로 에어드랍 트래커, 리서치 노트, 캘린더 통합.',
    tags: ['Vibe Coding', 'Day 9', 'Supabase'],
    date: '2026-01-24',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  남는 도메인 tftchess.com을 활용해서 새로운 원페이지 대시보드를 만들었다!
  에어드랍 트래커, 리서치 노트, 캘린더, 할 일 관리를 한 페이지에 모아놓은 개인용 크립토 대시보드.
</p>

<h2>오늘 한 것들</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> shud-onepage 프로젝트 생성</h3>
  <p>
    기존에 WordPress로 방치하고 있던 tftchess.com 도메인에
    새로운 Next.js 사이트를 만들었다. Cloudflare Pages를 먼저 시도했으나
    Next.js 16 호환 문제로 Vercel로 전환.
  </p>
  <pre><code>$ npx create-next-app@latest tftchess
# Cloudflare Pages는 Next.js 16 미지원
# Vercel로 변경!</code></pre>
  <div><span class="tag">Next.js 16</span><span class="tag">TypeScript</span><span class="tag">Tailwind CSS</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> Supabase 데이터베이스 연동</h3>
  <p>
    데이터를 영구 저장하기 위해 Supabase를 연동했다.
    PostgreSQL 기반이라 SQL로 테이블을 만들고, RLS(Row Level Security) 설정을 해제해서 사용.
  </p>
  <pre><code>-- 생성한 테이블들
airdrops, airdrop_tasks
todos, events, research

-- RLS 비활성화 (개인용)
ALTER TABLE airdrops DISABLE ROW LEVEL SECURITY;</code></pre>
  <div><span class="tag">Supabase</span><span class="tag">PostgreSQL</span><span class="tag">RLS</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> 원페이지 대시보드 기능</h3>
  <p>한 페이지에 필요한 모든 기능을 모았다. PIN 로그인(1507)으로 편집 기능 잠금.</p>
  <ul>
    <li>에어드랍 트래커 - 태스크별 비용 관리 (Excel 스타일)</li>
    <li>코인 리서치 - 노트 + 감정(Bullish/Bearish/Neutral)</li>
    <li>캘린더 - 이벤트 + 메모</li>
    <li>할 일 목록 - 날짜별 관리</li>
    <li>김치 프리미엄 &amp; 차익거래 기회 표시</li>
  </ul>
  <div><span class="tag">CRUD</span><span class="tag">PIN Auth</span><span class="tag">One-page</span></div>
</div>

<div class="section-card">
  <h3><span class="text-accent">4.</span> 환경변수 삽질</h3>
  <p>
    Vercel에서 환경변수가 제대로 안 읽히는 문제 발생.
    "Invalid value" 에러가 계속 나서, 결국 Supabase 키를 코드에 직접 넣었다.
    (anon key는 공개해도 안전함)
  </p>
  <div class="warning-box">
    <p><strong class="text-danger">TypeError: Failed to execute 'set' on 'Headers': Invalid value</strong></p>
    <p style="font-size:0.875rem;">환경변수가 undefined로 들어가서 발생한 에러. 하드코딩으로 해결.</p>
  </div>
</div>

<div class="section-card">
  <h3><span class="text-accent">5.</span> 리서치 상세보기 개선</h3>
  <p>
    리서치 노트가 길어지면 잘리는 문제 발생.
    풀스크린 상세보기로 변경하고, 적당한 폭(max-w-3xl)에서 자동 줄바꿈 되도록 수정.
  </p>
  <pre><code>// 텍스트 줄바꿈 설정
max-w-3xl
white-space: pre-wrap
word-wrap: break-word</code></pre>
</div>

<h2>배운 것</h2>
<ul>
  <li>Cloudflare Pages는 Next.js 15.5.2까지만 지원 (16은 안 됨)</li>
  <li>Supabase RLS가 기본 활성화라 DISABLE 해야 데이터 접근 가능</li>
  <li>Vercel 환경변수는 NEXT_PUBLIC_ 접두사 필요 (클라이언트 노출용)</li>
  <li>Supabase anon key는 공개해도 안전 (RLS로 보호됨)</li>
  <li>whitespace-pre-wrap + max-width로 긴 텍스트 줄바꿈 처리</li>
</ul>

<h2>오늘의 숫자</h2>
<div class="stats-grid">
  <div class="stat-card"><div class="stat-value">5</div><div class="stat-label">DB 테이블</div></div>
  <div class="stat-card"><div class="stat-value">1</div><div class="stat-label">원페이지</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#22c55e">1507</div><div class="stat-label">PIN 코드</div></div>
  <div class="stat-card"><div class="stat-value" style="color:#f59e0b">2</div><div class="stat-label">호스팅 시도</div></div>
</div>

<h2>완성된 기능</h2>
<ul>
  <li class="text-success">✓ 에어드랍 트래커 (태스크 + 비용 관리)</li>
  <li class="text-success">✓ 코인 리서치 노트 (풀스크린 상세보기)</li>
  <li class="text-success">✓ 캘린더 + 이벤트 메모</li>
  <li class="text-success">✓ 할 일 목록</li>
  <li class="text-success">✓ 김치 프리미엄 모니터링</li>
  <li class="text-success">✓ PIN 로그인 (편집 권한)</li>
  <li class="text-success">✓ Supabase 데이터 영구 저장</li>
</ul>

<h2>느낀 점</h2>
<div class="highlight-box">
  <p>
    남는 도메인을 활용해서 유용한 걸 만들었다!
    워드프레스 호스팅비 내던 걸 해지하고 Vercel 무료로 전환.
  </p>
  <p>
    Supabase 연동은 생각보다 쉬웠는데, 환경변수 문제로 삽질을 많이 했다.
    결국 하드코딩으로 해결한 건 좀 찝찝하지만... 작동하니까 OK!
    원페이지 대시보드라 한 눈에 다 보여서 편하다.
  </p>
</div>

<h2>링크</h2>
<ul>
  <li><a href="https://tftchess.com" target="_blank" rel="noopener noreferrer">shud onepage (tftchess.com)</a></li>
  <li><a href="https://github.com/shud26/shud-onepage" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
</ul>

<h2>다음에 할 것</h2>
<ul>
  <li>리서치에 이미지 첨부 기능</li>
  <li>광고 추가 (Google AdSense)</li>
  <li>텔레그램 알림 연동</li>
  <li>모바일 UI 개선</li>
</ul>
`
  },

  // ===== DAY 10 =====
  {
    slug: 'vibe-coding-day10',
    title: '바이브 코딩 시작하기 Day 10',
    description: 'Triangle Dice 웹 호환성 수정, Clawdbot 리서치, 구형 맥 서버 시도 (실패).',
    tags: ['Vibe Coding', 'Day 10', 'Clawdbot'],
    date: '2026-01-26',
    published: true,
    content: `
<p style="font-size:1.125rem;color:#ADADB0;margin-bottom:2rem;">
  Triangle Dice Mini App의 웹 브라우저 호환성을 수정하고,
  Clawdbot이라는 개인 AI 비서를 리서치하고,
  구형 맥을 서버로 쓰려다 실패한 하루.
</p>

<h2>오늘 한 것</h2>

<div class="section-card">
  <h3><span class="text-accent">1.</span> Triangle Dice 웹 호환 문제</h3>
  <p>
    Base Mini App으로 만든 Triangle Dice가 일반 웹 브라우저에서 안 열리는 문제 발생.
  </p>
  <p>원인:</p>
  <ul>
    <li>MiniKitProvider가 Mini App 환경에서만 작동</li>
    <li>useMiniKit, useIsInMiniApp 훅이 에러 발생</li>
    <li>@farcaster/miniapp-sdk가 브라우저에서 실패</li>
  </ul>
  <p>해결:</p>
  <ul>
    <li>MiniKitProvider 제거</li>
    <li>WalletConnect에서 MiniKit 훅 제거</li>
    <li>wagmi 훅만 사용하도록 변경</li>
    <li>컨트랙트 주소 하드코딩 (env 변수 Vercel에 없어서)</li>
  </ul>
  <pre><code>// Before (에러 발생)
import { useMiniKit } from '@coinbase/onchainkit/minikit';
const { setFrameReady, context } = useMiniKit();

// After (웹 호환)
import { useAccount, useConnect } from 'wagmi';
// MiniKit 훅 제거, wagmi만 사용</code></pre>
</div>

<div class="section-card">
  <h3><span class="text-accent">2.</span> Clawdbot이란?</h3>
  <p>
    Claude 기반 오픈소스 개인 AI 비서. 텔레그램/디스코드 등으로 접속.
  </p>
  <p>할 수 있는 것들:</p>
  <ul>
    <li>이메일 작성/발송</li>
    <li>캘린더 관리</li>
    <li>브라우저 자동화</li>
    <li>터미널 명령어 실행</li>
    <li>파일 편집</li>
    <li>스마트홈 제어</li>
    <li>proactive 알림 (먼저 연락함)</li>
  </ul>
  <div class="warning-box">
    <p>크립토 지갑 있는 컴퓨터에 설치하면 위험할 수 있음. 터미널/파일 접근 권한이 있어서.</p>
  </div>
</div>

<div class="section-card">
  <h3><span class="text-accent">3.</span> 구형 맥 서버 시도</h3>
  <p>
    구형 맥을 24시간 크립토 봇 서버로 쓰려고 했는데...
  </p>
  <p class="text-danger">OS 버전이 너무 낮아서 포기</p>
  <p>다른 방법을 찾아봐야겠다. 클라우드 서버? 라즈베리 파이?</p>
</div>

<h2>배운 것</h2>
<ul>
  <li>Mini App SDK는 일반 브라우저에서 작동 안 함</li>
  <li>웹 호환성 위해 SDK 의존성 제거 필요</li>
  <li>Clawdbot - 강력하지만 보안 고려 필요</li>
  <li>구형 하드웨어 서버로 쓰기 어려움</li>
</ul>

<h2>다음에 할 것</h2>
<ul>
  <li>크립토 봇 서버 대안 찾기</li>
  <li>신규 토큰 스나이핑 봇 개발</li>
  <li>Triangle Dice Base App 등록 마무리</li>
</ul>
`
  },
];

async function migrate() {
  console.log('Starting blog migration...');
  console.log(`Inserting ${posts.length} posts...`);

  for (const post of posts) {
    const { data, error } = await supabase
      .from('blog_posts')
      .upsert([post], { onConflict: 'slug' })
      .select()
      .single();

    if (error) {
      console.error(`Error inserting ${post.slug}:`, error.message);
    } else {
      console.log(`✓ ${post.slug} (${data.id})`);
    }
  }

  console.log('\nMigration complete!');
}

migrate();
