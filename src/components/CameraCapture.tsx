'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, RefreshCw, Upload, Check, X, AlertCircle } from 'lucide-react';
import { compressImage } from '@/lib/imageCompression';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  onClose: () => void;
}

export default function CameraCapture({ onCapture, onClose }: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState<boolean>(false);

  // Start webcam stream
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Kamera tidak didukung oleh browser Anda');
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });

      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errorMsg = 'Izin kamera ditolak atau kamera tidak tersedia.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Akses kamera tidak diizinkan. Silakan beri izin kamera atau gunakan tombol upload foto di bawah.';
      }
      setCameraError(errorMsg);
    }
  };

  // Stop webcam stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Update video element when stream is ready
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Capture frame from video stream
  const takeSnapshot = async () => {
    if (!videoRef.current) return;

    try {
      setIsCompressing(true);
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Gagal inisialisasi context canvas');

      // Mirror horizontally for selfie camera
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const rawDataUrl = canvas.toDataURL('image/jpeg', 0.9);
      // Compress image client-side to ensure < 300KB
      const compressed = await compressImage(rawDataUrl, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.75,
      });

      setCapturedPreview(compressed);
      stopCamera();
    } catch (err: any) {
      console.error('Error taking snapshot:', err);
      alert('Gagal mengambil foto. Silakan coba lagi.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Handle file input upload (fallback)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsCompressing(true);
      const compressed = await compressImage(file, {
        maxWidth: 1024,
        maxHeight: 1024,
        quality: 0.75,
      });
      setCapturedPreview(compressed);
      stopCamera();
    } catch (err: any) {
      console.error('Error processing uploaded image:', err);
      alert('Gagal memproses file gambar. Silakan gunakan foto lain.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Reset & retake photo
  const handleRetake = () => {
    setCapturedPreview(null);
    startCamera();
  };

  // Confirm photo
  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Ambil Foto Selfie</h3>
            <p className="text-xs text-slate-500">Bukti kehadiran saat Clock Out (Pulang)</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewport / Preview */}
        <div className="relative bg-slate-950 aspect-[4/3] flex items-center justify-center overflow-hidden">
          {capturedPreview ? (
            <img
              src={capturedPreview}
              alt="Preview Selfie"
              className="w-full h-full object-cover"
            />
          ) : stream ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover transform -scale-x-100"
            />
          ) : (
            <div className="p-6 text-center text-slate-300 flex flex-col items-center">
              <AlertCircle className="w-12 h-12 text-amber-400 mb-2" />
              <p className="text-sm font-medium">{cameraError || 'Menyiapkan kamera...'}</p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition"
              >
                <Upload className="w-4 h-4" />
                Pilih Foto dari Galeri / File
              </button>
            </div>
          )}

          {isCompressing && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white">
              <RefreshCw className="w-8 h-8 animate-spin mb-2" />
              <p className="text-xs font-medium">Mengompresi foto...</p>
            </div>
          )}
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* Action Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          {capturedPreview ? (
            <>
              <button
                type="button"
                onClick={handleRetake}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center gap-2 transition flex-1 justify-center"
              >
                <RefreshCw className="w-4 h-4" />
                Ambil Ulang
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold flex items-center gap-2 transition flex-1 justify-center shadow-md shadow-blue-500/20"
              >
                <Check className="w-4 h-4" />
                Gunakan Foto Ini
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Upload className="w-4 h-4" />
                Upload File
              </button>

              <button
                type="button"
                disabled={!stream || isCompressing}
                onClick={takeSnapshot}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2 transition shadow-md shadow-blue-500/20"
              >
                <Camera className="w-4 h-4" />
                Ambil Foto
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
