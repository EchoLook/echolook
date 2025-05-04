import searchService from '../../model/services/searchService.js'
import errorHandlers from './errorHandlers.js';

export const upload = async (req, res) => {
  try {
    const result = await searchService.uploadPicture(req.file, req.userId);
    res.status(200).send({result});
  } catch (error) {
    console.error('Error uploading image:', error);
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
};

export const search = async (req, res) => {
  try {
    const result = await searchService.searchSegment(req.params.id, req.userId);
    res.status(200).send({result});
  } catch (error) {
    console.error('Error searching:', error);
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
};

export const getHistory = async (req, res) => {
  try {
    const result = await searchService.getHistory(req.userId);
    res.status(200).send({result});
  } catch (error) {
    console.error('Error getting history:', error);
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
}

export const audioProductSearch = async (req, res) => {
  try {
    const result = await searchService.productSearch(req.body.id, req.file);
    res.status(200).send({result});
  } catch (error) {
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
}

export const tryItOn = async (req, res) => {
  try {
    const result = await searchService.tryItOn(req.body.modelUrl, req.body.garmentLink);
    res.status(200).send({result});
  } catch (error) {
    const errorHandler = errorHandlers[error.constructor.name] || errorHandlers.InternalServerError;
    errorHandler(res);
  }
}