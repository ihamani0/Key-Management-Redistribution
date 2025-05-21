
import Gateway from "./src/Gateway.js"


// Start the gateway
const gateway = new Gateway();
gateway.start().catch(console.error);