// 1. First, we get all the HTML elements we'll need using DOM selectors
const select = document.getElementById("languageSelect"); // Dropdown menu
const repositorySection = document.querySelector(".repository"); // Where we'll show the repo
const loadingSpinner = document.querySelector(".loading"); // Loading indicator
const errorSection = document.querySelector(".error"); // Error messages
const retrySection = document.querySelector(".retry-search"); // Refresh button section

// 2. Hide sections initially (adding CSS classes)
repositorySection.classList.add("hidden");
loadingSpinner.classList.add("hidden");
errorSection.classList.add("hidden");

// 3. Function to get programming languages from external API
async function getProgrammingLanguages() {
  // Fetch languages list from GitHub
  const response = await fetch(
    "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json"
  );
  return await response.json(); // Convert response to JSON
}

// 4. Function to populate the dropdown with languages
async function populateLanguageSelect() {
  // Get languages from API
  const languages = await getProgrammingLanguages();

  // Create a document fragment (better for performance)
  const fragment = document.createDocumentFragment();

  // For each language, create an option element
  languages.forEach((lang) => {
    const option = document.createElement("option");
    option.value = lang.value; // e.g., "javascript"
    option.textContent = lang.title; // e.g., "JavaScript"
    fragment.appendChild(option);
  });

  // Add all options to select element
  select.appendChild(fragment);
}

// 5. Function to fetch repositories from GitHub API
async function getGitHubRepositories(language) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=language:${language}`
  );
  return await response.json();
}

// 6. Function to get a random repository from results
function getRandomRepository(repositories) {
  const totalRepos = repositories.items.length;
  // Get random index and return that repository
  return repositories.items[Math.floor(Math.random() * totalRepos)];
}

// 7. Function to create and display repository information
function createRepositoryElements(repository) {
  // Create HTML for repository display
  const repoHTML = `
        <h2>${repository.name}</h2>
        <p>${repository.description || "No description available"}</p>
        <div class="project-stats">
            <span>
                <img src="img/circle-svgrepo-com.svg">
                ${repository.language}
            </span>
            <span>
                <img src="img/star-svgrepo-com.svg">
                ${repository.stargazers_count}
            </span>
            <span>
                <img src="img/git-fork-svgrepo-com.svg">
                ${repository.forks}
            </span>
            <span>
                <img src="img/exclamation-circle-svgrepo-com.svg">
                ${repository.open_issues}
            </span>
        </div>
    `;

  // Put the HTML into the repository section
  repositorySection.innerHTML = repoHTML;
}

// 8. Function to show error message
function showError() {
  repositorySection.classList.add("hidden"); // Hide repository section
  errorSection.classList.remove("hidden"); // Show error section
  errorSection.innerHTML = "<p>Error fetching repositories</p>";
}

// 9. Main function to handle displaying repository
async function displayRepository(language, addRetryButton = true) {
  // Show loading spinner
  loadingSpinner.classList.remove("hidden");
  repositorySection.classList.add("hidden");
  errorSection.classList.add("hidden");

  try {
    // Get repositories and select random one
    const repos = await getGitHubRepositories(language);
    const randomRepo = getRandomRepository(repos);

    // Show repository
    errorSection.classList.add("hidden");
    repositorySection.classList.remove("hidden");
    createRepositoryElements(randomRepo);

    // Add refresh button if needed
    if (addRetryButton) {
      addRefreshButton();
    }
  } catch (error) {
    // Handle any errors
    showError();
    if (addRetryButton) {
      addRefreshButton();
    }
  } finally {
    // Always hide loading spinner when done
    loadingSpinner.classList.add("hidden");
  }
}

// 10. Function to add refresh button
function addRefreshButton() {
  const refreshButton = document.createElement("button");
  refreshButton.className = "retry-button";
  refreshButton.textContent = "Refresh";

  // Remove existing button if any
  if (retrySection.children.length > 0) {
    retrySection.removeChild(retrySection.lastChild);
  }

  // Add button and its click handler
  retrySection.appendChild(refreshButton);
  refreshButton.addEventListener("click", () => {
    displayRepository(select.value, false);
  });
}

// 11. Event listener for language selection
select.addEventListener("change", (event) => {
  displayRepository(event.target.value, true);
});

// 12. Initialize the app by populating languages
populateLanguageSelect();
