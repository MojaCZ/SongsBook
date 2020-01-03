package song

import (
	"bufio"
	// "fmt"
	"strings"
	// "strconv"
	// "errors"
	"encoding/json"
	"log"
	"os"
	"../confLoader"
	"../dbEngine"
)

var (
	artistsDB string
	languagesDB string
	song_artistDB string
	// song_languageDB string
	songsDB string
	songsFiles string
)

func init() {
	C := confLoader.NewConfiguration("./data/dbConfig.conf")
	artistsDB,_ = C.GetVariable("artists")
	languagesDB,_ = C.GetVariable("languages")
	song_artistDB,_ = C.GetVariable("song_artist")
	// song_languageDB,_ = C.GetVariable("song_language")
	songsDB,_ = C.GetVariable("songs")
	songsFiles,_ = C.GetVariable("songsFiles")
	// log.Println("song dbConfig configurated")
}

// Song is type implementing Header and Text
type song struct {
	songID	string

	// HEADER
	// SongHeader represent informations datastructure about one song.
	title    string
	artist   string
	language string
	key      string
	capo     string
	tact     string
	tempo    string

	// SONG TEXT
	// Text store lyrics and chords of song
	// To provide paragraph I can give to Paragraphs map key from ParList

	// order of paragraphs, if repetition just multiple list elements
	parList []string

	// All paragraphs non order, non repetition
	paragraphs map[string]string
}

// NewSong method MUST be run before all other methods
// it is "constructor" of a Song struct
// EXAMPLE: 	S := song.NewSong("../data/songs/Buráky.txt")
// 						fmt.Println("STRUCT song:\n", S)
func NewSong(songID string) *song {
	S := new(song)
	S.songID = songID
	err := S.LoadHeader()
	if err != nil {
		log.Fatalln(err)
	}
	S.LoadText()
	return S
}

// LoadHeader is method of SongHeader type
// it takes directory of song file, call function readSongFile and save header
// add returne error if title is blank
// MUST run InitSong first
func (S *song) LoadHeader() (err error) {
	STable, err := dbEngine.NewTable(songsDB, S.songID, "songID", "title", "language", "key", "capo", "tact", "tempo")
	if err != nil { return err }
	languagesTable, err := dbEngine.NewTable(languagesDB, "languages", "languageID", "language")
	if err != nil { return err }
	artistsTable, err := dbEngine.NewTable(artistsDB, "artists", "artistID", "artist")
	if err != nil { return err }
	song_artistTable, err := dbEngine.NewTable(song_artistDB, "song_artist", "songID", "artistID")
	if err != nil { return err }

	title, err := STable.InTableFind("songID", S.songID, "title", false)
	S.title = title[0]
	if err != nil {return err}

	key, err := STable.InTableFind("songID", S.songID, "key", false)
	if err != nil {return err}
	S.key = key[0]

	capo, err := STable.InTableFind("songID", S.songID, "capo", false)
	if err != nil {return err}
	S.capo = capo[0]

	tact, err := STable.InTableFind("songID", S.songID, "tact", false)
	if err != nil {return err}
	S.tact = tact[0]

	tempo, err := STable.InTableFind("songID", S.songID, "tempo", false)
	if err != nil {return err}
	S.tempo = tempo[0]

	language, err := STable.InTableFind("songID", S.songID, "language", false)
	if err != nil {return err}
	language, err = languagesTable.InTableFind("languageID", language[0],"language", false)
	if err != nil {return err}
	S.language = language[0]


	artistsID, err := song_artistTable.InTableFind("songID", S.songID, "artistID", true)
	if err != nil {return nil	}
	var artists string
	for i:=0; i<len(artistsID); i++ {
		artistName, err := artistsTable.InTableFind("artistID", artistsID[i], "artist", false)
		if err != nil {
			return err
		}
		artists += artistName[0] + " "
	}
	S.artist = artists

	return nil
}

// HeaderToMap format header into map[string]string and returns it
func (S song) HeaderToMap() map[string]string {
	header := make(map[string]string, 7)
	header["title"] = S.title
	header["artist"] = S.artist
	header["language"] = S.language
	header["key"] = S.key
	header["capo"] = S.capo
	header["tact"] = S.tact
	header["tempo"] = S.tempo
	return header
}

// GetHeader is for getting JUST header of song not text
// it return map[header_identifier]header_parameter
func GetHeader(songID string) map[string]string {
	S := NewSong(songID)
	S.LoadHeader()
	return S.HeaderToMap()
}

// readSongFile is function, which reads file, divide it to Header and lyrics
// tryes to find file in location dir provided as function argument
// return Header as []string and lyrics as string
func (S song) readSongFile() (Text string) {

	songFile := songsFiles + "/" + S.songID + ".txt"
	// open a file
	f, err := os.Open(songFile)
	if err != nil {
		log.Fatalln(err)
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	err = scanner.Err()
	if err != nil {
		log.Fatalln(err)
	}

	// read file line by line
	for scanner.Scan() {
		line := scanner.Text()
		line = strings.TrimSpace(line)
		if line != "" {
			Text += line + "\n"
		}
	}
	return Text
}

// LoadText is method of Text type
// it takes directory of song file, call function readSongFile and save text
// if name of paragraph (key, for example 1, R) is already loaded, and I try add
func (S *song) LoadText() { // return created error if something wrong
	t := S.readSongFile()
	var (
		k       string
		isK     bool
		par     string
		isPar   bool
		isChord bool
	)

	S.paragraphs = make(map[string]string)

	// loop through text char by char
	for _, c := range t {

		// newline
		if c == '\n' {
			par += "<br>"
			continue
		}

		// start of paragraph key
		if c == '[' {
			isK = true
			isPar = false // add adding to paragraph if not ended previous one
			continue
		}

		// end of paragraph key
		if isK && c == '%' {
			S.parList = append(S.parList, k)
			isK = false
			isPar = true
			continue
		}

		// add to key if it belongs
		if isK {
			k += string(c)
			continue
		}

		// end of paragraph
		if isPar && c == ']' {
			isPar = false

			// check if key in map already exists, if not, add key and paragraph to map
			if _, ok := S.paragraphs[k]; !ok {
				S.paragraphs[k] = par
				// if key exists and paragraph is not blank, throw error for trying to rewrite text in already added paragraph
			} else if par != "" {
				// ADD ERROR
			}

			par = ""
			k = ""
			continue
		}

		// start of chord tag
		if c == '*' && !isChord {
			par += `<div class="chord">`
			isChord = true
			continue
		}

		// end of chord tag
		if c == '*' && isChord {
			par += `</div>`
			isChord = false
			continue
		}

		// add to paragraph if it belongs
		if isPar {
			par += string(c)
			continue
		}
	}
}

// ReturnSong format song so it can be send to web
// Format content into JSON notation
func (S song) ReturnSong() []byte {
	songStruct := struct {
		Title           string
		Artist          string
		Language        string
		Key             string
		Capo            string
		Tact            string
		Tempo           string
		ParagraphsOrder []string
		Paragraphs      map[string]string
	}{
		S.title,
		S.artist,
		S.language,
		S.key,
		S.capo,
		S.tact,
		S.tempo,
		S.parList,
		S.paragraphs,
	}

	songStructJSON, err := json.Marshal(songStruct)
	if err != nil {
		log.Println(err)
	}
	return songStructJSON
}

// SendSongs is function which return songs formated to JSON
// output can be sent to Javascript
// takes various inputs, every input is directory of song
func SendSongs(songsID... string) (songsJSON string) {
	songsJSON += "{\n"
	for _, songID := range songsID {
		S := NewSong(songID)
		songsJSON += "\"" + S.songID + "\" : \n"
		songsJSON += string(S.ReturnSong())
		songsJSON += ",\n"
	}
	songsJSON = songsJSON[:len(songsJSON)-3] + "\n}\n}"
	return songsJSON
}
