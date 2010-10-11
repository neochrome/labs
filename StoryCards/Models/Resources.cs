using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Xml.Serialization;

namespace StoryCards.Models
{
	[XmlRoot("iterations")]
	public class IterationsResource : Resource<IterationsResource>
	{
		[XmlElement("iteration")]
		public List<IterationElement> Iterations = new List<IterationElement>();
	}

	public class IterationElement
	{
		[XmlArray("stories"), XmlArrayItem("story")]
		public List<StoryElement> Stories = new List<StoryElement>();
	}

	public class StoryElement
	{
		[XmlElement("id")]
		public int Id;

		[XmlElement("name")]
		public string Name;

		[XmlElement("estimate")]
		public int Estimate;

		[XmlElement("story_type")]
		public StoryType Type;
	}

	public enum StoryType
	{
		[XmlEnum("bug")]	Bug,
		[XmlEnum("chore")]	Chore,
		[XmlEnum("feature")]Feature,
		[XmlEnum("release")]Release
	}

}