import React, { useState, useEffect } from 'react';
import { Upload, Image as ImageIcon, Download, Undo, Redo } from 'lucide-react';
import ImageProcessor from './components/ImageProcessor';
import ProcessingOptions from './components/ProcessingOptions';
import { ProcessingOption, ProcessingParams, ProcessingStep, ProcessingHistory } from './types';

function App() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<ProcessingOption | null>(null);
  const [params, setParams] = useState<ProcessingParams>({
    clipLimit: 2.0,
    tileSize: 8,
    threshold1: 50,
    threshold2: 150,
    sigma: 3,
    amount: 1.5,
    kernelSize: 3,
    scale: 1,
    threshold: 127,
    colorMap: 2,
    boostFactor: [1, 1, 1],
    mixFactors: [[1, 0, 0], [0, 1, 0], [0, 0, 1]],
    colorTint: [128, 128, 128],
    retinexScales: [15, 80, 250],
    gaborKernelSize: 31,
    gaborSigma: 5,
    gaborTheta: 0,
    gaborLambda: 10,
    gaborGamma: 0.5,
    gaborPsi: 0
  });
  const [history, setHistory] = useState<ProcessingHistory>({
    past: [],
    present: null,
    future: []
  });

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
    script.async = true;
    script.onload = () => console.log('OpenCV.js loaded');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveImage = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'processed_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const addStep = (step: ProcessingStep) => {
    setHistory({
      past: [...history.past, step],
      present: step,
      future: []
    });
  };

  const undo = () => {
    if (history.past.length === 0) return;
    const previous = history.past[history.past.length - 1];
    setHistory({
      past: history.past.slice(0, -1),
      present: previous,
      future: [history.present!, ...history.future]
    });
  };

  const redo = () => {
    if (history.future.length === 0) return;
    const next = history.future[0];
    setHistory({
      past: [...history.past, history.present!],
      present: next,
      future: history.future.slice(1)
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Advanced Image Processing App</h1>
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="mb-6">
          <label htmlFor="image-upload" className="block mb-2 text-sm font-medium text-gray-700">
            Upload an image
          </label>
          <div className="flex items-center justify-center w-full">
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-500">PNG, JPG or GIF (MAX. 800x400px)</p>
              </div>
              <input id="image-upload" type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
            </label>
          </div>
        </div>

        <ProcessingOptions
          selectedOption={selectedOption}
          setSelectedOption={setSelectedOption}
          params={params}
          setParams={setParams}
          addStep={addStep}
        />

        {image && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-xl font-semibold mb-2">Original Image</h2>
              <img src={image} alt="Original" className="w-full h-auto rounded-lg" />
            </div>
            <div>
              <h2 className="text-xl font-semibold mb-2">Processed Image</h2>
              {processedImage ? (
                <>
                  <img src={processedImage} alt="Processed" className="w-full h-auto rounded-lg" />
                  <div className="mt-4 flex justify-between">
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600"
                      onClick={undo}
                      disabled={history.past.length === 0}
                    >
                      <Undo className="w-5 h-5 mr-2" />
                      Undo
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-md flex items-center justify-center hover:bg-blue-600"
                      onClick={redo}
                      disabled={history.future.length === 0}
                    >
                      <Redo className="w-5 h-5 mr-2" />
                      Redo
                    </button>
                    <button
                      className="px-4 py-2 bg-green-500 text-white rounded-md flex items-center justify-center hover:bg-green-600"
                      onClick={handleSaveImage}
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Save Processed Image
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center w-full h-64 bg-gray-200 rounded-lg">
                  <ImageIcon className="w-16 h-16 text-gray-400" />
                </div>
              )}
            </div>
          </div>
        )}

        {image && history.present && (
          <ImageProcessor
            image={image}
            steps={[...history.past, history.present]}
            setProcessedImage={setProcessedImage}
          />
        )}
      </div>
    </div>
  );
}

export default App;