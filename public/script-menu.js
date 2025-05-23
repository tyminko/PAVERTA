/**
 * @typedef {import('./vimeo-player.js').PlayerAPI} PlayerAPI
 */

import { createVimeoPlayer } from './vimeo-player.js'
import { videoPlayers } from './script.js'

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = /** @type {HTMLElement} */ (document.querySelector('.menu-toggle'))
  const menuItems = /** @type {HTMLElement} */ (document.querySelector('.menu-items'))
  const menuButtons = /** @type {NodeListOf<HTMLElement>} */ (document.querySelectorAll('.menu-item'))
  const main = /** @type {HTMLElement} */ (document.querySelector('main'))
  const sections = Array.from(main?.querySelectorAll('section') ?? [])

  // Update menu toggle text based on active section
  /**
   * @param {number} activeIndex 
   */
  function updateMenuToggleText (activeIndex) {
    const activeButton = menuButtons[activeIndex]
    const menuText = menuToggle?.querySelector('.text')
    if (activeButton && menuText) {
      menuText.textContent = activeButton.textContent
      menuToggle?.style.setProperty('--bg-color', `var(--color-${activeIndex + 1})`)
    }
  }

  /**
   * Handle URL hash-based section switching
   */
  function handleHashChange () {
    const hash = window.location.hash.slice(1) // Remove the # symbol
    if (!hash) return

    const sectionIndex = sections.findIndex(section =>
      section.classList.contains(hash.toLowerCase())
    )

    if (sectionIndex !== -1) {
      toggleSection(sectionIndex)
    }
  }

  // Initial section setup
  sections[0].classList.add('active')
  checkSectionVideoPlayers(sections[0])
  updateMenuToggleText(0)

  // Handle initial hash and hash changes
  handleHashChange()
  window.addEventListener('hashchange', handleHashChange)

  menuToggle?.addEventListener('click', () => {
    menuItems?.classList.toggle('open')
  })

  document.addEventListener('mousedown', (event) => {
    const isClickInsideMenu = /** @type {HTMLElement} */ (event.target)?.closest('.section-menu')
    if (!isClickInsideMenu && menuItems?.classList.contains('open')) {
      menuItems.classList.remove('open')
    }
  })

  /**
   * Toggle a section
   * @param {number} index - The index of the section to toggle
   */
  async function toggleSection (index) {
    const currentActive = sections.find(section => section.classList.contains('active'))
    const targetSection = sections[index]

    if (currentActive === targetSection) return
    // Close menu
    menuItems?.classList.remove('open')
    updateMenuToggleText(index)

    menuButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index)
    })

    // Update URL hash
    const sectionClass = Array.from(targetSection.classList)
      .find(cls => cls !== 'active' && cls !== 'section')
    if (sectionClass) {
      window.location.hash = sectionClass
    }

    // Prepare target section
    targetSection.style.transition = 'none'
    targetSection.style.transform = 'translateX(100%)'
    targetSection.style.visibility = 'visible'
    checkSectionVideoPlayers(targetSection)
    // Force reflow
    targetSection.offsetHeight

    targetSection.style.transition = ''
    requestAnimationFrame(() => {
      if (currentActive) {
        currentActive.style.transform = 'translateX(-100%)'
        currentActive.classList.remove('active')
      }
      targetSection.style.transform = 'translateX(0)'
      targetSection.classList.add('active')
    })

    // Wait for animation to complete
    await new Promise(resolve => setTimeout(resolve, 500))

    // Hide old section
    if (currentActive) {
      currentActive.style.visibility = 'hidden'
    }
  }

  /**
   * Check if a section has a video player and add an event listener to it
   * @param {HTMLElement} sectionElement - The section element to check
   */
  function checkSectionVideoPlayers (sectionElement) {
    const videoPlayerEls = /** @type {NodeListOf<HTMLElement>} */ (sectionElement.querySelectorAll('.v-player'))
    videoPlayerEls.forEach((videoPlayerEl) => {
      if (videoPlayerEl.dataset.url && !videoPlayers[videoPlayerEl.dataset.url]) {
        videoPlayers[videoPlayerEl.dataset.url] = createVimeoPlayer(videoPlayerEl, videoPlayerEl.dataset.url, {
          autoplay: false,
          controls: {
            playPause: !videoPlayerEl.dataset.chromeless,
            mute: false,
          }
        })
      }
    })
    Object.values(videoPlayers).forEach((player, url) => {
      player.removeShortcuts()
      player.pause()
    })
    if (videoPlayerEls.length > 0) {
      const url = Array.from(videoPlayerEls).find(el => el.dataset.url)?.dataset.url
      if (url) {
        videoPlayers[url].addShortcuts()
      }
    }
  }

  menuButtons.forEach((button, index) => {
    button?.style.setProperty('--bg-color', `var(--color-${index + 1})`)
    sections[index].style.setProperty('--bg-color', `var(--color-${index + 1})`)
    button.addEventListener('click', () => {
      toggleSection(index)
    })
  })

  // Set initial menu item active state
  if (menuButtons.length > 0) {
    menuButtons[0].classList.add('active')
  }
})