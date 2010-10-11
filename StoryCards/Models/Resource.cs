using System.IO;
using System.Text;
using System.Xml;
using System.Xml.Serialization;

namespace StoryCards.Models
{
	public abstract class Resource<T> where T : Resource<T>
	{
		public static bool TryParse(string xml, out T resource)
		{
			try
			{
				resource = Parse(xml);
				return true;
			}
			catch
			{
				resource = default(T);
				return false;
			}
		}

		public static T Parse(string xml)
		{
			using (var reader = new StringReader(xml))
			{
				return (T)new XmlSerializer(typeof(T)).Deserialize(reader);
			}
		}

		public string ToXml()
		{
			var output = new MemoryStream();
			using (var writer = new XmlTextWriter(output, new UTF8Encoding()))
			{
				writer.Formatting = Formatting.Indented;
				new XmlSerializer(typeof(T)).Serialize(writer, this);
				writer.Flush();
				output.Seek(0, SeekOrigin.Begin);
				return new StreamReader(output, new UTF8Encoding()).ReadToEnd();
			}
		}
	}
}
