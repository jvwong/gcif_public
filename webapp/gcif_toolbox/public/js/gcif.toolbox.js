/*
 * gcif.toolbox.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.toolbox = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<div class="col-sm-9 col-md-10 main">' +
//            '<div class="col-sm-9 col-sm-offset-3 col-md-10 col-md-offset-2 main">' +
                '<h3 class="page-header">Tool: <span id="gcif-toolbox-tool-title"></span></h3>' +

                '<div class="row gcif-toolbox-tools">' +
                    '<a href="#">' +
                        '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool compare">' +
                                '<h4>Compare</h4>' +
                        '</div>' +
                    '</a>' +
                    '<a href="#">' +
                        '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool correlate">' +
                                '<h4>Correlate</h4>' +
                            '</a>' +
                        '</div>' +
                    '</a>' +
                    '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool placeholder1">' +
                        '<a href="#">' +
                            '<h4></h4>' +
                        '</a>' +
                    '</div>' +
                    '<div class="col-xs-6 col-sm-3 gcif-toolbox-tool placeholder2">' +
                        '<a href="#">' +
                            '<h4></h4>' +
                        '</a>' +
                    '</div>' +
                '</div>' +

                '<div class="gcif-toolbox-tool-chart"></div>' +
            '</div>'



    }
    , stateMap = {
        $container : undefined
    }
    , jqueryMap = {}
    , setJqueryMap
    , display
    , tool
    , onClickTool
    , initModule
    ;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container;

        jqueryMap = {
              $container      : $container
            , $toolTitle      : $container.find('#gcif-toolbox-tool-title')
            , $toolSelection  : $container.find('.gcif-toolbox-tool')
            , $toolChart      : $container.find('.gcif-toolbox-tool-chart')
        };
    };
    //--------------------- END DOM METHODS ----------------------



    // private method /display/
    display = function(tool){
        if(tool === "Compare"){
            gcif.compare.initModule( jqueryMap.$toolChart );
            gcif.compare.render();
        }else if( tool === "Correlate"){
            gcif.correlate.initModule( jqueryMap.$toolChart );
            gcif.correlate.render();
        }
    };
    //end /display/


    //------------------- BEGIN EVENT HANDLERS -------------------

    onClickTool = function(e){
        // get the tool clicked
        configMap.tool = $(e.target).html();
        jqueryMap.$toolTitle.html( configMap.tool );
        display(configMap.tool);
    };

    //-------------------- END EVENT HANDLERS --------------------


    //---------------------- BEGIN CALLBACKS ---------------------


    //------------------- BEGIN PUBLIC METHODS -------------------

    // Begin Public method /initModule/
    // Example   : chart.dash.initModule( $('.container') );
    // Purpose   :
    //   Adds a dash board and graphics to the shell element
    // Arguments :
    //   * $container(example: $('.container')).
    //     A jQuery selection representing a single DOM container
    // Action    :
    //   Populates $container with the shell of the UI
    //   and then configures and initializes feature modules.
    // Returns   : none
    // Throws    : none
    initModule = function ( $container ) {


        //store container in stateMap
        stateMap.$container = $container;
        $container.html(configMap.main_html);
        setJqueryMap();

        //register listeners
        jqueryMap.$toolSelection.click(onClickTool);
        $('.gcif-toolbox-tool.compare h4').click();
//        $('.gcif-toolbox-tool.correlate h4').click();

    };
    // End PUBLIC method /initModule/

    return { initModule: initModule };
    //------------------- END PUBLIC METHODS ---------------------
})();

