const winCert = require('../winCert');

const TEST_VALUE = 'TEST';
const OK_VALUE = 'Ok';
const DEFAULT_STORE_NAME = 'Root';
const DEFAULT_STORE_LOCATION = 'LocalMachine';

describe('Get all certificates', () => {
  describe('Ok tests', () => {
    beforeAll(async () => {
      winCert.__Rewire__('certificates', function(payload, callback) {
        callback(null, OK_VALUE);
      });
    });

    it('should return Ok (with default options)', async () => {
      const result = await winCert.getAllCertificates();

      expect(result).toBeTruthy();
      expect(result).toEqual(OK_VALUE);
    });

    it('should return Ok (with custom options)', async () => {
      const result = await winCert.getAllCertificates({
        storeName: DEFAULT_STORE_NAME,
        storeLocation: DEFAULT_STORE_LOCATION
      });

      expect(result).toBeTruthy();
      expect(result).toEqual(OK_VALUE);
    });
  });

  describe('Error tests', () => {
    beforeEach(async () => {
      winCert.__Rewire__('certificates', function(payload, callback) {
        callback(null, OK_VALUE);
      });
    });

    it('should throw error when function rejects', async () => {
      winCert.__Rewire__('certificates', function(payload, callback) {
        callback(new Error(TEST_VALUE), null);
      });
      expect.assertions(1);

      try {
        await winCert.getAllCertificates();
      } catch (err) {
        expect(err.message).toEqual(TEST_VALUE);
      }
    });

    it('should throw error if StoreLocation is not supported', async () => {
      expect.assertions(1);
      const options = {
        storeLocation: TEST_VALUE
      };

      try {
        await winCert.getAllCertificates(options);
      } catch (err) {
        expect(err.message).toEqual(
          `Store Location - ${options.storeLocation} is not supported.`
        );
      }
    });

    it('should throw error if StoreName is not supported', async () => {
      expect.assertions(1);
      const options = {
        storeName: TEST_VALUE
      };

      try {
        await winCert.getAllCertificates(options);
      } catch (err) {
        expect(err.message).toEqual(
          `Store Name - ${options.storeName} is not supported.`
        );
      }
    });
  });
});

describe('Get single certificate', () => {
  describe('Ok tests', () => {
    beforeAll(async () => {
      winCert.__Rewire__('certificates', function(payload, callback) {
        callback(null, OK_VALUE);
      });
    });

    it('should return Ok', async () => {
      const result = await winCert.getCertificate({
        storeName: DEFAULT_STORE_NAME,
        storeLocation: DEFAULT_STORE_LOCATION,
        thumbprint: TEST_VALUE
      });

      expect(result).toBeTruthy();
      expect(result).toEqual(OK_VALUE);
    });
  });

  describe('Error tests', () => {
    let options;

    beforeEach(async () => {
      winCert.__Rewire__('certificates', function(payload, callback) {
        callback(null, OK_VALUE);
      });
      options = {
        storeName: DEFAULT_STORE_NAME,
        storeLocation: DEFAULT_STORE_LOCATION,
        thumbprint: TEST_VALUE
      };
    });

    it('should throw error when function rejects', async () => {
      winCert.__Rewire__('certificates', function(payload, callback) {
        callback(new Error(TEST_VALUE), null);
      });
      expect.assertions(1);

      try {
        await winCert.getCertificate(options);
      } catch (err) {
        expect(err.message).toEqual(TEST_VALUE);
      }
    });

    it('should throw error if options is not defined', async () => {
      expect.assertions(1);

      try {
        await winCert.getCertificate();
      } catch (err) {
        expect(err.message).toEqual('Options required');
      }
    });

    it('should throw error if StoreLocation is not supported', async () => {
      expect.assertions(1);
      options.storeLocation = TEST_VALUE;

      try {
        await winCert.getCertificate(options);
      } catch (err) {
        expect(err.message).toEqual(
          `Store Location - ${options.storeLocation} is not supported.`
        );
      }
    });

    it('should throw error if StoreName is not supported', async () => {
      expect.assertions(1);
      options.storeName = TEST_VALUE;

      try {
        await winCert.getCertificate(options);
      } catch (err) {
        expect(err.message).toEqual(
          `Store Name - ${options.storeName} is not supported.`
        );
      }
    });
  });
});
