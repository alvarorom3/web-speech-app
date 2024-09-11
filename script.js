const synth = window.speechSynthesis;

const editableDiv = document.getElementById('editableDiv');
editableDiv.focus();

const voiceSelect = document.querySelector('select');
const checkbox = document.getElementById('checkbox');

const inputBtn = document.getElementById('play');
const pauseBtn = document.getElementById('pause');
const cancelBtn = document.getElementById('cancel');

// const pitch = document.querySelector('#pitch');
// const pitchValue = document.querySelector('.pitch-value');
const rate = document.querySelector('#rate');
const rateValue = document.querySelector('.rate-value');

var wordsArray = [];
var currentWordIndex = 0;

let voices = [];

function populateVoiceList() {
	voices = synth
		.getVoices()
		.filter(v => v.lang === 'en-US' || v.lang === 'es-AR');

	const selectedIndex =
		voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
	voiceSelect.innerHTML = '';

	for (let i = 0; i < voices.length; i++) {
		const option = document.createElement('option');
		option.textContent = `${voices[i].name} (${voices[i].lang})`;

		if (voices[i].default) {
			option.textContent += ' -- DEFAULT';
		}

		option.setAttribute('data-lang', voices[i].lang);
		option.setAttribute('data-name', voices[i].name);
		voiceSelect.appendChild(option);
	}
	voiceSelect.selectedIndex = selectedIndex;
}

populateVoiceList();

if (speechSynthesis.onvoiceschanged !== undefined) {
	speechSynthesis.onvoiceschanged = populateVoiceList;
}

function speak() {
	if (synth.speaking) {
		console.log('speechSynthesis.speaking');
		return;
	}

	if (editableDiv.value !== '') {
		var paragraphs = editableDiv.innerText.split(/\n+/); // Split by line breaks to get paragraphs
		editableDiv.innerHTML = paragraphs
			.map(paragraph => {
				var words = paragraph.split(/\s+/);
				// Wrap each word with <span> for highlighting
				return (
					'<p>' +
					words.map(word => `<span>${word} </span>`).join('') +
					'</p>'
				);
			})
			.join('');
		const paragraphTags = editableDiv.getElementsByTagName('p');

		if (checkbox.checked) {
			paragraphs.forEach((paragraph, index) => {
				const utterThis = new SpeechSynthesisUtterance(paragraph);

				const selectedOption =
					voiceSelect.selectedOptions[0].getAttribute('data-name');
				for (let i = 0; i < voices.length; i++) {
					if (voices[i].name === selectedOption) {
						utterThis.voice = voices[i];
						break;
					}
				}
				utterThis.rate = rate.value;
				synth.speak(utterThis);

				const paragraphTag = paragraphTags[index];
				const spans = paragraphTag.querySelectorAll('span');

				utterThis.onboundary = function (event) {
					if (event.name === 'word') {
						spans.forEach(span =>
							span.classList.remove('highlight')
						);
						if (spans.length > currentWordIndex) {
							var currentSpan = spans[currentWordIndex];
							currentSpan.classList.add('highlight');
							currentWordIndex++;
						}
					}
				};
				utterThis.onend = function (event) {
					currentWordIndex = 0;
					spans.forEach(span => span.classList.remove('highlight'));
					console.log('SpeechSynthesisUtterance.onend');
				};
				utterThis.onerror = function (event) {
					currentWordIndex = 0;
					spans.forEach(span => span.classList.remove('highlight'));
					console.error('SpeechSynthesisUtterance.onerror');
				};
			});
		} else {
			const utterThis = new SpeechSynthesisUtterance(
				editableDiv.innerText
			);

			const selectedOption =
				voiceSelect.selectedOptions[0].getAttribute('data-name');
			for (let i = 0; i < voices.length; i++) {
				if (voices[i].name === selectedOption) {
					utterThis.voice = voices[i];
					break;
				}
			}
			utterThis.rate = rate.value;

			synth.speak(utterThis);
		}
	}
}

function reading(event) {
	event.preventDefault();

	synth.resume();
	speak();

	editableDiv.blur();
}

function pauseReading(event) {
	event.preventDefault();
	if (synth.speaking && !synth.paused) {
		synth.pause();
	}
}
function cancelReading(event) {
	event.preventDefault();
	if (synth.speaking) {
		synth.cancel();
	}
}

// pitch.onchange = function () {
// 	pitchValue.textContent = pitch.value;
// };

inputBtn.onclick = function (event) {
	reading(event);
};

cancelBtn.onclick = function (event) {
	cancelReading(event);
	currentWordIndex = 0;
};

pauseBtn.onclick = function (event) {
	pauseReading(event);
};

rate.onchange = function () {
	rateValue.textContent = rate.value;
};
voiceSelect.onchange = function () {
	speak();
};

document.addEventListener('keydown', function (event) {
	if (event.key === 'd' || event.key === 'D') {
		pauseReading(event);
	} else if (event.key === 'f' || event.key === 'F') {
		reading(event);
	} else if (event.key === 'g' || event.key === 'G') {
		cancelReading(event);
	}
});
