FROM basex/basexhttp
MAINTAINER a.kammeyer@fu-berlin.de

USER root
RUN apt-get update && apt-get install -y \
    xsltproc \
    libxml2-utils \
    vim

COPY WEB-INF /srv/BaseXWeb/WEB-INF

RUN chown -R basex:basex /srv/BaseXWeb

USER basex

#ADD . /srv/BaseXData
COPY ./utils/clean.xml /srv/BaseXData/clean.xml
COPY ./create_db.sh .
