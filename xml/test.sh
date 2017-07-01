#!/bin/bash

FAIL=0
STYLESHEET=beer.xsl
SCHEMA=beer.xsd
XML=beer_lido.xml
RESULT_FILE=beer_transformed.xml

which xmllint > /dev/null
[ "$?" != "0" ] && echo "Please install cli tool xmllint" && FAIL=1

which xsltproc > /dev/null
[ "$?" != "0" ] && echo "Please install cli tool xsltproc" && FAIL=1

[ "$FAIL" == "1" ] && exit 1

echo "> Creating $RESULT_FILE"
xsltproc "$STYLESHEET" "$XML" > "$RESULT_FILE"
[ "$?" != "0" ] && echo "Ooops something went wrong during transformation" && exit 1

echo "> Validating $RESULT_FILE"
xmllint --noout --schema "$SCHEMA" "$RESULT_FILE"
[ "$?" != "0" ] && echo "Ooops something went wrong during validation" && exit 1
