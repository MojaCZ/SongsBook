# PLAY LIST PACKAGE

is package for manipulating playlists. It help to determine which songs belong to particular playlist.

You can list songs in order to:
* [listed in playlist file](# playlistfile)
* [belonging to a directory](# playlistdir)
* [due to argument of song header](# playlistheader)

Each of listed below has it's own type.

All three types work similar. See example on playListFile type:

---

To create new object, use constructor `func NewPlayListFile(dir string) *playListFile`. It is function that get directory of playlist file, create object of `type playListFile struct` and use method `func (PL *playListFile) LoadSongs()` to init itself.

Type playListFile has two methods returning informations about included songs. Both methods return []string, `SongsDir` with songs directories, `SongsNames` with songs names.


```go
func NewPlayListFile(dir string) *playListFile

func (PL playListFile) SongsDir() []string

func (PL playListFile) SongsNames() []string

```

---

## playListFile

To show all available playlist files, use ListFolder function

```go
func ListFolder(dir string) (PLfiles [][]string)
```

To use this class create object with `NewPlayListFile` and then use methods as needed.

## playListDir

Type playListDir can create playlist from songs included in given directory.

To use this class create object with `NewPlayListDir` and then use methods as needed.

## playListHeader

Type playListHeader use `type song struct` to read headers of songs. If header argument is equal to given parameter, it add song to playlist.

you can list all songs with same header argument

header parts are:
* title
* artist
* language
* key
* tact
* tempo

To use this class create object with `NewPlayListHeader` and then use methods as needed. Constructor takes directory, headerIdentifier (part to be compare) and headerParameter (parameter I want song to have)
