function hasSomeParentTheClass(element, classname) {
  if(element.className !== undefined){
    if(element.className.split(' ').indexOf(classname)>=0) return true;
  }
  if(element.parentNode === null){return false}
  return element.parentNode && hasSomeParentTheClass(element.parentNode, classname);
}

var app = angular.module('songsApp', ['ngAnimate']);

app.directive("paragraphs", function($compile) {
  return {
    scope: {
      chordsOff: "=",
      songObject: "=",
      parFold: "=",
    },
    template: '<div></div>',
    replace: false,
    restrict: 'A',
    link: function(scope, element, attr) {
      scope.$watch("songObject", function(){
        if(scope.songObject === null){return} // if songs are not loaded yet
        let HTMLstring = ''
        let alreadyIN = []
        for(let i=0; i<scope.songObject.ParagraphsOrder.length; i++){
          let par = scope.songObject.ParagraphsOrder[i]
          let parFold = alreadyIN.includes(par)
          alreadyIN.push(par)

          HTMLstring += '\n\n<div class="parContainer">\n\t<div class="parName">' + par + ':</div>'
          HTMLstring += '\n\t<div class="paragraph"'
          if(parFold){
            HTMLstring += '\n\t ng-show="parFold" ' + scope.songObject.Paragraphs[par]
          }else{
            HTMLstring += scope.songObject.Paragraphs[par]
          }
          HTMLstring += '\n\t</div>\n</div>'

        }
        HTMLstring += '</div>'
        element.empty()
        element.append(HTMLstring);
        for(let i=0; i<element[0].children.length; i++){
          if(element[0].children[i].children[1].attributes['ng-class'].value.length == 38){  // does the paragraph element contain chord? - false is longer then true
            element[0].children[i].setAttribute('ng-class',"{'parContainerChords':!chordsOff}")
          }
        }
        $compile(element.contents())(scope);
      })
    }
  }
})

app.run(function($http, $rootScope, $compile, $window, $document){
  $rootScope.PlList   = null;
  $rootScope.LoadedSongs = new LoadedSongsList();
  $rootScope.currentSong = null;
  $rootScope.chordsOff = true;
  $rootScope.parFold = true;
  $rootScope.suggestionON = false;
  $rootScope.menuOn = true;
  $rootScope.tablet = $window.innerWidth < 1000;
  $rootScope.mobile = $window.innerWidth < 800;
  $rootScope.songsListOff = $rootScope.tablet ? true : false
  $rootScope.playlistsOff = true;

  angular.element($window).bind('resize', function(){
    $rootScope.tablet = $window.innerWidth < 1000;
    $rootScope.mobile = $window.innerWidth < 800;
    $rootScope.$apply()
  })


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
  $rootScope.getSongs = function(data) {
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

app.controller("songsCtrl", function($scope, $document) {

  angular.element($document).bind('click', function(event){
    let parentIsSideListBlock = hasSomeParentTheClass(event.target.parentNode, 'sideListBlock');
    let parentIsMenu1 = hasSomeParentTheClass(event.target.parentNode, 'menuList1');

    if(!parentIsSideListBlock && !parentIsMenu1 && $scope.tablet) {
      $scope.songsListOff = true;
      $scope.playlistsOff = true;
    }
    $scope.$apply()
  })
  $scope.getPlaylists().then(function(){$scope.loadSongs();})

  // on change of select
  $scope.selectPlaylist = function(ID) {
    $scope.PlList.ActivePL = $scope.PlList.find(pl => pl.id === ID)
    $scope.loadSongs();
    $scope.playlistsOff = true
  }

  // function showSong change current song that is displayed in view
  $scope.showSong = function(songID) {
    $scope.currentSong = $scope.LoadedSongs.songs[songID]
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

  // getNextSong/getSongBefore
  $scope.nextSong = function(next) {
    let currentSongId = ""
    // find current song ID in all loaded songs
    for(let song in $scope.LoadedSongs.songs){
      if($scope.LoadedSongs.songs[song].Title === $scope.currentSong.Title) {
        currentSongId = song
        break;
      }
    }

    // find next ID from current playlist (with indexes, ...)
    let nSongs = $scope.PlList.ActivePL.songs.length;
    let iCurrent = $scope.PlList.ActivePL.songs.findIndex(pl => pl.id === currentSongId)
    let iNext = next ? 1+iCurrent : iCurrent-1
    iNext = ((iNext % nSongs) + nSongs) % nSongs;

    // set new current song
    let nextID = $scope.PlList.ActivePL.songs[iNext].id
    $scope.currentSong = $scope.LoadedSongs.songs[nextID]

  }

  $scope.songsBarToogle = function(button) {
    $scope.songsListOff = !$scope.songsListOff
    if(button && $scope.tablet && !$scope.playlistsOff){
      $scope.playlistsOff = true
    }
  }

  $scope.playlistBarToogle = function(button) {
    $scope.playlistsOff = !$scope.playlistsOff
    if(button && $scope.tablet && !$scope.songsListOff){
      $scope.songsListOff = true
    }
  }
})
