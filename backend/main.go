// Copyright 2013 The Gorilla WebSocket Authors. All rights reserved.
// Use of this source code is governed by a BSD-style
// license that can be found in the LICENSE file.

package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	session "github.com/go-session/session/v3"
)

var addr = flag.String("addr", ":8080", "http service address")

func serveHome(w http.ResponseWriter, r *http.Request) { //gets standard, static files.
	store, err := session.Start(context.Background(), w, r)
	if err != nil {
		fmt.Fprint(w, err)
		return
	}

	log.Println(r.URL)
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}
	if r.URL.Path == "app.html" {
		token, ok := store.Get("token")

		if ok {
			userid, ok := store.Get("userId")
			if ok {
				stmt, err := db.Prepare("SELECT userId,token FROM Sessions WHERE userId = ? AND token = ? ")
				if err != nil {
					log.Fatal(err)
				}
				var usertkn = ""
				var id = 0
				stmt.QueryRow(userid, token).Scan(&id, &usertkn)
				if usertkn == token && userid == id {
					http.ServeFile(w, r, "/app/static/app.html")

				} else {
					http.Error(w, "Authentication Failed", http.StatusUnauthorized)
					http.Redirect(w, r, "login.html", http.StatusSeeOther)
				}

			} else {
				http.Error(w, "Authentication Failed", http.StatusUnauthorized)
				http.Redirect(w, r, "login.html", http.StatusSeeOther)

			}
		} else {
			http.Error(w, "Authentication Failed", http.StatusUnauthorized)
			http.Redirect(w, r, "login.html", http.StatusSeeOther)

		}
	} else {
		http.ServeFile(w, r, "/app/static"+r.URL.Path)
	}
}
func serveDocument(w http.ResponseWriter, r *http.Request) { //grabs a document's text, and sends to client.
	store, err := session.Start(context.Background(), w, r)
	if err != nil {
		fmt.Fprint(w, err)
		return
	}
	var dat map[string]interface{}

	var body, exception = io.ReadAll(r.Body)
	if exception != nil {
		http.Error(w, "Failed to read body data sent.", http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(body, &dat); err != nil {
		http.Error(w, "Failed to read json data sent.", http.StatusBadRequest)
		return
	}
	noteid := dat["noteid"].(int64)

	token, ok := store.Get("token")

	if ok {
		userid, ok := store.Get("userId")
		if ok {
			stmt, err := db.Prepare("SELECT userId,token FROM Sessions WHERE userId = ? AND token = ? ")
			if err != nil {
				log.Fatal(err)
			}
			var usertkn = ""
			var id = 0
			stmt.QueryRow(userid, token).Scan(&id, &usertkn)
			fmt.Printf("%d %s %d %s\n", userid, token, id, usertkn)
			if usertkn == token && userid == id {
				fmt.Printf("User ID: %d\n", id)
				notesjson := loadNote(id, noteid, db)
				fmt.Println(notesjson)
				fmt.Fprintf(w, notesjson)
			} else {
				http.Error(w, "Authentication Failed", http.StatusUnauthorized)
				http.Redirect(w, r, "login.html", http.StatusSeeOther)
			}

		} else {
			http.Error(w, "Authentication Failed", http.StatusUnauthorized)
			http.Redirect(w, r, "login.html", http.StatusSeeOther)

		}
	} else {
		http.Error(w, "Authentication Failed", http.StatusUnauthorized)
		http.Redirect(w, r, "login.html", http.StatusSeeOther)

	}
}
func createSheet(w http.ResponseWriter, r *http.Request) { //creates a note
	store, err := session.Start(context.Background(), w, r)
	if err != nil {
		fmt.Fprint(w, err)
		return
	}
	var dat map[string]interface{}

	var body, exception = io.ReadAll(r.Body)
	if exception != nil {
		http.Error(w, "Failed to read body data sent.", http.StatusBadRequest)
		return
	}

	if err := json.Unmarshal(body, &dat); err != nil {
		http.Error(w, "Failed to read json data sent.", http.StatusBadRequest)
		return
	}
	noteid := dat["filename"].(string)

	token, ok := store.Get("token")

	if ok {
		userid, ok := store.Get("userId")
		if ok {
			stmt, err := db.Prepare("SELECT userId,token FROM Sessions WHERE userId = ? AND token = ? ")
			if err != nil {
				log.Fatal(err)
			}
			var usertkn = ""
			var id = 0
			stmt.QueryRow(userid, token).Scan(&id, &usertkn)
			fmt.Printf("%d %s %d %s\n", userid, token, id, usertkn)
			if usertkn == token && userid == id {
				fmt.Printf("User ID: %d\n", id)
				notesjson := createNote(id, noteid, db)
				fmt.Println(notesjson)
				fmt.Fprintf(w, notesjson)
			} else {
				http.Error(w, "Authentication Failed", http.StatusUnauthorized)
				http.Redirect(w, r, "login.html", http.StatusSeeOther)
			}

		} else {
			http.Error(w, "Authentication Failed", http.StatusUnauthorized)
			http.Redirect(w, r, "login.html", http.StatusSeeOther)

		}
	} else {
		http.Error(w, "Authentication Failed", http.StatusUnauthorized)
		http.Redirect(w, r, "login.html", http.StatusSeeOther)

	}
}
func getsheets(w http.ResponseWriter, r *http.Request) { //gets a user's list of sheets
	store, err := session.Start(context.Background(), w, r)
	if err != nil {
		fmt.Fprint(w, err)
		return
	}

	token, ok := store.Get("token")

	if ok {
		userid, ok := store.Get("userId")
		if ok {
			stmt, err := db.Prepare("SELECT userId,token FROM Sessions WHERE userId = ? AND token = ? ")
			if err != nil {
				log.Fatal(err)
			}
			var usertkn = ""
			var id = 0
			stmt.QueryRow(userid, token).Scan(&id, &usertkn)
			fmt.Printf("%d %s %d %s\n", userid, token, id, usertkn)
			if usertkn == token && userid == id {
				fmt.Printf("User ID: %d\n", id)
				notesjson := getUserNotes(id, db)
				fmt.Println(notesjson)
				fmt.Fprintf(w, notesjson)
			} else {
				http.Error(w, "Authentication Failed", http.StatusUnauthorized)
				http.Redirect(w, r, "login.html", http.StatusSeeOther)
			}

		} else {
			http.Error(w, "Authentication Failed", http.StatusUnauthorized)
			http.Redirect(w, r, "login.html", http.StatusSeeOther)

		}
	} else {
		http.Error(w, "Authentication Failed", http.StatusUnauthorized)
		http.Redirect(w, r, "login.html", http.StatusSeeOther)

	}

}

func signup(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var body, exception = io.ReadAll(r.Body)
	if exception != nil {
		http.Error(w, "Failed to read body data sent.", http.StatusBadRequest)
		return
	}
	var dat map[string]interface{}
	if err := json.Unmarshal(body, &dat); err != nil {
		http.Error(w, "Failed to read json data sent.", http.StatusBadRequest)
		return
	}
	username := dat["username"].(string)
	password := dat["password"].(string)

	if len(password) > 8 && strings.ContainsAny(username, "@") {
		email := queryWithResponse("SELECT email FROM Users WHERE email = ?", db, username)
		emailname := ""
		email.Scan(&emailname)
		if emailname == username {
			fmt.Fprintf(w, `{"error-code":0,"error-msg":"Account with username already exists. Please log in to your account.","technical-msg":"Failed to insert user"}`)
			return

		}
		row := db.QueryRow("INSERT INTO Users (email, password) VALUES (?, ?);", username, password)
		if row.Err() != nil {
			fmt.Println(row.Err().Error())
			fmt.Fprintf(w, `{"error-code":0,"error-msg":"Something went wrong. Please try again.","technical-msg":"Failed to insert user"}`)
			return
		}
		fmt.Fprintf(w, `{"error-code":1,"error-msg":"Success. Please try logging in with your new account.","technical-msg":"Success."}`)
		return

	}

}
func login(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var body, exception = io.ReadAll(r.Body)
	if exception != nil {
		http.Error(w, "Failed to read body data sent.", http.StatusBadRequest)
		return
	}
	var dat map[string]interface{}
	if err := json.Unmarshal(body, &dat); err != nil {
		http.Error(w, "Failed to read json data sent.", http.StatusBadRequest)
		return
	}
	username := dat["username"].(string)
	password := dat["password"].(string)
	userid := getLogin(username, password, db)
	if userid == -1 {
		fmt.Fprintf(w, `{"error-code":2,"error-msg":"Incorrect Password/Username.","technical-msg":"Incorrect Password/Username"}`)
		return
	}
	store, err := session.Start(context.Background(), w, r)
	if err != nil {
		fmt.Fprint(w, err)
		return
	}
	tempuserid := 0

	row := db.QueryRow("SELECT userId FROM Sessions WHERE userId = ?;", userid)
	if row.Err() != nil {
		fmt.Println(row.Err().Error())
		fmt.Fprintf(w, `{"error-code":0,"error-msg":"Something went wrong. Please try again.","technical-msg":"Failed to SELECT userId FROM Sessions"}`)
		return

	}
	row.Scan(&tempuserid)
	fmt.Printf("%d\n", tempuserid)
	if tempuserid == userid { //this may prevent multiple accounts, definitely need to check that
		row := db.QueryRow("DELETE FROM Sessions WHERE userId = ?;", userid)
		if row.Err() != nil {
			fmt.Println(row.Err().Error())
			fmt.Fprintf(w, `{"error-code":0,"error-msg":"Something went wrong. Please try again.","technical-msg":"Failed to DELETE FROM Sessions"}`)
			return
		}
	}
	token := generateToken()

	row = db.QueryRow("INSERT INTO Sessions (userId, token) VALUES (?, ?);", userid, token)
	if row.Err() != nil {
		fmt.Println(row.Err().Error())
		fmt.Fprintf(w, `{"error-code":0,"error-msg":"Something went wrong. Please try again.","technical-msg":"Failed to insert token into session"}`)
		return
	}
	store.Set("userId", userid)
	store.Set("token", token)
	fmt.Println(userid)
	fmt.Fprintf(w, `{"error-code":1,"error-msg":"Success.","technical-msg":"Success."}`)
	err = store.Save()
	if err != nil {
		fmt.Fprint(w, err)
		return
	}
}

var db *sql.DB = nil

func main() {
	db = connectDB()
	initializeDB(db)
	initializeFilesystem()
	fmt.Println("Server is running, currently accessible from http://127.0.0.1:8080...\n\nPress CTRL-C to close.")
	flag.Parse()
	hub := newHub()
	go hub.run()
	http.HandleFunc("/", serveHome)
	http.HandleFunc("/getsheets", getsheets)
	http.HandleFunc("/getsheet", serveDocument)
	http.HandleFunc("/attemptuserlogin", login)
	http.HandleFunc("/attemptuserregister", signup)
	http.HandleFunc("/createsheet", createSheet)

	http.HandleFunc("/ws", func(w http.ResponseWriter, r *http.Request) {
		serveWs(hub, w, r)
	})
	err := http.ListenAndServe(*addr, nil)
	if err != nil {
		log.Fatal("ListenAndServe: ", err)
	}
}
