<template>
    <section>
        <h1 class="heading">Ohne Alster kein Bier</h1>
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


export default {
    name: "timeline",
    created() {
        this.fetchData();
    },
    components: { Event },
    watch: {
        '$route': 'fetchData'
    },
    methods: {
        fetchRaw(query) {
            return this.$http.get("rest/beer/", {
                params: {
                    query: query
                },
                headers: {
                    // todo fetch credentials from somewhere
                    "Authorization": "Basic " + btoa("admin:admin"),
                    "Content-Type": "application/text"
                }
            }
                , err => console.error(err)
            ).then(r => r.text())
        },
        fetchData() {
            console.log("Loading Timeline");
            var self = this;

            this.fetchRaw(".")
                .then(obj => parseXmlAsync(obj, { explicitArray: false }))
                .then(root => root.artifacts)
                .then(artifacts => self.events = artifacts.artifact)
                ;
        }
    },

    data: () => {
        console.log("setting up timeline data");
        return {
            events: [{
                title: "Loading",
                description: "... Please wait."
            }]
        };
    }
}
</script>
