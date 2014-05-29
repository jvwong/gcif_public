/*
 * gcif.parallel.js
 * parallel chart
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/* global $, d3, gcif */

gcif.parallel = (function () {

    var
    Parallel = function( d3container ) {

        var _parallel = {};

        var
          _container = d3container
        , _svg

        , _margin = { top: 25, right: 5, bottom: 150, left: 5 }
        , _min_width = 300
        , _min_height = 200
        , _width
        , _height
        , _x = d3.scale.ordinal()
        , _y = {}
        , _eps = 0.0001

        , _metadata = []
        , _metadb = TAFFY()
        , _data = []
        , _datadb = TAFFY()

        , _dragging = {}
        , _line = d3.svg.line()
        , _axis = d3.svg.axis().orient("left")
        , _background
        , _foreground
        , _point

        , _highlight = null
        , _default_path_color = "steelblue"

        , _colors10 = ["#1f77b4", "#ff7f0e", "#d62728", "#9467bd", "#637939",
                       "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#9edae5"]
        , _colors20 = ["#1f77b4", "#ff7f0e", "#ffbb78", "#2ca02c", "#d62728",
                       "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2",
                       "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#17becf",
                       "#9edae5", "#e7969c", "#7b4173", "#a55194", "#637939"]

        , _hcolor = d3.scale.ordinal().domain("").range("steelblue")
        , _pcolor = d3.scale.ordinal().domain("").range(_colors10.slice(0,9))

        , _tooltip
        , _dispatch

        , _debug_mode = false


        ;


        /* sets the svg dimensions based upon the current browser window */
        function setsvgdim(){

            var
                verticalScaling = 0.60
                , horizontalScaling = 0.75
                , numDimension = _metadata.length
            ;

            if(_debug_mode){
                _width  = 250;
                _height = 250;
            }else{
                var resize_width = d3.max([$( window ).width() * horizontalScaling - _margin.left - _margin.right, _min_width])
                , fix_width = d3.max([(125 * numDimension), (resize_width *2) ])
                ;

                _width  = numDimension > 4 ? fix_width : resize_width;
                _height = d3.max([$( window ).height() * verticalScaling - _margin.top - _margin.bottom, _min_height]);

            }
            _x.rangePoints([0, _width], 1);
        }

        function renderTooltip(){

            d3.selectAll(".parallel.tooltip").remove();

            _tooltip = d3.select("body")
                         .append("div")
                         .attr("class", "parallel tooltip")
                         .style("opacity", 0)
                         ;

        }

        /* renders the containing svg element */
        function rendersvg(container){

            //clear out any residual svg elements
            d3.select("svg").remove();

            //draw a new svg element
            return container.append("svg")
                             .attr({
                                width: _width + _margin.left + _margin.right
                              , height: _height + _margin.top + _margin.bottom
                            })
                            .append("g")
                            .attr({ class: "parallel body"
                                , transform: "translate(" + _margin.left + "," + _margin.top + ")" })
            ;
        }

        function renderAxes(){
            _x.domain( _metadata );
           // y is a global dictionary {} of y-scales for each column (header)
           _metadata.forEach( function(header){
               _y[header] = d3.scale.linear()
                                    .domain([0, d3.max(_data, function(document) { return +document[header];}) + _eps])
                                    .range([_height, 0])
               ;
           });
        }

        function position(d) {
            var v = _dragging[d];
            return v == null ? _x(d) : v;
        }


        function transition(g) {
            return g.transition().duration(500);
        }

        // Returns the path for a given data point.
        function path(d) {

            var p;
            try
            {
                p = _line(_metadata.map(function(p) {
                        return [position(p), _y[p](d[p])]; })
                );
            }
            catch(err)
            {
                console.log("header missing: %s", err);
            }
            return p;

        }

        // Handles a brush event, toggling the display of foreground lines.
        function brush() {
             //actives is the set. possibly empty, of indicators/axes that are currently being brushed
            var
              actives = _metadata.filter( function(indicator) {
                  return !_y[indicator].brush.empty();
              })
            , extents = actives.map(function(indicator) { return _y[indicator].brush.extent(); })

            // *********** hack alert -- return list of cities for listeners (table)
            , brushedCities = []
            ;

            //loop through each city's path and set the path visibility to null OR none
            _foreground.style("display", function(data) {

                //loop over each brushed indicator
                var isValid = actives.every(function(indicator, index) {
                    //loop  over each indicator axis extent (if any)
                    return extents[index][0] <= data[indicator] && data[indicator] <= extents[index][1];
                });

                if (isValid){
                    brushedCities.push(data);
                    return null;
                }

                return "none";

            });

            //*********** hack alert -- how to expose this object to brush events? Publish?
            _point.style("display", function(data){
                //In this case, loops through each city along any axis and asks:
                // Is the indicator for this city within the brush for those being brushed?
                return actives.every(function(indicator, indindex) {
                    return extents[indindex][0] <= data[indicator] && data[indicator] <= extents[indindex][1];
                }) ? null : "none";
            });

            _dispatch.brush(brushedCities);
        }


        /* set the highlight colour domain and range */
        function setHighColors(type){

            var h, t;
            switch (type)
            {
                case "Region":
                    t = _datadb({Region:{isUndefined:false}}).distinct("Region");
                    h = d3.scale.ordinal().domain( t ).range( _colors10.slice(0,t.length) );
                    break;

                case "Total city population":
                    t = [1e5, 5e5, 1e6, 2.5e6, 5e6];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                case "Land Area (Square Kilometers)":
                    t = [100, 300, 600, 1e3];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                case "Gross capital budget (USD)":
                    t = [1e6, 1e7, 1e8, 1e9];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                case "Country's GDP per capita (USD)":
                    t = [2.5e3, 5e3, 1e4, 2.5e4, 5e4];
                    h = d3.scale.threshold().domain( t ).range( _colors10.slice(0,t.length + 1) );
                    break;

                default:
                    t = [];
                    h = d3.scale.ordinal().domain(t).range(_default_path_color);
            }
            return h;
        }

        function setColor(d){

            if (_highlight){
                if (typeof d === "number") {
                    return _hcolor(+d[_highlight]);
                }
                else
                {
                    return _hcolor(d[_highlight]);
                }
            } else {
                return _default_path_color;
            }

        }



        function renderBody(){

            var
              g
            , points
            ;




            // Add grey background lines for context.
            _background = _svg.append("g")
                            .attr("class", "background")
                            .selectAll("path")
                            .data(_data, function(d){ return d["___id"]; })
                            .enter().append("path")
                            .attr("d", path);

            // Add blue foreground lines for focus.
            _foreground = _svg.append("g")
                            .attr("class", "foreground")
                            .selectAll("path")
                            .data(_data, function(d){ return d["___id"]; })
                            .enter()
                            .append("path")
                            .attr("class", function(d){
                                return "unhighlight";
                            })
                            .attr("d", path)
                            .attr("stroke", setColor )
                            ;


            // Add a group element for each dimension.
            g = _svg.selectAll(".dimension")
                        .data(_metadata)
                       .enter()
                        .append("g")
                        .attr("class", "dimension")
                        .attr("transform", function(d) { return "translate(" + _x(d) + ")"; })
                        .call(
                            d3.behavior.drag()
                            .on("dragstart", function(d) {
                                _dragging[d] = this.__origin__ = _x(d);
                                _background.attr("visibility", "hidden");
                            })
                            .on("drag", function(d) {
                                _dragging[d] = Math.min(_width, Math.max(0, this.__origin__ += d3.event.dx));
                                _foreground.attr("d", path);
                                _metadata.sort(function(a, b) { return position(a) - position(b); });
                                _x.domain(_metadata);
                                g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
                            })
                            .on("dragend", function(d) {
                                delete this.__origin__;
                                delete _dragging[d];
                                transition(d3.select(this)).attr("transform", "translate(" + _x(d) + ")");

                                transition(_foreground).attr("d", path);

                                _background.attr("d", path)
                                        .transition()
                                        .delay(500)
                                        .duration(0)
                                        .attr("visibility", null);
                            })
                        )
            ;


            // Add a group for each set of points
            points = _svg.selectAll(".dimension")
                             .append("g").attr("class","points");
            _point = points.selectAll(".point")
                   .data(_data, function(d){ return d["___id"]; })
                  .enter()
                   .append("circle")
                   .attr({ cy     :  function(city){
                                         var p = d3.select(this.parentNode).datum();
                                         try
                                         {
                                             return _y[p](city[p]);
                                         }
                                         catch(e)
                                         {
                                             console.log(e);
                                         }

                                     }
                          , cx    : 0
                          , r     : 2
                          , class : function(d){return "unhighlight point"}
                          , fill  : setColor
                    })
            ;

            // Add an axis and title.
            g.append("g")
                .attr("class", "axis")
                .each(function(d) { d3.select(this).call( _axis.scale(_y[d])); })
                .append("text")
                .attr("text-anchor", "middle")
                .attr("fill", function(d){
                      return "black";
                })
                .attr("y", _height)
                .attr("dy", "2em")
                .text(String)
            ;

            //try to wrap the labels
            d3.selectAll("g.axis > text").call(gcif.util.wrap, 0.80 * (_x.range()[1] - _x.range()[0]));

            // Add and store a brush for each axis if there is > 1 indicator
            if(_metadata.length > 1){

                g.append("g")
                    .attr("class", "brush")
                    .each(function(d) {
                            d3.select(this).call(
                            _y[d].brush = d3.svg.brush().y(_y[d])
                                                       .on("brush.chart", brush)
                        );
                    })
                    .selectAll("rect")
                    .attr("x", -8)
                    .attr("width", 16);
            }

            // register listener for mouseover, mouseout, and click
            d3.selectAll(".foreground > path")
                .on("mouseover", function(d){
                    _tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    _tooltip.html(d["CityName"])
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                })
                .on("mouseout", function(d){
                    // get rid of the tooltip when mousing away
                    _tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", function(d){
                    var tooltip;

                    if (d3.selectAll(".parallel.tooltip." + d["___id"]).empty()){
                        tooltip = d3.select("body")
                                .append("div")
                                .attr("class", "parallel tooltip click " + d["___id"])
                                .style("opacity", 0)
                            ;

                        tooltip.transition()
                            .duration(200)
                            .style("opacity", .9);
                        tooltip.html(d["CityName"])
                            .style("left", (d3.event.pageX + 20) + "px")
                            .style("top", (d3.event.pageY - 20) + "px");

                    }else{
                        d3.selectAll(".parallel.tooltip.click." + d["___id"]).remove();
                    }

                    var pathdata = d3.select(this).data()[0];

                    //remove and repaint on top
                    gcif.util.moveToFront(d3.select(this));

                    //In this case, loops through each city along any axis and asks:
                    // Is this city the same city (_id) being highlighted?
                    _point.attr("class", function(pointdata){

                        if (pointdata["_id"] === pathdata["_id"]){
                            return d3.select(this).attr("class").search("unhighlight") >= 0 ?
                                   d3.select(this).attr("class").replace("unhighlight", "highlight") :
                                   d3.select(this).attr("class").replace("highlight", "unhighlight");
                        } else {
                            return d3.select(this).attr("class");
                        }
                    });

                    //toggle the color of clicked paths
                    d3.select(this)
                      .attr("stroke", function(d,i){
                            return d3.select(this).attr("class").search("unhighlight") >= 0 ?
                                   _pcolor(d["CityName"]) :
                                   _highlight !== "" ? _hcolor(d[_highlight]) : _default_path_color
                      })
                      .attr("stroke-width", "8")
                      .attr("class", function(d){
                        return d3.select(this).attr("class").search("unhighlight") >= 0 ?
                               d3.select(this).attr("class").replace("unhighlight", "highlight") :
                               d3.select(this).attr("class").replace("highlight", "unhighlight");
                    })
                    ;

                })
                ;

            // register listener for mouseover, mouseout for points
            d3.selectAll(".point")
                .on("mouseover", function(d){
                    _tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    _tooltip.html(d["CityName"])
                        .style("left", (d3.event.pageX + 20) + "px")
                        .style("top", (d3.event.pageY - 20) + "px");
                })
                .on("mouseout", function(d){
                    // get rid of the tooltip when mousing away
                    _tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
            ;

//            console.log(_svg);
        }

        _parallel.render = function() {
            _dispatch.metadata_load(_metadata);
            setsvgdim();
            _svg = rendersvg(_container);
            renderAxes();
            renderTooltip();
            renderBody();
//                d3.select('svg')
//                    .select('g')
//                    .selectAll(".dimension")
//                    .selectAll(".axis")
//                    .each(function(d){
//                        console.log(d3.select(this).data())
//                    })
//            ;
//
//            console.log(_svg);

        };

        _parallel.clearBrush = function(d3brushes){
            d3brushes.each(function(indicator){
                _y[indicator].brush.clear();
                d3.select(this).call( _y[indicator].brush );
                d3.select(this).call( brush );
            })
        };

        _parallel.clearHighlight = function(d3paths, d3points){
            d3paths.each(function(d){
                    d3.select(this).attr("class", function(d){
                        return d3.select(this).attr("class").search("unhighlight") >= 0 ?
                            d3.select(this).attr("class").replace("unhighlight", "highlight") :
                            d3.select(this).attr("class").replace("highlight", "unhighlight");
                    });
            });
            d3points.each(function(d){
                d3.select(this).attr("class", function(d){
                    return d3.select(this).attr("class").search("unhighlight") >= 0 ?
                        d3.select(this).attr("class").replace("unhighlight", "highlight") :
                        d3.select(this).attr("class").replace("highlight", "unhighlight");
                });
            });

           d3.selectAll(".parallel.tooltip.click").remove();
        };


        //setting data and metadata
        _parallel.data = function(_){
            if (!arguments.length) return _data;
            _data = _;
            return _parallel;
        };

        _parallel.datadb = function(_){
            if (!arguments.length) return _datadb;
            _datadb.insert(_);
            return _parallel;
        };

        _parallel.metadata = function(_){
            if (!arguments.length) return _metadata;
            _metadata = _;
            return _parallel;
        };

        _parallel.metadb = function(_){
            if (!arguments.length) return _metadb;
            _metadb.insert(_);
            return _parallel;
        };

        _parallel.default_path_color = function(_){
            if (!arguments.length) return _default_path_color;
            _default_path_color = _;
            return _parallel;
        };

        //setting dispatches
        _parallel.dispatch = function(_){
            if (!arguments.length) return _dispatch;
            _dispatch = _;

            //register the dispatch listeners.
            _dispatch.on("highlight", function(data){
                _highlight = data;
                _hcolor = setHighColors(data);
                _dispatch.legend_change(_highlight, _hcolor);
            });

            //tab navigation
            _dispatch.on("click_graph", function(){
                d3.selectAll(".parallel.tooltip").style("opacity", "0.9")
            });

            _dispatch.on("click_table", function(){
                d3.selectAll(".parallel.tooltip").style("opacity", "0")
            });

            return _parallel;
        };

        _parallel.debug = function(_){
            if(!arguments.length) return _debug_mode;
            _debug_mode = _;
            return _parallel;
        };

        return _parallel;

    };//END /Parallel/

    return { Parallel   : Parallel };
    //------------------- END PUBLIC METHODS ---------------------
})();
