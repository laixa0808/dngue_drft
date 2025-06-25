// Future JavaScript for interactivity can be added here.
// For example, fetching data and rendering charts. 

document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENT SELECTORS ---
    const sidebar = document.querySelector('.sidebar');
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mainContent = document.querySelector('.main-content');
    const navLinks = document.querySelectorAll('.sidebar ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    
    // Modals & Overlay
    const overlay = document.getElementById('modal-overlay');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const infoModal = document.getElementById('info-modal');
    const sourcesModal = document.getElementById('sources-modal');
    
    // --- EVENT LISTENERS & INITIALIZATION ---

    // --- Sidebar Navigation ---
    if (sidebar && hamburgerBtn) {
        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            const isActive = sidebar.classList.contains('active');
            hamburgerBtn.querySelector('.fa-bars').style.display = isActive ? 'none' : 'block';
            hamburgerBtn.querySelector('.fa-times').style.display = isActive ? 'block' : 'none';
        });
    }

    // --- Main Content Scrolling & Active Link Highlighting ---
    if (mainContent) {
        mainContent.addEventListener('scroll', updateActiveNavLink);
    }
    navLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });
    
    // --- Modal Triggers & Logic ---
    initializeModal('login-btn', loginModal);
    initializeModal('info-btn', infoModal);
    initializeModal('show-sources-btn', sourcesModal);
    
    // Special handling for signup button (switches modals)
    const showSignupBtn = document.getElementById('show-signup-btn');
    if (showSignupBtn) {
        showSignupBtn.addEventListener('click', (e) => {
            e.preventDefault();
            closeAllModals();
            showModal(signupModal);
        });
    }
    
    // Close modals on overlay click
    if (overlay) {
        overlay.addEventListener('click', closeAllModals);
    }

    // --- FORM SUBMISSIONS ---
    const loginForm = document.getElementById('login-form');
    if (loginForm) loginForm.addEventListener('submit', handleLogin);

    const signupForm = document.getElementById('signup-form');
    if (signupForm) signupForm.addEventListener('submit', handleSignup);

    // --- INITIALIZE DASHBOARD ---
    setupDashboard();
    loadRealData(); // Load real data from server


    // --- FUNCTION DEFINITIONS ---

    function setupDashboard() {
        createYearlyChart(document.getElementById('dashboard-yearly-chart'));
        createMonthlyChart(document.getElementById('dashboard-monthly-chart'));
        createGenderChart(document.getElementById('dashboard-gender-chart'));
        createYearlyChart(document.getElementById('yearly-cases-chart'));
        createMonthlyChart(document.getElementById('monthly-cases-chart'));
        createGenderChart(document.getElementById('gender-cases-chart'));

        const citySearch = document.getElementById('barangay-search');
        if (citySearch) {
            citySearch.addEventListener('keyup', (e) => populateCities(e.target.value));
            populateCities();
        }

        const predictionForm = document.getElementById('prediction-form');
        if (predictionForm) {
            predictionForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const resultDiv = document.getElementById('prediction-result');
                if(resultDiv) resultDiv.style.display = 'block';
                generatePrediction();
            });
        }

        const yearSelect = document.getElementById('pred-year');
        if(yearSelect){
            const currentYear = new Date().getFullYear();
            for (let year = 2025; year >= 2010; year--) {
                const option = document.createElement('option');
                option.value = year;
                option.textContent = year;
                if (year === currentYear) option.selected = true;
                yearSelect.appendChild(option);
            }
        }
    }

    function initializeModal(triggerId, modalElement) {
        const trigger = document.querySelector(`#${triggerId}, .${triggerId}`);
        if (trigger && modalElement) {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                showModal(modalElement);
            });
            
            modalElement.querySelectorAll('.close-btn, .cancel-btn, .ok-btn').forEach(btn => {
                btn.addEventListener('click', closeAllModals);
            });
        }
    }

    function showModal(modalElement) {
        if (overlay) overlay.style.display = 'block';
        if (modalElement) modalElement.style.display = 'flex';
    }

    function closeAllModals() {
        if (overlay) overlay.style.display = 'none';
        [loginModal, signupModal, infoModal, sourcesModal].forEach(m => {
            if(m) m.style.display = 'none';
        });
    }

    async function handleLogin(e) {
        e.preventDefault();
        const email = loginModal.querySelector('#email').value;
        const password = loginModal.querySelector('#password').value;
        
        try {
            const response = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const result = await response.json();
            
            if (result.success) {
                // Store login token if provided
                if (result.token) {
                    localStorage.setItem('admin-token', result.token);
                }
                // Redirect directly to the admin.html page
                window.location.href = 'admin.html';
            } else if (result.requiresConfirmation) {
                alert(result.message || 'Please confirm your email before logging in.');
            } else {
                alert(result.message || 'Login failed.');
            }
        } catch (error) {
            alert('An error occurred during login. Please try again.');
        }
    }

    async function handleSignup(e) {
        e.preventDefault();
        const email = signupModal.querySelector('#signup-email').value;
        const password = signupModal.querySelector('#signup-password').value;
        const role = signupModal.querySelector('#user-role').value;

        if (!role) {
            alert('Please select a role.');
            return;
        }

        try {
            const response = await fetch('/api/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, role })
            });
            const result = await response.json();
            if (result.success) {
                alert('Account created successfully! Please check your email to confirm your account before logging in.');
                window.location.href = '/signup_success.html';
            } else {
                alert(`Signup Failed: ${result.message}`);
            }
        } catch (error) {
            console.error('Signup error:', error);
            alert('A client-side error occurred during signup. Please try again.');
        }
    }

    function handleNavLinkClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        if (targetElement && mainContent) {
            mainContent.scrollTo({ top: targetElement.offsetTop, behavior: 'smooth' });
        }
    }

    function updateActiveNavLink() {
        let currentSectionId = '';
        contentSections.forEach(section => {
            if (section.offsetTop <= mainContent.scrollTop + 150) { 
                currentSectionId = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === `#${currentSectionId}`);
        });
    }

    // --- DATA FUNCTIONS ---
    // These functions will be populated with real data from the database
    let cities = [];
    let filteredCities = [];
    let currentPage = 1;
    const itemsPerPage = 12;

    function createYearlyChart(canvas) { 
        if(!canvas) return; 
        // TODO: Replace with real data from database
        console.log("Yearly chart will be populated with real data");
    }
    
    function createMonthlyChart(canvas) { 
        if(!canvas) return; 
        // TODO: Replace with real data from database
        console.log("Monthly chart will be populated with real data");
    }
    
    function createGenderChart(canvas) { 
        if(!canvas) return; 
        // TODO: Replace with real data from database
        console.log("Gender chart will be populated with real data");
    }
    
    function generatePrediction() { 
        // TODO: Replace with real prediction logic
        console.log("Prediction will be generated with real data");
    }

    function populateCities(searchTerm = '') { 
        const cityGrid = document.getElementById('barangay-grid');
        if(!cityGrid) return;
        
        // TODO: Replace with real data from database
        console.log("Cities will be populated with real data from database");
        
        // Placeholder for now
        filteredCities = cities.filter(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
        currentPage = 1;
        displayCityPage();
    }
    
    function displayCityPage() {
        const cityGrid = document.getElementById('barangay-grid');
        const cityPagination = document.getElementById('barangay-pagination-container');
        if(!cityGrid || !cityPagination) return;

        cityGrid.innerHTML = '';
        
        if (filteredCities.length === 0) {
            cityGrid.innerHTML = '<p>No barangay data available. Please check back later.</p>';
            cityPagination.innerHTML = '';
            return;
        }
        
        const startIndex = (currentPage - 1) * itemsPerPage;
        const paginatedCities = filteredCities.slice(startIndex, startIndex + itemsPerPage);

        for (const city of paginatedCities) {
            const card = document.createElement('div');
            card.className = 'barangay-card';
            card.innerHTML = `<h3>${city}</h3><p>Details about ${city}...</p>`;
            cityGrid.appendChild(card);
        }
        setupCityPagination();
    }

    function setupCityPagination() {
        const cityPagination = document.getElementById('barangay-pagination-container');
        if (!cityPagination) return;
        cityPagination.innerHTML = '';
        const pageCount = Math.ceil(filteredCities.length / itemsPerPage);
        if(pageCount <= 1) return;

        const prev = document.createElement('button');
        prev.textContent = 'Prev';
        prev.disabled = currentPage === 1;
        prev.onclick = () => { currentPage--; displayCityPage(); };
        cityPagination.appendChild(prev);

        const next = document.createElement('button');
        next.textContent = 'Next';
        next.disabled = currentPage === pageCount;
        next.onclick = () => { currentPage++; displayCityPage(); };
        cityPagination.appendChild(next);
    }

    async function loadRealData() {
        try {
            // Load statistics
            const statsResponse = await fetch('/api/stats');
            if (statsResponse.ok) {
                const stats = await statsResponse.json();
                document.getElementById('current-cases').textContent = stats.currentCases || '--';
                document.getElementById('high-risk-zones').textContent = stats.highRiskZones || '--';
                document.getElementById('trend-change').textContent = stats.trendChange || '--';
            }

            // Load barangays
            const barangaysResponse = await fetch('/api/barangays');
            if (barangaysResponse.ok) {
                const barangaysData = await barangaysResponse.json();
                cities = barangaysData.barangays || [];
                filteredCities = [...cities];
                populateCities();
            }

            // Load chart data
            await loadChartData();
        } catch (error) {
            console.error('Error loading data:', error);
        }
    }

    async function loadChartData() {
        try {
            // Load yearly data
            const yearlyResponse = await fetch('/api/charts/yearly');
            if (yearlyResponse.ok) {
                const yearlyData = await yearlyResponse.json();
                // TODO: Update chart with real data
                console.log('Yearly data loaded:', yearlyData);
            }

            // Load monthly data
            const monthlyResponse = await fetch('/api/charts/monthly');
            if (monthlyResponse.ok) {
                const monthlyData = await monthlyResponse.json();
                // TODO: Update chart with real data
                console.log('Monthly data loaded:', monthlyData);
            }

            // Load gender data
            const genderResponse = await fetch('/api/charts/gender');
            if (genderResponse.ok) {
                const genderData = await genderResponse.json();
                // TODO: Update chart with real data
                console.log('Gender data loaded:', genderData);
            }
        } catch (error) {
            console.error('Error loading chart data:', error);
        }
    }
}); 