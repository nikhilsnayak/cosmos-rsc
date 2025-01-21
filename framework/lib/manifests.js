const { readFile } = require('fs/promises');
const { lazy } = require('./utils');
const {
  REACT_CLIENT_MANIFEST_PATH,
  REACT_SSR_MANIFEST_PATH,
} = require('./constants');

const reactClientManifest = lazy(async () => {
  return JSON.parse(await readFile(REACT_CLIENT_MANIFEST_PATH, 'utf-8'));
});

const reactSSRManifest = lazy(async () => {
  return JSON.parse(await readFile(REACT_SSR_MANIFEST_PATH, 'utf-8'));
});

async function getReactClientManifest() {
  const manifest = await reactClientManifest.value;
  return manifest;
}

async function getReactSSRManifest() {
  const manifest = await reactSSRManifest.value;
  return manifest;
}

module.exports = { getReactClientManifest, getReactSSRManifest };
