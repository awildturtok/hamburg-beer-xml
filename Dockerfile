FROM basex/basexhttp
MAINTAINER a.kammeyer@fu-berlin.de

USER root
RUN apt-get update && apt-get install -y \
    xsltproc \
    libxml2-utils \
    vim

USER basex

#ADD . /srv/BaseXData
COPY ./dist/ /srv/BaseXWeb/static
COPY ./utils/clean.xml /srv/BaseXData/clean.xml
COPY ./create_db.sh .
