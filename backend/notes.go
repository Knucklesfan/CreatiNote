package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"os"
	"regexp"
	"strconv"
	"time"

	_ "github.com/go-sql-driver/mysql"
)

type Note struct {
	Id           int    `json:"id"`
	OwnerId      int    `json:"ownerId"`
	Filename     string `json:"filename"`
	Formalname   string `json:"formalname"`
	Shareflags   int    `json:"shareflags"`
	LastModified uint64 `json:"lastmodified"`
	TimeCreated  uint64 `json:"timecreated"`
}
type GatewayInfo []Note

func loadNote(userid int, noteid int, db *sql.DB) string {
	notedb := queryWithResponse("SELECT userId, filename FROM Notes WHERE id = ?", db, noteid)
	filename := ""
	usrid := 0
	notedb.Scan(&usrid, &filename)
	if usrid == userid {
		dat, err := os.ReadFile("/app/notes/" + filename)
		if err != nil {
			log.Print(err)
			return ""
		}
		fmt.Print(string(dat))
		retdata := map[string]interface{}{
			"noteText": dat,
		}
		jsonData, err := json.Marshal(retdata)
		if err != nil {
			fmt.Printf("could not marshal json: %s\n", err)
			return ""
		}
		return string(jsonData)
	} else {
		return ""
	}
}
func saveNote(userid int64, noteid int64, text string, db *sql.DB) string {
	notedb := queryWithResponse("SELECT userId,filename FROM Notes WHERE id = ?", db, noteid)
	filename := ""
	var usrid int64 = 0
	notedb.Scan(&usrid, &filename)
	if usrid == userid {
		err := os.WriteFile("/app/notes/"+filename, []byte(text), 0644)
		if err != nil {
			log.Print(err)
			return `{"success":false}`
		}
		notedb := queryWithNoResponse("UPDATE Notes SET lastmodified=? WHERE id = ?", db, time.Now().UnixMilli(), usrid)
		if !notedb {
			return `{"success":false}`
		}
		return `{"success":true}`
	} else {
		return `{"success":false}`
	}

}
func renameNote(userid int, noteid int, title string, db *sql.DB) string {
	notedb := queryWithResponse("SELECT userId,filename FROM Notes WHERE id = ?", db, noteid)
	filename := ""
	var usrid = 0
	notedb.Scan(&usrid, &filename)
	if usrid == userid {
		notedb := queryWithNoResponse("UPDATE Notes SET formalname=? WHERE id = ?", db, title, usrid)
		if !notedb {
			return `{"success":false}`
		}
		return `{"success":true}`
	} else {
		return `{"success":false}`
	}

}
func deleteNote(userid int, noteid int, db *sql.DB) string {
	notedb := queryWithResponse("SELECT userId,filename FROM Notes WHERE id = ?", db, noteid)
	filename := ""
	var usrid = 0
	notedb.Scan(&usrid, &filename)
	if usrid == userid {
		notedb := queryWithNoResponse("DELETE FROM Notes WHERE id = ?", db, noteid)
		e := os.Remove("/app/notes/" + filename)
		if e != nil {
			fmt.Println("Failed to delete file from disk")
			return `{"success":false}`

		}
		if !notedb {
			return `{"success":false}`
		}
		return `{"success":true}`
	} else {
		return `{"success":false}`
	}

}

func createNote(userid int, formalname string, db *sql.DB) string {
	reg := regexp.MustCompile(`"[\\/:*?\"\ <>|]"`)
	filename := strconv.Itoa(userid) + "_" + reg.ReplaceAllString(formalname, "") + "_" + strconv.FormatInt(time.Now().UnixMilli(), 35)
	fmt.Println(filename + " " + formalname)

	err := os.WriteFile("/app/notes/"+filename, []byte(""), 0644)
	if err != nil {
		log.Print(err)
		return `{"success":false}`
	}
	time := time.Now().UnixMilli()
	notedb := queryWithNoResponse("INSERT INTO Notes (userId, filename, formalname, shareFlag,lastmodified, timecreated) VALUES (?,?,?,0,?,?)", db, userid, filename, formalname, time, time)
	itdb := queryWithResponse("SELECT LAST_INSERT_ID()", db)
	if err != nil {
		log.Print(err)
		return `{"success":false}`
	}
	itemnum := 0
	itdb.Scan(&itemnum)
	if !notedb {
		return `{"success":false}`
	} else {
		return `{"success": true,"id":` + strconv.Itoa(itemnum) + `}`
	}
}
func getUserNotes(userid int, db *sql.DB) string {
	rows, err := db.Query("SELECT * FROM Notes WHERE userId = ?", userid)
	if err != nil {
		fmt.Println("error")
	}
	// Loop through rows, using Scan to assign column data to struct fields.
	var notes []Note
	for rows.Next() {
		var note Note
		err := rows.Scan(&note.Id, &note.OwnerId, &note.Filename, &note.Formalname, &note.Shareflags, &note.LastModified, &note.TimeCreated)
		if err != nil {
			log.Fatal(err)
		}
		notes = append(notes, note)
	}
	msg, err := json.Marshal(notes)
	if err != nil {
		return ""
	}

	return string(msg)

}
