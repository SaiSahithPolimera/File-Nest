const multer = require("multer");
const path = require("path");
const fs = require("fs-extra");

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      if (!(await fs.exists(`uploads/${req.session.passport.user}`))) {
        await fs.mkdir(`uploads/${req.session.passport.user}`);
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

module.exports = upload;
