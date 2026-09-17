# Bloom Coffee — Stories & Acceptance Criteria

Implement all five stories. Order below is a suggested sequence. "Done" means the acceptance criteria are satisfied and the behavior is visible in the deployed app.

---

## Story 1: Admin authentication

**As an** admin  
**I want to** log in to a protected admin area  
**So that** only authorized users can manage the Bloom Coffee menu.

### Acceptance criteria

- **AC1.1** An admin can reach a login page (e.g. `/admin` or `/admin/login`).
- **AC1.2** Submitting valid credentials grants access to the admin section; invalid credentials show an error and do not grant access.
- **AC1.3** Admin routes (e.g. add/edit drinks and add-ons) are protected: unauthenticated users are redirected to login (or see an unauthorized state).
- **AC1.4** An authenticated admin can log out; after logout, admin routes are no longer accessible until logging in again.

### Notes

- You choose auth method (e.g. simple username/password, OAuth, or a seed admin user). No need for sign-up or password reset unless you want to include them.

---

## Story 2: Admin — Manage drinks (CRUD)

**As an** admin  
**I want to** create, edit, and delete drinks in the menu  
**So that** customers see an up-to-date drink list with correct names, descriptions, and base prices.

### Acceptance criteria

- **AC2.1** In the admin section, an authenticated admin can create a **drink** with: name, short description, and base price. The drink appears in the list of drinks.
- **AC2.2** An admin can edit an existing drink (name, description, base price) and delete a drink.
- **AC2.3** These admin actions are only available when logged in; the customer-facing menu reflects the current list of drinks.

### Notes

- Persistence is up to you (DB, file, in-memory for demo). The customer menu must reflect what the admin has configured.

---

## Story 3: Admin — Manage add-ons (CRUD)

**As an** admin  
**I want to** create, edit, and delete add-ons (e.g. oat milk, extra shot)  
**So that** customers can choose add-ons when building their order and see correct prices.

### Acceptance criteria

- **AC3.1** In the admin section, an authenticated admin can create an **add-on** with: name and price (e.g. "Oat milk +$0.50"). The add-on appears in the list of add-ons.
- **AC3.2** An admin can edit an existing add-on (name, price) and delete an add-on.
- **AC3.3** These admin actions are only available when logged in; the customer flow shows the current add-ons when customizing a drink.

### Notes

- Add-ons are simple: name and price. The customer menu and order flow must show the add-ons you configure here.

---

## Story 4: Customer — View menu and build order with running total

**As a** customer  
**I want to** view the drink menu, choose a drink, add customizations (add-ons), and see a running total  
**So that** I know what I'm ordering and what it costs before submitting.

### Acceptance criteria

- **AC4.1** A customer can view the current drink menu (names, descriptions, base prices) without logging in.
- **AC4.2** A customer can select a drink and see available add-ons. Adding or removing add-ons updates the line total for that drink (base price + add-on prices).
- **AC4.3** A customer can add multiple drinks (each with optional add-ons) to an order. The UI shows a running order total that updates when items or add-ons are added/removed.
- **AC4.4** A customer can change quantity or remove items from the order; the running total stays correct.
- **AC4.5** The customer menu and order flow are **usable and readable on both mobile** (e.g. phone) **and desktop**

### Notes

- Add-on prices must affect the total (e.g. base drink $4 + oat milk $0.50 + extra shot $0.75 = $5.25 for that line).

---

## Story 5: Customer — Submit order and see confirmation

**As a** customer  
**I want to** submit my order with my name (so you know who to call when it's ready) and see a confirmation with an order ID  
**So that** I know my order was received and I have a reference for it (no payment required for this exercise).

### Acceptance criteria

- **AC5.1** From the order view (with running total), the customer can provide a **name for the order** (e.g. for pickup / "who to call when ready") and submit the order. Whether the name is required or optional is up to you.
- **AC5.2** After submit, the customer sees a clear confirmation that includes: (a) a **unique order ID** (e.g. Order #1047), (b) a **summary** of what was ordered (drinks, add-ons, quantities, total), and (c) the **name** they gave (e.g. "We'll call Jordan when your order is ready"). No payment or card capture.
- **AC5.3** The customer can start a new order after confirmation (e.g. "Order again" or return to menu). Previous order may be stored for reference (e.g. admin view or simple order list) but that's optional.

### Notes

- No credit card or payment gateway required.

---

## Summary


| Story | Focus                                                    |
| ----- | -------------------------------------------------------- |
| 1     | Admin login and protected routes                         |
| 2     | Admin CRUD for drinks                                    |
| 3     | Admin CRUD for add-ons                                   |
| 4     | Customer menu, customizations, running total             |
| 5     | Submit order (name + order ID), confirmation, no payment |


When you're done, deploy the app and open a PR with a link to the live URL. We'll review and, if we move forward, Phase 2 will be pairing with us to add one or two features that bring more business value to Bloom Coffee.
