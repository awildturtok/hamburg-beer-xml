<template>
    <div id="detail" class="row"   xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dbp="http://dbpedia.org/property/">
	<div v-bind:about="about">
	<div class="card-header title col-sm-12""  property="dc:title">{{imagetitle}}</div>
	<!-- <div class="artists col-sm-12"      
			v-for="artist in imageartists"
      			:key="artist.name"
      			v-bind="artist">
	</div>
	<div class="col-sm-1"><a @click="prev"><</a></div>
        <div class="imagecontainer col-sm-10">
		<img :src="images[Math.abs(currentNumber) % images.length]" />
        </div>
	<div class="col-sm-1"><a @click="next">></a></div>-->
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
import ssjs from './simplesparql.js';
var moment = require("moment");
var R = require("ramda");
var parseXml = require('xml2js').parseString;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getXDB(query, self){
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


async function provideData(self){
	//Init vars
	var type="";
	var title="";
	var artists=[];
	var location={};
	var description;
	var displayDate, earliestDate, latestDate;
	var urls =[];


	//var pathArray = window.location.pathname.split( '/' );
	//var inventoryNr = pathArray[pathArray.length-1];
 	var inventoryNr = "1971,2";

	//get info from XMLDB
	var xquery = "for $artifact in /artifacts/artifact where $artifact/location/inventoryNr/text()=\""+inventoryNr+"\" return ";
	
	title = getXDB(xquery+"<a>$artifact/title/text()</a>", self);
	
	type = getXDB(xquery+"<a>$artifact/type/text()</a>", self);
	//TODO get Type from DBpedia and use typeOf	

	var artistStr = getXDB(xquery+"<a>{$artifact/actors/actor/name/text()};;{$artifact/actors/actor/role/text()}</a>", self)
	// split artistStr per Line remove a /a and split by ;; 
	//artistsArray = artistStr.match(/[^\r\n]+/g);	
	//for(var k=0;k<artistsArray.length;k++){
	//	var tmpArr = artistsArray[k].replace("<a>", "").replace("</a>", "").split(";;");
	//	artists.push({name:tmpArr[0], role:tmpArr[1]}, res="#", roleRes="#");
	//}
	var locationStr = getXDB(xquery+"<a>{$artifact/location/name/text()};;{$artifact/location/inventoryNr/text()}</a>", self)
	//var locationArray = locationStr.match(/[^\r\n]+/g);	
	//for(var k=0;k<locationArray.length;k++){
	//	var tmpArr = locationArray[k].replace("<a>", "").replace("</a>", "").split(";;");

	//	location.push({name:tmpArr[0], inventoryNr:tmpArr[1]});
	//}
	
	description = getXDB(xquery+"<a>$artifact/description/text()</a>", self);
	displayDate = getXDB(xquery+"<a>$artifact/date/displayDate/text()</a>", self);
	earliestDate = getXDB(xquery+"<a>$artifact/date/earliestDate/text()</a>", self);
	latestDate = getXDB(xquery+"<a>$artifact/date/latestDate/text()</a>", self);
	var urlsStr = getXDB(xquery+"<a>$artifact/urls/url/text()</a>", self);
	//split URLs per Line	
	//urls = urlsStr.match(/[^\r\n]+/g);

	// Create SPARQL services for europeana and dbpedia
	var euroSparql = "http://sparql.europeana.eu";
	var dbpediaSparql = "http://dbpedia.org/sparql";

	//get about resource through title name
	var query = defaultQuery("SELECT ?s WHERE {?s dc:title  \""+title+"\"@de}", "http://data.europeana.eu/");
	query.select(euroSparql);
	while(!query.finished) {await sleep(100);}

	aboutRes="http://xml-beer.org/"+title.replace(/\W/g, '');
	var aboutIsRes=false;
	if(query.results.hasNext()){
		query.results.next();
		aboutRes = query.results.getFromIndex(0);

		aboutIsRes=true;
	}
	var aboutTriple="";
	for(var u=0;u<artists.length;u++){
		var artist = artists[u];
		if(aboutIsRes){
			aboutTriple = "<"+aboutRes+"> dc:creator \""+artist+"\". ";
		}
		query = defaultQuery("SELECT ?s WHERE {?s foaf:name  \""+artist+"\"@en. "+aboutTriple+"}", "http://data.europeana.eu/");
		query.select(euroSparql);
		while(!query.finished) {await sleep(100);}

		if(query.results.hasNext()){
			query.results.next();	
			// artist has a resource
			artists[u].res= query.results.getFromIndex(0);
		}

		//setItems(aboutRes, title, artists, displayDate, earliestDate, latestDate, description,);
		return {
		    about: aboutRes,
		    //images: urls,
		    imagetitle: title,
		    //imageartists: artists,
		    imageldate: ldate,
		    imageddate: ddate,
		    imageedate: edate, 
		    imagedescription: description,
		    imagelocation: location.name+"; "+location.inventoryNr
		  }
	}
}


export default {
	components: {Artist},
	  name: 'detail',
	  data:  () => { return {
            // todo events will be fetched via an API
            detail: [{
                imagetitle: "Loading",
                imagedescription: "... Please wait."
            }]
        };},
	  props: ["about", "imagetitle", "imagedescription", , "imageedate", "imageddate", "imagelocation", "imageldate"],
	created() {
        	this.fetchData();
    	},
	methods: {
        fetchData() {
            console.log("Loading Timeline");
            var self = this;
	    var dataDir = provideData(self);
	    return dataDir;
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
