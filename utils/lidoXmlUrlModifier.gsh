#!/usr/bin/env groovy

if (args.size() < 3)
{
    println "Usage: <lidoXml> <urlFile> <targetXmlPath>"
    System.exit(1)
}

File lidoXml = args[0] as File
File urlFile = args[1] as File
File newXml = args[2] as File

def xmlRoot = new XmlParser().parse(lidoXml)
def urlNodes = xmlRoot.'**'.'lido:linkResource'
List lines = urlFile.text.readLines()
Map nameToUrls = [:]

def joinNodeAndUrl = {nodes, urls ->
    if (nodes.size() == 1) return [(urls[0]) : nodes[0]]
    Map result = [:]

    urls.each
    { url ->
        def m = (url =~ /.*?\/.*_(\d+).jpg$/)
        String prefix = ''
        if (m.find())
        {
            prefix = m[0][1]
        }
        def node = nodes.find {it.value()[0].matches(/.*?\/.*/ + prefix + /.jpg$/)}
        if (!node)
        {
            Integer p = prefix.toInteger()
            node = nodes.find {it.value()[0].endsWith("($p).jpg")}
        }
        result[url] = node
    }
    return result
}

def getNames = { name ->
    List names = [name]

    if (name.startsWith('AB'))
    {
        String withoutExt = name - ~/_\d+.jpg/
        names << withoutExt

        String nr = withoutExt - ~/^AB/
        names << 'AB ' + nr
        names << 'AB-' + nr
    }

    if (name.startsWith('E'))
    {
        def m = (name =~ /^EB?-(\d+)-(\d+)/)
        names << m[0][1..2].join(',')
    }

    if (name ==~ /\d+-\d+/)
    {
        def m = name =~ /(\d+)-(\d+)/
        names << m[0][1..2].join('-')
        names << m[0][1..2].join(',')
    }
    return names
}

// aggregate urls of same image
for (int i = 0; i < lines.size(); i = i + 4)
{
    String url = lines[i + 2]
    String name = lines[i + 3].split(' ')[1]
    
    if (!nameToUrls[name])
    {
        nameToUrls[name] = []
    }
    nameToUrls[name] << url
}

List usedNodes = []

nameToUrls.each
{ name, urls ->
    List names = getNames(name)
    def urlNodeR = urlNodes.findAll{ node -> names.any{ node.value()[0].contains(it) && ! node.value()[0].contains('Vorschaubild') } }
    Map mapping = joinNodeAndUrl(urlNodeR, urls)

    mapping.each
    { url, node ->
        if (!node) println "Found no node for url $url"
        else node.value = url
    }

    usedNodes += mapping.values()
}

(urlNodes - usedNodes).each
{ node ->
    Node p = node.parent()
    p.parent().remove(p)
}

def stringWriter = new StringWriter()
new XmlNodePrinter(new PrintWriter(stringWriter)).print(xmlRoot)
newXml.delete()
newXml.text = stringWriter.toString()
