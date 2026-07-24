document.addEventListener('DOMContentLoaded', () => {
  const slides = document.querySelectorAll('.slide');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const slideIndicator = document.getElementById('slideIndicator');
  let currentSlideIndex = 0;

  function updateSlide(index) {
    // Remove active class from current active slide
    slides[currentSlideIndex].classList.remove('active');
    
    // Set new index
    currentSlideIndex = index;
    
    // Add active class to new slide
    slides[currentSlideIndex].classList.add('active');

    // Update indicator
    slideIndicator.textContent = `${currentSlideIndex + 1} / ${slides.length}`;

    // Manage timeline progress on Slide 8 (Market & Scalability)
    const timelineProgress = document.getElementById('timelineProgress');
    const nodes = document.querySelectorAll('.timeline-node');
    if (timelineProgress && nodes.length > 0) {
      if (currentSlideIndex === 7) { // 8th slide is index 7
        setTimeout(() => {
          timelineProgress.style.width = '75%';
          nodes.forEach((node, i) => {
            if (i < 4) {
              setTimeout(() => node.classList.add('active'), i * 300);
            }
          });
        }, 300);
      } else {
        timelineProgress.style.width = '0';
        nodes.forEach(node => node.classList.remove('active'));
      }
    }

    // Manage funding allocation bar animations on Slide 11
    const askBars = document.querySelectorAll('.ask-allocation-bar');
    if (askBars.length > 0) {
      if (currentSlideIndex === 10) { // 11th slide is index 10
        setTimeout(() => {
          askBars.forEach(bar => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
          });
        }, 300);
      } else {
        askBars.forEach(bar => {
          bar.style.width = '0';
        });
      }
    }
  }

  function nextSlide() {
    if (currentSlideIndex < slides.length - 1) {
      updateSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 0) {
      updateSlide(currentSlideIndex - 0 - 1);
    }
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') {
      nextSlide();
    } else if (e.key === 'ArrowLeft' || e.key === 'Backspace') {
      prevSlide();
    }
  });

  // Button clicks
  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // Initialize
  updateSlide(0);
});
