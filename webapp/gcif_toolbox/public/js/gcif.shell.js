/*
 * gcif.shell.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.shell = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        navigation_html : String() +

            '<div class="navbar navbar-inverse navbar-fixed-top" role="navigation">' +
              '<div class="container-fluid">' +
                '<div class="navbar-header">' +
                  '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +
                    '<span class="sr-only">Toggle navigation</span>' +
                    '<span class="icon-bar"></span>' +
                    '<span class="icon-bar"></span>' +
                    '<span class="icon-bar"></span>' +
                  '</button>' +
                  '<a class="navbar-brand" href="#">Global City Indicators Facility</a>' +
                '</div>' +
                '<div class="navbar-collapse collapse">' +
                  '<ul class="nav navbar-nav navbar-right">' +
                    '<li><a href="#">Dashboard</a></li>' +
                    '<li><a href="#">Settings</a></li>' +
                    '<li><a href="#">Profile</a></li>' +
                    '<li><a href="#">Help</a></li>' +
                  '</ul>' +
                  '<form class="navbar-form navbar-right">' +
                    '<input type="text" class="form-control" placeholder="Search...">' +
                  '</form>' +
                '</div>' +
              '</div>' +
            '</div>',

        sidebar_html : String() +

//            ' <div class="container-fluid">' +
                '<div class="row">' +
//
//                    '<div class="col-sm-3 col-md-2 gcif-shell sidebar">' +
//                        '<ul class="nav nav-sidebar">' +
//                            '<li id="tally"><a href="#">Tally</a></li>' +
//                            '<li id="toolbox"><a href="#">Toolbox</a></li>' +
//                            '<li><a href="#">--</a></li>' +
//                            '<li><a href="#">--</a></li>' +
//                        '</ul>' +
//                    '</div>' +
//
                    '<div id="content"></div>' +
//
                '</div>'
//            '</div>'
    }
    , stateMap = {
        $outerDiv : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
//    , onClickTally, onClickToolbox
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $outerDiv = stateMap.$outerDiv;

        jqueryMap = {
            $outerDiv        : $outerDiv
          , $content         : $outerDiv.find('#content')

//          , $sidebar_tally   : $outerDiv.find('.gcif-shell.sidebar li#tally')
//          , $sidebar_toolbox : $outerDiv.find('.gcif-shell.sidebar li#toolbox')

        };
    };
    //--------------------- END DOM METHODS ----------------------



    //------------------- BEGIN EVENT HANDLERS -------------------
//    onClickTally = function(){
//        gcif.tally.initModule( jqueryMap.$content );
//    };
//
//    onClickToolbox = function(){
//        gcif.toolbox.initModule( jqueryMap.$content );
//    };

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------


    //------------------- BEGIN PUBLIC METHODS -------------------
    // Begin Public method /initModule/
    // Example   : chart.shell.initModule( $('.container') );
    // Purpose   :
    //   Directs the Shell to offer its capability to the user
    // Arguments :
    //   * $container(example: $('.container')).
    //     A jQuery selection representing a single DOM container
    // Action    :
    //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    // Returns   : none
    // Throws    : none
    initModule = function ( $outerDiv ) {

        //store container in stateMap
        stateMap.$outerDiv = $outerDiv;
        $outerDiv.html(configMap.navigation_html);
        $outerDiv.append(configMap.sidebar_html);
        setJqueryMap();

        // event listeners for navbar
//        jqueryMap.$sidebar_tally.on("click", onClickTally);
//        jqueryMap.$sidebar_toolbox.on("click", onClickToolbox);

//        jqueryMap.$sidebar_toolbox.click();
        gcif.toolbox.initModule( jqueryMap.$content );
    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

