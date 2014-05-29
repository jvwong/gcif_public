/*
 * gcif.model.js
 * Model module
*/

/*jslint         browser : true, continue : true,
  devel  : true, indent  : 2,    maxerr   : 50,
  newcap : true, nomen   : true, plusplus : true,
  regexp : true, sloppy  : true, vars     : false,
  white  : true
*/
/*global TAFFY, $, d3, gcif */

gcif.model = (function () {
    'use strict';
    var
    stateMap  = {
//        city_db      : TAFFY()
        city_db      : undefined
    }
    , city
    , initModule
    ;

    city = (function () {
        var get_db;
        get_db = function () { return stateMap.city_db; };

        return {
            get_db     : get_db
        };


    }());

    initModule = function () {};

    return {
        initModule : initModule,
        city       : city
    };
}());
