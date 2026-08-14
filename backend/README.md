# Smart Employee Management System (EMS) - Backend Guide

Welcome to the backend documentation of the **Smart Employee Management System (EMS)**. This is a robust **MERN Stack** backend server built with **Express.js**, **Mongoose**, and **MongoDB**. It features automatic dual-mode execution (MongoDB Atlas Cloud Storage with session-based local memory fallback).

---

## 🚀 Key Database & Connection Features
- **Auto-Detect MongoDB URI**: Supports both `MONGODB_URI` and `MONGO_URI` keys from your `.env` file.
- **Zero Manual Config Setup (Auto-Seeding)**: When you supply your connection string in `.env`, the backend connects and automatically detects if the database is empty. If empty, it automatically seeds all default schemas with baseline corporate data, departments, default employees, and the Admin user (`admin@softwallet.com`). You don't need to manually create any collections or documents in Mongo Atlas!
- **Dual Fallback Mode**: If no MongoDB URI is supplied, the backend runs in a persistent-safe offline memory mode, allowing the app to run fully functional even without a database.

---

## 🗄️ Database Collections (Mongoose Schemas)

Each collection has a dedicated Mongoose schema model located in `/backend/models/`:

### 1. `User.js` (Employees & Admin)
Tracks credentials, profiles, status, and role configurations.
- **`id`** (`String`): Company ID (e.g., `EMP-4012`, `EMP-0001`).
- **`name`** (`String`): Employee name.
- **`email`** (`String`, unique): Login/ID email.
- **`avatar`** (`String`): Profile image URL.
- **`role`** (`String`): User privileges (`Admin` or `Employee`).
- **`department`** (`String`): Department name.
- **`designation`** (`String`): Work designation.
- **`joiningDate`** (`String`): Corporate date of joining.
- **`contact` / `address` / `gender` / `dob`**: General profile info.
- **`salary`** (`Number`): Base salary.
- **`status`** (`String`): Status (`Active` or `Inactive`).
- **`documents`** (`Array`): Uploaded document objects (Resume, ID proof, etc.).

### 2. `Department.js`
Tracks company departments.
- **`id`** (`String`): Unique ID.
- **`name`** (`String`): Department name (e.g., `IT & Engineering`, `HR Operations`).
- **`manager`** (`String`): Assigned Manager name.
- **`employeeCount`** (`Number`): Active employee headcount.

### 3. `Attendance.js`
Tracks employee check-in and check-out logs.
- **`id`** (`String`): Unique log ID.
- **`userId`** (`String`): Associated employee ID.
- **`date`** (`String`): Calendar date (`YYYY-MM-DD`).
- **`checkIn`** (`String`): Check-in timestamp (e.g., `09:00 AM`).
- **`checkOut`** (`String`): Check-out timestamp (e.g., `06:00 PM`).
- **`status`** (`String`): Status indicator (`On Time`, `Late`, `Half Day`, `Absent`).
- **`hoursWorked`** (`String`): Calculated active working hours.

### 4. `Leave.js`
Tracks leaves requested by employees.
- **`id`** (`String`): Unique request ID.
- **`userId`** (`String`): Applicant ID.
- **`type`** (`String`): Type (`Sick Leave`, `Casual Leave`, etc.).
- **`startDate` / `endDate`** (`String`): Selected leave span.
- **`totalDays`** (`Number`): Number of working days requested off.
- **`reason`** (`String`): Reason for leave.
- **`status`** (`String`): Real-time approval status (`Pending`, `Approved`, `Rejected`).
- **`appliedDate`** (`String`): Application date.

### 5. `SalarySlip.js`
Stores generated payroll slips.
- **`id`** (`String`): Unique slip ID.
- **`userId`** (`String`): Associated employee ID.
- **`month` / `year`** (`String`): Selected pay cycle.
- **`paymentDate`** (`String`): Disbursal date.
- **`basic` / `allowances` / `bonus` / `deductions`** (`Number`): Financial fields.
- **`netSalary`** (`Number`): Calculated payout.

### 6. `Announcement.js`
Holds broadcast corporate notices.
- **`id`** (`String`): Unique ID.
- **`title` / `content` / `category`**: Notice headers, descriptions, and tag type.
- **`date` / `sender`**: Date and sender details.

---

## 🛠️ Complete API Routes Reference (`/backend/routes/api.js`)

Below is the complete, detailed reference for all API endpoints exposed by the backend. These are fully formed URLs with exact methods, sample JSON payloads, and parameter definitions, structured so you can copy and paste them directly into **Thunder Client**, **Postman**, or test via `curl`.

*   **Base URL (Local)**: `http://localhost:3000`
*   **Base URL (Live Dev App)**: `https://ais-dev-5kvfjhjo6zi4h2ax6d7frq-121334505168.asia-southeast1.run.app`
*   **Default Headers**:
    ```http
    Content-Type: application/json
    ```

---

### 🔑 1. Authentication Services

#### **[POST] Login Account**
*   **Endpoint**: `{{BaseURL}}/api/auth/login`
*   **Description**: Authenticates corporate user accounts and initiates sessions.
*   **Sample Payload (Admin)**:
    ```json
    {
      "email": "admin@softwallet.com",
      "password": "admin",
      "rememberMe": true
    }
    ```
*   **Sample Payload (Employee)**:
    ```json
    {
      "email": "varshikpal@gmail.com",
      "password": "password",
      "rememberMe": true
    }
    ```

---

### 👤 2. User Profile & Document Verification

#### **[GET] Get User Profile**
*   **Endpoint**: `{{BaseURL}}/api/user?email=varshikpal@gmail.com`
*   **Description**: Fetches detailed employee database document attributes.
*   **Query Parameters**:
    *   `email` (string): Logged-in user's corporate email address.

#### **[PUT] Update Profile Information**
*   **Endpoint**: `{{BaseURL}}/api/user`
*   **Description**: Updates emergency contacts, bio details, and communication address.
*   **Sample Payload**:
    ```json
    {
      "email": "varshikpal@gmail.com",
      "contact": "+91 9876543210",
      "address": "Indore, Madhya Pradesh, India",
      "designation": "MERN Stack Developer"
    }
    ```

#### **[POST] Upload Document Verification Metadata**
*   **Endpoint**: `{{BaseURL}}/api/user/document`
*   **Description**: Adds verified personal identity proof files / resume indices to the profile.
*   **Sample Payload**:
    ```json
    {
      "name": "Varshik_Pal_CV_2026.pdf",
      "size": 1048576
    }
    ```

#### **[DELETE] Remove Document Attachment**
*   **Endpoint**: `{{BaseURL}}/api/user/document/doc_995738`
*   **Description**: Erases document index references permanently.
*   **URL Parameter**: ID of the uploaded document asset.

---

### 📋 3. Employee Directory Management (Admin Only)

#### **[GET] Fetch All Employees**
*   **Endpoint**: `{{BaseURL}}/api/employees`
*   **Description**: Retrieves registry details containing all enrolled employees.

#### **[POST] Register New Employee Profile**
*   **Endpoint**: `{{BaseURL}}/api/employees`
*   **Description**: Adds and registers a new profile card index database record.
*   **Sample Payload**:
    ```json
    {
      "id": "EMP-4013",
      "name": "Aman Shrivastava",
      "email": "aman@softwallet.com",
      "role": "Employee",
      "department": "IT & Engineering",
      "designation": "MERN Stack Developer",
      "joiningDate": "2026-07-09",
      "salary": 50000,
      "status": "Active"
    }
    ```

#### **[PUT] Modify Employee Profile Cards**
*   **Endpoint**: `{{BaseURL}}/api/employees/EMP-4013`
*   **Description**: Modifies specified parameters (designation, salary grade, status toggle).
*   **Sample Payload**:
    ```json
    {
      "designation": "Lead MERN Developer",
      "salary": 65000,
      "status": "Active"
    }
    ```

#### **[DELETE] Delete Employee Profile File**
*   **Endpoint**: `{{BaseURL}}/api/employees/EMP-4013`
*   **Description**: Irreversibly deletes an employee's file from the corporate directory.

---

### 📂 4. Corporate Department Divisions (Admin Only)

#### **[GET] Fetch Departments Registry**
*   **Endpoint**: `{{BaseURL}}/api/departments`
*   **Description**: Retrieves a register with active company divisions, locations, and headcount stats.

#### **[POST] Create Corporate Department**
*   **Endpoint**: `{{BaseURL}}/api/departments`
*   **Description**: Registers a brand-new division department within the company.
*   **Sample Payload**:
    ```json
    {
      "name": "Quality Assurance",
      "manager": "Aisha Roy"
    }
    ```

#### **[PUT] Update Department Head / Managers**
*   **Endpoint**: `{{BaseURL}}/api/departments/DEPT_88294`
*   **Description**: Modifies department operational names or manager allocations.
*   **Sample Payload**:
    ```json
    {
      "name": "QA & Test Engineers",
      "manager": "Aisha Roy"
    }
    ```

#### **[DELETE] Deconstruct Division**
*   **Endpoint**: `{{BaseURL}}/api/departments/DEPT_88294`
*   **Description**: Removes department entries from database registries.

---

### ⏰ 5. Attendance & Daily Shifts

#### **[GET] Retrieve Attendance Registry**
*   *Admin Query*: `{{BaseURL}}/api/attendance?all=true`
*   *Employee Query*: `{{BaseURL}}/api/attendance?userId=EMP-4012`
*   **Description**: Fetches daily timestamp logs. Use `?all=true` for full company register (Admin), or `?userId` to fetch a specific employee's login details.

#### **[POST] Register Daily Check-In**
*   **Endpoint**: `{{BaseURL}}/api/attendance/checkin`
*   **Description**: Sets current log entry in database containing date and arrival timestamps. (Automatic classification: `On Time` or `Late`).
*   **Sample Payload**: None required (Session-based email is resolved).

#### **[POST] Register Daily Check-Out**
*   **Endpoint**: `{{BaseURL}}/api/attendance/checkout`
*   **Description**: Terminates current operational block, updates departure, and outputs exact shifts hours.
*   **Sample Payload**:
    ```json
    {
      "lastRecordId": "ATT-992837"
    }
    ```

#### **[PUT] Override/Adjust Attendance Record (Admin Only)**
*   **Endpoint**: `{{BaseURL}}/api/attendance/ATT-992837`
*   **Description**: Corrects/manually edits an employee's shift entry logs.
*   **Sample Payload**:
    ```json
    {
      "checkIn": "09:30 AM",
      "checkOut": "06:30 PM",
      "status": "On Time"
    }
    ```

---

### 🏖️ 6. Leave Applications & Requests

#### **[GET] Fetch Leaves Requests List**
*   *Admin Query*: `{{BaseURL}}/api/leaves?all=true`
*   *Employee Query*: `{{BaseURL}}/api/leaves?userId=EMP-4012`
*   **Description**: Lists requested leaves. Use `?all=true` for global pending requests approval board (Admin), or `?userId` for personal dashboard calendar logs.

#### **[POST] File New Leaves Application**
*   **Endpoint**: `{{BaseURL}}/api/leaves`
*   **Description**: Inserts a new pending leave application record.
*   **Sample Payload**:
    ```json
    {
      "type": "Casual Leave",
      "startDate": "2026-07-15",
      "endDate": "2026-07-16",
      "reason": "Family gathering in native hometown"
    }
    ```

#### **[PUT] Approve / Reject Leave Request (Admin Only)**
*   **Endpoint**: `{{BaseURL}}/api/leaves/LEAVE_582910`
*   **Description**: Reviews leave application forms and modifies status tags.
*   **Sample Payload**:
    ```json
    {
      "status": "Approved"
    }
    ```

---

### 💵 7. Payroll & Monthly Salary Slips

#### **[GET] Fetch Salary Slips Directory**
*   *Admin Query*: `{{BaseURL}}/api/salaryslips?all=true`
*   *Employee Query*: `{{BaseURL}}/api/salaryslips?userId=EMP-4012`
*   **Description**: Retrieves list of monthly salary sheets. Use `?all=true` for company ledger (Admin), or `?userId` for personal slips display.

#### **[POST] Generate Corporate Payroll Slip (Admin Only)**
*   **Endpoint**: `{{BaseURL}}/api/salaryslips/generate`
*   **Description**: Executes financial calculations and registers net payout sheets.
*   **Sample Payload**:
    ```json
    {
      "userId": "EMP-4012",
      "month": "July",
      "year": "2026",
      "basic": 45000,
      "allowance": 5000,
      "bonus": 2000,
      "deductions": 1500
    }
    ```

---

### 📢 8. Announcements Board & Bulletin Notices

#### **[GET] Retrieve Broadcast Bulletin Feed**
*   **Endpoint**: `{{BaseURL}}/api/announcements`
*   **Description**: Fetches general/urgent corporate notices sorted by recent publishing dates.

#### **[POST] Publish Corporate Bulletin Notice (Admin Only)**
*   **Endpoint**: `{{BaseURL}}/api/announcements`
*   **Description**: Adds corporate news, security reminders, or festival notices.
*   **Sample Payload**:
    ```json
    {
      "title": "Welcome Softwallet Interns!",
      "content": "All tech intern colleagues are invited to the core induction meet this Friday.",
      "category": "General",
      "sender": "Softwallet HR Team"
    }
    ```

---

### 📊 9. Admin Executive KPI Dashboard

#### **[GET] Retrieve Aggregated Performance Metrics (Admin Only)**
*   **Endpoint**: `{{BaseURL}}/api/admin/dashboard-stats`
*   **Description**: Aggregates corporate records dynamically (employee ratios, average daily check-in times, totals payroll disbursements, pending tasks) for charts.

---

## 🛠️ How to Set Up Database and Server
1. Open the root `.env` file.
2. Insert your MongoDB connection URI:
   ```env
   MONGODB_URI="mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster.mongodb.net/ems_db?retryWrites=true&w=majority"
   ```
3. Run the complete application (Frontend & Backend bundled):
   ```bash
   npm run dev
   ```
4. The backend will output:
   `✅ Connected to MongoDB Atlas successfully.`
   and automatically seed all base structures!
