package playlist

import (
	"fmt"
	"log"
	"../confLoader"
	"../dbEngine"
	"errors"
)

var (
	playlistDB      string
	artistsDB       string
	languagesDB     string
	song_artistDB   string
	song_languageDB string
	song_playlistDB string
	songsDB         string
)

func init() {
	C := confLoader.NewConfiguration("./data/dbConfig.conf")
	playlistDB, _ = C.GetVariable("playlists")
	artistsDB, _ = C.GetVariable("artists")
	languagesDB, _ = C.GetVariable("languages")
	song_artistDB, _ = C.GetVariable("song_artist")
	song_languageDB, _ = C.GetVariable("song_language")
	songsDB, _ = C.GetVariable("songs")
	song_playlistDB, _ = C.GetVariable("song_playlist")
	// log.Println("playlist dbConfig configurated")
}

func ReturnPlaylistsJSON() ([][]string) {
	playlistTable, err := dbEngine.NewTable(playlistDB, "playlists", "songID", "playlistID")
	if err != nil {
		log.Print(err)
	}
	return playlistTable.GiveAll()
	// playlists += "["
	// for i:=0; i<len(ID_Name); i++ {
	// 	playlists += "{\"id\": \"" + ID_Name[i][0] +  "\", \"name\":\"" +  ID_Name[i][1] +  "\"},"
	// }
	// playlists += "{\"id\":\"99997\", \"name\":\"CZ ALL\"},"
	// playlists += "{\"id\":\"99998\", \"name\":\"EN ALL\"},"
	// playlists += "{\"id\":\"99999\", \"name\":\"ALL SONGS\"},"
	// playlists = playlists[:len(playlists)-1]
	// playlists += "]"
	// return playlists
}

// PlayList is interface that implements all types with methods SongsDir() and SongsNames()
type playlist struct {
	playlistName     string
	playlistID       string
	songsIDs         []string
	songsNames       []string
	songsInitialized bool
}

func NewPlaylist(name string) (P *playlist) {
	P = new(playlist)
	P.playlistName = name
	return P
}

// loadHeader makes playlist from songs headers
// parameter: "title", "language", "key", "kapo", "tact", "tempo", "artists"
func (P *playlist) LoadByHeader(parameter string, values ...string) (err error) {
	// are songs of playlist already initialized???
	if P.songsInitialized {
		errString := "songs of playlist are already initialized"
		return errors.New(errString)
	}
	// database table
	S, err := dbEngine.NewTable(songsDB, "songsDB", "songID", "title", "language", "key", "kapo", "tact", "tempo")
	if err != nil {
		log.Println(err)
	}

	var songsIDs []string
	var songsNames []string

	// for artists same as for languages (maybe create function for this, at least for comparing slices for multiple songsIDs)
	if parameter == "title" || parameter == "key" || parameter == "kapo" || parameter == "tact" || parameter == "tempo" {
		// loop through wanted values
		for i := 0; i < len(values); i++ {
			IDs, err := S.InTableFind(parameter, values[i], "songID", true)
			if err != nil {
				log.Println(err)
			}
			Names, err := S.InTableFind(parameter, values[i], "title", true)
			if err != nil {
				log.Println(err)
			}
			songsIDs = append(songsIDs, IDs...)
			songsNames = append(songsNames, Names...)
		}


	} else if parameter == "language" {			// do I want to find languages?
		var languagesIDs []string
		languagesTable, err := dbEngine.NewTable(languagesDB, "languagesDB", "languageID", "language")
		if err != nil {
			log.Print(err)
		}

		// for each wanted language, get language ID from languagesDB table
		for i := 0; i < len(values); i++ {
			IDs, err := languagesTable.InTableFind("language", values[i], "languageID", false)
			if err != nil {
				log.Print(err)
			}
			languagesIDs = append(languagesIDs, IDs[0])
		}

		// get languageID of each language and find in songsDB which songs language parameters is equal
		for i := 0; i < len(languagesIDs); i++ {
			// get IDs of songs
			IDs, err := S.InTableFind("language", languagesIDs[i], "songID", true)
			if err != nil {
				log.Print(err)
			}
			// get Names of songs
			Names, err := S.InTableFind("language", languagesIDs[i], "title", true)
			if err != nil {
				log.Print(err)
			}

			songsIDs = append(songsIDs, IDs...)
			songsNames = append(songsNames, Names...)
		}


	} else if parameter == "artists" {		// do I want to find songs by artist?
		artistsTable, err := dbEngine.NewTable(artistsDB, "artistsDB", "artistID", "artistName")
		if err != nil {
			log.Print(err)
		}
		log.Print(song_artistDB)
		song_artistTable, err := dbEngine.NewTable(song_artistDB, "song_artist", "songID", "artistID")
		if err != nil {
			log.Print(err)
		}
		// loop values (given artists)
		for i := 0; i < len(values); i++ {
			artistID, err := artistsTable.InTableFind("artistName", values[i], "artistID", false)
			if err != nil {
				log.Print(err)
			}

			// there is none artist of this name in database
			if len(artistID) != 1 {
				continue
			}

			// find songsIDs by artistsIDs in table song_artistTable
			IDs, err := song_artistTable.InTableFind("artistID", artistID[0], "songID", true)
			if err != nil {
				log.Print(err)
			}
			songsIDs = append(songsIDs, IDs...)
		}

		// check for repeated songs (one song can be returned multiple times from multiple artists)
		songsIDs = checkForDuplication(songsIDs)

		// find titles of songs
		for i := 0; i < len(songsIDs); i++ {
			Name, err := S.InTableFind("songID", songsIDs[i], "title", false)
			if err != nil {
				log.Print(err)
			}
			songsNames = append(songsNames, Name[0])

		}

		// parameter not in header
	} else {
		errString := "given parameter isnt in songs header"
		return errors.New(errString)
	}

	if len(songsIDs) != len(songsNames) {
		return errors.New("len of songsIDs is not equal the name of songsNames in playList package in loadHeader")
	}
	// fill in structure
	P.songsIDs = songsIDs
	P.songsNames = songsNames
	P.songsInitialized = true
	return nil
}

func (P *playlist) LoadByPlaylistID(playlistID string) (err error) {
	var songsIDs []string
	var songsNames []string

	// init database tables
	song_playlistTable, err := dbEngine.NewTable(song_playlistDB, "song_playlist", "songID", "playlistID")
	if err != nil {
		log.Print(err)
	}
	songsTable, err := dbEngine.NewTable(songsDB, "songs", "songID", "title", "language", "key", "kapo", "tact", "tempo")
	if err != nil {
		log.Print(err)
	}

	songsIDs, err = song_playlistTable.InTableFind("playlistID", playlistID, "songID", true)
	if err != nil {
		log.Print(err)
	}

	// loop through songsIDs and find names
	for i := 0; i < len(songsIDs); i++ {
		songName, err := songsTable.InTableFind("songID", songsIDs[i], "title", false)
		if err != nil {
			log.Print(err)
		}
		songsNames = append(songsNames, songName[0])
	}

	// len of IDs is not equal to len of Names
	if len(songsIDs) != len(songsNames) {
		return errors.New("in playlist by playlistID, len of songsIDs is not equal to songsNames")
	}

	// fill in structure
	P.songsIDs = songsIDs
	P.songsNames = songsNames
	P.songsInitialized = true
	P.playlistID = playlistID
	return nil
}

func (P *playlist) LoadByPlaylistName(playListName string) (err error) {

	// init database tables
	playlistTable, err := dbEngine.NewTable(playlistDB, "playlist", "playlistID", "playlistName")
	if err != nil {
		log.Print(err)
	}

	playlistID, err := playlistTable.InTableFind("playlistName", playListName, "playlistID", false)
	if err != nil {
		log.Print(err)
	}

	err = P.LoadByPlaylistID(playlistID[0])

	return err
}

func (P playlist) PrintPlaylist() {
	if !P.songsInitialized {
		fmt.Println("playlist not initialized yet, use any LoadBy... method")
		return
	}
	fmt.Println(P.playlistName, " - ", P.playlistID, "\n>>>>>>>>>>>>>>>>>>>>>>>>")
	fmt.Println(P.songsIDs)
	fmt.Println(P.songsNames)
}

// FormatSong format ONE playlist in string and return it
func (P playlist) JSONPlaylistSongs() (plsJSON string, err error) {
	if !P.songsInitialized {
		return "", errors.New("playlist not initialized yet, use any LoadBy... method")
	}
	if len(P.songsIDs)<1 {
		return "", errors.New("playlist is empty")
	}

	plsJSON += "[\n"
	for i := 0; i < len(P.songsIDs); i++ {
		plsJSON += "\t{\"id\":\"" + P.songsIDs[i] + "\",\n\t\"name\":\"" + P.songsNames[i] + "\"}, \n"
	}
	plsJSON = plsJSON[:len(plsJSON)-3]
	plsJSON += " \n]\n"

	return plsJSON, nil
}

func checkForDuplication(ss []string) []string {
	for i := 0; i < len(ss); i++ {
		for j := i + 1; j < len(ss); j++ {
			if ss[i] == ss[j] {
				ss = append(ss[:(j)], ss[(j+1):]...)
			}
		}
		// I resized array, need to check condition
		if i >= len(ss) {
			break
		}
	}
	return ss
}
