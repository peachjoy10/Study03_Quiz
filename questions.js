// 상식 퀴즈 문항 데이터. 형식은 PRD.md 4.1, 작성 규칙은 PRD.md 4.2를 따른다.
const QUESTIONS = [
  // ===== 한국사 =====
  {
    id: "kh-01",
    category: "한국사",
    question: "1443년 훈민정음을 창제한 조선의 왕은?",
    choices: ["세종", "태종", "세조", "성종"],
    answer: 0,
    explanation: "세종은 1443년 겨울 훈민정음을 창제했고, 1446년 해설서인 해례본이 간행되었다.",
    source: { name: "한국민족문화대백과사전 「훈민정음」", url: "https://encykorea.aks.ac.kr/Article/E0065805" }
  },
  {
    id: "kh-02",
    category: "한국사",
    question: "918년 고려를 건국한 인물은?",
    choices: ["궁예", "왕건", "견훤", "경순왕"],
    answer: 1,
    explanation: "고려는 918년 개성 출신 왕건이 세운 왕조로, 936년 후삼국을 통합했다.",
    source: { name: "한국민족문화대백과사전 「태조(고려)」", url: "https://encykorea.aks.ac.kr/Article/E0059032" }
  },
  {
    id: "kh-03",
    category: "한국사",
    question: "1592년 한산도 대첩에서 학익진을 펼쳐 일본 수군을 무찌른 조선의 장수는?",
    choices: ["이순신", "권율", "김시민", "곽재우"],
    answer: 0,
    explanation: "1592년 7월 이순신은 한산섬 앞바다에서 학익진으로 일본 수군 주력을 무찔렀다.",
    source: { name: "한국민족문화대백과사전 「한산도대첩」", url: "https://encykorea.aks.ac.kr/Article/E0061676" }
  },
  {
    id: "kh-04",
    category: "한국사",
    question: "팔만대장경을 보관하는 건물인 장경판전이 있는 사찰은?",
    choices: ["불국사", "해인사", "송광사", "통도사"],
    answer: 1,
    explanation: "합천 해인사 장경판전은 팔만대장경을 보관하는 건물로, 1962년 국보로 지정되었다.",
    source: { name: "한국민족문화대백과사전 「합천 해인사 장경판전」", url: "https://encykorea.aks.ac.kr/Article/E0062725" }
  },
  {
    id: "kh-05",
    category: "한국사",
    question: "고구려의 시조로, 동명성왕으로 불리는 인물은?",
    choices: ["온조", "박혁거세", "주몽", "김수로"],
    answer: 2,
    explanation: "고구려의 시조 동명성왕은 주몽으로, 기원전 37년부터 기원전 19년까지 다스렸다.",
    source: { name: "한국민족문화대백과사전 「동명성왕」", url: "https://encykorea.aks.ac.kr/Article/E0016431" }
  },
  {
    id: "kh-06",
    category: "한국사",
    question: "1392년 조선을 세우고 제1대 왕(태조)이 된 인물은?",
    choices: ["정도전", "이성계", "최영", "정몽주"],
    answer: 1,
    explanation: "조선 태조의 이름은 이성계로, 1392년부터 1398년까지 조선의 제1대 왕으로 재위했다.",
    source: { name: "한국민족문화대백과사전 「태조(조선)」", url: "https://encykorea.aks.ac.kr/Article/E0059033" }
  },
  {
    id: "kh-07",
    category: "한국사",
    question: "사도세자의 묘를 화산(지금의 화성시)으로 옮기고, 1796년 수원 화성을 완성한 조선의 왕은?",
    choices: ["영조", "정조", "숙종", "순조"],
    answer: 1,
    explanation: "정조는 사도세자의 묘를 화산으로 옮겼고, 수원 화성은 1796년에 축성되었다.",
    source: { name: "한국민족문화대백과사전 「수원 화성」", url: "https://encykorea.aks.ac.kr/Article/E0064671" }
  },
  {
    id: "kh-08",
    category: "한국사",
    question: "1894년 고부에서 봉기를 이끌었고 '녹두장군'으로 불린 동학 농민군 지도자는?",
    choices: ["전봉준", "최제우", "김옥균", "홍경래"],
    answer: 0,
    explanation: "전봉준은 1894년 고부 군수 조병갑의 탐학에 맞서 농민을 모아 봉기한 동학 지도자다.",
    source: { name: "한국민족문화대백과사전 「전봉준」", url: "https://encykorea.aks.ac.kr/Article/E0049437" }
  },
  {
    id: "kh-09",
    category: "한국사",
    question: "1919년 대한민국 임시정부가 처음 자리 잡은 도시는?",
    choices: ["충칭", "상하이", "베이징", "난징"],
    answer: 1,
    explanation: "임시정부는 1919년부터 1932년까지 상하이에 있었고, 옮겨 다닌 끝에 1940년 충칭에 자리 잡았다.",
    source: { name: "한국민족문화대백과사전 「대한민국임시정부의정원 문서」", url: "https://encykorea.aks.ac.kr/Article/E0015020" }
  },
  {
    id: "kh-10",
    category: "한국사",
    question: "1145년 고려 인종의 명을 받아 『삼국사기』를 편찬한 인물은?",
    choices: ["일연", "김부식", "정도전", "이규보"],
    answer: 1,
    explanation: "김부식은 1145년 인종의 명을 받아 50권으로 된 『삼국사기』를 편찬해 바쳤다.",
    source: { name: "한국민족문화대백과사전 「김부식」", url: "https://encykorea.aks.ac.kr/Article/E0009275" }
  },

  // ===== 세계지리 =====
  {
    id: "wg-01",
    category: "세계지리",
    question: "지구의 대양 가운데 면적이 가장 넓은 대양은?",
    choices: ["대서양", "인도양", "태평양", "북극해"],
    answer: 2,
    explanation: "태평양은 지구 표면의 약 3분의 1을 차지하며, 면적이 대서양의 두 배에 이른다.",
    source: { name: "브리태니커 「Pacific Ocean」", url: "https://www.britannica.com/place/Pacific-Ocean" }
  },
  {
    id: "wg-02",
    category: "세계지리",
    question: "오스트레일리아의 수도는?",
    choices: ["시드니", "멜버른", "캔버라", "퍼스"],
    answer: 2,
    explanation: "캔버라는 오스트레일리아 남동부 수도 특별 지역에 있는 연방 수도로, 시드니 남서쪽에 있다.",
    source: { name: "브리태니커 「Canberra」", url: "https://www.britannica.com/place/Canberra" }
  },
  {
    id: "wg-03",
    category: "세계지리",
    question: "나일강이 흘러들어 가는 바다는?",
    choices: ["홍해", "지중해", "아라비아해", "흑해"],
    answer: 1,
    explanation: "나일강은 적도 남쪽에서 시작해 아프리카 북동부를 지나 지중해로 흘러든다.",
    source: { name: "브리태니커 「Nile River」", url: "https://www.britannica.com/place/Nile-River" }
  },
  {
    id: "wg-04",
    category: "세계지리",
    question: "안데스산맥이 있는 대륙은?",
    choices: ["남아메리카", "북아메리카", "아프리카", "오세아니아"],
    answer: 0,
    explanation: "안데스산맥은 남아메리카 남쪽 끝에서 북쪽 카리브해 연안까지 끊이지 않고 이어진다.",
    source: { name: "브리태니커 「Andes Mountains」", url: "https://www.britannica.com/place/Andes-Mountains" }
  },
  {
    id: "wg-05",
    category: "세계지리",
    question: "캐나다의 수도는?",
    choices: ["토론토", "밴쿠버", "몬트리올", "오타와"],
    answer: 3,
    explanation: "오타와는 온타리오주 남동부, 오타와강 남쪽 기슭에 있는 캐나다의 수도다.",
    source: { name: "브리태니커 「Ottawa」", url: "https://www.britannica.com/place/Ottawa" }
  },
  {
    id: "wg-06",
    category: "세계지리",
    question: "이집트의 수도는?",
    choices: ["알렉산드리아", "카이로", "룩소르", "아스완"],
    answer: 1,
    explanation: "카이로는 이집트의 수도로, 1,000년 넘게 나일강 기슭의 같은 자리에 있어 왔다.",
    source: { name: "브리태니커 「Cairo」", url: "https://www.britannica.com/place/Cairo" }
  },
  {
    id: "wg-07",
    category: "세계지리",
    question: "에베레스트산이 속한 산맥은?",
    choices: ["알프스산맥", "히말라야산맥", "안데스산맥", "로키산맥"],
    answer: 1,
    explanation: "에베레스트산은 히말라야산맥에 있으며, 네팔과 중국의 국경에 솟아 있다.",
    source: { name: "브리태니커 「Mount Everest」", url: "https://www.britannica.com/place/Mount-Everest" }
  },
  {
    id: "wg-08",
    category: "세계지리",
    question: "브라질 사람들이 주로 쓰는 언어는?",
    choices: ["스페인어", "포르투갈어", "프랑스어", "영어"],
    answer: 1,
    explanation: "브라질에서는 포르투갈어가 나라 전체에서 쓰이며, 여러 원주민 언어도 남아 있다.",
    source: { name: "브리태니커 「Brazil」", url: "https://www.britannica.com/place/Brazil" }
  },
  {
    id: "wg-09",
    category: "세계지리",
    question: "아마존강이 대서양으로 흘러드는 하구가 있는 나라는?",
    choices: ["페루", "콜롬비아", "브라질", "베네수엘라"],
    answer: 2,
    explanation: "아마존강은 안데스산맥에서 시작해 브라질 북동부 해안에서 대서양으로 흘러든다.",
    source: { name: "브리태니커 「Amazon River」", url: "https://www.britannica.com/place/Amazon-River" }
  },
  {
    id: "wg-10",
    category: "세계지리",
    question: "튀르키예의 수도는?",
    choices: ["이스탄불", "앙카라", "이즈미르", "안탈리아"],
    answer: 1,
    explanation: "앙카라는 튀르키예의 수도로, 나라의 북서부 내륙에 있으며 흑해의 남쪽에 자리한다.",
    source: { name: "브리태니커 「Ankara」", url: "https://www.britannica.com/place/Ankara" }
  },

  // ===== 과학 =====
  {
    id: "sc-01",
    category: "과학",
    question: "원소 기호 Fe로 나타내는 원소는?",
    choices: ["철", "불소", "납", "금"],
    answer: 0,
    explanation: "철(Fe)은 원자 번호 26인 금속 원소로, 지구 지각의 약 5%를 차지한다.",
    source: { name: "브리태니커 「iron」", url: "https://www.britannica.com/science/iron-chemical-element" }
  },
  {
    id: "sc-02",
    category: "과학",
    question: "태양계 행성 가운데 태양에 가장 가까운 행성은?",
    choices: ["금성", "수성", "화성", "지구"],
    answer: 1,
    explanation: "수성은 태양에 가장 가깝고 가장 작은 행성으로, 88일마다 태양을 한 바퀴 돈다.",
    source: { name: "NASA 「Mercury」", url: "https://science.nasa.gov/mercury/" }
  },
  {
    id: "sc-03",
    category: "과학",
    question: "식물이 빛 에너지를 이용해 물과 이산화탄소로 양분을 만드는 과정은?",
    choices: ["광합성", "호흡", "증산 작용", "발효"],
    answer: 0,
    explanation: "광합성은 빛 에너지로 물과 이산화탄소를 산소와 에너지가 많은 유기물로 바꾼다.",
    source: { name: "브리태니커 「photosynthesis」", url: "https://www.britannica.com/science/photosynthesis" }
  },
  {
    id: "sc-04",
    category: "과학",
    question: "제임스 왓슨 등과 함께 DNA의 분자 구조를 밝혀 1962년 노벨상을 받은 영국 과학자는?",
    choices: ["프랜시스 크릭", "로절린드 프랭클린", "찰스 다윈", "그레고어 멘델"],
    answer: 0,
    explanation: "크릭은 왓슨, 윌킨스와 함께 DNA 분자 구조를 밝힌 공로로 1962년 노벨상을 받았다.",
    source: { name: "브리태니커 「Francis Crick」", url: "https://www.britannica.com/biography/Francis-Crick" }
  },
  {
    id: "sc-05",
    category: "과학",
    question: "1905년 특수 상대성 이론을 내놓은 물리학자는?",
    choices: ["아이작 뉴턴", "알베르트 아인슈타인", "닐스 보어", "갈릴레오 갈릴레이"],
    answer: 1,
    explanation: "특수 상대성 이론은 아인슈타인이 1905년에 구상했으며, 양자역학과 함께 현대 물리학의 중심이다.",
    source: { name: "브리태니커 「special relativity」", url: "https://www.britannica.com/science/special-relativity" }
  },
  {
    id: "sc-06",
    category: "과학",
    question: "사람 몸에서 펌프처럼 혈액을 순환시키는 기관은?",
    choices: ["폐", "심장", "간", "콩팥"],
    answer: 1,
    explanation: "심장은 혈액을 순환시키는 펌프 기관으로, 사람의 심장은 두 폐 사이에 있다.",
    source: { name: "브리태니커 「heart」", url: "https://www.britannica.com/science/heart" }
  },
  {
    id: "sc-07",
    category: "과학",
    question: "해수면 높이에서 물이 끓는 온도는 섭씨 몇 도인가?",
    choices: ["0°C", "50°C", "80°C", "100°C"],
    answer: 3,
    explanation: "해수면에서 물은 섭씨 100도(화씨 212도)에서 끓고, 높은 곳에서는 끓는점이 낮아진다.",
    source: { name: "브리태니커 「boiling point」", url: "https://www.britannica.com/science/boiling-point" }
  },
  {
    id: "sc-08",
    category: "과학",
    question: "원소를 원자량 순으로 배열해 주기율표를 만들고, 빈칸에 들어갈 원소의 성질까지 예측한 러시아 화학자는?",
    choices: ["멘델레예프", "라부아지에", "돌턴", "퀴리"],
    answer: 0,
    explanation: "멘델레예프는 원소를 원자량 순으로 배열해 주기성을 찾고, 빈칸에 들어갈 원소를 예측했다.",
    source: { name: "브리태니커 「Dmitri Mendeleev」", url: "https://www.britannica.com/biography/Dmitri-Mendeleev" }
  },
  {
    id: "sc-09",
    category: "과학",
    question: "지구 대기의 약 5분의 4를 차지하는 기체는?",
    choices: ["산소", "질소", "아르곤", "이산화탄소"],
    answer: 1,
    explanation: "질소는 색과 냄새가 없는 기체로, 지구 대기의 약 5분의 4를 차지한다.",
    source: { name: "브리태니커 「nitrogen」", url: "https://www.britannica.com/science/nitrogen" }
  },
  {
    id: "sc-10",
    category: "과학",
    question: "1928년 페니실린을 발견한 과학자는?",
    choices: ["알렉산더 플레밍", "루이 파스퇴르", "로베르트 코흐", "에드워드 제너"],
    answer: 0,
    explanation: "스코틀랜드의 세균학자 플레밍은 1928년 페니실린을 발견해 항생제 시대를 열었다.",
    source: { name: "브리태니커 「Alexander Fleming」", url: "https://www.britannica.com/biography/Alexander-Fleming" }
  },

  // ===== 예술과 문화 =====
  {
    id: "ac-01",
    category: "예술과 문화",
    question: "「모나리자」를 그린 화가는?",
    choices: ["레오나르도 다빈치", "미켈란젤로", "라파엘로", "보티첼리"],
    answer: 0,
    explanation: "「모나리자」는 레오나르도 다빈치가 피렌체에 머물던 때 그린 유화로, 파리 루브르 박물관에 있다.",
    source: { name: "브리태니커 「Mona Lisa」", url: "https://www.britannica.com/topic/Mona-Lisa-painting" }
  },
  {
    id: "ac-02",
    category: "예술과 문화",
    question: "1889년 「별이 빛나는 밤」을 그린 화가는?",
    choices: ["폴 고갱", "빈센트 반 고흐", "클로드 모네", "폴 세잔"],
    answer: 1,
    explanation: "반 고흐는 1889년 6월 프랑스 생레미의 요양원 창밖 풍경을 바탕으로 이 그림을 그렸다.",
    source: { name: "뉴욕 현대미술관(MoMA) 「The Starry Night」", url: "https://www.moma.org/collection/works/79802" }
  },
  {
    id: "ac-03",
    category: "예술과 문화",
    question: "성악과 기악을 결합한 교향곡 9번 '합창'을 작곡한 음악가는?",
    choices: ["베토벤", "모차르트", "바흐", "브람스"],
    answer: 0,
    explanation: "베토벤은 교향곡 9번에서 성악과 기악을 그전에 없던 방식으로 결합했다.",
    source: { name: "브리태니커 「Ludwig van Beethoven」", url: "https://www.britannica.com/biography/Ludwig-van-Beethoven" }
  },
  {
    id: "ac-04",
    category: "예술과 문화",
    question: "희곡 『로미오와 줄리엣』을 쓴 작가는?",
    choices: ["괴테", "셰익스피어", "몰리에르", "디킨스"],
    answer: 1,
    explanation: "『로미오와 줄리엣』은 셰익스피어의 희곡으로, 몬터규 집안과 캐풀렛 집안의 젊은 연인 이야기다.",
    source: { name: "브리태니커 「Romeo and Juliet」", url: "https://www.britannica.com/topic/Romeo-and-Juliet" }
  },
  {
    id: "ac-05",
    category: "예술과 문화",
    question: "「서당」, 「씨름」 등이 실린 『풍속도 화첩』을 그린 조선 후기 화가는?",
    choices: ["신윤복", "김홍도", "정선", "안견"],
    answer: 1,
    explanation: "김홍도의 『풍속도 화첩』은 풍속화 25점으로 이루어지며, 「서당」, 「씨름」 등이 실려 있다.",
    source: { name: "한국민족문화대백과사전 「김홍도 필 풍속도 화첩」", url: "https://encykorea.aks.ac.kr/Article/E0013639" }
  },
  {
    id: "ac-06",
    category: "예술과 문화",
    question: "'추사체'를 완성한 조선 후기의 학자이자 서화가는?",
    choices: ["한석봉", "김정희", "정약용", "박지원"],
    answer: 1,
    explanation: "김정희는 조선 금석학파를 세우고 추사체를 완성했으며, 「세한도」를 그렸다.",
    source: { name: "한국민족문화대백과사전 「김정희」", url: "https://encykorea.aks.ac.kr/Article/E0010428" }
  },
  {
    id: "ac-07",
    category: "예술과 문화",
    question: "오페라 「마술피리」를 작곡한 음악가는?",
    choices: ["모차르트", "베르디", "푸치니", "바그너"],
    answer: 0,
    explanation: "「마술피리」는 모차르트의 마지막 오페라로, 1791년 9월 빈 근교에서 처음 공연되었다.",
    source: { name: "브리태니커 「The Magic Flute」", url: "https://www.britannica.com/topic/The-Magic-Flute" }
  },
  {
    id: "ac-08",
    category: "예술과 문화",
    question: "소설 『돈키호테』를 쓴 작가는?",
    choices: ["단테", "세르반테스", "위고", "톨스토이"],
    answer: 1,
    explanation: "『돈키호테』는 스페인 작가 세르반테스가 1605년과 1615년 두 부분으로 펴낸 소설이다.",
    source: { name: "브리태니커 「Don Quixote」", url: "https://www.britannica.com/topic/Don-Quixote-novel" }
  },
  {
    id: "ac-09",
    category: "예술과 문화",
    question: "1893년 「절규」를 그린 화가는?",
    choices: ["구스타프 클림트", "에드바르 뭉크", "앙리 마티스", "에곤 실레"],
    answer: 1,
    explanation: "뭉크는 1893년 「절규」 두 점을 완성했고, 1895년과 1910년에도 다시 그렸다.",
    source: { name: "브리태니커 「The Scream」", url: "https://www.britannica.com/topic/The-Scream-by-Munch" }
  },
  {
    id: "ac-10",
    category: "예술과 문화",
    question: "1937년 게르니카 폭격을 계기로 대형 흑백 유화 「게르니카」를 그린 화가는?",
    choices: ["살바도르 달리", "파블로 피카소", "호안 미로", "프란시스코 고야"],
    answer: 1,
    explanation: "피카소는 1937년 독일군이 스페인 게르니카를 폭격한 뒤 이 대형 흑백 유화를 그렸다.",
    source: { name: "브리태니커 「Guernica」", url: "https://www.britannica.com/topic/Guernica-by-Picasso" }
  }
];

if (typeof module !== "undefined") module.exports = QUESTIONS;
