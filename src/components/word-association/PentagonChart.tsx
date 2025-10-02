'use client';

import { useEffect, useRef } from 'react';

interface PentagonChartProps {
	scores: number[] | null;
	labels?: string[];
	size?: number;
	loading?: boolean;
}

const PentagonChart = ({
	scores,
	labels = ['Creativity', 'Optimism', 'Anxiety', 'Pragmatism', 'Spontaneity'],
	size = 400,
	loading = false
}: PentagonChartProps) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		if (scores) {
			drawRadarChart(canvas, scores, labels);
		} else {
			const ctx = canvas.getContext('2d');
			ctx?.clearRect(0, 0, canvas.width, canvas.height);
		}
	}, [scores, labels]);

	return (
		<div className="chart-container" style={{ width: size, height: size }}>
			<canvas ref={canvasRef} width="600" height="600" style={{ width: size, height: size }} className="radar-chart"></canvas>
			{loading && (
				<div className="chart-placeholder">
					<div className="loading-spinner"></div>
				</div>
			)}
		</div>
	);
};

function drawRadarChart(canvas: HTMLCanvasElement, scores: number[], labels: string[]) {
	if (!scores || scores.length !== 5) return;
	const ctx = canvas.getContext('2d');
	if (!ctx) return;

	const canvasSize = Math.min(canvas.width, canvas.height);
	const centerX = canvasSize / 2;
	const centerY = canvasSize / 2;
	const radius = canvasSize * 0.35;
	const sides = 5;
	const angle = (Math.PI * 2) / sides;

	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.font = '18px Inter, sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// Draw pentagon grid
	ctx.strokeStyle = '#e5e7eb';
	ctx.lineWidth = 2;
	for (let i = 1; i <= 5; i++) {
		const r = radius * (i / 5);
		ctx.beginPath();
		for (let j = 0; j < sides; j++) {
			const x = centerX + r * Math.cos(angle * j - Math.PI / 2);
			const y = centerY + r * Math.sin(angle * j - Math.PI / 2);
			if (j === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.stroke();
	}

	// Draw labels
	ctx.fillStyle = '#4b5563';
	for (let i = 0; i < sides; i++) {
		const r = radius * 1.15;
		const x = centerX + r * Math.cos(angle * i - Math.PI / 2);
		const y = centerY + r * Math.sin(angle * i - Math.PI / 2);
		ctx.fillText(labels[i], x, y);
	}

	// Draw data shape
	ctx.fillStyle = 'rgba(255, 107, 71, 0.25)';
	ctx.strokeStyle = '#ff6a00';
	ctx.lineWidth = 4;
	ctx.beginPath();
	for (let i = 0; i < sides; i++) {
		const score = scores[i] ?? 0;
		const r = radius * (score / 10);
		const x = centerX + r * Math.cos(angle * i - Math.PI / 2);
		const y = centerY + r * Math.sin(angle * i - Math.PI / 2);
		if (i === 0) ctx.moveTo(x, y);
		else ctx.lineTo(x, y);
	}
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	// Draw score points and values
	ctx.fillStyle = '#ff6a00';
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 3;
	ctx.font = 'bold 24px Inter, sans-serif';
	for (let i = 0; i < sides; i++) {
		const score = scores[i] ?? 0;
		const r = radius * (score / 10);
		const x = centerX + r * Math.cos(angle * i - Math.PI / 2);
		const y = centerY + r * Math.sin(angle * i - Math.PI / 2);

		// Draw point
		ctx.beginPath();
		ctx.arc(x, y, 8, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Draw score text next to point
		const textOffset = 25;
		const textX = x + textOffset * Math.cos(angle * i - Math.PI / 2);
		const textY = y + textOffset * Math.sin(angle * i - Math.PI / 2);

		ctx.fillStyle = 'black';
		ctx.fillText(score.toString(), textX, textY);
		ctx.fillStyle = '#ff6a00';
	}
}

export default PentagonChart;
