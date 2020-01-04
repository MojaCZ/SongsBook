# GO SERVER

This is a server written in Go. It includes library for working with songs database

## songs package

allow you to:
* list songs in database
* filter list songs
* load song from text file
* modify songs
* load play lists

## structures, methods and interfaces contained in files
* confLoader.go serves to get information from configuration file contained in /data folder
  * `type configuration struct`
    * `func NewConfiguration() *configuration`  constructor of configuration struct.
    * `func (C \*configuration) loadVariables()` extract and saves variables
    * `func (C \*configuration) GetVariables()` gives a variable value as string

* dbEngine.go
  * `type table struct {tableFile, tableName, tableVars[], tableContent[][]}`
    * `func NewTable() (*table, error)`
    * `func (T \*table) loadTable() error`
    * `func (T \*table) InTableFind() error`
    * `func (T \*table) printTable()`
    * `func (T \*table) GiveAll() [][]string`
* library.go
  * `func Quicksort()`
  * `func countDigits()`
  * `func FindFreeID()`
  * `func NewDBLiine()`
  * `func CreateSongFile()`
  * `func CreateSong()`
  * `func Connect()`
* [playlist.go](./playlist/README.md)
