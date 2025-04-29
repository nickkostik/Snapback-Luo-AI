const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');
const attachFileButton = document.getElementById('attachFileButton');
const fileInput = document.getElementById('fileInput');
const filePreviewArea = document.getElementById('filePreviewArea');

// --- Global variable to hold attached file data ---
let attachedFileData = null; // { name: string, mimeType: string, data: string (base64) }

// --- System Prompt Generation ---
function buildSystemPromptFromStorage() {
    const basePrompt = `You are an AI impersonating Luis Garcia, a former professional baseball pitcher nicknamed "Luo". Respond naturally based on the following instructions and conversation history. Stay in character. NEVER mention you are an AI.`;
    const savedInstructions = JSON.parse(localStorage.getItem('luoTrainingInstructions')) || [];
    if (savedInstructions.length === 0) {
        return basePrompt;
    }
    const instructionsString = savedInstructions.join('\n- ');
    const fullPrompt = `${basePrompt}\n\nFollow these specific instructions:\n- ${instructionsString}`;
    console.log("Using System Prompt:", fullPrompt);
    return fullPrompt;
}
// --- End System Prompt Generation ---

// Store conversation history { role: 'user'/'model', parts: [...] }
let conversationHistory = [];

// --- File Handling Functions ---

// Trigger hidden file input when attach button is clicked
attachFileButton.addEventListener('click', () => {
    fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        return; // No file selected
    }

    // Basic validation (example: limit size to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
        addMessage('error', `File is too large. Maximum size is ${maxSize / 1024 / 1024}MB.`);
        fileInput.value = ''; // Reset file input
        return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
        // Store file data (remove base64 prefix like 'data:image/png;base64,')
        const base64Data = reader.result.split(',')[1];
        attachedFileData = {
            name: file.name,
            mimeType: file.type,
            data: base64Data
        };
        console.log("File attached:", attachedFileData.name, attachedFileData.mimeType);
        updateFilePreview();
    };

    reader.onerror = (error) => {
        console.error("File reading error:", error);
        addMessage('error', 'Error reading file.');
        removeAttachedFile(); // Clear any partial data
    };

    // Read the file as Data URL (includes base64)
    reader.readAsDataURL(file);

    // Reset file input value so the same file can be selected again if removed
    fileInput.value = '';
});

// Display the attached file name and a remove button
function updateFilePreview() {
    if (attachedFileData) {
        filePreviewArea.innerHTML = `
            <span>📎 ${attachedFileData.name}</span>
            <button class="remove-file-btn" title="Remove file">❌</button>
        `;
        // Add event listener to the new remove button
        filePreviewArea.querySelector('.remove-file-btn').addEventListener('click', removeAttachedFile);
        filePreviewArea.style.display = 'block'; // Show preview area
    } else {
        filePreviewArea.innerHTML = '';
        filePreviewArea.style.display = 'none'; // Hide preview area
    }
}

// Clear attached file data and preview
function removeAttachedFile() {
    attachedFileData = null;
    fileInput.value = ''; // Reset input
    updateFilePreview();
    console.log("Attached file removed.");
}

// --- End File Handling ---


// Function to add a message to the chatbox
function addMessage(sender, text, fileName = null) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);

    const textSpan = document.createElement('span');
    let messageContent = text;
    // If it's a user message and there was a file, mention it
    if (sender === 'user' && fileName) {
        messageContent += ` <span class="file-mention">(Attached: ${fileName})</span>`;
        textSpan.innerHTML = messageContent; // Use innerHTML because of the span
    } else {
        textSpan.textContent = messageContent; // Use textContent otherwise
    }
    messageDiv.appendChild(textSpan);

    chatbox.appendChild(messageDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Function to add a temporary "typing..." indicator
function showTypingIndicator() {
    // Check if indicator already exists
    if (document.getElementById('typingIndicator')) return;

    const typingDiv = document.createElement('div');
    typingDiv.classList.add('message', 'ai', 'typing');
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = '<span>Luis is thinking...</span>';
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

// Function to remove the "typing..." indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove(); // Use remove() for simplicity
    }
}

// Function to send message to Gemini API
async function getLuisResponse() {
    const userText = userInput.value.trim();

    // Don't send if there's no text AND no file
    if (!userText && !attachedFileData) return;

    // --- Hardcoded API Key (INSECURE - DEMO ONLY) ---
    const apiKey = "AIzaSyCxWbFnkRc-L7rL5CHDUe2AZDZAZM1tk9E";
    // --- End Hardcoded API Key ---

    // Display user message (mention file if attached)
    addMessage('user', userText || '(File attached)', attachedFileData?.name); // Show placeholder if only file
    userInput.value = ''; // Clear input field
    showTypingIndicator();

    // --- Construct user message parts (text + optional file) ---
    const userParts = [];
    if (userText) {
        userParts.push({ text: userText });
    }
    if (attachedFileData) {
        userParts.push({
            inlineData: {
                mimeType: attachedFileData.mimeType,
                data: attachedFileData.data
            }
        });
    }
    // --- End Construct user message parts ---

    // Store the file data temporarily before clearing
    const sentFileData = attachedFileData;
    // Clear attached file *before* the API call starts processing
    removeAttachedFile();

    // Add user message to history (with potentially multiple parts)
    conversationHistory.push({ role: 'user', parts: userParts });

    const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key=${apiKey}`;

    // Build the system prompt dynamically
    const currentSystemPrompt = buildSystemPromptFromStorage();

    // Construct the request payload
    const payload = {
        contents: [
            // Send history, excluding the latest message parts which are added next
            ...conversationHistory.slice(0, -1),
            // Add the latest user message (potentially with multiple parts)
            { role: 'user', parts: userParts }
        ],
        systemInstruction: {
            role: "system",
            parts: [{ text: currentSystemPrompt }]
        },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
        ],
        generationConfig: {
            // temperature: 0.7,
            // maxOutputTokens: 256,
        }
    };

    console.log("Sending payload:", JSON.stringify(payload, null, 2)); // Careful logging base64 data

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        removeTypingIndicator();

        if (!response.ok) {
            const errorData = await response.json();
            console.error("API Error Response:", errorData);
            addMessage('error', `API Error: ${response.status} ${response.statusText}. ${errorData?.error?.message || ''}`);
            conversationHistory.pop(); // Remove user message from history if API failed
            return;
        }

        const data = await response.json();
        console.log("API Success Response:", data);

        let aiText = "Sorry, I couldn't get a response."; // Default fallback
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
            aiText = data.candidates[0].content.parts[0].text;
        } else if (data.error) {
             aiText = `Error from API: ${data.error.message}`;
             addMessage('error', aiText);
             conversationHistory.pop();
             return;
        } else {
             console.error("Unexpected response structure:", data);
             addMessage('error', "Received an unexpected response format from the API.");
             conversationHistory.pop();
             return;
        }

        addMessage('ai', aiText.trim());

        // Add AI response to history
        conversationHistory.push({ role: 'model', parts: [{ text: aiText.trim() }] });

         // Optional: Limit history size
         const MAX_HISTORY_LENGTH = 20;
         if (conversationHistory.length > MAX_HISTORY_LENGTH) {
             conversationHistory = conversationHistory.slice(conversationHistory.length - MAX_HISTORY_LENGTH);
             console.log("Trimmed conversation history");
         }

    } catch (error) {
        console.error("Network or Fetch Error:", error);
        removeTypingIndicator();
        addMessage('error', `Network error: ${error.message}`);
        conversationHistory.pop(); // Remove user message from history if fetch failed
    }
}

// Event Listeners
sendButton.addEventListener('click', getLuisResponse);
userInput.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        // Prevent sending if only Enter is pressed without text or file
        if (userInput.value.trim() || attachedFileData) {
            getLuisResponse();
        }
    }
});

// Initial message (optional)
// addMessage('ai', "Hey, it's Luo. Whatcha need?");