# Ptbwa Insight Pixel - Detailed Usage Guide

> This guide is written for developers and non-developers who are not familiar with Google Tag Manager (GTM) or GTM templates.
> Follow the steps below to install the pixel and start tracking events from scratch.

---

## Table of Contents

1. [What are GTM and Pixel?](#1-what-are-gtm-and-pixel)
2. [Prerequisites](#2-prerequisites)
3. [Importing the Template (One-time Setup)](#3-importing-the-template-one-time-setup)
4. [Setting Up Tags by Event Type](#4-setting-up-tags-by-event-type)
   - [Page View (page_view)](#41-page-view-page_view)
   - [Click (click)](#42-click-click)
   - [Scroll (scroll)](#43-scroll-scroll)
   - [Conversion (conversion)](#44-conversion-conversion)
5. [Configuring Triggers](#5-configuring-triggers)
6. [Verifying with Preview Mode](#6-verifying-with-preview-mode)
7. [Publishing](#7-publishing)
8. [Automatically Collected Data](#8-automatically-collected-data)
9. [FAQ / Common Mistakes](#9-faq--common-mistakes)

---

## 1. What are GTM and Pixel?

### What is Google Tag Manager (GTM)?
GTM is a free Google tool that lets you manage tracking codes (tags) on your website without directly modifying the source code.
Once the GTM snippet is added to your site (a one-time setup), all future tag management is done through the GTM web console.

### What is a Pixel?
A pixel is a small piece of tracking code that records user behavior on your website (e.g., clicks, purchases).
**Ptbwa Insight Pixel** sends this data to the Addirect platform.

### What is a GTM Template?
A GTM template is a pre-packaged pixel implementation.
By importing the `template.tpl` file into GTM once, you can manage the pixel entirely through a UI — no coding required.

---

## 2. Prerequisites

| Item | How to Check |
|------|--------------|
| **GTM Account** | Sign in at [tagmanager.google.com](https://tagmanager.google.com) and create an account & container |
| **GTM Snippet Installed** | The GTM snippet must be added to your website's `<head>` and `<body>` tags |
| **Pixel ID** | Obtain a Pixel ID (starts with `sk_`) from your Addirect account manager |
| **template.tpl File** | Download `template.tpl` from this repository |

> **What is the GTM Snippet?**
> It is a short piece of HTML code that needs to be inserted into your website once by a developer.
> You can find it in the GTM console under **Admin → Install Google Tag Manager**.

---

## 3. Importing the Template (One-time Setup)

This registers the **Ptbwa Insight Pixel** template in your GTM container. Only needs to be done once per container.

### Step-by-Step

**Step 1** — Go to [tagmanager.google.com](https://tagmanager.google.com) and select your container.

**Step 2** — Click **Templates** in the left sidebar.

**Step 3** — Under "Tag Templates", click **New**.

**Step 4** — In the template editor, click the **⋮ (three-dot menu)** in the upper right corner.

**Step 5** — Select **Import** and choose the `template.tpl` file you downloaded.

**Step 6** — Once the template loads, click **Save**.

✅ The "Ptbwa Insight Pixel" template is now available in this container.

---

## 4. Setting Up Tags by Event Type

Create a **separate tag** for each type of event you want to track.

> **What is a Tag?** In GTM, a tag is a unit of code that fires when a specific condition (trigger) is met.

### Common Tag Creation Steps

1. In the left sidebar, go to **Tags** → **New**
2. Click the **Tag Configuration** area → select **Ptbwa Insight Pixel**
3. Configure the fields according to the event type (see sections below)
4. Set the execution condition in the **Triggering** section ([see Section 5](#5-configuring-triggers))
5. Enter a tag name and click **Save**

---

### 4.1 Page View (page_view)

Fires every time a user visits a page. This is the most basic event.

| Field | Value |
|-------|-------|
| **Pixel ID** | Your Pixel ID from Addirect (e.g., `sk_abc123...`) |
| **Event Type** | `page_view` |

**Trigger**: Connect the `All Pages` trigger.

---

### 4.2 Click (click)

Fires when a user clicks a specific button or link.

| Field | Value |
|-------|-------|
| **Pixel ID** | Your Pixel ID from Addirect |
| **Event Type** | `click` |
| **Click ID** | The `id` attribute of the HTML element to track (e.g., `btn-apply`) |

**How to find the Click ID**: Right-click the target element in your browser → **Inspect** → look for `id="..."` in the HTML.

**Trigger**: Configure a click trigger for that element ([see Section 5](#5-configuring-triggers)).

---

### 4.3 Scroll (scroll)

Fires when a user scrolls to a certain depth on the page.

| Field | Value |
|-------|-------|
| **Pixel ID** | Your Pixel ID from Addirect |
| **Event Type** | `scroll` |
| **Scroll Depth** | Scroll depth value to track (number — GTM variable recommended) |

**Tip**: Enter the built-in GTM variable `{{Scroll Depth Threshold}}` in the **Scroll Depth** field.
This automatically passes the actual scroll position from the scroll depth trigger.

**Trigger**: Configure a "Scroll Depth" trigger ([see Section 5](#5-configuring-triggers)).

---

### 4.4 Conversion (conversion)

Tracks key user actions such as purchases, orders, sign-ups, logins, refunds, and coupon usage.

| Field | Value | When Shown |
|-------|-------|------------|
| **Pixel ID** | Your Pixel ID from Addirect | Always |
| **Event Type** | `conversion` | Always |
| **Conversion Type** | `purchase` / `order` / `signup` / `signin` / `refund` / `apply_coupon` / `download_coupon` | When Event Type is `conversion` |
| **Conversion Value** | Transaction, refund, or discount amount (number, e.g., `49.99`) | Required when type is `purchase`, `order`, `refund`, or `apply_coupon` |
| **Conversion Meta** | Additional data as a string (e.g., `{"coupon":"SAVE10"}`) | When Event Type is `conversion` (optional) |

**Conversion Type Reference**:

| Value | Meaning | Conversion Value Required |
|-------|---------|--------------------------|
| `purchase` | Payment completed | ✅ Required |
| `order` | Order placed | ✅ Required |
| `signup` | User registration completed | ❌ Not required |
| `signin` | User login | ❌ Not required |
| `refund` | Payment refunded | ✅ Required |
| `apply_coupon` | Coupon applied | ✅ Required |
| `download_coupon` | Coupon downloaded | ❌ Not required |

**Passing Dynamic Conversion Values (for Developers)**:
Since conversion values differ per transaction, it is recommended to use a GTM **Data Layer Variable**.

```js
// Push to dataLayer on the order confirmation page
window.dataLayer = window.dataLayer || [];
window.dataLayer.push({
  event: 'purchase_complete',
  purchase_amount: 49.99,
  coupon_code: 'SAVE10'
});
```

In GTM, create `purchase_amount` as a Data Layer Variable and connect it to the **Conversion Value** field.

---

## 5. Configuring Triggers

A trigger defines **when** a tag should fire.

### 5.1 All Pages Trigger (for page_view)

1. Click the **Triggering** section at the bottom of the tag editor
2. Click **+** → select **Page View** as the trigger type
3. Choose **All Page Views** → Save

### 5.2 Click Trigger (for click)

1. Trigger type: select **All Elements** or **Just Links**
2. Set condition: `Click ID` **equals** `btn-apply` (the HTML `id` value)

> **Enabling GTM Variables**: Go to GTM console → **Variables** → **Configure** → enable `Click ID`, `Click Classes`, etc. before using them in trigger conditions.

### 5.3 Scroll Depth Trigger (for scroll)

1. Trigger type: select **Scroll Depth**
2. Check **Vertical Scroll Depths**
3. Unit: **Percentages** / Thresholds: `25,50,75,100` (comma-separated)
4. Fire on: **Once per page**

### 5.4 Conversion Trigger (for conversion)

Conversion events are typically fired when a user lands on a specific page (e.g., `/order/complete`).

1. Trigger type: **Page View**
2. Condition: `Page URL` **contains** `/order/complete`

Alternatively, use a **Custom Event** trigger when using `dataLayer.push()` integration.

---

## 6. Verifying with Preview Mode

Always use **Preview Mode** to verify that your tags fire correctly before publishing.

1. Click the **Preview** button in the upper right of the GTM console
2. Enter your website URL and click **Connect**
3. Your site opens with the **GTM debug panel** at the bottom
4. Navigate pages or click buttons to check that tags fire as expected

**What to check**:
- **Ptbwa Insight Pixel** appears in the tag list
- The tag status shows **✅ Fired**
- Click the tag to inspect the parameters sent (`pid`, `ev`, `cid`, etc.)

---

## 7. Publishing

Once you have verified everything in Preview Mode, publish your changes.

1. Click the **Submit** button in the upper right of the GTM console
2. Enter a **Version Name** (e.g., `Initial Insight Pixel Setup`)
3. Click **Publish**

> ⚠️ Tags are **not applied to real users** until you publish.
> Always verify in Preview Mode before publishing.

---

## 8. Automatically Collected Data

The pixel automatically collects the following data on every tag fire — no additional configuration required.

| Field | Description | Retention |
|-------|-------------|-----------|
| `cid` | Unique user identifier (auto-generated via cookie) | 30 days |
| `gid` | Google Analytics user ID (from `_ga` cookie) | Per GA settings |
| `gclid` | Google Ads click ID (auto-captured from URL query params) | 90 days |
| `url` | Current page URL | — |
| `ref` | Referrer URL | — |
| `ts` | Event timestamp (milliseconds) | — |
| `utm_*` | UTM parameters (utm_source, utm_medium, utm_campaign, etc.) | — |

### How gclid is Handled Automatically
When users arrive from Google Ads, their URL contains a `gclid` parameter.
The pixel automatically detects this value and stores it in the `_insight_gclid` cookie for **90 days**,
ensuring that the ad click attribution is preserved across subsequent visits.

---

## 9. FAQ / Common Mistakes

**Q. My tag is not showing as "Fired" in Preview Mode.**
A. Check your trigger configuration. For a page view tag, make sure the "All Pages" trigger is connected.

**Q. Where do I get my Pixel ID?**
A. Contact your Addirect account manager to receive a Pixel ID starting with `sk_`.

**Q. I want to track the same event differently on different pages.**
A. Create multiple tags for the same event type and assign different triggers to each.

**Q. The tag works in Preview but not after publishing.**
A. Clear your browser cache and test again, or use an Incognito window.

**Q. What format should the Conversion Value be in?**
A. Enter a plain number only (e.g., `49.99`). Do not include currency symbols or commas.

**Q. Do I need a developer to install the GTM snippet?**
A. Yes, the snippet must be added to your website's HTML source code once. Ask your developer or website administrator.
After that, all tag management is done in the GTM console — no further coding needed.

**Q. Can I track multiple events at the same time?**
A. Yes. Create a separate tag for each event type and assign the appropriate trigger to each one.

---

> For further questions, contact your Addirect account manager or open an issue in this repository.
