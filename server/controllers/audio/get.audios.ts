// cet import ne fonctionne pas à la compilation
// import AudioCRUD from "~/server/models/audio.model";
import AudioCRUD from "../../models/audio.model";

/**
 * @param { import('express').Request } req
 * @param { import('express').Response } res
 */
export default async function getAudioFiles(req: any, res: any): Promise<void> {
  try {
    const audioFiles = await AudioCRUD.getAll();
    res.status(200).json(audioFiles);
  } catch (err: any) {
    res.status(404).json(err.message);
  }
}
