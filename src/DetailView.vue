//TODO bootstrap - make divs as seen in sketch
//TODO xmlDB interface? get db data


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

<script src="simplesparql.js"></script>

<script>

//TODO get ID from paramter or whatever, get all info from xmlDB 

var title = "";
var artist = "";
var date = "";
var description = "";

//TODO Get additional Info from XMLDB
var additionalXML = [{ key: "place", text: 'Hamburg' },
	{ key: "size", text: '100cm' }];
var additional = [];


// Create SPARQL services for europeana and dbpedia
var euroSparql = "http://sparql.europeana.eu";
var dbpediaSparql = "http://dbpedia.org/sparql";

//get about resource through title name
var query = defaultQuery("SELECT ?s WHERE {?s dc:title  \""+title+"\"}", "http://data.europeana.eu/");
query.select(euroSparql);

var aboutTriple="", aboutRes="http://xml-beer.org/"+title.replace(/\W/g, '');
if(query.results.hasNext()){
	query.results.next();
	aboutRes = query.results.getFromIndex(0)[0];
	//TODO check if artist is really label (WTF?) or resource
	aboutTriple = "<"+aboutRes+"> dc:creator \""+artist+"\". ";
}

//get artist resource through title name
query = defaultQuery("SELECT ?s WHERE {?s foaf:name  \""+artist+"\". "+aboutTriple+"}", "http://data.europeana.eu/");
query.select(euroSparql);
if(query.results.hasNext()){
	query.results.next();
	// artist has a resource
	artist = "<a href=\""+query.results.getFromIndex(0)[0]+"\">"+artist+"</a>";
}

for (i = 0; i < additionalXML.length; i++) {	
	var key = additionalXML[i][0];
	var value = additionalXML[i][1];
	//get DBpedia Property from key
	query = defaultQuery("SELECT ?p WHERE {?p rdfs:label  \""+key+"\". ?p rdf:type rdf:Property}", "http://dbpedia.org");

	var res2;
	var resValue="http://xml-beer.org/resource/"+value.replace(/\W/g, ''), propKey;
	if(!query.results.hasNext()){
		propKey = "http://xml-beer.org/property/"+key.replace(/\W/g, '');

		//get DBpedia Resource from propKey and value
		var query2 =  defaultQuery("SELECT ?s WHERE {?s rdfs:label \""+value+"\"}", "http://dbpedia.org");
		res2 = query2.results;
	}
	else{
		query.results.next();
		propKey = query.results.getFromIndex(0)[0];
		//get DBpedia Resource from propKey and value
		//FIXME this can result into incorrect results
		var query2 =  defaultQuery("SELECT ?s WHERE {?s rdfs:label \""+value+"\". ?t <"+propKey+"> ?s}", "http://dbpedia.org");
		res2 = query2.results;
	}
	if(res2.hasNext()){
		res2.next();
		resValue = res2.getFromIndex(0)[0];
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
