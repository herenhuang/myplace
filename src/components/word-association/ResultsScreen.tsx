'use client';

import PentagonChart from './PentagonChart';

interface ResultsScreenProps {
	title?: string;
	analysisLoading: boolean;
	analysisResult: { summary: string; scores: number[] } | null;
	analysisError: string | null;
	labels?: string[];
	onComplete: () => void;
	onRestart: () => void;
}

function parseMarkdown(text: string) {
	if (!text) return { __html: '' };
	const html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\*([^*]+?)\*/g, '<em>$1</em>');
	return { __html: html };
}

const ResultsScreen = ({
	title = 'Here are your results!',
	analysisLoading,
	analysisResult,
	analysisError,
	labels,
	onComplete,
	onRestart
}: ResultsScreenProps) => {
	return (
		<section className="results">
			<h2 className="title">{title}</h2>

			<div className="analysis-container">
				<PentagonChart scores={analysisResult?.scores ?? null} labels={labels} loading={analysisLoading} size={400} />

				{analysisResult?.summary ? (
					<div className="analysis-result">
						<p dangerouslySetInnerHTML={parseMarkdown(analysisResult.summary)}></p>
					</div>
				) : analysisLoading ? (
					<div className="analysis-placeholder">
						<div className="placeholder-lines">
							<div className="placeholder-line"></div>
							<div className="placeholder-line"></div>
							<div className="placeholder-line short"></div>
						</div>
					</div>
				) : null}
			</div>

			{analysisError && (
				<div className="analysis-error">
					<p>Sorry, there was an error generating your analysis: {analysisError}</p>
				</div>
			)}

			<div className="actions">
				<button className="complete" onClick={onComplete}>
					Complete
				</button>
				<button className="restart" onClick={onRestart}>
					Retry
				</button>
			</div>
		</section>
	);
};

export default ResultsScreen;
