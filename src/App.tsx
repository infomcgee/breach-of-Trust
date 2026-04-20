/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality } from "@google/genai";
import { Play, Square, Volume2, Loader2, Quote as QuoteIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState, useRef, useEffect } from "react";

const PROLOGUE_TEXT = `The Wind and the Sun To understand how it all ended—the glare of the Mediterranean sun, the offshore accounts, and the intoxicating high life of Gibraltar—you first have to understand the damp, biting cold where it began. You have to go back to Knowsley.

By the winter of 2011, the chill in Britain wasn’t just coming from the weather. It was a bitter, unnatural wind blowing through empty food cupboards across the nation.

Behind the heavy oak doors of Westminster, the newly formed Coalition government spoke in crisp, sterile terms of "efficiency" and "tough choices." They were engaged in a grand rebranding exercise, packaging the systemic gutting of the welfare state as a noble call to arms for what they dubbed the "Big Society." As the government watched the very first queues form outside church halls and community centers, they heralded it as a success of the British spirit. It was a remarkably convenient way to frame the abandonment of the vulnerable as a triumph of community volunteerism.

But for the mothers and fathers quietly skipping breakfast just so their children could have a bowl of generic supermarket cereal before school, there was no "spirit" in it. There was only the hollow, gnawing ache of shame. The "Big Society" wasn't a philosophical choice; it was a desperate survival tactic for a people whose safety net had been violently pulled out from under them while they were still falling.

To the average person on the street, the sudden, ubiquitous appearance of food banks felt like the lights going out on the modern era. People who had worked their entire lives, who had paid their taxes and played by the rules, suddenly found themselves standing in drafty hallways. They clutched food bank vouchers in their pockets like confessions of failure, stepping forward to trade their dignity for a bag of dry pasta and a tin of chopped tomatoes. It was a country rapidly learning how to survive the cold, entirely alone, while politicians checked their watches and waited for the books to balance.

In Knowsley—the most deprived borough in the country—the cold reality of 2011 was met with the warmth of a single garage door rolling open.

When Dr. Barry Cooper began handing out food parcels, it wasn't a calculated gesture of politics. It was a desperate act of love for a community in acute pain. His story quickly echoed across Britain because it stripped away the political spin of the "Big Society" and exposed the raw, undeniable necessity of simply feeding your neighbors. As the government looked on with a detached nod of approval, ordinary people saw their own families, their neighbors, and their church friends going hungry. They realized that if they didn't stand in the gap like Dr. Cooper, absolutely no one else would.

It was a quiet protest of the heart, born from the simple, heartbreaking truth that people were being left behind by their own government.

And so, from a single open garage door, the Big Help Project was born. It was a charity anchored in Knowsley, built on the profound belief that poverty was a man-made disease that could be cured by human hands.

It was a noble, beautiful beginning. Which only makes the betrayal that followed all the more devastating.`;

const FULL_TEXT_FOR_TTS = `BREACH OF TRUST. From feeding the poor in the UK’s most deprived area to the high life in sunny Gibraltar. Nelson Mandela once said: Like slavery and apartheid, poverty is not natural. It is man-made and it can be overcome and eradicated by the actions of human beings. PROLOGUE. ${PROLOGUE_TEXT}`;

export default function App() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAudio = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  };

  const playAudio = async () => {
    if (isPlaying) {
      stopAudio();
      return;
    }

    try {
      setIsLoading(true);
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Read this story with a serious, informative, yet empathetic tone: ${FULL_TEXT_FOR_TTS}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!base64Audio) {
        throw new Error("No audio data received");
      }

      const binaryString = atob(base64Audio);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Gemini TTS returns 16-bit PCM at 24kHz
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) {
        float32[i] = pcm16[i] / 32768.0;
      }

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext({ sampleRate: 24000 });
      }

      const buffer = audioContextRef.current.createBuffer(1, float32.length, 24000);
      buffer.getChannelData(0).set(float32);

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlaying(false);
      
      audioSourceRef.current = source;
      source.start();
      setIsPlaying(true);
    } catch (error) {
      console.error("Speech generation error:", error);
      alert("Something went wrong with the speech generation. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="atmosphere" />
      
      <main className="max-w-4xl mx-auto px-6 py-24 md:py-32">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-24 text-center md:text-left"
        >
          <div className="mb-4">
            <span className="text-accent font-mono text-sm tracking-[0.2em] uppercase">Investigative Chronicles</span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl mb-6 leading-[0.85] uppercase -ml-1 md:-ml-2">
            Breach <br /> <span className="text-accent">of</span> Trust
          </h1>
          <p className="font-serif italic font-semibold text-2xl md:text-3xl text-white max-w-2xl leading-tight">
            From feeding the poor in the UK’s most deprived area to the high life in sunny Gibraltar.
          </p>
        </motion.section>

        {/* Quote Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          viewport={{ once: true, margin: "-100px" }}
          className="mb-32 relative"
        >
          <QuoteIcon className="absolute -top-12 -left-12 w-24 h-24 text-white/5" />
          <div className="glass p-12 md:p-16 rounded-3xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 blur-3xl rounded-full" />
             <blockquote className="font-serif font-bold text-3xl md:text-4xl text-white leading-snug mb-8 relative z-10">
               "Like slavery and apartheid, poverty is not natural. It is man-made and it can be overcome and eradicated by the actions of human beings."
             </blockquote>
             <cite className="font-mono text-accent text-sm uppercase tracking-widest block not-italic">
               — Nelson Mandela, London's Trafalgar Square, 2005
             </cite>
          </div>
        </motion.section>

        {/* Prologue Content */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          className="prose prose-invert max-w-none mb-32"
        >
          <div className="flex items-baseline gap-4 mb-16">
            <h2 className="text-4xl md:text-5xl uppercase mb-0">Prologue</h2>
            <div className="h-[1px] flex-grow bg-white/10" />
          </div>

          <div className="font-serif font-semibold text-xl md:text-2xl text-white space-y-12 leading-relaxed tracking-wide selection:bg-accent/30">
            {PROLOGUE_TEXT.split('\n\n').map((para, i) => (
              <p key={i} className="first-letter:text-5xl first-letter:font-display first-letter:mr-3 first-letter:float-left first-letter:leading-none first-letter:text-accent">
                {para}
              </p>
            ))}
          </div>
        </motion.section>

        <footer className="pt-16 border-t border-white/10 text-white/30 font-mono text-xs uppercase tracking-widest flex justify-between items-center mb-24">
          <span>© 2026 Investigative Media</span>
          <span>A Deep Dive into the Big Help Project</span>
        </footer>
      </main>

      {/* Floating Audio UI */}
      <AnimatePresence>
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-xs px-4"
        >
          <div className="glass rounded-full p-2 flex items-center shadow-2xl shadow-black/50 overflow-hidden ring-1 ring-white/20">
             <button 
               onClick={playAudio}
               disabled={isLoading}
               className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 relative overflow-hidden group ${
                 isPlaying ? 'bg-white text-black' : 'bg-accent text-white'
               } hover:scale-105 disabled:opacity-50`}
             >
               {isLoading ? (
                 <Loader2 className="w-6 h-6 animate-spin" />
               ) : isPlaying ? (
                 <Square className="w-6 h-6 fill-current" />
               ) : (
                 <Play className="w-6 h-6 fill-current translate-x-0.5" />
               )}
               
               {/* Pulse effect when playing */}
               {isPlaying && (
                 <motion.div 
                   animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                   transition={{ duration: 2, repeat: Infinity }}
                   className="absolute inset-0 bg-black/10 rounded-full"
                 />
               )}
             </button>
             
             <div className="flex-grow px-4 overflow-hidden">
               <div className="text-[10px] font-mono text-white/40 uppercase tracking-tighter mb-0.5 truncate">
                 {isLoading ? 'Synthesizing voice...' : isPlaying ? 'Now Narrating' : 'Listen to Prologue'}
               </div>
               <div className="text-sm font-semibold text-white truncate">
                 {isPlaying ? 'BREACH OF TRUST' : 'Narrated Journey'}
               </div>
             </div>

             <div className="pr-4">
                <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-accent animate-pulse' : 'text-white/20'}`} />
             </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

