// function addLogo (className) {
//   /** @type HTMLTemplateElement | null */ const logo = document.querySelector("#logo-template")
//   if (!logo) return
//   const main = document.getElementsByTagName('main')[0] ?? document.body
//   /** @type HTMLElement */ const clone = logo.content.cloneNode(true)
//   clone.firstElementChild?.classList.add(className)
//   main.prepend(clone)
// }

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

function clickOutside(element, excludeList, callback) {
  document.addEventListener('click', function(event) {
    if (!element.contains(event.target) && 
        !excludeList.some(excluded => excluded.contains(event.target))) {
      callback();
    }
  });
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
const player = new Vimeo.Player(iframe);
const muteToggleBtn = document.getElementById('unmute-btn');
const playBtn = document.getElementById('play-btn');

muteToggleBtn?.addEventListener('click', async () => {
  try {
    const muted = await player.getMuted();
    await player.setMuted(!muted);
    updateMuteButtonState(!muted);
  } catch (error) {
    console.error('Error toggling mute:', error);
  }
});

async function updateMuteButtonState(isMuted) {
  if (muteToggleBtn) {
    if (isMuted) {
      muteToggleBtn.classList.add('muted');
    } else {
      muteToggleBtn.classList.remove('muted');
    }
  }
}

player.ready().then(async () => {
  if (iframe) iframe.style.opacity = '1';
  if (!isMobile) {
    await player.setMuted(true);
    await player.play();
    if (playBtn) playBtn.style.display = 'none';
    showVolumeToggleButton();
  }
});

// Check if it's a mobile device
if (isMobile) {
  player.pause();
  if (muteToggleBtn) muteToggleBtn.style.display = 'none';
  if (playBtn) {
    playBtn.style.display = 'flex';
    playBtn.addEventListener('click', async () => {
      await player.setMuted(false);
      await player.play();
      playBtn.style.display = 'none';
      showVolumeToggleButton();
    });
  }
}

async function showVolumeToggleButton() {
  if (muteToggleBtn) {
    muteToggleBtn.style.display = 'flex';
    const muted = await player.getMuted();
    updateMuteButtonState(muted);
  }
}