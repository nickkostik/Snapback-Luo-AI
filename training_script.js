const instructionInput = document.getElementById('trainingInstruction');
const confirmationMessageDiv = document.getElementById('confirmationMessage');
const savedInstructionsList = document.getElementById('savedInstructionsList'); // Get the list element

// Load instructions from localStorage on page load
let savedInstructions = JSON.parse(localStorage.getItem('luoTrainingInstructions')) || [];
let confirmationTimeout;

// Function to update the display of saved instructions
function updateSavedInstructionsDisplay() {
    if (!savedInstructionsList) return; // Exit if the list element doesn't exist

    savedInstructionsList.innerHTML = ''; // Clear the current list

    if (savedInstructions.length === 0) {
        savedInstructionsList.innerHTML = '<li>No instructions saved yet.</li>';
        return;
    }

    savedInstructions.forEach((instr, index) => {
        const item = document.createElement('li');
        item.textContent = instr;

        // Add a delete button for each instruction
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '❌'; // Simple delete icon
        deleteButton.classList.add('delete-instruction-btn');
        deleteButton.title = 'Delete this instruction';
        deleteButton.onclick = () => deleteInstruction(index); // Pass index to delete function

        item.appendChild(deleteButton);
        savedInstructionsList.appendChild(item);
    });
}

// Function to save instructions to localStorage
function saveInstructionsToLocalStorage() {
    localStorage.setItem('luoTrainingInstructions', JSON.stringify(savedInstructions));
}

// Function to delete an instruction
function deleteInstruction(indexToDelete) {
    savedInstructions.splice(indexToDelete, 1); // Remove the instruction at the given index
    saveInstructionsToLocalStorage(); // Update localStorage
    updateSavedInstructionsDisplay(); // Update the displayed list
}


instructionInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();

        const instructionText = instructionInput.value.trim();

        if (instructionText) {
            // 1. Clear the input field
            instructionInput.value = '';

            // 2. Add to array and save to localStorage
            savedInstructions.push(instructionText);
            saveInstructionsToLocalStorage();
            console.log("Instruction saved to localStorage:", instructionText);

            // 3. Show confirmation message
            confirmationMessageDiv.textContent = `✅ Instruction saved: "${instructionText}"`;
            confirmationMessageDiv.style.opacity = '1';

            // Clear previous timeout
            clearTimeout(confirmationTimeout);

            // Hide the confirmation message after a few seconds
            confirmationTimeout = setTimeout(() => {
                confirmationMessageDiv.style.opacity = '0';
            }, 3000);

            // Update the display of saved instructions
            updateSavedInstructionsDisplay();
        }
    }
});

// Initial setup
confirmationMessageDiv.style.opacity = '0';
confirmationMessageDiv.style.transition = 'opacity 0.5s ease-out';
updateSavedInstructionsDisplay(); // Display initially loaded instructions