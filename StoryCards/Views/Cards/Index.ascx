<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<IEnumerable<Card>>" %>
<table>
	<tr>
		<th></th>
		<th>Type</th>
		<th>Id</th>
		<th>Estimate</th>
		<th>Title</th>
	</tr>
<%foreach (var card in Model){%>
	<tr>
		<td><input name="print" value="<%:card.Id%>" type="checkbox" /></td>
		<td><%:card.Type%></td>
		<td><%:card.Id%></td>
		<td><%:card.Estimate%></td>
		<td><%:card.Title%></td>
	</tr>
<%}%>
</table>
