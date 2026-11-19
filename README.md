# 토익스피킹 모의고사 (웹)

서버 없이 브라우저만으로 돌아가는 토익스피킹 모의고사입니다.
안내 음성 → 준비 시간 → 삐 소리 → 답변 시간(녹음) 순서로 실제 시험처럼 자동 진행되고, 끝나면 내 답변을 문항별로 다시 듣거나 파일로 저장할 수 있습니다.

## 실행 방법

1. **`토익스피킹모의고사.html` 파일 하나만** 받으면 됩니다. 설치할 것도, 같이 둘 파일도 없습니다. 이 파일을 다른 사람에게 그대로 보내도 똑같이 동작합니다.
2. 파일을 **Chrome 또는 Edge**로 엽니다. (더블클릭했는데 다른 프로그램이 열리면: 파일 우클릭 → 연결 프로그램 → Chrome)
   - (`index.html` + `app.js` + `sets.js` + `photos.js` + `audio.js`는 같은 프로그램을 나눠 둔 개발용 원본입니다.)
3. ‘마이크 켜기’ → 브라우저의 마이크 허용 → ‘5초 녹음 테스트’로 소리 확인.
4. ‘시험 시작’.

### 맥(Mac)에서 쓰기
윈도우와 **같은 파일**을 그대로 씁니다. 맥용 파일을 따로 만들 필요가 없습니다.
1. 맥에 **Chrome**을 설치합니다. (맥에서 HTML 파일을 더블클릭하면 보통 Safari가 열립니다.)
2. 파일을 **우클릭(또는 control+클릭) → 다음으로 열기 → Google Chrome**.
3. 처음 ‘마이크 켜기’를 누를 때 맥이 Chrome의 마이크 접근을 물으면 **허용**합니다. 이미 거부했다면 **시스템 설정 → 개인정보 보호 및 보안 → 마이크**에서 Google Chrome을 켜고 Chrome을 다시 실행하세요.
- Safari에서도 소리가 막히지 않도록 재생 방식을 맞춰 두었지만, Safari는 이 작업 환경에서 테스트하지 못했습니다. 특히 자동 분석(음성 인식)은 Chrome 기준으로 만들었으니 맥에서도 Chrome을 권장합니다.

### 안드로이드(갤럭시 등)에서 쓰기
- 안드로이드 Chrome에서는 녹음과 실시간 음성 인식을 동시에 하면 녹음은 되지만 인식 결과가 비는 사례가 개발자 커뮤니티에 보고되어 있습니다([Stack Overflow 사례](https://stackoverflow.com/questions/25920854)). 공식 문서로 확인된 동작은 아니고, 실제 갤럭시폰에서도 같은 증상이 나왔습니다.
- 그래서 첫 화면 **‘답변 기록 방식’**에 세 가지를 두었고, 안드로이드에서 열면 **‘녹음 + 시험 후 폰 안에서 인식’**이 자동으로 선택됩니다.
  - **녹음 + 실시간 음성 인식**: PC·아이폰용. 답변하는 동안 Google 음성 인식 사용.
  - **녹음 + 시험 후 폰 안에서 인식 (안드로이드 권장)**: 답변은 녹음만 하고, 시험이 끝나면 녹음 파일을 기기 안에서 공개 음성 인식 모델 Whisper(`Xenova/whisper-tiny.en`, [transformers.js](https://www.npmjs.com/package/@huggingface/transformers) 4.3.1)로 글자로 바꿉니다. 다시 듣기와 채점이 모두 됩니다. 처음 한 번 라이브러리(jsDelivr)와 모델(Hugging Face)을 내려받아야 하며(수십 MB, 와이파이 권장), 음성은 기기 밖으로 나가지 않습니다. 인식하는 동안 ‘인식 건너뛰기’를 누르면 녹음만 보고 끝낼 수 있습니다.
  - **음성 인식만 · 녹음 안 함**: 다시 듣기 없이 채점만.
- ‘녹음 + 실시간 음성 인식’을 안드로이드에서 고르면, 녹음 중인 마이크 소리를 음성 인식에 그대로 넘기는 표준 방식([Web Speech API의 start(MediaStreamTrack)](https://webaudio.github.io/web-speech-api/))을 먼저 시도합니다. 안드로이드 Chrome이 이를 지원하는지는 확인하지 못했습니다. 지원하면 아이폰처럼 실시간으로 둘 다 되고, 지원하지 않으면 예전처럼 인식이 빌 수 있습니다.
- 녹음에는 목소리가 있는데 인식 결과가 비면 ‘무응답(0점)’이 아니라 **‘인식 실패’**로 표시하고 점수에서 뺍니다(소리 크기 기준은 자체 설정).
- 확인하지 못한 것: 실제 안드로이드 기기에서의 동작, 모델 다운로드 크기·인식에 걸리는 시간, 한국인 발음에 대한 Whisper tiny 모델의 정확도. 작업 환경에서 Hugging Face 접속이 막혀 있어, 실제 모델 대신 흉내 모델로 전체 흐름만 테스트했습니다.

### 아이폰(iPhone)에서 쓰기
아이폰에서는 받은 HTML 파일을 바로 여는 방식이 잘 안 됩니다(파일 앱은 미리보기로 열려 프로그램이 동작하지 않을 수 있음). 대신 **인터넷 주소(https)로 올려서 Safari로 여는 방식**을 쓰세요.
1. 컴퓨터에서 `아이폰용-웹사이트.zip`의 압축을 풉니다(`iphone-web` 폴더).
2. https://app.netlify.com/drop 에 `iphone-web` 폴더를 끌어다 놓습니다. 계정 없이도 `https://….netlify.app` 주소가 생깁니다. (파일 하나가 10MB를 넘으면 올리기가 멈출 수 있다고 Netlify가 안내해서, 음성 파일을 둘로 나눠 두었습니다.)
3. 아이폰 **Safari**에서 그 주소를 열고, 마이크·음성 인식 허용을 누릅니다. 공유 → ‘홈 화면에 추가’를 하면 앱처럼 쓸 수 있습니다.
- 필요 조건(공식 호환표 기준): 녹음(MediaRecorder)은 iOS 14.5 이상, 자동 분석(음성 인식)은 iOS 17 이상 Safari.
- 이 주소를 아는 사람은 누구나 열 수 있습니다. 녹음과 결과는 각자의 휴대폰 안에만 있고 서버로 올라가지 않습니다(자동 분석은 Apple의 음성 인식 기능을 쓰는데, 이때 음성이 Apple 서버로 가는지는 확인하지 못했습니다).
- 아이폰 실제 기기와 Safari에서는 테스트하지 못했습니다. 안 되는 부분이 있으면 화면을 알려 주세요.

### 마이크가 안 될 때
파일을 더블클릭해서 열었을 때 브라우저가 마이크를 막으면, 파일이 있는 폴더에서 아래 명령으로 간단한 로컬 서버를 띄워 여세요. (Python 필요)

```
python -m http.server 8000      (윈도우)
python3 -m http.server 8000     (맥: 터미널에서)
```
그 다음 브라우저 주소창에 `http://localhost:8000/토익스피킹모의고사.html` 입력.

### 질문 음성
기본 문항 세트의 안내·질문 음성은 신경망 음성 합성 모델 Kokoro-82M(Apache 2.0)으로 미리 만든 MP3를 파일 안에 넣어 두었습니다. 브라우저 내장 음성보다 사람 목소리에 가깝고, 실제 시험처럼 미국식·영국식 남녀 목소리가 섞여 나옵니다. 그래도 실제 시험 성우 녹음과 같은 목소리는 아닙니다.
- 내레이터는 미국 여성 목소리이고, Q5–7과 Q8–10은 회차마다 다른 미국·영국 남녀 목소리를 씁니다.
- 직접 추가한 문항 세트는 녹음 음성이 없어 브라우저 내장 음성으로 읽습니다.
- 실제 시험에는 캐나다·호주식 발음도 나오지만, 이 모델에는 그 억양 목소리가 없어 넣지 못했습니다.

## 시험 구성 (ETS 공식 안내로 확인한 값)

| 문항 | 유형 | 준비 | 답변 |
|---|---|---|---|
| 1–2 | Read a text aloud | 45초 | 45초 |
| 3–4 | Describe a picture | 45초 | 30초 |
| 5–7 | Respond to questions | 각 3초 | 15 / 15 / 30초 |
| 8–10 | Respond to questions using information provided | 정보 읽기 45초, 각 3초 | 15 / 15 / 30초 (10번은 두 번 들려줌) |
| 11 | Express an opinion | 45초 | 60초 |

총 11문항, 약 20분, 점수 0–200. 출처: [ETS TOEIC Speaking & Writing](https://www.ets.org/toeic/about/speaking-writing.html), [IIBC(일본 시행처) 시험 형식](https://iibc-global.org/english/toeic/test/speaking/about/format.html)

**확인하지 못한 부분(제 판단으로 만든 부분)**
- 화면 디자인: 실제 시험의 구성(상단 문항 번호, 하단 준비/답변 타이머)을 참고했지만 ETS 원본 화면을 그대로 확인할 수 없어 픽셀 단위로 같지는 않습니다.
- 안내 문구: 위 공식 시간 정보를 바탕으로 직접 쓴 문장입니다(공식 안내문 원문 아님).
- Q8–10 진행 중 표가 계속 화면에 보이는지, 타이머 이름표(READING TIME 등)는 공식 자료로 확인하지 못해 이 프로그램의 선택입니다.

## 내장 문항
`sets.js`에 자체 제작한 모의고사 **20회분**이 들어 있습니다. 첫 화면 ‘문항 세트’에서 회차를 골라 시험을 봅니다. 회차마다 문제와 사진이 모두 다릅니다.
사진 문항(Q3–4)은 실제 시험처럼 일상 장소에서 사람이 무언가 하고 있는 실제 사진 40장입니다. 모두 재배포가 허용된 CC BY 2.0 사진이며 Google Open Images 데이터셋에서 가져왔습니다. 출처는 프로그램 첫 화면 아래에도 표시됩니다.

<details><summary>사진 출처 40개</summary>

- “Market Lane Coffee” by Market Lane Coffee — https://www.flickr.com/photos/42769260@N02/4165068409
- “Scott Raecker visits with Hy-Vee employees” by The Ray Center  - CHARACTER COUNTS! — https://www.flickr.com/photos/theraycenter/8141824718
- “San Diego City College Learning Resources Center -- retrieve a book -- featuring kali” by Joe Crawford — https://www.flickr.com/photos/artlung/1625328
- “Sarah shopping at Krogers” by David Leo Veksler — https://www.flickr.com/photos/heroiclife/419596719/
- “Muslim cooker that look alike namewee” by radi ahmad — https://www.flickr.com/photos/insankamil007/7141451963
- “Cadet cut” by The U.S. Army — https://www.flickr.com/photos/soldiersmediacenter/3697626917
- “LIRR Penn Station” by Daisuke FUJII — https://www.flickr.com/photos/gleam_df/5703105558
- “Having a nice lunch at Briddlewood Winery.” by Harold Litwiler — https://www.flickr.com/photos/a_little_brighter/15159178600
- “150616-N-PO203-107” by Office of Naval Research — https://www.flickr.com/photos/usnavyresearch/20941455002
- “Riga market” by Aleksi Pihkanen — https://www.flickr.com/photos/aleksipihkanen/4703962956
- “P7250570” by Mahmut — https://www.flickr.com/photos/mahmut/4828635798
- “Ninjas em conferencia” by Marco Gomes — https://www.flickr.com/photos/marcogomes/3358203645
- “Birthday” by Thomas van de Weerd — https://www.flickr.com/photos/thms/4876504189
- “N210 NNJ at North Street, Brighton” by Matt Davis — https://www.flickr.com/photos/pics-by-mpd/5311700103
- “YMCA lounge” by Keng Susumpow — https://www.flickr.com/photos/kengz/180835846
- “tough job” by ercwttmn — https://www.flickr.com/photos/ricoslounge/119675352
- “THE LIBRARIAN LOOKS” by Media Mike Hazard — https://www.flickr.com/photos/88709139@N08/8430062408
- “Photowalk for el Albaicin” by Jeronimo Palacios — https://www.flickr.com/photos/jeronimo_palacios/15436968189
- “0N0A5489” by Chadwick Cipiti — https://www.flickr.com/photos/chadwickdc/17592331559
- “2011_07_02_Venice_033” by Doc Searls — https://www.flickr.com/photos/docsearls/5931350919
- “高雄国際空港 入国手続” by Hiro H. — https://farm1.staticflickr.com/7156/6604253845_b05fa6e77c_o.jpg
- “Salt Lake City Farmers Market” by Donghyup Ryu — https://farm1.staticflickr.com/2425/3991476283_107659a35c_o.jpg
- “Congressman Ellison chopping onions at a DC soup kitchen with Rabbi Steve Gutow (right), President and CEO of the Jewish Council for Public Affairs (JCPA)” by Keith Ellison — https://c8.staticflickr.com/2/1320/1407442643_5f5f095724_o.jpg
- “Practice Creativity Techniques” by Xavier Vergés — https://farm4.staticflickr.com/7102/7214345898_8e7c1e0dfd_o.jpg
- “Karl H. Müller (WISDOM): Visuelle Datenanalyse als sozialwissenschaftliche Methode” by FH JOANNEUM Journalismus und PR — https://c8.staticflickr.com/4/3726/11236076824_b466514084_o.jpg
- “TFDP library” by Eric James Sarmiento — https://c7.staticflickr.com/1/17/20686329_e0d73328b1_o.jpg
- “P1020572.jpg” by Scott Rubin — https://c6.staticflickr.com/8/7218/7172331523_3c30c303bc_o.jpg
- “IMG_7056” by Sen Chang — https://farm1.staticflickr.com/4104/5011313452_b647170c25_o.jpg
- “China Town, Sydney 2006” by Rob Chandler — https://c7.staticflickr.com/1/158/375125625_c595fcd5cc_o.jpg
- “Market Forces 12” by Son of Groucho — https://farm8.staticflickr.com/7530/15607749740_eeedf379d4_o.jpg
- “Photo by Nic - Motorbike taxi man” by Nic Hughes — https://farm2.staticflickr.com/8790/17780785240_3d62bb31fd_o.jpg
- “College WisCEL: evening small group” by college.library — https://farm6.staticflickr.com/8091/8595433397_e0cc4e1e30_o.jpg
- “Untitled” by Raul — https://c4.staticflickr.com/5/4009/4660155293_387723c47a_o.jpg
- “Flam railway” by Chris Walsh — https://farm7.staticflickr.com/7455/9704496110_2ed439fbf3_o.jpg
- “Jason says hydraulic fractures look like this...” by Roy Luck — https://farm4.staticflickr.com/5605/15543230406_c5e48070a8_o.jpg
- “P1000549” by Sue Manus — https://farm4.staticflickr.com/7573/15838850862_778dab339d_o.jpg
- “auto M IMG_6871” by Aberdeen Proving Ground — https://c6.staticflickr.com/9/8717/16773221447_1db4e8458a_o.jpg
- “IMG_5215” by Limarie Cabrera — https://c2.staticflickr.com/9/8184/8105089051_91b1e7cd9c_o.jpg
- “strawberry pickers” by Noborder Network — https://farm8.staticflickr.com/3085/2445605454_46a3f59191_o.jpg
- “Building a Bench” by flattop341 — https://c2.staticflickr.com/4/3269/2692546834_863ecc3efd_o.jpg

</details>

해커스·YBM 등 출판사 문항은 저작권이 있어 넣지 않았습니다. 본인이 합법적으로 받은 자료는 아래 방법으로 추가하세요.

## 내 자료 추가 (JSON)
첫 화면 ‘빈 양식(JSON) 받기’를 눌러 양식을 받고, 내용을 채운 뒤 ‘문항 세트 불러오기’로 선택합니다. 이 브라우저에 저장되어 다음에도 목록에 남습니다. 일부 파트만 넣어도 됩니다(넣은 파트만 진행).

```json
{
  "title": "해커스 무료 모의고사 1회",
  "q1": { "text": "지문" },
  "q2": { "text": "지문" },
  "q3": { "image": "images/q3.jpg" },
  "q4": { "image": "https://.../q4.jpg" },
  "q5_7": { "context": "Imagine that ...", "questions": ["Q5", "Q6", "Q7"] },
  "q8_10": {
    "info": { "title": "표 제목", "subtitle": "장소 | 날짜",
              "rows": [["9:00 A.M.", "내용"], ["10:00 A.M.", "내용"]],
              "notes": ["하단 메모"] },
    "intro": "전화 건 사람의 첫 말(선택)",
    "questions": ["Q8", "Q9", "Q10"]
  },
  "q11": { "text": "의견 질문" }
}
```
- `image`는 `index.html` 기준 상대 경로(`images/q3.jpg`), 인터넷 주소, 또는 `data:image/...;base64,...` 모두 됩니다. 상대 경로는 `images` 폴더를 만들어 사진을 넣어 두세요.
- 여러 세트를 한 파일에 넣으려면 `[ {...}, {...} ]` 처럼 배열로 감싸면 됩니다.

## 기타
- 연습 모드를 켜면 상단에 ‘다음 ▶’ 버튼이 생겨 준비/답변 시간을 건너뛸 수 있습니다. 실전처럼 하려면 끄세요.
- 녹음 파일은 내 컴퓨터 안에만 있습니다. 결과 화면을 벗어나면 사라지니 필요하면 ‘파일로 저장’하세요.

## 평가 결과 (ETS 평가 기준에 맞춘 상세 진단)
시험이 끝나면 결과 화면에 아래 내용이 나옵니다.

**1. 맨 위 종합 카드**
- 추정 레벨(Level 1~8): 전체 모의고사(11문항)를 봤을 때만 나옵니다. ETS 공식 레벨 설명과 다음 레벨 설명도 함께 보여 줍니다.
- 문항별 추정 점수(Q1–10은 0–3점, Q11은 0–5점)와 문항마다 부족했던 항목
- **점수를 올리기 위해 먼저 고칠 점**: 비중이 큰 문항(Q11 > Q5–10 > Q1–4)의 부족한 항목부터 5개

**2. 문항별 카드**
- 그 문항의 ETS 공식 평가 항목과 척도, 인식된 내 답변(글자), 추정 점수
- 잘한 항목·보완할 항목 개수
- 항목마다 ✓ 좋음 / △ 보통 / ✗ 부족 / ◇ 직접 확인과 함께 아래 내용을 보여 줍니다.
  - **결과**: 무엇이 얼마나 부족했는지(예: 현재진행형 0회, 빠진 표 정보)
  - **왜 중요한가**: 이 항목이 ETS의 어떤 평가 항목과 연결되는지
  - **잘한 점**(✓일 때) 또는 **고치는 법 + 연습법**(△·✗일 때)
- 기본 20회분에는 Q5–7 **답변 예시**와 Q8–10 **모범 답안**(표의 정보로 만든 답)이 들어 있습니다. 직접 불러온 문항 세트에서는 나오지 않습니다.
- 답변 틀(템플릿)
- 해설 중 ETS 정의를 인용한 부분(평가 항목, 억양·강세와 전달의 정의)은 공식 자료 기준이고, 예시 답안·고치는 법·연습법은 제가 만든 것입니다.

| 문항 | ETS 공식 평가 항목 | 프로그램이 점검하는 것 |
|---|---|---|
| Q1–2 지문 읽기 | 발음, 억양·강세 | 지문과 일치율(인식 안 된 단어 빨간색), 끝까지 읽었는지 / 억양·강세는 ‘직접 확인’ (나열·의문문 읽는 법 안내) |
| Q3–4 사진 묘사 | + 문법, 어휘, 일관성 | 말한 분량, 장소 소개 문장, 현재진행형(be + -ing), 위치 표현, 사람 묘사, 어휘 다양성 |
| Q5–7 질문에 답하기 | + 내용 관련성, 내용 완성도 | 질문의 핵심 단어 사용, 말한 분량, Why 질문에 이유를 말했는지, 시간·빈도 질문에 구체적인 시간을 말했는지 |
| Q8–10 정보 보고 답하기 | 위와 같음 | 표의 핵심 정보(시간·장소·이름 등)를 말했는지, Q9 잘못된 정보 정정, Q10 정보 정리 표현 |
| Q11 의견 말하기 | 위와 같음 | 입장, 이유 2개, 구체적 예시, 마무리 문장, 연결어, 분량, 어휘 다양성 |

**ETS 공식 기준에서 그대로 가져온 것** ([TOEIC Score User Guide – Speaking & Writing, 2024](https://www.eu.ets.org/content/dam/ets-org/eu/pdfs/toeic/score-user-guide-speaking-writing.pdf))
- 문항별 평가 항목: Q1–2 발음·억양/강세, Q3–4 여기에 문법·어휘·일관성 추가, Q5–11 여기에 내용 관련성·완성도 추가
- 척도: Q1–10은 0–3점, Q11은 0–5점
- 상위 난이도 문항이 총점에 더 크게 반영된다는 점
- 레벨 구간과 설명([Score Descriptors](https://www.ets.org/pdfs/toeic/toeic-speaking-writing-score-descriptors.pdf)): Level 8 190–200, 7 160–180, 6 130–150, 5 110–120, 4 80–100, 3 60–70, 2 40–50, 1 0–30

**제가 정한 것 (공식 아님)**
- ETS는 점수별 채점 기준표, 200점 환산 방법, 공부 방법 안내를 공개하지 않습니다. 그래서 점검 항목, 문항 추정 점수 계산, 레벨 계산, ‘점수를 올리려면’ 안내는 모두 제가 만든 것입니다.
- 문항 추정 점수 = 판단 가능한 점검 항목의 평균(✓ 1, △ 0.5, ✗ 0) × 만점, 말을 했으면 최소 1점. 답변 분량이 권장량(답변 시간 1초당 1.7단어)의 30% 미만이면 1점, 60% 미만이면 만점의 절반까지로 제한.
- 레벨 = 파트별 평균 득점률을 가중 평균(Q1–2 15%, Q3–4 15%, Q5–7 20%, Q8–10 20%, Q11 30%) → 200점 척도 → 위 구간. 11문항 중 6개 이상 무응답이면 Level 1.

**문법 정확성 평가 (Q3–11)** — 첫 화면 ‘문법 평가’에서 고릅니다.
- **자동 문법 검사 (기본)**: 시험이 끝나면 인식된 답변 글자를 한 번에 묶어 [LanguageTool](https://languagetool.org) 공개 API로 검사합니다. 지적된 표현과 고칠 말을 문항별로 보여 주고, 100단어당 지적 수로 판정합니다(3개 미만 ✓, 8개 미만 △, 그 이상 ✗, 지적이 1개뿐이면 최대 △ — 자체 기준). 음성 인식 결과에는 대문자·문장부호가 없어서 철자·대소문자·문장부호·문체 지적은 뺍니다.
  - 인터넷이 필요하고, 답변 글자가 LanguageTool 서버로 전송됩니다(LanguageTool 공개 API 안내: IP당 분당 20회 제한, 성능·가용성 보장 없음).
  - 음성 인식이 잘못 받아 적은 것이 문법 오류로 잡히거나, 인식 과정에서 실수가 고쳐져 놓칠 수 있습니다.
  - 검사에 실패하면(인터넷·서버 문제) 그 항목은 자동으로 자가 채점으로 바뀝니다.
- **자가 채점**: 녹음을 듣고 ✓ 좋음 / △ 보통 / ✗ 부족 버튼을 누르면 문항 점수와 레벨이 바로 다시 계산됩니다. 고르기 전에는 점수에서 빠집니다.
- 이 기능은 가짜 응답으로만 테스트했습니다. 실제 LanguageTool 서버는 작업 환경에서 접속이 막혀 있어 확인하지 못했습니다.

**음성 인식 품질 점검과 ‘녹음으로 다시 인식’**
- 실시간 인식(Google 음성 인식)은 말을 빠뜨릴 수 있습니다. 그래서 이렇게 바꿨습니다.
  - 확정되지 않은 중간 인식 결과도 모아 둡니다. 답변 시간이 끝나 말이 끊긴 마지막 문장이 사라지는 것을 막기 위해서입니다.
  - 시작 삐 소리 직전에 인식을 미리 켭니다. 인식이 켜지는 동안 첫 단어를 놓치는 것을 줄이기 위해서입니다.
- 문항 카드마다 **인식 점검** 줄이 나옵니다: 녹음에서 목소리가 난 시간, 인식된 단어 수, 1초당 단어 수. 목소리가 3초 이상인데 1초당 1단어 미만이면 주황색 경고를 띄웁니다. 이 기준(1단어/초)은 제가 정한 값입니다. 원어민의 보통 말 속도는 1초당 2~3단어 정도라서, 1단어 미만이면 빠뜨린 말이 있을 가능성이 크다고 봤습니다(추정).
- 녹음이 있는 문항에는 **녹음으로 다시 인식** 버튼이 있습니다. 누르면 녹음 파일을 기기 안의 Whisper 모델(Xenova/whisper-tiny.en)로 다시 글자로 바꾸고, 그 문항만 다시 채점하며 처음 인식 결과도 함께 보여 줍니다. 처음 한 번 모델을 내려받아야 하고(인터넷 필요), 녹음은 서버로 보내지 않습니다.
- 확인하지 못한 것: 두 방식(Google 실시간 인식 vs Whisper tiny) 중 어느 쪽이 한국인 발음을 더 정확히 받아 적는지는 직접 비교하지 못했습니다. 작업 환경에서 두 서비스 모두 접속이 막혀 있어 가짜 응답으로만 동작을 시험했습니다. 녹음을 들어 보고 더 맞는 쪽을 쓰세요.

**판단하지 못하는 것**
- 발음·억양의 질, 내용이 논리적으로 맞는지. 이 항목은 ‘직접 확인’으로 표시하고 녹음을 들으며 점검할 내용을 안내하며, 점수에서는 뺍니다.
- 한국에서 쓰는 IH, AL 같은 등급 이름은 공식 자료로 확인하지 못해 넣지 않았습니다.

**음성 인식 관련**
- Chrome의 음성 인식(Web Speech API)을 쓰므로 **Chrome + 인터넷 연결**이 필요하고, 답변 음성이 Google 음성 인식 서버로 전송됩니다. 원하지 않으면 첫 화면에서 ‘자동 분석’을 끄세요(녹음·다시 듣기는 그대로 됩니다).
- 음성 인식이 잘못 알아들으면 진단도 틀립니다. 발음 문제인지 인식 오류인지는 녹음을 직접 들어 확인하세요.
- 이 기능은 가짜 음성 인식으로 화면·계산만 테스트했고, 실제 Google 음성 인식과 Safari로는 테스트하지 못했습니다.
