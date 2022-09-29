// import PlaylistCRUD from "~/server/models/playlist.model";
import PlaylistCRUD from "../../models/playlist.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function putPlaylistAudio(req: any, res: any): Promise<void> {
  try {
    const playlist = await PlaylistCRUD.updatePlaylistItem(req.params.idPlaylist, req.params.idItem, req.body);
    res.status(200).json(playlist);
  } catch (err: any) {
    res.status(404).json(err.message);
  }
}
