import { Router } from "express";

import auth from "../../middleware/auth.js";
import {
  downloadAutoExperiments,
  getAutoExperiments,
} from "../../controllers/v2/auto-experiments.js";

const router = Router();

router.get("/", auth, getAutoExperiments);
router.post("/download", auth, downloadAutoExperiments);

export default router;
