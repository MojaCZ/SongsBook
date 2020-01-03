package main
// go run addToPlaylist.go TITLE PLAYLIST

import (
  "fmt"
  // "log"
  "os"
  "./goServer/confLoader"
  "./goServer/dbEngine"
  "./goServer/library"
)

func main() {
  // load main function arguments
  if len(os.Args) != 3 {
    fmt.Println("Need 6 flags!!!")
    os.Exit(1)
  }
  songTitle := os.Args[1]
  playlistName := os.Args[2]

  fmt.Println("CONNECTING SONG TO PLAYLIST>>>>>>>>>>>>>>>>>>>>>>>")
  fmt.Printf("connecting:\t%s to %s\n", songTitle, playlistName)

  // Get database files names from .conf file
  C := confLoader.NewConfiguration("./data/dbConfig.conf")
  songsDB,_ := C.GetVariable("songs")
  playlistDB, _ := C.GetVariable("playlists")
  song_playlistDB, _ := C.GetVariable("song_playlist")
  fmt.Println("Database configurated")

  STable, err := dbEngine.NewTable(songsDB, "songs", "songID", "title", "language", "key", "capo", "tact", "tempo")
  if err != nil { fmt.Println(err) }
  PlaylistTable, err := dbEngine.NewTable(playlistDB, "languages", "playlistID", "playlist")
  if err != nil { fmt.Println(err) }
  song_playlistTable, err := dbEngine.NewTable(song_playlistDB, "song_playlist", "songID", "playlistID")
  if err != nil { fmt.Println(err) }

  songID := ""
  playlistID := ""

  // check if song Title exists
  findSong, _ := STable.InTableFind("title", songTitle, "songID" , false)
  if len(findSong) == 0 {
    fmt.Println("HEY, I DONT KNOW THIS SONG, ARE YOU KIDDING ME?!!!")
    os.Exit(1)
  }
  songID = findSong[0]

  // check if Playlist exists
  findPlaylist, _ := PlaylistTable.InTableFind("playlist", playlistName, "playlistID" , false)
  if len(findPlaylist) == 0 {
    fmt.Println("NOPE, NO SUCH PLAYLIST HERE!!!")
    os.Exit(1)
  }
  playlistID = findPlaylist[0]

  // check if connectino exists!!!
  // get list of songsID of current playlistID
  findSongsByPlaylist, _ := song_playlistTable.InTableFind("playlistID", playlistID, "songID" , true)
  for i:=0; i<len(findSongsByPlaylist); i++ {
    if songID == findSongsByPlaylist[i] {
      fmt.Println("OOU, this song is already included in this playlist!!!")
      os.Exit(1)
    }
  }
  // check if there is at last one match

  library.Connect(song_playlistDB, songID, playlistID)
  fmt.Printf("Connection created:\n\t%s\t%s\n\t%s\t%s\n", songTitle, playlistName, songID, playlistID)
  fmt.Println("\n\nALL DONE, CONGRATULATIONS")
}
