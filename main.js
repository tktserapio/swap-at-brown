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
        
        // Clear all inputs and dropdowns in the popup
        const searchBar = popup.querySelector('.search-bar input');
        const sectionSelect = popup.querySelector('.section-select');
        const courseSelect = popup.querySelector('.course-select'); // If you have a course select dropdown
        
        // Clear search input
        if (searchBar) {
            searchBar.value = '';
        }
        
        // Reset section select
        if (sectionSelect) {
            sectionSelect.innerHTML = '<option value="" disabled selected>Select your section</option>';
            sectionSelect.disabled = true;
        }
        
        // Reset course select if it exists
        if (courseSelect) {
            courseSelect.innerHTML = '<option value="" disabled selected>Select your course</option>';
            courseSelect.disabled = true;
        }
    });
});

// ... existing code ...

// ... existing code ...

document.querySelectorAll('.confirm-swap-button').forEach(button => {
    button.addEventListener('click', async function() {
        const popup = this.closest('.create-swap-popup');
        const overlay = document.querySelector('.popup-overlay'); // Get the overlay element
        
        // Get inputs
        const leftClassInput = popup.querySelector('.search-column-left .search-bar input');
        const leftSectionSelect = popup.querySelector('.search-column-left .section-select');
        const rightClassInput = popup.querySelector('.search-column-right .search-bar input');
        const rightSectionSelect = popup.querySelector('.search-column-right .section-select');
        
        // Validate inputs
        if (!leftClassInput.value || !leftSectionSelect.value || 
            !rightClassInput.value || !rightSectionSelect.value) {
            alert('Please select both classes and sections');
            return;
        }

        const swapData = {
            leftClass: leftClassInput.value.trim().toUpperCase(),
            rightClass: rightClassInput.value.trim().toUpperCase(),
            desiredSection: rightSectionSelect.value,
            currentSection: leftSectionSelect.value
        };

        try {
            const response = await fetch('http://localhost:3000/api/swaps', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(swapData)
            });

            if (!response.ok) {
                throw new Error('Failed to create swap request');
            }

            // Clear the form
            leftClassInput.value = '';
            leftSectionSelect.innerHTML = '<option value="" disabled selected>Select your section</option>';
            leftSectionSelect.disabled = true;
            
            rightClassInput.value = '';
            rightSectionSelect.innerHTML = '<option value="" disabled selected>Select your section</option>';
            rightSectionSelect.disabled = true;

            alert('Swap request submitted successfully!');
            
            // Hide both popup and overlay
            popup.style.display = 'none';
            if (overlay) {
                overlay.style.display = 'none';
            }
            
            // Re-enable scrolling on the body if needed
            document.body.style.overflow = 'auto';

        } catch (error) {
            console.error('Error submitting swap:', error);
            alert('Failed to submit swap request. Please try again.');
        }
    });
});

// ... existing code ...

document.querySelectorAll('.swap-btn').forEach(button => {
    button.addEventListener('click', function() {
        const card = this.closest('.card');
        const email = card.getAttribute('data-email');
        document.getElementById('swap-email').innerText = email;
        document.querySelector('.popup').style.display = 'flex';
        document.querySelector('.popup-overlay').style.display = 'block';
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

// Handle class selection and show section options
// document.getElementById('class-select').addEventListener('change', function() {
//     const selectedClass = this.value;
//     const sectionSelect = document.getElementById('section-selection');
//     const fromSection = document.getElementById('from-section');
//     const toSection = document.getElementById('to-section');

//     if (selectedClass) {
//         sectionSelect.style.display = 'block';
        
//         // Example sections for demo purposes
//         const sections = {
//             'CS101': ['Section A', 'Section B', 'Section C'],
//             'MATH200': ['Lecture 1', 'Lecture 2'],
//             'PHYS150': ['Group X', 'Group Y']
//         };

//         // Populate sections dynamically
//         fromSection.innerHTML = '<option value="">-- Select a Section --</option>';
//         toSection.innerHTML = '<option value="">-- Select a Section --</option>';
        
//         sections[selectedClass].forEach(section => {
//             const option1 = new Option(section, section);
//             const option2 = new Option(section, section);
//             fromSection.add(option1);
//             toSection.add(option2);
//         });
//     } else {
//         sectionSelect.style.display = 'none';
//     }
// });

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
