import { fetchTFTData } from "@/lib/tft-api";
import ChampionsClient from "./ChampionsClient";

// 빌드 시 정적 생성 대신 요청마다 서버 렌더링 (CDragon 32MB 캐시 이슈 회피)
export const dynamic = 'force-dynamic';

export default async function ChampionsPage() {
  const { champions, traits } = await fetchTFTData();
  return <ChampionsClient champions={champions} traits={traits} />;
}
