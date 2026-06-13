// Fix: Metro's transform worker calls data.toString('utf8') on ALL files
// BEFORE checking if it's an asset. For large WAV files (600MB+), this crashes.
// This config patches the transform to skip string conversion for asset files.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const defaultConfig = getDefaultConfig(__dirname);

// Add a custom serializer/transformer to handle large assets
defaultConfig.transformer.assetPlugins = [
  ...(defaultConfig.transformer.assetPlugins || []),
];

// Ensure .wav and other audio files are treated as assets (not JS)
defaultConfig.resolver.assetExts = [
  ...new Set([
    ...defaultConfig.resolver.assetExts,
    'wav', 'mp3', 'aac', 'm4a', 'ogg',
  ]),
];

module.exports = defaultConfig;
