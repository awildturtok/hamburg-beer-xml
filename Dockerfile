FROM basex/basexhttp
MAINTAINER a.kammeyer@fu-berlin.de

USER root
# RUN rm -rf /srv/BaseXWeb/WEB-INF/web.xml
RUN apt-get update && apt-get install -y \
    xsltproc \
    libxml2-utils \
    vim nano

USER basex

#ADD . /srv/BaseXData
# COPY ./web.xml /srv/BaseXWeb/WEB-INF/web.xml
COPY ./dist/ /srv/BaseXWeb/static
COPY ./utils/clean.xml /srv/BaseXData/clean.xml
COPY ./create_db.sh .
