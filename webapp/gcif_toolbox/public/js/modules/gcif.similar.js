/*
 * gcif.similar.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.similar = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
        configMap = {

            main_html : String() +

                '<h3 class="sub-header"></h3>' +

                '<div class="row">' +

                    '<ul id="myTab" class="nav nav-tabs">' +
                        '<li class="active"><a href="#gcif-similar-graphical" data-toggle="tab">Graphical</a></li>' +
                        '<li class=""><a href="#gcif-similar-tabular" data-toggle="tab">Tablular</a></li>' +
                    '</ul>' +
                    '<div id="myTabContent" class="tab-content">' +
                        '<div class="tab-pane fade active in" id="gcif-similar-graphical">' +
//                            '<form class="form" role="form">' +
//                                '<div class="form-group gcif-similar graphical menu">' +
//                                    '<label for="theme-dropdown" class="col-sm-1 control-label">Theme</label>' +
//                                    '<div class="col-sm-11">' +
//                                        '<select id="theme-dropdown" class="form-control"></select>' +
//                                    '</div>' +
//                                '</div>' +
//                            '</form>' +
                            '<div class="gcif-similar chart col-lg-12"></div>' +
                        '</div>' +

                        '<div class="tab-pane fade" id="gcif-similar-tabular">' +
                            '<div class="gcif-similar table col-lg-12"></div>' +
                        '</div>' +
                    '</div>' +

                '</div>'
        }
        , stateMap = {
            $container                  : undefined

            , cities                    : undefined
            , indicators                : undefined
            , theme                     : undefined

            , color                     : undefined

            , member_cities_db          : TAFFY()
            , performance_indicators_db : TAFFY()
            , abundant_themes_db        : TAFFY()
            , top50Cities               : ["AMMAN","TORONTO","BOGOTA","RICHMOND HILL","GREATER BRISBANE",
                "BELO HORIZONTE","BUENOS AIRES","GOIANIA","PEORIA","SAANICH","SANTA ANA",
                "DALLAS","LVIV","SASKATOON","TUGUEGARAO","CALI","HAMILTON","ILE-DE-FRANCE",
                "HAIPHONG","LISBON","MILAN","OLONGAPO","CANCUN","DURBAN","MOMBASA","TRUJILLO",
                "OSHAWA","SAO BERNARDO DO CAMPO","SURREY","KRYVYI RIH","PUERTO PRINCESA",
                "MAKATI","PORT OF SPAIN","KABANKALAN","MUNOZ","RIGA","SAO PAULO","TACURONG",
                "ZAMBOANGA","BALANGA","BEIT SAHOUR","ISTANBUL","CLARINGTON","MEDICINE HAT",
                "VAUGHAN","LAOAG","GUELPH","KING COUNTY","SANA'A","BOGOR"]
//          , top50Cities               : ["AMMAN","TORONTO","BOGOTA"]
            , top5Themes                : ["education","finance","health","safety","urban planning"]
        }

        , jqueryMap = {}, d3Map= {}
        , setJqueryMap, setd3Map

        , dispatch = d3.dispatch("brush", "data_update", "load_cities", "load_indicators", "load_themes", "done_load")

        , loadData, loadListeners, initCharts, resetState, render, redraw

        , chord
        , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------
    setJqueryMap = function(){
        var
            $container = stateMap.$container;

        jqueryMap = {
              $container       : $container
        };
    };

    setd3Map = function(){
        d3Map = {
              d3similar           : d3.select(".gcif-similar.chart")
            , d3table             : d3.select(".gcif-similar.table")
        };
    };

    initCharts = function(){
        stateMap.color = d3.scale.ordinal()
            .domain(stateMap.abundant_themes_db().distinct("theme"))
            .range(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd"]);

        chord = gcif.chord.Chord( d3Map.d3similar );

//        var matrix = [
//            [11975,  5871, 8916, 2868],
//            [ 1951, 10048, 2060, 6171],
//            [ 8010, 16145, 8090, 8045],
//            [ 1013,   990,  940, 6907]
//        ];
        var matrix = [
            [11975,  5871, 8916, 2868],
            [ 5781, 10048, 2060, 6171],
            [ 8916,  2060, 8090, 8045],
            [ 2868,  6171, 8045, 6907]
        ];
        chord.data(matrix);
        chord.render();

        console.log(d3Map.d3similar.select("g.body"));
    };

    resetState = function (){
        stateMap.theme      = undefined;
        stateMap.indicators = undefined;
        stateMap.cities     = undefined;
        stateMap.member_cities_db = TAFFY();
        stateMap.performance_indicators_db = TAFFY();
        stateMap.abundant_themes_db = TAFFY();
    };

    loadData = function(){
//        d3.json("/performance_indicators/list", function(performance_indicators_data) {
//            dispatch.load_indicators(performance_indicators_data);
//            d3.json("assets/data/abundant_themes.json", function(abundant_themes) {
//                dispatch.load_themes(abundant_themes);
//                d3.json("/member_cities/list", function(member_cities_data) {
//                    dispatch.load_cities(member_cities_data);
//                    dispatch.done_load();
//                });
//            });
//        });
        d3.json("assets/data/performance_indicators.json", function(performance_indicators_data) {
            dispatch.load_indicators(performance_indicators_data);
            d3.json("assets/data/abundant_themes.json", function(abundant_themes) {
                dispatch.load_themes(abundant_themes);
                d3.json("assets/data/member_cities.json", function(member_cities_data) {
                    dispatch.load_cities(member_cities_data);
                    dispatch.done_load();
                });
            });
        });
    };

    loadListeners = function(){
        //--------------------- BEGIN EVENT LISTENERS ----------------------

        dispatch.on("data_update", function(){
            redraw(true);
        });

        dispatch.on("load_cities", function(data){
            stateMap.member_cities_db.insert(data);
            stateMap.cities = stateMap.member_cities_db(function(){
                return stateMap.top50Cities.indexOf(this["CityName"]) >= 0;
            }).get();
//            console.log("success: load_cities");
//            console.log(stateMap.cities.length);
        });

        dispatch.on("load_indicators", function(data){
            stateMap.performance_indicators_db.insert(data);
            stateMap.indicators = stateMap.performance_indicators_db(function(){
                return stateMap.top5Themes.indexOf(this["theme"]) >= 0;
            }).get();
//            console.log("success: load_indicators");
//            console.log(stateMap.indicators.length);
        });

        dispatch.on("load_themes", function(data){
            stateMap.abundant_themes_db.insert(data);
//            console.log("success: load_themes");
//            console.log(stateMap.abundant_themes_db().distinct("theme"));
        });



        // window resizing
        d3.select(window).on('resize', redraw );

        //--------------------- END EVENT LISTENERS ----------------------

    };

    redraw = function(){
        d3.transition()
            .duration(500)
            .each(renderAll);

        function renderAll(){
            chord.render();
        }

    };

    // BEGIN public method /render/
    // Example   : gcif.compare.render();
    // Purpose   :
    //   Adds the graphical and tabular elements to the page
    // Arguments : none
    // Action    :
    //   Loads data, populates d3compare and d3table elements, and
    //   triggers listeners
    // Returns   : none
    // Throws    : none
    render = function(){
        loadListeners();
        loadData();

        dispatch.on("done_load", function(){
            initCharts();
            redraw();
        });

    };
    // END private method /render/

    //--------------------- END DOM METHODS ----------------------

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
        resetState();
        //store container in stateMap
        stateMap.$container = $container;
        $container.html( configMap.main_html );
        setJqueryMap();
        setd3Map();
    };
    // End PUBLIC method /initModule/

    return { initModule   : initModule
        , render       : render
    };
    //------------------- END PUBLIC METHODS ---------------------
})();

