<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<IEnumerable<Card>>" %>
<%
	foreach (var card in Model)
	{
			Html.RenderPartial("Card", card);	
	}
%>