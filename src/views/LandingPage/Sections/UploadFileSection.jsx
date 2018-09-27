import React from "react";
import {Form} from "react-bootstrap";
// @material-ui/core components
import withStyles from "@material-ui/core/styles/withStyles";

// @material-ui/icons
// import Chat from "@material-ui/icons/Chat";
// import VerifiedUser from "@material-ui/icons/VerifiedUser";
// import Fingerprint from "@material-ui/icons/Fingerprint";
// core components
import GridContainer from "components/Grid/GridContainer.jsx";
import GridItem from "components/Grid/GridItem.jsx";

//import InfoArea from "components/InfoArea/InfoArea.jsx";

import CustomLinearProgress from "components/CustomLinearProgress/CustomLinearProgress.jsx";
import Button from "components/CustomButtons/Button.jsx";
//import Input from "components/CustomInput/CustomInput.jsx"
import "../css/custom.css"
import "../css/material-kit.css"
import "../css/demo.css"

//fucntionalities
import web3 from '../../../web3.js';
import ipfs from '../../../ipfs.js';
import storehash from '../../../storehash.js';

import productStyle from "assets/jss/material-kit-react/views/landingPageSections/productStyle.jsx";

//progress bar
//import FileUploadProgress from 'react-fileupload-progress';



class UploadFileSection extends React.Component {
    //eth-ipfs
  state = {
    ipfsHash:'hash will be available here after successful file upload',
    ipfsURL:'',
    ipfsURLDisplay: false,
    buffer:'',
    ethAddress:'',
    blockNumber:'',
    transactionHash:'',
    gasUsed:'',
    txReceipt: '',
    percentUploaded: 0  ,
    fileSize: '',
    fileName: 'Select File',
    fileType: '',
    fileExt: ''
  };
 
  captureFile =(event) => {
      event.stopPropagation()
      event.preventDefault()
      const file = event.target.files[0]
      let reader = new window.FileReader()

      //size of file
      this.setState({fileSize: event.target.files[0].size})
      this.setState({fileName: event.target.files[0].name})
      this.setState({fileType: event.target.files[0].type})
      this.setState({fileExt: event.target.files[0].name.split('.').pop()})
      reader.readAsArrayBuffer(file)
      reader.onloadend = () => this.convertToBuffer(reader)

      
    };

  convertToBuffer = async(reader) => {
    //file is converted to a buffer to prepare for uploading to IPFS
      const buffer = await Buffer.from(reader.result);
    //set this buffer -using es6 syntax
      this.setState({buffer});
  };

  onClick = async () => {

  try{
      this.setState({blockNumber:"waiting.."});
      this.setState({gasUsed:"waiting..."});

      // get Transaction Receipt in console on click
      // See: https://web3js.readthedocs.io/en/1.0/web3-eth.html#gettransactionreceipt
      await web3.eth.getTransactionReceipt(this.state.transactionHash, (err, txReceipt)=>{
        console.log(err,txReceipt);
        this.setState({txReceipt});
      }); //await for getTransactionReceipt

      await this.setState({blockNumber: this.state.txReceipt.blockNumber});
      await this.setState({gasUsed: this.state.txReceipt.gasUsed});    
    } //try
  catch(error){
      console.log(error);
    } //catch
} //onClick

  progressBar = (uploadSize) =>{
    console.log(uploadSize);
      this.setState({
        percentUploaded: '' + Math.floor((uploadSize / this.state.fileSize ) * 100)
      });
      
  };

  onSubmit = async (event) => {
    event.preventDefault();

    //bring in user's metamask account address
    const accounts = await web3.eth.getAccounts();
   
    console.log('Sending from Metamask account: ' + accounts[0]);

    //obtain contract address from storehash.js
    const ethAddress= await storehash.options.address;
    this.setState({ethAddress});

    //save document to IPFS,return its hash#, and set hash# to state
    //https://github.com/ipfs/interface-ipfs-core/blob/master/SPEC/FILES.md#add

      ipfs.files.add(this.state.buffer, { progress: this.progressBar }, (err, ipfsHash) => {
      console.log(err,ipfsHash);
      //setState by setting ipfsHash to ipfsHash[0].hash 
      this.setState({ ipfsHash:ipfsHash[0].hash });

      //set ipfsURL and ipfsURLDisplay
      this.setState({ipfsURL: ipfsHash[0].hash});
      this.setState({ipfsURLDisplay: true });

      //
      console.log(this.state.percentUploaded);

      // call Ethereum contract method "sendHash" and .send IPFS hash to etheruem contract 
      //return the transaction hash from the ethereum contract
      //see, this https://web3js.readthedocs.io/en/1.0/web3-eth-contract.html#methods-mymethod-send
      
      storehash.methods.sendHash(this.state.ipfsHash).send({
        from: accounts[0] 
      }, (error, transactionHash) => {
        console.log(transactionHash);
        this.setState({transactionHash});
      }); //storehash 
    }) //await ipfs.add 
  }; //onSubmit


  render() {
    const { classes } = this.props;

    return (
      <div className={classes.section}>
        <GridContainer justify="center">
          <GridItem xs={12} sm={12} md={8}>
            <h2 className={classes.title}>Let's add some files to IPFS! </h2>
          </GridItem>
        </GridContainer>
        <div>
          <GridContainer justify="center">
            <GridItem>

            <Form onSubmit={this.onSubmit}>
              <label  htmlFor="file-upload" className="btn btn-info btn-lg">
              <div style={{ textTransform: 'none' }}>
              {this.state.fileName}
              </div> 
              
              </label>
              <input id="file-upload" type="file" onChange = {this.captureFile} />
            
             <Button 
             style={{ textTransform: 'none' }}
             color={this.state.fileSize ? 'success' : 'default'}
             size="lg"
             type="submit"> 
             Upload to IPFS
             </Button>

             

            </Form>
            </GridItem>

            <GridItem >
            <CustomLinearProgress 
                  variant="determinate"
                  color="primary"
                  value={this.state.percentUploaded}
            />
            </GridItem>
            
            
            <GridItem xs={12} sm={12} md={8}>
            <h3 className={classes.title} > IPFS Hash for the file </h3>
            <h4 className={classes.title} >{this.state.ipfsHash} </h4>
            </GridItem>

            

            <GridItem  xs={12} sm={12} md={8}>
            <div style={{display: this.state.ipfsURLDisplay ? 'block' : 'none' }} >
            <h3 className={classes.title} > Public URL for your file {this.state.ipfsURLDisplay} </h3>
            <h4 className={classes.title} ><a target='_blank' href={`https://ipfs.io/ipfs/${this.state.ipfsURL}`} > https://ipfs.io/ipfs/{this.state.ipfsURL}</a>  </h4>
            </div>
            </GridItem>
            
            
          </GridContainer>
        </div>
        
      </div>
    );
  }
}

export default withStyles(productStyle)(UploadFileSection);
