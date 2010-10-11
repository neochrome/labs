using System;
using System.Linq;
using System.Web.Mvc;
using StoryCards.Models;
using System.Net;
using System.Collections.Generic;

namespace StoryCards.Controllers
{
    public class CardsController : Controller
    {
		[HttpGet]
		public ActionResult Home()
		{
			return View();
		}

		[HttpGet]
		public ActionResult Index(string apiToken, int projectId, Iteration iteration)
		{
			//var cards = FetchCards(apiToken, projectId, iteration);

			var cards = new[] { 
				new Card{ Id = 1, Title = "A Bug", Estimate = 0, Type = StoryType.Bug},
				new Card{ Id = 2, Title = "A Chore", Estimate = 0, Type = StoryType.Chore},
				new Card{ Id = 3, Title = "A Feature", Estimate = 1, Type = StoryType.Feature},
				new Card{ Id = 4, Title = "A Realease", Estimate = 0, Type = StoryType.Release},
			};

			return PartialView(cards);
		}

		private IEnumerable<Card> FetchCards(string apiToken, int projectId, Iteration iteration)
		{
			using (var client = new WebClient())
			{
				client.Headers.Add("X-TrackerToken", apiToken);
				var result = client.DownloadString(string.Format("https://www.pivotaltracker.com/services/v3/projects/{0}/iterations/{1}", projectId, Enum.GetName(typeof(Iteration), iteration).ToLower()));
				var iterations = IterationsResource.Parse(result);
				var cards = iterations.Iterations.SelectMany(i => i.Stories.Select(s => new Card { Id = s.Id, Type = s.Type, Title = s.Name, Estimate = s.Estimate }));
				return cards;
			}
		}
    }
}
