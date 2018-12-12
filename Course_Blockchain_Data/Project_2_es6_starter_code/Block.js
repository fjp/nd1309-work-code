/* ===== Block Class ==============================
|  Class with a constructor for block 			   |
|  ===============================================*/

class Block {
	constructor(data){
		// The hash of the block using its data
        this.hash = "";
        // Block height in the blockchain (hight = 0 is the genesis block)
        this.height = 0;
        // Contains the block data which is stored while constructing a new block
        this.body = data;
        // UTC time stamp of the block when it was created
        this.timeStamp = new Date().getTime().toString().slice(0,-3);
        // Pointer to the previous block in the chain with its hash value
        this.previousBlockHash = "";
	}
}

module.exports.Block = Block;
