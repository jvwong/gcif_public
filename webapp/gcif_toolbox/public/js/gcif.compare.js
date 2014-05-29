/*
 * gcif.compare.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.compare = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
      configMap = {

        main_html : String() +

            '<h3 class="sub-header"></h3>' +

            '<div class="row">' +
                '<ul id="myTab" class="nav nav-tabs">' +
                    '<li class="active"><a class="gcif-compare-graphical-tab" href="#gcif-compare-graphical" data-toggle="tab">Graphical</a></li>' +
                    '<li class=""><a class="gcif-compare-tabular-tab" href="#gcif-compare-tabular" data-toggle="tab">Tablular</a></li>' +
                '</ul>' +
                '<div id="myTabContent" class="tab-content">' +
                    '<div class="tab-pane fade active in" id="gcif-compare-graphical">' +
                        '<form class="form" role="form">' +
                            '<div class="form-group gcif-compare graphical menu">' +
                                '<label for="theme-dropdown" class="col-sm-1 control-label">Theme </label>' +
                                '<div class="col-sm-11">' +
                                    '<select id="theme-dropdown" class="form-control"></select>' +
                                '</div>' +
                                '<label for="highlight-dropdown" class="col-sm-1 control-label">Highlight </label>' +
                                '<div class="col-sm-11">' +
                                    '<select id="highlight-dropdown" class="form-control"></select>' +
                                '</div>' +
                            '</div>' +
                            '<div class="form-group">' +
                                '<div class="btn-group gcif-compare graphical col-sm-offset-1 col-sm-11">' +
                                    '<button type="button" class="btn btn-default" id="clear-highlights">' +
                                        '<span class="glyphicon glyphicon-remove"></span> Clear Highlights' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="clear-brushes">' +
                                        '<span class="glyphicon glyphicon-remove"></span> Clear Brushes' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="isolate-brushed">' +
                                        '<span class="glyphicon glyphicon-th"></span> Isolate Brushed' +
                                    '</button>' +
                                    '<button type="button" class="btn btn-default" id="refresh">' +
                                        '<span class="glyphicon glyphicon-refresh"></span> Refresh' +
                                    '</button>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
//                        '<div class="row">' +
//                            '<div class="col-sm-12">' +
//                                '<div class="input-group col-sm-12">' +
//                                    '<input type="text" class="form-control" placeholder="Search...">' +
//                                '</div>' +
//                            '</div>' +
//                        '</div>' +

                        '<div class="gcif-compare legend col-xs-12 col-md-12 col-lg-12"></div>' +
                        '<div class="gcif-compare chart col-lg-12"></div>' +
                    '</div>' +

                    '<div class="tab-pane fade" id="gcif-compare-tabular">' +
                        '<form class="form" role="form">' +
                            '<div class="form-group">' +
                                '<div class="btn-group gcif-compare tabular col-sm-12">' +
                                    '<a href="">' +
                                        '<button type="button" class="btn btn-default" id="export-csv">' +
                                            '<span class="glyphicon glyphicon-download"></span> CSV' +
                                        '</button>' +
                                    '</a>' +
                                '</div>' +
                            '</div>' +
                        '</form>' +
                        '<div class="gcif-compare table col-lg-12"></div>' +
                    '</div>' +

                '</div>' +
            '</div>'
      }
    , stateMap = {
            $container                : undefined

          , source                    : undefined
          , cities                    : undefined
          , indicators                : undefined
          , flagged_indicators        : ["Percentage of city population with authorized electrical service"
                                        ,"Energy consumption of public buildings per year (kWh/m2)"
                                        ,"Percentage of total energy derived from renewable sources, as a share of the city’s total energy consumption"
                                        ,"Fine Particulate Matter (PM2,5) concentration"
                                        ,"Particulate Matter (PM10) concentration"
                                        ,"Number of natural disaster related deaths per 100 000 population"
                                        ,"Women as a percentage of total elected to city-level office"
                                        ,"Number of homicides per 100 000 population"
                                        ,"Total collected municipal solid waste per capita"
                                        ,"Kilometres of high capacity public transport system per 100 000 population"
                                        ,"Kilometres of light passenger public transport system per 100 000 population"
                                        ,"Total domestic water consumption per capita (litres/day)"
                                        ,"Percentage of population with access to improved sanitation"
                                        ,"Percentage of city population with potable water supply service"
                                        ,"performance,wastewater,Percentage of the city's wastewater that has received no treatment"
                                        ,"Percentage of the city's wastewater receiving primary treatment"
                                        ,"Percentage of the city's wastewater receiving secondary treatment"
                                        ,"Percentage of the city's wastewater receiving tertiary treatment"
                                        ,"Number of fire related deaths per 100 000 population"
                                        ,"Percentage of city population living in slums"
                                         ]
          , theme                     : undefined
          , highlight_selected        : undefined

          , cities_db                 : TAFFY()
          , performance_indicators_db : TAFFY()

          , topThemes                 : [
                                            "economy",
                                            "education",
                                            "finance",
                                            "health",
                                            "recreation",
                                            "safety",
                                            "shelter",
                                            "technology and innovation",
                                            "transportation",
                                            "urban planning",
//                                            "wastewater",
                                            "water and sanitation",
                                            "fire and emergency response",
                                            "governance",
                                            "energy",
                                            "environment",
                                            "solid waste"
                                        ]
          , attendees                 : []
    }

    , jqueryMap = {}, d3Map= {}
    , setJqueryMap, setd3Map

    , dispatch = d3.dispatch("click_graph", "click_table",
                             "load_cities", "load_indicators", "done_load",
                             "highlight", "brush", "legend_change", "metadata_load")

    , parallelChart, list

    , loadData, loadListeners, initCharts, resetState, render, redraw
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------
    setJqueryMap = function(){
        var
          $container = stateMap.$container;

        jqueryMap = {
            $container           : $container
          , $theme_dropdown      : $container.find(".form-group.gcif-compare.graphical.menu select#theme-dropdown")
          , $highlight_dropdown  : $container.find(".form-group.gcif-compare.graphical.menu select#highlight-dropdown")
        };
    };

    setd3Map = function(){
        d3Map = {
              d3compare              : d3.select(".gcif-compare.chart")

            , d3graphical_tab        : d3.select(".gcif-compare-graphical-tab")
            , d3tabular_tab          : d3.select(".gcif-compare-tabular-tab")

            , d3theme_dropdown       : d3.select(".form-group.gcif-compare.graphical.menu select#theme-dropdown")
            , d3highlight_dropdown   : d3.select(".form-group.gcif-compare.graphical.menu select#highlight-dropdown")

            , d3clear_highlights     : d3.select(".btn-group.gcif-compare.graphical button#clear-highlights")
            , d3clear_brushes        : d3.select(".btn-group.gcif-compare.graphical button#clear-brushes")
            , d3isolate_brushed      : d3.select(".btn-group.gcif-compare.graphical button#isolate-brushed")
            , d3refresh              : d3.select(".btn-group.gcif-compare.graphical button#refresh")

            , d3table                : d3.select(".gcif-compare.table")
            , d3export_csv           : d3.select(".btn-group.gcif-compare.tabular button#export-csv")
            , d3downloadanchor       : d3.select(".btn-group.gcif-compare.tabular a")

            , d3legend               : d3.select(".gcif-compare.legend")
        };
    };

    initCharts = function(){
        parallelChart = gcif.parallel.Parallel( d3Map.d3compare );
        parallelChart.datadb( stateMap.cities_db().get() );
        parallelChart.metadb( stateMap.performance_indicators_db().get() );
        parallelChart.dispatch( dispatch );
        parallelChart.default_path_color( "lightgrey" );

        list = gcif.table.Table( d3Map.d3table );
        list.metadb( stateMap.performance_indicators_db().get() );
    };

    resetState = function (){
        stateMap.theme      = undefined;
        stateMap.indicators = undefined;
        stateMap.cities     = undefined;
        stateMap.cities_db  = TAFFY();
        stateMap.performance_indicators_db = TAFFY();
    };

    loadData = function(){
        d3.json("/performance_indicators/list", function(performance_indicators_data) {
            dispatch.load_indicators(performance_indicators_data);
        });

        d3.json("/combined_confused/list", function(city_data) {
            dispatch.load_cities(city_data);
            dispatch.done_load();
        });
    };

    loadListeners = function(){
        //--------------------- BEGIN EVENT LISTENERS ----------------------

        //tab navigation
        d3Map.d3graphical_tab.on("click", function(){
           dispatch.click_graph();
        });

        d3Map.d3tabular_tab.on("click", function(){
            dispatch.click_table();
        });

        //data loading
        dispatch.on("load_cities", function(data){
            stateMap.cities_db.insert(data.slice(0));
            stateMap.cities_db({Region: "EAST ASIA - PACIFIC"}).remove();

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
        });

        dispatch.on("load_indicators", function(data){
            stateMap.performance_indicators_db.insert(data);
            var dropdata = stateMap.performance_indicators_db(function(){
                //only include indicators in top 5 themes
                return stateMap.topThemes.indexOf(this["theme"]) >= 0;
            }).distinct("theme");

            dropdata.splice(0, 0, "all");
            //Load (top) indicators into dropdown menu
            d3Map.d3theme_dropdown.selectAll("option")
                .data(dropdata)
                .enter()
                .append("option")
                .text(function(theme) { return theme; });


            stateMap.theme = "health";
            jqueryMap.$theme_dropdown
                .find("option").filter(function() {
                    return $(this).text() === stateMap.theme;
                })
                .prop('selected', true)
            ;
            stateMap.indicators = (stateMap.performance_indicators_db(function(){
                return this["theme"] === stateMap.theme && //matches that in stateMap.theme
                    this["core"] === 1 &&
                    stateMap.flagged_indicators.indexOf(this["indicator"]) < 0 //not flagged
                    ;
            }).get())
            .map(function(d){
               return d["indicator"]
            });

        });

        dispatch.on("brush", function(brusheddata){
            stateMap.cities = brusheddata;
            list.data( stateMap.cities );
            list.render();
        });

        //table button for exporting csv
        d3Map.d3export_csv.on("click", function(){
            var output = []
                , headers
                , encodedUri
                ;

            headers = stateMap.indicators;
            stateMap.cities.forEach(function(data){
                var row = headers.map(function(header){
                    return data[header];
                });
                row.unshift(data["CityName"]);
                output.push(row);
            });

            headers.unshift("City");
            output.unshift(headers);
            encodedUri = d3.csv.format(output);
            d3Map.d3downloadanchor.attr({
                href      : "data:application/csv, " + encodeURIComponent(encodedUri)
                , download  : "gcif_data.csv"
            });
        });

        //reset button for highlighted paths
        d3Map.d3clear_highlights.on("click", function(){
            parallelChart.clearHighlight(d3Map.d3compare.selectAll(".foreground path.highlight"), d3Map.d3compare.selectAll(".point.highlight"))
        });

        //reset button for brushes
        d3Map.d3clear_brushes.on("click", function(){//
            parallelChart.clearBrush( d3.selectAll(".brush") )
        });

        //subset button for brushes
        d3Map.d3isolate_brushed.on("click", function(){//
            parallelChart.subsetBrush();
            redraw();
        });

        //listen to the clear all button
        d3Map.d3refresh.on("click", function(){
            resetState();
            loadData();

            dispatch.on("done_load", function(){

                jqueryMap.$theme_dropdown
                .find("option").filter(function() {
                        return $(this).text() === "all";
                })
                .prop('selected', true)
                ;
                d3Map.d3theme_dropdown.on("change")();

                jqueryMap.$highlight_dropdown
                .find("option").filter(function() {
                        return $(this).text() === "";
                })
                .prop('selected', true)
                ;
                d3Map.d3highlight_dropdown.on("change")();
            });
        });

        //listen to changes in highlight dropdown
        d3Map.d3highlight_dropdown.on("change", function(){
            stateMap.highlight_selected = d3Map.d3highlight_dropdown.node().value;
            dispatch.highlight(stateMap.highlight_selected);
            redraw();
        });

        dispatch.on("legend_change", function(highlight, colors){

            // Class names cannot be digits, so prefix a "_" to any category
            var prefix = "_"
              , domain
              , bins = true

              , query = {}
              , operator = []
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

            var legend_queue = (domain).map(function(d){ return prefix + d})
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


                if(index >= 0){

                    // d is being removed
                    legend_queue.splice(index, 1);
                    clean_legend_queue.splice(index, 1);
                    anchor.style("opacity", "0.3");


                    //filter out the array for the relevant items
                    if(bins){
                        stateMap.cities = stateMap.cities.filter(function(cityobj){
                            return cityobj[highlight] < +interval[0] ||
                                   cityobj[highlight] >= +interval[1];
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
                        stateMap.cities = stateMap.cities.concat(stateMap.cities_db(query).get());
                    }else{
                        //do an exact db query for missing items
                        query[highlight][operator[0]] = d;
                        stateMap.cities = stateMap.cities.concat(stateMap.cities_db(query).get());
                    }
                }
                redraw();
            });
        });

        //listen to changes in theme dropdown
        d3Map.d3theme_dropdown.on("change", function(){
            stateMap.theme = d3Map.d3theme_dropdown.node().value;
            stateMap.indicators = stateMap.theme === "all" ?
                (stateMap.performance_indicators_db(function(){
                    return stateMap.topThemes.indexOf(this["theme"]) >= 0 &&
                        this["core"] === 1 &&
                        stateMap.flagged_indicators.indexOf(this["indicator"]) < 0;
                }).get())
                    .map(function(d){
                        return d["indicator"]
                    }) :
                stateMap.performance_indicators_db({ theme: stateMap.theme, core: 1 })
                    .get()
                    .filter(function(d){
                        return stateMap.flagged_indicators.indexOf(d["indicator"]) < 0;
                    })
                    .map(function(d){
                        return d["indicator"];
                    });
            redraw();
        });

        // window resizing
        d3.select(window).on('resize', redraw );
    };

    //--------------------- BEGIN HELPERS ----------------------

    redraw = function(listonly){
        listonly = typeof listonly !== 'undefined' ? listonly : false;

        d3.transition()
        .duration(500)
        .each(function(){return renderAll(listonly);});

        function renderAll(listonly){

            var c = stateMap.cities.sort(function(a, b){
                return  a["CityName"] <= b["CityName"] ? -1 : 1;
            });

            list.metadata( stateMap.indicators );
            list.data(c);
            list.render();

            if (!listonly){

                parallelChart.metadata( stateMap.indicators );
                parallelChart.data(c);
                parallelChart.render();
            }
        }

    };

    //--------------------- END HELPERS ----------------------


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

