'use client';

import { useState } from 'react';
import { ArrowLeft, Zap, Copy, RotateCcw, ChevronDown, Check } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/layout';
import { FarcasterPostButton } from '@/components/FarcasterPostButton';
import { usePersonalityTemplates } from '@/hooks/usePersonalityTemplates';
import { useContentGeneration } from '@/hooks/useContentGeneration';

type Step = 'personality' | 'topic' | 'hooks' | 'preview';

export default function AIStudioPage() {
  const router = useRouter();
  const { address } = useAccount();
  const [step, setStep] = useState<Step>('personality');
  const [selectedPersonality, setSelectedPersonality] = useState('');
  const [topic, setTopic] = useState('');
  const [selectedHookIndex, setSelectedHookIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const { templates, isLoading: loadingTemplates } = usePersonalityTemplates();
  const {
    hooks,
    hooksLoading,
    hooksError,
    content,
    contentLoading,
    contentError,
    contentId,
    isLoading,
    generateHooks,
    generateContent,
  } = useContentGeneration();

  const handlePersonalitySelect = (personality: string) => {
    setSelectedPersonality(personality);
    setStep('topic');
  };

  const handleGenerateHooks = async () => {
    try {
      const personalityConfig = templates.find(t => t.name === selectedPersonality);
      if (!personalityConfig) return;
      await generateHooks(personalityConfig, topic);
      setStep('hooks');
    } catch (err) {
      console.error('Failed to generate hooks:', err);
    }
  };

  const handleHookSelect = async (index: number) => {
    try {
      setSelectedHookIndex(index);
      const personalityConfig = templates.find(t => t.name === selectedPersonality);
      if (!personalityConfig || !address) {
        console.error('Missing personality config or wallet address');
        return;
      }
      await generateContent(personalityConfig, topic, hooks[index], undefined, address);
      setStep('preview');
    } catch (err) {
      console.error('Failed to generate content:', err);
    }
  };

  const handleCopyHook = async (hook: string, index: number) => {
    await navigator.clipboard.writeText(hook);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleBack = () => {
    if (step === 'topic') setStep('personality');
    else if (step === 'hooks') setStep('topic');
    else if (step === 'preview') setStep('hooks');
    else router.push('/dashboard');
  };

  // Check wallet connection
  if (!address) {
    return (
      <div className="min-h-screen bg-[#0A0D1F]">
        <div className="max-w-[430px] mx-auto text-white pb-20">
          <header className="px-4 py-4 flex items-center justify-between bg-[#0F1328]">
            <button onClick={() => router.push('/dashboard')} className="text-white">
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="text-center">
              <h1 className="font-bold">AI Content Studio</h1>
            </div>
            <div className="w-6"></div>
          </header>
          <div className="px-4 py-8 text-center">
            <p className="text-red-400 mb-4">Please connect your wallet to use AI Content Studio</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
          <Navbar />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0D1F]">
      <div className="max-w-[430px] mx-auto text-white pb-20">
        {/* Header */}
        <header className="px-4 py-4 flex items-center justify-between bg-[#0F1328]">
          <button onClick={handleBack} className="text-white">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="text-center">
            <h1 className="font-bold">AI Content Studio</h1>
            <p className="text-xs text-blue-400">
              {step === 'personality' && 'Step 1: Choose Personality'}
              {step === 'topic' && 'Step 2: Enter Topic'}
              {step === 'hooks' && 'Step 3: Select Hook'}
              {step === 'preview' && 'Step 4: Preview & Publish'}
            </p>
          </div>
          <div className="w-6"></div>
        </header>

        {/* Step 1: Personality Selection */}
        {step === 'personality' && (
          <div className="px-4 py-6">
            <h2 className="text-lg font-bold mb-4">Choose Your Content Style</h2>
            <div className="space-y-3">
              {loadingTemplates ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </>
              ) : (
                templates.map((template) => (
                  <button
                    key={template.name}
                    onClick={() => handlePersonalitySelect(template.name)}
                    className="w-full bg-[#1A1F3A] border border-blue-700/30 hover:border-blue-500 rounded-xl p-4 text-left transition-all"
                  >
                    <h3 className="font-semibold mb-1">{template.name}</h3>
                    <p className="text-xs text-gray-400">
                      {Array.isArray(template.bio) ? template.bio[0] : template.bio}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 2: Topic Input */}
        {step === 'topic' && (
          <div className="px-4 py-6">
            <h2 className="text-lg font-bold mb-4">What's Your Topic?</h2>
            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-3 uppercase tracking-wider">
                Selected Personality
              </label>
              <div className="bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-4 text-sm">
                {selectedPersonality}
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs text-gray-400 mb-3 uppercase tracking-wider">
                Topic or Keywords
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Base network, blockchain gaming, DeFi trends..."
                className="w-full bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                rows={4}
              />
            </div>
            <button
              onClick={handleGenerateHooks}
              disabled={hooksLoading || !topic.trim()}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Zap className="w-5 h-5" />
              {hooksLoading ? 'Generating...' : 'Generate Hooks'}
              <span className="ml-2 text-xs">- 1 Credit</span>
            </button>
            {(hooksError || contentError) && (
              <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-400">
                {hooksError || contentError}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Hook Selection */}
        {step === 'hooks' && (
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Choose Your Hook</h2>
              <button
                onClick={handleGenerateHooks}
                disabled={hooksLoading}
                className="text-blue-400 text-sm flex items-center gap-1 hover:text-blue-300"
              >
                <RotateCcw className={`w-4 h-4 ${hooksLoading ? 'animate-spin' : ''}`} />
                Regenerate
              </button>
            </div>

            <div className="space-y-3">
              {hooksLoading ? (
                <>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-4 animate-pulse">
                      <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  ))}
                </>
              ) : (
                hooks.map((hook, index) => (
                  <div
                    key={index}
                    className="bg-[#1A1F3A] border border-blue-700/30 hover:border-blue-500 rounded-xl p-4 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <p className="text-sm text-gray-300 leading-relaxed flex-1">{hook}</p>
                      <button
                        onClick={() => handleCopyHook(hook, index)}
                        className="p-2 rounded-lg bg-blue-600/20 hover:bg-blue-600 transition-all"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-blue-400" />
                        )}
                      </button>
                    </div>
                    <button
                      onClick={() => handleHookSelect(index)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
                    >
                      Generate Full Content
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Step 4: Preview & Publish */}
        {step === 'preview' && content && (
          <div className="px-4 py-6">
            <h2 className="font-bold text-lg mb-4">Your Content is Ready!</h2>

            {/* Content Preview */}
            <div className="bg-[#1A1F3A] border border-blue-700/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{content}</p>
              <div className="mt-3 pt-3 border-t border-blue-700/30 flex items-center justify-between">
                <span className="text-xs text-gray-400">{content.length} characters</span>
                <button
                  onClick={() => handleCopyHook(content, -1)}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  {copiedIndex === -1 ? (
                    <>
                      <Check className="w-3 h-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Farcaster Post Button */}
            <FarcasterPostButton
              content={content}
              contentId={contentId || undefined}
              onSuccess={(hash) => {
                console.log('Posted successfully:', hash);
                // Could redirect or show success message
              }}
              onError={(error) => {
                console.error('Post failed:', error);
              }}
            />

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setStep('hooks')}
                className="flex-1 bg-[#1A1F3A] border border-blue-700/30 text-white font-semibold py-3 rounded-lg hover:border-blue-500 transition-colors"
              >
                Try Another Hook
              </button>
              <button
                onClick={() => router.push('/dashboard')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        )}

        <Navbar hidden={step === 'hooks' || step === 'preview'} />
      </div>
    </div>
  );
}
