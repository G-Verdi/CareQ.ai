// Simple user database
const users = {
  patients: {
    "smr": { password: "smr", name: "Sam Rogers" },
    "brain": { password: "brain", name: "Brain Smith" },
    "toronto": { password: "toronto", name: "Toronto Clinic" }
  },
  admins: {
    "admin1": { password: "admin1", name: "Main Admin" },
    "admin2": { password: "admin2", name: "Clinic Manager" }
  }
};

// Session management
let currentUser = null;

// Login function
function handleLogin(userType) {
  const username = document.getElementById(`${userType}-username`).value.trim();
  const password = document.getElementById(`${userType}-password`).value;
  const errorElement = document.getElementById(`${userType}-error`);

  // Reset error
  errorElement.textContent = '';
  errorElement.classList.add('d-none');

  // Simple validation
  if (!username || !password) {
    showError(errorElement, "Both fields are required");
    return false;
  }

  // Check credentials
  if (users[userType + 's'][username]?.password === password) {
    currentUser = {
      type: userType,
      username: username,
      ...users[userType + 's'][username]
    };
    sessionStorage.setItem('careqUser', JSON.stringify(currentUser));
    return true;
  } else {
    showError(errorElement, "Invalid credentials");
    return false;
  }
}

// Show error message
function showError(element, message) {
  element.textContent = message;
  element.classList.remove('d-none');
}

// Check existing session
function checkSession() {
  const userData = sessionStorage.getItem('careqUser');
  if (userData) {
    currentUser = JSON.parse(userData);
    if (currentUser.type === 'patient') {
      document.getElementById('patientName').textContent = currentUser.name;
    }
    return true;
  }
  return false;
}

// Logout function
function handleLogout() {
  sessionStorage.removeItem('careqUser');
  currentUser = null;
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Patient login form
  document.getElementById('patient-login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    if (handleLogin('patient')) {
      window.location.href = 'patient.html';
    }
  });

  // Admin login form
  document.getElementById('admin-login-form')?.addEventListener('submit', function(e) {
    e.preventDefault();
    if (handleLogin('admin')) {
      window.location.href = 'admin.html';
    }
  });

  // Logout buttons
  document.querySelectorAll('.logout-btn').forEach(btn => {
    btn.addEventListener('click', handleLogout);
  });

  // Check existing session
  if (!window.location.pathname.includes('index.html') && !checkSession()) {
    window.location.href = 'index.html';
  }
});