const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { 
    createInventoryController,
    getInventoryController,
    getDonarsController,
    getHospitalController,
    getOrganisationController,
    getOrganisationForHospitalController,
    getInventoryHospitalController,
    getRecentInventoryController
    
} = require('../controllers/inventoryController');

const router = express.Router();

// Add inventory
router.post('/create-inventory', authMiddleware, createInventoryController);

// Get all blood records
router.get('/get-inventory', authMiddleware, getInventoryController);

//get recent blood records
router.get('/get-recent-inventory', authMiddleware, getRecentInventoryController);



// Get hospital blood records
router.post('/get-inventory-hospital', authMiddleware, getInventoryHospitalController);



// Get donar  records
router.get('/get-donars', authMiddleware, getDonarsController);

// Get hospital  records
router.get('/get-hospitals', authMiddleware, getHospitalController);

// Get organisation  records
router.get('/get-organisation', authMiddleware, getOrganisationController);

// Get organisation  records
router.get('/get-organisation-for-hospital', authMiddleware, getOrganisationForHospitalController);

module.exports = router;
