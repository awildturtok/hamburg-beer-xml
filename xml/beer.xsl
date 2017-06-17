<?xml version="1.0" encoding="UTF-8"?>
<xs:stylesheet version="1.0"
xmlns:xs="http://www.w3.org/1999/XSL/Transform"
xmlns:lido="http://www.lido-schema.org">

    <xs:output omit-xml-declaration="yes" indent="yes"/>
    <xs:template match="text()|@*">
        <xs:apply-templates/>
    </xs:template>

    <xs:template match="/">
        <artifacts>
            <xs:apply-templates />
        </artifacts>
    </xs:template>

    <xs:template match="lido:lido">
        <artifact>
            <xs:apply-templates />
        </artifact>
    </xs:template>

    <xs:template match="lido:descriptiveMetadata/lido:objectClassificationWrap/lido:objectWorkTypeWrap/lido:objectWorkType[@lido:type = 'Objektbezeichnung']">
        <type><xs:value-of select="normalize-space(lido:term)" /></type>
    </xs:template>

    <xs:template match="lido:descriptiveMetadata/lido:objectIdentificationWrap">
        <xs:apply-templates/>
    </xs:template>

    <xs:template match="lido:titleWrap/lido:titleSet">
        <title><xs:value-of select="normalize-space()" /></title>
    </xs:template>

    <xs:template match="lido:repositoryWrap/lido:repositorySet[@lido:type = 'current']">
        <location>
            <xs:apply-templates/>
        </location>
    </xs:template>

    <xs:template match="lido:repositoryName/lido:legalBodyName">
        <name><xs:value-of select="normalize-space()" /></name>
    </xs:template>

    <xs:template match="lido:workID[@lido:type = 'Inventarnummer']">
        <inventoryNr><xs:value-of select="normalize-space()" /></inventoryNr>
    </xs:template>

    <xs:template match="lido:objectDescriptionWrap/lido:objectDescriptionSet[@lido:type = 'Beschreibung Veröffentlichung']">
        <description><xs:value-of select="normalize-space()" /></description>
    </xs:template>

    <xs:template match="lido:eventWrap/lido:eventSet/lido:event">
        <actors>
            <xs:for-each select="lido:eventActor">
                <actor>
                   <name><xs:value-of select="normalize-space(lido:actorInRole/lido:actor/lido:nameActorSet/lido:appellationValue)"/></name> 
                   <role><xs:value-of select="normalize-space(lido:actorInRole/lido:roleActor/lido:term)"/></role> 
                </actor>
            </xs:for-each>
        </actors>
        <xs:apply-templates />
    </xs:template>

    <xs:template match="lido:eventDate">
        <dates>
            <displayDate><xs:value-of select="normalize-space(lido:displayDate)" /></displayDate>
            <earliestDate><xs:value-of select="normalize-space(lido:date/lido:earliestDate)" /></earliestDate>
            <latestDate><xs:value-of select="normalize-space(lido:date/lido:latestDate)" /></latestDate>
        </dates>
    </xs:template>
    
    <xs:template match="lido:resourceWrap">
        <urls>
            <xs:for-each select="lido:resourceSet/lido:resourceRepresentation/lido:linkResource">
                <url><xs:value-of select="normalize-space()"  /></url>
            </xs:for-each>
        </urls>
    </xs:template>
</xs:stylesheet>
