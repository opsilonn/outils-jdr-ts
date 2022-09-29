import { Router } from "express";
import audioRouter from "./audio";
import competenceRouter from "./competences";
import playlistRouter from "./playlists";

const router = Router();
router.use("/", audioRouter);
router.use("/", competenceRouter);
router.use("/", playlistRouter);

export default router;

