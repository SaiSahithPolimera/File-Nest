const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");
const db = require("../db/queries");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const userID = req.session.passport.user;
    const dirPath = `uploads/${userID}`;
    try {
      if (!(await fs.exists(dirPath))) {
        await fs.mkdir(dirPath);
        await db.createNewFolder(userID.toString(), userID, dirPath, null);
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
    const userID = req.session.passport.user;
    const { folderName } = req.params;
    const folderID = folderName
      ? await db.getFolderIDByName(folderName, userID)
      : await db.getFolderIDByName(userID.toString(), userID);
    const fileSize = (file.size / 1048676).toFixed(2) + " MB";
    if ((file.size / 1048676).toFixed(2) > 10) {
      return res.render("dashboard", {
        error: "Files size cannot exceed 10MB",
      });
    }
    await db.createNewFile(file.filename, fileSize, file.path, folderID);
    return res.redirect("/dashboard");
  },
];

exports.newFolderGet = async (req, res) => {
  const folderName = req.params.folderName.split("-").join(" ");
  const userID = req.session.passport.user;
  const folderID = await db.getFolderIDByName(folderName, userID);
  const filesData = await db.getFilesFromFolder(folderID);
  const subFolders = await db.getSubFolders(folderID, userID);
  return res.render("dashboard", {
    filesData: filesData,
    subFolders: subFolders,
    folderName,
    folderID,
  });
};

exports.newFolderPost = [
  upload.single("fileName"),
  async (req, res) => {
    const file = req.file;
    console.log("Invoke new folder post");
    const userID = req.session.passport.user;
    const { folderName } = !req.params ? userID : req.params;
    const folderID = await db.getFolderIDByName(
      folderName.split("-").join(" "),
      userID
    );``
    const fileSize = (file.size / 1048676).toFixed(2) + " MB";
    if ((file.size / 1048676).toFixed(2) > 10) {
      return res.render("dashboard", {
        error: "Files size cannot exceed 10MB",
      });
    }
    await db.createNewFile(file.filename, fileSize, file.path, folderID);
    return res.redirect(`/dashboard/${folderName}`);
  },
];

const deleteFiles = (files) => {
  files.forEach((file) => {
    fs.remove(file.path, async (err) => {
      if (err) {
        console.log(`Error occurred while deleting ${file.file_name}`);
      } else {
        await db.deleteFile(file.file_id);
      }
    });
  });
};

exports.deleteFolderGet = async (req, res) => {
  const { folderName } = req.params;
  const userID = req.session.passport.user;
  const folderID = await db.getFolderIDByName(
    folderName.split("-").join(" "),
    userID
  );
  const { path } = await db.getFolderDetails(folderID, userID);
  const files = await db.getFilesFromFolder(folderID);
  const subFolders = await db.getSubFolders(folderID, userID);
  fs.remove(path, async (err) => {
    if (err) {
      console.log("Error while removing folder");
      console.error(err);
    } else {
      if (files) {
        deleteFiles(files);
      }
      if (subFolders) {
        subFolders.forEach(async (subFolder) => {
          const files = await db.getFilesFromFolder(subFolder.folder_id);
          deleteFiles(files);
          await db.deleteFolder(subFolder.folder_id, userID);
        });
      }
      console.log("Folder removed successfully!");
      await db.deleteFolder(folderID, userID);
      res.redirect(`/dashboard`);
    }
  });
};
