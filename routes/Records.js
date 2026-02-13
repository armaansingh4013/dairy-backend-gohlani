const express = require("express");
const { addRecord, getRecords, getShiftRecords, getCustomerRecordsByDateRange, getRecordsByShift, deleteRecord, getAllCustomerRecordsByDateRange } = require("../controllers/Record");

const router = express.Router();

router.post("/add-record", addRecord);
router.get("/get-records", getRecords);
router.get("/records/get",getShiftRecords)
router.get("/records/customer",getCustomerRecordsByDateRange)
router.get("/records/shift",getRecordsByShift)
router.delete("/records/delete",deleteRecord)
router.get("/records/daterange",getAllCustomerRecordsByDateRange)
module.exports = router;
