<template>
    <div id="detail" xmlns:dc="http://purl.org/dc/elements/1.1/">
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

<!--TODO use SPARQL to get info for object --> 

<!--TODO set v-infos with links if returned object is Resource --> 

Vue.component('additional-item', {
  props: ['item'],
<!--TODO set property --> 
  template: '{{item.key}} : {{ item.text }}'
})

var image-additional = new Vue({
  el: 'image-info',
  data: {
    additionalInfo: [
      { key: "dbpedia:place", text: 'dbpedia:Hamburg' },
    ]
  }
})

</script>
