const activeGatewaySessions = new Map();



const sessionService = {

    /**
 * Store a session key for a gateway.
 * @param {string} gatewayGuid
 * @param {Buffer} sessionKey
 */
    saveSessionKey: (gatewayGuid, sessionKey) => {
        activeGatewaySessions.set(gatewayGuid, sessionKey);
    },


    /**
     * Retrieve a session key for a gateway.
     * @param {string} gatewayGuid
     * @returns {Buffer|undefined}
     */
    getSessionKey: (gatewayGuid) => {
        return activeGatewaySessions.get(gatewayGuid);
    },



    /**
    * Delete a session when it’s over (optional cleanup).
    * @param {string} gatewayGuid
    */
    deleteSessionKey: (gatewayGuid) => {
        activeGatewaySessions.delete(gatewayGuid);
    }

}

export default sessionService;