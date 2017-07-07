<template>
	<div id="detail" class="card" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dbp="http://dbpedia.org/property/">
		<div v-bind:about="about">
			<h1 class="card-title" property="dc:title">{{artifact.title}}</h1>
			<div class="card-block" property="dc:description" v-html="artifact.description">
			</div>
			<div class="images">
				<img class="card-img-bottom" v-for="url in imgUrls" :src="url" :key="url"></img>
			</div>
		</div>
	</div>
</template>


<script>
console.log("detail view included.");

import simplesparql from "./simplesparql.js"
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



export default {
	name: 'detail',
	created() {
		console.log("Starting to fetch");
		this.fetchData();
	},
	components: { Artist },
	watch: {
		'$route': 'fetchData'
	},
	data: () => {
		return {
			artifact: {
				imagetitle: "Loading",
				imagedescription: "... Please wait.",
				imageedate: "",
				imagelocation: ""
			}, about: {}

		};
	},
	computed: {
		imgUrls() {
            if(!this.artifact.urls || !this.artifact.urls.url) return [];

            if(!Array.isArray(this.artifact.urls.url))
                return [this.artifact.urls.url];
            
            return this.artifact.urls.url;
        },
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
			var inventoryNr = this.$route.params.id;
			console.log("Trying to fetch " + inventoryNr);


			this.fetchRaw("//artifact[location/inventoryNr = \"" + inventoryNr + "\"]")
				.then(obj => parseXmlAsync(obj, { explicitArray: false }))
				.then(response => response.artifact)
				.then(root => self.provideData(root))
				.then(obj => { console.log(obj); return obj; })
				.then(obj => {
					self.artifact = obj.artifact;
					self.about = obj.about;
				});

		},
		provideData(artifact) {

			// // Create SPARQL services for europeana and dbpedia
			// var resourceEndpoint = "http://sparql.europeana.eu";
			// var propertyEndpoint = "http://dbpedia.org/sparql";

			// var resourceGraph = "http://data.europeana.eu/"
			// var propertyGraph = "http://dbpedia.org"

			// var baseURI = "http://hamburg-beer.xml/"

			// //get about resource through title name
			// var query = defaultQuery("SELECT ?s WHERE {?s dc:title  \""+artifact.title+"\"@de}", resourceGraph);

			// console.log(query.queryStr);
			// query.select(resourceEndpoint);

			// //Wait for results 
			// console.log("D1");
			// while(!query.finished) {await sleep(100);}
			// console.log("D2");
			// //Initialize about url with own url (use if no resource could be found)
			// var aboutRes = baseURI + title.replace(/\W/g, '');
			// var aboutIsRes = false;
			// if(query.results !=null && query.results.hasNext()){
			// 	query.results.next();
			// 	aboutRes = query.results.getFromIndex(0);
			// 	//Set about Res could be found
			// 	aboutIsRes=true;
			// }

			// //Get creator by 
			// var artistsArr={};

			// for(var artist of artifact.actors.actor)
			// {
			//     var aboutTriple="";
			// 	artistsArr.name = artist.name;
			// 	if(aboutIsRes){
			// 		//use about Res to get creator (more confident than just by name"
			// 		aboutTriple = "<"+aboutRes+"> dc:creator ?s. ";
			// 	}
			// 	query = defaultQuery("SELECT ?s WHERE {?s foaf:name  \""+artist.name+"\"@en. "+aboutTriple+"}", resourceGraph);
			// 	query.select(resourceEndpoint);
			// 	//Wait for results 
			// 	console.log("D3");
			// 	while(!query.finished) {await sleep(100);}
			// 	console.log("D4");
			// 	if(query.results !=null && query.results.hasNext()){
			// 		query.results.next();	
			// 		// artist has a resource
			// 		artistsArr.res = query.results.getFromIndex(0);
			// 	}
			// }

			//setItems(aboutRes, title, artists, displayDate, earliestDate, latestDate, description,);

			return {
				artifact: artifact,
				about: {},
			};
		}
	},
}

function defaultQuery(queryStr, defaultGraph) {
	var query = createQuery(queryStr);
	query.setDefaultGraph(defaultGraph);
	query.addPrefix("foaf", "http://xmlns.com/foaf/0.1/");
	query.addPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	query.addPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
	query.addPrefix("dc", "http://purl.org/dc/elements/1.1/");
	return query;
}


</script>
