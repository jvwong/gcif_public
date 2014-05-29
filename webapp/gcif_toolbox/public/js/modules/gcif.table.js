/*
 * gcif.table.js
 * table chart
 */

/*jslint           browser : true,   continue : true,
 devel  : true,    indent : 2,       maxerr  : 50,
 newcap : true,     nomen : true,   plusplus : true,
 regexp : true,    sloppy : true,       vars : false,
 white  : true
 */
/*global $, d3, gcif*/

gcif.table = (function () {

    var
    Table = function(d3container){

        var _list = {};

        var   _data = []
            , _metadb = TAFFY()
            , _metadata = []

            , _container = d3container
            , _table
            , _thead
            , _tbody

            , _colors = ["#1f77b4", "#ff7f0e", "#ffbb78", "#2ca02c", "#d62728",
                         "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2",
                         "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#17becf",
                         "#9edae5", "#e7969c", "#7b4173", "#a55194", "#637939"]
            , _tcolor = d3.scale.ordinal()
            ;


        function renderHead(table) {

            _thead = table.append("thead").append("tr");
            _thead.append("th")
                .attr("class", "header")
                .text("City")
            ;

            _thead.selectAll(".field")
                .data(_metadata)
                .enter()
                .append("th")
                .attr("class", "header")
                .append("font")
                .attr("color", function(d){
                    return _tcolor(_metadb({indicator: d}).select("theme"));
                })
                .text(function(d){
                    return d;
                })
            ;
        }

        function renderBody(table) {

            var row
                , rowEnter
                ;

            _tbody = table.append("tbody");


            //append a <tr class="city") for each city
            row = _tbody.selectAll(".datarow")
                .data(_data, function(d) {
                    return d["_id"];
                })
            ;

            rowEnter = row.enter()
                .append("tr")
                .attr("class", "datarow")
            ;

            rowEnter.append("td")
                .attr("class", "indicator")
                .text(function(d){ return d["CityName"]})
            ;

            _metadata.forEach(function(p){
                rowEnter.append("td")
                    .attr("class", "indicator")
                    .text(function(d){
                        return d[p]
                    })
                ;
            });

            row.exit().remove();

//            console.log(_data);


        }

        // PUBLIC methods
        _list.render = function () {
            if (!_table) {
                _table = _container.append("table")
                    .attr("class", "table table-hover table-striped")
                ;
            } else {
                _table.html("");
            }
            renderHead(_table);
            renderBody(_table);
        };

        _list.data = function(_) {
            if (!arguments.length) return _data;
            _data = _;
            return _list;
        };

        _list.metadb = function(_){
            if (!arguments.length) return _metadb();
            _metadb.insert(_);
            // set the theme indicator colors
            var t = _metadb().distinct("theme");
            _tcolor.domain(t)
                .range(_colors.slice(0,t.length));
            return _list;
        };

        _list.metadata = function(_) {
            if (!arguments.length) return _metadata;
            _metadata = _;
            return _list;
        };

        return _list;
    };

    return { Table   : Table };
    //------------------- END PUBLIC METHODS ---------------------
})();