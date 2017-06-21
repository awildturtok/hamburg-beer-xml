//TODO bootstrap
//TODO xmlDB interface? get db data
//TODO get correct properties from europeana

<template>
    <div id="detail" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dbp="http://dbpedia.org/property/">
        <h1>Detail</h1>
    
        <div class="image-container">
		<img v-bind:src="image">
        </div>
	<div class="image-info" v-bind:about="about">
		<div class="title" property="dc:title">{{image-title}}</div>
		<div class="artist" property="dc:creator">{{image-artist}}</div>, 
		<div class="date" property="dc:date">{{image-date}}</div>
		<div class="description" property="dc:description">{{image-description}}</div>
		<div class="additional"       
			v-for="item in additionalInfo"
      			v-bind:item="item"
      			v-bind:key="item.key">
		</div>
        </div>
    </div>
</template>

<script>

//TODO get ID from paramter or whatever, get all info from xmlDB 

var title = "";
var artist = "";
var date = "";
var description = "";

// Create SPARQL services for europeana and dbpedia
var euroSparql = new SPARQL.Service("http://sparql.europeana.eu");
var dbpediaSparql = new SPARQL.Service("http://dbpedia.org/sparql");

//set default graphs 
euroSparql.addDefaultGraph("http://data.europeana.eu/");
dbpediaSparql.addDefaultGraph("http://dbpedia.org");

//Set default prefixes
euroSparql.setPrefix("foaf", "http://xmlns.com/foaf/0.1/"); 
euroSparql.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
euroSparql.setPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#");
dbpediaSparql.setPrefix("foaf", "http://xmlns.com/foaf/0.1/"); 
dbpediaSparql.setPrefix("rdf", "http://www.w3.org/1999/02/22-rdf-syntax-ns#");
dbpediaSparql.setPrefix("rdfs", "http://www.w3.org/2000/01/rdf-schema#");

var query = euroSparql.createQuery();

//get about resource through title name
var aboutRes = query.selectSingleValue(
  "SELECT ?s WHERE {?s title  \""+title+"\"}",
  {failure: onFailure, success: function(value) {} }
); 
var aboutTriple="";
if(aboutRes.length < 1){
	aboutRes = "#";
}
else{
	aboutRes = aboutRes[0];
	aboutTriple = "?s creator <"+aboutRes+"> . ";
}

var artistRes = query.selectSingleValue(
  "SELECT ?s WHERE {?s artist  \""+artist+"\". "+aboutTriple+"}",
  {failure: onFailure, success: function(value) {} }
); 
if(artistRes.length >= 1){
	// artist has a resource
	artist = "<a href=\""+artistRes[0]+"\">"+artist+"</a>";
}

//TODO Get additional Info from XMLDB
var additionalXML = [{ key: "place", text: 'Hamburg' },
	{ key: "size", text: '100cm' }];
var additional = [];

var query = dbpediaSparql.createQuery();

for (i = 0; i < additionalXML.length; i++) {	
	var key = additionalXML[i][0];
	var value = additionalXML[i][1];
	//get DBpedia Property from key
	var propKey = query.selectSingleValue(
		"SELECT ?p WHERE {?p rdfs:label  \""+key+"\". ?p rdf:type rdf:Property}",
	 		{failure: onFailure, success: function(value) {} }
		); 
	//FIXME value to only alphanumeric
	var resValue="http://xml-beer.org/resource/"+value;
	if(propKey.length < 1){
		propKey = "http://xml-beer.org/property/"+key;

		//get DBpedia Resource from propKey and value
		resValue = query.selectSingleValue(
		"SELECT ?s WHERE {?s rdfs:label \""+value+"\"}",
	 		{failure: onFailure, success: function(value) {} }
		); 
        }
	else{
		propKey = propKey[0];
		//get DBpedia Resource from propKey and value
		//FIXME this can result into incorrect results
		resValue = query.selectSingleValue(
		"SELECT ?s WHERE {?s rdfs:label \""+value+"\". ?t <"+propKey+"> ?s}",
	 		{failure: onFailure, success: function(value) {} }
		); 
	}
	if(resValue.length < 1){
		resValue="http://xml-beer.org/resource/"+value;
	}
	else{
		resValue = resValue[0];
	}
	additional.push({key: propKey, text: value, res: resValue});
    	
} 


Vue.component('additional-item', {
  props: ['item'],
  template: '{{item.key}}:  <div property="{{item.key}}><a href="{{item.res}}">{{ item.text }}</a></div>'
})

var detail = new Vue({
  el: 'detail',
  data: {
    about: aboutRes,
    image-title: title,
    image-artist: artist,
    image-date: date, 
    image-description = description,
    additionalInfo: additional;
  }
})

</script>
