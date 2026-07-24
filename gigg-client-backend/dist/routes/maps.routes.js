"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const maps_controller_1 = require("../controllers/maps.controller");
const router = (0, express_1.Router)();
// We remove requireAuth so the Registration flow can use these endpoints without a token
// Place search autocomplete (India only)
router.get('/autocomplete', maps_controller_1.autocomplete);
// Get lat/lng for a selected place
router.get('/place', maps_controller_1.placeDetails);
// Get address/city/area from lat/lng
router.get('/reverse-geocode', maps_controller_1.reverseGeocodeHandler);
exports.default = router;
//# sourceMappingURL=maps.routes.js.map