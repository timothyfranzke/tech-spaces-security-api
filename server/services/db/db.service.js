let MongoClient = require( 'mongodb' ).MongoClient;
let _db;

let localConnection = 'mongodb://localhost/fuse-spaces';
let prodConnection = 'mongodb://spaces-app:TimDaveAndSteve@ds145370.mlab.com:45370/spaces';

let connection = prodConnection;

module.exports = {
  connectToServer: function( callback ) {
    MongoClient.connect(connection, function( err, db ) {
      _db = db;
      return callback( err );
    } );
  },
  getDb: function() {
    console.log(connection);
    return _db;
  }
};
