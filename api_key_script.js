const apiKeyInput = document.getElementById('apiKeyInput');
const saveButton = document.getElementById('saveApiKeyButton');
const confirmationDiv = document.getElementById('saveConfirmation');
let confirmationTimeout;

// Function to save the key
function saveApiKey() {
    const apiKey = apiKeyInput.value.trim();

    if (apiKey) {
        // Save to sessionStorage (cleared when browser tab/window closes)
        sessionStorage.setItem('googleAiApiKey', apiKey);
        console.log("API Key saved to sessionStorage (DEMO ONLY)");

        // Show confirmation
        confirmationDiv.textContent = '✅ API Key saved for this session.';
        confirmationDiv.style.opacity = '1';
        confirmationDiv.style.color = '#34c759'; // Green confirmation

        // Clear previous timeout
        clearTimeout(confirmationTimeout);

        // Hide confirmation after a few seconds
        confirmationTimeout = setTimeout(() => {
            confirmationDiv.style.opacity = '0';
        }, 3000);

        // Optionally clear the input field after saving
        // apiKeyInput.value = '';
    } else {
        // Show error/prompt if key is empty
        confirmationDiv.textContent = '⚠️ Please enter an API Key.';
        confirmationDiv.style.opacity = '1';
        confirmationDiv.style.color = '#ff9f0a'; // Orange warning color

        // Clear previous timeout
        clearTimeout(confirmationTimeout);

         // Hide confirmation after a few seconds
         confirmationTimeout = setTimeout(() => {
            confirmationDiv.style.opacity = '0';
        }, 3000);
    }
}

// Event listener for the button
saveButton.addEventListener('click', saveApiKey);

// Optional: Allow saving by pressing Enter in the input field
apiKeyInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent potential form submission
        saveApiKey();
    }
});

// Initial setup: Load existing key from sessionStorage if present
const existingKey = sessionStorage.getItem('googleAiApiKey');
if (existingKey) {
    apiKeyInput.value = existingKey;
    console.log("Loaded existing API Key from sessionStorage.");
}

// Ensure confirmation message is hidden initially and styled
confirmationDiv.style.opacity = '0';
confirmationDiv.style.transition = 'opacity 0.5s ease-out';