# jdSticky API

- Sticky 기능 구현.
- 해당 영역에 맞는 탭 활성화 구현.
- 부드러운 탭 이동 구현. (IE10+)

## 파일 구성

- jdSticky.js : 순수 자바스크립트로 만든 플러그인. (IE9+)
- jquery.jdSticky.js : 제이쿼리를 참조하는 플러그인. (IE8+)
- xxx.module.js : ES6 모듈 적용 소스.

## HTML

- 레이어팝업 이동을 위한 버튼에 data-layer-id의 값을 레이어팝업 ID와 동일하게 부여.

`<button type="button" data-layer-id="layer1">레이어팝업 열기</button>`

- 딤드는 dimmedEl 옵션에 부여한 값으로 클래스 설정.

`<div class="dimmed"></div>`

- 레이어팝업은 id를 꼭 부여해야하며, 레이어팝업 닫기 버튼은 closeEl 옵션에 부여한 값으로 클래스 설정. 

```
<div id="stickyNav">
    <nav class="nav">
        <!-- {secUse: true} 옵션 사용 시 ul(ol) 추가 -->
        <ul class="nav-list">
            <!-- href 속성에 이동시킬 각 섹션의 id를 기입 -->
            <li><a class="btn-move-sec" href="#sec1">1</a></li>
            <li><a class="btn-move-sec" href="#sec2">2</a></li>
            <li><a class="btn-move-sec" href="#sec3">3</a></li>
            <li><a class="btn-move-sec" href="#sec4">4</a></li>
        </ul>
    </nav>
</div>

<!-- 섹션 -->
<section id="sec1"></section>
<section id="sec2"></section>
<section id="sec3"></section>
<section id="sec4"></section>
```

## JS

- 기본구조

```javascript
var sticky = new JdSticky('#stickyNav', {
    secUse: true
    ...
});
```

- 옵션값

|속 성|내 용|기본값|타 입|비 고|
|:---|:---|:---|:---|:---|
|$delegate|클릭을 통한 스크롤 시 보여지는 전체 레이아웃|'.layout'|CSS selectors||
|$parent|내비게이션이 이동되어지는 영역|parentNode(메뉴 부모 엘리먼트)|CSS selectors||
|$child|상황에 따라 포지션이 바뀌어야하는 영역|firstElementChild(메뉴 자식 첫번째 엘리먼트)|CSS selectors||
|$list|스크롤에 따른 탭 변화 적용 시 사용될 리스트 영역|'.nav-list'|CSS selectors|ul,ol 태그에만 가능|
|secUse|스크롤에 따른 탭 이벤트 설정 여부|false|boolean||
|setClass|노출/비노출 토글 클래스명|'on'|classname|secUse:true 일 시 사용|
|btnClass|탭 버튼 클래스명|'btn-move-sec'|classname|secUse:true 일 시 사용|
|duration|탭 이동시 속도|500|number|secUse:true 일 시 사용|
|easing|탭 이동시 가속운동(transition-timing-function)|'ease'|string|secUse:true 일 시 사용|
|$easing|탭 이동시 가속운동($.animate easing)|'swing'|string|jquery.jdSticky.js 에서만 존재|
|callback|콜백 함수|function (isSticky) {}|function|param : sticky 구간 유무|