package dbEngine

import (
	"os"
	// "log"
	"bufio"
	"errors"
	"fmt"
	"strings"
)

// table is structure containing table file and information about this table
type table struct {
	tableFile    string		// name of file containing table
	tableName    string		// name the user gave to table
	tableVars    []string		// all columns named by user with initialization
	tableContent [][]string		// actual values in columns corresponding to tableVars columns
}

// NewTable is constructor for method "type table struct{}", it gets informations from user and load table from file.
func NewTable(tableFile string, tableName string, tableVars ...string) (T *table, err error) {
	T = new(table)

	// check file and set table filename
	if _, err = os.Stat(tableFile); os.IsNotExist(err) {
		return nil, err
	}
	T.tableFile = tableFile
	// set table name and names of variables and
	T.tableName = tableName
	if len(tableVars) < 1 {
		notEnoughVarNames := "[ERROR] in table \"" + T.tableName + "\" onload was given none variable names!!!"
		return nil, errors.New(notEnoughVarNames)
	}
	T.tableVars = tableVars

	// load content
	err = T.loadTable()
	if err != nil {
		return nil, err
	}

	return T, err
}

// loadTable reads file line by line
func (T *table) loadTable() (err error) {
	f, err := os.Open(T.tableFile)
	if err != nil {
		return err
	}
	defer f.Close()

	scanner := bufio.NewScanner(f)
	err = scanner.Err()
	if err != nil {
		return err
	}

	// scan file line by line
	lineNumber := 0
	for scanner.Scan() {
		lineNumber++
		line := scanner.Text()
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}

		// split line to elements (columns) and add to the table content
		lineElements := strings.Split(line, ">")
		if len(lineElements) != len(T.tableVars) {
			errString := fmt.Sprint("[ERROR] in file \"", T.tableFile, "\" number of elements on line ", lineNumber, " is not equal to number of columns ", len(T.tableVars))
			return errors.New(errString)
		}
		T.tableContent = append(T.tableContent, lineElements)

	}
	return err
}

// inTableFind method find in "findIn" column for a vlues "findMember" and if finds, add to array column "givenParameter"
func (T table) InTableFind(findInColumn string, findValue string, returnColumn string, multiple bool) (found []string, err error) {
	findInColumnFound := false
	returnColumnFound := false
	findInColumnIndex := 0
	returnColumnIndex := 0
	for i := 0; i < len(T.tableVars); i++ {
		if T.tableVars[i] == findInColumn {
			findInColumnFound = true
			findInColumnIndex = i
		}
		if T.tableVars[i] == returnColumn {
			returnColumnFound = true
			returnColumnIndex = i
		}
	}

	// given column to find not exists
	if !findInColumnFound {
		errString := "[ERROR] in inTableFind given parameter column: \"" + findInColumn + "\", there is no column of this name!!!"
		return nil, errors.New(errString)
	}

	// column to return not found
	if !returnColumnFound {
		errString := "[ERROR] in inTableFind searched parameter is not in columns of table: \"" + returnColumn + "\", there is no column of this name!!!"
		return nil, errors.New(errString)
	}

	// loop database and search
	for i := 0; i < len(T.tableContent); i++ {
		if T.tableContent[i][findInColumnIndex] == findValue {
			found = append(found, T.tableContent[i][returnColumnIndex])

			// if I'm searching only one item,
			if !multiple {
				break
			}
		}
	}

	return found, nil
}

func (T table) printTable() {
	fmt.Println("\n\n.......................................")
	fmt.Println(">>>>>>>>>>", T.tableName, "<<<<<<<<<<")
	fmt.Println("\ntable file: \t", T.tableFile)
	fmt.Println("----------------------------------------")
	for i := 0; i < len(T.tableVars); i++ {
		fmt.Print(T.tableVars[i], "\t")
	}
	fmt.Println("\n.........................................")
	for i := 0; i < len(T.tableContent); i++ {
		for j := 0; j < len(T.tableVars); j++ {
			fmt.Print(T.tableContent[i][j], "\t")
		}
		fmt.Println()
	}
}

func (T table) GiveAll() [][]string {
	return T.tableContent
}
