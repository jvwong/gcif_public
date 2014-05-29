/*
 * gcif.chord.js
 * chord chart
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif*/

gcif.chord = (function () {

    var
    Chord = function( d3container ) {

        var _chord = {};

        var
          _container = d3container
        , _svg

        , _margin = { top: 15, right: 5, bottom: 5, left: 5 }
        , _min_width = 300
        , _min_height = 200
        , _width
        , _height

        , _padding = 0.05


        , _color
        , _data = []

        , _tooltip
        , _dispatch
        ;


        /* sets the svg dimensions based upon the current browser window */
        function setsvgdim(){
            var
              verticalScaling = 0.60
            , horizontalScaling = 0.75
            ;

            _width = d3.max([$( window ).width() * horizontalScaling - _margin.left - _margin.right, _min_width]);
            _height = d3.max([$( window ).height() * verticalScaling - _margin.top - _margin.bottom, _min_height]);

        }

        function renderTooltip(){

            d3.select(".tooltip").remove();

            _tooltip = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
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
                            .attr({ class: "body"
                                , transform: "translate(" + (_width + _margin.left + _margin.right) / 2
                                      + "," + (_height + _margin.top + _margin.bottom)  / 2 + ")" })
            ;
        }

        function renderAxes(){
        }


        function renderBody(){
            var chord = d3.layout.chord()
                .padding(_padding)
                .sortSubgroups(d3.descending)
                .matrix(_data);


//            console.log(chord.chords());
//            console.log(chord.groups());

            var   innerRadius = Math.min(_width, _height) * .41
                , outerRadius = innerRadius * 1.1
                ;

            var fill = d3.scale.ordinal()
                .domain(d3.range(4))
                .range(["#000000", "#FFDD89", "#957244", "#F26223"]);

            _svg.append("g").selectAll("path")
                .data(chord.groups)
                .enter().append("path")
                .style("fill", function(d) { return fill(d.index); })
                .style("stroke", function(d) { return fill(d.index); })
                .attr("d", d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius))
                .on("mouseover", fade(.1))
                .on("mouseout", fade(1));

            var ticks = _svg.append("g").selectAll("g")
                .data(chord.groups)
                .enter().append("g").selectAll("g")
                .data(groupTicks)
                .enter().append("g")
                .attr("transform", function(d) {
                    return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
                        + "translate(" + outerRadius + ",0)";
                });

            ticks.append("line")
                .attr("x1", 1)
                .attr("y1", 0)
                .attr("x2", 5)
                .attr("y2", 0)
                .style("stroke", "#000");

            ticks.append("text")
                .attr("x", 8)
                .attr("dy", ".35em")
                .attr("transform", function(d) { return d.angle > Math.PI ? "rotate(180)translate(-16)" : null; })
                .style("text-anchor", function(d) { return d.angle > Math.PI ? "end" : null; })
                .text(function(d) { return d.label; });

            _svg.append("g")
                .attr("class", "chord")
                .selectAll("path")
                .data(chord.chords)
                .enter().append("path")
                .attr("d", d3.svg.chord().radius(innerRadius))
                .style("fill", function(d) { return fill(d.target.index); })
                .style("opacity", 1);

            // Returns an array of tick angles and labels, given a group.
            function groupTicks(d) {
                var k = (d.endAngle - d.startAngle) / d.value;
                return d3.range(0, d.value, 1000).map(function(v, i) {
                    return {
                        angle: v * k + d.startAngle,
                        label: i % 5 ? null : v / 1000 + "k"
                    };
                });
            }

            // Returns an event handler for fading a given chord group.
            function fade(opacity) {
                return function(g, i) {
                    _svg.selectAll(".chord path")
                        .filter(function(d) { return d.source.index != i && d.target.index != i; })
                        .transition()
                        .style("opacity", opacity);
                };
            }
        }

        _chord.render = function() {
            setsvgdim();
            _svg = rendersvg(_container);
            renderAxes();
            renderTooltip();
            renderBody();
        };

        _chord.data = function(_){
            if (!arguments.length) return _data;
            _data = _;
            return _chord;
        };

        _chord.dispatch = function(_){
            if (!arguments.length) return _dispatch;
            _dispatch = _;
            return _chord;
        };

        _chord.color = function(_){
            if (!arguments.length) return _color;
            _color = _;
            return _chord;
        };

        return _chord;

    };//END /Parallel/

    return { Chord   : Chord };
    //------------------- END PUBLIC METHODS ---------------------
})();

