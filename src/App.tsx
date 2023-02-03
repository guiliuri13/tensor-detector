import React, { useCallback, useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as tesseract from "tesseract.js";
import Webcam from "react-webcam";

const App = () => {
	const [result, setResult] = useState<any>();
	const [textResult, setTextResult] = useState<string[]>([]);

	const webcamRef: any = useRef(null);

	const capture = useCallback(
		() => {
			const imageSrc = webcamRef.current?.getScreenshot();
			return imageSrc;
		},
		[webcamRef]
	);
	const extractTextFromCNH = async (image: tesseract.ImageLike) => {
		let text = await tesseract.recognize(image, "por");

		return text;
	};

	useEffect(() => {
		async function run() {
			// Obtém a referência da webcam
			const video: any = webcamRef.current;

			// tira um print da webcam
			let image = capture();

			// extrai o texto da imagem
			extractTextFromCNH(image).then((text) => {
				if (text.data.text) {
					// se a previsão for maior que 0.5, então é uma pessoa
					if (text.data.text.length > 0) {
						let texts = [];
						for (let line of text.data.lines) {
							if (line.confidence > 70) {
								texts.push(line.text);
							}
						}
						setTextResult(texts);
					}
				}
			});

			// Aguarda o carregamento do video
			await new Promise((resolve) => (video.onloadedmetadata = resolve));

			// Define o modelo
			const model = tf.sequential();
			model.add(tf.layers.dense({ units: 1, inputShape: [1] }));

			// Compila o modelo
			model.compile({ loss: "meanSquaredError", optimizer: "sgd" });

			// Define os dados de treinamento
			const xs = tf.tensor2d([1, 2, 3, 4], [4, 1]);
			const ys = tf.tensor2d([1, 3, 5, 7], [4, 1]);

			// Treina o modelo
			await model.fit(xs, ys, { epochs: 10 });

			// Faz previsões
			const result = model.predict(tf.tensor2d([5], [1, 1]));

			// Exibe o resultado
			// setResult(result.dataSync()[0]);
		}

		// loop
		setInterval(run, 1300);
	}, []);

	return (
		<div>
			<Webcam
				ref={webcamRef}
				audio={false}
				screenshotFormat="image/jpeg"
			/>
			<h1>Resultado:</h1>
			{result ? <p>{String(result)}</p> : <p>Carregando...</p>}
			<h1>Texto:</h1>
			{textResult ? <p>{String(textResult)}</p> : <p>Carregando...</p>}
		</div>
	);
};

export default App;
