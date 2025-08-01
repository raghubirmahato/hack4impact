
import React, { useState } from 'react';
import { generateHealthTip, generateHealthImage } from '../services/geminiService';
import LoadingSpinner from './LoadingSpinner';

const HealthTips: React.FC = () => {
  const [topic, setTopic] = useState('better sleep');
  const [isLoading, setIsLoading] = useState(false);
  const [tip, setTip] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return;
    setIsLoading(true);
    setTip('');
    setImageUrl('');

    try {
      const [generatedTip, generatedImageUrl] = await Promise.all([
        generateHealthTip(topic),
        generateHealthImage(topic)
      ]);
      setTip(generatedTip);
      setImageUrl(generatedImageUrl);
    } catch (error) {
      console.error('Error generating content:', error);
      setTip('Sorry, an error occurred while generating content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <h2 className="text-xl font-bold text-slate-800 mb-4">AI Health Tip Generator</h2>
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Enter a health topic (e.g., stress management)"
          className="flex-grow p-3 rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className="px-6 py-3 rounded-md bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
        >
          {isLoading ? <LoadingSpinner /> : 'Generate Tip'}
        </button>
      </div>

      {isLoading && (
        <div className="text-center p-8">
            <div className="animate-pulse">
                <div className="h-48 bg-slate-200 rounded-lg mb-4"></div>
                <div className="h-6 bg-slate-200 rounded w-3/4 mx-auto mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-full mx-auto mb-2"></div>
                <div className="h-4 bg-slate-200 rounded w-5/6 mx-auto"></div>
            </div>
        </div>
      )}

      {!isLoading && (tip || imageUrl) && (
        <div className="mt-6 border-t pt-6 animate-fade-in">
          {imageUrl && (
            <div className="mb-4 rounded-lg overflow-hidden shadow-md">
              <img src={imageUrl} alt={`Illustration for ${topic}`} className="w-full h-auto object-cover" />
            </div>
          )}
          {tip && (
            <div
              className="prose prose-blue max-w-none"
              dangerouslySetInnerHTML={{ __html: tip.replace(/\n/g, '<br />') }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default HealthTips;
