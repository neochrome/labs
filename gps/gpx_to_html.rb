# encoding: utf-8
require "rexml/document"
require "optparse"
require "erb"

class String
  def clean
    return self.remove_images()
  end
  def remove_images
    return self.sub(/<img.*?\/(img)?>/m,'')
  end
end

module Gpx2Html
  VERSION = [0,1,0]
  @options = {:file_or_pattern => "*.gpx", :output => "caches.html"}
  @rhtml = ERB.new <<-EOF
  <?xml version="1.0" encoding="UTF-8"?>
  <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
  <html xmlns="http://www.w3.org/1999/xhtml">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <title>Caches</title>
      <style type="text/css">
        body, h1 {font-size:11px;margin:1px;font-family:verdana;}
        .cache {border-top:1px solid black;margin-top:2px;}
      </style>
    </head>
    <body>
      <h1><a name="top">Caches</a></h1>
      <%caches.each do |cache|%>
      <a href="#<%=cache[:id]%>"><%=cache[:id]%> - <%=cache[:title]%></a><br/>
      <%end%>
      <%caches.each do |cache|%>
      <div class="cache"> 
        <h1><a name="<%=cache[:id]%>"><%=cache[:id]%> - <%=cache[:title]%></a></h1>
        <%=cache[:type]%> - <%=cache[:container]%> (<%=cache[:difficulty]%>/<%=cache[:terrain]%>)<br/>
        <%if cache[:description].length > 0%>
        <p><%=cache[:description]%></p>
        <%end%>
        <%if cache[:description_long].length > 0%>
        <p><%=cache[:description_long]%></p>
        <%end%>
        <%if cache[:hints].length > 0%>
        <p>Hint:<br/><%=cache[:hints]%></p>
        <%end%>
        <a href="#top">TOC</a>
      </div>
      <%end%>
    </body>
  </html>
  EOF

  def self.run(args)
    opts = OptionParser.new() do |opts|
      opts.on("-f","--file [FILE]", "Specifies a FILE or pattern of FILEs to process. Default is *.gpx") do |file_or_pattern|
        @options[:file_or_pattern] = file_or_pattern
      end

      opts.on("-o","--output [FILE]", "Specifies the output FILE to save the html to. Default is caches.html") do |output|
        @options[:output] = output
      end

      opts.separator ""
      opts.separator "Common options:"
      opts.on_tail("-h", "--help", "Show this message") do
        puts opts
        exit
      end

      opts.on_tail("--version", "Show version") do
        puts VERSION.join('.')
        exit
      end
    end
    opts.parse!(args)

    files = Dir.glob(@options[:file_or_pattern])
    if files.empty?
      puts "Nothing to do!"
      exit
    end

    caches = []
    files.each do |file|
      doc = REXML::Document.new(File.open(file))
      collect_cache_info(doc) do |cache|
        caches << cache
      end
    end

    File.open(@options[:output], File::WRONLY | File::CREAT | File::TRUNC) do |output|
      output.write(@rhtml.result(binding()))      
    end

    puts "#{caches.length} cache(s) from #{files.length} file(s) written to #{@options[:output]}."
  end

  def self.collect_cache_info(doc)
    doc.elements.each("//groundspeak:cache") do |element|
      cache = {
        :id => element.parent.elements['name'].text.strip,
        :title => element.elements['groundspeak:name'].text.strip,
        :type => element.elements['groundspeak:type'].text.strip,
        :container => element.elements['groundspeak:container'].text.strip,
        :difficulty => element.elements['groundspeak:difficulty'].text.strip,
        :terrain => element.elements['groundspeak:terrain'].text.strip,
        :description => element.elements['groundspeak:short_description'].text.clean().strip,
        :description_long => element.elements['groundspeak:long_description'].text.clean().strip,
        :hints => element.elements['groundspeak:encoded_hints'].text.strip
      }
      yield cache if block_given?
    end
  end

end

Gpx2Html::run(ARGV)
