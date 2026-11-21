# WhiteChrismas — 원본 기반 한글 수정본 0.2.15

Wintermas 원작 amiayweb: https://github.com/amiayweb/Wintermas

첨부 원본을 새 기준으로 한글 UI, 가로형 설정창, 클릭 없이 눈 쓸기만 추가했습니다.
원본의 적설 렌더러·눈덩이 성장/물리·제설차·산타·장식을 유지합니다.
원본 LICENSE(PolyForm Noncommercial 1.0.0)를 따릅니다.

## Windows 실행
프로젝트 폴더에서 다음을 실행하세요. Node.js 및 원본의 Windows 빌드 도구가 필요합니다.
```powershell
npm.cmd ci
npm.cmd exec -- install-electron
npm.cmd start
```
설정은 880×460 범위의 가로형이며, 작은 화면은 스크롤로 확인할 수 있습니다.
겨울 모드와 눈 내리기를 켜고 눈이 쌓이면 클릭하지 않은 채 마우스로 쓸어보세요.
클릭 후 굴려 눈덩이를 만드는 조작은 원본 그대로입니다.

## 확인 범위
쓸기 기능 2개 테스트, 전체 JS 문법 검사, 원본 눈 관련 파일 및 LICENSE 동일성 검사 통과.
실제 Windows 외관·동작과 EXE 빌드는 이 환경에서 검증하지 못했습니다.
이전 0.4.x 수정본의 눈 디자인/물리 변경은 포함하지 않았습니다.

---

<p align="center">
  <img src="./ui/icon.png" width="120" alt="Wintermas logo">
</p>

<h1 align="center">Wintermas</h1>

<p align="center">An interactive Christmas desktop widget for Windows.</p>

<p align="center">
  <img alt="Windows x64" src="https://img.shields.io/badge/Platform-Windows%20x64-0078D4">
  <img alt="Electron" src="https://img.shields.io/badge/Built%20with-Electron-47848F?logo=electron&amp;logoColor=white">
  <img alt="Version 0.1.0" src="./.github/version.svg">
</p>

Wintermas brings snowfall and Christmas decorations to your existing desktop. Snow settles on window edges and can spill when you move or resize a window. The widget controls the effects and can be tucked away in the Windows system tray.

## Demo

[![Watch the Wintermas desktop demo](./demo/preview.jpg)](./demo/demo.mp4)

[Watch or download the 47-second demo (MP4)](./demo/demo.mp4)

## Install

1. Get **Wintermas-Setup.exe** from [Releases](../../releases) when a build is available, or [build the installer](#build-from-source) locally.
2. Run the installer, choose a folder and select **Open Wintermas** when it finishes.
3. Click the widget and turn on **Christmas mode**, then **Snowfall**.

The installer targets Windows x64 and uses Microsoft Edge WebView2 for its interface. It installs for your Windows account. You can remove Wintermas through **Settings → Apps → Installed apps**.

## What you can do

| Feature | How to use it |
| --- | --- |
| Snowfall | Adjust **Intensity** and **Wind** in the widget. Snow can collect on open windows. **Snow on the taskbar** is on by default and has its own toggle. |
| Snowballs and snowmen | Use **Make snowball**, or click and drag across a snowbank to roll a ball. Drag and release a ball to throw it. Stack three snowballs to make a snowman. |
| Santa and gifts | Select **Send Santa** to watch the sleigh fly across the desktop and drop gifts. |
| Snowplow | Select **Snowplow** to clear snow along the taskbar. Use **Reset snow** to clear accumulated snow. |
| Garlands | Choose a light palette or custom color, then select **Hang garland**. Click to place the first anchor, use **Ctrl + click** to add anchors, and click to finish. |
| Christmas trees | Select **Place tree**, then click where you want it. **Clear decorations** removes the decorations you placed. |
| System tray | Drag the widget by its handle. Select **Hide to system tray** to tuck it away, double-click the tray icon to bring it back, or use its menu to quit. |

**Shortcut.** Press **Alt + Shift + B** over a snowbank to gather snow into a ball.

## Build from source

Build on Windows x64 with Node.js 22.12 or later, npm and the .NET Framework 4.x C# compiler. The installer build uses Windows PowerShell, `curl.exe` and `tar.exe` and downloads the pinned WebView2 SDK from NuGet. To use a local copy of that SDK, set `WINTERMAS_WEBVIEW2_SDK` to the path of its `.nupkg` file.

```powershell
npm.cmd ci
npm.cmd exec -- install-electron
npm.cmd start
```

To package the app and build its installer:

```powershell
npm.cmd run build
```

The build writes `dist/setup/Wintermas-Setup.exe`. Keep the generated `dist` folder out of Git.

## Release a new version

Update the version with `npm version patch --no-git-tag-version` (or choose `minor` or `major`). Update the version shown in the local badge at `.github/version.svg` and its alt text in this README, then commit and push to `main`. GitHub Actions skips versions with an existing `vX.Y.Z` tag. For a new version, it builds the installer and publishes it in a GitHub Release with a tag pointing to the built commit.

## Project layout

| Path | Purpose |
| --- | --- |
| `main.js`, `preload.cjs` | Electron windows, settings, system tray and communication with the interface |
| `ui/` | Widget interface, desktop overlay, snow effects and decoration artwork |
| `native/` | Windows helper that tracks window and taskbar geometry |
| `setup/`, `scripts/` | WebView2 installer interface and build scripts |
| `demo/` | Desktop demo video and preview image |

## License

Copyright © amiayweb.

Wintermas source code is available under the [PolyForm Noncommercial License 1.0.0](./LICENSE). You may use, modify, and share the software for permitted noncommercial purposes under the terms of the license. Commercial use requires separate permission from amiayweb.

## Acknowledgments

Wintermas was inspired by [KoiArt](https://koiart.app/), a desktop effects app for macOS.


## 0.1.2 — 창 이동과 얕은 눈 처마
- 창을 옮기면 이동 속도/방향에 따라 눈이 불규칙한 덩어리로 흩어집니다.
- 원본 눈의 질감을 유지하면서 창 아래로 최대 3px의 작은 처마를 표현합니다.
- 작업표시줄과 바닥에는 처마를 적용하지 않으며, 눈을 모아 없애면 처마도 함께 사라집니다.
- 내려온 눈도 클릭 및 클릭 없는 쓸기 판정에 포함합니다.
- 4개 코드 테스트 및 JS 문법 검사 통과. 실제 Windows 표시·다중 모니터·EXE 빌드는 미검증입니다.


## 0.1.3 설정과 장식 관리
- 가로형 설정창을 짙은 초록·버건디·골드 색상으로 변경했습니다.
- 트리, 전구 줄, 선물을 우클릭하고 ‘이 장식 치우기’를 누르면 해당 항목만 제거합니다.
- 우클릭 추적을 위해 native/Desktop.cs도 변경했습니다. 기존 desktop.exe를 직접 실행하지 말고 npm.cmd start로 다시 빌드하세요.
- 눈 디자인 추가 변경은 이번 버전에 적용하지 않았습니다. 별도 기획 문서를 참고하세요.
- 6개 코드 테스트, JS/브리지 문법 검사 통과. 실제 Windows 우클릭 메뉴·C# 컴파일·설정창 외관·EXE 빌드는 미검증입니다.


## 0.1.4 창 감지 보완 / 눈 덮임 디자인 적용
- 일반 테두리 없이 제목만 있는 창도 적설 대상에 포함합니다. DWM 좌표가 유효하지 않으면 GetWindowRect로 재조회합니다.
- 최소화·숨김·가상 데스크톱에서 숨겨진 창과 시스템 오버레이는 계속 제외합니다. 다른 창이 윗선을 가리거나 윗선이 화면 밖인 창에는 눈이 보이지 않을 수 있습니다.
- 원본 렌더러의 윗면에 완만한 눈 뭉침, 아랫면에 최대 5px의 얕은 눈 처마를 적용했습니다.
- 위·아래 외곽과 클릭/쓸기 판정은 같은 적설 데이터를 사용합니다. 눈을 모으면 두께가 함께 감소합니다.
- PNG 눈 띠를 늘리는 방식은 사용하지 않습니다. 첨부 일러스트와 동일한 결과를 보증하지 않습니다.
- native 소스 변경이 있으므로 npm.cmd start로 Windows 도우미를 다시 빌드해야 합니다.
- 7개 코드 테스트와 JS 문법 검사 통과. C# 컴파일과 실제 Windows별 감지·시각적 결과·EXE 빌드는 미검증입니다.


## 0.1.5 눈 재질·수집과 화질
- 첨부 눈 이미지는 원본 적설 외곽 안에 재질로 합성합니다. 받침층과 위/아래 외곽은 같은 적설 데이터로 그려 빈틈을 막습니다.
- 창 위는 최대 5px까지 내려오며 작업표시줄은 기존처럼 위쪽 적설을 유지합니다. 버튼과 클릭 영역을 가리지 않도록 얕게 설정했습니다.
- 눈을 굴리면 일부가 진행 방향 앞에 둔덕으로 밀리고 나머지가 공으로 모입니다. 급한 경사는 주변 칸으로 양을 옮겨 완화합니다.
- 공의 최대 크기에서는 추가 수집을 중단합니다. 이는 2D 높이 데이터 기반 처리이며 전체 입자/변형 물리 시뮬레이션은 아닙니다.
- 화면 전체를 약 100만 픽셀로 축소하던 해상도 설정을 개선했습니다. 최대 약 830만 픽셀 예산 안에서 화면과 DPI에 대응합니다.
- 적설 캐시도 화면 배율에 맞춰 그립니다. 눈덩이/눈사람 몸체의 스프라이트는 80px에서 320px로 높이고 얼굴/팔 등은 기존 벡터로 그립니다.
- preview/snow-render.png는 실제 렌더러를 별도 Canvas 구현에서 호출한 예시이며 Windows 화면 캡처가 아닙니다.
- 10개 코드 테스트와 JS 문법 검사 통과. 실제 Windows 외관·조작감·GPU 성능·EXE 빌드는 미검증입니다.


## 0.1.6 — 첨부 0.4.7의 눈 스타일만 이식
- 첨부 0.4.7의 powder-snow.js, snow-surface.js, powder-atlas.png와 눈 내림 렌더러를 가져왔습니다.
- 적설 표시 높이가 부드럽게 바뀌는 부분만 분리해 연결했습니다. 설정·장식·눈사람·눈덩이 수집 조작은 현재 버전을 유지합니다.
- 새 창의 초기 적설 20px와 적설 상한(창28/작업표시줄30/바닥34px)을 해당 버전 기준으로 맞췄습니다.
- 최대화/전체화면 창이 화면 상단에서 눈 입자를 가로채지 않도록 충돌 처리를 변경했습니다. 앞에 노출된 새 창에 눈이 도달할 수 있으며, 실제로 가려진 창의 윗선은 계속 제외됩니다.
- 작업표시줄 위 적설과 화면 바닥 적설을 분리했습니다. 아래까지 내려온 눈은 윗선으로 되돌리지 않고 화면 맨 아래에 쌓습니다.
- 12개 코드 테스트 및 JS 문법 검사 통과. 실제 Windows 전체화면 앱과 새 창, 작업표시줄 표시·GPU 성능·EXE 빌드는 미검증입니다.
- 기존 preview/snow-render.png는 0.1.5의 예시이며 현재 스타일 참고용으로 사용하지 마세요.


## 0.1.7 창 이동 / 받침 해제 / 눈 덮임
- 창을 옆으로 옮기면 원래 화면 좌표에 눈이 남고, 창이 사라진 구간의 눈은 거의 수직으로 떨어집니다. 수평 비산 속도는 ±4px/s 이내로 제한했습니다.
- 창 높이가 바뀌면 기존 눈의 받침을 해제해 원래 위치에서 떨어뜨립니다.
- 받치던 창이 움직이면 눈덩이·눈사람도 고정을 풀고 원래 위치에서 중력으로 떨어집니다. 눈사람의 결합은 유지합니다.
- 작업표시줄 아래 덮임을 막던 플래그를 해제했습니다. 창은 최대6px, 작업표시줄은 최대2px 범위로 살짝 덮고, 바닥 적설은 유지합니다.
- 14개 코드 테스트와 JS 문법 검사 통과. 실제 Windows에서의 자연스러움·눈사람 낙하·외관과 EXE 빌드는 미검증입니다.


## 0.1.8 작업표시줄 밀착 / 둥근 눈 재디자인
- 하단 작업표시줄의 DWM 좌표 대신 모니터 작업 영역의 윗선을 공통 받침으로 사용합니다. 같은 하단 작업표시줄을 중복 등록하지 않습니다. 자동 숨김 등 작업 영역에 여백이 없는 경우에는 기존 감지 결과를 유지합니다.
- 2px로 제한되던 작업표시줄 덮임을 최대5px까지 허용합니다. 창은 최대6px, 바닥은 아래로 돌출하지 않습니다.
- 일정한 사인 물결 대신 폭과 위치가 다른 둥근 눈 뭉침을 사용합니다. 아랫면은 얕게 연결하고 드문 곳에서 조금 더 내려오게 합니다. 모양은 프레임마다 바뀌지 않으며 적설량에 맞춰 줄어듭니다.
- preview/snow-018.png는 앱과 같은 눈 렌더러의 Canvas 출력 예시입니다. 실제 Windows 화면 캡처가 아닙니다.
- 16개 코드 테스트, JS 문법 검사 통과. 별도 픽셀 검사에서 작업표시줄 윗선보다 2px 아래에 실제 눈 픽셀이 표시되는 것을 확인했습니다.
- 실제 Windows 작업표시줄 위치·자동 숨김·GPU 성능과 외관·EXE 빌드는 미검증입니다.


## 0.1.9 확인한 눈 시안 적용 / 최대 크기 설정
- 별도 미리보기에서 확인한 눈 외곽과 재질 색상을 현재 렌더러에 적용했습니다.
- 눈 설정에 최대 크기 슬라이더를 추가했습니다. 표시값은 지름80~240px, 기본160px이며 내부 반지름은40~120px입니다. 1단계당 지름2px입니다.
- 최대 크기를 저장하고 재실행 시 불러옵니다. 입력/저장값은 유효한 범위로 보정합니다.
- 굴려 키우기와 눈 모으기 동작에 같은 한도를 사용합니다. 설정을 낮춰도 기존 큰 공은 축소하지 않으며 더 커지지 않습니다.
- 18개 코드 테스트와 JS 문법 검사 통과. 실제 Windows 조작/외관과 EXE 빌드는 미검증입니다.


## 0.2.0 점무늬 제거 / 렌더링 경량화
- 눈덩이 구체의 반복 점무늬를 제거했습니다. 기존 부드러운 명암은 유지합니다.
- 눈 외곽 계수를 창 너비별로 캐시하고, 렌더링 조각을1px에서2px 단위로 변경했습니다.
- 적설 캐시 재생성 최소 간격을30ms에서90ms로 변경하고 화면 렌더링 배율을 균형 설정으로 조정했습니다.
- 떨어지는 눈 조각은768개를 기준으로 추가 생성 대신 기존 조각의 적설량에 합칩니다.
- 같은 CPU Canvas 검사에서1920px 눈더미 재출력 평균9.64ms→3.74ms. Windows 실제 GPU/FPS 측정은 아니며 환경에 따라 차이가 있습니다.
- 20개 코드 테스트 및 JS 문법 검사 통과. 실제 Windows 렉 개선 여부와 EXE 빌드는 미검증입니다.

## 배포 시 소개 예시
WhiteChirsmas — Wintermas 기반 비공식 한국어 커스텀 버전
원작: amiayweb / https://github.com/amiayweb/Wintermas
수정: 한글화, 설정 UI, 눈 스타일과 일부 상호작용·렌더링 조정
라이선스: PolyForm Noncommercial 1.0.0 (LICENSE 참조)
원본의 라이선스와 필요한 고지는 유지해 전달하세요.


## 0.2.1 랜턴과 군고구마
- 이전 앱의 랜턴·군고구마 이미지와 소품 조작을 가져왔습니다. 우체통과 모빌은 추가하지 않았습니다.
- 꾸미기에서 랜턴 놓기/군고구마 놓기를 선택한 뒤 원하는 곳을 클릭하세요. 클릭하면 놓을 수 있다는 안내가 표시됩니다.
- 소품은 드래그 이동, 우클릭 개별 제거, 장식 치우기 전체 삭제를 지원합니다. 배치는 모니터별로 저장됩니다.
- 랜턴을 짧게 클릭하면 불빛을 켜거나 끕니다. 창에 붙인 소품은 창을 따라가며, 받치던 창이 사라지면 작업표시줄까지 떨어집니다.
- 25개 코드 테스트와 JS 문법 검사 통과. 실제 Windows 배치·우클릭·외관과 성능, EXE 빌드는 미검증입니다.


## 0.2.2 좌우 끝 눈 덮임 / 적설 화질
- 창 좌우 끝의 덮임을0으로 줄이던 처리를 변경하고, 창 바깥 양쪽4px까지 둥근 끝부분을 그립니다. 그 영역에 맞춰 적설 캐시 여백과 가림 판정을 확장했습니다.
- 확장된 좌우 눈과 아래 덮임도 눈덩이 만들기 클릭 판정에 포함됩니다.
- 눈 적설 캐시는2배 해상도로 생성하고, 기존2px 조각 대신1px 간격으로 그립니다. 전체 화면은 기존 균형 해상도를 유지합니다.
- 곡선 계수 캐시와90ms 캐시 재생성 제한은 유지합니다. 품질 개선에 따른 렌더링 비용 변화는 실제 Windows에서 추가 확인이 필요합니다.
- 26개 코드 테스트와 JS 문법 검사 통과. 별도2배 해상도 픽셀 출력에서 양쪽 끝이 창 아래를 덮는 것을 확인했습니다.
- 실제 Windows 외관·DPI별 표시·GPU 성능 및 EXE 빌드는 미검증입니다.


## 0.2.3 실제 눈 픽셀 클릭 / 고DPI 합성
- 적설 렌더링 캐시의 알파값으로 클릭 가능 영역을 판정합니다. 투명한 여백, 다른 창에 가려진 눈, 실제 적설이 사라진 곳을 제외합니다.
- 눈 위에서 누른 뒤3px 이상 움직일 때 눈덩이를 만듭니다. 기존 눈덩이는 원형 내부에서만 잡힙니다.
- 화면 합성을 균형 배율에서 높은DPI 배율로 변경했습니다. 적설2배 캐시와 곡선 캐시·90ms 재생성 제한은 유지합니다.
- 실제 Windows GPU 성능과 클릭 통과 동작은 미검증입니다. 렌더 캐시에서 픽셀을 읽는 비용과 높은DPI 비용이 추가되므로 실기기 성능 확인이 필요합니다.
- 27개 코드 테스트 및 JS 문법 검사 통과. EXE 빌드는 미검증입니다.

## 0.2.4 새 눈 디자인

승인한 투명 눈 에셋 soft-snowcap.png를 적용했습니다. 연속된 눈 본체만 샘플링해 주변 잔여 픽셀을 제외하고, 창 양 끝과 가운데를 분리해 창 너비에 따라 전체 이미지가 늘어나지 않게 렌더링합니다. 실제 적설 높이에 맞춰 음영과 두께를 조절하며 기존 알파 기반 클릭 판정을 유지합니다. Windows 실제 실행 검증은 별도로 필요합니다.

## 0.2.5 렌더링 구조 최적화

눈 텍스처의 세부 슬라이스 합성 결과를 폭별 캐시에 보관해 재사용합니다. 캐시는 400만 픽셀/12개 이내로 제한합니다. 동적 외곽선은 2px 간격으로 합성하고 픽셀 판정은 해당 영역에 마우스가 접근할 때만 읽어 재사용합니다. 눈 두께 0.25px 미만의 변화는 재합성을 생략하며, 비드래그 애니메이션은 30Hz, 드래그는 60Hz로 처리합니다.

로컬 CPU Canvas 벤치마크(1920px 표면, 준비 후 50회 평균): 이전 26.25ms, 수정 9.66ms. Windows 실제 프레임 속도 측정값이 아닙니다. 최초 텍스처 생성 비용은 남아 있습니다.

## 0.2.6 빈 화면 시작 / 유지형 눈 레이어

새 창의 초기 눈 높이 20을 제거해 0부터 쌓입니다. 시작 시 화면 중간에 눈송이를 미리 채우지 않습니다. 이는 저장 캐시 복원이 아니라 초기화 코드였습니다. 쌓인 눈은 별도 캔버스로 유지하며 적설/창 구조/표시 설정이 바뀔 때만 다시 합성합니다. 완전히 가려진 창은 렌더링을 생략합니다. 클릭 검사는 포인터 한 픽셀만 읽고 최대 64개를 재사용합니다. 텍스처 캐시는 0.2.5 방식을 유지합니다.

F8로 렌더러 성능 표시를 켤 수 있습니다(오버레이가 키 입력을 받을 때). Snow layer는 현재 프레임 눈 처리 시간, Frame CPU는 JS 프레임 처리 시간이며 GPU/DWM 시간이나 실제 표시 FPS가 아닙니다. Windows 실행 검증은 별도로 필요합니다. 구간별 적설 갱신과 창 추적 이벤트 전환은 포함하지 않았습니다.

## 0.2.7 산타 부르기 제거

산타 버튼, IPC 허용 액션, 오버레이 생성/업데이트/그리기 경로를 제거했습니다. 강설량은 눈송이 생성 빈도에 비례하며 적설 상한은 공통입니다. 환경설정/전구/제설차 신규 DEMO는 이번 실행 코드에 적용하지 않았습니다.

## 0.2.8 크리스마스 DEMO 디자인 적용

접힌 위젯은 승인된 이미지 에셋과 드래그 영역을 사용합니다(280×96). 펼친 설정은 1000×590 가로형의 초록/버건디/황동 UI로 구현했습니다. 헤더 창가 장식에 시안 이미지를 활용하고 나머지는 실제 HTML 컨트롤입니다. 접기 버튼과 숨기기를 구분했습니다. 원본 시안의 생성 오류 문구는 실제 한글 텍스트로 교체했습니다.

전구 줄은 움직임 유지를 위해 시안의 유리/황동 소켓 형태를 4배 해상도 캐시 스프라이트로 재구현했으며, 급한 점멸을 완만하게 바꿨습니다. 제설차는 새 버건디 차량 이미지를 384×240 캐시로 축소한 뒤 사용하며 기존 제설량/이동/눈더미 동작을 유지합니다. 원본 해상도 이미지를 프레임마다 재가공하지 않습니다.

기존 눈 시작량 0, 적설 레이어 최적화, 산타 제거를 유지합니다. Node 자동 검사 및 문법 검사 통과. 현재 환경에서 Chromium은 소켓 권한 제한으로 실행하지 못해 실제 UI/Windows 실행 검증은 미완료입니다.

## 0.2.9 전환/위치 및 이동 프레임 수정

설정 전환은 220ms 펼침/180ms 접힘 애니메이션으로 복원했습니다(동작 줄이기 환경에서는 생략). 창 크기 변경 요청은 한 번만 보내며 왼쪽 위 기준점을 유지합니다. 화면 밖으로 나가는 경우에만 보정하고, 접을 때 기준점으로 복귀합니다. 헤더의 잘라 넣은 설정창 스크린샷 배경 대신 별도 CSS 창틀/랜턴 장식을 사용합니다.

오버레이는 requestAnimationFrame 기반 최대 60Hz로 표시하며 물리는 최대 1/120초 소단위로 처리합니다. 이는 실제 60FPS 보장이 아닙니다. 적설 래스터의 높이를 안정화하고 변경된 열 주변을 128px 구간으로 묶어 다시 그립니다. 텍스처의 기준 높이 또는 표면 크기가 바뀌면 전체 갱신으로 전환합니다. 적설 레이어 최종 합성은 아직 전체 레이어 방식입니다.

자동 검사 33개 및 문법 검사 통과. CPU Canvas에서 1920px 표면의 제설 구간 부분 갱신을 전체 갱신과 비교해 경계의 미세 차이만 확인했습니다. Windows 실제 UI/성능 검증은 미완료입니다.

0.2.7과 비교할 때 기존 앱을 완전히 종료한 후 각각 별도 폴더에서 실행하세요. 0.2.7 소스는 변경하지 않았습니다.

## 0.2.10 WhiteChrismas / 플럼 차콜

환경설정의 기존 WhiteChirsmas 제목과 부제를 제거하고 요청한 WhiteChrismas 표기로 변경했습니다. 접힌 위젯과 펼친 헤더에 동일한 새 플럼 색상 위젯 이미지를 사용합니다. 펼친 헤더는 별도 중복 제목 없이 이미지로 표시하고 접근성 제목을 유지합니다. UI의 초록색은 스모키 플럼/차콜/샴페인 골드로 변경했습니다.

눈덩이 굴리기마다 pile.raster를 삭제하던 처리를 제거했습니다. 적설 캐시를 유지해 부분 갱신과 클릭 검사를 이어갑니다. 캐시 보존 및 성장 회귀 검사를 추가했습니다. Windows 실제 성능 검증은 미완료입니다.

## 0.2.11 위젯 이동/접기 입력 수정

접힌 위젯 전체에서 포인터 드래그를 지원합니다. 5px 이동 임계값으로 클릭과 구분하고 드래그 직후 클릭은 억제합니다. 펼친 창은 로고와 빈 영역에서 이동 가능하며 설정 버튼/입력은 원래 조작을 유지합니다. 별도 6점 핸들을 제거하고 로고 및 최소화 버튼에 접기를 연결했습니다. Electron drag 영역이 버튼을 방해하지 않도록 포인터 방식으로 전환했습니다. 애니메이션 대기는 300ms로 제한했습니다.

펼칠 때 현재 왼쪽 위 좌표를 유지합니다. 화면 오른쪽/아래 공간이 부족하면 위치를 옮기지 않고 크기를 줄입니다. 너무 가장자리에서는 설정창이 좁아질 수 있으므로 위젯을 안쪽으로 이동하면 넓게 열 수 있습니다. Windows 실제 동작 검증은 미완료입니다.

## 0.2.12 로고 위치 고정

접힌 로고와 펼친 로고의 중복 요소를 제거하고 동일한 #toggle 요소를 계속 사용합니다. 양 상태에서 x=0,y=0,width=280,height=96의 동일한 로컬 영역과 동일한 배경 이미지를 유지합니다. 펼친 상태의 마진/테두리로 생기던 내부 오프셋을 제거했습니다. 전환 애니메이션에서 로고를 이동/확대/페이드하지 않고, 설정 프레임의 클리핑 영역만 280×96에서 펼치고 접습니다. 네이티브 창의 왼쪽 위 위치 고정도 유지합니다.

자동 검사 36개 및 문법 검사 통과. Windows 실제 화면 동작 검증은 미완료입니다.

## 0.2.13 굴리기/들기 분리 및 가장자리 UI

눈 위에서 잡으면 처음 잡은 포인터 높이를 기준으로 굴리기를 유지합니다. 18px 이상 위로 들거나 표면을 벗어나거나 지지 창이 움직이면 자유 들기로 전환합니다. 굴릴 때 눈덩이 중심을 마우스 높이로 반복 재설정하지 않으며, 표면에 놓을 때 가로 속도를 보존합니다. 기존 물리의 마찰/가장자리 낙하를 이용합니다.

화면 맨 아래 장식 적설은 상한 34에서 6으로 낮추고 눈 생성 클릭 판정에서 제외했습니다. 작업표시줄 위 눈의 상호작용은 유지합니다.

오른쪽 공간 부족 시 설정 본체 최소 폭 360을 확보하고 내부 로고 오프셋을 보정해 로고의 화면 좌표는 유지합니다. 좁은 창은 한 열 스크롤 구성입니다. 창 배경을 독립 가상 요소로 분리해 로고를 제외한 배경/내용을 220~240ms로 페이드합니다.

자동 검사 39개 및 문법 검사 통과. Windows 실제 조작/표시/성능 검증은 아직 미완료입니다.

## 0.2.14 장식 안내 통일 / 모드 해제 시 눈 초기화

장식 배치 안내를 공통 drawPlacementHint로 통합했습니다. 문구는 클릭하면 놓을 수 있어요 :) 이며 아이보리 배경 #fff8eb / 갈색 글자 #806b58을 사용합니다. 겨울 모드 해제 시 적설, 눈송이/낙하 조각, 눈덩이/눈사람, 제설차와 표시 캐시를 비웁니다. 트리/전구/선물 및 랜턴/군고구마 장식은 유지하고, 잡고 있던 장식은 놓습니다. 다시 켤 때 적설은 0부터 시작합니다.

새 트리/3단 눈사람 디자인은 DEMO이며 실행 코드에 아직 적용하지 않았습니다. 현재 트리의 기울기/흔들림 모션은 그대로 유지했습니다. Windows 실제 실행 검증 미완료.

## 0.2.15 플럼 트리 / 3단 눈사람 적용

트리는 새 이미지에서 화분과 나무 부분을 나눠 화분은 고정하고 나무에 기존 tilt 물리를 적용합니다. 기존 기울기/흔들림 계산과 제자리 이동 동작은 유지합니다. 이미지는 한 번 축소한 캐시를 재사용합니다.

눈사람은 세 물리 눈덩이를 그대로 그리고 새 아트의 밑동/몸통 텍스처를 원형 경계 안에 합성합니다. 모자/얼굴/목도리/팔은 각 눈덩이의 위치 및 반지름을 따라 별도로 배치합니다. 단순 전체 이미지로 교체하지 않아 기존 원형 충돌과 조립/낙하/드래그 동작을 유지합니다. 원본 DEMO와 외형 비율은 조금 다를 수 있으며 장식 바깥의 모자/팔은 별도 클릭 영역이 아닙니다.

자동 검사 41개 및 문법 검사 통과. 렌더링 미리보기로 서로 다른 크기의 조합을 확인했습니다. Windows 실제 동작 검증은 미완료입니다.
