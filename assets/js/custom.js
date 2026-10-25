// Custom JavaScript functions

// Back to top button functionality
document.addEventListener('DOMContentLoaded', function() {
  // Create back to top button
  const backToTopButton = document.createElement('button');
  backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
  backToTopButton.className = 'back-to-top';
  backToTopButton.setAttribute('title', 'Back to top');
  document.body.appendChild(backToTopButton);

  // Show/hide button based on scroll position
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTopButton.style.display = 'block';
    } else {
      backToTopButton.style.display = 'none';
    }
  });

  // Smooth scroll to top when button is clicked
  backToTopButton.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // Add smooth scrolling to all links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Add fade-in animation to elements with fade-in class
  const fadeElements = document.querySelectorAll('.fade-in');
  const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = 1;
        fadeObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  // Taskbar Start menu (_includes/masthead.html is a <details>): close on outside click or Esc
  const startMenu = document.querySelector('.taskbar98-startwrap');
  if (startMenu) {
    document.addEventListener('click', function (e) {
      if (startMenu.open && !startMenu.contains(e.target)) startMenu.open = false;
    });
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !startMenu.open) return;
      startMenu.open = false;
      startMenu.querySelector('summary').focus();
    });
  }

  fadeElements.forEach(element => {
    element.style.opacity = 0;
    element.style.transition = 'opacity 0.5s ease-in-out';
    fadeObserver.observe(element);
  });
});
