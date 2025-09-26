'use client';

interface StartScreenProps {
	title: string;
	subtitle: string;
	onStart: () => void;
	gameType?: 'word' | 'block';
	selectedLength: number;
	setSelectedLength: (length: number) => void;
	timePerWordMs: number;
	setTimePerWordMs: (time: number) => void;
}

const StartScreen = ({
	title,
	subtitle,
	onStart,
	gameType = 'word',
	selectedLength,
	setSelectedLength,
	timePerWordMs,
	setTimePerWordMs
}: StartScreenProps) => {
	return (
		<section className="config">
			<div className="mast">
				<h1 className="title">{title}</h1>
				<p className="hint">{subtitle}</p>
			</div>

			<div className="controls">
				{gameType === 'word' && (
					<>
						<label className="control">
							<span>Number of words</span>
							<div className="options">
								<button className={selectedLength === 10 ? 'selected' : ''} onClick={() => setSelectedLength(10)}>
									10
								</button>
								<button className={selectedLength === 20 ? 'selected' : ''} onClick={() => setSelectedLength(20)}>
									20
								</button>
								<button className={selectedLength === 30 ? 'selected' : ''} onClick={() => setSelectedLength(30)}>
									30
								</button>
							</div>
						</label>
						<label className="control">
							<span>Time per word</span>
							<div className="options">
								<button className={timePerWordMs === 4000 ? 'selected' : ''} onClick={() => setTimePerWordMs(4000)}>
									4s
								</button>
								<button className={timePerWordMs === 6000 ? 'selected' : ''} onClick={() => setTimePerWordMs(6000)}>
									6s
								</button>
								<button className={timePerWordMs === 8000 ? 'selected' : ''} onClick={() => setTimePerWordMs(8000)}>
									8s
								</button>
							</div>
						</label>
					</>
				)}
			</div>

			<button className="start" onClick={onStart}>
				Start
			</button>
		</section>
	);
};

export default StartScreen;
