/**
 * Created by timothyfranzke on 11/15/17.
 */
export function isEmpty(obj){

    for(let prop in obj) {
      if(obj.hasOwnProperty(prop))
        return false;
    }

    return (JSON.stringify(obj) === JSON.stringify({}) || obj === undefined || obj === null) ;

}
