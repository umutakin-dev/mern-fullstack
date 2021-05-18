const multer = require("multer");
const uuid = require("uuid").v1;

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
};

const fileUpload = multer({
  limits: 500000, // 500kb
  storage: multer.diskStorage({
    destination: (req, file, callback) => {
      callback(null, "uploads/images/");
    },
    filename: (req, file, callback) => {
      const extension = MIME_TYPE_MAP[file.mimetype];
      callback(null, uuid() + "." + extenstion);
    },
  }),
});

module.exports = fileUpload;
