export type ProcessingOption =
  | 'Histogram Equalization'
  | 'Adaptive Histogram Equalization'
  | 'Edge Detection'
  | 'Unsharp Masking'
  | 'High-Pass Filtering'
  | 'Laplacian Filtering'
  | 'Color Inversion'
  | 'Thresholding'
  | 'Pseudocolor Mapping'
  | 'Fourier Transform'
  | 'Color Boosting'
  | 'Channel Mixing Simulation'
  | 'Manual Colorization'
  | 'Multi-Scale Retinex'
  | 'Gabor Filter';

export interface ProcessingParams {
  clipLimit: number;
  tileSize: number;
  threshold1: number;
  threshold2: number;
  sigma: number;
  amount: number;
  kernelSize: number;
  scale: number;
  threshold: number;
  colorMap: number;
  boostFactor: [number, number, number];
  mixFactors: [[number, number, number], [number, number, number], [number, number, number]];
  colorTint: [number, number, number];
  retinexScales: number[];
  gaborKernelSize: number;
  gaborSigma: number;
  gaborTheta: number;
  gaborLambda: number;
  gaborGamma: number;
  gaborPsi: number;
}

export interface ProcessingStep {
  option: ProcessingOption;
  params: ProcessingParams;
}

export interface ProcessingHistory {
  past: ProcessingStep[];
  present: ProcessingStep | null;
  future: ProcessingStep[];
}