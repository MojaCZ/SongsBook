# Songs Book

Songs Book is a project for serving web page containing lyrics and chords of songs.

There is a system of playlists where you can group songs.

Each song holds these information:
* title
* language
* key
* capo
* tact
* tempo

You can turn on and off the chords which helps with orientation in text for singers (players leave chords on).\
Additionally you can fold paragraphs which are repeating. This helps to display page without need to scroll down, which you can't do while playing instrument.

## Files and folders
* [data/](./data/README.md) stores all data related to database and songs.
* [goServer/](./goServer/README.md) contains libraries to manipulate server requests (AJAX requests for playlists and songs) and database engine.
* [static/](.static/README.md)
* *templates/* holds .gohtml templates.
* *addToPlaylist.go* & *newSong.go* serves temporarily for adding new songs into database and connecting songs to playlists in relation database
* *songsBook.go* is server that serves page on port 8082 and calls custom libraries and database engine.

## Technologies
The only technologie on backend is **GO**, no third party code was used, only standard libraries. This helped me to understand into detail how communication server-client exactly works.

**Database** is also custom. The engine was also written in GO and although it is not robust yet, it works well and can be used to any relation database structure. (For now, it is missing some functionality for adding new elements and relations, but for now this is solved with *addToPlaylist and newSong* programs and this code will be implemented into database later).

## Additionally
This server is also used with RaspberryPi in remote places without internet connection. On RaspberryPi is turned on Wi-Fi Hotspot `hostapd`, DHCP server `dnsmasq` and web page is served locally without need of data connection.
