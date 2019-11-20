using System;
using System.IO;
using System.Linq;
using System.Security.Cryptography;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;

public static class CertExtensions
{
    public static string ExportPEMEncoded(this X509Certificate2 cert)
    {
        return "-----BEGIN CERTIFICATE-----\n" +
               Convert.ToBase64String(cert.Export(X509ContentType.Cert)).SplitLines() +
               "\n-----END CERTIFICATE-----";
    }
}

public static class StringExtensions
{
    public static string SplitLines(this string str)
    {
        int chunkSize = 64;
        int chunksCount = (int)Math.Ceiling((decimal)str.Length / chunkSize);

        var chunks = Enumerable.Range(0, chunksCount)
            .Select(i =>
            {
                return i == chunksCount - 1 ? str.Substring(i * chunkSize) :
                                              str.Substring(i * chunkSize, chunkSize);
            })
            .ToList();

        return string.Join("\n", chunks);
    }
}

public class Startup
{
    private class CertificateAndKey
    {
        public string cert;
        public string key;
    }

    public async Task<object> Invoke(object input)
    {
        dynamic options = (dynamic)input;

        dynamic storeName = Enum.Parse(typeof(StoreName), options.storeName);
        dynamic storeLocation = Enum.Parse(typeof(StoreLocation), options.storeLocation);
        dynamic allCertificates = options.allCertificates;

        using (var store = new X509Store(storeName, storeLocation))
        {
            store.Open(OpenFlags.ReadOnly);

            if (allCertificates)
            {
                return GetAllCertificates(store);
            }
            else
            {
                return GetSpecificCertificate(store, options.thumbprint);
            }
        }
    }

    private object GetAllCertificates(X509Store store)
    {
        return store.Certificates.Cast<X509Certificate2>().Select(cert => new
        {
            pem = cert.ExportPEMEncoded(),
            subject = cert.SubjectName.Name,
            thumbprint = cert.Thumbprint,
            issuer = cert.IssuerName.Name
        });
    }

    private CertificateAndKey GetSpecificCertificate(X509Store store, dynamic thumbprint)
    {
        var foundCerts = store.Certificates.Find(X509FindType.FindByThumbprint, thumbprint, true);

        foreach (var cert in foundCerts)
        {
            var certificate = (X509Certificate2)cert;

            var certAndKey = new CertificateAndKey
            {
                cert = certificate.ExportPEMEncoded()
            };

            try
            {
                var privateKey = (RSACryptoServiceProvider)certificate.PrivateKey;

                using (var stringWriter = new StringWriter())
                {
                    ExportPrivateKey(privateKey, stringWriter);
                    certAndKey.key = stringWriter.ToString();
                }
            }
            catch (Exception) { }

            return certAndKey;
        }

        return null;
    }

    private void ExportPrivateKey(RSACryptoServiceProvider csp, TextWriter outputStream)
    {
        if (csp.PublicOnly)
        {
            throw new ArgumentException("CSP does not contain a private key", "csp");
        }

        var parameters = csp.ExportParameters(true);
        using (var stream = new MemoryStream())
        using (var writer = new BinaryWriter(stream))
        using (var innerStream = new MemoryStream())
        using (var innerWriter = new BinaryWriter(innerStream))
        {
            writer.Write((byte)0x30);
            EncodeIntegerBigEndian(innerWriter, new byte[] { 0x00 });
            EncodeIntegerBigEndian(innerWriter, parameters.Modulus);
            EncodeIntegerBigEndian(innerWriter, parameters.Exponent);
            EncodeIntegerBigEndian(innerWriter, parameters.D);
            EncodeIntegerBigEndian(innerWriter, parameters.P);
            EncodeIntegerBigEndian(innerWriter, parameters.Q);
            EncodeIntegerBigEndian(innerWriter, parameters.DP);
            EncodeIntegerBigEndian(innerWriter, parameters.DQ);
            EncodeIntegerBigEndian(innerWriter, parameters.InverseQ);
            var length = (int)innerStream.Length;
            EncodeLength(writer, length);
            writer.Write(innerStream.GetBuffer(), 0, length);

            var base64 = Convert.ToBase64String(stream.GetBuffer(), 0, (int)stream.Length).ToCharArray();
            outputStream.WriteLine("-----BEGIN RSA PRIVATE KEY-----");
            for (var i = 0; i < base64.Length; i += 64)
            {
                outputStream.WriteLine(base64, i, Math.Min(64, base64.Length - i));
            }
            outputStream.WriteLine("-----END RSA PRIVATE KEY-----");
        }
    }

    private void EncodeLength(BinaryWriter stream, int length)
    {
        if (length < 0)
        {
            throw new ArgumentOutOfRangeException("length", "Length must be non-negative");
        }

        if (length < 0x80)
        {
            stream.Write((byte)length);
        }
        else
        {
            var temp = length;
            var bytesRequired = 0;
            while (temp > 0)
            {
                temp >>= 8;
                bytesRequired++;
            }
            stream.Write((byte)(bytesRequired | 0x80));
            for (var i = bytesRequired - 1; i >= 0; i--)
            {
                stream.Write((byte)(length >> (8 * i) & 0xff));
            }
        }
    }

    private void EncodeIntegerBigEndian(BinaryWriter stream, byte[] value, bool forceUnsigned = true)
    {
        stream.Write((byte)0x02);
        var prefixZeros = 0;
        for (var i = 0; i < value.Length; i++)
        {
            if (value[i] != 0)
            {
                break;
            }

            prefixZeros++;
        }
        if (value.Length - prefixZeros == 0)
        {
            EncodeLength(stream, 1);
            stream.Write((byte)0);
        }
        else
        {
            if (forceUnsigned && value[prefixZeros] > 0x7f)
            {
                EncodeLength(stream, value.Length - prefixZeros + 1);
                stream.Write((byte)0);
            }
            else
            {
                EncodeLength(stream, value.Length - prefixZeros);
            }
            for (var i = prefixZeros; i < value.Length; i++)
            {
                stream.Write(value[i]);
            }
        }
    }
}
