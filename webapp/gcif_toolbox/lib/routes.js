/*
 * routes.js - module to provide routing
 */

/*jslint         node    : true, continue : true,
 devel  : true, indent  : 2,    maxerr   : 50,
 newcap : true, nomen   : true, plusplus : true,
 regexp : true, sloppy  : true, vars     : false,
 white  : true
 */
/* global, chart */

// ------------ BEGIN MODULE SCOPE VARIABLES --------------
'use strict';
var
//    mongodb     = require( 'mongodb' )
//
//    , mongoServer = new mongodb.Server(
//        'localhost'
//        , mongodb.Connection.DEFAULT_PORT
//    )
//
//    , dbHandle    = new mongodb.Db(
//    'gcif', mongoServer, { safe : true }
//    )

    configRoutes
    , crud        = require( './crud' )
    ;

//    dbHandle.open( function () {
//      console.log( '** Connected to MongoDB **' );
//    });
// ------------- END MODULE SCOPE VARIABLES ---------------


// ---------------- BEGIN PUBLIC METHODS ------------------
configRoutes = function ( app ) {

    app.get( '/', function ( request, response ) {
      response.render( 'index.html' );
    });

    app.all( '/:obj_type/*?', function ( request, response, next ) {
        response.contentType( 'json' );
        next();
    });

    app.get( '/:obj_type/list', function ( request, response ) {
        crud.read(
            request.params.obj_type,
            {}, {},
            function ( error, map_list ) { response.send( map_list ); }
        );
    });

//  app.post( '/:obj_type/create', function ( request, response ) {
//    crud.construct(
//      request.params.obj_type,
//      request.body,
//      function ( result_map ) { response.send( result_map ); }
//    );
//  });
//
//  app.get( '/:obj_type/read/:id', function ( request, response ) {
//    crud.read(
//      request.params.obj_type,
//      { _id: makeMongoId( request.params.id ) },
//      {},
//      function ( inner_error, map_list ) { response.send( map_list ); }
//    );
//  });
//
//  app.post( '/:obj_type/update/:id', function ( request, response ) {
//    crud.update(
//      request.params.obj_type,
//      { _id: makeMongoId( request.params.id ) },
//      request.body,
//      function ( result_map ) { response.send( result_map ); }
//    );
//  });
//
//  app.get( '/:obj_type/delete/:id', function ( request, response ) {
//    crud.destroy(
//      request.params.obj_type,
//      { _id: makeMongoId( request.params.id ) },
//      function ( result_map ) { response.send( result_map ); }
//    );
//  });
//
};

module.exports = { configRoutes : configRoutes };
// ----------------- END PUBLIC METHODS -------------------
