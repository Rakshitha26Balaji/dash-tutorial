import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Divider,
  Alert,
  Card,
  Tabs,
  Tab,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Table,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  CircularProgress,
  Checkbox,
  Menu,
} from "@mui/material";

import {
  SearchRounded,
  NorthRounded,
  SouthRounded,
  RestartAltRounded,
  EditRounded,
  DeleteRounded,
  CloseRounded,
} from "@mui/icons-material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import * as XLSX from "xlsx";
import axios from "axios";
import * as FileSaver from "file-saver";

import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloudQueueRoundedIcon from "@mui/icons-material/CloudQueueRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { Zoom } from "@mui/material";

import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";

const STATUS_OPTIONS = [
  "Participated-Won",
  "Not-Participated",
  "Participated-Lost",
  "Participated-Pursuing",
  "Pursuing",
];

const TENDER_TYPE_OPTIONS = ["ST", "MT", "LT"];

const tenderTypeOptions = ["ST", "MT"];
const civilDefenceOptions = ["Non Defence", "Defence"];
const businessDomainOptions = [
  "IT",
  "Electronics",
  "Telecom",
  "Construction",
  "Other",
];
const documentTypeOptions = [
  "RFP",
  "RFI",
  "RFE",
  "EoI",
  "BQ",
  "ST",
  "NIT",
  "RFQ",
];

const resultStatusOptions = [
  "Won",
  "Lost",
  "Participated",
  "Participated-Won",
  "Participated-Pursuing",
  "Participated-Lost",
  "Not Participated",
];

const openClosedOptions = ["Open", "Closed"];

const presentStatusOptions = [
  "BQ Submitted",
  "Commercial Bid Submitted",
  "EOI was submitted",
  "Not participated",
  " ",
];

const multilineProps = { multiline: true, rows: 2 };

const today = new Date().toLocaleDateString("en-CA");
const now = new Date().toLocaleString("sv-SE").slice(0, 16);

const DomesticLeadForm = () => {
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [value, setValue] = useState(0);
  const [orderData, setOrderData] = useState([]);
  const [ServerIp, SetServerIp] = useState("");

  // Dynamic state for dropdowns with hardcoded fallbacks
  const [dynamicOptions, setDynamicOptions] = useState({
    // tenderType: ["SL", "LT", "MT"],
    tenderType: [],
    documentType: ["RFP", "RFI", "RFE", "EOI", "BQ", "NIT", "RFQ"],
    businessDomain: ["ERP", "Software", "Web application", "System", "Digital"],
    openClosed: ["Open", "Closed"],
    defenceAndNonDefence: ["Non Defence", "Defence"],
    wonLostParticipated: [
      "Not-Participated",
      "Participated-Won",
      "Participated-Lost",
      "Pursing",
    ],
    presentStatus: [
      "Not-Participated",
      "Lost",
      "pursing",
      "Participated-Pursing",
    ],
    segment: ["Sonar", "Radar"],
    project: ["Sonar"],
  });

  const API = "/getDomesticLead";
  let user = JSON.parse(localStorage.getItem("user")) || {};

  useEffect(() => {
    // axios
    //   .get(`/config.json`)
    //   .then(function (response) {
    //     // WE SETTING THE API
    //     console.log(
    //       "we are looking for server IP : ",
    //       response.data.project[0].ServerIP[0].NodeServerIP
    //     );
    //     SetServerIp(response.data.project[0].ServerIP[0].NodeServerIP);
    //     axios
    //       .get(response.data.project[0].ServerIP[0].NodeServerIP + API)
    //       .then((response) => {
    //         setOrderData(response.data);
    //       })
    //       .catch((error) => console.log(error.message));
    //   })

    axios
      .get(`/config.json`)
      .then(function (response) {
        const nodeIp = response.data.project[0].ServerIP[0].NodeServerIP;
        SetServerIp(nodeIp);

        // SetServerIp(response.data.project[0].ServerIP[0].NodeServerIP);
        axios
          .get(response.data.project[0].ServerIP[0].NodeServerIP + API)
          .then((response) => {
            // console.log(" table data : ", response.data);
            setOrderData(response.data);
          });

        // 1. Fetch Main Table Data
        // axios
        //   .get(nodeIp + API)
        //   .then((response) => {
        //     // Note: Accessing res.data.data because your backend returns { success: true, data: [...] }
        //     setOrderData(response.data.data || []);
        //   })
        //   .catch((error) => console.log("Data fetch error:", error.message));

        // 2. Fetch Dynamic Filter Options
        axios
          .get(nodeIp + "/getDomesticLeadFilters")
          .then((res) => {
            if (res.data.success) {
              // console.log("Defence getDomesticLeadFilters:", res.data.data.type.length);
              setDynamicOptions({
                // Only override defaults if the database actually has values
                defenceAndNonDefence:
                  res.data.data.defence.length > 0
                    ? res.data.data.defence
                    : ["Non Defence", "Defence"],
                tenderType:
                  res.data.data.type.length > 0
                    ? res.data.data.type
                    : ["SL", "LT", "MT"],

                documentType:
                  res.data.data.doc.length > 0
                    ? res.data.data.doc
                    : ["RFP", "RFI", "RFE", "EOI", "BQ", "NIT", "RFQ"],

                businessDomain:
                  res.data.data.domain.length > 0
                    ? res.data.data.domain
                    : [
                        "ERP",
                        "Software",
                        "Web application",
                        "System",
                        "Digital",
                      ],

                openClosed:
                  res.data.data.open.length > 0
                    ? res.data.data.open
                    : ["Open", "Closed"],

                wonLostParticipated:
                  res.data.data.wonLost.length > 0
                    ? res.data.data.wonLost
                    : [
                        "Not-Participated",
                        "Participated-Won",
                        "Participated-Lost",
                        "Pursing",
                      ],

                presentStatus:
                  res.data.data.status.length > 0
                    ? res.data.data.status
                    : [
                        "Not-Participated",
                        "Lost",
                        "pursing",
                        "Participated-Pursing",
                      ],

                segment: ["Sonar", "Radar"],
                project: ["ACS"],
              });
            }
          })
          .catch((error) => console.log("Filter fetch error:", error.message));
      })
      .catch(function (error) {
        SetServerIp("172.195.121.61");
      });
  }, [submitSuccess]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      tenderName: "",
      tenderReferenceNo: "",
      customerName: "",
      customerAddress: "",
      tenderType: "",
      documentType: "",
      leadOwner: "",
      defenceOrNonDefence: "",
      businessDomain: "",
      segment: "",
      project: "",
      valueOfEMD: "",
      estimatedValueInCrWithoutGST: "",
      submittedValueInCrWithoutGST: "",
      tenderDated: "",
      lastDateOfSub: "",
      soleOrConsortium: "",
      prebidMeetingDateTime: "",
      competitorsInfo: "",
      wonLostParticipated: "",
      openClosed: "",
      orderWonValueInCrWithoutGST: "",
      presentStatus: "",
      reasonForLossingOpp: "",
      corrigendumsDateFile: "",
    },
  });

  const handleAutofill = async (refNo) => {
    if (!refNo) return;

    try {
      // Calling the new endpoint we created in Step 1
      const response = await axios.get(`${ServerIp}/getBQByRef/${refNo}`);

      if (response.data.success) {
        const bqData = response.data.data;

        // Mapping BQ fields to Domestic Lead fields
        reset({
          ...control._formValues, // Keep existing values
          tenderName: bqData.bqTitle, // Mapping BQ Title to Tender Name
          customerName: bqData.customerName,
          customerAddress: bqData.customerAddress,
          leadOwner: bqData.leadOwner,
          defenceOrNonDefence: bqData.defenceAndNonDefence,
          estimatedValueInCrWithoutGST: bqData.estimateValueInCrWithoutGST,
          submittedValueInCrWithoutGST: bqData.submittedValueInCrWithoutGST,
          presentStatus: bqData.presentStatus,
          // Add other mappings as needed
        });

        alert("Form autofilled from Budgetary Quotation!");
      }
    } catch (error) {
      console.log("Autofill error:", error.message);
      // Silent fail or show a toast if the ID doesn't exist yet
    }
  };

  const onSubmit = (data) => {
    console.log("Raw Form Data:", data);

    const formattedData = {
      tenderName: data.tenderName,
      tenderReferenceNo: data.tenderReferenceNo,
      customerName: data.customerName,
      customerAddress: data.customerAddress,
      tenderType: data.tenderType,
      documentType: data.documentType,
      leadOwner: data.leadOwner,
      defenceOrNonDefence: data.defenceOrNonDefence,
      businessDomain: data.businessDomain,

      // NS1 requirement
      segment: data.segment,
      project: data.project,
      remarks: data.remarks,

      valueOfEMD: data.valueOfEMD,
      estimatedValueInCrWithoutGST:
        data.estimatedValueInCrWithoutGST !== ""
          ? parseFloat(parseFloat(data.estimatedValueInCrWithoutGST).toFixed(5))
          : null,
      submittedValueInCrWithoutGST:
        data.submittedValueInCrWithoutGST !== ""
          ? parseFloat(parseFloat(data.submittedValueInCrWithoutGST).toFixed(5))
          : null,
      tenderDated: data.tenderDated,
      lastDateOfSub: data.lastDateOfSub,
      soleOrConsortium: data.soleOrConsortium,
      prebidMeetingDateTime: data.prebidMeetingDateTime,
      competitorsInfo: data.competitorsInfo,
      wonLostParticipated: data.wonLostParticipated,
      openClosed: data.openClosed,
      orderWonValueInCrWithoutGST: data.orderWonValueInCrWithoutGST,
      presentStatus: data.presentStatus,
      reasonForLossingOpp: data.reasonForLossingOpp,
      corrigendumsDateFile: data.corrigendumsDateFile,
      submittedAt: new Date().toISOString(),
      OperatorId: user.id || "291536",
      OperatorName: user.username || "Vivek Kumar Singh",
      OperatorRole: user.userRole || "Lead Owner",
      OperatorSBU: "Software SBU",
    };

    console.log(
      "Frontend Domestic Lead Data:",
      JSON.stringify(formattedData, null, 2),
    );

    axios
      .post(ServerIp + API, formattedData)
      .then((response) => {
        console.log("Server Response:", response.data);
        setSubmittedData(response.data.data);
        setSubmitSuccess(true);
        // ✅ reset form fields after submit
        reset();

        // Optional: Scroll user to success card
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((error) => console.log(error.message));
  };

  const handleReset = () => {
    reset();
    setSubmittedData(null);
  };

  const handleCloseSnackbar = () => {
    setSubmitSuccess(false);
  };

  const handleDownloadJSON = () => {
    if (submittedData) {
      const dataStr = JSON.stringify(submittedData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `domestic-leads-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <Container
      maxWidth="xl"
      sx={{
        mt: 0,
        py: 1,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e3eeff 0%, #f8fbff 100%)",
        borderRadius: 4,
      }}
    >
      {/* Title */}

      <Box sx={{ textAlign: "center", mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 600,
            fontSize: { xs: "1.5rem", sm: "1.75rem", md: "2.125rem" }, // Fluid font size
            background: "linear-gradient(45deg, #0d47a1, #42a5f5, #1e88e5)",
            WebkitBackgroundClip: "text",
            color: "transparent",
            textAlign: { xs: "center" }, // Center text on small screens
          }}
        >
          Domestic Leads
        </Typography>
      </Box>
      {/* <Divider  flexItem sx={{ backgroundColor: '#A9D6E5', height: '4px', mt: 4}}/> */}

      <Divider
        flexItem
        sx={{
          background: "linear-gradient(135deg, #0d47a1 , #42a5f5, #1e88e5)",
          height: { xs: "3px", md: "4px" }, // Slightly thinner on mobile
          mt: { xs: 1, md: 2 },
        }}
      />
      {/* ------------------------ TABS ------------------------ */}
      <Tabs
        value={value}
        onChange={(e, v) => setValue(v)}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          mt: { xs: 1, md: 2 },
          mb: 1,
          // This targets the internal flex container to center the tabs
          "& .MuiTabs-flexContainer": {
            justifyContent: { xs: "flex-start", md: "center" },
          },
          "& .MuiTab-root": {
            fontWeight: 700,
            fontSize: { xs: "0.85rem", sm: "1rem" },
            textTransform: "none",
            minWidth: { xs: 80, sm: 160 },
            px: { xs: 2, sm: 4 },
          },
          "& .Mui-selected": {
            color: "#0d47a1 !important",
          },
          "& .MuiTabs-indicator": {
            height: { xs: 3, md: 4 },
            borderRadius: 2,
            background: "linear-gradient(90deg, #0d47a1, #42a5f5, #1e88e5)",
          },
        }}
      >
        <Tab
          icon={<AddCircleOutlineRoundedIcon />}
          iconPosition="start"
          label="Create Data"
        />
        <Tab
          icon={<VisibilityOutlinedIcon />}
          iconPosition="start"
          label="View Data"
        />
        <Tab
          icon={<CloudUploadOutlinedIcon />}
          iconPosition="start"
          label="Bulk Upload"
        />
      </Tabs>
      {/* ------------------------ CREATE FORM ------------------------ */}
      {value === 0 && (
        <Container maxWidth="lg">
          <Paper
            elevation={10}
            sx={{
              mt: -2,
              p: { xs: 2, md: 5 },
              borderRadius: 5,
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(14px)",
              // transition: "0.3s",
              boxShadow: "0 12px 32px rgba(0,0,0,0.10)",
              // "&:hover": { transform: "scale(1.01)" },
            }}
          >
            {submitSuccess ? (
              <Zoom in={submitSuccess}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: { xs: 6, md: 8 },
                    px: { xs: 2, md: 6 },
                  }}
                >
                  <Card
                    sx={{
                      mx: "auto",
                      maxWidth: 720,
                      borderRadius: 5,
                      p: { xs: 3, md: 5 },
                      // background:
                      //   "linear-gradient(135deg, rgba(255,255,255,0.92), rgba(235,248,255,0.92))",
                      backdropFilter: "blur(14px)",
                      boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
                      border: "1px solid rgba(59,130,246,0.18)",
                    }}
                  >
                    <Box
                      sx={{
                        width: 90,
                        height: 90,
                        mx: "auto",
                        mb: 2,
                        borderRadius: "50%",
                        display: "grid",
                        placeItems: "center",
                        // background:
                        //   "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(59,130,246,0.12))",
                      }}
                    >
                      <CheckCircleRoundedIcon
                        sx={{ fontSize: 55, color: "#16a34a" }}
                      />
                    </Box>

                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: 0.2,
                        // background: "linear-gradient(45deg, #0d47a1, #42a5f5, #1e88e5)",
                        background: "#1e88e5",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      Form Submitted Successfully!
                    </Typography>

                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: 0.2,
                        // background: "linear-gradient(45deg, #0d47a1, #42a5f5, #1e88e5)",
                        background: "#16a34a",
                        WebkitBackgroundClip: "text",
                        color: "transparent",
                      }}
                    >
                      {submittedData.leadReferenceNo}
                    </Typography>

                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: 15.5,
                        color: "rgba(15,23,42,0.75)",
                        fontWeight: 500,
                      }}
                    >
                      Your Budgetary Quotation details were recorded
                      successfully. You can now submit another form if needed.
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        gap: 2,
                        flexWrap: "wrap",
                      }}
                    >
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<RestartAltRoundedIcon />}
                        onClick={() => {
                          setSubmitSuccess(false);
                          setSubmittedData(null);
                          reset(); // clear again for safety
                        }}
                        sx={{
                          px: 5,
                          py: 1.4,
                          borderRadius: 999,
                          fontWeight: 800,
                          textTransform: "none",
                          maxWidth: 300,
                          background: "linear-gradient(90deg,#2563eb,#38bdf8)",
                          boxShadow: "0 12px 30px rgba(37,99,235,0.35)",
                          "&:hover": {
                            background:
                              "linear-gradient(90deg,#1d4ed8,#0ea5e9)",
                          },
                        }}
                      >
                        Submit Another Form
                      </Button>

                      <Button
                        variant="outlined"
                        size="large"
                        onClick={() => setValue(1)} // go to View Data tab
                        sx={{
                          px: 5,
                          py: 1.4,
                          maxWidth: 280,
                          borderRadius: 999,
                          fontWeight: 800,
                          textTransform: "none",
                        }}
                      >
                        View Submitted Data
                      </Button>
                    </Box>
                  </Card>
                </Box>
              </Zoom>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)}>
                {/* SECTION 1: BASIC DETAILS */}
                <Card
                  sx={{
                    mt: -5,
                    mb: 3,
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(250,250,255,0.85)",
                    backdropFilter: "blur(10px)",
                    // transition: "0.3s",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    // "&:hover": {
                    //   transform: "translateY(-4px)",
                    //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    // },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                  >
                    📌 Tender & Customer Details
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* Tender Name */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="tenderName"
                        control={control}
                        // rules={{ required: "Tender Name is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Tender Name"
                            error={!!errors.tenderName}
                            helperText={errors.tenderName?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                "&:hover": { boxShadow: "0 0 10px #bbdefb" },
                                "&.Mui-focused": {
                                  boxShadow: "0 0 15px #90caf9",
                                },
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Tender Reference No */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="tenderReferenceNo"
                        control={control}
                        //rules={{ required: "Tender Reference No is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Tender Reference No"
                            error={!!errors.tenderReferenceNo}
                            helperText={errors.tenderReferenceNo?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Customer Name */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="customerName"
                        control={control}
                        // rules={{ required: "Customer Name is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Customer Name"
                            error={!!errors.customerName}
                            helperText={errors.customerName?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Customer Address */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="customerAddress"
                        control={control}
                        // rules={{ required: "Customer Address is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Customer Address"
                            {...multilineProps}
                            error={!!errors.customerAddress}
                            helperText={errors.customerAddress?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Tender Type */}
                    <Grid item xs={12} md={3}>
                      <Controller
                        name="tenderType"
                        control={control}
                        rules={{ required: "Tender Type is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            fullWidth
                            label="Tender Type"
                            error={!!errors.tenderType}
                            helperText={errors.tenderType?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          >
                            {dynamicOptions.tenderType.map((t) => {
                              // console.log("t : ", t)
                              return (
                                <MenuItem key={t} value={t}>
                                  {t}
                                </MenuItem>
                              );
                            })}
                          </TextField>
                        )}
                      />
                    </Grid>

                    {/* Document Type */}
                    <Grid item xs={12} md={3}>
                      <Controller
                        name="documentType"
                        control={control}
                        // rules={{ required: "Document Type is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            fullWidth
                            label="Document Type"
                            error={!!errors.documentType}
                            helperText={errors.documentType?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          >
                            {dynamicOptions.documentType.map((dt) => (
                              <MenuItem key={dt} value={dt}>
                                {dt}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* SECTION 2: CLASSIFICATION & DOMAIN */}
                <Card
                  sx={{
                    mt: -1,
                    mb: 3,
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(250,250,255,0.85)",
                    backdropFilter: "blur(10px)",
                    // transition: "0.3s",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    // "&:hover": {
                    //   transform: "translateY(-4px)",
                    //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    // },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                  >
                    🏷️ Classification & Owner
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* Lead Owner */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="leadOwner"
                        control={control}
                        // rules={{ required: "Lead Owner is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Lead Owner"
                            error={!!errors.leadOwner}
                            helperText={errors.leadOwner?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Civil / Defence */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="defenceOrNonDefence"
                        control={control}
                        // rules={{
                        //   required: "Defence/Non Defence selection is required",
                        // }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            fullWidth
                            label="Defence/Non Defence"
                            error={!!errors.defenceOrNonDefence}
                            helperText={errors.defenceOrNonDefence?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          >
                            {dynamicOptions.defenceAndNonDefence.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    {/* Business Domain */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="businessDomain"
                        control={control}
                        // rules={{ required: "Business Domain is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            fullWidth
                            label="Business Domain"
                            error={!!errors.businessDomain}
                            helperText={errors.businessDomain?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          >
                            {dynamicOptions.businessDomain.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    {/* Segment */}
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="segment"
                        control={control}
                        rules={{ required: "segment required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Segment"
                            fullWidth
                            required
                            // error={!!errors.segment}
                            // helperText={errors.segment?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                minWidth: 320,
                              },
                            }}
                          >
                            {dynamicOptions.segment.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    {/* Project */}
                    <Grid item xs={12} sm={4}>
                      <Controller
                        name="project"
                        control={control}
                        rules={{ required: "Project required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            label="Project"
                            fullWidth
                            required
                            error={!!errors.project}
                            helperText={errors.project?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                minWidth: 320,
                              },
                            }}
                          >
                            {dynamicOptions.project.map((s) => (
                              <MenuItem key={s} value={s}>
                                {s}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* SECTION 3: VALUES */}
                <Card
                  sx={{
                    mt: -1,
                    mb: 3,
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(250,250,255,0.85)",
                    backdropFilter: "blur(10px)",
                    // transition: "0.3s",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    // "&:hover": {
                    //   transform: "translateY(-4px)",
                    //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    // },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                  >
                    💰 Financial Values
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* EMD Value */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="valueOfEMD"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Value of EMD"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Estimate Value */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="estimatedValueInCrWithoutGST"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Estimate Value in Cr (w/o GST)"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Submitted Value */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="submittedValueInCrWithoutGST"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Submitted Value in Cr (w/o GST)"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* SECTION 4: TIMELINE */}
                <Card
                  sx={{
                    mt: -1,
                    mb: 3,
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(250,250,255,0.85)",
                    backdropFilter: "blur(10px)",
                    // transition: "0.3s",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    // "&:hover": {
                    //   transform: "translateY(-4px)",
                    //   boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    // },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                  >
                    🗓️ Submission Timeline
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {[
                      ["tenderDated", "Tender Dated"],
                      ["lastDateOfSub", "Last Date of Submission"],
                    ].map(([name, label]) => (
                      <Grid item xs={12} md={4} key={name}>
                        <Controller
                          name={name}
                          control={control}
                          // rules={{ required: `${label} is required` }}
                          render={({ field }) => (
                            <TextField
                              {...field}
                              type="date"
                              fullWidth
                              label={label}
                              InputLabelProps={{ shrink: true }}
                              error={!!errors[name]}
                              helperText={errors[name]?.message}
                              inputProps={{
                                max: today, // ✅ past + today enabled, future disabled
                              }}
                            />
                          )}
                        />
                      </Grid>
                    ))}

                    {/* Sole / Consortium */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="soleOrConsortium"
                        control={control}
                        // rules={{ required: "Sole / Consortium is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Sole / Consortium"
                            className="text-field-style"
                            {...multilineProps}
                            error={!!errors.soleConsortium}
                            helperText={errors.soleConsortium?.message}
                          />
                        )}
                      />
                    </Grid>

                    {/* Pre-bid Date */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="prebidMeetingDateTime"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            type="datetime-local"
                            fullWidth
                            label="Pre-Bid Meeting Date & Time"
                            InputLabelProps={{ shrink: true }}
                            className="text-field-style"
                            inputProps={{
                              max: now, // ✅ disables future date & time
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* SECTION 5: COMPETITORS & RESULTS */}
                <Card
                  sx={{
                    mt: -1,
                    mb: 3,
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(250,250,255,0.85)",
                    backdropFilter: "blur(10px)",
                    // transition: "0.3s",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                  >
                    📊 Competitors & Results
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* Competitors Info */}
                    <Grid item xs={12}>
                      <Controller
                        name="competitorsInfo"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Competitors Info"
                            {...multilineProps}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Result Status */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="wonLostParticipated"
                        control={control}
                        // rules={{ required: "Result Status is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            fullWidth
                            label="Won / Lost / Participated / Not Participated"
                            error={!!errors.wonLostParticipated}
                            helperText={errors.wonLostParticipated?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          >
                            {dynamicOptions.wonLostParticipated.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    {/* Open / Closed */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="openClosed"
                        control={control}
                        // rules={{ required: "Open / Closed is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            fullWidth
                            label="Open / Closed"
                            error={!!errors.openClosed}
                            helperText={errors.openClosed?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          >
                            {dynamicOptions.openClosed.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>

                    {/* Order Won Value */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="orderWonValueInCrWithoutGST"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Order Won Value in Cr (w/o GST)"
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  ₹
                                </InputAdornment>
                              ),
                            }}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Present Status */}
                    <Grid item xs={12} md={4}>
                      <Controller
                        name="presentStatus"
                        control={control}
                        // rules={{ required: "Present Status is required" }}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            select
                            fullWidth
                            label="Present Status"
                            error={!!errors.presentStatus}
                            helperText={errors.presentStatus?.message}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          >
                            {dynamicOptions.presentStatus.map((opt) => (
                              <MenuItem key={opt} value={opt}>
                                {opt}
                              </MenuItem>
                            ))}
                          </TextField>
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* SECTION 6: REASON & INFO */}
                <Card
                  sx={{
                    mt: -1,
                    mb: 3,
                    p: 3,
                    borderRadius: 4,
                    background: "rgba(250,250,255,0.85)",
                    backdropFilter: "blur(10px)",
                    transition: "0.3s",
                    boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 800, color: "#0d47a1", mb: 2 }}
                  >
                    📋 Reason & Corrigendum Info
                  </Typography>
                  <Divider sx={{ mb: 3 }} />

                  <Grid container spacing={3}>
                    {/* Reason */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="reasonForLossingOpp"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Reason for Losing / Participated / Not Participating"
                            {...multilineProps}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>

                    {/* Corrigendum Info */}
                    <Grid item xs={12} md={6}>
                      <Controller
                        name="corrigendumsDateFile"
                        control={control}
                        render={({ field }) => (
                          <TextField
                            {...field}
                            fullWidth
                            label="Corrigendum Info"
                            {...multilineProps}
                            sx={{
                              "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                              },
                            }}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* BUTTONS */}
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    gap: 3,
                    mt: 4,
                    flexWrap: "wrap",
                  }}
                >
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    sx={{
                      px: 6,
                      py: 1.6,
                      fontSize: "1.1rem",
                      borderRadius: 3,
                      fontWeight: 700,
                      maxWidth: 180,
                      background: "linear-gradient(90deg, #1565c0, #42a5f5)",
                      textTransform: "none",
                      transition: "0.3s",
                      "&:hover": {
                        transform: "scale(1.05)",
                        background: "linear-gradient(90deg, #0d47a1, #1e88e5)",
                      },
                    }}
                  >
                    Submit
                  </Button>

                  <Button
                    type="button"
                    variant="outlined"
                    size="large"
                    onClick={handleReset}
                    sx={{
                      px: 6,
                      py: 1.6,
                      fontSize: "1.1rem",
                      borderRadius: 3,
                      fontWeight: 700,
                      maxWidth: 180,
                      borderWidth: 2,
                      textTransform: "none",
                      "&:hover": {
                        transform: "scale(1.03)",
                        background: "#f4f6fb",
                      },
                    }}
                  >
                    Reset
                  </Button>
                </Box>
              </form>
            )}
          </Paper>
        </Container>
      )}

      {/* ------------------------ VIEW DATA ------------------------ */}
      {value === 1 && orderData && (
        <ViewDomesticLeadsData
          ViewData={orderData}
          ServerIp={ServerIp}
          DynamicOptions={dynamicOptions}
        />
      )}

      {/* ------------------------ BULK UPLOAD ------------------------ */}
      {value === 2 && (
        <ExcelUploadAndValidate user={user} ServerIp={ServerIp} />
      )}
    </Container>
  );
};

// ------------------------------------------------------------------------
// VIEW COMPONENT WITH SEARCH + FILTERS + SORT + EDIT / DELETE
// ------------------------------------------------------------------------

function ViewDomesticLeadsData(props) {
  // console.log("props viewDomesticData", props.ViewData.data);

  // Store data in local state for updates
  const [tableData, setTableData] = useState(props.ViewData.data || []);

  // Extract ServerIp from props
  const ServerIp = props.ServerIp || "";
  const dynamicOptions = props.DynamicOptions || "";

  //Count rows
  useEffect(() => {
    if (props.ViewData.data) {
      setTableData(props.ViewData.data);
    }
  }, [props.ViewData.data]);

  // Sync with parent data when it changes
  useEffect(() => {
    if (props.ViewData.data) {
      setTableData(props.ViewData.data);
    }
  }, [props.ViewData.data]);

  // const data = props.ViewData?.data || [];

  //for Total Rows Count
  const totalRows = tableData?.length || 0;

  //States for search
  const [searchTerm, setSearchTerm] = useState("");
  const [tenderTypeFilter, setTenderTypeFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [openClosedFilter, setOpenClosedFilter] = useState("all");

  const [sortBy, setSortBy] = useState("dateCreated");
  const [sortDirection, setSortDirection] = useState("desc");

  // for Dialog
  const [selectedRow, setSelectedRow] = useState(null);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingRow, setEditingRow] = useState(null);

  const [dialogOpenedFrom, setDialogOpenedFrom] = useState("rowClick"); // "rowClick" or "editIcon"

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [idDeleteOpen, setIdDeleteOpen] = useState(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [tempEditingRow, setTempEditingRow] = useState(null);

  // READ-ONLY VIEW DIALOG STATE
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewRow, setViewRow] = useState(null);

  // COLUMN SELECTION STATE
  const [columnMenuAnchor, setColumnMenuAnchor] = useState(null);
  const columnMenuOpen = Boolean(columnMenuAnchor);

  // DEFINE ALL AVAILABLE COLUMNS
  const leadColumns = [
    { id: "leadReferenceNo", label: "Lead Ref No" },
    { id: "tenderName", label: "Tender Name" },
    { id: "tenderReferenceNo", label: "Tender Ref No" },
    { id: "customerName", label: "Customer Name" },
    { id: "customerAddress", label: "Customer Address" },
    { id: "tenderType", label: "Tender Type" },
    { id: "documentType", label: "Document Type" },
    { id: "leadOwner", label: "Lead Owner" },
    { id: "defenceOrNonDefence", label: "Defence/Non Defence" },
    { id: "businessDomain", label: "Business Domain" },
    { id: "segment", label: "Segment" },
    { id: "project", label: "Project" },
    { id: "valueOfEMD", label: "Value of EMD" },
    { id: "estimatedValueInCrWithoutGST", label: "Estimate (Cr, w/o GST)" },
    { id: "submittedValueInCrWithoutGST", label: "Submitted (Cr, w/o GST)" },
    { id: "tenderDated", label: "Tender Dated" },
    { id: "lastDateOfSub", label: "Last Date of Submission" },
    { id: "soleOrConsortium", label: "Sole / Consortium" },
    { id: "prebidMeetingDateTime", label: "Pre-bid Date & Time" },
    { id: "competitorsInfo", label: "Competitors Info" },
    { id: "wonLostParticipated", label: "Result Status" },
    { id: "openClosed", label: "Open / Closed" },
    { id: "orderWonValueInCrWithoutGST", label: "Order Won (Cr, w/o GST)" },
    { id: "presentStatus", label: "Present Status" },
    { id: "reasonForLossingOpp", label: "Reason / Decision Note" },
    { id: "corrigendumsDateFile", label: "Corrigendum Info" },
    // { id: "dateCreated", label: "Created Date" },
  ];

  // COLUMN VISIBILITY STATE
  const [visibleColumns, setVisibleColumns] = useState(
    leadColumns.reduce((acc, col) => {
      acc[col.id] = true;
      return acc;
    }, {}),
  );

  

  // Handlers
  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const handleTenderTypeFilterChange = (e) =>
    setTenderTypeFilter(e.target.value);
  const handleStatusFilterChange = (e) => setStatusFilter(e.target.value);

  const handleResultFilterChange = (e) => setResultFilter(e.target.value);

  const handleOpenClosedFilterChange = (e) =>
    setOpenClosedFilter(e.target.value);

  const handleSortByChange = (e) => setSortBy(e.target.value);

  // DELETE ROW
  const handleDeleteRow = async (id) => {
    // if (!window.confirm("Are you sure you want to delete this entry?")) return;

    console.log("Deleting row with ID:", id);
    const deleteData = {
      id: id,
    };
    console.log(
      "api for delete in domestic lead : ",
      `${ServerIp}/getDomesticLead`,
    );
    // TODO: delete logic here
    try {
      await axios.delete(`${ServerIp}/getDomesticLead`, {
        data: deleteData, // Send the data in the request body
        headers: {
          "Content-Type": "application/json", // VERY IMPORTANT: Set the Content-Type
        },
      });
      // Show success notification
      setTableData(
        tableData.filter((item) => item.id !== id), // Create a new array excluding the item with the given id
      );
      setConfirmDeleteOpen(false);
      alert("✅ Deleted successfully!");
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("❌ Failed to Delete. Please try again.");
    }
  };

  // COLUMN SELECTION HANDLERS
  const handleColumnMenuOpen = (event) => {
    setColumnMenuAnchor(event.currentTarget);
  };

  const handleColumnMenuClose = () => {
    setColumnMenuAnchor(null);
  };

  const handleColumnToggle = (columnId) => {
    setVisibleColumns((prev) => ({
      ...prev,
      [columnId]: !prev[columnId],
    }));
  };

  const toggleSortDirection = () =>
    setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));

  const handleResetFilters = () => {
    setSearchTerm("");
    setTenderTypeFilter("all");
    setResultFilter("all");
    setOpenClosedFilter("all");
    setSortBy("dateCreated");
    setSortDirection("desc");
  };

  // DOWNLOAD ALL DATA AS EXCEL
  const handleDownloadAllData = () => {
    console.log("data given to handler : ", props.ViewData.data);
    if (!props.ViewData?.data || props.ViewData.data.length === 0) {
      alert("No data available to download");
      return;
    }

    // Convert JSON → worksheet
    const worksheet = XLSX.utils.json_to_sheet(props.ViewData.data);
    console.log(" worksheet : ", worksheet);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "BudgetaryQuotations");
    console.log(" workbook : ", workbook);

    // Download file
    // XLSX.writeFile(workbook, "MyData.xlsx", FileSaver.saveAs);
    XLSX.writeFile(workbook, "MyData.xlsx", FileSaver.saveAs);

    // `Budgetary_Quotation_Data_${new Date().toISOString().slice(0, 10)}.xlsx`  // Original dynamic filename
    console.log(" work new book : ", workbook);
  };


  //fetch for bulk upload

  const fetchDomesticLeads = async () => {
  try {
    const res = await axios.get(`${ServerIp}/getDomesticLead`);

    if (res?.data?.success) {
      setTableData(res.data.data); // 👈 IMPORTANT (your table state)
    }
  } catch (error) {
    console.error("Error fetching leads:", error);
  }
};

  // OPEN DIALOG FROM ROW CLICK (VIEW MODE ONLY)
  const handleRowClick = (row) => {
    setTempEditingRow({ ...row }); // Store original data
    setEditingRow({ ...row }); // Set for viewing
    setIsEditMode(false); // Start in VIEW mode
    setDialogOpenedFrom("rowClick"); // Mark as opened from row click
    setEditDialogOpen(true);
  };

  // OPEN DIALOG FROM EDIT ICON (READY TO EDIT)
  const handleEditClick = (row) => {
    setTempEditingRow({ ...row }); // Store original data

    console.log("on click edit icon response", row);
    setEditingRow({ ...row }); // Set for editing
    setIsEditMode(false); // Start in VIEW mode but with edit option
    setDialogOpenedFrom("editIcon"); // Mark as opened from edit icon
    setEditDialogOpen(true);
  };

  const handleEditFieldChange = (field, value) => {
    setEditingRow((prev) => ({ ...prev, [field]: value }));
  };

  // CANCEL / CLOSE DIALOG
  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditingRow(null);
    setTempEditingRow(null);
    setIsEditMode(false);
    setDialogOpenedFrom("rowClick");
  };

  // ENTER EDIT MODE
  const handleEnterEditMode = () => {
    setIsEditMode(true);
  };

  const handleEditSave = () => {
    // setTempEditingRow({ ...editingRow });
    setConfirmSaveOpen(true);
    console.log("Saving updated row:", editingRow);
  };

  // CONFIRM AND SAVE TO BACKEND
  const handleConfirmSave = async () => {
    try {
      console.log("Confirmed - Updating row:", editingRow);

      // Call real update API
      const updatePayload = {
        id: editingRow.id, // Include ID for update
        ...editingRow, // Rest of data to edit
      };

      // Replace with your actual API endpoint
      // const API_ENDPOINT = `/getBudgetaryQuotation/${updatePayload?.id}`;

      const response = await axios.put(
        `${ServerIp}/getCRMLeads`,
        updatePayload,
      );

      console.log("res from server : ", response);

      if (response.data.success || response.status === 200) {
        console.log("Backend Response:", response.data);

        // Update the local table data with the new values
        const updatedTableData = tableData.map((row) =>
          row.id === editingRow.id ? editingRow : row,
        );
        setTableData(updatedTableData);

        console.log("123", updatedTableData);

        // Notify parent component about update if callback provided
        if (props.onDataUpdate) {
          props.onDataUpdate(updatedTableData);
        }

        // Show success notification
        alert("✅ Changes saved successfully!");
        setConfirmSaveOpen(false);
        setEditDialogOpen(false);
        setIsEditMode(false);
        setEditingRow(null);
        setTempEditingRow(null);
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      alert("❌ Failed to save changes. Please try again.");
    }
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditingRow({ ...tempEditingRow });
  };

  // Delete VALUES - SHOW CONFIRMATION DIALOG
  const handleDeleteClick = (id) => {
    console.log("Saving updated editingRow:", editingRow);
    setIdDeleteOpen(id);
    setConfirmDeleteOpen(true); // Open confirmation dialog
  };

  // DOUBLE CLICK → OPEN READ-ONLY VIEW
  const handleRowDoubleClick = (row) => {
    setViewRow(row);
    setViewDialogOpen(true);
  };

  // ===== TABLE STYLES =====
  const headerCellStyle = {
    fontWeight: 800,
    fontSize: 13,
    color: "#ecfeff",
    background: "linear-gradient(90deg, #001F54, #034078)",
    // "linear-gradient(90deg, #0a47e0ff 0%, #1453b7ff 50%, #81a6daff 100%)",
    borderBottom: "none",
    whiteSpace: "nowrap",
  };

  const bodyCellStyle = {
    fontSize: 13,
    color: "#111827",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    overflow: "hidden",
  };

  const ellipsisCell = {
    ...bodyCellStyle,
    maxWidth: 180,
  };

  const actionHeaderStyle = {
    ...headerCellStyle,
    textAlign: "center",
  };

  // Filter + sort logic
  const filteredSortedData =
    tableData &&
    tableData
      .filter((row) => {
        const q = searchTerm.toLowerCase();
        const matchesSearch =
          !q ||
          row.tenderName?.toLowerCase().includes(q) ||
          row.customerName?.toLowerCase().includes(q) ||
          row.tenderReferenceNo?.toLowerCase().includes(q) ||
          row.leadOwner?.toLowerCase().includes(q) ||
          row.customerAddress?.toLowerCase().includes(q);

        const matchesTenderType =
          tenderTypeFilter === "all" ||
          row.tenderType?.toLowerCase() === tenderTypeFilter.toLowerCase();

        const matchesResult =
          resultFilter === "all" ||
          row.wonLostParticipated?.toLowerCase() === resultFilter.toLowerCase();

        const matchesOpenClosed =
          openClosedFilter === "all" ||
          row.openClosed?.toLowerCase() === openClosedFilter.toLowerCase();

        return (
          matchesSearch &&
          matchesTenderType &&
          matchesResult &&
          matchesOpenClosed
        );
      })
      .sort((a, b) => {
        let aVal;
        let bVal;

        switch (sortBy) {
          case "tenderDated":
            aVal = a.tenderDated || "";
            bVal = b.tenderDated || "";
            break;
          case "lastDateOfSub":
            aVal = a.lastDateOfSub || "";
            bVal = b.lastDateOfSub || "";
            break;
          case "estimatedValueInCrWithoutGST":
            aVal = parseFloat(a.estimatedValueInCrWithoutGST) || 0;
            bVal = parseFloat(b.estimatedValueInCrWithoutGST) || 0;
            break;
          case "submittedValueInCrWithoutGST":
            aVal = parseFloat(a.submittedValueInCrWithoutGST) || 0;
            bVal = parseFloat(b.submittedValueInCrWithoutGST) || 0;
            break;
          case "lastDateOfSub":
          default:
            aVal = a.lastDateOfSub || "";
            bVal = b.lastDateOfSub || "";
            break;
        }

        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();

        if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
        if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
        return 0;
      });

  return (
    <>
      {/* HEADER + CONTROLS */}
      <Box sx={{ mb: 3, px: { xs: 1, sm: 0 } }}>
        <Box
          sx={{
            borderRadius: 3,
            p: { xs: 2, sm: 3 },
            background: `linear-gradient(135deg,#EAF6FD 0%,#CFE9F7 5%,#B6DFF5 45%, #9CCEF0 100%,#6FAFD8 60%)`,
            border: "1px solid rgba(111,182,232,0.5)",
            boxShadow:
              "0 16px 40px rgba(15,23,42,0.15), inset 0 1px 0 rgba(255,255,255,0.85)",
            position: "relative",
            overflow: "hidden",
            "&::after": {
              content: '""',
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at top right, rgba(255,255,255,0.35), transparent 55%)",
              pointerEvents: "none",
            },
          }}
        >
          {/* =====================================================
       TOP ROW : TITLE + SEARCH + COLUMN TOGGLE
       ===================================================== */}
          <Box
            sx={{
              position: "relative",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              zIndex: 1,
            }}
          >
            {/* -------------------------------
          PAGE TITLE
         ------------------------------- */}
            <Box>
              <Typography
                variant="h5"
                sx={{
                  fontWeight: 900,
                  letterSpacing: 0.6,
                  color: "#0F172A",
                }}
              >
                Domestic Lead Data View
              </Typography>
            </Box>

            {/* -------------------------------
          SEARCH + COLUMN VISIBILITY
         ------------------------------- */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                width: { xs: "100%", sm: "auto" },
              }}
            >
              {/* TOTAL ROW COUNT DISPLAY */}
              <Box
                sx={{
                  mt: 0,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                {/* Left side: count */}
                <Chip
                  label={`Total Entries: ${totalRows}`}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.9rem",
                    px: 1,
                    py: 1,
                    borderRadius: 2,
                    background: "linear-gradient(135deg, #1565c0, #42a5f5)",
                    color: "#fff",
                    boxShadow: "0 4px 12px rgba(21,101,192,0.25)",
                    // transition: "0.3s",
                    // "&:hover": {
                    //   transform: "scale(1.05)",
                    //   boxShadow: "0 6px 16px rgba(21,101,192,0.35)",
                    // },
                  }}
                />

                {/* Right side: optional subtitle */}
                {/* <Typography
                  variant="body2"
                  sx={{
                    color: "#1e3a8a",
                    fontWeight: 500,
                    opacity: 0.85,
                  }}
                >
                  Showing live data from database
                </Typography> */}
              </Box>

              {/* SEARCH FIELD */}
              <TextField
                size="small"
                placeholder="Search title, customer, lead owner..."
                value={searchTerm}
                onChange={handleSearchChange}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRounded sx={{ color: "#2563EB" }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  minWidth: { xs: "100%", sm: 290 },
                  backgroundColor: "rgba(255,255,255,0.95)",
                  borderRadius: 2,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    fontSize: 14,
                    fontWeight: 500,
                    "& fieldset": {
                      borderColor: "#6FB6E8",
                    },
                    "&:hover fieldset": {
                      borderColor: "#3B82F6",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#2563EB",
                      borderWidth: 2,
                      boxShadow: "0 0 0 3px rgba(37,99,235,0.25)",
                    },
                  },
                }}
              />

              {/* COLUMN TOGGLE */}
              <Tooltip title="Show / Hide Columns">
                <IconButton
                  onClick={handleColumnMenuOpen}
                  sx={{
                    height: 44,
                    width: 44,
                    borderRadius: 2,
                    background: "linear-gradient(145deg, #6FB6E8, #3B82F6)",
                    color: "#ffffff",
                    // boxShadow: "0 8px 20px rgba(37,99,235,0.45)",
                    transition: "0.25s ease",
                    "&:hover": {
                      transform: "translateY(-2px) scale(1.05)",
                      // boxShadow: "0 12px 28px rgba(37,99,235,0.6)",
                    },
                  }}
                >
                  <ViewColumnIcon />
                </IconButton>
              </Tooltip>

              {/* COLUMN MENU */}
              <Menu
                anchorEl={columnMenuAnchor}
                open={columnMenuOpen}
                onClose={handleColumnMenuClose}
                PaperProps={{
                  sx: {
                    minWidth: 280,
                    maxHeight: 400,
                    borderRadius: 2,
                    boxShadow: "0 16px 36px rgba(0,0,0,0.25)",
                  },
                }}
              >
                {leadColumns.map((col) => (
                  <MenuItem
                    key={col.id}
                    onClick={() => handleColumnToggle(col.id)}
                    sx={{ display: "flex", gap: 1 }}
                  >
                    <Checkbox
                      checked={visibleColumns[col.id]}
                      size="small"
                      sx={{
                        color: "#3B82F6",
                        "&.Mui-checked": { color: "#2563EB" },
                      }}
                    />
                    {col.label}
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Box>

          {/* =====================================================
       FILTERS + SORTING CONTROLS
       ===================================================== */}
          <Box
            sx={{
              position: "relative",
              mt: 3,
              display: "flex",
              flexWrap: "wrap",
              gap: 1.5,
              alignItems: "center",
              zIndex: 1,
            }}
          >
            {/* TENDER TYPE FILTER */}
            <TextField
              select
              size="small"
              label="Tender Type"
              value={tenderTypeFilter}
              onChange={handleTenderTypeFilterChange}
              sx={{
                minWidth: 180,
                backgroundColor: "rgba(240,248,255,0.9)",
                borderRadius: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(148,163,184,0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100,116,139,0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              {/* 1. Manually add the 'All' option if it's not in your dynamic array */}
              <MenuItem value="all">All</MenuItem>

              {/* 2. Map through your dynamic options */}
              {dynamicOptions.tenderType.map((opt) => (
                <MenuItem key={opt} value={opt}>
                  {opt}
                </MenuItem>
              ))}
            </TextField>

            {/* STATUS FILTER */}
            <TextField
              select
              size="small"
              label="Result Status"
              value={resultFilter}
              onChange={handleResultFilterChange}
              sx={{
                minWidth: 170,
                backgroundColor: "rgba(240,248,255,0.9)",
                borderRadius: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(148,163,184,0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100,116,139,0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              <MenuItem value="all">All</MenuItem>
              {/* 2. Map through your dynamic options */}
              {dynamicOptions.wonLostParticipated.map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>

            {/* SORT BY FILTER */}
            <TextField
              select
              size="small"
              label="Sort by"
              value={sortBy}
              onChange={handleSortByChange}
              sx={{
                minWidth: 170,
                backgroundColor: "rgba(240,248,255,0.9)",
                borderRadius: 2.5,
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  color: "#0f172a",
                  "& fieldset": {
                    borderColor: "rgba(148,163,184,0.5)",
                  },
                  "&:hover fieldset": {
                    borderColor: "rgba(100,116,139,0.8)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#3b82f6",
                  },
                },
                "& .MuiInputLabel-root": { color: "#475569" },
              }}
            >
              {/* <MenuItem value="dateCreated">Created Date</MenuItem> */}
              <MenuItem value="tenderDate">Tender Date</MenuItem>
              <MenuItem value="lastDateOfSub">Submission Date</MenuItem>
              <MenuItem value="estimatedValueInCrWithoutGST">
                Estimated Value
              </MenuItem>
              <MenuItem value="submittedValueInCrWithoutGST">
                Submitted Value
              </MenuItem>
            </TextField>

            {/* SORT DIRECTION */}
            <IconButton
              onClick={toggleSortDirection}
              sx={{
                borderRadius: 2,
                background: "linear-gradient(145deg, #93C5FD, #60A5FA)",
                color: "#0F172A",
                maxWidth: 45,
                boxShadow: "0 6px 16px rgba(59,130,246,0.35)",
                "&:hover": {
                  transform: "scale(1.08)",
                },
              }}
            >
              {sortDirection === "asc" ? <SouthRounded /> : <NorthRounded />}
            </IconButton>

            {/* RESET */}
            <Button
              variant="contained"
              onClick={handleResetFilters}
              startIcon={<RestartAltRounded />}
              sx={{
                ml: { xs: 0, sm: "auto" },
                borderRadius: 999,
                px: 3,
                py: 0.8,
                fontWeight: 700,
                background: "linear-gradient(135deg, #2563EB, #3B82F6)",
                maxWidth: 120,
                "&:hover": {
                  background: "linear-gradient(135deg, #1D4ED8, #2563EB)",
                },
              }}
            >
              Reset
            </Button>

            {/* DOWNLOAD BUTTON */}
            {/* <Button
              variant="contained"
              onClick={handleDownloadAllData}
              sx={{
                borderRadius: 999,
                background: "linear-gradient(135deg,#16a34a,#22c55e)",
                color: "#fff",
                textTransform: "none",
                px: 3,
                py: 0.9,
                fontWeight: 700,
                boxShadow: "0 6px 16px rgba(22,163,74,0.35)",
                "&:hover": {
                  background: "linear-gradient(135deg,#15803d,#16a34a)",
                },
              }}
            >
              Download All Data
            </Button> */}
          </Box>
        </Box>
      </Box>

      {/* TABLE */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "1800px",
          mx: "auto",
          mt: 2,
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 4,
            boxShadow: 8,
            overflowX: "auto",
            overflowY: "auto",
            maxHeight: "47vh",
            minWidth: "100%",
          }}
        >
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                {/* ACTION COLUMN */}
                <TableCell
                  align="center"
                  sx={{
                    ...headerCellStyle,
                    minWidth: 140,
                  }}
                >
                  Actions
                </TableCell>

                {/* ✅ SERIAL NUMBER COLUMN */}
                <TableCell
                  align="center"
                  sx={{
                    ...headerCellStyle,
                    minWidth: 60,
                  }}
                >
                  Sl No
                </TableCell>

                {/* DYNAMIC COLUMNS */}
                {leadColumns.map((col) =>
                  visibleColumns[col.id] ? (
                    <TableCell key={col.id} sx={headerCellStyle}>
                      {col.label}
                    </TableCell>
                  ) : null,
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {filteredSortedData && filteredSortedData.length > 0 ? (
                filteredSortedData.map((row, index) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={selectedRow?.id === row.id}
                    onClick={() => handleRowClick(row)}
                    sx={{
                      cursor: "pointer",
                      transition: "all 0.18s ease-out",
                      "&:hover": {
                        backgroundColor: "rgba(59,130,246,0.06)",
                        boxShadow: 1,
                        transform: "translateY(-1px)",
                      },
                    }}
                    // onDoubleClick={() => handleRowDoubleClick(row)}
                  >
                    {/* ACTIONS */}
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(row);
                            }}
                            sx={{
                              borderRadius: 2,
                              minWidth: 0,
                              backgroundColor: "rgba(59,130,246,0.12)",
                              "&:hover": {
                                backgroundColor: "rgba(59,130,246,0.25)",
                              },
                              maxWidth: 40,
                            }}
                          >
                            <EditRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(row.id);
                            }}
                            sx={{
                              borderRadius: 2,
                              backgroundColor: "rgba(239,68,68,0.12)",
                              "&:hover": {
                                backgroundColor: "rgba(239,68,68,0.25)",
                              },
                              maxWidth: 40,
                            }}
                          >
                            <DeleteRounded fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>

                    {/* ✅ SERIAL NUMBER VALUE */}
                    <TableCell align="center" sx={{ fontWeight: 600 }}>
                      {index + 1}
                    </TableCell>

                    {/* OTHER COLUMNS */}
                    {leadColumns.map((col) => {
                      if (!visibleColumns[col.id]) return null;

                      return <TableCell key={col.id}>{row[col.id]}</TableCell>;
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={
                      leadColumns.filter((c) => visibleColumns[c.id]).length + 2
                    }
                    align="center"
                  >
                    No data found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* EDIT DIALOG - VIEW MODE & EDIT MODE - PROFESSIONAL BLUE THEME */}
      <Dialog
        open={editDialogOpen}
        onClose={handleEditCancel}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            background: "#ffffff",
            boxShadow:
              "0 25px 50px rgba(0,0,0,0.15), 0 10px 30px rgba(30,64,95,0.2)",
            maxHeight: "80vh",
          },
        }}
      >
        {/* HEADER */}
        <DialogTitle
          sx={{
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 2,
            background: isEditMode
              ? "linear-gradient(135deg,#778DA9 20%, #9CCEF0 100%,#6FAFD8 60%)" // GREYBLUE (Edit)
              : "linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%)", // BLUE (View)
            color: "#ffffff",
            borderBottom: isEditMode
              ? "3px solid #33415C"
              : "3px solid #60a5fa",
            py: 2.5,
            transition: "all 0.3s ease", // smooth color change
          }}
        >
          {/* title and heading */}
          <Box display="flex" alignItems="center" gap={4}>
            <Box
              sx={{
                fontSize: 28,
                fontWeight: 800,
              }}
            >
              📋
            </Box>
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 800, color: "#ffffff" }}
              >
                {"Domestic Lead Details"}
              </Typography>
              {/* <Typography variant="caption" sx={{ color: "#bfdbfe", mt: 0.5 }}>
                Reference: {editingRow?.tenderReferenceNo || "N/A"}
              </Typography> */}
            </Box>
          </Box>

          <Box display="flex" alignItems="center" gap={2}>
            <Chip
              label={isEditMode ? "EDIT MODE" : "VIEW MODE"}
              size="small"
              sx={{
                fontWeight: 700,
                fontSize: "0.75rem",
                background: isEditMode ? "#33415C" : "#60a5fa",
                color: isEditMode ? "#ffffff" : "#ffffff",
                ml: 3,
              }}
            />
            {/* This is for close the dialog box "x" */}
            <IconButton
              onClick={handleEditCancel}
              sx={{
                color: "#ffffff",
                maxWidth: 40,
                "&:hover": { backgroundColor: "rgba(255,255,255,0.1)" },
              }}
            >
              <CloseRounded />
            </IconButton>
          </Box>
        </DialogTitle>

        {/* CONTENT - TABULAR MATRIX FORMAT */}
        <DialogContent
          sx={{
            background: "#f8fafc",
            p: 0,
            maxHeight: "calc(90vh - 130px)",
            overflowY: "auto",
            overflowX: "hidden",
            "&::-webkit-scrollbar": {
              width: "8px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#e2e8f0",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#94a3b8",
              borderRadius: "4px",
            },
            "@media (max-height: 800px)": {
              maxHeight: "calc(85vh - 130px)",
            },
          }}
        >
          <Box sx={{ p: 1.5 }}>
            {/* TENDER INFORMATION SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Tender Information
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                  },
                  gap: 1.5,
                }}
              >
                {[{ label: "Tender Name", key: "tenderName" }].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        type={field.isDate ? "date" : "text"}
                        InputLabelProps={
                          field.isDate ? { shrink: true } : undefined
                        }
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* CUSTOMER INFORMATION SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Customer Information
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  { label: "Tender Reference No", key: "tenderReferenceNo" },
                  { label: "Document Type", key: "documentType" },
                  { label: "Tender Dated", key: "tenderDated", isDate: true },
                  { label: "Customer Name", key: "customerName" },
                  { label: "Lead Owner", key: "leadOwner" },
                  { label: "Defence/Non Defence", key: "defenceOrNonDefence" },
                  { label: "Business Domain", key: "businessDomain" },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {/* EDIT MODE */}
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        type={field.isDate ? "datetime-local" : "text"}
                        /* 🔒 Reference Number Disabled in Edit Mode */
                        disabled={field.key === "tenderReferenceNo"}
                        InputLabelProps={
                          field.isDate ? { shrink: true } : undefined
                        }
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,

                            /* Grey background when disabled */
                            background:
                              field.key === "tenderReferenceNo"
                                ? "#f1f5f9"
                                : "#ffffff",

                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            fontWeight: 600,

                            /* Muted text when disabled */
                            color:
                              field.key === "tenderReferenceNo"
                                ? "#64748b"
                                : "#1e293b",
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>

              {/* Customer Address - Full Width */}
              <Box
                sx={{
                  background: "#ffffff",
                  border: "1px solid #e0e7ff",
                  borderRadius: 2,
                  p: 2,
                  mt: 2,
                  "&:hover": {
                    borderColor: "#60a5fa",
                    boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                {/* <Typography
                  variant="caption"
                  sx={{
                    color: "#64748b",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    fontSize: "0.7rem",
                  }}
                >
                  Customer Address
                </Typography> */}
                {isEditMode ? (
                  <TextField
                    value={editingRow?.customerAddress || ""}
                    onChange={(e) =>
                      handleEditFieldChange("customerAddress", e.target.value)
                    }
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    sx={{
                      mt: 1,
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 1.5,
                        background: "#ffffff",
                        "& fieldset": {
                          borderColor: "#60a5fa",
                        },
                        "&:hover fieldset": {
                          borderColor: "#1e40af",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "#1e40af",
                          borderWidth: 2,
                        },
                      },
                      "& .MuiOutlinedInput-input": {
                        color: "#1e293b",
                        fontWeight: 600,
                      },
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      mt: 1,
                      color: "#1e293b",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {editingRow?.customerAddress || "-"}
                  </Typography>
                )}
              </Box>
            </Box>

            {/* FINANCIAL DETAILS SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Financial Details
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(4, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  { label: "Value of EMD", key: "valueOfEMD" },
                  {
                    label: "Estimated Value (Cr, w/o GST)",
                    key: "estimatedValueInCrWithoutGST",
                  },
                  {
                    label: "Submitted Value (Cr, w/o GST)",
                    key: "submittedValueInCrWithoutGST",
                  },
                  {
                    label: "Order Won Value (Cr, w/o GST)",
                    key: "orderWonValueInCrWithoutGST",
                  },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* TIMELINE SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Timeline
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  {
                    label: "Last Date of Submission",
                    key: "lastDateOfSub",
                    isDate: true,
                  },
                  { label: "Sole / Consortium", key: "soleOrConsortium" },
                  {
                    label: "Pre-Bid Meeting Date & Time",
                    key: "prebidMeetingDateTime",
                  },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        type={field.isDate ? "datetime-local" : "text"}
                        InputLabelProps={
                          field.isDate ? { shrink: true } : undefined
                        }
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* STATUS & RESULTS SECTION */}
            <Box sx={{ mb: 3 }}>
              {/* <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box sx={{ width: 4, height: 20, background: "#1e40af", borderRadius: 1 }} />
                Status & Results
              </Typography> */}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  {
                    label: "Won / Lost / Participated",
                    key: "wonLostParticipated",
                  },
                  { label: "Open / Closed", key: "openClosed" },
                  { label: "Present Status", key: "presentStatus" },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>

            {/* ADDITIONAL INFORMATION SECTION */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 800,
                  color: "#1e3a5f",
                  mb: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  fontSize: "0.95rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                <Box
                  sx={{
                    width: 4,
                    height: 20,
                    background: "#1e40af",
                    borderRadius: 1,
                  }}
                />
                Additional Information
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, 1fr)",
                    md: "repeat(2, 1fr)",
                    lg: "repeat(3, 1fr)",
                  },
                  gap: 1.5,
                }}
              >
                {[
                  { label: "Competitors Info", key: "competitorsInfo" },
                  {
                    label: "Reason for Losing/Participating",
                    key: "reasonForLossingOpp",
                  },
                  {
                    label: "Corrigendums Date / File",
                    key: "corrigendumsDateFile",
                  },
                ].map((field) => (
                  <Box
                    key={field.key}
                    sx={{
                      background: "#ffffff",
                      border: "1px solid #e0e7ff",
                      borderRadius: 2,
                      p: 2,
                      "&:hover": {
                        borderColor: "#60a5fa",
                        boxShadow: "0 4px 12px rgba(96,165,250,0.1)",
                      },
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        fontSize: "0.7rem",
                      }}
                    >
                      {field.label}
                    </Typography>
                    {isEditMode ? (
                      <TextField
                        value={editingRow?.[field.key] || ""}
                        onChange={(e) =>
                          handleEditFieldChange(field.key, e.target.value)
                        }
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        sx={{
                          mt: 1,
                          "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            background: "#ffffff",
                            "& fieldset": {
                              borderColor: "#60a5fa",
                            },
                            "&:hover fieldset": {
                              borderColor: "#1e40af",
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "#1e40af",
                              borderWidth: 2,
                            },
                          },
                          "& .MuiOutlinedInput-input": {
                            color: "#1e293b",
                            fontWeight: 600,
                          },
                        }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          mt: 1,
                          color: "#1e293b",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {editingRow?.[field.key] || "-"}
                      </Typography>
                    )}
                  </Box>
                ))}
              </Box>
            </Box>
          </Box>
        </DialogContent>

        {/* DIALOG ACTIONS */}
        <DialogActions
          sx={{
            background: "#f8fafc",
            borderTop: "1px solid #e0e7ff",
            p: 2.5,
            gap: 1.5,
          }}
        >
          {!isEditMode ? (
            <>
              {/* <Button
                onClick={handleEditCancel}
                sx={{
                  color: "#64748b",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  maxWidth:180,
                  letterSpacing: "0.5px",
                  backgroundColor: "#e2e8ff",
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                  },
                }}
              >
                Close
              </Button> */}
              {dialogOpenedFrom === "editIcon" && (
                <Button
                  onClick={handleEnterEditMode}
                  variant="contained"
                  sx={{
                    background:
                      "linear-gradient(135deg, #1e40af 0%, #1e3a5f 100%)",
                    color: "#ffffff",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    fontSize: "0.85rem",
                    maxWidth: 180,
                    letterSpacing: "0.5px",
                    px: 3,
                    "&:hover": {
                      background:
                        "linear-gradient(135deg, #1e3a5f 0%, #162e4a 100%)",
                      boxShadow: "0 8px 24px rgba(30,64,95,0.3)",
                    },
                    "&:active": {
                      transform: "scale(0.98)",
                    },
                  }}
                >
                  ✏️ Edit Details
                </Button>
              )}
            </>
          ) : (
            <>
              <Button
                onClick={handleCancelEdit}
                sx={{
                  color: "#ffffff",
                  background:
                    "linear-gradient(135deg, #999999 0%, #777777 100%)",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  fontSize: "0.85rem",
                  maxWidth: 160,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #555555 0%, #333333 100%)",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
                  },
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditSave}
                variant="contained"
                sx={{
                  background:
                    "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                  color: "#ffffff",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  maxWidth: 200,
                  fontSize: "0.85rem",
                  letterSpacing: "0.5px",
                  px: 3,
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #059669 0%, #047857 100%)",
                    boxShadow: "0 8px 24px rgba(16,185,129,0.3)",
                  },
                  "&:active": {
                    transform: "scale(0.98)",
                  },
                }}
              >
                💾 Save Changes
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* CONFIRMATION DIALOG */}
      <Dialog
        open={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "#ffffff",
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1e3a5f",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "2px solid #fbbf24",
          }}
        >
          <Box sx={{ fontSize: 28 }}>⚠️</Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#1e3a5f" }}>
              Confirm Update
            </Typography>
            <Typography variant="caption" sx={{ color: "#64748b" }}>
              Please review before saving
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
            You are about to update this tender record with the following
            changes. This action will be synced to the database immediately.
          </Typography>
          <Box
            sx={{
              mt: 2.5,
              p: 2,
              background: "#f0f9ff",
              border: "1px solid #bfdbfe",
              borderRadius: 2,
              color: "#1e3a5f",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            📌 Make sure all fields are correct before confirming.
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            background: "#f8fafc",
            borderTop: "1px solid #e0e7ff",
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setConfirmSaveOpen(false)}
            sx={{
              color: "#ffffff",
              background: "linear-gradient(135deg, #999999 0%, #777777 100%)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              maxWidth: 160,
              "&:hover": {
                background: "linear-gradient(135deg, #555555 0%, #333333 100%)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSave}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              maxWidth: 220,
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
                boxShadow: "0 8px 24px rgba(16,185,129,0.35)",
              },
            }}
          >
            ✓ Yes, Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            background: "#ffffff",
            boxShadow: "0 25px 50px rgba(0,0,0,0.2)",
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: 800,
            color: "#1e3a5f",
            background: "#f8fafc",
            display: "flex",
            alignItems: "center",
            gap: 2,
            borderBottom: "2px solid #fbbf24",
          }}
        >
          <Box sx={{ fontSize: 28 }}>⚠️</Box>
          <Box>
            <Typography sx={{ fontWeight: 800, color: "#1e3a5f" }}>
              Confirm Update
            </Typography>
            {/* <Typography variant="caption" sx={{ color: "#64748b" }}>
              Please review before saving
            </Typography> */}
          </Box>
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Typography sx={{ color: "#475569", lineHeight: 1.6 }}>
            You are about to delete this tender record. This action will be
            synced to the database immediately.
          </Typography>
          {/* <Box
            sx={{
              mt: 2.5,
              p: 2,
              background: "#f0f9ff",
              border: "1px solid #bfdbfe",
              borderRadius: 2,
              color: "#1e3a5f",
              fontSize: "0.9rem",
              fontWeight: 600,
            }}
          >
            📌 Make sure all fields are correct before confirming.
          </Box> */}
        </DialogContent>
        <DialogActions
          sx={{
            background: "#f8fafc",
            borderTop: "1px solid #e0e7ff",
            p: 2,
            gap: 1,
          }}
        >
          <Button
            onClick={() => setConfirmDeleteOpen(false)}
            sx={{
              color: "#ffffff",
              background: "linear-gradient(135deg, #999999 0%, #777777 100%)",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              maxWidth: 160,
              "&:hover": {
                background: "linear-gradient(135deg, #555555 0%, #333333 100%)",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.5)",
              },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleDeleteRow(idDeleteOpen)}
            variant="contained"
            sx={{
              background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
              color: "#ffffff",
              fontWeight: 700,
              textTransform: "uppercase",
              fontSize: "0.85rem",
              maxWidth: 160,
              px: 3,
              "&:hover": {
                background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                boxShadow: "0 8px 24px rgba(239,68,68,0.3)",
              },
            }}
          >
            ✓ Yes, Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// ---------------------------------------------------------------------------
// VIEW COMPONENT WITH SEARCH + FILTERS + SORT + EDIT / DELETE
// ---------------------------------------------------------------------------

function ExcelUploadAndValidate({ user, ServerIp }) {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [excelData, setExcelData] = useState([]);
  //new state to make the push m=button disappear after the data is uploaded successfully
  const [isUploaded, setIsUploaded] = useState(false);

 

  // ✅ FIXED SAMPLE FILE DOWNLOAD (Bulk Upload)
  const handleDownloadSampleExcel = () => {
    const fileUrl = "/sample/Domestic_Lead_Sample.xlsx"; // fixed public path
    const link = document.createElement("a");
    link.href = fileUrl;
    link.download = "Domestic_Lead_Sample.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const DB_COLUMNS = [
    "tenderName",
    "tenderReferenceNo",
    "customerName",
    "customerAddress",
    "tenderType",
    "documentType",
    "leadOwner",
    "defenceOrNonDefence",
    "businessDomain",
    "segment",
    "project",
    "valueOfEMD",
    "estimatedValueInCrWithoutGST",
    "submittedValueInCrWithoutGST",
    "tenderDated",
    "lastDateOfSub",
    "soleOrConsortium",
    "prebidMeetingDateTime",
    "competitorsInfo",
    "wonLostParticipated",
    "openClosed",
    "orderWonValueInCrWithoutGST",
    "presentStatus",
    "reasonForLossingOpp",
    "corrigendumsDateFile",
    "participatedWithPartner",
    // user info
    "OperatorId",
    "OperatorName",
    "OperatorRole",
    "OperatorSBU",
  ];

  const DB_COLUMNS_MATCH = [
    "tenderName",
    "tenderReferenceNo",
    "customerName",
    "customerAddress",
    "tenderType",
    "documentType",

    "leadOwner",
    "defenceOrNonDefence",
    "businessDomain",
    "segment",
    "project",
    "valueOfEMD",

    "estimatedValueInCrWithoutGST",
    "submittedValueInCrWithoutGST",

    "tenderDated",
    "lastDateOfSub",
    "soleOrConsortium",
    "participatedWithPartner",

    "prebidMeetingDateTime",
    "competitorsInfo",
    "wonLostParticipated",
    "openClosed",
    "orderWonValueInCrWithoutGST",
    "presentStatus",
    "reasonForLossingOpp",
    "corrigendumsDateFile",
  ];

  // ----------------------------
  // HANDLE FILE UPLOAD
  // ----------------------------
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setError("");
    setSuccess("");

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // Convert Excel to JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length === 0) {
        setError("Excel file is empty.");
        return;
      }

      const excelColumns = jsonData[0].map((col) => col.toString().trim());

      // Validate columns
      const missing = DB_COLUMNS_MATCH.filter(
        (col) => !excelColumns.includes(col),
      );
      const extra = excelColumns.filter(
        (col) => !DB_COLUMNS_MATCH.includes(col),
      );

      if (missing.length > 0 || extra.length > 0) {
        setError(
          `Column mismatch!
          Missing : ${missing.join(", ") || "None"}; 
          Extra : ${extra.join(", ") || "None"}`,
        );
        return;
      }

      // Remove header & extract data rows

      console.log("jsonData from browse", jsonData);
      const rows = jsonData.slice(1).map((row) => {
        const rowObj = {};
        DB_COLUMNS.forEach((col, index) => {
          // if (col==="") {
          //   setError(`This field is blank`)
          //   return;
          // }
          if (col === "OperatorId") {
            rowObj[col] = user?.id || "291536";
            return;
          }

          if (col === "OperatorName") {
            rowObj[col] = user?.username;
            return;
          }

          if (col === "OperatorRole") {
            rowObj[col] = user?.userRole;
            return;
          }

          if (col === "OperatorSBU") {
            rowObj[col] = "Software SBU";
            return;
          } else {
            rowObj[col] = row[index] || "";
          }
        });
        return rowObj;
      });

      setExcelData(rows);
      setIsUploaded(false); // 🔥 reset so button comes back
      setSuccess(`File validated successfully. Total rows: ${rows.length}`);
    };
    console.log(excelData);

    reader.readAsArrayBuffer(file);
  };


  // ----------------------------
  // SEND TO BACKEND
  // ----------------------------
  const handleUploadToServer = async () => {
    if (excelData.length === 0) {
      setError("No valid data found to upload.");
      return;
    }

    // ✅ STEP 1: Validate required fields
    const invalidRows = excelData.filter((row) => !row.segment || !row.project);

    if (invalidRows.length > 0) {
      console.error("Invalid Rows:", invalidRows);

      setError(
        `❌ ${invalidRows.length} rows missing Segment or Project. Fix Excel and re-upload.`,
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      console.log("Sending Excel Data:", excelData);

      const response = await axios.post(`${ServerIp}/domesticLeadsBulkUpload`, {
        excelData: excelData,
        OperatorId: user?.id || "291536",
        OperatorName: user?.username || "Default User",
      });

      console.log("Server response:", response);

      if (response?.data?.success) {
        setSuccess("✅ Data successfully pushed into the database!");

        // 🔥 IMPORTANT: Hide button after success
        setIsUploaded(true);

        

        console.log("Generated Leads:", response.data.data);
      } else {
        setError(response?.data?.message || "❌ Failed to upload data.");
      }
    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "❌ Server error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  // HERE WE ARE CALLING THE API TO BULK UPLOAD
  const handleBulkUpload = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await axios.post(`${ServerIp}/domesticLeadsBulkUpload`, {
        excelData: excelData, // must match backend
        OperatorId: user?.id || "291536",
        OperatorName: user?.username || "Default User",
      });

      console.log("Server response:", response);

      if (response?.data?.success) {
        setSuccess("✅ Data successfully pushed into the database!");

        // Optional: log generated leadReferenceNo
        console.log("Inserted Records:", response.data.data);
      } else {
        setError(response?.data?.message || "❌ Failed to upload data.");
      }
    } catch (error) {
      console.error("Upload error:", error);

      setError(
        error?.response?.data?.message ||
          error?.message ||
          "❌ Server error occurred",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        mb: 5,
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #eef5ff 0%, #f8fbff 100%)",
        borderRadius: 4,
        p: 3,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          mb: 8,
          width: "100%",
          maxWidth: 720,
          p: 4,
          borderRadius: 4,
          position: "relative", // ✅ REQUIRED FOR TOP-RIGHT BUTTON
          background: "rgba(255,255,255,0.9)",
          backdropFilter: "blur(12px)",
          boxShadow: "0 20px 45px rgba(0,0,0,0.12)",
        }}
      >
        {/* DOWNLOAD SAMPLE BUTTON */}

        {/* <Box sx={{ position: "absolute", top: 16, right: 16 }}>
  <Button
    // startIcon={<CloudQueueRoundedIcon />}
    onClick={handleDownloadSampleExcel}
    sx={{
      borderRadius: 999,
      px: 3,
      py: 0.9,
      fontWeight: 700,
      fontSize: 13,
      textTransform: "none",

      color: "#2563eb",
      backgroundColor: "#eff6ff",
      border: "1px solid #bfdbfe",

      boxShadow: "0 4px 12px rgba(37,99,235,0.15)",
      transition: "all 0.2s ease",

      "&:hover": {
        backgroundColor: "#dbeafe",
        borderColor: "#60a5fa",
        transform: "translateY(-1px)",
      },
    }}
  >
    Download Sample Excel
  </Button>
</Box> */}

        <Box sx={{ position: "absolute", top: 16, right: 16 }}>
          <Button
            variant="contained"
            onClick={handleDownloadSampleExcel}
            component="label"
            sx={{
              borderRadius: 999,
              px: 2,
              py: 1.2,
              fontWeight: 900,
              fontSize: 12,
              textTransform: "none",
              color: "#ffffff",
              // background:
              //   "linear-gradient(135deg, #42a5f5 0%, #2563eb 50%, #1e40af 100%)",
              background: "linear-gradient(135deg, #f0f9ff, #e0f2fe)",
              color: "#1e40af",
              border: "1.5px solid #bae6fd",
              transition: "all 0.25s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #e0f2fe, #dbeafe)",
                boxShadow: "0 14px 32px rgba(37,99,235,0.45)",
                transform: "translateY(-2px) scale(1.03)",
              },
              "&:active": {
                transform: "scale(0.96)",
                boxShadow: "0 6px 14px rgba(37,99,235,0.35)",
              },
            }}
          >
            Sample format
          </Button>
        </Box>

        {/* TITLE */}
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            textAlign: "center",
            color: "#0d47a1",
            mb: 1,
            mt: 8, // ✅ prevents overlap with button
          }}
        >
          Upload Domestic Lead Data
        </Typography>

        <Typography
          variant="body2"
          sx={{
            textAlign: "center",
            color: "#64748b",
            mb: 3,
          }}
        >
          Upload Excel file (.xlsx / .xls) to bulk insert records into the
          system
        </Typography>

        {/* UPLOAD BOX */}
        {excelData.length === 0 && (
          <Box
            sx={{
              mb: 5,
              border: "2px dashed #93c5fd",
              borderRadius: 4,
              p: { xs: 4, sm: 6 },
              minHeight: 280,
              textAlign: "center",
              background: "linear-gradient(180deg, #f8fbff 0%, #eef5ff 100%)",
              transition: "all 0.25s ease",
              "&:hover": {
                background: "linear-gradient(180deg, #eef5ff 0%, #e0f2fe 100%)",
                borderColor: "#3b82f6",
                boxShadow: "0 10px 30px rgba(59,130,246,0.15)",
              },
            }}
          >
            {/* ICON */}
            <Box
              sx={{
                mb: 4,
                animation: "float 3s ease-in-out infinite",
                "@keyframes float": {
                  "0%": { transform: "translateY(0px)" },
                  "50%": { transform: "translateY(-8px)" },
                  "100%": { transform: "translateY(0px)" },
                },
              }}
            >
              <CloudQueueRoundedIcon
                sx={{
                  fontSize: 64,
                  background: "linear-gradient(135deg, #93c5fd, #3b82f6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 8px 16px rgba(59,130,246,0.35))",
                }}
              />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, color: "#0f172a", mb: 0.5 }}
            >
              Drag & drop your file here
            </Typography>

            <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
              or click to browse (.xlsx or .xls)
            </Typography>

            {/* BROWSE FILE BUTTON */}
            <Button
              variant="contained"
              component="label"
              sx={{
                borderRadius: 999,
                px: 4,
                py: 1.2,
                fontWeight: 700,
                fontSize: 14,
                textTransform: "none",
                color: "#ffffff",
                background:
                  "linear-gradient(135deg, #42a5f5 0%, #2563eb 50%, #1e40af 100%)",
                boxShadow: "0 8px 22px rgba(37,99,235,0.35)",
                transition: "all 0.25s ease",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #1d4ed8 100%)",
                  boxShadow: "0 14px 32px rgba(37,99,235,0.45)",
                  transform: "translateY(-2px) scale(1.03)",
                },
                "&:active": {
                  transform: "scale(0.96)",
                  boxShadow: "0 6px 14px rgba(37,99,235,0.35)",
                },
              }}
            >
              📁 Browse File
              <input
                type="file"
                accept=".xlsx,.xls"
                hidden
                onChange={handleFileUpload}
              />
            </Button>
          </Box>
        )}

        {/* STATUS MESSAGES */}
        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mt: 3 }}>
            {success}
          </Alert>
        )}

        {/* PUSH BUTTON */}
        {excelData.length > 0 && !isUploaded && (
          <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
            <Button
              variant="contained"
              color="success"
              size="large"
              onClick={handleUploadToServer}
              disabled={loading}
              sx={{
                px: 5,
                py: 1.4,
                borderRadius: 999,
                fontWeight: 700,
                textTransform: "none",
                boxShadow: "0 8px 20px rgba(22,163,74,0.35)",
              }}
            >
              {loading ? (
                <CircularProgress size={26} sx={{ color: "#fff" }} />
              ) : (
                "Push Data to Database"
              )}
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

export default DomesticLeadForm;
