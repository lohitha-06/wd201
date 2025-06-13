// registration.js (client-side only)
function getEntries() {
  return JSON.parse(localStorage.getItem("entries") || "[]");
}

function saveEntries(entries) {
  localStorage.setItem("entries", JSON.stringify(entries));
}

function renderEntries() {
  const tableBody = document.querySelector("#entriesTable tbody");
  tableBody.innerHTML = "";
  const entries = getEntries();
  entries.forEach((entry) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.name}</td>
      <td>${entry.email}</td>
      <td>${entry.password}</td>
      <td>${entry.dob}</td>
      <td>${entry.accepted}</td>
    `;
    tableBody.appendChild(row);
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidAge(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 18 && age <= 55;
}

document.addEventListener("DOMContentLoaded", function () {
  renderEntries();
  const form = document.getElementById("registrationForm");
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const dob = document.getElementById("dob").value;
    const accepted = document.getElementById("acceptTerms").checked;

    if (!isValidEmail(email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (!isValidAge(dob)) {
      alert("Age must be between 18 and 55 years.");
      return;
    }

    const entry = { name, email, password, dob, accepted };
    const entries = getEntries();
    entries.push(entry);
    saveEntries(entries);
    renderEntries();
    form.reset();
  });
});
