# TaskChecky — Smart Task & Reminder App (MERN, complete)

Tasks · Smart reminders (Web Push + service worker) · Timetable · Calendar · Habits · Analytics · Settings · PWA

## Install & run
Needs Node 18+ and MongoDB (local or Atlas).
```
cd backend
cp .env.example .env          # set MONGO_URI, JWT_SECRET
npx web-push generate-vapid-keys   # paste into VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY
npm install && npm run dev    # http://localhost:5000

cd ../frontend
cp .env.example .env
npm install && npm run dev    # http://localhost:5173
```
Production: `npm run build` in frontend, serve `dist/` over **HTTPS**.

## How reminders work (reliability)
- Reminders live in MongoDB (`nextRun`, `snoozeUntil`, `repeat`). A server scheduler ticks every 15 s — no reliance on browser timers.
- On fire: a `Notification` record is created, Web Push is sent (works with the tab closed), and the open app shows an in-app pop-up.
- **No duplicates:** the reminder update is a compare-and-set, and browser notifications share a tag (the notification id).
- **Repeats:** the next occurrence is scheduled immediately (daily/weekly/monthly/custom days). **Missed** occurrences (server down) fire once, then skip to the next future time; unanswered notifications wait in the app.
- **Actions:** Completed (a one-time reminder becomes done), Pending (stays pending), Snooze 5/10 min (reschedules the *same* reminder). **Dismissing never completes anything.** Notification action buttons call a signed, 1-day, single-notification token endpoint.
- Timetable activities with "remind N minutes before" notify once per day, in the user's timezone.

## Notification requirements & platform limits
- Needs HTTPS (localhost exempt) and user permission (Settings → Enable on this device).
- **Android/Chrome:** pushes arrive with the browser closed; aggressive battery savers can delay them.
- **Desktop:** the browser process must be running (it may be minimised).
- **iOS/iPadOS 16.4+:** push works only after "Add to Home Screen"; no action buttons on iOS notifications (tap opens the app).
- A fully force-quit browser/device off = no delivery; pending reminders appear when the app is next opened.
- Without VAPID keys the app still works with in-app/browser alerts while open.

## API (all except auth/public need `Authorization: Bearer <jwt>`; every query is scoped to the user)
| Resource | Routes |
|---|---|
| Auth | POST `/api/auth/register`, `/login`, `/forgot-password`, `/reset-password/:token`; GET `/me`; PUT `/profile`, `/password` |
| Tasks | GET `/api/tasks?from&to&q&priority&status&category`, POST, PUT/DELETE `/:id` |
| Reminders | GET/POST `/api/reminders`, PUT/DELETE `/:id` |
| Timetable | GET/POST `/api/timetable`, PUT/DELETE `/:id` |
| Habits | GET/POST `/api/habits`, PUT/DELETE `/:id`, POST `/:id/log` `{date,count}` |
| Notifications | GET `/api/notifications?status=unread`, POST `/:id/action` `{action:completed\|pending\|snooze\|dismiss, minutes}`, POST `/public/:token/:action` (service worker), GET `/push/key`, POST `/push/subscribe`, `/push/unsubscribe` |
| Dashboard / Analytics | GET `/api/dashboard`, GET `/api/analytics` |

Forgot-password: no email provider is wired in; in development the link is printed to the server console and shown on the page. Add Nodemailer/SES before production.
