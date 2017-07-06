<template>
    <div id="detail" class=""   xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dbp="http://dbpedia.org/property/">
	<div v-bind:about="about">
	<div class="card-header title col-sm-12"  property="dc:title">{{imagetitle}}</div>
	<!-- <div class="artists col-sm-12"      
			v-for="artist in imageartists"
      			:key="artist.name"
      			v-bind="artist">
	</div>
        <div class="imagecontainer col-sm-10">
		<img :src="images.url" />
        </div>-->
	<div class="imageinfo col-sm-12">
		<span class="description col-sm-7" property="dc:description">{{imagedescription}}</span></br></br>
		<span class="imagemeta col-sm-5"><!-- Use startDate, endDate isntead of date --></hr>
			<div><b>Earliest Date:</b> <span class="date" property="dc:date">{{imageedate}}</span></div>
			<div><b>Display Date:</b> <span class="date" property="dc:date">{{imageddate}}</span></div>
			<div><b>Latest Date:</b> <span class="date" property="dc:date">{{imageldate}}</span></div>
			<div><b>Location:</b> <span class="location" property="">{{imagelocation}}</span></div>
		</span>
        </div>
	</div>	
    </div>
</template>

<script src="simplesparql.js"> </script>


<script>
import Artist from "./Artist.vue";

var parseXml = require('xml2js').parseString;


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
            for(var i=0;i<this.prefixes.length;i++){
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
    if (xmlHttp.readyState == 4)
	if(xmlHttp.status == 200){
        	callback(xmlHttp.responseText, query);
	}	
	else{
		//TODO check why it does not work! (same problem as reverse Proxy? it works with simple html files)
		console.log("Error in executing query");
		query.finished=true;
	}
    }

    xmlHttp.open("GET", url, true); // true for asynchronous 
    xmlHttp.setRequestHeader('Content-Type', 'application/sparql-results+json')
	console.log(url);
    xmlHttp.send(null);
}


// Basic wrapper for xml parser library to have it as a promise and leverage its API.
var parseXmlAsync = (text, options = { async: true }) =>
    new Promise((resolve, reject) =>
        parseXml(text, options
            , (error, value) => {
                if (error)
                    reject(error);
                else
                    resolve(value);			    
            })
    )


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function fetchRaw(query, self){
    return self.$http.get("/api/rest/beer/", {
                params: {
                    query: query
                },
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin"), //todo fetch credentials from somewhere.
                    "Content-Type": "application/text"
                }
            }
                , err => console.error(err)
            ).then(r => r.text())
}


async function provideData(artifact, self){
	//Init vars
	var type="";
	var title="";
	var artists=[];
	var location="";
	var description;
	var displayDate, earliestDate, latestDate;
	var urls =[];


	//Set native vars
	type = artifact.type;
	title = artifact.title;
	description = artifact.description;
	displayDate = artifact.dates.displayDate;
	earliestDate = artifact.dates.displayDate;
	latestDate = artifact.dates.displayDate;
	location = artifact.location.name;
	urls = artifact.urls;
	artists = artifact.actors;	

	// Create SPARQL services for europeana and dbpedia
	var resourceEndpoint = "http://sparql.europeana.eu";
	var propertyEndpoint = "http://dbpedia.org/sparql";

	var resourceGraph = "http://data.europeana.eu/"
	var propertyGraph = "http://dbpedia.org"

	var baseURI = "http://hamburg-beer.xml/"

	//get about resource through title name
	var query = defaultQuery("SELECT ?s WHERE {?s dc:title  \""+title+"\"@de}", resourceGraph);
	console.log(query.queryStr);
	query.select(resourceEndpoint);

	//Wait for results 
	console.log("D1");
	while(!query.finished) {await sleep(100);}
	console.log("D2");
	//Initialize about url with own url (use if no resource could be found)
	var aboutRes=baseURI+title.replace(/\W/g, '');
	var aboutIsRes=false;
	if(query.results !=null && query.results.hasNext()){
		query.results.next();
		aboutRes = query.results.getFromIndex(0);
		//Set about Res could be found
		aboutIsRes=true;
	}

	var aboutTriple="";
	//Get creator by 
	var artistsArr={};
	console.log(artists);
	for(var u=0;u<1;u++){
		var artist = artists.actor;
		artistsArr.name = artist.name;
		if(aboutIsRes){
			//use about Res to get creator (more confident than just by name"
			aboutTriple = "<"+aboutRes+"> dc:creator ?s. ";
		}
		query = defaultQuery("SELECT ?s WHERE {?s foaf:name  \""+artist.name+"\"@en. "+aboutTriple+"}", resourceGraph);
		query.select(resourceEndpoint);
		//Wait for results 
		console.log("D3");
		while(!query.finished) {await sleep(100);}
		console.log("D4");
		if(query.results !=null && query.results.hasNext()){
			query.results.next();	
			// artist has a resource
			artistsArr.res= query.results.getFromIndex(0);
		}
	}

		//setItems(aboutRes, title, artists, displayDate, earliestDate, latestDate, description,);
		var ret = {
		    about: aboutRes,
		    images: urls,
		    imagetitle: title,
		    imageartists: artistsArr,
		    imageldate: latestDate,
		    imageddate: displayDate,
		    imageedate: earliestDate, 
		    imagedescription: description,
		    imagelocation: location
		  };
		self.detail = ret;
		return ret;
	
}


export default {
	components: {Artist},
	  name: 'detail',
	  data:  () => { return {
            // todo events will be fetched via an API
            detail: [{
                imagetitle: "Loading",
                imagedescription: "... Please wait.",
		imageedate: "",
		imageldate: "",
		imageddate: "",  
		imagelocation: ""          
		}]
        };},
	watch: {
 	       '$route': 'fetchData'
	},
	props: ["about", "imagetitle", "imagedescription", , "imageedate", "imageddate", "imagelocation", "imageldate"],
	created() {
        	this.fetchData();
    	},
	methods: {
	fetchRaw(query) {
            return this.$http.get("/api/rest/beer/", {
                params: {
                    query: query
                },
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin"), //todo fetch credentials from somewhere.
                    "Content-Type": "application/text"
                }
            }
                , err => console.error(err)
            ).then(r => r.text())
        },
        fetchData() {
            var self = this;
 	    //TODO inventoryNr by url
	    var inventoryNr = "1971,2";

	    //get info from BaseX
            var xquery = "for $artifact in /artifacts/artifact where $artifact/location/inventoryNr/text()=\""+inventoryNr+"\" return $artifact";
	    //convert xml into JSON Dictionary
	    var artifact = new Object();
	    //TODO wait for provideData
	    this.fetchRaw(xquery).then(obj => parseXmlAsync(obj, { explicitArray: false }))
		.then(root => { artifact = root.artifact; self.detail = provideData(artifact, self); });
	    
        }
    },
}
	
function defaultQuery(queryStr, defaultGraph){
	var query = createQuery(queryStr);
	query.setDefaultGraph(defaultGraph);
	query.addPrefix("foaf", "http://xmlns.com/foaf/0.1/");
	query.addPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	query.addPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
	query.addPrefix("dc", "http://purl.org/dc/elements/1.1/");
	return query;
}


</script>
