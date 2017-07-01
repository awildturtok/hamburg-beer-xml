function createQuery(queryStr2) {
     var query = {
        queryStr: queryStr2,
	defaultGraph:"",
        prefixes: [],    
	results:null,
	finished:false,
        addPrefix: function(prefixStr, url){
            var prefix = [prefixStr, url]
            this.prefixes.push(prefix);
        },
        setDefaultGraph: function(graph){
            this.defaultGraph = graph;
        },
        addPrefixes: function() {
            var newQueryStr = "";
            for(i=0;i<this.prefixes.length;i++){
                newQueryStr+="PREFIX "+this.prefixes[i][0]+": <"+this.prefixes[i][1]+"> ";
            }
            newQueryStr +=" "+this.queryStr;
            return newQueryStr;
        },
        createURL: function(service, newQueryStr){
            var url = service+"?";
            if(this.defaultG!=""){
                url+="default-graph-uri="+encodeURIComponent(this.defaultGraph)+"&";
            }
            url+="query=";
            //encode newQueryStr
            url+=encodeURIComponent(newQueryStr);
            url+="&format=json";
            return url;
        },   
        select: function(service){
            //add prefixes to query
            var newQueryStr = this.addPrefixes();
            //create URL
            var url = this.createURL(service, newQueryStr);
	    var ret;
            httpGetAsync(url, this, function(response, query){
		var jsonResponse = response;
		query.results = parseJsonResponse(jsonResponse);
		query.finished = true;
	    });
            
        },
        ask : function(service){
            var newQueryStr = this.addPrefixes();
            //create URL
            var url = this.createURL(service, newQueryStr);
            httpGetAsync(url, this, function(response, query){
                var jsonResponse = response;
		var obj  = JSON.parse(jsonResponse);
           	query.results = obj.boolean;
		query.finished = true;
            });
            //parse results
            
        }
    }
    return query;
}

function parseJsonResponse(jsonStr){
    
    var obj = JSON.parse(jsonStr);
    //create Object which contains table and mapping to variables 
    var results = {
        table:[],
        vars:[],
        index:-1,
        getFromIndex: function(i){
            //return object in column i at current row 
            var row =  this.table[this.index];
            return row[i];
        },
        getFromVarName: function(varName){
            //get index for varName
            var i = this.vars.indexOf(varName);
            return this.getFromIndex(i);
        },
        get: function(){
            //return complete current row
            return this.table[this.index];
        },
        hasNext: function(){
            //check if table has another rows
            if(this.index+1 < this.table.length){
                return true;
            }
            return false;
        },
        reset: function(){
            //reset index
            this.index=-1;
        },
        next: function(){
            this.index++;
        }

    }
    //map results and vars to results
    results.vars = obj.head.vars;

    var tmp = obj.results.bindings;


    for(j=0;j<tmp.length;j++){
        var row=[];
        for(i=0;i<results.vars.length;i++){
            row.push(tmp[j][results.vars[i]].value);
        }
        results.table.push(row);
    }    
    return results;
}

//props to stackoverflow https://stackoverflow.com/questions/247483/http-get-request-in-javascript#4033310
function httpGetAsync(url, query, callback)
{
    var xmlHttp = new XMLHttpRequest();

    xmlHttp.onreadystatechange = function() { 
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
        callback(xmlHttp.responseText, query);
    }

    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Content-Type', 'application/sparql-results+json')
    xmlHttp.send(null);
}


