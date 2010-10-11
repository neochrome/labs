<%@ Control Language="C#" Inherits="System.Web.Mvc.ViewUserControl<Card>" %>
<!-- (if idx % 2 = 0 then "break" else ""), (if idx % 4 = 3 then "page" else "")-->
<div class="card ftlt {0} {3} {4}">
	<h1><%:Model.Title%></h1>
	<div class="estimate"><%:Model.Estimate%></div>
	<div class="id"><%:Model.Id%></div>
</div>