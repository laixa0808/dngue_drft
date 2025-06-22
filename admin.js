document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.querySelector('.logout-btn');
    const navLinks = document.querySelectorAll('.sidebar ul li a');
    const contentSections = document.querySelectorAll('.content-section');
    const dataForm = document.querySelector('.data-form');
    const mainContent = document.querySelector('.main-content');

    // Logout functionality
    if(logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // In a real application, you would handle session invalidation here.
            // For this demo, we'll just redirect to the main page.
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
            alert('Data submitted successfully! (This is a demo)');
            dataForm.reset();
        });
    }
}); 