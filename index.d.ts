export module winCert {
  /**
   * Get all certificates from windows store
   *
   * @param [options] - Options
   * @param [options.storeName] - Store Name (e.g. - Root)
   * @param [options.storeLocation] - Store Location (CurrentUser or LocalMachine)
   * @returns Returns an array of certificates in object format
   */
  function getAllCertificates(
    options?: AllCertOptions
  ): Promise<Array<Certificate>>;

  /**
   * ATTENTION - The certificate must be marked as exported and imported
   * properly (the key must be stored in the right place),
   * otherwise the method returns a certificate with a blank key.
   *
   * Get specific certificate by Thumbprint
   *
   * @param options - Required options
   * @param options.storeName - Store Name (e.g. - Root)
   * @param options.storeLocation - Store Location (CurrentUser or LocalMachine)
   * @param options.thumbprint - Certificate's thumbprint
   * @returns Returns an object with certificate
   * and private key in PEM format
   */
  function getCertificate(options: OneCertOptions): Promise<CertificateAndKey>;
}

declare type AllCertOptions = {
  storeName: StoreNameEnum;
  storeLocation: StoreLocationEnum;
};

declare type OneCertOptions = {
  storeName: StoreNameEnum;
  storeLocation: StoreLocationEnum;
  thumbprint: string;
};

declare type Certificate = {
  subject: string;
  issuer: string;
  thumbprint: string;
  pem: string;
};

declare type CertificateAndKey = {
  cert: string;
  key: string;
};

declare enum StoreLocationEnum {
  CurrentUser = 'CurrentUser',
  LocalMachine = 'LocalMachine'
}

declare enum StoreNameEnum {
  AddressBook = 'AddressBook',
  AuthRoot = 'AuthRoot',
  CertificateAuthority = 'CertificateAuthority',
  Disallowed = 'Disallowed',
  My = 'My',
  Root = 'Root',
  TrustedPeople = 'TrustedPeople',
  TrustedPublisher = 'TrustedPublisher'
}
