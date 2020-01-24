package main

import (
	// "goServer/playlist"
	"./goServer/playlist"
	"./goServer/song"
	// "../../../../SERVER/02_songs-book/goServer/confLoader"
	// "../../www/songs-book/goServer/dbEngine"
	// "html/template"
	"log"
	"net/http"
	"strings"
	"os"
	// "fmt"
)

// var (
// 	tpl *template.Template
// )

// func init() {
// 	tpl = template.Must(template.ParseGlob("./templates/*.gohtml"))
//
	// update playListJSON file
	// playListJSON := playList.ConvertPlayListJSON("../data/play_lists", "../data/songs")
	// playList.SavePlayLists(playListJSON, "/home/moja/Programming/www/songs-book/static/plJSON.txt")
// }

func main() {

	http.Handle("/SongsBook/files/", http.StripPrefix("/SongsBook/files", http.FileServer(http.Dir("./static"))))
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request){
		http.ServeFile(w, r, "./index.html")
	})
	http.HandleFunc("/SongsBook/favicon.ico", ico)
	http.HandleFunc("/SongsBook/playlistsJSON", playlistsJSON)
	http.HandleFunc("/SongsBook/songsInPlaylistJSON", songsInPlaylistJSON)
	http.HandleFunc("/SongsBook/songsJSON", songsJSON)
	http.HandleFunc("/SongsBook/suggestNS", suggestNS)

	err := http.ListenAndServe(":8082", nil)
	if err != nil {
		log.Fatalln(err)
	}
}

func playlistsJSON(w http.ResponseWriter, req *http.Request) {
	PlList := playlist.ReturnPlaylistsJSON()
	PL_JSON := ""
	PL_JSON += "["
	for i:=0; i<len(PlList); i++ {
		// create playlist
		P := playlist.NewPlaylist("PlaylistToBeSent")

		// load playlist
		err := P.LoadByPlaylistID(PlList[i][0])
		if err != nil { log.Println(err) }

		// get JSON from playlist
		songsJSON, err := P.JSONPlaylistSongs()
		if err != nil { log.Println(err) }

		// get songs
		PL_JSON += "{\"id\": \"" + PlList[i][0] +  "\", \"name\":\"" +  PlList[i][1] +  "\", \"songs\":" + songsJSON + "},"
	}	// end of for loop of playlists

	// load CZ
	PCZ := playlist.NewPlaylist("PlaylistCZ")
	err := PCZ.LoadByHeader("language", "CZ")
	if err != nil { log.Println(err) }
	songsJSON_CZ, err := PCZ.JSONPlaylistSongs()
	if err != nil { log.Println(err) }

	PL_JSON += "{\"id\": \"99997\", \"name\":\"CZ ALL\", \"songs\":" + songsJSON_CZ + "},"

	// load EN
	PEN := playlist.NewPlaylist("PlaylistCZ")
	err = PEN.LoadByHeader("language", "CZ")
	if err != nil { log.Println(err) }
	songsJSON_EN, err := PEN.JSONPlaylistSongs()
	if err != nil { log.Println(err) }

	PL_JSON += "{\"id\": \"99998\", \"name\":\"EN ALL\", \"songs\":" + songsJSON_EN + "}]"


	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(PL_JSON))
	}


func songsInPlaylistJSON(w http.ResponseWriter, req *http.Request) {
	if req.Method != http.MethodPost {
		http.Error(w, "not method post", http.StatusSeeOther)
		return
	}
	req.ParseForm()
	playlistID := req.FormValue("playlistID")
	P := playlist.NewPlaylist("PlaylistToBeSent")


	if playlistID == "99997" {													// I want playlist by CZ
		err := P.LoadByHeader("language", "CZ")
		if err != nil {
			log.Println(err)
		}
	} else if playlistID == "99998" {													// I want playlist by CZ
		err := P.LoadByHeader("language", "EN")
		if err != nil {
			log.Println(err)
		}
	} else {																									// Playlist By ID
		err := P.LoadByPlaylistID(playlistID)
		if err != nil {
			log.Println(err)
		}
	}

	plsJSON, err := P.JSONPlaylistSongs()
	if err != nil {
		log.Println(err)
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(plsJSON))
}

//
// GETsongs is function that send songs listed in URL variable back in form of JSON format
func songsJSON(w http.ResponseWriter, req *http.Request) {

	// read array from POST
	if req.Method != http.MethodPost {
		http.Error(w, "not method post", http.StatusSeeOther)
		log.Println("not post")
		return
	}
	songsIDs := req.FormValue("songsIDs")
	if songsIDs == "" {
		return
	}
	songsIDsSlice := strings.Split(songsIDs, ",")

	// change name to dir string
	songsJSON := song.SendSongs(songsIDsSlice ...)

	// send response
	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(songsJSON))
}

func suggestNS(w http.ResponseWriter, req *http.Request) {

	// is method POST?
	if req.Method != http.MethodPost {
		http.Error(w, "not method post", http.StatusSeeOther)
		return
	}

	// does input contrain unallowed characters?
	if strings.ContainsAny(req.FormValue("newSong"), "\n;\"") {
		http.Error(w, "contains non allowed characters", http.StatusSeeOther)
		return
	}

	// is input too long?
	if len(req.FormValue("newSong")) > 200 {
		http.Error(w, "too long input", http.StatusSeeOther)
		return
	}

	// open file
	f, err := os.OpenFile("/home/moja/Programming/www/songs-book/data/suggestions.txt", os.O_APPEND|os.O_WRONLY, 0644)
	if err != nil {
		http.Error(w, "unable to open file for your suggestion", http.StatusSeeOther)
	}
	defer f.Close()

	// write suggestion
	suggestion := req.FormValue("newSong") + "\n"
	_, err = f.WriteString(suggestion)
	if err != nil {
		http.Error(w, "unable to write your suggestion to a file", http.StatusSeeOther)
	}


	http.Redirect(w, req, "/Vocabulary/", http.StatusSeeOther)
}


func ico(w http.ResponseWriter, req *http.Request) {
	http.ServeFile(w, req, "./static/img/note.png")
}

// func index(w http.ResponseWriter, req *http.Request) {
//
// 	err := tpl.ExecuteTemplate(w, "index.gohtml", nil)
// 	if err != nil {
// 		log.Fatalln(err)
// 	}
// }
