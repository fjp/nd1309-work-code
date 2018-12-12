/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

// Importing the module 'level'
const level = require('level');

// Declaring the folder path that stores the data
const chainDB = './chaindata';

// Declaring LevelSandbox class
// Implements the data interaction for the private blockchain.
// It is the data access layer for the application.
// The data persists in a LevelDB database.
class LevelSandbox {
    // Declaring the class constructor
    // that creates a level object pointing to
    // the path declared above
    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        return new Promise((resolve, reject) => {
            this.db.get(key, (err, value) => {
                if (err) {
                    if (err.type == 'NotFoundError') {
                        console.log("Error in getLevelDBData", err);
                        resolve(undefined);
                    } else {
                        console.log('Block ' + key + ' get failed', err);
                        reject(err);
                    }
                } else {
                    // console.log('Value = ' + value);
                    resolve(value);
                }
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        return new Promise((resolve, reject) => {
            this.db.put(key, value, (err) => {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                }
                resolve(value);
            });
        });
    }

    // Add data to levelDB with value (Promise)
    addDataToLevelDB(value) {
        let i = 0;
        return new Promise((resolve, reject) => {
            this.db.createReadStream()
                .on('data', (data) => {
                    i++;
                })
                .on('error', (err) => {
                    // Reject with error
                    console.log('Unable to read data stream!', err)
                    reject(err);
                })
                .on('close', () => {
                    // Resolve adding data
                    console.log('Block #' + i);
                    resolve(this.addLevelDBData(i, value));
                });
        });
    }



    // Method that return the height
    getBlocksCount() {
        let count = 0;
        return new Promise((resolve, reject) => {
            this.db.createReadStream()
                .on('data', (data) => {
                    // Count each object inserted
                    count++;
                })
                .on('error', (err) => {
                    // Reject with error
                    console.log('Count failed');
                    reject(err);
                })
                .on('close', () => {
                    // Resolve with the count value
                    resolve(count);
                });
        }).catch((err) => {
            console.log("Error in getBlocksCount" + err);
            reject(err);
        });
    }
}

module.exports.LevelSandbox = LevelSandbox;
