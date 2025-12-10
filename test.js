// [1] Output Mocking: sendPixel 캡처
var triggerUrls = [];
mock('sendPixel', function(url, onSuccess, onFailure) {
  triggerUrls.push(url);
  if (onSuccess) onSuccess();
});

// [2] Input Mocking: 고정된 입력값 설정
// _insight_uid와 _ga 쿠키를 고정
mock('getCookieValues', (cookieName) => {
  if (cookieName === '_insight_uid') return ['test-cid-1111'];
  if (cookieName === '_ga') return ['GA1.1.999999999.111111111'];
  return [];
});

// 기타 환경 변수 고정
mock('getUrl', () => 'https://example.com/checkout');
mock('getReferrerUrl', () => 'https://example.com/product');
mock('getTimestampMillis', () => 1672531200000);
// 난수 고정으로 createUuid() 결과가 예측 가능하도록 함
mock('generateRandom', () => 1); 

// setCookie는 로직 실행을 위해 모의 처리 (실제 쿠키 설정 방지)
mock('setCookie', () => {});


// [3] Execution: 샘플 데이터로 템플릿 코드 실행
runCode({
  pixelId: 'ptbwa-abc123',
  eventType: 'view_item',
  scrollDepth: '50',
  clickedId: 'buy-button',
  conversionType: 'purchase',
  conversionValue: '100.00',
  conversionMeta: '{"currency":"KRW"}' // JSON 형식 문자열
});


// [4] Assertion: 결과 검증

// 1. 태그가 성공적으로 완료되었는지 확인
assertApi('gtmOnSuccess').wasCalled();

// 2. sendPixel이 호출되었는지 확인
assertApi('sendPixel').wasCalled();
assertThat(triggerUrls.length).isEqualTo(1); // 한 번만 전송되었는지 확인

// 3. 전송된 URL의 필수 파라미터 검증 (일부만 검증)
const sentUrl = triggerUrls[0];

// 자체 픽셀 엔드포인트와 필수 ID 검증
assertThat(sentUrl).contains('https://cs.ptbwa.com/v1/?');
assertThat(sentUrl).contains('pid=ptbwa-abc123'); // pixelId 검증
assertThat(sentUrl).contains('cid=test-cid-1111'); // 고정된 CID 검증

// 이벤트 및 컨버전 파라미터 검증
assertThat(sentUrl).contains('ev=view_item');
assertThat(sentUrl).contains('conv_value=100.00');

// JSON 데이터가 올바르게 URL 인코딩되었는지 검증
// {"currency":"KRW"} -> %7B%22currency%22%3A%22KRW%22%7D
assertThat(sentUrl).contains('conv_meta=%7B%22currency%22%3A%22KRW%22%7D');
