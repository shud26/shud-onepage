export interface Guide {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: 'beginner' | 'trading' | 'defi' | 'security' | 'tax';
  readTime: number;
  updatedAt: string;
}

export const categories: Record<string, { label: string; color: string }> = {
  beginner: { label: '입문', color: '#22c55e' },
  trading: { label: '트레이딩', color: '#ef4444' },
  defi: { label: 'DeFi', color: '#8b5cf6' },
  security: { label: '보안', color: '#f59e0b' },
  tax: { label: '세금', color: '#3b82f6' },
};

export const guides: Guide[] = [
  {
    slug: 'bitcoin-beginners-guide',
    title: '비트코인 초보자 완벽 가이드 2026',
    description: '비트코인이 뭔지, 어떻게 사는지, 보관은 어떻게 하는지 초보자 눈높이에서 쉽게 설명합니다.',
    category: 'beginner',
    readTime: 8,
    updatedAt: '2026-02-06',
    content: `
<h2>비트코인이란?</h2>
<p>비트코인은 2009년 사토시 나카모토라는 익명의 개발자가 만든 <strong>세계 최초의 암호화폐</strong>입니다. 은행 같은 중개자 없이 인터넷만 있으면 누구에게나 돈을 보낼 수 있습니다.</p>

<p>비트코인의 핵심 특징:</p>
<ul>
  <li><strong>탈중앙화</strong>: 정부나 은행이 통제할 수 없음</li>
  <li><strong>희소성</strong>: 총 발행량 2,100만 개로 제한</li>
  <li><strong>투명성</strong>: 모든 거래가 블록체인에 공개 기록</li>
  <li><strong>보안성</strong>: 암호화 기술로 위조 불가능</li>
</ul>

<h2>비트코인은 왜 가치가 있을까?</h2>
<p>금이 귀한 이유는 <strong>희소성</strong> 때문입니다. 비트코인도 마찬가지로 총 발행량이 2,100만 개로 제한되어 있어 "디지털 금"이라고 불립니다.</p>

<p>또한 비트코인은:</p>
<ul>
  <li>국경 없이 전송 가능 (해외 송금 수수료 절감)</li>
  <li>24시간 365일 거래 가능</li>
  <li>소수점 8자리까지 나눠서 소액 투자 가능</li>
  <li>인플레이션 헤지 수단으로 활용</li>
</ul>

<h2>비트코인 구매 방법</h2>
<h3>1단계: 거래소 가입</h3>
<p>한국에서는 <strong>업비트, 빗썸, 코인원, 코빗</strong> 등의 거래소를 이용할 수 있습니다. 거래소 가입 시 본인인증(KYC)이 필요합니다.</p>

<h3>2단계: 원화 입금</h3>
<p>은행 계좌를 연결하고 원화를 입금합니다. 대부분의 거래소는 실명 계좌만 연결 가능합니다.</p>

<h3>3단계: 비트코인 구매</h3>
<p>원하는 금액만큼 비트코인을 구매합니다. 1 BTC 전체를 살 필요 없이, 1만원어치만 구매하는 것도 가능합니다.</p>

<h2>비트코인 보관 방법</h2>
<h3>거래소 보관 (편리하지만 위험)</h3>
<p>거래소에 그대로 두면 편리하지만, 거래소가 해킹당하면 잃을 수 있습니다. 소액이라면 괜찮지만, 큰 금액은 개인 지갑으로 옮기세요.</p>

<h3>개인 지갑 (안전)</h3>
<ul>
  <li><strong>핫월렛</strong>: 메타마스크, 트러스트월렛 (편리하지만 온라인)</li>
  <li><strong>콜드월렛</strong>: 레저, 트레저 (오프라인이라 가장 안전)</li>
</ul>

<h2>초보자 주의사항</h2>
<ul>
  <li><strong>잃어도 되는 돈만 투자하세요</strong>: 암호화폐는 변동성이 매우 큽니다</li>
  <li><strong>한 번에 몰빵 금지</strong>: 분할 매수로 리스크 분산</li>
  <li><strong>시드구문(복구 문구) 절대 공유 금지</strong>: 이걸 알면 지갑 털림</li>
  <li><strong>공식 사이트만 이용</strong>: 피싱 사이트 주의</li>
</ul>

<h2>마무리</h2>
<p>비트코인은 새로운 금융 시스템의 시작입니다. 처음엔 어렵게 느껴질 수 있지만, 소액으로 시작해서 천천히 배워가면 됩니다. 중요한 건 <strong>본인이 이해한 만큼만 투자</strong>하는 것입니다.</p>
`,
  },
  {
    slug: 'staking-guide',
    title: '코인 스테이킹 완벽 가이드 - 예치하고 이자 받기',
    description: '스테이킹이 뭔지, 어디서 하는지, 수익률은 얼마인지, 주의할 점은 뭔지 상세히 알려드립니다.',
    category: 'defi',
    readTime: 7,
    updatedAt: '2026-02-06',
    content: `
<h2>스테이킹이란?</h2>
<p>스테이킹은 보유한 암호화폐를 네트워크에 <strong>예치하고 보상을 받는 것</strong>입니다. 은행 예금 이자와 비슷하지만, 보통 훨씬 높은 수익률을 제공합니다.</p>

<p>예를 들어, 이더리움을 스테이킹하면 연 3~5%의 보상을 받을 수 있습니다. 이 보상은 네트워크 검증에 참여한 대가로 주어집니다.</p>

<h2>스테이킹 작동 원리</h2>
<p>지분증명(PoS) 블록체인에서는 채굴 대신 스테이킹으로 네트워크를 보호합니다:</p>
<ol>
  <li>코인을 스테이킹 풀에 예치</li>
  <li>예치된 코인으로 거래 검증에 참여</li>
  <li>검증 보상으로 추가 코인 획득</li>
</ol>

<h2>스테이킹 수익률 비교 (2026년 기준)</h2>
<table>
  <tr><th>코인</th><th>연 수익률</th><th>최소 수량</th></tr>
  <tr><td>이더리움 (ETH)</td><td>3~5%</td><td>제한 없음 (거래소)</td></tr>
  <tr><td>솔라나 (SOL)</td><td>6~8%</td><td>제한 없음</td></tr>
  <tr><td>카르다노 (ADA)</td><td>4~5%</td><td>제한 없음</td></tr>
  <tr><td>코스모스 (ATOM)</td><td>15~20%</td><td>제한 없음</td></tr>
  <tr><td>폴카닷 (DOT)</td><td>12~15%</td><td>제한 없음</td></tr>
</table>

<h2>스테이킹 하는 방법</h2>
<h3>방법 1: 거래소 스테이킹 (초보자 추천)</h3>
<p>업비트, 바이낸스 등 거래소에서 클릭 몇 번으로 쉽게 스테이킹할 수 있습니다.</p>
<ul>
  <li><strong>장점</strong>: 간편함, 최소 수량 제한 낮음</li>
  <li><strong>단점</strong>: 수수료 있음, 거래소 리스크</li>
</ul>

<h3>방법 2: 직접 스테이킹</h3>
<p>개인 지갑에서 직접 밸리데이터에 위임하는 방식입니다.</p>
<ul>
  <li><strong>장점</strong>: 수수료 낮음, 탈중앙화 기여</li>
  <li><strong>단점</strong>: 설정이 다소 복잡</li>
</ul>

<h3>방법 3: 리퀴드 스테이킹</h3>
<p>Lido, Rocket Pool 등에서 스테이킹하면 stETH, rETH 같은 토큰을 받습니다. 이 토큰은 다른 DeFi에서도 활용 가능!</p>
<ul>
  <li><strong>장점</strong>: 유동성 유지, DeFi 활용</li>
  <li><strong>단점</strong>: 스마트 컨트랙트 리스크</li>
</ul>

<h2>스테이킹 주의사항</h2>
<ul>
  <li><strong>언스테이킹 기간</strong>: 대부분 해제까지 며칠~몇 주 소요</li>
  <li><strong>슬래싱 리스크</strong>: 밸리데이터 잘못으로 원금 일부 삭감 가능</li>
  <li><strong>가격 변동</strong>: 스테이킹 중에도 코인 가격은 변동</li>
  <li><strong>세금</strong>: 스테이킹 보상도 과세 대상</li>
</ul>

<h2>마무리</h2>
<p>스테이킹은 장기 보유자에게 좋은 수익 창출 방법입니다. 단, 모든 투자에는 리스크가 있으니 충분히 공부하고 시작하세요!</p>
`,
  },
  {
    slug: 'airdrop-guide',
    title: '에어드랍 받는 법 - 무료 코인 얻기 완벽 가이드',
    description: '에어드랍이 뭔지, 어떻게 참여하는지, 스캠은 어떻게 구별하는지 알려드립니다.',
    category: 'beginner',
    readTime: 6,
    updatedAt: '2026-02-06',
    content: `
<h2>에어드랍이란?</h2>
<p>에어드랍은 프로젝트가 홍보나 커뮤니티 구축을 위해 <strong>무료로 토큰을 배포</strong>하는 것입니다. 과거 유니스왑, 아비트럼, 옵티미즘 에어드랍은 수백만 원의 가치가 있었습니다.</p>

<h2>에어드랍 종류</h2>
<h3>1. 회고적 에어드랍 (Retroactive)</h3>
<p>프로젝트를 미리 사용한 사람에게 나중에 토큰을 주는 방식입니다. 가장 큰 보상을 주는 경우가 많습니다.</p>
<ul>
  <li>예: Uniswap (400 UNI = 약 $1,400), Arbitrum (약 $2,000)</li>
</ul>

<h3>2. 태스크 에어드랍</h3>
<p>트위터 팔로우, 디스코드 가입 등 특정 과제를 완료하면 토큰을 받습니다.</p>

<h3>3. 홀더 에어드랍</h3>
<p>특정 토큰을 보유하고 있으면 자동으로 새 토큰을 받습니다.</p>

<h2>에어드랍 참여 방법</h2>
<h3>1단계: 지갑 준비</h3>
<p>메타마스크, 팬텀, 켈프 등 웹3 지갑을 준비합니다. 여러 체인을 지원하는 지갑이 좋습니다.</p>

<h3>2단계: 유망 프로젝트 찾기</h3>
<p>아직 토큰이 없는 프로젝트 중 VC 투자를 받은 곳을 찾습니다:</p>
<ul>
  <li>DeFiLlama, CryptoRank 등에서 확인</li>
  <li>트위터 크립토 커뮤니티 팔로우</li>
  <li>에어드랍 전문 사이트 (airdrops.io 등)</li>
</ul>

<h3>3단계: 프로젝트 사용하기</h3>
<p>찾은 프로젝트를 실제로 사용합니다:</p>
<ul>
  <li>테스트넷/메인넷 트랜잭션 생성</li>
  <li>스왑, 브릿지, 스테이킹 등 핵심 기능 사용</li>
  <li>여러 달에 걸쳐 꾸준히 활동</li>
</ul>

<h3>4단계: 기다리기</h3>
<p>토큰 발행 발표를 기다립니다. 발표되면 클레임 페이지에서 받습니다.</p>

<h2>스캠 에어드랍 구별법</h2>
<ul>
  <li><strong>절대 시드구문을 요구하면 스캠!</strong></li>
  <li>먼저 돈을 보내라고 하면 스캠</li>
  <li>공식 채널이 아닌 DM은 99% 스캠</li>
  <li>너무 좋은 조건은 의심</li>
  <li>항상 공식 트위터/웹사이트 확인</li>
</ul>

<h2>에어드랍 극대화 팁</h2>
<ul>
  <li><strong>멀티 계정</strong>: 규정 위반일 수 있으니 프로젝트 정책 확인</li>
  <li><strong>다양한 활동</strong>: 단순 스왑보다 여러 기능 사용</li>
  <li><strong>꾸준함</strong>: 한 번보다 여러 달 활동</li>
  <li><strong>커뮤니티 참여</strong>: 디스코드, 거버넌스 참여</li>
</ul>

<h2>마무리</h2>
<p>에어드랍은 무료 돈이 아니라, 초기 사용자에 대한 보상입니다. 시간과 가스비를 투자해야 하고, 받을 수 있다는 보장도 없습니다. 하지만 성공하면 큰 보상을 받을 수 있으니 꾸준히 도전해보세요!</p>
`,
  },
  {
    slug: 'kimchi-premium-guide',
    title: '김치 프리미엄 완벽 이해 - 발생 원인과 활용법',
    description: '김치프리미엄이 왜 생기는지, 어떻게 확인하는지, 투자에 어떤 의미인지 설명합니다.',
    category: 'trading',
    readTime: 5,
    updatedAt: '2026-02-06',
    content: `
<h2>김치 프리미엄이란?</h2>
<p>김치 프리미엄(김프)은 <strong>한국 거래소의 암호화폐 가격이 해외 거래소보다 높은 현상</strong>입니다. "김치"는 한국을 상징하는 단어로, 한국 시장의 특수성을 나타냅니다.</p>

<p>예를 들어, 바이낸스에서 비트코인이 $100,000인데 업비트에서 1억 500만원이면 김프는 약 5%입니다 (환율 고려).</p>

<h2>김프가 생기는 이유</h2>
<h3>1. 수급 불균형</h3>
<p>한국 투자자들의 매수세가 강할 때 가격이 올라갑니다. 해외에서 코인을 가져와 국내에서 팔면 차익을 얻을 수 있지만, 자금 이동 규제로 쉽지 않습니다.</p>

<h3>2. 규제 환경</h3>
<p>한국은 원화 입출금에 실명 계좌가 필요하고, 해외 송금도 제한적입니다. 이런 폐쇄적 환경이 김프를 만듭니다.</p>

<h3>3. 투자 심리</h3>
<p>한국은 암호화폐 투자 열기가 높아, 상승장에서 특히 김프가 커집니다.</p>

<h2>김프 확인 방법</h2>
<ul>
  <li><strong>김프가</strong> (kimchi-premium.com)</li>
  <li><strong>코인마켓캡</strong> - 거래소별 가격 비교</li>
  <li><strong>직접 계산</strong>: (국내가 - 해외가×환율) / (해외가×환율) × 100</li>
</ul>

<h2>김프의 의미</h2>
<h3>김프가 높을 때 (5% 이상)</h3>
<ul>
  <li>한국 투자자들의 매수세가 강함</li>
  <li>단기적으로 과열 신호일 수 있음</li>
  <li>역사적으로 고점 근처에서 김프 급등</li>
</ul>

<h3>김프가 낮거나 마이너스일 때</h3>
<ul>
  <li>한국 투자자들의 관심 저조</li>
  <li>매도 압력이 강함</li>
  <li>역김프는 바닥 신호일 수 있음</li>
</ul>

<h2>김프 활용 투자 전략</h2>
<h3>1. 시장 심리 지표로 활용</h3>
<p>김프가 10% 이상이면 과열, 역김프면 공포 구간으로 판단할 수 있습니다.</p>

<h3>2. 차익거래 (어려움)</h3>
<p>이론적으로 해외에서 사서 국내에서 팔면 되지만:</p>
<ul>
  <li>외환 규제로 큰 금액 이동 어려움</li>
  <li>코인 전송 시간 동안 가격 변동</li>
  <li>거래소 수수료, 전송 수수료</li>
</ul>

<h2>김프 역사적 사례</h2>
<ul>
  <li><strong>2017년 12월</strong>: 김프 50% 이상, 비트코인 고점 후 폭락</li>
  <li><strong>2021년 4월</strong>: 김프 20% 돌파, 이후 조정</li>
  <li><strong>2024년 3월</strong>: 김프 10% 근접, 비트코인 신고가</li>
</ul>

<h2>마무리</h2>
<p>김프는 한국 암호화폐 시장의 독특한 현상입니다. 직접적인 차익거래는 어렵지만, 시장 심리를 판단하는 보조 지표로 활용할 수 있습니다. 김프가 비정상적으로 높을 때는 신중하게 투자하세요!</p>
`,
  },
  {
    slug: 'defi-beginners-guide',
    title: 'DeFi 입문 가이드 - 탈중앙화 금융 시작하기',
    description: 'DeFi가 뭔지, 어떤 서비스가 있는지, 어떻게 시작하는지 초보자 눈높이에서 설명합니다.',
    category: 'defi',
    readTime: 8,
    updatedAt: '2026-02-06',
    content: `
<h2>DeFi란?</h2>
<p>DeFi(Decentralized Finance, 탈중앙화 금융)는 <strong>은행 없이 블록체인에서 운영되는 금융 서비스</strong>입니다. 예금, 대출, 거래, 보험 등 기존 금융 서비스를 스마트 컨트랙트로 구현합니다.</p>

<h2>DeFi vs 전통 금융</h2>
<table>
  <tr><th>항목</th><th>전통 금융</th><th>DeFi</th></tr>
  <tr><td>중개자</td><td>은행 필요</td><td>스마트 컨트랙트</td></tr>
  <tr><td>운영시간</td><td>영업시간</td><td>24시간 365일</td></tr>
  <tr><td>가입조건</td><td>신분증, 신용</td><td>지갑만 있으면 됨</td></tr>
  <tr><td>수수료</td><td>높음</td><td>낮음 (가스비 제외)</td></tr>
  <tr><td>투명성</td><td>불투명</td><td>모든 거래 공개</td></tr>
</table>

<h2>주요 DeFi 서비스</h2>
<h3>1. DEX (탈중앙화 거래소)</h3>
<p>회원가입 없이 지갑만 연결하면 코인을 교환할 수 있습니다.</p>
<ul>
  <li><strong>Uniswap</strong>: 이더리움 대표 DEX</li>
  <li><strong>Raydium</strong>: 솔라나 대표 DEX</li>
  <li><strong>PancakeSwap</strong>: BNB체인 대표 DEX</li>
</ul>

<h3>2. 렌딩 프로토콜</h3>
<p>코인을 예치하면 이자를 받고, 담보를 맡기면 대출받을 수 있습니다.</p>
<ul>
  <li><strong>Aave</strong>: 가장 큰 렌딩 프로토콜</li>
  <li><strong>Compound</strong>: 이더리움 기반 렌딩</li>
</ul>

<h3>3. 일드 파밍</h3>
<p>유동성을 제공하고 보상으로 토큰을 받습니다. 높은 수익률이 가능하지만 리스크도 큽니다.</p>

<h3>4. 스테이블코인</h3>
<p>달러 가치에 연동된 코인으로 DeFi의 기축통화 역할을 합니다.</p>
<ul>
  <li><strong>USDC</strong>: 미국 규제 준수, 가장 안전</li>
  <li><strong>USDT</strong>: 가장 많이 사용</li>
  <li><strong>DAI</strong>: 탈중앙화 스테이블코인</li>
</ul>

<h2>DeFi 시작하기</h2>
<h3>1단계: 지갑 설치</h3>
<p>메타마스크(이더리움), 팬텀(솔라나), 켈프(멀티체인) 등을 설치합니다.</p>

<h3>2단계: 코인 준비</h3>
<p>거래소에서 ETH나 SOL을 구매해 지갑으로 전송합니다. 가스비로 사용됩니다.</p>

<h3>3단계: DeFi 연결</h3>
<p>Uniswap.org 같은 사이트에서 "Connect Wallet" 클릭 후 지갑을 연결합니다.</p>

<h3>4단계: 트랜잭션 실행</h3>
<p>스왑, 예치 등 원하는 작업을 실행하고 지갑에서 서명합니다.</p>

<h2>DeFi 리스크</h2>
<ul>
  <li><strong>스마트 컨트랙트 리스크</strong>: 코드 버그로 자금 손실 가능</li>
  <li><strong>러그풀</strong>: 악의적 프로젝트가 자금 탈취</li>
  <li><strong>비영구적 손실</strong>: 유동성 제공 시 가격 변동 손실</li>
  <li><strong>가스비</strong>: 이더리움은 수수료가 높을 수 있음</li>
</ul>

<h2>안전하게 DeFi 하기</h2>
<ul>
  <li>검증된 프로토콜만 사용 (TVL 높은 곳)</li>
  <li>소액으로 테스트 후 진행</li>
  <li>무한 승인(Unlimited Approval) 피하기</li>
  <li>정기적으로 승인 취소 (revoke.cash)</li>
</ul>

<h2>마무리</h2>
<p>DeFi는 금융의 미래이지만, 아직 초기 단계라 리스크가 있습니다. 소액으로 경험을 쌓고, 충분히 공부한 후에 큰 금액을 넣으세요!</p>
`,
  },
  {
    slug: 'crypto-wallet-guide',
    title: '암호화폐 지갑 완벽 가이드 - 종류별 특징과 추천',
    description: '핫월렛, 콜드월렛의 차이와 상황별 추천 지갑을 알려드립니다.',
    category: 'security',
    readTime: 6,
    updatedAt: '2026-02-06',
    content: `
<h2>암호화폐 지갑이란?</h2>
<p>암호화폐 지갑은 코인을 보관하는 <strong>디지털 금고</strong>입니다. 정확히는 코인 자체가 아니라, 코인에 접근하는 <strong>개인키(Private Key)</strong>를 저장합니다.</p>

<p>"Not your keys, not your coins" - 개인키가 없으면 당신 코인이 아닙니다!</p>

<h2>지갑 종류</h2>
<h3>1. 핫월렛 (Hot Wallet)</h3>
<p>인터넷에 연결된 지갑으로 편리하지만 해킹 위험이 있습니다.</p>

<h4>소프트웨어 지갑</h4>
<ul>
  <li><strong>메타마스크</strong>: 이더리움 생태계 필수, 브라우저 확장</li>
  <li><strong>팬텀</strong>: 솔라나 생태계 필수</li>
  <li><strong>트러스트월렛</strong>: 멀티체인 지원 모바일 앱</li>
  <li><strong>레인보우</strong>: 예쁜 UI의 이더리움 지갑</li>
</ul>

<h4>거래소 지갑</h4>
<p>업비트, 바이낸스 등 거래소에 보관. 편리하지만 거래소가 해킹되면 손실.</p>

<h3>2. 콜드월렛 (Cold Wallet)</h3>
<p>인터넷에 연결되지 않아 가장 안전합니다.</p>

<h4>하드웨어 지갑</h4>
<ul>
  <li><strong>Ledger</strong>: 가장 인기 있는 하드웨어 지갑 ($79~)</li>
  <li><strong>Trezor</strong>: 오픈소스, 보안 중시 ($69~)</li>
</ul>

<h4>페이퍼 월렛</h4>
<p>개인키를 종이에 적어 보관. 물리적 손상 주의.</p>

<h2>상황별 추천</h2>
<table>
  <tr><th>상황</th><th>추천 지갑</th></tr>
  <tr><td>DeFi 자주 사용</td><td>메타마스크 + 레저 연동</td></tr>
  <tr><td>소액 보관</td><td>메타마스크, 트러스트월렛</td></tr>
  <tr><td>큰 금액 장기 보관</td><td>레저, 트레저</td></tr>
  <tr><td>솔라나 생태계</td><td>팬텀 + 레저 연동</td></tr>
  <tr><td>NFT 보관</td><td>메타마스크, 레인보우</td></tr>
</table>

<h2>시드구문(복구 문구) 관리</h2>
<p>시드구문은 12~24개 영단어로 된 지갑 복구 키입니다.</p>

<h3>절대 하면 안 되는 것</h3>
<ul>
  <li>온라인에 저장 (클라우드, 이메일, 메모앱)</li>
  <li>스크린샷 찍기</li>
  <li>누구에게도 공유</li>
  <li>피싱 사이트에 입력</li>
</ul>

<h3>안전한 보관법</h3>
<ul>
  <li>종이에 적어서 금고 보관</li>
  <li>금속 플레이트에 각인 (화재/수해 대비)</li>
  <li>여러 장소에 분산 보관</li>
</ul>

<h2>지갑 보안 팁</h2>
<ul>
  <li><strong>하드웨어 지갑</strong>: 큰 금액은 반드시 콜드월렛에</li>
  <li><strong>지갑 분리</strong>: DeFi용, 보관용, 민팅용 분리</li>
  <li><strong>승인 관리</strong>: 정기적으로 불필요한 승인 취소</li>
  <li><strong>북마크 사용</strong>: 피싱 사이트 방지</li>
</ul>

<h2>마무리</h2>
<p>지갑 선택은 보안과 편의성의 균형입니다. 소액은 핫월렛으로 편하게, 큰 금액은 콜드월렛으로 안전하게 보관하세요!</p>
`,
  },
  {
    slug: 'exchange-comparison-guide',
    title: '코인 거래소 비교 가이드 - 어디서 거래할까?',
    description: '국내외 주요 거래소의 특징, 수수료, 장단점을 비교해 드립니다.',
    category: 'trading',
    readTime: 7,
    updatedAt: '2026-02-06',
    content: `
<h2>거래소 선택이 중요한 이유</h2>
<p>거래소마다 수수료, 상장 코인, 보안 수준이 다릅니다. 잘못된 선택은 불필요한 비용과 리스크를 초래합니다.</p>

<h2>국내 거래소 비교</h2>
<h3>업비트 (Upbit)</h3>
<ul>
  <li><strong>장점</strong>: 국내 1위, 가장 많은 거래량, 빠른 원화 입출금</li>
  <li><strong>단점</strong>: 해외 전송 수수료 높음, 상장 속도 느림</li>
  <li><strong>수수료</strong>: 0.05%</li>
  <li><strong>추천</strong>: 원화로 코인 사고팔기</li>
</ul>

<h3>빗썸 (Bithumb)</h3>
<ul>
  <li><strong>장점</strong>: 업비트 다음 거래량, 다양한 이벤트</li>
  <li><strong>단점</strong>: 과거 해킹 이력</li>
  <li><strong>수수료</strong>: 0.04%</li>
</ul>

<h3>코인원 (Coinone)</h3>
<ul>
  <li><strong>장점</strong>: 안정적 운영, 깔끔한 UI</li>
  <li><strong>단점</strong>: 거래량 적음</li>
  <li><strong>수수료</strong>: 0.2% (VIP 0.01%)</li>
</ul>

<h2>해외 거래소 비교</h2>
<h3>바이낸스 (Binance)</h3>
<ul>
  <li><strong>장점</strong>: 세계 최대, 가장 많은 코인, 낮은 수수료</li>
  <li><strong>단점</strong>: 한국어 지원 제한적, 원화 입금 불가</li>
  <li><strong>수수료</strong>: 0.1% (BNB 보유 시 25% 할인)</li>
  <li><strong>추천</strong>: 알트코인 거래, 선물 거래</li>
</ul>

<h3>바이비트 (Bybit)</h3>
<ul>
  <li><strong>장점</strong>: 한국어 지원, 선물 거래 특화</li>
  <li><strong>단점</strong>: 원화 입금 불가</li>
  <li><strong>수수료</strong>: 현물 0.1%, 선물 0.01/0.06%</li>
  <li><strong>추천</strong>: 선물/레버리지 거래</li>
</ul>

<h3>OKX</h3>
<ul>
  <li><strong>장점</strong>: 다양한 기능, Web3 지갑 통합</li>
  <li><strong>단점</strong>: 복잡한 UI</li>
  <li><strong>수수료</strong>: 0.08~0.1%</li>
</ul>

<h2>거래소 유형별 특징</h2>
<h3>CEX (중앙화 거래소)</h3>
<p>업비트, 바이낸스 등 회사가 운영하는 거래소</p>
<ul>
  <li><strong>장점</strong>: 빠른 속도, 높은 유동성, 편리함</li>
  <li><strong>단점</strong>: 해킹 위험, 신원인증 필요</li>
</ul>

<h3>DEX (탈중앙화 거래소)</h3>
<p>Uniswap, Raydium 등 스마트 컨트랙트로 운영</p>
<ul>
  <li><strong>장점</strong>: 익명성, 자산 통제권, 상장 즉시 거래</li>
  <li><strong>단점</strong>: 가스비, 슬리피지, 스캠 코인 주의</li>
</ul>

<h2>거래소 선택 체크리스트</h2>
<ul>
  <li>✅ 보안 이력 확인 (과거 해킹 여부)</li>
  <li>✅ 수수료 비교</li>
  <li>✅ 원하는 코인 상장 여부</li>
  <li>✅ 출금 수수료 및 최소 수량</li>
  <li>✅ 고객 지원 품질</li>
  <li>✅ 2단계 인증(2FA) 지원</li>
</ul>

<h2>추천 조합</h2>
<ul>
  <li><strong>입문자</strong>: 업비트 (원화 거래)</li>
  <li><strong>알트코인 투자</strong>: 업비트 + 바이낸스</li>
  <li><strong>선물 거래</strong>: 바이비트 또는 바이낸스</li>
  <li><strong>DeFi 사용자</strong>: CEX + DEX 병행</li>
</ul>

<h2>마무리</h2>
<p>완벽한 거래소는 없습니다. 목적에 맞게 여러 거래소를 조합해서 사용하고, 큰 금액은 개인 지갑에 보관하세요!</p>
`,
  },
  {
    slug: 'leverage-trading-risks',
    title: '레버리지 거래 위험성 - 알고 해야 덜 잃는다',
    description: '선물거래와 레버리지의 위험성, 청산 원리, 안전하게 거래하는 법을 알려드립니다.',
    category: 'trading',
    readTime: 6,
    updatedAt: '2026-02-06',
    content: `
<h2>레버리지 거래란?</h2>
<p>레버리지는 빌린 돈으로 투자금을 늘리는 것입니다. <strong>10배 레버리지</strong>는 100만원으로 1,000만원어치 거래하는 것과 같습니다.</p>

<p>수익도 10배, 손실도 10배. 양날의 검입니다.</p>

<h2>레버리지 계산 예시</h2>
<h3>10배 레버리지로 비트코인 롱(매수)</h3>
<ul>
  <li>투자금: 100만원</li>
  <li>포지션 크기: 1,000만원</li>
  <li>비트코인 +5% → 수익 50만원 (+50%)</li>
  <li>비트코인 -5% → 손실 50만원 (-50%)</li>
  <li>비트코인 -10% → <strong>청산 (원금 전액 손실)</strong></li>
</ul>

<h2>청산(Liquidation)이란?</h2>
<p>손실이 투자금을 초과하면 거래소가 강제로 포지션을 정리합니다. 이를 <strong>청산</strong>이라고 합니다.</p>

<h3>청산 가격 계산 (대략)</h3>
<ul>
  <li>10배 레버리지: 약 10% 역방향 이동 시 청산</li>
  <li>20배 레버리지: 약 5% 역방향 이동 시 청산</li>
  <li>100배 레버리지: 약 1% 역방향 이동 시 청산</li>
</ul>

<h2>레버리지 거래의 위험</h2>
<h3>1. 급격한 변동성</h3>
<p>암호화폐는 하루에 10~20% 움직이는 경우도 많습니다. 높은 레버리지는 순식간에 청산됩니다.</p>

<h3>2. 펀딩비</h3>
<p>선물 포지션을 유지하면 8시간마다 펀딩비가 발생합니다. 장기 보유 시 큰 비용.</p>

<h3>3. 감정적 거래</h3>
<p>손실이 커지면 "물타기"로 더 큰 손실. 수익이 나면 "더 벌 수 있다"며 익절 안 함.</p>

<h3>4. 스캠 위크(Scam Wick)</h3>
<p>순간적인 급락으로 청산 후 가격 회복. 레버리지 거래자만 손해.</p>

<h2>레버리지 거래 통계</h2>
<p>여러 연구에 따르면 <strong>선물 거래자의 70~90%가 손실</strong>을 봅니다. 거래소는 수수료와 청산으로 항상 이익.</p>

<h2>그래도 하고 싶다면</h2>
<h3>1. 낮은 레버리지</h3>
<p>2~3배 이하로 시작. 10배 이상은 도박.</p>

<h3>2. 손절선 필수</h3>
<p>포지션 진입 시 반드시 스탑로스 설정. 감정적 판단 방지.</p>

<h3>3. 소액으로 연습</h3>
<p>전체 자산의 5% 이하로만 선물 거래. 잃어도 되는 돈만.</p>

<h3>4. 펀딩비 확인</h3>
<p>펀딩비가 높은 방향으로 포지션 잡지 않기.</p>

<h3>5. 분할 진입/청산</h3>
<p>한 번에 몰빵하지 말고 나눠서 진입.</p>

<h2>현물 vs 선물</h2>
<table>
  <tr><th>항목</th><th>현물</th><th>선물</th></tr>
  <tr><td>최대 손실</td><td>투자금 100%</td><td>투자금 100%+</td></tr>
  <tr><td>청산</td><td>없음</td><td>있음</td></tr>
  <tr><td>장기 보유</td><td>적합</td><td>비용 발생</td></tr>
  <tr><td>초보자</td><td>추천</td><td>비추천</td></tr>
</table>

<h2>마무리</h2>
<p>레버리지 거래는 <strong>전문가도 어려운 영역</strong>입니다. 초보자는 현물 투자로 경험을 쌓고, 충분히 공부한 후에 소액으로 시작하세요. "돈을 빨리 불리고 싶다"는 마음이 가장 큰 적입니다.</p>
`,
  },
  {
    slug: 'nft-beginners-guide',
    title: 'NFT 입문 가이드 - 구매부터 판매까지',
    description: 'NFT가 뭔지, 어디서 사는지, 주의할 점은 뭔지 초보자를 위해 설명합니다.',
    category: 'beginner',
    readTime: 7,
    updatedAt: '2026-02-06',
    content: `
<h2>NFT란?</h2>
<p>NFT(Non-Fungible Token)는 <strong>대체 불가능한 토큰</strong>입니다. 각 토큰이 고유해서 디지털 소유권을 증명할 수 있습니다.</p>

<p>1만원짜리 지폐는 다른 1만원과 교환해도 같지만, 유명 작가의 그림은 다른 그림과 교환할 수 없습니다. NFT는 후자처럼 각각 고유합니다.</p>

<h2>NFT로 뭘 할 수 있나?</h2>
<ul>
  <li><strong>디지털 아트</strong>: 그림, 음악, 영상의 소유권</li>
  <li><strong>PFP (프로필 사진)</strong>: BAYC, 아즈키 등</li>
  <li><strong>게임 아이템</strong>: 캐릭터, 무기, 땅</li>
  <li><strong>멤버십</strong>: 특정 커뮤니티 접근권</li>
  <li><strong>실물 연계</strong>: 명품, 티켓 등의 디지털 인증</li>
</ul>

<h2>NFT 마켓플레이스</h2>
<h3>이더리움</h3>
<ul>
  <li><strong>OpenSea</strong>: 가장 큰 마켓, 다양한 컬렉션</li>
  <li><strong>Blur</strong>: 트레이더 특화, 수수료 무료</li>
  <li><strong>Foundation</strong>: 큐레이션된 아트</li>
</ul>

<h3>솔라나</h3>
<ul>
  <li><strong>Magic Eden</strong>: 솔라나 최대 마켓</li>
  <li><strong>Tensor</strong>: 트레이딩 특화</li>
</ul>

<h2>NFT 구매 방법</h2>
<h3>1단계: 지갑 준비</h3>
<p>메타마스크(이더리움) 또는 팬텀(솔라나) 지갑을 설치합니다.</p>

<h3>2단계: 코인 준비</h3>
<p>거래소에서 ETH 또는 SOL을 구매해 지갑으로 전송합니다.</p>

<h3>3단계: 마켓 연결</h3>
<p>OpenSea.io 등에서 "Connect Wallet"을 클릭해 지갑을 연결합니다.</p>

<h3>4단계: 구매</h3>
<ul>
  <li><strong>즉시 구매</strong>: 판매자가 정한 가격에 바로 구매</li>
  <li><strong>경매</strong>: 입찰 후 낙찰</li>
  <li><strong>오퍼</strong>: 원하는 가격을 제시</li>
</ul>

<h2>NFT 가치 판단 기준</h2>
<ul>
  <li><strong>팀</strong>: 개발팀의 실력과 신뢰도</li>
  <li><strong>커뮤니티</strong>: 디스코드/트위터 활성도</li>
  <li><strong>유틸리티</strong>: NFT로 뭘 할 수 있는지</li>
  <li><strong>희귀도</strong>: 특성(Trait)의 희소성</li>
  <li><strong>거래량</strong>: 활발히 거래되는지</li>
</ul>

<h2>NFT 리스크</h2>
<h3>1. 러그풀</h3>
<p>돈을 받고 프로젝트 팀이 사라지는 것. 신생 프로젝트 주의.</p>

<h3>2. 유동성 문제</h3>
<p>팔고 싶어도 사는 사람이 없으면 못 팜. 인기 없는 NFT는 가치 0.</p>

<h3>3. 저작권 문제</h3>
<p>NFT를 소유해도 저작권은 별개. 상업적 사용 조건 확인 필요.</p>

<h3>4. 스캠</h3>
<p>가짜 컬렉션, 피싱 사이트 주의. 항상 공식 링크 확인.</p>

<h2>NFT 안전 거래 팁</h2>
<ul>
  <li>공식 트위터/디스코드에서 링크 확인</li>
  <li>Verified 마크 있는 컬렉션 우선</li>
  <li>거래 내역, 홀더 수 확인</li>
  <li>FOMO에 휩쓸리지 않기</li>
  <li>투자금은 잃어도 되는 금액으로</li>
</ul>

<h2>마무리</h2>
<p>NFT 시장은 아직 초기 단계로 기회와 리스크가 공존합니다. 충분히 공부하고, 소액으로 시작하고, 사기를 조심하세요!</p>
`,
  },
  {
    slug: 'crypto-tax-guide-korea',
    title: '암호화폐 세금 가이드 - 한국 투자자 필독',
    description: '코인 세금이 어떻게 부과되는지, 신고는 어떻게 하는지, 절세 방법은 뭔지 알려드립니다.',
    category: 'tax',
    readTime: 6,
    updatedAt: '2026-02-06',
    content: `
<h2>한국 암호화폐 과세 현황</h2>
<p><strong>2025년 1월 1일부터</strong> 암호화폐 양도차익에 대해 과세가 시작되었습니다 (여러 차례 유예 후 시행).</p>

<h2>과세 대상</h2>
<ul>
  <li>암호화폐 매도 시 발생한 이익</li>
  <li>암호화폐 간 교환으로 발생한 이익</li>
  <li>스테이킹, 에어드랍 등으로 받은 코인</li>
</ul>

<h2>세율과 공제</h2>
<ul>
  <li><strong>세율</strong>: 22% (소득세 20% + 지방소득세 2%)</li>
  <li><strong>기본공제</strong>: 연 250만원</li>
  <li><strong>과세 방식</strong>: 분리과세 (다른 소득과 합산 안 됨)</li>
</ul>

<h3>계산 예시</h3>
<p>연간 코인 매매 이익이 1,000만원인 경우:</p>
<ul>
  <li>과세표준: 1,000만원 - 250만원 = 750만원</li>
  <li>세금: 750만원 × 22% = 165만원</li>
</ul>

<h2>손익 계산 방법</h2>
<h3>취득가액 산정</h3>
<p><strong>이동평균법</strong>을 사용합니다. 같은 코인을 여러 번 샀다면 평균 단가로 계산.</p>

<h3>계산 예시</h3>
<ol>
  <li>1차 매수: 비트코인 0.1개 × 5,000만원 = 500만원</li>
  <li>2차 매수: 비트코인 0.1개 × 6,000만원 = 600만원</li>
  <li>평균 취득가: (500만원 + 600만원) / 0.2개 = 5,500만원/개</li>
  <li>0.1개를 7,000만원에 매도 → 이익 = 700만원 - 550만원 = 150만원</li>
</ol>

<h2>신고 방법</h2>
<h3>신고 기간</h3>
<p>매년 5월 1일 ~ 5월 31일 (종합소득세 신고 기간)</p>

<h3>신고 절차</h3>
<ol>
  <li>거래소에서 거래내역 다운로드</li>
  <li>연간 손익 계산</li>
  <li>홈택스에서 신고서 작성</li>
  <li>세금 납부</li>
</ol>

<h2>거래소별 거래내역 받기</h2>
<ul>
  <li><strong>업비트</strong>: 마이페이지 → 거래내역 → 엑셀 다운로드</li>
  <li><strong>빗썸</strong>: 자산 → 거래내역 → 다운로드</li>
  <li><strong>해외 거래소</strong>: 각 거래소 API 또는 수동 다운로드</li>
</ul>

<h2>절세 팁</h2>
<h3>1. 250만원 기본공제 활용</h3>
<p>이익이 250만원 이하면 세금 0원. 매년 조금씩 익절하는 전략.</p>

<h3>2. 손실 상계</h3>
<p>이익 난 코인과 손실 난 코인을 같은 해에 정리하면 손익 상계.</p>

<h3>3. 장기 보유</h3>
<p>매매하지 않으면 과세 대상 아님. 필요할 때만 매도.</p>

<h3>4. 증여 활용</h3>
<p>가족에게 증여 후 매도하면 취득가 리셋 (증여세 한도 내에서).</p>

<h2>주의사항</h2>
<ul>
  <li><strong>해외 거래소도 신고 대상</strong>: 바이낸스 등 해외 거래도 포함</li>
  <li><strong>DeFi 거래도 과세</strong>: 스왑, 파밍 등 모든 이익</li>
  <li><strong>미신고 시 가산세</strong>: 무신고 20%, 과소신고 10%</li>
  <li><strong>거래내역 보관</strong>: 5년간 보관 의무</li>
</ul>

<h2>세금 계산 도구</h2>
<ul>
  <li><strong>코인라이</strong>: 거래내역 자동 계산</li>
  <li><strong>텍스대시</strong>: 다양한 거래소 지원</li>
  <li><strong>업비트 세금신고 도우미</strong>: 업비트 전용</li>
</ul>

<h2>마무리</h2>
<p>암호화폐 세금은 복잡하지만, 피할 수 없습니다. 거래내역을 잘 정리하고, 필요하면 세무사 상담을 받으세요. 정직한 신고가 장기적으로 유리합니다!</p>

<p><em>* 이 글은 일반적인 정보 제공 목적이며, 정확한 세금 상담은 세무사에게 받으세요.</em></p>
`,
  },
  {
    slug: 'market-making-guide',
    title: '마켓메이킹(MM) 완전 정복 가이드',
    description: '마켓메이킹이 무엇인지, 어떻게 수익을 내는지, 개인이 MM 봇을 운영하는 방법까지 설명합니다.',
    category: 'trading',
    readTime: 10,
    updatedAt: '2026-02-07',
    content: `
<h2>마켓메이킹이란?</h2>
<p>마켓메이킹(Market Making)은 <strong>매수 주문과 매도 주문을 동시에 걸어서 스프레드(가격 차이)로 수익을 내는 전략</strong>입니다. 쉽게 말해 "싸게 사서 비싸게 팔기"를 자동으로 반복하는 것입니다.</p>

<h3>예시로 이해하기</h3>
<ul>
  <li>BTC 현재가: $100,000</li>
  <li>매수 주문: $99,950에 걸어둠</li>
  <li>매도 주문: $100,050에 걸어둠</li>
  <li>둘 다 체결되면 → $100 수익 (스프레드)</li>
</ul>

<h2>MM이 중요한 이유</h2>
<p>거래소에 유동성을 제공합니다. MM이 없으면 주문이 체결되지 않고, 슬리피지가 커져서 일반 트레이더도 손해를 봅니다. 그래서 많은 DEX가 MM에게 인센티브(리베이트, 에어드랍 포인트)를 제공합니다.</p>

<h3>MM 수익 구조</h3>
<ul>
  <li><strong>스프레드 수익</strong>: 매수-매도 가격 차이</li>
  <li><strong>리베이트</strong>: 거래소가 유동성 공급자에게 주는 수수료 할인</li>
  <li><strong>에어드랍/포인트</strong>: DEX 토큰 에어드랍 기대</li>
</ul>

<h2>MM의 리스크</h2>
<p>가격이 급변할 때 한쪽 주문만 체결되면 손실이 발생합니다. 이를 <strong>인벤토리 리스크</strong>라고 합니다.</p>

<h3>주요 리스크</h3>
<ul>
  <li><strong>인벤토리 리스크</strong>: 한쪽만 체결 → 가격 역행 시 손실</li>
  <li><strong>급변동 리스크</strong>: 뉴스, 대형 거래 시 가격 급등락</li>
  <li><strong>기술 리스크</strong>: 봇 오류, 네트워크 장애</li>
  <li><strong>자금 리스크</strong>: 거래소 해킹, 스마트 컨트랙트 버그</li>
</ul>

<h2>MM 봇 기본 구조</h2>
<p>간단한 MM 봇은 다음과 같은 루프를 돌립니다:</p>
<ol>
  <li>현재 가격 조회</li>
  <li>스프레드 계산 (보통 0.1~0.5%)</li>
  <li>매수/매도 주문 배치</li>
  <li>체결 확인 및 포지션 관리</li>
  <li>리스크 체크 (손실 한도, 포지션 크기)</li>
  <li>반복</li>
</ol>

<h2>MM 타이밍 지표</h2>
<p>MM은 변동성이 적당할 때 가장 효과적입니다. 너무 변동성이 크면 인벤토리 리스크가 커지고, 너무 작으면 스프레드가 좁아져 수익이 적습니다.</p>
<ul>
  <li><strong>ATR(Average True Range)</strong>: 평균 변동폭 → 낮을수록 MM에 유리</li>
  <li><strong>스프레드</strong>: 매수-매도 차이 → 넓을수록 수익 기회</li>
  <li><strong>거래량</strong>: 충분한 유동성 → 높을수록 체결 확률 증가</li>
  <li><strong>추세 강도</strong>: 횡보장 → MM에 최적, 추세장 → 리스크 증가</li>
</ul>

<h2>개인 MM 전략</h2>
<h3>1. 에어드랍 파밍 MM</h3>
<p>신규 DEX에서 거래량을 만들어 에어드랍 포인트를 쌓는 전략입니다. 수익보다는 에어드랍 토큰이 목적입니다.</p>

<h3>2. 수동 MM</h3>
<p>봇 없이 직접 양방향 주문을 걸어 관리하는 방식입니다. 소규모로 시작하기 좋습니다.</p>

<h3>3. 그리드 트레이딩</h3>
<p>일정 가격 간격으로 여러 매수/매도 주문을 배치하는 방식입니다. 단순하지만 효과적입니다.</p>

<h2>MM 봇 개발 로드맵</h2>
<ol>
  <li><strong>Phase 1</strong>: JavaScript/API 기초 학습</li>
  <li><strong>Phase 2</strong>: 거래소 API 연동 (주문, 잔고 조회)</li>
  <li><strong>Phase 3</strong>: 테스트넷에서 봇 실행</li>
  <li><strong>Phase 4</strong>: 리스크 관리 + 메인넷 배포</li>
</ol>

<h2>마무리</h2>
<p>MM은 단순해 보이지만 리스크 관리가 핵심입니다. 소액으로 시작하고, 반드시 손실 한도를 설정하세요. 에어드랍 파밍 목적이라면 비용 대비 기대 보상을 꼼꼼히 계산해야 합니다.</p>
`,
  },
  {
    slug: 'funding-rate-arbitrage',
    title: '펀딩비 차익거래 완전 가이드',
    description: '펀딩비가 무엇인지, 어떻게 차익거래에 활용하는지, 실전 전략과 리스크까지 상세 설명합니다.',
    category: 'trading',
    readTime: 12,
    updatedAt: '2026-02-07',
    content: `
<h2>펀딩비란?</h2>
<p>펀딩비(Funding Rate)는 <strong>무기한 선물 시장에서 롱/숏 포지션 간에 주기적으로 교환하는 수수료</strong>입니다. 선물 가격을 현물 가격에 가깝게 유지하는 메커니즘입니다.</p>

<h3>펀딩비 작동 원리</h3>
<ul>
  <li><strong>양수(+)</strong>: 롱이 숏에게 지불 → 시장이 과열(롱이 많음)</li>
  <li><strong>음수(-)</strong>: 숏이 롱에게 지불 → 시장이 공포(숏이 많음)</li>
  <li>보통 8시간마다 정산 (Binance, Hyperliquid 등)</li>
</ul>

<h2>펀딩비 차익거래란?</h2>
<p>같은 코인에 대해 <strong>한쪽은 롱, 한쪽은 숏</strong>을 잡아서 가격 변동 위험 없이 펀딩비 차이만 수익으로 가져가는 전략입니다. 이를 <strong>델타뉴트럴(Delta Neutral)</strong> 전략이라고 합니다.</p>

<h3>예시</h3>
<ul>
  <li>Binance BTC 펀딩비: +0.03% (8시간당)</li>
  <li>Hyperliquid BTC 펀딩비: -0.01% (8시간당)</li>
  <li>스프레드: 0.04%</li>
  <li>Binance에서 숏(펀딩비 수취) + Hyperliquid에서 롱(펀딩비 수취)</li>
  <li>양쪽에서 펀딩비 수취 → 가격 변동 무관 수익</li>
</ul>

<h2>수익률 계산</h2>
<p>펀딩비 스프레드가 0.01%이고 하루 3번 정산된다면:</p>
<ul>
  <li>일 수익률: 0.01% × 3 = 0.03%</li>
  <li>월 수익률: 0.03% × 30 = 0.9%</li>
  <li>연 수익률: 0.03% × 365 = <strong>10.95%</strong></li>
</ul>
<p>리스크가 낮은 전략치고는 상당히 높은 수익률입니다.</p>

<h2>필요한 준비물</h2>
<ol>
  <li><strong>2개 이상 거래소 계정</strong>: Binance, Hyperliquid, Bybit 등</li>
  <li><strong>양쪽 거래소에 자금 분배</strong></li>
  <li><strong>펀딩비 모니터링 도구</strong></li>
  <li><strong>포지션 관리 스크립트</strong> (선택)</li>
</ol>

<h2>실전 전략</h2>
<h3>1. 단일 거래소 vs 다중 거래소</h3>
<p>같은 거래소에서 현물 롱 + 선물 숏이 가장 간단합니다. 다중 거래소는 자금 이동이 필요하지만 더 높은 스프레드를 찾을 수 있습니다.</p>

<h3>2. 진입/퇴장 타이밍</h3>
<ul>
  <li>스프레드가 0.01% 이상일 때 진입</li>
  <li>스프레드가 축소되거나 역전되면 퇴장</li>
  <li>정산 시각 직전에 포지션 조정하지 말 것</li>
</ul>

<h3>3. 코인 선택</h3>
<p>유동성이 높고 펀딩비 변동이 큰 코인이 좋습니다. BTC, ETH가 가장 안전하며, 알트코인은 수익률은 높지만 리스크도 큽니다.</p>

<h2>리스크 관리</h2>
<ul>
  <li><strong>청산 리스크</strong>: 한쪽 포지션이 청산되면 델타뉴트럴이 깨짐 → 레버리지를 낮게 설정</li>
  <li><strong>수수료</strong>: 거래 수수료가 펀딩비 수익을 초과하면 손해</li>
  <li><strong>자금 이동 시간</strong>: 거래소 간 자금 전송 중 기회 소멸 가능</li>
  <li><strong>거래소 리스크</strong>: 거래소 해킹, 출금 정지 등</li>
</ul>

<h2>자동화 도구</h2>
<p>펀딩비 차익거래는 자동화하면 효율적입니다:</p>
<ul>
  <li>펀딩비 모니터링 봇 (실시간 스프레드 계산)</li>
  <li>텔레그램 알림 (기회 발생 시 알림)</li>
  <li>자동 포지션 오픈/클로즈 (고급)</li>
</ul>

<h2>마무리</h2>
<p>펀딩비 차익거래는 코인 가격 방향에 베팅하지 않는 안전한 전략입니다. 하지만 "무위험"이 아니므로, 레버리지 관리와 수수료 계산을 철저히 해야 합니다. 소액으로 시작하여 경험을 쌓으세요.</p>
`,
  },
  {
    slug: 'onchain-analysis-guide',
    title: '온체인 분석 입문 가이드',
    description: '블록체인 데이터를 분석하여 시장을 읽는 온체인 분석의 기초를 배웁니다.',
    category: 'trading',
    readTime: 9,
    updatedAt: '2026-02-07',
    content: `
<h2>온체인 분석이란?</h2>
<p>온체인 분석은 <strong>블록체인에 기록된 실제 거래 데이터</strong>를 분석하여 시장 동향을 파악하는 방법입니다. 차트 분석(기술적 분석)과 달리, 실제 자금 흐름을 볼 수 있다는 장점이 있습니다.</p>

<h2>왜 온체인 분석이 중요한가?</h2>
<p>차트에는 나타나지 않는 정보를 볼 수 있습니다:</p>
<ul>
  <li>고래들이 코인을 축적하고 있는지, 매도하고 있는지</li>
  <li>거래소로 대량 입금 = 매도 압박 신호</li>
  <li>거래소에서 대량 출금 = 장기 보유(홀드) 신호</li>
  <li>새로운 지갑 생성 증가 = 신규 투자자 유입</li>
</ul>

<h2>핵심 온체인 지표</h2>

<h3>1. 거래소 잔고 (Exchange Balance)</h3>
<p>거래소에 보관된 코인 수량입니다. 잔고가 줄어들면 홀더들이 코인을 빼서 장기 보유하는 것이므로 긍정적 신호입니다.</p>

<h3>2. 고래 활동 (Whale Activity)</h3>
<p>대량 보유자(고래)의 움직임은 시장에 큰 영향을 줍니다. 고래가 거래소로 코인을 보내면 매도 가능성이 높습니다.</p>

<h3>3. 활성 주소 수 (Active Addresses)</h3>
<p>하루 동안 거래에 참여한 고유 주소 수입니다. 증가 추세면 네트워크 사용이 늘고 있다는 의미입니다.</p>

<h3>4. NUPL (Net Unrealized Profit/Loss)</h3>
<p>전체 보유자의 미실현 손익 비율입니다. 높으면 과열(매도 시점), 낮으면 공포(매수 시점)를 나타냅니다.</p>

<h3>5. SOPR (Spent Output Profit Ratio)</h3>
<p>사용된 코인의 수익률입니다. 1 이상이면 수익 실현, 1 미만이면 손실 매도를 의미합니다.</p>

<h2>온체인 분석 도구</h2>
<ul>
  <li><strong>Glassnode</strong>: 가장 포괄적인 온체인 데이터 (유료)</li>
  <li><strong>CryptoQuant</strong>: 한국 팀이 만든 분석 도구 (일부 무료)</li>
  <li><strong>Dune Analytics</strong>: 커스텀 쿼리 가능 (무료)</li>
  <li><strong>Etherscan</strong>: 이더리움 트랜잭션 조회 (무료)</li>
  <li><strong>Whale Alert</strong>: 대규모 이체 알림 (무료 봇)</li>
</ul>

<h2>실전 활용법</h2>

<h3>고래 지갑 추적</h3>
<ol>
  <li>유명 고래 지갑 주소 확보 (Etherscan, Arkham 등)</li>
  <li>지갑 모니터링 설정 (Whale Alert, 자체 봇)</li>
  <li>대량 이체 발생 시 방향 분석</li>
  <li>거래소 입금 = 매도 준비, 거래소 출금 = 홀드</li>
</ol>

<h3>공포/탐욕과 결합</h3>
<p>온체인 데이터와 공포탐욕지수를 함께 보면 더 정확합니다:</p>
<ul>
  <li>극단적 공포 + 거래소 출금 증가 = 강한 매수 시그널</li>
  <li>극단적 탐욕 + 거래소 입금 증가 = 강한 매도 시그널</li>
</ul>

<h2>주의사항</h2>
<ul>
  <li>온체인 데이터도 후행 지표일 수 있음</li>
  <li>하나의 지표만으로 판단하지 말 것</li>
  <li>고래의 움직임이 항상 방향성을 의미하지는 않음 (단순 지갑 정리일 수도)</li>
</ul>

<h2>마무리</h2>
<p>온체인 분석은 "시장의 엑스레이"입니다. 차트가 보여주지 않는 내부를 들여다볼 수 있습니다. 무료 도구부터 시작해서 점차 분석 능력을 키워보세요!</p>
`,
  },
  {
    slug: 'solana-beginners-guide',
    title: '솔라나(SOL) 초보자 가이드 2026',
    description: '솔라나 블록체인의 특징, 생태계, 지갑 설정부터 DeFi 활용까지 초보자를 위한 완벽 가이드입니다.',
    category: 'beginner',
    readTime: 8,
    updatedAt: '2026-02-07',
    content: `
<h2>솔라나란?</h2>
<p>솔라나는 <strong>초당 수천 건의 거래를 처리할 수 있는 고성능 블록체인</strong>입니다. 이더리움의 느린 속도와 비싼 수수료 문제를 해결하기 위해 만들어졌습니다. 거래 수수료가 $0.001 미만으로 매우 저렴합니다.</p>

<h3>솔라나의 장점</h3>
<ul>
  <li><strong>빠른 속도</strong>: 블록 생성 400ms, 확정 수초</li>
  <li><strong>저렴한 수수료</strong>: 거래당 $0.001 미만</li>
  <li><strong>높은 처리량</strong>: 초당 수천 TPS</li>
  <li><strong>활발한 생태계</strong>: DeFi, NFT, 밈코인, 게임 등</li>
</ul>

<h2>솔라나 지갑 설정</h2>
<h3>추천 지갑</h3>
<ul>
  <li><strong>Phantom</strong>: 가장 인기 있는 솔라나 지갑 (브라우저 확장/모바일)</li>
  <li><strong>Solflare</strong>: 스테이킹 기능이 강한 지갑</li>
  <li><strong>Backpack</strong>: xNFT 지원 차세대 지갑</li>
</ul>

<h3>Phantom 지갑 시작하기</h3>
<ol>
  <li>phantom.app 접속 → 브라우저 확장 설치</li>
  <li>"새 지갑 만들기" 선택</li>
  <li><strong>시드 구문 12개 단어 반드시 백업!</strong> (종이에 적어 보관)</li>
  <li>비밀번호 설정 → 완료</li>
</ol>

<h2>SOL 구매 및 전송</h2>
<ol>
  <li>업비트 등 거래소에서 SOL 구매</li>
  <li>Phantom 지갑 주소 복사 (SOL 주소)</li>
  <li>거래소에서 출금 → Phantom 주소로 전송</li>
  <li>약 1분 내 도착 (전송비 약 $0.01)</li>
</ol>

<h2>솔라나 DeFi 생태계</h2>

<h3>DEX (탈중앙 거래소)</h3>
<ul>
  <li><strong>Jupiter</strong>: 솔라나 최대 DEX 집계기 (최적 가격 제공)</li>
  <li><strong>Raydium</strong>: AMM 기반 DEX</li>
  <li><strong>Orca</strong>: 사용하기 쉬운 DEX</li>
</ul>

<h3>스테이킹</h3>
<p>SOL을 스테이킹하면 연 6~8% 수익을 얻을 수 있습니다:</p>
<ul>
  <li><strong>네이티브 스테이킹</strong>: Phantom에서 직접 검증자에게 위임</li>
  <li><strong>리퀴드 스테이킹</strong>: Marinade(mSOL), Jito(jitoSOL) 사용 → 스테이킹하면서 DeFi에도 활용 가능</li>
</ul>

<h3>밈코인</h3>
<p>솔라나는 밈코인의 중심지입니다. pump.fun, Moonshot 등에서 새 밈코인이 매일 수천 개 생성됩니다. 대부분 0이 되지만, 가끔 대박이 나기도 합니다. 투기 자산이므로 잃어도 되는 돈만 투자하세요.</p>

<h2>솔라나 NFT</h2>
<p>Magic Eden이 솔라나 최대 NFT 마켓플레이스입니다. 이더리움 NFT보다 훨씬 저렴하게 거래할 수 있습니다.</p>

<h2>솔라나의 단점</h2>
<ul>
  <li><strong>네트워크 장애 이력</strong>: 과거 여러 차례 다운타임 발생</li>
  <li><strong>중앙화 논란</strong>: 검증자 하드웨어 요구사항이 높아 참여 장벽 존재</li>
  <li><strong>밈코인 사기 많음</strong>: 러그풀, 스캠 주의</li>
</ul>

<h2>마무리</h2>
<p>솔라나는 빠르고 저렴한 블록체인으로, 다양한 DeFi와 NFT를 경험하기 좋습니다. Phantom 지갑 설치 후 소액으로 생태계를 탐험해보세요!</p>
`,
  },
  {
    slug: 'layer2-comparison-guide',
    title: '이더리움 레이어2 비교 가이드 2026',
    description: 'Arbitrum, Optimism, zkSync, Base 등 주요 L2 체인의 특징, 수수료, 생태계를 비교 분석합니다.',
    category: 'beginner',
    readTime: 10,
    updatedAt: '2026-02-07',
    content: `
<h2>레이어2(L2)란?</h2>
<p>레이어2는 <strong>이더리움 위에 구축된 확장 네트워크</strong>입니다. 이더리움의 보안은 그대로 활용하면서, 속도는 빠르고 수수료는 저렴합니다. 이더리움이 "고속도로"라면, L2는 그 위에 추가된 "고가도로"입니다.</p>

<h2>L2가 필요한 이유</h2>
<ul>
  <li>이더리움 메인넷 가스비: $5~$50+ (피크 시)</li>
  <li>L2 가스비: $0.01~$0.50</li>
  <li>처리 속도: 메인넷 15 TPS → L2 수천 TPS</li>
</ul>

<h2>주요 L2 비교</h2>

<h3>Arbitrum</h3>
<ul>
  <li><strong>타입</strong>: Optimistic Rollup</li>
  <li><strong>TVL</strong>: L2 중 1위</li>
  <li><strong>토큰</strong>: ARB</li>
  <li><strong>특징</strong>: 가장 큰 DeFi 생태계, GMX가 대표 프로젝트</li>
  <li><strong>수수료</strong>: $0.10~$0.30</li>
  <li><strong>추천</strong>: DeFi 유저</li>
</ul>

<h3>Optimism</h3>
<ul>
  <li><strong>타입</strong>: Optimistic Rollup</li>
  <li><strong>토큰</strong>: OP</li>
  <li><strong>특징</strong>: OP Stack으로 Superchain 생태계 구축, Coinbase Base의 기반</li>
  <li><strong>수수료</strong>: $0.05~$0.20</li>
  <li><strong>추천</strong>: 생태계 확장성 중시하는 유저</li>
</ul>

<h3>Base</h3>
<ul>
  <li><strong>타입</strong>: Optimistic Rollup (OP Stack)</li>
  <li><strong>토큰</strong>: 없음 (Coinbase 운영)</li>
  <li><strong>특징</strong>: Coinbase가 운영, 미국 규제 친화적, 쉬운 온보딩</li>
  <li><strong>수수료</strong>: $0.01~$0.10</li>
  <li><strong>추천</strong>: 초보자, Coinbase 유저</li>
</ul>

<h3>zkSync</h3>
<ul>
  <li><strong>타입</strong>: ZK-Rollup</li>
  <li><strong>토큰</strong>: ZK</li>
  <li><strong>특징</strong>: 영지식 증명 기술, Account Abstraction 네이티브 지원</li>
  <li><strong>수수료</strong>: $0.05~$0.25</li>
  <li><strong>추천</strong>: 기술 관심 유저</li>
</ul>

<h3>StarkNet</h3>
<ul>
  <li><strong>타입</strong>: ZK-Rollup (STARK 증명)</li>
  <li><strong>토큰</strong>: STRK</li>
  <li><strong>특징</strong>: Cairo 프로그래밍 언어, 독자적 기술 스택</li>
  <li><strong>수수료</strong>: $0.01~$0.15</li>
  <li><strong>추천</strong>: 개발자, 기술 얼리어답터</li>
</ul>

<h2>L2 선택 가이드</h2>
<ul>
  <li><strong>DeFi 위주</strong> → Arbitrum (가장 풍부한 생태계)</li>
  <li><strong>초보자</strong> → Base (쉬운 접근, 저렴한 수수료)</li>
  <li><strong>에어드랍 기대</strong> → 새로운 L2 프로젝트 탐색</li>
  <li><strong>기술 관심</strong> → zkSync, StarkNet (ZK 기술)</li>
</ul>

<h2>L2로 자산 옮기기 (브리지)</h2>
<ol>
  <li>이더리움 메인넷에 ETH 준비</li>
  <li>공식 브리지 또는 제3자 브리지(Orbiter, Across 등) 사용</li>
  <li>원하는 L2 네트워크 선택</li>
  <li>전송 (보통 1~15분 소요)</li>
</ol>
<p><strong>주의</strong>: 항상 공식 브리지를 사용하고, 소액으로 먼저 테스트하세요.</p>

<h2>마무리</h2>
<p>L2는 이더리움의 미래입니다. 이미 많은 DeFi 활동이 L2로 이동했으며, 점점 더 가속화될 것입니다. 여러 L2를 소액으로 경험해보면서 자신에게 맞는 체인을 찾아보세요!</p>
`,
  },
  {
    slug: 'crypto-security-guide',
    title: '암호화폐 보안 완벽 가이드',
    description: '지갑 보안, 피싱 방지, 시드 구문 관리 등 암호화폐 자산을 안전하게 지키는 방법을 알려드립니다.',
    category: 'security',
    readTime: 11,
    updatedAt: '2026-02-07',
    content: `
<h2>왜 보안이 중요한가?</h2>
<p>암호화폐는 <strong>은행처럼 되돌릴 수 없습니다</strong>. 한 번 해킹당하면 코인을 되찾을 방법이 거의 없습니다. "본인이 은행"이므로 보안도 본인 책임입니다.</p>

<h3>흔한 피해 사례</h3>
<ul>
  <li>피싱 사이트에서 시드 구문 입력 → 전액 탈취</li>
  <li>가짜 에어드랍 승인 → 토큰 무단 전송</li>
  <li>화면 캡처 앱에 시드 구문 노출</li>
  <li>거래소 해킹 (Mt. Gox, FTX 등)</li>
</ul>

<h2>시드 구문(복구 문구) 관리</h2>
<p>시드 구문은 지갑의 마스터 키입니다. <strong>절대 디지털로 보관하지 마세요.</strong></p>

<h3>하면 안 되는 것</h3>
<ul>
  <li>스크린샷 찍기</li>
  <li>메모 앱에 저장</li>
  <li>클라우드(iCloud, Google Drive)에 업로드</li>
  <li>카카오톡/텔레그램으로 전송</li>
  <li>사진으로 찍어 저장</li>
</ul>

<h3>올바른 보관법</h3>
<ul>
  <li><strong>종이에 적기</strong>: 방수/방화 봉투에 보관</li>
  <li><strong>금속 플레이트</strong>: 화재에도 안전 (Cryptosteel, Billfodl)</li>
  <li><strong>2곳 이상 분산 보관</strong>: 집 + 다른 안전한 장소</li>
  <li><strong>가족에게 위치 알려두기</strong>: 비상시를 대비</li>
</ul>

<h2>피싱 방지</h2>
<p>암호화폐 사기의 80%가 피싱입니다.</p>

<h3>피싱 유형</h3>
<ul>
  <li><strong>가짜 사이트</strong>: URL이 미세하게 다름 (uniswap.org → un1swap.org)</li>
  <li><strong>가짜 에어드랍</strong>: "무료 토큰 클레임" → 지갑 승인 시 자산 탈취</li>
  <li><strong>가짜 고객센터</strong>: 디스코드/텔레그램에서 DM으로 접근</li>
  <li><strong>가짜 앱</strong>: 앱스토어의 짝퉁 지갑 앱</li>
</ul>

<h3>방지 방법</h3>
<ul>
  <li><strong>북마크 사용</strong>: 자주 쓰는 사이트는 반드시 북마크로 접속</li>
  <li><strong>URL 확인</strong>: 접속 전 도메인 꼼꼼히 확인</li>
  <li><strong>DM 무시</strong>: 디스코드/텔레그램 DM으로 오는 것은 99% 사기</li>
  <li><strong>시드 구문 요구 = 100% 사기</strong></li>
  <li><strong>무료 에어드랍 의심</strong>: 공식 채널에서 확인</li>
</ul>

<h2>지갑 보안 단계</h2>

<h3>Level 1: 기본 (초보자)</h3>
<ul>
  <li>MetaMask/Phantom에 소액만 보관</li>
  <li>시드 구문 종이에 백업</li>
  <li>2FA(구글 인증) 활성화 (거래소)</li>
</ul>

<h3>Level 2: 중급</h3>
<ul>
  <li>하드웨어 지갑(Ledger) 구매 → 대부분 자산 보관</li>
  <li>핫월렛에는 당장 사용할 금액만 보관</li>
  <li>토큰 승인(Approve) 정기적으로 취소 (Revoke.cash)</li>
</ul>

<h3>Level 3: 고급</h3>
<ul>
  <li>멀티시그 지갑 (Safe) 사용</li>
  <li>별도 기기에서만 지갑 사용</li>
  <li>하드웨어 키(YubiKey) 사용</li>
</ul>

<h2>거래소 보안</h2>
<ul>
  <li>2FA 반드시 활성화 (SMS보다 Google Authenticator 추천)</li>
  <li>출금 주소 화이트리스트 설정</li>
  <li>거래소에 장기 보관하지 않기 ("Not your keys, not your coins")</li>
  <li>대형 거래소 이용 (Binance, Coinbase, 업비트 등)</li>
</ul>

<h2>토큰 승인(Approve) 관리</h2>
<p>DeFi 사용 시 토큰 사용 승인을 줍니다. 이 승인이 남아있으면 해당 컨트랙트가 언제든 토큰을 가져갈 수 있습니다.</p>
<ul>
  <li><strong>Revoke.cash</strong>: 불필요한 승인 취소</li>
  <li>승인 시 "Unlimited" 대신 필요한 금액만 승인</li>
  <li>사용 후 바로 승인 취소하는 습관</li>
</ul>

<h2>마무리</h2>
<p>보안은 "한 번 설정하면 끝"이 아닙니다. 꾸준히 관리해야 합니다. 하드웨어 지갑 하나 구매하는 것만으로도 보안 수준이 크게 올라갑니다. 자산 크기와 관계없이 기본 보안은 반드시 지키세요!</p>
`,
  },
  {
    slug: 'defi-yield-strategy',
    title: 'DeFi 수익 전략 가이드 2026',
    description: '스테이킹, 유동성 공급, 이자 농사 등 DeFi에서 수익을 내는 다양한 전략을 비교 분석합니다.',
    category: 'defi',
    readTime: 11,
    updatedAt: '2026-02-07',
    content: `
<h2>DeFi 수익의 종류</h2>
<p>DeFi에서 수익을 내는 방법은 크게 4가지입니다. 각각 리스크와 수익률이 다르므로 자신에 맞는 전략을 선택하세요.</p>

<h2>1. 스테이킹 (Staking)</h2>
<p>코인을 네트워크에 예치하여 보상을 받는 가장 기본적인 방법입니다.</p>

<h3>대표 프로토콜</h3>
<ul>
  <li><strong>Lido (stETH)</strong>: 이더리움 리퀴드 스테이킹 → 연 3~4%</li>
  <li><strong>Marinade (mSOL)</strong>: 솔라나 리퀴드 스테이킹 → 연 6~7%</li>
  <li><strong>Jito (jitoSOL)</strong>: MEV 수익 포함 솔라나 스테이킹 → 연 7~8%</li>
</ul>

<h3>장점과 단점</h3>
<ul>
  <li>장점: 간단하고 안전, 원금 손실 리스크 낮음</li>
  <li>단점: 수익률이 상대적으로 낮음</li>
</ul>

<h2>2. 유동성 공급 (Liquidity Providing)</h2>
<p>DEX에 토큰 쌍을 예치하여 거래 수수료를 받는 방법입니다.</p>

<h3>작동 원리</h3>
<ol>
  <li>ETH와 USDC를 50:50으로 풀에 예치</li>
  <li>트레이더가 이 풀에서 거래할 때마다 수수료 발생</li>
  <li>예치한 비율만큼 수수료를 분배받음</li>
</ol>

<h3>비영구적 손실 (Impermanent Loss)</h3>
<p>유동성 공급의 가장 큰 리스크입니다. 예치한 두 토큰의 가격 비율이 크게 변하면, 그냥 들고 있었을 때보다 손해를 볼 수 있습니다.</p>
<ul>
  <li>가격 변동 ±25% → 약 0.6% 손실</li>
  <li>가격 변동 ±50% → 약 2.0% 손실</li>
  <li>가격 변동 ±100% → 약 5.7% 손실</li>
</ul>
<p>스테이블코인 쌍(USDC/USDT)은 비영구적 손실이 거의 없습니다.</p>

<h3>추천 풀</h3>
<ul>
  <li><strong>스테이블코인 쌍</strong>: USDC/USDT (연 5~15%, 저위험)</li>
  <li><strong>메이저 쌍</strong>: ETH/USDC (연 10~30%, 중위험)</li>
  <li><strong>변동성 높은 쌍</strong>: 밈코인/SOL (연 50%+, 고위험)</li>
</ul>

<h2>3. 렌딩 (Lending)</h2>
<p>코인을 빌려주고 이자를 받는 방법입니다.</p>

<h3>대표 프로토콜</h3>
<ul>
  <li><strong>Aave</strong>: 이더리움 기반 최대 렌딩 프로토콜</li>
  <li><strong>Compound</strong>: 이더리움 렌딩의 원조</li>
  <li><strong>Kamino</strong>: 솔라나 렌딩 프로토콜</li>
</ul>

<h3>수익률</h3>
<ul>
  <li>스테이블코인: 연 3~10% (수요에 따라 변동)</li>
  <li>ETH, SOL: 연 1~5%</li>
</ul>

<h2>4. 이자 농사 (Yield Farming)</h2>
<p>프로토콜이 제공하는 추가 토큰 보상까지 합쳐서 수익을 극대화하는 전략입니다.</p>

<h3>원리</h3>
<p>유동성 공급 수수료 + 프로토콜 토큰 보상 = 높은 APY</p>

<h3>주의사항</h3>
<ul>
  <li>APY가 100%+인 곳은 보상 토큰 가격이 급락할 수 있음</li>
  <li>새로운 프로토콜은 스마트 컨트랙트 리스크 존재</li>
  <li>"TV에 나오면 팔아라" - 너무 유명해지면 수익률이 급감</li>
</ul>

<h2>리스크별 전략 추천</h2>

<h3>보수적 (연 5~10%)</h3>
<p>스테이블코인 렌딩 + ETH 스테이킹. 원금 손실 리스크 최소화.</p>

<h3>중도 (연 10~25%)</h3>
<p>리퀴드 스테이킹 + 메이저 쌍 LP. 적당한 수익과 리스크의 균형.</p>

<h3>공격적 (연 25%+)</h3>
<p>이자 농사 + 레버리지 스테이킹. 높은 수익 가능하지만 원금 손실 리스크도 큼.</p>

<h2>마무리</h2>
<p>DeFi 수익 전략은 "높은 수익 = 높은 리스크"가 기본 원칙입니다. 처음에는 안전한 스테이킹부터 시작하고, 경험이 쌓이면 점차 다양한 전략을 시도하세요. 절대 전 재산을 한 프로토콜에 넣지 마세요!</p>
`,
  },
  {
    slug: 'trading-psychology-guide',
    title: '트레이딩 심리학 가이드',
    description: 'FOMO, 패닉셀, 확증편향 등 트레이딩에서 흔히 저지르는 심리적 실수와 극복법을 알려드립니다.',
    category: 'trading',
    readTime: 9,
    updatedAt: '2026-02-07',
    content: `
<h2>왜 트레이딩 심리가 중요한가?</h2>
<p>트레이딩에서 기술적 분석보다 더 중요한 것이 <strong>심리 관리</strong>입니다. 아무리 좋은 전략도 감정에 휩쓸리면 무용지물이 됩니다. 대부분의 손실은 잘못된 분석이 아니라 잘못된 심리에서 옵니다.</p>

<h2>흔한 심리적 함정</h2>

<h3>1. FOMO (Fear Of Missing Out)</h3>
<p>"나만 빠진 것 같은 두려움"입니다.</p>
<ul>
  <li>코인이 급등하면 뒤늦게 매수 → 고점에 물림</li>
  <li>SNS에서 남들 수익 인증 → 조급한 진입</li>
</ul>
<p><strong>극복법</strong>: 매수 전 "이 가격에 팔 사람이 나에게 파는 것"임을 기억. 항상 진입 전 계획을 세우고 지키기.</p>

<h3>2. 패닉셀 (Panic Selling)</h3>
<p>가격이 급락하면 공포에 매도하는 행동입니다.</p>
<ul>
  <li>-10% 하락에 손절 → 바로 다음 날 반등</li>
  <li>뉴스에 겁먹고 매도 → 나중에 후회</li>
</ul>
<p><strong>극복법</strong>: 매수 시 손절 라인을 미리 설정. 계획에 없는 매도는 하지 않기. 뉴스는 참고만.</p>

<h3>3. 확증편향 (Confirmation Bias)</h3>
<p>자기 생각에 맞는 정보만 찾고, 반대 의견은 무시하는 경향입니다.</p>
<ul>
  <li>BTC 매수 후 → 상승 전망 기사만 읽음</li>
  <li>하락 경고 → "그 사람은 항상 비관적이야"</li>
</ul>
<p><strong>극복법</strong>: 의도적으로 반대 의견 찾아보기. "내가 틀릴 수 있다"를 전제로 분석.</p>

<h3>4. 매몰비용 오류 (Sunk Cost Fallacy)</h3>
<p>이미 잃은 돈 때문에 더 나쁜 결정을 하는 것입니다.</p>
<ul>
  <li>"이미 50% 손실인데 팔 수 없어" → 더 큰 손실</li>
  <li>"물타기 하면 평균 단가가 낮아지니까" → 추가 손실</li>
</ul>
<p><strong>극복법</strong>: "지금 이 코인을 보유하고 있지 않다면, 이 가격에 살 것인가?" 자문하기.</p>

<h3>5. 과도한 자신감 (Overconfidence)</h3>
<p>연속 수익 후 "나는 천재다"라고 착각하는 것입니다.</p>
<ul>
  <li>레버리지를 점점 높임</li>
  <li>리스크 관리를 소홀히 함</li>
  <li>큰 한 방으로 이전 수익 모두 날림</li>
</ul>
<p><strong>극복법</strong>: 수익이 나도 전략을 바꾸지 않기. "운인지 실력인지" 냉정하게 판단.</p>

<h2>감정 관리 실전 팁</h2>

<h3>트레이딩 일지 작성</h3>
<ul>
  <li>매매 이유, 감정 상태, 결과를 기록</li>
  <li>패턴 발견: "화나면 무리한 매매를 한다" 등</li>
  <li>감정적 매매를 객관적으로 돌아볼 수 있음</li>
</ul>

<h3>규칙 기반 매매</h3>
<ul>
  <li>진입 조건, 퇴장 조건, 손절/익절 라인을 미리 정함</li>
  <li>규칙에 맞지 않으면 절대 매매하지 않음</li>
  <li>감정이 아닌 시스템으로 판단</li>
</ul>

<h3>자금 관리</h3>
<ul>
  <li>전체 자산의 1~2%만 한 번에 리스크</li>
  <li>잃어도 되는 돈으로만 트레이딩</li>
  <li>"올인"은 절대 금물</li>
</ul>

<h2>워렌 버핏의 명언</h2>
<p><em>"다른 사람이 탐욕스러울 때 두려워하고, 다른 사람이 두려워할 때 탐욕스러워라."</em></p>
<p>이 한 문장이 트레이딩 심리의 핵심입니다. 대중과 반대로 움직일 수 있는 심리적 강인함이 성공적인 투자의 열쇠입니다.</p>

<h2>마무리</h2>
<p>트레이딩은 기술 50%, 심리 50%입니다. 차트 분석을 배우는 만큼 자신의 심리도 공부하세요. 감정에 지면 시장에도 집니다. 차분하게, 규칙대로, 꾸준히!</p>
`,
  },
  {
    slug: 'crypto-portfolio-guide',
    title: '암호화폐 포트폴리오 구성 가이드',
    description: '자산 배분, 리밸런싱, 분산투자 전략으로 안정적인 크립토 포트폴리오를 만드는 방법을 알려드립니다.',
    category: 'beginner',
    readTime: 8,
    updatedAt: '2026-02-07',
    content: `
<h2>왜 포트폴리오 관리가 필요한가?</h2>
<p>"달걀을 한 바구니에 담지 마라"는 투자의 가장 기본 원칙입니다. 한 코인에 올인하면 그 코인이 무너질 때 전부 잃습니다. <strong>분산투자</strong>로 리스크를 줄이면서 수익을 추구하는 것이 현명합니다.</p>

<h2>자산 배분 원칙</h2>

<h3>코어-새틀라이트 전략</h3>
<p>포트폴리오를 핵심(코어)과 위성(새틀라이트)으로 나눕니다:</p>
<ul>
  <li><strong>코어 (60~70%)</strong>: BTC + ETH → 안정적인 대형 코인</li>
  <li><strong>새틀라이트 (20~30%)</strong>: SOL, AVAX, LINK 등 → 성장 기대</li>
  <li><strong>스페큘레이션 (5~10%)</strong>: 밈코인, 신규 프로젝트 → 고위험 고수익</li>
</ul>

<h3>투자 금액별 추천 배분</h3>
<ul>
  <li><strong>$1,000 이하</strong>: BTC 50% + ETH 30% + 알트 20%</li>
  <li><strong>$1,000~$10,000</strong>: BTC 40% + ETH 25% + 알트 25% + 밈 10%</li>
  <li><strong>$10,000+</strong>: BTC 35% + ETH 20% + 알트 30% + DeFi 10% + 밈 5%</li>
</ul>

<h2>코인 선택 기준</h2>

<h3>체크리스트</h3>
<ol>
  <li><strong>시가총액</strong>: TOP 30 이내가 상대적으로 안전</li>
  <li><strong>팀</strong>: 실명 공개, 이력 확인 가능</li>
  <li><strong>기술</strong>: 실제 작동하는 제품이 있는지</li>
  <li><strong>커뮤니티</strong>: 활발한 개발자/사용자 커뮤니티</li>
  <li><strong>토크노믹스</strong>: 총 발행량, 유통량, 인플레이션율</li>
  <li><strong>사용 사례</strong>: 실제 문제를 해결하고 있는지</li>
</ol>

<h2>리밸런싱</h2>
<p>시간이 지나면 가격 변동으로 비중이 달라집니다. 정기적으로 원래 비중으로 조정하는 것이 리밸런싱입니다.</p>

<h3>리밸런싱 방법</h3>
<ul>
  <li><strong>시간 기반</strong>: 매월/매분기마다 한 번</li>
  <li><strong>임계값 기반</strong>: 비중이 5% 이상 벗어나면 조정</li>
</ul>

<h3>예시</h3>
<p>BTC 50% / ETH 30% / SOL 20%로 시작했는데, BTC가 급등하여 BTC 65% / ETH 20% / SOL 15%가 되었다면 → BTC 일부 매도, ETH/SOL 매수하여 원래 비중으로 복구</p>

<h2>DCA (Dollar Cost Averaging)</h2>
<p><strong>정기 적립식 투자</strong>입니다. 매주/매월 일정 금액을 투자하여 평균 매입가를 낮추는 전략입니다.</p>
<ul>
  <li>타이밍을 맞출 필요 없음</li>
  <li>고점에 올인하는 실수 방지</li>
  <li>장기적으로 시장 평균 수익률 달성</li>
  <li>감정적 매매 방지</li>
</ul>

<h2>포트폴리오 추적 도구</h2>
<ul>
  <li><strong>CoinGecko Portfolio</strong>: 무료, 간편</li>
  <li><strong>Delta</strong>: 모바일 앱, 거래소 연동</li>
  <li><strong>Zerion</strong>: DeFi 포지션 자동 추적</li>
  <li><strong>직접 만들기</strong>: 스프레드시트 또는 코딩으로 커스텀 대시보드</li>
</ul>

<h2>흔한 실수</h2>
<ul>
  <li><strong>100개 코인에 분산</strong>: 관리 불가능, 10개 이내가 적당</li>
  <li><strong>수익난 코인만 남김</strong>: 승자를 너무 일찍 팔고 패자를 안 팜</li>
  <li><strong>뉴스에 반응</strong>: 장기 계획 없이 뉴스마다 매매</li>
  <li><strong>리밸런싱 안 함</strong>: 비중 방치 → 리스크 집중</li>
</ul>

<h2>마무리</h2>
<p>좋은 포트폴리오는 "잘 때도 편안한 포트폴리오"입니다. 급등에도 급락에도 흔들리지 않는 배분을 찾으세요. BTC + ETH 코어에 관심 있는 알트코인을 소량 추가하는 것부터 시작하면 됩니다!</p>
`,
  },
  {
    slug: 'restaking-guide',
    title: '리스테이킹(Restaking) 완벽 가이드 2026',
    description: 'EigenLayer, Kelp, Puffer 등 리스테이킹 프로토콜의 원리와 참여 방법을 설명합니다.',
    category: 'defi',
    readTime: 10,
    updatedAt: '2026-02-07',
    content: `
<h2>리스테이킹이란?</h2>
<p>리스테이킹은 <strong>이미 스테이킹한 ETH를 다른 서비스의 보안에도 활용</strong>하여 추가 수익을 얻는 방법입니다. 하나의 자산으로 여러 곳에서 보상을 받을 수 있어 자본 효율이 높습니다.</p>

<h3>비유로 이해하기</h3>
<p>은행에 예금(스테이킹)해서 이자를 받으면서, 동시에 그 예금증서를 다른 곳에 담보로 맡겨 추가 이자를 받는 것과 비슷합니다.</p>

<h2>EigenLayer: 리스테이킹의 핵심</h2>
<p>EigenLayer는 리스테이킹의 선두주자로, 이더리움 보안을 다른 서비스(AVS, Actively Validated Services)에 공유합니다.</p>

<h3>작동 원리</h3>
<ol>
  <li>ETH를 Lido 등에서 스테이킹 → stETH 수령</li>
  <li>stETH를 EigenLayer에 리스테이킹</li>
  <li>EigenLayer가 여러 AVS에 보안 제공</li>
  <li>AVS로부터 추가 보상 수령</li>
</ol>

<h3>AVS란?</h3>
<p>Actively Validated Services의 약자로, 이더리움의 보안을 빌려쓰는 서비스입니다:</p>
<ul>
  <li>오라클 네트워크</li>
  <li>데이터 가용성 레이어</li>
  <li>브릿지 보안</li>
  <li>롤업 시퀀서</li>
</ul>

<h2>리퀴드 리스테이킹 (LRT)</h2>
<p>EigenLayer에 직접 리스테이킹하면 자산이 잠기지만, 리퀴드 리스테이킹 프로토콜을 사용하면 유동성을 유지할 수 있습니다.</p>

<h3>주요 LRT 프로토콜</h3>
<ul>
  <li><strong>EtherFi (eETH/weETH)</strong>: 가장 큰 LRT, TVL 최대</li>
  <li><strong>Kelp DAO (rsETH)</strong>: 다양한 LST 지원</li>
  <li><strong>Puffer Finance (pufETH)</strong>: 소규모 검증자도 참여 가능</li>
  <li><strong>Renzo (ezETH)</strong>: 간편한 리스테이킹</li>
</ul>

<h2>참여 방법 (단계별)</h2>

<h3>방법 1: 직접 리스테이킹</h3>
<ol>
  <li>ETH 준비 (이더리움 메인넷)</li>
  <li>Lido에서 스테이킹 → stETH 수령</li>
  <li>EigenLayer에 stETH 예치</li>
  <li>오퍼레이터(검증자) 선택</li>
</ol>

<h3>방법 2: LRT 사용 (추천)</h3>
<ol>
  <li>ETH 준비</li>
  <li>EtherFi, Kelp 등에서 원클릭 리스테이킹</li>
  <li>LRT 토큰(weETH, rsETH 등) 수령</li>
  <li>LRT를 DeFi에서 추가 활용 가능</li>
</ol>

<h2>수익 구조</h2>
<ul>
  <li><strong>Layer 1</strong>: 이더리움 스테이킹 보상 (연 3~4%)</li>
  <li><strong>Layer 2</strong>: EigenLayer AVS 보상 (변동)</li>
  <li><strong>Layer 3</strong>: LRT 프로토콜 포인트/에어드랍</li>
  <li><strong>Layer 4</strong>: LRT 토큰을 DeFi에 활용 (추가 수익)</li>
</ul>
<p>여러 레이어의 보상을 동시에 받아 <strong>총 수익률이 기본 스테이킹보다 훨씬 높을 수 있습니다</strong>.</p>

<h2>리스크</h2>

<h3>1. 슬래싱 리스크</h3>
<p>검증자가 잘못하면 스테이킹한 ETH의 일부가 삭감됩니다. 리스테이킹은 여러 서비스에 보안을 제공하므로 슬래싱 리스크도 중복됩니다.</p>

<h3>2. 스마트 컨트랙트 리스크</h3>
<p>여러 프로토콜을 중첩하므로, 하나라도 취약점이 있으면 자금이 위험합니다.</p>

<h3>3. 유동성 리스크</h3>
<p>LRT 토큰이 ETH와 1:1 가치를 유지하지 못할 수 있습니다 (디페깅).</p>

<h3>4. 포인트 파밍의 불확실성</h3>
<p>포인트가 토큰으로 전환될 때 기대에 못 미칠 수 있습니다.</p>

<h2>마무리</h2>
<p>리스테이킹은 DeFi의 새로운 트렌드로, 자본 효율을 극대화할 수 있습니다. 하지만 리스크도 중첩되므로, 전체 자산의 일부만 투자하고 신뢰할 수 있는 프로토콜을 선택하세요. 소액으로 시작하여 구조를 이해한 뒤 비중을 늘리는 것이 안전합니다!</p>
`,
  },
];
