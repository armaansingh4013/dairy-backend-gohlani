const Record = require ('../models/Record');

// Add a new milk entry
const addRecord = async (req, res) => {
  try {
    const newEntry = new Record (req.body.data);
    await newEntry.save ();
    res.status (201).json ({message: 'Entry saved successfully'});
  } catch (err) {
    res.status (500).json ({error: err.message});
  }
};

// Get all milk entries
const getRecords = async (req, res) => {
  try {
    const entries = await Record.find ().sort ({createdAt: -1});
    res.json (entries);
  } catch (err) {
    res.status (500).json ({error: err.message});
  }
};

// Get all milk entries
const getShiftRecords = async (req, res) => {
  try {
    const now = new Date ();
    // const startOfDay = new Date(now.setHours(0, 0, 0, 0)); // Midnight today
    // const noon = new Date(now.setHours(12, 0, 0, 0)); // 12 PM today
    // const endOfDay = new Date(now.setHours(23, 59, 59, 999)); // End of today
    const startOfDay = new Date (now);
    startOfDay.setHours (0, 0, 0, 0);

    const noon = new Date (now);
    noon.setHours (12, 0, 0, 0);

    const endOfDay = new Date (now);
    endOfDay.setHours (23, 59, 59, 999);

    let startTime, endTime;

    if (now.getHours () < 12) {
      // If request is made in the morning (before 12 PM)
      startTime = startOfDay;
      endTime = noon;
    } else {
      // If request is made in the afternoon/evening (12 PM and later)
      startTime = noon;
      endTime = endOfDay;
    }

    const records = await Record.find ({
      createdAt: {$gte: startTime, $lt: endTime},
    });

    res.json (records);
  } catch (error) {
    res.status (500).json ({error: 'Server error', details: error.message});
  }
};

const getRecordsByShift = async (req, res) => {
  try {
    const {date, shift} = req.query;

    if (!date || !shift) {
      return res.status (400).json ({error: 'Date and shift are required.'});
    }

    // Parse the entered date
    const selectedDate = new Date (date);
    if (isNaN (selectedDate)) {
      return res
        .status (400)
        .json ({error: 'Invalid date format. Use YYYY-MM-DD.'});
    }

    // Define time range for the shift
    const startOfDay = new Date (selectedDate.setHours (0, 0, 0, 0)); // Midnight
    const noon = new Date (selectedDate.setHours (12, 0, 0, 0)); // 12 PM
    const endOfDay = new Date (selectedDate.setHours (23, 59, 59, 999)); // End of day

    let startTime, endTime;
    if (shift.toLowerCase () === 'morning') {
      startTime = startOfDay;
      endTime = noon;
    } else if (shift.toLowerCase () === 'evening') {
      startTime = noon;
      endTime = endOfDay;
    } else {
      return res
        .status (400)
        .json ({error: "Invalid shift. Use 'morning' or 'evening'."});
    }

    // Query database
    const records = await Record.find ({
      createdAt: {$gte: startTime, $lt: endTime},
    });

    res.json (records);
  } catch (error) {
    res.status (500).json ({error: 'Server error', details: error.message});
  }
};
const getCustomerRecordsByDateRange = async (req, res) => {
  try {
    const {customerNumber, startDate, endDate} = req.query;

    if (!customerNumber || !startDate || !endDate) {
      return res
        .status (400)
        .json ({
          error: 'Customer number, start date, and end date are required.',
        });
    }

    // Parse the dates
    const start = new Date (startDate);
    const end = new Date (endDate);
    if (isNaN (start) || isNaN (end)) {
      return res
        .status (400)
        .json ({error: 'Invalid date format. Use YYYY-MM-DD.'});
    }

    // Ensure end date includes the full day
    end.setHours (23, 59, 59, 999);

    // Query database
    const records = await Record.find ({
      customerNumber: customerNumber,
      createdAt: {$gte: start, $lte: end},
    });

    // Format response to include date and shift dynamically based on record timestamps
    const formattedRecords = records.map (record => {
      const datetime = record.createdAt.toISOString ().split ('T');
      const recordDate = datetime[0]; // Extract date (YYYY-MM-DD)
      const recordHour = datetime[1].split (':')[0]; // Get hour of record creation

      let shift;
      if (recordHour < 12) {
        shift = 'morning'; // Before 12 PM
      } else {
        shift = 'evening'; // After 12 PM
      }

      return {
        ...record.toObject (), // Convert Mongoose document to plain object
        date: recordDate,
        shift: shift,
      };
    });

    res.json (formattedRecords);
  } catch (error) {
    res.status (500).json ({error: 'Server error', details: error.message});
  }
};

const deleteRecord = async (req, res) => {
  try {
    const {id} = req.query;
    if (!id) {
      return res.status (400).json ({error: 'Record ID is required.'});
    }

    // Find and delete the record
    const deletedRecord = await Record.findByIdAndDelete (id);

    if (!deletedRecord) {
      return res.status (404).json ({error: 'Record not found.'});
    }

    res.json ({message: 'Record deleted successfully.', deletedRecord});
  } catch (error) {
    res.status (500).json ({error: 'Server error', details: error.message});
  }
};

// const getAllCustomerRecordsByDateRange = async (req, res) => {
//   try {
//     const {startDate, endDate} = req.query;

//     if (!startDate || !endDate) {
//       return res
//         .status (400)
//         .json ({error: 'Start date and end date are required.'});
//     }

//     const start = new Date (startDate);
//     const end = new Date (endDate);
//     if (isNaN (start) || isNaN (end)) {
//       return res
//         .status (400)
//         .json ({error: 'Invalid date format. Use YYYY-MM-DD.'});
//     }

//     end.setHours (23, 59, 59, 999);

//     const customers = await Record.distinct ('customerNumber');

//     customers.sort ((a, b) => a - b);

//     const result = [];

    
//     await customers.map (async customer => {
//       const start = new Date (startDate);
//       const end = new Date (endDate);
//       if (isNaN (start) || isNaN (end)) {
//         return res
//           .status (400)
//           .json ({error: 'Invalid date format. Use YYYY-MM-DD.'});
//       }
      
//       end.setHours (23, 59, 59, 999);

//       const records = await Record.find ({
//         customerNumber: customer,
//         createdAt: {$gte: start, $lte: end},
//       });
      
//       const formattedRecords = records.map (record => {
//         const datetime = record.createdAt.toISOString ().split ('T');
//         const recordDate = datetime[0];  
//         const recordHour = datetime[1].split (':')[0];  

//         let shift;
//         if (recordHour < 12) {
//           shift = 'morning';  
//         } else {
//           shift = 'evening';  
//         }

//         return {
//           ...record.toObject (),  
//           date: recordDate,
//           shift: shift,
//         };
//       });

//       console.log(formattedRecords)
//       result.push (formattedRecords);
//     });
 
//     res.json (result);
//   } catch (error) {
//     res.status (500).json ({error: 'Server error', details: error.message});
//   }
// };

const getAllCustomerRecordsByDateRange = async (req, res) => {
    try {
      const { startDate, endDate } = req.query;
  
      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required.' });
      }
  
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (isNaN(start) || isNaN(end)) {
        return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
      }
  
      end.setHours(23, 59, 59, 999);
  
      const customers = await Record.distinct('customerNumber');
      customers.sort((a, b) => a - b);
  
      const result = [];
  
      for (const customer of customers) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        if (isNaN(start) || isNaN(end)) {
          return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD.' });
        }
        
        end.setHours(23, 59, 59, 999);
  
        const records = await Record.find({
          customerNumber: customer,
          createdAt: { $gte: start, $lte: end },
        });
  
        const formattedRecords = records.map(record => {
          const datetime = record.createdAt.toISOString().split('T');
          const recordDate = datetime[0];
          const recordHour = datetime[1].split(':')[0];
  
          let shift;
          if (recordHour < 12) {
            shift = 'morning';
          } else {
            shift = 'evening';
          }
  
          return {
            ...record.toObject(),
            date: recordDate,
            shift: shift,
          };
        });
  
        console.log(formattedRecords);
        result.push(formattedRecords);
      }
  
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: 'Server error', details: error.message });
    }
  };

module.exports = {
  addRecord,
  getRecords,
  getShiftRecords,
  getCustomerRecordsByDateRange,
  getRecordsByShift,
  deleteRecord,
  getAllCustomerRecordsByDateRange,
};
