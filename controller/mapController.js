const Map = require("../models/map");
const Roadmap = require("../models/roadmap");

class MapController {
  // Create a new mapping
  async createMapping(req, res) {
    try {
      const { entityId, entityType, resourceId } = req.body;

      // Check if mapping already exists
      const existingMapping = await Map.findOne({
        entityId,
        resourceId,
      });

      if (existingMapping) {
        return res.status(400).json({
          success: false,
          error: "Mapping already exists",
        });
      }

      const mapping = new Map({
        entityId,
        entityType,
        resourceId,
      });

      const savedMapping = await mapping.save();
      res.status(201).json({
        success: true,
        data: savedMapping,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all mappings for a specific entity
  async getMappingsByEntity(req, res) {
    try {
      const { entityId, entityType } = req.params;

      const mappings = await Map.find({
        entityId,
        entityType,
      });

      res.status(200).json({
        success: true,
        count: mappings.length,
        data: mappings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Get all mappings for a specific resource
  async getMappingsByResource(req, res) {
    try {
      const { resourceId } = req.params;

      const mappings = await Map.find({ resourceId });

      res.status(200).json({
        success: true,
        count: mappings.length,
        data: mappings,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete a specific mapping
  async deleteMapping(req, res) {
    try {
      const { entityId, resourceId } = req.params;

      const deletedMapping = await Map.findOneAndDelete({
        entityId,
        resourceId,
      });

      if (!deletedMapping) {
        return res.status(404).json({
          success: false,
          error: "Mapping not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Mapping deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  // Delete all mappings for an entity
  async deleteEntityMappings(req, res) {
    try {
      const { entityId, entityType } = req.params;

      const result = await Map.deleteMany({ entityId, entityType });

      if (result.deletedCount === 0) {
        return res.status(404).json({
          success: false,
          error: "No mappings found for this entity",
        });
      }

      res.status(200).json({
        success: true,
        message: `Deleted ${result.deletedCount} mappings`,
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }
}

module.exports = new MapController();
