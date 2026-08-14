# Smart Employee Management System (EMS) - Frontend Guide

Welcome to the frontend documentation of the **Smart Employee Management System (EMS)**. This client-side application is built using **React (v19)**, **Vite (v6)**, and styled beautifully with **Tailwind CSS**. It communicates with the backend API in real-time to provide automated dashboard syncing, attendance marking, leave requests, announcements, and payroll management.

---

## 🚀 Key Technical Features
- **Real-Time Data Syncing**: The frontend polls the backend API every 5 seconds to fetch the latest updates. Any changes made by the Admin (such as approving leave, updating details, or adding announcements) are updated in real-time on the Employee's dashboard.
- **Double Role View Switching**: The Admin can quickly toggle views or inspect specific Employee components for testing.
- **Responsive Layout**: Seamlessly supports Desktop, Tablet, and Mobile screens.

---

## 📁 Component & Pages Breakdown

Here is a brief description of what each component and page does in this system:

### 💼 Context & Routing (Core Engine)
- **`src/context/AppContext.jsx`**: The brain of the frontend! It holds the global state (`user`, `attendance`, `leaves`, `salarySlips`, `roleView`, etc.) and performs automatic API polling every 5 seconds. This guarantees real-time synchronization between Admin actions and Employee views.
- **`src/components/Common/PrivateRoute.jsx`**: Protects secure routes from unauthorized access.
- **`src/components/Common/Navbar.jsx`**: The top navigation bar, displaying corporate branding, current role, notifications, and user profiles.
- **`src/components/Common/Sidebar.jsx`**: Sidebar layout adapted based on user privileges (Admin options vs. Employee options).

### 🔑 Authentication Pages (`src/pages/Auth/`)
- **`Login.jsx`**: Login screen with options for Admin (`admin@softwallet.com`) and Employees. Clears/seeds sessionStorage and logs the user in securely.
- **`ForgotPassword.jsx`**: Handles email input for generating a secure password reset link.
- **`ResetPassword.jsx`**: Form to submit and register a new, secure password.

### 👑 Admin Pages (`src/pages/Admin/`)
- **`Dashboard.jsx`**: The Admin control center. Displays dynamic counters (Total Employees, Active count, Departments, Today's Attendance rate, Pending Leave requests) and monthly salary expenses with rich interactive charts (**Recharts**).
- **`ManageEmployees.jsx`**: Admin CRUD panel for employees. Allows adding, editing, activating, deactivating, and searching employees by name/email/department with clean status indicators.
- **`ManageDepartments.jsx`**: Section to manage corporate divisions (IT, HR, Sales, Accounts). Displays department manager names and real-time headcounts.
- **`AttendanceManagement.jsx`**: Real-time log of check-ins and check-outs across the company. Supports date filtering and employee searches.
- **`LeaveApproval.jsx`**: Panel to review leave requests. Admin can **Approve** or **Reject** with real-time feedback visible on the employee's screen immediately.
- **`Payroll.jsx`**: Allows generating monthly salary slips with fields like Basic, Allowance, Bonus, Deductions, and Net Salary.
- **`Announcements.jsx`**: Form to post company-wide notices (Urgent, Holiday, Policy) which display immediately in the employee's news feed.
- **`Reports.jsx`**: Generates high-quality summary reports (CSV/Print format) for Attendance, Leaves, Employees, and Salaries.

### 👤 Employee Pages (`src/pages/Employee/`)
- **`Dashboard.jsx`**: Employee dashboard showing immediate attendance status, current check-in/out timers, weekly calendar logs, and recent company announcements.
- **`Attendance.jsx`**: Check-In / Check-Out interface with geofenced simulation or quick click logging, tracking active hours worked.
- **`LeaveRequest.jsx`**: Form to apply for leaves (type, dates, reason) and real-time logs displaying status (`Pending`, `Approved`, `Rejected`).
- **`Profile.jsx`**: Section to update personal details, change passwords, and upload corporate verification documents (Resume, ID card).
- **`SalarySlips.jsx`**: Personal salary archive where employees can view and download details of their monthly salary slips.

---

## 🛠️ How to Run Frontend Locally
If running standalone:
1. Navigate to `/frontend`
2. Install dependencies: `npm install`
3. Start Vite dev server: `npm run dev`
4. Access at: `http://localhost:3000` (if proxied through server) or default Vite port.
