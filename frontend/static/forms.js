document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = loginForm.querySelector("#email").value;
      const password = loginForm.querySelector("#password").value;

      // Basic validation
      if (email && password) {
        alert("Login successful! (Demo mode)");
        //  handle authentication here eventually
      } else {
        alert("Please fill in all fields");
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = signupForm.querySelector("#email").value;
      const password = signupForm.querySelector("#password").value;
      const confirmPassword =
        signupForm.querySelector("#confirmPassword").value;

      // Basic validation
      if (email && password && confirmPassword) {
        if (password === confirmPassword) {
          alert("Sign up successful! (Demo mode)");
          // handle account creation here
        } else {
          alert("Passwords do not match");
        }
      } else {
        alert("Please fill in all fields");
      }
    });
  }
});
