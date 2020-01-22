// SongsList contains all already loaded songs
// can load new songs
class LoadedSongsList {
  constructor() {
    this.songs = []
  }

  // emptySongs gets a list of IDs, find which IDs are not loaded yet
  // and return songs IDs which should be loaded from songs
  songsToLoad(IDs) {
    let notYetSongs = []
    // for IDs in given list
    for(let i in IDs) {
      // check if songs object with property IDs[i] already exists
      if(!(IDs[i] in this.songs)) {
        notYetSongs.push(IDs[i])
      }
    }
    return notYetSongs
  }
}


class CurrentSong {

  constructor() {
    this.paragraphs
    this.container = document.getElementById("content")
    this.songInfoBar = document.getElementById("songInfo")
  }

  loadNewSong(song) {
    this.song = song
    this.setSong()
  }

  // setSong is function that set page so it displays(load) chooded song from loaded playList
  setSong() {
    this.setSongParegraphs()

    // check if paragraph contain chords
    this.paragraphs = document.getElementsByClassName("paragraph")

    // if chords are off, set them invisible
    this.checkForChords(this.paragraphs, getCookie("chordsON"))

    // if repetited paragaphs are off, set them invisible
    this.foldParagraphs(getCookie("foldPar"))

    // get rid of space after moved chords
    var chords = document.getElementsByClassName("chord")
    for (var i=0; i<chords.length; i++) {
      chords[i].style.marginLeft = -chords[i].offsetWidth + "px"
      chords[i].style.left = chords[i].offsetWidth + "px"
    }
  }

  setSongParegraphs() {

    // add title
    var displaySong = "<div class=\"songTitle\">" + this.song.title + "</div>"

    // loop through parahraphs names
    for (var i=0; i<this.song.paragraphsOrder.length; i++) {
      var parName = this.song.paragraphsOrder[i]
      var par = this.song.paragraphs[parName]
      // if paragraph exists add it
      if (typeof par !== 'undefined') {
        // remove first <br> if there is some
        par = par.replace(/^( |<br>)*(.*?)( |<br>)*$/,"$2");
        // format paragraph name and paragraph to blocks
        displaySong += '<div class="parContainer"><div class="parName">' + parName + ': </div><div class="paragraph">' + par + "</div></div>"
      }
    }
    this.container.innerHTML = displaySong
  }

  // foldParToggle is function that runs after button "Par Fold" is pressed
  // it toogle visibility of repeting paragraphs
  foldParToggle() {
    if (getCookie("foldPar") == true) {
      setCookie("foldPar", false, 2);
    } else {
      setCookie("foldPar", true, 2);
    }
    this.foldParagraphs(getCookie("foldPar"))
  }

  // foldParagraphs is function, which search all paragraph names and if find that some is repetiong, it set display: none/inline-block
  // foldPar = true/false argument says if I want repeting paragraphs to be shown or not
  foldParagraphs(foldPar) {
    var paragraphs = document.getElementsByClassName("paragraph")
    var parName = document.getElementsByClassName("parName")
    // if argument foldPar is false, show everything as inline-block
    if (!foldPar) {
      for (var i=0; i<paragraphs.length; i++) {
        paragraphs[i].style.display = "inline-block"
      }

      // if argument foldPar is true, show only non repeting paragraphs
    } else {
      var seenParNames = []
      // list every paragraphs
      for (var i=0; i<paragraphs.length; i++) {
        var Seen = false
        // list through already seen paragraphs
        for (var j=0; j<seenParNames.length; j++) {

          // if paragraph was seen before
          if (parName[i].textContent == seenParNames[j].textContent) {
            paragraphs[i].style.display = "none"
            break
          }
        }
        // add paragraph name to seen paragraphs
        seenParNames.push(parName[i])
      }
    }
  }

  // list for paragraphs and if there is at last one chord,
  // add extra space by calling function setParagraphSpace
  checkForChords(paragraphs, ShowChords) {
    if (paragraphs == undefined) {
      return
    }
    if (!ShowChords) {
      this.showChords(false)
      for (i=0; i<paragraphs.length; i++) {
        this.setParagraphSpace(paragraphs[i], false)
      }
      return
    }
    this.showChords(true)
    for (var i=0; i<paragraphs.length; i++) {
      var elements = paragraphs[i].children
      for (var j=0; j<elements.length; j++) {
        if (elements[j].tagName == 'DIV') {
          this.setParagraphSpace(paragraphs[i], true)
          break;
        }
      }
    }
  }

  // get element and if extraSpace is true, add space in form of class
  // if extraSpace is false, removes space class
  setParagraphSpace(paragraph, extraSpace) {
    if (extraSpace) {
      paragraph.classList.add('paragraphsSpace')
    } else {
      paragraph.classList.remove('paragraphsSpace')
    }
  }

  // chordsToggle is function that swich on/off chords of loaded song in content element
  chordsToggle() {
    if (getCookie("chordsON") === true) {
      setCookie("chordsON", false, 2)
    } else {
      setCookie("chordsON", true, 2)
    }
    this.showChords(getCookie("chordsON"))

    // resize space between lines in paragraphs if chords are in
    this.checkForChords(this.paragraphs, getCookie("chordsON"))
  }

  // showChords get all chords elements and set visibility by given parameter
  // argument showON truw/false
  showChords(showON) {
    var chords = document.getElementsByClassName("chord")
    // if I want chords to be shown
    if (showON) {
      for (var i=0; i<chords.length; i++) {
        chords[i].style.display = "inline-block"
      }

    // if I don't want chords to be shown
    } else {
      for (var i=0; i<chords.length; i++) {
        chords[i].style.display = "none"
      }
    }
  }


}
