// cet import ne fonctionne pas à la compilation
// import PlaylistCRUD from "~/server/models/playlist.model";
import express from "express";
import PlaylistCRUD from "../../models/playlist.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function deletePlaylistAudio(req: express.Request, res: express.Response): Promise<void> {
  try {
    const playlist = await PlaylistCRUD.deleteItem(
      req.params.idPlaylist,
      req.params.idItem
    );
    res.status(200).json(playlist);
  } catch (err: any) {
    console.log(err);
    res.status(404).json(err.message);
  }
}
