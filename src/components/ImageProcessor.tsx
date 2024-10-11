import React, { useEffect } from 'react';
import { ProcessingOption, ProcessingParams, ProcessingStep } from '../types';

interface ImageProcessorProps {
  image: string;
  steps: ProcessingStep[];
  setProcessedImage: (image: string) => void;
}

declare global {
  interface Window {
    cv: typeof cv;
  }
}

const ImageProcessor: React.FC<ImageProcessorProps> = ({ image, steps, setProcessedImage }) => {
  useEffect(() => {
    const processImage = async () => {
      if (!window.cv) {
        console.error('OpenCV.js is not loaded');
        return;
      }

      const img = await loadImage(image);
      let src = window.cv.imread(img);
      let dst = new window.cv.Mat();

      for (const step of steps) {
        const { option, params } = step;
        dst = await applyProcessingStep(src, option, params);
        src.delete();
        src = dst.clone();
      }

      window.cv.imshow(document.createElement('canvas'), dst);
      const dataUrl = document.createElement('canvas').toDataURL();
      setProcessedImage(dataUrl);

      src.delete();
      dst.delete();
    };

    processImage();
  }, [image, steps, setProcessedImage, applyProcessingStep]);

  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  const applyProcessingStep = useCallback(async (src: cv.Mat, option: ProcessingOption, params: ProcessingParams): Promise<cv.Mat> => {
  }, [steps]);
    let dst = new window.cv.Mat();

    switch (option) {
      // ... (previous cases remain the same)

      case 'Manual Colorization':
        window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY);
        window.cv.cvtColor(dst, dst, window.cv.COLOR_GRAY2RGB);
        {
          const colorMask = new window.cv.Mat(src.rows, src.cols, window.cv.CV_8UC3, new window.cv.Scalar(...params.colorTint));
          window.cv.addWeighted(dst, 0.7, colorMask, 0.3, 0, dst);
          colorMask.delete();
        }
        break;

      case 'Multi-Scale Retinex':
        dst = await applyMultiScaleRetinex(src, params.retinexScales);
        break;

      case 'Gabor Filter':
        {
          const kernel = window.cv.getGaborKernel(
            new window.cv.Size(params.gaborKernelSize, params.gaborKernelSize),
            params.gaborSigma,
            params.gaborTheta,
            params.gaborLambda,
            params.gaborGamma,
            params.gaborPsi,
            window.cv.CV_32F
          );
          window.cv.filter2D(src, dst, window.cv.CV_8U, kernel, new window.cv.Point(-1, -1), 0, window.cv.BORDER_DEFAULT);
          kernel.delete();
        }
        break;

      default:
        console.warn('Processing option not implemented:', option);
        dst = src.clone();
    }

    return dst;
  }, [steps]);
    let dst = new window.cv.Mat();

    switch (option) {
      // ... (previous cases remain the same)

      case 'Manual Colorization':
        window.cv.cvtColor(src, dst, window.cv.COLOR_RGBA2GRAY);
        window.cv.cvtColor(dst, dst, window.cv.COLOR_GRAY2RGB);
        {
          const colorMask = new window.cv.Mat(src.rows, src.cols, window.cv.CV_8UC3, new window.cv.Scalar(...params.colorTint));
          window.cv.addWeighted(dst, 0.7, colorMask, 0.3, 0, dst);
          colorMask.delete();
        }
        break;

      case 'Multi-Scale Retinex':
        dst = await applyMultiScaleRetinex(src, params.retinexScales);
        break;

      case 'Gabor Filter':
        {
          const kernel = window.cv.getGaborKernel(
            new window.cv.Size(params.gaborKernelSize, params.gaborKernelSize),
            params.gaborSigma,
            params.gaborTheta,
            params.gaborLambda,
            params.gaborGamma,
            params.gaborPsi,
            window.cv.CV_32F
          );
          window.cv.filter2D(src, dst, window.cv.CV_8U, kernel, new window.cv.Point(-1, -1), 0, window.cv.BORDER_DEFAULT);
          kernel.delete();
        }
        break;

      default:
        console.warn('Processing option not implemented:', option);
        dst = src.clone();
    }

    return dst;
  }, []);
  };

  const applyMultiScaleRetinex = async (src: cv.Mat, scales: number[]): Promise<cv.Mat> => {
    const gray = new window.cv.Mat();
    window.cv.cvtColor(src, gray, window.cv.COLOR_RGB2GRAY);
    
    const logSrc = new window.cv.Mat();
    gray.convertTo(logSrc, window.cv.CV_32F);
    window.cv.log(logSrc, logSrc);

    const dst = new window.cv.Mat();
    dst.create(src.rows, src.cols, window.cv.CV_32F);
    dst.setTo(new window.cv.Scalar(0));

    for (const scale of scales) {
      const blur = new window.cv.Mat();
      window.cv.GaussianBlur(logSrc, blur, new window.cv.Size(0, 0), scale);
      window.cv.subtract(logSrc, blur, blur);
      window.cv.add(dst, blur, dst);
      blur.delete();
    }

    dst.convertTo(dst, window.cv.CV_8U, 255 / scales.length);
    
    gray.delete();
    logSrc.delete();

    return dst;
  };

  return null;
};

export default ImageProcessor;
