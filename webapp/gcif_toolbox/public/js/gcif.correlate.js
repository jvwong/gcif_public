/*
 * gcif.correlate.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.correlate = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
          configMap = {

            main_html : String() +

                '<h3 class="sub-header"></h3>' +

                '<div class="row">' +

                    '<ul id="myTab" class="nav nav-tabs">' +
                        '<li class="active"><a href="#gcif-correlate-graphical" data-toggle="tab">Graphical</a></li>' +
                        '<li class=""><a href="#gcif-correlate-tabular" data-toggle="tab">Tablular</a></li>' +
                    '</ul>' +
                    '<div id="myTabContent" class="tab-content">' +
                        '<div class="tab-pane fade active in" id="gcif-correlate-graphical">' +
                            '<form class="form" role="form">' +
                                '<div class="form-group gcif-correlate graphical menu">' +
                                    '<label for="xVal-dropdown" class="col-sm-1 control-label">X Axis</label>' +
                                    '<div class="col-sm-11">' +
                                        '<select id="xVal-dropdown" class="form-control"></select>' +
                                    '</div>' +
                                    '<label for="yVal-dropdown" class="col-sm-1 control-label">Y Axis</label>' +
                                    '<div class="col-sm-11">' +
                                        '<select id="yVal-dropdown" class="form-control"></select>' +
                                    '</div>' +
                                    '<label for="highlight-dropdown" class="col-sm-1 control-label">Highlight </label>' +
                                    '<div class="col-sm-11">' +
                                        '<select id="highlight-dropdown" class="form-control"></select>' +
                                    '</div>' +
                                    '<label for="area-dropdown" class="col-sm-1 control-label">Area </label>' +
                                    '<div class="col-sm-11">' +
                                        '<select id="area-dropdown" class="form-control"></select>' +
                                    '</div>' +
                                '</div>' +
                            '</form>' +
                            '<div class="gcif-correlate legend col-xs-12 col-md-12 col-lg-12"></div>' +
                            '<div class="gcif-correlate chart col-lg-6"></div>' +
                        '</div>' +
                        '<div class="tab-pane fade" id="gcif-correlate-tabular">' +
                            '<div class="gcif-correlate table col-lg-12"></div>' +
                        '</div>' +
                    '</div>' +

                '</div>'
        }
        , stateMap = {
              $container                : undefined

            , cities                    : undefined
            , indicators                : undefined

            , color                     : undefined

            , cities_db                 : TAFFY()
            , performance_indicators_db : TAFFY()
            , topThemes                 : ["education","finance","health","safety","urban planning"]

            , xValue                    : undefined
            , yValue                    : undefined
            , title                     : "Correlate"

            , highlight_selected        : undefined
            , area_selected             : undefined

        }

        , jqueryMap = {}, d3Map= {}
        , setJqueryMap, setd3Map

        , dispatch = d3.dispatch("data_update", "load_cities", "load_indicators", "done_load",
                                 "highlight", "legend_change", "data_change", "area_change")

        , loadData, loadListeners, initCharts, resetState, render, redraw

        , scatter
        , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------
    setJqueryMap = function(){
        var
            $container = stateMap.$container;

        jqueryMap = {
              $container           : $container
            , $xVal_dropdown       : $container.find(".form-group.gcif-correlate.graphical.menu select#xVal-dropdown")
            , $yVal_dropdown       : $container.find(".form-group.gcif-correlate.graphical.menu select#yVal-dropdown")
            , $highlight_dropdown  : $container.find(".form-group.gcif-correlate.graphical.menu select#highlight-dropdown")
            , $area_dropdown     : $container.find(".form-group.gcif-correlate.graphical.menu select#area-dropdown")
        };
    };

    setd3Map = function(){
        d3Map = {
              d3correlate           : d3.select(".gcif-correlate.chart")

            , d3xVal_dropdown       : d3.select(".form-group.gcif-correlate.graphical.menu select#xVal-dropdown")
            , d3yVal_dropdown       : d3.select(".form-group.gcif-correlate.graphical.menu select#yVal-dropdown")
            , d3highlight_dropdown  : d3.select(".form-group.gcif-correlate.graphical.menu select#highlight-dropdown")
            , d3area_dropdown     : d3.select(".form-group.gcif-correlate.graphical.menu select#area-dropdown")

            , d3legend              : d3.select(".gcif-correlate.legend")
        };
    };

    initCharts = function(){
        scatter = gcif.scatter.Scatter( d3Map.d3correlate );
        scatter.dispatch( dispatch );

        scatter.areaKey( stateMap.area_selected );
        scatter.xValue( stateMap.xValue );
        scatter.yValue( stateMap.yValue );
        scatter.title( stateMap.title );
        scatter.data( stateMap.cities );
        scatter.render();

    };

    resetState = function (){
        stateMap.indicators = undefined;
        stateMap.cities     = undefined;
        stateMap.cities_db  = TAFFY();
        stateMap.performance_indicators_db = TAFFY();
    };

    loadData = function(){

        d3.json("/performance_indicators/list", function(performance_indicators_data) {
            dispatch.load_indicators(performance_indicators_data);
        });

        d3.json("/combined_confused/list", function(cities_data){
            dispatch.load_cities(cities_data);
            dispatch.done_load();
        });
    };

    //--------------------- BEGIN EVENT LISTENERS ----------------------
    loadListeners = function(){


        dispatch.on("data_update", function(){
            redraw(true);
        });

        dispatch.on("load_cities", function(data){
            stateMap.cities_db.insert(data.slice(0));

            //by default, cache the top member cities in the stateMap
            stateMap.cities = stateMap.cities_db().get();

            //setup the highlight drop down
            d3Map.d3highlight_dropdown.selectAll("option")
                .data(
                ["", "Region","Total city population","Country's GDP per capita (USD)",
                    "Gross capital budget (USD)","Land Area (Square Kilometers)"]
                )
                .enter()
                .append("option")
                .text(function(dimension) { return dimension; });
            stateMap.highlight_selected = "";

            //setup the area drop down
            d3Map.d3area_dropdown.selectAll("option")
                .data(
                ["", "Total city population", "Country's GDP per capita (USD)",
                    "Gross capital budget (USD)","Land Area (Square Kilometers)"]
            )
                .enter()
                .append("option")
                .text(function(dimension) { return dimension; });
            stateMap.area_selected = "";
        });

        dispatch.on("load_indicators", function(data){
            stateMap.performance_indicators_db.insert(data);
            stateMap.indicators = stateMap.performance_indicators_db(function(){
                return this["core"] === 1 ;
            }).order("indicator asec").get();

            // load the indicators into the x/y value drop downs
            d3Map.d3xVal_dropdown.selectAll("option")
                .data(stateMap.indicators)
                .enter()
                .append("option")
                .text(function(d) { return d["indicator"]; });

            // make a particlular x/y selection
            jqueryMap.$xVal_dropdown
                .find("option").filter(function() {
                    return $(this).text() === "Number of in-patient hospital beds per 100 000 population";
                })
                .prop('selected', true)
            ;
            stateMap.xValue = d3Map.d3xVal_dropdown.node().value;

            d3Map.d3yVal_dropdown.selectAll("option")
                .data(stateMap.indicators)
                .enter()
                .append("option")
                .text(function(d) { return d["indicator"]; });

            // make a particlular x/y selection
            jqueryMap.$yVal_dropdown
                .find("option").filter(function() {
                    return $(this).text() === "Average life expectancy";
                })
                .prop('selected', true)
            ;
            stateMap.yValue = d3Map.d3yVal_dropdown.node().value;
        });


        // window resizing
        d3.select(window).on('resize', redraw );

        //listen to changes in x/y drop downs
        d3Map.d3xVal_dropdown.on("change", function(){
            stateMap.xValue = d3Map.d3xVal_dropdown.node().value;
            redraw();
        });
        d3Map.d3yVal_dropdown.on("change", function(){
            stateMap.yValue = d3Map.d3yVal_dropdown.node().value;
            redraw();
        });

        //listen to changes in highlight dropdown
        d3Map.d3highlight_dropdown.on("change", function(){
            stateMap.highlight_selected = d3Map.d3highlight_dropdown.node().value;
            dispatch.highlight(stateMap.highlight_selected);
            redraw();
        });

        //listen to changes in area dropdown
        d3Map.d3area_dropdown.on("change", function(){
            stateMap.area_selected = d3Map.d3area_dropdown.node().value;
            dispatch.area_change( stateMap.area_selected );
            redraw();
        });


        dispatch.on("legend_change", function(highlight, colors){

            // Class names cannot be digits, so prefix a "_" to any category
            var prefix = "_"
                , domain
                , bins = true

                , query = {}
                , operator = []

                , city_cache = []
                ;

            // initialize the query object with a column {column:}
            // to be filled in with the "operator" and "value" {column: {operator: value}}
            query[highlight] = {};


            if (highlight === ""){
                bins = false;
                domain = [];

            }else if (highlight === "Region"){
                bins = false;
                domain = colors.domain();
                operator.push("===");
            }else{

                domain = colors.range().map(function(color, index, array){
                    //format a nice string for output
                    var interval = colors.invertExtent(color);
                    var tag = String();

                    if (index === 0){
                        tag += "0-" + interval[1];
                    }else if(index === array.length - 1){
                        tag += interval[0] + "-Infinity";
                    }else{
                        tag += interval[0] + "-" + interval[1];
                    }
                    return tag;
                });
                operator.push("gte"); //left endpoint
                operator.push("lt");  //right endpoint
            }

            var
              legend_queue = (domain).map(function(d){ return prefix + d})
            , clean_legend_queue = legend_queue.map(function(d){
                return String(d).replace(/ /g,"");
            })
            ;

            // clear the legend
            d3Map.d3legend.html("");
            var legendEnter = d3Map.d3legend.selectAll(".legend-entry")
                    .data(domain)
                    .enter()
                    .append("a")
                    .attr("href", "#")
                    .attr("class", function(d){
                        return prefix + String(d).replace(/ /g,"");
                    })
                    .style({
                        color: function(d, i){ return colors.range()[i] }
                        , "font-size" : "1em"
                    })
                    .html(function(d){
                        return d + "&nbsp  &nbsp";
                    })
                ;

            legendEnter.on("click", function(d){
                var clean_name = prefix + String(d).replace(/ /g,"")
                    , index = clean_legend_queue.indexOf(clean_name)
                    , anchor = d3Map.d3legend.select("." + clean_name)
                    , interval = d.split("-")
                    ;


                //design note: these city objects should be cached somewhere rather than hitting the TAFFY database
                if(index >= 0){

                    // d is being removed
                    legend_queue.splice(index, 1);
                    clean_legend_queue.splice(index, 1);
                    anchor.style("opacity", "0.3");


                    //filter out the array for the relevant items
                    if(bins){
                        stateMap.cities = stateMap.cities.filter(function(cityobj){
                            return cityobj[highlight] < +interval[0] ||  cityobj[highlight] >= +interval[1];
                        });
                    }else{
                        stateMap.cities = stateMap.cities.filter(function(cityobj){
                            return cityobj[highlight] !== d;
                        });
                    }

                }else{
                    // d needs to be added back
                    legend_queue.push(prefix + String(d));
                    clean_legend_queue.push(clean_name);
                    anchor.style("opacity", "1");

                    if(bins){
                        //do a db query for items in the correct range
                        query[highlight][operator[0]] = +interval[0]; //left query
                        query[highlight][operator[1]] = +interval[1]; //right query
                        stateMap.cities = stateMap.cities.concat( stateMap.cities_db(query).get() );
                    }else{
                        //do an exact db query for missing items
                        query[highlight][operator[0]] = d;
                        stateMap.cities = stateMap.cities.concat( stateMap.cities_db(query).get() );
                    }
                }
                redraw();
            });


        });



    };
    // --------------------- END EVENT LISTENERS ----------------------

    redraw = function(){

        d3.transition()
            .duration(500)
            .each(renderAll);
    };

    function renderAll(){
        scatter.xValue( stateMap.xValue );
        scatter.yValue( stateMap.yValue );
        scatter.data( stateMap.cities );
        scatter.render();
    }

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
            dispatch.highlight(stateMap.highlight_selected);
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

