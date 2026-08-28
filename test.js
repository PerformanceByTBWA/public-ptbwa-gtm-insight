// [1] Output Mocking: sendPixel 캡처
var triggerUrls = [];
mock("sendPixel", function (url, onSuccess, onFailure) {
  triggerUrls.push(url);
  if (onSuccess) onSuccess();
});

// [2] Input Mocking: 고정된 입력값 설정
// _insight_uid와 _ga 쿠키를 고정
mock("getCookieValues", (cookieName) => {
  if (cookieName === "_insight_uid") return ["test-cid-1111"];
  if (cookieName === "_ga") return ["GA1.1.999999999.111111111"];
  return [];
});

// 기타 환경 변수 고정
mock("getUrl", () => "https://example.com/checkout");
mock("getReferrerUrl", () => "https://example.com/product");
mock("getTimestampMillis", () => 1672531200000);
// 난수 고정으로 createUuid() 결과가 예측 가능하도록 함
mock("generateRandom", () => 1);

// setCookie는 로직 실행을 위해 모의 처리 (실제 쿠키 설정 방지)
mock("setCookie", () => {});

// [3] Execution: 샘플 데이터로 템플릿 코드 실행
runCode({
  pixelId: "ptbwa-abc123",
  eventType: "conversion",
  conversionType: "purchase",
  conversionValue: "100.00",
  conversionMeta: '{"currency":"KRW"}',
});

// [4] Assertion: 결과 검증

// 1. 태그가 성공적으로 완료되었는지 확인
assertApi("gtmOnSuccess").wasCalled();

// 2. sendPixel이 호출되었는지 확인
assertApi("sendPixel").wasCalled();
assertThat(triggerUrls.length).isEqualTo(1); // 한 번만 전송되었는지 확인

// 3. 전송된 URL의 필수 파라미터 검증 (일부만 검증)
const sentUrl = triggerUrls[0];

// 자체 픽셀 엔드포인트와 필수 ID 검증
assertThat(sentUrl).contains("https://cs.ptbwa.com/v1/?");
assertThat(sentUrl).contains("pid=ptbwa-abc123"); // pixelId 검증
assertThat(sentUrl).contains("cid=test-cid-1111"); // 고정된 CID 검증

// 이벤트 및 컨버전 파라미터 검증
assertThat(sentUrl).contains("ev=conversion");
assertThat(sentUrl).contains("conv_value=100.00");

// JSON 데이터가 올바르게 URL 인코딩되었는지 검증
// {"currency":"KRW"} -> %7B%22currency%22%3A%22KRW%22%7D
assertThat(sentUrl).contains("conv_meta=%7B%22currency%22%3A%22KRW%22%7D");

// ──────────────────────────────────────────────────────
// [5] gclid 테스트 케이스
// ──────────────────────────────────────────────────────

// === 테스트 5-1: URL 파라미터에 gclid가 있을 때 payload에 포함되어야 함 ===
var gclidUrlTestUrls = [];
mock("sendPixel", function (url, onSuccess, onFailure) {
  gclidUrlTestUrls.push(url);
  if (onSuccess) onSuccess();
});

// URL에 gclid 파라미터가 있는 경우를 시뮬레이션
mock("getQueryParameters", (param) => {
  if (param === "gclid") return "EAIaIQobChMI_test_gclid_value";
  return "";
});
mock("getCookieValues", (cookieName) => {
  if (cookieName === "_insight_uid") return ["test-cid-1111"];
  if (cookieName === "_ga") return ["GA1.1.999999999.111111111"];
  return []; // _insight_gclid 쿠키는 없음
});

runCode({
  pixelId: "ptbwa-abc123",
  eventType: "page_view",
});

assertApi("gtmOnSuccess").wasCalled();
assertThat(gclidUrlTestUrls[0]).contains("gclid=EAIaIQobChMI_test_gclid_value");
// gclid가 URL에 있을 때 setCookie가 호출(저장)되는지 확인
assertApi("setCookie").wasCalled();
assertApi("setCookie").wasCalledWith("_insight_gclid", "EAIaIQobChMI_test_gclid_value", {
  "max-age": 60 * 60 * 24 * 90,
  secure: true,
  path: "/",
});

// === 테스트 5-2: URL에 gclid가 없고 쿠키에 저장된 gclid가 있을 때 fallback ===
var gclidCookieTestUrls = [];
mock("sendPixel", function (url, onSuccess, onFailure) {
  gclidCookieTestUrls.push(url);
  if (onSuccess) onSuccess();
});

// URL에는 gclid 없음
mock("getQueryParameters", (param) => "");
// 쿠키에 이전에 저장된 gclid 존재
mock("getCookieValues", (cookieName) => {
  if (cookieName === "_insight_uid") return ["test-cid-1111"];
  if (cookieName === "_ga") return ["GA1.1.999999999.111111111"];
  if (cookieName === "_insight_gclid") return ["EAIaIQobChMI_stored_gclid"];
  return [];
});

runCode({
  pixelId: "ptbwa-abc123",
  eventType: "page_view",
});

assertApi("gtmOnSuccess").wasCalled();
assertThat(gclidCookieTestUrls[0]).contains("gclid=EAIaIQobChMI_stored_gclid");

// === 테스트 5-3: URL과 쿠키 모두 gclid 없을 때 빈 값으로 전송 ===
var gclidEmptyTestUrls = [];
mock("sendPixel", function (url, onSuccess, onFailure) {
  gclidEmptyTestUrls.push(url);
  if (onSuccess) onSuccess();
});

mock("getQueryParameters", (param) => "");
mock("getCookieValues", (cookieName) => {
  if (cookieName === "_insight_uid") return ["test-cid-1111"];
  if (cookieName === "_ga") return ["GA1.1.999999999.111111111"];
  return []; // _insight_gclid 쿠키도 없음
});

runCode({
  pixelId: "ptbwa-abc123",
  eventType: "page_view",
});

assertApi("gtmOnSuccess").wasCalled();
// gclid= 파라미터가 존재하되 빈 값으로 전송
assertThat(gclidEmptyTestUrls[0]).contains("gclid=");

// ──────────────────────────────────────────────────────
// [6] 경계값 및 쿠키 범위 테스트
// ──────────────────────────────────────────────────────

// 숫자 0은 빈 값이 아니라 유효한 전환값으로 전송되어야 함
var zeroValueTestUrls = [];
mock("sendPixel", function (url, onSuccess) {
  zeroValueTestUrls.push(url);
  if (onSuccess) onSuccess();
});
mock("getQueryParameters", () => "");
mock("getCookieValues", (cookieName) => {
  if (cookieName === "_insight_uid") return ["test-cid-1111"];
  return [];
});

runCode({
  pixelId: "ptbwa-abc123",
  eventType: "conversion",
  conversionType: "purchase",
  conversionValue: 0,
});

assertThat(zeroValueTestUrls[0]).contains("conv_value=0");
assertApi("setCookie").wasCalledWith("_insight_uid", "test-cid-1111", {
  "max-age": 60 * 60 * 24 * 30,
  secure: true,
  path: "/",
});

// 현재 URL의 UTM 파라미터는 픽셀 payload에 포함되어야 함
var utmTestUrls = [];
mock("sendPixel", function (url, onSuccess) {
  utmTestUrls.push(url);
  if (onSuccess) onSuccess();
});
mock("getQueryParameters", (param) => {
  const values = {
    utm_source: "google",
    utm_medium: "cpc",
    utm_campaign: "summer_sale",
    utm_term: "running shoes",
    utm_content: "hero_banner",
  };
  return values[param] || "";
});

runCode({
  pixelId: "ptbwa-abc123",
  eventType: "page_view",
});

assertThat(utmTestUrls[0]).contains("utm_source=google");
assertThat(utmTestUrls[0]).contains("utm_medium=cpc");
assertThat(utmTestUrls[0]).contains("utm_campaign=summer_sale");
assertThat(utmTestUrls[0]).contains("utm_term=running%20shoes");
assertThat(utmTestUrls[0]).contains("utm_content=hero_banner");
