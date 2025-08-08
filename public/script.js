// Get the theme switcher button and container
const themeSwitcherButton = document.getElementById("theme-switcher");
const themeSwitcherContainer = document.getElementById("theme-switcher-container");
var isDarkThemeActive = 0;

// Get the light and dark theme radio buttons
const lightThemeRadio = document.getElementById("light-theme");
const darkThemeRadio = document.getElementById("dark-theme");

// Check if theme is already saved in local storage
if (localStorage.getItem("theme") === "dark") {
  isDarkThemeActive = 1;
  document.body.classList.add("dark-theme");
  darkThemeRadio.checked = true;
} else {
  isDarkThemeActive = 0;
  document.body.classList.remove("dark-theme");
  lightThemeRadio.checked = true;
}

// Add event listener to the theme switcher button
themeSwitcherButton.addEventListener("click", () => {
  // Toggle the theme switcher container
  themeSwitcherContainer.classList.toggle("show");
});

// Add event listener to the light theme radio button
lightThemeRadio.addEventListener("change", () => {
  // Remove the dark theme class from the body
  isDarkThemeActive = 0;
  document.body.classList.remove("dark-theme");
  localStorage.setItem("theme", "light");
});

// Add event listener to the dark theme radio button
darkThemeRadio.addEventListener("change", () => {
  // Add the dark theme class to the body
  isDarkThemeActive = 1;
  document.body.classList.add("dark-theme");
  localStorage.setItem("theme", "dark");
});