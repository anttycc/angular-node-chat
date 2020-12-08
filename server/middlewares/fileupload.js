
const fs = require('fs');
const path = require('path');
exports.upload = (req, res, next) => {
  const body = req.files;
  const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg',]
    if (body && body.file && body.file[0] && allowedTypes.includes(body.file[0].mimetype)) {
      const file = body.file[0];
      const segment = file.originalname.split('.');
      const ext = segment[segment.length - 1];
      const filename = `${new Date().getTime()}.${ext}`;
      const uploadFolder = path.join(__dirname, `../public/uploads`);
      if (!fs.existsSync(uploadFolder)) {
        fs.mkdirSync(`${uploadFolder}`, { recursive: true });
      }
      fs.writeFile(`./public/uploads/${filename}`, file.buffer, (err) => {
        if (err) {

          next(err)
        } else {
          req.body.profileImage = `${'uploads'}/${filename}`;
          next();
        }
      })
    } else {
      next({ statusCode: 400, message: 'Invalid file format.' })
    }
  }