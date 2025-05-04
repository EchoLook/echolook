import crypto from 'crypto';
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';

import AWS from 'aws-sdk';

export async function getClient(conf) {
  const { region, accessKeyId, secretAccessKey } = conf;
  return new AWS.S3({
    region,
    accessKeyId,
    secretAccessKey,
  });
};

export function listBuckets({ client }) {
  return client.listBuckets().promise();
};

export async function listObjects({
  client,
  bucket,
  maxKeys,
}) {
  const params = {
    Bucket: bucket,
    MaxKeys: maxKeys,
  };
  return client.listObjectsV2(params).promise();
};

export function isValidUrl(str) {
  return str.startsWith('s3://');
};

function parseS3Url(str) {
  const url = new URL(str);

  const encodedKey = url.pathname.replace(/^\/+/, '');
  const key = encodedKey
    .split('/')
    .map((comp) => decodeURIComponent(comp.replaceAll('+', '%20')))
    .join('/');

  return {
    Bucket: url.host,
    Key: key,
  };
}

export async function uploadFile({
  client,
  bucket,
  key,
  filepath,
}) {
  const stream = fs.createReadStream(filepath);
  key = key ?? path.basename(filepath);
  const params = {
    Bucket: bucket,
    Key: key,
    Body: stream,
  };
  try {
    await client.upload(params).promise();
  } catch (err) {
    throw err;
  } finally {
    stream.destroy();
  }
  return `https://${bucket}.s3.amazonaws.com/${key}`;
};

export async function downloadFile({
  client,
  url,
  bucket,
  key,
  filepath,
}) {
  const params = url
    ? parseS3Url(url)
    : {
        Bucket: bucket,
        Key: key,
      };

  const res = await client.getObject(params).promise();
  await fsp.writeFile(filepath, res.Body);
  return res;
};

function md5(data) {
  return crypto.createHash('md5').update(data).digest().toString('base64');
}