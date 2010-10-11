using System;
using System.Linq;
using System.Web.Mvc;
using StoryCards.Models;

namespace StoryCards.Controllers
{
    public class CardsController : Controller
    {
		[HttpGet]
		public ActionResult Index(string apiToken, int projectId, Iteration iteration)
		{
			var client = new RestClient().WithHeader("X-TrackerToken", apiToken);
			var result = client.Get(string.Format("https://www.pivotaltracker.com/services/v3/projects/{0}/iterations/{1}", projectId, Enum.GetName(typeof(Iteration), iteration).ToLower()));

			var iterations = IterationsResource.Parse(result.Body);
			var cards = iterations.Iterations.SelectMany(i => i.Stories.Select(s => new Card { Id = s.Id, Type = s.Type, Title = s.Name, Estimate = s.Estimate }));
			return PartialView(cards);
		}
    }
}
