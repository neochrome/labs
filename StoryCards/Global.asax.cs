using System.Web.Mvc;
using System.Web.Routing;

namespace StoryCards
{
	public class MvcApplication : System.Web.HttpApplication
	{
		public static void RegisterRoutes(RouteCollection routes)
		{
			routes.RouteExistingFiles = true;
			routes.IgnoreRoute("content/{*all}");

			routes.MapRoute("Default", "{controller}/{action}/{id}", new { controller = "home", action = "index", id = UrlParameter.Optional });
		}

		protected void Application_Start()
		{
			AreaRegistration.RegisterAllAreas();
			RegisterRoutes(RouteTable.Routes);
		}
	}
}