// import PlaylistCRUD from "~/server/models/playlist.model";
import PlaylistCRUD from "../../models/playlist.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function deletePlaylist(req: any, res: any): Promise<void> {
  try {
    await PlaylistCRUD.delete(req.params.idPlaylist);
    res.status(204).json(true);
  } catch (err: any) {
    console.log(err);
    res.status(404).json(err.message);
  }
}
