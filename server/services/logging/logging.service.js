/**
 * Created by timothy.franzke on 6/16/2017.
 */
export function INFO(className, methodName, message){
  console.log("[INFO] - [" + className + "] [" + methodName + "] - Message : " + message);
}

export function ERROR(exception, className, methodName, message){
  console.log("[ERROR] - [" + className + "] [" + methodName + "] - Exception : " + exception + " - Message : " + message );
}

export function Logger(cls, method, logLevel){
  let className = cls;
  let methodName = method;
  let logLevels = ['ERROR', 'WARN', 'INFO', 'DEBUG'];
  let logLevelNumber = logLevels.indexOf(logLevel);
  let date = new Date();

  return {
    DEBUG   : function(message){
      if(logLevelNumber > 2) console.log("[DEBUG] - ["+ date.toISOString() +"] [" + className + "] [" + methodName + "] - " + message);
    },
    INFO    : function(message){
      if(logLevelNumber > 1) console.log("[INFO] - ["+ date.toISOString() +"] [" + className + "] [" + methodName + "] - " + message);
    },
    WARN    : function(message){
      if(logLevelNumber > 0) console.log("[WARN] - ["+ date.toISOString() +"] [" + className + "] [" + methodName + "] - " + message);
    },
    ERROR   : function(err, message){
      console.log("[ERROR] - ["+ date.toISOString() +"] [" + className + "] [" + methodName + "] - [ Exception : " + err + " ] - " + message );
    }
  }
}

