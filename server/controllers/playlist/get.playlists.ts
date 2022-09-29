// import PlaylistCRUD from "~/server/models/playlist.model";
import PlaylistCRUD from "../../models/playlist.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function getPlaylists(req: any, res: any): Promise<void> {
  try {
    const playlists = await PlaylistCRUD.getAll();
    res.status(200).json(playlists);
  } catch (err: any) {
    res.status(404).json(err.message);
  }
}
