function addLogo (className) {
  const logo = document.querySelector("#logo-template")
  if (!logo) return
  const clone = logo.content.cloneNode(true)
  /* DEBUG */
  console.log(`%c %c clone: `, 'background:#ffbb00;color:#000', 'color:#00aaff', clone)
  clone.firstElementChild.classList.add(className)
  document.body.appendChild(clone)
}

addLogo('small')
addLogo('large')
addLogo('bw')
