const words = [
	'river',
	'sun',
	'moon',
	'mountain',
	'tree',
	'ocean',
	'flower',
	'animal',
	'music',
	'art',
	'love',
	'hate',
	'happy',
	'sad',
	'light',
	'dark',
	'hot',
	'cold',
	'fast',
	'slow',
	'big',
	'small',
	'old',
	'new',
	'good',
	'bad',
	'life',
	'death',
	'time',
	'space',
	'friend',
	'enemy',
	'peace',
	'war',
	'dream',
	'reality',
	'truth',
	'lie',
	'power',
	'weakness',
	'hope',
	'fear',
	'joy',
	'pain',
	'success',
	'failure',
	'knowledge',
	'ignorance',
	'freedom',
	'slavery'
];

function shuffle(array) {
	let currentIndex = array.length,
		randomIndex;

	while (currentIndex != 0) {
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;
		[array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
	}

	return array;
}

export function getInterleavedWords(length) {
	return shuffle([...words]).slice(0, length);
}
