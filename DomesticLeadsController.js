import db from "../models/index.js";
import generateUniqLeadNo from "../services/generateLeadNo.js";
import { logHistory, logBulkHistory } from "../services/historyService.js";
const DomesticLeadsModel = db.DomesticLeadsModel;
const DomesticLeadsHistoryModel = db.DomesticLeadsHistoryModel;

import { Op, Sequelize } from "sequelize";

export const CreateDomesticLeadsBulk = async (req, res) => {
  try {
    const BulkData = req.body.excelData;
    console.log("CreateDomesticLeadsBulk service Bulk called", BulkData);

    const { OperatorId, OperatorName } = req.body;

    if (!BulkData || BulkData.length === 0) {
      return res.status(400).json({
        success: false,
        data: [],
        message: "No data provided for bulk upload",
        error: {},
      });
    }

    // 🔥 STATIC PREFIX CONFIG
    const prefix = "ML";
    const company = "BEL";
    const unit = "BG";
    const sbu = "SW";
    const leadType = "DOM";
    const currentYear = new Date().getFullYear();

    // 🔥 STEP 1: FILTER ONLY CURRENT YEAR + PATTERN
    const searchPattern = `${prefix}-${company}-${unit}-${sbu}-${leadType}-${currentYear}-%`;

    const lastLead = await DomesticLeadsModel.findOne({
      attributes: ["leadReferenceNo"],
      where: Sequelize.where(
        Sequelize.cast(Sequelize.col("leadReferenceNo"), "TEXT"),
        {
          [Op.like]: searchPattern,
        },
      ),
      order: [["leadReferenceNo", "DESC"]],
    });

    // 🔥 DEBUG LOG (VERY USEFUL)
    console.log("Last Lead Found:", lastLead?.leadReferenceNo);

    let nextSequence = 1;

    if (lastLead && lastLead.leadReferenceNo) {
      const parts = lastLead.leadReferenceNo.split("-");
      const lastSeq = parts[parts.length - 1];
      nextSequence = parseInt(lastSeq, 10) + 1;
    }

    console.log("Next Sequence Starts From:", nextSequence);

    // 🔥 STEP 2: Generate UNIQUE leadReferenceNo
    const processedData = BulkData.map((row, index) => {
      const sequence = (nextSequence + index).toString().padStart(5, "0");

      const leadReferenceNo = `${prefix}-${company}-${unit}-${sbu}-${leadType}-${currentYear}-${sequence}`;

      return {
        ...row,
        leadReferenceNo,
      };
    });

    console.log("Generated Bulk Data:", processedData);

    // 🔥 STEP 3: BULK INSERT
    const insertedRecords = await DomesticLeadsModel.bulkCreate(processedData, {
      validate: true,
    });

    // 🔥 STEP 4: HISTORY LOGGING
    await logBulkHistory(
      DomesticLeadsHistoryModel,
      insertedRecords,
      OperatorId,
      OperatorName,
    );

    res.status(200).json({
      success: true,
      data: insertedRecords,
      message: "All records inserted successfully with leadReferenceNo",
      error: {},
    });
  } catch (error) {
    console.error("Error has encountered...", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        data: [],
        message: "Duplicate key value violates unique constraint",
        error: error,
      });
    }

    return res.status(500).json({
      success: false,
      data: [],
      message: "An error occurred",
      error: error,
    });
  }
};

export const GetDomesticLeads = (request, response) => {
  DomesticLeadsModel.findAll({
    raw: true,
  })
    .then((data) => {
      console.log("DomesticLeadsModel Data", data);
      response.status(200).json({
        success: true,
        data: data,
        message: "data is successfully matched",
        error: {},
      });
    })
    .catch((err) => {
      console.log(err); //read from CSV

      response.status(500).json({
        success: false,
        data: [],
        message: "No data found for GetBudgetaryQuotation",
        error: err,
      });
    });
};

export const CreateDomesticLeads = async (req, res) => {
  try {
    // const DomesticLeadsModelData = {
    //   bqTitle: req.body.bqTitle,
    //   customerName: req.body.customerName,
    //   customerAddress: req.body.customerAddress,
    //   leadOwner: req.body.leadOwner,
    //   defenceAndNonDefence: req.body.defenceAndNonDefence,
    //   estimateValueInCrWithoutGST: req.body.estimateValueInCrWithoutGST,
    //   submittedValueInCrWithoutGST: req.body.submittedValueInCrWithoutGST,
    //   dateOfLetterSubmission: req.body.dateOfLetterSubmission,
    //   referenceNo: req.body.tenderReferenceNo,
    //   JSON_competitors: req.body.JSON_competitors,
    //   presentStatus: req.body.presentStatus,
    //   OperatorId: req.body.OperatorId,
    //   OperatorName: req.body.OperatorName,
    //   OperatorRole: req.body.OperatorRole,
    //   OperatorSBU: req.body.OperatorSBU,
    // };

    const newLeadReferenceNo = await generateUniqLeadNo(
      DomesticLeadsModel,
      "BEL",
      "BG",
      "SW",
      "DOM",
    );
    console.log("req body create of domestic controller : ", req.body);
    const data = await DomesticLeadsModel.create({
      ...req.body,
      leadReferenceNo: newLeadReferenceNo,
    });

    // Log to history
    await logHistory(
      DomesticLeadsHistoryModel,
      data.id,
      "ADDED",
      req.body.OperatorId,
      req.body.OperatorName,
      null,
      data.toJSON(),
    );

    console.log("Success");
    res.status(200).json({
      success: true,
      data: data,
      message: "The Record inserted successfully",
      error: {},
    });
  } catch (err) {
    console.log("Error while saving CreateDomesticLeads : ", err);
    res.status(500).send({
      success: false,
      data: [],
      message:
        err.message || "Some error occurred while Create Domestic Leads Data.",
      error: err,
    });
  }
};

export const UpdateDomesticLead = async (req, res) => {
  try {
    console.log("req.body from UpdateDomesticLead : ", req.body);

    const id = req.body["id"];

    // Validate that id is provided
    if (!id) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Quotation ID is required",
        error: {},
      });
    }

    const domesticLead = await DomesticLeadsModel.findByPk(id);

    if (!domesticLead) {
      return res.status(404).json({
        success: false,
        data: null,
        message: `Quotation with ID ${id} not found and is not valid`,
      });
    }

    // Store old data before update
    const previousData = domesticLead.toJSON();
    console.log(" previousData by primaryKey : ", previousData);

    const queryData = req.body;
    console.log("queryData TO UPDATE : ", queryData);

    const updatedQuotation = await domesticLead.update(queryData);

    // Log to history with old and new data
    await logHistory(
      DomesticLeadsHistoryModel,
      id,
      "UPDATED",
      queryData.OperatorId,
      queryData.OperatorName,
      previousData,
      updatedQuotation.toJSON(),
    );

    res.status(200).json({
      success: true,
      data: updatedQuotation,
      message: "Domestic Lead updated successfully",
      error: {},
    });
  } catch (error) {
    console.error("Error updating Domestic Lead:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Reference number already exists",
        error: error.message,
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Validation error",
        error: error.errors.map((e) => e.message),
      });
    }

    res.status(500).json({
      success: false,
      data: null,
      message: "Error updating Domestic Lead",
      error: error.message,
    });
  }
  // }
};

export const DeleteDomesticLead = async (req, res) => {
  try {
    const id = req.body["id"];

    if (!id) {
      return res.status(400).json({
        success: false,
        data: null,
        message: "Quotation ID is required",
      });
    }

    const quotation = await DomesticLeadsModel.findByPk(id);

    if (!quotation) {
      return res.status(404).json({
        success: false,
        data: null,
        message: `Quotation with ID ${id} not found`,
      });
    }

    const recordData = quotation.toJSON();

    // Log to history before delete
    await logHistory(
      DomesticLeadsHistoryModel,
      id,
      "DELETED",
      quotation.OperatorId,
      quotation.OperatorName,
      recordData,
      null,
    );

    await quotation.destroy();

    res.status(200).json({
      success: true,
      data: null,
      message: "Domestic Leads deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Domestic Leads:", error);

    res.status(500).json({
      success: false,
      data: null,
      message: "Error deleting Domestic Leads",
      error: error.message,
    });
  }
};

export const GetDomesticLeadsFilters = async (req, res) => {
  try {
    // 1. Get Distinct Tender Type options
    const typeData = await DomesticLeadsModel.findAll({
      attributes: [
        [
          db.Sequelize.fn("DISTINCT", db.Sequelize.col("tenderType")),
          "colValue",
        ],
      ],
      raw: true,
    });

    const defenceData = await DomesticLeadsModel.findAll({
      attributes: [
        [
          db.Sequelize.fn("DISTINCT", db.Sequelize.col("defenceOrNonDefence")),
          "colValue",
        ],
      ],
      raw: true,
    });

    // 2. Get Distinct Status options
    const statusData = await DomesticLeadsModel.findAll({
      attributes: [
        [
          db.Sequelize.fn("DISTINCT", db.Sequelize.col("presentStatus")),
          "colValue",
        ],
      ],
      raw: true,
    });

    // Get Distinct Doc Type options
    const docData = await DomesticLeadsModel.findAll({
      attributes: [
        [
          db.Sequelize.fn("DISTINCT", db.Sequelize.col("documentType")),
          "colValue",
        ],
      ],
      raw: true,
    });

    // Get Distinct Domain Type options
    const domainData = await DomesticLeadsModel.findAll({
      attributes: [
        [
          db.Sequelize.fn("DISTINCT", db.Sequelize.col("businessDomain")),
          "colValue",
        ],
      ],
      raw: true,
    });

    // Get Distinct Open/Closed Type options
    const openData = await DomesticLeadsModel.findAll({
      attributes: [
        [
          db.Sequelize.fn("DISTINCT", db.Sequelize.col("openClosed")),
          "colValue",
        ],
      ],
      raw: true,
    });

    // Get Distinct Won/Lost Type options
    const wonLostData = await DomesticLeadsModel.findAll({
      attributes: [
        [
          db.Sequelize.fn("DISTINCT", db.Sequelize.col("wonLostParticipated")),
          "colValue",
        ],
      ],
      raw: true,
    });

    // 3. Extract values and remove nulls/undefined
    const type = typeData
      .map((item) => item.colValue)
      .filter((v) => v !== null && v !== undefined && v !== "");

    const status = statusData
      .map((item) => item.colValue)
      .filter((v) => v !== null && v !== undefined && v !== "");

    const defence = defenceData
      .map((item) => item.colValue)
      .filter((v) => v !== null && v !== undefined && v !== "");

    const doc = docData
      .map((item) => item.colValue)
      .filter((v) => v !== null && v !== undefined && v !== "");

    const domain = domainData
      .map((item) => item.colValue)
      .filter((v) => v !== null && v !== undefined && v !== "");

    const open = openData
      .map((item) => item.colValue)
      .filter((v) => v !== null && v !== undefined && v !== "");

    const wonLost = wonLostData
      .map((item) => item.colValue)
      .filter((v) => v !== null && v !== undefined && v !== "");

    // 4. Return the data
    res.status(200).json({
      success: true,
      data: {
        type: type,
        status: status,
        defence: defence,
        doc: doc,
        domain: domain,
        open: open,
        wonLost: wonLost,
      },
    });
  } catch (error) {
    console.error("Filter Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch filters",
      error: error.message,
    });
  }
};

// export const GetLeadByRefNo = async (req, res) => {
//   try {
//     const { refNo } = req.params;

//     const lead = await DomesticLeadsModel.findOne({
//       where: { leadReferenceNo: refNo }
//     });

//     if (!lead) {
//       return res.status(404).json({ success: false, message: "Lead not found" });
//     }

//     return res.status(200).json({ success: true, data: lead });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
