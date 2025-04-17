document.addEventListener('DOMContentLoaded', function() {
    // Get all FAQ question elements
    const faqQuestions = document.querySelectorAll('.faq-question');
    
    // Add click event listener to each question
    faqQuestions.forEach(question => {
        question.addEventListener('click', function() {
            // Toggle active class on the question
            this.classList.toggle('active');
            
            // Get the answer element that follows this question
            const answer = this.nextElementSibling;
            
            // Toggle the active class on the answer
            answer.classList.toggle('active');
            
            // Set max height for transition animation
            if (answer.style.maxHeight) {
                answer.style.maxHeight = null;
            } else {
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        });
    });
    
    // Form submission handling
    const contactForm = document.querySelector('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Get form values
            const name = document.getElementById('nameInput').value;
            const email = document.getElementById('emailInput').value;
            const subject = document.getElementById('subjectInput').value;
            const message = document.getElementById('messageInput').value;
            
            // Validate email is a Hofstra email
            if (!email.toLowerCase().endsWith('@pride.hofstra.edu')) {
                alert('Please use your Hofstra email address.');
                return;
            }
            
            // Here you would normally send the form data to your server
            // For now, just show a success message
            alert('Thanks for your question! We\'ll respond to you shortly.');
            
            // Reset the form
            contactForm.reset();
        });
    }
    
    // Function to search FAQ content (if you add a search field later)
    window.searchFAQ = function() {
        const searchInput = document.getElementById('faqSearch').value.toLowerCase();
        const faqItems = document.querySelectorAll('.faq-item');
        
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question').textContent.toLowerCase();
            const answer = item.querySelector('.faq-answer').textContent.toLowerCase();
            
            if (question.includes(searchInput) || answer.includes(searchInput)) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    };
});