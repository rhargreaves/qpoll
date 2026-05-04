import "./style.css";

const appDiv = document.querySelector<HTMLDivElement>("#app")!;
const API_BASE_URL = "/api";

// --- Routing Logic ---
function navigateTo(path: string) {
  window.location.hash = path;
}

async function render() {
  const path = window.location.hash.substring(1); // Remove '#'

  if (path === "" || path === "/") {
    renderCreatePollPage();
  } else if (path.startsWith("/poll/")) {
    const pollId = path.substring("/poll/".length);
    if (pollId) {
      await renderPollPage(pollId);
    } else {
      renderNotFound();
    }
  } else {
    renderNotFound();
  }
}

// --- Page Render Functions ---

function renderCreatePollPage() {
  appDiv.innerHTML = `
    <h1>Create a New Poll</h1>
    <form id="createPollForm">
      <input type="text" id="pollNameInput" placeholder="Enter poll name" required />
      <button type="submit">Create Poll</button>
    </form>
    <p id="message" style="color: red;"></p>
  `;

  const form = document.getElementById("createPollForm");
  form?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const pollNameInput = document.getElementById("pollNameInput") as HTMLInputElement;
    const messageElement = document.getElementById("message");
    const pollName = pollNameInput.value.trim();

    if (!pollName) {
      if (messageElement) messageElement.textContent = "Poll name cannot be empty.";
      return;
    }
    if (messageElement) messageElement.textContent = "";

    try {
      const response = await fetch(`${API_BASE_URL}/polls`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: pollName }),
      });

      if (response.ok) {
        const data: { id: string; name: string } = await response.json();
        navigateTo(`/poll/${data.id}`);
      } else {
        const errorData = await response.json();
        if (messageElement) messageElement.textContent = `Error: ${errorData.error || response.statusText}`;
      }
    } catch (error) {
      console.error("Error creating poll:", error);
      if (messageElement) messageElement.textContent = "Failed to connect to the server.";
    }
  });
}

async function renderPollPage(pollId: string) {
  appDiv.innerHTML = `<h1>Loading Poll...</h1><p>ID: ${pollId}</p>`; // Initial loading state

  try {
    const response = await fetch(`${API_BASE_URL}/polls/${pollId}`);
    if (response.ok) {
      const data: { id: string; name: string } = await response.json();
      appDiv.innerHTML = `
        <h1>Poll: "${data.name}"</h1>
        <p>Poll ID: <code>${data.id}</code></p>
        <p>This is your poll page. More features to come!</p>
      `;
    } else {
      appDiv.innerHTML = `
        <h1>Poll Not Found</h1>
        <p>The poll with ID <code>${pollId}</code> could not be found.</p>
        <button onclick="navigateTo('/')">Create a New Poll</button>
      `;
    }
  } catch (error) {
    console.error("Error fetching poll:", error);
    appDiv.innerHTML = `
      <h1>Error</h1>
      <p>Failed to load poll <code>${pollId}</code>.</p>
      <button onclick="navigateTo('/')">Create a New Poll</button>
    `;
  }
}

function renderNotFound() {
  appDiv.innerHTML = `
    <h1>404 Not Found</h1>
    <p>The page you are looking for does not exist.</p>
    <button onclick="navigateTo('/')">Go to Home</button>
  `;
}

// Initial render and listen for hash changes
window.addEventListener("hashchange", render);
render(); // Render on initial page load

// Expose navigateTo globally for onclick handlers
(window as any).navigateTo = navigateTo;
