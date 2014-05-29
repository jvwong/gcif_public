/*
* app.js - Express server with routing
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
  http    = require( 'http'         )
, express = require( 'express'      )
, routes  = require( './lib/routes' )

, app     = express()
, server  = http.createServer( app )

, port_default = 9090
;
//// ------------- END MODULE SCOPE VARIABLES ---------------


//// ------------- BEGIN SERVER CONFIGURATION ---------------
app.configure( function () {

  // set PORT from process.argv
  process.argv.forEach(function(val, index, array) {
      var arg = val.split('=');

      if (arg[0] == '--PORT') {
          port_default = arg[1];
      }
  });

  app.use( express.static( __dirname + '/public' ) );
  app.use( app.router );

});

app.configure( 'development', function () {
  app.use( express.logger() );
  app.use( express.errorHandler({
    dumpExceptions : true,
    showStack      : true
  }) );
});

app.configure( 'production', function () {
  app.use( express.errorHandler() );
});

routes.configRoutes( app );
//// -------------- END SERVER CONFIGURATION ----------------

//// ----------------- BEGIN START SERVER -------------------
server.listen( port_default );
console.log(
  'Express server listening on port %d in %s mode',
   server.address().port, app.settings.env
);
//// ------------------ END START SERVER --------------------

app.listen(3000);