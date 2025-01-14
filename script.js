// 1. DOM Elements
const select = document.getElementById("languageSelect");
const repositorySection = document.querySelector(".repository");
const loadingSpinner = document.querySelector(".loading");
const errorSection = document.querySelector(".error");
const retrySection = document.querySelector(".retry-search");

// 2. Initial Setup
function hideAllSections() {
  repositorySection.classList.add("hidden");
  loadingSpinner.classList.add("hidden");
  errorSection.classList.add("hidden");
  retrySection.innerHTML = "";
}

hideAllSections();

// 3. API Functions
async function getProgrammingLanguages() {
  const response = await fetch(
    "https://raw.githubusercontent.com/kamranahmedse/githunt/master/src/components/filters/language-filter/languages.json"
  );
  return await response.json();
}

async function getGitHubRepositories(language) {
  const response = await fetch(
    `https://api.github.com/search/repositories?q=language:${language}`
  );
  return await response.json();
}

// 4. UI Functions
function showLoading() {
  hideAllSections();
  loadingSpinner.classList.remove("hidden");
}

function showError() {
  hideAllSections();
  errorSection.classList.remove("hidden");
  errorSection.innerHTML = "<p>Error fetching repositories</p>";

  const retryButton = document.createElement("button");
  retryButton.className = "retry-button-error";
  retryButton.textContent = "Click to retry";
  retryButton.onclick = () => displayRepository(select.value);

  retrySection.appendChild(retryButton);
}

function showRepository(repository) {
  hideAllSections();
  repositorySection.classList.remove("hidden");

  repositorySection.innerHTML = `
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

  const refreshButton = document.createElement("button");
  refreshButton.className = "retry-button";
  refreshButton.textContent = "Refresh";
  refreshButton.onclick = () => displayRepository(select.value);

  retrySection.appendChild(refreshButton);
}

function showEmptyState() {
  hideAllSections();
  repositorySection.classList.remove("hidden");
  repositorySection.innerHTML = "<p>Please select a language</p>";
}

// 5. Main Functions
async function displayRepository(language) {
  if (!language) {
    showEmptyState();
    return;
  }

  showLoading();

  try {
    const repos = await getGitHubRepositories(language);
    if (!repos.items?.length) {
      throw new Error("No repositories found");
    }

    const randomRepo =
      repos.items[Math.floor(Math.random() * repos.items.length)];
    showRepository(randomRepo);
  } catch (error) {
    showError();
  } finally {
    loadingSpinner.classList.add("hidden");
  }
}

async function initializeApp() {
  try {
    const languages = await getProgrammingLanguages();
    const fragment = document.createDocumentFragment();

    languages.forEach((lang) => {
      const option = document.createElement("option");
      option.value = lang.value;
      option.textContent = lang.title;
      fragment.appendChild(option);
    });

    select.appendChild(fragment);
  } catch (error) {
    showError();
  }
}

// 6. Event Listeners
select.addEventListener("change", (e) => displayRepository(e.target.value));

// 7. Initialize
initializeApp();
