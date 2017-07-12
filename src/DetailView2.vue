<template>
	<div id="detail" class="card" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dbp="http://dbpedia.org/property/">
		<div v-bind:about="about.about" v-bind:typeof="about.t">
			<h1 class="card-header" property="dc:title">{{artifact.title}}
				<span :v-if="artifact.type && artifact.type.length > 0">({{artifact.type}})</span>
			</h1>
			<div id="artifacts-carousel" class="carousel slide" data-ride="carousel">
				<ol class="carousel-indicators">
					<li v-for="(url,index) in imgUrls" :key="url" data-target="#artifacts-carousel" :data-slide-to="index"></li>
	
				</ol>
				<div class="carousel-inner" role="listbox">
					<div v-for="(url,index) in imgUrls" :key="url" class="carousel-item" v-bind:class="{ active: index == 0 }">
						<img class="d-block img-fluid" src="#" :data-src="url" :src="url" :alt="artifact.title">
					</div>
				</div>
				<a class="carousel-control-prev" href="#artifacts-carousel" role="button" data-slide="prev">
					<span class="carousel-control-prev-icon" aria-hidden="true"></span>
					<span class="sr-only">Previous</span>
				</a>
				<a class="carousel-control-next" href="#artifacts-carousel" role="button" data-slide="next">
					<span class="carousel-control-next-icon" aria-hidden="true"></span>
					<span class="sr-only">Next</span>
				</a>
			</div>
			<div class="card-block">
				<div property="dc:description" v-html="artifact.description"></div>
	
				<div v-if="actors.length > 0" style="margin-top: 2em;">
					<h2>Beteiligte</h2>
					<table class="table table-striped table-sm">
						<thead>
							<tr>
								<th>Name</th>
								<th>Aufgabe</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="actor in actors" :key="actor">
								<td property="dc:artist" v-bind:src="actor.res">{{actor.name}}</td>
								<td>{{actor.role}}</td>
							</tr>
						</tbody>
					</table>
				</div>
			</div>
		</div>
	</div>
</template>


<script>

import simplesparql from "./simplesparql.js"
import Artist from "./Artist.vue";

var SparqlClient = require('sparql-client');
var util = require('util');
var parseXml = require('xml2js').parseString;

function defaultQuery(queryStr, defaultGraph) {
	var query = simplesparql.createQuery(queryStr);
	query.setDefaultGraph(defaultGraph);
	query.addPrefix("foaf", "http://xmlns.com/foaf/0.1/");
	query.addPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
	query.addPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
	query.addPrefix("dc", "http://purl.org/dc/elements/1.1/");
	return query;
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
var typeRes=null;
var artist=null;
var aboutRes=null;


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
			if (!this.artifact.urls || !this.artifact.urls.url) return [];

			if (!Array.isArray(this.artifact.urls.url))
				return [this.artifact.urls.url];

			return this.artifact.urls.url;
		},
		actors() {
			if (!this.artifact.actors || !this.artifact.actors.actor) return [];

			if (!Array.isArray(this.artifact.actor))
				return [this.artifact.actors.actor];

			return this.artifact.actors.actor;
		},
	},
	methods: {
		fetchRaw(query) {
			return this.$http.get("rest/beer/", {
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

			// Create SPARQL services for europeana and dbpedia
			// var resourceEndpoint = "http://sparql.europeana.eu";
			// var propertyEndpoint = "http://dbpedia.org/sparql";

			var resourceEndpoint = "/europeana";
			var propertyEndpoint = "/dbpedia";


			// // Create SPARQL services for europeana and dbpedia
			// var resourceEndpoint = "http://sparql.europeana.eu";
			// var propertyEndpoint = "http://dbpedia.org/sparql";

			var resourceGraph = "http://data.europeana.eu/"
			var propertyGraph = "http://dbpedia.org/resource/classes#"

			var baseURI = "http://hamburg-beer.xml/"

			// //get about resource through title name
			var query = "SELECT ?s FROM <"+resourceGraph+"> WHERE {?s dc:title  ?title FILTER(?title=\""+artifact.title+"\"^^xsd:string)}  LIMIT 1";
			
			//Initialize about url with own url (use if no resource could be found)
			var aboutRes = baseURI + artifact.title.replace(/\W/g, '');
			var aboutIsRes = false;
	
			var client = new SparqlClient(resourceEndpoint);
			client.query(query)
		 		.execute(function(error, results){
  				if(results!=null){
					if(results.results.bindings.length!=0){
						console.log("Could find about resource");
						aboutRes = results.results.bindings[0];
						aboutIsRes = true;
					}
				}
			});
	

			//Get creator by 
			var artistsArr={};

			for(var key in artifact.actors)			{
				if (artifact.actors.hasOwnProperty(key)) {
				var artist = artifact.actors[key];
				var aboutTriple="";
				console.log(artifact.actors);
				console.log(artist);
				artistsArr.name = artist.name;
			 	if(aboutIsRes){
			 		//use about Res to get creator (more confident than just by name"
			 		aboutTriple = "<"+aboutRes+"> dc:creator ?s. ";
			 	}
			 	query = "SELECT ?s FROM <"+resourceGraph+"> WHERE {?s foaf:name  \""+artist.name+"\"@en. "+aboutTriple+"} LIMIT 1";
			 	
				artist.res = baseURI + artist.name.replace(/\W/g, '');
				client = new SparqlClient(resourceEndpoint);
				client.query(query)
		 			.execute(function(error, results){
  						if(results!=null){
							if(results.results.bindings.length!=0){
								console.log("Artist resource found");
								artist.res = results.results.bindings[0];
							}
						}
					});
				}
			}
			console.log("D1");
			typeRes = baseURI + artifact.type;
			client = new SparqlClient(propertyEndpoint);
			query = "SELECT ?s FROM <"+propertyGraph+"> WHERE {?s rdfs:label \""+artifact.type+"\"@de; rdf:type owl:Class} LIMIT 1";
			console.log(typeRes);
			client.query(query)
				.execute(function(error, results, typeRes){		
  					if(results!=null){

						if(results.results.bindings.length!=0){
							console.log(results.results.bindings[0].s.value);
							typeRes=results.results.bindings[0].s.value;
						}

					}	
				});
			

			console.log("done!?");

			return {
				artifact: artifact,
				about: {about: aboutRes, t: typeRes}
			};
		},
	},
}




</script>
