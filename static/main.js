var app = angular.module('songsApp', []);

app.filter("unsafe", function($sce) {
  return function(val) {
    return $sce.trustAsHtml(val)
  }
})
app.directive("paragraph", function($compile) {
  return {
    scope: {
      chordsOff: "=",
      parText: "="
    },
    // template: "<div></div>",
    replace: true,
    // restrict: 'E',
    link: function(scope, element, attrs) {
      element.append(scope.parText);
      $compile(element.contents())(scope);
    }
  }
})

app.run(function($http, $rootScope, $compile){
  $rootScope.PlList   = null;
  $rootScope.LoadedSongs = new LoadedSongsList();
  $rootScope.currentSong = null;
  $rootScope.chordsOff = true;
  $rootScope.parFold = false;
  $rootScope.suggestionON = false;

  // getPlaylists reach to server for playlists database and return promise
  $rootScope.getPlaylists = function(){
    // GET SONGS PLAYLISTS
    return $http.get("/SongsBook/playlistsJSON").then( function(response) {
      // Init playlist list
      $rootScope.PlList = response.data
      $rootScope.PlList.ActiveID = $rootScope.PlList[0].id
      $rootScope.PlList.ActivePL = $rootScope.PlList[0]
    });
  }

  // getSongs reach out to server to get songs and return promise
  $rootScope.getSongs = function(data){
    return $http({   // songs request
      method: "POST",
      url: "/SongsBook/songsJSON",
      headers: {"Content-type": "application/x-www-form-urlencoded"},
      data: data
    }).then(function(response1) {   // load songs contents
      for(let i in response1.data) {
        $rootScope.LoadedSongs.songs[i] = response1.data[i]
        $rootScope.LoadedSongs.parseSong(i)
      }
    })
  }
})

app.controller("songsCtrl", function($scope) {
  $scope.getPlaylists().then(function(){$scope.loadSongs();})

  // on change of select
  $scope.selectPlaylist = function() {
    $scope.PlList.ActivePL = $scope.PlList.find(pl => pl.id === $scope.PlList.ActiveID)
    $scope.loadSongs();
  }

  // function showSong change current song that is displayed in view
  $scope.showSong = function(songID) {
    $scope.currentSong = $scope.LoadedSongs.songs[songID]
    console.log($scope.currentSong)
  }

  // loadSongs
  $scope.loadSongs = function() {
    // get songs of playlist I just get from server
    let songsIDs = [];
    for(let i=0; i<$scope.PlList.ActivePL.songs.length; i++) {
      songsIDs.push($scope.PlList.ActivePL.songs[i].id)
    }
    songsIDs = $scope.LoadedSongs.songsToLoad(songsIDs)
    if(songsIDs.length == 0) {  // not anything to load. Set song and return
      let firstID = $scope.PlList.ActivePL.songs[0].id
      $scope.showSong(firstID);
      return;
    }

    // form data to be requested
    let data = "";
    for(let i=0; i<songsIDs.length; i++) {
      data += songsIDs[i] + ","
    }
    data = "songsIDs=" + data.substring(0, data.length-1)
    $scope.getSongs(data).then(function(){
      // Set first song to display (from loaded songs get song with ID of first song of Acrive playlist)
      let firstID = $scope.PlList.ActivePL.songs[0].id
      $scope.showSong(firstID);
    })
  }

  $scope.showChords = function() {
    if($scope.chordsOff) {
      $scope.chordsOff = false;
    } else {
      $scope.chordsOff = true;
    }
  }

  $scope.foldPar = function() {

  }

  $scope.showSuggestion = function(){
    if($scope.suggestionON) {
      $scope.suggestionON = false;
    } else {
      $scope.suggestionON = true;
    }
  }
})

window.onload = function() {
  // // var songsList       = document.getElementById('songsList');
  // var playlistSelect = document.getElementById("playList")
  //
  // // top bar BTNs
  // var foldParBTN = document.getElementById("foldParBTN")
  // var chordsOnBTN = document.getElementById("chordsOnBTN")
  // foldParBTN.addEventListener("click", function(){currentSong.foldParToggle()})
  // chordsOnBTN.addEventListener("click", function(){currentSong.chordsToggle()})
  //
  //
  // playlistSelect.addEventListener("change", function() {
  //   var value = playlistSelect.value
  //   var text = playlistSelect.options[playlistSelect.selectedIndex].text
  //   // give value and option text <option value="00001">text</option>
  //   currentPlaylist = new ActivePlaylist(value, text, LSL, PLbar)
  //
  //   setTimeout(function(){
  //     var ID = currentPlaylist.songsIDs[0]
  //     currentSong.setSong(LSL.displaySong(ID))
  //     // this time is here so currentPlaylist can load before I'll be loading informations from it
  //   },200)
  //
  // })

  // set newSongForm display none
  // newSongFormToogle()

  // set Cookie if not yet
  // if (getCookie("chordsON") == "") {
  //   setCookie("chordsON", true, 2)
  // }
  // if (getCookie("foldPar") == "") {
  //   setCookie("foldPar", false, 2);
  // }

  // document.body.addEventListener("click", function(event) {
  //   var menuBar = document.getElementById("menu")
  //   var menuList = document.getElementById("menuList")
  //   var foldMenuBTN = document.getElementById("foldMenuBTN")
  //
  //   if (menuBar.contains(event.target) || menuList.contains(event.target)) {
  //       // clicked inside
  //     // foldMenu(false)
  //   } else {
  //     foldMenu(true)
  //   }
  // })

  // window.addEventListener("resize", function() {
  //   var width = window.innerWidth
  //   if (width > 800) {
  //     foldMenu(true)
  //   } else {
  //     foldMenu(true)
  //   }
  // })

}
