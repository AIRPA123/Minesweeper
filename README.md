# 💣 지뢰찾기 프리미엄 (Premium Minesweeper)

글래스모피즘(Glassmorphism) 스타일의 모던한 디자인과 매끄러운 사용자 경험을 제공하는 웹 기반 **지뢰찾기 프리미엄** 게임입니다. 별도의 설치나 복잡한 빌드 과정 없이, 웹 브라우저만으로 즉시 플레이할 수 있습니다.

---

## ✨ 주요 특징 (Key Features)

*   **Premium Glassmorphism UI**: 세련된 다크 모드 배경 위에 투명하고 신비로운 글래스모피즘 디자인을 적용하였으며, 네온 컬러의 텍스트 섀도우와 부드러운 애니메이션 효과를 더해 시각적인 만족감을 높였습니다.
*   **첫 번째 클릭 안전 보장 (Safe Start)**: 게임 시작 시 처음으로 클릭하는 셀과 그 주변 8개 셀에는 절대로 지뢰가 배치되지 않습니다. 첫 클릭부터 허무하게 게임 오버가 되는 일을 방지하여 쾌적한 플레이를 제공합니다.
*   **지능형 셀 확장 (Flood Fill)**: 지뢰가 주변에 없는 빈 셀(0)을 클릭할 경우, 자동으로 인접한 빈 셀들이 시원하게 연쇄 확장되어 탐색 속도를 높여줍니다.
*   **3가지 난이도 선택**:
    *   **초급 (Easy)**: 9 × 9 그리드, 지뢰 10개
    *   **중급 (Medium)**: 16 × 16 그리드, 지뢰 40개
    *   **고급 (Hard)**: 16 × 30 그리드, 지뢰 99개
*   **패배 시 연출 (Game Over Effect)**: 지뢰를 밟아 게임 오버가 될 때, 모든 지뢰가 무작위 딜레이(0~0.5초)를 가지고 순차적으로 흔들리며 나타나 시각적인 재미를 선사합니다.
*   **반응형 레이아웃**: 모바일이나 좁은 화면(600px 이하)에서도 화면을 벗어나지 않도록 셀 크기가 자동으로 축소되고 모바일에 맞는 레이아웃으로 변경됩니다.

---

## 🛠 사용 기술 (Tech Stack)

*   **HTML5**: 시맨틱 웹 표준을 준수하며 모던한 레이아웃 구성
*   **CSS3**: Vanilla CSS를 활용한 글래스모피즘 디자인, CSS 변수(`:root`) 관리, `@keyframes` 흔들림(shake) 애니메이션 및 반응형 미디어 쿼리 구현
*   **JavaScript (ES6)**: 순수 자바스크립트로 게임 상태(State) 관리, 돔 조작, 랜덤 지뢰 배치 및 재귀적 Flood Fill 알고리즘 구현

---

## 📂 프로젝트 구조 (Project Structure)

```
Minesweeper/
├── index.html   # 게임의 뼈대와 구조를 정의하는 HTML 파일
├── style.css    # 글래스모피즘 테마 및 다이나믹 효과가 적용된 CSS 파일
├── script.js    # 지뢰 배치, 타일 로직, 상태 관리를 담당하는 JS 파일
└── README.md    # 프로젝트 소개 문서
```

---

## 🎮 게임 조작법 (How to Play)

*   **좌클릭 (Left Click)**: 타일을 엽니다.
    *   지뢰가 없는 안전한 셀인 경우 주변 지뢰 개수(1~8)가 표시됩니다.
    *   주변 지뢰 개수가 0인 경우 인접한 영역이 자동으로 열립니다.
    *   지뢰가 있는 셀을 클릭하면 게임 오버가 됩니다.
*   **우클릭 (Right Click / 모바일은 길게 터치)**: 지뢰가 의심되는 셀에 깃발(🚩)을 꽂거나 제거합니다.
    *   깃발을 설치할 때마다 남은 지뢰 개수가 실시간으로 차감됩니다.
*   **초기화 (Reset Button)**: 상단 stats bar 중앙의 새로고침 아이콘 혹은 게임 오버/승리 후의 '다시 하기' 버튼을 클릭하면 게임을 즉시 리셋하고 새로 시작할 수 있습니다.

---

## ⚙️ 상세 기술 설명 (Technical Details)

### 1. 첫 클릭 보호 로직 (Safe Start)
```javascript
// script.js
if (Math.abs(r - excludeRow) <= 1 && Math.abs(c - excludeCol) <= 1) continue;
```
첫 클릭 좌표 `(excludeRow, excludeCol)` 기준 가로/세로 거리가 1 이하인 구역(인접한 8칸 + 본인 타일 포함 총 9칸)은 지뢰 배치 대상에서 제외합니다. 이를 통해 첫 번째 클릭은 항상 0개 지뢰 타일이 되므로 넓은 영역이 열려 쾌적한 시작이 가능합니다.

### 2. Flood Fill (재귀적 탐색)
```javascript
// script.js
if (cell.neighborMines > 0) {
    cellElement.textContent = cell.neighborMines;
    cellElement.dataset.value = cell.neighborMines;
} else {
    // Flood fill
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            // 유효성 검사 후 재귀 호출
            if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
                revealCell(nr, nc);
            }
        }
    }
}
```
열린 타일 주변의 지뢰 수가 0일 경우, DFS 방식의 재귀 함수 `revealCell`을 사용해 인접 영역을 무한 확장해 나가며 빈 공간을 자동으로 탐색하여 열어줍니다.

### 3. Glassmorphism & Custom Variable System
```css
/* style.css */
:root {
    --bg-color: #0f172a;
    --board-bg: rgba(30, 41, 59, 0.7);
    --cell-bg: rgba(51, 65, 85, 0.6);
    --glass-border: 1px solid rgba(255, 255, 255, 0.1);
    --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
}
```
유리막처럼 반투명하게 비치는 효과를 주기 위해 `backdrop-filter: blur(10px)`와 반투명 테두리(`--glass-border`), 부드러운 그림자(`--glass-shadow`)를 조합하여 세련되고 깊이감 있는 입체적 다크 UI를 완성했습니다.

---

## 🚀 실행 방법 (Getting Started)

프로젝트 루트 디렉토리에서 브라우저를 열어 `index.html` 파일을 즉시 실행하거나, VS Code의 Live Server 등의 로컬 웹 서버 확장 프로그램을 이용하여 간편하게 실행할 수 있습니다.

```bash
# 로컬 개발 환경에서 빠르게 테스트하려면
# (Live Server 플러그인을 권장하며, 또는 아래 명령어를 사용하여 실행할 수도 있습니다.)
npx serve .
```
