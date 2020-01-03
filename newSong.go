// PROGRAM TO CREATE NEW SONG
package main
// go run newSong.go TITLE ARTIST LANGUAGE KEY CAPO TACT TEMPO

import (
	// "./goServer/song"
	// "log"
	"fmt"
	"os"
	"./goServer/confLoader"
	"./goServer/dbEngine"
	"./goServer/library"
)

func main() {
	// load main function arguments
	if len(os.Args) != 8 {
		fmt.Println("Need 7 arguments!!!")
		os.Exit(1)
	}

	newSongTitle := os.Args[1]
	newSongArtist := os.Args[2]
	newSongLanguage := os.Args[3]
	newSongKey := os.Args[4]
	newSongCapo := os.Args[5]
	newSongTact := os.Args[6]
	newSongTempo := os.Args[7]

	fmt.Println("ADDING NEW SONG>>>>>>>>>>>>>>>>>>>>>>>")

	// Get database files names from .conf file
	C := confLoader.NewConfiguration("./data/dbConfig.conf")
	artistsDB,_ := C.GetVariable("artists")
	languagesDB,_ := C.GetVariable("languages")
	song_artistDB,_ := C.GetVariable("song_artist")
	// song_languageDB,_ := C.GetVariable("song_language")
	songsDB,_ := C.GetVariable("songs")
	songsFiles,_ := C.GetVariable("songsFiles")
	fmt.Println("Database configurated")

	// Load database engines
	STable, err := dbEngine.NewTable(songsDB, "songs", "songID", "title", "language", "key", "capo", "tact", "tempo")
	if err != nil { fmt.Println(err) }
	languagesTable, err := dbEngine.NewTable(languagesDB, "languages", "languageID", "language")
	if err != nil { fmt.Println(err) }
	artistsTable, err := dbEngine.NewTable(artistsDB, "artists", "artistID", "artist")
	if err != nil { fmt.Println(err) }
	// song_artistTable, err := dbEngine.NewTable(song_artistDB, "song_artist", "songID", "artistID")
	// if err != nil { fmt.Println(err) }

	songID := ""
	artistID := ""
	languageID := ""

	// check if song Title exists
	findSong, _ := STable.InTableFind("title", newSongTitle, "songID" , false)
	if len(findSong) != 0 {
		fmt.Println("HEY, I KNOW THIS SONG, TRY NEW ONE!!!")
		os.Exit(1)
	}

	// check if artist exists
	findArtist, _ := artistsTable.InTableFind("artist", newSongArtist, "artistID", false)
	if len(findArtist) == 0 {
		fmt.Println("HMMMM, I DONT KNOW THIS ARTIST, I'LL HAVE TO ADD IT TO MY DATABASE!!!")
		artistID = library.NewDBLine(artistsDB, newSongArtist)
	} else {
		artistID = findArtist[0]
	}
	// check if language exists
	findLanguage, _ := languagesTable.InTableFind("language", newSongLanguage, "languageID", false)
	if len(findLanguage) == 0 {
		fmt.Println("HMMMM, I DONT KNOW THIS LANGUAGE, I'LL HAVE TO ADD IT TO MY DATABASE!!!")
		languageID = library.NewDBLine(languagesDB, newSongLanguage)
	} else {
		languageID = findLanguage[0]
	}

	fmt.Printf("NEW SONG HEADER:\n title:\t%s\nsong artist:\t%s\nsong language:\t%s\nsong key:\t%s\nsong capo:\t%s\nsong tact:\t%s\nsong tempo:\t%s\n\n\n", newSongTitle, newSongArtist, newSongLanguage, newSongKey, newSongCapo, newSongTact, newSongTempo)
	songID = library.CreateSong(songsDB, songsFiles, newSongTitle, languageID, newSongKey, newSongCapo, newSongTact, newSongTempo)

	library.Connect(song_artistDB, songID, artistID)

	fmt.Printf("SONG ID IS: %s\t%s\n", songID, newSongTitle)
	fmt.Printf("ARTIST ID IS: %s\t%s\n", artistID, newSongArtist)
	fmt.Printf("LANGUAGE ID IS: %s\t%s\n", languageID, newSongLanguage)
	fmt.Printf("CREATING ONNECTION OF SONG AND ARTIST: %s\t%s\n", songID, artistID)
	fmt.Println("\n\nALL DONE, CONGRATULATIONS")

}
