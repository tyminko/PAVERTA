/**
 * @type {{[key: string]: import("./vimeo-player").PlayerAPI}}
 */
export const videoPlayers = {}

let globalMute = true
let userUnmutedBgVideo = false
let activePlayerId = ''

const impressumButton = document.getElementById('impressum-button')
const impressum = document.getElementById('impressum')
if (impressumButton && impressum) {
  clickOutside(impressum, [impressumButton], () => {
    impressum.classList.add('closed')
  })
  const closeButton = impressum.querySelector('button.close')
  impressumButton.addEventListener('click', () => {
    impressum.classList.toggle('closed')
  })
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      impressum.classList.add('closed')
    })
  }
}

function clickOutside (element, excludeList, callback) {
  document.addEventListener('click', function (event) {
    if (!element.contains(event.target) &&
      !excludeList.some(excluded => excluded.contains(event.target))) {
      callback()
    }
  })
}
// addLogo('small')
// addLogo('large')
// addLogo('bw')
const isMobile = /Mobi|Android/i.test(navigator.userAgent)
const iframe = document.getElementById('vimeo-iframe')
if (iframe) {
  iframe.style.opacity = '0'
}
// @ts-ignore
const bgPlayer = new Vimeo.Player(iframe)
const muteToggleBtn = document.getElementById('unmute-btn')
const playBtn = document.getElementById('play-btn')

muteToggleBtn?.addEventListener('click', async () => {
  globalMute = !globalMute
  if (!activePlayerId) {
    userUnmutedBgVideo = !globalMute
    await bgPlayer.setMuted(globalMute)
  }
  updateMuteButtonState(globalMute)
  Object.values(videoPlayers).forEach(player => {
    player.setMuted(globalMute)
  })
})

async function updateMuteButtonState (isMuted) {
  if (muteToggleBtn) {
    if (isMuted) {
      muteToggleBtn.classList.add('muted')
    } else {
      muteToggleBtn.classList.remove('muted')
    }
  }
}

bgPlayer.ready().then(async () => {
  if (iframe) iframe.style.opacity = '1'
  if (!isMobile) {
    globalMute = true
    await bgPlayer.setMuted(globalMute)
    await bgPlayer.play()
    if (playBtn) playBtn.style.display = 'none'
    showVolumeToggleButton()
  }
})

// Check if it's a mobile device
if (isMobile) {
  bgPlayer.pause()
  if (muteToggleBtn) muteToggleBtn.style.display = 'none'
  if (playBtn) {
    playBtn.style.display = 'flex'
    playBtn.addEventListener('click', async () => {
      globalMute = false
      await bgPlayer.setMuted(globalMute)
      await bgPlayer.play()
      playBtn.style.display = 'none'
      showVolumeToggleButton()
    })
  }
}

async function showVolumeToggleButton () {
  if (muteToggleBtn) {
    muteToggleBtn.style.display = 'flex'
    const muted = await bgPlayer.getMuted()
    updateMuteButtonState(muted)
  }
}
// @ts-ignore
window.addEventListener('video-play-toggled', async (/** @type {import('./vimeo-player').VideoPlayToggledEvent} */ event) => {
  if (event.detail.isPlaying) {
    activePlayerId = event.detail.url
    Object.entries(videoPlayers).forEach(([url, player]) => {
      if (url !== event.detail.url) {
        player.pause()
      }
    })
  } else {
    if (activePlayerId === event.detail.url) {
      activePlayerId = ''
    }
  }
  if (activePlayerId) {
    globalMute = false
    updateMuteButtonState(globalMute)
  } else {
    globalMute = !userUnmutedBgVideo
    updateMuteButtonState(globalMute)
  }
  if (userUnmutedBgVideo) {
    await bgPlayer.setMuted(!!activePlayerId)
  }
})
