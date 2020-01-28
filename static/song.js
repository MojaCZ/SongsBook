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

  parseSong(i) {
    for (let par in this.songs[i].Paragraphs) {
      let parHTML = document.createElement('div');
      parHTML.innerHTML = this.songs[i].Paragraphs[par];
      var parElements = parHTML.children;

      for (let el=0; el<parElements.length; el++) {
        if(parElements[el].classList.contains("chord")) {
          parElements[el].setAttribute("ng-hide", "chordsOff")
        }
      }

      let containChord = false;
      for(let el=0; el<parElements.length; el++) {
        if(parElements[el].classList.contains("chord")) {
          containChord = true;
          break;
        }
      }
      parHTML.setAttribute("contain-chord", containChord)
      parHTML.setAttribute("ng-class", "{'paragraphsSpace':!chordsOff &&" + containChord + "}")
      // parHTML.setAttribute("ng-class", "parFold ? 'paragraphsSpace'")
      this.songs[i].Paragraphs[par] = parHTML.outerHTML;
    }
  }
}


//
//   // foldParToggle is function that runs after button "Par Fold" is pressed
//   // it toogle visibility of repeting paragraphs
//   foldParToggle() {
//     if (getCookie("foldPar") == true) {
//       setCookie("foldPar", false, 2);
//     } else {
//       setCookie("foldPar", true, 2);
//     }
//     this.foldParagraphs(getCookie("foldPar"))
//   }
//
//   // foldParagraphs is function, which search all paragraph names and if find that some is repetiong, it set display: none/inline-block
//   // foldPar = true/false argument says if I want repeting paragraphs to be shown or not
//   foldParagraphs(foldPar) {
//     var paragraphs = document.getElementsByClassName("paragraph")
//     var parName = document.getElementsByClassName("parName")
//     // if argument foldPar is false, show everything as inline-block
//     if (!foldPar) {
//       for (var i=0; i<paragraphs.length; i++) {
//         paragraphs[i].style.display = "inline-block"
//       }
//
//       // if argument foldPar is true, show only non repeting paragraphs
//     } else {
//       var seenParNames = []
//       // list every paragraphs
//       for (var i=0; i<paragraphs.length; i++) {
//         var Seen = false
//         // list through already seen paragraphs
//         for (var j=0; j<seenParNames.length; j++) {
//
//           // if paragraph was seen before
//           if (parName[i].textContent == seenParNames[j].textContent) {
//             paragraphs[i].style.display = "none"
//             break
//           }
//         }
//         // add paragraph name to seen paragraphs
//         seenParNames.push(parName[i])
//       }
//     }
//   }
//
// }
