const express = require("express");
const router = express.Router();
const mapController = require("../controller/mapController");

router.post("/", mapController.createMapping);
router.get("/entity/:entityId/:entityType", mapController.getMappingsByEntity);
router.get("/resource/:resourceId", mapController.getMappingsByResource);
router.delete("/:entityId/:resourceId", mapController.deleteMapping);
router.delete(
  "/entity/:entityId/:entityType",
  mapController.deleteEntityMappings
);

module.exports = router;
