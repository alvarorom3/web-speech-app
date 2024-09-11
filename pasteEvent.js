function insertTextAtCaret(text) {
	var sel = window.getSelection();

	if (sel.rangeCount > 0) {
		var range = sel.getRangeAt(0);
		range.deleteContents();

		var textNode = document.createTextNode(text);
		range.insertNode(textNode);

		// Move the caret to the end of the inserted text
		range.setStartAfter(textNode);
		range.setEndAfter(textNode);
		sel.removeAllRanges();
		sel.addRange(range);
	}
}

document
	.getElementById('editableDiv')
	.addEventListener('paste', function (event) {
		event.preventDefault();

		// Get the pasted text from the clipboard
		var pastedText = event.clipboardData.getData('text');

		var modifiedText = pastedText
			.replace(/&/g, ' and ')
			.replace(/^\./gm, '') // delete dots at beggining of a line
			.replace(/^\s{2,}}/gm, '') // delete double spaces
			.replace(/(?<=[A-Za-z0-9,;()'"-])\r?\n/g, ' ') // line break not followed by some char
			.replace(/[^a-zA-Z0-9.,!?;:()'"#@áéíóúÁÉÍÓÚ-\s]/g, '') // exclude chars
			.replace(/\b(\w+)\.(\w+)\b/g, '$1 .$2') // file extensions (eg: hello.txt -> hello .text)
			.trim();

		insertTextAtCaret(modifiedText);
	});
