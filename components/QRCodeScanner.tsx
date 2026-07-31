import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { QrCode, CheckCircle, XCircle, Clock, User, Stethoscope, Calendar, MapPin } from 'lucide-react';
import { bookingService } from '../services/clientBookingService';
import { Appointment } from '../services/clientDatabaseService';

interface QRCodeScannerProps {
  onScanSuccess?: (appointment: Appointment) => void;
  onScanError?: (error: string) => void;
}

export const QRCodeScanner: React.FC<QRCodeScannerProps> = ({
  onScanSuccess,
  onScanError
}) => {
  const [qrCode, setQrCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{
    success: boolean;
    appointment?: Appointment;
    error?: string;
  } | null>(null);

  const handleScan = async () => {
    if (!qrCode.trim()) {
      setScanResult({ success: false, error: 'Please enter a QR code' });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const result = bookingService.verifyQRCode(qrCode.trim());
      
      if (result.success && result.appointment) {
        setScanResult({ success: true, appointment: result.appointment });
        onScanSuccess?.(result.appointment);
      } else {
        setScanResult({ success: false, error: result.error });
        onScanError?.(result.error || 'QR code verification failed');
      }
    } catch (error: any) {
      const errorMessage = error.message || 'An unexpected error occurred';
      setScanResult({ success: false, error: errorMessage });
      onScanError?.(errorMessage);
    } finally {
      setIsScanning(false);
    }
  };

  const handleReset = () => {
    setQrCode('');
    setScanResult(null);
  };

  return (
    <div className="max-w-md mx-auto bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-4 py-2 mb-4">
          <QrCode className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-400 font-medium">QR Code Scanner</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Verify Appointment</h3>
        <p className="text-gray-400 text-sm">Enter or scan the QR code to verify appointment details</p>
      </motion.div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            QR Code
          </label>
          <input
            type="text"
            value={qrCode}
            onChange={(e) => setQrCode(e.target.value)}
            placeholder="Enter QR code (e.g., QR1234ABCD)"
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
            disabled={isScanning}
          />
        </div>

        <div className="flex space-x-3">
          <motion.button
            onClick={handleScan}
            disabled={isScanning || !qrCode.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {isScanning ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4" />
                <span>Verify</span>
              </>
            )}
          </motion.button>

          {scanResult && (
            <motion.button
              onClick={handleReset}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-3 bg-gray-700 text-white rounded-xl font-medium transition-all duration-300"
            >
              Reset
            </motion.button>
          )}
        </div>
      </div>

      {/* Scan Result */}
      {scanResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6"
        >
          {scanResult.success && scanResult.appointment ? (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-green-400 font-medium">Appointment Verified</span>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-2 text-gray-300">
                  <User className="w-4 h-4 text-cyan-400" />
                  <span>Patient: {scanResult.appointment.patientName}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-300">
                  <Stethoscope className="w-4 h-4 text-cyan-400" />
                  <span>Doctor: {scanResult.appointment.doctorName}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-300">
                  <Calendar className="w-4 h-4 text-cyan-400" />
                  <span>Date: {new Date(scanResult.appointment.date).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-300">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Time: {scanResult.appointment.time}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-gray-300">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>Type: {scanResult.appointment.type}</span>
                </div>
                
                <div className="mt-3 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-gray-300 text-xs">
                    <strong>Status:</strong> {scanResult.appointment.status}
                  </p>
                  {scanResult.appointment.symptoms && (
                    <p className="text-gray-300 text-xs mt-1">
                      <strong>Symptoms:</strong> {scanResult.appointment.symptoms}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
              <div className="flex items-center space-x-2 mb-2">
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 font-medium">Verification Failed</span>
              </div>
              <p className="text-gray-300 text-sm">{scanResult.error}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

// QR Code Display Component for appointments
interface QRCodeDisplayProps {
  appointment: Appointment;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  appointment,
  size = 200
}) => {
  return (
    <div className="text-center">
      <div className="inline-block bg-white p-4 rounded-xl shadow-lg">
        {/* Simple QR Code representation - in a real app, you'd use a QR code library */}
        <div className="bg-black relative" style={{ width: size, height: size }}>
          <div className="absolute inset-2 bg-white flex items-center justify-center">
            <div className="text-black text-xs font-mono break-all p-2">
              {appointment.qrCode || appointment.id}
            </div>
          </div>
          
          {/* QR Code pattern simulation */}
          <div className="absolute top-2 left-2 w-8 h-8 bg-black border-2 border-white"></div>
          <div className="absolute top-2 right-2 w-8 h-8 bg-black border-2 border-white"></div>
          <div className="absolute bottom-2 left-2 w-8 h-8 bg-black border-2 border-white"></div>
        </div>
      </div>
      
      <div className="mt-4 text-center">
        <p className="text-gray-600 text-sm font-medium">Appointment QR Code</p>
        <p className="text-gray-500 text-xs mt-1">{appointment.qrCode || appointment.id}</p>
        <p className="text-gray-500 text-xs">
          {appointment.patientName} - {new Date(appointment.date).toLocaleDateString()} at {appointment.time}
        </p>
      </div>
    </div>
  );
};
