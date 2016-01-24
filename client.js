var $ = window.document.querySelector.bind(window.document)
var body = window.document.body
var baseUrl = `${window.location.protocol}//${window.location.host}`
var linkArea = $('.link-area')
var download = $('.download')
var hash = $('.hash')
var copyButton = $('.copy')
var Clipboard = window.clipboard
var JSZip = window.jszip
download.onclick = () => {
  if (!hash.value) return
  var xhr = new window.XMLHttpRequest()
  xhr.open('GET', `/${hash.value}/fontello/config.json`)
  xhr.onload = response => {
    if (xhr.status === 200) {
      var a = document.createElement('a')
      a.download = 'config.json'
      a.href = `data:application/json; base64, ${window.btoa(xhr.response)}`
      a.click()
    }
  }
  xhr.send()
}

window.dragDrop(body, files => {
  var file = files[0]
  var prefix = file.name.match(/(fontello-[^ .]*)/)[1]
  if (!file) return
  var reader = new window.FileReader()
  reader.onload = e => {
    var zip = new JSZip(e.target.result)
    var config = zip.files[`${prefix}/config.json`].asText()

    var xhr = new window.XMLHttpRequest()
    xhr.open('POST', '/upload/config.json')
    xhr.onload = response => {
      if (xhr.status === 200) {
        linkArea.textContent = ['fontello.css', 'animation.css']
        .map(name => `<link rel="stylesheet" href="${baseUrl}/${xhr.responseText}/fontello/css/${name}" charset="utf-8">`)
        .join('\n')

        hash.value = xhr.responseText
        copyButton.style.display = 'block'

        new Clipboard(copyButton, { text: () => linkArea.textContent })
        .on('success', () => {
          copyButton.textContent = 'Copied!'
          setTimeout(
            () => copyButton.textContent = 'Copy to clipboard',
            1500
          )
        })
      }
    }
    xhr.send(config)
  }
  reader.readAsArrayBuffer(file)
})
