// Regional-form sprite fallback (slothsandmoons).
// The upstream sprite set is missing a few regional forms (e.g. RR's Noibat-Sevii /
// Noivern-Sevii). When one 404s, instead of a broken icon we composite the BASE species
// sprite with a small form label ("Sevii", "Alola", ...) baked on, so it's still legible.
// One global capture-phase error listener covers every view (box, party, trainer preview).
(function () {
  var FORM_LABELS = {
    sevii: 'Sevii',
    alola: 'Alola',
    galar: 'Galar',
    hisui: 'Hisui',
    paldea: 'Paldea'
  }
  var SUFFIX_RE = /^(.*\/)(.+)-(sevii|alola|galar|hisui|paldea)(\.png(?:[?#].*)?)$/i

  function bake(img) {
    var src = img.getAttribute('src') || ''
    var m = src.match(SUFFIX_RE)
    if (!m) return false
    img.dataset.regionalFallback = '1'

    var baseUrl = m[1] + m[2] + m[4]
    var label = FORM_LABELS[m[3].toLowerCase()] || m[3]

    var base = new Image()
    base.crossOrigin = 'anonymous'
    base.onload = function () {
      try {
        var w = base.naturalWidth || 56
        var h = base.naturalHeight || 56
        var c = document.createElement('canvas')
        c.width = w
        c.height = h
        var ctx = c.getContext('2d')
        ctx.imageSmoothingEnabled = false
        ctx.drawImage(base, 0, 0, w, h)

        var fs = Math.max(9, Math.round(h * 0.28))
        ctx.font = '700 ' + fs + 'px Arial, Helvetica, sans-serif'
        ctx.textBaseline = 'alphabetic'
        ctx.textAlign = 'center'
        ctx.lineJoin = 'round'
        ctx.lineWidth = Math.max(2, Math.round(fs / 4))
        ctx.strokeStyle = 'rgba(255,255,255,0.96)'
        ctx.fillStyle = '#d0218c' // reads as a "special form" tag
        var x = w / 2
        var y = h - Math.max(1, Math.round(h * 0.04))
        ctx.strokeText(label, x, y)
        ctx.fillText(label, x, y)
        img.src = c.toDataURL()
      } catch (e) {
        img.src = baseUrl // e.g. tainted canvas: at least show the base mon
      }
    }
    base.onerror = function () {
      // base is missing too; leave the (broken) src as-is rather than loop
    }
    base.src = baseUrl
    return true
  }

  document.addEventListener(
    'error',
    function (e) {
      var t = e.target
      if (
        t &&
        t.tagName === 'IMG' &&
        !t.dataset.regionalFallback &&
        SUFFIX_RE.test(t.getAttribute('src') || '')
      ) {
        // stop the element's own onerror (which would swap in default.png) and bake instead
        if (bake(t)) e.stopImmediatePropagation()
      }
    },
    true // capture: image error events don't bubble
  )
})()
