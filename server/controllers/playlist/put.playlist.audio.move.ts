// import PlaylistCRUD from "~/server/models/playlist.model";
import express from "express";
import PlaylistCRUD from "../../models/playlist.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function putPlaylistItemMove(req: express.Request, res: express.Response): Promise<void> {
  try {
    const playlist = await PlaylistCRUD.movePlaylistItem(
      req.params.idPlaylist,
      req.params.idItem,
      req.body.idFolderToMoveTo,
      parseInt(req.body.newIndex)
    );
    res.status(200).json(playlist);
  } catch (err: any) {
    res.status(404).json(err.message);
  }
}
