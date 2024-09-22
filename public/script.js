function addLogo (className) {
  /** @type HTMLTemplateElement | null */ const logo = document.querySelector("#logo-template")
  if (!logo) return
  const main = document.getElementsByTagName('main')[0] ?? document.body
  /** @type HTMLElement */ const clone = logo.content.cloneNode(true)
  clone.firstElementChild?.classList.add(className)
  main.prepend(clone)
}

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
addLogo('large')
// addLogo('bw')
