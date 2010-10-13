$(function () {
	$("a").click(function (evt) {
		evt.preventDefault();
		$(this).toggleClass("selected");
	});

	$(".print").click(function (evt) {
		evt.preventDefault();

		$("a.selected").each(function (index) {
			var elm = $(this);
			$("#for-printing").append(createCard(index, elm.attr('id'), elm.attr('rel'), elm.attr('rev'), elm.attr('title')));
		});

		$("#selection").hide();
		$("#for-printing").show();
	});
});

function createCard(index, id, type, estimate, title) {
	switch (index % 4) {
		case 0:
		case 2:
			card = $('<div class="card break ' + type + '"></div>'); break;
		case 3: card = $('<div class="card page-break ' + type + '"></div>'); break;
		default: card = $('<div class="card ' + type + '"></div>'); break;
	}
	return card.append('<h1>' + title + '</h1><div class="estimate">' + estimate + '</div><div class="id">' + id + '</div>');
}
