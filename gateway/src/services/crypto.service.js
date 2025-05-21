import {
    generateKeyPairSync,
    createSign,
    privateDecrypt,
    constants,
    randomBytes,
    createCipheriv,
    createDecipheriv
} from "crypto";
import dotenv from "dotenv";

dotenv.config();

const cryptoService = {

    generateKeysPairGateway: () => {

        return generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'spki', //SPKI stands for Subject Public Key Info. It's a standard format for encoding public keys in a way that allows software to read and use them.
                format: 'pem' //It’s Base64 encoded data wrapped in -----BEGIN PUBLIC KEY----- and -----END PUBLIC KEY----- lines
            },
            privateKeyEncoding: {
                type: 'pkcs8', // is a standard format for encoding private keys. This format can be used to store private keys securely and is widely recognized in cryptography tools.
                format: 'pem', ////It’s Base64 encoded data wrapped in -----BEGIN Private KEY----- 
                cipher: 'aes-256-cbc',
                passphrase: process.env.KEY_ENCRYPTION_PASS || 'fallback-passphrase' // Use env var in production!

                //AES (Advanced Encryption Standard) is a widely used encryption algorithm.
                //256 means it's using a 256-bit key size, which is very strong encryption.
                //CBC (Cipher Block Chaining) is a mode of operation that helps secure the encryption by chaining the blocks together, making it harder to decrypt.
            }
        })
    },

    signPayload: (payload, privateKey, passphrase) => {
        // Simulate signing (should only happen on gateway ideally)
        console.warn("CRYPTO: Signing payload");

        // Sign the challenge
        const signer = createSign('sha256');

        //update sign 
        signer.update(payload, 'utf8');

        const signature = signer.sign(
            {
                key: privateKey,
                passphrase: passphrase
            }, 'hex');


        return signature;
    },



    decryptWithPrivateKey: (encryptedData, privateKey, passphrase) => {

        console.warn(`CRYPTO: Decrypting with private key `);

        const dataBuffer = Buffer.from(encryptedData, 'base64');

        try {
            const decryptedBuffer = privateDecrypt({
                key: privateKey,
                passphrase: passphrase,
                padding: constants.RSA_PKCS1_OAEP_PADDING
            },
                dataBuffer
            )


            return decryptedBuffer.toString();
        } catch (error) {
            console.error('Decryption Failed: -- ', error.message);
            return 'DECRYPTION_FAILED';
        }


    },

    //When encrypting sensitive data  (e.g., device secrets) before storing in the database

    /**
   * Encrypt data using AES-256-GCM
   * @param {string} text - Plaintext to encrypt
   * @param {string} keyHex - Hex-encoded 256-bit key
   * @returns {string} Format: IV:AUTH_TAG:CIPHERTEXT (all hex)
   */
    encryptSymmetric: (text, keyHex) => {

        const key = Buffer.from(keyHex, 'hex')

        if (!(key instanceof Buffer)) {
            throw new TypeError("Key must be a Buffer");
        }
        if (key.length !== 32) {
            throw new RangeError("Key must be 32 bytes for aes-256-gcm");
        }

        try {

            // 2. Make a new random IV so each message is unique
            const iv = randomBytes(IV_LENGTH = 12);

            // 3. Create the “lock” with our key and IV
            const cipher = createCipheriv('aes-256-gcm', key, iv);

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
    decryptSymmetric: (encryptedText, keyHex) => {

        const key = Buffer.from(keyHex, 'hex')

        console.log("Decrpted: Key Buffer", key)

        if (!(key instanceof Buffer)) {
            throw new TypeError("Key must be a Buffer");
        }

        if (key.length !== 32) {
            throw new RangeError("Key must be 32 bytes for aes-256-gcm");
        }

        try {
            // 1. Split the three parts: iv, seal, and locked box

            const [ivHex, authTagHex, encryptedData] = encryptedText.split(':');

            if (ivHex.length !== 24) { // 12 bytes → 24 hex chars
                throw new Error('Invalid IV length');
            }
            if (authTagHex.length !== 32) { // 16 bytes → 32 hex chars
                throw new Error('Invalid auth tag length');
            }
            console.log('IV:', ivHex, 'Auth Tag:', authTagHex); // Debug logs

            if (!ivHex || !authTagHex || !encryptedData) {
                throw new Error('Invalid encrypted format');
            }






            const iv = Buffer.from(ivHex, 'hex');
            const authTag = Buffer.from(authTagHex, 'hex');

            const decipher = createDecipheriv('aes-256-gcm', key, iv);
            decipher.setAuthTag(authTag);

            let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (error) {
            console.error('Symmetric decryption failed:', error.message);
            throw error;
        }
    },

}

//Private keys need to be encrypted to keep them safe. The encryption ensures that even if someone steals the private key file, they won’t be able to use it without knowing the passphrase.



export default cryptoService;