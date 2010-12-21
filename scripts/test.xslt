<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" exclude-result-prefixes="msxsl">
	<xsl:output method="html" indent="yes" doctype-public="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" encoding="Windows-1252"/>
	<xsl:param name="iteration" />

	<xsl:template match="/">
		<root>
			<hello>
				<world/>
			</hello>
		</root>
	</xsl:template>
	
</xsl:stylesheet>
