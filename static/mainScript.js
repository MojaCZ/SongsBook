class PlayListBar {
  constructor() {
    var self = this

    this.songsListHidden  = false;
    this.foldMouseOn      = Date.now();


    this.listShown = true;
    this.showX    = [0,220];
    this.hideX    = [-291,-70];

    this.PLbar            = document.getElementById("songsList");
    this.PLfoldBTN        = document.getElementById("fold");
    this.menu             = document.getElementById("menu")
    this.menuListBTN      = document.getElementById("listBTN")
    this.pageContentGR    = document.getElementById("content");
    this.songInfoGR       = document.getElementById("songInfo");

    // add proper functions to resize fold on mouse over songsList
    this.PLbar.addEventListener(     "mouseover",  self.moveFold.bind(this, false) );
    this.PLfoldBTN.addEventListener( "mouseover",  self.moveFold.bind(this, false) );
    this.PLbar.addEventListener(     "mouseout",   self.moveFold.bind(this, true) );
    this.PLfoldBTN.addEventListener( "mouseout",   self.moveFold.bind(this, true) );
    this.PLfoldBTN.addEventListener( "click",      self.moveSongsList.bind(this));
    // this.menuListBTN.addEventListener("click",     self.displaySongsListToogle())
    this.menuListBTN.addEventListener("click",     function(){self.displaySongsListToogle()})

    window.addEventListener("resize", function(){self.initByWindowSize()});
    document.body.addEventListener("click", function(event){self.checkClickOutsideBar()})

    this.initByWindowSize()

  }

  checkClickOutsideBar() {
    if (this.PLbar.contains(event.target) || this.menu.contains(event.target)) {
        // clicked inside
    } else {
        this.displaySongsList(false)
    }
  }

  displaySongsListToogle() {
    if (this.PLbar.style.display == "block") {
      this.displaySongsList(false)
    } else {
      this.displaySongsList(true)
    }
  }

  displaySongsList(display) {
    if (display) {
      this.PLbar.style.display = "block"
    } else if (window.innerWidth < 800) {
      this.PLbar.style.display = "none"
    }
  }

  initByWindowSize() {
    var width = window.innerWidth
    var height = window.innerHeight

    if (width > 800) {
      songsList.style.display = "block"
    } else if (width > 420) {
      songsList.style.display = "block"
    } else {
      songsList.style.display = "block"
    }

    this.verticalPositionFoldBTN()
  }

  verticalPositionFoldBTN() {
    this.PLfoldBTN.style.top = "calc((100% - 60px) / 2)"
  }

  // toogle between displayd and hidden play list bar
  moveSongsList() {
    if (!this.songsListHidden) {
      this.hideSongsList()
    } else {
      this.showSongsList()
    }
  }

  // display play list bar and play list fold button
  showSongsList() {
    var self = this

    // to hide fold button while moving (bug fixing ;-) )
    var top = self.PLfoldBTN.style.top;
    self.PLfoldBTN.style.display = "none";
    moveElement(this.PLbar, this.showX[0], false, 12, function(){
      self.pageContentGR.style.gridColumn="2";
      self.songInfoGR.style.gridColumn="2";
    });
    moveElement(this.PLfoldBTN, this.showX[1], false, 8, function(){
      self.PLfoldBTN.style.display = "block"
      self.PLfoldBTN.style.top = top;
      self.PLfoldBTN.innerHTML = "&lt;";
      self.foldMouseOn = Date.now() + 2000
    });
    this.songsListHidden = false;
  }

  // hide play list bar and play list fold button
  hideSongsList() {
    var self = this;
    moveElement(self.PLbar, self.hideX[0], false, 12, function(){
      self.pageContentGR.style.gridColumn = "1/3"
      self.songInfoGR.style.gridColumn    = "1/3"
    });
    moveElement(self.PLfoldBTN, self.hideX[1], false, 15, function(){
      self.PLfoldBTN.innerHTML = "&gt;";
      self.foldMouseOn = Date.now() + 2000;
    });
    this.songsListHidden = true;
  }

  // function will move fold button
  // foldMouseOn act as semaphore variable, chacking if another event have not triggered same event
  moveFold(hide) {

    // set left offset
    var left = 0;
    if (this.songsListHidden) {
      left = this.hideX[1]
    } else {
      left = this.showX[1]
    }

    // if I want to hide fold play list button
    if (hide) {

      var self = this
      var stepHide = 2000;
      this.foldMouseOn = Date.now()

      // if I want to move element after wait time
      setTimeout(function () {
        // time after last "display fold button" event is greater than now time + constant
        if (Date.now() - stepHide >= self.foldMouseOn) {
          moveElement(self.PLfoldBTN, left, false, 1, function(){self.verticalPositionFoldBTN()});
        }
      }, stepHide);

    // mouse on element (display)
    } else {
      // set timer to some big number I'll probably not going to reach
      this.foldMouseOn = Date.now() + 100000
      left = left + 40
      // change fold button position right now
      fold.style.left = left + "px";
    }
  }
}

class PlaylistList {

  constructor(LoadedSongsList, PLbar) {
    this.PLbar = PLbar
    this.PlaylistNames = []
    this.PlaylistIDs = []
    this.playlistSelect = document.getElementById("playList")
    this.LoadedSongsList = LoadedSongsList
    this.currentSong = LoadedSongsList.currentSong
    this.sendAJAX()
  }

  sendAJAX() {
    var self = this

    // loadPlayLists function get address, send request and ger
    var addr = "/SongsBook/playlistsJSON"
    var http = new XMLHttpRequest();
    http.open('POST', addr)
    http.onload = function() {
      plJSON = JSON.parse(http.responseText);
      self.loadPlaylists(plJSON)
    }
    http.send();
  }

  loadPlaylists(plJSON) {
    for (var i=0; i<plJSON.length; i++) {
      this.PlaylistIDs.push(plJSON[i][0])
      this.PlaylistNames.push(plJSON[i][1])
    }
    this.setPlaylistBar()
    this.setFirstPlaylist()
  }

  setPlaylistBar() {
    var newSongs = "";
    var plOptions = "";

    for (var i=0; i<this.PlaylistNames.length; i++) {
      if (this.PlaylistNames[i] == "New Songs") {
        newSongs += "<option value='" + this.PlaylistIDs[i] + "'>" + this.PlaylistNames[i] + "</ option>"
      } else {
        plOptions += "<option value='" + this.PlaylistIDs[i] + "'>" + this.PlaylistNames[i] + "</ option>"
      }
    }

    plOptions = newSongs + plOptions;
    this.playlistSelect.innerHTML = plOptions;
  }

  setFirstPlaylist() {
    var value = this.playlistSelect.value
    var index = this.playlistSelect.selectedIndex
    var text = this.playlistSelect.options[index].text
    currentPlaylist = new ActivePlaylist(value, text, this.LoadedSongsList, this.PLbar)
    setTimeout(function(){
      var ID = this.currentPlaylist.songsIDs[0]
      this.currentPlaylist.displaySong(this.currentPlaylist.songsIDs[0])
      // this time is here so currentPlaylist can load before I'll be loading informations from it
    },100)
  }
}

class ActivePlaylist {
  // when PlayList is initialized, get list of songs and load this songs
  constructor(PlaylistID, PlaylistName, LoadedSongsList, PLbar) {
    this.PlaylistID = PlaylistID;
    this.PlaylistName = PlaylistName;
    this.LoadedSongsList = LoadedSongsList
    this.PLbar  = PLbar
    this.songsIDs = [];
    this.songsNames = [];
    this.loadSongsInPlaylist()
  }

  loadSongsInPlaylist() {
    var self = this

    // loadPlayLists function get address, send request and ger
    var addr = "/SongsBook/songsInPlaylistJSON"
    var http = new XMLHttpRequest();
    var par = "playlistID=" + this.PlaylistID
    http.open('POST', addr, true)
    http.setRequestHeader("Content-type", " application/x-www-form-urlencoded")
    http.onload = function() {
      if (http.responseText.length > 2) {
        plJSON = JSON.parse(http.responseText);
        self.setSongs(plJSON)
      } else {
        alert("playlist is empty")
      }
    }
    http.send(par);
  }

  setSongs(plJSON) {
    for(var i=0; i<plJSON.length; i++) {
      this.songsIDs.push(plJSON[i][0])
      this.songsNames.push(plJSON[i][1])
    }
    this.displaySongsBTNs()
    this.LoadedSongsList.getSongs(this.songsIDs)
  }

  displaySongsBTNs() {
    var self = this
    var ulSongs = document.getElementById("ulSongs")

    // clear unordered list
    ulSongs.innerHTML = ""

    // loop through songs to be loaded
    for (var i = 0; i < this.songsIDs.length; i++) {
      // create <li> element
      var liSong = document.createElement("li")
      liSong.innerHTML = this.songsNames[i]
      liSong.addEventListener("click", function(){self.PLbar.displaySongsList(false)})

      // this way, ID stays fixed even after I create anorher functions and call them later
      var ID = this.songsIDs[i]
      liSong.onclick = (function(ID) {
        return function() {
          self.displaySong(ID)
        }
        self.displaySong(ID)
      })(ID)

      // add <li> to <ul>
      ulSongs.appendChild(liSong)
    }
  }

  displaySong(songID) {
    this.LoadedSongsList.displaySong(songID)
  }

}

class Song {

  constructor(songID, songJSON) {
    this.songID   = songID
    this.title    = songJSON.Title
    this.artists  = songJSON.Artist
    this.language = songJSON.Language
    this.key      = songJSON.Key
    this.capo     = songJSON.Capo
    this.tact     = songJSON.Tact
    this.tempo    = songJSON.Tempo
    this.paragraphs     = songJSON.Paragraphs
    this.paragraphsOrder  = songJSON.ParagraphsOrder
  }

}

// SongsList contains all already loaded songs
// can load new songs
class LoadedSongsList {
  constructor(currentSong) {
    this.songsIDs = []
    this.songsNames = []
    this.songs = []
    this.currentSong = currentSong
  }

  getSongs(songsIDs) {
    // var songs
    var checkedSongsIDs = []
    for (var i=0; i<songsIDs.length; i++) {
      if (!this.songIn(songsIDs[i])) {
        checkedSongsIDs.push(songsIDs[i])
      }
    }
    this.sendAJAX(checkedSongsIDs)
  }

  sendAJAX(songsIDs) {
    var self = this
    if (songsIDs.length == 0) {
      console.log("no songs to load anymore")
      return
    }
    // form requested variables
    var songsURLVar = ""
    for (var i=0; i<songsIDs.length; i++) {
      songsURLVar += songsIDs[i] + ","
    }
    songsURLVar = "songsIDs=" + songsURLVar.substring(0,songsURLVar.length-1)

    // loadPlayLists function get address, send request and ger
    var addr = "/SongsBook/songsJSON"
    var http = new XMLHttpRequest();
    http.open('POST', addr, true)
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
    http.onload = function() {
      var songsJSON = JSON.parse(http.responseText);
      self.addSongsJSON(songsJSON)
    }
    http.send(songsURLVar);
  }

  addSongsJSON(songsJSON) {
    for (var key in songsJSON) {
      this.addToList(key, songsJSON[key])
    }
  }

  addToList(songID, songJSON) {
    if (this.songIn(songID)) {
      return
    }

    var song = new Song(songID, songJSON)
    this.songsIDs.push(songID)
    this.songsNames.push(song.Name)
    this.songs.push(song)
  }

  songIn(songID) {
    for (var key in this.songsIDs) {
      if (songID == this.songsIDs[key]) {
        return true
      }
    }
    return false
  }

  displaySong(songID) {
    for(var i=0; i<this.songsIDs.length; i++) {
      if (this.songsIDs[i] == songID) {
        this.currentSong.loadNewSong(this.songs[i])
        return
      }
    }
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
    this.setSongInfo()

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
    // returning before escaped char "^" back to "'"
    // var songName = songName.replace("^", "'")


    // /////////////////////////////////////////////////////
    // ADD SONG NAME????

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

  setSongInfo() {
    // load song info
    var songI = ""
    songI += '<div class="songI">'
    if (this.song.artists   !== '') { songI += '<div>' + this.song.artists    + '</div>'}
    if (this.song.language !== '') { songI += '<div>' + this.song.language  + '</div>'}
    if (this.song.tempo    !== '') { songI += '<div>' + this.song.tempo     + '</div>'}
    if (this.song.capo     !== '') { songI += '<div>' + this.song.capo      + '</div>'}
    if (this.song.key      !== '') { songI += '<div>' + this.song.key       + '</div>'}
    songI += '</div>'
    this.songInfoBar.innerHTML = songI
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

var  plJSON            = {}
var  loadedSongs       = {}
var  currentPlaylist


window.onload = function() {
  var PLbar        = new PlayListBar()
  var currentSong  = new CurrentSong()
  var LSL          = new LoadedSongsList(currentSong)
  var playlistList = new PlaylistList(LSL, PLbar)

  // var songsList       = document.getElementById('songsList');
  var playlistSelect = document.getElementById("playList")

  // top bar BTNs
  var foldParBTN = document.getElementById("foldParBTN")
  var chordsOnBTN = document.getElementById("chordsOnBTN")
  foldParBTN.addEventListener("click", function(){currentSong.foldParToggle()})
  chordsOnBTN.addEventListener("click", function(){currentSong.chordsToggle()})



  playlistSelect.addEventListener("change", function() {
    var value = playlistSelect.value
    var text = playlistSelect.options[playlistSelect.selectedIndex].text
    // give value and option text <option value="00001">text</option>
    currentPlaylist = new ActivePlaylist(value, text, LSL, PLbar)

    setTimeout(function(){
      var ID = currentPlaylist.songsIDs[0]
      currentSong.setSong(LSL.displaySong(ID))
      // this time is here so currentPlaylist can load before I'll be loading informations from it
    },200)

  })

  // set newSongForm display none
  newSongFormToogle()

  // set Cookie if not yet
  if (getCookie("chordsON") == "") {
    setCookie("chordsON", true, 2)
  }
  if (getCookie("foldPar") == "") {
    setCookie("foldPar", false, 2);
  }

  document.body.addEventListener("click", function(event) {
    var menuBar = document.getElementById("menu")
    var menuList = document.getElementById("menuList")
    var foldMenuBTN = document.getElementById("foldMenuBTN")

    if (menuBar.contains(event.target) || menuList.contains(event.target)) {
        // clicked inside
      // foldMenu(false)
    } else {
      foldMenu(true)
    }
  })

  window.addEventListener("resize", function() {
    var width = window.innerWidth
    if (width > 800) {
      foldMenu(true)
    } else {
      foldMenu(true)
    }
  })

}

function foldMenu(defaultDisplay) {

  var menuList = document.getElementById("menuList")

  // default display
  if (defaultDisplay && window.innerWidth > 800) {
    menuList.style.display = "inline-block"
    return
  } else if (defaultDisplay) {
    menuList.style.display = "none"
    return
  }


  if (menuList.style.display === "none" || menuList.style.display == "") {
    menuList.style.display = "block"
  } else {
    menuList.style.display = "none"
  }
}

// show/hide newSongForm
function newSongFormToogle() {
  var NSF = document.getElementById("suggestNS")
  var NSTransparrent = document.getElementById("transparentPage")
  if (NSF.style.display === "none") {
    NSF.style.display = "block"
    NSTransparrent.style.display = "block"
    document.getElementById("newSong").select()
    // NSTransparrent.addEventListener("click", newSongFormToogle())

  } else {
    NSF.style.display = "none"
    NSTransparrent.style.display = "none"
    document.getElementById("playList").focus()
    // NSTransparrent.removeEventListener("click", newSongFormToogle())
  }
}

// setCookie is function that create/set cookie with given name, value and days to expire
function setCookie(name, value, exdays) {
  var t = new Date();
  t.setTime(t.getTime() + (exdays*24*60*60*1000));
  var expires = "expires" + t.toUTCString();
  document.cookie = name + "=" + value + ";" + expires;
}

// getCookie is function that return value of named cookie
// if cookie is not set yet, it returns ""
function getCookie(name) {
  var name = name + "=";
  var decodeCookie = decodeURIComponent(document.cookie);
  var ca = decodeCookie.split(';');
  for (var i=0; i<ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      var cookieValue = c.substring(name.length, c.length)
      if (cookieValue == "true") {return true}
      if (cookieValue == "false") {return false}
    }
  }
  return "";
}


// LIBRARY >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>


// moveElement is function which moves element from current position to new position
// move horizontaly and verticaly, if newX or newY is set to false, it won't move in this direction
// duration is time in miliseconds how long should element move
// when done, it will run given function if some
function moveElement(element, newX, newY, increment, funcToRunAfter) {
  var currentX = element.offsetLeft;
  var currentY = element.offsetTop;

  if (typeof(newX) != "number") { newX = currentX}
  if (typeof(newY) != "number") { newY = currentY}

  var difX = currentX - newX;
  var difY = currentY - newY;

  // if currentX position is same as newX position
  if (difX == 0 && difY == 0) {return}

  var totalDistance = Math.sqrt(difX * difX + difY * difY)
  var theta = angle(currentX, newX, currentY, newY)
  var dy = Math.sin(theta)*increment, dx = Math.cos(theta)*increment
  var distance = 0

  move()
  // repete function move step by step till currentX != newX
  function move() {
    distance += increment
    // if element is not at new position, do another step
    if (distance >= totalDistance) {
      element.style.left = newX + "px";
      element.style.top = newY + "px";
      if(typeof funcToRunAfter === "function") {
        funcToRunAfter()
      }
      return 1
    }

    setTimeout(function() {
      // move element by difference
      currentX += dx;
      currentY += dy;

      // set new position
      element.style.left = Math.floor(currentX) + "px";
      element.style.top = Math.floor(currentY) + "px";
      move()
    }, 10);
  }
}

// calculate angle between two points
function angle(x1, x2, y1, y2) {
  var dx = x2 - x1;
  var dy = y2 - y1;
  var theta = Math.atan2(dy, dx); // range (-PI, PI]
  return theta;
}
