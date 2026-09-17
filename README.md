# Bloom Coffee — Candidate Code Exercise

Welcome! This repo contains the exercise brief for **Bloom Coffee**, a small coffee-shop ordering app. Your job is to implement the stories below, deploy the app somewhere we can use it, and submit it for review. You may use any language, framework, or tools (including AI). We care about clarity, structure, and that it runs.

**Key docs:** [STORIES.md](STORIES.md) (stories & acceptance criteria) · [RUBRIC.md](RUBRIC.md) (what we look for when reviewing)

---

## Submission — please read first (privacy)

We know job-hunting is private. The flow below keeps your application invisible to anyone browsing your GitHub.

1. **Click "Use this template"** (above the file list on this repo) to create your own copy. **Use the template button, not Fork** — a fork creates a public link back to Bloom Growth on your profile. The template button does not.
2. **Make your new repo private** in the repo settings.
3. (Optional but recommended) Use a GitHub account separate from your day-job account.
4. Build your solution. When you're ready, open a PR **within your own repo** (feature branch → main) — we'll use it to review your changes diff-by-diff.
5. **Invite our reviewer account** as a collaborator with read access on your private repo. The account to invite is: **`bloom-coffee-reviews`** _(replace with your actual reviewer account)_.
6. Reply to Mike's email with: the **URL of your repo**, the **URL of your PR**, **admin login credentials** (or how to create an admin), and optionally your **tech stack** and any **trade-offs or decisions** you want us to know about.

We will never link to or reference your repo publicly.

---

## What we expect

1. Implement the stories in [STORIES.md](STORIES.md).
2. **Deploy** the app to a URL we can open (e.g. Vercel, Railway, Fly.io, your own server). No payment processing required.
3. The **customer-facing flow** (menu, order, confirmation) should be **mobile-friendly**: usable and readable on both phone and desktop. Admin can be desktop-only if you prefer.
4. Submit per the **Submission** section above.
5. Our engineers will review your code and deployment. If we move forward, **Phase 2** will be a pairing session where you propose one or two features that would add business value to Bloom Coffee, we'll do a short planning together, and then you'll implement and deploy those with us.

**Time:** We've scoped this for about **2–3 hours** of focused work. You're welcome to take longer if you'd like—we'd rather you finish at your pace than feel rushed. We've kept the scope intentional so you can complete it without an overwhelming commitment. Please submit within one week of receiving this exercise.

**Questions?** Email Mike Benner at michael.b@bloomgrowth.com

---

## What we look for

Our engineers use a rubric when reviewing your submission. You can see what we evaluate and how we give feedback here: **[RUBRIC.md](RUBRIC.md)**.

---

## How to run (your app)

In your fork, replace this section with clear instructions for reviewers:

- **Run locally:** How to install dependencies, set any required env vars, and start the app (e.g. `npm start`, `docker-compose up`).
- **Deploy:** How you deployed it and the URL (or add the live URL in your PR description).
- **Admin login:** Because sign-up is not required, provide either (a) the credentials to log into the admin section (e.g. username/password for a seed or default admin), or (b) exact steps to create an admin user so we can sign in and test the admin stories. Don't leave this out — we need to access the admin area to review your work.

---

## Repo structure (suggestion)

You don't have to follow this exactly; we only need to find the code and run it.

```
/
├── README.md              # This file (update with your run/deploy instructions)
├── STORIES.md             # Copy of the stories (for your reference; implementation is what we review)
├── docs/                  # Optional: any extra notes or decisions
├── <your-app>/            # Your choice: e.g. one app, or frontend/ + backend/
│   └── ...
└── ...
```

Use one repo; monorepo or single app is fine. Keep it simple enough that we can clone, install, and run without guessing.

---

## Stories

See **[STORIES.md](STORIES.md)** for the five stories and acceptance criteria. Implement all of them; the order in the file is a suggested sequence.

Good luck — we're looking forward to seeing what you build.
