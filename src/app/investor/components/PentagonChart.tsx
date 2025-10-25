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
	labels = ['Assertiveness', 'Patience', 'Clarity', 'Compromise', 'Efficiency'],
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
		<div style={{ width: size, height: size, position: 'relative' }}>
			<canvas ref={canvasRef} width="600" height="600" style={{ width: '100%', height: '100%' }}></canvas>
			{loading && (
				<div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.8)' }}>
					{/* You can add a spinner here */}
					<p>Loading Chart...</p>
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
	ctx.font = '18px sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	// Draw pentagon grid
	ctx.strokeStyle = '#e5e7eb';
	ctx.lineWidth = 1;
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

	// Draw radial lines
	for (let j = 0; j < sides; j++) {
		ctx.beginPath();
		ctx.moveTo(centerX, centerY);
		const x = centerX + radius * Math.cos(angle * j - Math.PI / 2);
		const y = centerY + radius * Math.sin(angle * j - Math.PI / 2);
		ctx.lineTo(x, y);
		ctx.stroke();
	}

	// Draw labels
	ctx.fillStyle = '#4b5563';
	ctx.font = 'bold 16px sans-serif';
	for (let i = 0; i < sides; i++) {
		const r = radius * 1.2;
		const x = centerX + r * Math.cos(angle * i - Math.PI / 2);
		const y = centerY + r * Math.sin(angle * i - Math.PI / 2);
		ctx.fillText(labels[i], x, y);
	}

	// Draw data shape
	ctx.fillStyle = 'rgba(99, 85, 255, 0.25)';
	ctx.strokeStyle = '#6355FF';
	ctx.lineWidth = 3;
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

	// Draw score points
	ctx.fillStyle = '#6355FF';
	ctx.strokeStyle = '#ffffff';
	ctx.lineWidth = 3;
	for (let i = 0; i < sides; i++) {
		const score = scores[i] ?? 0;
		const r = radius * (score / 10);
		const x = centerX + r * Math.cos(angle * i - Math.PI / 2);
		const y = centerY + r * Math.sin(angle * i - Math.PI / 2);

		ctx.beginPath();
		ctx.arc(x, y, 6, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
	}
}

export default PentagonChart;
