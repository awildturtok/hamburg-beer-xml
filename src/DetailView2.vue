<template>
    <div id="detail" class="row"   xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dbp="http://dbpedia.org/property/">
	<div v-bind:about="about">
	<div class="title col-sm-12""  property="dc:title">{{imagetitle}}</div>
	<div class="artists col-sm-12"      
			v-for="artist in imageartists"
      			:key="artist.name"
      			v-bind="artist">
	</div>
	<div class="col-sm-1"><a @click="prev"><</a></div>
        <div class="imagecontainer col-sm-10">
		<img :src="images[Math.abs(currentNumber) % images.length]" />
        </div>
	<div class="col-sm-1"><a @click="next">></a></div>
	<div class="imageinfo col-sm-12">
		<div class="description col-sm-7" property="dc:description">{{imagedescription}}</div>
		<div class="imagemeta col-sm-5"><!-- Use startDate, endDate isntead of date -->
			Earliest Date: <div class="date" property="dc:date">{{imageedate}}</div>
			Display Date: <div class="date" property="dc:date">{{imageddate}}</div>
			Latest Date: <div class="date" property="dc:date">{{imageldate}}</div>
			Location: <div class="location" property="">{{imagelocation}}</div>
		</div>
        </div>
	</div>	
    </div>
</template>

<script src="simplesparql.js"/>


<script>
import Artist from "./Artist.vue";


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getXDB(query){
    var xmlHttp = new XMLHttpRequest();
    var url = "localhost:8984/rest/beer?query=";

    xmlHttp.open("GET", url+query, false); 
    xmlHttp.send(null); 
    return xmlHttp.response;
}

async function provideData(){
	//Init vars
	var type="";
	var title="";
	var artists=[];
	var location={};
	var description;
	var displayDate, earliestDate, latestDate;
	var urls =[];


	var pathArray = window.location.pathname.split( '/' );
	var inventoryNr = pathArray[pathArray.length-1];
 	

	//get info from XMLDB
	var xquery = "for $artifact in /artifacts/artifact where $artifact/location/inventoryNr/text()="+title+" return ";
	title = getXDB(xquery+"$artifact/title/text()");
	type = getXDB(xquery+"$artifact/type/text()");
	//TODO get Type from DBpedia and use typeOf	

	artistStr = getXDB(xquery+"<a>{$artifact/actors/actor/name/text()};;{$artifact/actors/actor/role/text()}</a>")
	// split artistStr per Line remove a /a and split by ;; 
	artistsArray = artistStr.match(/[^\r\n]+/g);	
	for(var k=0;k<artistsArray.length;k++){
		var tmpArr = artistsArray[k].replace("<a>", "").replace("</a>", "").split(";;");
		artists.push({name:tmpArr[0], role:tmpArr[1]}, res="#", roleRes="#");
	}
	locationStr = getXDB(xquery+"<a>{$artifact/location/name/text()};;{$artifact/location/inventoryNr/text()}</a>")
	locationArray = locationStr.match(/[^\r\n]+/g);	
	for(var k=0;k<locationArray.length;k++){
		var tmpArr = locationArray[k].replace("<a>", "").replace("</a>", "").split(";;");

		location.push({name:tmpArr[0], inventoryNr:tmpArr[1]});
	}
	
	description = getXDB(xquery+"$artifact/description/text()");
	displayDate = getXDB(xquery+"$artifact/date/displayDate/text()");
	earliestDate = getXDB(xquery+"$artifact/date/earliestDate/text()");
	latestDate = getXDB(xquery+"$artifact/date/latestDate/text()");
	urlsStr = getXDB(xquery+"$artifact/urls/url/text()");
	//split URLs per Line	
	urls = urlsStr.match(/[^\r\n]+/g);

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
		    images: urls,
		    imagetitle: title,
		    imageartists: artists,
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
	  data: provideData,
	ready: function () {
	        this.startRotation();
    	  },

    	  methods: {
        	startRotation: function() {
        	    this.timer = setInterval(this.next, 3000);
        	},
		next: function() {
      		      this.currentNumber += 1
      		},
        	prev: function() {
        	    this.currentNumber -= 1
        	}
    	  }
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
