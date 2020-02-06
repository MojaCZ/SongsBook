


















function foldMenu(defaultDisplay) {

  let menuList = document.getElementById("menuList")

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
// function newSongFormToogle() {
//   var NSF = document.getElementById("suggestNS")
//   var NSTransparrent = document.getElementById("transparentPage")
//   if (NSF.style.display === "none") {
//     NSF.style.display = "block"
//     NSTransparrent.style.display = "block"
//     document.getElementById("newSong").select()
//     // NSTransparrent.addEventListener("click", newSongFormToogle())
//
//   } else {
//     NSF.style.display = "none"
//     NSTransparrent.style.display = "none"
//     document.getElementById("playList").focus()
//     // NSTransparrent.removeEventListener("click", newSongFormToogle())
//   }
// }

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
