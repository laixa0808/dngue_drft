document.addEventListener('DOMContentLoaded', () => {
    // Check if user is authenticated
    const token = localStorage.getItem('admin-token');
    if (!token) {
        // Redirect to main page if not authenticated
        window.location.href = 'index.html';
        return;
    }

    // Verify token with server
    verifyAuthToken(token);

    const loginModal = document.getElementById('admin-login-modal');
    const loginOverlay = document.getElementById('login-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const cancelBtn = document.querySelector('.cancel-btn');
    const loginForm = document.getElementById('admin-login-form');
    const container = document.querySelector('.container');
    const body = document.body;

    // Function to verify authentication token
    async function verifyAuthToken(token) {
        try {
            const response = await fetch('/api/verify-auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!response.ok) {
                // Token is invalid, redirect to login
                localStorage.removeItem('admin-token');
                window.location.href = 'index.html';
                return;
            }
            
            // Token is valid, show admin dashboard
            showAdminDashboard();
        } catch (error) {
            console.error('Auth verification error:', error);
            localStorage.removeItem('admin-token');
            window.location.href = 'index.html';
        }
    }

    // Function to show admin dashboard
    function showAdminDashboard() {
        if (loginModal) loginModal.style.display = 'none';
        if (loginOverlay) loginOverlay.style.display = 'none';
        if (container) container.style.display = 'flex';
        if (body) body.classList.remove('modal-active');
    }

    // Function to show the modal
    function showModal() {
        body.classList.add('modal-active');
        loginModal.style.display = 'flex';
        loginOverlay.style.display = 'block';
        container.style.display = 'none'; // Hide the main content
    }

    // Function to hide the modal
    function hideModal() {
        body.classList.remove('modal-active');
        loginModal.style.display = 'none';
        loginOverlay.style.display = 'none';
        container.style.display = 'flex'; // Show the main content
    }

    // Show the modal by default
    showModal();

    // Event listeners to close the modal
    closeBtn.addEventListener('click', () => {
        hideModal();
    });

    cancelBtn.addEventListener('click', () => {
        hideModal();
    });

    // Handle login form submission
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                // You can store the token in localStorage if needed for other API calls
                // localStorage.setItem('admin-token', result.token);
                alert('Login successful!');
                hideModal(); // Hide modal on successful login
            } else {
                alert(`Login failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred during login. Please try again.');
        }
    });

    const logoutBtn = document.querySelector('.logout-btn');
    const navLinks = document.querySelectorAll('.sidebar ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const dataForm = document.querySelector('.data-form');
    const mainContent = document.querySelector('.main-content');

    // Logout functionality
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // Clear authentication token
            localStorage.removeItem('admin-token');
            
            // Redirect to main page
            window.location.href = 'index.html';
        });
    }

    // Smooth scroll for nav links
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            // Set active class immediately on click
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            const targetId = link.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if(targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Update active nav link on scroll
    mainContent.addEventListener('scroll', () => {
        let current = '';
        contentSections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (mainContent.scrollTop >= sectionTop - 100) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    });

    // Handle form submission
    if(dataForm) {
        dataForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Data submitted successfully!');
            dataForm.reset();
        });
    }

    // Show the correct section based on the hash
    function showSectionFromHash() {
        const hash = window.location.hash || '#admin-dashboard';
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            if ('#' + section.id === hash) {
                section.style.display = 'block';
            } else {
                section.style.display = 'none';
            }
        });
        // Set active class on sidebar
        const navLinks = document.querySelectorAll('.sidebar ul li a');
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === hash);
        });
    }

    // Listen for hash changes
    window.addEventListener('hashchange', showSectionFromHash);
    // Show the correct section on load
    showSectionFromHash();
}); 