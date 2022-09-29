// import PlaylistCRUD from "~/server/models/playlist.model";
import PlaylistCRUD from "../../models/playlist.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function postPlaylistAudio(req: any, res: any): Promise<void> {
  try {
    const playlist = await PlaylistCRUD.addPlaylistItem(
      req.params.idPlaylist,
      req.body.audioItem,
      req.body.idFolder,
      req.body.index
    );
    res.status(200).json(playlist);
  } catch (err: any) {
    res.status(404).json(err.message);
  }
}
