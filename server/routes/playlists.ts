import { Router } from "express";
// Playlist
import getPlaylist from "../controllers/playlist/get.playlist";
import getPlaylistSaved from "../controllers/playlist/get.playlist.saved";
import postPlaylist from "../controllers/playlist/post.playlist";
import putPlaylist from "../controllers/playlist/put.playlist";
import putPlaylistMove from "../controllers/playlist/put.playlist.move";
import putPlaylistReset from "../controllers/playlist/put.playlist.reset";
import putPlaylistSave from "../controllers/playlist/put.playlist.save";
import deletePlaylist from "../controllers/playlist/delete.playlist";
// Playlist's audio
import postPlaylistAudio from "../controllers/playlist/post.playlist.audio";
import putPlaylistAudio from "../controllers/playlist/put.playlist.audio";
import deletePlaylistAudio from "../controllers/playlist/delete.playlist.audio";
import putPlaylistItemMove from "../controllers/playlist/put.playlist.audio.move";
import getPlaylists from "../controllers/playlist/get.playlists";

const router = Router();
// Playlist
router.get("/playlists", getPlaylists);
router.get("/playlist/:idPlaylist", getPlaylist);
router.get("/playlist/:idPlaylist/saved", getPlaylistSaved);
router.post("/playlist", postPlaylist);
router.put("/playlists/move", putPlaylistMove);
router.put("/playlist/:idPlaylist", putPlaylist);
router.put("/playlist/:idPlaylist/reset", putPlaylistReset);
router.put("/playlist/:idPlaylist/save", putPlaylistSave);
router.delete("/playlist/:idPlaylist", deletePlaylist);
// Playlist's audio
router.post("/playlist/:idPlaylist/audio", postPlaylistAudio);
router.put("/playlist/:idPlaylist/audio/:idItem", putPlaylistAudio);
router.put("/playlist/:idPlaylist/audio/:idItem/move", putPlaylistItemMove);
router.delete("/playlist/:idPlaylist/audio/:idItem", deletePlaylistAudio);

export default router;
