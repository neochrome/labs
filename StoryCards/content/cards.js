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
	var image = '<img src="content/images/'+ type +'.png"/>';
	var heading = '<h1>' + title + '</h1>';
	var points = '<div class="estimate">' + estimate + '</div>';
	var number = '<div class="id">' + id + '</div>';
	switch (index % 4) {
		case 0:
		case 2:
			card = $('<div class="card break"></div>'); break;
		case 3: card = $('<div class="card page-break"></div>'); break;
		default: card = $('<div class="card"></div>'); break;
	}
	return card.append(image + heading + points + number);
}
