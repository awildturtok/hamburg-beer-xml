function parseJsonResponse(jsonStr) {
    //create Object which contains table and mapping to variables 
    var results = {
        table: [],
        tableByVars: [],
        vars: [],
        index: -1,
        getFromIndex: function (i) {
            //return object in column i at current row 
            var row = this.table[this.index];
            return row[i];
        },
        getFromVarName: function (varName) {
            //get index for varName
            // todo kannst hier eine memoization hinzufügen, dass du das nicht jedes mal neu suchen musst. Alternativ kannst du das Objekt auch direkt bauen.
            var i = this.vars.indexOf(varName);
            return this.getFromIndex(i);
        },
        get: function () {
            //return complete current row
            return this.table[this.index];
        },
        hasNext: function () {
            //check if table has another rows
            return this.index + 1 < this.table.length;
        },
        reset: function () {
            //reset index
            this.index = -1;
        },
        next: function () {
            this.index++;
        }

    }

    var obj = JSON.parse(jsonStr);

    //map results and vars to results
    results.vars = obj.head.vars;

    var tmp = obj.results.bindings;

    // results.tableByVars = obj.results.bindings
    //     .map(row => results.vars.reduce((out, name) => {
    //         out[name] = row[name].value;
    //         return out;
    //     }, {}));

    // console.log(results.tableByVars);


    for (var j = 0; j < tmp.length; j++) {
        var row = [];
        for (var i = 0; i < results.vars.length; i++) {
            row.push(tmp[j][results.vars[i]].value);
        }
        results.table.push(row);
    }

    return results;
}

//props to stackoverflow https://stackoverflow.com/questions/247483/http-get-request-in-javascript#4033310
function httpGetAsync(url, query, callback) {
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText, query);
    }

    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Content-Type', 'application/sparql-results+json')
    xmlHttp.send(null);
}

export default {
    createQuery(queryStr2) {
        var query = {
            queryStr: queryStr2,
            defaultGraph: "",
            prefixes: [],
            results: null,
            finished: false,
            addPrefix: function (prefixStr, url) {
                this.prefixes.push({
                    prefix: prefixStr,
                    url: url
                });
            },
            setDefaultGraph: function (graph) {
                this.defaultGraph = graph;
            },
            addPrefixes: function () {
                return this.prefixes.map(prefix => "PREFIX " + prefix.prefix + ": <" + prefix.url + "> ")
                    .join(" ") +
                    this.queryStr;
            },
            createURL: function (service, newQueryStr) {
                var url = service + "?";
                if (!this.defaultGraph.length == 0) {
                    url += "default-graph-uri=" + encodeURIComponent(this.defaultGraph) + "&";
                }
                url += "query=";
                //encode newQueryStr
                url += encodeURIComponent(newQueryStr);
                url += "&format=json";
                return url;
            },
            select: function (service, callback = false) {
                //add prefixes to query
                var newQueryStr = this.addPrefixes();
                //create URL
                var url = this.createURL(service, newQueryStr);
                var ret;
                var cb = callback;
                // todo daraus kannst du auch ein Promise machen, was du raus gibst.
                httpGetAsync(url, this, (response, query) => {
                    var jsonResponse = response;
                    query.results = parseJsonResponse(jsonResponse);

                    query.finished = true;

                    if (!!cb)
                        cb(query.results);
                });

            },
            ask: function (service) {
                var newQueryStr = this.addPrefixes();
                //create URL
                var url = this.createURL(service, newQueryStr);
                httpGetAsync(url, this, (response, query) => {
                    var jsonResponse = response;
                    var obj = JSON.parse(jsonResponse);
                    query.results = obj.boolean;
                    query.finished = true;
                });
                //parse results

            }
        }
        return query;
    }
}



console.log("finished loading sparql");