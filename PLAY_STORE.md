# Publish AURA on Google Play

Grok cannot upload to Play Console. You must do this from the Google account that will own the app.

## 1. Developer account
- Open https://play.google.com/console
- Pay the one-time $25 registration
- Complete identity verification

## 2. Turn the website into an Android app
AURA is a web app. Easiest Play path is a Trusted Web Activity (TWA) wrapping:
https://aura-farming-yasar9.vercel.app

Recommended tool: [PWABuilder](https://www.pwabuilder.com/)
1. Paste the live URL
2. Generate Android package
3. Download the `.aab` (Android App Bundle)

Or use Capacitor later if you want a full native shell.

## 3. Store listing copy
**Name:** AURA
**Short:** Give good energy. Get recognized.
**Full:**
AURA is a social reputation app. Give Honor (+) or Dishonor (−) Aura points for charisma, kindness, courage, humor and more. Climb levels, collect badges, add friends, and keep a streak.

Aura has no cash value and cannot be bought.

## 4. Required Play assets
- App icon 512×512 PNG — `/icon-512.png` on the live site
- Feature graphic 1024×500
- At least 2 phone screenshots
- Privacy policy URL: https://aura-farming-yasar9.vercel.app/privacy.html
- Content rating questionnaire
- Target API level required by Play (PWABuilder handles this)

## 5. Submit
Play Console → Create app → Production → App bundles → Upload AAB → Send for review.
Review often takes a few days.

## Install without Play (now)
On Android Chrome open:
https://aura-farming-yasar9.vercel.app
Menu → Add to Home screen / Install app.
