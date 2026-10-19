# InternHub Capstone — Walkthrough Video Script & Recording Guide

**Project:** InternHub — Full-Stack Internship Portal  
**Target Duration:** 3 to 5 Minutes  
**Audience:** Technical Evaluators, Recruiters, and Senior Engineering Leadership  
**Tone:** Professional, Confident, Articulate, and Engineering-Focused  

---

## Recording Checklist

Before starting your recording:
- [ ] Ensure local or live server is running and accessible (`npm run dev` or production URL).
- [ ] Open browser at 1440x900 resolution with clean zoom (100%).
- [ ] Prepare terminal in a split pane or second window to display `npm test` output.
- [ ] Ensure microphone audio is crisp and free of background noise.
- [ ] Close unnecessary browser tabs and notifications.
- [ ] Open the DevTools Network tab to demonstrate genuine REST API responses.

---

## 3–5 Minute Speaking Script

### 0:00 – 0:35 | Introduction & Architecture Overview
**Speaker:**
> *"Hello and welcome. My name is [Your Name], and today I am proud to present my capstone project: **InternHub** — a production-ready, full-stack internship discovery and application platform.*
>
> *Over the past three milestones, this application evolved from a vanilla responsive frontend into a complete, secure full-stack architecture powered by Node.js, Express, persistent SQLite database storage, and a modern, accessible React frontend. Today, I'll walk you through the user journey, our persistent database layer, automated test suite, and the security controls safeguarding the entire platform."*

---

### 0:35 – 1:15 | Homepage, Responsive Design & Real-Time Stats
*(Screen: Show the desktop homepage, scroll smoothly, then resize the browser to show mobile responsiveness).*

**Speaker:**
> *"Here on the homepage, notice the clean, high-contrast design system following WCAG 2.2 AA accessibility principles. Our palette features an indigo primary, sky accent, and high-readability slate typography.*
>
> *At the top, we have live portal statistics queried directly from our backend API: active roles, verified applications, partner organizations, and career domains. Notice the live system health indicator in our navbar showing an active green status.*
>
> *As I resize the viewport down to mobile screen sizes, you can see the fluid layout adapts seamlessly with zero horizontal overflow, touch-friendly filter pills, and accessible drawer navigation."*

---

### 1:15 – 2:00 | Search, Filtering & Role Details
*(Screen: Type "Cloud" in search, then click the "Data & AI" filter pill. Then click "View Details" on an internship card).*

**Speaker:**
> *"Let's test the discovery experience. When I type a keyword like 'Data' or select a domain pill such as 'Data & AI', the frontend dynamically sends a parameterized query to our backend `GET /api/internships` endpoint. The results update instantly with an accessible ARIA live status announcement.*
>
> *Clicking 'View Details' opens an accessible modal with complete role expectations, key responsibilities, qualifications, and company perks. Candidates can review everything they need before deciding to apply."*

---

### 2:00 – 2:50 | Application Form, Validation & Duplicate Protection
*(Screen: Click "Apply for this Internship". First click submit with empty fields to trigger client errors. Then fill in valid candidate data and submit).*

**Speaker:**
> *"Now let's submit an application. Clicking 'Apply for this Internship' opens our secure application dialog.*
>
> *First, if I attempt to submit an empty form, our client-side validator immediately highlights the missing fields with clear, accessible error messages. Both client and server validate every single field: legal name, email, phone digits, graduation year bounds, and a minimum 30-character statement of interest.*
>
> *Now, let's fill in valid candidate information for Samantha Chen and hit submit. Notice the button enters a loading state. The backend independently validates the payload, checks for duplicate submissions, generates a unique reference code, and persists the record into SQLite.*
>
> *And here is our genuine confirmation receipt, displaying Application Reference ID `APP-2026-SAXYV`, complete with a one-click copy button and a transparent recruitment timeline."*

---

### 2:50 – 3:35 | Database Persistence & Status Verification
*(Screen: Open the "Check Application Status" modal, enter the generated reference code, and click Verify).*

**Speaker:**
> *"To prove genuine database persistence, let's copy our reference ID and open the 'Check Application Status' modal. When I paste `APP-2026-SAXYV` and click Verify, our server queries the database and confirms the application record with a 'SUBMITTED' status.*
>
> *Notice that for candidate privacy, personal identifiable information like phone numbers and email addresses are never exposed on public endpoints — only masked candidate initials and university credentials.*
>
> *Furthermore, if the same applicant tries applying for the same role a second time, the database enforces unique constraints and responds with an HTTP 409 Conflict error, preventing duplicate spam."*

---

### 3:35 – 4:20 | Automated Testing & Production Security
*(Screen: Switch to terminal and run `npm test`. Show 15/15 passing tests. Then show `/api/health` in browser).*

**Speaker:**
> *"Now, let's look at our testing and reliability engineering. In the terminal, running `npm test` executes our automated suite using Node's native test runner.*
>
> *All 15 tests pass in under 300 milliseconds, validating input sanitization, pagination limits, foreign key constraints, duplicate prevention, and health monitoring.*
>
> *From a security standpoint, our server is protected with Helmet security headers, Content Security Policy, rate limiting on application submissions, and administrative authentication on mutation routes. In fact, if an unauthorized user attempts to create an internship without an `x-admin-key`, the request is immediately rejected with HTTP 401 Unauthorized."*

---

### 4:20 – 4:50 | Summary & Conclusion
*(Screen: Return to the InternHub homepage showing the live interface).*

**Speaker:**
> *"In summary, InternHub delivers an end-to-end, portfolio-grade internship portal that is responsive, accessible, persistently stored, and thoroughly secured.*
>
> *Thank you for your time and for reviewing the InternHub capstone project. All source code, automated test evidence, and architectural documentation are fully available in the repository."*

---

## Instructions for Uploading Your Video

1. Record the walkthrough following the script above using OBS Studio, Loom, or your preferred screen recorder.
2. Upload the video to YouTube (as Unlisted or Public) or Loom.
3. Update the `README.md` file by replacing the placeholder with your video URL:
   ```markdown
   - **Walkthrough Video:** [https://www.youtube.com/watch?v=YOUR_VIDEO_ID](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
   ```
