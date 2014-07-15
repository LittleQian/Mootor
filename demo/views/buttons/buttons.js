button_colors = ["m-button-primary","m-button-success","m-button-warning","m-button-info","m-button-danger"]
button_sizes = ["m-button","m-button-small"]
button_width = ["m-button","m-button-block","m-button-fullwidth"]
button_style = ["m-button","m-button-outline","m-button-clear"]


	
for (s in button_sizes) {
	size = button_sizes[s];

	for (w in button_width) {
		width = button_width[w];

		for (t in button_style) {
			style = button_style[t];

			$line = $("<div></div>").addClass("button-line");
			$("#buttons_container").append($line);


			for (c in button_colors) {
				color = button_colors[c];

				$div = $("<div></div>")
					.addClass(color)
					.addClass(size)
					.addClass(width)
					.addClass(style);

				$div.html($div.attr("class"));
				$line.append($div);

			}
		}
	}
}