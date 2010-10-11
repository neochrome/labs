<%@ Page Title="Index" Language="C#" MasterPageFile="~/Views/Shared/Site.Master" Inherits="System.Web.Mvc.ViewPage<dynamic>" %>

<asp:Content ContentPlaceHolderID="HeadContent" runat="server">
	<script type="text/javascript">
		$(function () {
			$("#settings").submit(function (evt) {
				evt.preventDefault();
				$.get("/cards", { "apiToken": "", "projectId": 0, "iteration": "current" }, function (data) {
					$("#result").html(data);
				});
			});
		});
	</script>
</asp:Content>

<asp:Content ContentPlaceHolderID="MainContent" runat="server">
	<form id="settings" action="/cards" method="get">
		<fieldset>
			<legend>Settings:</legend>
			<label for="apiToken">Api token</label>
			<input type="text" id="apiToken" name="apiToken" value="" />
			<label for="projectId">Project id</label>
			<input type="text" id="projectId" name="projectId" value="" />
			<label for="iteration">Iteration</label>
			<select id="iteration" name="iteration">
				<option>current</option>
				<option>done</option>
				<option>backlog</option>
			</select>
			<input type="submit" value="fetch" />
		</fieldset>
	</form>
	<div id="result"></div>
</asp:Content>
