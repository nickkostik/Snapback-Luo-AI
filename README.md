# Snapback Luo AI Chat

This project provides a web-based chat interface to interact with an AI persona impersonating Luis Garcia ("Luo"), a former professional baseball pitcher.

## Features

*   **Chat Interface:** Engage in conversation with the Luis Garcia AI persona.
*   **Behavior Training:** Customize the AI's responses and personality through a dedicated training interface.
*   **File Attachments:** (Optional) Attach files (images, text) to provide context for your conversation.

## Running Locally

To run this project on your local machine, you need Python 3 installed.

1.  **Clone or Download:** Get the project files onto your computer. If you cloned using Git, navigate into the repository folder.
    ```bash
    git clone https://github.com/nickkostik/Snapback-Luo-AI.git
    cd Snapback-Luo-AI
    ```
    If you downloaded a ZIP file, extract it and navigate into the extracted folder using your terminal.

2.  **Start the Server:** From within the project directory (`Snapback-Luo-AI`), run the following command in your terminal:
    ```bash
    python -m http.server 8000
    ```
    This command starts a simple Python web server.

3.  **Access the Website:** Open your web browser and go to:
    `http://localhost:8000`

You should now see the Snapback Luo chat interface.

## Files

*   `index.html`: The main chat interface page.
*   `script.js`: Handles chat logic, API calls to Gemini, and file attachments.
*   `style.css`: Styles the appearance of the website.
*   `training.html`: Page for adding/managing training instructions.
*   `training_script.js`: Handles the logic for the training page (saving instructions to localStorage).
*   `api_key_setup.html` / `api_key_script.js`: (Note: API key is currently hardcoded in `script.js` - this setup might be deprecated or for future use).
*   `luis.png`: Logo image.