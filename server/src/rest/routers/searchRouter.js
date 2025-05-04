import express from 'express';
import { audioProductSearch, getHistory, search, tryItOn, upload } from '../controllers/searchController.js';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { checkAuth, requireAuth } from '../common/auth.js';

// Ruta local /tmp dentro del proyecto
const tmpDir = path.join('tmp');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, tmpDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const millis = Date.now();
      const filename = `${uuidv4()}-${millis}${ext}`;
      cb(null, filename);
    }
  });
const uploadMulter = multer({ storage });
const searchRouter = express.Router();

const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tmpDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, Date.now() + ext);
  },
});

const audioFilter = (req, file, cb) => {
  const allowedTypes = /audio\/mpeg|audio\/wav|audio\/ogg|audio\/webm/;
  if (allowedTypes.test(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de audio (mp3, wav, ogg, webm).'));
  }
};

const audioMulter = multer({
  storage: audioStorage,
  fileFilter: audioFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, 
});

searchRouter.post('/upload', uploadMulter.single('image'), checkAuth, upload);
searchRouter.get('/history', requireAuth, getHistory)
searchRouter.get('/:id', checkAuth, search);
searchRouter.post('/products', audioMulter.single('audio'), audioProductSearch);
searchRouter.post('/try', tryItOn);

export default searchRouter;