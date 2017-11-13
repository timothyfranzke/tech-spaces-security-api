module.exports = {
  'secret': 'ilovescotchyscotch',
  'database': 'mongodb://tech-app:Password1@ds143141.mlab.com:43141/techauthentication',
  'secrets' : [
    {'id':'593e0abbf36d2806fcd56c8b','secret':'tasmanianDevil'},
    {'id':'596542b4f36d2836aab1a45d','secret':'bugsBunny'},
    {'id':'59e0c23a734d1d1c37fbb760','secret':'itshardtostopatrain'},
    {'id':'59e178a8734d1d1c37fc3c52','secret':'peterpan'}
  ],
  'userRoles' : {
    'FACULTY':'faculty',
    'STUDENT':'user',
    'PARENT':'parent',
    'ADMIN':'admin'
  },
  'exceptions':{
    'GENERAL_EXCEPTION' : function(exception){return "Received exception : " + JSON.stringify(exception)},
    'COLLECTION_FAILED' : function(collectionName){return "Collection : " + collectionName + ", Status : failed"},
    'COLLECTION_RETURNED_NULL' : function(collectionName) {return "Collection : " + collectionName + ", Status : failed,  Result : null or undefined"}
  },
  'information':{
    'COLLECTION_INSERT' : function(collectionName, insertData) { return "Collection : " + collectionName + ", InsertData : " + JSON.stringify(insertData)},
    'COLLECTION_QUERY': function(collectionName, query) { return "Collection : " + collectionName + ", Query : " + JSON.stringify(query)},
    'COLLECTION_UPDATE': function(collectionName, id, updateData) { return "Collection : " + collectionName + " id : " + id + ", UpdateData : " + JSON.stringify(updateData)},
    'COLLECTION_SUCCEEDED_WITH_RESULT': function(collectionName, result){return "Collection :" + collectionName + ", Status : succeeded,  Result : " + JSON.stringify(result)}
  },
  'log_level':'DEBUG'
  //'database'   : 'mongodb://localhost/techauthentication'
};
