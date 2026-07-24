"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reverseGeocodeHandler = reverseGeocodeHandler;
exports.autocomplete = autocomplete;
exports.placeDetails = placeDetails;
const zod_1 = require("zod");
const maps_service_1 = require("../services/maps.service");
// GET /api/maps/reverse-geocode?lat=...&lng=...
async function reverseGeocodeHandler(req, res) {
    const result = zod_1.z.object({ lat: zod_1.z.string(), lng: zod_1.z.string() }).safeParse(req.query);
    if (!result.success) {
        res.status(400).json({ error: 'lat and lng are required' });
        return;
    }
    try {
        const lat = parseFloat(result.data.lat);
        const lng = parseFloat(result.data.lng);
        const details = await (0, maps_service_1.reverseGeocode)(lat, lng);
        res.json(details);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// GET /api/maps/autocomplete?input=...&session=...
async function autocomplete(req, res) {
    const input = req.query.input;
    const session = req.query.session;
    if (!input || input.length < 2) {
        res.json({ predictions: [] });
        return;
    }
    try {
        const predictions = await (0, maps_service_1.placesAutocomplete)(input, session);
        res.json({ predictions });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
// GET /api/maps/place?placeId=...
async function placeDetails(req, res) {
    const result = zod_1.z.object({ placeId: zod_1.z.string().min(1) }).safeParse(req.query);
    if (!result.success) {
        res.status(400).json({ error: 'placeId is required' });
        return;
    }
    try {
        const details = await (0, maps_service_1.getPlaceDetails)(result.data.placeId);
        res.json(details);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}
//# sourceMappingURL=maps.controller.js.map