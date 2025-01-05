// Simulated login credentials
const credentials = {
    username: "admin",
    password: "admin123",
  };
  
  // Form handling
  document.getElementById("login-form").addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent form submission
  
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMessage = document.getElementById("error-message");
  
    // Validate credentials
    if (username === credentials.username && password === credentials.password) {
      errorMessage.textContent = ""; // Clear error message
      alert("Connexion réussie !");
      window.location.href = "dashboard.html"; // Redirect to the dashboard page
    } else {
      errorMessage.textContent = "Nom d'utilisateur ou mot de passe incorrect.";
    }
  });
  