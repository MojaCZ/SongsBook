package confLoader

import (
  "os"
  "log"
  "bufio"
  "fmt"
  "strings"
  "errors"
)

type configuration struct {
  confFile string
  variables map[string]string
  varsLoaded bool
}

// NewConfiguration is constructor for class configuration.
// it will set .conf file if exists and load variables
func NewConfiguration(confFile string) *configuration {
  C := new(configuration)
  C.confFile = confFile
  C.variables = map[string]string{}
  if _, err := os.Stat(C.confFile); os.IsNotExist(err) {
    log.Fatalln(err)
  }
  C.loadVariables()
  return C
}

// loadVariables method read .conf file line by line
// extract and saves variables
func (C *configuration) loadVariables() {

  f, err := os.Open(C.confFile)
  if err != nil {
    log.Fatalln(err)
  }
  defer f.Close()

  scanner := bufio.NewScanner(f)
  err = scanner.Err()
  if err != nil {
    log.Fatalln(err)
  }


  lineNumber := 1
  LINE:
  for scanner.Scan() {
    line := scanner.Text()
    line = strings.TrimSpace(line)
    if line == "" {
      continue
    }

    // check format of lines (for comments)
    for i := 0; i<len(line); i++ {
      // scip white spaces characters
      if line[i] == ' ' || line[i] == '\t' {
        continue

      // if line starts with '#' skip it
      } else if line[i] == '#' {
        continue LINE

      // line containing variable
      } else {
        break
      }
    }

    // check if line contains "=" character
    if !strings.Contains(line, "=") {
      // log.Printf("[ATTENTION]: in configuration file \"", C.confFile, "\" on line ", lineNumber+1 , " is missing '=' character, shouldn't it be there?")
      continue
    }
    variable := strings.Split(line, "=")

    // check if there is only one '=' character contained in line
    if len(variable) > 2 {
      // log.Printf("[ATTENTION]: in configuration file \"", C.confFile, "\" on line ", lineNumber+1 , " are multiple '=' characters, something is wrong")
      continue
    }

    // add variable to map
    varName := strings.TrimSpace(variable[0])
    varValue := strings.TrimSpace(variable[1])
    C.variables[varName] = varValue
    lineNumber++
  }

  // check if there are some variables loaded
  if len(C.variables) == 0 {
    errNoVar := "configuration file \"" + C.confFile + "\" has no variables to load!!!"
    log.Fatalln(errors.New(errNoVar))
  }
}

// GetVariable is function, which gives a value in string format
// it wants a variable name
// return error if variable not found
func (C configuration) GetVariable(varName string) (varValue string, err error) {
  // if
  if val, ok := C.variables[varName]; ok {
    return val, nil
  } else {
    errString := fmt.Sprint("there is none variable with name \"", varName, "\" in configuration file \"", C.confFile, "\"")
    return "", errors.New(errString)
  }
}
