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

// class PlaylistList {
//
//   constructor(LoadedSongsList, PLbar, plJSON) {
//     this.PLbar = PLbar
//     this.plJSON = plJSON
//     this.PlaylistNames = []
//     this.PlaylistIDs = []
//     this.playlistSelect = document.getElementById("playList")
//     this.LoadedSongsList = LoadedSongsList
//     this.currentSong = LoadedSongsList.currentSong
//     this.sendAJAX()
//   }

  // sendAJAX() {
  //   var self = this
  //
  //   // loadPlayLists function get address, send request and ger
  //   var addr = "/SongsBook/playlistsJSON"
  //   var http = new XMLHttpRequest();
  //   http.open('POST', addr)
  //   http.onload = function() {
  //     self.plJSON = JSON.parse(http.responseText);
  //     self.loadPlaylists(this.plJSON)
  //   }
  //   http.send();
  // }

  // loadPlaylists(plJSON) {
  //   for (var i=0; i<this.plJSON.length; i++) {
  //     this.PlaylistIDs.push(this.plJSON[i][0])
  //     this.PlaylistNames.push(this.plJSON[i][1])
  //   }
  //   this.setPlaylistBar()
  //   this.setFirstPlaylist()
  // }

  // setPlaylistBar() {
  //   var newSongs = "";
  //   var plOptions = "";
  //
  //   for (var i=0; i<this.PlaylistNames.length; i++) {
  //     if (this.PlaylistNames[i] == "New Songs") {
  //       newSongs += "<option value='" + this.PlaylistIDs[i] + "'>" + this.PlaylistNames[i] + "</ option>"
  //     } else {
  //       plOptions += "<option value='" + this.PlaylistIDs[i] + "'>" + this.PlaylistNames[i] + "</ option>"
  //     }
  //   }
  //
  //   plOptions = newSongs + plOptions;
  //   this.playlistSelect.innerHTML = plOptions;
  // }

  // setFirstPlaylist() {
  //   var value = this.playlistSelect.value
  //   var index = this.playlistSelect.selectedIndex
  //   var text = this.playlistSelect.options[index].text
  //   currentPlaylist = new ActivePlaylist(value, text, this.LoadedSongsList, this.PLbar)
  //   setTimeout(function(){
  //     var ID = this.currentPlaylist.songsIDs[0]
  //     this.currentPlaylist.displaySong(this.currentPlaylist.songsIDs[0])
  //     // this time is here so currentPlaylist can load before I'll be loading informations from it
  //   },100)
  // }
// }

class allSongs{

}

// class Song {
//   constructor(){
//
//   }
//   loadSong(songJSON)
// }

// class Playlist {
//   constructor(id, name){
//
//   }
//   addSong(id, name){
//
//   }
//   loadSong(id, name, songJSON){
//
//   }
//   label:
//   value:
//   songs:[
//     {
//     name:
//     id:
//   },
//   ]
// }

// PlList{
//   lists: [Playlist]
// }

class PlList {
  constructor() {
    this.playlists = [] // object of id name songs[id name]
    this.ActivePlaylist = null
  }

  // songsInPL() {
  //   for(let i=0; i<this.playlists.length; i++){
  //     console.log(this.playlists[i])
  //   }
  // }

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
    http.setRequestHeader("Content-type", "application/x-www-form-urlencoded")
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
