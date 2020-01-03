package library

import (
  "strings"
  "strconv"
  "math/rand"
  "os"
  "bufio"
  "log"
)

// Quicksort() return sorted slice of ints
func Quicksort(a []int) []int {
    if len(a) < 2 {
        return a
    }
    left, right := 0, len(a)-1
    pivot := rand.Int() % len(a)
    a[pivot], a[right] = a[right], a[pivot]
    for i, _ := range a {
        if a[i] < a[right] {
            a[left], a[i] = a[i], a[left]
            left++
        }
    }
    a[left], a[right] = a[right], a[left]
    Quicksort(a[:left])
    Quicksort(a[left+1:])
    return a
}

// CountDigits() counts digits of int and return number of digits
func CountDigits(i int) (count int) {
 for i != 0 {
	 i /= 10
	 count = count + 1
 }
 return count
}

// FindFreeID() get IDs (first column in file lines) and return smallest free ID from this file
func FindFreeID(filePath string) string {
	smallestFreeID := 1
	f, err := os.Open(filePath)
	if err != nil {
		log.Fatalln()
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	err = scanner.Err()
	if err != nil {
		log.Fatalln()
	}

	var allID []int
	// scan file line by line
	for scanner.Scan() {
		line := scanner.Text()
		line = strings.TrimSpace(line)
		if line == "" { continue }
		lineID, _ := strconv.Atoi(strings.Split(line, ">")[0])
		allID = append(allID, lineID)
	}
	allID = Quicksort(allID)

	// loop through sorted IDs, if there is space, loop will find it and return smallest free ID
	for i:=0; i<len(allID); i++ {
		if smallestFreeID < allID[i] {	// have I found the loop?
			break
		} else {	// if not, add one to number and continue with next one
			smallestFreeID++
		}
	}
	digits := CountDigits(smallestFreeID)
	ID := ""
	digitsLeft := 5-digits
	for i:=0; i<digitsLeft; i++ {
		ID += "0"
	}
	ID += strconv.Itoa(smallestFreeID)
	return ID
}

// NewDBLine() add new line to db files containing only two rows (ID>name)
func NewDBLine(dbFile string, lineName string) (ID string){
	ID = FindFreeID(dbFile)

	f, err := os.OpenFile(dbFile, os.O_APPEND, 0600)
	if err != nil {
		log.Fatalln()
	}
	defer f.Close()
	line := ID + ">" + lineName + "\n"
	if _, err = f.WriteString(line); err != nil {
    log.Fatalln(err)
	}
	return ID
}

// CreateSongFile() create a new file named songID.txt
func CreateSongFile(songsFiles string, songID string) {
	file := songsFiles + "/" + songID + ".txt"
	// log.Printf("FILE: ", file)
	f, err := os.Create(file)
	if err != nil {
		log.Fatalln()
	}
	defer f.Close()
	line := "[1%*chord*]\n"
	if _, err = f.WriteString(line); err != nil {
		log.Fatalln(err)
	}
}

// CreateSong(...) add line to DB file containing songs lines
func CreateSong(dbFile string, songsFiles string, title string, languageID string, key string, capo string, tact string, tempo string) (songID string) {
	songID = FindFreeID(dbFile)
	CreateSongFile(songsFiles, songID)

	f, err := os.OpenFile(dbFile, os.O_APPEND, 0600)
	if err != nil {
		log.Fatalln()
	}
	defer f.Close()

	line := songID + ">" + title + ">" + languageID + ">" + key + ">" + capo + ">" + tact + ">" + tempo + "\n"
	if _, err = f.WriteString(line); err != nil {
		log.Fatalln(err)
	}
	return songID
}

// Connect() make connection in dbFile, it connect ID1 with ID2
func Connect(dbFile string, ID1 string, ID2 string) {
	f, err := os.OpenFile(dbFile, os.O_APPEND, 0600)
	if err != nil {
		log.Fatalln()
	}
	defer f.Close()
	line := ID1 + ">" + ID2 + "\n"
	if _, err = f.WriteString(line); err != nil {
		log.Fatalln(err)
	}
}
