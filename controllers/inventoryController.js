const mongoose = require("mongoose");
const inventoryModel = require("../models/inventoryModel");
const userModel = require("../models/userModel");

// Create inventory
const createInventoryController = async (req, res) => {
    try {
        const { email } = req.body;

        // Validate user existence
        const user = await userModel.findOne({ email });
        if (!user) {
            throw new Error('User not found');
        }

        /* Uncomment if needed: Restrict non-hospitals from "out" inventory type */
        // if (inventoryType === "out" && user.role !== 'hospital') {
        //     throw new Error('Not a hospital');
        // }

        if (req.body.inventoryType === 'out') {
            const requestedBloodGroup = req.body.bloodGroup;
            const requestedQuantityOfBlood = req.body.quantity;
            const organisation = new mongoose.Types.ObjectId(req.body.userId);

            // Calculate blood quantity
            const totalInOfRequestedBlood = await inventoryModel.aggregate([
                {
                    $match: {
                        organisation,
                        inventoryType: 'in',
                        bloodGroup: requestedBloodGroup,
                    }
                },
                {
                    $group: {
                        _id: '$bloodGroup',
                        total: { $sum: '$quantity' },
                    },
                },
            ]);

            const totalIn = totalInOfRequestedBlood[0]?.total || 0;

            // Calculate total "out" blood quantity for the requested blood group
            const totalOutOfRequestedBloodGroup = await inventoryModel.aggregate([
                {
                    $match: {
                        organisation,
                        inventoryType: 'out',
                        bloodGroup: requestedBloodGroup
                    }
                },
                {
                    $group: {
                        _id: '$bloodGroup',
                        total: { $sum: '$quantity' }
                    }
                }
            ]);

            const totalOut = totalOutOfRequestedBloodGroup[0]?.total || 0;

            // Compute available blood quantity
            const availableQuantityOfBloodGroup = totalIn - totalOut;

            // Validate if enough blood is available
            if (availableQuantityOfBloodGroup < requestedQuantityOfBlood) {
                return res.status(500).send({
                    success: false,
                    message: `Only ${availableQuantityOfBloodGroup}ML of ${requestedBloodGroup.toUpperCase()} is available`
                });
            }

            // Assign hospital to request body
            req.body.hospital = user?._id;
        } else {
            req.body.donar = user?._id;
        }

        // Save inventory record
        const inventory = new inventoryModel(req.body);
        await inventory.save();

        return res.status(201).send({
            success: true,
            message: 'New Blood record added',
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in Create Inventory API',
            error,
        });
    }
};

// Get all blood records
const getInventoryController = async (req, res) => {
    try {
        const inventory = await inventoryModel.find({
            organisation: req.body.userId,
        })
            .populate('donar')
            .populate('hospital')
            .sort({ createdAt: -1 });

        return res.status(200).send({
            success: true,
            message: "Get all records successfully",
            inventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in get all Inventory',
            error,
        });
    }
};
// Get all HOSPITAL blood records
const getInventoryHospitalController = async (req, res) => {
    try {
        const inventory = await inventoryModel
            .find(req.body.filters)
            .populate('donar')
            .populate('hospital')
            .populate('organisation')
            .sort({ createdAt: -1 });

        return res.status(200).send({
            success: true,
            message: "Get hospital consumer records successfully",
            inventory,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in get consumer Inventory',
            error,
        });
    }
};
// get blood recprd of 3
const getRecentInventoryController = async (req,res) => {
    try {
        const inventory = await inventoryModel.find({
            organisation: req.body.userId,
        })
        .limit(3)
        .sort({ createdAt: -1 });
        return res.status(200).send({
            success: true,
            message: "recent Inventory Data",
            inventory,
        });

    } catch(error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error In Recent Inventory API',
            error,
        });

    }
};





// GET DONAR RECORDS
const getDonarsController = async (req, res) => {
    try {
        const organisation = req.body.userId;
        // find donars
        const donarId = await inventoryModel.distinct("donar", {
            organisation,
        });
        // console.log(donarId)
        const donars = await userModel.find({ _id: { $in: donarId } });
        return res.status(200).send({
            success: true,
            message: "Donar record fetched successfully",
            donars,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: "Error in Donar records",
            error,
        });
    }
};

const getHospitalController = async (req, res) => {
    try {
        const organisation = req.body.userId;
        // get hospital id
        const hospitalId = await inventoryModel.distinct('hospital', {
            organisation,
        });
        // find hospital
        const hospitals = await userModel.find({
            _id: { $in: hospitalId },
        });
        return res.status(200).send({
            success: true,
            message: "Hospitals data fetched Successfully",
            hospitals,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error in get Hospital API',
            error,
        });
    }
};

// get org profile
const getOrganisationController = async (req, res) => {
    try {
        const donar = req.body.userId;
        const orgId = await inventoryModel.distinct('organisation', { donar });
        // find org
        const organisations = await userModel.find({
            _id: { $in: orgId },
        });
        return res.status(200).send({
            success: true,
            message: 'Org Data Fetched Successfully',
            organisations,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error In ORG API',
            error,
        });
    }
};

// get org for hospital 
const getOrganisationForHospitalController = async (req, res) => {
    try {
        const hospital = req.body.userId;
        const orgId = await inventoryModel.distinct('organisation', { hospital });
        // find org
        const organisations = await userModel.find({
            _id: { $in: orgId },
        });
        return res.status(200).send({
            success: true,
            message: 'Hospital Org Data Fetched Successfully',
            organisations,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).send({
            success: false,
            message: 'Error In Hospital ORG API',
            error,
        });
    }
};

module.exports = {
    createInventoryController,
    getInventoryController,
    getDonarsController,
    getHospitalController,
    getOrganisationController,
    getOrganisationForHospitalController,
    getInventoryHospitalController,
    getRecentInventoryController,
};
