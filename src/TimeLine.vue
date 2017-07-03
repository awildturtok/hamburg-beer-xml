<template>
    <section>
        <h1>Hio</h1>
    
        <div id="timeline">
    
            <div class="events">
                <event v-for="event in events" :key="event.id" v-bind="event"></event>
            </div>
        </div>
    </section>
</template>

<script>
import Event from "./Event.vue";

var moment = require("moment");
var R = require("ramda");


export default {
    name: "timeline",
    created() {
        console.log("Loading Timeline");
        var self = this;

        this.fetchRaw("//artifacts") // erzeugt array von 1 - c 
            .then(xml => (new DOMParser()).parseFromString(xml, "text/xml"))
            .then(c => { console.log(c); return c; })
            ;
        // this.fetchData();
    },
    components: { Event },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        // get ids: http://admin:admin@localhost:8984/rest/beer/?query=//artifact/location/inventoryNr/text()
        // count artifacts: http://admin:admin@localhost:8984/rest/beer/?query=count(//artifact)&method=json"
        fetchRaw(query) {
            return this.$http.get("/api/rest/beer/", {
                params: {
                    query: query
                },
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin"),
                    "Content-Type": "application/text"
                }
            }
                , err => console.error(err)
            ).then(r => r.text())
        },

        fetch(query) {
            return this.$http.get("/api/rest/beer/", {
                params: {
                    method: "json",
                    query: query
                },
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin"),
                    // "Content-Type" : "application/json"
                }
            }
                , err => console.error(err)
            )
                .then(value => value.json())
        },

        fetchData() {
            console.log("fetching");
            this.$http.get("/api/rest/beer/clean.xml", {
                params: {
                    method: "json"
                },
                headers: {
                    "Authorization": "Basic " + btoa("admin:admin"),
                    // "Content-Type" : "application/json"
                }
            }
                , err => console.error(err)
            )
                .then(value => value.json())
        }
    },

    data: () => {
        console.log("setting up timeline data");
        return {
            // todo events will be fetched via an API
            events: [{
                title: "a title",
                description: "Did you know!?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }, {
                title: "a title too",
                date: moment(),
                image: "https://vuejs.org/images/logo.png",
                description: "this seems ridiculous, why would <b>I</b> care?"
            }]
        };
    }
}
</script>
