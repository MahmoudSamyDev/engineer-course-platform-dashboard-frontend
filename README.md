# Course Platform Dashboard

**The control room for an in-person engineering course business. Publish a cohort, see who has paid, resolve what needs a decision and keep the public profile accurate, from a phone or a laptop, in Arabic first.**

![Status](https://img.shields.io/badge/status-in%20development-F5B400) ![Private](https://img.shields.io/badge/repository-private-1F2A37) ![Languages](https://img.shields.io/badge/languages-Arabic%20%C2%B7%20English-1F4FBF)

---

## The business

An experienced civil engineer in Cairo teaches practical, in-person structural design courses: ETABS, SAFE, Revit and the Egyptian code. Each course runs in **cohorts**, and every cohort has its own dates, venue, seat limit and price.

Until now, enrolment happened in chat. A student asked for details, sent a bank transfer, then sent a screenshot as proof. It cost the engineer hours every week, lost students who never got an answer in time, and left seats either unpaid or overbooked. On the first day nobody could prove who had really paid.

This platform replaces that with a complete online system. Students find a course, pay and receive a verifiable QR ticket on their own. The Dashboard is the other half: the private workspace where the engineer and an operator run everything behind the scenes, without calling a developer.

## The market

Practical structural-design training in Egypt is served in four ways, and each leaves something on the table.

| Offer | Where it is strong | Where it falls short |
|---|---|---|
| University course pages | A credible host, clear dates and fees | Plain notices with no instructor story; registering means contacting someone |
| Commercial training institutes | Detailed curricula and outcomes | No visible price or dates; every form ends in a sales call |
| Global online marketplaces | Low price, instant access | Recorded and generic; not built on the Egyptian code; no hands-on practice |
| Independent instructors | Personal trust and word of mouth | No owned website; details buried in social posts; manual payment and no proof of booking |

**The opportunity:** nobody combines a trusted, practicing engineer as the brand, transparent dates, prices and seats, and instant online booking with proof of purchase. That combination is the product. The Dashboard is what makes it sustainable, because a booking system is only as good as the person's ability to run it every day.

The audience shapes the product: students are mostly on Android phones and mobile data, read Arabic with English technical terms, and compare prices in social groups. So the platform is phone-first, right-to-left by default, light to load and upfront about price.

## The problem it solves

| For the owner | Without a dashboard |
|---|---|
| Opening a new cohort | Wait for a developer |
| "How many seats are sold?" | Someone counts by hand |
| "I paid but I have no ticket" | Nowhere to look it up |
| A late payment for a full session | A decision nobody is alerted to |
| A new bio, photo or certificate | The website quietly goes stale |
| Questions from the contact form | Buried in an email inbox |
| The first day of a course | No reliable list at the door, and no record of who attended |

## The solution

One private place to **publish, sell, check and fix**. Each area answers one question.

| Area | The question it answers | What it gives the owner |
|---|---|---|
| **Home** | How is the business doing? | Revenue, paid registrations and seats filled at a glance, a six-month revenue trend, upcoming sessions, and a *Needs action* list that surfaces anything waiting on a decision |
| **Students** | Who is registered? | Search by name, phone, email or booking reference; each student's booking, ticket and attendance; one-tap WhatsApp; CSV export |
| **Payments** | Do the numbers reconcile? | Totals for any filter, a full history of every payment, and the tools to refund, move or cancel a booking |
| **Courses** | What am I selling, and when? | Course cards, guided creation, bilingual content and curriculum, sessions with meetings in Cairo time, and a checklist that blocks publishing until everything students need is there |
| **Sessions** | Who is coming, and who came? | Rosters, a printable attendance sheet for the door, and per-meeting attendance with manual check-in |
| **Assistants** | Who scans tickets at the door? | Profiles for the centre's staff, with activation and deactivation that preserves their history |
| **Messages** | Who wrote, and have I replied? | An inbox for the website's contact form, with one-tap replies by email or WhatsApp in the sender's own language |
| **Profile** | What do students see about me? | The public profile (details, contact, bio, key numbers, certifications, career journey), edited by the owner and live on the website |

A quick search reaches any booking by reference, phone or email from anywhere in the app.

**A typical week**

- **Monday morning.** The owner opens Home on his phone: revenue, seats and two items under *Needs action*.
- **A new cohort.** He adds the course and its sessions, fills in the checklist and publishes. It is bookable on the website the same day, in under fifteen minutes of his time.
- **A worried student.** Someone says they paid but got no ticket. He types their phone number into the search, sees the booking and ticket, and replies on WhatsApp.
- **Session day.** He prints the roster for the door, and attendance is marked as students arrive.

## Why it stands out

**It protects the money and the seats.** A session can never be overbooked: capacity cannot drop below the seats already sold, and a course cannot go live without its bilingual essentials. Refunds, moves and cancellations follow strict rules, are safe against double clicks and retries, and keep a complete history. The Dashboard records refunds made in the payment gateway; it never moves money itself. These actions were reviewed independently before release.

**It is built for how the owner really works.** Arabic and right-to-left are the default, with English one tap away and remembered per account. The phone is a first-class screen, not a shrunken desktop: tables become readable rows and every page is verified at 360 px. Phone numbers, references and mixed Arabic-English text always render correctly.

**It is calm and quick to read.** Each screen answers one question with one clear action. Status is always a word and a marker, never colour alone. Empty screens explain what will appear. Unsaved edits are never lost silently.

**It treats personal data seriously.** Student details are visible only to signed-in staff. Searches never appear in links or logs. Sessions expire on their own, and nothing sensitive is stored in the browser. Signing out clears everything. This follows Egypt's Personal Data Protection Law.

**It is accessible and verified.** Every page and dialog is scanned automatically against WCAG 2.2 AA in both languages, on desktop and phone, and the main flows are tested end to end in Arabic and English.

**It is fast and hardened.** The sign-in page loads in about 200 KB, tracked as a budget on every build, and each release ships with strict security headers.

**It is ready to grow.** More branches, assistant shifts, a second instructor, coupons, waiting lists and notifications can be added as modules on the same foundation, without a rewrite.

## Part of a larger platform

The Dashboard is one of three connected apps behind the same business:

- **Website:** where students discover courses, book and pay, and receive a signed QR ticket.
- **Dashboard** *(this app)*: where the owner and operator run courses, sales, attendance and the public profile.
- **Scanner app:** a mobile app for assistants at the classroom door, which reads each ticket, says yes or no in a moment and records attendance that appears in the Dashboard straight away.

## How success is measured

| Goal | Target |
|---|---|
| New cohort decided to bookable online | Under 15 minutes of the owner's time |
| Student questions answered from the Dashboard, without a developer | 90 % or more |
| Cases needing a refund decision handled | Within 48 hours, every time |
| New website messages read | Within 24 hours, 90 % or more |
| Owner's active use | At least three days a week |

And four promises that must never fail: no session is ever overbooked, no personal data is visible without a signed-in staff account, no ticket stays valid after a refund or cancellation, and no course goes live without its bilingual essentials.

## Roadmap

- **Built and verified:** every screen of the Dashboard, tested end to end on realistic sample data.
- **Next:** connect to the live booking and payments backend, then a final independent review and a walkthrough with the owner.
- **After launch:** device activation for the Scanner app, an activity log, site-wide settings and richer photo editing.

## Built with

React 19, React Router 8, Redux Toolkit with RTK Query, TypeScript, Tailwind CSS 4, Radix UI, Vitest and Playwright.

---

Developed by [Mahmoud Samy](https://www.mahmoudsamydev.site) · [Portfolio](https://www.mahmoudsamydev.site)

Private project. © Mahmoud Samy. All rights reserved.
