// Future JavaScript for interactivity can be added here.
// For example, fetching data and rendering charts. 

document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const sidebar = document.querySelector('.sidebar');
    const loginBtn = document.querySelector('.login-btn');
    const modal = document.getElementById('login-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.querySelector('.close-btn');
    const loginForm = modal.querySelector('form');
    const navLinks = document.querySelectorAll('.sidebar ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const mainContent = document.querySelector('.main-content');
    const predictionsBtn = document.querySelector('.predictions-btn');
    const predictionForm = document.getElementById('prediction-form');
    const yearSelect = document.getElementById('pred-year');
    const cityGrid = document.getElementById('barangay-grid');
    const citySearch = document.getElementById('barangay-search');
    const cityPaginationContainer = document.getElementById('barangay-pagination-container');
    const chartYearSelect = document.getElementById('chart-year');
    const chartMonthSelect = document.getElementById('chart-month');
    const chartGenderSelect = document.getElementById('chart-gender');
    const chartCanvas = document.getElementById('cases-chart');

    // --- Chart Canvases ---
    const yearlyDashboardChart = document.getElementById('dashboard-yearly-chart');
    const monthlyDashboardChart = document.getElementById('dashboard-monthly-chart');
    const genderDashboardChart = document.getElementById('dashboard-gender-chart');
    
    const yearlySectionChart = document.getElementById('yearly-cases-chart');
    const monthlySectionChart = document.getElementById('monthly-cases-chart');
    const genderSectionChart = document.getElementById('gender-cases-chart');

    const cities = [
        "Atisan", "Bagong Bayan II-A", "Bagong Pook VI-C", "Barangay I-A", "Barangay I-B", 
        "Barangay II-A", "Barangay II-B", "Barangay II-C", "Barangay II-D", "Barangay II-E", "Barangay II-F", 
        "Barangay III-A", "Barangay III-B", "Barangay III-C", "Barangay III-D", "Barangay III-E", "Barangay III-F", 
        "Barangay IV-A", "Barangay IV-B", "Barangay IV-C", "Barangay V-A", "Barangay V-B", "Barangay V-C", "Barangay V-D", 
        "Barangay VI-A", "Barangay VI-B", "Barangay VI-D", "Barangay VI-E", "Barangay VII-A", "Barangay VII-B", 
        "Barangay VII-C", "Barangay VII-D", "Barangay VII-E", "Bautista", "Concepcion", "Del Remedio", "Dolores", 
        "San Antonio 1", "San Antonio 2", "San Bartolome", "San Buenaventura", "San Crispin", "San Cristobal", 
        "San Diego", "San Francisco", "San Gabriel", "San Gregorio", "San Ignacio", "San Isidro", "San Joaquin", 
        "San Jose", "San Juan", "San Lorenzo", "San Lucas 1", "San Lucas 2", "San Marcos", "San Mateo", "San Miguel", 
        "San Nicolas", "San Pedro", "San Rafael", "San Roque", "San Vicente", "Santa Ana", "Santa Catalina", 
        "Santa Cruz", "Santa Elena", "Santa Felomina", "Santa Isabel", "Santa Maria", "Santa Maria Magdalena", 
        "Santa Monica", "Santa Veronica", "Santiago I", "Santiago II", "Santisimo Rosario", "Santo Angel", 
        "Santo Cristo", "Santo Niño", "Soledad"
    ];

    let currentPage = 1;
    const itemsPerPage = 12;
    let filteredCities = cities;
    let myChart;
    const currentYear = new Date().getFullYear();
    const futureYear = 2025; // Set the max year for charts

    let predictedMonthlyChart;
    let predictedGenderChart;

    const infoBtn = document.getElementById('info-btn');
    const infoModal = document.getElementById('info-modal');
    const infoCloseBtn = infoModal.querySelector('.close-btn');

    // --- NAVIGATION & SCROLLING ---
    function handleNavLinkClick(e) {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href');
        const targetElement = document.querySelector(targetId);

        if (targetId === '#dashboard' && mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'smooth' });
        } else if (targetElement && mainContent) {
            // Calculate position relative to the main content container
            const targetPosition = targetElement.offsetTop; // offsetTop is now correct
            mainContent.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }

    function updateActiveNavLink() {
        if (!mainContent) return;
        const scrollPosition = mainContent.scrollTop;
        let currentSectionId = '';

        // Find the last section that has been scrolled past
        contentSections.forEach(section => {
            if (section.offsetTop <= scrollPosition + mainContent.offsetTop + 100) {
                currentSectionId = section.getAttribute('id');
            }
        });

        // Force 'dashboard' if at the very top
        if (scrollPosition < 100) {
            currentSectionId = 'dashboard';
        }

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', handleNavLinkClick);
    });

    if (mainContent) {
        mainContent.addEventListener('scroll', updateActiveNavLink);
    }
    // --- END NAVIGATION & SCROLLING ---

    // Populate prediction year dropdown, setting max to 2025.
    for (let year = futureYear; year >= 2010; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        if (year === currentYear) option.selected = true;
        yearSelect.appendChild(option);
    }

    // --- MOCK DATA ---
    // Generate data up to the future year for dashboard charts.
    const mockData = [];
    for (let year = 2010; year <= futureYear; year++) {
        for (let month = 1; month <= 12; month++) {
            mockData.push({ year, month, gender: 'male', cases: Math.floor(Math.random() * 50) });
            mockData.push({ year, month, gender: 'female', cases: Math.floor(Math.random() * 60) });
        }
    }

    // --- CHART LOGIC ---
    function createYearlyChart(canvas) {
        if (!canvas) return;
        const yearlyData = {};
        // Process data up to the future year.
        for (let year = 2010; year <= futureYear; year++) {
            yearlyData[year] = 0;
        }
        mockData.forEach(d => {
            if (d.year >= 2010) {
                yearlyData[d.year] += d.cases;
            }
        });
        new Chart(canvas.getContext('2d'), {
            type: 'bar',
            data: {
                labels: Object.keys(yearlyData),
                datasets: [{
                    label: 'Total Cases',
                    data: Object.values(yearlyData),
                    backgroundColor: '#2980b9'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function createMonthlyChart(canvas) {
        if (!canvas) return;
        const monthlyData = Array(12).fill(0);
        mockData.forEach(d => {
            monthlyData[d.month - 1] += d.cases;
        });
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        
        new Chart(canvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: monthNames,
                datasets: [{
                    label: 'Total Cases per Month (All Years)',
                    data: monthlyData,
                    borderColor: '#27ae60',
                    tension: 0.1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    function createGenderChart(canvas) {
        if (!canvas) return;
        const maleCases = mockData.filter(d => d.gender === 'male').reduce((sum, d) => sum + d.cases, 0);
        const femaleCases = mockData.filter(d => d.gender === 'female').reduce((sum, d) => sum + d.cases, 0);

        new Chart(canvas.getContext('2d'), {
            type: 'pie',
            data: {
                labels: ['Male', 'Female'],
                datasets: [{
                    data: [maleCases, femaleCases],
                    backgroundColor: ['#3498db', '#e74c3c']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    // Initial chart load for both Dashboard and Year section
    createYearlyChart(yearlyDashboardChart);
    createMonthlyChart(monthlyDashboardChart);
    createGenderChart(genderDashboardChart);
    
    createYearlyChart(yearlySectionChart);
    createMonthlyChart(monthlySectionChart);
    createGenderChart(genderSectionChart);

    function displayCities() {
        cityGrid.innerHTML = '';
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedCities = filteredCities.slice(startIndex, endIndex);

        for (const city of paginatedCities) {
            const card = document.createElement('div');
            card.className = 'barangay-card';
            
            // Mock data
            const population = Math.floor(Math.random() * 5000) + 1000;
            const cases = Math.floor(Math.random() * 20);
            const riskLevels = ['Low', 'Medium', 'High'];
            const risk = riskLevels[Math.floor(Math.random() * 3)];

            card.innerHTML = `
                <h3>${city}</h3>
                <p><strong>Population:</strong> ${population.toLocaleString()}</p>
                <p><strong>Active Dengue Cases:</strong> ${cases}</p>
                <p><strong>Risk Level:</strong> ${risk}</p>
            `;
            cityGrid.appendChild(card);
        }
    }

    function setupCityPagination() {
        if (!cityPaginationContainer) return;
        cityPaginationContainer.innerHTML = '';
        const pageCount = Math.ceil(filteredCities.length / itemsPerPage);

        if (pageCount <= 1) return;

        // Prev Button
        const prevButton = document.createElement('button');
        prevButton.textContent = 'Prev';
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayCities();
                setupCityPagination();
            }
        });
        cityPaginationContainer.appendChild(prevButton);

        // Page Numbers (simplified)
        const pageInfo = document.createElement('span');
        pageInfo.textContent = ` Page ${currentPage} of ${pageCount} `;
        cityPaginationContainer.appendChild(pageInfo);

        // Next Button
        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage === pageCount;
        nextButton.addEventListener('click', () => {
            if (currentPage < pageCount) {
                currentPage++;
                displayCities();
                setupCityPagination();
            }
        });
        cityPaginationContainer.appendChild(nextButton);
    }

    if (citySearch) {
        citySearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            filteredCities = cities.filter(b => b.toLowerCase().includes(searchTerm));
            currentPage = 1;
            displayCities();
            setupCityPagination();
        });
    }

    // Initial load
    displayCities();
    setupCityPagination();

    // Hamburger menu toggle
    if (hamburgerBtn && sidebar) {
        const barsIcon = hamburgerBtn.querySelector('.fa-bars');
        const timesIcon = hamburgerBtn.querySelector('.fa-times');

        // Ensure correct initial state
        barsIcon.style.display = 'inline-block';
        timesIcon.style.display = 'none';
        sidebar.classList.remove('open');

        hamburgerBtn.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            const isOpen = sidebar.classList.contains('open');
            barsIcon.style.display = isOpen ? 'none' : 'inline-block';
            timesIcon.style.display = isOpen ? 'inline-block' : 'none';
        });
    }

    // "Go to Predictions" button scroll
    if (predictionsBtn) {
        predictionsBtn.addEventListener('click', () => {
            const predictionsSection = document.getElementById('predictions');
            if (predictionsSection && mainContent) {
                const targetPosition = predictionsSection.offsetTop - mainContent.offsetTop;
                mainContent.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }

    // Handle prediction form submission
    if (predictionForm) {
        predictionForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const barangay = document.getElementById('pred-barangay').value;
            const barangayName = barangay === 'all' ? 'San Pablo' : barangay;
            const monthSelect = document.getElementById('pred-month');
            const yearSelect = document.getElementById('pred-year');
            const monthIdx = parseInt(monthSelect.value) - 1;
            const year = parseInt(yearSelect.value);
            const resultDiv = document.getElementById('prediction-result');
            const resultText = document.getElementById('result-text');
            const riskCardsDiv = document.getElementById('prediction-risk-cards');

            // Month names
            const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
            // Risk logic: high for June-Nov, moderate for Apr/May/Dec, low for others
            const getRisk = (monthIdx) => {
                const m = monthNames[monthIdx];
                if (["June", "July", "August", "September", "October", "November"].includes(m)) return {level: 'High', color: '#e74c3c'};
                if (["April", "May", "December"].includes(m)) return {level: 'Moderate', color: '#e67e22'};
                return {level: 'Low', color: '#27ae60'};
            };
            // Calculate next 3 months
            let cardsHtml = '';
            let curMonth = monthIdx;
            let curYear = year;
            for (let i = 0; i < 3; i++) {
                const risk = getRisk(curMonth);
                cardsHtml += `<div style="flex:1; background:${risk.color}; color:white; border-radius:10px; padding:18px; text-align:center; min-width:110px;">
                    <div style='font-size:1.1em;font-weight:600;'>${monthNames[curMonth]} ${curYear}</div>
                    <div style='font-size:1.3em;font-weight:700;'>${risk.level} Risk</div>
                </div>`;
                curMonth++;
                if (curMonth > 11) { curMonth = 0; curYear++; }
            }
            riskCardsDiv.innerHTML = cardsHtml;

            let riskMsg = `Prediction for <b>${barangayName}</b> for the next three months starting ${monthNames[monthIdx]} ${year}.`;
            resultText.innerHTML = riskMsg + '<br>See colored cards above for risk level.';
            resultDiv.style.display = 'block';

            // Create or update the prediction charts
            createPredictedMonthlyChart(document.getElementById('predicted-monthly-chart'));
            createPredictedGenderChart(document.getElementById('predicted-gender-chart'));
        });
    }

    // --- Modal Logic ---
    function showModal(modalElement) {
        if (overlay) overlay.style.display = 'block';
        if (modalElement) modalElement.style.display = 'block';
    }

    function closeModal(modalElement) {
        if (overlay) overlay.style.display = 'none';
        if (modalElement) modalElement.style.display = 'none';
    }

    // Login Modal
    if (loginBtn) {
        loginBtn.addEventListener('click', () => showModal(modal));
    }
    if (closeBtn) {
        closeBtn.addEventListener('click', () => closeModal(modal));
    }
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Dummy validation
            const username = document.getElementById('username').value;
            if (username === 'admin') {
                window.location.href = 'admin.html';
            } else {
                alert('Invalid credentials. Use "admin" to log in.');
            }
        });
    }

    // Info Modal
    if (infoBtn) {
        infoBtn.addEventListener('click', () => showModal(infoModal));
    }
    if (infoCloseBtn) {
        infoCloseBtn.addEventListener('click', () => closeModal(infoModal));
    }

    overlay.addEventListener('click', () => {
        closeModal(modal);
        closeModal(infoModal);
    });

    // Initial call to set correct active link
    updateActiveNavLink();

    // Prevention web search (mock)
    const preventionSearchBtn = document.getElementById('prevention-search-btn');
    const preventionSearchInput = document.getElementById('prevention-search');
    const preventionResultsDiv = document.getElementById('prevention-results');

    // Reliable dengue prevention tips
    const reliablePreventionTips = [
        {
            text: 'Eliminate standing water in and around your home to prevent mosquito breeding.',
            source: 'World Health Organization',
            url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue'
        },
        {
            text: 'Use mosquito nets and screens to keep mosquitoes out of living spaces.',
            source: 'Centers for Disease Control and Prevention',
            url: 'https://www.cdc.gov/dengue/prevention/index.html'
        },
        {
            text: 'Wear long-sleeved shirts and long pants, especially during peak mosquito hours.',
            source: 'Department of Health (Philippines)',
            url: 'https://doh.gov.ph/Health-Advisory/Dengue'
        },
        {
            text: 'Apply mosquito repellent containing DEET, picaridin, or oil of lemon eucalyptus.',
            source: 'Centers for Disease Control and Prevention',
            url: 'https://www.cdc.gov/dengue/prevention/index.html'
        },
        {
            text: 'Participate in community clean-up drives to remove potential mosquito breeding sites.',
            source: 'Department of Health (Philippines)',
            url: 'https://doh.gov.ph/Health-Advisory/Dengue'
        },
        {
            text: 'Seek medical attention immediately if you experience symptoms of dengue.',
            source: 'World Health Organization',
            url: 'https://www.who.int/news-room/fact-sheets/detail/dengue-and-severe-dengue'
        }
    ];

    function renderPreventionTips(tips) {
        if (!preventionResultsDiv) return;
        if (!tips.length) {
            preventionResultsDiv.innerHTML = '<p style="color:red;">No tips found for your search.</p>';
            return;
        }
        preventionResultsDiv.innerHTML =
            '<ul style="padding-left:20px;">' +
            tips.map(tip =>
                `<li style='margin-bottom:12px;'><b>${tip.text}</b><br><span style='font-size:0.95em;color:gray;'>Source: <a href="${tip.url}" target="_blank">${tip.source}</a></span></li>`
            ).join('') +
            '</ul>';
    }

    // Show all tips by default
    renderPreventionTips(reliablePreventionTips);

    if (preventionSearchBtn && preventionSearchInput && preventionResultsDiv) {
        preventionSearchBtn.addEventListener('click', function () {
            const query = preventionSearchInput.value.trim().toLowerCase();
            if (!query) {
                renderPreventionTips(reliablePreventionTips);
                return;
            }
            // Filter tips by keyword
            const filtered = reliablePreventionTips.filter(tip =>
                tip.text.toLowerCase().includes(query) ||
                tip.source.toLowerCase().includes(query)
            );
            renderPreventionTips(filtered);
        });
    }

    // Sources Modal Logic
    const showSourcesBtn = document.getElementById('show-sources-btn');
    const sourcesModal = document.getElementById('sources-modal');
    const closeSourcesModalBtn = document.getElementById('close-sources-modal');

    if (showSourcesBtn && sourcesModal) {
        showSourcesBtn.addEventListener('click', () => {
            sourcesModal.style.display = 'block';
            if (overlay) overlay.style.display = 'block';
        });
    }
    if (closeSourcesModalBtn && sourcesModal) {
        closeSourcesModalBtn.addEventListener('click', () => {
            sourcesModal.style.display = 'none';
            if (overlay) overlay.style.display = 'none';
        });
    }
    // Also close modal if overlay is clicked
    if (overlay) {
        overlay.addEventListener('click', () => {
            if (sourcesModal) sourcesModal.style.display = 'none';
        });
    }
}); 