// //using the infura.io node, otherwise ipfs requires you to run a daemon on your own computer/server. See IPFS.io docs
// import IPFS from 'ipfs-api';
// import 'ipfs-api/dist';

// const ipfs = new IPFS({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' });

// //run with local daemon
// // const ipfsApi = require('ipfs-api');
// // const ipfs = new ipfsApi('localhost', '5001', {protocol: 'http'});

// export default ipfs; 

const IPFS = require("ipfs");
const ipfs = new IPFS();


ipfs.on("ready", () => {
    console.log("Node is now ready");
  });

  export default ipfs; 