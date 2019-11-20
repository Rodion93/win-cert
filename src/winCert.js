const edge = require('edge-js');
const path = require('path');
const certsConsts = require('./constants/certificateConsts');

const certificates = edge.func(path.join(__dirname, 'certificates.cs'));

exports.getAllCertificates = getAllCertificates;
exports.getCertificate = getCertificate;

const BASE_STORE_NAME = 'Root';
const BASE_STORE_LOCATION = 'CurrentUser';

/**
 * Get all certificates from windows store
 *
 * @param {Object} [options] - Options
 * @param {string} [options.storeName] - Store Name (e.g. - Root)
 * @param {string} [options.storeLocation] - Store Location (CurrentUser or LocalMachine)
 * @returns {Promise<Array<string>>} Returns an array of certificates in PEM format
 */
async function getAllCertificates(options) {
  if (!options) {
    options = {};
  }

  const params = {
    storeName: options.storeName || BASE_STORE_NAME,
    storeLocation: options.storeLocation || BASE_STORE_LOCATION,
    allCertificates: true
  };

  validateParams(params);

  return execute(params);
}

/**
 * ATTENTION - The certificate must be marked as exported and imported
 * properly (the key must be stored in the right place),
 * otherwise the method returns a certificate with a blank key.
 *
 * Get specific certificate by Thumbprint
 *
 * @param {Object} options - Required options
 * @param {string} options.storeName - Store Name (e.g. - Root)
 * @param {string} options.storeLocation - Store Location (CurrentUser or LocalMachine)
 * @param {string} options.thumbprint - Certificate's thumbprint
 * @returns {Promise<Object>} Returns an object with certificate
 * and private key in PEM format
 */
async function getCertificate(options) {
  if (!options) {
    throw new Error('Options required');
  }

  const params = {
    storeName: options.storeName,
    storeLocation: options.storeLocation,
    thumbprint: options.thumbprint,
    allCertificates: false
  };

  validateParams(params);

  return execute(params);
}

/**
 * Validates Store Name and Store Location
 *
 * @param {Object} params - Required options
 * @param {string} params.storeName - Store Name (e.g. - Root)
 * @param {string} params.storeLocation - Store Location (CurrentUser or LocalMachine)
 */
function validateParams(params) {
  if (!certsConsts.storeLocations.includes(params.storeLocation)) {
    throw new Error(
      `Store Location - ${params.storeLocation} is not supported.`
    );
  }
  if (!certsConsts.storeNames.includes(params.storeName)) {
    throw new Error(`Store Name - ${params.storeName} is not supported.`);
  }
}

/**
 * Main execute function that calls edge-js
 *
 * @param {Object} params - Required options
 * @param {string} params.storeName - Store Name (e.g. - Root)
 * @param {string} params.storeLocation - Store Location (CurrentUser or LocalMachine)
 * @param {string} [params.thumbprint] - Certificate's thumbprint
 * @param {boolean} params.allCertificates - Get all or get one
 *
 * @returns {Promise<any>} Returns certificates or key and cert pair
 */
function execute(params) {
  return new Promise((resolve, reject) => {
    return certificates(params, (err, res) => {
      if (err) {
        reject(err);
      }
      resolve(res);
    });
  });
}
