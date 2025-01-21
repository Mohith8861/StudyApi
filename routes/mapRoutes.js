const express = require("express");
const router = express.Router();
const mapController = require("../controller/mapController");

router.post("/", mapController.createMapping);
router.get("/entity/:entityId", mapController.getMappingsByEntity);
router.get("/resource/:resourceId", mapController.getMappingsByResource);
router.delete("/:id", mapController.deleteMapping);
router.delete("/entity/:entityId", mapController.deleteEntityMappings);

module.exports = router;
