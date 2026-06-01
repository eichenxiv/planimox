# XIVAPI v2 사용 가이드

> 이 문서는 FFXIV 게임 데이터(스킬/아이콘 등)를 제공하는 **XIVAPI v2** 를 처음 써 보는 개발자를 위해 작성되었습니다.
> 웹/HTTP 가 익숙하지 않아도 따라할 수 있도록 기본 개념부터 같이 설명합니다.

---

## 0. 5분 핵심 요약 (먼저 이것만 보세요)

XIVAPI v2 는 **HTTP 로 호출하는 데이터 서버**입니다. 우리가 필요한 건 단 두 가지:

| 우리가 원하는 것 | 호출할 URL | 받는 것 |
|---|---|---|
| 스킬(액션)의 정보 (이름/쿨타임/설명/아이콘 ID) | `https://v2.xivapi.com/api/sheet/Action/{ID}?fields=Name,Icon,Recast100ms` | JSON 텍스트 |
| 아이콘 이미지(PNG) | `https://v2.xivapi.com/api/asset?path={경로}&format=png` | PNG 이미지 바이트 |

이름으로 스킬을 찾고 싶으면 `/api/search?sheets=Action&query=Name="이름"&fields=Name,Icon` 한 번이면 끝납니다.

**브라우저(앱) 에서 바로 호출 가능합니다** — XIVAPI v2 가 CORS 를 전부 열어둬서 별도 백엔드 프록시 없이 동작합니다.

---

## 1. 사전 지식: HTTP API 가 뭔가요?

### 1-1. URL 의 구조
브라우저 주소창에 치는 그 URL 입니다.
```
https://v2.xivapi.com/api/sheet/Action/7531?fields=Name,Icon
└─────┘ └──────────┘└──────────────────┘└──────────────────┘
 스킴    호스트       경로(path)            쿼리(query)
```
- **스킴**: `https://` — 암호화된 통신.
- **호스트**: `v2.xivapi.com` — 어느 서버에 물어볼지.
- **경로**: 서버 안에서 어느 자원을 원하는지. 슬래시 `/` 로 계층 구분.
- **쿼리**: `?` 뒤에 `key=value` 가 `&` 로 이어진 옵션들. 여기서는 "어떤 필드만 받고 싶은지" 등.

### 1-2. HTTP 메서드
- `GET` — "줘" (자료 읽기). 우리가 쓰는 건 전부 GET.
- `POST`/`PUT`/`DELETE` — 만들기/수정/삭제. 이번엔 안 씀.

### 1-3. 상태 코드 (status code)
서버가 응답할 때 같이 보내는 숫자:
- `200` — 정상
- `304` — "안 바뀌었어, 캐시 그대로 써" (이미지 같은 정적 자원에서 자주 등장)
- `400` — 요청이 잘못됨 (필수 파라미터 빠짐 등)
- `404` — 자원이 없음 (잘못된 ID/경로)
- `5xx` — 서버 문제

### 1-4. JSON 이란?
서버가 데이터를 돌려줄 때 쓰는 **텍스트 형식**입니다. JS 객체랑 똑같이 생겼어요.
```json
{
  "row_id": 7531,
  "fields": {
    "Name": "Rampart",
    "Recast100ms": 900
  }
}
```
JavaScript 에서는 `await response.json()` 한 줄로 객체로 변환됩니다.

### 1-5. CORS 가 뭐길래 신경 써야 하나요?
브라우저는 보안상, 페이지가 떠 있는 도메인(`localhost:5173`)에서 **다른 도메인**(`v2.xivapi.com`)으로 요청을 보낼 때 그 다른 도메인이 "허용"한다고 응답 헤더에 명시해 줘야만 결과를 읽을 수 있게 막아 둡니다. 이게 CORS.

다행히 XIVAPI v2 는 `Access-Control-Allow-Origin: *` 로 열려 있어서 우리 React 앱이 직접 호출해도 됩니다. (열려있지 않은 API 라면 우리 백엔드를 거쳐서(=프록시해서) 받아와야 합니다.)

---

## 2. XIVAPI v2 전체 그림

엔드포인트는 7개뿐이고, 우리가 실질적으로 쓰는 건 3개입니다.

| 엔드포인트 | 용도 | 우리가 씀? |
|---|---|---|
| `GET /api/version` | 게임 버전 목록 조회 | ❌ |
| `GET /api/sheet` | 시트(테이블) 목록 | ❌ |
| `GET /api/sheet/{sheet}` | 시트의 행 목록 | ❌ |
| `GET /api/sheet/{sheet}/{row}` | **특정 행 1건 읽기** | ⭕️ |
| `GET /api/search` | **시트 안에서 검색** | ⭕️ |
| `GET /api/asset` | **파일(이미지) 가져오기** | ⭕️ |
| `GET /api/asset/map/...` | 맵 이미지 합성 | ❌ |

> "시트(sheet)" 라는 단어가 자꾸 나오는 이유: 게임 내부 데이터가 엑셀 시트 비슷한 표 구조라서 그렇습니다. **`Action` 시트 = 게임의 모든 스킬 목록**입니다. 행 번호 = 액션 ID.

OpenAPI 명세는 여기서 직접 볼 수 있습니다: <https://v2.xivapi.com/api/openapi.json>

---

## 3. 스킬(액션) 정보 가져오기

### 3-1. 기본 호출
"Rampart(액션 ID 7531) 의 정보 줘":
```
GET https://v2.xivapi.com/api/sheet/Action/7531
```

브라우저 주소창에 넣어 봐도 되고, 터미널에서 `curl` 로 쳐 봐도 됩니다:
```bash
curl https://v2.xivapi.com/api/sheet/Action/7531
```
응답에는 액션의 **모든 컬럼**이 다 딸려옵니다 — 수십~수백 개. 너무 많죠.

### 3-2. `fields` 로 필요한 컬럼만 받기
`fields=` 쿼리 파라미터에 콤마(,)로 컬럼 이름을 나열합니다.
```
https://v2.xivapi.com/api/sheet/Action/7531?fields=Name,Icon,Recast100ms
```
응답:
```json
{
  "row_id": 7531,
  "fields": {
    "Name": "Rampart",
    "Icon": {
      "id": 801,
      "path": "ui/icon/000000/000801.tex",
      "path_hr1": "ui/icon/000000/000801_hr1.tex"
    },
    "Recast100ms": 900
  },
  "transient": {
    "Description": "Reduces damage taken by 20%..."
  }
}
```

### 3-3. 우리한테 중요한 필드들
| 필드 | 의미 | 비고 |
|---|---|---|
| `fields.Name` | 영문 스킬명 | |
| `fields.Recast100ms` | 쿨타임 (1/10초 단위) | `Recast100ms / 10` = 초 |
| `fields.Icon.id` | 아이콘 ID (정수) | 우리 `iconId` 와 동일 |
| `fields.Icon.path_hr1` | 고해상도(80×80) 아이콘 경로 | 이미지 받을 때 사용 |
| `fields.Icon.path` | 일반 해상도(40×40) 경로 | |
| `transient.Description` | 스킬 설명 (영문) | `transient` 자리에 있는 점 주의 |

### 3-4. 언어 지정
한글 데이터가 필요하면 `?language=ko` (또는 ja, fr, de) — 단, 한국 클라이언트 텍스트는 게임 데이터에 포함되어 있지 않아 영문이 반환될 가능성이 높습니다. 일본어/영문은 안정적.

---

## 4. 아이콘 이미지 가져오기

게임 안의 모든 파일은 "경로(path)" 가 있고, 그걸 `/api/asset` 에 넘기면 변환된 결과를 받습니다.

### 4-1. 가장 단순한 호출
```
https://v2.xivapi.com/api/asset?path=ui/icon/000000/000801_hr1.tex&format=png
```
이 한 줄을 브라우저 주소창에 넣으면 80×80 PNG 가 바로 보입니다 (Rampart 아이콘).

### 4-2. 파라미터
| 이름 | 필수 | 설명 |
|---|---|---|
| `path` | ⭕️ | 게임 내 파일 경로 (`.tex`로 끝남) |
| `format` | ⭕️ | `png` / `jpg` / `webp` 중 하나 |
| `version` | ❌ | 특정 게임 버전 지정 (기본: 최신) |

### 4-3. `iconId` 로부터 path 만드는 공식
```
iconId = 801

folder = (iconId / 1000) 의 정수부 × 1000  →  0
folder6 = folder 을 6자리 zero-pad        →  "000000"
id6    = iconId 를 6자리 zero-pad         →  "000801"
path = `ui/icon/${folder6}/${id6}_hr1.tex`
     →  "ui/icon/000000/000801_hr1.tex"
```
iconId 2599 → folder 2000 → `ui/icon/002000/002599_hr1.tex` (= Reprisal).

이 함수가 우리 코드의 [src/data/jobSkills.ts:3-9](../src/data/jobSkills.ts#L3-L9) 에 `iconUrl()` 로 들어 있습니다.

### 4-4. 브라우저 캐시
응답에 `Cache-Control: public, max-age=604800, immutable` 가 붙어 있어 **7일** 동안 브라우저가 알아서 재사용합니다. 같은 페이지를 새로고침해도 네트워크 호출이 다시 안 나갑니다.

### 4-5. CORS
`Access-Control-Allow-Origin: *` — React/HTML 의 `<img src="...">` 도 그냥 됩니다.

---

## 5. 이름으로 스킬 찾기 (검색)

스킬 이름은 알지만 ID 를 모를 때 씁니다.

### 5-1. 호출 형태
```
GET https://v2.xivapi.com/api/search?sheets=Action&query=Name="Searing Light"&fields=Name,Icon
```
파라미터:
- `sheets=Action` — 액션 시트에서만 찾아라.
- `query=Name="..."` — Name 필드가 정확히 일치.
- `query=Name~"..."` — Name 필드가 비슷한 것도 포함 (퍼지 매칭).
- `fields=...` — sheet/row 호출과 동일하게, 응답에 어떤 컬럼 포함할지.

> URL 에 큰따옴표나 공백이 들어가니 직접 입력할 땐 인코딩 (`"` → `%22`, 공백 → `%20` 또는 `+`) 가 필요할 수 있습니다. JS 의 `URLSearchParams` 가 자동으로 처리해 줍니다.

### 5-2. 응답
```json
{
  "results": [
    {
      "score": 1.0,
      "sheet": "Action",
      "row_id": 25801,
      "fields": {
        "Name": "Searing Light",
        "Icon": { "id": 2780, "path_hr1": "ui/icon/002000/002780_hr1.tex" }
      }
    }
  ]
}
```
→ Searing Light 의 action ID 가 25801, iconId 가 2780 임을 확인.

### 5-3. **왜 결과가 여러 개 나오나요?**

`Action` 시트는 **"플레이어 스킬 목록"이 아니라 "게임에서 발동되는 모든 액션의 목록"** 입니다. 같은 이름의 row 가 여러 개 정상적으로 존재합니다.

예: `Name="Rampart"` 으로 검색하면 10건 이상 매칭 — 그 이유:

| 종류 | 설명 |
|---|---|
| 플레이어 스킬 본체 | 우리가 원하는 것 (예: Rampart row_id 7531) |
| NPC/적/보스가 쓰는 동명 스킬 | 게임 내 적이 시전하는 동일 이름 |
| 레거시(제거된 옛 패치) row | 시트에 남아 있는 잔재 |
| PvP 전용 버전 | `IsPvP: true` |
| 롤(role) 변형 / 직업 변형 | 일부 패치 변형이 분리 저장 |

### 5-4. 원하는 1건만 받는 필터

쿼리에 조건을 **AND** 로 더 붙여서 좁힙니다. AND 연산자는 **`+`** 기호:

```
?sheets=Action&query=Name="Rampart" +IsPlayerAction=true +ClassJobLevel>0 +IsPvP=false&limit=1
```

- `+IsPlayerAction=true` — 플레이어가 쓰는 액션만 (적/NPC 제외)
- `+ClassJobLevel>0` — 어떤 레벨 이상에 배우는 스킬만 (legacy/dummy 제외)
- `+IsPvP=false` — PvE 전용
- `&limit=1` — 응답 1건만 반환 (네트워크/파싱 비용 절감)

JavaScript 예시:
```ts
const url = new URL('https://v2.xivapi.com/api/search');
url.searchParams.set('sheets', 'Action');
url.searchParams.set(
  'query',
  'Name="Rampart" +IsPlayerAction=true +ClassJobLevel>0 +IsPvP=false',
);
url.searchParams.set('fields', 'Name,Icon,Recast100ms,ClassJob.Abbreviation');
url.searchParams.set('limit', '1');
const r = await (await fetch(url)).json();
console.log(r.results[0]); // 우리가 원하는 그 Rampart 1건
```

> **한 줄 결론**: `Action` 시트 = 게임의 모든 액션(플레이어+NPC+레거시+PvP) 통합 테이블이라 동명 행이 많은 게 정상. `+IsPlayerAction=true +IsPvP=false` 필터 + `&limit=1` 이면 우리가 찾는 플레이어 스킬 1건이 거의 항상 잡힙니다.

---

## 6. 우리 앱 코드와의 매핑

| 우리 코드 위치 | 하는 일 | XIVAPI v2 호출 |
|---|---|---|
| [src/data/jobSkills.ts](../src/data/jobSkills.ts) — `RAW` 객체 | 직업/스킬 메타데이터 하드코딩 (이름, iconId, 적용시간, 쿨타임) | 없음 (정적 데이터) |
| [src/data/jobSkills.ts:3-9](../src/data/jobSkills.ts#L3-L9) — `iconUrl(iconId)` | iconId → 이미지 URL 변환 | `/api/asset?path=...` |
| [src/components/SkillIcon.tsx](../src/components/SkillIcon.tsx) — `<img src={iconUrl(...)}/>` | 실제 이미지 렌더 | 위 URL 을 브라우저가 자동 호출 |
| [src/components/SkillIcon.tsx:23-33](../src/components/SkillIcon.tsx#L23-L33) — `onError` | 404 등 실패 시 텍스트로 fallback | 실패해도 앱이 안 깨지게 |

핵심: **우리 앱 런타임에서는 `/api/sheet/...` 나 `/api/search` 를 호출하지 않습니다**. 메타데이터는 빌드 타임에 코드로 박아 두고, 런타임에는 오직 이미지(`/api/asset`)만 가져옵니다. 단순하고 빠릅니다.

> **누가 `/api/sheet`/`/api/search` 를 호출할까요?** → 개발자가 새 스킬을 추가할 때 "올바른 iconId" 를 알기 위해 한 번 호출하고 끝. 런타임 코드엔 들어가지 않습니다.

---

## 7. 실전 워크플로우: 새 스킬을 jobSkills.ts 에 추가하기

예: 적기사(RDM)의 `Embolden` (파티 공격 시너지) 을 추가한다고 가정.

### 7-1. 이름으로 검색해서 정보 얻기
브라우저 주소창에 입력 (혹은 `curl`):
```
https://v2.xivapi.com/api/search?sheets=Action&query=Name="Embolden"&fields=Name,Icon,Recast100ms
```
응답 예시:
```json
{
  "results": [{
    "row_id": 7520,
    "fields": {
      "Name": "Embolden",
      "Icon": { "id": 3217, "path_hr1": "ui/icon/003000/003217_hr1.tex" },
      "Recast100ms": 1200
    }
  }]
}
```
→ iconId=3217, 쿨타임=1200/10=**120초**.

### 7-2. 적용시간(duration) 은 어디서?
`/api/sheet/Action/7520?fields=Name,Icon,Recast100ms` 만으로는 **버프 지속시간을 모릅니다**. 액션 자체에는 "효과를 거는" 정보까지만 있고, 실제 버프 효과는 `Status` 시트의 별도 행에 있습니다. 보통은 [TOOLTIP/위키](https://ffxiv.consolegameswiki.com/) 로 확인하는 게 빠릅니다 (Embolden = 20초).

### 7-3. 코드에 추가
[src/data/jobSkills.ts](../src/data/jobSkills.ts) 의 `RAW` 에 새 직업 키 또는 기존 키 배열에 한 줄 추가:
```ts
RDM: [
  {
    id: 'RDM_Embolden',
    name: 'Embolden',
    nameKo: '엠볼든',
    iconId: 3217,
    durationSec: 20,
    cooldownSec: 120,
    targetable: false,
    description: '파티 피해량 증가',
  },
],
```
타입 정의([src/types.ts](../src/types.ts))에 `JobId` 에 `'RDM'` 추가, [src/data/jobs.ts](../src/data/jobs.ts)에도 직업 메타 추가.

저장하면 Vite 가 자동 리로드, 아이콘은 새로고침 후 화면에 뜹니다.

---

## 8. 자주 마주칠 문제와 해결

| 증상 | 원인 | 해결 |
|---|---|---|
| 아이콘 자리에 텍스트만 보임 | `iconId` 가 잘못됨 (404) | [§5 검색](#5-이름으로-스킬-찾기-검색) 으로 올바른 ID 확인 |
| 콘솔에 `CORS error` | XIVAPI v2 가 아닌 다른 호스트(예: 구 xivapi.com) 호출 중일 가능성 | URL 호스트를 `v2.xivapi.com` 으로 통일 |
| 응답이 너무 큼 / 느림 | `fields=` 미지정 시 모든 컬럼 포함 | 반드시 `fields=Name,Icon,...` 형태로 좁히기 |
| 한글 스킬명이 안 옴 | 게임 데이터에 한국어 텍스트가 없음 | 우리 코드의 `nameKo` 필드로 직접 작성 |
| 응답에 `transient` 가 비어 있음 | 그 시트 행이 transient 데이터를 안 가짐 | 정상. 모든 행에 다 있는 게 아님 |
| 검색 쿼리에서 400 | `+` 같은 특수문자 그대로 사용 / 따옴표 누락 | `Name="..."` 형태, URL 인코딩 적용 |

---

## 9. 부록 — 자주 쓰는 cheat sheet

```bash
# 액션 1건
curl "https://v2.xivapi.com/api/sheet/Action/7531?fields=Name,Icon,Recast100ms"

# 이름으로 검색
curl 'https://v2.xivapi.com/api/search?sheets=Action&query=Name="Searing Light"&fields=Name,Icon'

# 아이콘 PNG 다운로드
curl -o rampart.png "https://v2.xivapi.com/api/asset?path=ui/icon/000000/000801_hr1.tex&format=png"

# 게임 버전 확인
curl "https://v2.xivapi.com/api/version"
```

JavaScript (브라우저/Node 동일):
```ts
// 액션 정보
const r = await fetch(
  'https://v2.xivapi.com/api/sheet/Action/7531?fields=Name,Icon,Recast100ms'
);
const data = await r.json();
console.log(data.fields.Name);           // "Rampart"
console.log(data.fields.Recast100ms/10); // 90 (초)

// 아이콘은 그냥 <img src=...> 로 표시
const url = 'https://v2.xivapi.com/api/asset'
  + '?path=' + encodeURIComponent('ui/icon/000000/000801_hr1.tex')
  + '&format=png';
document.body.innerHTML = `<img src="${url}" />`;
```

---

## 10. 참고 링크

- OpenAPI 명세 (전체 엔드포인트 스펙): <https://v2.xivapi.com/api/openapi.json>
- Swagger UI: <https://v2.xivapi.com/api/docs> (JS 로 렌더되므로 브라우저로 열어야 보입니다)
- boilmaster 소스: <https://github.com/xivapi/xivapi-v2>
- FFXIV 액션/스테이터스 위키 (지속시간 확인용): <https://ffxiv.consolegameswiki.com/>
