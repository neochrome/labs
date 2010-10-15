<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl">
  <xsl:output method="html" indent="yes" doctype-public="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>
  <xsl:param name="iteration" />

	<xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" >
      <head>
        <title>Story Cards for: <xsl:value-of select="$iteration"/></title>
        <script src="content/jquery.min.js" type="text/javascript"></script>
        <script src="content/cards.js" type="text/javascript"></script>
        <link href="content/cards.css" type="text/css" rel="stylesheet"/>
      </head>
      <body>
        <div id="selection">
          <button class="print">print selected</button>
          <xsl:apply-templates select="//story" />
          <button class="print">print selected</button>
        </div>
        <div id="for-printing"></div>
      </body>
    </html>
  </xsl:template>

  <xsl:template match="story">
    <xsl:element name="a">
      <xsl:attribute name="id"><xsl:value-of select="id"/></xsl:attribute>
      <xsl:attribute name="rel"><xsl:value-of select="story_type"/></xsl:attribute>
      <xsl:attribute name="title"><xsl:value-of select="name"/></xsl:attribute>
      <xsl:attribute name="rev"><xsl:value-of select="estimate"/></xsl:attribute>
      <xsl:value-of select="id"/> - <xsl:value-of select="name"/>
    </xsl:element>
  </xsl:template>
  
</xsl:stylesheet>
