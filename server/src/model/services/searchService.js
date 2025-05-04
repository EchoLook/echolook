import { downloadFile, getClient, uploadFile } from '../connectors/aws.js';
import Picture from '../entities/picture.js';
import Search from '../entities/search.js';
import { findProducts, getToken, search as searchImage } from '../connectors/inditexClient.js';
import { spawn } from 'child_process';
import { readdir, readFile } from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import Segment from '../entities/segment.js';
import { processAudio } from '../connectors/whisper.js';
import { getImage, run } from '../connectors/fashnia.js';


const uploadPicture = async (img, userId) => {
  try {
    const conf = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    };
    const bucket = process.env.PICTURE_BUCKET;
    const client = await getClient(conf);
    const key = img.filename;
    const filepath = img.path;
    const url = await uploadFile({
      client,
      bucket,
      key,
      filepath,
    });

    const search = new Search();
    if (userId) search.user = userId;
    const picture = new Picture();
    picture.url = url;
    const storedPicture = await picture.save();
    search.picture = storedPicture._id;
    const storedSearch = await search.save();
    picture.search = storedSearch._id;
    await picture.save();

    await segment(url);

    const files = await readdir(path.resolve('output'));
    const pngFiles = files.filter(file => file.endsWith('.png'));
    const jsonFile = files.find(file => file === 'segmentation.json');
    const jsonData = JSON.parse(await readFile(path.join('output', jsonFile), 'utf-8'));

    search.segments = [];

    let counter = 0;
    for (const [_, classData] of Object.entries(jsonData.classes)) {
      if (jsonData.numClasses === 1) {
        counter = 3;
      }
      const [x, y] = classData.center;
      const segment = new Segment();
      const segmentPicture = new Picture();
      segment.search = storedSearch._id;
      const filepath = path.join(path.resolve('output'), pngFiles[counter]);
      const ext = path.extname(filepath);
      const millis = Date.now();
      const segmentKey = `${uuidv4()}-${millis}${ext}`;
      const segmentUrl = await uploadFile({
        client,
        bucket,
        key: segmentKey,
        filepath,
      });
      segmentPicture.url = segmentUrl;
      segment.coords = { x, y };
      const storedSegmentPicture = await segmentPicture.save();
      segment.picture = storedSegmentPicture._id;
      const storedSegment = await segment.save();
      storedSegmentPicture.segment = storedSegment._id;
      await storedSegmentPicture.save();
      search.segments.push(segment._id);
      counter++;
    }

    await search.save();
    return await search.populate('picture segments');
  } catch (error) {
    throw error;
  }
}


const segment = async (url) => {

  const pythonPath = '/usr/local/opt/python@3.9/Frameworks/Python.framework/Versions/3.9/bin/python3.9';
  const scriptPath = 'ai/cloth-segmentation-mini/main.py';
  const args = ['--image', url, '--threshold', '0.5'];

  return new Promise((resolve, reject) => {
    const python = spawn(pythonPath, [scriptPath, ...args]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

const searchSegment = async (id) => {
  try {
    const segment = await Segment.findById(id).populate('picture');
    if (!segment) {
      throw new Error('Search not found');
    }

    const { id_token: token } = await getToken();
    const searchResult = await searchImage(token, segment.picture.url);

    return searchResult;
  } catch (error) {
    throw error;
  }
}

const getHistory = async (userId) => {
  try {
    const searches = await Search.find({ user: userId }).populate('picture segments').sort({ date: -1 });
    return searches;
  } catch (error) {
    throw error;
  }
}

const productSearch = async (id, audio) => {
  try {
    const picture = await Picture.findById(id);
    const conf = {
      accessKeyId: process.env.ACCESS_KEY_ID,
      secretAccessKey: process.env.SECRET_ACCESS_KEY,
    };
    const bucket = process.env.PICTURE_BUCKET;
    const client = await getClient(conf);
    const key = picture.url.split('/').pop();
    const filepath = path.join('tmp', key);
    await downloadFile({
      client,
      bucket,
      key,
      filepath,
    });
    const items = (await processAudio({ filename: key, filepath }, audio))?.query?.items;
    const { id_token: token } = await getToken();
    return await Promise.all(items.map(async item => {
      const { description, max_price: maxPrice } = item;
      const searchResult = await findProducts(token, { query: description });
      return {
        description,
        maxPrice,
        results: searchResult.filter(product => {
          const price = parseFloat(product.price.value.current);
          return price <= maxPrice;
        }).slice(0, 3)
      }
    }));
  } catch (error) {
    throw error;
  }
}

const scrape = async (url) => {
  const pythonPath = '/usr/local/opt/python@3.9/Frameworks/Python.framework/Versions/3.9/bin/python3.9';
  const scriptPath = 'scripts/zara-scrap.py';
  const args = [url];

  return new Promise((resolve, reject) => {
    const python = spawn(pythonPath, [scriptPath, ...args]);

    let output = '';
    let errorOutput = '';

    python.stdout.on('data', (data) => {
      output += data.toString();
    });

    python.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    python.on('close', (code) => {
      if (code === 0) {
        resolve(output);
      } else {
        reject(new Error(`Python process exited with code ${code}: ${errorOutput}`));
      }
    });
  });
}

export const tryItOn = async (modelUrl, garmentLink) => {
  try {
    const garmentUrl = await scrape(garmentLink);
    const { id } = await run(modelUrl, garmentUrl);
    const image = await getImage(id);
    return image;
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default { uploadPicture, searchSegment, getHistory, productSearch, tryItOn };