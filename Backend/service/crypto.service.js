import crypto from "crypto"
import dontenv from "dotenv"

dontenv.config();

//Buffer is Node.js’s built‑in class for handling raw binary data (sequences of bytes).

const SERVER_MASTER_ENCRYPTION_KEY = process.env.MASTER_ENCRYPTION_KEY
    ? Buffer.from(process.env.MASTER_ENCRYPTION_KEY, 'hex')
    : (() => {
        throw new Error("MASTER_ENCRYPTION_KEY is not defined");
    })();


if (SERVER_MASTER_ENCRYPTION_KEY.length !== 32) {
    throw new Error("MASTER_ENCRYPTION_KEY must be 32 bytes (64 hex characters)");
}

const IV_LENGTH = 12; // 96 bits is the recommended size for GCM

const cryptoService = {


    generateInitialRandomSecrete: () => {
        try {
            return crypto.randomBytes(16).toString('hex');
        } catch (error) {
            console.error('generate Initial Random Secrete failed:', error.message);
            throw error;
        }
    },


    /**
   * Verify a digital signature using a public key
   * @param {string} payload - Original data that was signed
   * @param {string} signature - Hex-encoded signature to verify
   * @param {string} publicKey - PEM-formatted public key
   * @returns {boolean} True if signature is valid
   */
    verifySignature: (payload, signature, publicKey) => {

        try {
            const verifier = crypto.createVerify('sha256');
            verifier.update(payload);
            return verifier.verify(publicKey, signature, 'hex');
        } catch (error) {
            console.error('Signature verification failed:', error.message);
            return false;
        }

    },

    /**
    * using for Server encrypts a session key using the gateway's public key.
   * Encrypt data using RSA public key (OAEP padding)
   * @param {string} data - Plaintext data to encrypt
   * @param {string} publicKey - PEM-formatted public key
   * @returns {string} Base64-encoded encrypted data
   */


    encryptWithPublicKey: (data, publicKey) => {
        try {

            
            // 1. Convert the UTF‑8 string into a Buffer of raw bytes,
            // because RSA works on binary data, not JS strings.
            const encrypted = crypto.publicEncrypt(
                {
                    key: publicKey,
                    padding: crypto.constants.RSA_PKCS1_OAEP_PADDING
                    // OAEP ensures that encrypting the same plaintext twice yields different ciphertexts, thanks to its use of random padding. This prevents an attacker from recognizing repeated messages by comparing ciphertexts.
                    //Modern cryptographic standards (e.g. PKCS#1 v2.2, RFC 8017) recommend OAEP for RSA encryption.
                },
                Buffer.from(data)
            );
            // 3. Convert the resulting Buffer (binary ciphertext) into a Base64 string
            //    so it’s safe to transmit over text‑based protocols (HTTP, JSON, etc.).
            return encrypted.toString('base64');
        } catch (error) {
            console.error('Public key encryption failed:', error.message);
            throw error;
        }

    },


    // --- Symmetric Crypto Simulation (Shared Secret / Session Key) ---
    /**
     * Generate a secure symmetric key
     * @param {number} length - Key length in bytes (default: 32 bytes = 256 bits)
     * @returns {string} Hex-encoded key
     */
    generateSymmetricKey: (length = 32) => {
        return crypto.randomBytes(length).toString('hex');
    },


    //When encrypting sensitive data  (e.g., device secrets) before storing in the database

    /**
   * Encrypt data using AES-256-GCM
   * @param {string} text - Plaintext to encrypt
   * @param {string} keyHex - Hex-encoded 256-bit key
   * @returns {string} Format: IV:AUTH_TAG:CIPHERTEXT (all hex)
   */
    encryptSymmetric: (text, key) => {

        if (!(key instanceof Buffer)) {
            throw new TypeError("Key must be a Buffer");
        }
        if (key.length !== 32) {
            throw new RangeError("Key must be 32 bytes for aes-256-gcm");
        }

        try {

            // 2. Make a new random IV so each message is unique
            const iv = crypto.randomBytes(IV_LENGTH);

            // 3. Create the “lock” with our key and IV
            const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

            // 4. Lock up the text (utf8 → hex)
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');

            // 5. Grab the “seal” so we can check tampering later
            const authTag = cipher.getAuthTag();

            // 6. Return everything we need to unlock: iv, seal, and locked box
            //    joined by colons so we can split them back apart on decrypt
            return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
        } catch (error) {
            console.error('Symmetric encryption failed:', error.message);
            throw error;
        }
    },

    /**
     * Decrypt data using AES-256-GCM
     * @param {string} encryptedText - Format: IV:AUTH_TAG:CIPHERTEXT (all hex)
     * @param {string} keyHex - Hex-encoded 256-bit key
     * @returns {string} Decrypted plaintext
     */
    decryptSymmetric: (encryptedText, key) => {

        if (!(key instanceof Buffer)) {
            throw new TypeError("Key must be a Buffer");
        }
        
        if (key.length !== 32) {
            throw new RangeError("Key must be 32 bytes for aes-256-gcm");
        }

        try {
            // 1. Split the three parts: iv, seal, and locked box

            const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');
            if (!ivHex || !authTagHex || !encryptedData) {
                throw new Error('Invalid encrypted format');
            }
            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');

            const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Symmetric decryption failed:', error.message);
            throw error;
        }
    },



    //Before saving and extract sensitive fields like initialSecretEncrypted in the Device model. 
    /**
       * Encrypt data for database storage using master key
       * @param {string} text - Plaintext to encrypt
       * @returns {string} Encrypted data in IV:AUTH_TAG:CIPHERTEXT format
       */
    encryptForDatabase: (text) => {
        return cryptoService.encryptSymmetric(text, SERVER_MASTER_ENCRYPTION_KEY);
    },

    /**
     * Decrypt data from database using master key
     * @param {string} encryptedText - Encrypted data in IV:AUTH_TAG:CIPHERTEXT format
     * @returns {string} Decrypted plaintext
     */
    decryptFromDatabase: (encryptedText) => {
        return cryptoService.decryptSymmetric(encryptedText, SERVER_MASTER_ENCRYPTION_KEY);
    }

}


export default cryptoService;


// We pick AES‑GCM over other modes for three main reasons:

// Built‑in Authentication (AEAD)

// GCM = Galois/Counter Mode, which is an AEAD cipher (Authenticated Encryption with Associated Data).

// It doesn’t just hide your plaintext; it also produces an authentication tag that guarantees the data hasn’t been tampered with.

// In contrast, “raw” modes like CBC or CTR only offer confidentiality. To get integrity you’d have to add a separate HMAC step—more code, more chance for mistakes.

// Performance & Parallelism

// GCM is a counter‑mode under the hood, so it can encrypt blocks in parallel.

// Many CPUs (and even WebCrypto APIs in browsers) include hardware acceleration for GCM, making it very fast, even at high throughputs.

// CBC, by comparison, is inherently sequential (each block depends on the previous ciphertext), so it can’t parallelize encryption or decryption as efficiently.

// Standard & Interoperable

// GCM is widely adopted in modern protocols (TLS, SSH, IPsec, JWT libs, AWS KMS, etc.).

// There’s built‑in support in Node.js, browser JS, mobile platforms, and hardware crypto modules.

// Using GCM means you’ll interoperate out‑of‑the‑box with pretty much any other system or library.