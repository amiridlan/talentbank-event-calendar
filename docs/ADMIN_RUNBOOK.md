# TalentBank Event Calendar - Admin Runbook

**Version:** 1.0
**Last Updated:** 2026-07-28
**Audience:** Event Coordinators and Administrators

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Managing Events](#managing-events)
3. [Managing Registrations](#managing-registrations)
4. [Handling Cancellations & Postponements](#handling-cancellations--postponements)
5. [Using Clash Detection](#using-clash-detection)
6. [Managing Capacity](#managing-capacity)
7. [User Management](#user-management)
8. [Email Notifications](#email-notifications)
9. [Troubleshooting](#troubleshooting)
10. [Best Practices](#best-practices)

---

## Getting Started

### Accessing the Admin Panel

1. Navigate to `https://your-domain.com/admin`
2. Click "Sign in with Google"
3. Use your TalentCorp Google Workspace account
4. You'll be redirected to the admin dashboard

### Understanding Your Role

There are three user roles:

- **👑 Admin** - Full access to create, edit, and delete events
- **✏️ Editor** - Can create and edit events, but cannot delete
- **👁️ Viewer** - Read-only access to view events and registrations

Your role is displayed in the top-right corner of the admin panel.

---

## Managing Events

### Adding a New Event

#### Step 1: Navigate to Events
1. From the admin dashboard, click **"Events"** in the sidebar
2. Click the **"Create New Event"** button

#### Step 2: Fill in Basic Information
- **Event Name**: e.g., "UiTM Career Fair 2025"
- **Event Type**: Select from:
  - Campus (university-specific)
  - Sector (industry-specific)
  - Public (open to all)
  - Awards (career awards ceremony)
- **Region**: Select the Malaysian state

#### Step 3: Set Dates and Times
- **Start Date**: When the event begins
- **End Date**: When the event ends (can be same day for single-day events)
- **Start Time** (optional): Event start time (e.g., 9:00 AM)
- **End Time** (optional): Event end time (e.g., 5:00 PM)

> 💡 **Tip:** The system automatically calculates if an event is multi-day

#### Step 4: Add Venue Information
- **Venue Name**: e.g., "UiTM Shah Alam Main Hall"
- **Venue Address**: Full address including postal code
- **Venue ID**: Used for clash detection (see [Using Clash Detection](#using-clash-detection))

#### Step 5: Set Capacity (Optional)
- **Candidate Capacity**: Number of job seekers who can register
- **Employer Capacity**: Number of employer booths available

> 📝 **Note:** Leave capacity blank for unlimited registration

#### Step 6: Select Industries/Fields
- Check all relevant industries for this event
- This helps job seekers find relevant events
- Multiple selections allowed

#### Step 7: Add External Link (Optional)
- If the event has a separate website, add the URL here
- Example: `https://uitm.edu.my/career-fair-2025`

#### Step 8: Save
- Click **"Save as Draft"** to save without publishing
- Click **"Publish"** to make the event public immediately

### Editing an Existing Event

1. Go to **Events** in the admin panel
2. Find the event you want to edit
3. Click the **Edit** button
4. Make your changes
5. Click **"Save Changes"**

> ⚠️ **Warning:** Changes to published events are immediately visible to the public

### Understanding Event Status

Events can have the following statuses:

| Status | Description | Visible to Public? |
|--------|-------------|-------------------|
| **Draft** | Work in progress | ❌ No |
| **Scheduled** | Published and upcoming | ✅ Yes |
| **Postponed** | Rescheduled to new date | ✅ Yes (with badge) |
| **Cancelled** | Event cancelled | ✅ Yes (with strikethrough) |
| **Completed** | Event has ended | ❌ No (only in archive) |

### Archiving Old Events

Events are automatically moved to the archive once their end date has passed. Users can view past events at `/calendar/archive`.

To manually archive an event:
1. Edit the event
2. Change status to **"Completed"**
3. Save

---

## Managing Registrations

### Viewing Registrations

#### For a Specific Event
1. Go to **Events** → Find your event → Click **"View Registrations"**
2. You'll see:
   - Total candidate registrations
   - Total employer registrations
   - List of all registrants with details
   - Waitlist (if capacity is reached)

#### All Registrations
1. Go to **Registrations** in the admin sidebar
2. Filter by:
   - Event name
   - Registration type (candidate/employer)
   - Status (confirmed/waitlisted)
   - Date range

### Exporting Registration Data

1. View registrations for an event
2. Click **"Export to CSV"**
3. File will download with columns:
   - Name
   - Email
   - Phone
   - Organization (for employers)
   - Booth Count (for employers)
   - Registration Date
   - Status

### Managing Waitlist

When an event reaches capacity, new registrations automatically go to the waitlist.

#### Promoting from Waitlist
1. View event registrations
2. Go to **"Waitlist"** tab
3. Select registrants to promote
4. Click **"Promote to Confirmed"**
5. Confirmation emails will be sent automatically

#### Checking Waitlist Position
Waitlist positions are assigned automatically (first-come, first-served). Users can see their position in the confirmation email.

---

## Handling Cancellations & Postponements

### Cancelling an Event

#### Step 1: Edit the Event
1. Go to **Events** → Find event → Click **Edit**
2. Change status to **"Cancelled"**
3. Enter **"Cancellation Reason"** (required)
   - Example: "Due to unforeseen circumstances, this event has been postponed to a later date"

#### Step 2: Notify Registrants
- Click **"Send Cancellation Emails"**
- Review the email preview
- Click **"Confirm Send"**
- All registrants will receive cancellation notification emails

> 📧 **Email Content:** Emails include the cancellation reason and links to browse other events

#### Step 3: Save Changes
- Click **"Save Changes"**
- Event will display as "Cancelled" with strikethrough on public calendar

### Postponing an Event

#### If Rescheduling to a Known Date

1. **Edit the original event:**
   - Change status to **"Postponed"**
   - Update **Start Date** and **End Date** to new dates
   - Fill in **"Postponed From Date"** (the original date)

2. **Notify registrants:**
   - Click **"Send Update Emails"**
   - Email will inform registrants of the new date
   - Existing registrations remain valid

#### If New Date is Unknown

1. **Cancel the original event** (follow cancellation steps)
2. **Create a new event** when the new date is confirmed
3. **Previous registrants must re-register** for the new event

---

## Using Clash Detection

The system automatically detects potential scheduling conflicts.

### Types of Clashes

#### Hard Clash (❌ Cannot be saved)
- Same venue AND overlapping dates
- **Example:** Two events at "UiTM Shah Alam" on the same day
- **Solution:** Change venue or date

#### Soft Clash (⚠️ Warning only)
- Same region AND shared industries AND within 7 days
- **Example:** Two IT career fairs in Selangor one week apart
- **Solution:** Review and proceed if intentional

### How to Check for Clashes

Clashes are checked automatically when you:
- Create a new event
- Change event dates
- Change event venue

If a clash is detected:
1. A warning message appears
2. Details of conflicting events are shown
3. You can:
   - **Modify** your event to avoid the clash
   - **Proceed anyway** (for soft clashes)
   - **Cancel** and reschedule

### Best Practices to Avoid Clashes

1. **Check the calendar first** before scheduling
2. **Use consistent venue IDs** (e.g., always "uitm-shah-alam", not variations)
3. **Coordinate with team** for major events
4. **Space out similar events** by at least 2 weeks

---

## Managing Capacity

### Setting Initial Capacity

When creating an event:
- **Candidate Capacity**: Total number of job seeker registrations
- **Employer Capacity**: Total number of employer booth slots

> 💡 **Tip:** Leave blank for unlimited registration

### Monitoring Capacity

On the event edit page, you'll see:
```
Candidates: 150 / 500 registered (350 spots remaining)
Employers: 20 / 50 booths (30 booths available)
```

### Adjusting Capacity

#### Increasing Capacity
1. Edit the event
2. Increase the capacity number
3. Save
4. System automatically promotes waitlisted registrants (oldest first)
5. Confirmation emails sent to promoted registrants

#### Decreasing Capacity
1. Edit the event
2. Decrease the capacity number
3. **Warning:** If current registrations exceed new capacity, no one is removed
4. New registrations will go to waitlist

### Handling Over-Capacity Situations

If you accidentally accepted more registrations than capacity:
1. **Option 1:** Increase capacity to match
2. **Option 2:** Contact excess registrants manually to cancel
3. **Option 3:** Expand to a larger venue

---

## User Management

### Viewing Users

1. Go to **Users** in the admin sidebar
2. See all users with access to the admin panel

### Changing User Roles

> ⚠️ **Admin only**: Only administrators can change user roles

1. Go to **Users**
2. Find the user
3. Click **"Edit Role"**
4. Select new role:
   - Admin (full access)
   - Editor (create/edit)
   - Viewer (read-only)
5. Click **"Save"**

### Adding New Admin Users

1. The user must sign in with Google once
2. An administrator changes their role from Viewer to Editor/Admin
3. User will have access on next login

> 📝 **Note:** All users must have TalentCorp Google Workspace accounts

### Removing Access

1. Go to **Users**
2. Find the user
3. Click **"Remove Access"**
4. Confirm deletion

---

## Email Notifications

The system sends automated emails for:

### Registration Confirmation
**Sent when:** User completes registration
**Recipients:** Registrant
**Content:**
- Confirmation message
- Event details (date, time, venue)
- .ics calendar file attachment (coming soon)
- PDPA notice

### Waitlist Confirmation
**Sent when:** Event is full, user added to waitlist
**Recipients:** Registrant
**Content:**
- Waitlist position
- Promise to notify if spot opens
- Links to browse other events

### Event Cancellation
**Sent when:** Admin cancels an event and clicks "Send Cancellation Emails"
**Recipients:** All confirmed and waitlisted registrants
**Content:**
- Cancellation notice
- Reason for cancellation
- Links to browse alternative events

### Event Reminder
**Sent when:** 7 days before event (automated)
**Recipients:** All confirmed registrants
**Content:**
- Reminder that event is in 7 days
- Event details
- Tips (bring resume for candidates, booth materials for employers)

### Monitoring Email Delivery

1. Go to **Settings** → **Email Logs**
2. See all sent emails with:
   - Recipient
   - Subject
   - Timestamp
   - Delivery status (sent/failed)

> 📧 **Resend Setup Required:** Ask your IT admin to configure Resend API key

---

## Troubleshooting

### Problem: Can't Sign In

**Symptoms:** Google sign-in fails or redirects back to login
**Solutions:**
1. Ensure you're using a TalentCorp Google Workspace account
2. Clear browser cookies and try again
3. Try incognito/private browsing mode
4. Contact IT if problem persists

---

### Problem: Event Not Appearing on Public Calendar

**Symptoms:** Published event doesn't show on `/calendar`
**Check:**
1. Is event status **"Scheduled"** (not Draft)?
2. Is the event date in the future?
3. Did you click "Publish" instead of "Save as Draft"?

**Solutions:**
1. Edit event → Change status to "Scheduled" → Save
2. Check event dates are correct
3. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)

---

### Problem: Registrations Not Showing

**Symptoms:** Registration count shows 0 despite submissions
**Solutions:**
1. Check registrations under **Registrations** tab
2. Filter by event name
3. Check both "Confirmed" and "Waitlisted" tabs
4. Verify email didn't go to spam

---

### Problem: Email Notifications Not Sending

**Symptoms:** Registrants not receiving confirmation emails
**Check:**
1. Is Resend API key configured? (Settings → Email)
2. Check Email Logs for failed deliveries
3. Ask registrants to check spam folder

**Solutions:**
1. Contact IT to verify Resend setup
2. Manually resend from Email Logs
3. Copy and email event details manually as backup

---

### Problem: Clash Detection False Positive

**Symptoms:** System warns of clash but events don't actually conflict
**Common Causes:**
1. Venue ID typo (e.g., "uitm-SA" vs "uitm-sa")
2. Events in different venues flagged due to same region + industry

**Solutions:**
1. Use consistent venue IDs (check existing events first)
2. For soft clashes, you can proceed anyway
3. Update venue ID if wrong

---

### Problem: Can't Export Registrations

**Symptoms:** Export button doesn't work or CSV is empty
**Solutions:**
1. Check if event has any registrations
2. Try different browser
3. Contact IT support

---

### Problem: Event Appears in Wrong Month

**Symptoms:** Event displays in unexpected month on calendar
**Cause:** Usually incorrect date format or timezone issue
**Solutions:**
1. Edit event and verify dates are correct
2. Use format: YYYY-MM-DD (e.g., 2025-03-15)
3. Check year is correct (easy to mistakenly use previous/next year)

---

## Best Practices

### Event Creation
✅ **Do:**
- Check calendar for existing events before scheduling
- Use descriptive event names ("UiTM Career Fair 2025" not just "Career Fair")
- Set capacity conservatively (can increase later)
- Add venue address for better directions
- Select all relevant industries
- Save as draft first, review, then publish

❌ **Don't:**
- Schedule two similar events in same region within 1 week
- Use inconsistent venue naming (be consistent with spelling/capitalization)
- Forget to set capacity if space is limited
- Publish without double-checking dates

### Managing Registrations
✅ **Do:**
- Export registrations weekly as backup
- Monitor capacity regularly
- Respond to waitlist inquiries promptly
- Keep registrant data confidential (PDPA compliance)

❌ **Don't:**
- Share registrant personal information without consent
- Forget to promote waitlisted candidates if spots open
- Ignore registration anomalies (e.g., same person registered 10 times)

### Communication
✅ **Do:**
- Send updates well in advance (at least 1 week notice for changes)
- Use clear, professional language in cancellation reasons
- Test emails before sending to large groups
- Keep event descriptions concise and informative

❌ **Don't:**
- Make last-minute cancellations without good reason
- Use vague cancellation reasons ("unforeseen circumstances" - be specific)
- Send too many reminder emails (system sends one at 7 days, that's enough)

### System Maintenance
✅ **Do:**
- Log out when finished (especially on shared computers)
- Archive completed events regularly
- Review user access quarterly
- Keep event data up to date

❌ **Don't:**
- Share admin credentials
- Leave draft events unpublished for months
- Delete events (archive instead for historical record)

---

## Quick Reference

### Event Status Flow
```
Draft → Scheduled → Completed (auto)
            ↓
        Postponed
            ↓
        Cancelled
```

### Registration States
```
Registered → Confirmed (if capacity available)
               ↓
          Attended (manual marking)

Registered → Waitlisted (if full)
               ↓
          Confirmed (if spot opens)
```

### Common Tasks Quick Links

| Task | Navigation Path |
|------|----------------|
| Create Event | Admin → Events → Create New Event |
| View Registrations | Admin → Events → [Event] → View Registrations |
| Export Data | Admin → Events → [Event] → Registrations → Export CSV |
| Send Emails | Admin → Events → [Event] → Edit → Send Emails |
| Manage Users | Admin → Users |
| View Email Logs | Admin → Settings → Email Logs |
| Check Clashes | Automatic when creating/editing events |

---

## Support Contacts

**Technical Issues:**
IT Support: it@talentcorp.com.my

**Event Coordination Questions:**
Events Team Lead: events@talentcorp.com.my

**System Feature Requests:**
Submit via: [GitHub Issues](link-to-repo)

---

## Appendix: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + S` | Save event (when editing) |
| `Esc` | Close modal/dialog |
| `Tab` | Navigate between fields |
| `Ctrl/Cmd + F` | Search (in lists) |

---

**Document Version:** 1.0
**Last Updated:** 2026-07-28
**Next Review:** When major features added

For questions or clarifications about this runbook, contact the system administrator.
