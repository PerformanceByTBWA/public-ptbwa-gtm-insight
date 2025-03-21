const getUrl = require('getUrl');
const getReferrerUrl = require('getReferrerUrl');
const getCookieValues = require('getCookieValues');
const setCookie = require('setCookie');
const generateRandom = require('generateRandom');
const getTimestampMillis = require('getTimestampMillis');
const sendPixel = require('sendPixel');
const encodeUriComponent = require('encodeUriComponent');
const JSON = require('JSON');

const COOKIE_NAME = '_insight_uid';
const GA_COOKIE = '_ga';
const PIXEL_ENDPOINT = 'https://yourdomain.com/insight-pixel';


function createUuid() {
  const hex = '0123456789abcdef';
  const sections = [8, 4, 4, 4, 12];
  let uuid = '';
  for (let i = 0; i < sections.length; i++) {
    if (i > 0) uuid += '-';
    for (let j = 0; j < sections[i]; j++) {
      uuid += hex.charAt(Math.floor(generateRandom(0, 16)));
    }
  }
  return uuid;
}


function getOrCreateUid(cookieName) {
  let uid = getCookieValues(cookieName)[0];
  if (!uid) uid = createUuid();
  setCookie(cookieName, uid, {
    'max-age': 60 * 60 * 24 * 30, // 30일
    'secure': true
  });
  return uid;
}


function serialize(params) {
  return Object.keys(params)
    .map(key => key + '=' + encodeUriComponent(params[key] || ''))
    .join('&');
}


(function () {
  const userId = getOrCreateUid(COOKIE_NAME);
  const gaId = getCookieValues(GA_COOKIE)[0] || '';
  const timestamp = getTimestampMillis();

  const payload = {
    pid: data.pixelId,
    eid: createUuid(),
    ev: data.eventType,
    scroll: data.scrollDepth,
    time: data.timeOnPage,
    click: data.clickedId,
    conv_type: data.conversionType,
    conv_value: data.conversionValue,
    conv_meta: data.conversionMeta ? JSON.stringify(data.conversionMeta) : '',
    cid: userId,
    gid: gaId,
    url: getUrl(),
    ref: getReferrerUrl(),
    ts: timestamp
  };

  const pixelUrl = PIXEL_ENDPOINT + '?' + serialize(payload);

  sendPixel(pixelUrl, data.gtmOnSuccess, data.gtmOnFailure);
})();


___TEMPLATE_PARAMETERS___


[
  {
    "type": "TEXT",
    "name": "pixelId",
    "displayName": "Pixel ID",
    "simpleValueType": true,
    "valueValidators": [
      { "type": "NON_EMPTY" }
    ]
  },
  {
    "type": "TEXT",
    "name": "eventType",
    "displayName": "Event Type",
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "scrollDepth",
    "displayName": "Scroll Depth (%)",
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "timeOnPage",
    "displayName": "Time on Page (ms)",
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "clickedId",
    "displayName": "Clicked Element ID or Class",
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "conversionType",
    "displayName": "Conversion Type (lead, purchase, etc.)",
    "simpleValueType": true
  },
  {
    "type": "TEXT",
    "name": "conversionValue",
    "displayName": "Conversion Value (USD)",
    "simpleValueType": true,
    "valueValidators": [
      { "type": "NON_NEGATIVE_NUMBER" }
    ]
  },
  {
    "type": "TEXT",
    "name": "conversionMeta",
    "displayName": "Conversion Metadata (optional JSON)",
    "simpleValueType": true
  }
]

___WEB_PERMISSIONS___

[
  {
    "instance": {
      "key": { "publicId": "send_pixel", "versionId": "1" },
      "param": [
        { "key": "allowedUrls", "value": { "type": 1, "string": "specific" } },
        {
          "key": "urls",
          "value": {
            "type": 2,
            "listItem": [
              { "type": 1, "string": "https://yourdomain.com/*" }
            ]
          }
        }
      ]
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": { "publicId": "get_cookies", "versionId": "1" },
      "param": [
        { "key": "cookieAccess", "value": { "type": 1, "string": "specific" } },
        {
          "key": "cookieNames",
          "value": {
            "type": 2,
            "listItem": [
              { "type": 1, "string": "_insight_uid" },
              { "type": 1, "string": "_ga" }
            ]
          }
        }
      ]
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": { "publicId": "set_cookies", "versionId": "1" },
      "param": [
        {
          "key": "allowedCookies",
          "value": {
            "type": 2,
            "listItem": [
              {
                "type": 3,
                "mapKey": [
                  { "type": 1, "string": "name" },
                  { "type": 1, "string": "domain" },
                  { "type": 1, "string": "path" },
                  { "type": 1, "string": "secure" },
                  { "type": 1, "string": "session" }
                ],
                "mapValue": [
                  { "type": 1, "string": "_insight_uid" },
                  { "type": 1, "string": "*" },
                  { "type": 1, "string": "*" },
                  { "type": 1, "string": "secure" },
                  { "type": 1, "string": "any" }
                ]
              }
            ]
          }
        }
      ]
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": { "publicId": "get_url", "versionId": "1" },
      "param": [
        { "key": "urlParts", "value": { "type": 1, "string": "any" } },
        { "key": "queriesAllowed", "value": { "type": 1, "string": "any" } }
      ]
    },
    "isRequired": true
  },
  {
    "instance": {
      "key": { "publicId": "get_referrer", "versionId": "1" },
      "param": [
        { "key": "urlParts", "value": { "type": 1, "string": "any" } },
        { "key": "queriesAllowed", "value": { "type": 1, "string": "any" } }
      ]
    },
    "isRequired": true
  }
]

___TESTS___ 

scenarios:
  - name: PageView pixel fires correctly
    code: |-
      const mockUrl = [];
      mock('sendPixel', function(url, success, fail) {
        mockUrl.push(url);
        if (success) success();
      });
      mock('getCookieValues', () => ['uuid-123']);
      mock('getUrl', () => 'https://example.com/page');
      mock('getReferrerUrl', () => 'https://referrer.com');
      mock('getTimestampMillis', () => 1234567890);
      mock('generateRandom', () => 1);

      runCode({
        pixelId: 'abc123',
        eventType: 'page_view'
      });

      assertApi('sendPixel').wasCalled();
      assertApi('gtmOnSuccess').wasCalled();
      assertThat(mockUrl[0]).contains('ev=page_view');
      assertThat(mockUrl[0]).contains('pid=abc123');

  - name: Conversion event is serialized and sent
    code: |-
      const mockUrl = [];
      mock('sendPixel', function(url, success, fail) {
        mockUrl.push(url);
        if (success) success();
      });
      mock('getCookieValues', () => ['uuid-abc']);
      mock('getUrl', () => 'https://example.com/thankyou');
      mock('getReferrerUrl', () => 'https://ad.com');
      mock('getTimestampMillis', () => 999999999);
      mock('generateRandom', () => 1);

      runCode({
        pixelId: 'abc123',
        eventType: 'purchase',
        conversionType: 'purchase',
        conversionValue: '49.99',
        conversionMeta: '{"coupon":"NEW50"}'
      });

      assertApi('sendPixel').wasCalled();
      assertApi('gtmOnSuccess').wasCalled();
      assertThat(mockUrl[0]).contains('conv_type=purchase');
      assertThat(mockUrl[0]).contains('conv_value=49.99');
      assertThat(mockUrl[0]).contains('conv_meta=%7B%22coupon%22%3A%22NEW50%22%7D');

  - name: Cookie is set when not exists
    code: |-
      mock('getCookieValues', () => []);
      mock('setCookie', () => {});
      mock('sendPixel', (url, s, f) => s && s());
      mock('getUrl', () => 'https://test.com');
      mock('getReferrerUrl', () => '');
      mock('getTimestampMillis', () => 1234);
      mock('generateRandom', () => 1);

      runCode({
        pixelId: 'abc123',
        eventType: 'scroll',
        scrollDepth: '80'
      });

      assertApi('setCookie').wasCalled();
      assertApi('sendPixel').wasCalled();
      assertApi('gtmOnSuccess').wasCalled();

  - name: gtmOnFailure is triggered on send error
    code: |-
      mock('sendPixel', function(url, success, fail) {
        if (fail) fail();
      });

      runCode({
        pixelId: 'fail123',
        eventType: 'click'
      });

      assertApi('gtmOnFailure').wasCalled();

