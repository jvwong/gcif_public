/*
 * crud.js - module to provide CRUD db capabilities
*/

/*jslint         node    : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
    readObj, checkType

    , mongodb     = require( 'mongodb' )
    , fsHandle    = require( 'fs'      )
    , JSV         = require( 'JSV'     ).JSV

    , mongoServer = new mongodb.Server(
        'localhost',
        mongodb.Connection.DEFAULT_PORT
    )
    , dbHandle    = new mongodb.Db(
        'gcif', mongoServer, { safe : true }
    )
    , validator   = JSV.createEnvironment()
    , objTypeMap  = { 'performance_indicators' : {}
                    , 'profile_indicators' : {}
                    , 'member_cities': {}
                    , 'nonmember_cities': {}
                    , 'us_cities': {}
                    , 'chinese_cities': {}
                    , 'gcif_combined': {}
                    , 'combined_confused': {}
    };
// ------------- END MODULE SCOPE VARIABLES ---------------

// ---------------- BEGIN UTILITY METHODS -----------------
//loadSchema = function ( schema_name, schema_path ) {
//  fsHandle.readFile( schema_path, 'utf8', function ( err, data ) {
//    objTypeMap[ schema_name ] = JSON.parse( data );
//  });
//};
//
//checkSchema = function ( obj_type, obj_map, callback ) {
//  var
//    schema_map = objTypeMap[ obj_type ],
//    report_map = validator.validate( obj_map, schema_map );
//
//  callback( report_map.errors );
//};

// ----------------- END UTILITY METHODS ------------------

// ---------------- BEGIN PUBLIC METHODS ------------------
checkType = function ( obj_type ) {
  if ( ! objTypeMap[ obj_type ] ) {
    return ({ error_msg : 'Object type "' + obj_type
      + '" is not supported.'
    });
  }
  return null;
};


readObj = function ( obj_type, find_map, fields_map, callback ) {
    var type_check_map = checkType( obj_type );

    if ( type_check_map ) {
        callback( null, type_check_map );
        return;
    }

    dbHandle.collection(
    obj_type,
    function ( outer_error, collection ) {
        collection.find( find_map, fields_map ).toArray(
            function ( inner_error, map_list ) {
                callback( inner_error, map_list );
            }
        );
    }
    );
};

//constructObj = function ( obj_type, obj_map, callback ) {
//  var type_check_map = checkType( obj_type );
//  if ( type_check_map ) {
//    callback( type_check_map );
//    return;
//  }
//
//  checkSchema(
//    obj_type, obj_map,
//    function ( error_list ) {
//      if ( error_list.length === 0 ) {
//        dbHandle.collection(
//          obj_type,
//          function ( outer_error, collection ) {
//            var options_map = { safe: true };
//
//            collection.insert(
//              obj_map,
//              options_map,
//              function ( inner_error, result_map ) {
//                callback( result_map );
//              }
//            );
//          }
//        );
//      }
//      else {
//        callback({
//          error_msg  : 'Input document not valid',
//          error_list : error_list
//        });
//      }
//    }
//  );
//};


//updateObj = function ( obj_type, find_map, set_map, callback ) {
//  var type_check_map = checkType( obj_type );
//  if ( type_check_map ) {
//    callback( type_check_map );
//    return;
//  }
//
//  checkSchema(
//    obj_type, set_map,
//    function ( error_list ) {
//      if ( error_list.length === 0 ) {
//        dbHandle.collection(
//          obj_type,
//          function ( outer_error, collection ) {
//            collection.update(
//              find_map,
//              { $set : set_map },
//              { safe : true, multi : true, upsert : false },
//              function ( inner_error, update_count ) {
//                callback({ update_count : update_count });
//              }
//            );
//          }
//        );
//      }
//      else {
//        callback({
//          error_msg  : 'Input document not valid',
//          error_list : error_list
//        });
//      }
//    }
//  );
//};
//
//destroyObj = function ( obj_type, find_map, callback ) {
//  var type_check_map = checkType( obj_type );
//  if ( type_check_map ) {
//    callback( type_check_map );
//    return;
//  }
//
//  dbHandle.collection(
//    obj_type,
//    function ( outer_error, collection ) {
//      var options_map = { safe: true, single: true };
//
//      collection.remove( find_map, options_map,
//        function ( inner_error, delete_count ) {
//          callback({ delete_count: delete_count });
//        }
//      );
//    }
//  );
//};

module.exports = {
  read        : readObj
};
// ----------------- END PUBLIC METHODS -----------------

// ------------- BEGIN MODULE INITIALIZATION --------------
dbHandle.open( function () { console.log( '** Connected to MongoDB **' ); });

// load schemas into memory (objTypeMap)
//(function () {
//  var schema_name, schema_path;
//  for ( schema_name in objTypeMap ) {
//    if ( objTypeMap.hasOwnProperty( schema_name ) ) {
//      schema_path = __dirname + '/' + schema_name + '.json';
//      loadSchema( schema_name, schema_path );
//    }
//  }
//}());
// -------------- END MODULE INITIALIZATION ---------------
