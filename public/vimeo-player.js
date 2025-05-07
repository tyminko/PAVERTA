/**
 * @typedef {import('https://player.vimeo.com/api/player.js').Player} VimeoPlayer
 */

/** @type {any} */
const Vimeo = window.Vimeo

/**
 * @typedef {Object} Vimeo
 * @property {Function} Player - Vimeo Player constructor
 */

/**
 * @typedef {Object} PlayerControls
 * @property {boolean} [playPause=true] - Whether to show play/pause button
 * @property {boolean} [mute=true] - Whether to show mute button
 */

/**
 * @typedef {Object} PlayerOptions
 * @property {string} [previewUrl=''] - URL of the preview image
 * @property {boolean} [autoplay=true] - Whether to autoplay the video
 * @property {PlayerControls} [controls] - Control options
 */

/**
 * @typedef {Object} PlayerAPI
 * @property {Function} play - Starts video playback
 * @property {Function} pause - Pauses video playback
 * @property {Function} togglePlay - Toggles between play and pause
 * @property {Function} toggleMute - Toggles between mute and unmute
 * @property {Function} setMuted - Sets the muted state of the video
 * @property {Function} getPlayer - Returns the underlying Vimeo player instance
 */

/**
 * Default player options
 * @type {PlayerOptions}
 */
const defaultPlayerOptions = {
  previewUrl: '',
  autoplay: true,
  controls: {
    playPause: true,
    mute: true
  }
}

/**
 * Creates a Vimeo player instance
 * @param {string | HTMLElement} container - CSS selector or DOM element where the player will be mounted
 * @param {string} url - URL of the Vimeo video
 * @param {PlayerOptions} [options={}] - Player configuration options
 * @returns {PlayerAPI} Player API
 */
export function createVimeoPlayer (container, url, options = {}) {
  const playerContainer = typeof container === 'string' ? document.querySelector(container) : container
  if (!playerContainer) {
    throw new Error('Container element not found')
  }
  const playerOptions = { ...defaultPlayerOptions, ...options }

  // State variables
  let player = null
  let isPlaying = false
  let isMuted = playerOptions.autoplay
  let isLoading = true
  let isVideoReady = false
  const videoId = extractVideoId(url)
  const showControls = playerOptions.controls?.playPause || playerOptions.controls?.mute
  /**
   * @param {string} url
   */
  function extractVideoId (url) {
    const match = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
    return match ? match[1] : null
  }

  /**
   * @param {Element} playerContainer
   */
  function init (playerContainer) {
    const previewUrl = playerContainer.querySelector('img')?.src ?? playerOptions.previewUrl

    // Clear container
    playerContainer.innerHTML = ''

    // Create controls container if needed
    if (showControls) {
      const overflowDiv = document.createElement('div')
      overflowDiv.className = 'overflow'
      const controlsDiv = document.createElement('div')
      controlsDiv.className = 'controls'

      if (playerOptions.controls?.playPause) {
        const playPauseBtn = document.createElement('button')
        playPauseBtn.className = 'play-pause'
        playPauseBtn.textContent = '▶'
        playPauseBtn.addEventListener('click', togglePlay)
        controlsDiv.appendChild(playPauseBtn)
      }

      if (playerOptions.controls?.mute) {
        const muteBtn = document.createElement('button')
        muteBtn.className = 'mute'
        muteBtn.textContent = '🔊'
        muteBtn.addEventListener('click', toggleMute)
        controlsDiv.appendChild(muteBtn)
      }

      playerContainer.appendChild(controlsDiv)
    }

    player = new Vimeo.Player(playerContainer, {
      url: url,
      controls: false,
      autoplay: playerOptions.autoplay,
      loop: true,
      muted: playerOptions.autoplay,
      background: true,
      playsinline: true
    })
    setupEventListeners()
    updatePlayPauseButton()
    updateMuteButton()
  }

  // Set up event listeners
  function setupEventListeners () {
    player.on('play', () => {
      isPlaying = true
      updatePlayPauseButton()
      hidePreviewImage()
    })

    player.on('pause', () => {
      isPlaying = false
      updatePlayPauseButton()
    })

    player.on('loading', () => {
      isLoading = true
      updateLoadingIndicator()
    })

    player.on('loaded', () => {
      isLoading = false
      isVideoReady = true
      updateLoadingIndicator()
      hidePreviewImage()
    })

    player.on('volumechange', (data) => {
      isMuted = data.muted
      updateMuteButton()
    })
  }

  // Toggle play/pause
  function togglePlay () {
    if (isPlaying) {
      player.pause()
    } else {
      player.play()
    }
    // Dispatch custom event for video playback state change
    window.dispatchEvent(new CustomEvent('video-play-toggled', {
      detail: {
        isPlaying: !isPlaying,
        videoId: videoId
      }
    }))
  }

  // Toggle mute/unmute
  function toggleMute () {
    isMuted = !isMuted
    /* DEBUG */
    console.log(`%c %c isMuted: `, 'background:#ffbb00;color:#000', 'color:#00aaff', isMuted)
    player.setMuted(isMuted)
  }

  // Update play/pause button
  function updatePlayPauseButton () {
    const btn = playerContainer?.querySelector('.play-pause')
    if (btn) {
      btn.textContent = isPlaying ? '⏸' : '▶'
    }
  }

  // Update mute button
  function updateMuteButton () {
    const btn = playerContainer?.querySelector('.mute')
    if (btn) {
      btn.textContent = isMuted ? '🔇' : '🔊'
    }
  }

  // Update loading indicator
  function updateLoadingIndicator () {
    const indicator = playerContainer?.querySelector('.loading-indicator')
    if (indicator) {
      indicator.style.display = isLoading ? 'block' : 'none'
    }
  }

  // Hide preview image
  function hidePreviewImage () {
    if (isVideoReady && playerOptions.previewUrl) {
      const previewImage = playerContainer?.querySelector('.preview-image')
      if (previewImage) {
        previewImage.classList.add('hidden')
      }
    }
  }

  // Public API
  const api = {
    play: () => player.play(),
    pause: () => player.pause(),
    togglePlay,
    toggleMute,
    setMuted: (muted) => player.setMuted(muted),
    getPlayer: () => player
  }

  // Initialize the player
  init(playerContainer)

  // Return public API
  return api
}
