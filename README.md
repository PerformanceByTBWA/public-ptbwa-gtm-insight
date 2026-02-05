# Ptbwa Insight Pixel GTM Template

This repository contains the GTM Template for **Insight Pixel**, allowing you to easily integrate behavioral and conversion tracking into your website using Google Tag Manager.

## Table of Contents

- [Introduction](#introduction)
- [Features](#features)
- [Parameters](#parameters)
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)

## Introduction

The Ptbwa Insight Pixel template simplifies sending event data (page views, clicks, scrolls, and conversions) to the Ptbwa Insight platform. It helps advertisers and marketers track user interactions and measure conversion performance with minimal configuration.

## Features

- **Comprehensive Tracking**: Supports standard events like page views, clicks, and scroll depth.
- **Conversion Tracking**: Easily send conversion events (purchase, signup, order, etc.) with custom values and metadata.
- **Sandboxed JavaScript**: Built using GTM's secure sandboxed environment.
- **Auto-Generated IDs**: Automatically handles unique event and user identification via cookies.

## Parameters

| Parameter            | Type   | Description                                                              |
| -------------------- | ------ | ------------------------------------------------------------------------ |
| **Pixel ID**         | Text   | The unique ID issued by Addirect. (Required)                             |
| **Event Type**       | Select | page_view, click, scroll, or conversion.                                 |
| **Scroll Depth**     | Text   | The value for scroll coordinates (shown when Event Type is 'scroll').    |
| **Click ID**         | Text   | The ID of the clicked element (shown when Event Type is 'click').        |
| **Conversion Type**  | Select | order, purchase, signup, signin (shown when Event Type is 'conversion'). |
| **Conversion Value** | Text   | The value of the conversion (shown for purchase/order).                  |
| **Conversion Meta**  | Text   | Additional metadata for the conversion in string format.                 |

## Installation

1. Download the `template.tpl` file from this repository.
2. Open **Google Tag Manager** and navigate to your container.
3. Go to **Templates** > **Tag Templates** and click **New**.
4. Click the three-dot menu in the upper right corner and select **Import**.
5. Select the `template.tpl` file you downloaded.
6. Click **Save**.

## Usage

1. In GTM, create a **New Tag**.
2. Select **Ptbwa Insight Pixel** as the Tag Type.
3. Enter your **Pixel ID**.
4. Choose the **Event Type** you want to track.
5. Set the appropriate **Trigger** (e.g., All Pages for `page_view`, or specific click triggers).
6. **Preview** and **Publish** your container.

## License

This project is licensed under the [Apache License 2.0](LICENSE).
