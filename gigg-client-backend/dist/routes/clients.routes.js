"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const clients_controller_1 = require("../controllers/clients.controller");
const router = (0, express_1.Router)();
router.post('/redeem', clients_controller_1.redeemInvite);
router.post('/invite', auth_1.requireAuth, clients_controller_1.inviteClient);
router.get('/my-jobs', auth_1.requireAuth, clients_controller_1.myClientJobs);
router.delete('/:jobClientId', auth_1.requireAuth, clients_controller_1.revokeClient);
exports.default = router;
//# sourceMappingURL=clients.routes.js.map