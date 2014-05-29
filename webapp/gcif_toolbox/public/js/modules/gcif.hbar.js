/*
 * gcif.hbar.js
 * User Interface module
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif */

gcif.hbar = (function () {
    'use strict';

    //---------------- BEGIN MODULE SCOPE VARIABLES --------------
    var
    configMap = {

        main_html : String() +

            '<h3 class="sub-header"></h3>' +

            '<div class="row">' +
                '<form class="form" role="form">' +

                    '<div class="form-group gcif-hbar menu">' +
                        '<label for="category-dropdown" class="col-sm-1 control-label">Theme</label>' +
                        '<div class="col-sm-11">' +
                            '<select id="category-dropdown" class="form-control"></select>' +
                        '</div>' +
                    '<div>' +

                    '<div class="form-group gcif-hbar number">' +
                        '<label for="number-dropdown" class="col-sm-1 control-label">Show</label>' +
                        '<div class="col-sm-11">' +
                            '<select id="number-dropdown" class="form-control">' +
                                '<option value="25"><25</option>' +
                                '<option value="50"><50</option>' +
                                '<option value="100"><100</option>' +
                                '<option value="200"><200</option>' +
                                '<option value="1000">All</option>' +
                            '</select>' +
                        '</div>' +
                    '<div>' +

                    '<div class="form-group">' +
                        '<div class="btn-group gcif-hbar sort col-sm-offset-1 col-sm-11">' +
                            '<button type="button" class="btn btn-default" id="alphabetical">' +
                                '<span class="glyphicon glyphicon-sort-by-alphabet"></span> Alphabetical' +
                            '</button>' +
                            '<button type="button" class="btn btn-default active" id="number">' +
                                '<span class="glyphicon glyphicon-sort-by-order-alt"></span> Number' +
                            '</button>' +
                        '</div>' +
                    '</div>' +

                '</form>' +
            '<div>' +


            '<div class="row">' +

                '<ul id="myTab" class="nav nav-tabs">' +
                    '<li class="active"><a href="#graphical" data-toggle="tab">Graphical</a></li>' +
                    '<li class=""><a href="#tabular" data-toggle="tab">Tablular</a></li>' +
                '</ul>' +

                '<div id="myTabContent" class="tab-content">' +
                    '<div class="tab-pane fade active in" id="graphical">' +
                        '<div class="gcif-hbar chart col-lg-12"></div>' +
                    '</div>' +
                    '<div class="tab-pane fade" id="tabular">' +
                        '<div class="gcif-hbar table col-lg-12 table-responsive">' +
                            '<table class="table table-bordered table-hover table-condensed">' +
                                '<thead>' +
                                    '<tr>' +
                                        '<th>Indicator (Core)</th>' +
                                        '<th>Value</th>' +
                                    '</tr>' +
                                '</thead>' +
                                '<tbody>' +
                                    '<tr>' +
                                    '</tr>' +
                                '</tbody>' +
                            '</table>' +
                        '</div>' +
                    '</div>' +
                '</div>' +

            '</div>'


    }
    , stateMap = {
          $container : undefined
        , dataUrl    : undefined
        , countUrl   : undefined
        , schemaUrl  : undefined
        , sortOrder  : "number"
    }
    , jqueryMap = {}
    , d3Map= {}
    , setJqueryMap
    , setd3Map
    , setDataUrls
    , render
    , initModule;

    //---------------- END MODULE SCOPE VARIABLES --------------


    //--------------------- BEGIN DOM METHODS --------------------

    setJqueryMap = function(){
        var
          $container = stateMap.$container;

        jqueryMap = {
              $container  : $container
            , $sortbtns   : $container.find(".btn-group.gcif-hbar.sort .btn")
            , $numbtns    : $container.find(".btn-group.gcif-hbar.number ul.dropdown-menu li a")
        };
    };

    setd3Map = function(){
        d3Map = {
              d3bar       : d3.select(".gcif-hbar.chart")
            , d3table     : d3.select(".gcif-hbar.table")
            , d3category  : d3.select(".gcif-hbar.menu select")
            , d3sort      : d3.select(".gcif-hbar.sort input")
            , d3number    : d3.select(".gcif-hbar.number select")
        };
    };


    // BEGIN private method /render/
    render = function(dataurl){
       var

           margin = {top: 50, right: 80, bottom: 10, left: 200}
        ,  width
        ,  height

        , cities
        , categories
        , memberData
        , categoryIndicators

        , defaultCategory = "all"
        , nCore = 40

        ,x ,y ,xAxis, svg;


        function setsvgdim(){

            var
              num = +d3Map.d3number.node().value
            , verticalScaling
            ;


            if (num <= 25){
                verticalScaling = 0.5;
            }else if (num <= 50){
                verticalScaling = 0.8;
            }else if (num <= 100){
                verticalScaling = 1.2;
            }else if (num <= 200){
                verticalScaling = 2.5;
            }else{
                verticalScaling = 3.5;
            }



            width = $( window ).width() * 0.8 - margin.left - margin.right;
            height = $( window ).height() * verticalScaling - margin.top - margin.bottom;

        }


        function rendersvg(){

            //clear out any residual svg elements
            d3.select("svg").remove();

            x = d3.scale.linear().range([0, width]);
            y = d3.scale.ordinal().rangeBands([0, height], .1, .1);

            xAxis = d3.svg.axis()
                        .scale(x)
                        .orient("top")
                        .tickSize(-height - margin.bottom);

            /* append main svg */
            svg = d3Map.d3bar.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                  .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


            /* append axes */
            svg.append("g")
                .attr("class", "gcif-hbar chart x axis");

            svg.append("g")
                .attr("class", "gcif-hbar chart y axis")
              .append("line")
                .attr("class", "domain")
                .attr("y2", height);
        }


        /* register event listeners*/
        d3Map.d3category.on("change", change);
        d3Map.d3number.on("change", onChangeNumber );
        jqueryMap.$sortbtns.click( onClickSort );
        d3.select(window).on('resize', resize);

        /* read in the data */
        d3.csv(dataurl, function(data) {

            //global variable
            cities = data;

            // remove the CityName and CityUniqueID_ and all keys
            categories = d3.keys(cities[0]).filter(function(key) {
                return key != "CityName" && key != "CityUniqueID_";
            });

            cities.forEach(function(city) {
                categories.forEach(function(category){
                    city[category] = +city[category];
                });
            });

            d3Map.d3category.selectAll("option")
                        .data(categories)
                       .enter()
                        .append("option")
                        .text(function(cat) { return cat; });

            d3Map.d3category.property("value", defaultCategory);
            d3Map.d3number.property("value", 100);

            setsvgdim();
            rendersvg();
            redraw();
        });

        /* read in the full member data  */
        d3.json(stateMap.countUrl, function(data) {
            memberData = data;
        });

        /* read in the category --> indicator mapping */
        d3.json(stateMap.schemaUrl, function(data) {
            categoryIndicators = data;
        });


        function getIndicators(data){

            var
              html = String()
            , cityData
            , keys
            , cat
            ;

            //Reset the header
            d3Map.d3table.select("th").html("Indicators (" + data["CityName"] + ")");

            //get the member data by CityUniqueID_
            cityData = memberData[ data["CityUniqueID_"] ];

            //get the keys according to the category
            cat = d3Map.d3category.property("value");

            //if "all"
            if(cat === "all"){
                keys = d3.keys(cityData);
                keys.splice(keys.indexOf("CityName"),1);
                keys.splice(keys.indexOf("CityUniqueID_"),1);
            }else{
                keys = categoryIndicators[cat];
            }

            for (var i=0; i<keys.length; i++){
                    html += '<tr>' +
                                '<td>' + keys[i].split("_")[0] + '</td>' +
                                '<td>' + cityData[keys[i]] + '</td>' +
                            '</tr>';
            }

            return html;
        }

        function onClickSort(){
            jqueryMap.$sortbtns.removeClass("active");
            $(this).addClass("active");
            stateMap.sortOrder = $(this).attr("id");
            change();
        }

        function onChangeNumber(){
            setsvgdim();
            rendersvg();
            change();
        }

        /* Update graph using new width and height (code below) */
        function resize() {
            setsvgdim();
            rendersvg();
            change();
        }


        function change() {
            d3.transition()
                .duration(750)
                .each(redraw);
        }

        function redraw() {

            //get the category
            var
              current_category = d3Map.d3category.property("value")
            , numrecords = d3Map.d3number.node().value
            , cityData
            ;

            //sort
            if (stateMap.sortOrder === "number"){
                cityData = cities.sort(function(a, b) { return b[current_category] - a[current_category]; }).slice(0, numrecords);
            }else{
                cityData = cities.sort(function(a, b) { return d3.ascending(a["CityName"], b["CityName"]); }).slice(0, numrecords);
            }

            //update the category
            var category = current_category;

            // position on y-axis will map onto a categorial axis
            y.domain(cityData.map(function(d) { return d["CityUniqueID_"]; }));

            var bar = svg.selectAll(".gcif-hbar.chart.bar")
                     .data(cityData, function(d) { return d["CityUniqueID_"]; });

            //define enter selections
            var barEnter = bar.enter().insert("g", ".axis") //create and insert new elements before existing elements
                          .attr("class", "gcif-hbar chart bar")
                          .attr("transform", function(d) { return "translate(0," + (y(d["CityUniqueID_"]) + height) + ")"; })
                          .style("fill-opacity", 0);

            // NB: "return a && b"  is return a if a is falsy, return b if a is truthy
            barEnter.append("rect")
                  .attr("width", category && function(d) { return x(d[category]); })
                  .attr("height", y.rangeBand());

            // put the city name along the y axis
            barEnter.append("text")
                  .attr("class", "gcif-hbar chart label")
                  .attr("x", -12)
                  .attr("y", y.rangeBand() / 2)
                  .attr("dy", "0.35em")
                  .attr("text-anchor", "end")
                  .text(function(d) { return  d["CityName"]; });

            // put a label at the top
            barEnter.append("text")
                  .attr("class", "gcif-hbar chart value")
                  .attr("x", category && function(d) { return x(d[category]) - 3; }) //push to the left
                  .attr("y", y.rangeBand() / 2)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "end");


            // setting category here as the value of the selected current_scategory
            barEnter.on("click", function(d) {

                var tbody  = d3Map.d3table.select("tbody");
                tbody.html("");

                tbody.transition()
                    .duration(200);

                tbody.html( getIndicators(d) );
            });
            x.domain([0, nCore ]);

            var barUpdate = d3.transition(bar)
              .attr("transform", function(d) { return "translate(0," + (d.y0 = y( d["CityUniqueID_"])) + ")"; })
              .style("fill-opacity", 1);

            barUpdate.select("rect")
              .attr("width", function(d) { return x(d[category]); })
              .attr("height", y.rangeBand());

            //update the label on the bar (but don't do it if its zero)
            barUpdate.select(".gcif-hbar.chart.value")
              .attr("x", function(d) { return x(d[category]) - 3; })
              .attr("y", y.rangeBand() / 2)
              .text(function(d) { return d[category] > 0 ? (d[category]) : null; });

            barUpdate.select(".gcif-hbar.chart.label")
                  .attr("x", -3)
                  .attr("y", y.rangeBand() / 2)
                  .attr("dy", "0.35em")
                  .attr("text-anchor", "end")
                  .text(function(d) { return  d["CityName"]; });

            var barExit = d3.transition(bar.exit())
              .attr("transform", function(d) { return "translate(0," + (d.y0 + height) + ")"; })
              .style("fill-opacity", 0)
              .remove();

            barExit.select("rect")
              .attr("width", function(d) { return x(d[category]); });

            barExit.select("gcif-hbar.chart.value")
              .attr("x", function(d) { return x(d[category]) - 3; })
              .text(function(d) { return d[category]; });

            d3.transition(svg).select(".gcif-hbar.chart.x.axis")
              .call(xAxis);
        }

    };
    // END private method /render/

    //--------------------- END DOM METHODS ----------------------


    //------------------- BEGIN EVENT HANDLERS -------------------



    //-------------------- END EVENT HANDLERS --------------------



    //---------------------- BEGIN CALLBACKS ---------------------

    //------------------- BEGIN PUBLIC METHODS -------------------

    // Begin Public method /setDataurl/
    // Example   : gcif.table.setDataUrl( "/path/to/data" );
    // Purpose   :
    //   Sets the stateMap key for $dataurl
    // Arguments :
    //   * absolute path to a valid file
    // Action    :
    //   Populates $dataUrl value
    // Returns   : none
    // Throws    : none
    setDataUrls = function(source){
        var root;

        /* local path*/
        root = String() + "assets/data/";

        /* server path*/
//        root = String() + "/shared/Documents/GCIF/web/";

        stateMap.dataUrl   = root + source + "_category_counts.csv";
        stateMap.countUrl  = root + source + "_core_byID.json";
        stateMap.schemaUrl = root + "category_indicators.json";
    };
    // End PUBLIC method /setDataurl/

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
        setd3Map();
        render(stateMap.dataUrl);
    };
    // End PUBLIC method /initModule/

    return {   initModule   : initModule
             , setDataUrls  : setDataUrls
            };
    //------------------- END PUBLIC METHODS ---------------------
})();

