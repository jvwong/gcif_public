/*
 * gcif.js
 * Root namespace module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, gcif:true */

gcif = (function () {
    'use strict';
    var initModule;

    initModule = function ( $outerDiv ) {


        if ( gcif.shell && $outerDiv ){
            gcif.shell.initModule( $outerDiv );
        }
    };

    return { initModule: initModule };
}());

/* NODE-JASMINE testing only */
//exports.gcif = gcif;

