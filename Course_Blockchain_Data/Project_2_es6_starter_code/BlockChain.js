/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

// Implements the SHA256 hashing function which is required to create hash values for blocks
const SHA256 = require('crypto-js/sha256');
// Import the functionality of the persisten data storage using LevelDB
const LevelSandbox = require('./LevelSandbox.js');
// Class that specifies a block that gets stored in the blockchain
const Block = require('./Block.js');

// Blockchain class create a persistent blockchain using LevelDB.
class Blockchain {

    constructor() {
        // Member to the LevelDB sandbox
        this.db = new LevelSandbox.LevelSandbox();
        // Creates the genesis block of the blockchain when it is created
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        this.getBlockHeight().then((height) => {
            if (height == 0) {
                let genesisBlock = new Block.Block("First block in the chain - Genesis Block");
                this.addBlock(genesisBlock);
            }
        }).catch((err) => {
            console.log("Error in generateGenesisBlock", err);
        });
    }

    // Get block height, it is auxiliar method that returns the height of the blockchain
    getBlockHeight() {
        return new Promise((resolve, reject) => {
            this.db.getBlocksCount().then((height) => {
                resolve(height);
            }).catch((err) => {
                console.log("Error in getBlockHeight", err);
                reject(err);
            });
        }).catch((err) => {
            console.log("Error in getBlockHeight", err);
            reject(err);
        });
    }

    // Add new block
    addBlock(newBlock) {
        return new Promise((resolve, reject) => {
            // Block height from levelDB
            this.getBlockHeight().then((height) => {
                newBlock.height = height;
                // UTC timestamp
                newBlock.timeStamp = new Date().getTime().toString().slice(0,-3);
                if (newBlock.height > 0) {
                    // previous block hash
                    this.getBlock(newBlock.height - 1).then((previousBlock) => {
                        newBlock.previousBlockHash = previousBlock.hash;
                        // SHA256 requires a string of data
                        newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                        // add block to chain
                        resolve(this.db.addDataToLevelDB(JSON.stringify(newBlock).toString()));
                    }).catch((err) => {
                        console.log("Error in addBlock in getLevelDBData", err);
                        reject(err);
                    });
                } else {
                    newBlock.hash = SHA256(JSON.stringify(newBlock)).toString();
                    resolve(this.db.addDataToLevelDB(JSON.stringify(newBlock).toString()));
                }
            }).catch((err) => {
                console.log("Error in addBlock in getBlockHeight", err);
                reject(err);
            });
        }).catch((err) => {
            console.log("Error in addBlock in Promise", err);
        });
    }

    // Get Block By Height
    getBlock(height) {
        return new Promise((resolve, reject) => {
            this.db.getLevelDBData(height).then((block) => {
                block = JSON.parse(block);
                resolve(block);
            }).catch((err) => {
                console.log("Error in getBlock in Promise", err);
                reject(err);
            });
        }).catch((err) => {
            console.log("Error in getBlock", err);
        });
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        return new Promise((resolve, reject) => {
            this.getBlock(height).then((block) => {
                let blockHash = block.hash;
                block.hash = "";
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                if (blockHash === validBlockHash) {
                    if (height > 0) {
                        // Get previous block hash to check with the value stored inside this block
                        this.getBlock(height - 1).then((previousBlock) => {
                            if (previousBlock.hash === block.previousBlockHash) {
                                resolve(true);
                            } else {
                                resolve(false);
                            }
                        }).catch((err) => {
                            console.log("Error in validateBlock in getBlock(-1)", err);
                            reject(err);
                        });
                    } else {
                        // Genesis block
                        resolve(true);
                    }
                } else {
                    resolve(false);
                }
            }).catch((err) => {
                console.log(err);
                reject(err);
            });
        }).catch((err) => {
            console.log("Error in validateBlock", err);
        });
    }

    // Validate Blockchain
    validateChain() {
        return new Promise((resolve, reject) => {
            var promises = [];
            this.getBlockHeight().then((height) => {
                for (let i = 0; i < height - 1; i++) {
                    // validate block
                    promises.push(this.validateBlock(i));
                }
                Promise.all(promises).then((values) => {
                    if (values.every((value) => value === true)) {
                        resolve(true);
                    } else {
                        resolve(values);
                    }
                }).catch((err) => {
                    console.log("Error in validateChain in Promise.all", err);
                    reject(err);
                });
            });
        });
    }

    // Utility Method to Tamper a Block for Test Validation
    // This method is for testing purpose
    _modifyBlock(height, block) {
        let self = this;
        return new Promise( (resolve, reject) => {
            self.db.addLevelDBData(height, JSON.stringify(block).toString()).then((blockModified) => {
                resolve(blockModified);
            }).catch((err) => { console.log(err); reject(err)});
        });
    }

}

module.exports.Blockchain = Blockchain;
