import { Router } from "express";
import { checkParticipacionMO } from "../scraper/MO/participacionMO.scraper";

const router = Router();

// MISMO endpoint, ahora POST con body {desde, hasta}
router.post("/participacion/mo", async (req, res) => {
     console.log("📥 POST /scrape/participacion/mo");
     const { desde, hasta } = req.body || {};
     const result = await checkParticipacionMO(desde && hasta ? { desde, hasta } : undefined);
     res.status(result.ok ? 200 : 500).json(result);
});

export default router;
