const multer = require("multer");
const path = require("path");
const db = require("../db/queries");
const supabase = require("../config/supabase");
const { decode } = require("base64-arraybuffer");

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

exports.shareFileHandler = async (req, res) => {
  const { path, expireDuration } = req.body;

  const duration = Number(expireDuration.split("D")[0]) * 1440;

  const { data, error } = await supabase.storage.from("File-Nest").getPublicUrl(path)
  if (error) {
    console.error(error)
    res.json({
      message:
        "Error accessing storage!"
    });
  }
  if (data.publicUrl) {
    res.json({
      link: data.publicUrl
    })
  }
  else {
    const { data, error } = await supabase.storage.from("File-Nest").createSignedUploadUrl(path, duration)
    if (error) {
      console.error(error)
      res.json({
        message:
          "Error accessing storage!"
      });
    }
    if (data.signedUrl) {
      res.json({
        link: data.signedUrl
      })
    }
  }
}

const fileFilter = (req, file, cb) => {
  checkFileType(file, cb);
};

const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
});

exports.fileUploadPost = [
  upload.single("fileName"),
  async (req, res) => {
    const file = req.file;
    const userID = req.session.passport.user;
    const { folderName } = req.params;
    const fileBase64 = decode(file.buffer.toString("base64"));
    const fileName = `${Date.now()}-${file.originalname}`;
    const { data, error } = await supabase.storage
      .from("File-Nest")
      .upload(`${userID}/${fileName}`, fileBase64, {
        contentType: file.mimetype,
      });
    if (error) {
      console.error(error);
      console.log("Error occurred while uploading file");
      return res.redirect("/dashboard");
    } else {
      const folderID = folderName
        ? await db.getFolderIDByName(folderName, userID)
        : await db.getFolderIDByName(userID.toString(), userID);
      const fileSize = (file.size / 1048676).toFixed(2) + " MB";
      if ((file.size / 1048676).toFixed(2) > 10) {
        return res.render("dashboard", {
          error: "Files size cannot exceed 10MB",
        });
      }
      await db.createNewFile(fileName, fileSize, data.path, folderID);
      return res.redirect("/dashboard");
    }
  },
];

exports.newFolderGet = async (req, res) => {
  const folderName = req.params.folderName;
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
    const fileName = `${Date.now()}-${file.originalname}`;
    const userID = req.session.passport.user;
    const { folderName } = !req.params ? userID : req.params;
    const fileBase64 = decode(file.buffer.toString("base64"));
    const folderID = await db.getFolderIDByName(
      folderName,
      userID
    );
    const fileSize = (file.size / 1048676).toFixed(2) + " MB";
    if ((file.size / 1048676).toFixed(2) > 10) {
      return res.render("dashboard", {
        error: "Files size cannot exceed 10MB",
      });
    }
    const { path } = await db.getFolderDetails(folderID, userID);
    const { data, error } = await supabase.storage
      .from("File-Nest")
      .upload(
        `${path.replace(".emptyFolderPlaceholder", "")}/${fileName}`,
        fileBase64,
        {
          contentType: file.mimetype,
        }
      );
    await db.createNewFile(fileName, fileSize, data.path, folderID);
    return res.redirect(`/dashboard/${folderName}`);
  },
];

const deleteFiles = async (files) => {
  files.forEach(async (file) => {
    await supabase.storage
      .from("File-Nest")
      .remove([file.path])
      .then(async (res) => {
        await db.deleteFile(file.file_id);
      })
      .catch((err) => {
        console.log("Error occurred while deleting file");
        console.error(err);
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
  await supabase.storage
    .from("File-Nest")
    .remove([path])
    .then(async () => {
      console.log("Folder deleted successfully!");
      if (files) {
        await deleteFiles(files);
      }
      if (subFolders) {
        subFolders.forEach(async (subFolder) => {
          const files = await db.getFilesFromFolder(subFolder.folder_id);
          if (files) {
            await deleteFiles(files);
          }
          await supabase.storage
            .from("File-Nest")
            .remove([subFolder.path])
            .then(async () => {
              await db.deleteFolder(subFolder.folder_id, userID);
              console.log("Sub-Folder deleted successfully!");
            })
            .catch((err) => {
              console.log("Error deleting subfolder");
              console.error(err);
            });
        });
      }
      await db.deleteFolder(folderID, userID);
    })
    .catch((err) => {
      console.log("Error while deleting Folder");
      console.error(err);
    });
  return res.redirect(`/dashboard`);
};

exports.deleteFilePost = async (req, res) => {
  const { path } = req.body;
  const routes = path.split("/");
  const fileName = routes[routes.length - 1];
  await supabase.storage
    .from("File-Nest")
    .remove([path])
    .then(async () => {
      console.log("File deleted successfully!");
      const fileID = await db.getFileIDByName(fileName);
      await db.deleteFile(fileID);
    })
    .catch((err) => {
      console.log("Error while deleting file");
      console.error(err);
    });
  return res.redirect("/dashboard");
};

exports.downloadFileGet = async (req, res) => {
  const { path } = req.query;
  try {
    const { data, error } = await supabase.storage
      .from("File-Nest")
      .download(path);
    if (error) {
      res.status(404).send(`File not found: ${path}`);
    } else {
      const buffer = Buffer.from(await data.arrayBuffer());
      res.set("Content-Disposition", `attachment; filename="${path}"`);
      res.set("Content-Type", "application/octet-stream");
      res.send(buffer);
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Error downloading file");
  }
};

exports.newFolderCreateGet = async (req, res) => {
  const { folderName } = req.query;
  const { parentFolderID } = req.params;
  const userID = req.session.passport.user;
  const updatedFolderName = folderName.split(" ").join("-");
  let dirPath = `${userID}/${updatedFolderName}/.emptyFolderPlaceholder`;
  if (!parentFolderID) {
    await db.createNewFolder(folderName, userID, dirPath, userID);
  } else {
    const { path } = await db.getFolderDetails(Number(parentFolderID), userID);
    dirPath = `${path.replace(
      ".emptyFolderPlaceholder",
      ""
    )}/${updatedFolderName}/.emptyFolderPlaceholder`;
  }
  const { data, error } = await supabase.storage
    .from("File-Nest")
    .upload(dirPath);
  if (error) {
    console.log("Error creating new folder");
    console.error(error);
  } else if (parentFolderID) {
    await db.createNewFolder(
      updatedFolderName,
      userID,
      data.path,
      Number(parentFolderID)
    );
  }
  return res.redirect(`/dashboard`);
};
