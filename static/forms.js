async function hash(password) { //hash the password using SHA256
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await window.crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hash)); // convert buffer to byte array
  const hashHex = hashArray
  .map((b) => b.toString(16).padStart(2, "0"))
  .join(""); // convert bytes to hex string
  return hashHex;
}

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
          hash(password).then(result=>{
            console.log(result)
            fetch("attemptuserlogin", {
              method: "POST",
              body: JSON.stringify({
                username: email,
                password: result
              }),
            }).then(result => {
              const json = result.json().then(result => {
                if(result["error-code"] == 1) {
                  window.location.replace("app.html")
                }
                else {
                  alert(result["error-msg"])
                }
              });

            });
            })
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
          hash(password).then(result=>{
            console.log(result)
            fetch("attemptuserregister", {
              method: "POST",
              body: JSON.stringify({
                username: email,
                password: result
              }),
            }).then(result => {
              const json = result.json().then(result => {
                alert(result["error-msg"])
                window.location.replace("login.html")

              });

            });
            })
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
