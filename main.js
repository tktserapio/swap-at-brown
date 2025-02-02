// Request Swap Popup: open when swap button is clicked.
async function fetchClassSections(classCode) {
    try {
        // Note the full URL including localhost:3000
        const response = await fetch(`http://localhost:3000/api/classes/${classCode}`);
        if (!response.ok) {
            throw new Error('Class not found');
        }
        const data = await response.json();
        return data.sections;
    } catch (error) {
        console.error('Error fetching class data:', error);
        return null;
    }
}

document.querySelectorAll('.close-button').forEach(button => {
    button.addEventListener('click', function() {
        const popup = this.closest('.popup');
        popup.style.display = 'none';
        
        const leftClassInput = popup.querySelector('.search-column-left .search-bar input');
        const leftSectionSelect = popup.querySelector('.search-column-left .section-select');
        const rightClassInput = popup.querySelector('.search-column-right .search-bar input');
        const rightSectionSelect = popup.querySelector('.search-column-right .section-select');
        const emailDisplay = popup.querySelector('.contact-email'); // Get the email display
        
        // Clear search inputs
        if (leftClassInput) leftClassInput.value = '';
        if (rightClassInput) rightClassInput.value = '';
        
        // Reset section selects
        if (leftSectionSelect) {
            leftSectionSelect.innerHTML = '<option value="" disabled selected>Select your section</option>';
            leftSectionSelect.disabled = true;
        }
        if (rightSectionSelect) {
            rightSectionSelect.innerHTML = '<option value="" disabled selected>Select your section</option>';
            rightSectionSelect.disabled = true;
        }

        // Clear email display
        if (emailDisplay) {
            emailDisplay.textContent = 'Contact Email: ';
        }
    });
});

// ... existing code ...

// ... existing code ...

document.querySelectorAll('.confirm-swap-button').forEach(button => {
    button.addEventListener('click', async function() {
        const popup = this.closest('.popup');
        const overlay = document.querySelector('.popup-overlay');
        
        // Get all inputs
        const leftClassInput = popup.querySelector('.search-column-left .search-bar input');
        const leftSectionSelect = popup.querySelector('.search-column-left .section-select');
        const rightClassInput = popup.querySelector('.search-column-right .search-bar input');
        const rightSectionSelect = popup.querySelector('.search-column-right .section-select');
        const emailInput = popup.querySelector('.email-input');

        // Validate all fields
        if (!leftClassInput.value.trim() || 
            !leftSectionSelect.value || 
            !rightClassInput.value.trim() || 
            !rightSectionSelect.value) {
            alert('Please fill in all fields before submitting');
            return;
        }

        const swapData = {
            leftClass: leftClassInput.value.trim().toUpperCase(),
            rightClass: rightClassInput.value.trim().toUpperCase(),
            desiredSection: rightSectionSelect.value,
            currentSection: leftSectionSelect.value,
            email: emailInput ? emailInput.value.trim() : '' // Make email optional
        };

        console.log('Sending swap data:', swapData); // Debug log

        try {
            const response = await fetch('http://localhost:3000/api/swaps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(swapData)
            });

            console.log('Response status:', response.status); // Debug log

            const responseData = await response.json();
            console.log('Response data:', responseData); // Debug log

            // Clear form and close popup
            leftClassInput.value = '';
            leftSectionSelect.innerHTML = '<option value="" disabled selected>Select your section</option>';
            leftSectionSelect.disabled = true;
            
            rightClassInput.value = '';
            rightSectionSelect.innerHTML = '<option value="" disabled selected>Select your section</option>';
            rightSectionSelect.disabled = true;

            // Show success message and close popup
            alert('Swap request submitted successfully!');
            popup.style.display = 'none';
            if (overlay) {
                overlay.style.display = 'none';
            }

            // Refresh the displayed swaps
            await displaySwaps();

        } catch (error) {
            console.error('Detailed error:', error); // More detailed error logging
            alert('Failed to submit swap request. Please try again.');
        }
    });
});

document.querySelectorAll('.popup-close').forEach(button => {
    button.addEventListener('click', function() {
        // Clear all input fields in popups
        document.querySelectorAll('.popup input').forEach(input => {
            input.value = '';
        });
        // Clear the swap email display
        document.getElementById('swap-email').innerText = '';
        
        // Hide popups and overlays
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
        document.querySelectorAll('.popup-overlay').forEach(overlay => {
            overlay.style.display = 'none';
        });
    });
});

async function displaySwaps() {
    try {
        console.log('Fetching swaps...');
        const response = await fetch('http://localhost:3000/api/swaps');
        const swaps = await response.json();
        console.log('Fetched swaps:', swaps); // See what data we're getting
        
        const cardsContainer = document.querySelector('.cards-container');
        console.log('Cards container:', cardsContainer); // Check if we found the container
        
        if (!cardsContainer) {
            console.error('Could not find cards-container element');
            return;
        }
        
        // Clear existing cards
        cardsContainer.innerHTML = '';
        
        if (swaps.length === 0) {
            console.log('No swaps found in database');
            cardsContainer.innerHTML = '<p>No swap requests available.</p>';
            return;
        }
        
        // Create a card for each swap
        swaps.forEach(swap => {
            console.log('Creating card for swap:', swap); // Log each swap we're processing
            const card = document.createElement('div');
            card.className = 'card';
            card.dataEmail = swap.email;
            card.innerHTML = `
                <h2>${swap.leftClass} - ${swap.currentSection}</h2>
                <p>In exchange for <span style="text-decoration:underline">${swap.rightClass} - ${swap.desiredSection}</span></p>
                <button class="btn swap-btn">Request Swap</button>
            `;
            cardsContainer.appendChild(card);
        });

        document.querySelectorAll('.swap-btn').forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.card');
                const email = card.dataEmail; // Use the property instead of getAttribute
                document.getElementById('swap-email').innerText = email;
                document.querySelector('.popup').style.display = 'flex';
                document.querySelector('.popup-overlay').style.display = 'block';
            });
        });
        
        console.log('Finished creating cards');
    } catch (error) {
        console.error('Error in displaySwaps:', error);
    }
}

// Make sure we're calling displaySwaps when the page loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('Page loaded, calling displaySwaps');
    displaySwaps();
});

document.addEventListener('DOMContentLoaded', displaySwaps);

document.querySelectorAll('.popup-submit').forEach(button => {
    button.addEventListener('click', function() {
        document.querySelectorAll('.popup').forEach(popup => {
            popup.style.display = 'none';
        });
        document.querySelectorAll('.popup-overlay').forEach(overlay => {
            overlay.style.display = 'none';
        });
    });
});

// Create Swap Popup: open when create swap button is clicked.
document.querySelector('.create-swap').addEventListener('click', function() {
    document.querySelector('.create-swap-popup').style.display = 'flex';
    document.querySelector('.popup-overlay').style.display = 'block';
});

document.querySelectorAll('.create-swap-popup .search-button').forEach(button => {
    button.addEventListener('click', async function() {
        const searchBar = this.closest('.search-bar');
        const input = searchBar.querySelector('input');
        const select = searchBar.querySelector('.section-select');
        
        if (!input.value.trim()) {
            alert('Please enter a class to search');
            return;
        }

        // Show loading state
        button.disabled = true;
        button.textContent = 'Searching...';
        
        try {
            const searchQuery = input.value.trim().toUpperCase();
            const sections = await fetchClassSections(searchQuery);
            
            if (sections) {
                // Class found - enable section select and populate with available sections
                select.innerHTML = '<option value="" disabled selected>Select your section</option>';
                sections.forEach(section => {
                    const option = new Option(section, section);
                    select.add(option);
                });
                select.disabled = false;
            } else {
                // Class not found
                alert('Class not found. Please check the class number and try again.');
                select.disabled = true;
                select.innerHTML = '<option value="" disabled selected>Select your section</option>';
            }
        } catch (error) {
            alert('Error searching for class. Please try again.');
        } finally {
            // Reset button state
            button.disabled = false;
            button.textContent = 'Search for Sections';
        }
    });
});

async function filterSwaps(searchQuery) {
    try {
        const response = await fetch('http://localhost:3000/api/swaps');
        const swaps = await response.json();
        
        // Filter swaps based on the search query
        const filteredSwaps = swaps.filter(swap => 
            swap.leftClass.includes(searchQuery.toUpperCase()) || 
            swap.rightClass.includes(searchQuery.toUpperCase())
        );
        
        const cardsContainer = document.querySelector('.cards-container');
        cardsContainer.innerHTML = '';
        
        if (filteredSwaps.length === 0) {
            cardsContainer.innerHTML = '<p>No matching swaps found.</p>';
            return;
        }
        
        // Display filtered swaps
        filteredSwaps.forEach(swap => {
            const card = document.createElement('div');
            card.className = 'card';
            card.dataEmail = swap.email;
            card.innerHTML = `
                <h2>${swap.leftClass} - ${swap.currentSection}</h2>
                <p>Looking to switch to ${swap.rightClass} ${swap.desiredSection}</p>
                <button class="btn swap-btn">Request Swap</button>
            `;
            cardsContainer.appendChild(card);
        });

        // Re-add event listeners to the new filtered buttons
        document.querySelectorAll('.swap-btn').forEach(button => {
            button.addEventListener('click', function() {
                const card = this.closest('.card');
                const email = card.dataEmail; // Use the property instead of getAttribute
                document.getElementById('swap-email').innerText = email;
                document.querySelector('.popup').style.display = 'flex';
                document.querySelector('.popup-overlay').style.display = 'block';
            });
        });
    } catch (error) {
        console.error('Error filtering swaps:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.querySelector('.search-bar input');
    
    if (searchBar) {
        // Handle Enter key press
        searchBar.addEventListener('keypress', async (e) => {
            if (e.key === 'Enter') {
                const searchQuery = searchBar.value.trim();
                if (searchQuery) {
                    await filterSwaps(searchQuery);
                } else {
                    // If search is empty, show all swaps
                    await displaySwaps();
                }
            }
        });
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.querySelector('.toggle-mode');
    const themeLink = document.getElementById('theme-style');

    // Check the stored mode in localStorage
    if (localStorage.getItem('mode') === 'lebron') {
        themeLink.href = 'lebron.css';  // LeBron Mode
        toggleButton.textContent = 'Lock In';
    } else {
        themeLink.href = 'normal.css';  // Normal Mode
        toggleButton.textContent = 'Toggle Mode';
    }

    // Toggle between modes
    toggleButton.addEventListener('click', function () {
        if (themeLink.href.includes('lebron.css')) {
            themeLink.href = 'normal.css';
            toggleButton.textContent = 'Lebron';
            localStorage.setItem('mode', 'normal');
        } else {
            themeLink.href = 'lebron.css';
            toggleButton.textContent = 'Lock In';
            localStorage.setItem('mode', 'lebron');
        }
    });
});
