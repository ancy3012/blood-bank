const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const { getDonarsListController, getHospitalListController, getOrgListController, deleteDonarController } = require('../controllers/adminController');
const adminMiddleware = require('../middlewares/adminMiddleware');
//ROUTER OBJECT
const router = express.Router();

//routes

//GET || DONAR LIST
router.get('/donar-list', authMiddleware,adminMiddleware, getDonarsListController);

//GET || HOSPIATL LIST
router.get('/hospital-list', authMiddleware,adminMiddleware, getHospitalListController);

//GET || ORG LIST
router.get('/org-list', authMiddleware,adminMiddleware, getOrgListController);
//=============================

// DELETE DONAR || GET
router.delete('/delete-donar/:id',authMiddleware,adminMiddleware,deleteDonarController);




//export
module.exports = router;