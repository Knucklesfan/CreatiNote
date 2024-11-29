package main

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"os"

	_ "github.com/go-sql-driver/mysql"
)

var databaseusername = ""
var databasepassword = ""
var database = ""
var ipaddr = ""
var port = ""

func loadFile(filename string) string {
	dat, err := os.ReadFile(filename)
	if err != nil {
		panic(err)
	}
	return string(dat)
}
func loadSecrets() {
	databaseusername = os.Getenv("MARIADB_USERNAME")
	databasepassword = os.Getenv("MARIADB_PASSWORD")
	database = os.Getenv("MARIADB_DATABASE")
	ipaddr = os.Getenv("MARIADB_IPADDR")
	port = os.Getenv("MARIADB_PORT")

}
func connectDB() *sql.DB {
	loadSecrets()
	// Replace "username", "password", "dbname" with your database credentials
	connectionString := databaseusername + ":" + databasepassword + "@tcp(" + ipaddr + ":" + port + ")/" + database
	db, err := sql.Open("mysql", connectionString)
	if err != nil {
		log.Fatal(err)
	}
	return db
}
func checkTable(tablename string, db *sql.DB) bool {
	row, err := db.Query("SHOW TABLES LIKE \"" + tablename + "\"")
	if err != nil {
		log.Fatal(err)
	}

	if err := row.Scan(); err != nil {
		return false
	}
	return true

}
func getLogin(username string, password string, db *sql.DB) int {
	stmt, err := db.Prepare("SELECT id,password FROM Users WHERE email = ?")
	if err != nil {
		log.Fatal(err)
	}
	var user_password = ""
	var id = 0
	stmt.QueryRow(username).Scan(&id, &user_password)
	fmt.Print(user_password)
	if password != user_password {
		fmt.Println("Password does not match.")
		return -1
	}
	return id
}
func generateToken() string {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return ""
	}
	return hex.EncodeToString(b)
}

func createDBTables(db *sql.DB) {

	if !checkTable("Users", db) {
		fmt.Println("User table does not exist, creating...")
		if !queryNoArgsNoResponse(`CREATE TABLE Users (
			id int NOT NULL AUTO_INCREMENT,
			email varchar(512) NOT NULL,
			password varchar(64) NOT NULL,
			PRIMARY KEY (ID)
		);`, db) {
			log.Fatal("Failed to create User table for whatever reason")
		}
	}
	if !checkTable("Notes", db) {
		fmt.Println("Notes table does not exist, creating...")
		if !queryNoArgsNoResponse(`CREATE TABLE Notes (
			id int NOT NULL AUTO_INCREMENT,
			userId int NOT NULL,
			filename varchar(255) NOT NULL,
			shareFlag int NOT NULL,
			PRIMARY KEY (id)
		); `, db) {
			log.Fatal("Failed to create Notes table for whatever reason")
		}
	}
	if !checkTable("Sessions", db) {
		fmt.Println("Sessions table does not exist, creating...")
		if !queryNoArgsNoResponse(`CREATE TABLE Sessions (
		id int NOT NULL AUTO_INCREMENT,
		userId int NOT NULL,
		token varchar(255) NOT NULL,
		PRIMARY KEY (id) );`, db) {
			log.Fatal("Failed to create Sessions table for whatever reason")
		}
	}

}
func initializeDB(db *sql.DB) { //make sure there is a database on the system
	fmt.Println("initializing DB")
	rows, err := db.Query("SHOW TABLES")
	fmt.Println("Scanning DB, looking for tables if they do not exist.")

	if err != nil {
		log.Fatal(err)
	}
	var tablecount = 0
	for rows.Next() {
		tablecount++
	}
	defer rows.Close()
	fmt.Printf("%d tables found.", tablecount)
	if tablecount < 3 { //if too low, lets generate some tables
		fmt.Println("Table count low, finding missing tables.")

		createDBTables(db)
	}

}

func queryNoArgsNoResponse(query string, db *sql.DB) bool {
	row, err := db.Query(query)
	if err != nil {
		return false
	}
	defer row.Close()
	return true
}
func queryNoArgsResponse(query string, db *sql.DB) *sql.Rows {
	row, err := db.Query(query)
	if err != nil {
		return nil
	}
	return row
}
func queryWithResponse(query string, db *sql.DB, args ...any) *sql.Row {
	row := db.QueryRow(query, args)
	if row.Err() != nil {
		fmt.Println("ERROR FOUND IN " + query)
		fmt.Println(row.Err().Error())
		return nil
	}
	return row

}
func queryWithNoResponse(query string, db *sql.DB, args ...any) bool {
	row := db.QueryRow(query, args)
	if row.Err() != nil {
		fmt.Println("ERROR FOUND IN " + query)
		fmt.Println(row.Err().Error())
		return false
	}
	return true
}
