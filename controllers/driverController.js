const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const db = require("../db/queries");
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dirPath = `uploads/${req.session.passport.user}`;
    try {
      if (!(await fs.exists(dirPath))) {
        await fs.mkdir(dirPath);
        await db.createNewFolder(
          req.session.passport.user.toString(),
          req.session.passport.user,
          dirPath
        );
        console.log("Folder created successfully!");
      }
    } catch (err) {
      console.error(err);
      cb("Error occurred while creating the folder!");
    }
    cb(null, `uploads/${req.session.passport.user}`);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const checkFileType = (file, cb) => {
  const fileTypes = /jpeg|jpg|txt|docx|pdf|png|gif/;
  const extension = fileTypes.test(
    path.extname(file.originalname).toLowerCase()
  );
  const mimetype = fileTypes.test(file.mimetype);

  if (extension && mimetype) {
    return cb(null, true);
  } else {
    cb("Error: File type not allowed!");
  }
};

const fileFilter = (req, file, cb) => {
  checkFileType(file, cb);
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

exports.fileUploadPost = [
  upload.single("fileName"),
  async (req, res) => {
    const file = req.file;
    const { folderName } = !req.params ? req.session.passport.user : req.params;
    const folderID = await db.getFolderIDByName(folderName);
    const fileSize = (file.size / 1048676).toFixed(2) + " MB";
    await db.createNewFile(
      file.filename,
      fileSize,
      file.mimetype,
      file.path,
      folderID
    );
    return res.redirect("/dashboard");
  },
];

exports.newFolderGet = async (req, res) => {
  const folderName = req.params.folderName.split("-").join(" ");
  const folderID = await db.getFolderIDByName(folderName);
  const filesData = await db.getFilesFromFolder(folderID);
  return res.render("dashboard", { filesData: filesData, folderName });
};

exports.newFolderPost = [
  upload.single("fileName"),
  async (req, res) => {
    const file = req.file;
    const { folderName } = !req.params ? req.session.passport.user : req.params;
    const folderID = await db.getFolderIDByName(
      folderName.split("-").join(" ")
    );
    const fileSize = (file.size / 1048676).toFixed(2) + " MB";
    await db.createNewFile(
      file.filename,
      fileSize,
      file.mimetype,
      file.path,
      folderID
    );
    res.redirect(`/dashboard/${folderName}`);
  },
];
