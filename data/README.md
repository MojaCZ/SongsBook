# DATA

## Database structure

<table>
  <tr> <th colspan="7">songs</th> </tr>
  <tr> <td>song_id</td> <td>title</td> <td>language_id</td> <td>key</td> <td>capo</td> <td>tact</td> <td>tempo</td> </tr>
</table>
<br/>
<table>
<tr> <th colspan="2">artists</th> </tr>
<tr> <td>artist_id</td> <td>name</td> </tr>
</table>

<br/>
<table>
<tr> <th colspan="2">languages</th> </tr>
<tr> <td>language_id</td> <td>language</td> </tr>
</table>

<br/>
<table>
<tr> <th colspan="2">song_artist</th> </tr>
<tr> <td>song_id</td> <td>artist_id</td> </tr>
</table>

<br/>
<table>
<tr> <th colspan="2">song_language</th> </tr>
<tr> <td>song_id</td> <td>language_id</td> </tr>
</table>
<br/>

<table>
<tr> <th colspan="2">playlists</th> </tr>
<tr> <td>playlist_id</td> <td>name</td> </tr>
</table>

<br/>
<table>
<tr> <th colspan="2">song_playlist</th> </tr>
<tr> <td>song_id</td> <td>playlist_id</td> </tr>
</table>


## dbConfig.conf
dbConfig holds all information about location of files related to database.

* files containing tables
  * songs =         ./data/songs.txt
  * artists =       ./data/artists.txt
  * languages =     ./data/languages.txt
  * song_artist =   ./data/song_artist.txt
  * song_language = ./data/song_language.txt
  * playlists =     ./data/playlists.txt
  * song_playlist = ./data/song_playlist.txt
* directory of files containing lyrics and chords
  * songsFiles = ./data/songs

## Songs

The main song files are located in `./songs` folder.

Paragraphs are recognized by server by `[1%]` identifier, where at the place of '1' can be used any string which will be displayed to user. after '%' character goes lyrics of paragraph: `[1%here comes lyrics of paragraph]`.

If there is a paragraph that is contained multiple times, it is initialized only once, and then only the paragraph identifier is used.
```
[R% text of chorus]
[R%]  // here will be automatically inserted R paragraph again
```

Chords are recognized by `\*` characters. `*C*` will be on frontend removed from line and placed above at the correct position.
