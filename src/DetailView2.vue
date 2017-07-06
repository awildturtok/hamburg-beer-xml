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
        </div>
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


async function provideData(artifact){
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
	query.select(resourceEndpoint);

	//Wait for results 
	while(!query.finished) {await sleep(100);}
	//Initialize about url with own url (use if no resource could be found)
	aboutRes=baseURI+title.replace(/\W/g, '');
	var aboutIsRes=false;
	if(query.results.hasNext()){
		query.results.next();
		aboutRes = query.results.getFromIndex(0);
		//Set about Res could be found
		aboutIsRes=true;
	}

	var aboutTriple="";
	//Get creator by 
	for(var u=0;u<artists.length;u++){
		var artist = artists[u];
		if(aboutIsRes){
			//use about Res to get creator (more confident than just by name"
			aboutTriple = "<"+aboutRes+"> dc:creator ?s. ";
		}
		query = defaultQuery("SELECT ?s WHERE {?s foaf:name  \""+artist+"\"@en. "+aboutTriple+"}", resourceGraph);
		query.select(resourceEndpoint);
		//Wait for results 
		while(!query.finished) {await sleep(100);}

		if(query.results.hasNext()){
			query.results.next();	
			// artist has a resource
			artists[u].res= query.results.getFromIndex(0);
		}

		//setItems(aboutRes, title, artists, displayDate, earliestDate, latestDate, description,);
		return {
		    "about": aboutRes,
		    "images": urls,
		    "imagetitle": title,
		    "imageartists": artists,
		    "imageldate": ldate,
		    "imageddate": ddate,
		    "imageedate": edate, 
		    "imagedescription": description,
		    "imagelocation": location
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
	    //TODO artifact will not be written
	    this.fetchRaw(xquery).then(obj => parseXmlAsync(obj, { explicitArray: false }))
		.then(root => { artifact = root.artifact; self.detail = provideData(artifact);});
	    
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
