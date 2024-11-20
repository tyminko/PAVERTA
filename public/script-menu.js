document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.querySelector('.menu-toggle');
  const menuItems = document.querySelector('.menu-items');
  const menuButtons = document.querySelectorAll('.menu-item');
  const main = document.querySelector('main');
  const sections = Array.from(main?.querySelectorAll('section') ?? []);
  
  // Update menu toggle text based on active section
  function updateMenuToggleText(activeIndex) {
    const activeButton = menuButtons[activeIndex];
    const menuText = menuToggle?.querySelector('.text')
    if (activeButton && menuText) {
      menuText.textContent = activeButton.textContent;
      menuToggle?.style.setProperty('--bg-color', `var(--color-${activeIndex + 1})`)
    }
  }
  
  // Set initial state
  sections[0].classList.add('active');
  updateMenuToggleText(0);
  
  // Menu toggle functionality
  menuToggle?.addEventListener('click', () => {
    menuItems?.classList.toggle('open');
  });
  
  // Handle clicks on document
  document.addEventListener('mousedown', (event) => {
    const isClickInsideMenu = event.target?.closest('.section-menu');
    if (!isClickInsideMenu && menuItems?.classList.contains('open')) {
      menuItems.classList.remove('open');
    }
  });
  
  async function toggleSection(index) {
    const currentActive = sections.find(section => section.classList.contains('active'));
    const targetSection = sections[index];
    
    if (currentActive === targetSection) return;
    // Close menu
    menuItems?.classList.remove('open');
    updateMenuToggleText(index);

    menuButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });

    // Prepare target section
    targetSection.style.transition = 'none';
    targetSection.style.transform = 'translateX(100%)';
    targetSection.style.visibility = 'visible';
    
    // Force reflow
    targetSection.offsetHeight;
    
    // Enable transition and start animation
    targetSection.style.transition = '';
    
    // Start animations
    requestAnimationFrame(() => {
      // Move current section out
      if (currentActive) {
        currentActive.style.transform = 'translateX(-100%)';
        currentActive.classList.remove('active');
      }
      
      // Move new section in
      targetSection.style.transform = 'translateX(0)';
      targetSection.classList.add('active');
    });
    
    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Hide old section
    if (currentActive) {
      currentActive.style.visibility = 'hidden';
    }        
  }
  
  // Add click handlers to menu buttons
  menuButtons.forEach((button, index) => {
    button?.style.setProperty('--bg-color', `var(--color-${index + 1})`)
    button.addEventListener('click', () => {
      toggleSection(index);
    });
  });
  
  // Set initial menu item active state
  if (menuButtons.length > 0) {
    menuButtons[0].classList.add('active');
  }
});