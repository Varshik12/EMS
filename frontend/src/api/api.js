/**
 * Smart Employee Management System (EMS) - Central API Service Module
 * Developed for Softwallet Innovative Technologies Pvt. Ltd. Internship Assignment
 * 
 * This file serves as the main communication interface between the frontend and the backend.
 * All fetch calls are centralized here to maintain clean and maintainable code.
 */

// ----------------------------------------------------------------------------------
// 🌐 LIVE BACKEND URL CONFIGURATION:
// Jab backend live ho jaye, toh apna Live URL niche quotes ke andar paste kar dena.
// Example: const LIVE_BACKEND_URL = "https://your-ems-backend.onrender.com";
// Agar ye khali ("") rahega, toh code apne aap "http://localhost:5000" par chalega.
// ----------------------------------------------------------------------------------
const LIVE_BACKEND_URL = "";

// Helper function to send JSON requests to the backend and parse the response.
const fetchJSON = async (url, options = {}) => {
  // LocalStorage se active session token fetch karein (if available)
  const token = localStorage.getItem('token');

  // Set default headers for standard JSON data exchange and Auth authorization
  const headers = {
    'Content-Type': 'application/json',                     // Set content type as JSON.
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}), // Pass bearer token for protected routes
    ...(options.headers || {})                              // Merges any additional custom headers.
  };

  // Base URL Resolution: Live Variable -> Vite Env -> Localhost Fallback
  const configuredEnvUrl = import.meta.env.VITE_API_URL || '';
  const liveUrl = LIVE_BACKEND_URL.trim();

  const apiBase = liveUrl !== "" 
    ? liveUrl 
    : (configuredEnvUrl !== "" ? configuredEnvUrl : "http://localhost:5000");

  const fullUrl = `${apiBase}${url}`;

  try {
    // Uses standard Fetch API to perform the network call to the backend.
    const response = await fetch(fullUrl, { ...options, headers });
    
    // Converts and returns the backend response in JSON format.
    const data = await response.json();
    return data;
  } catch (err) {
    console.warn(`Network/API notice for ${url}:`, err.message || err);
    return { success: false, error: err.message || 'Network request failed' };
  }
};

/**
 * ==========================================
 * 1. AUTHENTICATION SERVICES (LOGIN & PASSWORDS)
 * ==========================================
 */

/**
 * Handles user login requests.
 * Transmits email and password to verify backend session credentials.
 */
export const login = async (email, password, rememberMe) => {
  // Sends a POST request to '/api/auth/login' endpoint.
  return await fetchJSON('/api/auth/login', {
    method: 'POST', // POST method is used for safe credential submission.
    body: JSON.stringify({ email, password, rememberMe }) // Payload containing email, password, and session toggle.
  });
};

/**
 * Handles registration requests for new users/employees.
 */
export const register = async (userData) => {
  return await fetchJSON('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

/**
 * Verifies corporate email address and sends password reset tokens.
 */
export const forgotPassword = async (email) => {
  // Sends a POST request to forgot password endpoint for email verification.
  return await fetchJSON('/api/auth/forgot-password', {
    method: 'POST', // POST request to securely handle email input.
    body: JSON.stringify({ email }) // Corporate email address of the user.
  });
};

/**
 * Updates security password using a verified validation token.
 */
export const resetPassword = async (token, password) => {
  // Transmits the validation token and new password to the backend.
  return await fetchJSON('/api/auth/reset-password', {
    method: 'POST', // POST method for performing security-related updates.
    body: JSON.stringify({ token, password }) // Token and new password parameters.
  });
};


/**
 * ==========================================
 * 2. USER PROFILE & DOCUMENT SERVICES
 * ==========================================
 */

/**
 * Retrieves profile details of the logged-in user using email address query.
 */
export const getUserProfile = async (email) => {
  // Performs a GET request with safely encoded query parameters.
  return await fetchJSON(`/api/user?email=${encodeURIComponent(email)}`); // Safe URI character conversion.
};

/**
 * Updates profile attributes (such as contact, address, emergency info, etc.) for the logged-in user.
 */
export const updateUserProfile = async (updatedFields) => {
  // Sends modified attributes to '/api/user' URL via PUT method.
  return await fetchJSON('/api/user', {
    method: 'PUT', // PUT is the standard REST method for updating records.
    body: JSON.stringify(updatedFields) // Only transmits the modified fields.
  });
};

/**
 * Adds official verified employee documents (e.g., Resume, ID Proof) to database records.
 */
export const uploadUserDocument = async (name, size) => {
  // Triggers backend updates to log the document metadata.
  return await fetchJSON('/api/user/document', {
    method: 'POST', // Appends new document details via POST request.
    body: JSON.stringify({ name, size }) // File name and file size parameters.
  });
};

/**
 * Permanently removes document metadata from employee's verified documents list.
 */
export const deleteUserDocument = async (docId) => {
  // Targets delete requests using the unique document ID.
  return await fetchJSON(`/api/user/document/${docId}`, {
    method: 'DELETE' // DELETE method is utilized to remove sub-array records.
  });
};


/**
 * ==========================================
 * 3. EMPLOYEE DIRECTORY MANAGEMENT (ADMIN ONLY CRUD)
 * ==========================================
 */

/**
 * Retrieves the complete directory of all registered corporate employees.
 */
export const getEmployees = async () => {
  // Fetches full directory of employees from backend.
  return await fetchJSON('/api/employees'); // No query parameters needed for full listing.
};

/**
 * Registers a new employee card into the system database.
 */
export const createEmployee = async (employeeData) => {
  // Submits the new employee payload to the backend directory.
  return await fetchJSON('/api/employees', {
    method: 'POST', // POST method is used for record creation.
    body: JSON.stringify(employeeData) // Contains comprehensive employee details.
  });
};

/**
 * Adjusts role, department, designation, or salary for an existing employee.
 */
export const updateEmployee = async (id, employeeData) => {
  // Targets specific employee record using their unique ID.
  return await fetchJSON(`/api/employees/${id}`, {
    method: 'PUT', // PUT method handles attribute modifications.
    body: JSON.stringify(employeeData) // Updated form state.
  });
};

/**
 * Permanently removes an employee account from the corporate database directory.
 */
export const deleteEmployee = async (id) => {
  // Hits the deletion endpoint with verification of employee ID.
  return await fetchJSON(`/api/employees/${id}`, {
    method: 'DELETE' // DELETE method configures permanent deletion.
  });
};


/**
 * ==========================================
 * 4. DEPARTMENT MANAGEMENT (ADMIN ONLY)
 * ==========================================
 */

/**
 * Retrieves all active departments along with their assigned supervisors.
 */
export const getDepartments = async () => {
  // Standard server query to get departments array.
  return await fetchJSON('/api/departments'); // Fetches division details (IT, Sales, HR, etc.).
};

/**
 * Creates a brand new corporate department (e.g., Finance, UI/UX Design).
 */
export const createDepartment = async (departmentData) => {
  // Submits POST request to insert new department definition.
  return await fetchJSON('/api/departments', {
    method: 'POST', // POST handles inserting new entities.
    body: JSON.stringify(departmentData) // Department details and supervisor metadata.
  });
};

/**
 * Modifies department title or assigned supervisor.
 */
export const updateDepartment = async (id, departmentData) => {
  // Triggers updates by target department ID.
  return await fetchJSON(`/api/departments/${id}`, {
    method: 'PUT', // PUT handles configuration modifications.
    body: JSON.stringify(departmentData) // Object with updated department details.
  });
};

/**
 * Erases a department definition from the corporate database list.
 */
export const deleteDepartment = async (id) => {
  // Triggers deletion process based on department ID.
  return await fetchJSON(`/api/departments/${id}`, {
    method: 'DELETE' // Standard REST method for removing resources.
  });
};


/**
 * ==========================================
 * 5. ATTENDANCE & SHIFT TRACKING SERVICES
 * ==========================================
 */

/**
 * Downloads attendance logs (entire corporate history for Admin, personal logs for Employees).
 */
export const getAttendance = async (params = {}) => {
  let url = '/api/attendance'; // Default URL fallback.
  
  // Appends query parameter if full registry is requested (Admin dashboard).
  if (params.all) {
    url += '?all=true'; 
  } 
  // Appends user filter parameter for personal employee history.
  else if (params.userId) {
    url += `?userId=${encodeURIComponent(params.userId)}`; 
  }
  
  // Performs the network request.
  return await fetchJSON(url); 
};

/**
 * Logs a new daily shift check-in entry with accurate timestamps.
 */
export const checkIn = async (userId) => {
  // Triggers check-in so that backend can determine punctuality status.
  return await fetchJSON('/api/attendance/checkin', {
    method: 'POST', // Generates a new attendance record using POST.
    body: JSON.stringify({ userId })
  });
};

/**
 * Logs shift checkout entry and calculates active working hours for the day.
 */
export const checkOut = async (lastRecordId, userId) => {
  // Closes the current active attendance entry using its ID.
  return await fetchJSON('/api/attendance/checkout', {
    method: 'POST', // Updates check-out timestamps and hours via POST.
    body: JSON.stringify({ lastRecordId, userId }) // Reference to the open check-in slot.
  });
};

/**
 * Updates attendance records manually (Admin Timing Adjustments).
 */
export const updateAttendanceRecord = async (id, editForm) => {
  // Manual attendance override trigger point.
  return await fetchJSON(`/api/attendance/${id}`, {
    method: 'PUT', // PUT request to overwrite manual adjustments.
    body: JSON.stringify(editForm) // Active hours, details, and status overrides.
  });
};


/**
 * ==========================================
 * 6. LEAVE REQUEST APPLICATIONS & APPROVALS
 * ==========================================
 */

/**
 * Retrieves leave applications (all pending for Admin approval, dashboard history for Employees).
 */
export const getLeaves = async (params = {}) => {
  let url = '/api/leaves'; // Base URL path.
  
  // Checks if all system entries should be fetched.
  if (params.all) {
    url += '?all=true'; 
  } 
  // Filters list by Employee ID for personal entries.
  else if (params.userId) {
    url += `?userId=${encodeURIComponent(params.userId)}`; 
  }
  
  // Triggers the request to fetch records.
  return await fetchJSON(url);
};

/**
 * Submits a new leave request application (Sick leave, Casual leave, etc.).
 */
export const submitLeaveRequest = async (type, startDate, endDate, reason, userId) => {
  // Submits the form data for validation and registration.
  return await fetchJSON('/api/leaves', {
    method: 'POST', // Form submission method.
    body: JSON.stringify({ type, startDate, endDate, reason, userId }) // Fields containing date range and description.
  });
};

/**
 * Updates status of a leave application (Admin marks 'Approved' or 'Rejected').
 */
export const updateLeaveStatus = async (id, status) => {
  // Sends request to update specific application status.
  return await fetchJSON(`/api/leaves/${id}`, {
    method: 'PUT', // PUT method to edit record state.
    body: JSON.stringify({ status }) // New status ('Approved' or 'Rejected').
  });
};


/**
 * ==========================================
 * 7. CORPORATE PAYROLL & SALARY SLIP DISBURSALS
 * ==========================================
 */

/**
 * Retrieves salary slips data for viewing or download.
 */
export const getSalarySlips = async (params = {}) => {
  let url = '/api/salaryslips'; // Core payroll route.
  
  // Checks for administrator full view requirement.
  if (params.all) {
    url += '?all=true'; 
  } 
  // Checks for specific employee record request.
  else if (params.userId) {
    url += `?userId=${encodeURIComponent(params.userId)}`; 
  }
  
  return await fetchJSON(url);
};

/**
 * Generates a monthly salary slip record for an employee.
 */
export const generateSalarySlip = async (userId, formData) => {
  // Submits payroll variables to register transactions.
  return await fetchJSON('/api/salaryslips/generate', {
    method: 'POST', // POST request to securely transmit payment records.
    body: JSON.stringify({ userId, ...formData }) // Contains basic, allowances, deductions and net details.
  });
};


/**
 * ==========================================
 * 8. NOTICE BULLETINS & METRICS OVERVIEW
 * ==========================================
 */

/**
 * Retrieves recent notice board notifications.
 */
export const getAnnouncements = async () => {
  // Fetches bulletin communications feed.
  return await fetchJSON('/api/announcements'); // Returns announcement lists sorted by recency.
};

/**
 * Publishes a new announcement or holiday notice to the company bulletin.
 */
export const createAnnouncement = async (announcementData) => {
  // Triggers POST to insert announcement entity.
  return await fetchJSON('/api/announcements', {
    method: 'POST', // Standard creation method.
    body: JSON.stringify(announcementData) // Object with title, body, tag, and author metadata.
  });
};

/**
 * Collects real-time administrative dashboard metrics.
 */
export const getDashboardStats = async () => {
  // Requests consolidated high-level KPI values from the server.
  return await fetchJSON('/api/admin/dashboard-stats'); // Counts of employees, active leaves, aggregate salary data, etc.
};