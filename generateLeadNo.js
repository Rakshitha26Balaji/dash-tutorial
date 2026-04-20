/**
 * Generates a unique reference number
 * Format: ML-BEL-BG-SW-YYYY-00001
 */

import { Op, Sequelize } from "sequelize";

const generateUniqLeadNo = async (
  leadModel,
  company = "BEL",
  unit = "BG",
  sbu = "SW",
  leadType = "DOM"
) => {
  try {
    if (!leadModel) {
      return "lead model is required";
    }
    const prefix = "ML";
    const currentYear = new Date().getFullYear().toString();

    // 1. Create the pattern prefix to search for: "ML-BEL-BG-SW-2026-"
    // This ensures we only look for leads within the SAME year and SAME structure
    const searchPattern = `${prefix}-${company}-${unit}-${sbu}-${leadType}-${currentYear}-%`;

    // 2. Find the latest lead that matches this pattern
    // We sort by leadReferenceNo descending to get the highest current number
    const lastLead = await leadModel.findOne({
      where: Sequelize.where(
        // This forces the column to be treated as TEXT
        Sequelize.cast(Sequelize.col("leadReferenceNo"), "TEXT"),
        {
          // This forces the pattern to be treated as TEXT and uses LIKE
          [Op.like]: searchPattern,
        }
      ),
      order: [["leadReferenceNo", "DESC"]],
    });
    // const lastLead = {
    //   leadReferenceNo: "ML-BEL-BG-SW-YYYY-00001",
    // };
    console.log("last lead in the system : ",lastLead)

    let nextSequence = 1;

    if (lastLead && lastLead.leadReferenceNo) {
      // 2. Extract the last 5 digits using split or regex
      // Example: "ML-BEL-BG-SW-2024-00005" -> "00005"
      const parts = lastLead.leadReferenceNo.split("-");
      const lastSequenceStr = parts[parts.length - 1];
      nextSequence = parseInt(lastSequenceStr, 10) + 1;
    }

    // 3. Pad the sequence with leading zeros (e.g., 1 becomes "00001")
    const paddedSequence = nextSequence.toString().padStart(5, "0");
    // 4. Construct the final string
    const nextReferenceNo = `ML-${company}-${unit}-${sbu}-${leadType}-${currentYear}-${paddedSequence}`;
    console.log("nextReferenceNo : ", nextReferenceNo);
    return nextReferenceNo;
  } catch (error) {
    throw error;
  }
};

export default generateUniqLeadNo;

/**
  Find the latest lead created in the current year to get the last sequence
  We search for leads where the reference contains the current year
    const lastLead = await domesticLeadsModel
      .findOne({
        leadReferenceNo: new RegExp(`${prefix}.*${currentYear}-\\d{5}$`),
      })
      .sort({ createdAt: -1 }); // Get the most recent one
    const lastLead = {
      leadReferenceNo: "ML-BEL-BG-SW-YYYY-00023",
    };
*/
